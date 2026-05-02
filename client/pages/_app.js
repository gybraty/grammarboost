import "@/styles/globals.css";
import { useEffect } from "react"
import { useRouter } from "next/router"
import { Toaster } from "@/components/ui/sonner"
import { useAuth } from "@/hooks/use-auth"

const authRoutes = new Set(["/auth/login", "/auth/signup"])
const publicRoutes = new Set(["/"])

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return

    const isAuthRoute = authRoutes.has(router.pathname)
    const isPublicRoute = publicRoutes.has(router.pathname)
    if (user && isAuthRoute) {
      router.replace("/lessons")
      return
    }

    if (!user && !isAuthRoute && !isPublicRoute) {
      router.replace("/auth/login")
    }
  }, [user, isLoading, router])

  return (
    <>
      <Component {...pageProps} />
      <Toaster />
    </>
  );
}
