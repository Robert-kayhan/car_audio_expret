"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useGetDepartmentsQuery } from "@/store/api/departmentAPi";
import { useGetCarCompaniesQuery } from "@/store/api/carCompaniesAPi";
import { useGetCarModelsQuery } from "@/store/api/carModelAPi";
import { useGetSubModelsQuery } from "@/store/api/subModelsApi";
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
} from "@/store/api/productsApi";

type DepartmentType = {
  _id: string;
  name: string;
  slug: string;
};

type CompanyType = {
  _id: string;
  name: string;
  slug: string;
};

type ModelCompanyType = {
  _id: string;
  name: string;
  slug: string;
};

type ModelType = {
  _id: string;
  name: string;
  slug: string;
  companyId: ModelCompanyType | string;
};

type SubModelType = {
  _id: string;
  name: string;
  slug: string;
  modelId:
    | {
        _id: string;
        name: string;
        slug: string;
        companyId?: {
          _id: string;
          name: string;
          slug: string;
        };
      }
    | string;
};

type ProductItemType = {
  _id: string;
  departmentId?: { _id: string; name: string; slug: string };
  companyId?: { _id: string; name: string; slug: string };
  modelId?: { _id: string; name: string; slug: string };
  subModelId?: { _id: string; name: string; slug: string } | null;
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
  createdAt: string;
  updatedAt: string;
};

type FormDataType = {
  departmentId: string;
  companyId: string;
  modelId: string;
  subModelId: string;
  year: string;
  name: string;
  sku: string;
  price: string;
  salePrice: string;
  stock: string;
  images: string[];
  shortDescription: string;
  description: string;
  isActive: boolean;
};

const initialFormData: FormDataType = {
  departmentId: "",
  companyId: "",
  modelId: "",
  subModelId: "",
  year: "",
  name: "",
  sku: "",
  price: "",
  salePrice: "0",
  stock: "0",
  images: [],
  shortDescription: "",
  description: "",
  isActive: true,
};

const ProductsPage = () => {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [subModelFilter, setSubModelFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItemType | null>(null);
  const [formData, setFormData] = useState<FormDataType>(initialFormData);
  const [formError, setFormError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const {
    data: productsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetProductsQuery({
    page,
    limit,
    search,
    departmentId: departmentFilter || undefined,
    companyId: companyFilter || undefined,
    modelId: modelFilter || undefined,
    subModelId: subModelFilter || undefined,
    year: yearFilter || undefined,
  });

  const { data: departmentsData } = useGetDepartmentsQuery({
    page: 1,
    limit: 1000,
    search: "",
  });

  const { data: companiesData } = useGetCarCompaniesQuery({
    page: 1,
    limit: 1000,
    search: "",
  });

  const { data: modelsData } = useGetCarModelsQuery({
    page: 1,
    limit: 1000,
    search: "",
    companyId: companyFilter || undefined,
  });

  const { data: subModelsData } = useGetSubModelsQuery({
    page: 1,
    limit: 1000,
    search: "",
    modelId: modelFilter || undefined,
  });

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const products = productsData?.data?.result || [];
  const pagination = productsData?.data?.pagination;
  const departments = departmentsData?.data?.result || [];
  const companies = companiesData?.data?.result || [];
  const allModels = modelsData?.data?.result || [];
  const allSubModels = subModelsData?.data?.result || [];
  const totalPages = pagination?.totalPages || 1;

  const modalTitle = useMemo(() => {
    return isEditModalOpen ? "Update Product" : "Create Product";
  }, [isEditModalOpen]);

  const filteredModelsForForm = useMemo(() => {
    if (!formData.companyId) return allModels;

    return allModels.filter((item: ModelType) => {
      const companyId =
        typeof item.companyId === "object" ? item.companyId?._id : item.companyId;
      return companyId === formData.companyId;
    });
  }, [allModels, formData.companyId]);

  const filteredSubModelsForForm = useMemo(() => {
    if (!formData.modelId) return allSubModels;

    return allSubModels.filter((item: SubModelType) => {
      const modelId =
        typeof item.modelId === "object" ? item.modelId?._id : item.modelId;
      return modelId === formData.modelId;
    });
  }, [allSubModels, formData.modelId]);

  useEffect(() => {
    if (!companyFilter) return;
    if (!modelFilter) return;

    const exists = allModels.some((item: ModelType) => item._id === modelFilter);
    if (!exists) {
      setModelFilter("");
      setSubModelFilter("");
      setPage(1);
    }
  }, [companyFilter, modelFilter, allModels]);

  useEffect(() => {
    if (!modelFilter) return;
    if (!subModelFilter) return;

    const exists = allSubModels.some((item: SubModelType) => item._id === subModelFilter);
    if (!exists) {
      setSubModelFilter("");
      setPage(1);
    }
  }, [modelFilter, subModelFilter, allSubModels]);

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedProduct(null);
    setFormError("");
  };

  const closeAllModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    resetForm();
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openEditModal = (product: ProductItemType) => {
    setSelectedProduct(product);

    setFormData({
      departmentId: product.departmentId?._id || "",
      companyId: product.companyId?._id || "",
      modelId: product.modelId?._id || "",
      subModelId: product.subModelId?._id || "",
      year: product.year ? String(product.year) : "",
      name: product.name || "",
      sku: product.sku || "",
      price: product.price !== undefined ? String(product.price) : "",
      salePrice: product.salePrice !== undefined ? String(product.salePrice) : "0",
      stock: product.stock !== undefined ? String(product.stock) : "0",
      images: Array.isArray(product.images) ? product.images : [],
      shortDescription: product.shortDescription || "",
      description: product.description || "",
      isActive: product.isActive,
    });

    setFormError("");
    setIsEditModalOpen(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "companyId") {
      setFormData((prev) => ({
        ...prev,
        companyId: value,
        modelId: "",
        subModelId: "",
      }));
      return;
    }

    if (name === "modelId") {
      setFormData((prev) => ({
        ...prev,
        modelId: value,
        subModelId: "",
      }));
      return;
    }

    if (name === "isActive") {
      setFormData((prev) => ({
        ...prev,
        isActive: value === "true",
      }));
      return;
    }

    if (name === "sku") {
      setFormData((prev) => ({
        ...prev,
        sku: value.toUpperCase(),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const uploadSingleImage = async (file: File) => {
    const signedRes = await fetch("/api/upload/product-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
      }),
    });

    const signedData = await signedRes.json();

    if (!signedRes.ok || !signedData?.success) {
      throw new Error(signedData?.message || "Failed to get upload URL");
    }

    const { uploadUrl, fileUrl } = signedData.data;

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error("Failed to upload image to S3");
    }

    return fileUrl;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setFormError("");
    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const url = await uploadSingleImage(file);
        uploadedUrls.push(url);
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
    } catch (error: any) {
      setFormError(error?.message || "Image upload failed");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    if (!formData.departmentId) return "Please select department";
    if (!formData.companyId) return "Please select company";
    if (!formData.modelId) return "Please select model";
    if (!formData.year.trim()) return "Year is required";
    if (!formData.name.trim()) return "Product name is required";
    if (!formData.sku.trim()) return "SKU is required";
    if (!formData.price.trim()) return "Price is required";
    if (!formData.stock.trim()) return "Stock is required";
    return "";
  };

  const buildPayload = () => ({
    departmentId: formData.departmentId,
    companyId: formData.companyId,
    modelId: formData.modelId,
    subModelId: formData.subModelId || null,
    year: Number(formData.year),
    name: formData.name.trim(),
    sku: formData.sku.trim().toUpperCase(),
    price: Number(formData.price),
    salePrice: Number(formData.salePrice || 0),
    stock: Number(formData.stock || 0),
    images: formData.images,
    shortDescription: formData.shortDescription.trim(),
    description: formData.description.trim(),
    isActive: formData.isActive,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      await createProduct(buildPayload()).unwrap();
      closeAllModals();
      refetch();
    } catch (error: any) {
      setFormError(
        error?.data?.message || error?.message || "Failed to create product"
      );
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!selectedProduct?._id) {
      setFormError("Product id is missing");
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      await updateProduct({
        id: selectedProduct._id,
        ...buildPayload(),
      }).unwrap();

      closeAllModals();
      refetch();
    } catch (error: any) {
      setFormError(
        error?.data?.message || error?.message || "Failed to update product"
      );
    }
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm("Are you sure you want to delete this product?");
    if (!ok) return;

    try {
      await deleteProduct(id).unwrap();
      refetch();
    } catch (error) {
      console.error(error);
      alert("Failed to delete product");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 text-gray-900 dark:bg-[#0b1120] dark:text-white md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Products</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Manage products with image upload, filters, create, update and delete actions.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90 dark:bg-white dark:text-black"
          >
            + Create Product
          </button>
        </div>

        <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#111827]">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
            <input
              type="text"
              placeholder="Search name, sku, slug..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black dark:border-gray-700 dark:bg-[#0f172a] dark:text-white dark:focus:border-white"
            />

            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black dark:border-gray-700 dark:bg-[#0f172a] dark:text-white dark:focus:border-white"
            >
              <option value="">All Departments</option>
              {departments.map((department: DepartmentType) => (
                <option key={department._id} value={department._id}>
                  {department.name}
                </option>
              ))}
            </select>

            <select
              value={companyFilter}
              onChange={(e) => {
                setCompanyFilter(e.target.value);
                setModelFilter("");
                setSubModelFilter("");
                setPage(1);
              }}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black dark:border-gray-700 dark:bg-[#0f172a] dark:text-white dark:focus:border-white"
            >
              <option value="">All Companies</option>
              {companies.map((company: CompanyType) => (
                <option key={company._id} value={company._id}>
                  {company.name}
                </option>
              ))}
            </select>

            <select
              value={modelFilter}
              onChange={(e) => {
                setModelFilter(e.target.value);
                setSubModelFilter("");
                setPage(1);
              }}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black dark:border-gray-700 dark:bg-[#0f172a] dark:text-white dark:focus:border-white"
            >
              <option value="">All Models</option>
              {allModels.map((model: ModelType) => (
                <option key={model._id} value={model._id}>
                  {model.name}
                </option>
              ))}
            </select>

            <select
              value={subModelFilter}
              onChange={(e) => {
                setSubModelFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black dark:border-gray-700 dark:bg-[#0f172a] dark:text-white dark:focus:border-white"
            >
              <option value="">All Sub Models</option>
              {allSubModels.map((subModel: SubModelType) => (
                <option key={subModel._id} value={subModel._id}>
                  {subModel.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Year"
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black dark:border-gray-700 dark:bg-[#0f172a] dark:text-white dark:focus:border-white"
            />
          </div>

          <div className="mt-3 flex justify-end">
            <button
              onClick={() => refetch()}
              className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-[#111827]">
          <div className="overflow-x-auto">
            <table className="min-w-[1500px] w-full">
              <thead className="bg-gray-100 dark:bg-[#1f2937]">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Image</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Name</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">SKU</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Department</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Company</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Model</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Sub Model</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Year</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Price</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Sale Price</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Stock</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {isLoading || isFetching ? (
                  <tr>
                    <td
                      colSpan={13}
                      className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      Loading products...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={13}
                      className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map((product: ProductItemType) => (
                    <tr
                      key={product._id}
                      className="border-t border-gray-200 dark:border-gray-800"
                    >
                      <td className="px-4 py-4">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-14 w-14 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-200 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            N/A
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-semibold">{product.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {product.slug}
                        </div>
                      </td>

                      <td className="px-4 py-4 font-medium">{product.sku}</td>
                      <td className="px-4 py-4">{product.departmentId?.name || "-"}</td>
                      <td className="px-4 py-4">{product.companyId?.name || "-"}</td>
                      <td className="px-4 py-4">{product.modelId?.name || "-"}</td>
                      <td className="px-4 py-4">{product.subModelId?.name || "-"}</td>
                      <td className="px-4 py-4">{product.year}</td>
                      <td className="px-4 py-4">${product.price}</td>
                      <td className="px-4 py-4">${product.salePrice}</td>
                      <td className="px-4 py-4">{product.stock}</td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            product.isActive
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(product._id)}
                            disabled={isDeleting}
                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-4 md:flex-row md:items-center md:justify-between dark:border-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Page {pagination?.page || 1} of {totalPages}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Previous
              </button>

              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages || totalPages === 0}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4">
          <div className="mx-auto my-8 w-full max-w-5xl rounded-2xl bg-white shadow-2xl dark:bg-[#111827]">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
              <h2 className="text-xl font-bold">{modalTitle}</h2>
              <button
                onClick={closeAllModals}
                className="rounded-lg px-3 py-1 text-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={isEditModalOpen ? handleUpdate : handleCreate}
              className="p-6"
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium">Department</label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black dark:border-gray-700 dark:bg-[#0f172a] dark:text-white dark:focus:border-white"
                  >
                    <option value="">Select Department</option>
                    {departments.map((department: DepartmentType) => (
                      <option key={department._id} value={department._id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Company</label>
                  <select
                    name="companyId"
                    value={formData.companyId}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black dark:border-gray-700 dark:bg-[#0f172a] dark:text-white dark:focus:border-white"
                  >
                    <option value="">Select Company</option>
                    {companies.map((company: CompanyType) => (
                      <option key={company._id} value={company._id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Model</label>
                  <select
                    name="modelId"
                    value={formData.modelId}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black dark:border-gray-700 dark:bg-[#0f172a] dark:text-white dark:focus:border-white"
                  >
                    <option value="">Select Model</option>
                    {filteredModelsForForm.map((model: ModelType) => (
                      <option key={model._id} value={model._id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Sub Model</label>
                  <select
                    name="subModelId"
                    value={formData.subModelId}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black dark:border-gray-700 dark:bg-[#0f172a] dark:text-white dark:focus:border-white"
                  >
                    <option value="">Select Sub Model (Optional)</option>
                    {filteredSubModelsForForm.map((subModel: SubModelType) => (
                      <option key={subModel._id} value={subModel._id}>
                        {subModel.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Year</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    placeholder="Enter year"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black dark:border-gray-700 dark:bg-[#0f172a] dark:text-white dark:focus:border-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">SKU</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="Enter SKU"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 uppercase outline-none focus:border-black dark:border-gray-700 dark:bg-[#0f172a] dark:text-white dark:focus:border-white"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="mb-2 block text-sm font-medium">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black dark:border-gray-700 dark:bg-[#0f172a] dark:text-white dark:focus:border-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Price</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Enter price"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black dark:border-gray-700 dark:bg-[#0f172a] dark:text-white dark:focus:border-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Sale Price</label>
                  <input
                    type="number"
                    name="salePrice"
                    value={formData.salePrice}
                    onChange={handleChange}
                    placeholder="Enter sale price"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black dark:border-gray-700 dark:bg-[#0f172a] dark:text-white dark:focus:border-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="Enter stock"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black dark:border-gray-700 dark:bg-[#0f172a] dark:text-white dark:focus:border-white"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="mb-2 block text-sm font-medium">
                    Product Images
                  </label>

                  <div className="rounded-2xl border border-dashed border-gray-300 p-4 dark:border-gray-700">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      multiple
                      onChange={handleImageUpload}
                      className="block w-full text-sm"
                    />

                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Allowed: jpg, jpeg, png, webp
                    </p>

                    {isUploading && (
                      <p className="mt-3 text-sm font-medium text-blue-600 dark:text-blue-400">
                        Uploading images...
                      </p>
                    )}

                    {formData.images.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-5">
                        {formData.images.map((image, index) => (
                          <div
                            key={`${image}-${index}`}
                            className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700"
                          >
                            <img
                              src={image}
                              alt={`Product ${index + 1}`}
                              className="h-28 w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-1 text-xs font-semibold text-white"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-3">
                  <label className="mb-2 block text-sm font-medium">
                    Short Description
                  </label>
                  <textarea
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    placeholder="Enter short description"
                    rows={3}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black dark:border-gray-700 dark:bg-[#0f172a] dark:text-white dark:focus:border-white"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="mb-2 block text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter full description"
                    rows={6}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black dark:border-gray-700 dark:bg-[#0f172a] dark:text-white dark:focus:border-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Status</label>
                  <select
                    name="isActive"
                    value={String(formData.isActive)}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black dark:border-gray-700 dark:bg-[#0f172a] dark:text-white dark:focus:border-white"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              {formError && (
                <div className="mt-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  {formError}
                </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeAllModals}
                  className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isCreating || isUpdating || isUploading}
                  className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
                >
                  {isCreating || isUpdating || isUploading
                    ? "Please wait..."
                    : isEditModalOpen
                    ? "Update Product"
                    : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;