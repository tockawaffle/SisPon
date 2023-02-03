const { readFileSync, writeFileSync } = require("fs");
const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
});
const exe = require("@angablue/exe");

readline.question(
    "Você deseja fazer a build do projeto, ou reverter as variáveis de desenvolvimento? (build/reverse) ",
    (answer) => {
        if (answer === "build") {
            const env = readFileSync(".env", "utf8");
            const mongoUri = env.match(/MONGO_URI=(.*)/)[1];
            let dbFile = readFileSync("./src/db/db.js", "utf8");
            dbFile = dbFile.replace("process.env.MONGO_URI", `"${mongoUri}"`);
            writeFileSync("./src/db/db.js", dbFile);

            const telegramToken = env.match(/TELEGRAM_BOT_TOKEN=(.*)/)[1];
            const telegramChatId = env.match(/TELEGRAM_BOT_CHAT_ID=(.*)/)[1];
            console.log(telegramToken);
            console.log(telegramChatId);
            let telegramFile = readFileSync("./src/telegram/bot.js", "utf8");
            telegramFile = telegramFile.replace(
                "process.env.TELEGRAM_BOT_TOKEN",
                `"${telegramToken}"`
            );
            telegramFile = telegramFile.replace(
                "process.env.TELEGRAM_BOT_CHAT_ID",
                `"${telegramChatId}"`
            );
            writeFileSync("./src/telegram/bot.js", telegramFile);

            console.log("Building the app...");

            const build = exe({
                entry: "package.json",
                out: "./bin/SisPon.exe",
                version: "1.7.5",
                target: "node16-win-x64",
                icon: "./favicon.ico",
                properties: {
                    FileDescription: "Sistema de Pontos Empresarial",
                    ProductName: "SisPon",
                    LegalCopyright: "Tocka Software",
                    OriginalFilename: "sispon.exe",
                    InternalName: "SisPon",
                    CompanyName: "Tocka Software",
                    ProductVersion: "1.7.5",
                    FileVersion: "1.7.5",
                    LegalTrademarks: "Tocka Software",
                    PrivateBuild: "Tocka Software",
                    SpecialBuild: "Tocka Software",
                },
            });

            build.then(() => {
                console.log("Build completa!");
                console.log("Fazendo a reversão das variáveis de desenvolvimento. . .")
                let dbFile = readFileSync("./src/db/db.js", "utf8");
                dbFile = dbFile.replace(
                    `"${mongoUri}"`,
                    "process.env.MONGO_URI"
                );
                writeFileSync("./src/db/db.js", dbFile);

                let telegramFile = readFileSync(
                    "./src/telegram/bot.js",
                    "utf8"
                );
                telegramFile = telegramFile.replace(
                    `"${telegramToken}"`,
                    "process.env.TELEGRAM_BOT_TOKEN"
                );
                telegramFile = telegramFile.replace(
                    `"${telegramChatId}"`,
                    "process.env.TELEGRAM_BOT_CHAT_ID"
                );
                writeFileSync("./src/telegram/bot.js", telegramFile);

                console.log("Variáveis de desenvolvimento recolocadas.");
                console.log("Build finalizada com sucesso!")
                readline.close();
            });
        } else if (answer === "reverse") {
            console.log("Revertendo a build. . .");

            let dbFile = readFileSync("./src/db/db.js", "utf8");
            dbFile = dbFile.replace(
                "mongodb://localhost:27017/nfc",
                "process.env.MONGO_URI"
            );
            writeFileSync("./src/db/db.js", dbFile);

            let telegramFile = readFileSync("./src/telegram/bot.js", "utf8");
            telegramFile = telegramFile.replace(
                /"[0-9]{10}:[a-zA-Z0-9_-]{35}"/,
                "process.env.TELEGRAM_BOT_TOKEN"
            );
            writeFileSync("./src/telegram/bot.js", telegramFile);

            console.log("Build revertida, process.envs recolocadas.");
        } else {
            console.log("Opção Inválida.");
        }
    }
);
