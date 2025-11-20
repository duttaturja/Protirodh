// models/Comment.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IComment extends Document {
  content: string;
  proofImage: string; // Mandatory proof
  author: mongoose.Types.ObjectId;
  reportId: mongoose.Types.ObjectId;
  isVerifiedHelper: boolean;
  createdAt: Date;
  isAnonymous: boolean;
}

const CommentSchema = new Schema<IComment>(
  {
    content: { type: String, required: true },
    proofImage: { type: String, required: true }, // Enforced requirement
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reportId: { type: Schema.Types.ObjectId, ref: "CrimeReport", required: true },
    isVerifiedHelper: { type: Boolean, default: false },
    isAnonymous: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;