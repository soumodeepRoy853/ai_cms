import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

//Hash the password
userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(6);
        this.password = await bcrypt.hash(this.password, salt);
        
        next();
    } catch (err) {
        next(err);
    }
});

//Compare the user password
userSchema.methods.comparedPassword = async function(enteredPassword){
    return bcrypt.compare(this.password, enteredPassword)
};

//Generate JWT token
userSchema.methods.generateJWT = function () {
    return jwt.sign ({
        id: this._id,
        email: this.email,
        name: this.name
    }, process.env.JWT_SECRET, {expiresIn: '24h'})
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;