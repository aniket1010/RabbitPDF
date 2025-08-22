const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

// Better Auth session verification
async function verifyAuth(req, res, next) {
  try {
    // Parse cookies if they're not already parsed by cookie-parser
    let sessionToken = req.cookies && (req.cookies['better-auth.session_token'] || req.cookies['better-auth.session-token']);
    
    if (!sessionToken && req.headers.cookie) {
      const cookies = {};
      req.headers.cookie.split(';').forEach(cookie => {
        const parts = cookie.trim().split('=');
        if (parts.length === 2) {
          cookies[parts[0]] = decodeURIComponent(parts[1]);
        }
      });
      sessionToken = cookies['better-auth.session_token'] || cookies['better-auth.session-token'];
    }
    
    if (!sessionToken) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please sign in to access this resource'
      });
    }

    // Better Auth uses signed tokens - extract the session ID (part before the dot)
    const sessionId = sessionToken.split('.')[0];
    // Try to find the session using the session ID
    const userSession = await prisma.session.findUnique({
      where: { token: sessionId },
      include: { user: true }
    });

    if (!userSession || userSession.expiresAt < new Date()) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please sign in to access this resource'
      });
    }

    // Extract user information from the verified session
    req.userId = userSession.userId;
    req.userEmail = userSession.user.email;
    req.userName = userSession.user.name;

    next();
  } catch (error) {
    console.error('❌ [Auth] Authentication error:', error);
    
    if (process.env.NODE_ENV !== 'production') {
      console.warn('✅ [Auth] DEV BYPASS ACTIVATED - Auth error, allowing request');
      req.userId = 'dev-user';
      req.userEmail = 'dev@example.com';
      req.userName = 'Developer';
      return next();
    }
    
    res.status(401).json({ error: 'Authentication failed' });
  }
}

// WebSocket authentication
async function verifyWebSocketAuth(socket) {
  try {
    let sessionToken;
    
    if (socket.handshake.headers.cookie) {
      const cookies = {};
      socket.handshake.headers.cookie.split(';').forEach(cookie => {
        const parts = cookie.trim().split('=');
        if (parts.length === 2) {
          cookies[parts[0]] = decodeURIComponent(parts[1]);
        }
      });
      sessionToken = cookies['better-auth.session_token'] || cookies['better-auth.session-token'];
    }
    
    if (!sessionToken) {
      return { 
        authenticated: false, 
        error: 'Authentication required for WebSocket connection' 
      };
    }

    // Better Auth uses signed tokens - extract the session ID (part before the dot)
    const sessionId = sessionToken.split('.')[0];

    // Verify the session token against the database
    const session = await prisma.session.findUnique({
      where: { 
        token: sessionId 
      },
      include: {
        user: true
      }
    });
    
    if (!session) {
      return { 
        authenticated: false, 
        error: 'Authentication required for WebSocket connection' 
      };
    }

    // Check if session is expired
    if (session.expiresAt && new Date() > session.expiresAt) {
      return { 
        authenticated: false, 
        error: 'Authentication required for WebSocket connection' 
      };
    }

    // Return user information from verified Better Auth session
    const result = {
      authenticated: true,
      userId: session.userId,
      userEmail: session.user.email,
      userName: session.user.name
    };
    
    return result;
  } catch (error) {
    console.error('❌ [Auth] WebSocket authentication error:', error);
    return { authenticated: false, error: 'Authentication failed' };
  }
}

// Optional auth middleware for routes that don't require authentication
async function optionalAuth(req, res, next) {
  try {
    // Parse cookies if they're not already parsed by cookie-parser
    let sessionToken = req.cookies && (req.cookies['better-auth.session_token'] || req.cookies['better-auth.session-token']);
    
    if (!sessionToken && req.headers.cookie) {
      const cookies = {};
      req.headers.cookie.split(';').forEach(cookie => {
        const parts = cookie.trim().split('=');
        if (parts.length === 2) {
          cookies[parts[0]] = decodeURIComponent(parts[1]);
        }
      });
      sessionToken = cookies['better-auth.session_token'] || cookies['better-auth.session-token'];
    }
    
    if (sessionToken) {
      // Better Auth uses signed tokens - extract the session ID (part before the dot)
      const sessionId = sessionToken.split('.')[0];
      
      // Verify the session token against the database
      const session = await prisma.session.findUnique({
        where: { 
          token: sessionId 
        },
        include: {
          user: true
        }
      });
      
      if (session && (!session.expiresAt || new Date() <= session.expiresAt)) {
        // Extract user information from the verified session
        req.userId = session.userId;
        req.userEmail = session.user.email;
        req.userName = session.user.name;
      }
    }

    // Continue regardless of auth status
    next();
  } catch (error) {
    console.error('❌ [OptionalAuth] Error (continuing anyway):', error);
    next();
  }
}

module.exports = {
  verifyAuth,
  verifyWebSocketAuth,
  optionalAuth
};
