import Sidebar from './Sidebar'

interface Props {
  children: React.ReactNode
  leaderboardSlot?: string
  fullWidth?: boolean
}

export default function PageLayout({ children, leaderboardSlot: _leaderboardSlot, fullWidth = false }: Props) {
  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {fullWidth ? (
          children
        ) : (
          <div className="flex gap-7 items-start">
            <div className="flex-1 min-w-0">{children}</div>
            <div className="hidden lg:block w-[300px] shrink-0">
              <div className="sticky top-20">
                <Sidebar />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
