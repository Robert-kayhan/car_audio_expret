export function successResponse(
  data: any,
  message = "Success",
  status = 200
): Response {
  return Response.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

export function errorResponse(
  message = "Something went wrong",
  status = 500,
  errors: any = null
): Response {
  return Response.json(
    {
      success: false,
      message,
      errors,
    },
    { status }
  );
}