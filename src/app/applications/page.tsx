'use client'

import { useEffect, useState } from 'react'
import { Application, Job } from '@prisma/client'
import { ApplicationKanban } from '@/components/applications/ApplicationKanban'
import { getApplicationsWithJobs, getFirstProfileId } from '@/server/applications/actions'

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<(Application & { job: Job })[]>([])
  const [profileId, setProfileId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [apps, pId] = await Promise.all([
          getApplicationsWithJobs(),
          getFirstProfileId(),
        ])
        setApplications(apps)
        if (pId) setProfileId(pId)
      } catch (error) {
        console.error('Error loading applications:', error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const stats = {
    total: applications.length,
    byStatus: {
      saved: applications.filter((a) => a.status === 'saved').length,
      applied: applications.filter((a) => a.status === 'applied').length,
      interviewing: applications.filter((a) => a.status === 'interviewing').length,
      offer: applications.filter((a) => a.status === 'offer').length,
      rejected: applications.filter((a) => a.status === 'rejected').length,
    },
    overdue: applications.filter(
      (a) => a.nextFollowUpDate && new Date(a.nextFollowUpDate) < new Date()
    ).length,
  }

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Applications</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Track job applications through the hiring pipeline</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
          <p className="text-sm text-green-700 dark:text-green-300">Applied</p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.byStatus.applied}</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
          <p className="text-sm text-purple-700 dark:text-purple-300">Interviewing</p>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.byStatus.interviewing}</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900 rounded-lg p-4">
          <p className="text-sm text-emerald-700 dark:text-emerald-300">Offers</p>
          <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{stats.byStatus.offer}</p>
        </div>
        <div className={`rounded-lg p-4 ${stats.overdue > 0 ? 'bg-red-50 dark:bg-red-900' : 'bg-gray-50 dark:bg-gray-800'}`}>
          <p className={`text-sm ${stats.overdue > 0 ? 'text-red-700 dark:text-red-300' : 'text-gray-600 dark:text-gray-400'}`}>
            Overdue Follow-ups
          </p>
          <p className={`text-2xl font-bold ${stats.overdue > 0 ? 'text-red-900 dark:text-red-100' : 'text-gray-900 dark:text-white'}`}>
            {stats.overdue}
          </p>
        </div>
      </div>

      {/* Kanban */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 overflow-hidden">
        {profileId && <ApplicationKanban applications={applications} profileId={profileId} />}
      </div>
    </div>
  )
}
