'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const table = require(path.resolve('config/database')).tables
const conn = require(path.resolve('config/database'))

const Model = require(config.model_path + '/Model')

class User extends Model {
    constructor() {
        super()
        this.tablename = table.user
        this.primaryKey = 'UserID'
    }

    defaultFields() {
        const defaultFields = {
            Username:'',
            Nama: '',
            Email: '',
            NoTelp: '',
            NoKTP: '',
            Alamat: '',
            Password: '',
            NoNPWP:'',
            TempatLahir:'',
            TglLahir:'1970-01-01',
            Bank:'',
            Cabang:'',
            NoRek:'',
            AtasNama :'',
            PICConsignor:'',
            PICOtobid:'',
            Ketmob:'',
            Ketpar:'',
            TipeKomisi:'',
            Komisi:'',
            StartMOU:'1970-01-01',
            EndMOU:'1970-01-01',
            TypeMOU:'',
            NoPKS:'',
            StartPKS:'1970-01-01',
            EndPKS:'1970-01-01',
            Foto:'',
            FKTP:'',
            FNPWP:'',
            FTDP:'',
            FSPK:'',
            FSKPL:'',
            Kode_consignor:'',
            Last_update: '1970-01-01',
            FSIUP:'',
            FAKTE:'',
            FDOMISILI:''
        }
        return defaultFields
    }

    async getId(id) {
        const db = await conn.db()
        console.log(config)
        let sql = "select *, "
            sql = sql + "IF(FKTP IS NOT NULL, CONCAT('" + config.images.user + "', FKTP) , '') AS image_ktp, "
            sql = sql + "IF(FNPWP IS NOT NULL, CONCAT('" + config.images.user + "', FNPWP) , '') AS image_npwp "
            sql = sql + "from "+this.tablename
            sql = sql + " where "+ this.primaryKey+ "=?"
            console.log(sql)
        let [rows, fields] = await db.execute(sql,[id])
        return rows
    }
}

module.exports = User