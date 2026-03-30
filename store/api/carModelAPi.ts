import { apiSlice } from "./apiSlice";

export const carModelsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCarModels: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        companyId,
        isActive,
        sortBy = "createdAt",
        sortOrder = "desc",
      }) => ({
        url: "/car-models",
        method: "GET",
        params: {
          page,
          limit,
          search,
          companyId,
          isActive,
          sortBy,
          sortOrder,
        },
      }),
      providesTags: ["CarModels"],
    }),

    getCarModelById: builder.query({
      query: (id: string) => ({
        url: `/car-models/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "CarModels", id }],
    }),

    createCarModel: builder.mutation({
      query: (body) => ({
        url: "/car-models",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CarModels"],
    }),

    updateCarModel: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/car-models/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        "CarModels",
        { type: "CarModels", id: arg.id },
      ],
    }),

    deleteCarModel: builder.mutation({
      query: (id: string) => ({
        url: `/car-models/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CarModels"],
    }),
  }),
});

export const {
  useGetCarModelsQuery,
  useGetCarModelByIdQuery,
  useCreateCarModelMutation,
  useUpdateCarModelMutation,
  useDeleteCarModelMutation,
} = carModelsApi;