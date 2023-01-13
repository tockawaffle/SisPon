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
            //read .env file and get the MONGO_URI value
            const env = readFileSync(".env", "utf8");
            const mongoUri = env.match(/MONGO_URI=(.*)/)[1];
            let dbFile = readFileSync("./src/db/db.js", "utf8");
            dbFile = dbFile.replace("process.env.MONGO_URI", `"${mongoUri}"`);
            writeFileSync("./src/db/db.js", dbFile);

            const telegramToken = env.match(/TELEGRAM_BOT=(.*)/)[1];
            let telegramFile = readFileSync("./src/telegram/bot.js", "utf8");
            telegramFile = telegramFile.replace(
                "process.env.TELEGRAM_BOT",
                `"${telegramToken}"`
            );
            writeFileSync("./src/telegram/bot.js", telegramFile);

            console.log("Building the app...");

            const build = exe({
                entry: "package.json",
                out: "./bin/sispon.exe",
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
                    SpecialBuild: "Tocka Software"
                },
            });

            build.then(() => console.log("Build completed!"));
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
                "process.env.TELEGRAM_BOT"
            );
            writeFileSync("./src/telegram/bot.js", telegramFile);

            console.log("Build revertida, process.envs recolocadas.");
        } else {
            console.log("Opção Inválida.");
        }
    }
);
