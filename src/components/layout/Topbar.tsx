'use client'

import React from 'react'
import { Bell, Menu } from 'lucide-react'

export function Topbar() {
  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="flex items-center gap-6">
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative">
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">AJ</span>
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-900 dark:text-white">Alex Johnson</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">alex@example.com</p>
          </div>
        </div>
      </div>
    </header>
  )
}
