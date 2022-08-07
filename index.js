const cors          = require('cors')
const http          = require('http')
const path          = require('path')
const express       = require('express')
const cookieParser  = require('cookie-parser')
const app           = express()
require('colors')
require('dotenv').config()
const corsOptions   = require('./services/corsOptions')
const ErrorHandler  = require('./middleware/ErrorHandler')
const { logEvents, logger } = require('./middleware/LogEvents')

//* MMIDDLEWARE'S
app.use(logger)
app.use(cors(/* corsOptions */)) // Cross Origin Resource Sharing
app.use(ErrorHandler)
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname, '/public')))

app.use('/api', require('./routes/routes'))

app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) res.sendFile(path.join(__dirname, 'views', '404.html'))
    else if (req.accepts('json')) res.json({ "error": "404 Not Found" })
    else res.type('txt').send("404 Not Found")
})

//* VIEW ENGINE
app.set("view engine", "ejs")

const PORT = process.env.PORT || 4001
const httpServer = http.createServer(app)
httpServer.listen( PORT, () => {
    logEvents(`SERVER IS RUNNING ON PORT: ${PORT}`, 'serverRunLog.txt')
    console.log(`\n\n|-O-|\n\nSERVER IS RUNNING ON PORT: ${PORT.brightBlue}\t${new Date()}\n\n`.yellow)
})
