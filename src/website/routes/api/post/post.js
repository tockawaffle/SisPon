const router = require("express").Router();
const moment = require("moment");
const agendaSchema = require("@db/schemas/agenda.js");
const adminSchema = require("@db/schemas/adminSchema.js");
const { compare } = require("bcrypt");

router.post("/pontoBatido", async (req, res) => {
    const { uid, type, uuid, nome, telefone } = req.body;
    if (!uid || !type || !uuid || !nome || !telefone)
        return res.status(400).json({ error: "Dados inválidos!" });

    const dataCompleta = moment().format("DD/MM/YYYY");
    const horaCompleta = moment().format("HH:mm:ss");

    const horaCorretaEntrada =
        moment().format("HH:mm:ss") >= "20:00:00" &&
        moment().format("HH:mm:ss") <= "23:00:00";
    const horaCorretaSaida =
        moment().format("HH:mm:ss") >= "17:45:00" &&
        moment().format("HH:mm:ss") <= "18:30:00";

    //Compara se a hora atual está entre 08:00:00 e 08:15:00
    if (horaCorretaEntrada) {
        console.log("Entrada");
        const data = await agendaSchema.findOne({ _id: uid });
        if (!data)
            return res.status(404).json({ error: "Usuário não encontrado!" });

        console.log(data);
    } else if (horaCorretaSaida) {
    } else {
        return res
            .status(400)
            .json({
                error: "Você não pode bater ponto fora do horário aceitável!<br><br>Horário de entrada: 08:00:00 - 08:15:00<br>Horário de saída: 17:45:00 - 18:30:00",
            });
    }
});

router.post("/autenticar", async (req, res) => {
    const { user, senha } = req.body;
    if (!senha || !user)
        return res.status(400).json({ auth: false, msg: "Dados inválidos!" });

    const data = await adminSchema.findOne({ _id: user });
    if (!data)
        return res
            .status(404)
            .json({ auth: false, msg: "Admin não encontrado!" });

    const senhaCorreta = await compare(senha, data.senha);
    if (!senhaCorreta)
        return res.status(400).json({ auth: false, msg: "Senha incorreta!" });

    res.status(200).json({ auth: true, msg: "Autenticado com sucesso!" });
});

router.post("registrarCartao", async (req, res) => {s
    const { nome, sobrenome, telefone } = req.body;

    if (!nome || !sobrenome || !telefone)
        return res.status(400).json({ error: "Dados inválidos!" });

    const data = await agendaSchema.findOne({ _id:nome });
    if (data) {
        return res.status(400).json({ error: "Usuário já cadastrado!" });
    }


});

module.exports = router;
