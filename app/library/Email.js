const mailer = require('nodemailer')
const path = require('path')

const config = require(path.resolve('config/config'))

class Email {
    constructor() {
        this.transporter = mailer.createTransport({
            host: config.email.host,
            port: config.email.port,
            secure: true,
            auth: {
                user: config.email.user,
                pass: config.email.pass
            },
            tls: {
                rejectUnauthorized: false
            }
        })
    }

    async sendOne(to, subject, message) {
        let send = await this.transporter.sendMail({
            from: config.email.user,
            to: to,
            subject: subject,
            html: message
        })
        if (send.messageId !== null) {
            return true
        }
        return false
    }
}

module.exports = Email