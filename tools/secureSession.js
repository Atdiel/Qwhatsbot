/**
 * this script isn't mine, was created by @tuhinpal
 * check him job on https://github.com/tuhinpal
 */
const fs = require("fs");
const AdmZip = require("adm-zip");
const {
  createEncryptStream,
  setPassword,
  createDecryptStream,
} = require("aes-encrypt-stream");
const crypto = require("crypto");

let sessionFolder = `${__dirname}/../app/session`;
let whatsappSession = `${sessionFolder}/.wwebjs_auth/`;

let excludedDir = [
  "session-qwhatsbot/Default/Cache",
  "session-qwhatsbot/Default/Code Cache",
  "session-qwhatsbot/Default/Code Storage",
  "session-qwhatsbot/Default/blob_storage",
  "session-qwhatsbot/Default/Service Worker",
];

module.exports = {
  cleanSession: function cleanSession() {
    try {
      // delete dir if exists
      if (fs.existsSync(whatsappSession)) {
        fs.rmSync(whatsappSession, { recursive: true });
        setTimeout(() => {
          console.log("[ OK ] ✅ session directory was cleaned successfully");
        }, 300);
      }
    } catch (_) {}
  },
  cipherSession: async function cipherSession(password) {
    excludedDir.forEach((dir) => {
      try {
        fs.rmSync(`${whatsappSession}${dir}/`, { recursive: true });
      } catch (_) {}
    });
    const zip = new AdmZip();
    zip.addLocalFolder(whatsappSession);
    await zip.writeZipPromise(`${sessionFolder}/temp.zip`);
    setPassword(getCipherKey(password));
    await new Promise((resolve) => {
      createEncryptStream(fs.createReadStream(`${sessionFolder}/temp.zip`))
        .pipe(fs.createWriteStream(`${sessionFolder}/session.encrypted`))
        .on("finish", () => {
          setTimeout(() => {
            console.log("[ OK ] ✅ session encrypted");
          }, 500);
          resolve();
        });
    });
    fs.unlinkSync(`${sessionFolder}/temp.zip`);
  },
  replicateSession: async function replicateSession(password) {
    try {
      setPassword(getCipherKey(password));
      await new Promise((resolve) => {
        fs.createReadStream(`${sessionFolder}/session.encrypted`)
          .pipe(
            createDecryptStream(
              fs.createWriteStream(`${sessionFolder}/temp.zip`)
            )
          )
          .on("finish", () => {
            resolve();
          });
      });

      let unzip = new AdmZip(fs.readFileSync(`${sessionFolder}/temp.zip`));
      unzip.extractAllToAsync(whatsappSession, true);
      console.log("[ OK ] ✅ Session files replicated");
    } catch (error) {
      throw new Error(
        `[ ERR ] ❌ session file not found, corrupted or password not matched. ${error.toString()}`
      );
    } finally {
      try {
        fs.unlinkSync(`${sessionFolder}/temp.zip`);
      } catch (_) {}
    }
  },
};

function getCipherKey(password) {
  return crypto.createHash("sha256").update(password).digest();
}
