# VIT Smart Assistant 🤖

An AI-powered chatbot designed specifically for VIT Vellore students, providing academic assistance, smart formatting, voice commands, and a modern UI.

## Features

✨ **Core Features:**
- 🤖 AI-powered responses using Groq LLaMA 3.1
- 🎤 Voice input and text-to-speech output
- 💬 Real-time streaming responses
- 📚 Chat history with search and filtering
- 📌 Pin important conversations
- 📄 Export chats to PDF
- 🔄 Regenerate AI responses
- 🎨 Modern glassmorphism UI with animations
- 📱 Responsive design (mobile-friendly)

## Tech Stack

### Frontend
- **React 19** - UI framework
- **Framer Motion** - Smooth animations
- **React Markdown** - Message formatting
- **jsPDF** - PDF export
- **React Highlight Words** - Search highlighting
- **CSS3** - Modern styling with glassmorphism

### Backend
- **Node.js + Express** - REST API server
- **Groq SDK** - LLaMA 3.1 AI integration
- **CORS** - Cross-origin requests
- **dotenv** - Environment configuration

## Project Structure

```
vit-chatbot/
├── frontend/                 # React application
│   ├── public/
│   │   ├── index.html       # Main HTML file
│   │   ├── manifest.json    # PWA manifest
│   │   └── robots.txt       # SEO robots file
│   ├── src/
│   │   ├── App.js           # Main chat component
│   │   ├── App.css          # Styling (glassmorphism)
│   │   ├── index.js         # React entry point
│   │   ├── index.css        # Global styles
│   │   ├── App.test.js      # Unit tests
│   │   ├── setupTests.js    # Jest configuration
│   │   └── reportWebVitals.js # Performance monitoring
│   └── package.json         # Dependencies & scripts
│
├── backend/                  # Express server
│   ├── server.js            # API routes & Groq integration
│   ├── vitData.json         # VIT university data
│   ├── .env                 # API keys (not in git)
│   └── package.json         # Dependencies
│
├── .gitignore               # Git exclusions
└── README.md               # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Groq API key ([Get it here](https://console.groq.com))

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with your Groq API key:
```
GROQ_API_KEY=your_api_key_here
```

4. Start the backend server:
```bash
node server.js
```

The server runs on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app opens at `http://localhost:3000`

## Available Scripts

### Frontend
- `npm start` - Run development server
- `npm test` - Launch test runner
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App (irreversible)

### Backend
- `node server.js` - Start API server

## Key Components

### [App.js](frontend/src/App.js)
Main React component containing:
- Chat message management
- Voice input/output handling
- History persistence (localStorage)
- PDF export functionality
- Real-time streaming responses
- Search and filtering

### [server.js](backend/server.js)
Express backend with:
- `/api/chat` POST endpoint for AI responses
- Groq LLaMA 3.1 integration
- VIT-specific system prompt
- CORS support for frontend communication

### [vitData.json](backend/vitData.json)
VIT university information:
- Exam system (CAT, FAT)
- Grading system
- Popular branches
- Portal information (VTOP)

## Features in Detail

### 💬 Chat Management
- Real-time message streaming
- Auto-save chat history to localStorage
- Search conversations by keywords
- Filter messages with highlighting

### 🎤 Voice Features
- Speech-to-text input
- Text-to-speech output
- Stop speech button
- Multiple language support (en-IN)

### 📚 History Panel
- View all saved conversations
- Search by chat title
- Pin/unpin important chats
- Edit chat titles
- Delete conversations
- Timestamps for each chat

### 📄 Export & Sharing
- Export entire chat to PDF
- Copy individual messages
- Regenerate AI responses
- Formatted markdown output

## VIT-Specific Features

The chatbot is optimized for VIT Vellore students with knowledge of:
- **Exam System**: CAT (Continuous Assessment Test), FAT (Final Assessment Test)
- **GPA**: Relative grading system explanation
- **Portal**: VTOP (VIT Online Portal) guidance
- **Academics**: Popular branches, placements, hostel info

## UI/UX Highlights

- **Glassmorphism Design**: Modern frosted glass effect
- **Gradient Colors**: Cyber-inspired cyan/blue gradients
- **Smooth Animations**: Framer Motion transitions
- **Responsive Layout**: Works on desktop, tablet, mobile
- **Dark Theme**: Easy on the eyes, modern aesthetic
- **Scroll Button**: Auto-appears when scrolled up

## Performance Optimizations

- Lazy streaming of AI responses
- Efficient localStorage caching
- Smooth scroll-to-bottom behavior
- Debounced search filtering
- Optimized re-renders with React hooks

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Environment Variables

### Backend (.env)
```
GROQ_API_KEY=your_groq_api_key
```

## Troubleshooting

### "Speech not supported"
- Use a modern browser with Speech Recognition API
- Try Chrome, Edge, or Safari

### API connection errors
- Ensure backend server is running on port 5000
- Check GROQ_API_KEY in .env file
- Verify CORS is enabled

### Chat history not loading
- Clear browser cache
- Check localStorage isn't disabled
- The app uses localStorage for persistence

## Future Enhancements

- [ ] User authentication
- [ ] Cloud sync across devices
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Conversation sharing
- [ ] Mobile app (React Native)
- [ ] Dark/Light theme toggle

## License

ISC

## Author

Built for VIT Vellore students 🎓