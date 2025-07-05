const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Keep a global reference of the window object
let mainWindow;
let serverProcess;
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  // Create the browser window with Game Boy styling
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true
    },
    titleBarStyle: 'default',
    backgroundColor: '#2c3e50',
    show: false // Don't show until ready
  });

  // Start the Node.js server
  startServer();

  // Load the app
  const startUrl = 'http://localhost:3000';
  
  // Wait a moment for server to start, then load
  setTimeout(() => {
    mainWindow.loadURL(startUrl);
    
    // Show window when ready
    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
      
      // Focus on window
      if (isDev) {
        mainWindow.webContents.openDevTools();
      }
    });
  }, 2000);

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Custom menu
  createMenu();
}

function startServer() {
  const serverPath = path.join(__dirname, 'server', 'index.js');
  
  console.log('🚀 Starting LLMON DevVerse Server...');
  
  serverProcess = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, ELECTRON_APP: 'true' }
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(`Server: ${data}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`Server Error: ${data}`);
  });

  serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });
}

function createMenu() {
  const template = [
    {
      label: 'LLMON DevVerse',
      submenu: [
        {
          label: 'About LLMON',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About LLMON DevVerse',
              message: 'LLMON DevVerse Reality Engine v1.0',
              detail: 'Next-generation developer operating system with LLM agents\\n\\nBuilt with love by Scout AI\\n\\nWhere retro gaming meets modern development!'
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Preferences...',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            // TODO: Implement preferences
            console.log('Preferences clicked');
          }
        },
        { type: 'separator' },
        {
          label: 'Quit LLMON',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Game Boy',
      submenu: [
        {
          label: 'Mission Control',
          accelerator: 'CmdOrCtrl+M',
          click: () => {
            mainWindow.webContents.executeJavaScript('llmon.navigateToScreen("mission-control")');
          }
        },
        {
          label: 'Projects',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            mainWindow.webContents.executeJavaScript('llmon.navigateToScreen("projects")');
          }
        },
        {
          label: 'Agents',
          accelerator: 'CmdOrCtrl+A',
          click: () => {
            mainWindow.webContents.executeJavaScript('llmon.navigateToScreen("agents")');
          }
        },
        {
          label: 'Terminal',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            mainWindow.webContents.executeJavaScript('llmon.navigateToScreen("terminal")');
          }
        },
        { type: 'separator' },
        {
          label: 'Toggle Sound',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.executeJavaScript('llmon.toggleSound()');
          }
        },
        {
          label: 'Power Reset',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          }
        }
      ]
    },
    {
      label: 'Agents',
      submenu: [
        {
          label: 'Talk to Wire',
          click: () => {
            mainWindow.webContents.executeJavaScript('llmon.navigateToScreen("terminal"); setTimeout(() => { document.getElementById("terminalInput").value = "agent wire "; document.getElementById("terminalInput").focus(); }, 500);');
          }
        },
        {
          label: 'Talk to Suno',
          click: () => {
            mainWindow.webContents.executeJavaScript('llmon.navigateToScreen("terminal"); setTimeout(() => { document.getElementById("terminalInput").value = "agent suno "; document.getElementById("terminalInput").focus(); }, 500);');
          }
        },
        {
          label: 'Talk to DJwrighTalker',
          click: () => {
            mainWindow.webContents.executeJavaScript('llmon.navigateToScreen("terminal"); setTimeout(() => { document.getElementById("terminalInput").value = "agent djw "; document.getElementById("terminalInput").focus(); }, 500);');
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'LLMON Documentation',
          click: () => {
            shell.openExternal('https://github.com/your-repo/llmon-devverse');
          }
        },
        {
          label: 'Game Boy Controls',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Game Boy Controls',
              message: 'LLMON DevVerse Controls',
              detail: '🎮 NAVIGATION:\\n• Arrow Keys: D-pad movement\\n• Enter: A button (select)\\n• Escape: B button (back)\\n\\n🚀 SHORTCUTS:\\n• Ctrl+M: Mission Control\\n• Ctrl+P: Projects\\n• Ctrl+A: Agents\\n• Ctrl+T: Terminal\\n• Ctrl+S: Toggle Sound\\n\\n💡 TIP: Click the Game Boy buttons or use keyboard shortcuts!'
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Report Issue',
          click: () => {
            shell.openExternal('https://github.com/your-repo/llmon-devverse/issues');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // Kill server process
  if (serverProcess) {
    serverProcess.kill();
  }
  
  // On macOS, keep app running even when windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent, navigationUrl) => {
    navigationEvent.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// Handle app termination
app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

console.log('🎮 LLMON DevVerse Electron App Starting...');