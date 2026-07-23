'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UserProfile } from '@prisma/client'
import { Loader } from 'lucide-react'

const ProfileSchema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  workAuthorization: z.string().optional(),
  sponsorshipNeeds: z.boolean().default(false),
  targetRoles: z.string().optional(),
  targetLocations: z.string().optional(),
  remotePreference: z.enum(['remote', 'hybrid', 'onsite', 'flexible']).default('flexible'),
  skills: z.string().optional(),
  tools: z.string().optional(),
  cloudPlatforms: z.string().optional(),
  programmingLanguages: z.string().optional(),
  certifications: z.string().optional(),
})

type ProfileFormData = z.infer<typeof ProfileSchema>

interface ProfileFormProps {
  initialData?: UserProfile
  onSave: (data: any) => Promise<void>
  isLoading?: boolean
}

export function ProfileForm({ initialData, onSave, isLoading = false }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      email: initialData.email,
      phone: initialData.phone || '',
      location: initialData.location || '',
      linkedinUrl: initialData.linkedinUrl || '',
      githubUrl: initialData.githubUrl || '',
      portfolioUrl: initialData.portfolioUrl || '',
      workAuthorization: initialData.workAuthorization || '',
      sponsorshipNeeds: initialData.sponsorshipNeeds,
      targetRoles: initialData.targetRoles,
      targetLocations: initialData.targetLocations,
      remotePreference: (initialData.remotePreference as any) || 'flexible',
      skills: initialData.skills,
      tools: initialData.tools,
      cloudPlatforms: initialData.cloudPlatforms,
      programmingLanguages: initialData.programmingLanguages,
      certifications: initialData.certifications,
    } : undefined,
  })

  async function handleSave(data: ProfileFormData) {
    try {
      await onSave({
        ...data,
        targetRoles: data.targetRoles ? JSON.stringify(data.targetRoles.split(',').map(r => r.trim())) : '[]',
        targetLocations: data.targetLocations ? JSON.stringify(data.targetLocations.split(',').map(l => l.trim())) : '[]',
        skills: data.skills ? JSON.stringify(data.skills.split(',').map(s => s.trim())) : '[]',
        tools: data.tools ? JSON.stringify(data.tools.split(',').map(t => t.trim())) : '[]',
        cloudPlatforms: data.cloudPlatforms ? JSON.stringify(data.cloudPlatforms.split(',').map(c => c.trim())) : '[]',
        programmingLanguages: data.programmingLanguages ? JSON.stringify(data.programmingLanguages.split(',').map(l => l.trim())) : '[]',
        certifications: data.certifications ? JSON.stringify(data.certifications.split(',').map(c => c.trim())) : '[]',
      })
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile')
    }
  }

  return (
    <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Basic Information
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name *
            </label>
            <input
              {...register('name')}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email *
            </label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone
            </label>
            <input
              {...register('phone')}
              type="tel"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Location
            </label>
            <input
              {...register('location')}
              type="text"
              placeholder="San Francisco, CA"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Work Authorization */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Work Authorization
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Authorization Status
            </label>
            <input
              {...register('workAuthorization')}
              type="text"
              placeholder="US Citizen, H1B eligible, etc."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              {...register('sponsorshipNeeds')}
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Visa sponsorship needed
            </span>
          </label>
        </div>
      </div>

      {/* Links */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Links
        </h2>
        <div className="space-y-3">
          <input
            {...register('linkedinUrl')}
            type="url"
            placeholder="LinkedIn URL"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <input
            {...register('githubUrl')}
            type="url"
            placeholder="GitHub URL"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <input
            {...register('portfolioUrl')}
            type="url"
            placeholder="Portfolio URL"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Target Roles & Locations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Job Preferences
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Roles (comma separated)
            </label>
            <input
              {...register('targetRoles')}
              type="text"
              placeholder="DevOps Engineer, SRE, Platform Engineer"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Locations (comma separated)
            </label>
            <input
              {...register('targetLocations')}
              type="text"
              placeholder="San Francisco, New York, Remote"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Remote Preference
            </label>
            <select
              {...register('remotePreference')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Skills & Technologies
        </h2>
        <div className="space-y-3">
          <textarea
            {...register('skills')}
            placeholder="Kubernetes, Docker, Terraform, AWS (comma separated)"
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />

          <textarea
            {...register('programmingLanguages')}
            placeholder="Python, Go, Bash, JavaScript (comma separated)"
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />

          <textarea
            {...register('tools')}
            placeholder="Jenkins, GitHub Actions, ArgoCD, Prometheus (comma separated)"
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />

          <textarea
            {...register('cloudPlatforms')}
            placeholder="AWS, GCP, Azure (comma separated)"
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />

          <textarea
            {...register('certifications')}
            placeholder="AWS Solutions Architect, CKA, CKAD (comma separated)"
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
      >
        {isLoading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Profile'
        )}
      </button>
    </form>
  )
}
