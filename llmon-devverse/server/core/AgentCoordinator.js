import { GoogleGenerativeAI } from '@google/generative-ai';
import { WireAgent } from '../agents/WireAgent.js';
import { SunoAgent } from '../agents/SunoAgent.js';
import { DJWAgent } from '../agents/DJWAgent.js';

export class AgentCoordinator {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-gemini-api-key-here');
    
    // Initialize the three core agents
    this.agents = {
      wire: new WireAgent(this.genAI),
      suno: new SunoAgent(this.genAI),
      djw: new DJWAgent(this.genAI)
    };
    
    this.taskQueue = [];
    this.sessionMemory = new Map();
    this.activeProjects = new Map();
  }

  async processMessage(message, projectId = null) {
    console.log(`🧠 Processing message: "${message}"`);
    
    // Analyze the message to determine which agents should be involved
    const analysis = await this.analyzeMessage(message);
    
    const response = {
      message: message,
      analysis: analysis,
      agentResponses: [],
      timestamp: new Date().toISOString()
    };

    // Route to appropriate agents based on analysis
    for (const agentName of analysis.requiredAgents) {
      if (this.agents[agentName]) {
        const agentResponse = await this.delegateTask(agentName, message, projectId);
        response.agentResponses.push({
          agent: agentName,
          response: agentResponse
        });
      }
    }

    // Store in session memory
    if (projectId) {
      if (!this.sessionMemory.has(projectId)) {
        this.sessionMemory.set(projectId, []);
      }
      this.sessionMemory.get(projectId).push(response);
    }

    return response;
  }

  async analyzeMessage(message) {
    const analysisPrompt = `
Analyze this user message and determine which agents should handle it:

User Message: "${message}"

Available Agents:
- wire: Backend development, automation, DevOps, infrastructure, APIs, databases
- suno: Text processing, documentation, content generation, lyrics, writing
- djw: Frontend development, UX/UI design, user experience, visual design

Return a JSON object with:
{
  "intent": "brief description of what user wants",
  "complexity": "simple|medium|complex",
  "requiredAgents": ["agent1", "agent2"],
  "executionOrder": ["agent1", "agent2"],
  "estimatedTime": "time estimate in minutes"
}

Examples:
- "Build a React app" -> {"intent": "Create React application", "complexity": "medium", "requiredAgents": ["djw", "wire"], "executionOrder": ["wire", "djw"], "estimatedTime": "15-30"}
- "Write API documentation" -> {"intent": "Generate API docs", "complexity": "simple", "requiredAgents": ["suno"], "executionOrder": ["suno"], "estimatedTime": "5-10"}
- "Create a full-stack lyrics app" -> {"intent": "Build complete lyrics application", "complexity": "complex", "requiredAgents": ["wire", "suno", "djw"], "executionOrder": ["wire", "suno", "djw"], "estimatedTime": "45-90"}
`;

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      const result = await model.generateContent(analysisPrompt);
      const responseText = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = responseText.match(/\\{[\\s\\S]*\\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        // Fallback analysis
        return {
          intent: "General development task",
          complexity: "medium",
          requiredAgents: ["djw", "wire"],
          executionOrder: ["wire", "djw"],
          estimatedTime: "15-30"
        };
      }
    } catch (error) {
      console.error('Error analyzing message:', error);
      return {
        intent: "Development task",
        complexity: "medium",
        requiredAgents: ["djw"],
        executionOrder: ["djw"],
        estimatedTime: "15-30"
      };
    }
  }

  async delegateTask(agentName, task, projectId) {
    const agent = this.agents[agentName];
    if (!agent) {
      throw new Error(`Agent "${agentName}" not found`);
    }

    console.log(`🤖 Delegating to ${agentName.toUpperCase()}: ${task}`);
    
    // Set agent status to busy
    agent.status = 'busy';
    
    try {
      const result = await agent.processTask(task, projectId);
      agent.status = 'ready';
      return result;
    } catch (error) {
      agent.status = 'error';
      throw error;
    }
  }

  getAgentStatus() {
    return Object.entries(this.agents).map(([name, agent]) => ({
      name: name,
      displayName: agent.displayName,
      status: agent.status,
      skills: agent.skills,
      powerLevel: agent.powerLevel,
      description: agent.description
    }));
  }

  getSessionMemory(projectId) {
    return this.sessionMemory.get(projectId) || [];
  }

  clearSessionMemory(projectId) {
    this.sessionMemory.delete(projectId);
  }
}