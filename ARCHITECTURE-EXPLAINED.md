# 🏗️ ChatPDF Architecture Explained

## 📋 Overview

This document explains how Redis/BullMQ and WebSockets work in your ChatPDF application.

---

## 🔴 Redis + BullMQ Queue System

### **What is BullMQ?**

BullMQ is a Redis-based queue system for Node.js. It allows you to:
- Process tasks in the background
- Retry failed jobs
- Monitor job progress
- Scale workers horizontally

### **How It Works in Your App**

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Upload PDF
       ▼
┌─────────────────┐
│  Backend API    │
│  (Express)      │
└──────┬──────────┘
       │
       │ 2. Create Job
       ▼
┌─────────────────┐     ┌──────────────┐
│  Redis Queue   │◄────│  BullMQ      │
│  (Job Storage) │     │  (Queue Lib) │
└────────────────┘     └──────────────┘
       │
       │ 3. Worker picks up job
       ▼
┌─────────────────┐
│  Worker Process │
│  (Background)│
└─────────────────┘
       │
       │ 4. Process PDF
       │    - Parse PDF
       │    - Generate embeddings
       │    - Store in Pinecone
       │
       │ 5. Notify API
       ▼
┌─────────────────┐
│  Backend API    │
│  (Express)      │
└─────────────────┘
```

### **Code Flow**

1. **Upload Route** (`backend/routes/upload.js`):
   ```javascript
   // When PDF is uploaded
   if (useQueue) {
     await pdfProcessingQueue.add('process-pdf', {
       filePath,
       conversationId,
       originalName
     });
   }
   ```

2. **Queue Definition** (`backend/queues/pdfProcessingQueue.js`):
   ```javascript
   const pdfProcessingQueue = new Queue('pdf-processing', {
     connection: {
       host: 'redis',
       port: 6379,
       password: process.env.REDIS_PASSWORD
     }
   });
   ```

3. **Worker** (`backend/workers/pdfProcessorWorker.js`):
   ```javascript
   const worker = new Worker('pdf-processing', async (job) => {
     const { filePath, conversationId, originalName } = job.data;
     await processPdf({ filePath, conversationId, originalName });
   }, connection);
   ```

4. **After Processing** (`backend/services/pdfProcessor.js`):
   ```javascript
   // Worker notifies API
   await fetch(`http://127.0.0.1:5000/internal/pdf-complete`, {
     method: 'POST',
     body: JSON.stringify({ conversationId })
   });
   ```

### **Why Use a Queue?**

- **Non-blocking**: API responds immediately, PDF processes in background
- **Reliability**: Failed jobs can be retried
- **Scalability**: Run multiple workers to process more PDFs
- **Monitoring**: Track job status and progress

### **Configuration**

- **Enable Queue**: Set `USE_QUEUE=true` in `.env.production`
- **Redis Connection**: Configured via `REDIS_URL` or `REDIS_PASSWORD`
- **Worker**: Runs as separate Docker container

### **Monitoring**

```bash
# Check queue status
docker-compose exec backend node -e "
  const {pdfProcessingQueue} = require('./queues/pdfProcessingQueue');
  pdfProcessingQueue.getJobs().then(jobs => 
    console.log('Pending:', jobs.filter(j => j.state === 'waiting').length)
  )
"

# Check worker logs
docker-compose logs worker
```

---

## 🔌 WebSocket System (Socket.IO)

### **What is Socket.IO?**

Socket.IO is a library that enables real-time, bidirectional communication between client and server. It uses WebSockets with fallbacks.

### **How It Works in Your App**

```
┌─────────────┐                    ┌─────────────┐
│   Client    │                    │   Client    │
│  (Browser)  │                    │  (Browser)  │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │ 1. Connect via Socket.IO        │
       │    (with JWT auth)               │
       ▼                                  ▼
┌──────────────────────────────────────────────┐
│         Socket.IO Server                      │
│         (on Express server)                   │
│                                               │
│  Rooms:                                       │
│  - user_{userId}                              │
│  - conversation_{conversationId}              │
└──────────────────────────────────────────────┘
       │                                  │
       │ 2. Emit events                   │
       │    - pdf-processing-complete      │
       │    - ai-response-complete         │
       │    - message-error                │
       ▼                                  ▼
┌─────────────┐                    ┌─────────────┐
│   Client    │                    │   Client    │
│  (Browser)  │                    │  (Browser)  │
└─────────────┘                    └─────────────┘
```

### **Code Flow**

1. **Server Setup** (`backend/websocket.js`):
   ```javascript
   // Authentication middleware
   io.use(async (socket, next) => {
     const authResult = await verifyWebSocketAuth(socket);
     if (authResult.authenticated) {
       socket.userId = authResult.userId;
       next();
     }
   });

   // Connection handler
   io.on('connection', (socket) => {
     socket.join(`user_${socket.userId}`);
     
     socket.on('join-conversation', (conversationId) => {
       socket.join(`conversation_${conversationId}`);
     });
   });
   });
   ```

2. **Emitting Events** (`backend/websocket.js`):
   ```javascript
   MessageEvents.PDF_PROCESSING_COMPLETE(conversationId) {
     globalIO.to(`conversation_${conversationId}`).emit(
       'pdf-processing-complete',
       { status: 'completed' }
     );
   }
   ```

3. **Client Connection** (`frontend/src/hooks/useWebSocket.ts`):
   ```typescript
   useEffect(() => {
     const socket = io(apiBase, {
       auth: { token: session?.token }
     });

     socket.on('pdf-processing-complete', (data) => {
       // Update UI
     });

     socket.on('ai-response-complete', (data) => {
       // Show AI response
     });
   }, []);
   ```

### **Events Emitted**

| Event | When | Data |
|-------|------|------|
| `pdf-processing-complete` | PDF processing finished | `{ status: 'completed' }` |
| `message-processing-started` | AI starts processing message | `{ messageId, status: 'processing' }` |
| `ai-thinking` | AI is generating response | `{ messageId, status: 'thinking' }` |
| `ai-response-complete` | AI response ready | `{ messageId, assistantMessage }` |
| `message-error` | Error occurred | `{ messageId, error }` |

### **Rooms**

- **User Room**: `user_{userId}` - For user-specific events
- **Conversation Room**: `conversation_{conversationId}` - For conversation-specific events

### **Authentication**

WebSocket connections are authenticated using JWT tokens passed in the connection handshake.

### **Configuration**

- **CORS**: Configured in `backend/config/cors.js`
- **Nginx**: Must support WebSocket upgrades (see `nginx.conf`)
- **Port**: Same as Express server (5000)

---

## 🔄 Complete Flow Example

### **PDF Upload Flow**

1. **User uploads PDF** → Frontend sends to `/api/upload`
2. **Backend receives** → Creates conversation, adds job to queue
3. **Backend responds** → Returns `{ conversationId }` immediately
4. **Worker picks up job** → Processes PDF in background
5. **Worker completes** → Calls `/internal/pdf-complete`
6. **Backend emits** → `pdf-processing-complete` via WebSocket
7. **Frontend receives** → Updates UI to show PDF is ready

### **Chat Message Flow**

1. **User sends message** → Frontend sends to `/api/chat`
2. **Backend creates message** → Status: `pending`
3. **Backend emits** → `message-processing-started`
4. **Backend processes** → Calls OpenAI API
5. **Backend emits** → `ai-thinking`
6. **Backend gets response** → Saves to database
7. **Backend emits** → `ai-response-complete`
8. **Frontend receives** → Displays AI response

---

## 🐳 Docker Architecture

```
┌─────────────────────────────────────────┐
│         Docker Network                  │
│         (chatpdf-network)               │
│                                         │
│  ┌──────────┐  ┌──────────┐           │
│  │ Frontend │  │ Backend  │           │
│  │ :3000    │  │ :5000    │           │
│  └────┬─────┘  └────┬─────┘           │
│       │             │                  │
│       │             │                  │
│  ┌────▼─────┐  ┌───▼──────┐          │
│  │ Postgres │  │  Redis   │          │
│  │ :5432    │  │ :6379    │          │
│  └──────────┘  └──────────┘          │
│                      │                 │
│                 ┌────▼─────┐          │
│                 │  Worker  │          │
│                 │          │          │
│                 └──────────┘          │
└─────────────────────────────────────────┘
```

### **Services**

1. **frontend**: Next.js app (port 3000)
2. **backend**: Express API + Socket.IO (port 5000)
3. **worker**: BullMQ worker for PDF processing
4. **postgres**: Database (port 5432)
5. **redis**: Queue storage (port 6379)

### **Communication**

- Frontend → Backend: HTTP/WebSocket
- Backend → Worker: Redis Queue
- Worker → Backend: HTTP (internal endpoint)
- All → Database: PostgreSQL connection
- All → Redis: BullMQ connection

---

## 🔧 Troubleshooting

### **Queue Not Working**

1. Check Redis is running: `docker-compose ps redis`
2. Check worker logs: `docker-compose logs worker`
3. Verify `USE_QUEUE=true` in environment
4. Check Redis connection: `docker-compose exec redis redis-cli ping`

### **WebSocket Not Connecting**

1. Check CORS configuration
2. Verify Nginx WebSocket config
3. Check browser console for errors
4. Verify Socket.IO version compatibility
5. Check firewall rules

### **Worker Not Processing**

1. Check worker container is running
2. Verify Redis connection from worker
3. Check job queue: `docker-compose exec backend node -e "..."` (see monitoring section)
4. Review worker logs for errors

---

## 📚 Additional Resources

- [BullMQ Documentation](https://docs.bullmq.io/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Redis Documentation](https://redis.io/docs/)
- Full deployment guide: `DEPLOYMENT-PLAN.md`
- Quick start: `QUICK-START.md`

