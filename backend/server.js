const express = require('express')
const cors = require('cors')
require('dotenv').config()

const Port = process.env.Port || 3500

const server = express()
server.use(cors())
server.use(express.json())

server.use('/predict', require('./routes/predictRoute'))
server.get('/get', (req, res) => {
    console.log(123)
})

server.listen(Port, () => console.log("Running on Port"))