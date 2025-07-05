export class WireAgent {
  constructor(genAI) {
    this.genAI = genAI;
    this.displayName = "Wire";
    this.status = "ready";
    this.powerLevel = 85;
    this.description = "Backend sorcerer, automation wizard, and DevOps ninja";
    this.skills = [
      "Backend Development",
      "API Design",
      "Database Architecture", 
      "DevOps & Automation",
      "Server Configuration",
      "CI/CD Pipelines",
      "Docker & Containers",
      "Cloud Deployment"
    ];
    this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  }

  async processTask(task, projectId) {
    console.log(`🔌 Wire processing: ${task}`);
    
    const systemPrompt = `You are Wire, a backend development and DevOps expert agent in the LLMON development environment.

Your expertise includes:
- Backend frameworks (Node.js, Express, FastAPI, Django, etc.)
- Database design and implementation (SQL, NoSQL)
- API development (REST, GraphQL, WebSocket)
- Server configuration and deployment
- DevOps automation and CI/CD
- Docker containerization
- Cloud platforms (AWS, GCP, Azure)
- Security best practices

You respond with practical, executable solutions in JSON format:

{
  "analysis": "Brief analysis of the task",
  "approach": "Your recommended approach", 
  "actions": [
    {
      "type": "file_operation|package_manager|shell|git_operation",
      "description": "What this action does",
      "command": "The actual command or file content",
      "path": "file path if applicable",
      "content": "file content if creating/updating files"
    }
  ],
  "explanation": "Technical explanation of your solution",
  "nextSteps": ["List of follow-up recommendations"],
  "estimatedTime": "Time estimate in minutes"
}

Focus on:
- Production-ready code
- Security best practices
- Scalable architecture
- Clean, maintainable code
- Proper error handling
- Documentation

Current task: "${task}"`;

    try {
      const result = await this.model.generateContent([
        { text: systemPrompt },
        { text: `Task: ${task}\\nProject ID: ${projectId || 'new'}` }
      ]);

      const responseText = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = responseText.match(/\\{[\\s\\S]*\\}/);
      if (jsonMatch) {
        const response = JSON.parse(jsonMatch[0]);
        
        // Add Wire's personality to the response
        response.agent = "Wire";
        response.voice = this.addWirePersonality(response.explanation);
        
        return response;
      } else {
        return {
          agent: "Wire",
          analysis: "Backend development task",
          approach: "Standard backend implementation",
          actions: [{
            type: "shell",
            description: "Execute backend setup",
            command: "echo 'Backend development in progress...'",
          }],
          explanation: responseText,
          voice: "🔌 Wire here. Let me wire up the backend for you.",
          nextSteps: ["Continue with implementation"],
          estimatedTime: "15-30"
        };
      }
    } catch (error) {
      console.error('Wire agent error:', error);
      return {
        agent: "Wire",
        error: error.message,
        voice: "🔌 Wire hit a snag. Let me debug this...",
        actions: [],
        estimatedTime: "5"
      };
    }
  }

  addWirePersonality(explanation) {
    const wirePersonality = [
      "🔌 Wire here. ",
      "⚡ Alright, I'm wiring this up. ",
      "🔧 Time to build some solid backend infrastructure. ",
      "🚀 Let me deploy some backend magic. ",
      "🛠️ Wire on the job. ",
      "⚙️ Engineering a backend solution. "
    ];

    const randomIntro = wirePersonality[Math.floor(Math.random() * wirePersonality.length)];
    return randomIntro + explanation;
  }
}