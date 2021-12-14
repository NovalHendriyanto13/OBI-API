'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const table = require(path.resolve('config/database')).tables
const helper = require(path.resolve('app/utils/helper'))

const unitModel = require(config.model_path + '/m_unit')
const auctionDetailModel = require(config.model_path + '/m_auction_detail')

class UnitRepo {
    constructor() {
        this.unit = new unitModel()
        this.auctionDetail = new auctionDetailModel()
    }

    async getDetail(id) {
        let data
        const date = helper.dateNow()
        let where = []
        where[table.unit + '.IdUnit ='] = id
        // where[table.auction + '.TglAuctions >='] = date

        let detail = await (this.unit.select(
            table.auction + '.IdAuctions,' +
            table.auction_detail + '.NoLot,' +
            table.auction_detail + '.HargaLimit,' +
            table.unit + '.IdUnit, ' +
            table.unit + '.NoPolisi,' +
            table.unit + '.Merk, ' +
            table.unit + '.Tipe, ' + 
            table.unit + '.Tahun, ' +
            table.unit + '.Transmisi, ' +
            table.unit + '.Warna, ' +
            table.unit + '.Kilometer, ' +
            "IF(" + table.unit + ".GradeMesin = 4, 'A',IF("+ table.unit +".GradeMesin = 3, 'B',IF("+ table.unit +".GradeMesin = 2, 'C',IF("+ table.unit +".GradeMesin = 1, 'D','E')))) as GradeMesin, " +
            "IF(" + table.unit + ".GradeInterior = 4, 'A',IF("+ table.unit +".GradeInterior = 3, 'B',IF("+ table.unit +".GradeInterior = 2, 'C',IF("+ table.unit +".GradeInterior = 1, 'D','E')))) as GradeInterior, " +
            "IF(" + table.unit + ".GradeExterior = 4, 'A',IF("+ table.unit +".GradeExterior = 3, 'B',IF("+ table.unit +".GradeExterior = 2, 'C',IF("+ table.unit +".GradeExterior = 1, 'D','E')))) as GradeExterior, " +
            "DATE_FORMAT(" + table.unit + ".TglBerlakuSTNK, '%e %M %Y') AS TglBerlakuSTNK, " +
            "DATE_FORMAT(" + table.unit + ".TglBerlakuPajak, '%e %M %Y') AS  TglBerlakuPajak," +
            "CONCAT('" + config.images.unit + "', " + table.unit_image + ".image) AS image"
          ))
          .join(table.auction_detail, table.unit + '.IdUnit =' + table.auction_detail + '.IdUnit', 'left')
          .join(table.auction, table.auction +'.IdAuctions = ' + table.auction_detail + '.IdAuctions', 'left')
          .join(table.unit_image, table.unit + '.IdUnit = ' + table.unit_image + '.IdUnit AND UrutDepan=1', 'left')
          .where(where)
          .getOne(null, table.auction + '.TglAuctions DESC')

        data = detail

        return data
    }

}

module.exports = UnitRepo