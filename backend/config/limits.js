module.exports = {
  chat: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    // Max PDF upload size (bytes). Keep in sync with frontend limits and server body limits.
    maxFileSize: 100 * 1024 * 1024, // 100MB
  },
};


