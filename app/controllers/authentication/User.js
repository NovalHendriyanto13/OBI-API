'use strict'
const path = require('path')
const bcrypt = require('bcrypt')
const config = require(path.resolve('config/config'))
const util = require(path.resolve('app/utils/util'))

const Controller = require(config.controller_path + '/Controller')
const userModel = require(config.model_path + '/m_user')
const groupModel = require(config.model_path + '/m_group')

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
            let m = await model.get({username : params.username})
            if (m.length <= 0)
                throw new Error('Username not found!')

            let hash = m[0].password.replace(/^\$2y(.+)$/i, '$2a$1');
            bcrypt.compare(params.password, hash, async function(err, result) {
                if (result == false) {
                    res.send(that.response(result, null, "Invalid Password!"))
                }
                else {
                    const group = new groupModel()
                    const groupData = await group.getId(m[0].group_id)
                    let dataUser = {
                        username: m[0].username,
                        email: m[0].email,
                        group: groupData[0].name 
                    }
                    const expireIn = 1*60*60
                    let token = util.generateToken(dataUser, expireIn);
                    let responseToken = {
                        data: {
                            email: m[0].email,
                            name: m[0].name,
                            group: groupData[0].name
                        }, 
                        token: token,
                        expire_in: expireIn
                    }
                    res.send(that.response(result, responseToken, null))
                }
            });
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