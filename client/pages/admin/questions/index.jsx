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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

const lessons = [
  "Articles and Determiners",
  "Present Simple Basics",
  "Passive Voice Essentials",
  "Conditionals Type 2",
]

const questions = [
  {
    id: "q1",
    lesson: "Present Simple Basics",
    type: "Multiple Choice",
    difficulty: "Easy",
    prompt: "She ___ to school every day.",
    updatedAt: "2026-04-08",
  },
  {
    id: "q2",
    lesson: "Articles and Determiners",
    type: "Fill in the Blank",
    difficulty: "Medium",
    prompt: "I saw ___ cat in the garden.",
    updatedAt: "2026-04-07",
  },
  {
    id: "q3",
    lesson: "Passive Voice Essentials",
    type: "Short Answer",
    difficulty: "Hard",
    prompt: "Rewrite the sentence in passive voice.",
    updatedAt: "2026-04-05",
  },
]

const typeOptions = ["All types", "Multiple Choice", "Fill in the Blank", "Short Answer"]
const difficultyOptions = ["All levels", "Easy", "Medium", "Hard"]

export default function QuestionsManagementPage() {
  const [lessonFilter, setLessonFilter] = useState("All lessons")
  const [typeFilter, setTypeFilter] = useState("All types")
  const [difficultyFilter, setDifficultyFilter] = useState("All levels")
  const [query, setQuery] = useState("")

  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      const matchesLesson =
        lessonFilter === "All lessons" || question.lesson === lessonFilter
      const matchesType =
        typeFilter === "All types" || question.type === typeFilter
      const matchesDifficulty =
        difficultyFilter === "All levels" || question.difficulty === difficultyFilter
      const matchesQuery = question.prompt
        .toLowerCase()
        .includes(query.toLowerCase())
      return matchesLesson && matchesType && matchesDifficulty && matchesQuery
    })
  }, [lessonFilter, typeFilter, difficultyFilter, query])

  return (
    <AdminLayout
      title="Questions"
      description="Build the question bank for each lesson."
      actions={<Button>Create question</Button>}>
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fill-in-blank">Fill in the Blank</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Question bank</CardTitle>
                <CardDescription>
                  Filter by lesson, type, and difficulty.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 lg:grid-cols-4">
                  <Select value={lessonFilter} onValueChange={setLessonFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All lessons" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All lessons">All lessons</SelectItem>
                      {lessons.map((lesson) => (
                        <SelectItem key={lesson} value={lesson}>
                          {lesson}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={difficultyFilter}
                    onValueChange={setDifficultyFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyOptions.map((difficulty) => (
                        <SelectItem key={difficulty} value={difficulty}>
                          {difficulty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Search prompt..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
                <Separator />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Prompt</TableHead>
                      <TableHead>Lesson</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuestions.map((question) => (
                      <TableRow key={question.id}>
                        <TableCell className="font-medium">
                          {question.prompt}
                        </TableCell>
                        <TableCell>{question.lesson}</TableCell>
                        <TableCell>{question.type}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{question.difficulty}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {question.updatedAt}
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
                <CardTitle>New question</CardTitle>
                <CardDescription>Add a question to a lesson.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Lesson</label>
                  <Select defaultValue={lessons[0]}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lesson" />
                    </SelectTrigger>
                    <SelectContent>
                      {lessons.map((lesson) => (
                        <SelectItem key={lesson} value={lesson}>
                          {lesson}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Question type</label>
                  <Select defaultValue="Multiple Choice">
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Multiple Choice">
                        Multiple Choice
                      </SelectItem>
                      <SelectItem value="Fill in the Blank">
                        Fill in the Blank
                      </SelectItem>
                      <SelectItem value="Short Answer">Short Answer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prompt</label>
                  <Textarea rows={3} placeholder="Write the question prompt..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Answer options</label>
                  <Textarea
                    rows={3}
                    placeholder="Option A\nOption B\nOption C"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Correct answer(s)
                  </label>
                  <Input placeholder="e.g. Option A" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Explanation</label>
                  <Textarea rows={3} placeholder="Explain why this is correct..." />
                </div>
                <Button className="w-full">Save question</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fill-in-blank">
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Fill in the blank builder</CardTitle>
                <CardDescription>
                  Create sentence-based questions with multiple blanks.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Lesson</label>
                  <Select defaultValue={lessons[1]}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lesson" />
                    </SelectTrigger>
                    <SelectContent>
                      {lessons.map((lesson) => (
                        <SelectItem key={lesson} value={lesson}>
                          {lesson}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Sentence template
                  </label>
                  <Textarea
                    rows={4}
                    placeholder="She ___ to the office every morning."
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Correct answer
                    </label>
                    <Input placeholder="goes" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Difficulty</label>
                    <Select defaultValue="Easy">
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        {difficultyOptions
                          .filter((item) => item !== "All levels")
                          .map((difficulty) => (
                            <SelectItem key={difficulty} value={difficulty}>
                              {difficulty}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Distractor options
                  </label>
                  <Textarea
                    rows={3}
                    placeholder="go\nwent\ngoing"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Explanation</label>
                  <Textarea rows={3} placeholder="Explain the grammar rule." />
                </div>
                <Button className="w-full">Save fill-in-blank</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  See how learners will see the question.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                  <p className="font-medium">Fill in the blank</p>
                  <p className="mt-2 text-muted-foreground">
                    She{" "}
                    <span className="rounded border border-dashed px-2 py-1">
                      ___
                    </span>{" "}
                    to the office every morning.
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <span>Correct answer</span>
                    <Badge variant="outline">goes</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <span>Distractors</span>
                    <Badge variant="secondary">go, went, going</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Add another blank
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  )
}
