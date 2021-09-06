const path = require('path')
const fs = require('fs')
const config = require(path.resolve('config/config'))

const bidRepo = require(config.repo_path + '/bid_repo')
const auctionDetailRepo = require(config.repo_path + '/auction_detail_repo')

module.exports = function(io) {
    const file = path.resolve('app/last_live.txt')
    const initFile = path.resolve('app/init_live.txt')
    io.on('connection', function(client) {
        console.log('connect to socket')
        client.on('sendBid', function(data) {
            console.log(data)
            client.broadcast.emit('getBid', data)
        })

        client.on('sendCall', function(data) {
            const params = data
            
            const rAuctionDetail = new auctionDetailRepo();
            // const getData = await rAuctionDetail.
            
            // if (getData.length > 0) {
            //     io.emit('getCall', getData[0].Nominal)
            // }
            // else {
            //     io.emit('getCall', 0)
            // }
            // client.broadcast.emit('getCall', data)
        })

        client.on('sendClose', function(data) {
            client.broadcast.emit('getClose', data)
        })

        client.on('newAuction', function(data) {
            client.broadcast.emit('getNewAuction', data)
        })

        client.on('tes', function(data) {
            console.log(data)
        });
        
        client.on('setLastPrice', async function(data) {
            const params = data
            
            const rBid = new bidRepo()
            const getData = await rBid.getLastBid(params.auction_id, params.unit_id)
            
            if (getData.length > 0) {
                io.emit('getLastPrice', getData[0].Nominal)
            }
            else {
                io.emit('getLastPrice', 0)
            }
            
        })
        
        client.on('setLastUserBid', async function(data) {
            const params = data
            
            const rBid = new bidRepo()
            const getData = await rBid.getLastUserBid(params.user_id, params.auction_id, params.unit_id)
            
            if (getData.length > 0) {
                io.emit('getLastPrice', getData[0].Nominal)
            }
            else {
                io.emit('getLastPrice', 0)
            }
            
        })
        
        client.on('setLastLive', async function(data) {
            const {auction_id, unit_id} = data
            const readFile = fs.readFileSync(file, 'utf8')
            const aid = auction_id.replace('-','')
            const key = aid + unit_id
            const json = await JSON.parse(readFile)
            let initContent
            if (typeof(json[auction_id]) != 'undefined') {
                const current = json[auction_id][key]
                if (typeof(current) == 'undefined') {
                    if (typeof(json[auction_id]) != 'undefined') {
                        const newAuction = json[auction_id]
                        const fKey = Object.keys(newAuction)[0]
                        const nextUnit = newAuction[fKey]
                        io.emit('getLastLive', {
                            auction_id: nextUnit.auction_id,
                            unit_id: nextUnit.unit_id,
                            price: nextUnit.price,
                            panggilan: nextUnit.panggilan,
                            is_new: nextUnit.new,
                            unit: nextUnit.unit,
                            galleries: nextUnit.galleries
                        })
                        
                        initContent = json[auction_id]
                        delete json[auction_id]
                    }
                }
                else {
                    io.emit('getLastLive', {
                        auction_id: current.auction_id,
                        unit_id: current.unit_id,
                        price: current.price,
                        panggilan: current.panggilan,
                        is_new: current.new,
                        unit: current.unit,
                        galleries: current.galleries
                    })
                    initContent = json[auction_id]
                    delete json[auction_id]
                }
            }
            
            const jsonString = JSON.stringify(json)
            fs.writeFileSync(file, jsonString)
            
            if (typeof initContent !== 'undefined') {
                let jsonContent;
                if (typeof jsonContent[auction_id] != 'undefined') {
                    jsonContent[auction_id] = initContent
                    const jsonInitString = JSON.stringify(jsonContent)
                    fs.writeFileSync(initFile, jsonInitString)
                }
            }
        })
        
        client.on('initLive', async function(data) {
            const {auction_id} = data
            const readFile = fs.readFileSync(initFile, 'utf8')
            const aid = auction_id.replace('-','')
            const json = await JSON.parse(readFile)
            if (typeof(json[auction_id]) != 'undefined') {
                const k = Object.keys(json[auction_id])
                const key = k[0];
                const current = json[auction_id][key]
                if (typeof(current) == 'undefined') {
                    if (typeof(json[auction_id]) != 'undefined') {
                        const newAuction = json[auction_id]
                        const fKey = Object.keys(newAuction)[0]
                        const nextUnit = newAuction[fKey]
                        io.emit('getLastLive', {
                            auction_id: nextUnit.auction_id,
                            unit_id: nextUnit.unit_id,
                            price: nextUnit.price,
                            panggilan: nextUnit.panggilan,
                            is_new: nextUnit.new,
                            unit: nextUnit.unit,
                            galleries: nextUnit.galleries
                        })
                    }
                }
                else {
                    io.emit('getLastLive', {
                        auction_id: current.auction_id,
                        unit_id: current.unit_id,
                        price: current.price,
                        panggilan: current.panggilan,
                        is_new: current.new,
                        unit: current.unit,
                        galleries: current.galleries
                    })
                }
            }

        })
    })
}