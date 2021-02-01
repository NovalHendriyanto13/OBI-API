const jwt = require('jsonwebtoken')
const path = require('path')
const promisify = require('util').promisify
const fs = require('fs')
const readdirp = promisify(fs.readdir)
const statp = promisify(fs.stat)
const config = require(path.resolve('config/config'))
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
    if (user.length > 0){
      return true
    }

    return false
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

module.exports = {
  generateToken, 
  authenticate, 
  permission, 
  scanDir, 
}