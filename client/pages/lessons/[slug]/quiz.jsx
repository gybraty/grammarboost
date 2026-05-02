import { useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import useSWR from "swr"
import { LearnerLayout } from "@/components/learner-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useAuth } from "@/hooks/use-auth"
import {
  Home,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  RotateCcw,
  ArrowLeft,
  Loader2,
  Lock,
} from "lucide-react"
import { api, getApiErrorMessage } from "@/lib/api"
import { toast } from "sonner"

const fetcher = (url) => api.get(url).then((res) => res.data.data)

export default function QuizPage() {
  const router = useRouter()
  const { slug } = router.query
  const { user, isLoading: authLoading } = useAuth()

  const { data: lesson } = useSWR(slug ? `/api/lessons/${slug}` : null, fetcher)
  const { data: questions, error, isLoading } = useSWR(
    slug && user ? `/api/lessons/${lesson?._id}/quiz` : null,
    fetcher
  )

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Auth guard
  if (!authLoading && !user) {
    return (
      <LearnerLayout>
        <div className="px-6 max-w-2xl mx-auto">
          <div className="glass-card rounded-2xl p-12 text-center flex flex-col items-center gap-4 mt-12">
            <Lock className="h-12 w-12 text-muted-foreground" />
            <h2 className="font-heading text-2xl font-semibold text-foreground">Login Required</h2>
            <p className="text-on-surface-variant">You need to be logged in to take quizzes.</p>
            <Button asChild className="bg-accent hover:bg-accent/90 text-white font-heading">
              <Link href="/auth/login">Log In</Link>
            </Button>
          </div>
        </div>
      </LearnerLayout>
    )
  }

  // Loading state
  if (isLoading || authLoading) {
    return (
      <LearnerLayout>
        <div className="px-6 max-w-2xl mx-auto mt-8">
          <Skeleton className="h-6 w-48 mb-6" />
          <Skeleton className="h-3 w-full mb-8" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </LearnerLayout>
    )
  }

  if (error || !questions || questions.length === 0) {
    return (
      <LearnerLayout>
        <div className="px-6 max-w-2xl mx-auto mt-8">
          <div className="glass-card rounded-2xl p-12 text-center flex flex-col items-center gap-4">
            <h2 className="font-heading text-2xl font-semibold text-foreground">No Questions Available</h2>
            <p className="text-on-surface-variant">This lesson doesn't have quiz questions yet.</p>
            <Button asChild variant="outline">
              <Link href={`/lessons/${slug}`}>Back to Lesson</Link>
            </Button>
          </div>
        </div>
      </LearnerLayout>
    )
  }

  const currentQuestion = questions[currentIndex]
  const progressPercent = ((currentIndex + 1) / questions.length) * 100
  const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length
  const allAnswered = answeredCount === questions.length

  const handleSelectAnswer = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer,
        })),
      }
      const res = await api.post(`/api/lessons/${lesson?._id}/quiz`, payload)
      setResults(res.data.data)
      setSubmitted(true)
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetake = () => {
    setCurrentIndex(0)
    setAnswers({})
    setSubmitted(false)
    setResults(null)
  }

  const getScoreColor = (pct) => {
    if (pct >= 90) return "text-accent"
    if (pct >= 70) return "text-level-intermediate"
    if (pct >= 50) return "text-yellow-500"
    return "text-destructive"
  }

  const getScoreMessage = (pct) => {
    if (pct >= 90) return "Excellent! You've mastered this topic."
    if (pct >= 70) return "Great job! Keep going."
    if (pct >= 50) return "Good effort. Review the material and try again."
    return "Keep practicing! Review the lesson before retaking."
  }

  // ─── RESULTS VIEW ───
  if (submitted && results) {
    const score = results.score ?? results.correctCount ?? 0
    const maxScore = results.maxScore ?? results.totalQuestions ?? questions.length
    const percentage = Math.round((score / maxScore) * 100)

    return (
      <>
        <Head>
          <title>Quiz Results - {lesson?.title || "GrammarBoost"}</title>
        </Head>
        <LearnerLayout>
          <div className="px-6 max-w-3xl mx-auto">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild><Link href="/"><Home className="h-4 w-4" /></Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild><Link href="/lessons">Lessons</Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild><Link href={`/lessons/${slug}`}>{lesson?.title || slug}</Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage className="font-heading font-medium">Results</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Score Hero Card */}
            <div className="glass-card rounded-3xl p-10 text-center flex flex-col items-center gap-6 mb-8">
              {/* Circular Score */}
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
                  <circle
                    cx="60" cy="60" r="52" fill="none" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - percentage / 100)}`}
                    strokeLinecap="round"
                    className={`${getScoreColor(percentage)} transition-all duration-1000 ease-out`}
                    stroke="currentColor"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`font-heading text-3xl font-bold ${getScoreColor(percentage)}`}>{percentage}%</span>
                </div>
              </div>
              <h2 className="font-heading text-2xl font-bold text-foreground">
                You scored {score} out of {maxScore}
              </h2>
              <p className="text-on-surface-variant">{getScoreMessage(percentage)}</p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Button onClick={handleRetake} variant="outline" className="font-heading text-sm">
                  <RotateCcw className="mr-2 h-4 w-4" /> Retake Quiz
                </Button>
                <Button asChild className="bg-primary hover:bg-primary/90 text-white font-heading text-sm">
                  <Link href={`/lessons/${slug}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Lesson
                  </Link>
                </Button>
              </div>
            </div>

            {/* Question Review */}
            <div className="flex flex-col gap-4">
              <h3 className="font-heading text-xl font-semibold text-foreground">Review Your Answers</h3>
              <Accordion type="multiple" className="flex flex-col gap-3">
                {(results.results || results.breakdown || questions).map((item, i) => {
                  const matchingQuestion = questions.find((q) => String(q.id) === String(item.questionId))
                  const prompt = matchingQuestion?.prompt || item.prompt || `Question ${i + 1}`
                  const isCorrect = item.isCorrect
                  const userAnswer = item.userAnswer
                  const correctAnswer = item.correctAnswers?.[0] || item.correctAnswer

                  return (
                    <AccordionItem key={item.questionId || i} value={`q-${i}`} className="border-0">
                      <div className={`glass-card rounded-xl overflow-hidden border-l-4 ${isCorrect ? "border-l-accent" : "border-l-destructive"}`}>
                        <AccordionTrigger className="px-5 py-4 hover:no-underline">
                          <div className="flex items-center gap-3 text-left">
                            {isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-accent shrink-0" />
                            ) : (
                              <XCircle className="h-5 w-5 text-destructive shrink-0" />
                            )}
                            <span className="font-heading text-sm font-medium text-foreground">
                              {prompt}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-5 pb-4">
                          <div className="flex flex-col gap-2 text-sm">
                            <div className="flex gap-2">
                              <span className="text-muted-foreground font-medium">Your answer:</span>
                              <span className={isCorrect ? "text-accent" : "text-destructive"}>{userAnswer}</span>
                            </div>
                            {!isCorrect && correctAnswer && (
                              <div className="flex gap-2">
                                <span className="text-muted-foreground font-medium">Correct answer:</span>
                                <span className="text-accent">{correctAnswer}</span>
                              </div>
                            )}
                            {item.explanation && (
                              <p className="text-on-surface-variant mt-2 p-3 bg-muted/50 rounded-lg">{item.explanation}</p>
                            )}
                          </div>
                        </AccordionContent>
                      </div>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            </div>
          </div>
        </LearnerLayout>
      </>
    )
  }

  // ─── IN-PROGRESS VIEW ───
  return (
    <>
      <Head>
        <title>Quiz - {lesson?.title || "GrammarBoost"}</title>
      </Head>
      <LearnerLayout>
        <div className="px-6 max-w-2xl mx-auto">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link href="/"><Home className="h-4 w-4" /></Link></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link href="/lessons">Lessons</Link></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link href={`/lessons/${slug}`}>{lesson?.title || slug}</Link></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage className="font-heading font-medium">Quiz</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground font-heading">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-sm text-muted-foreground font-heading">
                {answeredCount} answered
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Question Card */}
          <div className="glass-card rounded-2xl p-8 mb-6">
            {currentQuestion.difficulty && (
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < currentQuestion.difficulty ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-2 font-heading">Difficulty</span>
              </div>
            )}

            <h2 className="font-heading text-xl font-semibold text-foreground mb-6">
              {currentQuestion.prompt}
            </h2>

            {/* Answer Choices */}
            <div className="flex flex-col gap-3">
              {currentQuestion.choices?.map((choice, i) => {
                const isSelected = answers[currentQuestion.id] === choice
                return (
                  <button
                    key={i}
                    onClick={() => handleSelectAnswer(currentQuestion.id, choice)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                        : "border-border bg-white/50 hover:border-primary/50 hover:bg-surface-container"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className={`text-sm ${isSelected ? "text-primary font-medium" : "text-on-surface"}`}>
                        {choice}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="outline"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="font-heading text-sm"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Previous
            </Button>

            {currentIndex === questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={!allAnswered || isSubmitting}
                className="bg-accent hover:bg-accent/90 text-white font-heading text-sm shadow-lg shadow-accent/20"
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                  "Submit Quiz"
                )}
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                disabled={!answers[currentQuestion.id]}
                className="font-heading text-sm"
              >
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Question Dots */}
          <div className="flex justify-center gap-2 flex-wrap">
            {questions.map((q, i) => (
              <button
                key={q.id || i}
                onClick={() => setCurrentIndex(i)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  i === currentIndex
                    ? "bg-primary ring-2 ring-primary/30 scale-125"
                    : answers[q.id]
                    ? "bg-accent"
                    : "bg-muted"
                }`}
                title={`Question ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </LearnerLayout>
    </>
  )
}
