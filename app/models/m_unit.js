'use strict'
const path = require('path')
const conn = require(path.resolve('config/database'))

class Unit {
    constructor() {
        this.tablename = 'unit'
    }
    async getAll(filter) {
        const db = await conn.db()
        let [rows, fields] = await db.execute("select * from "+this.tablename)
        return rows
    }

    async getId(id) {
        const db = await conn.db()
        let [rows, fields] = await db.execute("select * from "+this.tablename+" where id=?",[id])
        return rows
    }

    async get(params) {
        const q = "select * from "+this.tablename
        let condition = ""
        let filter = []
        for (let key in params) {
            condition = condition + key + '=? AND '
            filter.push(params[key])
        }
        if (condition !== '') {
            condition = " where " + condition.substr(0, (condition.length - 4))
        }
        const db = await conn.db()
        let [rows, fields] = await db.execute(q + condition, filter)
        return rows
    }

    async raw(q) {
        const db = await conn.db()
        let [rows, fields] = await db.execute(q)
        return rows
    } 
}

module.exports = Unit