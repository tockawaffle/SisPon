const { exec } = require("child_process");
const { readFileSync, writeFileSync } = require("fs");

//read .env file and get the MONGO_URI value
const env = readFileSync(".env", "utf8");
const mongoUri = env.match(/MONGO_URI=(.*)/)[1];
let dbFile = readFileSync("./src/db/db.js", "utf8");
dbFile = dbFile.replace("process.env.MONGO_URI", `"${mongoUri}"`);
writeFileSync("./src/db/db.js", dbFile);

const telegramToken = env.match(/TELEGRAM_BOT=(.*)/)[1];
let telegramFile = readFileSync("./src/telegram/bot.js", "utf8");
telegramFile = telegramFile.replace("process.env.TELEGRAM_BOT", `"${telegramToken}"`);
writeFileSync("./src/telegram/bot.js", telegramFile);

console.log("Building the app...");
exec("pkg .", (err, stdout, stderr) => {
    if (err) {
        console.log(err);
    }
    console.log(stdout);
    console.log(stderr);
});
