import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  image?: string;
  role: "unverified" | "verified" | "admin";
  isBanned: boolean;
  bio?: string;
  otp?: string;
  otpExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false },
    phone: { type: String },
    image: { type: String },
    role: {
      type: String,
      enum: ["unverified", "verified", "admin"],
      default: "unverified",
    },
    isBanned: { type: Boolean, default: false },
    bio: { type: String },
    otp: { type: String, select: false }, // Hidden by default
    otpExpiry: { type: Date, select: false },
  },
  { timestamps: true }
);

// Check if model exists to prevent recompilation errors
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;