const defaultHeaders = {
  "Content-Type": "application/json"
};

export async function api(path, options = {}) {
  const token = localStorage.getItem("bloodconnect-token");
  const headers = {
    ...defaultHeaders,
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}
