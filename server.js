require('dotenv').config();

// depandencies
const express = require('express'),
      mongodb = require('mongodb'),
      sanitizeHTML = require('sanitize-html');

const {
    PASSWORD,
    CONNECTION_STRING,
    SERVER_PORT
} = process.env;

let port = process.env.PORT
if (port == null || port == '') {
    port = SERVER_PORT
}

// connect to mongoDB
let db
let connectionString = CONNECTION_STRING;

mongodb.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true}, function (err, client) {
    db = client.db();
    // dont let db run until its done then run server
    app.listen(port);
})

// express
let app = express();
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({extended: false}));
// tells express to use our function for all routes,
// its going to be added on to all our URL routes as the first function to run
app.use(passwordProtected)

// SECURITY
function passwordProtected(req, res, next) {
    res.set('WWW-Authenticate', 'Basic realm="Simple Todo App"')

    console.log(req.headers.authorization);

    if (req.headers.authorization == PASSWORD) {
        next()
    } else {
        res.status(401).send('Authentication required')
    }
}

// routes
// CRUD for READ
app.get('/', function(req, res) {
    db.collection('items').find().toArray(function (err, items) {
        res.send(`
        <!DOCTYPE html>
            <html>
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Simple To-Do App</title>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
            </head>
            <body>
            <div class="container">
                <h1 class="display-4 text-center py-1">To-Do App</h1>

                <div class="jumbotron p-3 shadow-sm">
                <form id='create-form' action='/create-item' method='post'>
                    <div class="d-flex align-items-center">
                    <input id='create-field' name='item' autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
                    <button class="btn btn-primary">Add New Item</button>
                    </div>
                </form>
                </div>

                <ul id='item-list' class="list-group pb-5">

                </ul>

            </div>

            <script>
                let items = ${JSON.stringify(items)}
            </script>

            <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
            <script src='/browser.js'></script>
            </body>
            </html>
        `)
    })
});

// CRUD for CREATE
app.post('/create-item', function (req, res) {
    // 1st argument a is for the text or input you want to clean up
    // 2nd argument is an object of what we dont have to allow, so empty array = not allow any html tags
    let safeText = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: {}})
    // select the database collection
    db.collection('items').insertOne({text: safeText}, function (err, info) {
        res.json(info.ops[0])
    });
});

app.post('/update-item', function (req, res) {
     let safeText = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: {}})
    // parameters inside the findOneAndUpdate method
    // a - which document we want ot update
    // b - what we want to update on that document
    // c - include a function that gets called once this database action is complete
    db.collection('items').findOneAndUpdate({_id: new mongodb.ObjectId(req.body.id)}, {$set: {text: safeText}}, function () {
        res.send('Success')
    })
})

// CRUD for DELETE
app.post('/delete-item', function (req, res) {
    db.collection('items').deleteOne({_id: new mongodb.ObjectId(req.body.id)}, function () {
        res.send('Success')
    })
})

// start server
