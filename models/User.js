const mongoose = require("mongoose")

const courses = new mongoose.Schema({
    assessment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "newAssignments"
    },
    course:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "newCourse"
    },
    verified: {
        type: Boolean,
        default: false
    },

})


const userSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
    },

    accountType: {
        type: String,
        enum: ["Admin", "Student", "Expert"],
    },
    courses: [courses],

    assessments: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assessment",
    },
    assessmentsProgress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AssessmentsProgress",
    }


})

module.exports = mongoose.model("User", userSchema)