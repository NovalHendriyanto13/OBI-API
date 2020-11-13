const express = require('express')
const config = require('./config/config')
const app = express()
const port = 3000
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());

app.get('/', (req, res) => {
	res.send("Welcome to Otobid API Application!")
})

require('./config/routes')(app, config)

app.listen(port, () => {
	  console.log(`Example app listening at http://localhost:${port}`)
})
