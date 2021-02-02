require('dotenv').config()
const path = require('path')

const config = {
    port:process.env.APP_PORT,
    app_name:process.env.APP_NAME,
    app_path: path.resolve('app'),
    controller_path: path.resolve('app/controllers'),
    model_path: path.resolve('app/models'),
    repo_path: path.resolve('app/repositories'),
    db : {
        host: process.env.DB_HOST,
        name: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        pass: process.env.DB_PASSWORD
    },
    token_secret: process.env.TOKEN_SECRET
}
module.exports = config