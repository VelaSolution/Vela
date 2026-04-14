export function apiError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}
export function apiSuccess(data: unknown) {
  return Response.json(data);
}
