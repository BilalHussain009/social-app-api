const User=require('../models/user')
const jwt=require("jsonwebtoken")
const Post=require('../models/post')
const auth=async(req,res,next)=>{
    try{
        const token =req.header('Authorization').replace("Bearer ",'')
        const tokenVerify=jwt.verify(token,process.env.JWT_SECRET)
        const user=await User.findOne({_id:tokenVerify._id,"tokens.token":token})
        const post=await Post.find({owner:tokenVerify._id})
        if(!user){
            throw new Error()
        }
        req.token=token
        req.user=user
        req.post=post
        
        next()
    }
    catch(e){
        res.status(401).send({error:"Please Authenticate"})
    }
}
module.exports=auth