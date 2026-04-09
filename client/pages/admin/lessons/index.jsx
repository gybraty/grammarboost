import Link from "next/link"
import { useMemo, useState } from "react"
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
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"

const lessons = [
  {
    id: "1",
    title: "Articles and Determiners",
    level: "A2",
    status: "Published",
    tags: ["articles", "nouns"],
    updatedAt: "2026-04-08",
  },
  {
    id: "2",
    title: "Present Simple Basics",
    level: "A1",
    status: "Draft",
    tags: ["verbs"],
    updatedAt: "2026-04-07",
  },
  {
    id: "3",
    title: "Passive Voice Essentials",
    level: "B1",
    status: "In Review",
    tags: ["voice", "verbs"],
    updatedAt: "2026-04-05",
  },
  {
    id: "4",
    title: "Conditionals Type 2",
    level: "B2",
    status: "Published",
    tags: ["conditionals"],
    updatedAt: "2026-04-03",
  },
]

const levelOptions = ["All levels", "A1", "A2", "B1", "B2", "C1"]
const statusOptions = ["All statuses", "Published", "Draft", "In Review"]

export default function AdminLessonsPage() {
  const [search, setSearch] = useState("")
  const [levelFilter, setLevelFilter] = useState("All levels")
  const [statusFilter, setStatusFilter] = useState("All statuses")

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const matchesSearch =
        lesson.title.toLowerCase().includes(search.toLowerCase()) ||
        lesson.tags.some((tag) => tag.includes(search.toLowerCase()))
      const matchesLevel =
        levelFilter === "All levels" || lesson.level === levelFilter
      const matchesStatus =
        statusFilter === "All statuses" || lesson.status === statusFilter
      return matchesSearch && matchesLevel && matchesStatus
    })
  }, [search, levelFilter, statusFilter])

  return (
    <AdminLayout
      title="Lessons"
      description="Manage grammar lessons across CEFR levels."
      actions={
        <Button asChild>
          <Link href="/admin/lessons/new">Create lesson</Link>
        </Button>
      }>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lesson library</CardTitle>
            <CardDescription>
              Filter by level, search by topic, and review lesson status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex w-full max-w-md items-center gap-2 rounded-lg border bg-background px-2 py-1.5">
                <Search className="size-4 text-muted-foreground" />
                <Input
                  className="border-0 focus-visible:ring-0"
                  placeholder="Search lessons or tags..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    {levelOptions.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator />
            {filteredLessons.length === 0 ? (
              <Empty className="border border-dashed">
                <EmptyHeader>
                  <EmptyMedia variant="icon">📘</EmptyMedia>
                  <EmptyTitle>No lessons found</EmptyTitle>
                  <EmptyDescription>
                    Adjust filters or create a new lesson to get started.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button asChild>
                    <Link href="/admin/lessons/new">Create lesson</Link>
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lesson</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLessons.map((lesson) => (
                    <TableRow key={lesson.id}>
                      <TableCell className="font-medium">{lesson.title}</TableCell>
                      <TableCell>{lesson.level}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            lesson.status === "Published"
                              ? "default"
                              : lesson.status === "Draft"
                              ? "secondary"
                              : "outline"
                          }>
                          {lesson.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex flex-wrap gap-2">
                        {lesson.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {lesson.updatedAt}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/lessons/${lesson.id}/edit`}>
                            Edit
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
