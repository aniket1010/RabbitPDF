const fs = require('fs');
const pdfParse = require('pdf-parse');
const prisma = require('../prismaClient');
const { getBatchEmbeddings } = require('../services/embedding');
const { batchUpsertEmbeddings } = require('../services/pinecone');

// Lightweight PDF page renderer (no coordinates), stores per-page text for chunking
// Create a PDF page renderer bound to a local pageTexts array to avoid global contamination
function createRenderPage(pageTexts) {
  return function renderPage(pageData) {
    return pageData.getTextContent().then(function (textContent) {
      let lastY, text = '';
      for (let item of textContent.items) {
        if (lastY != item.transform[5] && text) {
          text += '\n';
        }
        const normalized = String(item.str).replace(/\s+/g, ' ');
        text += normalized;
        lastY = item.transform[5];
      }
      pageTexts[pageData.pageIndex] = {
        pageNumber: pageData.pageIndex + 1,
        text,
      };
      return text;
    });
  };
}

// Simple heuristic: first line if it looks like a heading (short, Title Case)
function deriveSectionTitle(pageText) {
  try {
    if (!pageText) return '';
    const firstLine = String(pageText).split(/\n/)[0].trim();
    if (!firstLine) return '';
    if (firstLine.length > 120) return '';
    const looksLikeTitle = /[A-Za-z]/.test(firstLine) && firstLine.split(' ').filter(Boolean).length <= 12;
    return looksLikeTitle ? firstLine : '';
  } catch {
    return '';
  }
}

// Lightweight per-page chunking (no coordinates)
function chunkPdfByPage(pageTexts, conversationId) {
  if (!Array.isArray(pageTexts) || pageTexts.length === 0) {
    console.error(`❌ [${conversationId}] No page texts available for chunking.`);
    return [];
  }

  const MIN_CHUNK_LENGTH = 80; // ignore tiny fragments
  const TARGET_LEN = 1000; // characters per chunk
  const OVERLAP = 120; // characters overlap when slicing long paragraphs

  const chunks = [];

  pageTexts.forEach((page, idx) => {
    if (!page || !page.text || !page.text.trim()) return;
    const pageNumber = page.pageNumber || (idx + 1);
    const sectionTitle = deriveSectionTitle(page.text);

    // Split by paragraph breaks (two or more newlines)
    const paragraphs = page.text.split(/\n\s*\n+/);
    let buffer = '';

    const flushBuffer = () => {
      const text = buffer.replace(/\s+/g, ' ').trim();
      if (text.length >= MIN_CHUNK_LENGTH) {
        chunks.push({ text, pageNumber, sectionTitle });
      }
      buffer = '';
    };

    for (const para of paragraphs) {
      const paraText = para.replace(/\s+/g, ' ').trim();
      if (!paraText) continue;

      if ((buffer + ' ' + paraText).length <= TARGET_LEN) {
        buffer = (buffer ? buffer + ' ' : '') + paraText;
      } else {
        if (buffer) flushBuffer();
        // If a single paragraph is too long, hard-split with overlap
        let start = 0;
        while (start < paraText.length) {
          const end = Math.min(start + TARGET_LEN, paraText.length);
          const slice = paraText.slice(start, end);
          const text = slice.replace(/\s+/g, ' ').trim();
          if (text.length >= MIN_CHUNK_LENGTH) {
            chunks.push({ text, pageNumber, sectionTitle });
          }
          if (end >= paraText.length) break;
          start = Math.max(0, end - OVERLAP);
        }
      }
    }

    if (buffer) flushBuffer();
  });

  return chunks;
}

async function processPdf({ filePath, conversationId, originalName }) {
  try {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { processingStatus: 'processing' },
    });

    const dataBuffer = await fs.promises.readFile(filePath);
    const localPageTexts = [];
    const data = await pdfParse(dataBuffer, {
      max: 0,
      pagerender: createRenderPage(localPageTexts),
    });

    const docText = (data.text || '').trim();
    if (!docText) {
      console.error(`❌ [${conversationId}] No text content found in PDF`);
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { processingStatus: 'failed' },
      });
      return;
    }

    const pageChunks = chunkPdfByPage(localPageTexts, conversationId);
    const chunks = pageChunks.map((c) => c.text);

    const embeddings = await getBatchEmbeddings(chunks);
    const embeddingResults = embeddings.map((embedding, index) => ({
      embedding,
      chunk: chunks[index],
      pageNumber: pageChunks[index]?.pageNumber || 1,
      chunkIndex: index,
      sectionTitle: pageChunks[index]?.sectionTitle || '',
    }));

    const vectorDataArray = embeddingResults.map((result) => ({
      id: `${conversationId}-${result.chunkIndex}`,
      vector: result.embedding,
      text: result.chunk,
      conversationId: conversationId,
      pageNumber: result.pageNumber,
      chunkIndex: result.chunkIndex,
      sectionTitle: result.sectionTitle,
    }));

    await batchUpsertEmbeddings(vectorDataArray);

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { processingStatus: 'completed' },
    });

    // Notify API to emit WebSocket and process any pending messages (works in both API and worker contexts)
    try {
      const fetch = require('node-fetch');
      // Use Docker service name or environment variable for backend URL
      const backendUrl = process.env.BACKEND_URL || `http://backend:${process.env.PORT || 5000}`;
      const internalSecret = process.env.INTERNAL_API_SECRET;
      
      await fetch(`${backendUrl}/internal/pdf-complete`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(internalSecret && { 'x-internal-secret': internalSecret })
        },
        body: JSON.stringify({ conversationId })
      });
      console.log(`📡 [PDF] Notified API of completion for ${conversationId}`);
    } catch (notifyError) {
      console.warn(`⚠️ [PDF] Failed to notify API of completion:`, notifyError.message);
    }

    // Note: Pending message processing is now handled by the API endpoint
  } catch (error) {
    console.error(`❌ [${conversationId}] PDF processing failed:`, error);
    try {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { processingStatus: 'failed' },
      });
    } catch {}
  }
}

module.exports = { processPdf };



