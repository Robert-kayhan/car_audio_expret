import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICarCompany extends Document {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CarCompanySchema = new Schema<ICarCompany>(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      unique: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    logo: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

CarCompanySchema.index({ name: "text", description: "text" });

const CarCompany: Model<ICarCompany> =
  mongoose.models.CarCompany ||
  mongoose.model<ICarCompany>("CarCompany", CarCompanySchema);

export default CarCompany;