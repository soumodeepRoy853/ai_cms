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
    },
    role: {
        type: String,
        enum: ["admin", "editor", "author", "reviewer", "viewer"],
        default: "viewer"
    },
    address:[{
        label:{
            type: String
        },
        line1: {
            type: String,
            lowercase: true,
            required: true
        },
        line2: {
            type: String,
            lowercase: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        pincode: {
            type: String,
            required: true
        },
        country: {
		    type: String,
		    default: "India",
	    },
	    receiverName: {
		    type: String,
		    lowercase: true,
		    required: true,
	    },
	    receiverEmail: {
		    type: String,
		    lowercase: true,
	    },
	    receiverPhone: {
		    type: String,
		    lowercase: true,
		    required: true,
	    },
	    isDefault: {
		    type: Boolean,
		    default: false,
	    },
    }],
    oauthProvider: {
        type: String
    },
    oauthProviderId: {
        type: String
    },
    emailVerificationCode: {
        type: String
    },
     emailVerified: {
		type: Boolean,
		default: false,
	},
    emailVerifiedAt: {
        type: Date
    },
    emailOTPExpiresAt: {
        type: Date
    },
    otpResendAvailableAt: {
        type: Date
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpiresAt: {
        type: Date
    },
    profileImage: {
        type: String
    },
    termsAndPolicy: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

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
    return bcrypt.compare(enteredPassword, this.password);
};

//Generate JWT token
userSchema.methods.generateJWT = function () {
    return jwt.sign({
        id: this._id,
        email: this.email,
        userName: this.userName,
        role: this.role
    }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || "24h" });
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;