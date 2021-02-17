'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const util = require(path.resolve('app/utils/util'))
const Validation = require(path.resolve('app/library/Validation'))

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
        const expireIn = 1*60
        const user = util.authenticate(req, res)
        let dataUser = {
            userid: user.userid,
            username: user.username,
            email: user.email,
            group: user.group
        }
        let token = util.generateToken(dataUser, expireIn);
        res.send(this.response(true, token, null))
    }

    async changePassword(req, res) {
        try{
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.index')
            if (access === false) {
                res.send(this.response(false, null, 'You are not authorized!'))
            }
            
            var params = req.body
            const rules = {
                old_password: 'required|numeric',
                password: 'required',
                re_password: 'required'
            }
            const validation = new Validation();
            let validate = validation.check(params, rules)
            if (validate) {
                res.send(this.response(false, null, validate))
            }
            let m = await model.getId(token.userid)
            
            if (params.old_password !== m[0].Password)
                throw new Error('Old Password is not match')

            if (params.password !== params.re_password)
                throw new Error('Password is not match')

            let update = model.update({Password: params.password}, token.userid)
            if (update)
                res.send(this.response(true, "Change Password is Success", null))

            res.send(this.response(false, null, "Change Password is Failed"))
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

module.exports = User