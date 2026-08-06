import { useState } from 'react'
import { Sparkles, PenTool, Terminal, Layers, Eye, Bell } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Accordion } from '../components/ui/Accordion'
import { Modal } from '../components/ui/Modal'
import { toast } from '../store/useToastStore'
import { ThemeToggle } from '../components/ThemeToggle'

export const DesignSystem = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [inputError, setInputError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    if (e.target.value.length < 3) {
      setInputError('Input must be at least 3 characters long')
    } else {
      setInputError('')
    }
  }

  const accordionItems = [
    {
      title: 'Our Warm Editorial Light Mode Philosophy',
      content: (
        <p>
          We believe in creating interfaces that read like a premium physical journal. The light
          mode features warm, ink-receptive off-white backgrounds, deep brown typography that
          softens eye strain, and terracotta/amber accents that feel like natural leather tags or
          clay bookmarks.
        </p>
      ),
    },
    {
      title: 'The Midnight Navy & Gold Transition',
      content: (
        <p>
          For dark mode, we transition to a cozy evening study scene. Deep navy backgrounds resemble
          midnight sky shadows, while burnished gold accents mimic brass lamps and warm desk
          lighting. It retains our warm reader-friendly off-white text to keep contrast soft.
        </p>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-bg text-text transition-colors duration-300 pb-20">
      {/* Editorial Top Border Accent */}
      <div className="h-1.5 w-full bg-accent" />

      {/* Showroom Header */}
      <header className="max-w-6xl w-full mx-auto px-6 pt-16 pb-8 border-b border-border flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-accent text-xs font-semibold uppercase tracking-widest pl-1 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            PHASE 1 / Visual Identity Showroom
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">
            Design System Showroom
          </h1>
          <p className="text-text-muted mt-2 max-w-xl font-sans text-sm leading-relaxed">
            Welcome to the visual sandbox for CollaboWrite 2.0. This page showcases the warm, cozy,
            minimalist editorial style guide. Toggle themes below to review light vs. dark mode.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-surface p-2.5 rounded-2xl border border-border shadow-xs">
          <span className="text-xs font-semibold text-text-muted font-sans pl-2">
            Toggle Theme:
          </span>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-6xl w-full mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left column: Typography, Colors, and Layout principles */}
        <section className="lg:col-span-1 flex flex-col gap-10">
          <div>
            <h2 className="text-xl font-bold font-serif border-b border-border pb-2 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent" />
              1. Visual Guidelines
            </h2>

            {/* Quote with Script Handwriting Accent */}
            <Card hoverEffect={false} className="relative overflow-hidden mb-6 bg-surface/50">
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-full pointer-events-none" />
              <p className="font-serif italic text-base leading-relaxed text-text">
                "Writing is the painting of the voice. Let the canvas feel as tactile and comforting
                as a cozy study room."
              </p>
              <div className="text-right mt-3">
                <span className="font-script text-2xl text-accent block">Voltaire's note</span>
              </div>
            </Card>

            <Accordion items={accordionItems} />
          </div>

          <div>
            <h2 className="text-xl font-bold font-serif border-b border-border pb-2 mb-4 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-accent" />
              2. Color Swatches
            </h2>
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold font-sans">
              <div className="flex flex-col gap-2 p-3 bg-bg border border-border rounded-xl">
                <div className="w-full h-8 rounded-lg bg-bg border border-border" />
                <span>bg-bg</span>
              </div>
              <div className="flex flex-col gap-2 p-3 bg-bg border border-border rounded-xl">
                <div className="w-full h-8 rounded-lg bg-surface border border-border" />
                <span>bg-surface</span>
              </div>
              <div className="flex flex-col gap-2 p-3 bg-bg border border-border rounded-xl">
                <div className="w-full h-8 rounded-lg bg-text border border-transparent" />
                <span>text</span>
              </div>
              <div className="flex flex-col gap-2 p-3 bg-bg border border-border rounded-xl">
                <div className="w-full h-8 rounded-lg bg-accent border border-transparent" />
                <span>accent</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right column: Components and interactive elements (Span 2) */}
        <section className="lg:col-span-2 flex flex-col gap-10">
          {/* Buttons showcase */}
          <div>
            <h2 className="text-xl font-bold font-serif border-b border-border pb-2 mb-6 flex items-center gap-2">
              <Eye className="w-4 h-4 text-accent" />
              3. Button Primitive
            </h2>
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary Pill</Button>
                <Button variant="secondary">Secondary Pill</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="text">Text Link</Button>
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <Button variant="primary" size="sm">
                  Small Button
                </Button>
                <Button variant="primary" size="md">
                  Medium Button
                </Button>
                <Button variant="primary" size="lg">
                  Large Button
                </Button>
              </div>
            </div>
          </div>

          {/* Cards Showcase */}
          <div>
            <h2 className="text-xl font-bold font-serif border-b border-border pb-2 mb-6 flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent" />
              4. Card Primitive (Hover Lift)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="flex flex-col gap-3">
                <Badge variant="primary" className="w-fit">
                  Editorial Card
                </Badge>
                <h3 className="text-lg font-bold text-text">Cozy Bookstore Vibe</h3>
                <p className="text-xs text-text-muted leading-relaxed font-sans">
                  Hover over this card to view the subtle lift animation and glowing shadow depth.
                  It is calibrated for smooth rendering.
                </p>
              </Card>

              <Card className="flex flex-col gap-3">
                <Badge variant="success" className="w-fit">
                  Collaboration
                </Badge>
                <h3 className="text-lg font-bold text-text">High-end Workspace</h3>
                <p className="text-xs text-text-muted leading-relaxed font-sans">
                  The borders adapt perfectly to light mode's light ivory sand tone and dark mode's
                  deep navy.
                </p>
              </Card>
            </div>
          </div>

          {/* Form inputs showcase */}
          <div>
            <h2 className="text-xl font-bold font-serif border-b border-border pb-2 mb-6 flex items-center gap-2">
              <PenTool className="w-4 h-4 text-accent" />
              5. Input & Badge Primitives
            </h2>
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Sample Input"
                  placeholder="Type anything here..."
                  value={inputValue}
                  onChange={handleInputChange}
                  error={inputError}
                />
                <Input
                  label="Disabled Input"
                  placeholder="This is locked"
                  disabled
                  defaultValue="Locked content"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="primary">Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
              </div>
            </div>
          </div>

          {/* Modals & Toasts showcases */}
          <div>
            <h2 className="text-xl font-bold font-serif border-b border-border pb-2 mb-6 flex items-center gap-2">
              <Bell className="w-4 h-4 text-accent" />
              6. Interactive Overlays (Modal & Toast)
            </h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                Open Modal Overlay
              </Button>

              <Button
                variant="secondary"
                onClick={() => toast.success('Success notification triggered!')}
              >
                Trigger Success Toast
              </Button>

              <Button
                variant="outline"
                onClick={() => toast.info('Important note from editorial desk.')}
              >
                Trigger Info Toast
              </Button>

              <Button
                variant="text"
                className="text-rose-500 hover:bg-rose-500/5"
                onClick={() => toast.error('An error occurred during save!')}
              >
                Trigger Error Toast
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Modal Primitive Component */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Cozy Library Modal">
        <div className="flex flex-col gap-4 font-sans">
          <p>
            This modal is rendered inside a portal layout. It handles escape key listeners and locks
            background scrolls while open.
          </p>
          <p className="text-xs text-text-muted">
            The overlay background uses a soft glassmorphism layer to tint the viewport without
            feeling jarring.
          </p>
          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsModalOpen(false)
                toast.success('Confirmed from modal!')
              }}
            >
              Confirm Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
