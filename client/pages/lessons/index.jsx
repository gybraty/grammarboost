import { useState, useMemo } from "react"
import Head from "next/head"
import Link from "next/link"
import useSWR from "swr"
import { LearnerLayout } from "@/components/learner-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, BookOpen, ArrowRight } from "lucide-react"
import { api } from "@/lib/api"
import { buildQueryString } from "@/lib/query"
import { LEVELS, LEVEL_LABELS, getLevelColor } from "@/lib/level-colors"

const fetcher = (url) => api.get(url).then((res) => res.data.data)

export default function LessonsPage() {
  const [level, setLevel] = useState("")
  const [search, setSearch] = useState("")
  const [selectedTag, setSelectedTag] = useState("")

  const queryString = buildQueryString({ level, search, tag: selectedTag })
  const { data: lessons, error, isLoading } = useSWR(`/api/lessons${queryString}`, fetcher)
  const { data: tags } = useSWR("/api/tags", fetcher)

  const levelButtons = ["All", ...LEVELS]

  return (
    <>
      <Head>
        <title>Grammar Lessons - GrammarBoost</title>
        <meta name="description" content="Browse interactive English grammar lessons across all proficiency levels, from A1 beginner to C2 advanced." />
      </Head>
      <LearnerLayout>
        <div className="px-6 max-w-[1280px] mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="font-heading text-[36px] font-bold leading-[1.2] text-foreground">
              Grammar Lessons
            </h1>
            <p className="text-base leading-relaxed text-on-surface-variant mt-2">
              Master English grammar structurally. Browse interactive lessons across all proficiency levels.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 glass-card rounded-2xl">
            {/* Level Filters */}
            <div className="flex flex-wrap gap-2">
              {levelButtons.map((lvl) => {
                const isActive = lvl === "All" ? level === "" : level === lvl
                return (
                  <button
                    key={lvl}
                    onClick={() => setLevel(lvl === "All" ? "" : lvl)}
                    className={`px-3 py-1.5 rounded-full font-heading text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "bg-surface-container text-on-surface-variant hover:bg-muted"
                    }`}
                  >
                    {lvl}
                  </button>
                )
              })}
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lessons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white/50 border-border"
              />
            </div>

            {/* Tag Filter */}
            {tags && tags.length > 0 && (
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-white/50 font-heading text-sm text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Tags</option>
                {tags.map((tag) => (
                  <option key={tag._id} value={tag.slug}>
                    {tag.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Lesson Cards Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-card rounded-2xl p-6 flex flex-col gap-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-10 w-full mt-auto" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <p className="text-destructive font-heading font-medium">Failed to load lessons</p>
              <p className="text-on-surface-variant text-sm mt-2">Please try again later.</p>
            </div>
          ) : lessons && lessons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson) => {
                const colors = getLevelColor(lesson.level)
                return (
                  <Link
                    key={lesson._id}
                    href={`/lessons/${lesson.slug}`}
                    className="group glass-card rounded-2xl p-6 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  >
                    {/* Level Badge */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-heading font-medium ${colors.bg} ${colors.text}`}>
                        {lesson.level} — {LEVEL_LABELS[lesson.level] || lesson.level}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-heading text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {lesson.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-sm leading-relaxed text-on-surface-variant line-clamp-3 flex-1">
                      {lesson.summary || "Explore this lesson to improve your grammar skills."}
                    </p>

                    {/* Tags */}
                    {lesson.tags && lesson.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {lesson.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag._id || tag} variant="outline" className="text-xs font-heading">
                            {tag.name || tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* CTA */}
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <span className="text-sm font-heading font-medium text-primary group-hover:gap-2 inline-flex items-center gap-1 transition-all">
                        Start Lesson <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground">No lessons found</h3>
              <p className="text-on-surface-variant text-sm">Try adjusting your filters or search terms.</p>
              <Button variant="outline" onClick={() => { setLevel(""); setSearch(""); setSelectedTag("") }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </LearnerLayout>
    </>
  )
}
