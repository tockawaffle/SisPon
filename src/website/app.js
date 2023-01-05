require("module-alias/register");
require("dotenv").config();
require("@nfc/index.js");
const express = require("express");
const app = express();
const getRoutes = require("./routes/get/get");
const getApiRoutes = require("./routes/api/get/get");
const postApiRoutes = require("./routes/api/post/post");
const putApiRoutes = require("./routes/api/put/put");
const deleteApiRoutes = require("./routes/api/delete/delete");
const http = require("http").createServer(app);
const path = require("path");
const nfc = require("@nfc/index.js");
const connectDB = require("@db/db.js");

(async () => {
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(express.static(path.join(__dirname, "public")));
    app.use(express.static("/public/assets/"));

    app.use("/", [getRoutes]);
    app.use("/api/", [getApiRoutes, postApiRoutes]);

    nfc.start();

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
        console.log(
            `\x1b[35m%s\x1b[0m`,
            `[ Website ]`,
            `Website rodando na porta 4444.`
        );
        connectDB()
    });
})();
