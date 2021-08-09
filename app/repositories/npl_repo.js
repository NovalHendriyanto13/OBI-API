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
        const m = await (this.npl.select(
            table.npl + '.TransID,' +
            table.npl + '.Jenis,' +
            table.npl + '.IdAuctions,' +
            table.npl + '.NPL,' +
            table.npl + '.Deposit,' +
            table.npl + '.Nominal,' +
            table.npl + '.Closed,' +
            table.npl + '.Verifikasi,' +
            table.npl + ".NoLot," +
            "DATE_FORMAT(" + table.auction + ".TglAuctions, '%e %M %Y') AS TglAuctions"
        ))
        .join(table.auction, table.npl + '.IdAuctions = ' + table.auction + '.IdAuctions')
        .get({
            UserID: userId
        }, table.auction + '.TglAuctions DESC')

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

    async getRemaining(userId, auctionId) {
        const m = await (this.npl.select('NPL')).get({
            UserID: userId,
            IdAuctions: auctionId, 
            Online: '1',
            Verifikasi: '1',
            Closed: '0'
        })

        return m
    }
}

module.exports = NplRepo