import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
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
  contentLink: "",
  contentKey: "",
  tags: [],
  isPublished: false,
}

export default function CreateLessonPage() {
  const router = useRouter()
  const [tagQuery, setTagQuery] = useState("")
  const [contentFile, setContentFile] = useState(null)
  const [contentPreviewUrl, setContentPreviewUrl] = useState("")
  const [contentUploading, setContentUploading] = useState(false)
  const contentInputRef = useRef(null)

  const {
    data: tags = [],
    error: tagsError,
    isLoading: tagsLoading,
  } = useSWR("/api/tags", fetcher)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues })

  const selectedTags = useWatch({ control, name: "tags" }) || []
  const isPublished = useWatch({ control, name: "isPublished" })
  const watchedLevel = useWatch({ control, name: "level" })
  const watchedSummary = useWatch({ control, name: "summary" })
  const contentLinkValue = useWatch({ control, name: "contentLink" })
  const isValidHttpUrl = (value) => {
    if (!value) return false
    try {
      const url = new URL(value)
      return ["http:", "https:"].includes(url.protocol)
    } catch (err) {
      return false
    }
  }

  const isContentLinkValid = useMemo(
    () => isValidHttpUrl(contentLinkValue),
    [contentLinkValue]
  )
  const shouldShowPreview = Boolean(contentPreviewUrl || isContentLinkValid)

  useEffect(() => {
    if (!contentFile) {
      setContentPreviewUrl("")
      return undefined
    }
    const nextUrl = URL.createObjectURL(contentFile)
    setContentPreviewUrl(nextUrl)
    return () => URL.revokeObjectURL(nextUrl)
  }, [contentFile])

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
          slug: values.slug || undefined,
          level: values.level,
          summary: values.summary || undefined,
          contentLink: values.contentLink,
          contentKey: values.contentKey || undefined,
          tags: values.tags,
          isPublished: publish,
        }
        const response = await api.post("/api/lessons", payload)
        toast.success("Lesson created")
        router.push(`/admin/lessons/${response.data.data._id}/edit`)
      } catch (err) {
        toast.error(getApiErrorMessage(err))
      }
    })

  const handleContentUpload = async () => {
    if (!contentFile) return
    try {
      setContentUploading(true)
      const formData = new FormData()
      formData.append("file", contentFile)
      const response = await api.post("/api/lessons/content/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setValue("contentLink", response.data.data.contentLink, { shouldDirty: true })
      setValue("contentKey", response.data.data.contentKey, { shouldDirty: true })
      toast.success("PDF uploaded")
      setContentFile(null)
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setContentUploading(false)
    }
  }

  const triggerContentPicker = () => {
    contentInputRef.current?.click()
  }

  const clearContentSelection = () => {
    setContentFile(null)
    setContentPreviewUrl("")
  }

  return (
    <AdminLayout
      title="Create lesson"
      description="Draft new grammar materials and publish when ready."
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={submitLesson(false)}>
            Save draft
          </Button>
          <Button onClick={submitLesson(true)}>Publish lesson</Button>
        </div>
      }>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Lesson details</CardTitle>
              <CardDescription>
                Core information used to organize and search the lesson.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>
                    <FieldTitle>Lesson title</FieldTitle>
                    <FieldDescription>
                      Use a short, descriptive title learners can recognize.
                    </FieldDescription>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      placeholder="Articles and determiners"
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
                      Optional URL slug. Leave blank to auto-generate.
                    </FieldDescription>
                  </FieldLabel>
                  <FieldContent>
                    <Input placeholder="articles-and-determiners" {...register("slug")} />
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
                        rules={{ required: "Level is required" }}
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
                        Toggle when the lesson is ready for learners.
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
                                  ? "Visible in the learner catalog."
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
                      Short description displayed in lesson lists.
                    </FieldDescription>
                  </FieldLabel>
                  <FieldContent>
                    <Textarea
                      placeholder="Explain the grammar concept and why it matters."
                      rows={4}
                      {...register("summary")}
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>
                    <FieldTitle>Tags</FieldTitle>
                    <FieldDescription>
                      Add topical tags to help filtering and search.
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lesson content PDF</CardTitle>
              <CardDescription>
                Upload a PDF handout or paste an existing link.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field>
                <FieldLabel>
                  <FieldTitle>Content link</FieldTitle>
                  <FieldDescription>
                    Link to the lesson PDF stored in Cloudflare R2.
                  </FieldDescription>
                </FieldLabel>
                <FieldContent>
                  <Input
                    placeholder="https://cdn.example.com/lessons/lesson.pdf"
                    {...register("contentLink", {
                      required: "Content link is required",
                      validate: (value) =>
                        isValidHttpUrl(value) || "Content link must be a valid URL",
                    })}
                  />
                  {errors.contentLink && (
                    <p className="mt-2 text-xs text-destructive">
                      {errors.contentLink.message}
                    </p>
                  )}
                </FieldContent>
              </Field>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={contentInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(event) =>
                    setContentFile(event.target.files?.[0] || null)
                  }
                />
                <Button variant="outline" size="sm" onClick={triggerContentPicker}>
                  <UploadCloud className="mr-2 size-4" />
                  Choose PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleContentUpload}
                  disabled={!contentFile || contentUploading}>
                  {contentUploading ? "Uploading..." : "Upload PDF"}
                </Button>
                {contentFile && (
                  <span className="text-xs text-muted-foreground">
                    Selected: {contentFile.name}
                  </span>
                )}
                {isContentLinkValid && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={contentLinkValue} target="_blank" rel="noreferrer">
                      Open PDF
                    </a>
                  </Button>
                )}
                {contentFile && (
                  <Button variant="ghost" size="sm" onClick={clearContentSelection}>
                    Cancel
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">PDF up to 15MB.</p>

              {shouldShowPreview ? (
                <div className="rounded-lg border bg-muted/30 p-2">
                  <iframe
                    title="PDF preview"
                    className="h-80 w-full rounded-md"
                    src={contentPreviewUrl || contentLinkValue}
                  />
                </div>
              ) : (
                <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                  PDF preview will appear when a valid link is available.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Review checklist</CardTitle>
              <CardDescription>Make sure the lesson is ready.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>CEFR level assigned</span>
                <Badge variant="outline">{watchedLevel}</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span>Summary provided</span>
                <Badge variant={watchedSummary ? "outline" : "secondary"}>
                  {watchedSummary ? "Complete" : "Pending"}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span>Quiz ready</span>
                <Badge variant="outline">0 questions</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span>Publishing status</span>
                <Badge variant="outline">
                  {isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/questions">Add quiz questions</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      {isSubmitting && (
        <div className="mt-4 text-sm text-muted-foreground">
          Saving lesson...
        </div>
      )}
    </AdminLayout>
  )
}
