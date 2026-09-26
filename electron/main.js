const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express');

let mainWindow;

function startServerAndApp() {
  const server = express();
  const distPath = path.join(__dirname, 'dist');
  
  server.use('/ReLeaf_Pads', express.static(distPath));
  
  // Handle SPA routing by serving index.html for all non-file routes
  server.use('/ReLeaf_Pads', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  // Redirect root to the baseUrl
  server.use((req, res) => {
    res.redirect('/ReLeaf_Pads/');
  });

  // Start server on a random open port (port 0)
  const listener = server.listen(0, '127.0.0.1', () => {
    const port = listener.address().port;
    
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      icon: path.join(__dirname, 'logo.png'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    mainWindow.setMenuBarVisibility(false);
    mainWindow.loadURL(`http://127.0.0.1:${port}`);

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  });
}

app.whenReady().then(() => {
  startServerAndApp();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
