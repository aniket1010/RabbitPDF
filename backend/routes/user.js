const express = require('express');
const prisma = require('../prismaClient');
const { verifyAuth } = require('../utils/auth');

const router = express.Router();

// Update user profile (username)
router.patch('/profile', verifyAuth, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.userId;

    console.log('🔍 [User] Profile update request:', {
      userId,
      userEmail: req.userEmail,
      userName: req.userName,
      newName: name,
      bodyKeys: Object.keys(req.body)
    });

    // Validate input
    if (!name || typeof name !== 'string' || !name.trim()) {
      console.log('❌ [User] Invalid name provided:', name);
      return res.status(400).json({ error: 'Invalid or missing name' });
    }

    // Check if user exists first
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    });

    console.log('🔍 [User] Existing user check:', existingUser);

    if (!existingUser) {
      console.log('❌ [User] User not found in database:', userId);
      
      // In development, create the user if it doesn't exist
      if (process.env.NODE_ENV !== 'production' && userId === 'dev-user') {
        console.log('🔧 [User] Creating development user...');
        const newUser = await prisma.user.create({
          data: {
            id: 'dev-user',
            email: 'dev@example.com',
            name: name.trim()
          },
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        });
        console.log('✅ [User] Created development user:', newUser);
        
        // Emit WebSocket event
        const io = req.app.get('socketio');
        if (io) {
          io.to(`user_${userId}`).emit('userProfileUpdated', {
            userId,
            name: name.trim(),
            type: 'username'
          });
        }
        
        return res.json({ 
          message: 'Username updated successfully', 
          user: newUser 
        });
      }
      
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name: name.trim() },
      select: {
        id: true,
        name: true,
        email: true,
        image: true
      }
    });

    console.log(`👤 [User] Username updated for ${userId}: ${name.trim()}`);
    console.log('✅ [User] Updated user:', updatedUser);

    // Emit WebSocket event for real-time update
    const io = req.app.get('socketio');
    if (io) {
      const roomName = `user_${userId}`;
      const socketsInRoom = io.sockets.adapter.rooms.get(roomName);
      
      console.log(`📡 [User] Emitting userProfileUpdated to room: ${roomName}`);
      console.log(`📡 [User] Sockets in room ${roomName}:`, socketsInRoom ? Array.from(socketsInRoom) : 'No sockets in room');
      console.log(`📡 [User] Total connected sockets:`, io.sockets.sockets.size);
      
      // List all rooms for debugging
      console.log(`📡 [User] All rooms:`, Array.from(io.sockets.adapter.rooms.keys()));
      
      io.to(roomName).emit('userProfileUpdated', {
        userId,
        name: name.trim(),
        type: 'username'
      });
      
      console.log(`📡 [User] Event emitted successfully`);
    } else {
      console.log(`❌ [User] No WebSocket instance found`);
    }

    res.json({ 
      message: 'Username updated successfully', 
      user: updatedUser 
    });

  } catch (error) {
    console.error('❌ [User] Failed to update username:', error);
    res.status(500).json({ error: 'Failed to update username' });
  }
});

// Update user avatar
router.patch('/avatar', verifyAuth, async (req, res) => {
  try {
    const { avatar } = req.body;
    const userId = req.userId;
    const userEmail = req.userEmail;
    const userName = req.userName;

    console.log('🔍 [User] Avatar update request:', {
      userId,
      userEmail,
      userName,
      avatar,
      bodyKeys: Object.keys(req.body)
    });

    // Validate input
    if (!avatar || typeof avatar !== 'string') {
      console.log('❌ [User] Invalid avatar provided:', avatar);
      return res.status(400).json({ error: 'Invalid or missing avatar' });
    }

    // Use upsert to update existing user or create new one
    const updatedUser = await prisma.user.upsert({
      where: { id: userId },
      update: { 
        image: avatar 
      },
      create: {
        id: userId,
        email: userEmail,
        name: userName,
        image: avatar
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true
      }
    });

    console.log(`🖼️ [User] Avatar updated for ${userId}: ${avatar}`);

    // Emit WebSocket event for real-time update
    const io = req.app.get('socketio');
    if (io) {
      console.log(`📡 [User] Emitting userProfileUpdated to user_${userId}:`, {
        userId,
        avatar: avatar
      });
      io.to(`user_${userId}`).emit('userProfileUpdated', {
        userId,
        avatar: avatar,  // ✅ FIXED - now sends 'avatar' instead of 'image'
        type: 'avatar'
      });
    }

    res.json({ 
      message: 'Avatar updated successfully', 
      user: updatedUser 
    });

  } catch (error) {
    console.error('❌ [User] Failed to update avatar:', error);
    res.status(500).json({ error: 'Failed to update avatar' });
  }
});

// Get user profile
router.get('/profile', verifyAuth, async (req, res) => {
  try {
    const userId = req.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });

  } catch (error) {
    console.error('❌ [User] Failed to get user profile:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Lookup user by email (for NextAuth sign-in)
router.post('/lookup', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log('🔍 [User] Looking up user by email:', email);

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true
      }
    });

    if (!user) {
      console.log('👤 [User] User not found for email:', email);
      return res.status(404).json({ user: null });
    }

    console.log('✅ [User] Found existing user:', { id: user.id, name: user.name, email: user.email });
    res.json({ user });

  } catch (error) {
    console.error('❌ [User] Failed to lookup user:', error);
    res.status(500).json({ error: 'Failed to lookup user' });
  }
});

// Create user (for NextAuth sign-in)
router.post('/create', async (req, res) => {
  try {
    const { id, email, name, image } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    console.log('🔍 [User] Creating new user:', { id, email, name });

    // Use upsert to avoid conflicts if user somehow already exists
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        image: image || null
      },
      create: {
        id: id || undefined, // Let Prisma generate ID if not provided
        email,
        name,
        image: image || null
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        image: true
      }
    });

    console.log('✅ [User] User created/updated successfully:', { id: user.id, name: user.name, email: user.email });
    res.json({ user });

  } catch (error) {
    console.error('❌ [User] Failed to create user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

module.exports = router;
