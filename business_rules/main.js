/**
 * ! here all the whatsapp-client dependencies
 */
const auth = require("../app/config/auth");

module.exports = async function init() {
  try {
    const session = auth.getSession();
    if (!session) {
      console.log(
        [
          "[ WARN ] ⚠️ i don´t could find a session",
          "[ MSSG ] don't worry about that, i'll create a new session for you",
        ].join("\n")
      );
      await auth.newCredentials();
      console.log("[ OK ] ✅ your session has been created and encrypted");
    }
    console.log("\n[ MSSG ] reading to your existing session...");
    auth.logIn().then(() => {
      setTimeout(() => {
        console.log("[ MSSG ] starting bot, just wait a minute...");
        require("../app/bot");
      }, 2000);
    });
  } catch (err) {
    console.error(err);
    process.exit();
  }
};
