const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

// Better Auth session verification
async function verifyAuth(req, res, next) {
  try {
    // DEBUG: Log raw cookie header FIRST
    console.log('🔍 [Auth] Raw cookie header:', req.headers.cookie || 'UNDEFINED');
    console.log('🔍 [Auth] Parsed cookies object:', JSON.stringify(req.cookies || {}));
    console.log('🔍 [Auth] Request method:', req.method);
    console.log('🔍 [Auth] Request path:', req.path);
    console.log('🔍 [Auth] Request URL:', req.url);
    
    // Parse cookies if they're not already parsed by cookie-parser
    // Check for both regular and __Secure- prefixed cookies
    let sessionToken = req.cookies && (
      req.cookies['better-auth.session_token'] || 
      req.cookies['better-auth.session-token'] ||
      req.cookies['__Secure-better-auth.session_token'] ||
      req.cookies['__Secure-better-auth.session-token']
    );
    
    if (!sessionToken && req.headers.cookie) {
      const cookies = {};
      req.headers.cookie.split(';').forEach(cookie => {
        const parts = cookie.trim().split('=');
        if (parts.length === 2) {
          cookies[parts[0]] = decodeURIComponent(parts[1]);
        }
      });
      console.log('🔍 [Auth] Manually parsed cookies:', JSON.stringify(cookies));
      sessionToken = cookies['better-auth.session_token'] || 
                     cookies['better-auth.session-token'] ||
                     cookies['__Secure-better-auth.session_token'] ||
                     cookies['__Secure-better-auth.session-token'];
    }
    
    // DEBUG: Log what we received
    console.log('🔍 [Auth] Session token received:', sessionToken ? 'EXISTS' : 'MISSING');
    if (sessionToken) {
      console.log('🔍 [Auth] Token preview:', sessionToken.substring(0, 30) + '...');
      console.log('🔍 [Auth] Token length:', sessionToken.length);
    }
    
    if (!sessionToken) {
      console.warn('⚠️ [Auth] No session token found in cookies');
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please sign in to access this resource'
      });
    }

    // Better Auth uses signed tokens - extract the session ID (part before the dot)
    const sessionId = sessionToken.split('.')[0];
    console.log('🔍 [Auth] Extracted session ID:', sessionId);
    console.log('🔍 [Auth] Session ID length:', sessionId.length);
    console.log('🔍 [Auth] Full token:', sessionToken);
    console.log('🔍 [Auth] Looking for token starting with:', sessionId);
    
    // Better-auth stores just the session ID (32 chars) in DB, so use exact match or startsWith
    // Try exact match first (since DB has 32-char tokens)
    let userSession = await prisma.session.findUnique({
      where: { token: sessionId },
      include: { user: true }
    });
    
    // If not found, try startsWith (in case DB has full signed token)
    if (!userSession) {
      console.log('🔍 [Auth] Exact match failed, trying startsWith...');
      userSession = await prisma.session.findFirst({
        where: { 
          token: { startsWith: sessionId }
        },
        include: { user: true }
      });
    }

    console.log('🔍 [Auth] Session lookup result:', userSession ? 'FOUND' : 'NOT FOUND');
    if (userSession) {
      console.log('🔍 [Auth] Session userId:', userSession.userId);
      console.log('🔍 [Auth] Session expiresAt:', userSession.expiresAt);
    } else {
      // DEBUG: Check what tokens exist in database
      const allSessions = await prisma.session.findMany({
        select: { token: true, userId: true },
        take: 3,
        orderBy: { expiresAt: 'desc' }
      });
      console.log('🔍 [Auth] Available session tokens in DB (first 20 chars):', allSessions.map(s => s.token.substring(0, 20)));
    }

    if (!userSession) {
      console.warn('⚠️ [Auth] Session not found in database');
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please sign in to access this resource'
      });
    }

    if (userSession.expiresAt && userSession.expiresAt < new Date()) {
      console.warn('⚠️ [Auth] Session expired:', userSession.expiresAt);
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please sign in to access this resource'
      });
    }

    // Extract user information from the verified session
    req.userId = userSession.userId;
    req.userEmail = userSession.user.email;
    req.userName = userSession.user.name;

    // Log for debugging
    console.log('✅ [Auth] Authenticated user:', {
      userId: req.userId,
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
    let sessionToken;
    
    if (socket.handshake.headers.cookie) {
      const cookies = {};
      socket.handshake.headers.cookie.split(';').forEach(cookie => {
        const parts = cookie.trim().split('=');
        if (parts.length === 2) {
          cookies[parts[0]] = decodeURIComponent(parts[1]);
        }
      });
      sessionToken = cookies['better-auth.session_token'] || 
                     cookies['better-auth.session-token'] ||
                     cookies['__Secure-better-auth.session_token'] ||
                     cookies['__Secure-better-auth.session-token'];
    }
    
    // DEBUG: Log WebSocket auth attempt
    console.log('🔍 [WebSocket Auth] Session token received:', sessionToken ? 'EXISTS' : 'MISSING');
    if (sessionToken) {
      console.log('🔍 [WebSocket Auth] Token preview:', sessionToken.substring(0, 30) + '...');
    }
    
    if (!sessionToken) {
      return { 
        authenticated: false, 
        error: 'Authentication required for WebSocket connection' 
      };
    }

    // Better Auth uses signed tokens - extract the session ID (part before the dot)
    const sessionId = sessionToken.split('.')[0];
    console.log('🔍 [WebSocket Auth] Extracted session ID:', sessionId);
    console.log('🔍 [WebSocket Auth] Full token:', sessionToken);
    console.log('🔍 [WebSocket Auth] Looking for token starting with:', sessionId);

    // Better-auth stores just the session ID (32 chars) in DB, so use exact match or startsWith
    // Try exact match first (since DB has 32-char tokens)
    let session = await prisma.session.findUnique({
      where: { token: sessionId },
    });
    
    // If not found, try startsWith (in case DB has full signed token)
    if (!session) {
      console.log('🔍 [WebSocket Auth] Exact match failed, trying startsWith...');
      session = await prisma.session.findFirst({
        where: { 
          token: { startsWith: sessionId }
        },
      });
    }
    
    // If found, get full session with user
    if (session) {
      session = await prisma.session.findUnique({
        where: { token: session.token },
      include: {
        user: true
      }
    });

    console.log('🔍 [WebSocket Auth] Session lookup result:', session ? 'FOUND' : 'NOT FOUND');
    
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
    // Check for both regular and __Secure- prefixed cookies
    let sessionToken = req.cookies && (
      req.cookies['better-auth.session_token'] || 
      req.cookies['better-auth.session-token'] ||
      req.cookies['__Secure-better-auth.session_token'] ||
      req.cookies['__Secure-better-auth.session-token']
    );
    
    if (!sessionToken && req.headers.cookie) {
      const cookies = {};
      req.headers.cookie.split(';').forEach(cookie => {
        const parts = cookie.trim().split('=');
        if (parts.length === 2) {
          cookies[parts[0]] = decodeURIComponent(parts[1]);
        }
      });
      sessionToken = cookies['better-auth.session_token'] || 
                     cookies['better-auth.session-token'] ||
                     cookies['__Secure-better-auth.session_token'] ||
                     cookies['__Secure-better-auth.session-token'];
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
