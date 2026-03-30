import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "apiSlice",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_ADDRESS,
  }),
  tagTypes: ["Departments", "CarCompanies", "CarModels", "SubModels", "Products"],
  endpoints: () => ({}),
});