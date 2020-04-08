const express=require('express')
const app=express()
require('./db/mongoose')

const userRouter=require('./routers/user')
const postRouter=require('./routers/post')
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
       next();
 });
app.use(express.json())
const port=process.env.PORT
app.use(userRouter,postRouter)

app.listen(port,()=>{
    console.log("Server up on "+port)
})