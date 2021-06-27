'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const table = require(path.resolve('config/database')).tables
const helper = require(path.resolve('app/utils/helper'))

const auctionDetailModel = require(config.model_path + '/m_auction_detail')
const auctionModel = require(config.model_path + '/m_auction')

class AuctionDetailRepo {
    constructor() {
        this.auctionDetail = new auctionDetailModel()
        this.auction = new auctionModel()
    }

    async getAuctionUnit(params, order='') {
      let data

      if (order == '') {
        order = table.auction_detail + '.NoLot ASC'
      }
     
      const date = helper.dateNow()
      let where = []
      where[table.auction + '.TglAuctions >= '] = date
      for(const i in params) {
        where[i] = params[i]
      }
 
      let detail = await (this.auctionDetail.select(
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
          table.unit + '.Jenis, ' +
          "IF(" + table.unit + ".GradeMesin = 4, 'A',IF("+ table.unit +".GradeMesin = 3, 'B',IF("+ table.unit +".GradeMesin = 2, 'C',IF("+ table.unit +".GradeMesin = 1, 'D','E')))) as GradeMesin, " +
          "IF(" + table.unit + ".GradeInterior = 4, 'A',IF("+ table.unit +".GradeInterior = 3, 'B',IF("+ table.unit +".GradeInterior = 2, 'C',IF("+ table.unit +".GradeInterior = 1, 'D','E')))) as GradeInterior, " +
          "IF(" + table.unit + ".GradeExterior = 4, 'A',IF("+ table.unit +".GradeExterior = 3, 'B',IF("+ table.unit +".GradeExterior = 2, 'C',IF("+ table.unit +".GradeExterior = 1, 'D','E')))) as GradeExterior, " +
          "DATE_FORMAT(" + table.unit + ".TglBerlakuSTNK, '%e %M %Y') AS TglBerlakuSTNK, " +
          "DATE_FORMAT(" + table.unit + ".TglBerlakuPajak, '%e %M %Y') AS  TglBerlakuPajak," +
          "DATE_FORMAT(" + table.auction + ".StartTime, '%T') AS StartTime," +
          "DATE_FORMAT(" + table.auction + ".EndTime, '%T') AS EndTime," +
          "DATE_FORMAT(" + table.auction + ".TglAuctions, '%Y-%m-%e') as r_TglAuctions," +
          "IF(" + table.unit_image + ".image IS NOT NULL, CONCAT('" + config.images.unit + "', " + table.unit_image + ".image) , '" + config.images.default_unit + "') AS image"
        ))
        .join(table.auction, table.auction +'.IdAuctions = ' + table.auction_detail + '.IdAuctions', 'left')
        .join(table.unit, table.unit + '.IdUnit =' + table.auction_detail + '.IdUnit', 'left')
        .join(table.unit_image, table.unit + '.IdUnit = ' + table.unit_image + '.IdUnit AND UrutDepan=1', 'left')
        .where(where)
        .get(null, order)
 
       data = detail
 
       return data
 
    }

   async getAuctionDetail(idAuction, params, order='') {
     if (order == '') {
      order = table.auction_detail + '.NoLot ASC'
     }
     let data = await this.auction.select(
        "IdAuctions," + 
        "DATE_FORMAT(TglAuctions, '%e %M %Y') AS TglAuctions," +
        "DATE_FORMAT(StartTime, '%T') AS StartTime," +
        "DATE_FORMAT(EndTime, '%T') AS EndTime," +
        "DATE_FORMAT(TglAuctions, '%Y-%m-%e') as r_TglAuctions," +
        "IdWilayah," +
        "Closed," +
        "Online"
      )
      .getId(idAuction)
    
     let where = []
     where[table.auction + '.IdAuctions ='] = idAuction
     for(const i in params) {
       where[i] = params[i]
     }
     let detail = await (this.auctionDetail.select(
         table.auction + '.IdAuctions,' +
         table.auction + '.Online, ' +
         table.auction_detail + '.NoLot,' +
         table.auction_detail + '.HargaLimit,' +
         table.unit + '.IdUnit, ' +
         table.unit + '.NoPolisi,' +
         table.unit + '.Merk, ' +
         table.unit + '.Tipe, ' + 
         table.unit + '.Tahun, ' +
         table.unit + '.Transmisi, ' +
         table.unit + '.Warna, ' +
         table.unit + '.Jenis, ' +
         "IF(" + table.unit + ".GradeMesin = 4, 'A',IF("+ table.unit +".GradeMesin = 3, 'B',IF("+ table.unit +".GradeMesin = 2, 'C',IF("+ table.unit +".GradeMesin = 1, 'D','E')))) as GradeMesin, " +
         "IF(" + table.unit + ".GradeInterior = 4, 'A',IF("+ table.unit +".GradeInterior = 3, 'B',IF("+ table.unit +".GradeInterior = 2, 'C',IF("+ table.unit +".GradeInterior = 1, 'D','E')))) as GradeInterior, " +
         "IF(" + table.unit + ".GradeExterior = 4, 'A',IF("+ table.unit +".GradeExterior = 3, 'B',IF("+ table.unit +".GradeExterior = 2, 'C',IF("+ table.unit +".GradeExterior = 1, 'D','E')))) as GradeExterior, " +
         "DATE_FORMAT(" + table.unit + ".TglBerlakuSTNK, '%e %M %Y') AS TglBerlakuSTNK, " +
         "DATE_FORMAT(" + table.unit + ".TglBerlakuPajak, '%e %M %Y') AS  TglBerlakuPajak," +
         "IF(" + table.unit_image + ".image IS NOT NULL, CONCAT('" + config.images.unit + "', " + table.unit_image + ".image) , '" + config.images.default_unit + "') AS image"
       ))
       .join(table.auction, table.auction +'.IdAuctions = ' + table.auction_detail + '.IdAuctions', 'left')
       .join(table.unit, table.unit + '.IdUnit =' + table.auction_detail + '.IdUnit', 'left')
       .join(table.unit_image, table.unit + '.IdUnit = ' + table.unit_image + '.IdUnit AND UrutDepan=1', 'left')
       .where(where)
       .get(null, order)

      data[0]['detail'] = detail

      return data
   }

   async auctionInfo(idAuction, idUnit, noLot) {
     let where = []
     where[table.auction + '.IdAuctions'] = idAuction
     where[table.unit + '.IdUnit'] = idUnit
     where[table.auction_detail + '.NoLot'] = noLot

    let data = await (this.auctionDetail.select(
      table.auction + '.IdAuctions,' +
      "DATE_FORMAT(" + table.auction + ".TglAuctions, '%e %M %Y') AS TglAuctions," +
      "DATE_FORMAT(" + table.auction + ".StartTime, '%T') AS StartTime," +
      "DATE_FORMAT(" + table.auction + ".EndTime, '%T') AS EndTime," +
      table.auction + '.Online,' +
      table.auction_detail + '.NoLot,' +
      table.auction_detail + '.Open,' +
      table.unit + '.HargaLimit,' +
      table.unit + '.IdUnit, ' +
      table.unit + '.Jenis,' +
      table.unit + '.StatusUnit '
    ))
    .join(table.auction, table.auction +'.IdAuctions = ' + table.auction_detail + '.IdAuctions', 'left')
    .join(table.unit, table.unit + '.IdUnit =' + table.auction_detail + '.IdUnit', 'left')
    .getOne(where, table.auction_detail + '.NoLot ASC')

    return data
  }
}

module.exports = AuctionDetailRepo