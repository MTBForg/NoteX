const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs   = require("fs");

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    icon: path.join(__dirname, "assets", "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  win.loadFile(path.join(__dirname, "index.html"));
  // win.webContents.openDevTools();
}

// ─── Export: save JSON to file chosen by user ─────────────────────────────────
ipcMain.handle("export-notes", async (event, data) => {
  const { filePath, canceled } = await dialog.showSaveDialog({
    title: "Export Notes",
    defaultPath: `notex-backup-${new Date().toISOString().slice(0,10)}.json`,
    filters: [{ name: "JSON", extensions: ["json"] }]
  });

  if (canceled || !filePath) return { success: false };

  try {
    fs.writeFileSync(filePath, data, "utf8");
    return { success: true, filePath };
  } catch(e) {
    return { success: false, error: e.message };
  }
});

// ─── Import: open file picker and return raw JSON string ─────────────────────
ipcMain.handle("import-notes", async () => {
  const { filePaths, canceled } = await dialog.showOpenDialog({
    title: "Import Notes",
    filters: [{ name: "JSON", extensions: ["json"] }],
    properties: ["openFile"]
  });

  if (canceled || !filePaths.length) return { success: false };

  try {
    const content = fs.readFileSync(filePaths[0], "utf8");
    return { success: true, content };
  } catch(e) {
    return { success: false, error: e.message };
  }
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});