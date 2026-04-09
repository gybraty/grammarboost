import { useEffect, useMemo, useState } from "react"
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
import { Pencil } from "lucide-react"
import { Trash } from "lucide-react"
import { useForm } from "react-hook-form"
import useSWR from "swr"
import { api, getApiErrorMessage } from "@/lib/api"
import { toast } from "sonner"

const fetcher = (url) => api.get(url).then((res) => res.data.data)

export default function TagsManagementPage() {
  const [query, setQuery] = useState("")
  const [editingTag, setEditingTag] = useState(null)

  const {
    data: tags = [],
    error,
    isLoading,
    mutate,
  } = useSWR("/api/tags", fetcher)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  })

  useEffect(() => {
    if (editingTag) {
      reset({
        name: editingTag.name || "",
        description: editingTag.description || "",
      })
    } else {
      reset({ name: "", description: "" })
    }
  }, [editingTag, reset])

  const filteredTags = useMemo(() => {
    return tags.filter((tag) =>
      `${tag.name} ${tag.slug}`.toLowerCase().includes(query.toLowerCase())
    )
  }, [query, tags])

  const onSubmit = async (values) => {
    try {
      if (editingTag) {
        await api.put(`/api/tags/${editingTag._id}`, values)
        toast.success("Tag updated")
      } else {
        await api.post("/api/tags", values)
        toast.success("Tag created")
      }
      setEditingTag(null)
      reset({ name: "", description: "" })
      mutate()
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    }
  }

  const handleDelete = async (tag) => {
    try {
      await api.delete(`/api/tags/${tag._id}`)
      toast.success("Tag deleted")
      if (editingTag?._id === tag._id) {
        setEditingTag(null)
      }
      mutate()
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    }
  }

  return (
    <AdminLayout
      title="Tags"
      description="Create and organize lesson tags."
      actions={
        <Button onClick={() => setEditingTag(null)}>New tag</Button>
      }>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Tags library</CardTitle>
            <CardDescription>Manage tag metadata and usage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              className="bg-background"
              placeholder="Search tags..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Separator />
            {error ? (
              <div className="rounded-lg border border-dashed p-6 text-sm text-destructive">
                {getApiErrorMessage(error)}
              </div>
            ) : isLoading ? (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                Loading tags...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tag</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTags.map((tag) => (
                    <TableRow key={tag._id}>
                      <TableCell className="font-medium">{tag.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{tag.slug}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {tag.updatedAt
                          ? new Date(tag.updatedAt).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingTag(tag)}>
                            <Pencil className="size-4" />
                            <span className="sr-only">Edit tag</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(tag)}>
                            <Trash className="size-4" />
                            <span className="sr-only">Delete tag</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{editingTag ? "Edit tag" : "Create new tag"}</CardTitle>
            <CardDescription>
              Tags appear in filters and lesson forms.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tag name</label>
              <Input
                placeholder="e.g. Articles"
                {...register("name", { required: "Tag name is required" })}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                rows={4}
                placeholder="Short description shown to admins."
                {...register("description")}
              />
            </div>
            <Button
              className="w-full"
              disabled={isSubmitting}
              onClick={handleSubmit(onSubmit)}>
              {isSubmitting ? "Saving..." : "Save tag"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
