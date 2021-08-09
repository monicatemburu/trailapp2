var express = require('express');

var mongoose = require('mongoose');

var User = require('./model/user')

var bcrypt = require('bcryptjs')

var app = express();

var path = require('path');

mongoose.connect('mongodb://localhost:8000/myFirstDatabase',{
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
    try{
        const response = await User.create({
            username,
            password
        })
        console.log(response)
    }
    catch(err){
        console.log(err)
        return res.json({status:"error"})
    }
    res.json({status: 'ok'})
})

app.listen('3000',()=>{
    console.log('Server is up and running on port 3000')
})