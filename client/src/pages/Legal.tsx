import { Link, useLocation } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

export const Legal = () => {
  const location = useLocation()
  const path = location.pathname

  const doc = (
    {
      '/legal/privacy': {
        title: 'Privacy Policy',
        desc: 'How we collect, use, and safeguard your data during collaborative writing sessions.',
        content: (
          <div className="flex flex-col gap-6 font-sans">
            <p>
              <strong>Last Updated: August 6, 2026</strong>
            </p>

            <h2 className="text-lg font-serif font-bold text-text mt-4 border-b border-border pb-2">
              1. Data We Collect
            </h2>
            <p>
              We collect information you provide directly when creating accounts, editing drafts, or
              inviting collaborators. This includes your name, email address, password, document
              metadata, and all text entered during real-time typing sessions.
            </p>

            <h2 className="text-lg font-serif font-bold text-text mt-4 border-b border-border pb-2">
              2. How We Use Your Data
            </h2>
            <p>
              Your data is processed to connect real-time editing sessions via websockets, save
              progress logs in MongoDB, verify credentials, and send email notifications for
              comments or project updates. We never sell your personal information or shared
              manuscripts to third-party brokers.
            </p>

            <h2 className="text-lg font-serif font-bold text-text mt-4 border-b border-border pb-2">
              3. Cookies & Tracking Disclosure
            </h2>
            <p>
              We use essential cookies and browser local storage to maintain your current session
              tokens, remember your visual theme preference (Warm Editorial vs. Cozy Navy), and
              manage websocket authentication channels. For more information, please refer to our
              Cookie Policy.
            </p>

            <h2 className="text-lg font-serif font-bold text-text mt-4 border-b border-border pb-2">
              4. Your Rights & Control
            </h2>
            <p>
              Under GDPR and CCPA, you have the right to view, download, or permanently delete all
              drafts and user profiles registered to your account. You can trigger file removals or
              request full profile deletion by contacting us at our help center.
            </p>
          </div>
        ),
      },
      '/legal/terms': {
        title: 'Terms of Service',
        desc: 'The rules, terms, and code of conduct governing your workspace and document sharing.',
        content: (
          <div className="flex flex-col gap-6 font-sans">
            <p>
              <strong>Last Updated: August 6, 2026</strong>
            </p>

            <h2 className="text-lg font-serif font-bold text-text mt-4 border-b border-border pb-2">
              1. Account Responsibilities
            </h2>
            <p>
              When you register an account with CollaboWrite, you agree to keep your credentials
              confidential. You are solely responsible for all activities and document edits
              performed under your workspace session tokens.
            </p>

            <h2 className="text-lg font-serif font-bold text-text mt-4 border-b border-border pb-2">
              2. Acceptable Use Guidelines
            </h2>
            <p>
              You agree not to abuse the real-time websocket server, inject malicious scripts, or
              upload documents containing harassment or copyright infringements. We reserve the
              right to suspend accounts violating these code safety standards.
            </p>

            <h2 className="text-lg font-serif font-bold text-text mt-4 border-b border-border pb-2">
              3. Content Ownership for Published Stories
            </h2>
            <p>
              You retain full intellectual property ownership of any story text, documents, or
              manuscripts you draft or publish on this platform. CollaboWrite makes no claim over
              your creative content, but you grant us a minimal hosting license to render your text
              to selected co-authors.
            </p>

            <h2 className="text-lg font-serif font-bold text-text mt-4 border-b border-border pb-2">
              4. Termination & Suspensions
            </h2>
            <p>
              You can terminate your service agreements at any time by deleting your account.
              CollaboWrite reserves the right to suspend or block access to the real-time servers
              for user accounts violating copyright laws or engaging in platform DDoS attempts.
            </p>
          </div>
        ),
      },
      '/legal/cookies': {
        title: 'Cookie Policy',
        desc: 'Information about how we use local storage cookies to persist your preferences.',
        content: (
          <div className="flex flex-col gap-6 font-sans">
            <p>
              <strong>Last Updated: August 6, 2026</strong>
            </p>

            <h2 className="text-lg font-serif font-bold text-text mt-4 border-b border-border pb-2">
              1. Types of Cookies We Use
            </h2>
            <p>
              We use essential cookies and web storage tokens to maintain your workspace state.
              These include session storage (handling your active connection tokens) and persistent
              local storage (saving your user preferences).
            </p>

            <h2 className="text-lg font-serif font-bold text-text mt-4 border-b border-border pb-2">
              2. Purpose of Each Storage Method
            </h2>
            <ul className="list-disc pl-5 flex flex-col gap-2">
              <li>
                <strong>collabowrite-theme:</strong> Local storage setting to remember if you
                preferred the Light Warm Editorial theme or the Midnight Dark Navy theme across
                refreshes.
              </li>
              <li>
                <strong>token:</strong> Secure cookie holding your encrypted JWT session
                authentication token, preventing unauthorized dashboard entries.
              </li>
              <li>
                <strong>socket.io:</strong> Session cookies facilitating instant transport upgrades
                for websocket writing channels.
              </li>
            </ul>

            <h2 className="text-lg font-serif font-bold text-text mt-4 border-b border-border pb-2">
              3. How to Manage Preferences
            </h2>
            <p>
              You can configure your browser to decline cookies or clear local storage. However,
              declining essential cookies will block you from staying logged in or connecting to
              real-time document typing channels.
            </p>
          </div>
        ),
      },
    } as Record<string, { title: string; desc: string; content: React.ReactNode }>
  )[path] || {
    title: 'Legal Document',
    desc: 'General legal agreements and policies.',
    content: <p className="font-sans">Please select a valid legal page from the footer links.</p>,
  }

  return (
    <div className="min-h-screen bg-bg text-text transition-colors duration-300 p-6 md:p-12 flex items-center justify-center">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-2.5 text-accent text-xs font-semibold uppercase tracking-widest pl-1 mb-2">
            <ShieldCheck className="w-4 h-4" />
            REGULATORY POLICIES
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">{doc.title}</h1>
          <p className="text-text-muted mt-2 text-sm leading-relaxed">{doc.desc}</p>
        </div>

        <Card
          hoverEffect={false}
          className="p-8 font-sans text-sm text-text-muted leading-relaxed flex flex-col gap-6"
        >
          {doc.content}
        </Card>
      </div>
    </div>
  )
}
