const express = require('express')
const config = require('./config/config')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
var http = require('http').Server(app);
var io = require('socket.io')(http,{
	cors: {
		origin: "*",
		methods: ["GET", "POST"]
	  }
});

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
	res.send("Welcome to Otobid API Application!")
})

app.set('socketio', io)

require('./config/routes')(app, config)
require('./config/socket')(io)
http.listen(port)
