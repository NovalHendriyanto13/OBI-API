'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const table = require(path.resolve('config/database')).tables
const unitImageModel = require(config.model_path + '/m_unit_image')

class UnitImageRepo {
    constructor() {
        this.unitImage = new unitImageModel()
    }

    async getList(unitId) {
        const m = await (this.unitImage.select(
            `IF(${table.unit_image}.Image IS NOT NULL, CONCAT('${config.images.unit}', ${table.unit_image}.Image) , '${config.images.default_unit}') AS image`
        ))
        .get({
            IdUnit: unitId
        }, table.unit_image + '.UrutDepan DESC')

        return m
    }
}

module.exports = UnitImageRepo