const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

require("dotenv").config();

// MongoDB connection
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(error => console.log("❌ MongoDB Connection Failed:", error))
    .finally(() => mongoose.connection.close());

// User Schema (Data Structure)
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", UserSchema);

// Register new User
const registerUser = async (email, password) => {
    try {
        const userExists = await User.findOne({ email });
        if (userExists !== null) return { error: "User already exists" };

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({ email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return { message: "User registered successfully", token };

    } catch (error) {
        return { error: "Registration failed", details: error.message };
    }
};

// Login as a user
const loginUser = async (email, password) => {
    try {
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return { error: "Invalid Credentials" };
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return { message: "Login successful", token };

    } catch (error) {
        return { error: "Login failed", details: error.message };
    }
};

// Verify the JWT token
const verifyToken = (token) => {
    try {
        if (!token) return { error: "Unauthorized - No token provided" };

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return { user: decoded };
    } catch (error) {
        return { error: error.name === "TokenExpiredError" ? "Token expired, please log in again" : "Invalid token" };
    }
};

// Retrieve User Profile
const getUserProfile = async (token) => {
    try {
        const verified = verifyToken(token);
        if (verified.error) return verified;

        const user = await User.findById(verified.user.id).select("-password");
        return { user };
    } catch (error) {
        return { error: "Profile retrieval failed" };
    }
};
