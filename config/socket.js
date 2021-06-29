module.exports = function(io) {
    io.on('connection', function(client) {
        console.log('connect to socket')
        client.on('sendBid', function(data) {
            client.broadcast.emit('getBid', data)
        })

        client.on('sendCall', function(data) {
            client.broadcast.emit('getCall', data)
        })

        client.on('sendClose', function(data) {
            client.broadcast.emit('getClose', data)
        })

        client.on('newAuction', function(data) {
            client.broadcast.emit('getNewAuction', data)
        })

        client.on('tes', function(data) {
            console.log(data)
        })
    })
}