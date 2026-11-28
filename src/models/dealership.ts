import mongoose, { Schema, Model } from "mongoose";
import { DealershipStatus } from "@/types/dealership";

export interface DealershipDocument extends mongoose.Document {
  dealershipId: string;
  name: string;
  legalName?: string;
  code: string;
  businessId: string;
  erpDealershipCode?: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  region: string;
  status: DealershipStatus;
  metadata?: Record<string, any>;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DealershipSchema = new Schema<DealershipDocument>(
  {
    dealershipId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    legalName: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    businessId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    erpDealershipCode: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 100,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    district: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    region: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
      index: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE",
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    createdBy: {
      type: String,
    },
    updatedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for multi-tenant querying & performance
DealershipSchema.index({ businessId: 1, status: 1 });
DealershipSchema.index({ businessId: 1, name: "text", code: "text" });

export const Dealership: Model<DealershipDocument> =
  mongoose.models.Dealership ||
  mongoose.model<DealershipDocument>("Dealership", DealershipSchema);
