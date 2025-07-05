import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { AgentCoordinator } from './core/AgentCoordinator.js';
import { ExecutionEngine } from './core/ExecutionEngine.js';
import { ProjectManager } from './core/ProjectManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LLMonServer {
  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    this.agentCoordinator = new AgentCoordinator();
    this.executionEngine = new ExecutionEngine();
    this.projectManager = new ProjectManager();
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocketHandlers();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, '../client')));
  }

  setupRoutes() {
    // API Routes
    this.app.post('/api/chat', async (req, res) => {
      try {
        const { message, projectId } = req.body;
        const response = await this.agentCoordinator.processMessage(message, projectId);
        res.json(response);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/projects', async (req, res) => {
      try {
        const projects = await this.projectManager.listProjects();
        res.json(projects);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/projects', async (req, res) => {
      try {
        const { name, type, description } = req.body;
        const project = await this.projectManager.createProject(name, type, description);
        res.json(project);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/agents', (req, res) => {
      const agents = this.agentCoordinator.getAgentStatus();
      res.json(agents);
    });

    // Serve Game Boy UI
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/index.html'));
    });
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('🎮 Game Boy UI Connected:', socket.id);
      
      socket.on('execute_command', async (data) => {
        try {
          const result = await this.executionEngine.execute(data.command, data.projectId);
          socket.emit('execution_result', result);
        } catch (error) {
          socket.emit('execution_error', { error: error.message });
        }
      });

      socket.on('agent_task', async (data) => {
        try {
          const result = await this.agentCoordinator.delegateTask(data.agent, data.task, data.projectId);
          socket.emit('agent_response', result);
        } catch (error) {
          socket.emit('agent_error', { error: error.message });
        }
      });

      socket.on('disconnect', () => {
        console.log('🎮 Game Boy UI Disconnected:', socket.id);
      });
    });
  }

  start(port = 3000) {
    this.server.listen(port, () => {
      console.log(`
🎮 LLMON: DevVerse Reality Engine v1.0
=======================================
🚀 Server running on: http://localhost:${port}
🧠 Agent Coordinator: ACTIVE
⚙️  Execution Engine: READY
🎯 Project Manager: INITIALIZED

Ready to build the future!
      `);
    });
  }
}

const server = new LLMonServer();
server.start();