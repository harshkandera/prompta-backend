const mongoose = require("mongoose");

const expertsSchema = new mongoose.Schema({
    
expertname:{
    type:String,
    required:true
},

imageUrl:{
    type:String,
},

email:{
    type:String,
    required:true
},

about:{
    type:String,
    required:true
}
,
role:{
    type:String,
}
})

module.exports = mongoose.model("Expert",expertsSchema);