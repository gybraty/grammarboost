import { useMemo, useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import useSWR from "swr"
import { LearnerLayout } from "@/components/learner-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/use-auth"
import {
  BookCheck,
  Target,
  Flame,
  GraduationCap,
  Lock,
  ArrowRight,
  CheckCircle,
  XCircle,
  ChevronDown,
  Clock,
} from "lucide-react"
import { api } from "@/lib/api"
import { getLevelColor, LEVEL_LABELS } from "@/lib/level-colors"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const fetcher = (url) => api.get(url).then((res) => res.data.data)

export default function ProgressPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { data: progress, isLoading } = useSWR(
    user ? "/api/progress" : null,
    fetcher
  )
  const { data: attempts, isLoading: attemptsLoading } = useSWR(
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
            <p className="text-on-surface-variant">You need to be logged in to view your progress.</p>
            <Button asChild className="bg-accent hover:bg-accent/90 text-white font-heading">
              <Link href="/auth/login">Log In</Link>
            </Button>
          </div>
        </div>
      </LearnerLayout>
    )
  }

  // Compute stats from LessonProgress data
  // API shape: { lastScore, bestScore, attemptsCount, status, lesson: { title, level, slug } }
  const stats = useMemo(() => {
    if (!progress) return null

    const items = Array.isArray(progress) ? progress : []
    const completedLessons = items.filter((p) => p.status === "completed").length
    const scores = items.map((p) => p.lastScore ?? 0)
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    const topScore = items.reduce((max, p) => Math.max(max, p.bestScore ?? 0), 0)
    const levels = [...new Set(items.map((p) => p.lesson?.level).filter(Boolean))]

    return { completedLessons, avgScore, bestScore: Math.round(topScore), levelsCount: levels.length, items }
  }, [progress])

  if (isLoading || authLoading) {
    return (
      <LearnerLayout>
        <div className="px-6 max-w-[1280px] mx-auto">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-5 w-96 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </LearnerLayout>
    )
  }

  const statCards = [
    {
      label: "Lessons Completed",
      value: stats?.completedLessons ?? 0,
      icon: BookCheck,
      color: "primary",
    },
    {
      label: "Average Score",
      value: `${stats?.avgScore ?? 0}%`,
      icon: Target,
      color: "accent",
    },
    {
      label: "Total Attempts",
      value: stats?.items?.reduce((sum, p) => sum + (p.attemptsCount ?? 0), 0) ?? 0,
      icon: Flame,
      color: "secondary",
    },
    {
      label: "Levels Covered",
      value: stats?.levelsCount ?? 0,
      icon: GraduationCap,
      color: "primary",
    },
  ]

  const colorMap = {
    primary: { bg: "bg-primary/10", text: "text-primary" },
    accent: { bg: "bg-accent/10", text: "text-accent" },
    secondary: { bg: "bg-secondary/10", text: "text-secondary" },
  }

  return (
    <>
      <Head>
        <title>Progress Dashboard - GrammarBoost</title>
        <meta name="description" content="Track your grammar learning progress across all lessons and quizzes." />
      </Head>
      <LearnerLayout>
        <div className="px-6 max-w-[1280px] mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="font-heading text-[36px] font-bold leading-[1.2] text-foreground">
              Progress Dashboard
            </h1>
            <p className="text-base leading-relaxed text-on-surface-variant mt-2">
              Track your linguistic journey and celebrate your milestones.
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat) => {
              const Icon = stat.icon
              const colors = colorMap[stat.color]
              return (
                <div key={stat.label} className="glass-card rounded-2xl p-6 flex flex-col gap-3 hover:-translate-y-0.5 transition-transform duration-300">
                  <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${colors.text}`} />
                  </div>
                  <span className="text-sm text-on-surface-variant font-heading">{stat.label}</span>
                  <span className="font-heading text-3xl font-bold text-foreground">{stat.value}</span>
                </div>
              )
            })}
          </div>

          {/* Score Progress Chart — one bar per quiz attempt */}
          <div className="glass-card rounded-2xl p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-heading text-xl font-semibold text-foreground">Score Progress</h3>
                <p className="text-sm text-on-surface-variant">Your quiz performance over time</p>
              </div>
            </div>
            {!attemptsLoading && attempts && attempts.length > 0 ? (
              <>
                <div className="h-64 flex items-end gap-2 px-4">
                  {[...attempts].reverse().slice(-20).map((attempt, i) => {
                    const pct = Math.round(attempt.percentage ?? 0)
                    const scoreColor = pct >= 70
                      ? "from-accent to-accent/70"
                      : pct >= 50
                      ? "from-yellow-500 to-yellow-400"
                      : "from-destructive to-destructive/70"
                    return (
                      <div key={attempt._id || i} className="flex-1 flex flex-col items-center gap-2 group">
                        <span className="text-xs text-muted-foreground font-heading opacity-0 group-hover:opacity-100 transition-opacity">{pct}%</span>
                        <div
                          className={`w-full rounded-t-lg bg-gradient-to-t ${scoreColor} transition-all duration-500 hover:opacity-80`}
                          style={{ height: `${Math.max(pct * 2, 8)}px` }}
                          title={`${attempt.lesson?.title || "Quiz"} — ${pct}%`}
                        />
                        <span className="text-[10px] text-muted-foreground truncate max-w-full font-heading">
                          {attempt.lesson?.title?.slice(0, 6) || `#${i + 1}`}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 flex justify-center">
                  <Button asChild variant="outline" className="font-heading text-sm">
                    <Link href="/progress/attempts">
                      View All Attempts <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-on-surface-variant">
                No quiz data yet. Take some quizzes to see your progress!
              </div>
            )}
          </div>

          {/* Recent Lessons Table */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading text-xl font-semibold text-foreground">Recent Lessons</h3>
              <Button asChild variant="ghost" className="font-heading text-sm text-primary">
                <Link href="/lessons">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>

            {stats?.items && stats.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-heading font-medium text-muted-foreground">Lesson</th>
                      <th className="text-left py-3 px-4 font-heading font-medium text-muted-foreground">Level</th>
                      <th className="text-left py-3 px-4 font-heading font-medium text-muted-foreground">Best / Last</th>
                      <th className="text-left py-3 px-4 font-heading font-medium text-muted-foreground">Attempts</th>
                      <th className="text-left py-3 px-4 font-heading font-medium text-muted-foreground">Date</th>
                      <th className="text-right py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.items.slice(0, 10).map((attempt, i) => {
                      const pct = Math.round(attempt.lastScore ?? 0)
                      const best = Math.round(attempt.bestScore ?? 0)
                      const level = attempt.lesson?.level || "—"
                      const colors = getLevelColor(level)
                      const slug = attempt.lesson?.slug

                      return (
                        <tr key={i} className="border-b border-border/50 hover:bg-surface-container/50 transition-colors">
                          <td className="py-3 px-4 font-heading font-medium text-foreground">
                            {attempt.lesson?.title || "Unknown Lesson"}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-heading font-medium ${colors.bg} ${colors.text}`}>
                              {level}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-heading font-semibold ${
                              best >= 70 ? "text-accent" : best >= 50 ? "text-yellow-500" : "text-destructive"
                            }`}>
                              {best}%
                            </span>
                            <span className="text-muted-foreground text-xs ml-1">/ {pct}%</span>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground font-heading">
                            {attempt.attemptsCount ?? 0}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {attempt.lastAttemptAt ? new Date(attempt.lastAttemptAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {slug && (
                              <Button asChild variant="ghost" size="sm" className="font-heading text-xs text-primary">
                                <Link href={`/lessons/${slug}`}>View</Link>
                              </Button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-on-surface-variant">
                <p>No progress data yet. Start taking quizzes to track your progress!</p>
                <Button asChild className="mt-4 bg-accent hover:bg-accent/90 text-white font-heading">
                  <Link href="/lessons">Browse Lessons</Link>
                </Button>
              </div>
            )}
          </div>

        </div>
      </LearnerLayout>
    </>
  )
}
