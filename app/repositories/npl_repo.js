'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const table = require(path.resolve('config/database')).tables
const nplModel = require(config.model_path + '/m_npl')

class NplRepo {
    constructor() {
        this.npl = new nplModel()
    }

    async getList(userId) {
        const m = await this.npl.get({
            UserID: userId
        })
        return m
    }

    async getActive(userId) {
        const m = await this.npl.get({
            UserID: userId,
            Online: 1,
            Verifikasi: 1,
            Closed: 0,
            NoLot: '',
        })
        return m
    }

    async getActiveByAuction(userId, auctionId, type) {
        const m = await this.npl.get({
            UserID: userId,
            IdAuctions: auctionId,
            Online: 1,
            Verifikasi: 1,
            Closed: 0,
            NoLot: '',
            Jenis: type
        })
        return m
    }

    async getValidNpl(userId, nplNo, auctionId, type) {
        const m = await this.npl.getOne({
            UserID: userId,
            IdAuctions: auctionId,
            Online: 1,
            Verifikasi: 1,
            Closed: 0,
            NoLot: '',
            Jenis: type,
            NPL: nplNo,
        });
        return m
    }
}

module.exports = NplRepo