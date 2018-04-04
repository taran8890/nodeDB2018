const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

const port = process.env.PORT || 3000;

mongoose.connect(config.database);
let db = mongoose.connection;

// check connection

db.once('open', function(){
    console.log('Connected to mongoDB');
});

// check for db error
db.on('error', function(err){
    console.log(err);
})


// intialize app
const app = express();

// bring in models
let Article = require('./models/article');

// Setup body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// load views engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// express session middleware
app.use(session({
    secret: 'make things better',
    resave: true,
    saveUninitialized: true
  }));

// express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// express validator middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
    var namespace = param.split('.'),
    root = namespace.shift(),
    formParam = root;

    while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
    
    } return {
        param: formParam,
        msg: msg,
        value: value
     };

    }
}));

// passport config
require('./config/passport')(passport);

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
    res.locals.user = req.user || null;
    next();
});

// home route
app.get('/', function(req, res){
    Article.find({}, function(err, articles){
        if(err){
            console.log(err);
        } else {
            res.render('index', {
                title:"Articles",
                articles: articles
            });
        }
    });
});

// bring routes file here
let articles = require('./routes/articles.js');
let users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);

// start server
app.listen(port, function(){
    console.log(console.log("App is running on port " + port));
});
