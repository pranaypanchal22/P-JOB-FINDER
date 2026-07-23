'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'

export default function SettingsPage() {
  const [aiProvider, setAiProvider] = useState('openai')
  const [extractorsEnabled, setExtractorsEnabled] = useState({
    demo: true,
    remoteOK: true,
    adzuna: false,
    careerjet: true,
    usajobs: true,
    angellist: true,
    builtin: true,
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiProvider, extractorsEnabled }),
      })
      alert('Settings saved')
    } catch (error) {
      alert('Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Configure AI providers and job sources</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">AI Provider</h2>
          <div className="space-y-3">
            {['openai', 'gemini', 'openrouter', 'ollama'].map((provider) => (
              <label key={provider} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="aiProvider"
                  value={provider}
                  checked={aiProvider === provider}
                  onChange={(e) => setAiProvider(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="capitalize text-gray-700 dark:text-gray-300">
                  {provider === 'openai' && 'OpenAI (GPT-4)'}
                  {provider === 'gemini' && 'Google Gemini'}
                  {provider === 'openrouter' && 'OpenRouter'}
                  {provider === 'ollama' && 'Ollama (Local)'}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Job Sources</h2>
          <div className="space-y-3">
            {Object.entries(extractorsEnabled).map(([name, enabled]) => (
              <label key={name} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) =>
                    setExtractorsEnabled({ ...extractorsEnabled, [name]: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  {name === 'demo' && 'Demo (Test Data)'}
                  {name === 'remoteOK' && 'RemoteOK'}
                  {name === 'adzuna' && 'Adzuna'}
                  {name === 'careerjet' && 'CareerJet'}
                  {name === 'usajobs' && 'USAJobs (Federal)'}
                  {name === 'angellist' && 'AngelList (Startups)'}
                  {name === 'builtin' && 'Built In (Tech Hubs)'}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium rounded-lg"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
