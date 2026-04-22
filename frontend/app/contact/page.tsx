import PageLayout from '@/components/layout/PageLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact TenderWatch Kenya',
  description: 'Contact TenderWatch Kenya for questions, data corrections, partnership enquiries, or feedback.',
}

export default function ContactPage() {
  return (
    <PageLayout>
      {/* Page title */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-4xl text-forest mb-2">Contact Us</h1>
        <p className="text-ink-3 text-base leading-relaxed">
          Questions, corrections, or partnership enquiries — we'd like to hear from you.
        </p>
      </div>

      <div className="max-w-xl space-y-6">

        {/* Contact cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: 'General Enquiries', value: 'tenderwatch@zanah.co.ke', href: 'mailto:tenderwatch@zanah.co.ke', icon: '✉️', desc: 'Questions, feedback, partnerships' },
            { label: 'Data Corrections', value: 'data@zanah.co.ke', href: 'mailto:data@zanah.co.ke', icon: '🔍', desc: 'Report errors or missing data' },
          ].map(({ label, value, href, icon, desc }) => (
            <div key={label} className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{icon}</span>
                <p className="text-ink font-bold text-sm">{label}</p>
              </div>
              <p className="text-ink-3 text-xs mb-2">{desc}</p>
              <a href={href} className="text-forest font-semibold text-sm hover:underline break-all">{value}</a>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="card p-6">
          <h2 className="font-display font-bold text-xl text-forest mb-4">Send a Message</h2>
          <form className="space-y-4" action="mailto:tenderwatch@zanah.co.ke" method="get">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-ink font-semibold text-sm mb-1.5">Your Name</label>
                <input type="text" name="name" placeholder="Jane Mwangi"
                  className="w-full px-4 py-3 bg-cream border border-divider rounded-lg text-ink placeholder-muted text-sm focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest transition-colors" />
              </div>
              <div>
                <label className="block text-ink font-semibold text-sm mb-1.5">Email Address</label>
                <input type="email" name="email" placeholder="jane@example.co.ke"
                  className="w-full px-4 py-3 bg-cream border border-divider rounded-lg text-ink placeholder-muted text-sm focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-ink font-semibold text-sm mb-1.5">Subject</label>
              <select name="subject"
                className="w-full px-4 py-3 bg-cream border border-divider rounded-lg text-ink text-sm focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest transition-colors cursor-pointer">
                <option value="">Select a topic…</option>
                <option value="General question">General question</option>
                <option value="Data correction">Data correction / error report</option>
                <option value="Partnership enquiry">Partnership enquiry</option>
                <option value="Media / press">Media / press enquiry</option>
                <option value="Feedback">Feedback or feature request</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-ink font-semibold text-sm mb-1.5">Message</label>
              <textarea name="body" rows={5} placeholder="Tell us what you need…"
                className="w-full px-4 py-3 bg-cream border border-divider rounded-lg text-ink placeholder-muted text-sm focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest transition-colors resize-none" />
            </div>

            <button type="submit"
              className="w-full py-3 bg-forest text-white font-bold rounded-lg hover:bg-forest-2 transition-colors shadow-sm text-sm">
              Send Message →
            </button>
          </form>
        </div>

        {/* FAQ */}
        <div className="card-flat overflow-hidden">
          <div className="bg-forest px-5 py-3">
            <h2 className="text-white font-bold text-sm">Frequently Asked Questions</h2>
          </div>
          <div className="divide-y divide-divider">
            {[
              {
                q: 'Is TenderWatch free to use?',
                a: 'Yes — completely free. All data is sourced from the public PPIP portal and made available at no cost.',
              },
              {
                q: 'How current is the data?',
                a: 'We sync data daily from tenders.go.ke at 6 AM EAT. There may be a lag of up to 24 hours from when PPRA publishes a tender to when it appears on TenderWatch.',
              },
              {
                q: 'Are you affiliated with PPRA or the Government of Kenya?',
                a: 'No. TenderWatch is an independent transparency initiative by Zanah. We are not affiliated with, endorsed by, or officially connected to PPRA or any government body.',
              },
              {
                q: 'Can I download tender documents through TenderWatch?',
                a: 'Not currently. Tender documents are hosted directly on tenders.go.ke. Each tender page links directly to the official PPIP record where documents can be downloaded.',
              },
              {
                q: 'I found incorrect data — what should I do?',
                a: 'Email data@zanah.co.ke with the tender ID and what you believe is incorrect. We\'ll investigate and correct it. Note that data may reflect exactly what was entered by the procuring entity on PPIP.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="px-5 py-4">
                <p className="text-ink font-bold text-sm mb-1.5">Q: {q}</p>
                <p className="text-ink-3 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-ink-3 text-xs leading-relaxed">
          TenderWatch Kenya is a project by{' '}
          <a href="https://zanah.co.ke" target="_blank" rel="noopener noreferrer" className="text-forest font-semibold hover:underline">Zanah</a>.
          {' '}Not affiliated with PPRA or the Government of Kenya.
          {' '}See our <a href="/privacy" className="text-forest hover:underline">Privacy Policy</a> and{' '}
          <a href="/terms" className="text-forest hover:underline">Terms of Service</a>.
        </p>
      </div>
    </PageLayout>
  )
}
