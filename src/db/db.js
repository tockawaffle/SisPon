const {connect, set} = require("mongoose")

const connectDB = async () => {
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
        console.error(error)
        process.exit(1)
    }
}

module.exports = connectDB
