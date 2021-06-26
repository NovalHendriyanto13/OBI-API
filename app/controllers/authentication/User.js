'use strict'
const path = require('path')
const fs = require('fs')
const formidable = require('formidable')
const config = require(path.resolve('config/config'))
const util = require(path.resolve('app/utils/util'))
const variable = require(path.resolve('app/utils/variable'))
const Validation = require(path.resolve('app/library/Validation'))
const Email = require(path.resolve('app/library/Email'))

const Controller = require(config.controller_path + '/Controller')
const userModel = require(config.model_path + '/m_user')

class User extends Controller {
    constructor() {
        super()
        this.setModel(new userModel())
        this.redis = true
        this.redisKey= {
            detail: variable.redisKey.USER,
        }
    }

    async login(req, res) {
        var params = req.body
        var that = this
        try{
            const model = this.getModel()
            const m = await model.raw(`SELECT * FROM ${model.tablename} WHERE Email= '${params.username}' OR Username= '${params.username}'`)
             
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

            const expireIn = 365*60*60
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
        var that = this
        const defaultPassword = 'Otobid123'

        try{
            const form = formidable({ multiples: true, uploadDir: config.path.user, keepExtensions: true })
            form.parse(req, async (err, fields, files) => {
                if (err) {
                    throw new Error(err)
                }

                const model = that.getModel()
                var params = fields
                
                const rules = {
                    email: 'required|email',
                }
                const validation = new Validation();
                let validate = validation.check(params, rules)
                
                if (validate.length > 0) {
                    return res.send(this.response(false, null, {
                        code: 500,
                        message: validate
                    }))
                }

                if (typeof(files.ktp_file) == 'undefined') {
                    return res.send(this.response(false, null, 'File KTP harus di upload'))
                }

                if (typeof(files.npwp_file) == 'undefined') {
                    return res.send(this.response(false, null, 'File NPWP harus di upload'))
                }

                const getLastId = await model.getOne({}, 'UserID desc')
                const lastId = getLastId[0].UserID
                const newId = lastId + 1
                
                let data = {
                    UserID: newId,
                    Nama: params.name,
                    Email: params.email,
                    NoTelp: params.phone_no,
                    NoKTP: params.identity_no,
                    NoNPWP: params.npwp_no,
                    Alamat: params.address,
                    Bank: params.bank,
                    Cabang: params.branch_bank,
                    NoRek: params.account_no,
                    AtasNama: params.account_name,
                    TempatLahir: params.birth_place,
                    TglLahir: params.birth_date,
                    Password: defaultPassword
                }

                let process = await model.insert(data)
                let dataUser = {
                    userid: newId,
                    username: '',
                    email: data.Email,
                    group: 'user'
                }
                let ktpName = ''
                let npwpName = ''
                let errUpload = []
                if (files.ktp_file.size <= 0) {
                    fs.unlinkSync(files.ktp_file.path)
                }
                else {
                    const ext = path.extname(files.ktp_file.name)
                    ktpName = `KTP_${newId}${ext}`
                    const ktpNamePath = `${config.path.user}/${ktpName}`
                    fs.rename(files.ktp_file.path, ktpNamePath, function (err) { 
                        
                    })
                }

                if (files.npwp_file.size <= 0) {
                    fs.unlinkSync(files.npwp_file.path)
                }
                else {
                    const ext = path.extname(files.npwp_file.name)
                    npwpName = `NPWP_${newId}${ext}`
                    const npwpNamePath = `${config.path.user}/${npwpName}`
                    fs.rename(files.npwp_file.path, npwpNamePath, function (err) { 
                        
                    })
                }
                if (errUpload.length <= 0) {
                    await model.update({FKTP: ktpName, FNPWP: npwpName}, newId)
                }
                else {
                    return res.send(this.response(false, null, {
                        code: 501,
                        message: errUpload
                    }))
                }

                // const mail = new Email()
                // const subject = 'Registrasi User Baru (Otobid Indonesia)'
                // const emailMsg = `<p>Hi, ${params.name}</p><p>Terima kasih telah mendaftar di Otobid Indonesia.
                // Anda dapat melakukan login dengan Username: ${params.email} dan Password: ${defaultPassword}</p>`
                // await mail.sendOne(params.email, subject, emailMsg)

                const expireIn = 365*60*60
                let token = util.generateToken(dataUser, expireIn);
                let responseToken = {
                    data: {
                        id: newId,
                        email: data.Email,
                        name: data.Nama,
                        group: 'user'
                    }, 
                    token: token,
                    expire_in: expireIn
                }
                return res.send(that.response(true, responseToken, null))
            })
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
                old_password: 'required',
                password: 'required',
                re_password: 'required'
            }
            const validation = new Validation();
            let validate = validation.check(params, rules)
            
            if (validate.length > 0) {
                throw new Error(validate)
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
            
            const model = this.getModel()
            let m = await model.getOne({Email: params.email})
            
            if (m.length <= 0) {
                return res.send(this.response(false, null, "Data not found"))
            }
            const mail = new Email()
            const subject = 'Lupa Kata Sandi (Otobid Indonesia)'
            const emailMsg = `<p>Hi, ${m[0].Nama}</p><p>Kata Sandi Anda adalah :<b>${m[0].Password}</b></p>`

            let sendMail = await mail.sendOne(params.email, subject, emailMsg)
            if (sendMail) {
                return res.send(this.response(true,"Your Password has been sent to your email :" + params.email, null))
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

    async requestChange(req, res) {
        try{
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.index')
            if (access === false) {
                return res.send(this.response(false, null, 'You are not authorized!'))
            }
            
            var params = req.body

            const mail = new Email()
            const subject = 'Permintaan Ubah Data'
            const emailMsg = `<p>Saya yang bernama, ${params.Nama}</p><p>Mohon untuk ubah profil data saya dengan data-data sebagai berikut</p>${params.toString()}`

            let sendMail = await mail.sendOne(params.email, subject, emailMsg)
            if (sendMail) {
                return res.send(this.response(true,"Permintaan ubah data sedang di proses ", null))
            }
            

            return res.send(this.response(false, null, "Permintaan ubah data gagal"))
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