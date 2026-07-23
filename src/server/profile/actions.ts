'use server'

import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

export async function saveProfile(data: any) {
  try {
    const existing = await prisma.userProfile.findFirst({
      where: { email: data.email },
    })

    if (existing) {
      const updated = await prisma.userProfile.update({
        where: { id: existing.id },
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          location: data.location,
          linkedinUrl: data.linkedinUrl,
          githubUrl: data.githubUrl,
          portfolioUrl: data.portfolioUrl,
          workAuthorization: data.workAuthorization,
          sponsorshipNeeds: data.sponsorshipNeeds,
          targetRoles: data.targetRoles,
          targetLocations: data.targetLocations,
          remotePreference: data.remotePreference,
          skills: data.skills,
          tools: data.tools,
          cloudPlatforms: data.cloudPlatforms,
          programmingLanguages: data.programmingLanguages,
          certifications: data.certifications,
        },
      })
      logger.info(`Profile updated: ${updated.email}`)
      return { success: true, profileId: updated.id }
    } else {
      const created = await prisma.userProfile.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          location: data.location,
          linkedinUrl: data.linkedinUrl,
          githubUrl: data.githubUrl,
          portfolioUrl: data.portfolioUrl,
          workAuthorization: data.workAuthorization,
          sponsorshipNeeds: data.sponsorshipNeeds,
          targetRoles: data.targetRoles,
          targetLocations: data.targetLocations,
          remotePreference: data.remotePreference,
          skills: data.skills,
          tools: data.tools,
          cloudPlatforms: data.cloudPlatforms,
          programmingLanguages: data.programmingLanguages,
          certifications: data.certifications,
        },
      })
      logger.info(`Profile created: ${created.email}`)
      return { success: true, profileId: created.id }
    }
  } catch (error) {
    logger.error('Error saving profile', error)
    throw error
  }
}

export async function getProfile(email?: string) {
  try {
    const profile = await prisma.userProfile.findFirst({
      where: email ? { email } : undefined,
      orderBy: { updatedAt: 'desc' },
    })
    return profile
  } catch (error) {
    logger.error('Error loading profile', error)
    return null
  }
}
