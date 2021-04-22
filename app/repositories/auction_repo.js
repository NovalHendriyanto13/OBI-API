'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const table = require(path.resolve('config/database')).tables
const auctionModel = require(config.model_path + '/m_auction')

class AuctionRepo {
    constructor() {
        this.auction = new auctionModel()
    }

    async getAuction(date1) {
        const q = "SELECT a.IdAuctions, a.IdWilayah, DATE_FORMAT(a.TglAuctions, '%a, %e %M %Y') as TglAuctions, DATE_FORMAT(a.TglAuctions, '%Y-%m-%e') as r_TglAuctions, b.Kota FROM " + table.auction +" a"
          + " JOIN ms_wilayah b ON a.IdWilayah = b.IdWilayah"
          + " WHERE a.TglAuctions >= '" + date1 + "'"
          + " ORDER BY a.TglAuctions ASC"
          
        let m = await this.auction.raw(q)

        return m
   }
}

module.exports = AuctionRepo