const jwt = require('jsonwebtoken')
const path = require('path')
const promisify = require('util').promisify
const fs = require('fs')
const readdirp = promisify(fs.readdir)
const statp = promisify(fs.stat)
const config = require(path.resolve('config/config'))
const userModel = require(config.model_path + '/m_user')
const redis = require(path.resolve('config/redis'))

const generateToken = function(params, expiresIn) {
    return jwt.sign(params, config.token_secret, { expiresIn: expiresIn})
}

const authenticate = function (req, res, next) {
    // Gather the jwt access token from the request header
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    
    return jwt.verify(token, config.token_secret)
}

const permission = async function (token, page) {
    const users = new userModel()

    let user = await users.get({username : token.username, email: token.email})
    if (user.length > 0){
      return true
    }

    return false
}

const staticToken = function (req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (config.exception.token === token) {
        return true
    }

    return false
}

const scanDir = async function (dir, results = []) {
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

const redisSet = async function (key, value, exp=86400) {
    const client = redis.redisClient()
    client.setex(key, exp, JSON.stringify(value))
}

module.exports = {
  generateToken, 
  authenticate, 
  permission, 
  scanDir, 
  staticToken,
  redisSet
}