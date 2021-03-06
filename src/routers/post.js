const express = require('express')
const Post = require('../models/post')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')

const upload = new multer({
    limits: {
        fileSize: 10000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an immage'))
        }
        cb(undefined, true)
    }
})
router.post('/posts', auth, upload.single('postPic'), async (req, res) => {
    try {
        const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
        const post = new Post({
            description: req.body.description,
            postPic: buffer,
            owner: req.user._id,
        })

        await post.save()
        res.status(201).send(post)
    }
    catch (e) {
        res.send(500).send()
    }
})
router.get('/posts', auth, async (req, res) => {
    try {
        await req.user.populate('posts').execPopulate()
        console.log(req.user.posts)
        res.send(req.user.posts)
    }
    catch (e) {
        res.status(500).send()
    }
})
router.delete('/posts/:id', auth, async (req, res) => {
    try {
        console.log("Delete from browser")
        const _id = req.params.id
        console.log(_id)
        const post = await Post.findOneAndDelete({ _id, owner: req.user._id })
        if (!post) {
            return res.status(404).send()
        }
        res.send(post)
    }
    catch (e) {
        res.status(500).send()
    }
})
router.patch('/posts/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const post = await Post.findOne({ _id: req.params.id, owner: req.user._id })

        if (!post) {
            return res.status(404).send()
        }

        updates.forEach((update) => post[update] = req.body[update])
        await post.save()
        res.send(post)
    } catch (e) {
        res.status(400).send(e)
    }
})
router.get('/posts/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const post = await Post.findOne({ _id, owner: req.user._id })
        if (!post) {
            return res.status(404).send()
        }
        res.send(post)
    }
    catch (e) {
        res.status(500).send()
    }
})
router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
module.exports = router
