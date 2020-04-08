const express=require('express')
const app=express()
require('./db/mongoose')

const userRouter=require('./routers/user')
const postRouter=require('./routers/post')
app.use(express.json())
const port=process.env.PORT
app.use(userRouter,postRouter)
app.listen(port,()=>{
    console.log("Server up on "+port)
})