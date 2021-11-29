const express = require('express')
const config = require('./config/config')
const app = express()
const fs = require('fs')
const port = config.port
const portHttps = config.port_https
const bodyParser = require('body-parser')
const http = require('http').Server(app)
const https = require('https')
const cors = require('cors')

const credentials = {
    cert: fs.readFileSync(config.cert_file),
    key: fs.readFileSync(config.key_file),
}

const httpsServer = https.createServer(credentials, app)

app.use(cors({
    origin: '*'
}))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
var io = require('socket.io')(http,{
	cors: {
		origin: "*",
		methods: ["GET", "POST"]
	  }
});

app.get('/', (req, res) => {
	res.send("Welcome to Otobid API Application!")
})

app.get('/socket', function(req, res) {
    res.sendFile(__dirname + '/app/views/socket.html');
});

global.io = io
require('./config/routes')(app, config)
require('./config/socket')(io)
http.listen(port, function() {
    console.log(`Example app listening at http://localhost:${port}`)
})
httpsServer.listen(portHttps, function() {
    console.log(`Listening Https at https://localhost:${portHttps}`)
})
