var express = require('express');

var mongoose = require('mongoose');

var User = require('./model/user')

var bcrypt = require('bcryptjs')

var jwt = require('jsonwebtoken')

var app = express();

var path = require('path');

const JWT_SECRET = 'kdoelwoieoewdlasdhdikhdkwhkewho3wusmasmaksasp;kdmasdl'
mongoose.connect('mongodb://localhost/myFirstDatabase',{
    useNewUrlParser: true,
    useUnifiedTopology:true,
    useCreateIndex : true
})

app.use(express.json());

app.use('/',express.static(path.join(__dirname,'static')));

app.post('/register', async (req,res) => {
    // console.log(req.body)
    const {username, password:plainTextPassword} = req.body
    const password = await bcrypt.hash(plainTextPassword,10)
    // console.log(await bcrypt.hash(password,10))

    if(!username || typeof username != 'string'){
        return res.json({status: 'ok', error: 'Invalid username'})
    }
    if(!plainTextPassword || typeof plainTextPassword != 'string'){
        return res.json({status: 'ok', error: 'Invalid password'})
    }
    if(plainTextPassword.length < 5){
        return res.json({status: 'error', error: 'Password is too short, it should be atleast 6 characters'})
    }
    try{
        const response = await User.create({
            username,
            password
        })
        console.log(response)
    }
    catch(err){
        if(err.code === 11000){
            return res.json({status:'error', error:'Username already in use'})
        }
        throw error
    }
    res.json({status:'ok'})
})

app.post('/login', async(req,res)=>{
    
    const {username, password} = req.body
    console.log(username)
    const user = await User.findOne({ username }).lean()
    console.log(user)
    if(!user){
        return res.json({status:'error', error:'Invalid username/password'})
    }
    const token = jwt.sign({id: user._id, username: user.username}, JWT_SECRET)
    console.log(token)
    if(await bcrypt.compare(password, user.password)){
        const token = jwt.sign({id: user._id, username: user.username}, JWT_SECRET)
        return res.json({status: 'ok', data: token})
    }
    res.json({status:'error', error: 'Invalid username/password'})
})

app.post('/changepassword', async(req,res)=>{
    const {token, newpassword: plainTextPassword} = req.body
    console.log(token)
    console.log(plainTextPassword)
    console.log(!plainTextPassword)
    console.log(typeof plainTextPassword != 'string')
    console.log(typeof(plainTextPassword))
    if(!plainTextPassword || typeof plainTextPassword != 'string'){
        return res.json({status: 'error', error: 'Invalid password'})
    }
    if(plainTextPassword.length < 5){
        return res.json({status: 'error', error: 'Password is too short, it should be atleast 6 characters'})
    }
    try{
        const user = await jwt.verify(token, JWT_SECRET)
        const _id = user.id
        console.log(_id)
        const password = await bcrypt.hash(plainTextPassword,10)
        await User.updateOne({ _id },{
            $set: {password}
        })
        res.json({status:'ok', data:req.body.token})
    }
    catch(err){
        if(err){
            res.json({status:'error', error:err.message})
        }
    }
})
app.listen('3000',()=>{
    console.log('Server is up and running on port 3000')
})