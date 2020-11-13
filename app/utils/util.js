const jwt = require('jsonwebtoken')
const path = require('path')
const config = require(path.resolve('config/config'))

let generateToken = function(params, expiresIn) {
    return jwt.sign(params, config.token_secret, { expiresIn: expiresIn})
}
let authenticate = function (req, res, next) {
    // Gather the jwt access token from the request header
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    
    return jwt.verify(token, config.token_secret)
  }

module.exports = {generateToken, authenticate}