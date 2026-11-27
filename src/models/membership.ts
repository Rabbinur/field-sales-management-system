import mongoose, { Schema, Model } from "mongoose";
import { IMembership, UserRole, MembershipStatus } from "@/types/auth";

export interface MembershipDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  role: UserRole;
  businessId?: string;
  dealershipId?: string;
  allowedDealershipIds?: string[];
  permissions: string[];
  status: MembershipStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipSchema = new Schema<MembershipDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: [
        "SOFTWARE_SUPER_ADMIN",
        "MOTHER_COMPANY_ADMIN",
        "DEALERSHIP_ADMIN",
        "SALES_REPRESENTATIVE",
      ],
      required: true,
      index: true,
    },
    businessId: {
      type: String,
      trim: true,
      index: true,
    },
    dealershipId: {
      type: String,
      trim: true,
      index: true,
    },
    allowedDealershipIds: {
      type: [String],
      default: [],
    },
    permissions: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for authorization lookups
MembershipSchema.index({ userId: 1, status: 1, isActive: 1 });
MembershipSchema.index({ dealershipId: 1, role: 1 });

export const Membership: Model<MembershipDocument> =
  mongoose.models.Membership ||
  mongoose.model<MembershipDocument>("Membership", MembershipSchema);
