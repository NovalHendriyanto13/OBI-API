'use strict'
const { type } = require('os')
const path = require('path')
const conn = require(path.resolve('config/database'))

class Model {
    constructor() {
        this.tablename
        this.primaryKey = 'id'
        this.column = '*'
    }
    async getAll() {
        const db = await conn.db()
        let [rows, fields] = await db.execute("select "+ this.column +" from "+this.tablename)
        return rows
    }

    async getId(id) {
        const db = await conn.db()
        let [rows, fields] = await db.execute("select "+ this.column +" from "+this.tablename +" where "+this.primaryKey+" =?",[id])
        return rows
    }

    async get(params) {
        let join = ''
        if (typeof(this.joinTable) != 'undefined')
           join = this.joinTable

        const q = "select "+ this.column +" from "+this.tablename + join
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

    async insert(params) {
        let data = []
        let q = "insert into " + this.tablename
        let field = ""
        let values = ""

        const defaultField = this.defaultFields()
        if (Object.keys(defaultField).length === 0 && defaultField.constructor === Object) {
            for (let key in params) {
                field = field + key + ', '
                values = values + '?, '
                data.push(params[key])
            }
        }
        else {
            let paramValue
            for (let key in defaultField) {
                field = field + key + ', '
                values = values + '?, '
                paramValue = params[key]

                if (typeof(paramValue) === 'undefined') {
                    paramValue = defaultField[key]
                }

                data.push(paramValue)
            }
        }

        let fieldSubstr = (field.length) - 2
        let valueSubstr = (values.length) - 2
        q = q + "("+ field.substr(0, fieldSubstr) +") values (" + values.substring(0, valueSubstr) +")"

        const db = await conn.db()
        let [rows, fields] = await db.execute(q, data)
        return rows
    }

    async update(params, id) {
        let data = []
        let q = "update " + this.tablename + " set "
        let field = ""
        let values = ""

        const defaultField = this.defaultFields()
        if (Object.keys(defaultField).length === 0 && defaultField.constructor === Object) {
            for (let key in params) {
                field = field + key + ', '
                values = values + '?, '
                data.push(params[key])
            }
        }
        else {
            let paramValue
            for (let key in defaultField) {
                field = field + key + ', '
                values = values + '?, '
                paramValue = params[key]

                if (typeof(paramValue) === 'undefined') {
                    paramValue = defaultField[key]
                }

                data.push(paramValue)
            }
        }

        let fieldSubstr = (field.length) - 2
        let valueSubstr = (values.length) - 2
        q = q + "("+ field.substr(0, fieldSubstr) +") values (" + values.substring(0, valueSubstr) +")"

        const db = await conn.db()
        let [rows, fields] = await db.execute(q, data)
        return rows
    }

    async raw(q) {
        const db = await conn.db()
        let [rows, fields] = await db.execute(q)
        return rows
    }

    select(column) {
        if (typeof(column) == 'undefined') {
            this.column = '*'
        }
        if (typeof(column) == 'string') {
            this.column = column
        }
        if (typeof(column) == 'object') {
            this.column = column.join(', ')
        }
        return this
    }
    
    join(table, relation, type='inner') {
       if (typeof(this.joinTable) == 'undefined')
           this.joinTable = ''

       this.joinTable = this.joinTable + ' '+ type + " JOIN " + table + ' ON ' + relation

       return this
    }

    defaultFields() {
        return {}
    }
}

module.exports = Model