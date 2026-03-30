import { apiSlice } from "./apiSlice";

export interface Department {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentListResponse {
  success: boolean;
  message: string;
  data: {
    result: Department[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface DepartmentSingleResponse {
  success: boolean;
  message: string;
  data: Department;
}

export interface GetDepartmentsParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean | "";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface DepartmentPayload {
  name: string;
  description?: string;
  image?: string;
  isActive?: boolean;
}

export const departmentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDepartments: builder.query<DepartmentListResponse, GetDepartmentsParams>({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        isActive = "",
        sortBy = "createdAt",
        sortOrder = "desc",
      }) => {
        const params = new URLSearchParams();

        params.append("page", String(page));
        params.append("limit", String(limit));

        if (search) params.append("search", search);
        if (isActive !== "") params.append("isActive", String(isActive));
        if (sortBy) params.append("sortBy", sortBy);
        if (sortOrder) params.append("sortOrder", sortOrder);

        return {
          url: `/departments?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Departments"],
    }),

    getDepartmentById: builder.query<DepartmentSingleResponse, string>({
      query: (id) => ({
        url: `/departments/${id}`,
        method: "GET",
      }),
      providesTags: ["Departments"],
    }),

    createDepartment: builder.mutation<DepartmentSingleResponse, DepartmentPayload>({
      query: (body) => ({
        url: "/departments",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Departments"],
    }),

    updateDepartment: builder.mutation<
      DepartmentSingleResponse,
      { id: string; body: Partial<DepartmentPayload> }
    >({
      query: ({ id, body }) => ({
        url: `/departments/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Departments"],
    }),

    deleteDepartment: builder.mutation<DepartmentSingleResponse, string>({
      query: (id) => ({
        url: `/departments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Departments"],
    }),
  }),
});

export const {
  useGetDepartmentsQuery,
  useGetDepartmentByIdQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = departmentApi;