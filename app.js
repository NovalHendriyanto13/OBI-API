const express = require('express')
const config = require('./config/config')
const app = express()
const cors = require('cors')
const fs = require('fs')
const port = 3000
const portHttps = 3443
const bodyParser = require('body-parser')
// const https = require('https')
var http = require('http').Server(app)

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
// app.use(cors({
//     origin: '*'
// }))
// app.use((req, res, next)=> {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//     // Request headers you wish to allow
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.setHeader('Access-Control-Allow-Credentials', true);

//     next();
// })

// const credentials = {
//     cert: fs.readFileSync('/usr/src/ssl/certs/api_otobid_co_id_db60f_785d7_1627603199_8c62f4af2cf28b7b2b18aea149a4d4ad.crt').toString(),
//     // ca: fs.readFileSync('/usr/src/ssl/certs/api_otobid_co_id_db60f_785d7_1627603199_8c62f4af2cf28b7b2b18aea149a4d4ad.crt.cache').toString(),
//     key: fs.readFileSync('/usr/src/ssl/keys/db60f_785d7_0b4db53ac173edebe15c576287f0b741.key').toString(),
// }

// const httpsServer = https.createServer(credentials, app)
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
// httpsServer.listen(portHttps, function() {
//     console.log(`Example app listening at http://localhost:${portHttps}`)
// })
