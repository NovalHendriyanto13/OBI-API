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
  
        const m = await (this.auction.select(
          table.auction + '.IdAuctions,' +
          table.auction + '.IdWilayah,' +
          table.auction + '.Online,' +
          "DATE_FORMAT(" + table.auction + ".TglAuctions, '%a, %e %M %Y') as TglAuctions," +
          "DATE_FORMAT(" + table.auction + ".TglAuctions, '%Y-%m-%e') as r_TglAuctions," +
          table.area + '.Kota'
        ))
        .join(table.area, table.area + '.IdWilayah = ' + table.auction +'.IdWilayah')
        .where(where)
        .get(null, table.auction + '.TglAuctions ASC')

        return m
   }
}

module.exports = AuctionRepo