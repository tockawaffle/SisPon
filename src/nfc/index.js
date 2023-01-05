require("module-alias/register");
const { NFC, KEY_TYPE_A, CONNECT_MODE_DIRECT } = require("nfc-pcsc");
const nfc = new NFC();

module.exports = {
    nfc,
    start: async () => {
        nfc.on("reader", async (reader) => {
            console.log(
                `\x1b[35m%s\x1b[0m`,
                `[ NFC ]`,
                `Leitor NFC conectado.`
            );
        });
    },
    onCard: (callback) => {
        nfc.on("reader", async(reader) => {
            try {
                reader.on("card", async (card) => {
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
                        uid: payload1,
                        nome: payload2,
                        sobrenome: payload3,
                        telefone: payload4,
                    };
    
                    return callback({
                        read: true,
                        error: null,
                        payload
                    });
                });
            } catch (error) {
                return callback({
                    read: false,
                    error: error.message
                });
            }
        });
    },
    registerNewCard: async (uid, nome, sobrenome, telefone, callback) => {
        const uidBytes = new TextEncoder().encode(uid).length;
        const nomeBytes = new TextEncoder().encode(nome).length;
        const sobrenomeBytes = new TextEncoder().encode(sobrenome).length;
        const telefoneBytes = new TextEncoder().encode(telefone).length;

        if (
            uidBytes > 16 ||
            nomeBytes > 16 ||
            sobrenomeBytes > 16 ||
            telefoneBytes > 16
        ) {
            callback({
                writen: false,
                error: "Algum dos dados é maior que 16 bytes.",
            });
            return;
        }

        nfc.on("reader", (reader) => {
            reader.on("card", async (card) => {
                try {
                    // Write the uid at the 4th block, the name at the 5th block, the surname at the 6th block and the phone at the 8th block
                    // await Promise.all([
                    //     reader.authenticate(4, KEY_TYPE_A, "FFFFFFFFFFFF"),
                    //     reader.authenticate(5, KEY_TYPE_A, "FFFFFFFFFFFF"),
                    //     reader.authenticate(6, KEY_TYPE_A, "FFFFFFFFFFFF"),
                    //     reader.authenticate(8, KEY_TYPE_A, "FFFFFFFFFFFF"),
                    // ]);

                    await reader.authenticate(4, KEY_TYPE_A, "FFFFFFFFFFFF");
                    const data = Buffer.allocUnsafe(16);
                    data.fill(0);
                    data.write(uid);
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

                    callback({
                        writen: true,
                    });
                } catch (error) {
                    callback({
                        writen: false,
                        error: error.message,
                    });
                }
            });
        });
    },
};
