const mongoose = require("mongoose")

const fbSchema = new mongoose.Schema({
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


const Facebook = mongoose.model('Facebook', fbSchema)

module.exports = Facebook