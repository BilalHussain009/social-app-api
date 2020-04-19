const express=require('express')
const app=express()
const cors=require('cors')
require('./db/mongoose')

const userRouter=require('./routers/user')
const postRouter=require('./routers/post')
app.use(cors())
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization");
    next();
  });
app.use(express.json())
const port=process.env.PORT
app.use(userRouter,postRouter)

app.listen(port,()=>{
    console.log("Server up on "+port)
})