const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    
firstname:{
    type:String,
  
},
lastname:{
    type:String,
  
},

image:{
    type:String,
},

email:{
    type:String,
},
instituteName:{
    type:String,
}
,
profession:{
    type:String,
}
})
module.exports = mongoose.model("Profile",profileSchema);