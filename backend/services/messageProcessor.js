const DOMPurify = require('isomorphic-dompurify');
const { MessageEvents } = require('../websocket');

// Dynamic import for marked (ES module)
let marked = null;

async function initializeMarked() {
  if (!marked) {
    const markedModule = await import('marked');
    marked = markedModule.marked;
  }
  return marked;
}

async function processMessageContent(content, role = 'assistant') {
  try {
    const hasMarkdownIndicators = /(?:\*\*|__|\*|_|`|#{1,6}\s|>\s|\[.*\]\(.*\)|\n\s*[-*+]\s|\n\s*\d+\.\s)/.test(content);
    
    let processedContent = {
      original: content,
      formatted: content,
      contentType: 'text',
      processedAt: new Date()
    };
    
    if (role === 'assistant' || hasMarkdownIndicators) {
      try {
        const markedInstance = await initializeMarked();
        
        markedInstance.setOptions({
          gfm: true,
          breaks: true,
          pedantic: false,
          sanitize: false,
          smartLists: true,
          smartypants: true
        });

        // Convert citations to clickable buttons BEFORE markdown processing
        const createCitationButton = (pageNumber) =>
          `<button type="button" class="citation-button" data-page="${pageNumber}" style="background: none; border: none; color: inherit; text-decoration: none; cursor: pointer; padding: 0; font: inherit;">Page ${pageNumber}</button>`;
        // 1) Handle groups like: [Page 40, Page 6] or [Page 13 and Page 65]
        let contentWithButtons = content.replace(/\[((?:[^\]]*Page\s+\d+[^\]]*){2,})\]/g, (match, inner) => {
          const pages = Array.from(inner.matchAll(/Page\s+(\d+)/g)).map(m => m[1]);
          if (!pages || pages.length === 0) return match;
          const buttons = pages
            .map(pageNumber => {
              console.log(`🔗 [MessageProcessor] Converting citation in group: Page ${pageNumber}`);
              return createCitationButton(pageNumber);
            })
            .join(' ');
          return buttons;
        });

        // 2) Handle single citations like: [Page 40]
        contentWithButtons = contentWithButtons.replace(/\[Page (\d+)\]/g, (match, pageNumber) => {
          console.log(`🔗 [MessageProcessor] Converting citation: ${match} -> button for page ${pageNumber}`);
          return createCitationButton(pageNumber);
        });

        // 3) Deduplicate consecutive identical citation buttons (e.g., when the same page is cited twice back-to-back)
        const duplicateButtonsRegex = /(<button[^>]*class=\"citation-button\"[^>]*data-page=\"(\d+)\"[^>]*>[^<]*<\/button>)(?:\s*,?\s*\1)+/g;
        contentWithButtons = contentWithButtons.replace(duplicateButtonsRegex, '$1');

        const htmlContent = markedInstance(contentWithButtons);
        
        const sanitizedContent = DOMPurify.sanitize(htmlContent, {
          ALLOWED_TAGS: [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'br', 'strong', 'b', 'em', 'i', 'u',
            'ul', 'ol', 'li',
            'blockquote',
            'code', 'pre',
            'a',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'div', 'span',
            'hr',
            'button'
          ],
          ALLOWED_ATTR: [
            'href', 'target', 'rel', 'title',
            'class', 'id', 'start',
            'data-page', 'type', 'style'
          ],
        });
        
        console.log(`🔗 [MessageProcessor] Processed content with ${(sanitizedContent.match(/citation-button/g) || []).length} citation buttons`);
        
        processedContent = {
          original: content,
          formatted: sanitizedContent,
          contentType: 'html',
          processedAt: new Date()
        };
        
      } catch (markdownError) {
        console.error('Error processing markdown:', markdownError);
        processedContent.contentType = 'text';
      }
    }
    
    return processedContent;
    
  } catch (error) {
    console.error('Error in processMessageContent:', error);
    return {
      original: content,
      formatted: content,
      contentType: 'text',
      processedAt: new Date()
    };
  }
}

async function processSummaryContent(summaryData) {
  try {
    const processed = { ...summaryData };
    
    const fieldsToProcess = ['summary', 'commonQuestions'];
    
    for (const field of fieldsToProcess) {
      if (processed[field]) {
        const processedField = await processMessageContent(processed[field], 'assistant');
        processed[`${field}Formatted`] = processedField.formatted;
        processed[`${field}ContentType`] = processedField.contentType;
      }
    }
    
    processed.summaryProcessedAt = new Date();
    return processed;
    
  } catch (error) {
    console.error('Error processing summary content:', error);
    return summaryData;
  }
}

function cleanTextContent(text) {
  if (!text) return text;
  
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
}

const { getEmbedding } = require('./embedding');
const { queryEmbedding } = require('./pinecone');
const { askGpt } = require('./gpt');
const prisma = require('../prismaClient');

// Estimate token count (rough approximation: 1 token ≈ 4 characters)
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

// Get conversation history for context with smart optimization
async function getConversationHistory(conversationId, currentMessageId, maxMessages = 10, maxTokens = 4000) {
  try {
    // Get recent completed messages from the same conversation, excluding the current message
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId,
        status: 'completed',
        id: { not: currentMessageId },
        role: { in: ['user', 'assistant'] }
      },
      orderBy: { createdAt: 'desc' },
      take: maxMessages * 2, // Get more to allow for smart selection
      select: {
        id: true,
        role: true,
        text: true,
        formattedText: true,
        createdAt: true,
        parentMessageId: true
      }
    });

    // Reverse to get chronological order (oldest first)
    const chronologicalMessages = messages.reverse();
    
    // Smart token management: include messages until we hit token limit
    const optimizedHistory = [];
    let totalTokens = 0;
    
    // Always include the most recent exchange (user question + assistant answer)
    for (let i = chronologicalMessages.length - 1; i >= 0; i -= 2) {
      const assistantMsg = chronologicalMessages[i];
      const userMsg = chronologicalMessages[i - 1];
      
      if (!assistantMsg || !userMsg) break;
      
      const exchangeTokens = estimateTokens(userMsg.text) + estimateTokens(assistantMsg.text);
      
      if (totalTokens + exchangeTokens > maxTokens && optimizedHistory.length >= 2) {
        break; // Stop adding if we'd exceed token limit and already have some context
      }
      
      // Add the exchange (user first, then assistant)
      optimizedHistory.unshift(assistantMsg);
      optimizedHistory.unshift(userMsg);
      totalTokens += exchangeTokens;
      
      if (optimizedHistory.length >= maxMessages) break;
    }
    
    console.log(`📚 [ConversationHistory] Retrieved ${optimizedHistory.length} previous messages (${totalTokens} estimated tokens) for context`);
    
    return optimizedHistory;
  } catch (error) {
    console.error('❌ [ConversationHistory] Error retrieving conversation history:', error);
    return [];
  }
}

async function processAndRespondToMessage(message) {
  await prisma.message.update({
    where: { id: message.id },
    data: { status: 'processing' }
  });

  // Emit WebSocket event: processing started
  MessageEvents.MESSAGE_PROCESSING_STARTED(message.conversationId, message.id);

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: message.conversationId }
    });
    
    if (!conversation || conversation.processingStatus !== 'completed') {
      throw new Error('Conversation not ready for processing');
    }

    console.log(`🔍 [MessageProcessor] Processing question: "${message.text}"`);

    // Get conversation history for context
    const conversationHistory = await getConversationHistory(message.conversationId, message.id, 8);

    const questionEmbedding = await getEmbedding(message.text);
    
    // Get extended matches for better ToC filtering
    const extendedMatches = await queryEmbedding(questionEmbedding, 15, message.conversationId);
    console.log(`🔍 [MessageProcessor] Found ${extendedMatches.length} vector matches`);
    
    const references = extendedMatches
      .filter(match => {
        const hasText = match.metadata?.text && match.metadata.text.trim().length > 0;
        const hasPageNumber = match.metadata?.pageNumber && match.metadata.pageNumber > 0;
        
        if (!hasText || !hasPageNumber) {
          console.warn(`🚫 [MessageProcessor] Filtered out match: hasText=${hasText}, hasPageNumber=${hasPageNumber}`);
          return false;
        }
        
        return true;
      })
      // AGGRESSIVE ToC FILTERING: Completely exclude ToC pages if we have enough content pages
      .filter((match, index, allMatches) => {
        const pageType = match.metadata?.pageType || 'unknown';
        const tocConfidence = match.metadata?.tocConfidence || 0;
        const text = match.metadata?.text || '';
        
        // Enhanced ToC detection - check for patterns that indicate ToC content
        const tocPatterns = [
          /table\s+of\s+contents/i,
          /\.{3,}/,  // dotted lines
          /chapter\s+\d+.*\d+$/im,  // "Chapter 1 ... 15"
          /section\s+\d+.*\d+$/im,  // "Section 1 ... 25"
        ];
        
        const hasMultipleTopics = (text.match(/\b(chapter|section|part|unit)\b/gi) || []).length >= 3;
        const hasTocPatterns = tocPatterns.some(pattern => pattern.test(text));
        const isEarlyPage = (match.metadata?.pageNumber || 999) <= 5;
        
        const isToC = pageType === 'toc' || 
                     tocConfidence > 0.6 || 
                     (hasTocPatterns && isEarlyPage) ||
                     (hasMultipleTopics && isEarlyPage && text.length < 800);
        
        if (isToC) {
          // Count how many content pages we have
          const contentPages = allMatches.filter(m => {
            const mPageType = m.metadata?.pageType || 'unknown';
            const mTocConfidence = m.metadata?.tocConfidence || 0;
            const mText = m.metadata?.text || '';
            const mHasMultipleTopics = (mText.match(/\b(chapter|section|part|unit)\b/gi) || []).length >= 3;
            const mIsEarlyPage = (m.metadata?.pageNumber || 999) <= 5;
            
            return mPageType === 'content' && 
                   mTocConfidence <= 0.6 && 
                   !(mHasMultipleTopics && mIsEarlyPage && mText.length < 800);
          });
          
          // If we have at least 2 content pages, completely exclude ToC
          if (contentPages.length >= 2) {
            console.log(`🚫 [MessageProcessor] EXCLUDING ToC page ${match.metadata.pageNumber} (confidence: ${tocConfidence?.toFixed(2)}, patterns: ${hasTocPatterns}, topics: ${hasMultipleTopics}) - have ${contentPages.length} content pages`);
            return false;
          }
        }
        
        return true;
      })
      // Sort to prefer content pages over ToC pages
      .sort((a, b) => {
        const aIsToC = a.metadata?.pageType === 'toc' || (a.metadata?.tocConfidence || 0) > 0.6;
        const bIsToC = b.metadata?.pageType === 'toc' || (b.metadata?.tocConfidence || 0) > 0.6;
        
        // If one is ToC and other is content, prefer content
        if (aIsToC && !bIsToC) return 1;
        if (!aIsToC && bIsToC) return -1;
        
        // If both are same type, sort by score (higher is better)
        return b.score - a.score;
      })
      .map(match => {
        const pageType = match.metadata?.pageType || 'unknown';
        const tocConfidence = match.metadata?.tocConfidence || 0;
        const isToC = pageType === 'toc' || tocConfidence > 0.6;
        console.log(`🔍 [MessageProcessor] Retrieved match: Page ${match.metadata.pageNumber} (${pageType}${isToC ? ' - ToC' : ''}), Score: ${match.score?.toFixed(4)}, ToC: ${tocConfidence?.toFixed(2)}, Text: "${match.metadata.text.substring(0, 100)}..."`);
        return {
          text: match.metadata.text,
          pageNumber: match.metadata.pageNumber,
          pageType: pageType,
          tocConfidence: tocConfidence
        };
      })
      .slice(0, 5);

    console.log(`🔍 [MessageProcessor] Using ${references.length} references from pages:`, references.map(r => r.pageNumber));

    let answer, processedAnswer;
    
    if (references.length === 0) {
      console.warn(`⚠️ [MessageProcessor] No valid references found`);
      answer = "I couldn't find any relevant information in the document to answer your question.";
      processedAnswer = await processMessageContent(answer, 'assistant');
    } else {
      const contextWithReferences = {
        text: references.map(ref => `Page ${ref.pageNumber}: ${ref.text}`).join('\n\n'),
        references: references,
        conversationHistory: conversationHistory
      };
      
      console.log(`📤 [MessageProcessor] Sending to GPT with ${references.length} references and ${conversationHistory.length} previous messages`);
      
      // Emit WebSocket event: AI is thinking
      MessageEvents.AI_THINKING(message.conversationId, message.id);
      
      answer = await askGpt(message.text, contextWithReferences);
      
      // Validate that we got citations
      const citationCount = (answer.match(/\[Page \d+\]/g) || []).length;
      console.log(`📥 [MessageProcessor] Received answer with ${citationCount} citations`);
      
      processedAnswer = await processMessageContent(answer, 'assistant');
    }

    const assistantMessage = await prisma.message.create({
      data: {
        conversationId: message.conversationId,
        role: 'assistant',
        text: answer,
        formattedText: processedAnswer.formatted,
        contentType: processedAnswer.contentType,
        status: 'completed',
        processedAt: processedAnswer.processedAt,
        parentMessageId: message.id
      }
    });

    await prisma.message.update({
      where: { id: message.id },
      data: { status: 'completed', error: null }
    });

    // Emit WebSocket event: AI response complete
    MessageEvents.AI_RESPONSE_COMPLETE(message.conversationId, message.id, assistantMessage);

    console.log(`✅ [MessageProcessor] Successfully processed message ${message.id}`);
    return assistantMessage;
    
  } catch (error) {
    console.error(`❌ [MessageProcessor] Error processing message ${message.id}:`, error);
    
    await prisma.message.update({
      where: { id: message.id },
      data: { status: 'error', error: error.message }
    });
    
    // Emit WebSocket event: error occurred
    MessageEvents.MESSAGE_ERROR(message.conversationId, message.id, error);
    
    return null;
  }
}

module.exports = { 
  processAndRespondToMessage, 
  processMessageContent, 
  processSummaryContent,
  cleanTextContent, 
};