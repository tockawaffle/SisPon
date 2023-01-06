const { NFC, KEY_TYPE_A } = require("nfc-pcsc");
const router = require("express").Router();
const agendaSchema = require("@db/schemas/agenda.js");
const moment = require("moment");

router.get("/nfc", async (req, res) => {
    const nfc = new NFC();
    return nfc.on("reader", async (reader) => {
        try {
            return reader.on("card", async (card) => {
                const uid = card.uid;
                const type = card.type;
                await reader.authenticate(4, KEY_TYPE_A, "FFFFFFFFFFFF");
                const data = await reader.read(4, 16);
                const payload1 = data.toString("utf8");

                await reader.authenticate(5, KEY_TYPE_A, "FFFFFFFFFFFF");
                const data2 = await reader.read(5, 16);
                const payload2 = data2.toString("utf8");

                await reader.authenticate(6, KEY_TYPE_A, "FFFFFFFFFFFF");
                const data3 = await reader.read(6, 16);
                const payload3 = data3.toString("utf8");

                await reader.authenticate(8, KEY_TYPE_A, "FFFFFFFFFFFF");
                const data4 = await reader.read(8, 16);
                const payload4 = data4.toString("utf8");

                const payload = {
                    uid,
                    type,
                    uuid: await payload1,
                    nome: await payload2,
                    sobrenome: await payload3,
                    telefone: await payload4,
                };
                res.status(200).json({
                    read: true,
                    error: null,
                    payload,
                });
                reader.close();
            });
        } catch (error) {
            return res.status(500).json({
                read: false,
                error: error.message,
            });
        }
    });
});

router.get("/nfc/read", async (req, res) => {
    const nfc = new NFC();
    nfc.on("reader", async (reader) => {
        
        try {
            return reader.on("card", async (card) => {
                const uid = card.uid;

                res.json({
                    read: true,
                    error: null,
                    uid,
                });
                reader.close();
            });
        } catch (error) {
            return res.status(500).json({
                read: false,
                error: error.message,
                uid: null,
            });
        }
    });
});

router.get("/nfc/read/authorized", async (req, res) => {
    const nfc = new NFC();
    nfc.on("reader", async (reader) => {
        try {
            return reader.on("card", async (card) => {
                const uid = card.uid;
                
                const checkCard = await agendaSchema.findOne({_id: uid})
                if(!checkCard) {
                    return res.status(401).json({
                        read: false,
                        error: "Cartão não autorizado",
                        uid: null,
                    });
                }

                const type = card.type;
                await reader.authenticate(4, KEY_TYPE_A, "FFFFFFFFFFFF");
                const data = await reader.read(4, 16);
                const payload1 = data.toString("utf8");

                await reader.authenticate(5, KEY_TYPE_A, "FFFFFFFFFFFF");
                const data2 = await reader.read(5, 16);
                const payload2 = data2.toString("utf8");

                await reader.authenticate(6, KEY_TYPE_A, "FFFFFFFFFFFF");
                const data3 = await reader.read(6, 16);
                const payload3 = data3.toString("utf8");

                await reader.authenticate(8, KEY_TYPE_A, "FFFFFFFFFFFF");
                const data4 = await reader.read(8, 16);
                const payload4 = data4.toString("utf8");

                const payload = {
                    uid,
                    type,
                    uuid: await payload1,
                    nome: await payload2,
                    sobrenome: await payload3,
                    telefone: await payload4,
                };
                res.status(200).json({
                    read: true,
                    error: null,
                    payload,
                });
                reader.close();
            });
        } catch (error) {
            return res.status(500).json({
                read: false,
                error: error.message,
            });
        }
    });
});

router.get("/horarios", async(req, res) => {
    const horarios = await agendaSchema.find();
    const dataHoje  = moment().format("DD/MM/YYYY");
    const horariosHoje = horarios.filter(horario => {
        const data = horario.datas // "DD/MM/YYYY": {hora: "HH:MM:SS", uuid: "", nome: ""}
        return data.filter(data => {
            return data[dataHoje]
        })
    })

    //Formatar os dados para o front
    const horariosFormatados = horariosHoje.map(horario => {
        const data = horario.datas;
        const dataFormatada = data.filter(data => {
            return data[dataHoje]
        })
        const tData = dataFormatada[0][dataHoje]
        const entrada = tData.map(t => {
            return t.entrada ?? "Ainda não entrou"
        })
        const saida = tData.map(t => {
            return t.saida ?? "Ainda não saiu"
        })

        return {
            nome: horario.nome + " " + horario.sobrenome,
            entrada,
            saida
        }
    })

    res.status(200).json({
        horarios: horariosFormatados
    })
    
})

module.exports = router;
