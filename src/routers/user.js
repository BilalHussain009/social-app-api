const express=require('express')
const User =require('../models/user')
const router= new express.Router()
const auth=require('../middleware/auth')
const multer =require('multer')
const upload=new multer({
    limits:{
        fileSize:10000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error ('Please upload an immage'))
        }
        cb(undefined,true)
    }
})
router.post('/users', async(req,res)=>{
    const user=new User(req.body)
    try{
    await user.save()
    const token=await user.generateAuthToken()
     res.status(201).send({user,token})
    }
    catch(e){
        res.send(404).send()
    }
})
router.post('/users/login',async(req,res)=>{
    try{
        const user =await User.findByCredentials(req.body.email,req.body.password)
        res.send(user)
    }
    catch(e){
        res.status(400).send(e)
    }
})

router.get('/users/logout',auth,async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    }
    catch(e){
        res.status(500).send()
    }
})
router.post('/users/me/dp',auth,upload.single('dp'),auth, async(req,res)=>{
    req.user.dp= req.file.buffer
    await req.user.save()
    res.send()
})
router.delete('/users/me/dp',auth,async(req,res)=>{
    try{
        req.user.dp=undefined
        req.user.save()
        res.send()
    }
    catch(e){
        res.status(500).send()
    }
})
router.post('/user/me/profile',auth,async (req,res)=>{
    await req.user.populate({
        path:'posts'
    }).execPopulate()
    res.send(req.user)
})
router.post('/user/follow',auth,async(req,res)=>{
    let follow=req.body.id
    try{
        req.user.following.filter((el)=>{
            if(el.follow==follow){
                throw new Error("Already Following!")
            }
        })
        req.user.following = req.user.following.concat({follow})
        req.user.save()
        res.send(req.user)
    }
    catch(e){
        res.status(500).send(e)
    }
})
router.post('/user/unfollow',auth,async(req,res)=>{
    let unfollow=req.body.id
    try{
        req.user.following = req.user.following.filter((el)=>{
            return el.follow!==unfollow
        })
        req.user.save()
        res.send(req.user)
    }
    catch(e){
        res.status(500).send(e)
    }
})

module.exports=router