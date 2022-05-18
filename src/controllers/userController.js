const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')
const validator = require('../validation/validator')


// 1. User Register
const userRegister = async function (req, res) {
    try {
        const userBody = req.body;

        if(!validator.isValidRequestBody(userBody)) {
            return res.status(400).send({status: false, message: 'Please provide user details'})
        }

        const {title, name, phone, email, password, address} = userBody;
        
        if(!validator.isValid(title)) {
            return res.status(400).send({status: false, message: 'Title is required'})
        }
        
        if(!validator.isValidTitle(title)) {
            return res.status(400).send({status: false, message: 'Title is not Valid'})
        }

        if(!validator.isValid(name)) {
            return res.status(400).send({status: false, message: 'Name is required'})
        }

        if(!validator.isValid(phone)) {
            return res.status(400).send({status: false, message: 'Phone number is required'})
        }
        
        if (!(/^([+]\d{2})?\d{10}$/.test(phone))) {
            return res.status(400).send({ status: false, message: 'please provide a valid moblie Number' })
        }

        const isPhoneAlreadyUsed = await userModel.findOne({phone});
        if(isPhoneAlreadyUsed) {
            return res.status(400).send({status: false, message: `${phone} phone number is already registered`})
        }

        if(!validator.isValid(email)) {
            return res.status(400).send({status: false, message: 'Email is required'})
        }
        
        if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, message: 'Please provide a valid email' })
        }

        const isEmailAlreadyUsed = await userModel.findOne({email});

        if(isEmailAlreadyUsed) {
            return res.status(400).send({status: false, message: `${email} email address is already registered`})
        }

        if(!validator.isValid(password)) {
            return res.status(400).send({status: false, message: 'Password is required'})
        }
        
        if(!( /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(password))) {
            return res.status(400).send({ status: false, message: 'Please provide a valid password'})
        }

        if(!validator.isValid(address)) {
            return res.status(400).send({status: false, message: 'Address is required'})
        }

        if(Object.keys(address) == 0) {
            return res.status(400).send({ status: false, message: 'Address data is  required' })
        }

        if(!validator.isValid(address.street)) {
            return res.status(400).send({status: false, message: 'Street is required'})
        }

        if(!validator.isValid(address.city)) {
            return res.status(400).send({status: false, message: 'City is required'})
        }

        if(!validator.isValid(address.pincode)) {
            return res.status(400).send({status: false, message: 'Pincode is required'})
        }

        const userData = {title, name, phone, email, password, address}
        
        const createdUser = await userModel.create(userData);

        return res.status(201).send({status: true, message: 'User successfully created', data: createdUser});
    } 
    catch (error) {
        return res.status(500).send({status: false, message: error.message});
    }
}



// 2. User Login
const userLogin = async function (req, res) {
    try {
        const loginBody = req.body;
        
        if(!validator.isValidRequestBody(loginBody)) {
            return res.status(400).send({status: false, message: 'Please provide login details'})
        }

        const {email, password} = loginBody;
        
        if(!validator.isValid(email)) {
            return res.status(400).send({status: false, message: 'Email is required'})
        }
        
        if(!validator.isValid(password)) {
            return res.status(400).send({status: false, message: 'Password is required'})
        }

        const checkEmail = await userModel.findOne({email: email});

        if(!checkEmail) {
            return res.status(400).send({status: false, message: 'Invalid Email'});
        }

        const checkPassword = await userModel.findOne({password: password})

        if(!checkPassword) {
            return res.status(400).send({status: false, message: 'Invalid Password'});
        }
        
        const token = jwt.sign({
            userId: checkEmail._id.toString(),
            iat: Math.floor(Date.now()/1000),
            exp: Math.floor(Date.now()/1000) + 1 * 60 * 60 }, 'my-secret') // + 1 * 60 * 60
            // { expiresIn: '30m'}
            res.setHeader["x-api-token", token]

        return res.status(200).send({status: true, message: 'User login successfull', data: {token}});
    } 
    catch (error) {
        return res.status(500).send({status: false, message: error.message});
    }
}

module.exports.userRegister = userRegister
module.exports.userLogin = userLogin