import PageLayout from '@/components/layout/PageLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About TenderWatch Kenya',
  description: 'TenderWatch Kenya is a free public transparency tool tracking government procurement data from the Kenya Public Procurement Information Portal (PPIP).',
}

export default function AboutPage() {
  return (
    <PageLayout leaderboardSlot="7777777777">
      <h1 className="font-display font-bold text-4xl text-white mb-1">About TenderWatch</h1>
      <p className="text-amber-400 font-mono text-sm mb-8">Kenya's Public Procurement Transparency Tool</p>

      <div className="tw-prose space-y-8">
        <section>
          <h2>Our Mission</h2>
          <p>TenderWatch Kenya exists to make government procurement data accessible to every Kenyan. Public procurement — the process by which government entities purchase goods, works, and services — represents a significant portion of Kenya's national budget. Yet for most citizens, this data has been difficult to navigate, scattered across dozens of portals, and presented in formats that require specialist knowledge to interpret.</p>
          <p>We believe that transparency in public spending is foundational to good governance. When citizens, journalists, suppliers, and civil society can easily see who is awarded government contracts, for how much, and through what process, it creates accountability and helps ensure public resources are used effectively.</p>
        </section>

        <section>
          <h2>Our Data</h2>
          <p>TenderWatch aggregates procurement data from the <strong>Public Procurement Information Portal (PPIP)</strong>, the official government platform maintained by the Public Procurement Regulatory Authority (PPRA) of Kenya. The PPIP is mandated by Executive Order No. 2 of 2018, which requires all public procurement entities to disclose tender notices and contract awards.</p>
          <p>We retrieve this data daily through the Open Contracting Data Standard (OCDS) feed. Our data covers:</p>
          <ul>
            <li>All 47 county governments</li>
            <li>National government ministries and departments</li>
            <li>State corporations and parastatals</li>
            <li>Public universities and schools</li>
            <li>All procurement methods: open, restricted, and direct</li>
          </ul>
          <p className="text-slate-500 text-sm mt-2"><strong className="text-slate-300">Disclaimer:</strong> TenderWatch is not affiliated with, endorsed by, or officially connected to the PPRA or the Government of Kenya. We are an independent transparency initiative. Always verify tender details directly on <a href="https://tenders.go.ke" target="_blank" rel="noopener noreferrer">tenders.go.ke</a> before making business decisions.</p>
        </section>

        <section>
          <h2>Who We Serve</h2>
          <div className="grid sm:grid-cols-2 gap-4 not-prose">
            {[
              { title: 'SMEs & Suppliers', desc: 'Small businesses looking for government contracting opportunities can search active tenders by sector, county, and value.' },
              { title: 'Journalists & CSOs', desc: 'Civil society organisations and investigative journalists can track procurement patterns, flag anomalies, and monitor direct procurement use.' },
              { title: 'Procurement Officers', desc: 'Public procurement staff can benchmark their entities against peers and ensure their notices are publicly visible.' },
              { title: 'Researchers & Students', desc: 'Policy researchers and students studying public finance can access structured procurement data for analysis.' },
            ].map(({ title, desc }) => (
              <div key={title} className="p-4 border border-navy-700 rounded-lg bg-navy-800">
                <h3 className="text-amber-400 font-semibold mb-2 text-sm">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2>Technology</h2>
          <p>TenderWatch is built with a Python Flask backend, SQLite database, and a Next.js frontend. Data is ingested daily from the PPIP OCDS endpoint using a scheduled job. The platform is a <a href="https://zanah.co.ke" target="_blank" rel="noopener noreferrer">Zanah</a> project — a portfolio of data-driven web applications for emerging markets.</p>
        </section>

        <section>
          <h2>Contact & Feedback</h2>
          <p>We welcome questions, corrections, partnership enquiries, and feature suggestions. Reach us at <a href="mailto:tenderwatch@zanah.co.ke">tenderwatch@zanah.co.ke</a> or use our <a href="/contact">contact form</a>.</p>
        </section>
      </div>
    </PageLayout>
  )
}
