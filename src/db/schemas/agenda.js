const {Schema, model} = require('mongoose');

const agendaSchema = new Schema({
    _id: {type: String, required: true},
    uuid: {type: String, required: true},
    nome: {type: String, required: true},
    sobrenome: {type: String, required: true},
    telefone: {type: String, required: true},
    dataDeRegistro: {type: String, required: true},
    datas: {type: [{}], required: true}
})

module.exports = model("Agenda", agendaSchema)