import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile"
        }
      }
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 5, // 5 minutes for testing
    updateAge: 60, // Update every minute
  },
  callbacks: {
    async jwt({ token, user, account, profile, trigger, session }) {
      // Debug logging for Google authentication
      if (account?.provider === "google") {
        console.log('Google OAuth Data:', {
          user: user,
          profile: profile,
          account: account?.provider
        });
      }
      
      if (user) {
        token.id = user.id;
        token.picture = user.image; // Preserve the image
      }
      
      // Set initial OAuth provider ID if not already set
      if (account?.provider === "google" && profile && !token.id) {
        const googleProfile = profile as any;
        token.id = googleProfile.sub;
      }
      
      if (account?.provider === "github" && profile && !token.id) {
        const githubProfile = profile as any;
        token.id = githubProfile.id.toString();
      }
      
      // Handle Google-specific profile data
      if (account?.provider === "google" && profile) {
        const googleProfile = profile as any; // Type assertion for Google profile
        console.log('🔍 [NextAuth] Google sign-in detected, checking for existing user data...');
        
        // Always use Google's email and profile picture (most up-to-date)
        token.email = googleProfile.email;
        token.picture = googleProfile.picture;
        
        try {
          // Check if user already exists in our database
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/user-lookup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: googleProfile.email })
          });
          
          if (response.ok) {
            const { user } = await response.json();
            
            if (user && user.name) {
              // Existing user - preserve their saved username
              console.log('✅ [NextAuth] Existing user found, preserving saved name:', user.name);
              token.name = user.name;
              token.avatar = user.avatar;
              token.id = user.id;
            } else {
              // New user - create them in the database
              console.log('🆕 [NextAuth] New user, creating database record...');
              const createResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/user-create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: googleProfile.sub, // Use Google's unique ID
                  email: googleProfile.email,
                  name: googleProfile.name,
                  image: googleProfile.picture
                })
              });
              
              if (createResponse.ok) {
                const { user: newUser } = await createResponse.json();
                console.log('✅ [NextAuth] Created new user in database:', newUser);
                token.name = newUser.name;
                token.avatar = newUser.avatar;
                token.id = newUser.id;
              } else {
                console.log('⚠️ [NextAuth] Failed to create user, using Google name as fallback');
                token.name = googleProfile.name;
              }
            }
          } else {
            // Fallback to Google name if lookup fails
            console.log('⚠️ [NextAuth] User lookup failed, using Google name as fallback');
            token.name = googleProfile.name;
          }
        } catch (error) {
          console.error('❌ [NextAuth] Error looking up user, using Google name as fallback:', error);
          token.name = googleProfile.name;
        }
      }
      
      // Handle GitHub-specific profile data
      if (account?.provider === "github" && profile) {
        const githubProfile = profile as any;
        console.log('🔍 [NextAuth] GitHub sign-in detected, checking for existing user data...');
        
        // Always use GitHub's email and profile picture (most up-to-date)
        token.email = githubProfile.email;
        token.picture = githubProfile.avatar_url;
        
        try {
          // Check if user already exists in our database
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/user-lookup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: githubProfile.email })
          });
          
          if (response.ok) {
            const { user } = await response.json();
            
            if (user && user.name) {
              // Existing user - preserve their saved username
              console.log('✅ [NextAuth] Existing user found, preserving saved name:', user.name);
              token.name = user.name;
              token.avatar = user.avatar;
              token.id = user.id;
            } else {
              // New user - create them in the database
              console.log('🆕 [NextAuth] New user, creating database record...');
              const createResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/user-create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: githubProfile.id.toString(), // Use GitHub's unique ID
                  email: githubProfile.email,
                  name: githubProfile.name || githubProfile.login,
                  image: githubProfile.avatar_url
                })
              });
              
              if (createResponse.ok) {
                const { user: newUser } = await createResponse.json();
                console.log('✅ [NextAuth] Created new user in database:', newUser);
                token.name = newUser.name;
                token.avatar = newUser.avatar;
                token.id = newUser.id;
              } else {
                console.log('⚠️ [NextAuth] Failed to create user, using GitHub name as fallback');
                token.name = githubProfile.name || githubProfile.login;
              }
            }
          } else {
            // Fallback to GitHub name if lookup fails
            console.log('⚠️ [NextAuth] User lookup failed, using GitHub name as fallback');
            token.name = githubProfile.name || githubProfile.login;
          }
        } catch (error) {
          console.error('❌ [NextAuth] Error looking up user, using GitHub name as fallback:', error);
          token.name = githubProfile.name || githubProfile.login;
        }
      }
      
      // Handle session updates (when updateSession is called)
      if (trigger === "update" && session) {
        console.log('🔄 [NextAuth] Session update triggered, updating token with new data:', session);
        
        // Update token with the new session data
        if (session.user) {
          token.name = session.user.name || token.name;
          token.email = session.user.email || token.email;
          token.picture = session.user.image || token.picture;
          token.avatar = session.user.avatar || token.avatar;
        }
        
        console.log('✅ [NextAuth] Token updated with new session data');
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        // Keep both image (OAuth profile) and avatar (custom selection) available
        session.user.image = token.picture as string; // OAuth profile picture
        session.user.avatar = token.avatar as string; // Custom avatar selection
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions; 