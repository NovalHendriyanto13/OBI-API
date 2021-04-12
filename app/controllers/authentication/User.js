'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const util = require(path.resolve('app/utils/util'))
const Validation = require(path.resolve('app/library/Validation'))
const Email = require(path.resolve('app/library/Email'))

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
                    id: m[0].UserID,
                    email: m[0].Email,
                    name: m[0].Nama,
                    group: m[0].Kategori
                }, 
                token: token,
                expire_in: expireIn
            }
            return res.send(that.response(true, responseToken, null))
        }
        catch(err) {
            console.log(err)
            return res.send(this.response(false, null, {
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
                NoNPWP: params.npwp_no,
                Alamat: params.address,
                Bank: params.bank,
                Cabang: params.branch_bank,
                NoRek: params.account_no,
                AtasNama : params.account_name,
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
                    id: process.insertId,
                    email: data.Email,
                    name: data.Nama,
                    group: 'user'
                }, 
                token: token,
                expire_in: expireIn
            }
            return res.send(that.response(true, responseToken, null))
        }
        catch(err) {
            console.log(err)
            return res.send(this.response(false, null, {
                code: err.code,
                message: err.message
            }))
        } 
    }

    async update(req, res) {
        try{
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.update')
            if (access === false) {
                return res.send(this.response(false, null, 'You are not authorized!'))
            }

            var params = req.body
            var id = req.params.id

            let data = {
                Nama: params.name,
                Email: params.email,
                NoTelp: params.phone_no,
                NoKTP: params.identity_no,
                NoNPWP: params.npwp_no,
                Alamat: params.address,
                Bank: params.bank,
                Cabang: params.branch_bank,
                NoRek: params.account_no,
                AtasNama : params.account_name,
            }
            
            let update = await model.update(data, token.userid)
            if (update)
                return res.send(this.response(true, "Update Profile is Success", null))

            return res.send(this.response(false, null, "Update Profile is Failed"))
            
        }
        catch(err) {
            console.log(err)
            return res.send(this.response(false, null, {
                code: err.code,
                message: err.message
            }))
        } 
    }

    async changePassword(req, res) {
        try{
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.index')
            if (access === false) {
                return res.send(this.response(false, null, 'You are not authorized!'))
            }
            
            var params = req.body
            
            const rules = {
                old_password: 'required|numeric',
                password: 'required',
                re_password: 'required'
            }
            const validation = new Validation();
            let validate = validation.check(params, rules)
            if (validate.length > 0) {
                throw new Error(validate.toString())
            }
            let m = await model.getId(token.userid)
            
            if (params.old_password !== m[0].Password)
                throw new Error('Old Password is not match')

            if (params.password !== params.re_password)
                throw new Error('Password is not match')
                
            let update = await model.update({Password: params.password}, token.userid)
            if (update)
                return res.send(this.response(true, "Change Password is Success", null))

            return res.send(this.response(false, null, "Change Password is Failed"))
        }
        catch(err) {
            console.log(err)
            return res.send(this.response(false, null, {
                code: err.code,
                message: err.message
            }))
        } 
    }

    async forgot(req, res) {
        try{
            var params = req.body
            
            const rules = {
                email: 'required'
            }
            const validation = new Validation();
            let validate = validation.check(params, rules)
            if (validate.length > 0) {
                throw new Error(validate.toString())
            }
            let m = await model.get({Email:email})
            
            if (!m) {
                return res.send(this.response(false, null, "Data not found"))
            }
            const mail = Email()
            let sendMail = await mail.sendOne(email, "Lupa Kata Sandi", "Kata sandi anda adalah:" + m.Password)
            if (sendMail) {
                return res.send(this.response(true,"Your Password has been sent to your email" + email))
            }

            return res.send(this.response(false, null, "Change Password is Failed"))
        }
        catch(err) {
            console.log(err)
            return res.send(this.response(false, null, {
                code: err.code,
                message: err.message
            }))
        } 
    }
}

module.exports = User