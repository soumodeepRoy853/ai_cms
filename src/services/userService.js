import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//Custom error with status code
function createError(status, message){
    const err = new Error(message);
    err.status = (status);
    return err;
};

//Ensure function to validate inputs
function ensure(...checks) {
  for (const [cond, msg] of checks) {
    if (!cond) throw new Error(msg);
  }
}

export const registerUser = async(userData) => {
    try {
       const {userName, email, phone, password} = userData || {};
       ensure(
        [userName && typeof userName === "string", "Valid userName is required"],
        [email && typeof email === "string", "Valid email is required"],
        [password && typeof password === "string", "Valid password is required"],
        [phone && typeof phone === "string", "Valid phone is required"]
       );

       const user = await User.findOne({ email });
       if(user){
        createError(400, "User is already exist");
       };

       const newUser = new User({userName, email, phone, password});
       await newUser.save();
       return newUser;

    } catch (err) {
        throw createError(400, err.message || "Error creating new user")
    }
};

export const loginUser = async(loginData) => {
    try {
        const {email, password} = loginData || {};
        ensure(
            [email && typeof email === "string", "Valid email is required"],
            [password && typeof password === "string", "Valid password is required"]
        );

        const user = await User.findOne({ email });
        if(!user){
            throw createError(400, "User does not exist");
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            throw createError(400, "Invalid credentials");
        };
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES });
        return {user, token};
    } catch (err) {
        throw createError(400, err.message || "Error logging in user")
    }
};