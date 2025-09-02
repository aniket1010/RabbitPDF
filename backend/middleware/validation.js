const { validateFileSize, validateFileType } = require('../utils/validators');
const fs = require('fs');
const pdfParse = require('pdf-parse');

const MAX_PDF_PAGES = 250;

const validatePDF = async (req, res, next) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded' 
      });
    }

    // Validate file type
    if (!validateFileType(req.file.mimetype)) {
      return res.status(400).json({ 
        error: 'Invalid file type. Only PDF files are allowed' 
      });
    }

    // Validate file size
    if (!validateFileSize(req.file.size)) {
      return res.status(400).json({ 
        error: 'File too large. Maximum size is 10MB' 
      });
    }

    // Server-side page limit validation (defense-in-depth)
    try {
      const fileBuffer = fs.readFileSync(req.file.path);
      const parsed = await pdfParse(fileBuffer);
      const numPages = parsed?.numpages || parsed?.numrender || 0;
      if (numPages > MAX_PDF_PAGES) {
        return res.status(400).json({
          error: `PDF has ${numPages} pages. Maximum allowed is ${MAX_PDF_PAGES}.`,
          code: 'PDF_TOO_MANY_PAGES'
        });
      }
    } catch (e) {
      // If parsing fails, respond with an explicit error rather than proceeding
      return res.status(400).json({
        error: 'Unable to read PDF pages. Please try another file.',
        code: 'PDF_PARSE_ERROR'
      });
    }

    next();
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ 
      error: 'Error validating file', 
      details: error.message 
    });
  }
};

const validateConversationId = (req, res, next) => {
  const { conversationId } = req.params;
  if (!conversationId || typeof conversationId !== 'string') {
    return res.status(400).json({ 
      error: 'Invalid conversation ID' 
    });
  }
  next();
};

module.exports = {
  validatePDF,
  validateConversationId
};
