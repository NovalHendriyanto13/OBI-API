'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const util = require(path.resolve('app/utils/util'))

const Controller = require(config.controller_path + '/Controller')

class Article extends Controller {
    constructor() {
        super()
    }

    async index(req, res) {
        try{
            const access = util.staticToken(req, res)
            if (access === false) {
                res.send(this.response(false, null, 'You are not authorized!'))
            }
            
            res.send(this.response(true, "ii", null))
        }
        catch(err) {
            console.log(err)
            res.send(this.response(false, null, {
                code: err.code,
                message: err.message
            }))
        } 
    }
}

module.exports = Article