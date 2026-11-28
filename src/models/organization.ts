import mongoose, { Schema, Model } from "mongoose";

export interface OrganizationDocument extends mongoose.Document {
  organizationId: string;
  name: string;
  code: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<OrganizationDocument>(
  {
    organizationId: {
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
      maxlength: 150,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      index: true,
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

export const Organization: Model<OrganizationDocument> =
  mongoose.models.Organization ||
  mongoose.model<OrganizationDocument>("Organization", OrganizationSchema);
