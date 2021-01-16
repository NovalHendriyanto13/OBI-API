'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))

const Model = require(config.model_path + '/Model')

class AuctionDetail extends Model {
    constructor() {
        super()
        this.tablename = 'ms_auctions_unit'
        this.primaryKey = 'IdAuctions'
    }

}

module.exports = AuctionDetail