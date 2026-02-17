const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");

const NOTES_PATH = path.join(os.homedir(), ".notepro_notes.enc");

console.log(`💾 Storage path: ${NOTES_PATH}`);

const algorithm = "aes-256-gcm";

function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256");
}

function encrypt(data, password) {
  console.log("🔐 Encrypting data...");
  const salt = crypto.randomBytes(16);
  const key = deriveKey(password, salt);

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(JSON.stringify(data));
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  console.log("✅ Data encrypted successfully");
  
  return {
    salt: salt.toString("base64"),
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    data: encrypted.toString("base64"),
  };
}

function decrypt(payload, password) {
  try {
    console.log("🔓 Decrypting data...");
    const salt = Buffer.from(payload.salt, "base64");
    const key = deriveKey(password, salt);

    const decipher = crypto.createDecipheriv(
      algorithm,
      key,
      Buffer.from(payload.iv, "base64")
    );

    decipher.setAuthTag(Buffer.from(payload.tag, "base64"));

    let decrypted = decipher.update(Buffer.from(payload.data, "base64"));
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    console.log("✅ Data decrypted successfully");
    return JSON.parse(decrypted.toString());
  } catch (error) {
    console.error("❌ Decryption failed:", error.message);
    return null;
  }
}

function saveNotes(notes, password) {
  console.log(`💾 Saving ${notes.length} notes to disk...`);
  try {
    const encrypted = encrypt(notes, password);
    fs.writeFileSync(NOTES_PATH, JSON.stringify(encrypted));
    console.log("✅ Notes saved to disk successfully");
  } catch (error) {
    console.error("❌ Error saving notes to disk:", error);
    throw error;
  }
}

function loadNotes(password) {
  if (!fs.existsSync(NOTES_PATH)) {
    console.log("ℹ️ No existing notes file found, returning empty array");
    return [];
  }

  console.log("📂 Reading notes from disk...");
  try {
    const data = JSON.parse(fs.readFileSync(NOTES_PATH));
    const decrypted = decrypt(data, password);
    
    if (decrypted === null) {
      console.warn("⚠️ Failed to decrypt notes - WRONG PASSWORD");
      throw new Error("WRONG_PASSWORD");
    }
    
    console.log(`✅ Loaded ${decrypted.length} notes from disk`);
    return decrypted;
  } catch (error) {
    if (error.message === "WRONG_PASSWORD") {
      throw error; // Re-throw to indicate wrong password
    }
    console.error("❌ Error loading notes:", error);
    throw new Error("FILE_CORRUPTED");
  }
}

module.exports = { saveNotes, loadNotes };