'use client'

import { useState } from 'react'
import { X, Loader, CheckCircle, AlertCircle } from 'lucide-react'

interface TailorResumeModalProps {
  jobId: string
  jobTitle: string
  jobDescription: string
  profileId: string
  onClose: () => void
}

export function TailorResumeModal({
  jobId,
  jobTitle,
  jobDescription,
  profileId,
  onClose,
}: TailorResumeModalProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTailor = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          jobId,
          jobTitle,
          jobDescription,
          desiredSkills: extractSkills(jobDescription),
        }),
      })

      if (!response.ok) throw new Error('Tailoring failed')
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error tailoring resume')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Tailor Resume for {jobTitle}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!result ? (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                This will customize your resume to match this job description:
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded text-sm text-gray-700 dark:text-gray-300 max-h-40 overflow-y-auto">
                {jobDescription}
              </div>

              <button
                onClick={handleTailor}
                disabled={loading}
                className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium rounded-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Tailoring...
                  </>
                ) : (
                  'Tailor Resume'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Changes Summary */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Changes Made
                </h3>
                <ul className="space-y-2">
                  {result.changeSummary.map((change: string, i: number) => (
                    <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                      <span className="text-green-600">✓</span>
                      {change}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Keyword Report */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Keyword Matching
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-2">
                      Matched ({result.keywordReport.keywordsAddedOrEmphasized.length})
                    </p>
                    <div className="space-y-1">
                      {result.keywordReport.keywordsAddedOrEmphasized.map((kw: string, i: number) => (
                        <span
                          key={i}
                          className="inline-block text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded mr-2 mb-2"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600 mb-2">
                      Not Supported ({result.keywordReport.keywordsNotUsedBecauseUnsupported.length})
                    </p>
                    <div className="space-y-1">
                      {result.keywordReport.keywordsNotUsedBecauseUnsupported.map((kw: string, i: number) => (
                        <span
                          key={i}
                          className="inline-block text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded mr-2 mb-2"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Truth Check */}
              {result.warnings && result.warnings.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    Truth Check
                  </h3>
                  <ul className="space-y-2">
                    {result.warnings.map((warning: string, i: number) => (
                      <li
                        key={i}
                        className="text-sm text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded"
                      >
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!result.warnings || result.warnings.length === 0 ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-4 text-center">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    ✓ No hallucinations detected - all changes are factual
                  </p>
                </div>
              ) : null}

              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg"
              >
                Close & Download Tailored CV
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function extractSkills(text: string): string[] {
  // Simple keyword extraction - in production use NLP
  const keywords = text.match(/\b[A-Za-z]+(?:\s+[A-Za-z]+)?\b/g) || []
  return [...new Set(keywords)].slice(0, 20)
}
