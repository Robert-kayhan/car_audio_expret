import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  departmentId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  modelId: mongoose.Types.ObjectId;
  subModelId?: mongoose.Types.ObjectId | null;
  year: number;
  name: string;
  slug: string;
  sku: string;
  price: number;
  salePrice: number;
  stock: number;
  images: string[];
  shortDescription?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department id is required"],
      index: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "CarCompany",
      required: [true, "Company id is required"],
      index: true,
    },
    modelId: {
      type: Schema.Types.ObjectId,
      ref: "CarModel",
      required: [true, "Model id is required"],
      index: true,
    },
    subModelId: {
      type: Schema.Types.ObjectId,
      ref: "SubModel",
      default: null,
      index: true,
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [1950, "Year must be valid"],
      max: [2100, "Year must be valid"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      trim: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    salePrice: {
      type: Number,
      default: 0,
      min: [0, "Sale price cannot be negative"],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    images: {
      type: [String],
      default: [],
    },
    shortDescription: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Short description cannot exceed 500 characters"],
    },
    description: {
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

ProductSchema.index({
  departmentId: 1,
  companyId: 1,
  modelId: 1,
  subModelId: 1,
  year: 1,
  isActive: 1,
});

const Product: Model<IProduct> =
  mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);

export default Product;