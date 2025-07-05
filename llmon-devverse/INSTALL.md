# 🎮 LLMON DevVerse Installation Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd llmon-devverse
npm install express cors @google/generative-ai socket.io uuid chokidar
```

### 2. Configure Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Gemini API key
# Get your key from: https://makersuite.google.com/app/apikey
nano .env
```

### 3. Launch LLMON
```bash
# Start the DevVerse Reality Engine
npm run dev
```

### 4. Enter the Game Boy Universe
Open your browser to: **http://localhost:3000**

## 🎯 First Mission

1. **Watch the boot sequence** as LLMON initializes
2. **Navigate to Mission Control** using the D-pad
3. **Enter your first mission**:
   ```
   Create a React app for managing my music playlists
   ```
4. **Press the A button** to launch your mission
5. **Watch the agents collaborate** to build your app!

## 🤖 Agent Commands

### Via Terminal
Access the terminal screen and try:
```bash
agent wire Create a FastAPI backend with SQLite
agent suno Write documentation for the music app
agent djw Build a responsive React interface
```

### Via Mission Control
Natural language descriptions work best:
- "Build a full-stack todo app with authentication"
- "Create a Python script for data analysis"
- "Design a React component library"

## 🎮 Controls Reference

### Keyboard Navigation
- **Arrow Keys**: Navigate menus
- **Enter**: Select/Confirm (A button)
- **Escape**: Back/Cancel (B button)
- **Ctrl+Enter**: Quick launch missions

### Mouse/Touch
- **Click menu items** to navigate
- **Click buttons** for actions
- **D-pad clicks** for Game Boy feel

## 🔧 Troubleshooting

### Dependencies Not Installing
If npm install fails, try:
```bash
# Update npm
npm install -g npm@latest

# Clear cache and retry
npm cache clean --force
npm install
```

### Gemini API Issues
- Ensure your API key is valid
- Check your API quota at Google AI Studio
- Verify the key is set in `.env` file

### Port Already in Use
If port 3000 is busy:
```bash
# Edit .env file and change PORT
PORT=3001

# Or start with custom port
PORT=3001 npm run dev
```

### Agent Not Responding
- Check console for error messages
- Verify internet connection
- Restart the server with `npm run dev`

## 🌟 Tips for Best Experience

### Mission Writing
- Be specific about what you want to build
- Mention technologies you prefer
- Include details about features and functionality

### Project Management
- Use descriptive project names
- Organize by type (web, api, python, etc.)
- Regular commits help track progress

### Agent Collaboration
- Let agents work in their expertise areas
- Wire handles backend/infrastructure
- Suno manages content/documentation
- DJwrighTalker creates frontend/UX

## 📁 Project Structure

Your projects are stored in:
```
llmon-devverse/
├── projects/           # Generated projects
├── client/            # Game Boy UI
├── server/            # Backend engine
│   ├── agents/        # LLM agents
│   └── core/          # Core systems
└── package.json       # Dependencies
```

## 🔄 Updates and Maintenance

### Updating LLMON
```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Restart the server
npm run dev
```

### Backup Projects
```bash
# Backup all your projects
cp -r projects/ ~/llmon-backup/
```

### Reset Environment
```bash
# Clear all projects (be careful!)
rm -rf projects/

# Restart fresh
npm run dev
```

## 🎵 Audio Setup

For best Game Boy experience:
- **Enable audio** in your browser
- **Allow autoplay** for sound effects
- **Use headphones** for immersive retro sounds

## 🚀 Advanced Configuration

### Custom Agent Models
Edit `.env` to use different Gemini models:
```bash
WIRE_MODEL=gemini-2.0-flash-exp
SUNO_MODEL=gemini-1.5-pro
DJW_MODEL=gemini-2.0-flash-exp
```

### Development Mode
For debugging and development:
```bash
NODE_ENV=development npm run dev
```

### Production Deployment
For production use:
```bash
NODE_ENV=production npm start
```

---

## 🎮 Ready to Build the Future!

You now have a complete next-generation development environment that combines the nostalgia of retro gaming with the power of modern AI.

**Start your first mission and watch the magic happen!** 🚀

---

*Need help? The LLMON community is here to support your DevVerse journey.*