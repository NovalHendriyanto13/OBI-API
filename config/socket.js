module.exports = function(io) {
    io.on('connection', function(client) {
        console.log('connect to socket')
        client.on('tes', function(data) {
            console.log(data)
        })
    })
}