require("dotenv").config({
    path: "../../.env",
});
const { AuthenticationError, ReadError, GetUIDError } = require("nfc-pcsc");
const express = require("express");
const app = express();
const getRoutes = require("./routes/get/get");
const getApiRoutes = require("./routes/api/get/get");
const postApiRoutes = require("./routes/api/post/post");
const putApiRoutes = require("./routes/api/put/put");
const deleteApiRoutes = require("./routes/api/delete/delete");
const http = require("http").createServer(app);
const path = require("path");
const open = require("open");
const nfc = require("../../src/nfc/index");
const connectDB = require("../db/db");
const cors = require("cors");

(async () => {
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(express.static(path.join(__dirname, "public")));
    app.use(express.static("/public/assets/"));
    const allowedOrigins = ["http://localhost:4444"];
    app.use(
        cors({
            origin: function (origin, callback) {
                if (!origin) return callback(null, true);
                if (allowedOrigins.indexOf(origin) === -1) {
                    var msg =
                        "O policiamento CORS deste site não " +
                        "permite o acesso da origem especificada.";
                    return callback(new Error(msg), false);
                }
                return callback(null, true);
            },
        })
    );

    app.use("/", [getRoutes]);
    app.use("/api/", [getApiRoutes, postApiRoutes]);

    app.use((req, res, next) => {
        res.setTimeout(15000, function () {
            res.status(503).send({
                code: 503,
                message: "Serviço Indisponível",
                description:
                    "O tempo de resposta do servidor foi excedido, ou, o servidor não deseja responder ao pedido.",
            });
            next();
        });
    });

    http.listen(4444, () => {
        nfc.start();
        console.log(
            `\x1b[35m%s\x1b[0m`,
            `[ Website ] >`,
            `Website rodando na porta 4444.`
        );
        connectDB();
        if (process.env.TELEGRAM_BOT) {
            require("../../src/telegram/bot");
        } else void 0;
        open("http://localhost:4444")
    });
})();

process.on("uncaughtException", (err) => {

    if (err instanceof AuthenticationError) {
        console.log(
            `\x1b[31m%s\x1b[0m`,
            `[ NFC: Erro ] >`,
            `Erro de autenticação do leitor NFC. Não tire o cartão do leitor até que apareça a notificação de sucesso.`
        );
    } else if (err instanceof ReadError) {
        console.log(
            `\x1b[31m%s\x1b[0m`,
            `[ NFC: Erro ] >`,
            `Erro de leitura do leitor NFC. Não tire o cartão do leitor até que apareça a notificação de sucesso.`
        );
        console.log(`\x1b[31m%s\x1b[0m`, `[ NFC: Erro ] >`, `Erro: ${err}`);
    } else if(err instanceof GetUIDError) {
        console.log(
            `\x1b[31m%s\x1b[0m`,
            `[ NFC: Erro ] >`,
            `Erro ao obter o UID do cartão. Não tire o cartão do leitor até que apareça a notificação de sucesso.`
        );
        console.log(`\x1b[31m%s\x1b[0m`, `[ NFC: Erro ] >`, `Erro: ${err}`);
    }
});
