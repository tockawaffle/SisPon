require("module-alias/register");
const { NFC, KEY_TYPE_A, CONNECT_MODE_DIRECT } = require("nfc-pcsc");
const nfc = new NFC();
const { writeLogs } = require("../misc/writeLog");

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
                writeLogs("[ NFC: Erro ] Não há nenhum leitor NFC conectado na máquina! Por favor, conecte um, ou veja se o dispositivo que você utiliza é compativel com este programa.\nDispositivo Compativel: ACR 122U USB NFC Reader")
            }
        }, 5000)
    }
};
