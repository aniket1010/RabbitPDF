# RabbitPDF 🐰📄

A full-stack application that allows users to upload PDF documents and chat with them using AI. Built with Next.js, Express.js, PostgreSQL, and Docker.

## 🚀 Features

- **PDF Upload & Processing**: Upload PDF documents and extract text content
- **AI-Powered Chat**: Ask questions about your uploaded PDFs using OpenAI
- **User Authentication**: Google, GitHub OAuth, and email/password authentication
- **Real-time Communication**: WebSocket support for live chat updates
- **Vector Search**: Pinecone integration for semantic search across documents
- **Queue Processing**: BullMQ with Redis for background PDF processing
- **Database Storage**: PostgreSQL with Prisma ORM for data persistence

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **Better Auth** - Authentication library
- **Tailwind CSS** - Styling
- **React PDF Viewer** - PDF display
- **Socket.io Client** - Real-time communication
- **Framer Motion** - Animations

### Backend
- **Express.js** - Node.js web framework
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **Redis** - Queue and caching
- **BullMQ** - Job queue for PDF processing
- **OpenAI** - AI/LLM integration
- **Pinecone** - Vector database
- **Socket.io** - WebSocket server

## 📦 Project Structure

```
chatPDF/
├── frontend/              # Next.js frontend application
│   ├── src/
│   │   ├── app/          # Next.js App Router pages
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions and configurations
│   │   └── services/     # API client services
│   ├── prisma/           # Frontend Prisma schema (for auth)
│   └── package.json
├── backend/               # Express.js backend API
│   ├── routes/           # API route handlers
│   ├── services/         # Business logic services
│   ├── workers/          # Background job workers
│   ├── queues/           # BullMQ queue definitions
│   ├── prisma/           # Backend Prisma schema
│   └── package.json
├── docker-compose.local.yml      # Local development Docker config
├── docker-compose.production.yml # Production Docker config
├── nginx.conf                    # Production Nginx configuration
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Docker Desktop** (recommended) OR Node.js 18+
- **OpenAI API key** - [Get one here](https://platform.openai.com/api-keys)
- **Pinecone account** - [Sign up here](https://www.pinecone.io/)
- **Google OAuth credentials** (optional) - [Google Cloud Console](https://console.cloud.google.com/)
- **GitHub OAuth credentials** (optional) - [GitHub Developer Settings](https://github.com/settings/developers)

---

## 🐳 Quick Start with Docker (Recommended)

### 1. Clone the repository
```bash
git clone https://github.com/aniket1010/ChatPDF.git
cd chatPDF
```

### 2. Create environment file
Create a `.env` file in the root directory:

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
POSTGRES_USER=chatpdf_user
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=chatpdf_local

# ============================================
# REDIS CONFIGURATION
# ============================================
REDIS_PASSWORD=your_redis_password_here

# ============================================
# OPENAI CONFIGURATION (REQUIRED)
# ============================================
OPENAI_API_KEY=sk-your-openai-api-key

# ============================================
# PINECONE CONFIGURATION (REQUIRED)
# ============================================
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=chatpdf-local

# ============================================
# AUTHENTICATION
# ============================================
BETTER_AUTH_SECRET=your-secret-key-at-least-32-characters-long
NEXTAUTH_URL=http://localhost:3000

# ============================================
# APPLICATION URLs
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE=http://localhost:5000

# ============================================
# OAUTH PROVIDERS (OPTIONAL)
# ============================================
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# ============================================
# EMAIL CONFIGURATION (OPTIONAL - for email verification)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM=your-email@gmail.com
```

### 3. Create Pinecone Index
Before starting the app, create a Pinecone index:
1. Go to [Pinecone Console](https://app.pinecone.io/)
2. Create a new index with:
   - **Name**: `chatpdf-local` (or whatever you set in `PINECONE_INDEX_NAME`)
   - **Dimensions**: `1536`
   - **Metric**: `cosine`
   - **Spec**: Serverless (AWS, us-east-1)

### 4. Start the application
```bash
docker-compose -f docker-compose.local.yml up -d
```

### 5. Run database migrations
```bash
docker exec chatpdf-frontend npx prisma migrate deploy
```

### 6. Access the application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

---

## 💻 Manual Setup (Without Docker)

### 1. Install dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Set up PostgreSQL and Redis
Install and start PostgreSQL and Redis locally, then update your `.env` files accordingly.

### 3. Run database migrations
```bash
# Backend
cd backend
npx prisma migrate dev

# Frontend
cd ../frontend
npx prisma migrate dev
```

### 4. Start the servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Worker
cd backend
npm run worker

# Terminal 3 - Frontend
cd frontend
npm run dev
```

---

## 🔧 Docker Commands

```bash
# Start all services
docker-compose -f docker-compose.local.yml up -d

# View logs
docker-compose -f docker-compose.local.yml logs -f

# Stop all services
docker-compose -f docker-compose.local.yml down

# Rebuild after code changes
docker-compose -f docker-compose.local.yml up -d --build

# View specific service logs
docker logs chatpdf-frontend
docker logs chatpdf-backend
docker logs chatpdf-worker
```

---

## 🔐 Setting Up OAuth

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth Client ID**
5. Set **Authorized redirect URI**: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to your `.env`

### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** → **New OAuth App**
3. Set **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and generate Client Secret to your `.env`

---

## 📄 API Endpoints

### Upload
- `POST /upload` - Upload PDF file

### Chat
- `POST /chat` - Send chat message
- `WebSocket /socket.io` - Real-time chat updates

### Conversations
- `GET /conversation` - Get user conversations
- `GET /conversation/:id` - Get specific conversation
- `DELETE /conversation/:id` - Delete conversation
- `PUT /conversation/:id/rename` - Rename conversation

### User
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile

---

## 🚀 Production Deployment

For production deployment on AWS EC2:

1. Use `docker-compose.production.yml`
2. Set up proper domain and SSL certificates
3. Configure `nginx.conf` for your domain
4. Update OAuth redirect URLs to your production domain
5. Use strong, unique passwords for all services

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

For support, email bhusalaniket100@gmail.com or create an issue in the repository.
