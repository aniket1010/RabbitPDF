const jwt = require('jsonwebtoken');
const { getToken } = require('next-auth/jwt');

// Existing middleware for HTTP routes
async function verifyAuth(req, res, next) {
  try {
    console.log('🔍 [Auth] Verifying request:', {
      url: req.url,
      method: req.method,
      nodeEnv: process.env.NODE_ENV,
      hasNonProdEnv: process.env.NODE_ENV !== 'production',
      cookies: Object.keys(req.cookies || {})
    });

    // Use NextAuth's getToken function to properly verify the session
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    });
    
    if (!token) {
      console.log('🔍 [Auth] No valid token found, checking bypass conditions:', {
        nodeEnv: process.env.NODE_ENV,
        isNotProduction: process.env.NODE_ENV !== 'production'
      });
      
      if (process.env.NODE_ENV !== 'production') {
        // DEV BYPASS: allow requests without authentication in development
        console.warn('✅ [Auth] DEV BYPASS ACTIVATED - No session token, allowing request');
        req.userId = 'dev-user';
        req.userEmail = 'dev@example.com';
        req.userName = 'Developer';
        return next();
      }
      console.log('❌ [Auth] No session token found, NODE_ENV is production');
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Extract user information from the verified NextAuth token
    req.userId = token.sub || token.id;
    req.userEmail = token.email;
    req.userName = token.name;

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

// New function for WebSocket authentication
async function verifyAuthSocket(req) {
  try {
    console.log('🔍 [Auth] WebSocket token extraction attempt:', {
      cookies: Object.keys(req.cookies || {}),
      headers: Object.keys(req.headers || {}),
      hasSessionToken: !!(req.cookies && req.cookies['next-auth.session-token']),
      nodeEnv: process.env.NODE_ENV
    });
    
    // Use NextAuth's getToken function for WebSocket authentication
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    });
    
    console.log('🔍 [Auth] WebSocket token result:', {
      hasToken: !!token,
      tokenSub: token?.sub,
      tokenId: token?.id,
      tokenEmail: token?.email,
      tokenName: token?.name
    });
    
    if (!token) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️ [Auth] No WebSocket token – DEV bypass active');
        return {
          authenticated: true,
          userId: 'dev-user',
          userEmail: 'dev@example.com',
          userName: 'Developer'
        };
      }
      return { authenticated: false, error: 'No session token found' };
    }

    // Return user information from verified NextAuth token
    const result = {
      authenticated: true,
      userId: token.sub || token.id,
      userEmail: token.email,
      userName: token.name
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
    
    // Use NextAuth's getToken function to properly verify the session
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    });
    
    if (!token) {
      // No token, but that's okay for optional auth
      req.userId = 'dev-user';
      req.userEmail = 'dev@example.com';  
      req.userName = 'Developer';
      console.log('🔍 [OptionalAuth] No token found, using default dev user');
      return next();
    }

    // If token exists and is valid, use the real user info
    req.userId = token.sub || token.id;
    req.userEmail = token.email;
    req.userName = token.name;
    console.log('✅ [OptionalAuth] Valid token found and verified');
    
    next();
  } catch (error) {
    console.error('❌ [OptionalAuth] Error:', error);
    // On error, continue with dev user
    req.userId = 'dev-user';
    req.userEmail = 'dev@example.com';
    req.userName = 'Developer';
    next();
  }
}

module.exports = {
  verifyAuth,
  verifyAuthSocket,
  optionalAuth
};