console.log("✅ Preload script started");

try {
  console.log("📦 Step 1: Requiring electron...");
  const { contextBridge } = require("electron");
  console.log("✅ Step 1: electron loaded");
  
  console.log("📦 Step 2: Requiring storage...");
  const storage = require("./storage");
  console.log("✅ Step 2: storage loaded");
  
  console.log("📦 Step 3: Requiring uuid...");
  const { v4: uuid } = require("uuid");
  console.log("✅ Step 3: uuid loaded");

  console.log("🔑 Step 4: Exposing API via contextBridge...");
  contextBridge.exposeInMainWorld("noteAPI", {
    saveNotes: (notes, password) => {
      console.log(`📦 Saving ${notes.length} notes`);
      try {
        const result = storage.saveNotes(notes, password);
        console.log("✅ Notes saved successfully");
        return result;
      } catch (error) {
        console.error("❌ Error saving notes:", error);
        throw error;
      }
    },

    loadNotes: (password) => {
      console.log("📂 Loading notes from storage");
      try {
        const notes = storage.loadNotes(password);
        console.log(`✅ Loaded ${notes ? notes.length : 0} notes`);
        return notes;
      } catch (error) {
        console.error("❌ Error loading notes:", error.message);
        // Re-throw the error so renderer can handle it
        throw error;
      }
    },

    uuid: () => {
      console.log("🆔 Generating new UUID");
      const id = uuid();
      console.log(`✅ Generated UUID: ${id}`);
      return id;
    }
  });

  console.log("✅ Step 4: API exposed successfully");
  console.log("🎉 Preload completed successfully!");
  
} catch (error) {
  console.error("❌❌❌ PRELOAD FAILED:", error);
  console.error("Stack trace:", error.stack);
}