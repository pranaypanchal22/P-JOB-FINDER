'use client'

import { JobScore } from '@prisma/client'
import { Zap, RefreshCw, TrendingUp } from 'lucide-react'

interface JobScoreBadgeProps {
  score: JobScore | null
  isLoading?: boolean
  onScore?: () => void
  onRescore?: () => void
}

export function JobScoreBadge({
  score,
  isLoading = false,
  onScore,
  onRescore,
}: JobScoreBadgeProps) {
  if (!score) {
    return (
      <button
        onClick={onScore}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg font-medium text-sm transition-colors"
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Scoring...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Score Job
          </>
        )}
      </button>
    )
  }

  const getColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100'
    if (score >= 60) return 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
    if (score >= 40) return 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100'
    return 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100'
  }

  return (
    <div className={`rounded-lg p-4 ${getColor(score.fitScore)}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          <span className="font-bold text-2xl">{score.fitScore}/100</span>
        </div>
        <button
          onClick={onRescore}
          disabled={isLoading}
          className="p-1 hover:opacity-70 disabled:opacity-50 transition-opacity"
          title="Re-score with same provider"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <p>
          <strong>Recommendation:</strong> {score.recommendation}
        </p>
        <p>
          <strong>Seniority:</strong> {score.seniorityFit.replace('_', ' ')}
        </p>
        <p className="italic">{score.rationale}</p>
      </div>

      {score.matchedSkills.length > 0 && (
        <div className="mt-3 pt-3 border-t border-current border-opacity-20">
          <p className="text-xs font-medium mb-2">Matched Skills</p>
          <div className="flex flex-wrap gap-1">
            {JSON.parse(score.matchedSkills).map((skill: string) => (
              <span key={skill} className="px-2 py-1 bg-current bg-opacity-20 rounded text-xs">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {JSON.parse(score.missingSkills).length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium mb-2">Missing Skills</p>
          <div className="flex flex-wrap gap-1">
            {JSON.parse(score.missingSkills).map((skill: string) => (
              <span key={skill} className="px-2 py-1 bg-current bg-opacity-10 rounded text-xs line-through">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {JSON.parse(score.concerns).length > 0 && (
        <div className="mt-2 p-2 bg-current bg-opacity-10 rounded text-xs">
          <p className="font-medium mb-1">Concerns</p>
          <ul className="list-disc list-inside space-y-1">
            {JSON.parse(score.concerns).map((concern: string, i: number) => (
              <li key={i}>{concern}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
