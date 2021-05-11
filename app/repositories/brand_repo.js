'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const table = require(path.resolve('config/database')).tables
const brandModel = require(config.model_path + '/m_brand')

class BrandRepo {
    constructor() {
        this.brand = new brandModel()
    }

    async getAllBrand() {
        const q = "SELECT DISTINCT(Merk) FROM " + table.brand + " ORDER BY Merk ASC";

        let m = await this.brand.raw(q)

        return m
    }

    async getTypeByMerk(merk) {
        const m = await this.brand.get({
            Merk : merk
        })

        return m
    }

    async getType() {
        const m = await this.brand.select("DISTINCT(Tipe) as Tipe").get()

        return m
    }

}

module.exports = BrandRepo