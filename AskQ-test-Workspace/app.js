//Libraries
var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    cookieParser = require("cookie-parser"),
    mongoose    = require("mongoose"),
    flash       = require("connect-flash"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    User        = require("./models/user");


       // configure dotenv
require('dotenv').config();
    

var indexRoutes      = require("./routes/index"),
    commentRoutes    = require("./routes/comments"),
    askqRoutes = require("./routes/AskQs");


//Seting up
mongoose.connect("mongodb://localhost/AskQ_v1");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(flash());
    
// PASSPORT CONFIGURATION
app.use(require("express-session")({
   secret: "Secret",
   resave: false,
   saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});


app.use("/", indexRoutes);
app.use("/AskQs", askqRoutes);
app.use("/AskQs/:id/comments", commentRoutes);

//Listening Port
app.listen("3000", function(){
   console.log("AskQ server is running on port 3000"); 
});