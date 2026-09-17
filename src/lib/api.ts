export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const isJsonResponse = response.headers.get("content-type")?.includes("application/json");
  const payload = isJsonResponse ? ((await response.json().catch(() => null)) as T & { message?: string }) : null;

  if (!response.ok || !payload) {
    throw new Error(payload?.message || "The server request failed.");
  }

  return payload;
}
