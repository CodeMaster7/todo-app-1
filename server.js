// depandencies
let express = require('express')

// connect to mongoDB

// express
let app = express()

// routes
app.get('/', function(req, res) {
    res.send('hello, welcome to our app!')
})

// start server
app.listen(3000)