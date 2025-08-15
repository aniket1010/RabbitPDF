# ChatPDF

A full-stack application that allows users to upload PDF documents and chat with them using AI. Built with Next.js, Express.js, and PostgreSQL.

## 🚀 Features

- **PDF Upload & Processing**: Upload PDF documents and extract text content
- **AI-Powered Chat**: Ask questions about your uploaded PDFs using OpenAI
- **User Authentication**: Google and GitHub OAuth integration with NextAuth
- **Real-time Communication**: WebSocket support for live chat
- **Vector Search**: Pinecone integration for semantic search across documents
- **Database Storage**: PostgreSQL with Prisma ORM for data persistence

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework
- **NextAuth.js** - Authentication
- **Tailwind CSS** - Styling
- **React PDF Viewer** - PDF display
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client

### Backend
- **Express.js** - Node.js web framework
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **OpenAI** - AI/LLM integration
- **Pinecone** - Vector database
- **Socket.io** - WebSocket server
- **Multer** - File upload handling

## 📦 Project Structure

```
chatPDF/
├── frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── lib/          # Utility functions and configurations
│   │   ├── services/     # API client services
│   │   └── types/        # TypeScript type definitions
│   ├── public/           # Static assets
│   └── package.json
├── backend/           # Express.js backend API
│   ├── routes/           # API route handlers
│   ├── services/         # Business logic services
│   ├── middleware/       # Express middleware
│   ├── prisma/          # Database schema and migrations
│   ├── uploads/         # PDF file storage
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- OpenAI API key
- Pinecone account and API key
- Google OAuth credentials (optional)
- GitHub OAuth credentials (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aniket1010/ChatPDF.git
   cd chatPDF
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**

   **Backend** (`backend/.env`):
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/chatpdf_db"
   
   # OpenAI
   OPENAI_API_KEY=your_openai_api_key
   
   # Pinecone
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_ENVIRONMENT=your_pinecone_environment
   PINECONE_INDEX_NAME=your_pinecone_index
   
   # NextAuth (for token verification)
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   
   # OAuth (for user creation)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   
   # Server
   PORT=5000
   HOST=0.0.0.0
   ```

   **Frontend** (`frontend/.env.local`):
   ```env
   # NextAuth
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   
   # OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   
   # API
   NEXT_PUBLIC_API_BASE=http://localhost:5000
   ```

5. **Set up the database**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

6. **Start the development servers**

   **Backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```

   **Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🔧 Development Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start development server with nodemon

## 🔐 Authentication

The application supports multiple authentication methods:

- **Google OAuth** - Sign in with Google account
- **GitHub OAuth** - Sign in with GitHub account

User sessions are managed using NextAuth.js with JWT tokens.

## 📄 API Endpoints

### Upload
- `POST /api/upload` - Upload PDF file

### Chat
- `POST /api/chat` - Send chat message
- `WebSocket /socket.io` - Real-time chat

### Conversations
- `GET /api/conversations` - Get user conversations
- `GET /api/conversations/:id` - Get specific conversation
- `DELETE /api/conversations/:id` - Delete conversation

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT integration
- Pinecone for vector search capabilities
- Next.js team for the amazing framework
- All open source contributors

## 📞 Support

For support, email bhusalaniket100@gmail.com or create an issue in the repository.
