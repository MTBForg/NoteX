const { app, BrowserWindow } = require("electron");
const path = require("path");

console.log("🚀 NoteX starting...");

function createWindow() {
  console.log("🪟 Creating main window");
  
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    icon: path.join(__dirname, "assets", "icon.ico"), // Windows
    // icon: path.join(__dirname, "assets", "icon.icns"), // macOS
    // icon: path.join(__dirname, "assets", "icon.png"), // Linux
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  console.log("📄 Loading index.html");
  win.loadFile("index.html");

  // Open DevTools for debugging (comment out for production)
  // win.webContents.openDevTools();
  
  console.log("✅ Window created successfully");
}

app.whenReady().then(() => {
  console.log("⚡ Electron app ready");
  createWindow();
});

app.on("window-all-closed", () => {
  console.log("🚪 All windows closed");
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  console.log("🔄 App activated");
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});