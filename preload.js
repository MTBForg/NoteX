const { contextBridge } = require("electron");
const path    = require("path");
const storage = require(path.join(__dirname, "storage"));  // ← absolute, never breaks
const { v4: uuid } = require("uuid");

contextBridge.exposeInMainWorld("noteAPI", {
  saveNotes: (notes, password) => {
    storage.saveNotes(notes, password);
  },
  loadNotes: (password) => {
    return storage.loadNotes(password);  // throws WRONG_PASSWORD if needed
  },
  uuid: () => uuid()
});