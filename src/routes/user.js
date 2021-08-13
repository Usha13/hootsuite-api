const express = require("express")
const bcrypt = require("bcrypt")
const User = require('../model/user')
const userroutes = express.Router()
const auth = require("../middleware/auth")

userroutes.post('/emailsignup', async (req,res)=>{
    const {username,email,password} = req.body
    try {
        if(!username || !email || !password){
            return res.status(400).json({error: "All fields are required"})
        }
        const sameuser = await User.findOne({email : req.body.email , provider : "EmailPassword"})
        if(sameuser){
            return res.status(200).json({error: "User already exists"})
        }
        const hashpsw = await bcrypt.hash(password, 10)
        const user = await new User({
            username,
            email,
            password: hashpsw
        }).save()
        const token = await user.generateAuthToken()
        console.log(token)
        res.status(201).json({user, token})
    } catch (err) {
        res.status(400).json({error : err.message})
    }
})

userroutes.post('/googlesignup', async (req,res)=>{
    try {

        const user = await User.findOne({email : req.body.email , provider : "Google"})
        if(user){
            return res.status(200).json(user)
        }
        console.log(req.body)
        const saveduser = await new User(req.body).save()
        console.log(saveduser)
        res.status(201).json({user: saveduser})
    } catch (err) {
        console.log(err)
        res.status(400).json({error : err.message})
    }
})

userroutes.post('/emaillogin', async (req,res)=>{
    const {email, password} = req.body
    try {
        // if(req.token){
        //     return res.status(400).send({"error": "Already Logged In"})
        // }
        if(!email || !password){
            return res.status(400).json({error : "Please provide both email and password"})
        }

        const user = await User.findOne({email})

        if(!user){
            return res.status(400).json({error: "User not exist"})
        }

        const ismatch = await bcrypt.compare(password, user.password)
        if(!ismatch){
            return res.status(400).json({error: "Invalid email or password"})
        }

        const token = await user.generateAuthToken()
        res.status(200).json({user, token})
    } catch (err) {
        res.status(400).json({error: err.message})
    }
})

userroutes.get('/profile', auth , async (req,res)=>{
    try {
        res.status(200).json(req.user)
    } catch (err) {
        res.status(400).json({error: err.message})
    }
})

userroutes.get('/logout',auth,async (req,res)=> {
    req.user.deleteToken(req.token,(err,user)=>{
        if(err) {
            return res.status(400).json(err);
        }
        
        res.status(200).json({message: "Logout Successfully"})
    });

}); 


module.exports = userroutes