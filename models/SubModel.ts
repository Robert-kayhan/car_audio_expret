import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubModel extends Document {
  modelId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubModelSchema = new Schema<ISubModel>(
  {
    modelId: {
      type: Schema.Types.ObjectId,
      ref: "CarModel",
      required: [true, "Model id is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Submodel name is required"],
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

SubModelSchema.index({ modelId: 1, name: 1 }, { unique: true });
SubModelSchema.index({ modelId: 1, slug: 1 }, { unique: true });

const SubModel: Model<ISubModel> =
  mongoose.models.SubModel ||
  mongoose.model<ISubModel>("SubModel", SubModelSchema);

export default SubModel;