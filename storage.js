const fs     = require("fs");
const path   = require("path");
const os     = require("os");
const crypto = require("crypto");

// Always resolves to user's home dir — works from any location
const BASE_DIR = process.env.PORTABLE_EXECUTABLE_DIR || path.dirname(process.execPath);
const NOTES_PATH = path.join(BASE_DIR, "notex_notes.enc");

const ALGO = "aes-256-gcm";

function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256");
}

function encrypt(data, password) {
  const salt   = crypto.randomBytes(16);
  const iv     = crypto.randomBytes(12);
  const key    = deriveKey(password, salt);
  const cipher = crypto.createCipheriv(ALGO, key, iv);

  let enc = cipher.update(JSON.stringify(data));
  enc = Buffer.concat([enc, cipher.final()]);

  return {
    salt: salt.toString("base64"),
    iv:   iv.toString("base64"),
    tag:  cipher.getAuthTag().toString("base64"),
    data: enc.toString("base64"),
  };
}

function decrypt(payload, password) {
  try {
    const salt     = Buffer.from(payload.salt, "base64");
    const key      = deriveKey(password, salt);
    const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(payload.iv, "base64"));
    decipher.setAuthTag(Buffer.from(payload.tag, "base64"));

    let dec = decipher.update(Buffer.from(payload.data, "base64"));
    dec = Buffer.concat([dec, decipher.final()]);
    return JSON.parse(dec.toString());
  } catch {
    return null;
  }
}

function saveNotes(notes, password) {
  const encrypted = encrypt(notes, password);
  fs.writeFileSync(NOTES_PATH, JSON.stringify(encrypted), "utf8");
}

function loadNotes(password) {
  if (!fs.existsSync(NOTES_PATH)) return [];

  try {
    const data      = JSON.parse(fs.readFileSync(NOTES_PATH, "utf8"));
    const decrypted = decrypt(data, password);
    if (decrypted === null) throw new Error("WRONG_PASSWORD");
    return decrypted;
  } catch (e) {
    if (e.message === "WRONG_PASSWORD") throw e;
    throw new Error("FILE_CORRUPTED");
  }
}

module.exports = { saveNotes, loadNotes };