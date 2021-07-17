var express = require("express");
var router  = express.Router({mergeParams: true});
var AskQQ = require("../models/AskQ");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var today = new Date();

//Comments New
router.get("/new", isLoggedIn, function(req, res){
    // find AskQ by id
    console.log(req.params.id);
    AskQQ.findById(req.params.id, function(err, AskQ){
        if(err){
            console.log(err);
        } else {
             res.render("comment/new", {AskQ: AskQ});
        }
    })
});

//Comments Create
router.post("/",isLoggedIn,function(req, res){
   //lookup AskQ using ID
   AskQQ.findById(req.params.id, function(err, AskQ){
       if(err){
           console.log(err);
           res.redirect("/AskQs");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               console.log(err);
           } else {
               //add username and id to comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               comment.date = req.body.date;
               comment.date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
               //save comment
               comment.save();
               AskQ.comments.push(comment);
               AskQ.save();
               res.redirect('/AskQs/' + AskQ._id);
           }
        });
       }
   });
});

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
       if(err){
           res.redirect("back");
       } else {
         res.render("comment/edit", {AskQ_id: req.params.id, comment: foundComment});
       }
    });
 });
 
 // COMMENT UPDATE
 router.post("/:comment_id/update", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
       if(err){
           res.redirect("back");
       } else {
           res.redirect("/AskQs/" + req.params.id );
       }
    });
 });
 
 // COMMENT DESTROY ROUTE
 router.post("/:comment_id/delete", middleware.checkCommentOwnership, function(req, res){
     //findByIdAndRemove
     Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/AskQs/" + req.params.id);
        }
     });
 });

//middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}


module.exports = router;