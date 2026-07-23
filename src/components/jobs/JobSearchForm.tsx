'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Search, Loader } from 'lucide-react'

const SearchFormSchema = z.object({
  query: z.string().min(1, 'Search term required'),
  location: z.string().optional(),
  remote: z.boolean().optional(),
  datePosted: z.enum(['any', '24h', '7d', '30d']).default('any'),
  limit: z.number().int().min(1).max(100).default(50),
})

type SearchFormData = z.infer<typeof SearchFormSchema>

interface JobSearchFormProps {
  onSearch: (data: SearchFormData) => void
  isLoading: boolean
}

export function JobSearchForm({ onSearch, isLoading }: JobSearchFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<SearchFormData>({
    resolver: zodResolver(SearchFormSchema),
    defaultValues: {
      query: '',
      remote: true,
      datePosted: 'any',
      limit: 50,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSearch)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Job Title / Keywords
        </label>
        <input
          {...register('query')}
          type="text"
          placeholder="DevOps Engineer, Kubernetes, SRE..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {errors.query && (
          <p className="mt-1 text-sm text-red-500">{errors.query.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Location
          </label>
          <input
            {...register('location')}
            type="text"
            placeholder="San Francisco, CA"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Posted
          </label>
          <select
            {...register('datePosted')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="any">Any time</option>
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            {...register('remote')}
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Remote positions only
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
      >
        {isLoading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Search className="w-4 h-4" />
            Search Jobs
          </>
        )}
      </button>
    </form>
  )
}
