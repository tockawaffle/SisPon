const {connect, set} = require("mongoose")
const {writeLogs} = require("../misc/writeLog")

const connectDB = async () => {
    console.log(`\x1b[32m%s\x1b[0m`, `[ MongoDB ]`, `Conectando na base de dados. . .`)
    try {
        set('strictQuery', false);
        const conn = await connect(process.env.MONGO_URI, {
            keepAlive: true,
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        
        console.log(
            `\x1b[32m%s\x1b[0m`,
            `[ MongoDB ]`,
            `Conectado com sucesso ao banco de dados ${conn.connection.name}.`
        )
    } catch (error) {
        await writeLogs("[ Handler ] > Conectando na base de dados. . .\n[ Handler: Erro ] > Base de Dados não conectada, segue o erro: " + error.message)
        console.log(error.message)
    }
}

module.exports = connectDB
