import PageLayout from '@/components/layout/PageLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — TenderWatch Kenya',
  description: 'Terms of Service for TenderWatch Kenya.',
}

export default function TermsPage() {
  return (
    <PageLayout>
      <h1 className="font-display font-bold text-4xl text-white mb-2">Terms of Service</h1>
      <p className="text-slate-500 text-sm mb-8">Last updated: April 18, 2026</p>
      <div className="tw-prose space-y-6 max-w-2xl">
        {[
          { title: '1. Acceptance of Terms', body: 'By accessing or using TenderWatch Kenya, operated at tenderwatch.zanah.co.ke by Zanah, you agree to be bound by these Terms of Service.' },
          { title: '2. Description of Service', body: 'TenderWatch Kenya is a free public information tool that aggregates Kenya government procurement data from PPIP. TenderWatch is independent and not affiliated with the PPRA or the Government of Kenya.' },
          { title: '3. Data Accuracy', body: 'We make reasonable efforts to present data accurately. However, we cannot guarantee completeness, accuracy, or timeliness. Always verify tender details directly on tenders.go.ke before making business decisions.' },
          { title: '4. Permitted Use', body: 'You may search and browse procurement data, subscribe to alerts, conduct research and journalism, and use data for personal or commercial decision-making (subject to the accuracy disclaimer above).' },
          { title: '5. Prohibited Use', body: 'You may not bulk-scrape data without written permission, send unsolicited communications, interfere with our systems, click advertisements artificially, or use the service for any unlawful purpose.' },
          { title: '6. Advertising', body: 'TenderWatch displays advertisements served by Google AdSense. Ads are clearly labelled "Advertisement". You are under no obligation to click any advertisement. Artificial clicks are strictly prohibited.' },
          { title: '7. Intellectual Property', body: 'The TenderWatch brand, design, and original content are the property of Zanah. Procurement data is sourced from PPIP and remains the property of the respective government entities.' },
          { title: '8. Limitation of Liability', body: 'To the fullest extent permitted by law, TenderWatch and Zanah shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.' },
          { title: '9. Governing Law', body: 'These Terms are governed by the laws of Kenya. Any disputes shall be subject to the exclusive jurisdiction of the courts of Kenya.' },
          { title: '10. Contact', body: 'For questions about these Terms, contact us at tenderwatch@zanah.co.ke.' },
        ].map(({ title, body }) => (
          <section key={title}>
            <h2>{title}</h2>
            <p>{body}</p>
          </section>
        ))}
      </div>
    </PageLayout>
  )
}
