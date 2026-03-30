"use client";

import React, { useMemo, useState } from "react";
import {
  useCreateDepartmentMutation,
  useDeleteDepartmentMutation,
  useGetDepartmentsQuery,
  useUpdateDepartmentMutation,
  Department,
} from "@/store/api/departmentAPi";

const DepartmentsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    isActive: true,
  });

  const queryParams = useMemo(
    () => ({
      page,
      limit: 10,
      search,
      sortBy: "createdAt",
      sortOrder: "desc" as const,
    }),
    [page, search]
  );

  const { data, isLoading, isFetching } = useGetDepartmentsQuery(queryParams);

  const [createDepartment, { isLoading: isCreating }] =
    useCreateDepartmentMutation();

  const [updateDepartment, { isLoading: isUpdating }] =
    useUpdateDepartmentMutation();

  const [deleteDepartment, { isLoading: isDeleting }] =
    useDeleteDepartmentMutation();

  const departments = data?.data?.result || [];
  const pagination: any = data?.data?.pagination;

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image: "",
      isActive: true,
    });
    setEditId(null);
  };

  const closeModal = () => {
    resetForm();
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Department name is required");
      return;
    }

    try {
      if (editId) {
        const res = await updateDepartment({
          id: editId,
          body: {
            name: formData.name,
            description: formData.description,
            image: formData.image,
            isActive: formData.isActive,
          },
        }).unwrap();

        alert(res.message || "Department updated successfully");
      } else {
        const res = await createDepartment({
          name: formData.name,
          description: formData.description,
          image: formData.image,
          isActive: formData.isActive,
        }).unwrap();

        alert(res.message || "Department created successfully");
      }

      closeModal();
    } catch (error: any) {
      alert(error?.data?.message || "Something went wrong");
    }
  };

  const handleEdit = (item: Department) => {
    setEditId(item._id);
    setFormData({
      name: item.name || "",
      description: item.description || "",
      image: item.image || "",
      isActive: item.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this department?"
    );

    if (!confirmDelete) return;

    try {
      const res = await deleteDepartment(id).unwrap();
      alert(res.message || "Department deleted successfully");
    } catch (error: any) {
      alert(error?.data?.message || "Failed to delete department");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Department Management</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage all departments with create, update, and delete actions
              </p>
            </div>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700"
            >
              + Create Department
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 p-4 dark:border-gray-800">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-semibold">Departments List</h2>

              <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by name or description"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
                <button
                  onClick={() => {
                    setPage(1);
                    setSearch(searchInput);
                  }}
                  className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-black dark:bg-gray-100 dark:text-black dark:hover:bg-white"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading || isFetching ? (
              <div className="p-6 text-sm text-gray-500 dark:text-gray-400">
                Loading departments...
              </div>
            ) : departments.length === 0 ? (
              <div className="p-6 text-sm text-gray-500 dark:text-gray-400">
                No departments found
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-100 dark:bg-gray-950/60">
                  <tr>
                    
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      Slug
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {departments.map((item: Department) => (
                    <tr
                      key={item._id}
                      className="transition hover:bg-gray-50 dark:hover:bg-gray-800/40"
                    >
                   

                      <td className="px-4 py-3">
                        <div className="font-semibold">{item.name}</div>
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {item.slug}
                      </td>

                      <td className="max-w-[280px] px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="line-clamp-2">
                          {item.description || "No description"}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            item.isActive
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(item._id)}
                            disabled={isDeleting}
                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {pagination?.totalPages > 1 ? (
            <div className="flex items-center justify-between border-t border-gray-200 p-4 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {pagination.page} of {pagination.totalPages}
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-gray-700"
                >
                  Prev
                </button>

                <button
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <h3 className="text-lg font-semibold">
                {editId ? "Update Department" : "Create Department"}
              </h3>

              <button
                onClick={closeModal}
                className="rounded-lg px-3 py-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Department Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter department name"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Enter description"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
              </div>

            

              

              <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-700">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                />
                <span className="text-sm font-medium">Department is active</span>
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium dark:border-gray-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {editId
                    ? isUpdating
                      ? "Updating..."
                      : "Update Department"
                    : isCreating
                    ? "Creating..."
                    : "Create Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DepartmentsPage;