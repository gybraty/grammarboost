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
import { Pencil, Search } from "lucide-react"
import useSWR from "swr"
import { api, getApiErrorMessage } from "@/lib/api"
import { buildQueryString } from "@/lib/query"

const levelOptions = ["All levels", "A1", "A2", "B1", "B2", "C1"]
const statusOptions = ["All statuses", "Published", "Draft"]
const fetcher = (url) => api.get(url).then((res) => res.data.data)

export default function AdminLessonsPage() {
  const [search, setSearch] = useState("")
  const [levelFilter, setLevelFilter] = useState("All levels")
  const [statusFilter, setStatusFilter] = useState("All statuses")
  const [tagFilter, setTagFilter] = useState("All tags")

  const { data: tags = [] } = useSWR("/api/tags", fetcher)

  const lessonsQuery = buildQueryString({
    level: levelFilter !== "All levels" ? levelFilter : undefined,
    search: search || undefined,
    tag: tagFilter !== "All tags" ? tagFilter : undefined,
    includeUnpublished: true,
  })

  const {
    data: lessons = [],
    error,
    isLoading,
  } = useSWR(`/api/lessons${lessonsQuery}`, fetcher)

  const filteredLessons = useMemo(() => {
    if (!lessons) return []
    return lessons.filter((lesson) => {
      const matchesStatus =
        statusFilter === "All statuses" ||
        (statusFilter === "Published" ? lesson.isPublished : !lesson.isPublished)
      return matchesStatus
    })
  }, [lessons, statusFilter])

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
                  className="border-0 bg-background focus-visible:ring-0"
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
                  <SelectContent position="popper" align="start">
                    {levelOptions.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={tagFilter} onValueChange={setTagFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="All tags" />
                  </SelectTrigger>
                  <SelectContent position="popper" align="start">
                    <SelectItem value="All tags">All tags</SelectItem>
                    {tags.map((tag) => (
                      <SelectItem key={tag._id} value={tag.slug}>
                        {tag.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent position="popper" align="start">
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
            {error ? (
              <div className="rounded-lg border border-dashed p-6 text-sm text-destructive">
                {getApiErrorMessage(error)}
              </div>
            ) : isLoading ? (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                Loading lessons...
              </div>
            ) : filteredLessons.length === 0 ? (
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
                      <TableRow key={lesson._id}>
                        <TableCell className="font-medium">{lesson.title}</TableCell>
                        <TableCell>{lesson.level}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              lesson.isPublished
                                ? "default"
                                : "secondary"
                            }>
                            {lesson.isPublished ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell className="flex flex-wrap gap-2">
                          {(lesson.tags || []).map((tag) => (
                            <Badge key={tag._id || tag.name} variant="outline">
                              {tag.name || tag}
                            </Badge>
                          ))}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {lesson.updatedAt
                            ? new Date(lesson.updatedAt).toLocaleDateString()
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="icon">
                            <Link href={`/admin/lessons/${lesson._id}/edit`}>
                              <Pencil className="size-4" />
                              <span className="sr-only">Edit lesson</span>
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
