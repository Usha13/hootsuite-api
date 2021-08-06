const express = require("express")
const Instagram = require('instagram-web-api')
const Insta = require('../model/instagram')
const instaroutes = express.Router()
var client;
var username, password;

instaroutes.get('/profile', async (req,res)=>{
   try {
    const profile = await client.getProfile()
    
    if(!profile){
        return res.status(400).json({"error": "Invalid username and password"})
    }
    const sprofile ={
        first_name : profile.first_name,
        last_name : profile.last_name,
        email : profile.email,
        username : profile.username,
        external_url : profile.external_url,
        phone_number : profile.phone_number
    }
    console.log(sprofile)
    res.status(200).json({profile : sprofile}) 
   } 
   catch (error) {
        res.status(400).json({"error" : error})
   }
  
})

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
                caption : nodeelement.node.edge_media_to_caption,
                comments: nodeelement.node.edge_media_to_comment.count,
                likes: nodeelement.node.edge_media_preview_like.count
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

instaroutes.get('/photos', async (req,res)=>{
    try{
        await client.getProfile()
        // var photos = await client.getPhotosByUsername({ username:'usha_aswani02'}) 
        var photos = await client.getPhotosByUsername({ username: username }) 
        var edges = [];
        photos.user.edge_owner_to_timeline_media.edges.forEach(nodeelement => {
            const node = {
               node : {
                __typename: nodeelement.node.__typename,
                id : nodeelement.node.id,
                display_url : nodeelement.node.display_url,
                caption : nodeelement.node.edge_media_to_caption,
                comments: nodeelement.node.edge_media_to_comment.count,
                likes: nodeelement.node.edge_media_preview_like.count
               }
            }
            edges.push(node)
        });
        const sphotos = {
            count: photos.user.edge_owner_to_timeline_media.count,
             edges : edges
        }
        res.send({photos : sphotos})
    }
    catch(e){
        console.log(e)
    }
   
 })

 instaroutes.get('/post', async (req,res)=>{
    try{
        await client.getProfile()
        const photo = 'https://thumbs-prod.si-cdn.com/P4Smi9MthEBXH7pdW8Y-bvwR6ts=/1072x720/filters:no_upscale()/https://public-media.si-cdn.com/filer/04/8e/048ed839-a581-48af-a0ae-fac6fec00948/gettyimages-168346757_web.jpg'
        await client.uploadPhoto({ photo, caption: 'Nature Pic', post: 'feed' })
    }
    catch(e){
        console.log(e)
    }
   res.send({"message" : "successfully posted"})
 })

 instaroutes.post('/storedata', async (req,res)=>{
    try {
        if(!req.body.userid){
            return res.status(404).json({error:"Please login first"})
        }
        console.log(req.body)
        console.log("hyy")
        const isexist = await Insta.findOne({userid : req.body.userid , "profile.username" : req.body.profile.username} )
        if(isexist){
             isexist.profile = req.body.profile;
             isexist.posts = req.body.posts
             await isexist.save()
             return res.status(201).json({msg: "Instagram account updated successfully"})
        }
        const instaaccount = new Insta(req.body)
        await instaaccount.save()
        console.log(instaaccount)
        res.status(201).json({msg: "Instagram account added successfully"})
    } 
    catch (err) {
        res.status(400).json({error: err})
    }
    
 })
 


module.exports = instaroutes