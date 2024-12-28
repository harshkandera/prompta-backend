const User = require("../models/User");
const OTP = require("../models/Otp")
const OtpGenenrator = require("otp-generator")
const bcrypt = require("bcrypt")
const Profile = require("../models/Profile")
const jwt = require("jsonwebtoken")
const NewAssignments = require('../models/NewAssignment');
const Assessment = require('../models/NewAssessment');
const newCourse = require('../models/Course');
const mongoose = require("mongoose");
const experts = require('../models/Experts');
const cloudinary = require('cloudinary').v2;
const path = require('path');

// sendotp
exports.SendOTP = async (req, res) => {
    try {
        // fetch email
        const { email } = req.body;
        // validate email
        const checkUserPresent = await User.findOne({ email });

        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "User already exits",
            })
        }
        // generate otp
        var otp = OtpGenenrator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        console.log("otp generated :", otp);

        // check unique otp
        const result = await OTP.findOne({ otp: otp });

        while (result) {
            otp = OtpGenenrator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            const result = await OTP.findOne({ otp: otp });
        }
        const otpPayload = { email, otp };
        // create an entry in db 
        const otpbody = await OTP.create(otpPayload);
        console.log(otpbody)

        // return res succuessful
        res.status(200).json({
            success: true,
            message: "OTP send to db successfully",
            otp,
        })

    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success: false,
            message: " failed to otp in db",

        })

    }


}
// signup
exports.Signup = async (req, res) => {
    try {
        //data fetch req body
        const {
            email,
            password,
            confirmPassword,
            otp
        } = req.body
        const accountType = "Student";
        // validate 
        if (!email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "all fields are required"
            })
        }
        // password match confirm
        if (password !== confirmPassword) {
            return res.status(403).json({
                success: false,
                message: "passowrd and confirm password should be same"
            })
        }

        // check user already exist or not
        const existuser = await User.findOne({ email })
        if (existuser) {
            return res.status(403).json({
                success: false,
                message: "user already exist"
            })
        }

        // generate otp

        // find recent otp
        const recentotp = await OTP.findOne({ email }).sort({ createdAt: -1 }).limit(1);
        console.log("recentotp", recentotp);

        if (recentotp.length === 0) {
            return res.status(403).json({
                success: false,
                message: "otp-not-found"
            })
        }
        else if (otp !== recentotp.otp) {
            return res.status(403).json({
                success: false,
                message: "otp-did not match"
            })
        }

        // hash pass
        const hashedPassword = await bcrypt.hash(password, 10);

        // create profile
        const profileDetails = await Profile.create({
            firstname: null,
            lastname: null,
            branch: null,
            rollnumber: null,
            image: null,
            email: email,
        })
        // create user entry
        const user = await User.create({
            email,
            password: hashedPassword,
            accountType,
            profile: profileDetails._id,
            approved: false,
        })

        return res.status(200).json({
            success: true,
            message: "user sign up successfully",
            user
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success: false,
            message: "failed to signup"
        })
    }
}

// loginj
exports.login = async (req, res, next) => {
    try {
        // fetch data from body
        const { email, password } = req.body;

        // validate data
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "all fields are required"
            })
        }

        //if user exist 
        let user = await User.findOne({ email });


        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        //generate JWT, after password matching
        if (await bcrypt.compare(password, user.password)) {

            const payload = { email: user.email, id: user.id, accountType: user.accountType }

            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" },)
            user = user.toObject()
            user.token = token;
            user.password = undefined;

            //create cookie for user sent to client



            // Set the cookie with the JWT token
            res.cookie("token", token, {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Set an appropriate expiration date
                httpOnly: true, // Make the cookie httpOnly for security
                secure: true, // Set secure flag in production
            });

            return res.status(200).json({
                success: true,
                message: "User Logged In Successfully",
                data: user,
                token,
            });

        } else {

            return res.status(403).json({
                success: false,
                message: "password do not match"

            })



        }



    } catch (error) {
        console.log(error)
        return res.status(403).json({
            success: false,
            message: "error in log in",

        })
    }
}

// Forgot PAssword

exports.ForgotPass = async (req, res) => {
    try {
        // fetch email
        const { email } = req.body;
        // validate email
        const checkUserPresent = await User.findOne({ email });

        if (!checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "No user Exist With This Email",
            })
        }

        // generate otp
        var otp = OtpGenenrator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        console.log("otp generated :", otp);

        // check unique otp
        const result = await OTP.findOne({ otp: otp });

        while (result) {
            otp = OtpGenenrator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            const result = await OTP.findOne({ otp: otp });
        }

        const otpPayload = { email, otp };
        // create an entry in db 

        const otpbody = await OTP.create(otpPayload);
        console.log(otpbody)

        // return res succuessful
        res.status(200).json({
            success: true,
            message: "OTP send to db successfully",
            otp,
        })

    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success: false,
            message: " failed to otp in db",

        })

    }


}

// change password 
exports.ChangePass = async (req, res) => {
    try {
        //data fetch req body
        const {
            email,
            password,
            confirmPassword,
            otp
        } = req.body


        // validate 
        if (!email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "all fields are required"
            })
        }
        // password match confirm
        if (password !== confirmPassword) {
            return res.status(403).json({
                success: false,
                message: "passowrd and confirm password should be same"
            })
        }

        // check user already exist or not
        const existuser = await User.findOne({ email })
        if (!existuser) {
            return res.status(403).json({
                success: false,
                message: "No user with this email"
            })
        }

        // generate otp

        // find recent otp
        const recentotp = await OTP.findOne({ email }).sort({ createdAt: -1 }).limit(1);
        console.log("recentotp", recentotp);

        if (recentotp.length === 0) {
            return res.status(403).json({
                success: false,
                message: "otp-not-found"
            })
        }
        else if (otp !== recentotp.otp) {
            return res.status(403).json({
                success: false,
                message: "otp-did not match"
            })
        }

        // hash pass
        const hashedPassword = await bcrypt.hash(password, 10);



        // create user entry
        const user = await User.findOne({ email })

        user.password = hashedPassword;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
            user
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success: false,
            message: "failed to Change Password",
        })
    }
}


exports.RequestAuthorizeCourse = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const assessmentId = req.params.assessmentId;
        const group = req.params.group;
        let newCourseEnrollment;
        function intToAlphabet(num) {
            if (num >= 1 && num <= 26) {
                return String.fromCharCode(num + 64); // 65 corresponds to 'A', 66 to 'B', and so on
            } else {
                return null; // Return null for numbers outside the valid range
            }
        }
        // Check if the user has already been authorized for the assessment
        let submission = await newCourse.findOne({ assignmentId: assessmentId, userId: userId });

        if (submission) {
            throw new Error('You are already authorized');
        }

        // Check if the assignment exists
        const assignment = await NewAssignments.findOne({ _id: assessmentId });
        
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found",
            });
        }

        if (new Date(assignment?.dueDate) < new Date()) {

            return res.status(400).json({
                success: false,
                message: "Course Completed"

            }
            )

        }
        const students = await newCourse.find({ assignmentId: assessmentId, group: group });

        // Check if the group is valid and there are available slots
        if (assignment.groups >= group && (students.length < assignment.maxStudent)) {
            // Create a new course enrollment for the student
            newCourseEnrollment = await newCourse.create({ assignmentId: assessmentId, userId: userId, group: group });

        } else {
            return res.status(400).json({
                success: false,
                message: `Group ${intToAlphabet(group)} has reached it's maximum capacity`,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Request Sent Successfully",
            newCourseEnrollment
        });
    } catch (error) {
        console.error("An error occurred during Request", error);
        next(error);
    }
};


exports.RoleChange = async (req, res, next) => {
    try {
        const { userIds, accountType } = req.body;

        console.log(req.body);

        // Validate inputs
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0 || !accountType) {
            return res.status(400).json({
                success: false,
                message: "Invalid request body. Please provide 'userIds' (array) and 'accountType'.",
            });
        }

        const idsToVerify = userIds.map(id =>new mongoose.Types.ObjectId(id));

        // Update documents in User collection
        const result = await User.updateMany(
            { _id: { $in: idsToVerify } },
            { accountType: accountType }
        );

        return res.status(200).json({
            success: true,
            message: "Role changed successfully",
            updatedCount: result.nModified // Number of documents updated
        });
    } catch (error) {
        console.error("An error occurred during Request", error);
        next(error); // Pass error to the error handling middleware
    }
};



function isFileSupported(type, supportedTypes) {
    return supportedTypes.includes(type);
  }
  
  // Function to upload file to Cloudinary
  async function uploadFileToCloudinary(file, folder) {
    const options = {
        resource_type: 'auto',
        folder: folder,
        public_id: `${Date.now()}`
      };

    try {
      const result = await cloudinary.uploader.upload(file.tempFilePath, options);
      return result.secure_url;
    } catch (err) {
      throw new Error(`Failed to upload file to Cloudinary: ${err.message}`);
    }
  }
  


exports.Experts = async (req, res, next) => {

    try {
        const { expertname,about , email ,  role} = req.body;
        const supportedTypes = ["jpg", "jpeg", "png"];
        console.log(req.body);
console.log(req.files)

let image = req.files ? req.files.image : null;



if(image){
   // Validate file type
   const fileType = path.extname(image.name).toLowerCase().slice(1);
   if (!isFileSupported(fileType, supportedTypes)) {
     return res.status(400).json({ error: `${image.name}: Unsupported file type.` });
   }

   // Upload image to Cloudinary
   let imageUrl;

   try {

     imageUrl = await uploadFileToCloudinary(image, "Assignments");
     
   } catch (err) {
     console.error(`Failed to upload ${image.name} to Cloudinary:`, err);
     return res.status(500).json({ error: `Failed to upload ${image.name} to Cloudinary.` });
   }

   const expert = await experts.create({ expertname,about , email , imageUrl , role});
      
   console.log(expert)
   return res.status(200).json({
    success: true,
    message: "expert added successfully",

});

}
  

    const expert = await experts.create({ expertname,about , email , role});
   
    // console.log(expert)

 
        return res.status(200).json({
            success: true,
            message: "expert added successfully",
            Experts: expert 
        });
    } catch (error) {
        console.error("An error occurred during Request", error);
        next(error); // Pass error to the error handling middleware
    }
};

exports.AllExperts = async (req, res, next) => {
    try {

   const Experts = await experts.find();

        return res.status(200).json({
            success: true,
            message: "all experts fetched successfully",
            Experts // Number of documents updated
        });
    } catch (error) {
        console.error("An error occurred during Request", error);
        next(error); // Pass error to the error handling middleware
    }
};


exports.DeleteExperts = async (req, res, next) => {
    try {
      const { expertId } = req.params;
  
      // Delete the expert by ID
      const Expert = await experts.findByIdAndDelete(expertId);
  
      // If no expert found with the given ID, return 404
      if (!Expert) {
        return res.status(404).json({
          success: false,
          message: "Expert not found",
        });
      }
  
      // Fetch all remaining experts after deletion
      const remainingExperts = await experts.find();
  
      // Return success response with remaining experts
      return res.status(200).json({
        success: true,
        message: "Expert deleted successfully",
        Experts: remainingExperts,
      });
    } catch (error) {
      console.error("An error occurred during request:", error);
      next(error); // Pass error to the error handling middleware
    }
  };