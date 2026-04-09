import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import { useForm, Controller, useWatch } from "react-hook-form"
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
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { UploadCloud } from "lucide-react"
import { api, getApiErrorMessage } from "@/lib/api"
import { toast } from "sonner"

const levelOptions = ["A1", "A2", "B1", "B2", "C1"]
const fetcher = (url) => api.get(url).then((res) => res.data.data)

const defaultValues = {
  title: "",
  slug: "",
  level: "A1",
  summary: "",
  content: "",
  tags: [],
  isPublished: false,
}

export default function EditLessonPage() {
  const router = useRouter()
  const lessonId = router.query.id
  const [tagQuery, setTagQuery] = useState("")
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaAlt, setMediaAlt] = useState("")
  const [uploading, setUploading] = useState(false)

  const {
    data: lesson,
    error: lessonError,
    isLoading: lessonLoading,
    mutate: mutateLesson,
  } = useSWR(lessonId ? `/api/lessons/${lessonId}` : null, fetcher)

  const {
    data: tags = [],
    error: tagsError,
    isLoading: tagsLoading,
  } = useSWR("/api/tags", fetcher)

  const {
    data: questions = [],
    error: questionsError,
    isLoading: questionsLoading,
  } = useSWR(
    lessonId ? `/api/lessons/${lessonId}/questions` : null,
    fetcher
  )

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues })

  useEffect(() => {
    if (!lesson) return
    reset({
      title: lesson.title || "",
      slug: lesson.slug || "",
      level: lesson.level || "A1",
      summary: lesson.summary || "",
      content: lesson.content || "",
      tags: lesson.tags?.map((tag) => (typeof tag === "string" ? tag : tag._id)) || [],
      isPublished: lesson.isPublished ?? false,
    })
  }, [lesson, reset])

  const selectedTags = useWatch({ control, name: "tags" }) || []
  const isPublished = useWatch({ control, name: "isPublished" })

  const filteredTags = useMemo(() => {
    const query = tagQuery.trim().toLowerCase()
    if (!query) return tags
    return tags.filter(
      (tag) =>
        tag.name.toLowerCase().includes(query) ||
        tag.slug.toLowerCase().includes(query)
    )
  }, [tags, tagQuery])

  const toggleTag = (tagId) => {
    const next = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId]
    setValue("tags", next, { shouldDirty: true })
  }

  const submitLesson = (publish) =>
    handleSubmit(async (values) => {
      try {
        const payload = {
          title: values.title,
          level: values.level,
          summary: values.summary || "",
          content: values.content,
          tags: values.tags,
          isPublished: publish,
        }
        if (values.slug) {
          payload.slug = values.slug
        }
        await api.put(`/api/lessons/${lessonId}`, payload)
        toast.success("Lesson updated")
        mutateLesson()
      } catch (err) {
        toast.error(getApiErrorMessage(err))
      }
    })

  const handleUpload = async () => {
    if (!mediaFile || !lessonId) return
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append("file", mediaFile)
      if (mediaAlt.trim()) {
        formData.append("alt", mediaAlt.trim())
      }
      await api.post(`/api/lessons/${lessonId}/media`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast.success("Media uploaded")
      setMediaFile(null)
      setMediaAlt("")
      mutateLesson()
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  const mediaItems = lesson?.media || []
  const hasError = lessonError || tagsError || questionsError
  const isLoading = lessonLoading || tagsLoading || questionsLoading

  if (hasError) {
    return (
      <AdminLayout
        title="Edit lesson"
        description="Update content, media, and publishing status.">
        <div className="rounded-lg border border-dashed p-6 text-sm text-destructive">
          {getApiErrorMessage(hasError)}
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title="Edit lesson"
      description="Update content, media, and publishing status."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={submitLesson(isPublished)}
            disabled={isSubmitting || isLoading}>
            Save changes
          </Button>
          <Button onClick={submitLesson(true)} disabled={isSubmitting || isLoading}>
            Publish update
          </Button>
        </div>
      }>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Lesson overview</CardTitle>
              <CardDescription>
                Lesson ID: {lessonId || "loading..."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                  Loading lesson...
                </div>
              ) : (
                <FieldGroup>
                  <Field>
                    <FieldLabel>
                      <FieldTitle>Lesson title</FieldTitle>
                      <FieldDescription>Visible to learners.</FieldDescription>
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        {...register("title", {
                          required: "Title is required",
                        })}
                      />
                      {errors.title && (
                        <p className="text-xs text-destructive">
                          {errors.title.message}
                        </p>
                      )}
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>
                      <FieldTitle>Slug</FieldTitle>
                      <FieldDescription>
                        Leave blank to keep the current slug.
                      </FieldDescription>
                    </FieldLabel>
                    <FieldContent>
                      <Input {...register("slug")} />
                    </FieldContent>
                  </Field>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field>
                      <FieldLabel>
                        <FieldTitle>CEFR level</FieldTitle>
                        <FieldDescription>
                          Match the intended learner proficiency.
                        </FieldDescription>
                      </FieldLabel>
                      <FieldContent>
                        <Controller
                          control={control}
                          name="level"
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                              <SelectContent>
                                {levelOptions.map((item) => (
                                  <SelectItem key={item} value={item}>
                                    {item}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel>
                        <FieldTitle>Status</FieldTitle>
                        <FieldDescription>
                          Toggle visibility for learners.
                        </FieldDescription>
                      </FieldLabel>
                      <FieldContent>
                        <Controller
                          control={control}
                          name="isPublished"
                          render={({ field }) => (
                            <div className="flex items-center gap-3 rounded-lg border px-3 py-2">
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <div>
                                <p className="text-sm font-medium">
                                  {field.value ? "Published" : "Draft"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {field.value
                                    ? "Learners can access this lesson."
                                    : "Only visible to admins."}
                                </p>
                              </div>
                            </div>
                          )}
                        />
                      </FieldContent>
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel>
                      <FieldTitle>Summary</FieldTitle>
                      <FieldDescription>
                        Shown on the lesson list view.
                      </FieldDescription>
                    </FieldLabel>
                    <FieldContent>
                      <Textarea rows={4} {...register("summary")} />
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>
                      <FieldTitle>Tags</FieldTitle>
                      <FieldDescription>
                        Assigned tags help learners find this lesson.
                      </FieldDescription>
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        placeholder="Filter tags..."
                        value={tagQuery}
                        onChange={(event) => setTagQuery(event.target.value)}
                      />
                      <div className="mt-3 flex flex-wrap gap-2">
                        {tagsLoading ? (
                          <Badge variant="outline">Loading tags...</Badge>
                        ) : tagsError ? (
                          <Badge variant="destructive">
                            {getApiErrorMessage(tagsError)}
                          </Badge>
                        ) : filteredTags.length === 0 ? (
                          <Badge variant="outline">No tags found</Badge>
                        ) : (
                          filteredTags.map((tag) => (
                            <Button
                              key={tag._id}
                              type="button"
                              variant={
                                selectedTags.includes(tag._id)
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => toggleTag(tag._id)}>
                              {tag.name}
                            </Button>
                          ))
                        )}
                      </div>
                    </FieldContent>
                  </Field>
                </FieldGroup>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lesson content</CardTitle>
              <CardDescription>
                Update markdown content and examples.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="write">
                <TabsList variant="line">
                  <TabsTrigger value="write">Write</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="write" className="mt-4">
                  <Textarea
                    rows={14}
                    {...register("content", {
                      required: "Content is required",
                    })}
                  />
                  {errors.content && (
                    <p className="mt-2 text-xs text-destructive">
                      {errors.content.message}
                    </p>
                  )}
                </TabsContent>
                <TabsContent value="preview" className="mt-4">
                  <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                    Markdown preview will render here.
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
              <CardDescription>Update lesson visuals.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 px-6 py-8 text-center">
                <UploadCloud className="size-6 text-muted-foreground" />
                <div className="text-sm font-medium">Upload new media</div>
                <p className="text-xs text-muted-foreground">
                  PNG or JPG up to 5MB.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="media-upload"
                  onChange={(event) =>
                    setMediaFile(event.target.files?.[0] || null)
                  }
                />
                <label htmlFor="media-upload">
                  <Button variant="outline" size="sm" asChild>
                    <span>Choose file</span>
                  </Button>
                </label>
                {mediaFile && (
                  <div className="text-xs text-muted-foreground">
                    Selected: {mediaFile.name}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Alt text (optional)"
                  value={mediaAlt}
                  onChange={(event) => setMediaAlt(event.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUpload}
                  disabled={!mediaFile || uploading}>
                  {uploading ? "Uploading..." : "Upload media"}
                </Button>
              </div>
              <div className="space-y-2 text-sm">
                {mediaItems.length === 0 ? (
                  <div className="rounded-lg border px-3 py-2 text-muted-foreground">
                    No media uploaded yet.
                  </div>
                ) : (
                  mediaItems.map((media) => (
                    <div
                      key={media.publicId}
                      className="flex items-center justify-between rounded-lg border px-3 py-2">
                      <span>
                        {media.publicId?.split("/").pop() || media.url}
                      </span>
                      <Button size="sm" variant="ghost" asChild>
                        <a href={media.url} target="_blank" rel="noreferrer">
                          View
                        </a>
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lesson metrics</CardTitle>
              <CardDescription>Recent activity snapshot.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Quiz questions</span>
                <Badge variant="outline">{questions.length}</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span>Completion rate</span>
                <Badge variant="secondary">—</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span>Last updated</span>
                <Badge variant="outline">
                  {lesson?.updatedAt
                    ? new Date(lesson.updatedAt).toLocaleDateString()
                    : "—"}
                </Badge>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/questions">Manage questions</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
