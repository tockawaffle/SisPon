const { NFC, KEY_TYPE_A } = require("nfc-pcsc");
const { compare } = require("bcrypt");
const { sendPontoMessage } = require("../../../../telegram/bot.js");
const router = require("express").Router();
const moment = require("moment");
const agendaSchema = require("../../../../db/schemas/agenda");
const adminSchema = require("../../../../db/schemas/adminSchema.js");
const nanoid = require("nanoid");

router.post("/nfc/ponto", async (req, res) => {
    const { uid, type, uuid, nome, telefone } = req.body;
    if (!uid || !type || !uuid || !nome || !telefone) {
        return res.status(400).json({ error: "Dados inválidos!" });
    }

    const dataCompleta = moment().format("DD/MM/YYYY");
    const horaCompleta = moment().format("HH:mm:ss");

    const horaCorretaEntrada =
        moment().format("HH:mm:ss") >= "07:50:00" &&
        moment().format("HH:mm:ss") <= "08:30:00";
    const horaCorretaSaida =
        moment().format("HH:mm:ss") >= "17:35:00" &&
        moment().format("HH:mm:ss") <= "18:30:00";

    if (horaCorretaEntrada) {
        const data = await agendaSchema.findOne({ _id: uid });
        if (!data) {
            return res.status(400).json({
                error: "Ponto de Entrada: Usuário não encontrado!",
            });
        }

        const pontoBatido = data.datas.find(
            (data) =>
                data[dataCompleta] &&
                data[dataCompleta].find(
                    (ponto) => ponto.entrada && ponto.entrada.uuid === uuid
                )
        );

        if (pontoBatido) {
            return res.status(400).json({
                error: "Ponto de Entrada: Você já fez o ponto de entrada hoje!",
            });
        }

        let temp = {};
        temp[dataCompleta] = [
            {
                data: dataCompleta,
                entrada: {
                    hora: horaCompleta,
                    uuid: uuid,
                    nome: nome,
                    tipo: "Entrada",
                },
            },
        ];
        data.datas.push(temp);

        await data.save();

        const dataAtualizada = await agendaSchema.findOne({ _id: uid });
        if (!dataAtualizada) {
            return res.status(404).json({
                error: "Ponto de Entrada: Erro ao atualizar o banco de dados!",
            });
        }

        const dataDeHoje = dataAtualizada.datas.find(
            (data) =>
                data[dataCompleta] &&
                data[dataCompleta].find(
                    (ponto) => ponto.entrada && ponto.entrada.uuid === uuid
                )
        );
        if (!dataDeHoje) {
            return res.status(404).json({
                error: "Ponto de Saída: Erro ao atualizar o banco de dados!",
            });
        }
        sendPontoMessage({
            nome,
            telefone,
            data: dataDeHoje[dataCompleta][0].data,
            hora: dataDeHoje[dataCompleta][0].entrada.hora,
            tipo: dataDeHoje[dataCompleta][0].entrada.tipo,
        });
        return res.status(200).json({
            read: true,
            data: dataDeHoje[dataCompleta][0].data,
            hora: dataDeHoje[dataCompleta][0].entrada.hora,
            tipo: dataDeHoje[dataCompleta][0].entrada.tipo,
        });
    } else if (horaCorretaSaida) {
        const data = await agendaSchema.findOne({ _id: uid });
        if (!data) {
            return res.status(404).json({
                error: "Ponto de Saída: Usuário não encontrado!",
            });
        }
        const pontoBatido = data.datas.find(
            (data) =>
                data[dataCompleta] &&
                data[dataCompleta].find(
                    (ponto) => ponto.saida && ponto.entrada.uuid === uuid
                )
        );
        if (pontoBatido) {
            return res.status(400).json({
                error: "Ponto de Saída: Você já fez o ponto de saída hoje!",
            });
        }
        const ponto = data.datas.find(
            (data) =>
                data[dataCompleta] &&
                data[dataCompleta].find(
                    (ponto) => ponto.entrada && ponto.entrada.uuid === uuid
                )
        );
        if (!ponto) {
            warns = "Ponto de Saída: Você não fez o ponto de entrada hoje!";
            let temp = {};
            temp[dataCompleta] = [
                {
                    data: dataCompleta,
                    saida: {
                        hora: horaCompleta,
                        uuid: uuid,
                        nome: nome,
                        tipo: "Saída",
                    },
                },
            ];
            data.datas.push(temp);
        }

        data.datas.map((data) => {
            if (data[dataCompleta]) {
                data[dataCompleta].map((ponto) => {
                    if (ponto.entrada && ponto.entrada.uuid === uuid) {
                        (ponto.data = dataCompleta),
                            (ponto.saida = {
                                hora: horaCompleta,
                                uuid: uuid,
                                nome: nome,
                                tipo: "Saída",
                            });
                    }
                });
            }
        });
        await data.markModified("datas");
        await data.save();
        const dataAtualizada = await agendaSchema.findOne({ _id: uid });
        if (!dataAtualizada) {
            return res.status(404).json({
                error: "Ponto de Saída: Erro ao atualizar o banco de dados!",
            });
        }
        const dataDeHoje = dataAtualizada.datas.find(
            (data) =>
                data[dataCompleta] &&
                data[dataCompleta].find(
                    (ponto) => ponto.saida && ponto.saida.uuid === uuid
                )
        );
        if (!dataDeHoje) {
            return res.status(404).json({
                error: "Ponto de Saída: Erro ao atualizar o banco de dados!",
            });
        }
        sendPontoMessage({
            nome,
            telefone,
            data: dataDeHoje[dataCompleta][0].data,
            hora: dataDeHoje[dataCompleta][0].saida.hora,
            tipo: dataDeHoje[dataCompleta][0].saida.tipo,
        });

        return res.status(200).json({
            read: true,
            data: dataDeHoje[dataCompleta][0].data,
            hora: dataDeHoje[dataCompleta][0].saida.hora,
            tipo: dataDeHoje[dataCompleta][0].saida.tipo,
        });
    } else {
        return res.status(400).json({
            error: "Você não pode bater ponto fora do horário aceitável!<br><br>Horário de entrada aceitável pelo sistema: 07:50:00 - 08:30:00<br>Horário de saída: 17:35:00 - 18:30:00",
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

router.post("/registrarCartao", async (req, res) => {
    try {
        const { nome, sobrenome, telefone, uid } = req.body;
        if (!nome || !sobrenome || !telefone)
            return res.status(400).json({ error: "Dados inválidos!" });

        const data = await agendaSchema.findOne({ _id: nome });
        if (data) {
            return res.status(400).json({ error: "Usuário já cadastrado!" });
        }

        const dataDeRegistro = moment().format("DD/MM/YYYY");
        const uuid = nanoid.nanoid(16);
        await agendaSchema.create({
            _id: uid,
            uuid,
            nome,
            sobrenome,
            telefone,
            dataDeRegistro,
            datas: [],
        });

        const updtUser = await agendaSchema.findOne({ _id: uid });
        if (!updtUser) {
            return res
                .status(500)
                .json({ error: "Erro ao cadastrar usuário!" });
        }

        res.status(200).json({
            msg: "Usuário cadastrado com sucesso!",
            code: 100,
            uuid,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/nfc/write", (req, res) => {
    const { uid, uuid, nome, sobrenome, telefone } = req.body;
    if (!uid || !uuid || !nome || !sobrenome || !telefone)
        return res.status(400).json({ error: "Dados inválidos!" });

    try {
        const nfc = new NFC();
        nfc.on("reader", (reader) => {
            reader.on("card", async (card) => {
                if (card.uid != uid)
                    return res.status(400).json({ error: "Cartões Diferem!" });
                await reader.authenticate(4, KEY_TYPE_A, "FFFFFFFFFFFF");
                const data = Buffer.allocUnsafe(16);
                data.fill(0);
                data.write(uuid);
                await reader.write(4, data, 16);

                await reader.authenticate(5, KEY_TYPE_A, "FFFFFFFFFFFF");
                const data2 = Buffer.allocUnsafe(16);
                data2.fill(0);
                data2.write(nome);
                await reader.write(5, data2, 16);

                await reader.authenticate(6, KEY_TYPE_A, "FFFFFFFFFFFF");
                const data3 = Buffer.allocUnsafe(16);
                data3.fill(0);
                data3.write(sobrenome);
                await reader.write(6, data3, 16);

                await reader.authenticate(8, KEY_TYPE_A, "FFFFFFFFFFFF");
                const data4 = Buffer.allocUnsafe(16);
                data4.fill(0);
                data4.write(telefone);
                await reader.write(8, data4, 16);

                res.status(200).json({
                    msg: "Cartão registrado com sucesso!",
                });
                reader.close();
            });
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.post("/nfc/ponto/manual", async (req, res) => {
    try {
        const {
            uid,
            type,
            uuid,
            nome,
            telefone,
            tipoPonto,
            data: dataCompleta,
            hora,
            observacao,
        } = req.body;
        if (
            !uid ||
            !type ||
            !uuid ||
            !nome ||
            !telefone ||
            !tipoPonto ||
            !dataCompleta ||
            !hora
        ) {
            return res.status(400).json({ error: "Dados inválidos!" });
        } else if (
            !moment(dataCompleta, "DD/MM/YYYY").isValid() ||
            !moment(hora, "HH:mm:ss").isValid()
        ) {
            return res.status(400).json({ error: "Data ou hora inválida!" });
        }
        if (tipoPonto === "entrada") {
            const data = await agendaSchema.findOne({ _id: uid });
            if (!data) {
                return res.status(400).json({
                    error: "Ponto de Entrada: Usuário não encontrado!",
                });
            }

            const pontoBatido = data.datas.find(
                (data) =>
                    data[dataCompleta] &&
                    data[dataCompleta].find(
                        (ponto) => ponto.entrada && ponto.entrada.uuid === uuid
                    )
            );

            if (pontoBatido) {
                return res.status(400).json({
                    error: "Ponto de Entrada: Você já fez o ponto de entrada hoje!",
                });
            }

            let temp = {};
            temp[dataCompleta] = [
                {
                    data: dataCompleta,
                    entrada: {
                        hora: hora,
                        uuid: uuid,
                        nome: nome,
                        tipo: "Entrada",
                    },
                },
            ];
            data.datas.push(temp);

            await data.save();

            const dataAtualizada = await agendaSchema.findOne({ _id: uid });
            if (!dataAtualizada) {
                return res.status(404).json({
                    error: "Ponto de Entrada: Erro ao atualizar o banco de dados!",
                });
            }

            const dataDeHoje = dataAtualizada.datas.find(
                (data) =>
                    data[dataCompleta] &&
                    data[dataCompleta].find(
                        (ponto) => ponto.entrada && ponto.entrada.uuid === uuid
                    )
            );
            if (!dataDeHoje) {
                return res.status(404).json({
                    error: "Ponto de Saída: Erro ao atualizar o banco de dados!",
                });
            }
            sendPontoMessage({
                nome,
                telefone,
                data: dataDeHoje[dataCompleta][0].data,
                hora: dataDeHoje[dataCompleta][0].entrada.hora,
                tipo: dataDeHoje[dataCompleta][0].entrada.tipo,
                observacao,
            });
            return res.status(200).json({
                read: true,
                data: dataDeHoje[dataCompleta][0].data,
                hora: dataDeHoje[dataCompleta][0].entrada.hora,
                tipo: dataDeHoje[dataCompleta][0].entrada.tipo,
            });
        } else if (tipoPonto === "saida") {
            const data = await agendaSchema.findOne({ _id: uid });
            if (!data) {
                return res.status(404).json({
                    error: "Ponto de Saída: Usuário não encontrado!",
                });
            }
            const pontoBatido = data.datas.find(
                (data) =>
                    data[dataCompleta] &&
                    data[dataCompleta].find(
                        (ponto) => ponto.saida && ponto.entrada.uuid === uuid
                    )
            );
            if (pontoBatido) {
                return res.status(400).json({
                    error: "Ponto de Saída: Você já fez o ponto de saída hoje!",
                });
            }
            const ponto = data.datas.find(
                (data) =>
                    data[dataCompleta] &&
                    data[dataCompleta].find(
                        (ponto) => ponto.entrada && ponto.entrada.uuid === uuid
                    )
            );
            if (!ponto) {
                warns = "Ponto de Saída: Você não fez o ponto de entrada hoje!";
                let temp = {};
                temp[dataCompleta] = [
                    {
                        data: dataCompleta,
                        saida: {
                            hora: hora,
                            uuid: uuid,
                            nome: nome,
                            tipo: "Saída",
                        },
                    },
                ];
                data.datas.push(temp);
            }

            data.datas.map((data) => {
                if (data[dataCompleta]) {
                    data[dataCompleta].map((ponto) => {
                        if (ponto.entrada && ponto.entrada.uuid === uuid) {
                            (ponto.data = dataCompleta),
                                (ponto.saida = {
                                    hora: hora,
                                    uuid: uuid,
                                    nome: nome,
                                    tipo: "Saída",
                                });
                        }
                    });
                }
            });
            await data.markModified("datas");
            await data.save();
            const dataAtualizada = await agendaSchema.findOne({ _id: uid });
            if (!dataAtualizada) {
                return res.status(404).json({
                    error: "Ponto de Saída: Erro ao atualizar o banco de dados!",
                });
            }
            const dataDeHoje = dataAtualizada.datas.find(
                (data) =>
                    data[dataCompleta] &&
                    data[dataCompleta].find(
                        (ponto) => ponto.saida && ponto.saida.uuid === uuid
                    )
            );
            if (!dataDeHoje) {
                return res.status(404).json({
                    error: "Ponto de Saída: Erro ao atualizar o banco de dados!",
                });
            }
            sendPontoMessage({
                nome,
                telefone,
                data: dataDeHoje[dataCompleta][0].data,
                hora: dataDeHoje[dataCompleta][0].saida.hora,
                tipo: dataDeHoje[dataCompleta][0].saida.tipo,
                observacao,
            });

            return res.status(200).json({
                read: true,
                data: dataDeHoje[dataCompleta][0].data,
                hora: dataDeHoje[dataCompleta][0].saida.hora,
                tipo: dataDeHoje[dataCompleta][0].saida.tipo,
            });
        }
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;
