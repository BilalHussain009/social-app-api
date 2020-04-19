const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const sharp = require('sharp')

const auth = require('../middleware/auth')
const multer = require('multer')
const upload = new multer({
    limits: {
        fileSize: 100000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an immage'))
        }
        cb(undefined, true)
    }
})
router.post('/users', async (req, res) => {
    console.log("From browser")
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ token })
    }
    catch (e) {
        res.send(404).send()
    }
})
router.post('/users/login', async (req, res) => {
    try {
        console.log(req.body.email, req.body.password)

        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ token })

    }
    catch (e) {
        res.status(400).send(e)
    }
})

router.get('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    }
    catch (e) {
        res.status(500).send()
    }
})
router.post('/users/me/dp', auth, upload.single('dp'), auth, async (req, res) => {
    try {

        const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()

        req.user.dp = buffer
        await req.user.save()
        res.send()
    }
    catch (e) {
        res.status(400).send()
    }
}

)
router.delete('/users/me/dp', auth, async (req, res) => {
    try {
        req.user.dp = undefined
        req.user.save()
        res.send()
    }
    catch (e) {
        res.status(500).send()
    }
})
router.post('/user/me/profile', auth, async (req, res) => {
    await req.user.populate({
        path: 'posts'
    }).execPopulate()
    res.send(req.user)
})
router.get("/user/:id/dp", async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.dp) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.dp)
    } catch (e) {
        res.status(404).send()
    }
})

router.post('/user/follow', auth, async (req, res) => {
    let follow = req.body.id
    try {
        req.user.following.filter((el) => {
            if (el.follow == follow) {
                throw new Error("Already Following!")
            }
        })
        req.user.following = req.user.following.concat({ follow })
        req.user.save()
        res.send(req.user)
    }
    catch (e) {
        res.status(500).send(e)
    }
})
router.post('/user/unfollow', auth, async (req, res) => {
    let unfollow = req.body.id
    try {
        req.user.following = req.user.following.filter((el) => {
            return el.follow !== unfollow
        })
        req.user.save()
        res.send(req.user)
    }
    catch (e) {
        res.status(500).send(e)
    }
})
router.post('/user/recomendations', auth, async (req, res) => {
    try {
        let info = []
        await User.find({}, (err, users) => {
            info=users.filter((el)=>{
                
                if(el._id.equals(req.user._id)){
                    return false
                }
                else{
                    return true
                }
            })
            
        })
        res.status(200).send(info)
    }
    catch (e) {
        res.send(500).send()
    }

})
router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
module.exports = router