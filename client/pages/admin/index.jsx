import Link from "next/link"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const stats = [
  { label: "Total lessons", value: "42", note: "12 published" },
  { label: "Draft lessons", value: "8", note: "Needs review" },
  { label: "Active tags", value: "14", note: "3 new this week" },
  { label: "Question bank", value: "128", note: "Across 5 levels" },
]

const recentUpdates = [
  {
    lesson: "Present Perfect vs Past Simple",
    level: "B1",
    status: "Draft",
    updated: "2 hours ago",
  },
  {
    lesson: "Articles and Determiners",
    level: "A2",
    status: "Published",
    updated: "Yesterday",
  },
  {
    lesson: "Conditionals Type 2",
    level: "B2",
    status: "Published",
    updated: "2 days ago",
  },
  {
    lesson: "Passive Voice Basics",
    level: "B1",
    status: "In review",
    updated: "3 days ago",
  },
]

export default function AdminDashboardPage() {
  return (
    <AdminLayout
      title="Admin Dashboard"
      description="Overview of learning materials and recent changes."
      actions={
        <Button asChild>
          <Link href="/admin/lessons/new">Create lesson</Link>
        </Button>
      }>
      <div className="grid gap-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader>
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className="text-2xl">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {stat.note}
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Recent lesson updates</CardTitle>
              <CardDescription>Latest edits across CEFR levels.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lesson</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUpdates.map((row) => (
                    <TableRow key={row.lesson}>
                      <TableCell className="font-medium">{row.lesson}</TableCell>
                      <TableCell>{row.level}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            row.status === "Published"
                              ? "default"
                              : row.status === "Draft"
                              ? "secondary"
                              : "outline"
                          }>
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.updated}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>Jump to common tasks.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button asChild variant="outline">
                <Link href="/admin/lessons">Review lessons</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/tags">Manage tags</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/questions">Add questions</Link>
              </Button>
              <Button asChild>
                <Link href="/admin/lessons/new">Create new lesson</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </AdminLayout>
  )
}
