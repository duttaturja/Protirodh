import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICrimeReport extends Document {
  title: string;
  description: string;
  division: string;
  district: string;
  images: string[]; // URLs
  video?: string;   // URL
  author: mongoose.Types.ObjectId; // User ID or null if anonymous
  isAnonymous: boolean;
  crimeTime: Date;
  verificationScore: number;
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  aiConfidenceScore?: number; // For fake report detection
  isVerifiedBadge: boolean; // Hackathon feature
  createdAt: Date;
  updatedAt: Date;
}

const CrimeReportSchema = new Schema<ICrimeReport>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    division: { type: String, required: true },
    district: { type: String, required: true },
    images: [{ type: String, required: true }],
    video: { type: String },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    isAnonymous: { type: Boolean, default: false },
    crimeTime: { type: Date, required: true },
    verificationScore: { type: Number, default: 0 },
    upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    downvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    aiConfidenceScore: { type: Number },
    isVerifiedBadge: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexing for search and filtering
CrimeReportSchema.index({ division: 1, district: 1 });
CrimeReportSchema.index({ verificationScore: -1 });
CrimeReportSchema.index({ title: "text", description: "text" });

const CrimeReport: Model<ICrimeReport> =
  mongoose.models.CrimeReport || mongoose.model<ICrimeReport>("CrimeReport", CrimeReportSchema);

export default CrimeReport;