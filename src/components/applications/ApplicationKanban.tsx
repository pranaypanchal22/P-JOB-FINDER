'use client'

import { useState } from 'react'
import { Application, Job } from '@prisma/client'
import { ApplicationCard } from './ApplicationCard'
import { ApplicationDetailPanel } from './ApplicationDetailPanel'
import { updateApplicationStatus } from '../../server/applications/actions'

type Status = 'saved' | 'preparing' | 'applied' | 'interviewing' | 'assessment' | 'offer' | 'rejected' | 'withdrawn' | 'archived'

const STATUSES: { value: Status; label: string; color: string }[] = [
  { value: 'saved', label: 'Saved', color: 'bg-gray-100 dark:bg-gray-800' },
  { value: 'preparing', label: 'Preparing', color: 'bg-blue-100 dark:bg-blue-900' },
  { value: 'applied', label: 'Applied', color: 'bg-green-100 dark:bg-green-900' },
  { value: 'interviewing', label: 'Interviewing', color: 'bg-purple-100 dark:bg-purple-900' },
  { value: 'assessment', label: 'Assessment', color: 'bg-yellow-100 dark:bg-yellow-900' },
  { value: 'offer', label: 'Offer', color: 'bg-emerald-100 dark:bg-emerald-900' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 dark:bg-red-900' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'bg-gray-100 dark:bg-gray-700' },
  { value: 'archived', label: 'Archived', color: 'bg-slate-100 dark:bg-slate-800' },
]

interface KanbanProps {
  applications: (Application & { job: Job })[]
  profileId: string
}

export function ApplicationKanban({ applications, profileId }: KanbanProps) {
  const [selectedApp, setSelectedApp] = useState<Application & { job: Job } | null>(null)
  const [draggedApp, setDraggedApp] = useState<string | null>(null)

  async function handleStatusChange(appId: string, newStatus: Status) {
    try {
      await updateApplicationStatus(appId, newStatus)
      setSelectedApp(null)
      // Note: in a real app, would refetch or use optimistic update
    } catch (error) {
      console.error('Error updating status', error)
      alert('Failed to update status')
    }
  }

  function handleDragStart(appId: string) {
    setDraggedApp(appId)
  }

  function handleDrop(status: Status) {
    if (draggedApp) {
      handleStatusChange(draggedApp, status)
      setDraggedApp(null)
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STATUSES.map((status) => {
        const appsInStatus = applications.filter(
          (app) => app.status === status.value
        )

        return (
          <div
            key={status.value}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(status.value)}
            className={`flex-shrink-0 w-80 rounded-lg ${status.color} p-4`}
          >
            <div className="mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {status.label}
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {appsInStatus.length} {appsInStatus.length === 1 ? 'item' : 'items'}
              </p>
            </div>

            <div className="space-y-2">
              {appsInStatus.map((app) => (
                <div
                  key={app.id}
                  draggable
                  onDragStart={() => handleDragStart(app.id)}
                  onClick={() => setSelectedApp(app)}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <ApplicationCard application={app} profileId={profileId} />
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {selectedApp && (
        <ApplicationDetailPanel
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}
