import Link from "next/link"
import { useRouter } from "next/router"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  BookOpen,
  FileText,
  LayoutDashboard,
  ListChecks,
  Tag,
} from "lucide-react"

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Lessons",
    href: "/admin/lessons",
    icon: BookOpen,
  },
  {
    label: "Tags",
    href: "/admin/tags",
    icon: Tag,
  },
  {
    label: "Questions",
    href: "/admin/questions",
    icon: ListChecks,
  },
  {
    label: "PRD",
    href: "/admin/prd",
    icon: FileText,
  },
]

export function AdminLayout({ title, description, actions, children }) {
  const router = useRouter()

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="gap-2 px-3 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              GB
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">GrammarBoost</span>
              <span className="text-xs text-muted-foreground">Admin Console</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Manage</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive =
                    router.pathname === item.href ||
                    router.pathname.startsWith(`${item.href}/`)
                  const Icon = item.icon
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.href}>
                          <Icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="gap-3 px-3 pb-4">
          <Separator />
          <Button variant="outline" size="sm" asChild>
            <Link href="/auth/login">Switch account</Link>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-muted/30">
        <header className="flex items-center justify-between gap-4 border-b bg-background px-6 py-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <div>
              <h1 className="text-lg font-semibold">{title}</h1>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
        <main className="flex-1 px-6 py-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
