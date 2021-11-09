'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const table = require(path.resolve('config/database')).tables
const documentImageModel = require(config.model_path + '/m_document_image')

class DocumentImageRepo {
    constructor() {
        this.documentImage = new documentImageModel()
    }

    async getList(unitId) {
        const m = await (this.documentImage.select(
            `IF(${table.unit_document}.Dokumen IS NOT NULL, CONCAT('${config.images.document_unit}', ${table.unit_document}.Image) , '${config.images.document_unit}') AS image`
        ))
        .get({
            IdUnit: unitId
        })

        return m
    }
}

module.exports = DocumentImageRepo