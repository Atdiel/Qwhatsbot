const { Client, LocalAuth } = require("whatsapp-web.js");
const client = new Client({
  puppeteer: { headless: true, args: ["--no-sandbox"] },
  authStrategy: new LocalAuth({
    clientId: "qwhatsbot",
    dataPath: `${__dirname}/session/.wwebjs_auth/`,
  }),
});

client.initialize();

client.on("auth_failure", () => console.log("\n🔴 say:\nSession error"));

client.on("ready", () => {
  console.log(
    ["\n", "\t🤖 [ B O T ]", "\n🟢 say:", "i'm alive and listen"].join("\n")
  );
});

client.on("message", (mssg) => {
  console.log(mssg);
});

client.on("disconnected", (reason) => {
  console.log("\n🔴 say:\nClient was logged out: ", reason);
});
