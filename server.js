const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.connect('mongodb://localhost/dbNode');
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
let Article = require('./models/article')

// Setup body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// load views engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Set public folder
app.use(express.static(path.join(__dirname, 'public')));

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

// Get single article
app.get('/article/:id', function(req, res){
    Article.findById(req.params.id, function(err, article){
        res.render('article',{
            article:article
        });
        // console.log(article);
        // return;
    });
});


//add route
app.get('/articles/add', function(req,res){
    res.render('add_article',{
        title:'Add Articles'
    });
});

//Add submit POST route
app.post('/articles/add', function(req, res){
    let article = new Article();
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    article.save(function(err){
        if(err){
            console.log(err);
            return;
        } else { 
            res.redirect('/');
        }
    });
    // console.log(req.body.title);
    // return;
});

// load edit form
app.get('/article/edit/:id', function(req, res){
    Article.findById(req.params.id, function(err, article){
        res.render('edit_article',{
            title: "Edit Article",
            article:article
        });
        // console.log(article);
        // return;
    });
});

//update submit POST route
app.post('/articles/edit/:id', function(req, res){
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    Article.update(function(err){
        if(err){
            console.log(err);
            return;
        } else { 
            res.redirect('/');
        }
    });
    // console.log(req.body.title);
    // return;
});

// start server
app.listen(3000, function(){
    console.log('server started on port 3000');
});