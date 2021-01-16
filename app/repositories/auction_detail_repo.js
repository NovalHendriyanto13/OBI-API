'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const db = require(path.resolve('config/database'))

const auctionDetailModel = require(config.model_path + '/m_auction_detail')

class AuctionDetailRepo {
    constructor() {
        this.auctionDetail = new auctionDetailModel()
    }

    async getAuctionDetail(date1, date2) {
        const q = "SELECT a.IdAuction, IdWilayah, TglAuctionDetails FROM " + this.auctionDetail.tablename
          + " WHERE StartTime >= '" + date1 + "'"
          + " AND EndTime <= '" + date2 + "'"
          + " ORDER BY TglAuctionDetails ASC"

        let m = await this.auctionDetail.raw(q)

        return m
   }
}

module.exports = AuctionDetailRepo