require("dotenv").config();
const tBot = require("node-telegram-bot-api");
const writeLogs = require("../misc/writeLog")

try {
    const bot = new tBot(process.env.TELEGRAM_BOT, { polling: true });
    console.log(
        `\x1b[35m%s\x1b[0m`,
        `[ Telegram ] >`,
        `Bot Iniciado com Sucesso!`
    );

    function sendPontoMessage({
        nome,
        telefone,
        data,
        hora,
        tipo,
        observação,
    }) {
        if (!nome || !telefone || !data || !hora || !tipo) {
            return "Dados insuficientes para notificar o ponto.";
        }
        const message = `
        *Novo Ponto Registrado*\n\nNome: ${nome}\nTelefone: ${telefone}\nData: ${data} - ${hora}\nTipo de Ponto: ${tipo}\nObservação: ${
            observação ?? "Nenhuma a ser feita."
        }
    `;
        bot.sendMessage("-771627713", message, {
            parse_mode: "Markdown",
        });
    }

    bot.onText(/\/start/ || /\/iniciar/, (msg) => {
        bot.sendMessage(
            msg.chat.id,
            "Olá!\nEste é o bot OFICIAL da empresa Guarufix Ferramentas e Fixações LTDA!\nVeja abaixo alguns de nossos comandos:",
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "Nosso Endereço!", callback_data: "address" }],
                        [{ text: "Nosso Site!", callback_data: "site" }],
                        [
                            {
                                text: "Nossos Contatos!",
                                callback_data: "contacts",
                            },
                        ],
                        // [{ text: "Nossos Produtos!", callback_data: "products" }],
                        // [{ text: "Nossos Termos de Uso!", callback_data: "TOS" }],
                    ],
                },
            }
        );
    });

    bot.on("callback_query", (cb) => {
        const { data, message } = cb;

        switch (data) {
            case "address": {
                bot.sendMessage(
                    message.chat.id,
                    "São Paulo, Guarulhos\nAv. Antônio Iervolino, 130 - Vila Ristori, CEP: 07021-160\n\n[Google Maps](https://goo.gl/maps/4tGug8X99ykYsUTQ7)\n[Waze](https://ul.waze.com/ul?place=ChIJdRFy9l_1zpQRIEsiE_WZ6iE&ll=-23.47558660%2C-46.53481160&navigate=yes&utm_campaign=default&utm_source=waze_website&utm_medium=lm_share_location)",
                    {
                        parse_mode: "Markdown",
                    }
                );
                bot.sendLocation(message.chat.id, -23.4734907, -46.5327442);
                break;
            }
            case "site": {
                bot.sendMessage(
                    message.chat.id,
                    "Aqui você pode ver muitas coisas sobre nós, como: Endereço correto, Contatos, Produtos, Termos de Uso, etc.\n\n[Guarufix Ferramentas e Fixações LTDA](https://guarufix.com.br/)"
                );
                break;
            }
            case "contacts": {
                bot.sendMessage(
                    message.chat.id,
                    "Telefone Fixo: +55 11 49659500\nTelefone Celular (WhatsApp): +55 11 932016742\nE-mails: junior@guarufix.com.br - alexandre@guarufix.com.br"
                );
                break;
            }
        }
    });

    module.exports = { sendPontoMessage };
} catch (error) {
    writeLogs(error.message)
}
