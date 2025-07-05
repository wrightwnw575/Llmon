export class DJWAgent {
  constructor(genAI) {
    this.genAI = genAI;
    this.displayName = "DJwrighTalker";
    this.status = "ready";
    this.powerLevel = 92;
    this.description = "Frontend maestro, UX architect, and design system virtuoso";
    this.skills = [
      "Frontend Development",
      "React & Vue.js",
      "UI/UX Design",
      "Responsive Design",
      "CSS & Styling",
      "Animation & Transitions",
      "Component Libraries",
      "Design Systems",
      "User Experience",
      "Accessibility"
    ];
    this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  }

  async processTask(task, projectId) {
    console.log(`🎨 DJwrighTalker processing: ${task}`);
    
    const systemPrompt = `You are DJwrighTalker (DJW), a frontend development and UX design expert agent in the LLMON development environment.

Your expertise includes:
- Modern frontend frameworks (React, Vue, Svelte, Angular)
- CSS frameworks (Tailwind, Bootstrap, Styled Components)
- UI/UX design principles and patterns
- Responsive and mobile-first design
- Component architecture and design systems
- Animation and micro-interactions
- Accessibility (WCAG compliance)
- Performance optimization
- Modern JavaScript/TypeScript

You respond with beautiful, functional frontend solutions in JSON format:

{
  "analysis": "UX analysis of the task",
  "approach": "Your design and development strategy",
  "actions": [
    {
      "type": "file_operation|component_creation|styling|package_manager",
      "description": "What this creates or modifies",
      "path": "file path for components/styles",
      "content": "React/Vue component code or CSS",
      "dependencies": ["any new packages needed"]
    }
  ],
  "explanation": "Design reasoning and technical details",
  "designNotes": "UX considerations and design decisions",
  "nextSteps": ["UI/UX improvement suggestions"],
  "estimatedTime": "Time estimate in minutes"
}

Focus on:
- Modern, accessible, responsive design
- Clean, reusable component architecture
- Smooth animations and interactions
- Performance optimization
- Mobile-first approach
- Design system consistency
- User-centered design

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
        
        // Add DJW's personality
        response.agent = "DJwrighTalker";
        response.voice = this.addDJWPersonality(response.explanation);
        
        return response;
      } else {
        return {
          agent: "DJwrighTalker",
          analysis: "Frontend development task",
          approach: "Modern UI/UX implementation",
          actions: [{
            type: "component_creation",
            description: "Create frontend component",
            content: responseText,
            path: "src/components/NewComponent.jsx"
          }],
          explanation: responseText,
          voice: "🎨 DJW here, designing experiences that matter.",
          designNotes: "Focus on user experience and modern design patterns",
          nextSteps: ["Enhance with animations and interactions"],
          estimatedTime: "20-40"
        };
      }
    } catch (error) {
      console.error('DJW agent error:', error);
      return {
        agent: "DJwrighTalker",
        error: error.message,
        voice: "🎨 DJW hit a design snag. Let me redesign this approach...",
        actions: [],
        estimatedTime: "5"
      };
    }
  }

  addDJWPersonality(explanation) {
    const djwPersonality = [
      "🎨 DJW in the house! Time to craft some pixel-perfect magic. ",
      "🎭 Design mode activated. Let me orchestrate this interface. ",
      "🎪 DJwrighTalker here, ready to make this UI sing. ",
      "🎯 User experience is my game. Watch me work. ",
      "🌟 Creating digital experiences that users will love. ",
      "🎨 DJW's design studio is open for business. "
    ];

    const randomIntro = djwPersonality[Math.floor(Math.random() * djwPersonality.length)];
    return randomIntro + explanation;
  }
}