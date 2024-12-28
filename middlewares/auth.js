const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User")



// auth
exports.auth = async (req,res,next) => {
try {
    // extract token
const token =req.cookies?.token
 || req.body?.token || req.header("authorization").split(" ")[1];
if(!token)
{
    return res.status(401).json({
        success: false,
        message :"token not found"
    })
}
// verify the token 
    const decode = jwt.verify(token , process.env.JWT_SECRET);
    req.user = decode;


next()
} catch (error) {
    console.log("code fat gya")
    console.log(error)
    res.status(401).json({
        success: false,
        message:error.message
       
    })
}
}

// students
exports.isStudent = async (req,res,next) => {
try {
    if(req.user.accountType !=="Student"){
return    res.status(401).json({
    success: false,
    message:"This is protected route for students"
})


    }


next()

} catch (error) {
    return    res.status(401).json({
        success: false,
        message:"user role cannot be verified"
    })

}

}
// expert
exports.isExpert = async (req,res,next) => {
    try {
        if(req.user.accountType !=="Expert"){
    return   res.status(401).json({
        success: false,
        message:"This is protected route for Experts"
    })
    
    
        }
    
    
    
        next()

    } catch (error) {
        return    res.status(401).json({
            success: false,
            message:"user role cannot be verified"
        })
    
    }
    
    }
// admin
exports.isAdmin = async (req,res,next) => {
    try {
        if(req.user.accountType !=="Admin"){
    return res.status(401).json({
        success: false,
        message:"This is protected route for Admin"
    })
    
    
        }
    
    
        next()

    
    } catch (error) {
        return    res.status(401).json({
            success: false,
            message:"user role cannot be verified"
        })
    
    }
    
    }