'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const table = require(path.resolve('config/database')).tables
const bidModel = require(config.model_path + '/m_bid')

class BidRepo {
    constructor() {
        this.bid = new bidModel()
    }

    async getList(userId) {
        let where = []
        where[table.bid + '.UserID'] = userId
        where[table.bid + '.Online'] = 'tender'

        const m = await (this.bid.select(
            table.bid + '.NoLOT,' +
            table.bid + '.statusbidx,' +
            table.unit + '.NoPolisi,' +
            table.auction + '.IdAuctions,' + 
            "DATE_FORMAT(" + table.auction + ".TglAuctions, '%e %M %Y') AS TglAuctions"
        ))
        .join(table.auction, table.bid + '.IdAuctions = ' + table.auction + '.IdAuctions')
        .join(table.unit, table.bid + '.IdUnit = ' + table.unit + '.IdUnit', 'left')
        .join(table.auction_detail, table.bid + '.IdUnit = ' + table.auction_detail + '.IdUnit AND ' + 
            table.auction_detail + '.Status = 2 AND ' +
            table.auction + '.IdAuctions = ' + table.auction_detail + '.IdAuctions', 'left')
        .get(where, table.auction + '.TglAuctions DESC')

        return m
    }

    async maxBid(idAuction, idUnit, noLot) {
        let where = []
        where['IdAuctions'] = idAuction
        where['IdUnit'] = idUnit
        where['NoLot'] = noLot

        const m = await this.bid.select('Nominal').getOne(where, 'Nominal DESC')

        return m
    }

    async getRemaining(userId, auctionId) {
        const m = await (this.bid.select('UserID')).get({
            'UserID': userId,
            'IdAuctions': auctionId, 
            'statusbidx': 'berjalan',
        })

        return m
    }

    async getLastBid(auctionId, unitId) {
        const m = await (this.bid.select('Nominal')).getOne({
            'IdUnit': unitId,
            'IdAuctions': auctionId, 
        }, 'BidTime Desc')

        return m
    }
}

module.exports = BidRepo