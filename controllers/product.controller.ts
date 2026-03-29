import mongoose, { Types } from "mongoose";
import { connectDB } from "@/lib/dbConnect";
import { toSlug } from "@/lib/slugify";
import Product from "@/models/Product";
import Department from "@/models/Department";
import CarCompany from "@/models/CarCompany";
import CarModel from "@/models/CarModel";
import SubModel from "@/models/SubModel";
import { errorResponse, successResponse } from "@/lib/api-response";

function parseBoolean(value: string | null, defaultValue?: boolean) {
  if (value === null || value === undefined) return defaultValue;
  return value === "true";
}

function isValidObjectId(value: string) {
  return Types.ObjectId.isValid(value);
}

export async function createProductController(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const departmentId = body?.departmentId?.trim?.() || body?.departmentId;
    const companyId = body?.companyId?.trim?.() || body?.companyId;
    const modelId = body?.modelId?.trim?.() || body?.modelId;
    const subModelId = body?.subModelId?.trim?.() || body?.subModelId || null;

    const year = Number(body?.year);
    const name = body?.name?.trim();
    const sku = body?.sku?.trim()?.toUpperCase();
    const price = Number(body?.price);
    const salePrice = Number(body?.salePrice || 0);
    const stock = Number(body?.stock || 0);
    const images = Array.isArray(body?.images)
      ? body.images.filter((item: unknown) => typeof item === "string" && item.trim())
      : [];
    const shortDescription = body?.shortDescription?.trim() || "";
    const description = body?.description?.trim() || "";
    const isActive =
      typeof body?.isActive === "boolean" ? body.isActive : true;

    if (!departmentId || !isValidObjectId(departmentId)) {
      return errorResponse("Valid department id is required", 400);
    }

    if (!companyId || !isValidObjectId(companyId)) {
      return errorResponse("Valid company id is required", 400);
    }

    if (!modelId || !isValidObjectId(modelId)) {
      return errorResponse("Valid model id is required", 400);
    }

    if (subModelId && !isValidObjectId(subModelId)) {
      return errorResponse("Invalid submodel id", 400);
    }

    if (!name) {
      return errorResponse("Product name is required", 400);
    }

    if (!sku) {
      return errorResponse("SKU is required", 400);
    }

    if (!year || Number.isNaN(year)) {
      return errorResponse("Valid year is required", 400);
    }

    if (Number.isNaN(price)) {
      return errorResponse("Valid price is required", 400);
    }

    if (Number.isNaN(salePrice)) {
      return errorResponse("Valid salePrice is required", 400);
    }

    if (Number.isNaN(stock)) {
      return errorResponse("Valid stock is required", 400);
    }

    const [department, company, model] = await Promise.all([
      Department.findById(departmentId),
      CarCompany.findById(companyId),
      CarModel.findById(modelId),
    ]);

    if (!department) {
      return errorResponse("Department not found", 404);
    }

    if (!company) {
      return errorResponse("Car company not found", 404);
    }

    if (!model) {
      return errorResponse("Car model not found", 404);
    }

    if (model.companyId.toString() !== companyId) {
      return errorResponse("Selected model does not belong to selected company", 400);
    }

    if (subModelId) {
      const subModel = await SubModel.findById(subModelId);
      if (!subModel) {
        return errorResponse("Submodel not found", 404);
      }

      if (subModel.modelId.toString() !== modelId) {
        return errorResponse("Selected submodel does not belong to selected model", 400);
      }
    }

    const slug = toSlug(name);

    const duplicateSlug = await Product.findOne({ slug });
    if (duplicateSlug) {
      return errorResponse("Product slug already exists, change product name", 409);
    }

    const duplicateSku = await Product.findOne({ sku });
    if (duplicateSku) {
      return errorResponse("Product SKU already exists", 409);
    }

    const product = await Product.create({
      departmentId,
      companyId,
      modelId,
      subModelId,
      year,
      name,
      slug,
      sku,
      price,
      salePrice,
      stock,
      images,
      shortDescription,
      description,
      isActive,
    });

    const populatedProduct = await Product.findById(product._id)
      .populate("departmentId", "name slug")
      .populate("companyId", "name slug")
      .populate("modelId", "name slug")
      .populate("subModelId", "name slug");

    return successResponse(populatedProduct, "Product created successfully", 201);
  } catch (error: any) {
    if (error instanceof mongoose.Error.ValidationError) {
      return errorResponse(error.message, 400);
    }
    return errorResponse(error?.message || "Failed to create product", 500);
  }
}

export async function getProductsController(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const search = searchParams.get("search") || "";
    const departmentId = searchParams.get("departmentId") || "";
    const companyId = searchParams.get("companyId") || "";
    const modelId = searchParams.get("modelId") || "";
    const subModelId = searchParams.get("subModelId") || "";
    const year = searchParams.get("year") || "";
    const isActive = parseBoolean(searchParams.get("isActive"));
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;
    const query: Record<string, any> = {};

    if (departmentId) {
      if (!isValidObjectId(departmentId)) {
        return errorResponse("Invalid department id", 400);
      }
      query.departmentId = departmentId;
    }

    if (companyId) {
      if (!isValidObjectId(companyId)) {
        return errorResponse("Invalid company id", 400);
      }
      query.companyId = companyId;
    }

    if (modelId) {
      if (!isValidObjectId(modelId)) {
        return errorResponse("Invalid model id", 400);
      }
      query.modelId = modelId;
    }

    if (subModelId) {
      if (!isValidObjectId(subModelId)) {
        return errorResponse("Invalid submodel id", 400);
      }
      query.subModelId = subModelId;
    }

    if (year) {
      query.year = Number(year);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (typeof isActive === "boolean") {
      query.isActive = isActive;
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("departmentId", "name slug")
        .populate("companyId", "name slug")
        .populate("modelId", "name slug")
        .populate("subModelId", "name slug")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query),
    ]);

    return successResponse(
      {
        result: products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Products fetched successfully"
    );
  } catch (error: any) {
    return errorResponse(error?.message || "Failed to fetch products", 500);
  }
}

export async function getProductByIdController(_req: Request, id: string) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid product id", 400);
    }

    const product = await Product.findById(id)
      .populate("departmentId", "name slug")
      .populate("companyId", "name slug")
      .populate("modelId", "name slug")
      .populate("subModelId", "name slug");

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    return successResponse(product, "Product fetched successfully");
  } catch (error: any) {
    return errorResponse(error?.message || "Failed to fetch product", 500);
  }
}

export async function updateProductController(req: Request, id: string) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid product id", 400);
    }

    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
      return errorResponse("Product not found", 404);
    }

    const body = await req.json();
    const updateData: Record<string, any> = {};

    const nextDepartmentId =
      body?.departmentId?.trim?.() || body?.departmentId || existingProduct.departmentId.toString();
    const nextCompanyId =
      body?.companyId?.trim?.() || body?.companyId || existingProduct.companyId.toString();
    const nextModelId =
      body?.modelId?.trim?.() || body?.modelId || existingProduct.modelId.toString();
    const nextSubModelId =
      body?.subModelId !== undefined
        ? body?.subModelId?.trim?.() || body?.subModelId || null
        : existingProduct.subModelId
          ? existingProduct.subModelId.toString()
          : null;

    if (!isValidObjectId(nextDepartmentId)) {
      return errorResponse("Valid department id is required", 400);
    }

    if (!isValidObjectId(nextCompanyId)) {
      return errorResponse("Valid company id is required", 400);
    }

    if (!isValidObjectId(nextModelId)) {
      return errorResponse("Valid model id is required", 400);
    }

    if (nextSubModelId && !isValidObjectId(nextSubModelId)) {
      return errorResponse("Invalid submodel id", 400);
    }

    const [department, company, model] = await Promise.all([
      Department.findById(nextDepartmentId),
      CarCompany.findById(nextCompanyId),
      CarModel.findById(nextModelId),
    ]);

    if (!department) {
      return errorResponse("Department not found", 404);
    }

    if (!company) {
      return errorResponse("Car company not found", 404);
    }

    if (!model) {
      return errorResponse("Car model not found", 404);
    }

    if (model.companyId.toString() !== nextCompanyId) {
      return errorResponse("Selected model does not belong to selected company", 400);
    }

    if (nextSubModelId) {
      const subModel = await SubModel.findById(nextSubModelId);
      if (!subModel) {
        return errorResponse("Submodel not found", 404);
      }

      if (subModel.modelId.toString() !== nextModelId) {
        return errorResponse("Selected submodel does not belong to selected model", 400);
      }
    }

    updateData.departmentId = nextDepartmentId;
    updateData.companyId = nextCompanyId;
    updateData.modelId = nextModelId;
    updateData.subModelId = nextSubModelId;

    if (body?.year !== undefined) {
      const year = Number(body.year);
      if (Number.isNaN(year)) {
        return errorResponse("Valid year is required", 400);
      }
      updateData.year = year;
    }

    if (typeof body?.name === "string" && body.name.trim()) {
      const nextName = body.name.trim();
      const nextSlug = toSlug(nextName);

      const duplicateSlug = await Product.findOne({
        _id: { $ne: id },
        slug: nextSlug,
      });

      if (duplicateSlug) {
        return errorResponse("Another product with this slug already exists", 409);
      }

      updateData.name = nextName;
      updateData.slug = nextSlug;
    }

    if (typeof body?.sku === "string" && body.sku.trim()) {
      const nextSku = body.sku.trim().toUpperCase();

      const duplicateSku = await Product.findOne({
        _id: { $ne: id },
        sku: nextSku,
      });

      if (duplicateSku) {
        return errorResponse("Another product with this SKU already exists", 409);
      }

      updateData.sku = nextSku;
    }

    if (body?.price !== undefined) {
      const price = Number(body.price);
      if (Number.isNaN(price)) {
        return errorResponse("Valid price is required", 400);
      }
      updateData.price = price;
    }

    if (body?.salePrice !== undefined) {
      const salePrice = Number(body.salePrice);
      if (Number.isNaN(salePrice)) {
        return errorResponse("Valid salePrice is required", 400);
      }
      updateData.salePrice = salePrice;
    }

    if (body?.stock !== undefined) {
      const stock = Number(body.stock);
      if (Number.isNaN(stock)) {
        return errorResponse("Valid stock is required", 400);
      }
      updateData.stock = stock;
    }

    if (Array.isArray(body?.images)) {
      updateData.images = body.images.filter(
        (item: unknown) => typeof item === "string" && item.trim()
      );
    }

    if (typeof body?.shortDescription === "string") {
      updateData.shortDescription = body.shortDescription.trim();
    }

    if (typeof body?.description === "string") {
      updateData.description = body.description.trim();
    }

    if (typeof body?.isActive === "boolean") {
      updateData.isActive = body.isActive;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("departmentId", "name slug")
      .populate("companyId", "name slug")
      .populate("modelId", "name slug")
      .populate("subModelId", "name slug");

    return successResponse(updatedProduct, "Product updated successfully");
  } catch (error: any) {
    if (error instanceof mongoose.Error.ValidationError) {
      return errorResponse(error.message, 400);
    }
    return errorResponse(error?.message || "Failed to update product", 500);
  }
}

export async function deleteProductController(_req: Request, id: string) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid product id", 400);
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return errorResponse("Product not found", 404);
    }

    return successResponse(deletedProduct, "Product deleted successfully");
  } catch (error: any) {
    return errorResponse(error?.message || "Failed to delete product", 500);
  }
}