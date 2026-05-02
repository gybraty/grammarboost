import { useEffect, useMemo, useState } from "react"
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
import { api, getApiErrorMessage } from "@/lib/api"
import { toast } from "sonner"
import { Pencil, Sparkles, Trash } from "lucide-react"

const fetcher = (url) => api.get(url).then((res) => res.data.data)

const questionTypeOptions = [
  { label: "Multiple Choice", value: "multiple-choice" },
  { label: "Fill in the Blank", value: "fill-in-the-blank" },
  { label: "Short Answer", value: "short-answer" },
]

const questionTypeSelectOptions = questionTypeOptions.map((type) => {
  if (type.value === "short-answer") {
    return {
      ...type,
      disabled: true,
      helper: "Coming soon",
      icon: Sparkles,
    }
  }
  return type
})

const difficultyFilterOptions = [
  { label: "All levels", value: "all" },
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
]

const difficultyCreateOptions = [
  { label: "Easy", value: "1" },
  { label: "Medium", value: "3" },
  { label: "Hard", value: "5" },
]

const splitLines = (value) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

const getDifficultyLabel = (value = 1) => {
  if (value <= 2) return "easy"
  if (value <= 4) return "medium"
  return "hard"
}

const formatDifficulty = (value) => {
  const label = getDifficultyLabel(value)
  return label.charAt(0).toUpperCase() + label.slice(1)
}

const getLessonId = (question) => {
  if (!question?.lesson) return null
  if (typeof question.lesson === "string") return question.lesson
  return question.lesson._id
}

const defaultFormValues = {
  lessonId: "",
  type: "multiple-choice",
  prompt: "",
  choices: "",
  correctAnswers: "",
  explanation: "",
  difficulty: "1",
}

export default function QuestionsManagementPage() {
  const [lessonFilter, setLessonFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [query, setQuery] = useState("")
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")

  const {
    data: lessons = [],
    error: lessonsError,
    isLoading: lessonsLoading,
  } = useSWR("/api/lessons?includeUnpublished=true", fetcher)

  const lessonIds = useMemo(
    () => lessons.map((lesson) => lesson._id).join(","),
    [lessons]
  )

  const questionsKey = lessons.length
    ? ["questions", lessonFilter, lessonIds]
    : null

  const fetchQuestions = async ([, filter, ids]) => {
    const targetIds = ids.split(",").filter(Boolean)
    if (!targetIds.length) return []

    if (filter !== "all") {
      const response = await api.get(`/api/lessons/${filter}/questions`)
      return response.data.data
    }

    const responses = await Promise.all(
      targetIds.map((lessonId) => api.get(`/api/lessons/${lessonId}/questions`))
    )

    return responses.flatMap((response) => response.data.data)
  }

  const {
    data: questions = [],
    error: questionsError,
    isLoading: questionsLoading,
    mutate: mutateQuestions,
  } = useSWR(questionsKey, fetchQuestions)

  const lessonsById = useMemo(() => {
    return lessons.reduce((acc, lesson) => {
      acc[lesson._id] = lesson
      return acc
    }, {})
  }, [lessons])

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: defaultFormValues,
  })

  useEffect(() => {
    if (lessons.length && !editingQuestion) {
      const currentLessonId = getValues("lessonId")
      if (!currentLessonId) {
        setValue("lessonId", lessons[0]._id)
      }
    }
  }, [lessons, editingQuestion, getValues, setValue])

  useEffect(() => {
    if (!editingQuestion) return

    reset({
      lessonId: getLessonId(editingQuestion) || "",
      type: editingQuestion.type || "multiple-choice",
      prompt: editingQuestion.prompt || "",
      choices: editingQuestion.choices?.join("\n") || "",
      correctAnswers: editingQuestion.correctAnswers?.join("\n") || "",
      explanation: editingQuestion.explanation || "",
      difficulty: String(editingQuestion.difficulty || 1),
    })
  }, [editingQuestion, reset])

  useEffect(() => {
    if (activeTab === "fill-in-blank" && !editingQuestion) {
      setValue("type", "fill-in-the-blank")
    }
  }, [activeTab, editingQuestion, setValue])

  const resetForm = () => {
    reset(defaultFormValues)
    setEditingQuestion(null)
    if (lessons.length) {
      setValue("lessonId", lessons[0]._id)
    }
  }

  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      const lessonId = getLessonId(question)
      const matchesLesson = lessonFilter === "all" || lessonId === lessonFilter
      const matchesType = typeFilter === "all" || question.type === typeFilter
      const matchesDifficulty =
        difficultyFilter === "all" ||
        getDifficultyLabel(question.difficulty) === difficultyFilter
      const matchesQuery = (question.prompt || "")
        .toLowerCase()
        .includes(query.toLowerCase())
      return matchesLesson && matchesType && matchesDifficulty && matchesQuery
    })
  }, [questions, lessonFilter, typeFilter, difficultyFilter, query])

  const onSubmit = async (values) => {
    const payload = {
      type: values.type,
      prompt: values.prompt,
      explanation: values.explanation,
      difficulty: Number(values.difficulty),
      correctAnswers: splitLines(values.correctAnswers),
    }

    if (values.type === "multiple-choice") {
      payload.choices = splitLines(values.choices || "")
    }

    try {
      if (editingQuestion) {
        await api.put(`/api/questions/${editingQuestion._id}`, payload)
        toast.success("Question updated")
      } else {
        await api.post(`/api/lessons/${values.lessonId}/questions`, payload)
        toast.success("Question created")
      }
      await mutateQuestions()
      resetForm()
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    }
  }

  const handleEdit = (question) => {
    setEditingQuestion(question)
    setActiveTab("overview")
  }

  const handleDelete = async (question) => {
    if (!window.confirm("Delete this question?")) return
    try {
      await api.delete(`/api/questions/${question._id}`)
      toast.success("Question deleted")
      if (editingQuestion?._id === question._id) {
        resetForm()
      }
      mutateQuestions()
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    }
  }

  const selectedType = useWatch({ control, name: "type" })
  const previewPrompt =
    useWatch({ control, name: "prompt" }) ||
    "She ___ to the office every morning."
  const previewCorrect =
    splitLines(useWatch({ control, name: "correctAnswers" }) || "")[0] || "goes"

  return (
    <AdminLayout
      title="Questions"
      description="Build the question bank for each lesson."
      actions={
        <Button
          onClick={() => {
            resetForm()
            setActiveTab("overview")
          }}>
          New question
        </Button>
      }>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fill-in-blank">Fill in the Blank</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          {activeTab === "overview" && (
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
                  <Select
                    value={lessonFilter}
                    onValueChange={setLessonFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All lessons" />
                    </SelectTrigger>
                    <SelectContent position="popper" align="start">
                      <SelectItem value="all">All lessons</SelectItem>
                      {lessons.map((lesson) => (
                        <SelectItem key={lesson._id} value={lesson._id}>
                          {lesson.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent position="popper" align="start">
                      <SelectItem value="all">All types</SelectItem>
                      {questionTypeOptions.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
                    <SelectContent position="popper" align="start">
                      {difficultyFilterOptions.map((difficulty) => (
                        <SelectItem
                          key={difficulty.value}
                          value={difficulty.value}>
                          {difficulty.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    className="bg-background"
                    placeholder="Search prompt..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
                <Separator />
                {lessonsError || questionsError ? (
                  <div className="rounded-lg border border-dashed p-6 text-sm text-destructive">
                    {getApiErrorMessage(lessonsError || questionsError)}
                  </div>
                ) : lessonsLoading || questionsLoading ? (
                  <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                    Loading questions...
                  </div>
                ) : (
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
                      {filteredQuestions.map((question) => {
                        const lessonId = getLessonId(question)
                        const lessonTitle =
                          lessonsById[lessonId]?.title || "—"
                        const typeLabel =
                          questionTypeOptions.find(
                            (type) => type.value === question.type
                          )?.label || question.type
                        return (
                          <TableRow key={question._id}>
                            <TableCell className="font-medium">
                              {question.prompt}
                            </TableCell>
                            <TableCell>{lessonTitle}</TableCell>
                            <TableCell>{typeLabel}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {formatDifficulty(question.difficulty)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {question.updatedAt
                                ? new Date(question.updatedAt).toLocaleDateString()
                                : "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(question)}>
                                  <Pencil className="size-4" />
                                  <span className="sr-only">Edit question</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(question)}>
                                  <Trash className="size-4" />
                                  <span className="sr-only">Delete question</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                      {filteredQuestions.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center text-sm text-muted-foreground">
                            No questions found.
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
                <CardTitle>
                  {editingQuestion ? "Edit question" : "New question"}
                </CardTitle>
                <CardDescription>Add a question to a lesson.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Lesson</label>
                  <Controller
                    control={control}
                    name="lessonId"
                    rules={{ required: "Lesson is required" }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!!editingQuestion}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lesson" />
                        </SelectTrigger>
                        <SelectContent position="popper" align="start">
                          {lessons.map((lesson) => (
                            <SelectItem key={lesson._id} value={lesson._id}>
                              {lesson.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.lessonId && (
                    <p className="text-xs text-destructive">
                      {errors.lessonId.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Question type</label>
                  <Controller
                    control={control}
                    name="type"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent position="popper" align="start">
                          {questionTypeSelectOptions.map((type) => {
                            const Icon = type.icon
                            return (
                              <SelectItem
                                key={type.value}
                                value={type.value}
                                disabled={type.disabled}>
                                <span className="flex items-center gap-2">
                                  {Icon && (
                                    <Icon className="size-4 text-muted-foreground" />
                                  )}
                                  <span>{type.label}</span>
                                  {type.helper && (
                                    <span className="text-xs text-muted-foreground">
                                      {type.helper}
                                    </span>
                                  )}
                                </span>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prompt</label>
                  <Textarea
                    rows={3}
                    placeholder="Write the question prompt..."
                    {...register("prompt", { required: "Prompt is required" })}
                  />
                  {errors.prompt && (
                    <p className="text-xs text-destructive">
                      {errors.prompt.message}
                    </p>
                  )}
                </div>
                {selectedType === "multiple-choice" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Answer options</label>
                    <Textarea
                      rows={3}
                      placeholder="Option A\nOption B\nOption C"
                      {...register("choices")}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Correct answer(s)
                  </label>
                  <Textarea
                    rows={2}
                    placeholder="Option A"
                    {...register("correctAnswers", {
                      required: "At least one correct answer is required",
                    })}
                  />
                  {errors.correctAnswers && (
                    <p className="text-xs text-destructive">
                      {errors.correctAnswers.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Explanation</label>
                  <Textarea
                    rows={3}
                    placeholder="Explain why this is correct..."
                    {...register("explanation", {
                      required: "Explanation is required",
                    })}
                  />
                  {errors.explanation && (
                    <p className="text-xs text-destructive">
                      {errors.explanation.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty</label>
                  <Controller
                    control={control}
                    name="difficulty"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent position="popper" align="start">
                          {difficultyCreateOptions.map((difficulty) => (
                            <SelectItem
                              key={difficulty.value}
                              value={difficulty.value}>
                              {difficulty.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={resetForm}>
                    {editingQuestion ? "Cancel edit" : "Clear form"}
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={isSubmitting}
                    onClick={handleSubmit(onSubmit)}>
                    {isSubmitting ? "Saving..." : "Save question"}
                  </Button>
                </div>
              </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="fill-in-blank">
          {activeTab === "fill-in-blank" && (
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
                  <Controller
                    control={control}
                    name="lessonId"
                    rules={{ required: "Lesson is required" }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!!editingQuestion}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lesson" />
                        </SelectTrigger>
                        <SelectContent position="popper" align="start">
                          {lessons.map((lesson) => (
                            <SelectItem key={lesson._id} value={lesson._id}>
                              {lesson.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.lessonId && (
                    <p className="text-xs text-destructive">
                      {errors.lessonId.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Sentence template
                  </label>
                  <Textarea
                    rows={4}
                    placeholder="She ___ to the office every morning."
                    {...register("prompt", { required: "Prompt is required" })}
                  />
                  {errors.prompt && (
                    <p className="text-xs text-destructive">
                      {errors.prompt.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Correct answer
                    </label>
                    <Input
                      placeholder="goes"
                      {...register("correctAnswers", {
                        required: "At least one correct answer is required",
                      })}
                    />
                    {errors.correctAnswers && (
                      <p className="text-xs text-destructive">
                        {errors.correctAnswers.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Difficulty</label>
                    <Controller
                      control={control}
                      name="difficulty"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent position="popper" align="start">
                            {difficultyCreateOptions.map((difficulty) => (
                              <SelectItem
                                key={difficulty.value}
                                value={difficulty.value}>
                                {difficulty.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Explanation</label>
                  <Textarea
                    rows={3}
                    placeholder="Explain the grammar rule."
                    {...register("explanation", {
                      required: "Explanation is required",
                    })}
                  />
                  {errors.explanation && (
                    <p className="text-xs text-destructive">
                      {errors.explanation.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={resetForm}>
                    {editingQuestion ? "Cancel edit" : "Clear form"}
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={isSubmitting}
                    onClick={handleSubmit(onSubmit)}>
                    {isSubmitting ? "Saving..." : "Save fill-in-blank"}
                  </Button>
                </div>
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
                    {previewPrompt}
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <span>Correct answer</span>
                    <Badge variant="outline">{previewCorrect}</Badge>
                  </div>
                </div>
              </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AdminLayout>
  )
}
