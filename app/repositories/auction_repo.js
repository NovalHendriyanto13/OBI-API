'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const table = require(path.resolve('config/database')).tables
const auctionModel = require(config.model_path + '/m_auction')

class AuctionRepo {
    constructor() {
        this.auction = new auctionModel()
    }

    async getAuction(date1, date2) {
        const q = "SELECT a.IdAuctions, a.IdWilayah, a.TglAuctions, b.Kota FROM " + table.auction +" a"
          + " JOIN ms_wilayah b ON a.IdWilayah = b.IdWilayah"
          + " WHERE StartTime >= '" + date1 + "'"
          + " AND EndTime <= '" + date2 + "'"
          + " ORDER BY TglAuctions ASC"

        let m = await this.auction.raw(q)

        return m
   }
}

module.exports = AuctionRepo