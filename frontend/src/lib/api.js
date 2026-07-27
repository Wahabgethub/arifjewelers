import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
  timeout: 20000,
});

export async function getWithRetry(path, config, retries = 3, delayMs = 1800) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await api.get(path, config);
      return res.data;
    } catch (err) {
      if (attempt === retries) return null;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return null;
}

// Attach token from localStorage as Bearer as well (in addition to cookies)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("arif_admin_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fileUrl = (fileId) => (fileId ? `${API}/files/${fileId}` : "");

export function formatApiError(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}
