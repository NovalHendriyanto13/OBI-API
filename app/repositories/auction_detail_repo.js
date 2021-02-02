'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const table = require(path.resolve('config/database')).tables

const auctionDetailModel = require(config.model_path + '/m_auction_detail')
const auctionModel = require(config.model_path + '/m_auction')

class AuctionDetailRepo {
    constructor() {
        this.auctionDetail = new auctionDetailModel()
        this.auction = new auctionModel()
    }

   async getAuctionDetail(idAuction) {
     let data = await this.auction.getId(idAuction)
    
     let where = []
     where[table.auction + '.IdAuctions'] = idAuction
     let detail = await (this.auctionDetail.select(
         table.auction + '.IdAuctions,' +
         table.auction_detail + '.NoLot,' +
         table.unit + '.NoPolisi' 
       ))
       .join(table.auction, table.auction +'.IdAuctions = ' + table.auction_detail + '.IdAuctions', 'left')
       .join(table.unit, table.unit + '.IdUnit =' + table.auction_detail + '.IdUnit', 'left')
       .get(where)

      data[0]['detail'] = detail

      return data

   }
}

module.exports = AuctionDetailRepo