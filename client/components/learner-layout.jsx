import Link from "next/link"
import { useRouter } from "next/router"
import { useAuth } from "@/hooks/use-auth"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { LogOut, User, LayoutDashboard } from "lucide-react"

const navLinks = [
  { label: "Lessons", href: "/lessons" },
  { label: "Progress", href: "/progress" },
]

export function LearnerLayout({ children }) {
  const router = useRouter()
  const { user, isLoading, mutate } = useAuth()

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout")
      mutate(null, false)
      router.push("/")
      toast.success("Logged out successfully")
    } catch {
      toast.error("Failed to logout")
    }
  }

  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Floating Navbar */}
      <nav className="fixed top-4 left-4 right-4 rounded-xl shadow-xl shadow-primary/10 z-50 glass-nav">
        <div className="flex justify-between items-center px-6 h-16 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <Logo size="md" />
            <div className="hidden md:flex gap-6">
              {navLinks.map((link) => {
                const isActive =
                  router.pathname === link.href ||
                  router.pathname.startsWith(`${link.href}/`)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`font-heading text-sm font-medium hover:-translate-y-0.5 transition-all duration-200 ${
                      isActive
                        ? "text-primary border-b-2 border-primary pb-1"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full">
                    <Avatar className="h-9 w-9 border-2 border-primary/20 cursor-pointer hover:border-primary/50 transition-colors">
                      <AvatarFallback className="bg-primary/10 text-primary font-heading font-semibold text-sm">
                        {getInitials(user.displayName || user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium font-heading truncate">
                      {user.displayName || "Learner"}
                    </p>
                    <p className="text-muted-foreground text-xs truncate">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/progress">
                      <User className="mr-2 h-4 w-4" />
                      My Progress
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden md:inline-flex font-heading text-sm">
                  <Link href="/auth/login">Log In</Link>
                </Button>
                <Button asChild className="bg-accent hover:bg-accent/90 text-white font-heading text-sm rounded-full shadow-lg shadow-accent/20 hover:-translate-y-0.5 transition-transform">
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-28 pb-24 min-h-screen">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border bg-surface">
        <div className="flex flex-col md:flex-row justify-between items-center py-12 px-8 max-w-7xl mx-auto gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Logo size="sm" asLink={false} />
            <span className="font-heading text-xs text-muted-foreground">
              © {new Date().getFullYear()} GrammarBoost. Elevate your linguistics.
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {["Privacy Policy", "Terms of Service", "Help Center", "Contact Us"].map(
              (item) => (
                <a
                  key={item}
                  href="#"
                  className="font-heading text-xs text-muted-foreground hover:text-primary hover:underline transition-all opacity-80 hover:opacity-100"
                >
                  {item}
                </a>
              )
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
