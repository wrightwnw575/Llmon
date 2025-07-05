// LLMON DevVerse Game Boy UI Controller
class LLMonGameBoy {
    constructor() {
        this.socket = null;
        this.currentScreen = 'boot';
        this.selectedMenuItem = 0;
        this.isBooting = true;
        this.agents = {
            wire: { status: 'ready', power: 85 },
            suno: { status: 'ready', power: 78 },
            djw: { status: 'ready', power: 92 }
        };
        this.projects = [];
        this.currentProject = null;
        this.soundEnabled = true;
        this.bootSteps = [
            "Initializing LLM Agents...",
            "Loading Wire Backend Engine...",
            "Starting Suno Text Processor...",
            "Booting DJwrighTalker UI System...",
            "Connecting to DevVerse Reality Engine...",
            "Establishing Gemini API Connection...",
            "Loading Project Manager...",
            "System Ready!"
        ];
        
        this.init();
    }

    async init() {
        console.log('🎮 LLMON DevVerse Initializing...');
        await this.bootSequence();
        this.connectSocket();
        this.bindEvents();
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
    }

    async bootSequence() {
        const bootProgress = document.getElementById('bootProgress');
        const bootText = document.getElementById('bootText');
        
        for (let i = 0; i < this.bootSteps.length; i++) {
            bootText.textContent = this.bootSteps[i];
            bootProgress.style.width = `${(i + 1) / this.bootSteps.length * 100}%`;
            
            // Play boot sound
            this.playSound('beep');
            
            await this.sleep(800);
        }
        
        await this.sleep(1000);
        this.finishBoot();
    }

    finishBoot() {
        this.isBooting = false;
        document.getElementById('bootScreen').style.display = 'none';
        document.getElementById('mainUI').style.display = 'block';
        this.currentScreen = 'main-menu';
        this.playSound('startup');
        this.showSoundEffect('🎮 SYSTEM READY');
    }

    connectSocket() {
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('🔌 Connected to LLMON Server');
            this.updateAgentStatus('wire', 'ready');
            this.updateAgentStatus('suno', 'ready');
            this.updateAgentStatus('djw', 'ready');
        });

        this.socket.on('disconnect', () => {
            console.log('🔌 Disconnected from LLMON Server');
            this.updateAgentStatus('wire', 'offline');
            this.updateAgentStatus('suno', 'offline');
            this.updateAgentStatus('djw', 'offline');
        });

        this.socket.on('agent_response', (data) => {
            this.handleAgentResponse(data);
        });

        this.socket.on('execution_result', (data) => {
            this.handleExecutionResult(data);
        });

        this.socket.on('agent_error', (data) => {
            this.handleAgentError(data);
        });
    }

    bindEvents() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Menu item clicks
        document.querySelectorAll('.menu-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.selectMenuItem(index);
                this.actionA();
            });
        });

        // Terminal input
        const terminalInput = document.getElementById('terminalInput');
        if (terminalInput) {
            terminalInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.executeCommand();
                }
            });
        }

        // Mission input
        const missionInput = document.getElementById('missionInput');
        if (missionInput) {
            missionInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    this.startMission();
                }
            });
        }
    }

    handleKeyboard(e) {
        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                this.navigateUp();
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.navigateDown();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.navigateLeft();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.navigateRight();
                break;
            case 'Enter':
                e.preventDefault();
                this.actionA();
                break;
            case 'Escape':
                e.preventDefault();
                this.actionB();
                break;
        }
    }

    // Navigation Functions
    navigateUp() {
        this.playSound('nav');
        if (this.currentScreen === 'main-menu') {
            this.selectedMenuItem = Math.max(0, this.selectedMenuItem - 1);
            this.updateMenuSelection();
        }
    }

    navigateDown() {
        this.playSound('nav');
        if (this.currentScreen === 'main-menu') {
            const menuItems = document.querySelectorAll('.menu-item');
            this.selectedMenuItem = Math.min(menuItems.length - 1, this.selectedMenuItem + 1);
            this.updateMenuSelection();
        }
    }

    navigateLeft() {
        this.playSound('nav');
    }

    navigateRight() {
        this.playSound('nav');
    }

    updateMenuSelection() {
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach((item, index) => {
            item.classList.toggle('active', index === this.selectedMenuItem);
        });
    }

    selectMenuItem(index) {
        this.selectedMenuItem = index;
        this.updateMenuSelection();
    }

    // Action Functions
    actionA() {
        this.playSound('select');
        
        if (this.currentScreen === 'main-menu') {
            const menuItems = document.querySelectorAll('.menu-item');
            const selectedItem = menuItems[this.selectedMenuItem];
            const action = selectedItem.dataset.action;
            this.navigateToScreen(action);
        }
    }

    actionB() {
        this.playSound('back');
        
        if (this.currentScreen !== 'main-menu') {
            this.showMainMenu();
        }
    }

    // Screen Navigation
    navigateToScreen(screenName) {
        this.hideAllScreens();
        
        switch(screenName) {
            case 'mission-control':
                this.showMissionControl();
                break;
            case 'projects':
                this.showProjectsScreen();
                break;
            case 'agents':
                this.showAgentsScreen();
                break;
            case 'terminal':
                this.showTerminalScreen();
                break;
            case 'git':
                this.showGitScreen();
                break;
        }
    }

    hideAllScreens() {
        document.getElementById('mainMenu').style.display = 'none';
        document.getElementById('missionControl').style.display = 'none';
        document.getElementById('projectsScreen').style.display = 'none';
        document.getElementById('agentsScreen').style.display = 'none';
        document.getElementById('terminalScreen').style.display = 'none';
    }

    showMainMenu() {
        this.hideAllScreens();
        document.getElementById('mainMenu').style.display = 'block';
        this.currentScreen = 'main-menu';
    }

    showMissionControl() {
        document.getElementById('missionControl').style.display = 'block';
        document.getElementById('missionControl').classList.add('screen-transition-in');
        this.currentScreen = 'mission-control';
        this.loadMissionLog();
    }

    showProjectsScreen() {
        document.getElementById('projectsScreen').style.display = 'block';
        document.getElementById('projectsScreen').classList.add('screen-transition-in');
        this.currentScreen = 'projects';
        this.loadProjects();
    }

    showAgentsScreen() {
        document.getElementById('agentsScreen').style.display = 'block';
        document.getElementById('agentsScreen').classList.add('screen-transition-in');
        this.currentScreen = 'agents';
        this.updateAgentDisplays();
    }

    showTerminalScreen() {
        document.getElementById('terminalScreen').style.display = 'block';
        document.getElementById('terminalScreen').classList.add('screen-transition-in');
        this.currentScreen = 'terminal';
    }

    // Mission Control Functions
    async startMission() {
        const missionInput = document.getElementById('missionInput');
        const mission = missionInput.value.trim();
        
        if (!mission) {
            this.showSoundEffect('⚠️ ENTER MISSION');
            return;
        }

        this.playSound('launch');
        this.showSoundEffect('🚀 MISSION LAUNCHED');
        
        this.addLogEntry('user', `Mission: ${mission}`);
        this.addLogEntry('system', 'Analyzing mission requirements...');
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: mission, 
                    projectId: this.currentProject 
                })
            });
            
            const result = await response.json();
            this.handleMissionResponse(result);
            
        } catch (error) {
            this.addLogEntry('error', `Mission failed: ${error.message}`);
        }
        
        missionInput.value = '';
    }

    handleMissionResponse(response) {
        this.addLogEntry('system', `Mission analyzed: ${response.analysis.intent}`);
        
        response.agentResponses.forEach(agentResponse => {
            const agent = agentResponse.agent;
            const data = agentResponse.response;
            
            this.addLogEntry(agent, data.voice || data.explanation);
            
            if (data.actions) {
                data.actions.forEach(action => {
                    this.addLogEntry('system', `Executing: ${action.description}`);
                    this.executeAgentAction(action);
                });
            }
        });
    }

    executeAgentAction(action) {
        if (this.socket) {
            this.socket.emit('execute_command', {
                command: action,
                projectId: this.currentProject
            });
        }
    }

    handleAgentResponse(data) {
        this.addLogEntry(data.agent, data.voice || data.message);
        this.updateAgentStatus(data.agent.toLowerCase(), 'ready');
    }

    handleExecutionResult(data) {
        if (data.success) {
            this.addLogEntry('system', `✅ ${data.message || 'Command executed successfully'}`);
        } else {
            this.addLogEntry('error', `❌ ${data.error || 'Command failed'}`);
        }
    }

    handleAgentError(data) {
        this.addLogEntry('error', `🔧 ${data.error}`);
    }

    addLogEntry(type, message) {
        const logContent = document.getElementById('logContent');
        const time = new Date().toLocaleTimeString();
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        
        logEntry.innerHTML = `
            <div class="log-time">${time}</div>
            <div class="log-message">${message}</div>
        `;
        
        logContent.appendChild(logEntry);
        logContent.scrollTop = logContent.scrollHeight;
    }

    loadMissionLog() {
        const logContent = document.getElementById('logContent');
        logContent.innerHTML = `
            <div class="log-entry system">
                <div class="log-time">${new Date().toLocaleTimeString()}</div>
                <div class="log-message">🎮 LLMON DevVerse Engine Ready</div>
            </div>
            <div class="log-entry system">
                <div class="log-time">${new Date().toLocaleTimeString()}</div>
                <div class="log-message">🤖 All agents standing by</div>
            </div>
        `;
    }

    // Projects Functions
    async loadProjects() {
        try {
            const response = await fetch('/api/projects');
            this.projects = await response.json();
            this.updateProjectsList();
        } catch (error) {
            console.error('Failed to load projects:', error);
        }
    }

    updateProjectsList() {
        const projectsList = document.getElementById('projectsList');
        
        if (this.projects.length === 0) {
            projectsList.innerHTML = `
                <div class="project-item">
                    <div class="project-info">
                        <div class="project-name">No Projects</div>
                        <div class="project-type">Create your first project</div>
                    </div>
                </div>
            `;
            return;
        }
        
        projectsList.innerHTML = this.projects.map(project => `
            <div class="project-item">
                <div class="project-info">
                    <div class="project-name">${project.name}</div>
                    <div class="project-type">${project.type}</div>
                    <div class="project-status">${project.status}</div>
                </div>
                <div class="project-actions">
                    <button class="btn-small" onclick="llmon.openProject('${project.id}')">Open</button>
                    <button class="btn-small" onclick="llmon.deployProject('${project.id}')">Deploy</button>
                </div>
            </div>
        `).join('');
    }

    async newProject() {
        const name = prompt('Project Name:');
        if (!name) return;
        
        const type = prompt('Project Type (web/api/fullstack/python/node):', 'web');
        const description = prompt('Project Description:', '');
        
        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, type, description })
            });
            
            const project = await response.json();
            this.projects.push(project);
            this.updateProjectsList();
            this.showSoundEffect('📁 PROJECT CREATED');
            
        } catch (error) {
            this.showSoundEffect('❌ CREATE FAILED');
        }
    }

    openProject(projectId) {
        this.currentProject = projectId;
        this.showSoundEffect('📂 PROJECT OPENED');
        this.navigateToScreen('mission-control');
    }

    deployProject(projectId) {
        this.showSoundEffect('🚀 DEPLOYING...');
    }

    // Agent Functions
    updateAgentDisplays() {
        Object.keys(this.agents).forEach(agentName => {
            const agent = this.agents[agentName];
            const powerFill = document.querySelector(`#${agentName}Card .power-fill`);
            const powerLevel = document.querySelector(`#${agentName}Card .power-level`);
            
            if (powerFill) powerFill.style.width = `${agent.power}%`;
            if (powerLevel) powerLevel.textContent = `${agent.power}%`;
        });
    }

    updateAgentStatus(agentName, status) {
        if (this.agents[agentName]) {
            this.agents[agentName].status = status;
            
            const indicator = document.getElementById(`${agentName}Status`);
            if (indicator) {
                indicator.style.opacity = status === 'ready' ? 1 : 0.3;
                if (status === 'busy') {
                    indicator.style.animation = 'pulse 1s infinite';
                } else {
                    indicator.style.animation = 'none';
                }
            }
        }
    }

    // Terminal Functions
    executeCommand() {
        const terminalInput = document.getElementById('terminalInput');
        const command = terminalInput.value.trim();
        
        if (!command) return;
        
        this.addTerminalLine(`llmon@devverse:~$ ${command}`);
        
        if (command === 'help') {
            this.showTerminalHelp();
        } else if (command === 'clear') {
            this.clearTerminal();
        } else if (command.startsWith('agent ')) {
            this.handleAgentCommand(command);
        } else {
            // Send command to server
            if (this.socket) {
                this.socket.emit('execute_command', {
                    command: { type: 'shell', command: command },
                    projectId: this.currentProject
                });
            }
        }
        
        terminalInput.value = '';
    }

    addTerminalLine(text) {
        const terminalOutput = document.getElementById('terminalOutput');
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.textContent = text;
        terminalOutput.appendChild(line);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    showTerminalHelp() {
        const helpText = [
            'LLMON DevVerse Terminal Commands:',
            '',
            'help          - Show this help',
            'clear         - Clear terminal',
            'agent <name>  - Talk to specific agent',
            'projects      - List projects',
            'status        - System status',
            '',
            'Standard shell commands also available'
        ];
        
        helpText.forEach(line => this.addTerminalLine(line));
    }

    clearTerminal() {
        const terminalOutput = document.getElementById('terminalOutput');
        terminalOutput.innerHTML = `
            <div class="terminal-line">LLMON DevVerse Terminal v1.0</div>
            <div class="terminal-line">Type 'help' for available commands</div>
            <div class="terminal-line">></div>
        `;
    }

    handleAgentCommand(command) {
        const parts = command.split(' ');
        const agentName = parts[1];
        const message = parts.slice(2).join(' ');
        
        if (!this.agents[agentName]) {
            this.addTerminalLine(`Agent '${agentName}' not found`);
            return;
        }
        
        if (!message) {
            this.addTerminalLine(`Usage: agent ${agentName} <message>`);
            return;
        }
        
        this.addTerminalLine(`Sending to ${agentName}: ${message}`);
        
        if (this.socket) {
            this.socket.emit('agent_task', {
                agent: agentName,
                task: message,
                projectId: this.currentProject
            });
        }
    }

    // Utility Functions
    updateTime() {
        const timeElement = document.getElementById('systemTime');
        if (timeElement) {
            const now = new Date();
            timeElement.textContent = now.toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
    }

    playSound(type) {
        if (!this.soundEnabled) return;
        
        // Create audio context for retro Game Boy sounds
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            let frequency, duration;
            
            switch(type) {
                case 'beep':
                    frequency = 800;
                    duration = 0.1;
                    break;
                case 'nav':
                    frequency = 600;
                    duration = 0.05;
                    break;
                case 'select':
                    frequency = 1000;
                    duration = 0.15;
                    break;
                case 'back':
                    frequency = 400;
                    duration = 0.1;
                    break;
                case 'startup':
                    frequency = 1200;
                    duration = 0.3;
                    break;
                case 'launch':
                    frequency = 1500;
                    duration = 0.2;
                    break;
                default:
                    frequency = 800;
                    duration = 0.1;
            }
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (error) {
            // Silently fail if audio context not available
        }
    }

    showSoundEffect(text) {
        const effect = document.createElement('div');
        effect.className = 'sound-effect';
        effect.textContent = text;
        document.body.appendChild(effect);
        
        setTimeout(() => {
            document.body.removeChild(effect);
        }, 500);
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.showSoundEffect(this.soundEnabled ? '🔊 SOUND ON' : '🔇 SOUND OFF');
    }

    showSettings() {
        this.showSoundEffect('⚙️ SETTINGS');
    }

    powerToggle() {
        this.showSoundEffect('⚡ POWER');
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global functions for HTML onclick handlers
function showMainMenu() {
    llmon.showMainMenu();
}

function navigateUp() {
    llmon.navigateUp();
}

function navigateDown() {
    llmon.navigateDown();
}

function navigateLeft() {
    llmon.navigateLeft();
}

function navigateRight() {
    llmon.navigateRight();
}

function actionA() {
    llmon.actionA();
}

function actionB() {
    llmon.actionB();
}

function startMission() {
    llmon.startMission();
}

function newProject() {
    llmon.newProject();
}

function executeCommand() {
    llmon.executeCommand();
}

function clearTerminal() {
    llmon.clearTerminal();
}

function toggleSound() {
    llmon.toggleSound();
}

function showSettings() {
    llmon.showSettings();
}

function powerToggle() {
    llmon.powerToggle();
}

// Initialize LLMON Game Boy when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.llmon = new LLMonGameBoy();
});

console.log('🎮 LLMON DevVerse Game Boy UI Loaded');