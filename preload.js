const { contextBridge, ipcRenderer } = require("electron");
const path = require("path");
const { v4: uuid } = require("uuid");

// Works whether app is packed (asar) or unpacked
const storagePath = __dirname.includes("app.asar")
  ? path.join(__dirname.replace("app.asar", "app.asar.unpacked"), "storage.js")
  : path.join(__dirname, "storage.js");

const storage = require(storagePath);

contextBridge.exposeInMainWorld("noteAPI", {
  saveNotes: (notes, password) => storage.saveNotes(notes, password),
  loadNotes: (password)        => storage.loadNotes(password),
  uuid:      ()                => uuid(),
  exportNotes: (data)          => ipcRenderer.invoke("export-notes", data),
  importNotes: ()              => ipcRenderer.invoke("import-notes"),
});