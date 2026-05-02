import axios from "axios"

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001",
  withCredentials: true,
})

const authRefreshPaths = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/logout",
]

const isAuthRefreshPath = (url = "") =>
  authRefreshPaths.some((path) => url.startsWith(path))

let refreshPromise = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error || {}
    if (!response || response.status !== 401 || !config) {
      return Promise.reject(error)
    }

    if (config._retry || isAuthRefreshPath(config.url || "")) {
      return Promise.reject(error)
    }

    config._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = api
          .post("/api/auth/refresh")
          .finally(() => {
            refreshPromise = null
          })
      }
      await refreshPromise
      return api(config)
    } catch (refreshError) {
      return Promise.reject(refreshError)
    }
  }
)

export const getApiErrorMessage = (error) => {
  if (error?.response?.data?.error?.message) {
    return error.response.data.error.message
  }
  return error?.message || "Something went wrong"
}
