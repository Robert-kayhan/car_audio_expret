"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useGetCarCompaniesQuery } from "@/store/api/carCompaniesAPi";
import { useGetCarModelsQuery } from "@/store/api/carModelAPi";
import {
  useCreateSubModelMutation,
  useDeleteSubModelMutation,
  useGetSubModelsQuery,
  useUpdateSubModelMutation,
} from "@/store/api/subModelsApi";

type CompanyType = {
  _id: string;
  name: string;
  slug: string;
};

type ModelType = {
  _id: string;
  name: string;
  slug: string;
  companyId:
    | {
        _id: string;
        name: string;
        slug: string;
      }
    | string;
};

type SubModelType = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  modelId: {
    _id: string;
    name: string;
    slug: string;
    companyId?: {
      _id: string;
      name: string;
      slug: string;
    };
  };
};

type FormDataType = {
  companyId: string;
  modelId: string;
  name: string;
  description: string;
  image: string;
  isActive: boolean;
};

const initialFormData: FormDataType = {
  companyId: "",
  modelId: "",
  name: "",
  description: "",
  image: "",
  isActive: true,
};

export default function SubModelsPageClient() {
  const searchParams = useSearchParams();

  const modelIdFromQuery = searchParams.get("modelId") || "";
  const modelNameFromQuery = searchParams.get("modelName") || "";

  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [modelFilter, setModelFilter] = useState(modelIdFromQuery);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSubModel, setSelectedSubModel] = useState<SubModelType | null>(null);
  const [formData, setFormData] = useState<FormDataType>(initialFormData);
  const [formError, setFormError] = useState("");

  const {
    data: subModelsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetSubModelsQuery({
    page,
    limit,
    search,
    modelId: modelFilter || undefined,
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

  const [createSubModel, { isLoading: isCreating }] =
    useCreateSubModelMutation();
  const [updateSubModel, { isLoading: isUpdating }] =
    useUpdateSubModelMutation();
  const [deleteSubModel, { isLoading: isDeleting }] =
    useDeleteSubModelMutation();

  const subModels = subModelsData?.data?.result || [];
  const pagination = subModelsData?.data?.pagination;
  const companies = companiesData?.data?.result || [];
  const allModels = modelsData?.data?.result || [];
  const totalPages = pagination?.totalPages || 1;

  const modalTitle = useMemo(() => {
    return isEditModalOpen ? "Update Sub Model" : "Create Sub Model";
  }, [isEditModalOpen]);

  const filteredModelsForForm = useMemo(() => {
    if (!formData.companyId) return allModels;

    return allModels.filter((item: ModelType) => {
      const companyId =
        typeof item.companyId === "object" ? item.companyId?._id : item.companyId;
      return companyId === formData.companyId;
    });
  }, [allModels, formData.companyId]);

  useEffect(() => {
    if (!companyFilter) return;
    if (!modelFilter) return;

    const exists = allModels.some((item: ModelType) => item._id === modelFilter);
    if (!exists) {
      setModelFilter("");
      setPage(1);
    }
  }, [companyFilter, modelFilter, allModels]);

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedSubModel(null);
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

  const openEditModal = (subModel: SubModelType) => {
    const selectedCompanyId = subModel.modelId?.companyId?._id || "";
    const selectedModelId = subModel.modelId?._id || "";

    setSelectedSubModel(subModel);
    setFormData({
      companyId: selectedCompanyId,
      modelId: selectedModelId,
      name: subModel.name || "",
      description: subModel.description || "",
      image: subModel.image || "",
      isActive: subModel.isActive,
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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.companyId) {
      setFormError("Please select company");
      return;
    }

    if (!formData.modelId) {
      setFormError("Please select model");
      return;
    }

    if (!formData.name.trim()) {
      setFormError("Sub model name is required");
      return;
    }

    try {
      await createSubModel({
        modelId: formData.modelId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: formData.image.trim(),
        isActive: formData.isActive,
      }).unwrap();

      closeAllModals();
      refetch();
    } catch (error: any) {
      setFormError(
        error?.data?.message || error?.message || "Failed to create sub model"
      );
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!selectedSubModel?._id) {
      setFormError("Sub model id is missing");
      return;
    }

    if (!formData.companyId) {
      setFormError("Please select company");
      return;
    }

    if (!formData.modelId) {
      setFormError("Please select model");
      return;
    }

    if (!formData.name.trim()) {
      setFormError("Sub model name is required");
      return;
    }

    try {
      await updateSubModel({
        id: selectedSubModel._id,
        modelId: formData.modelId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: formData.image.trim(),
        isActive: formData.isActive,
      }).unwrap();

      closeAllModals();
      refetch();
    } catch (error: any) {
      setFormError(
        error?.data?.message || error?.message || "Failed to update sub model"
      );
    }
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm("Are you sure you want to delete this sub model?");
    if (!ok) return;

    try {
      await deleteSubModel(id).unwrap();
      refetch();
    } catch (error) {
      console.error(error);
      alert("Failed to delete sub model");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 text-gray-900 dark:bg-[#0b1120] dark:text-white md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Sub Models</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {modelNameFromQuery
                ? `Showing sub models for ${modelNameFromQuery}`
                : "Manage sub models with create, update and delete actions."}
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90 dark:bg-white dark:text-black"
          >
            + Create Sub Model
          </button>
        </div>

        <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#111827]">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <input
              type="text"
              placeholder="Search by name, slug, description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black dark:border-gray-700 dark:bg-[#0f172a] dark:text-white dark:focus:border-white"
            />

            <select
              value={companyFilter}
              onChange={(e) => {
                setCompanyFilter(e.target.value);
                setModelFilter("");
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
            <table className="min-w-full">
              <thead className="bg-gray-100 dark:bg-[#1f2937]">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Company</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Model</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Sub Model</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Slug</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Description</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Created</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {isLoading || isFetching ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      Loading sub models...
                    </td>
                  </tr>
                ) : subModels.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      No sub models found.
                    </td>
                  </tr>
                ) : (
                  subModels.map((subModel: SubModelType) => (
                    <tr
                      key={subModel._id}
                      className="border-t border-gray-200 dark:border-gray-800"
                    >
                      <td className="px-4 py-4">
                        <div className="font-medium">
                          {subModel.modelId?.companyId?.name || "-"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {subModel.modelId?.companyId?.slug || ""}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-medium">{subModel.modelId?.name || "-"}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {subModel.modelId?.slug || ""}
                        </div>
                      </td>

                      <td className="px-4 py-4 font-semibold">{subModel.name}</td>

                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {subModel.slug}
                      </td>

                      <td className="max-w-xs px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                        <p className="line-clamp-2">{subModel.description || "-"}</p>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            subModel.isActive
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {subModel.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {new Date(subModel.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(subModel)}
                            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(subModel._id)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-[#111827]">
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
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Company
                  </label>
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

                <div className="md:col-span-2">
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

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Sub Model Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter sub model name"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black dark:border-gray-700 dark:bg-[#0f172a] dark:text-white dark:focus:border-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter description"
                    rows={4}
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
                  disabled={isCreating || isUpdating}
                  className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
                >
                  {isCreating || isUpdating
                    ? "Please wait..."
                    : isEditModalOpen
                    ? "Update Sub Model"
                    : "Create Sub Model"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}