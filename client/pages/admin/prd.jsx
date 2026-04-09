import { AdminLayout } from "@/components/admin/admin-layout"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const milestones = [
  {
    title: "Content pipeline ready",
    status: "In progress",
    detail: "Finalize lesson templates and authoring workflows.",
  },
  {
    title: "Quiz engine stabilized",
    status: "Needs review",
    detail: "Validate answer checking, scoring, and explanations.",
  },
  {
    title: "Admin QA checklist",
    status: "Pending",
    detail: "Define rubric for lesson quality and tagging standards.",
  },
]

const requirements = [
  "Lessons grouped by CEFR level with markdown content.",
  "Tags managed centrally and reused across lessons.",
  "Quizzes deliver immediate feedback and explanations.",
  "Admin-only management of lessons, questions, and tags.",
]

export default function AdminPrdPage() {
  return (
    <AdminLayout
      title="Admin PRD"
      description="High-level requirements and milestones for GrammarBoost."
    >
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Product requirements</CardTitle>
            <CardDescription>
              Summary of the learning platform scope.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <ul className="space-y-3">
              {requirements.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 size-1.5 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Separator />
            <div className="rounded-lg border bg-muted/30 p-4 text-sm">
              <p className="font-medium">Admin focus</p>
              <p className="mt-2 text-muted-foreground">
                Ensure authoring tools stay consistent across lessons, tags, and
                quizzes. Prioritize clarity, validation, and content reuse.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Milestones</CardTitle>
            <CardDescription>Operational checkpoints.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {milestones.map((milestone) => (
              <div key={milestone.title} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{milestone.title}</span>
                  <Badge
                    variant={
                      milestone.status === "In progress"
                        ? "default"
                        : milestone.status === "Needs review"
                        ? "outline"
                        : "secondary"
                    }
                  >
                    {milestone.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{milestone.detail}</p>
                <Separator />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
