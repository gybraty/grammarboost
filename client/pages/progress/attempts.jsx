import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import useSWR from "swr"
import { LearnerLayout } from "@/components/learner-layout"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useAuth } from "@/hooks/use-auth"
import {
  Lock,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"
import { api } from "@/lib/api"
import { getLevelColor } from "@/lib/level-colors"

const fetcher = (url) => api.get(url).then((res) => res.data.data)

export default function AttemptsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { data: attempts, isLoading } = useSWR(
    user ? "/api/progress/attempts" : null,
    fetcher
  )

  // Auth guard
  if (!authLoading && !user) {
    return (
      <LearnerLayout>
        <div className="px-6 max-w-2xl mx-auto">
          <div className="glass-card rounded-2xl p-12 text-center flex flex-col items-center gap-4 mt-12">
            <Lock className="h-12 w-12 text-muted-foreground" />
            <h2 className="font-heading text-2xl font-semibold text-foreground">Login Required</h2>
            <p className="text-on-surface-variant">You need to be logged in to view your attempts.</p>
            <Button asChild className="bg-accent hover:bg-accent/90 text-white font-heading">
              <Link href="/auth/login">Log In</Link>
            </Button>
          </div>
        </div>
      </LearnerLayout>
    )
  }

  if (isLoading || authLoading) {
    return (
      <LearnerLayout>
        <div className="px-6 max-w-[1280px] mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-10 w-80 mb-2" />
          <Skeleton className="h-5 w-96 mb-8" />
          <div className="flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>
      </LearnerLayout>
    )
  }

  return (
    <>
      <Head>
        <title>All Quiz Attempts | GrammarBoost</title>
        <meta name="description" content="Review all your quiz attempts with detailed answer breakdowns." />
      </Head>
      <LearnerLayout>
        <div className="px-6 max-w-[1280px] mx-auto">
          {/* Back link */}
          <Button asChild variant="ghost" className="mb-4 -ml-2 font-heading text-sm text-muted-foreground hover:text-foreground">
            <Link href="/progress">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Progress
            </Link>
          </Button>

          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-1">
            All Quiz Attempts
          </h1>
          <p className="text-on-surface-variant mb-8">
            Click on an attempt to review your answers in detail
          </p>

          {attempts && attempts.length > 0 ? (
            <Accordion type="single" collapsible className="flex flex-col gap-3">
              {attempts.map((attempt, i) => {
                const level = attempt.lesson?.level || "—"
                const colors = getLevelColor(level)
                const slug = attempt.lesson?.slug
                const pct = attempt.percentage ?? 0
                const scoreColor = pct >= 70
                  ? "text-accent"
                  : pct >= 50
                  ? "text-yellow-500"
                  : "text-destructive"

                return (
                  <AccordionItem key={attempt._id || i} value={`attempt-${i}`} className="border-0">
                    <div className="glass-card rounded-xl overflow-hidden">
                      <AccordionTrigger className="px-5 py-4 hover:no-underline">
                        <div className="flex items-center gap-4 w-full">
                          {/* Score Circle */}
                          <div className="relative w-12 h-12 shrink-0">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
                              <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted" />
                              <circle
                                cx="20" cy="20" r="16" fill="none" strokeWidth="3"
                                strokeDasharray={`${2 * Math.PI * 16}`}
                                strokeDashoffset={`${2 * Math.PI * 16 * (1 - pct / 100)}`}
                                strokeLinecap="round"
                                className={scoreColor}
                                stroke="currentColor"
                              />
                            </svg>
                            <span className={`absolute inset-0 flex items-center justify-center font-heading text-xs font-bold ${scoreColor}`}>
                              {pct}%
                            </span>
                          </div>

                          {/* Attempt Info */}
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-heading text-sm font-semibold text-foreground">
                                {attempt.lesson?.title || "Unknown Lesson"}
                              </span>
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-heading font-medium ${colors.bg} ${colors.text}`}>
                                {level}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <span className="text-xs text-muted-foreground">
                                {attempt.score}/{attempt.maxScore} correct
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {attempt.createdAt
                                  ? new Date(attempt.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
                                  : "—"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="px-5 pb-4">
                        {/* Per-question review */}
                        <div className="flex flex-col gap-2 mt-2">
                          {attempt.answers?.map((ans, j) => {
                            const questionPrompt = ans.question?.prompt || `Question ${j + 1}`
                            const correctAnswer = ans.question?.correctAnswers?.[0]
                            return (
                              <div
                                key={j}
                                className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${
                                  ans.isCorrect
                                    ? "bg-accent/5 border-l-accent"
                                    : "bg-destructive/5 border-l-destructive"
                                }`}
                              >
                                {ans.isCorrect ? (
                                  <CheckCircle className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                                )}
                                <div className="flex-1 text-sm">
                                  <p className="font-heading font-medium text-foreground">{questionPrompt}</p>
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                    <span className="text-muted-foreground">
                                      Your answer: <span className={ans.isCorrect ? "text-accent font-medium" : "text-destructive font-medium"}>{ans.userAnswer}</span>
                                    </span>
                                    {!ans.isCorrect && correctAnswer && (
                                      <span className="text-muted-foreground">
                                        Correct: <span className="text-accent font-medium">{correctAnswer}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Retake link */}
                        {slug && (
                          <div className="mt-4 flex justify-end">
                            <Button asChild variant="outline" size="sm" className="font-heading text-xs">
                              <Link href={`/lessons/${slug}/quiz`}>Retake Quiz</Link>
                            </Button>
                          </div>
                        )}
                      </AccordionContent>
                    </div>
                  </AccordionItem>
                )
              })}
            </Accordion>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center">
              <p className="text-on-surface-variant">No quiz attempts yet. Take a quiz to see detailed results here!</p>
              <Button asChild className="mt-4 bg-accent hover:bg-accent/90 text-white font-heading">
                <Link href="/lessons">Browse Lessons</Link>
              </Button>
            </div>
          )}
        </div>
      </LearnerLayout>
    </>
  )
}
