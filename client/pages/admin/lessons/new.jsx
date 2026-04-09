import { useMemo, useState } from "react"
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

const levelOptions = ["A1", "A2", "B1", "B2", "C1"]

export default function CreateLessonPage() {
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState(["articles", "sentence-structure"])
  const [level, setLevel] = useState("A2")
  const [published, setPublished] = useState(false)

  const filteredTags = useMemo(
    () => tags.filter((tag) => tag.includes(tagInput.toLowerCase())),
    [tags, tagInput]
  )

  const handleTagKeyDown = (event) => {
    if (event.key === "Enter" && tagInput.trim()) {
      event.preventDefault()
      const nextTag = tagInput.trim().toLowerCase().replace(/\s+/g, "-")
      if (!tags.includes(nextTag)) {
        setTags((prev) => [...prev, nextTag])
      }
      setTagInput("")
    }
  }

  return (
    <AdminLayout
      title="Create lesson"
      description="Draft new grammar materials and publish when ready."
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline">Save draft</Button>
          <Button>Publish lesson</Button>
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
                    <Input placeholder="Articles and determiners" />
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
                    <Input placeholder="articles-and-determiners" />
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
                      <Select value={level} onValueChange={setLevel}>
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
                      <div className="flex items-center gap-3 rounded-lg border px-3 py-2">
                        <Switch
                          checked={published}
                          onCheckedChange={setPublished}
                        />
                        <div>
                          <p className="text-sm font-medium">
                            {published ? "Published" : "Draft"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {published
                              ? "Visible in the learner catalog."
                              : "Only visible to admins."}
                          </p>
                        </div>
                      </div>
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
                      placeholder="Type a tag and press Enter"
                      value={tagInput}
                      onChange={(event) => setTagInput(event.target.value)}
                      onKeyDown={handleTagKeyDown}
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {filteredTags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
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
                  />
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
                  PNG or JPG up to 5MB.
                </p>
                <Button variant="outline" size="sm">
                  Choose file
                </Button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <span>cover-image.png</span>
                  <Button size="sm" variant="ghost">
                    Replace
                  </Button>
                </div>
                <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <span>examples-diagram.png</span>
                  <Button size="sm" variant="ghost">
                    Remove
                  </Button>
                </div>
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
                <Badge variant="outline">A2</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span>Examples included</span>
                <Badge variant="secondary">Pending</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span>Quiz ready</span>
                <Badge variant="outline">0 questions</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span>Media attached</span>
                <Badge variant="secondary">2 files</Badge>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/questions">Add quiz questions</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
