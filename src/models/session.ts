import mongoose, { Schema, Model } from "mongoose";

export interface SessionDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  isRevoked: boolean;
  revokedAt?: Date;
  createdAt: Date;
  lastActivityAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

const SessionSchema = new Schema<SessionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    revokedAt: {
      type: Date,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    userAgent: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        delete ret.tokenHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// TTL index to automatically purge expired sessions from MongoDB
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
SessionSchema.index({ userId: 1, isRevoked: 1 });

export const Session: Model<SessionDocument> =
  mongoose.models.Session ||
  mongoose.model<SessionDocument>("Session", SessionSchema);
