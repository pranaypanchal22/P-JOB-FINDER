'use client'

import { useEffect, useState } from 'react'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { getProfile, saveProfile } from '@/server/profile/actions'
import { UserProfile } from '@prisma/client'

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      const p = await getProfile()
      setProfile(p)
    }
    loadProfile()
  }, [])

  async function handleSave(data: any) {
    setIsLoading(true)
    try {
      const result = await saveProfile(data)
      if (result.success) {
        alert('Profile saved successfully')
        const updated = await getProfile()
        setProfile(updated)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your professional information</p>
      </div>

      <ProfileForm
        initialData={profile || undefined}
        onSave={handleSave}
        isLoading={isLoading}
      />
    </div>
  )
}
