const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const readline = require("readline");
//> secure session methods
const {
  cleanSession,
  cipherSession,
  replicateSession,
} = require("../../tools/secureSession");
//> ruta del archivo de sesion guardada
const SESSION_FILE_PATH = `${__dirname}/../session/session.encrypted`;

module.exports = {
  /**
   * > create new credentials ***
   */
  newCredentials: async function newCredentials() {
    cleanSession();

    const client = new Client({
      puppeteer: { headless: true, args: ["--no-sandbox"] },
      authStrategy: new LocalAuth({
        clientId: "qwhatsbot",
        dataPath: `${__dirname}/../session/.wwebjs_auth/`,
      }),
    });

    const userPassword = await setPassword();
    console.log(["\n🟡 to start", "📱scan QR code below ⬇️"].join("\n"));
    await new Promise((resolve, reject) => {
      client.initialize();

      client.on("qr", (qr) => {
        qrcode.generate(qr, { small: true });
      });

      client.on("ready", () => {
        client.destroy();
        console.log("[ MSSG ] please wait...");
        setTimeout(async () => {
          await cipherSession(userPassword);
          resolve();
        }, 3000);
      });

      client.on("auth_failure", (err) => {
        console.log("error en auth", err);
        reject(err);
      });
    });
  },

  /**
   * > verify if already exists a session file encrypted
   * @returns true | false
   */
  getSession: function getSession() {
    return fs.existsSync(SESSION_FILE_PATH);
  },
  /**
   *
   */
  logIn: function logIn() {
    return new Promise((resolve, reject) => {
      try {
        cleanSession();
        setTimeout(async () => {
          const password = await readPassword();
          await replicateSession(password);
          resolve();
        }, 600);
      } catch (err) {
        reject(err);
      }
    });
  },
};

/**
 * > read from stdin the password to encrypt session
 */
function setPassword() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.setPrompt(
      "\n[ MSSG ] please enter a password to encrypt your new session:\n"
    );
    rl.prompt();
    rl.on("line", (password) => {
      if (password.trim() === "") {
        console.log("[ ERR ] ❌ invalid password");
        rl.prompt();
      } else if (password.length < 6) {
        console.log("[ ERR ] ❌ password pretty weak");
        rl.prompt();
      } else {
        rl.question("[ MSSG ] confirm password:\n", (confirmPassword) => {
          if (confirmPassword === password) {
            rl.close();
            resolve(password);
          } else {
            console.log("[ ERR ] ❌ password doesn't matched");
            rl.prompt();
          }
        });
      }
    });
  });
}

function readPassword() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.setPrompt("\n[ MSSG ] please enter password to decrypt your session:\n");
    rl.prompt();
    rl.on("line", (password) => {
      if (password.trim() === "") {
        console.log("[ ERR ] ❌ invalid password");
        rl.prompt();
      } else if (password.length < 6) {
        console.log("[ ERR ] ❌ invalid password due it is weak");
        rl.prompt();
      } else {
        rl.question(
          "[ MSSG ] to make sure, please confirm password:\n",
          (confirmPassword) => {
            if (confirmPassword === password) {
              rl.close();
              resolve(password);
            } else {
              console.log("[ ERR ] ❌ password doesn't matched");
              rl.prompt();
            }
          }
        );
      }
    });
  });
}
