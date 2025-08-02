const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function askGpt(prompt, contextWithReferences) {
  console.log('Context being sent to GPT:', contextWithReferences);
  
  // Extract context and references
  const context = contextWithReferences.text || contextWithReferences;
  const references = contextWithReferences.references || [];
  
  const messages = [
    {
      role: "system",
      content: `You are a helpful document analysis assistant. Follow these guidelines:

FORMATTING RULES:
- Use clear, well-structured markdown formatting
- Use **bold** for important terms and concepts
- Use bullet points (-) for lists and key points
- Use headings (## or ###) to organize longer responses

CONTENT RULES:
- Answer questions based strictly on the provided context
- If information isn't in the context, clearly state "This information is not available in the provided document"

REFERENCE RULES:
- When referencing specific information, include a citation in the format [^ref-X].
- At the end of your response, include a "## References" section.
- List each reference as: [^ref-X]: Page <page_number> - "<The first few words of the referenced text...>"
- CRITICAL: Use the EXACT format [^ref-1], [^ref-2], etc.
- CRITICAL: ALWAYS include the References section if you use any [^ref-X] citations.

IMPORTANT: If you include any [^ref-X] citations in your response, you MUST end with:

## References
[^ref-1]: Page 25 - "This is the start of the text from page 25..."
[^ref-2]: Page 30 - "And this text is from page 30..."`
    },
    {
      role: "user",
      content: `Please answer the following question based on the provided context.
Question: ${prompt}
`
    }
  ];
  
  // Add references to the user message
  if (references && references.length > 0) {
    const referenceText = references.map((ref, index) => 
      `Reference [${index + 1}] (Page: ${ref.pageNumber}): "${ref.text}"`
    ).join('\n');
    
    messages[1].content += `\n\nContext from document:\n${referenceText}`;
  } else {
    messages[1].content += `\n\nContext from document:\n${context}`;
  }
  
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages,
    temperature: 0.2,
  });
  
  const response = res.choices[0].message.content;
  
  // Validate that GPT followed instructions about References section
  const hasCitations = /\[\^ref-\d+\]/.test(response);
  const hasAnyCitations = /\[(?:\^(?:ref-)?)?\d+\]/.test(response); // Any citation format
  const hasReferencesSection = /##?\s*References?\s*$/im.test(response);
  
  if (hasAnyCitations && !hasReferencesSection) {
    console.error('❌ [GPT] CRITICAL: GPT included citations but omitted References section!');
  } else if (hasAnyCitations && hasReferencesSection) {
    console.log('✅ [GPT] References section properly included with citations');
  }
  
  return response;
}

module.exports = { askGpt };
