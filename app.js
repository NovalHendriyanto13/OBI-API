const express = require('express')
const config = require('./config/config')
const app = express()
const fs = require('fs')
const port = config.port
const bodyParser = require('body-parser')
var http = require('http').Server(app)

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
 
require('./config/routes')(app, config)
require('./config/socket')(io)
http.listen(port, function() {
    console.log(`Example app listening at http://localhost:${port}`)
})
