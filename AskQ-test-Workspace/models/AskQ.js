var mongoose = require("mongoose");

var askqSchema = new mongoose.Schema({
   QuesH: String,
   description: String,
   tags: String,
   date : String,
   like: {
      type:Number
   },
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
});

module.exports = mongoose.model("askq", askqSchema);