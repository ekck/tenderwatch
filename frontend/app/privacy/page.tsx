import PageLayout from '@/components/layout/PageLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — TenderWatch Kenya',
  description: 'Privacy Policy for TenderWatch Kenya.',
}

export default function PrivacyPage() {
  return (
    <PageLayout>
      <h1 className="font-display font-bold text-4xl text-white mb-2">Privacy Policy</h1>
      <p className="text-slate-500 text-sm mb-8">Last updated: April 18, 2026</p>
      <div className="tw-prose space-y-6 max-w-2xl">
        {[
          { title: '1. Introduction', body: 'TenderWatch Kenya ("we", "us", or "our"), operated by Zanah (tenderwatch.zanah.co.ke), is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.' },
          { title: '2. Information We Collect', body: 'We collect information you provide directly (email address, alert preferences, contact form submissions) and information collected automatically (log data, device information, usage data, and cookies from Google AdSense).' },
          { title: '3. How We Use Your Information', body: 'We use collected information to send tender alert emails, respond to enquiries, analyse site usage, detect fraud, comply with legal obligations, and serve relevant advertisements through Google AdSense.' },
          { title: '4. Email Alerts', body: 'When you subscribe to email alerts, we store your email and preferences solely to send relevant tender notifications. You may unsubscribe at any time via the link in any email or by contacting tenderwatch@zanah.co.ke.' },
          { title: '5. Google AdSense & Cookies', body: 'We use Google AdSense to display advertisements. AdSense uses cookies to serve ads based on your prior visits. You may opt out of personalised advertising at google.com/settings/ads.' },
          { title: '6. Third-Party Services', body: 'We use Google AdSense (advertising), Resend (email delivery), and Vercel (hosting). Each has their own privacy policy governing their data practices.' },
          { title: '7. Data Retention', body: 'Email subscriptions are retained while active and deleted within 30 days of unsubscribing. Contact submissions are retained for up to 12 months. Log data is retained for up to 90 days.' },
          { title: '8. Your Rights', body: 'You have the right to access, correct, or delete your personal data, and to withdraw consent for email communications at any time. Contact tenderwatch@zanah.co.ke to exercise these rights.' },
          { title: '9. Children\'s Privacy', body: 'TenderWatch is not directed at children under 13. We do not knowingly collect personal information from children.' },
          { title: '10. Contact', body: 'For questions about this Privacy Policy, contact us at tenderwatch@zanah.co.ke.' },
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
