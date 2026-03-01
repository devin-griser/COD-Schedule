// src/components/ErrorState.tsx
// Error display for data load failure with retry hint.

interface ErrorStateProps {
  message?: string
}

export function ErrorState({ message = 'Failed to load schedule data' }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {/* Error icon — exclamation mark in a rounded circle */}
      <div className="w-10 h-10 rounded-full bg-red-400/10 flex items-center justify-center">
        <span className="text-red-400 text-lg font-bold">!</span>
      </div>

      {/* Error message */}
      <p className="text-gray-400 mt-3">{message}</p>

      {/* Retry hint */}
      <p className="text-gray-600 text-sm mt-1">Try refreshing the page</p>
    </div>
  )
}
