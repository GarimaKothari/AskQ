var mongoose = require("mongoose");

var topicSchema = mongoose.Schema({
   tags: String,
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
});

module.exports = mongoose.model("Topic", topicSchema);