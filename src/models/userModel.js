const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        enum: ["Mr", "Mrs", "Miss"]
    },
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type : String,
        trim : true,
        unique: true,
        required : true,
        lowercase : true,
    },
    password: {
        type: String,
        required: true,
    },
    address: {
        street: String,
        city: String,
        pincode: String
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema)