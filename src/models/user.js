const mongoose = require('mongoose')
const bcrypt=require('bcrypt')
const jwt =require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
        minlength:5,
        
    },
    following:[
        {
            follow:{
                type:String,
                required:false
            }
        }
    ]
    ,
    tokens:[
        {
            token:{
                type:String,
                required:true,

            }
        }
    ],
    dp:{
        type:Buffer
    }
    
})
userSchema.virtual('posts',{
    ref:'Post',
    localField:'_id',
    foreignField:'owner'
})
//Checking if the password is changed withe every database access and then hashing it 
userSchema.pre('save',async function(next){
    const user =this
    if(user.isModified('password')){
        user.password=await bcrypt.hash(user.password,8)
    }
    next()
})
userSchema.statics.findByCredentials=async(email,password)=>{
    const user=await User.findOne({email})
    if(!user){
        throw new Error("Error While Logging in!")
    }
    const isMatch=await bcrypt.compare(password,user.password)
    if(!isMatch){
        throw new Error("Error While Logging in !")
    }
    return user
}
userSchema.methods.generateAuthToken=async function(){
    const user=this
    const token=jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)
    user.tokens=user.tokens.concat({token})
    await user.save()
    return token
}
const User = mongoose.model('User', userSchema)
module.exports = User