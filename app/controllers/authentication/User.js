'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const util = require(path.resolve('app/utils/util'))

const Controller = require(config.controller_path + '/Controller')
const userModel = require(config.model_path + '/m_user')

class User extends Controller {
    constructor() {
        super()
        this.setModel(new userModel())
    }

    async login(req, res) {
        var params = req.body
        var that = this
        try{
            const model = this.getModel()
            let m = await model.get({Email : params.username})
            if (m.length <= 0)
                throw new Error('Username not found!')

            if (params.password !== m[0].Password)
                throw new Error('Password is not match')

            let dataUser = {
                userid: m[0].UserID,
                username: m[0].Username,
                email: m[0].Email,
                group: m[0].Kategori
            }

            const expireIn = 1*60*60
            let token = util.generateToken(dataUser, expireIn);
            let responseToken = {
                data: {
                    email: m[0].Email,
                    name: m[0].Nama,
                    group: m[0].Kategori
                }, 
                token: token,
                expire_in: expireIn
            }
            res.send(that.response(true, responseToken, null))
        }
        catch(err) {
            console.log(err)
            res.send(this.response(false, null, {
                code: err.code,
                message: err.message
            }))
        } 
    }

    async register(req, res) {
        var params = req.body
        var that = this
        try{
            const model = this.getModel()
            let check = await model.get({Email : params.email})
            if (check.length > 0)
                throw new Error('Email is already exists!')

            let data = {
                Nama: params.name,
                Email: params.email,
                NoTelp: params.phone_no,
                NoKTP: params.identity_no,
                Alamat: params.address,
                Password: params.password
            }

            let process = await model.insert(data)
            let dataUser = {
                userid: process.insertId,
                username: '',
                email: data.Email,
                group: 'user'
            }
            
            const expireIn = 1*60*60
            let token = util.generateToken(dataUser, expireIn);
            let responseToken = {
                data: {
                    email: data.Email,
                    name: data.Nama,
                    group: 'user'
                }, 
                token: token,
                expire_in: expireIn
            }
            res.send(that.response(true, responseToken, null))
        }
        catch(err) {
            console.log(err)
            res.send(this.response(false, null, {
                code: err.code,
                message: err.message
            }))
        } 
    }

    async logout(req, res) {

    }
}

module.exports = User