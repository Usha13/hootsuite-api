const mongoose = require("mongoose")

const instaSchema = new mongoose.Schema({
    userid : {
        type : mongoose.Types.ObjectId,
        required : true,
        Ref : 'User'
    },
    profile: { type : Object },
    posts : { type : Object },
    scheduledpost : { type : Object },
    postsdone:{ type : Object },
    status: {
        type: String,
        default: "active"
    }
    
}, { 
    timestamps : true
})


const Instagram = mongoose.model('Instagram', instaSchema)

module.exports = Instagram