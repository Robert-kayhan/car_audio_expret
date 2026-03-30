"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useCreateCarCompanyMutation,
  useDeleteCarCompanyMutation,
  useGetCarCompaniesQuery,
  useUpdateCarCompanyMutation,
} from "@/store/api/carCompaniesAPi";

type CarCompany = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type FormDataType = {
  name: string;
  description: string;
  logo: string;
  isActive: boolean;
};

const initialFormData: FormDataType = {
  name: "",
  description: "",
  logo: "",
  isActive: true,
};

const CarCompaniesPage = () => {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CarCompany | null>(null);

  const [formData, setFormData] = useState<FormDataType>(initialFormData);
  const [formError, setFormError] = useState("");

  const { data, isLoading, isFetching, refetch } = useGetCarCompaniesQuery({
    page,
    limit,
    search,
  });

  const [createCarCompany, { isLoading: isCreating }] =
    useCreateCarCompanyMutation();
  const [updateCarCompany, { isLoading: isUpdating }] =
    useUpdateCarCompanyMutation();
  const [deleteCarCompany, { isLoading: isDeleting }] =
    useDeleteCarCompanyMutation();

  const companies = data?.data?.result || [];
  const pagination = data?.data?.pagination;
  const totalPages = pagination?.totalPages || 1;

  const modalTitle = useMemo(() => {
    return isEditModalOpen ? "Update Car Company" : "Create Car Company";
  }, [isEditModalOpen]);

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedCompany(null);
    setFormError("");
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openEditModal = (company: CarCompany) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name || "",
      description: company.description || "",
      logo: company.logo || "",
      isActive: company.isActive,
    });
    setFormError("");
    setIsEditModalOpen(true);
  };

  const closeAllModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    resetForm();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

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

    if (!formData.name.trim()) {
      setFormError("Company name is required");
      return;
    }

    try {
      await createCarCompany({
        name: formData.name.trim(),
        description: formData.description.trim(),
        logo: formData.logo.trim(),
        isActive: formData.isActive,
      }).unwrap();

      closeAllModals();
      refetch();
    } catch (error: any) {
      setFormError(
        error?.data?.message || error?.message || "Failed to create company"
      );
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!selectedCompany?._id) {
      setFormError("Company ID is missing");
      return;
    }

    if (!formData.name.trim()) {
      setFormError("Company name is required");
      return;
    }

    try {
      await updateCarCompany({
        id: selectedCompany._id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        logo: formData.logo.trim(),
        isActive: formData.isActive,
      }).unwrap();

      closeAllModals();
      refetch();
    } catch (error: any) {
      setFormError(
        error?.data?.message || error?.message || "Failed to update company"
      );
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this car company?"
    );
    if (!confirmDelete) return;

    try {
      await deleteCarCompany(id).unwrap();
      refetch();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete company");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#0b1120] dark:text-white p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Car Companies</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Manage car companies with create, update and delete actions.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90 dark:bg-white dark:text-black"
          >
            + Create Company
          </button>
        </div>

        <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#111827]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <input
              type="text"
              placeholder="Search by name, slug, description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full md:max-w-md rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black dark:border-gray-700 dark:bg-[#0f172a] dark:text-white dark:focus:border-white"
            />

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
                  <th className="px-4 py-4 text-left text-sm font-semibold">Name</th>
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
                      colSpan={6}
                      className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      Loading car companies...
                    </td>
                  </tr>
                ) : companies.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      No car companies found.
                    </td>
                  </tr>
                ) : (
                  companies.map((company: CarCompany) => (
                    <tr
                      key={company._id}
                      className="border-t border-gray-200 dark:border-gray-800"
                    >
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/admin/car-model?companyId=${company._id}&companyName=${encodeURIComponent(company.name)}`
                            )
                          }
                          className="font-semibold text-left text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {company.name}
                        </button>
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {company.slug}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                        <p className="line-clamp-2">{company.description || "-"}</p>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            company.isActive
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {company.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {new Date(company.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(company)}
                            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(company._id)}
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
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter company name"
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
                    ? "Update Company"
                    : "Create Company"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarCompaniesPage;