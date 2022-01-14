'use strict'
const path = require('path')
const fs = require('fs')
const formidable = require('formidable')
const dateformat = require('dateformat')
const { randomInt } = require('../../utils/helper')
const bidRepo = require('../../repositories/bid_repo')
const config = require(path.resolve('config/config'))
const util = require(path.resolve('app/utils/util'))
const helper = require(path.resolve('app/utils/helper'))
const Validation = require(path.resolve('app/library/Validation'))

const Controller = require(config.controller_path + '/Controller')
const nplModel = require(config.model_path + '/m_npl')
const bidModel = require(config.model_path + '/m_bid')
const nplRepo = require(config.repo_path + '/npl_repo')
const auctionDetailRepo = require(config.repo_path + '/auction_detail_repo')

class Npl extends Controller {
    constructor() {
        super()
        this.setModel(new nplModel())
    }

    async index(req, res) {
        try{
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.index')
            if (access === false) {
                return res.send(this.response(false, null, 'You are not authorized!'))
            }

            const n = new nplRepo()
            const adr = new auctionDetailRepo()
            const br = new bidRepo()
            let m = await n.getList(token.userid)
            let dataRes = []
            for(let i = 0, {length} = m; i < length; i++) {
                let data = m[i]
                let dataUnit = null;
                if (data.Closed == 0 && data.Verifikasi == 0) {
                    data.Status = 'Belum Verifikasi'
                }
                else if (data.Closed == 0) {
                    data.Status = 'Aktif'
                }
                else if (data.Closed == 1) {
                    data.Status = 'Non Aktif'
                }
                else if (data.Closed == 2) {
                    const wanpres = await adr.getOneWanpress({
                        IdAuctions: data.IdAuctions,
                        NPL: data.NPL,
                        UserID: token.userid
                    })
                    const unit = await br.getUnitByNpl(data.IdAuctions, data.NoLot)
                    if (wanpres.length > 0) {
                        if (wanpres.Paid == 2) {
                            data.Status = 'Wanpres'
                        }
                        else {
                            data.Status = 'Menang'
                        }
                    }
                    else {
                        data.Status = 'Menang'
                    }
                    dataUnit = unit
                }
                data.unit = dataUnit
                dataRes.push(data)
            }
            
            return res.send(this.response(true, dataRes, null))
        }
        catch(err) {
            console.log(err)
            return res.send(this.response(false, null, {
                code: err.code,
                message: err.message
            }))
        }
    }

    async create(req, res) {
        var that = this
        try{
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.create')
            if (access === false) {
                return res.send(this.response(false, null, 'You are not authorized!'))
            }
            const form = formidable({ multiples: true, uploadDir: config.path.npl, keepExtensions: true })
            form.parse(req, async (err, fields, files) => {
                if (err) {
                    return res.send(this.response(false, null, err))
                }

                var params = fields                
                const rules = {
                    an: 'required',
                    auction_id: 'required',
                    qty: 'numeric',
                    type: 'required',
                    deposit: 'required|numeric',
                    nominal: 'required|numeric'
                }

                const validation = new Validation();
                let validate = validation.check(params, rules)
                
                if (validate.length > 0) {
                    return res.send(this.response(false, null, validate.toString()))
                }

                if (typeof(files.attach) == 'undefined') {
                    return res.send(this.response(false, null, 'File Attachment harus di upload'))
                }
                
                let dateNow = dateformat(helper.dateNow() + ' ' + helper.timeNow(), 'yyyy-mm-dd HH:MM:ss')
                let dateNowFormat = dateformat(helper.dateNow()+ ' ' + helper.timeNow(), 'yyyymmddHHMMss') 

                const randomNpl = helper.randomInt(899, 100)
                const transId = `${dateNowFormat}_${randomInt(99, 1)}` 
                const code = token.userid + '-' + dateNowFormat
                
                let data = {
                    TransID: transId,
                    Jenis: params.type.toLowerCase(),
                    IdAuctions: params.auction_id,
                    NPL: `A${randomNpl}`,
                    UserID: token.userid,
                    AtasNama: params.an,
                    Method: 'BANK',
                    Deposit: params.deposit,
                    Online: 1,
                    Verifikasi: 0,
                    Attach: '',
                    CodeUnik: code,
                    Closed: 0,
                    Bank: '',
                    Cabang: '',
                    Nominal: params.nominal,
                    NoLot: '',
                    NoRek: '',
                }

                let process = await model.insert(data)
                let attachmentName = ''
                if (files.attach.size <= 0) {
                    fs.unlinkSync(files.attach.path)
                }
                else {
                    const ext = path.extname(files.attach.name)
                    attachmentName = `${token.userid}-${transId}${ext}`
                    const attachmentPath = `${config.path.npl}/${attachmentName}`
                    fs.rename(files.attach.path, attachmentPath, function (err) { 
                        console.log(err)
                    })
                    await model.update({Attach: attachmentName}, transId)
                }

                return res.send(that.response(true, 'Create NPL is Success', null))
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

    async getActiveByAuction(req, res) {
        try{
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.index')
            if (access === false) {
                return res.send(this.response(false, null, 'You are not authorized!'))
            }

            let params = req.body
            const rules = {
                auction_id: 'required',
                type: 'required',
            }
            const validation = new Validation();
            let validate = validation.check(params, rules)
            
            if (validate.length > 0) {
                throw new Error(validate)
            }

            const auctionId = params.auction_id
            const type = params.type
            const n = new nplRepo()
            const b = new bidModel()
            let resData = [];
            
            let m = await n.getActiveByAuction(token.userid, auctionId, type)
            for (let i=0, {length} = m; i < length; i++) {
                let dataNpl = m[i]
                let l = 0
                let checkUsed = await b.getOne({
                    nplx: dataNpl.NPL,
                    UserID: token.userid,
                    IdAuctions: params.auction_id
                })
                l = checkUsed.length
                if (l == 0) {
                    resData.push(dataNpl)
                }
            }
            
            return res.send(this.response(true, resData, null))
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

module.exports = Npl