# 🎓 StudySync - Your All-in-One Studyverse

<div align="center">

![StudySync Logo](https://img.shields.io/badge/StudySync-Your%20Studyverse-blue?style=for-the-badge)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.1-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)


**A production-grade study productivity platform combining focus tools, planning, real-time collaboration, and AI-powered mentorship.**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Tech Stack](#-tech-stack) • [API Docs](#-api-documentation)

</div>

---

## 📖 Overview

StudySync is a comprehensive web application designed to revolutionize how students study, plan, and collaborate. Built with modern technologies and a stunning glassmorphic UI, it combines the best aspects of productivity tools into one seamless experience.

### Why StudySync?

- 🎯 **Focus Better** - Pomodoro timer with lofi music integration
- 📅 **Plan Smarter** - Kanban-style task management with analytics
- 👥 **Collaborate Seamlessly** - Real-time study rooms with WebSocket chat
- 🤖 **Learn Faster** - AI-powered study mentor using GPT-5
- 📊 **Track Progress** - Comprehensive analytics and insights
- 🎨 **Beautiful UI** - Glassmorphic design with deep blue/black theme

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with 7-day session tokens
- Secure password hashing with bcrypt
- Role-based access control (Student/Admin)
- Protected routes with automatic token refresh

### 📊 Dashboard
- Personalized welcome with real-time statistics
- **Focus Hours Tracker** - Monitor total study time
- **Task Completion Metrics** - View completed vs pending tasks
- **Weekly Analytics** - Interactive Recharts visualization
- **Notes Counter** - Track shared study materials

### 🎯 Focus Mode
- **Pomodoro Timer** with circular progress animation
- Multiple duration presets (15, 25, 45, 60 minutes)
- **YouTube Lofi Music Player** - Embedded relaxing beats
- Task tagging for session organization
- Automatic session saving to database
- Play/Pause controls synced with timer

### 📅 Study Planner
- **Kanban-style Task Board** - Visual task management
- Priority levels (Low, Medium, High) with color coding
- Due date tracking with calendar integration
- **Real-time CRUD** operations
- Mark tasks as complete/incomplete
- Task analytics dashboard

### 📚 Notes Hub
- **PDF/Document Upload** - Local file storage
- One-click file downloads
- Subject categorization
- File size tracking and metadata
- Search and filter capabilities

### 👥 Collaboration Rooms
- **Create Study Rooms** with auto-generated 6-digit codes
- **Join Rooms** via code input
- **Real-time WebSocket Chat** - Zero-latency messaging
- Member tracking and presence indicators
- Persistent message history
- Multiple room support

### 🤖 AI Study Mentor
- **GPT-5 Powered Assistant** via Emergent LLM key
- Context-aware study advice
- Motivation and time management tips
- Academic topic assistance
- Conversation history storage
- Starter prompt suggestions

### ⚙️ Settings
- Profile management
- Study preferences configuration
- Theme customization options

---

## 🎨 Design Philosophy

StudySync features a **glassmorphic design system** with:

- **Color Palette:**
  - Primary: Deep Blue (#1e40af)
  - Secondary: Slate Black (#0f172a)
  - Accents: Blue to Cyan gradients (#3b82f6 → #06b6d4)
  
- **Visual Effects:**
  - Backdrop blur (12-24px)
  - Layered z-index hierarchy
  - Smooth transitions (200ms)
  - Hover micro-interactions
  
- **Typography:**
  - Font Family: Inter
  - Heading sizes: 4xl to 7xl
  - Responsive scaling

---

## 🚀 Tech Stack

### Frontend
```
React 19.0.0          - UI framework
React Router 7.5.1    - Client-side routing
Tailwind CSS 3.4.18   - Utility-first CSS
Framer Motion 12.x    - Animation library
Recharts 3.3.0        - Data visualization
Lucide React 0.507    - Icon library
Sonner 2.0.7          - Toast notifications
Axios 1.8.4           - HTTP client
React YouTube 10.1.0  - YouTube player integration
Shadcn/UI             - Component library
```

### Backend
```
FastAPI 0.110.1           - Modern Python web framework
Motor 3.3.1               - Async MongoDB driver
PyJWT 2.10.1              - JWT authentication
Passlib 1.7.4             - Password hashing
Python-Multipart 0.0.9    - File upload handling
Websockets 15.0.1         - Real-time communication
Emergentintegrations      - LLM integration library
```

### Database & Storage
```
MongoDB         - NoSQL database
GridFS          - File storage
Local Filesystem - PDF/document storage
```

### AI Integration
```
OpenAI GPT-5         - AI study mentor
Emergent LLM Key     - Universal API access
```

---

## 📦 Installation

### Prerequisites
- Node.js 16+ and Yarn
- Python 3.11+
- MongoDB (running on localhost:27017)

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/studysync.git
cd studysync
```

2. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration
```

3. **Frontend Setup**
```bash
cd frontend
yarn install

# Configure environment variables
cp .env.example .env
# Edit .env with your backend URL
```

4. **Start Development Servers**

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
yarn start
```

5. **Access the Application**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8001`
- API Docs: `http://localhost:8001/docs`

---

## 🔧 Configuration

### Backend Environment Variables (.env)
```env
# MongoDB Configuration
MONGO_URL=mongodb://localhost:27017
DB_NAME=studysync_db

# JWT Configuration
JWT_SECRET=your_super_secret_key_change_in_production
JWT_ALGORITHM=HS256

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com

# AI Integration (Emergent LLM Key)
EMERGENT_LLM_KEY=your_emergent_llm_key
```

### Frontend Environment Variables (.env)
```env
# Backend API URL
REACT_APP_BACKEND_URL=http://localhost:8001

# WebSocket Configuration (auto-derived from BACKEND_URL)
# Development
WDS_SOCKET_PORT=443

# Feature Flags
REACT_APP_ENABLE_VISUAL_EDITS=false
ENABLE_HEALTH_CHECK=false
```

---

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}

Response: 200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Focus Session Endpoints

#### Create Focus Session
```http
POST /api/focus/sessions
Authorization: Bearer {token}
Content-Type: application/json

{
  "duration": 25,
  "task_tag": "Mathematics Study"
}
```

#### Get User Sessions
```http
GET /api/focus/sessions
Authorization: Bearer {token}
```

#### Get Focus Analytics
```http
GET /api/focus/analytics
Authorization: Bearer {token}

Response: 200 OK
{
  "weekly_data": {
    "Mon": 2.5,
    "Tue": 1.0,
    "Wed": 3.5,
    ...
  },
  "total_hours": 12.5,
  "total_sessions": 15
}
```

### Task Management Endpoints

#### Create Task
```http
POST /api/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Complete Physics Assignment",
  "subject": "Physics",
  "due_date": "2025-01-15",
  "priority": "high"
}
```

#### Get All Tasks
```http
GET /api/tasks
Authorization: Bearer {token}
```

#### Update Task
```http
PATCH /api/tasks/{task_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "completed": true
}
```

#### Delete Task
```http
DELETE /api/tasks/{task_id}
Authorization: Bearer {token}
```

### Notes Endpoints

#### Upload Note
```http
POST /api/notes/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [PDF/Document file]
title: "Linear Algebra Notes"
subject: "Mathematics"
```

#### Get All Notes
```http
GET /api/notes
Authorization: Bearer {token}
```

#### Download Note
```http
GET /api/notes/{note_id}/download
Authorization: Bearer {token}
```

### Study Room Endpoints

#### Create Room
```http
POST /api/rooms
Authorization: Bearer {token}
Content-Type: application/json

{
  "topic": "Calculus Study Group"
}

Response: 200 OK
{
  "id": "uuid",
  "room_code": "A3B7C9",
  "topic": "Calculus Study Group",
  "creator_id": "uuid",
  "members": ["uuid"]
}
```

#### Join Room
```http
POST /api/rooms/join
Authorization: Bearer {token}
Content-Type: application/json

{
  "room_code": "A3B7C9"
}
```

#### WebSocket Connection
```javascript
const ws = new WebSocket('ws://localhost:8001/ws/room/{room_id}');

// Send message
ws.send(JSON.stringify({
  user_id: "uuid",
  user_name: "John Doe",
  message: "Hello everyone!"
}));

// Receive messages
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log(message);
};
```

### AI Mentor Endpoints

#### Chat with AI Mentor
```http
POST /api/mentor/chat
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "How can I improve my study habits?"
}

Response: 200 OK
{
  "response": "Here are some effective strategies to improve your study habits..."
}
```

#### Get Chat History
```http
GET /api/mentor/history
Authorization: Bearer {token}
```

---

## 🗂️ Project Structure

```
studysync/
├── backend/
│   ├── server.py              # Main FastAPI application
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment variables
│   └── uploads/               # File storage directory
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/            # Shadcn UI components
│   │   │   └── Sidebar.js     # Navigation sidebar
│   │   ├── contexts/
│   │   │   └── AuthContext.js # Authentication state
│   │   ├── pages/
│   │   │   ├── Landing.js     # Landing page
│   │   │   ├── Login.js       # Login page
│   │   │   ├── Register.js    # Registration page
│   │   │   ├── Dashboard.js   # Main dashboard
│   │   │   ├── Focus.js       # Pomodoro timer
│   │   │   ├── Planner.js     # Task management
│   │   │   ├── Notes.js       # File management
│   │   │   ├── Collab.js      # Study rooms
│   │   │   ├── AIMentor.js    # AI chat
│   │   │   └── Settings.js    # User settings
│   │   ├── App.js             # Main app component
│   │   ├── App.css            # Global styles
│   │   └── index.js           # Entry point
│   ├── package.json           # Node dependencies
│   ├── tailwind.config.js     # Tailwind configuration
│   └── .env                   # Environment variables
│
├── README.md
└── LICENSE
```

---

## 🗄️ Database Schema

### Users Collection
```javascript
{
  id: String (UUID),
  name: String,
  email: String (unique),
  password_hash: String,
  role: String ("student" | "admin"),
  created_at: DateTime,
  last_active: DateTime
}
```

### Focus Sessions Collection
```javascript
{
  id: String (UUID),
  user_id: String,
  duration: Number (minutes),
  task_tag: String,
  date: DateTime,
  completed: Boolean
}
```

### Tasks Collection
```javascript
{
  id: String (UUID),
  user_id: String,
  title: String,
  subject: String,
  due_date: String,
  priority: String ("low" | "medium" | "high"),
  completed: Boolean,
  created_at: DateTime
}
```

### Notes Collection
```javascript
{
  id: String (UUID),
  user_id: String,
  title: String,
  file_path: String,
  subject: String,
  uploaded_at: DateTime,
  file_size: Number
}
```

### Study Rooms Collection
```javascript
{
  id: String (UUID),
  room_code: String (6 chars),
  topic: String,
  creator_id: String,
  members: Array[String],
  created_at: DateTime
}
```

### Chat Messages Collection
```javascript
{
  id: String (UUID),
  room_id: String,
  user_id: String,
  user_name: String,
  message: String,
  timestamp: DateTime
}
```

### Mentor Chats Collection
```javascript
{
  user_id: String,
  user_message: String,
  ai_response: String,
  timestamp: DateTime
}
```

---

## 🔒 Security Best Practices

### Implemented Security Measures

1. **Password Security**
   - Bcrypt hashing with salt rounds
   - Minimum password length enforcement
   - No plain-text password storage

2. **JWT Authentication**
   - HS256 algorithm
   - 7-day token expiration
   - Secure token storage (httpOnly recommended for production)

3. **CORS Configuration**
   - Configurable allowed origins
   - Credentials support
   - Method and header restrictions

4. **Input Validation**
   - Pydantic models for request validation
   - Email format validation
   - File type restrictions

5. **Rate Limiting** (Recommended for Production)
   - Implement Redis-based rate limiting
   - Per-endpoint limits
   - User-based throttling

---

## 🧪 Testing

### Running Tests

**Backend Tests:**
```bash
cd backend
pytest tests/ -v
```

**Frontend Tests:**
```bash
cd frontend
yarn test
```

### Test Coverage
- Authentication flows
- CRUD operations
- WebSocket connections
- File uploads/downloads
- API error handling

---

## 🚀 Deployment

### Production Checklist

- [ ] Change JWT_SECRET to a strong random value
- [ ] Set up MongoDB Atlas or production database
- [ ] Configure CORS for production domain
- [ ] Enable HTTPS/SSL
- [ ] Set up environment-specific configs
- [ ] Implement rate limiting
- [ ] Add logging and monitoring
- [ ] Set up backup strategies
- [ ] Configure CDN for static assets
- [ ] Enable compression middleware

### Deployment Options

**Option 1: Docker**
```dockerfile
# Example Dockerfile structure
FROM python:3.11 AS backend
# Backend setup...

FROM node:18 AS frontend
# Frontend build...
```

**Option 2: Traditional Hosting**
- Backend: AWS EC2, DigitalOcean, Heroku
- Frontend: Vercel, Netlify, AWS S3 + CloudFront
- Database: MongoDB Atlas

**Option 3: Kubernetes**
- Container orchestration
- Auto-scaling capabilities
- Load balancing

---

## 📊 Performance Optimization

### Current Optimizations

1. **Frontend**
   - Code splitting with React.lazy
   - Image optimization
   - Lazy loading for components
   - Memoization for expensive computations

2. **Backend**
   - Async/await for I/O operations
   - Database indexing
   - Connection pooling
   - Response caching strategies

3. **Database**
   - Indexed fields: user_id, email, room_code
   - Projection to limit returned fields
   - Compound indexes for complex queries

---

## 🐛 Known Issues & Roadmap

### Known Issues
- WebSocket reconnection logic needs improvement
- Large file uploads (>10MB) may timeout
- Mobile responsive design needs refinement on tablets

### Roadmap

**v2.0**
- [ ] Mobile app (React Native)
- [ ] Offline mode with sync
- [ ] Advanced analytics dashboard
- [ ] Study streak tracking
- [ ] Social features (friend system)

**v2.1**
- [ ] Video call integration for study rooms
- [ ] Whiteboard collaboration
- [ ] Flashcard system
- [ ] Study goal templates

**v3.0**
- [ ] AI-powered study schedule optimization
- [ ] Integration with learning platforms (Coursera, Udemy)
- [ ] Gamification elements
- [ ] Team/class management features

---

## 📄 License (self licensed)
```
Copyright (c) 2025 StudySync

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgments
- **Emergent** - For setting everything up and making it work
- **FastAPI** - For the amazing Python web framework
- **React Team** - For the powerful UI library
- **Shadcn** - For the beautiful component library
- **OpenAI** - For GPT-5 integration
- **Emergent Labs** - For the universal LLM key solution
- **Lofi Girl** - For the study music inspiration

---


<div align="center">



[Website](https://learnlink-62.preview.emergentagent.com/)

</div>
