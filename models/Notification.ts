// models/Notification.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId; // Triggered by whom
  type: "upvote" | "comment" | "admin_alert" | "verification";
  reportId?: mongoose.Types.ObjectId;
  message: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: ["upvote", "comment", "admin_alert", "verification"],
      required: true,
    },
    reportId: { type: Schema.Types.ObjectId, ref: "CrimeReport" },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;