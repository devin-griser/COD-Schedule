// src/components/TeamLogo.tsx
// Team logo image with onError fallback and errored guard to prevent infinite loop.

import { useState } from 'react'
import type { Team } from '../types/index.ts'

interface TeamLogoProps {
  team: Team
  size?: number
}

export function TeamLogo({ team, size = 32 }: TeamLogoProps) {
  const [src, setSrc] = useState(team.logoPath)
  const [errored, setErrored] = useState(false)

  function handleError() {
    if (!errored) {
      setErrored(true)
      setSrc(team.logoFallback)
    }
  }

  return (
    <img
      src={src}
      alt={team.shortName}
      width={size}
      height={size}
      className="rounded-sm object-contain"
      onError={handleError}
    />
  )
}
