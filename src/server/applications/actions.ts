'use server'

import { prisma } from '../../lib/db'
import { logger } from '../../lib/logger'

type Status = 'saved' | 'preparing' | 'applied' | 'interviewing' | 'assessment' | 'offer' | 'rejected' | 'withdrawn' | 'archived'

export async function updateApplicationStatus(
  applicationId: string,
  newStatus: Status
) {
  try {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
    })

    if (!app) throw new Error('Application not found')

    await prisma.application.update({
      where: { id: applicationId },
      data: { status: newStatus },
    })

    // Create event
    await prisma.applicationEvent.create({
      data: {
        applicationId,
        type: 'status_change',
        title: `Status changed to ${newStatus}`,
        description: `Changed from ${app.status} to ${newStatus}`,
        metadata: JSON.stringify({ from: app.status, to: newStatus }),
      },
    })

    logger.info(`Application ${applicationId} status updated to ${newStatus}`)
    return { success: true }
  } catch (error) {
    logger.error('Error updating application status', error)
    throw error
  }
}

export async function updateApplicationDetails(
  applicationId: string,
  data: {
    recruiterName?: string
    recruiterEmail?: string
    notes?: string
    nextFollowUpDate?: string
  }
) {
  try {
    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        recruiterName: data.recruiterName,
        recruiterEmail: data.recruiterEmail,
        notes: data.notes,
        nextFollowUpDate: data.nextFollowUpDate ? new Date(data.nextFollowUpDate) : undefined,
      },
    })

    logger.info(`Application ${applicationId} details updated`)
    return { success: true, application: updated }
  } catch (error) {
    logger.error('Error updating application details', error)
    throw error
  }
}

export async function getFirstProfileId(): Promise<string | null> {
  try {
    const profile = await prisma.userProfile.findFirst({
      orderBy: { createdAt: 'asc' },
    })
    return profile?.id || null
  } catch (error) {
    logger.error('Error fetching first profile', error)
    return null
  }
}

export async function getApplicationsWithJobs(profileId?: string) {
  try {
    // If no profileId provided, use first profile
    let actualProfileId = profileId
    if (!actualProfileId) {
      const firstProfile = await prisma.userProfile.findFirst({
        orderBy: { createdAt: 'asc' },
      })
      actualProfileId = firstProfile?.id
    }

    if (!actualProfileId) {
      return []
    }

    const applications = await prisma.application.findMany({
      where: { profileId: actualProfileId },
      include: { job: true },
      orderBy: { updatedAt: 'desc' },
    })
    return applications
  } catch (error) {
    logger.error('Error fetching applications', error)
    return []
  }
}

export async function markApplicationAsApplied(
  applicationId: string,
  data: {
    dateApplied: string
    recruiterName?: string
    recruiterEmail?: string
    notes?: string
    nextFollowUpDate?: string
  }
) {
  try {
    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: 'applied',
        dateApplied: new Date(data.dateApplied),
        recruiterName: data.recruiterName,
        recruiterEmail: data.recruiterEmail,
        notes: data.notes,
        nextFollowUpDate: data.nextFollowUpDate ? new Date(data.nextFollowUpDate) : undefined,
      },
    })

    await prisma.applicationEvent.create({
      data: {
        applicationId,
        type: 'status_change',
        title: 'Application submitted',
        description: `Marked as applied on ${data.dateApplied}`,
        metadata: JSON.stringify({ dateApplied: data.dateApplied }),
      },
    })

    logger.info(`Application ${applicationId} marked as applied`)
    return { success: true, application: updated }
  } catch (error) {
    logger.error('Error marking application as applied', error)
    throw error
  }
}
