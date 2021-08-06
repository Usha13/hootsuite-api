const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const validator = require("validator")
const instaroutes = require("../routes/instagram")

const instaSchema = new mongoose.Schema({
    userid : {
        type : mongoose.Types.ObjectId,
        required : true,
        Ref : 'User'
    },
    profile: [],
    posts : [],
    scheduledpost : [],
    postsdone:[]
    
}, { 
    timestamps : true
})


const Instagram = mongoose.model('Instagram', instaSchema)

module.exports = Instagram