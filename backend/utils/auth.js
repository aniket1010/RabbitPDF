const { getToken } = require("next-auth/jwt");

/**
 * Middleware to verify NextAuth JWT token and extract user ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object  
 * @param {Function} next - Express next function
 */
async function verifyAuth(req, res, next) {
  try {
    console.log('🔐 [Auth] Verifying authentication...');
    console.log('🔐 [Auth] Cookies:', Object.keys(req.cookies || {}));
    
    // Get the JWT token from the request
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      // NextAuth stores tokens in cookies, so we need to pass the cookie
      raw: false
    });

    console.log('🔐 [Auth] Token found:', !!token);
    console.log('🔐 [Auth] Token has ID:', !!token?.id);

    if (!token || !token.id) {
      console.log('❌ [Auth] Authentication failed - no valid token');
      return res.status(401).json({ 
        error: 'Authentication required. Please sign in.' 
      });
    }

    // Add user ID to request object for use in route handlers
    req.userId = token.id;
    req.userEmail = token.email;
    req.userName = token.name;
    
    console.log('✅ [Auth] Authentication successful for user:', token.email);
    next();
  } catch (error) {
    console.error('❌ [Auth] Auth verification error:', error);
    return res.status(401).json({ 
      error: 'Invalid authentication token' 
    });
  }
}

/**
 * Optional auth middleware - allows both authenticated and anonymous users
 * If authenticated, adds user info to request. If not, continues without user info.
 */
async function optionalAuth(req, res, next) {
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      raw: false
    });

    if (token && token.id) {
      req.userId = token.id;
      req.userEmail = token.email;
      req.userName = token.name;
    }
    // Continue regardless of auth status
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    // Continue without auth info if there's an error
    next();
  }
}

module.exports = { verifyAuth, optionalAuth }; 