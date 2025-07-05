import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ProjectManager {
  constructor() {
    this.projectsDir = path.join(__dirname, '../../projects');
    this.projectsMetaFile = path.join(this.projectsDir, '.projects.json');
    this.projects = new Map();
    this.init();
  }

  async init() {
    try {
      await fs.access(this.projectsDir);
    } catch {
      await fs.mkdir(this.projectsDir, { recursive: true });
    }

    await this.loadProjects();
  }

  async loadProjects() {
    try {
      const data = await fs.readFile(this.projectsMetaFile, 'utf8');
      const projectsArray = JSON.parse(data);
      this.projects = new Map(projectsArray.map(p => [p.id, p]));
    } catch {
      // No projects file exists yet
      this.projects = new Map();
    }
  }

  async saveProjects() {
    const projectsArray = Array.from(this.projects.values());
    await fs.writeFile(this.projectsMetaFile, JSON.stringify(projectsArray, null, 2));
  }

  async createProject(name, type = 'web', description = '') {
    const projectId = uuidv4();
    const projectPath = path.join(this.projectsDir, projectId);
    
    const project = {
      id: projectId,
      name: name,
      type: type,
      description: description,
      path: projectPath,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      status: 'initializing'
    };

    // Create project directory
    await fs.mkdir(projectPath, { recursive: true });

    // Initialize based on project type
    await this.initializeProject(project);

    this.projects.set(projectId, project);
    await this.saveProjects();

    console.log(`🏗️ Created project: ${name} (${type})`);
    return project;
  }

  async initializeProject(project) {
    const templates = {
      web: () => this.createWebProject(project),
      api: () => this.createApiProject(project),
      fullstack: () => this.createFullstackProject(project),
      python: () => this.createPythonProject(project),
      node: () => this.createNodeProject(project)
    };

    const initializer = templates[project.type] || templates.web;
    await initializer();
    
    project.status = 'ready';
    project.lastModified = new Date().toISOString();
  }

  async createWebProject(project) {
    const packageJson = {
      name: project.name.toLowerCase().replace(/\\s+/g, '-'),
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      },
      dependencies: {
        'react': '^18.2.0',
        'react-dom': '^18.2.0'
      },
      devDependencies: {
        '@vitejs/plugin-react': '^4.0.0',
        'vite': '^4.4.0'
      }
    };

    await fs.writeFile(
      path.join(project.path, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    await fs.writeFile(
      path.join(project.path, 'index.html'),
      `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${project.name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`
    );

    await fs.mkdir(path.join(project.path, 'src'), { recursive: true });
    
    await fs.writeFile(
      path.join(project.path, 'src/main.jsx'),
      `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`
    );

    await fs.writeFile(
      path.join(project.path, 'src/App.jsx'),
      `import React from 'react'

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎮 ${project.name}</h1>
      <p>Built with LLMON DevVerse Reality Engine</p>
      <p>${project.description}</p>
    </div>
  )
}

export default App`
    );
  }

  async listProjects() {
    return Array.from(this.projects.values());
  }

  async getProject(projectId) {
    return this.projects.get(projectId);
  }
}