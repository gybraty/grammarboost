import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import useSWR from "swr"
import { LearnerLayout } from "@/components/learner-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useAuth } from "@/hooks/use-auth"
import { ArrowRight, FileText, Home, ClipboardCheck } from "lucide-react"
import { api } from "@/lib/api"
import { getLevelColor, LEVEL_LABELS } from "@/lib/level-colors"

const fetcher = (url) => api.get(url).then((res) => res.data.data)

export default function LessonDetailPage() {
  const router = useRouter()
  const { slug } = router.query
  const { user } = useAuth()

  const { data: lesson, error, isLoading } = useSWR(
    slug ? `/api/lessons/${slug}` : null,
    fetcher
  )

  if (isLoading) {
    return (
      <LearnerLayout>
        <div className="px-6 max-w-[1280px] mx-auto">
          <Skeleton className="h-6 w-64 mb-6" />
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-5 w-3/4 mb-8" />
          <Skeleton className="h-[600px] w-full rounded-2xl" />
        </div>
      </LearnerLayout>
    )
  }

  if (error || !lesson) {
    return (
      <LearnerLayout>
        <div className="px-6 max-w-[1280px] mx-auto">
          <div className="glass-card rounded-2xl p-12 text-center flex flex-col items-center gap-4">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <h2 className="font-heading text-2xl font-semibold text-foreground">Lesson not found</h2>
            <p className="text-on-surface-variant">The lesson you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link href="/lessons">Back to Lessons</Link>
            </Button>
          </div>
        </div>
      </LearnerLayout>
    )
  }

  const colors = getLevelColor(lesson.level)

  return (
    <>
      <Head>
        <title>{lesson.title} - GrammarBoost</title>
        <meta name="description" content={lesson.summary || `Learn ${lesson.title} with GrammarBoost`} />
      </Head>
      <LearnerLayout>
        <div className="px-6 max-w-[1280px] mx-auto">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/lessons">Lessons</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-heading font-medium">{lesson.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Lesson Header */}
          <div className="glass-card rounded-2xl p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-heading font-medium ${colors.bg} ${colors.text}`}>
                    {lesson.level} — {LEVEL_LABELS[lesson.level] || lesson.level}
                  </span>
                </div>
                <h1 className="font-heading text-[36px] font-bold leading-[1.2] text-foreground">
                  {lesson.title}
                </h1>
                {lesson.summary && (
                  <p className="text-base leading-relaxed text-on-surface-variant max-w-2xl">
                    {lesson.summary}
                  </p>
                )}
                {lesson.tags && lesson.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {lesson.tags.map((tag) => (
                      <Badge key={tag._id || tag} variant="outline" className="font-heading">
                        {tag.name || tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3 md:items-end">
                <Button
                  asChild
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-white font-heading text-sm rounded-lg shadow-lg shadow-accent/20 hover:-translate-y-0.5 transition-transform"
                >
                  <Link href={`/lessons/${slug}/quiz`}>
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Take Quiz
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Content Area — PDF Viewer */}
          {lesson.contentLink ? (
            <div className="glass-card rounded-2xl overflow-hidden mb-8">
              <iframe
                src={lesson.contentLink}
                title={`${lesson.title} content`}
                className="w-full border-0"
                style={{ minHeight: "700px" }}
              />
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center flex flex-col items-center gap-4 mb-8">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <h3 className="font-heading text-xl font-semibold text-foreground">No content uploaded yet</h3>
              <p className="text-on-surface-variant text-sm">The lesson material will appear here once uploaded by an administrator.</p>
            </div>
          )}

          {/* Quiz CTA Section */}
          <div className="glass-card rounded-2xl p-8 text-center flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-2">
              <ClipboardCheck className="h-7 w-7 text-accent" />
            </div>
            <h3 className="font-heading text-xl font-semibold text-foreground">
              Ready to test your knowledge?
            </h3>
            <p className="text-on-surface-variant text-sm max-w-md">
              Solidify your understanding with an interactive quiz covering the concepts from this lesson.
            </p>
            {user ? (
              <Button
                asChild
                size="lg"
                className="bg-accent hover:bg-accent/90 text-white font-heading text-sm rounded-lg shadow-lg shadow-accent/20 hover:-translate-y-0.5 transition-transform"
              >
                <Link href={`/lessons/${slug}/quiz`}>
                  Start Quiz <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="font-heading text-sm"
              >
                <Link href="/auth/login">Login to take the quiz</Link>
              </Button>
            )}
          </div>
        </div>
      </LearnerLayout>
    </>
  )
}
