module.exports = async function auth(req, res, next) {
    const jwt = require('jsonwebtoken')
    const User = require('../models/gamer')
    const Token = require('../models/token')
    try {
        // console.log(req.headers);
        const token = await (req.headers['authorization'].split(' ')[1])
        // console.log(token);
        if (token == null) {
            return res.status(401).json({
                success: false,
                code: 401,
                message: "Belirtilen token BOŞ."
            })
        }
        const isToken = await Token.findOne({ token: token });
        if (isToken) {
            res.status(401).json({
                success: false,
                code: 401,
                message: "Çıkış yaptığınız tokenle giremezsiniz."
            })
        } else {
            const sonuc = jwt.verify(token, 'supersecret')

            // console.log(sonuc);
            const bulunan = await User.findById(sonuc.id)
            req.user = bulunan
            next()
        }
    } catch (err) {
        if (err.message == 'invalid signature') {
            res.status(401).json({
                success: false,
                code: 401,
                message: "Belirtilen token hatalı."
            })
        } else if (err.name == 'TokenExpiredError') {
            res.status(401).json({
                success: false,
                code: 401,
                message: "Token tüketim tarihini doldurmuştur."
            })
        } else {
            console.log(err);
            res.status(401).json({
                success: false,
                code: 401,
                message: "Sistemin bilmediği bir hata oluştu."
            })
        }

    }
}