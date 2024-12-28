const Profile = require("../models/Profile")
const User = require("../models/User");
const { errorHandler } = require("../utils/error")
const Assessment = require('../models/NewAssessment');
const newCourse = require('../models/Course');

const mongoose = require("mongoose");

exports.ProfileUpdate = async (req, res, next) => {

    try {
        // fetch email
        const { email, firstname, lastname, instituteName, profession } = req.body;

        if (!email || !firstname || !lastname) {
            return res.status(404).json({
                success: false,
                message: "all fields are required"
            })
        }


        // find user 
        const user = await User.findOne({ email });

        // Check if the user with the provided email exists
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        const image = `https://api.dicebear.com/5.x/initials/svg?seed=${firstname}${lastname}`

        const profile_id = user.profile._id;

        const updatedProfile = await Profile.findByIdAndUpdate(profile_id,
            {

                firstname: firstname,
                lastname: lastname,
                instituteName: instituteName,
                profession: profession,
                image: image,

            }, { new: true }
        )

        // If the profile was updated successfully, you can send the updated user data as a response
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedProfile,
        });

    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success: false,
            message: " failed to update profile",

        })
    }

}

exports.Getprofile = async (req, res) => {

    try {
        // fetch profile id
        const profileId = req.params.profileId;
        if (!profileId) {
            return res.status(404).json({
                success: false,
                message: "profileId not found",

            })
        }

        const profileData = await Profile.findById(profileId);

        if (!profileData) {
            return res.status(404).json({
                success: false,
                message: "profileData not found",

            });

        }

        return res.status(200).json({
            success: true,
            message: "profile send successfully",
            profileData

        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "error while sending profileData",
            error,
        })


    }
}



exports.Getuser = async (req, res, next) => {
    try {
        // Fetch all users and populate the 'profile' field
        const allUsers = await User.find({}).populate('profile');


        if (!allUsers || allUsers.length === 0) {
            return errorHandler(404, "UserData not found");
        }

        // Filter out users who are admins
        const nonAdminUsers = allUsers.filter(user => user.accountType === 'Admin');

        // Filtering out the 'password' field for each user
        const filteredUsers = nonAdminUsers.map(user => {
            const { password, ...filteredUser } = user.toObject();
            return filteredUser;
        });

        return res.status(200).json({
            success: true,
            message: "Non-admin users fetched successfully",
            users: filteredUsers
        });

    } catch (error) {
        next(error);
    }
};




exports.GetUserCourses = async (req, res, next) => {
    try {
        const id = req.params.id;

        // Fetch the user and populate the 'courses.assessment' field while excluding the 'password' field
        const user = await User.findById(id).populate({
            path: 'courses',
            populate: { path: 'assessment' }
        }).select('-password')

        if (!user) {
            return errorHandler(404, "User not found");
        }



        console.log(user)


        return res.status(200).json({
            success: true,
            message: "user fetched successfully",
            user
        });

    } catch (error) {
        next(error);
    }
};




exports.Getusersearch = async (req, res, next) => {
    try {




        const allUsers = await User.find({}).populate('profile').select('-password').exec()

        return res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            users: allUsers
        });
    } catch (error) {
        next(error);
    }
};


exports.Getuserbybranch = async (req, res, next) => {
    try {
        let inputfield = req.params.inputfield;
        const assessmentId = req.params.assessmentId;

        console.log(inputfield, assessmentId);

        if (!assessmentId) {
            return res.status(404).json({
                success: false,
                message: "Assessment id not found",
            });
        }

        if (!inputfield || inputfield === "") {
            const users = await newCourse.find({ assignmentId: assessmentId })
                .populate({
                    path: 'userId',
                    populate: { path: 'profile' },
                    select: '-password', // Exclude the password field
                })
                .exec();

            return res.status(200).json({
                success: true,
                message: "Users fetched successfully",
                users
            });
        }

        const allSubmissions = await newCourse.find({ assignmentId: assessmentId })
            .populate({
                path: 'userId',
                populate: { path: 'profile' },
                select: '-password', // Exclude the password field
            })
            .exec();

            const users = allSubmissions.filter(submission => submission.group === parseInt(inputfield));

        console.log(users);

        return res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            users
        });
    } catch (error) {
        next(error);
    }
};








exports.Deleteuser = async (req, res, next) => {
    try {
        const userIds = req.body.userIds; // Assuming you're passing an array of userIds in req.body.userIds

        // Check if userIds array is empty
        if (userIds.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No user found",
            });
        }

        // Convert userIds to MongoDB ObjectIds
        const idsToDelete = userIds.map(id => new mongoose.Types.ObjectId(id));


        const allUsers = await User.deleteMany({ _id: { $in: idsToDelete } })
        const deleteAssignment = await Assessment.deleteMany({ userId: { $in: idsToDelete } });
        const deleteCourse = await newCourse.deleteMany({ userId: { $in: idsToDelete } });





        return res.status(200).json({
            success: true,
            message: "Users Deleted successfully",

        });
    } catch (error) {
        next(error);
    }
};

