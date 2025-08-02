const DOMPurify = require('isomorphic-dompurify');

// Dynamic import for marked (ES module)
let marked = null;

/**
 * Initialize marked library
 */
async function initializeMarked() {
  if (!marked) {
    const markedModule = await import('marked');
    marked = markedModule.marked;
  }
  return marked;
}



/**
 * Process and format message content
 * @param {string} content - Raw message content
 * @param {string} role - Message role ('user' or 'assistant')
 * @returns {Object} - Processed message data
 */
async function processMessageContent(content, role = 'assistant') {
  try {
    // Detect if content is likely markdown
    const hasMarkdownIndicators = /(?:\*\*|__|\*|_|`|#{1,6}\s|>\s|\[.*\]\(.*\)|\n\s*[-*+]\s|\n\s*\d+\.\s)/.test(content);
    
    let processedContent = {
      original: content,
      formatted: content,
      contentType: 'text',
      processedAt: new Date()
    };
    
    // Only process assistant messages or content that looks like markdown
    if (role === 'assistant' || hasMarkdownIndicators) {
      try {
        // Initialize marked library
        const markedInstance = await initializeMarked();
        
        // Use marked with basic configuration
        markedInstance.setOptions({
          gfm: true,
          breaks: true,
          pedantic: false,
          sanitize: false, // We'll use DOMPurify instead
          smartLists: true,
          smartypants: true
        });
        
        // Protect the References section from being processed by marked
        let referencesSection = '';
        let mainContent = content;

        const referencesMatch = content.match(/(\n\n##?\s*References\s*[\s\S]*)/i);
        if (referencesMatch) {
          referencesSection = referencesMatch[0];
          mainContent = content.substring(0, referencesMatch.index);
          console.log('✅ [MessageProcessor] Protected References section from markdown processing.');
        }
        
        // Convert markdown to HTML
        const htmlContent = markedInstance(mainContent);
        
        // Sanitize HTML to prevent XSS
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
            'hr'
          ],
          ALLOWED_ATTR: [
            'href', 'target', 'rel', 'title',
            'class', 'id',
            'start'
          ],
          ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
        });

        // Append the original, unprocessed References section back to the sanitized content
        const finalContent = sanitizedContent + referencesSection;
        
        processedContent = {
          original: content,
          formatted: finalContent, // Use the content with the restored section
          contentType: 'html',
          processedAt: new Date()
        };
        
        console.log('Message processed successfully:', {
          role,
          originalLength: content.length,
          formattedLength: sanitizedContent.length,
          hasMarkdown: hasMarkdownIndicators
        });
        
      } catch (markdownError) {
        console.error('Error processing markdown:', markdownError);
        // Fallback to original content if markdown processing fails
        processedContent.contentType = 'text';
      }
    }
    
    return processedContent;
    
  } catch (error) {
    console.error('Error in processMessageContent:', error);
    // Return original content if processing fails
    return {
      original: content,
      formatted: content,
      contentType: 'text',
      processedAt: new Date()
    };
  }
}

/**
 * Process summary content for better formatting
 * @param {Object} summaryData - Raw summary data
 * @returns {Object} - Processed summary data
 */
async function processSummaryContent(summaryData) {
  try {
    const processed = { ...summaryData };
    
    // Process each field that might contain markdown
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

/**
 * Clean and optimize text content
 * @param {string} text - Raw text content
 * @returns {string} - Cleaned text
 */
function cleanTextContent(text) {
  if (!text) return text;
  
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove multiple consecutive line breaks
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // Trim whitespace
    .trim();
}

const { getEmbedding } = require('./embedding');
const { queryEmbedding } = require('./pinecone');
const { askGpt } = require('./gpt');
const prisma = require('../prismaClient');

/**
 * Process a user message and generate an assistant response
 * @param {Object} message - Prisma message object (user message)
 * @returns {Object|null} - The created assistant message, or null if error
 */
async function processAndRespondToMessage(message) {
  // Mark message as processing
  await prisma.message.update({
    where: { id: message.id },
    data: { status: 'processing' }
  });

  try {
    // Get conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: message.conversationId }
    });
    if (!conversation || conversation.processingStatus !== 'completed') {
      throw new Error('Conversation not ready for processing');
    }

    // Get embedding for the question
    const questionEmbedding = await getEmbedding(message.text);
    console.log(`🔍 [MessageProcessor] Generated embedding for question: "${message.text.substring(0, 100)}..."`);
    
    const matches = await queryEmbedding(questionEmbedding, 5, message.conversationId); // Increased to 5 for better context
    console.log(`🔍 [MessageProcessor] Vector search returned ${matches.length} matches`);
    
    if (matches.length === 0) {
      console.error(`❌ [MessageProcessor] CRITICAL: No vector matches found for question!`);
      console.error(`❌ [MessageProcessor] This means no references will be available to GPT`);
      console.error(`❌ [MessageProcessor] Question: "${message.text}"`);
      console.error(`❌ [MessageProcessor] Conversation ID: ${message.conversationId}`);
    } else {
      console.log(`📊 [MessageProcessor] Match scores:`, matches.map((m, i) => `${i+1}: ${(m.score || 0).toFixed(3)}`));
    }

    // Enhanced reference extraction with validation and confidence-based filtering
    const references = matches
      .filter(match => {
        // Basic validation
        if (!match.metadata?.text || !match.metadata?.pageNumber) {
          console.log(`🚫 [MessageProcessor] Filtered out match: missing text or pageNumber`);
          return false;
        }
        
        // Filter by confidence if available
        const confidence = match.metadata?.confidence || match.score || 0;
        if (confidence < 0.2) { // Temporarily lowered from 0.4 to 0.2 for debugging
          console.log(`🚫 [MessageProcessor] Filtered out low confidence reference: ${confidence.toFixed(3)}`);
          return false;
        }
        
        console.log(`✅ [MessageProcessor] Accepted reference: page ${match.metadata.pageNumber}, confidence ${confidence.toFixed(3)}`);
        return true;
      })
      .map((match, index) => ({
        text: match.metadata.text,
        pageNumber: match.metadata.pageNumber,
        pagePosition: match.metadata.pagePosition || 0,
        score: match.score || 0,
        confidence: match.metadata?.confidence || match.score || 0,
        positionType: match.metadata?.positionType || 'unknown',
        contextBefore: match.metadata?.contextBefore || '',
        contextAfter: match.metadata?.contextAfter || '',
        chunkIndex: match.metadata?.chunkIndex || index,
        // Calculate reference quality score combining similarity and confidence
        qualityScore: (match.score || 0) * (match.metadata?.confidence || match.score || 0.5)
      }))
      .sort((a, b) => {
        // Primary sort: by quality score (descending)
        if (Math.abs(a.qualityScore - b.qualityScore) > 0.01) {
          return b.qualityScore - a.qualityScore;
        }
        // Secondary sort: by page number (ascending) for better organization
        return a.pageNumber - b.pageNumber;
      })
      .slice(0, 5); // Limit to top 5 references for clarity

    // Extract context text from the filtered matches
    const contextText = matches
      .filter(match => match.metadata?.text && match.metadata?.text.trim().length > 0)
      .map(match => match.metadata.text)
      .join('\n\n');

    console.log(`📍 [MessageProcessor] After filtering: ${references.length} references from ${matches.length} matches`);
    
    if (references.length === 0) {
      console.error(`❌ [MessageProcessor] CRITICAL: All references were filtered out!`);
      console.error(`❌ [MessageProcessor] This means GPT will receive no reference information`);
      console.error(`❌ [MessageProcessor] Original matches: ${matches.length}`);
      console.error(`❌ [MessageProcessor] Check confidence thresholds and metadata quality`);
    }

    console.log(`📍 [MessageProcessor] Found ${references.length} references from ${matches.length} matches`);
    console.log('📍 [MessageProcessor] Reference details:', references.map(ref => ({
      pageNumber: ref.pageNumber,
      pagePosition: ref.pagePosition,
      confidence: ref.confidence.toFixed(3),
      qualityScore: ref.qualityScore.toFixed(3),
      positionType: ref.positionType,
      textPreview: ref.text.substring(0, 100) + '...',
      score: ref.score.toFixed(3)
    })));

    // Diagnostic: Check for suspicious page number patterns
    const pageNumbers = references.map(ref => ref.pageNumber);
    const uniquePages = [...new Set(pageNumbers)];
    const hasSequentialPages = pageNumbers.length > 1 && pageNumbers.every((page, i) => i === 0 || page <= pageNumbers[i-1] + 1);
    
    if (references.length > 2 && uniquePages.length === 1 && uniquePages[0] === 1) {
      console.warn(`⚠️  [MessageProcessor] SUSPICIOUS: All ${references.length} references point to page 1`);
      console.warn(`⚠️  [MessageProcessor] This may indicate page mapping problems during PDF processing`);
    }
    
    if (hasSequentialPages && pageNumbers[0] === 1) {
      console.warn(`⚠️  [MessageProcessor] SUSPICIOUS: References have sequential page numbers starting from 1: [${pageNumbers.join(', ')}]`);
      console.warn(`⚠️  [MessageProcessor] This may indicate fallback page numbering instead of actual content location`);
    }

    // Validate references before sending to GPT
    const validatedReferences = await validateReferences(references, message.conversationId);
    console.log(`📍 [MessageProcessor] Validated ${validatedReferences.length} references (filtered ${references.length - validatedReferences.length} invalid ones)`);

    let answer, processedAnswer, assistantMessage;
    if (!contextText) {
      console.error(`❌ [MessageProcessor] No context text available - cannot provide references`);
      answer = "I couldn't find any relevant information in the document to answer your question. Please try asking about something else or rephrase your question.";
      processedAnswer = await processMessageContent(answer, 'assistant');
    } else {
      // Send context with validated references to GPT
      const contextWithReferences = {
        text: contextText,
        references: validatedReferences
      };
      
      console.log(`📤 [MessageProcessor] Sending to GPT:`);
      console.log(`📤 [MessageProcessor] - Context length: ${contextText.length} characters`);
      console.log(`📤 [MessageProcessor] - References count: ${validatedReferences.length}`);
      console.log(`📤 [MessageProcessor] - Reference pages: [${validatedReferences.map(r => r.pageNumber).join(', ')}]`);
      
      answer = await askGpt(message.text, contextWithReferences);
      
      console.log(`📥 [MessageProcessor] GPT response received:`);
      console.log(`📥 [MessageProcessor] - Response length: ${answer.length} characters`);
      console.log(`📥 [MessageProcessor] - Contains citations: ${/\[(?:\^(?:ref-)?)?\d+\]/.test(answer)}`);
      console.log(`📥 [MessageProcessor] - Contains References section: ${/##?\s*References?\s*/i.test(answer)}`);
      
      if (validatedReferences.length > 0 && !/\[(?:\^(?:ref-)?)?\d+\]/.test(answer)) {
        console.warn(`⚠️  [MessageProcessor] WARNING: References were provided to GPT but no citations appear in response!`);
        console.warn(`⚠️  [MessageProcessor] This means GPT chose not to use the provided references`);
      }
      
      processedAnswer = await processMessageContent(answer, 'assistant');
    }

    assistantMessage = await prisma.message.create({
      data: {
        conversationId: message.conversationId,
        role: 'assistant',
        text: answer,
        formattedText: processedAnswer.formatted,
        contentType: processedAnswer.contentType,
        status: 'completed',
        processedAt: processedAnswer.processedAt,
        parentMessageId: message.id // Optionally link to user message
      }
    });

    // Mark user message as completed
    await prisma.message.update({
      where: { id: message.id },
      data: { status: 'completed', error: null }
    });

    return assistantMessage;
  } catch (error) {
    console.error('Error processing message:', error);
    // Mark user message as error
    await prisma.message.update({
      where: { id: message.id },
      data: { status: 'error', error: error.message }
    });
    return null;
  }
}

/**
 * Validate references to ensure they point to accurate locations
 * @param {Array} references - Array of reference objects
 * @param {string} conversationId - Conversation ID for additional context
 * @returns {Array} - Filtered array of validated references
 */
async function validateReferences(references, conversationId) {
  if (!references || references.length === 0) {
    return [];
  }

  const validatedReferences = [];
  
  for (const ref of references) {
    try {
      // Basic validation checks
      const validationResult = validateSingleReference(ref);
      
      if (validationResult.isValid) {
        validatedReferences.push({
          ...ref,
          validationScore: validationResult.score,
          validationNotes: validationResult.notes
        });
      } else {
        console.warn(`⚠️  [ReferenceValidation] Reference failed validation:`, {
          pageNumber: ref.pageNumber,
          positionType: ref.positionType,
          confidence: ref.confidence,
          reason: validationResult.reason
        });
      }
    } catch (error) {
      console.error('❌ [ReferenceValidation] Error validating reference:', error);
      // In case of error, include the reference but mark it with low validation score
      validatedReferences.push({
        ...ref,
        validationScore: 0.3,
        validationNotes: 'Validation error occurred'
      });
    }
  }

  return validatedReferences;
}

/**
 * Validate a single reference for accuracy
 * @param {Object} ref - Reference object to validate
 * @returns {Object} - Validation result with score and notes
 */
function validateSingleReference(ref) {
  let score = 1.0;
  let notes = [];
  let isValid = true;

  // Check page number validity
  if (!ref.pageNumber || ref.pageNumber < 1 || !Number.isInteger(ref.pageNumber)) {
    return {
      isValid: false,
      score: 0,
      reason: 'Invalid page number',
      notes: ['Page number must be a positive integer']
    };
  }

  // Check position validity
  if (ref.pagePosition < 0) {
    score -= 0.1;
    notes.push('Negative page position adjusted to 0');
  }

  // Evaluate confidence levels
  if (ref.confidence < 0.5) {
    score -= 0.2;
    notes.push('Low confidence mapping');
  } else if (ref.confidence < 0.7) {
    score -= 0.1;
    notes.push('Medium confidence mapping');
  }

  // Evaluate position type
  switch (ref.positionType) {
    case 'exact':
      // No penalty for exact matches
      break;
    case 'validated':
      score -= 0.05;
      notes.push('Position was validated and adjusted');
      break;
    case 'approximate':
      score -= 0.15;
      notes.push('Approximate position based on fuzzy matching');
      break;
    case 'fallback':
      score -= 0.25;
      notes.push('Fallback position estimation used');
      break;
    default:
      score -= 0.2;
      notes.push('Unknown position type');
  }

  // Check text quality
  if (!ref.text || ref.text.trim().length < 10) {
    score -= 0.2;
    notes.push('Very short reference text');
  }

  // Evaluate quality score
  if (ref.qualityScore < 0.3) {
    score -= 0.3;
    notes.push('Low overall quality score');
  } else if (ref.qualityScore < 0.6) {
    score -= 0.1;
    notes.push('Medium quality score');
  }

  // Final validation threshold
  if (score < 0.4) {
    isValid = false;
  }

  return {
    isValid,
    score: Math.max(0, score),
    notes,
    reason: isValid ? 'Passed validation' : 'Score below threshold'
  };
}

module.exports = { 
  processAndRespondToMessage, 
  processMessageContent, 
  processSummaryContent,
  cleanTextContent, 
  validateReferences,
  validateSingleReference 
}; 