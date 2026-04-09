import Link from "next/link"
import { useMemo } from "react"
import useSWR from "swr"
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
import { ArrowRight, BookOpen, ListChecks, Tag } from "lucide-react"
import { api, getApiErrorMessage } from "@/lib/api"

const fetcher = (url) => api.get(url).then((res) => res.data.data)

export default function AdminDashboardPage() {
  const {
    data: lessons = [],
    error: lessonsError,
    isLoading: lessonsLoading,
  } = useSWR("/api/lessons?includeUnpublished=true", fetcher)

  const {
    data: tags = [],
    error: tagsError,
    isLoading: tagsLoading,
  } = useSWR("/api/tags", fetcher)

  const lessonIds = useMemo(
    () => lessons.map((lesson) => lesson._id).join(","),
    [lessons]
  )

  const questionsKey = lessons.length ? ["questions", lessonIds] : null
  const fetchQuestions = async ([, ids]) => {
    const targetIds = ids.split(",").filter(Boolean)
    if (!targetIds.length) return []
    const responses = await Promise.all(
      targetIds.map((lessonId) => api.get(`/api/lessons/${lessonId}/questions`))
    )
    return responses.flatMap((response) => response.data.data)
  }

  const {
    data: questions = [],
    error: questionsError,
    isLoading: questionsLoading,
  } = useSWR(questionsKey, fetchQuestions)

  const stats = useMemo(() => {
    const publishedLessons = lessons.filter((lesson) => lesson.isPublished)
    const levels = new Set(lessons.map((lesson) => lesson.level))
    return [
      {
        label: "Total lessons",
        value: lessons.length.toString(),
        note: `${publishedLessons.length} published`,
      },
      {
        label: "Draft lessons",
        value: (lessons.length - publishedLessons.length).toString(),
        note: "Needs review",
      },
      {
        label: "Active tags",
        value: tags.length.toString(),
        note: "Organize your content",
      },
      {
        label: "Question bank",
        value: questions.length.toString(),
        note: `Across ${levels.size || 0} levels`,
      },
    ]
  }, [lessons, tags, questions])

  const recentUpdates = useMemo(() => {
    return [...lessons]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 4)
      .map((lesson) => ({
        id: lesson._id,
        lesson: lesson.title,
        level: lesson.level,
        status: lesson.isPublished ? "Published" : "Draft",
        updated: lesson.updatedAt
          ? new Date(lesson.updatedAt).toLocaleDateString()
          : "—",
      }))
  }, [lessons])

  const hasError = lessonsError || tagsError || questionsError
  const isLoading = lessonsLoading || tagsLoading || questionsLoading

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
        {hasError ? (
          <div className="rounded-lg border border-dashed p-6 text-sm text-destructive">
            {getApiErrorMessage(hasError)}
          </div>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardHeader>
                  <CardDescription>{stat.label}</CardDescription>
                  <CardTitle className="text-2xl">{stat.value}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {isLoading ? "Loading..." : stat.note}
                </CardContent>
              </Card>
            ))}
          </section>
        )}

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Recent lesson updates</CardTitle>
              <CardDescription>Latest edits across CEFR levels.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                  Loading recent updates...
                </div>
              ) : (
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
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">
                          {row.lesson}
                        </TableCell>
                        <TableCell>{row.level}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              row.status === "Published"
                                ? "default"
                                : "secondary"
                            }>
                            {row.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {row.updated}
                        </TableCell>
                      </TableRow>
                    ))}
                    {recentUpdates.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-sm text-muted-foreground">
                          No lessons yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>Jump to common tasks.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button asChild variant="outline" className="justify-between">
                <Link href="/admin/lessons">
                  <span className="flex items-center gap-2">
                    <BookOpen className="size-4" />
                    Review lessons
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-between">
                <Link href="/admin/tags">
                  <span className="flex items-center gap-2">
                    <Tag className="size-4" />
                    Manage tags
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-between">
                <Link href="/admin/questions">
                  <span className="flex items-center gap-2">
                    <ListChecks className="size-4" />
                    Add questions
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </Link>
              </Button>
              <Button asChild className="justify-between">
                <Link href="/admin/lessons/new">
                  <span className="flex items-center gap-2">
                    <BookOpen className="size-4" />
                    Create new lesson
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </AdminLayout>
  )
}
