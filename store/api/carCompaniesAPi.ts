import { apiSlice } from "./apiSlice";

export interface CarCompany {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CarCompanyListResponse {
  success: boolean;
  message: string;
  data: {
    result: CarCompany[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface SingleCarCompanyResponse {
  success: boolean;
  message: string;
  data: CarCompany;
}

export interface GetCarCompaniesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateCarCompanyPayload {
  name: string;
  description?: string;
  logo?: string;
  isActive?: boolean;
}

export interface UpdateCarCompanyPayload {
  id: string;
  name?: string;
  description?: string;
  logo?: string;
  isActive?: boolean;
}

export const carCompanyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCarCompanies: builder.query({
      query: (params) => ({
        url: "/car-companies",
        method: "GET",
        params,
      }),
      providesTags: ["CarCompanies"],
    }),

    getCarCompanyById: builder.query<SingleCarCompanyResponse, string>({
      query: (id) => ({
        url: `/car-companies/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "CarCompanies", id }],
    }),

    createCarCompany: builder.mutation<SingleCarCompanyResponse, CreateCarCompanyPayload>({
      query: (body) => ({
        url: "/car-companies",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CarCompanies"],
    }),

    updateCarCompany: builder.mutation<SingleCarCompanyResponse, UpdateCarCompanyPayload>({
      query: ({ id, ...body }) => ({
        url: `/car-companies/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        "CarCompanies",
        { type: "CarCompanies", id: arg.id },
      ],
    }),

    deleteCarCompany: builder.mutation<SingleCarCompanyResponse, string>({
      query: (id) => ({
        url: `/car-companies/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CarCompanies"],
    }),
  }),
});

export const {
  useGetCarCompaniesQuery,
  useGetCarCompanyByIdQuery,
  useCreateCarCompanyMutation,
  useUpdateCarCompanyMutation,
  useDeleteCarCompanyMutation,
} = carCompanyApi;