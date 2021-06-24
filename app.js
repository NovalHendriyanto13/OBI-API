const express = require('express')
const config = require('./config/config')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server)

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.io = io

app.get('/', (req, res) => {
	res.send("Welcome to Otobid API Application!")
})

require('./config/routes')(app, config)
// require('./config/socket')(io)
io.on('connection', function(socket){
	console.log('a user connected');
  
	socket.emit('tx', 'msg');
  
	socket.on('disconnect', function(){
	  console.log('user disconnected');
	});
  });

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})
