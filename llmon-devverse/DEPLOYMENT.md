# 🚀 LLMON DevVerse Deployment Guide

## 📦 Deployment Options Overview

LLMON DevVerse can be deployed in multiple ways to suit different needs:

1. **🖥️ Desktop Application** - Native Windows/Mac/Linux apps using Electron
2. **🐳 Docker Container** - Containerized deployment for any server
3. **☁️ Cloud Platforms** - Vercel, Railway, Heroku, AWS, etc.
4. **📱 Portable Executable** - Self-contained executables
5. **🌐 Traditional Web Server** - Standard Node.js deployment

---

## 🖥️ Desktop Application (Electron)

### Prerequisites
```bash
npm install electron electron-builder cross-env --save-dev
```

### Build Commands
```bash
# Build for all platforms
npm run build:electron

# Build for current platform only
npm run pack

# Development mode
npm run electron:dev
```

### Distribution Files
After building, find installers in `dist/`:
- **Windows**: `LLMON DevVerse Setup.exe`
- **macOS**: `LLMON DevVerse.dmg`
- **Linux**: `LLMON DevVerse.AppImage`

### Features
- Native desktop integration
- Menu bar and keyboard shortcuts
- Auto-updater ready
- Offline-capable (with valid API key)
- System tray integration

---

## 🐳 Docker Deployment

### Quick Start
```bash
# Build and run
docker build -t llmon-devverse .
docker run -p 3000:3000 -e GEMINI_API_KEY=your-key llmon-devverse
```

### Docker Compose (Recommended)
```bash
# Copy environment variables
cp .env.example .env
# Edit .env with your API key

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Docker Setup
```bash
# Create production environment
echo "GEMINI_API_KEY=your-actual-key" > .env.production

# Build production image
docker build --build-arg NODE_ENV=production -t llmon-devverse:prod .

# Run with production settings
docker run -d \
  --name llmon-prod \
  -p 80:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  llmon-devverse:prod
```

### Kubernetes Deployment
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: llmon-devverse
spec:
  replicas: 3
  selector:
    matchLabels:
      app: llmon-devverse
  template:
    metadata:
      labels:
        app: llmon-devverse
    spec:
      containers:
      - name: llmon
        image: llmon-devverse:latest
        ports:
        - containerPort: 3000
        env:
        - name: GEMINI_API_KEY
          valueFrom:
            secretKeyRef:
              name: llmon-secrets
              key: gemini-api-key
---
apiVersion: v1
kind: Service
metadata:
  name: llmon-service
spec:
  selector:
    app: llmon-devverse
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

---

## ☁️ Cloud Platform Deployments

### Vercel (Recommended for Web)

#### One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/llmon-devverse)

#### Manual Deploy
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Set environment variables
vercel env add GEMINI_API_KEY
```

### Railway

#### One-Click Deploy
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/your-repo/llmon-devverse)

#### Manual Deploy
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy
railway up

# Set environment variables
railway variables set GEMINI_API_KEY=your-key
```

### Heroku
```bash
# Create Heroku app
heroku create your-llmon-app

# Set environment variables
heroku config:set GEMINI_API_KEY=your-key

# Deploy
git push heroku main

# Open app
heroku open
```

### DigitalOcean App Platform
```yaml
# .do/app.yaml
name: llmon-devverse
services:
- name: web
  source_dir: /
  github:
    repo: your-username/llmon-devverse
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: GEMINI_API_KEY
    value: your-key
    type: SECRET
  http_port: 3000
```

---

## 📱 Portable Executables

### Build Portable Apps
```bash
# Install pkg globally
npm install -g pkg

# Build for all platforms
pkg server/index.js --targets node18-linux-x64,node18-macos-x64,node18-win-x64 --out-path dist/portable

# Build for specific platform
pkg server/index.js --targets node18-win-x64 --out-path dist/portable
```

### Distribution
Executables are created in `dist/portable/`:
- **Linux**: `index-linux`
- **macOS**: `index-macos`
- **Windows**: `index-win.exe`

### Usage
```bash
# Linux/Mac
chmod +x index-linux
GEMINI_API_KEY=your-key ./index-linux

# Windows
set GEMINI_API_KEY=your-key
index-win.exe
```

---

## 🌐 Traditional Web Server

### VPS/Dedicated Server Deployment

#### Using PM2 (Recommended)
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server/index.js --name llmon-devverse

# Set to start on boot
pm2 startup
pm2 save

# Monitor application
pm2 monit

# View logs
pm2 logs llmon-devverse
```

#### Using systemd (Linux)
```ini
# /etc/systemd/system/llmon-devverse.service
[Unit]
Description=LLMON DevVerse Reality Engine
After=network.target

[Service]
Type=simple
User=llmon
WorkingDirectory=/home/llmon/llmon-devverse
Environment=NODE_ENV=production
Environment=GEMINI_API_KEY=your-key
ExecStart=/usr/bin/node server/index.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable llmon-devverse
sudo systemctl start llmon-devverse
sudo systemctl status llmon-devverse
```

### Nginx Reverse Proxy
```nginx
# /etc/nginx/sites-available/llmon-devverse
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support for real-time features
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🔧 Environment Configuration

### Required Environment Variables
```bash
# Essential
GEMINI_API_KEY=your-gemini-api-key

# Optional
PORT=3000
NODE_ENV=production
PROJECT_DIR=./projects

# Agent Configuration
WIRE_MODEL=gemini-2.0-flash-exp
SUNO_MODEL=gemini-2.0-flash-exp
DJW_MODEL=gemini-2.0-flash-exp

# Features
ENABLE_SOUND_EFFECTS=true
ENABLE_AUTO_SAVE=true
ENABLE_GIT_INTEGRATION=true
```

### Security Configuration
```bash
# Production Security
NODE_ENV=production
SECURE_COOKIES=true
SESSION_SECRET=your-random-secret
RATE_LIMIT_ENABLED=true
CORS_ORIGIN=https://your-domain.com
```

---

## 🌟 Performance Optimization

### Production Optimizations
```bash
# Environment variables for production
NODE_ENV=production
NODE_OPTIONS="--max-old-space-size=4096"
UV_THREADPOOL_SIZE=128

# PM2 cluster mode
pm2 start server/index.js -i max --name llmon-cluster
```

### Load Balancing
```yaml
# docker-compose.yml with load balancer
version: '3.8'
services:
  llmon-app:
    build: .
    deploy:
      replicas: 3
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - llmon-app
```

---

## 📊 Monitoring and Logging

### Health Checks
```bash
# Built-in health check endpoint
curl http://localhost:3000/health

# Docker health check
docker run --health-cmd="curl -f http://localhost:3000 || exit 1" llmon-devverse
```

### Logging Setup
```javascript
// Add to server/index.js for production logging
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

---

## 🔐 Security Best Practices

### Production Security Checklist
- ✅ Use HTTPS in production
- ✅ Set secure environment variables
- ✅ Enable CORS with specific origins
- ✅ Use rate limiting
- ✅ Regular security updates
- ✅ Monitor API usage
- ✅ Backup project data
- ✅ Use secrets management

### Firewall Configuration
```bash
# UFW configuration for Ubuntu
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm start
```

#### Memory Issues
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

#### Permission Errors (Docker)
```bash
# Fix file permissions
sudo chown -R $USER:$USER llmon-devverse/
```

#### API Key Issues
```bash
# Verify API key is set
echo $GEMINI_API_KEY

# Test API key
curl -H "Authorization: Bearer $GEMINI_API_KEY" https://generativelanguage.googleapis.com/v1/models
```

---

## 📞 Support and Updates

### Getting Help
- 📖 Documentation: Check README.md and INSTALL.md
- 🐛 Issues: Report on GitHub Issues
- 💬 Community: Join Discord/Slack
- 📧 Support: Contact support team

### Updates and Maintenance
```bash
# Update LLMON
git pull origin main
npm install
npm restart

# Update dependencies
npm update
npm audit fix
```

---

## 🎉 Success! 

Your LLMON DevVerse Reality Engine is now deployed and ready to revolutionize development workflows!

Access your deployment and start commanding AI agents to build the future! 🎮🚀

---

*Built with LLMON DevVerse Reality Engine v1.0* 
*Where retro gaming meets next-generation development*