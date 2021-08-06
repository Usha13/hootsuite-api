const express = require("express")
require('./src/db/mongoose')
const userroutes = require('./src/routes/user')
const instaroutes = require('./src/routes/instagram')
const cors = require("cors")

const app = express()
const port = process.env.PORT

app.use(cors())
app.use(express.urlencoded());
app.use(express.json());


app.use('/api/user', userroutes)
app.use('/api/insta', instaroutes)

app.listen(port, ()=> {
    console.log("Server running on port", port)
})