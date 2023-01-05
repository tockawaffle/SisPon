const {Schema, model} = require('mongoose');

const adminSchema = new Schema({
    _id: {type: String, required: true},
    senha: {type: String, required: true},
})

module.exports = model("Administrador", adminSchema)