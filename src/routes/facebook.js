const express = require("express")
const axios =  require('axios')
const fbroutes = express.Router()
const Facebook = require("../model/facebook")

const url = 'https://graph.facebook.com';

fbroutes.get('/getprofile', function(req, res) {
    if(! req.query['id'] || !req.query['access_token']){
        return res.status(400).json({error : "provide id and access_token"})
    }
    const userid = req.query['id']
    const access_token =  req.query['access_token']
    axios.get(url+'/'+userid+'?access_token='+access_token+'&fields=id,first_name,last_name,picture')
    .then(function (response) {
        // handle success
        console.log(response);
        return res.status(200).json(response.data)
    })
    .catch(function (error) {
        // handle error
        console.log(error);
        return res.status(400).json({error: error.message})
    })
})

fbroutes.get('/getposts', async (req, res)=> {
    if(! req.query['id'] || !req.query['access_token']){
        return res.status(400).json({error : "provide id and access_token"})
    }
    const userid = req.query['id']
    const access_token =  req.query['access_token']

    await axios.get(url+'/'+userid+'/posts?access_token='+access_token)
    .then(async function (response) {
        // handle success
        const media = response.data.data
        var posts = [];
        for(var i =0 ; i< media.length; i++){
            const mid = media[i].id
            const data = await fetchMedia(mid,access_token)    
            console.log(data)
            posts.push(data)
        }
        const mediaObject = {
            count : posts.length,
            edges: posts
        }
        return res.status(200).json(mediaObject)
    })
    .catch(function (error) {
        // handle error
        console.log(error);
        return res.status(400).json({error: error.message})
    })
})

    async function fetchMedia(mid, access_token){
        try {
            const data = await axios.get(url+'/'+mid+'?access_token='+access_token +"&fields=full_picture,from,created_time,caption,actions,message").then(
                (res)=>{
                    return res.data
                }
            )
            // console.log(data)
            return data;

        } catch (error) {
            return error
        }
        
    }

fbroutes.post('/storedata', async (req, res)=> {
    try {
        if(!req.body.userid){
            return res.status(404).json({error:"Please login first"})
        }
       
        const isexist = await Facebook.findOne({userid : req.body.userid , "profile.id" : req.body.profile.id} )
        if(isexist){
             isexist.profile = req.body.profile;
             isexist.posts = req.body.posts
             await isexist.save()
             return res.status(201).json({msg: "Facebook account updated successfully"})
        }
        const fb = {
            userid : req.body.userid,
            profile : req.body.profile,
            posts : req.body.posts
        }
        const fbaccount = new Facebook(fb)
        await fbaccount.save()
        res.status(201).json({msg: "Facebook account added successfully"})
    } 
    catch (err) {
        res.status(400).json({error: err})
    }  
});

fbroutes.post('/getdata', async (req,res)=>{
    try {
        if(!req.body.userid){
            return res.status(404).json({error:"Please login first"})
        }
        const userdata = await Facebook.find({userid : req.body.userid } )
        if(!userdata){
             return res.status(201).json({msg: "You don't have any facebook account added"})
        }
    
        res.status(200).json({data: userdata})
    } 
    catch (err) {
        res.status(400).json({error: err})
    }
    
 })

module.exports = fbroutes