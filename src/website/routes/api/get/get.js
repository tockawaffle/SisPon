const router = require('express').Router();
const {NFC, KEY_TYPE_A} = require('nfc-pcsc');

router.get('/nfc', async(req, res) => {
    
    const nfc = new NFC();
    nfc.on('reader', async(reader) => {
        try {
            reader.on('card', async(card) => {
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
                    uuid: payload1,
                    nome: payload2,
                    sobrenome: payload3,
                    telefone: payload4,
                };

                return res.json({
                    read: true,
                    error: null,
                    payload
                });
            });
        } catch (error) {
            return res.json({
                read: false,
                error: error.message
            });
        }
    });

})

module.exports = router;