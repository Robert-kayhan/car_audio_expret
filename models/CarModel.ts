import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICarModel extends Document {
  companyId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CarModelSchema = new Schema<ICarModel>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "CarCompany",
      required: [true, "Company id is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Model name is required"],
      trim: true,
      minlength: [1, "Name must be at least 1 character"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    image: {
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

// same company cannot have same model name twice
CarModelSchema.index({ companyId: 1, name: 1 }, { unique: true });
CarModelSchema.index({ companyId: 1, slug: 1 }, { unique: true });

const CarModel: Model<ICarModel> =
  mongoose.models.CarModel ||
  mongoose.model<ICarModel>("CarModel", CarModelSchema);

export default CarModel;