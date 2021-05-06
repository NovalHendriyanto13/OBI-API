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
    token_secret: process.env.TOKEN_SECRET,
    exception: {
        token: '1cd855fd3f461fd5f6f15638d02ff689cf86fe7c'
    },
    email: {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    },
    images: {
        unit: 'https://otobid.co.id/img/unit/',
        default_unit: 'https://otobid.co.id/img/not_image.jpg',
        user: 'https://otobid.co.id/upload/document/user', 
    },
    path: {
        user: '/usr/src/upload/document/user'
    },
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT || 6379,
    },
    limit_bid: {
        mobil: 500000,
        alatberat: 500000,
        motor: 100000
    },
}
module.exports = config