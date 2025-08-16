const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

// Better Auth session verification
async function verifyAuth(req, res, next) {
  try {
    console.log('🔍 [Auth] Verifying request:', {
      url: req.url,
      method: req.method,
      nodeEnv: process.env.NODE_ENV,
      hasNonProdEnv: process.env.NODE_ENV !== 'production',
      cookies: Object.keys(req.cookies || {}),
      hasCookieHeader: !!req.headers.cookie
    });

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
      console.log('❌ [Auth] No session token found in cookies');
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please sign in to access this resource'
      });
    }

    console.log('🔍 [Auth] DEBUG - Session token details:', {
      rawSessionToken: sessionToken,
      tokenLength: sessionToken.length,
      tokenPreview: sessionToken.substring(0, 20) + '...'
    });

    // Better Auth uses signed tokens - extract the session ID (part before the dot)
    const sessionId = sessionToken.split('.')[0];
    
    console.log('🔍 [Auth] DEBUG - Extracted session ID:', {
      sessionId: sessionId,
      sessionIdLength: sessionId.length
    });

    // Get all sessions for debugging
    const allSessions = await prisma.session.findMany({
      select: {
        id: true,
        token: true,
        userId: true,
        user: {
          select: {
            email: true
          }
        },
        expiresAt: true
      }
    });

    console.log('🔍 [Auth] DEBUG - All sessions in database:', allSessions.map(s => ({
      id: s.id,
      tokenPreview: s.token.substring(0, 20) + '...',
      userId: s.userId,
      userEmail: s.user.email,
      expired: s.expiresAt < new Date()
    })));

    // Try to find the session using the session ID
    const userSession = await prisma.session.findUnique({
      where: { token: sessionId },
      include: { user: true }
    });

    console.log('🔍 [Auth] DEBUG - Session lookup result:', {
      found: !!userSession,
      sessionId: userSession?.id,
      userId: userSession?.userId,
      userEmail: userSession?.user?.email
    });

    if (!userSession || userSession.expiresAt < new Date()) {
      console.log('❌ [Auth] Invalid session token');
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please sign in to access this resource'
      });
    }

    // Extract user information from the verified session
    req.userId = userSession.userId;
    req.userEmail = userSession.user.email;
    req.userName = userSession.user.name;

    console.log('✅ [Auth] Authenticated user:', {
      id: req.userId,
      email: req.userEmail,
      name: req.userName
    });

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
    console.log('🔍 [Auth] WebSocket token extraction attempt:', {
      cookieHeader: !!socket.handshake.headers.cookie,
      parsedCookies: socket.handshake.headers.cookie ? 
        socket.handshake.headers.cookie.split(';').map(c => c.trim().split('=')[0]) : [],
      hasSessionToken: socket.handshake.headers.cookie?.includes('better-auth.session_token'),
      nodeEnv: process.env.NODE_ENV
    });

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
      console.log('❌ [Auth] No session token found in WebSocket cookies');
      return { 
        authenticated: false, 
        error: 'Authentication required for WebSocket connection' 
      };
    }

    // Better Auth uses signed tokens - extract the session ID (part before the dot)
    const sessionId = sessionToken.split('.')[0];
    
    console.log('🔍 [Auth] WebSocket DEBUG - Extracted session ID:', {
      sessionId: sessionId,
      sessionIdLength: sessionId.length
    });

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
      console.log('❌ [Auth] Invalid WebSocket session token');
      return { 
        authenticated: false, 
        error: 'Authentication required for WebSocket connection' 
      };
    }

    // Check if session is expired
    if (session.expiresAt && new Date() > session.expiresAt) {
      console.log('❌ [Auth] WebSocket session expired');
      return { 
        authenticated: false, 
        error: 'Authentication required for WebSocket connection' 
      };
    }

    console.log('🔍 [Auth] WebSocket session verified:', {
      hasSession: !!session,
      userId: session.userId,
      userEmail: session.user.email,
      userName: session.user.name
    });

    // Return user information from verified Better Auth session
    const result = {
      authenticated: true,
      userId: session.userId,
      userEmail: session.user.email,
      userName: session.user.name
    };
    
    console.log('✅ [Auth] WebSocket authentication successful:', result);
    return result;
  } catch (error) {
    console.error('❌ [Auth] WebSocket authentication error:', error);
    return { authenticated: false, error: 'Authentication failed' };
  }
}

// Optional auth middleware for routes that don't require authentication
async function optionalAuth(req, res, next) {
  try {
    console.log('🔍 [OptionalAuth] Processing optional auth for:', req.url);
    
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
        
        console.log('✅ [OptionalAuth] Authenticated user:', {
          id: req.userId,
          email: req.userEmail,
          name: req.userName
        });
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
