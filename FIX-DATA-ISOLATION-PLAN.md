# Fix Data Isolation Issues - Plan

## Problems Found:

1. **Missing Authentication on Routes:**
   - `/conversation/:conversationId/details` - No `verifyAuth` middleware
   - `/conversation/:conversationId/pdf` - No `verifyAuth` middleware

2. **WebSocket Broadcasting to All Users:**
   - `conversationRenamed` event is broadcasted to ALL sockets (debug code)

3. **Potential userId Issues:**
   - Need to verify userId is correctly extracted from sessions
   - Need to check if conversations are created with correct userId

---

## Fix Plan:

### Step 1: Add Authentication to Unprotected Routes

**File:** `backend/routes/conversation.js`

**Fix 1.1:** Add `verifyAuth` to `/details` route (line 53)
**Fix 1.2:** Add `verifyAuth` to `/pdf` route (line 205)
**Fix 1.3:** Add userId check to both routes

### Step 2: Remove Debug Broadcast

**File:** `backend/routes/conversation.js`

**Fix 2.1:** Remove the `io.emit()` broadcast (line 181) that sends to all users
**Fix 2.2:** Keep only the user-specific room emit

### Step 3: Verify userId Extraction

**File:** `backend/utils/auth.js`

**Fix 3.1:** Add logging to verify userId is correctly extracted
**Fix 3.2:** Ensure session token parsing is correct

### Step 4: Verify Conversation Creation

**File:** `backend/routes/upload.js`

**Fix 4.1:** Verify conversations are created with correct userId
**Fix 4.2:** Add logging to track userId during creation

### Step 5: Add Database Constraints

**File:** `backend/prisma/schema.prisma`

**Fix 5.1:** Ensure userId is required (not optional) in Conversation model
**Fix 5.2:** Add database-level constraints

### Step 6: Frontend Verification

**File:** `frontend/src/components/Sidebar.tsx`

**Fix 6.1:** Verify conversations are cleared on logout
**Fix 6.2:** Verify session is properly checked before loading conversations

---

## Implementation Order:

1. **CRITICAL:** Fix unprotected routes (Step 1) - Immediate security fix
2. **CRITICAL:** Remove debug broadcast (Step 2) - Immediate security fix
3. **HIGH:** Verify userId extraction (Step 3) - Debug and verify
4. **HIGH:** Verify conversation creation (Step 4) - Ensure data integrity
5. **MEDIUM:** Add database constraints (Step 5) - Long-term safety
6. **MEDIUM:** Frontend verification (Step 6) - UX improvement

---

## Testing After Fixes:

1. Login as User A → Create conversation → Logout
2. Login as User B → Should NOT see User A's conversations
3. Login as User A → Should see only User A's conversations
4. Try to access User B's conversation URL directly → Should get 404/403
5. Update username → Should only update for current user
6. Rename conversation → Should only update for current user

---

## Files to Modify:

1. `backend/routes/conversation.js` - Add auth, remove broadcast
2. `backend/utils/auth.js` - Add logging
3. `backend/routes/upload.js` - Verify userId assignment
4. `backend/prisma/schema.prisma` - Make userId required (optional)
5. `frontend/src/components/Sidebar.tsx` - Clear on logout (optional)

