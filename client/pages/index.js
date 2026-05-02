import Link from "next/link"
import Head from "next/head"
import { LearnerLayout } from "@/components/learner-layout"
import { Button } from "@/components/ui/button"
import { BookOpen, CheckCircle, TrendingUp, Search, Zap } from "lucide-react"

const features = [
  {
    icon: BookOpen,
    title: "Structured Lessons",
    description: "Follow a carefully curated path from basic tenses to advanced syntax, ensuring foundational knowledge is solid.",
    color: "primary",
  },
  {
    icon: CheckCircle,
    title: "Interactive Quizzes",
    description: "Test your understanding immediately with interactive exercises that provide instant, constructive feedback.",
    color: "accent",
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    description: "Visualize your linguistic journey with intuitive dashboards. Watch your proficiency climb as you complete modules.",
    color: "secondary",
  },
]

const steps = [
  {
    number: 1,
    title: "Pick a Topic",
    description: "Browse our library of grammar topics, from simple present to complex conditionals.",
    accent: "primary",
  },
  {
    number: 2,
    title: "Learn the Rules",
    description: "Read clear, concise explanations supported by real-world examples in an uncluttered interface.",
    accent: "primary",
  },
  {
    number: 3,
    title: "Practice & Master",
    description: "Engage with quizzes. Only move forward when you've achieved a mastery score.",
    accent: "accent",
  },
]

export default function HomePage() {
  return (
    <>
      <Head>
        <title>GrammarBoost - Master English Grammar</title>
        <meta
          name="description"
          content="Structured English grammar lessons from A1 to C2 with interactive quizzes and progress tracking. Master grammar one lesson at a time."
        />
      </Head>
      <LearnerLayout>
        <div className="px-6 max-w-[1280px] mx-auto flex flex-col gap-32">
          {/* Hero Section */}
          <section className="flex flex-col lg:flex-row items-center justify-between gap-12 mt-8">
            <div className="flex-1 flex flex-col items-start gap-6 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-heading text-xs font-medium">
                <Zap className="h-4 w-4" />
                New Interactive Quizzes Available
              </div>
              <h1 className="font-heading text-4xl lg:text-[36px] font-bold leading-[1.2] text-foreground">
                Master English Grammar, One Lesson at a Time
              </h1>
              <p className="text-base leading-relaxed text-on-surface-variant max-w-xl">
                Elevate your linguistics with structured learning, immediate feedback, and interactive exercises designed for real-world fluency.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
                <Button
                  asChild
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-white font-heading text-sm rounded-lg hover:-translate-y-0.5 transition-transform shadow-xl shadow-accent/20"
                >
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="glass-card font-heading text-sm text-primary hover:bg-surface-dim rounded-lg hover:-translate-y-0.5 transition-all"
                >
                  <Link href="/lessons">
                    <Search className="mr-2 h-4 w-4" />
                    Browse Lessons
                  </Link>
                </Button>
              </div>
            </div>

            {/* Hero Graphic */}
            <div className="flex-1 relative w-full aspect-square max-w-lg lg:max-w-none">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-3xl blur-3xl -z-10" />
              <div className="w-full h-full glass-card rounded-3xl p-6 shadow-2xl shadow-primary/10 flex flex-col gap-4 relative overflow-hidden">
                <div className="w-full h-48 bg-gradient-to-br from-primary-container to-secondary rounded-xl flex items-center justify-center">
                  <div className="text-white/80 font-heading text-xl font-semibold">📚 Grammar Lesson</div>
                </div>
                <div className="flex-1 flex flex-col gap-3">
                  <div className="h-4 bg-surface-dim rounded w-3/4" />
                  <div className="h-4 bg-surface-dim rounded w-1/2" />
                  <div className="mt-auto flex justify-between items-center">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-accent" />
                    </div>
                    <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-accent w-2/3 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="flex flex-col gap-12">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="font-heading text-[28px] font-semibold leading-[1.3] text-foreground mb-4">
                Why Choose GrammarBoost?
              </h2>
              <p className="text-base leading-relaxed text-on-surface-variant">
                Our platform is designed with pedagogical best practices wrapped in a modern, distraction-free interface.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon
                const colorMap = {
                  primary: { bg: "bg-primary/10", text: "text-primary", shadow: "shadow-primary/5" },
                  accent: { bg: "bg-accent/10", text: "text-accent", shadow: "shadow-accent/5" },
                  secondary: { bg: "bg-secondary/10", text: "text-secondary", shadow: "shadow-primary/5" },
                }
                const colors = colorMap[feature.color]
                return (
                  <div
                    key={feature.title}
                    className={`glass-card rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300 shadow-lg ${colors.shadow} flex flex-col gap-4`}
                  >
                    <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center ${colors.text} mb-2`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="font-heading text-xl font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-on-surface-variant">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </section>

          {/* How It Works */}
          <section className="flex flex-col gap-16 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface-container/50 to-transparent -z-10 rounded-3xl" />
            <div className="text-center max-w-2xl mx-auto pt-8">
              <h2 className="font-heading text-[28px] font-semibold leading-[1.3] text-foreground mb-4">
                How It Works
              </h2>
              <p className="text-base leading-relaxed text-on-surface-variant">
                A simple, effective flow designed to get you writing and speaking better English faster.
              </p>
            </div>
            <div className="relative flex flex-col md:flex-row gap-8 justify-between items-start pb-12">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/50 to-accent/20 z-0" />
              {steps.map((step) => (
                <div key={step.number} className="flex-1 flex flex-col items-center text-center gap-4 relative z-10 w-full">
                  <div
                    className={`w-16 h-16 rounded-full glass-card border-2 ${
                      step.accent === "accent" ? "border-accent text-accent shadow-accent/20" : "border-primary text-primary shadow-primary/20"
                    } bg-surface flex items-center justify-center font-heading text-xl font-semibold shadow-lg mb-2`}
                  >
                    {step.number}
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-on-surface-variant px-4">{step.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Banner */}
          <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary to-secondary p-12 text-center">
            <div className="relative z-10 flex flex-col items-center gap-6">
              <h2 className="font-heading text-[28px] font-semibold leading-[1.3] text-white">
                Ready to boost your grammar?
              </h2>
              <p className="text-white/80 max-w-md">
                Join thousands of learners improving their English grammar skills every day.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-heading text-sm rounded-lg shadow-xl hover:-translate-y-0.5 transition-transform"
              >
                <Link href="/auth/signup">Sign Up Free</Link>
              </Button>
            </div>
          </section>
        </div>
      </LearnerLayout>
    </>
  )
}
