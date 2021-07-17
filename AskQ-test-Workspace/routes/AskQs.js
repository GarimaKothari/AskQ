var express = require("express");
var router  = express.Router();
var AskQ = require("../models/AskQ");
var userr = require("../models/user");
var Topic = require("../models/topic");
var async = require("async");
var middleware = require("../middleware");

router.get("/topic", function(req, res){
    res.render("topic");   
});

var tag = [];

router.post("/topic",function(req, res){
    
    // get data from form and add to AskQ array
    var tags = req.body.tags;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newTopic = {tags:tags,author:author}
    // Create a new AskQ and save to DB
    Topic.create(newTopic, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to AskQ page
            console.log(newlyCreated);
            res.redirect("/AskQs/topic");
        }
    });
});



//INDEX - show all Topic AskQs
router.get("/",isLoggedIn, function(req, res){
    // Get all AskQ of selected topic from DB

    var author = {
        id: req.user._id,
        username: req.user.username
    }
    
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all campgrounds from DB
        AskQ.find({QuesH: regex}, function(err, allAskQ){
           if(err){
               console.log(err);
           } else {
              if(allAskQ.length < 1) {
                noMatch = "No campgrounds match that query, please try again.";
              }
              res.render("askq/more",{AskQs:allAskQ, noMatch:noMatch, author:author});
           }
        });
    }else{
        Topic.find({'author':author},function(err, allTopic){
            if(err){
                console.log(err);
            } else {
                var i = 0;
               allTopic.forEach(element => {
                   tag[i] = element.tags;
                   i++;
               });
            }
            console.log(tag);
            AskQ.find({ tags: { $in:tag } }, function(err, allAskQ){
            
                if(err){
                    console.log(err);
                } else {
                   res.render("askq/index",{AskQs:allAskQ,author:author,topics:allTopic});
                }   
            
        });
    
        tag = [''];
    });
    }
    
});


//All Post
router.get("/more",isLoggedIn, function(req, res){

    // Get all AskQ from DB
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all campgrounds from DB
        AskQ.find({QuesH: regex}, function(err, allAskQ){
           if(err){
               console.log(err);
           } else {
              if(allAskQ.length < 1) {
                noMatch = "No campgrounds match that query, please try again.";
              }
              res.render("askq/more",{AskQs:allAskQ, noMatch:noMatch, author:author});
           }
        });
    }else
        {
            AskQ.find({}, function(err, allAskQ){
                if(err){
                    console.log(err);
                } else {
                   res.render("askq/more",{AskQs:allAskQ,author:author,noMatch: noMatch});
                }
             });
        }
});

//CREATE - add new AskQ to DB
router.post("/", isLoggedIn, async function(req, res){
    
    // get data from form and add to AskQ array
    var QuesH = req.body.QuesH;
    var desc = req.body.description;
    var tags = req.body.tags;
    var date = req.body.date;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var today = new Date();
    date = today;
    var newAskQ = {QuesH: QuesH,description: desc,tags: tags,date: date, author:author}
    
    AskQ.create(newAskQ, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to AskQ page
            console.log(newlyCreated);
            res.redirect("/AskQs");
        }
    });
});

//NEW - show form to create new AskQ
router.get("/new", isLoggedIn, function(req, res){
   res.render("askq/new"); 
});


//My A&Q
router.get("/A&Q",isLoggedIn, function(req, res){
       // Get all AskQ from DB
       var nae = req.user.username;
       console.log(nae);
    AskQ.find({'author.username':nae}, function(err, allAskQ){
        if(err){
            console.log(err);
        } else {
           res.render("askq/A&Q",{AskQs:allAskQ,nae:nae});
        }
     });
});


// SHOW - shows more info about one AskQ
router.get("/:id", function(req, res){
    AskQ.findById(req.params.id).populate("comments").exec(function(err, foundAskQ){
        if(err){
            console.log(err);
        } else {
            console.log(foundAskQ)
            res.render("askq/show", {AskQ: foundAskQ});
        }
    });
});

// deleting a topic

router.post("/delete", isLoggedIn, function(req, res){
    var tag1 = req.body.tags;
    console.log(tag1); 
    Topic.deleteOne({ tags: tag1 }, function (err, done) {
        if (err){
            console.log(err);
        }else{
            console.log(done);
            res.redirect('/AskQs/topic');
        }
      });
 });
 
 router.post("/like", isLoggedIn, function(req, res){
    AskQ.like = req.body.like;
    console.log(AskQ.like); 
    res.redirect('/AskQs');
 });



// EDIT AskQ ROUTE
router.get("/:id/edit", middleware.checkAskQOwnership, function(req, res){
    AskQ.findById(req.params.id, function(err, foundAskQ){
        res.render("askq/edit", {askQ: foundAskQ});
    });
});

// UPDATE AskQ ROUTE
router.post("/:id/update",middleware.checkAskQOwnership, function(req, res){
    AskQ.findByIdAndUpdate(req.params.id, req.body.askQ, {new: true}, function(err, updatedAskQ){
       if(err){
           res.redirect("/AskQs");
           console.log(err);
       } else {
           res.redirect("/AskQs/" + req.params.id);
       }
    });
});

// DESTROY AskQ ROUTE
router.post("/:id/delete",middleware.checkAskQOwnership, function(req, res){
    AskQ.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err);
            res.redirect("/AskQs");
        } else {
            res.redirect("/AskQs");
        }
     });
});

//middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","please login first!");
    res.redirect("/login");
}

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;