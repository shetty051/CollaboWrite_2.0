import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  BookOpen,
  Star,
  Sparkles,
  HelpCircle,
  Award,
  PenTool,
  ExternalLink,
  ArrowRight,
  Heart,
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Accordion } from '../components/ui/Accordion'
import { Button } from '../components/ui/Button'
import { apiFetch } from '../api/apiClient'

// Visual Cover backgrounds mapped to indices
const COVER_GRADIENTS = [
  'from-amber-200/40 via-orange-100/30 to-red-200/40',
  'from-indigo-300/30 via-slate-200/20 to-violet-300/30',
  'from-emerald-200/30 via-stone-100/30 to-teal-200/40',
  'from-rose-300/30 via-orange-100/20 to-amber-300/35',
  'from-fuchsia-200/35 via-violet-100/25 to-pink-200/35',
  'from-cyan-200/30 via-sky-100/35 to-blue-200/35',
]

interface AuthorInfo {
  _id: string
  name: string
  email: string
  role: string
  avatarUrl?: string
}

interface StoryItem {
  _id: string
  title: string
  subtitle?: string
  author: AuthorInfo
  genres: string[]
  averageRating: number
  ratingCount: number
  viewCount: number
}

interface StoriesResponse {
  success: boolean
  data: StoryItem[]
}

export const Home = () => {
  const navigate = useNavigate()

  // Query first 6 published stories for Read section
  const { data: liveStoriesData, isLoading: isStoriesLoading } = useQuery<StoriesResponse>({
    queryKey: ['live-stories-limit-6'],
    queryFn: async () => {
      const res = await apiFetch('/api/stories?limit=6')
      if (!res.ok) throw new Error('Failed to load live stories')
      return res.json()
    },
  })

  const liveStories = liveStoriesData?.data || []

  // FAQ Accordion items
  const faqItems = [
    {
      title: 'What is CollaboWrite 2.0?',
      content: (
        <p>
          CollaboWrite 2.0 is a next-generation real-time collaborative writing platform. It is
          designed to combine the mechanical speed of cloud compilers with the calm, warm aesthetic
          of a high-end personal reading studio.
        </p>
      ),
    },
    {
      title: 'Can I export my drafts?',
      content: (
        <p>
          Yes! You can export your collaborative documents in markdown, raw text, and rich PDF
          formats suitable for publishing or immediate submission to printing houses.
        </p>
      ),
    },
    {
      title: 'Is there a pricing model?',
      content: (
        <p>
          CollaboWrite is open and free to write, create, and collaborate. Premium subscriptions
          exist only for large organizations requesting custom domain exports and offline editing
          bundles.
        </p>
      ),
    },
    {
      title: 'How do I invite another collaborator?',
      content: (
        <p>
          Inside the document editor window, simply click the "Invite" badge, generate a secure
          link, and email or message it to your co-author. No complicated sign-up is required for
          guest reviewers.
        </p>
      ),
    },
  ]

  // Animation variants
  const fadeInVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  return (
    <div className="flex flex-col bg-bg text-text transition-colors duration-300 font-sans min-h-screen">
      {/* 1. HERO SECTION */}
      <section
        id="home"
        className="relative px-6 py-20 md:py-32 flex flex-col items-center justify-center text-center overflow-hidden border-b border-border bg-bg"
      >
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInVariants}
          className="max-w-3xl flex flex-col items-center gap-6"
        >
          <Badge variant="primary" className="flex items-center gap-1.5 px-4 py-1">
            <Sparkles className="w-3.5 h-3.5" />
            Designed for thoughtful creators
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold font-serif tracking-tight leading-tight text-text">
            A Sanctuary for <br />
            <span className="font-serif text-5xl md:text-7xl text-accent font-normal italic block md:inline mt-2 md:mt-0 md:pl-2">
              collaborative words
            </span>
          </h1>

          <p className="text-base md:text-lg font-sans text-text-muted max-w-2xl mx-auto leading-relaxed">
            Write, draft, collaborate and compile art with co-authors in a clean, quiet workspace
            inspired by high-end bookstore aesthetics.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
            <Link to="/login">
              <Button variant="primary" size="lg" className="flex items-center gap-2">
                Enter the Studio
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#read">
              <Button variant="outline" size="lg">
                Read Stories
              </Button>
            </a>
          </div>
        </motion.div>
      </section>

      {/* 2. READ SECTION */}
      <section id="read" className="px-6 py-24 border-b border-border bg-bg/50">
        <div className="max-w-6xl mx-auto flex flex-col gap-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInVariants}
            className="flex items-end justify-between border-b border-border pb-4"
          >
            <div>
              <div className="flex items-center gap-2 text-accent text-xs font-semibold uppercase tracking-widest pl-1 mb-2">
                <BookOpen className="w-4 h-4" />
                Featured Anthology
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
                Active Manuscripts
              </h2>
            </div>
            <Link
              to="/library"
              className="text-xs font-bold text-accent hover:text-accent-hover tracking-wider uppercase flex items-center gap-1.5 transition-colors group"
            >
              View Library
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>

          {isStoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="w-full h-80 rounded-2xl bg-surface border border-border animate-pulse"
                />
              ))}
            </div>
          ) : liveStories.length === 0 ? (
            <div className="py-12 px-6 bg-surface/40 border border-border border-dashed rounded-3xl text-center flex flex-col items-center gap-6 max-w-2xl mx-auto w-full">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="flex flex-col gap-2 max-w-md">
                <h3 className="text-2xl font-serif font-bold text-text">This could be your story here.</h3>
                <p className="text-xs text-text-muted font-sans leading-relaxed">
                  Be the first author to publish a manuscript in our community. Login to contribute to the community.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                <Link to="/login">
                  <Button variant="primary" className="flex items-center gap-2 cursor-pointer">
                    Login to Contribute
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="outline" className="flex items-center gap-2 cursor-pointer">
                    Create an Account
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {liveStories.map((story, idx) => {
                const coverGradient = COVER_GRADIENTS[idx % COVER_GRADIENTS.length]

                return (
                  <motion.div
                    key={story._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                  >
                    <Card
                      className="flex flex-col gap-4 h-full justify-between cursor-pointer"
                      onClick={() => navigate(`/library/story/${story._id}`)}
                    >
                      <div>
                        {/* Visual Cover Placeholder */}
                        <div
                          className={`w-full h-32 rounded-xl bg-gradient-to-tr ${coverGradient} border border-border/40 relative flex items-center justify-center p-4 overflow-hidden mb-2`}
                        >
                          <span className="font-serif italic font-semibold text-text/80 text-sm text-center line-clamp-2">
                            {story.title}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary">{story.genres[0] || 'Uncategorized'}</Badge>
                          <div className="flex items-center gap-1 text-xs font-semibold text-amber-500 font-sans">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            {story.averageRating > 0 ? story.averageRating.toFixed(1) : '—'}
                          </div>
                        </div>

                        <h3 className="text-xl font-bold font-serif text-text leading-tight hover:text-accent transition-colors line-clamp-2">
                          {story.title}
                        </h3>
                        <span className="text-xs text-text-muted block mt-1 font-sans">
                          by {story.author.name}
                        </span>

                        {story.subtitle && (
                          <p className="text-xs text-text-muted mt-3 leading-relaxed font-sans line-clamp-3">
                            {story.subtitle}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-border/40">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/library/story/${story._id}`)
                          }}
                          className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
                        >
                          Read Manuscript →
                        </button>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* 3. ABOUT SECTION */}
      <section id="about" className="px-6 py-24 border-b border-border bg-bg">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInVariants}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            {/* Visual Column */}
            <div className="relative">
              {/* Decorative Frame */}
              <div className="absolute inset-0 bg-accent/5 rounded-2xl translate-x-4 translate-y-4 border border-accent/15 -z-10" />
              <div className="w-full rounded-2xl bg-surface border border-border p-8 flex flex-col justify-between gap-6 shadow-md relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-border/50 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                      FOUNDER PROFILE
                    </span>
                  </div>
                  <Award className="w-5 h-5 text-accent" />
                </div>

                {/* Visual photo inside app */}
                <div className="flex flex-col items-center justify-center text-center">
                  <img
                    src="/aakash.jpg"
                    alt="Aakash B Shetty"
                    className="w-48 h-48 rounded-full object-cover object-center mb-4 border-2 border-accent/25 shadow-lg shadow-accent/5 hover:scale-105 transition-transform duration-300"
                  />
                  <span className="font-serif italic font-bold text-xl text-text">
                    Aakash B Shetty
                  </span>
                  <span className="text-xs text-text-muted font-sans uppercase tracking-wider mt-1">
                    Independent Developer & Tech Writer
                  </span>
                </div>

                <div className="text-xs text-text-muted border-t border-border/50 pt-4 flex items-center justify-between">
                  <span>CollaboWrite Inc. Est. 2026</span>
                  <span className="font-sans text-[10px] text-accent font-bold uppercase tracking-wider">
                    Founder Photo
                  </span>
                </div>
              </div>
            </div>

            {/* Narrative Column */}
            <div className="flex flex-col gap-6 font-sans">
              <div>
                <span className="text-accent text-xs font-semibold uppercase tracking-widest pl-1 mb-2 block">
                  Studio Story
                </span>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-text">
                  Why We Built CollaboWrite
                </h2>
              </div>

              <p className="text-sm text-text-muted leading-relaxed text-justify">
                As a passionate tech builder who spends way too many late nights staring at bracket
                matching errors, I've always believed that writing should be a calm, tactile
                experience. CollaboWrite was born from a desire to save co-authors from cold,
                sterile office processors that feel more like spreadsheets than a blank journal
                page.
              </p>

              <p className="text-sm text-text-muted leading-relaxed text-justify">
                I wanted to build a quiet sanctuary where every writer has a voice and original
                ideas can connect effortlessly across the globe. When I'm not configuring websocket
                event states, I'm writing mysteries—like my own novel,{' '}
                <a
                  href="https://www.google.com/search?q=The+sign+of+the+burnt+petals&rlz=1C1CHBF_enIN1221IN1221&oq=The+sign+of+the+burnt+petals&gs_lcrp=EgZjaHJvbWUyCQgAEEUYORigATIHCAEQIRiPAtIBCDU5NjZqMGo3qAIAsAIA&sourceid=chrome&source=chrome.ob&ie=UTF-8"
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent font-serif italic hover:underline"
                >
                  The Sign of The Burnt Petals
                </a>
                . If code is the structure of the world, literature is the ink that details its
                soul.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. HELP FAQ SECTION */}
      <section id="help" className="px-6 py-24 border-b border-border bg-bg/50">
        <div className="max-w-4xl mx-auto flex flex-col gap-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInVariants}
            className="text-center"
          >
            <div className="inline-flex items-center gap-1.5 text-accent text-xs font-semibold uppercase tracking-widest pl-1 mb-2">
              <HelpCircle className="w-4 h-4" />
              Frequently Asked Questions
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-text">Help Desk</h2>
            <p className="text-sm text-text-muted max-w-md mx-auto mt-2">
              Quick answers about collaborative settings, formatting layouts, and server details.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeInVariants}
          >
            <Accordion
              items={faqItems}
              className="bg-surface rounded-2xl p-6 border border-border shadow-xs"
            />
            <div className="text-center mt-8 text-sm text-text-muted font-sans">
              Have more questions?{' '}
              <Link to="/contact" className="text-accent font-semibold hover:underline">
                Contact us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-surface border-t border-border px-6 py-12 text-text font-sans">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 pb-8 border-b border-border/50">
            {/* Logo/Description */}
            <div className="flex flex-col gap-3 max-w-sm">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-accent text-white rounded-lg">
                  <PenTool className="w-4 h-4" />
                </div>
                <span className="font-bold font-serif text-lg tracking-tight">CollaboWrite</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                An editorial workspace designed for collaborative typing, styling, and text
                compilations. Cozy dark-mode settings and real-time socket connections.
              </p>
            </div>

            {/* Legal Links */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Regulatory Documents
              </span>
              <ul className="flex flex-col gap-2 text-xs font-semibold text-text hover:text-accent">
                <li>
                  <Link to="/legal/privacy" className="hover:underline">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/legal/terms" className="hover:underline">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/legal/cookies" className="hover:underline">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:underline">
                    Contact Office
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-text-muted">
            <span>
              © 2026 CollaboWrite Inc. All rights reserved. Created in partnership with Advanced
              Agentic Coding.
            </span>
            <span className="flex items-center gap-1 font-semibold text-accent font-sans">
              Made with <Heart className="w-3.5 h-3.5 fill-current text-rose-500" /> for thoughtful
              writers.
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
