const nodemailer = require('nodemailer')
const config = require('config')

const mailTransport = nodemailer.createTransport({
    host: 'smtp.126.com',
    secure: true,
    port: 465,
    auth: {
        user: config.email.account,
        pass: config.email.pwd
    }
})
const from = {
    name: '微识',
    address: config.email.account
}

exports.sendEmail = option => {
    return new Promise((resolve, reject) => {
        mailTransport.sendMail({
            from,
            to: option.to,
            subject: option.subject,
            html: option.html,
            generateTextFromHtml: true
        }, function(err, info){
            if (err) reject(err)
            else resolve(info)
        })
    })
}
