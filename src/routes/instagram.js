const express = require("express")
const Instagram = require('instagram-web-api')
const Insta = require('../model/instagram')
const axios =  require('axios')
const instaroutes = express.Router()
var client;
var username, password;


instaroutes.post('/login', async (req,res)=>{
    try {
        if(!req.body.username || !req.body.password){
            return res.status(400).json({"error": "Provide both username and password"})
        }
        username = req.body.username;
        password = req.body.password;

        client = new Instagram({ username, password })
        if(!client){
            return res.status(404).json({"error": "No user exist"})
        }
        await client.login()
        const profile = await client.getProfile()
        if(!profile){
            return res.status(400).json({"error": "Invalid username and password"})
        }
        
        var photos = await client.getPhotosByUsername({ username: username }) 
        const sprofile ={
            first_name : profile.first_name,
            last_name : profile.last_name,
            email : profile.email,
            username : profile.username,
            external_url : profile.external_url,
            phone_number : profile.phone_number
        }
        var edges = [];
        photos.user.edge_owner_to_timeline_media.edges.forEach(nodeelement => {
            const node = {
               node : {
                __typename: nodeelement.node.__typename,
                id : nodeelement.node.id,
                display_url : nodeelement.node.display_url,
                caption : nodeelement.node.edge_media_to_caption.edges,
                comments: nodeelement.node.edge_media_to_comment.count,
                likes: nodeelement.node.edge_media_preview_like.count,
                timestamp : nodeelement.node.taken_at_timestamp
               }
            }
            edges.push(node)
        });
        const sphotos = {
            count: photos.user.edge_owner_to_timeline_media.count,
             edges : edges
        }
        res.status(200).json({profile : sprofile ,photos: sphotos})        
        // res.status(200).json({"msg" : "login successfully"})
    } catch (error) {
        console.log(error)
        res.status(400).json({error})
    }
    
})

instaroutes.get('/logout', async (req,res)=>{
    try {
     await client.logout()   
     res.status(200).json({"msg": "logout successfully"}) 
    } 
    catch (error) {
         res.status(400).json({"error" : error})
    }
 })


 instaroutes.get('/post', async (req,res)=>{
    try{
        await client.getProfile()
        // var buf = Buffer.from(b64string, 'base64');
        // var buf = _base64ToArrayBuffer(b64string)
        await client.uploadPhoto({ photo: b64string, caption: 'Nature Pic', post: 'feed' })
        res.send({"message" : "successfully posted"})
    }
    catch(e){
        console.log(e)
        res.send({"error" : e.message})
    }
   
 })

 instaroutes.post('/storedata', async (req,res)=>{
    try {
        if(!req.body.userid){
            return res.status(404).json({error:"Please login first"})
        }
        var profilepic;
        // const picture = await client.getProfilePic({ username: username })
        // console.log(picture)
        // if(picture.error){
            profilepic="instalogo.png"
        // }
        // else{
        //     profilepic = picture.pic
        // }
        const isexist = await Insta.findOne({userid : req.body.userid , "profile.username" : req.body.profile.username} )
        if(isexist){
             isexist.profile = {...req.body.profile, profilepic};
             isexist.posts = req.body.posts
             await isexist.save()
             return res.status(201).json({msg: "Instagram account updated successfully"})
        }
        const insta = {
            userid : req.body.userid,
            profile : {...req.body.profile, profilepic},
            posts : req.body.posts
        }
        const instaaccount = new Insta(insta)
        await instaaccount.save()
        res.status(201).json({msg: "Instagram account added successfully"})
    } 
    catch (err) {
        res.status(400).json({error: err})
    }
    
 })

 instaroutes.post('/getdata', async (req,res)=>{
    try {
        if(!req.body.userid){
            return res.status(404).json({error:"Please login first"})
        }
        const userdata = await Insta.find({userid : req.body.userid } )
        if(!userdata){
             return res.status(201).json({msg: "You don't have any instagram account added"})
        }
    
        res.status(200).json({data: userdata})
    } 
    catch (err) {
        res.status(400).json({error: err})
    }
    
 })
 


module.exports = instaroutes