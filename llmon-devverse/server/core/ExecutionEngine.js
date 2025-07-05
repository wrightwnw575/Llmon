import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ExecutionEngine {
  constructor() {
    this.projectsDir = path.join(__dirname, '../../projects');
    this.activeProcesses = new Map();
    this.commandHistory = [];
    this.setupProjectsDirectory();
  }

  async setupProjectsDirectory() {
    try {
      await fs.access(this.projectsDir);
    } catch {
      await fs.mkdir(this.projectsDir, { recursive: true });
      console.log('📁 Created projects directory:', this.projectsDir);
    }
  }

  async execute(command, projectId = null, options = {}) {
    const execution = {
      id: Date.now().toString(),
      command: command,
      projectId: projectId,
      timestamp: new Date().toISOString(),
      status: 'running'
    };

    this.commandHistory.push(execution);
    console.log(`⚙️ Executing: ${command}`);

    try {
      let result;
      
      if (command.type === 'file_operation') {
        result = await this.handleFileOperation(command, projectId);
      } else if (command.type === 'git_operation') {
        result = await this.handleGitOperation(command, projectId);
      } else if (command.type === 'package_manager') {
        result = await this.handlePackageManager(command, projectId);
      } else if (command.type === 'server_operation') {
        result = await this.handleServerOperation(command, projectId);
      } else if (typeof command === 'string') {
        result = await this.executeShellCommand(command, projectId);
      } else {
        result = await this.executeStructuredCommand(command, projectId);
      }

      execution.status = 'completed';
      execution.result = result;
      execution.endTime = new Date().toISOString();
      
      return execution;
    } catch (error) {
      execution.status = 'failed';
      execution.error = error.message;
      execution.endTime = new Date().toISOString();
      throw error;
    }
  }

  async executeShellCommand(command, projectId) {
    const workingDir = projectId ? path.join(this.projectsDir, projectId) : this.projectsDir;
    
    try {
      const { stdout, stderr } = await execAsync(command, { 
        cwd: workingDir,
        timeout: 30000,
        maxBuffer: 1024 * 1024 // 1MB buffer
      });
      
      return {
        type: 'shell',
        stdout: stdout,
        stderr: stderr,
        success: true
      };
    } catch (error) {
      return {
        type: 'shell',
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
        success: false,
        error: error.message
      };
    }
  }

  async executeStructuredCommand(command, projectId) {
    switch (command.action) {
      case 'create_file':
        return await this.createFile(command.path, command.content, projectId);
      case 'read_file':
        return await this.readFile(command.path, projectId);
      case 'update_file':
        return await this.updateFile(command.path, command.content, projectId);
      case 'delete_file':
        return await this.deleteFile(command.path, projectId);
      case 'create_directory':
        return await this.createDirectory(command.path, projectId);
      case 'list_directory':
        return await this.listDirectory(command.path, projectId);
      default:
        throw new Error(`Unknown command action: ${command.action}`);
    }
  }

  async handleFileOperation(command, projectId) {
    const projectPath = projectId ? path.join(this.projectsDir, projectId) : this.projectsDir;
    const fullPath = path.join(projectPath, command.path || '');

    switch (command.operation) {
      case 'create':
        await fs.writeFile(fullPath, command.content || '', 'utf8');
        return { success: true, message: `Created file: ${command.path}` };
      
      case 'read':
        const content = await fs.readFile(fullPath, 'utf8');
        return { success: true, content: content };
      
      case 'update':
        await fs.writeFile(fullPath, command.content, 'utf8');
        return { success: true, message: `Updated file: ${command.path}` };
      
      case 'delete':
        await fs.unlink(fullPath);
        return { success: true, message: `Deleted file: ${command.path}` };
      
      case 'mkdir':
        await fs.mkdir(fullPath, { recursive: true });
        return { success: true, message: `Created directory: ${command.path}` };
      
      default:
        throw new Error(`Unknown file operation: ${command.operation}`);
    }
  }

  async handleGitOperation(command, projectId) {
    const projectPath = path.join(this.projectsDir, projectId);
    
    const gitCommands = {
      'init': 'git init',
      'add': `git add ${command.files || '.'}`,
      'commit': `git commit -m "${command.message || 'Auto-commit by LLMON'}"`,
      'status': 'git status',
      'log': 'git log --oneline -10'
    };

    const gitCommand = gitCommands[command.operation];
    if (!gitCommand) {
      throw new Error(`Unknown git operation: ${command.operation}`);
    }

    return await this.executeShellCommand(gitCommand, projectId);
  }

  async handlePackageManager(command, projectId) {
    const projectPath = path.join(this.projectsDir, projectId);
    
    const packageCommands = {
      'npm_install': `npm install ${command.packages || ''}`,
      'npm_uninstall': `npm uninstall ${command.packages}`,
      'npm_run': `npm run ${command.script}`,
      'bun_install': `bun install ${command.packages || ''}`,
      'bun_add': `bun add ${command.packages}`,
      'bun_run': `bun run ${command.script}`,
      'pip_install': `pip install ${command.packages}`,
      'pip_uninstall': `pip uninstall -y ${command.packages}`
    };

    const packageCommand = packageCommands[command.operation];
    if (!packageCommand) {
      throw new Error(`Unknown package manager operation: ${command.operation}`);
    }

    return await this.executeShellCommand(packageCommand, projectId);
  }

  async createFile(filePath, content, projectId) {
    const projectPath = projectId ? path.join(this.projectsDir, projectId) : this.projectsDir;
    const fullPath = path.join(projectPath, filePath);
    
    // Ensure directory exists
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });
    
    await fs.writeFile(fullPath, content, 'utf8');
    return { success: true, path: fullPath };
  }

  getCommandHistory() {
    return this.commandHistory;
  }
}