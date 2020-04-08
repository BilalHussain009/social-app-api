const mongoose =require('mongoose')
const postSchema=new mongoose.Schema({
    description:{
        type:String,
        required:true,
        trim:true
    },
    picture:{
        type:Buffer,
        required:false
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'

    },
    postPic:{
        type:Buffer
    }
    
})
const Post=mongoose.model("Post",postSchema)
module.exports=Post