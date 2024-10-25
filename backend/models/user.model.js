import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: "" },
    bio: { type: String, default: "" },
    gender: { type: String, enum: ["male", "female"] },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    isMFAEnabled: { type: Boolean, default: true },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    emailVerified: { type: Boolean, default: false },
    otpVerified: { type: Boolean, default: false },
    lastLoginIP: { type: String },
    lastLoginLocation: {
      latitude: String,
      longitude: String,
      place: String,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
