export class SunoAgent {
  constructor(genAI) {
    this.genAI = genAI;
    this.displayName = "Suno";
    this.status = "ready";
    this.powerLevel = 78;
    this.description = "Text alchemist, documentation poet, and content wizard";
    this.skills = [
      "Documentation Writing",
      "Content Generation",
      "Text Processing",
      "Technical Writing",
      "Code Comments",
      "README Creation",
      "API Documentation",
      "User Guides",
      "Lyrics & Creative Writing",
      "Data Processing"
    ];
    this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  }

  async processTask(task, projectId) {
    console.log(`📝 Suno processing: ${task}`);
    
    const systemPrompt = `You are Suno, a text processing and documentation expert agent in the LLMON development environment.

Your expertise includes:
- Technical documentation (README, API docs, user guides)
- Content generation (blog posts, descriptions, copy)
- Text processing and analysis
- Code documentation and comments
- Creative writing (lyrics, stories, marketing copy)
- Data processing and formatting
- SEO-optimized content
- Multi-language content

You respond with creative, well-structured content in JSON format:

{
  "analysis": "Brief analysis of the content task",
  "approach": "Your content strategy",
  "actions": [
    {
      "type": "file_operation|content_generation|text_processing",
      "description": "What this action creates",
      "path": "file path if creating documentation",
      "content": "The actual content/text you're creating",
      "format": "markdown|json|txt|html"
    }
  ],
  "explanation": "Creative explanation of your approach",
  "nextSteps": ["Content improvement suggestions"],
  "estimatedTime": "Time estimate in minutes"
}

Focus on:
- Clear, engaging writing
- Proper structure and formatting
- SEO optimization when relevant
- Accessibility and readability
- Comprehensive yet concise content
- Creative flair when appropriate

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
        
        // Add Suno's personality
        response.agent = "Suno";
        response.voice = this.addSunoPersonality(response.explanation);
        
        return response;
      } else {
        return {
          agent: "Suno",
          analysis: "Content creation task",
          approach: "Creative content generation",
          actions: [{
            type: "content_generation",
            description: "Generate content",
            content: responseText,
            format: "markdown"
          }],
          explanation: responseText,
          voice: "📝 Suno here, crafting words that matter.",
          nextSteps: ["Review and refine content"],
          estimatedTime: "10-20"
        };
      }
    } catch (error) {
      console.error('Suno agent error:', error);
      return {
        agent: "Suno",
        error: error.message,
        voice: "📝 Suno encountered a creative block. Let me rewrite this...",
        actions: [],
        estimatedTime: "5"
      };
    }
  }

  addSunoPersonality(explanation) {
    const sunoPersonality = [
      "📝 Suno here, weaving words into reality. ",
      "✨ Time to craft some compelling content. ",
      "📚 Let me document this beautifully. ",
      "🎭 Suno's about to create something special. ",
      "🖋️ Words are my paintbrush, let me create. ",
      "📖 Storytelling mode activated. "
    ];

    const randomIntro = sunoPersonality[Math.floor(Math.random() * sunoPersonality.length)];
    return randomIntro + explanation;
  }
}