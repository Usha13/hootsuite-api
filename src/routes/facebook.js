const express = require("express")
const axios =  require('axios')
const fbroutes = express.Router()

const url = 'https://graph.facebook.com';

fbroutes.get('/auth',function (req, res) {
      var redirect_uri = "http://localhost:3000" + "/api/facebook/callback";
      // For eg. "http://localhost:3000/facebook/callback"
      var params = {'redirect_uri': redirect_uri, 'scope':'user_posts,user_about_me,publish_actions'};
      res.redirect(oauth2.getAuthorizeUrl(params));
});

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
        return res.status(400).json({error})
    })
})

fbroutes.get('/getposts', function(req, res) {
    if(! req.query['id'] || !req.query['access_token']){
        return res.status(400).json({error : "provide id and access_token"})
    }
    const userid = req.query['id']
    const access_token =  req.query['access_token']

    axios.get(url+'/'+userid+'/posts?access_token='+access_token)
    .then(function (response) {
        // handle success
        console.log(response);
        const media = response.data.data
        var posts = [];
        media.forEach((node)=>{
            const mid = node.id
            axios.get(url+'/'+mid+'?access_token='+access_token +"&fields=full_picture,from,created_time,caption,actions,message")
                .then(function (response) {
                    // handle success
                    console.log(response.data);
                    posts.push(response.data)
                    return posts
                })
                .catch(function (error) {
                    // handle error
                    console.log(error);
                    return res.status(400).json({error})
                })
        })
        
        return res.status(200).json(posts)
    })
    .catch(function (error) {
        // handle error
        console.log(error);
        return res.status(400).json({error})
    })
})


   fbroutes.post('/post_to_fb', function(req,res) {
    var url = 'https://graph.facebook.com/me/feed';
    var params = {
     access_token: req.session.access_token,
     message: req.body.text,
      link: req.body.url
     
    };
    request.post({url: url, qs: params}, function(err, resp, body) {
     if (err) {
      console.error(err)
       return;
     }
     body = JSON.parse(body);
     if (body.error) {
      var error = body.error.message;
       console.error("Error returned from facebook: "+ body.error.message);
       if (body.error.code == 341) {
       error = "You have reached the post limit for facebook. Please wait for 24 hours before posting again to facebook." 
      console.error(error);
       }
       res.send(error);
     }
     var return_ids = body.id.split('_');
     var user_id = return_ids[0];
     var post_id = return_ids[1];
     var post_url = "https://www.facebook.com/"+user_id+"/posts/"+post_id;
     res.send(post_url);
    });
   });

module.exports = fbroutes