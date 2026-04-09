import Link from "next/link"
import { useMemo, useState } from "react"
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

export default function CreateLessonPage() {
  const router = useRouter()
  const [tagQuery, setTagQuery] = useState("")

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
          content: values.content,
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
              <CardTitle>Lesson content</CardTitle>
              <CardDescription>
                Write explanations and examples in Markdown format.
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
                    placeholder="## Rule\nExplain the grammar rule...\n\n### Examples\n- ..."
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
                    Preview will render markdown content here.
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Lesson media</CardTitle>
              <CardDescription>
                Add a header image or visual aids for learners.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 px-6 py-8 text-center">
                <UploadCloud className="size-6 text-muted-foreground" />
                <div className="text-sm font-medium">Upload lesson media</div>
                <p className="text-xs text-muted-foreground">
                  Save the lesson before uploading media.
                </p>
                <Button variant="outline" size="sm" disabled>
                  Choose file
                </Button>
              </div>
            </CardContent>
          </Card>

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
