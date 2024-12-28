const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  participants: [{
    type: String,
    required: true,
  }],
    messages: [{
      sender: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Profile",
        required: true,
      }, 
    reciever: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Profile",
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    }],
  });
  

module.exports = mongoose.model("chat", ChatSchema);
