import { getDocument, GlobalWorkerOptions, version } from "pdfjs-dist";

export const MAX_PDF_PAGES = 250;

// Ensure the worker is configured for pdfjs-dist operations in the browser
function ensurePdfWorkerConfigured(): void {
  const expectedWorkerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.js`;
  // @ts-ignore pdfjs types don't expose workerSrc property
  if (!GlobalWorkerOptions.workerSrc || GlobalWorkerOptions.workerSrc !== expectedWorkerSrc) {
    // @ts-ignore
    GlobalWorkerOptions.workerSrc = expectedWorkerSrc;
  }
}

export async function countPdfPages(file: File): Promise<number> {
  ensurePdfWorkerConfigured();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = getDocument({ data: arrayBuffer });
  try {
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    await pdf.cleanup?.();
    await pdf.destroy?.();
    return numPages;
  } catch (error) {
    // Propagate to caller to decide on UX
    throw error;
  } finally {
    try { loadingTask.destroy?.(); } catch {}
  }
}


