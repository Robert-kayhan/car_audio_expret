import { apiSlice } from "./apiSlice";

export const subModelsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSubModels: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        modelId,
        isActive,
        sortBy = "createdAt",
        sortOrder = "desc",
      }) => ({
        url: "/sub-models",
        method: "GET",
        params: {
          page,
          limit,
          search,
          modelId,
          isActive,
          sortBy,
          sortOrder,
        },
      }),
      providesTags: ["SubModels"],
    }),

    getSubModelById: builder.query({
      query: (id: string) => ({
        url: `/sub-models/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "SubModels", id }],
    }),

    createSubModel: builder.mutation({
      query: (body) => ({
        url: "/sub-models",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SubModels"],
    }),

    updateSubModel: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/sub-models/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        "SubModels",
        { type: "SubModels", id: arg.id },
      ],
    }),

    deleteSubModel: builder.mutation({
      query: (id: string) => ({
        url: `/sub-models/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SubModels"],
    }),
  }),
});

export const {
  useGetSubModelsQuery,
  useGetSubModelByIdQuery,
  useCreateSubModelMutation,
  useUpdateSubModelMutation,
  useDeleteSubModelMutation,
} = subModelsApi;