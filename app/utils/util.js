const jwt = require('jsonwebtoken')
const path = require('path')
const promisify = require('util').promisify
const fs = require('fs')
const readdirp = promisify(fs.readdir)
const statp = promisify(fs.stat)
const config = require(path.resolve('config/config'))
const permissionModel = require(config.model_path + '/m_permission')
const userModel = require(config.model_path + '/m_user')

let generateToken = function(params, expiresIn) {
    return jwt.sign(params, config.token_secret, { expiresIn: expiresIn})
}
let authenticate = function (req, res, next) {
    // Gather the jwt access token from the request header
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    
    return jwt.verify(token, config.token_secret)
}
let permission = async function (token, page) {
    const users = new userModel()

    let user = await users.get({username : token.username, email: token.email})
    let groupId = 0
    if (user.length > 0){
      groupId = user[0].group_id
    }
    if (groupId == '1'){
      return true
    }

    const access = new permissionModel()
    let q = "select * from " + access.tablename + " AS a "
      q = q + "join modules AS b on a.module_id = b.id "
      q = q + "where b.initial ='" + page +"' and a.group_id ='" + groupId + "'"

    let a = await access.raw(q)
    if (a.length <= 0)
      return false

    return true
}

let scanDir = async function (dir, results = []) {
  let files = await readdirp(directoryName);
    for (let f of files) {
        let fullPath = path.join(directoryName, f);
        let stat = await statp(fullPath);
        if (stat.isDirectory()) {
            await scan(fullPath, results);
        } else {
            results.push(fullPath);
        }
    }
    return results;
}

let dateNow = function() {
  var currentdate = new Date(); 
  return currentdate.getFullYear() + "-"
    + (currentdate.getMonth()+1)  + "-" 
    + currentdate.getDate() + " "  
    + currentdate.getHours() + ":"  
    + currentdate.getMinutes() + ":" 
    + currentdate.getSeconds();

}

module.exports = {
  generateToken, 
  authenticate, 
  permission, 
  scanDir, 
  dateNow
}