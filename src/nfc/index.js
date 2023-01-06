require("module-alias/register");
const { NFC, KEY_TYPE_A, CONNECT_MODE_DIRECT } = require("nfc-pcsc");
const nfc = new NFC();

module.exports = {
    nfc,
    start: async () => {
        //Check if NFC is available
        let nfcAvailable;
        nfc.on("reader", async (reader) => {
            nfcAvailable = true;
            console.log(
                `\x1b[35m%s\x1b[0m`,
                `[ NFC ]`,
                `Leitor NFC conectado: ${reader.name}`
            );
        });

        setTimeout(() => {
            if (!nfcAvailable) {
                console.log(
                    `\x1b[31m%s\x1b[0m`,
                    `[ NFC: Erro ]`,
                    `Leitor NFC não encontrado`
                );
                process.exit(1);
            }
        }, 5000)
    }
};
