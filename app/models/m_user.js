'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const util = require(path.resolve('app/utils/util'))

const Model = require(config.model_path + '/Model')

class User extends Model {
    constructor() {
        super()
        this.tablename = 'ms_user'
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
}

module.exports = User