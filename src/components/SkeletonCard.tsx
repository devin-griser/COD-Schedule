// src/components/SkeletonCard.tsx
// Loading placeholder card that mimics MatchCard layout with animate-pulse.

export function SkeletonCard() {
  return (
    <div className="border border-gray-800 rounded-lg px-4 py-3 animate-pulse">
      {/* Tournament context row placeholder */}
      <div className="h-3 bg-gray-800 rounded w-2/5 mb-2" />

      {/* Teams + score/time row */}
      <div className="flex items-center">
        {/* Home team placeholder */}
        <div className="flex-1 flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-800 rounded-sm" />
          <div className="h-4 bg-gray-800 rounded w-16" />
        </div>

        {/* Center score/time placeholder */}
        <div className="min-w-[60px] flex justify-center">
          <div className="h-6 bg-gray-800 rounded w-10" />
        </div>

        {/* Away team placeholder */}
        <div className="flex-1 flex items-center justify-end gap-2">
          <div className="h-4 bg-gray-800 rounded w-16" />
          <div className="w-8 h-8 bg-gray-800 rounded-sm" />
        </div>
      </div>
    </div>
  )
}
