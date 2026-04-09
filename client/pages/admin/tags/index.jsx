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
import { Textarea } from "@/components/ui/textarea"

const initialTags = [
  {
    id: "t1",
    name: "Articles",
    slug: "articles",
    lessons: 12,
    updatedAt: "2026-04-08",
  },
  {
    id: "t2",
    name: "Conditionals",
    slug: "conditionals",
    lessons: 6,
    updatedAt: "2026-04-07",
  },
  {
    id: "t3",
    name: "Passive Voice",
    slug: "passive-voice",
    lessons: 4,
    updatedAt: "2026-04-05",
  },
  {
    id: "t4",
    name: "Pronouns",
    slug: "pronouns",
    lessons: 9,
    updatedAt: "2026-04-02",
  },
]

export default function TagsManagementPage() {
  const [query, setQuery] = useState("")
  const [tags] = useState(initialTags)

  const filteredTags = useMemo(() => {
    return tags.filter((tag) =>
      `${tag.name} ${tag.slug}`.toLowerCase().includes(query.toLowerCase())
    )
  }, [query, tags])

  return (
    <AdminLayout
      title="Tags"
      description="Create and organize lesson tags."
      actions={<Button>Create tag</Button>}>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Tags library</CardTitle>
            <CardDescription>Manage tag metadata and usage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Search tags..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Separator />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Lessons</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell className="font-medium">{tag.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{tag.slug}</Badge>
                    </TableCell>
                    <TableCell>{tag.lessons}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {tag.updatedAt}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create new tag</CardTitle>
            <CardDescription>
              Tags appear in filters and lesson forms.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tag name</label>
              <Input placeholder="e.g. Articles" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <Input placeholder="articles" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                rows={4}
                placeholder="Short description shown to admins."
              />
            </div>
            <Button className="w-full">Save tag</Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
