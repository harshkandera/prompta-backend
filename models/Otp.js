const mongoose = require("mongoose");
const mailsender = require("../utils/mailsender")
const {SendOtp} = require("../emailTemplates/Otp")
const OTPSchema = new mongoose.Schema({

    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,},
        
        createdAt: { type: Date, expires: '5m', default: Date.now }

    })
async function sendVerificationEmail(email,otp){
    try {
      
      const mailResponse= await mailsender(email,"verification Email from assignment checker",SendOtp(otp))
    console.log(mailResponse)
    } catch (error) {
        console.log("error while sending the otp mail",error);
        throw error
    }
}
OTPSchema.pre("save",async function(next) {
    await sendVerificationEmail(this.email, this.otp);
    next();
})


    module.exports = mongoose.model("OTP",OTPSchema)