'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const table = require(path.resolve('config/database')).tables
const auctionModel = require(config.model_path + '/m_auction')

class AuctionRepo {
    constructor() {
        this.auction = new auctionModel()
    }

    async getAuction(date) {
        let where = []
        where[table.auction + '.TglAuctions >= '] = date
        // where[table.auction + '.Online <>'] = 'floor'
  
        const m = await (this.auction.select(
          table.auction + '.IdAuctions,' +
          table.auction + '.IdWilayah,' +
          table.auction + '.Online,' +
          "DATE_FORMAT(" + table.auction + ".TglAuctions, '%a, %e %M %Y') as TglAuctions," +
          "DATE_FORMAT(" + table.auction + ".TglAuctions, '%Y-%m-%d') as r_TglAuctions," +
          "DATE_FORMAT(" + table.auction + ".StartTime, '%T') AS StartTime," +
          "DATE_FORMAT(" + table.auction + ".EndTime, '%T') AS EndTime," +
          table.area + '.Kota'
        ))
        .join(table.area, table.area + '.IdWilayah = ' + table.auction +'.IdWilayah')
        .where(where)
        .get(null, table.auction + '.TglAuctions ASC')

        return m
   }
}

module.exports = AuctionRepo