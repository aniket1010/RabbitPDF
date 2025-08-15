const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function askGpt(prompt, contextWithReferences) {
  // Extract context, references, and conversation history first
  const context = contextWithReferences.text || contextWithReferences;
  const references = contextWithReferences.references || [];
  const conversationHistory = contextWithReferences.conversationHistory || [];
  
  console.log('🔍 [GPT] Processing request with context:', {
    hasReferences: !!(references && references.length > 0),
    referenceCount: references.length,
    conversationHistoryCount: conversationHistory.length
  });
  
  const messages = [
    {
      role: "system",
      content: `You are an expert document analysis assistant. Your goal is to provide comprehensive, well-structured answers based on the document content and maintain conversation continuity.

CONVERSATION CONTINUITY:
- You have access to previous messages in this conversation for context
- Reference previous discussions when relevant (e.g., "As we discussed earlier about arrays...")
- Build upon previous answers and maintain consistency
- If the user asks follow-up questions, connect them to prior context
- Avoid repeating information already covered unless specifically requested

RESPONSE QUALITY GUIDELINES:
- Provide detailed, informative answers that fully address the question
- Structure your response with clear organization (use headings, bullet points when appropriate)
- Include relevant context and explanations, not just bare facts
- Connect related concepts and provide insights where helpful
- Keep responses focused and concise - aim for thoroughness without unnecessary length
- Use professional, clear language that's accessible to the reader

CITATION RULES - MANDATORY:
- When you use information from the provided context, you MUST cite the page number
- Use this EXACT format: [Page X] where X is the page number
- Place citations immediately after the information from that page
- You can cite the same page multiple times if needed
- If information spans multiple pages, cite all relevant pages
- NEVER make up page numbers - only use the page numbers provided in the context

RESPONSE STRUCTURE:
- Start with a direct answer to the question
- Provide supporting details and context
- Include relevant examples or explanations from the document
- Reference previous conversation when relevant
- End with a summary or key takeaway if appropriate

EXAMPLE:
"Data structures are fundamental building blocks in computer science [Page 25]. The document explains that arrays serve as the most basic data type, providing indexed access to elements [Page 25]. 

Key characteristics of arrays include:
- Fixed size allocation [Page 25]
- Constant-time element access [Page 26]
- Memory-efficient storage [Page 26]

The book also covers more advanced topics like linked lists and trees, which offer different trade-offs in terms of insertion and deletion performance [Page 30]."

IMPORTANT:
- Every piece of information from the context MUST have a page citation
- Use only the page numbers that are explicitly provided in the context
- Balance detail with conciseness - be thorough but not verbose
- Maintain conversation flow and reference previous discussions when relevant`
    },
    {
      role: "user",
      content: `Please answer the following question based on the provided context.

${conversationHistory.length > 0 ? `Previous conversation:\n${conversationHistory.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text.length > 200 ? msg.text.substring(0, 200) + '...' : msg.text}`).join('\n')}\n\n` : ''}Current question: ${prompt}

Context:`
    }
  ];
  
  // Add context with clear page number indicators
  if (references && references.length > 0) {
    const contextText = references.map(ref => 
      `[PAGE ${ref.pageNumber}] ${ref.text}`
    ).join('\n\n');
    
    messages[1].content += `\n${contextText}`;
    
    console.log('🔍 [GPT] Context formatted with page numbers:', {
      pages: references.map(r => r.pageNumber),
      totalLength: contextText.length
    });
  } else {
    messages[1].content += `\n${context}`;
  }
  
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.1, // Lower temperature for more consistent citation behavior
    });
    
    const response = res.choices[0].message.content;
    
    // Validate citations
    const citationPattern = /\[Page (\d+)\]/g;
    const foundCitations = [...response.matchAll(citationPattern)];
    const availablePages = references.map(r => r.pageNumber);
    
    console.log('🔍 [GPT] Citation analysis:', {
      foundCitations: foundCitations.length,
      availablePages: availablePages,
      citedPages: foundCitations.map(match => parseInt(match[1])),
      citationDetails: foundCitations.map(match => ({
        citation: match[0],
        pageNumber: parseInt(match[1]),
        isValid: availablePages.includes(parseInt(match[1]))
      }))
    });
    
    // Check for invalid citations
    const invalidCitations = foundCitations.filter(match => {
      const pageNum = parseInt(match[1]);
      return !availablePages.includes(pageNum);
    });
    
    if (invalidCitations.length > 0) {
      console.warn('⚠️ [GPT] Found invalid citations:', invalidCitations.map(m => m[0]));
    }
    
    // If no citations found but references were provided, add fallback
    if (references.length > 0 && foundCitations.length === 0) {
      console.warn('⚠️ [GPT] No citations found, adding fallback');
      const uniquePages = [...new Set(availablePages)].sort((a, b) => a - b);
      const fallback = `\n\n*Source: Information from pages ${uniquePages.join(', ')} of the document.*`;
      return response + fallback;
    }
    
    console.log('✅ [GPT] Response generated with citations');
    return response;
    
  } catch (error) {
    console.error('❌ [GPT] Error:', error);
    throw error;
  }
}

module.exports = { askGpt };