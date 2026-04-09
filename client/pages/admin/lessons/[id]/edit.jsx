import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/router"
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

export default function EditLessonPage() {
  const router = useRouter()
  const [published, setPublished] = useState(true)
  const [level, setLevel] = useState("B1")
  const [tags] = useState(["past-simple", "present-perfect", "verbs"])

  return (
    <AdminLayout
      title="Edit lesson"
      description="Update content, media, and publishing status."
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline">Save changes</Button>
          <Button>Publish update</Button>
        </div>
      }>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Lesson overview</CardTitle>
              <CardDescription>
                Lesson ID: {router.query.id || "loading..."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>
                    <FieldTitle>Lesson title</FieldTitle>
                    <FieldDescription>Visible to learners.</FieldDescription>
                  </FieldLabel>
                  <FieldContent>
                    <Input defaultValue="Present Perfect vs Past Simple" />
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
                        Toggle visibility for learners.
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
                              ? "Learners can access this lesson."
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
                      Shown on the lesson list view.
                    </FieldDescription>
                  </FieldLabel>
                  <FieldContent>
                    <Textarea
                      rows={4}
                      defaultValue="Learn when to use present perfect versus past simple, with clear rules and examples."
                    />
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
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="mt-3">
                      Manage tags
                    </Button>
                  </FieldContent>
                </Field>
              </FieldGroup>
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
                    defaultValue={`## Present Perfect vs Past Simple\n\nUse present perfect for experiences and unfinished time periods.\n\n### Examples\n- I have visited London.\n- She has already finished.`}
                  />
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
                <Button variant="outline" size="sm">
                  Choose file
                </Button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <span>lesson-cover.png</span>
                  <Button size="sm" variant="ghost">
                    Replace
                  </Button>
                </div>
                <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <span>timeline-diagram.png</span>
                  <Button size="sm" variant="ghost">
                    Remove
                  </Button>
                </div>
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
                <Badge variant="outline">5</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span>Completion rate</span>
                <Badge variant="secondary">64%</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span>Last updated</span>
                <Badge variant="outline">2 hours ago</Badge>
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
