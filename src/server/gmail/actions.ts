'use server'

import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import { getAuthUrl, getTokenFromCode, getGmailClient } from './auth'
import { syncGmailEmails } from './sync'

export async function getGmailAuthUrl(): Promise<string> {
  return getAuthUrl()
}

export async function connectGmailAccount(profileId: string, code: string) {
  try {
    const tokens = await getTokenFromCode(code)

    if (!tokens.access_token) {
      throw new Error('No access token received')
    }

    await prisma.gmailAccount.upsert({
      where: { profileId },
      create: {
        profileId,
        email: '', // Will be populated on sync
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || '',
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || '',
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
      },
    })

    logger.info(`Gmail account connected for profile ${profileId}`)
    return { success: true }
  } catch (error) {
    logger.error('Error connecting Gmail account', error)
    throw error
  }
}

export async function syncGmailToApplications(profileId: string) {
  try {
    const gmailAccount = await prisma.gmailAccount.findUnique({
      where: { profileId },
    })

    if (!gmailAccount?.accessToken) {
      throw new Error('Gmail account not connected')
    }

    const gmail = await getGmailClient(gmailAccount.accessToken)
    const matches = await syncGmailEmails(profileId, gmail)

    // Auto-update applications based on email matches
    for (const match of matches) {
      await prisma.application.update({
        where: { id: match.applicationId },
        data: { status: match.status },
      })

      await prisma.applicationEvent.create({
        data: {
          applicationId: match.applicationId,
          eventType: 'status_change',
          details: {
            from: 'email_sync',
            reason: match.message,
            source: 'Gmail',
          },
        },
      })
    }

    logger.info(`Synced ${matches.length} email updates for profile ${profileId}`)
    return { synced: matches.length, matches }
  } catch (error) {
    logger.error('Error syncing Gmail to applications', error)
    throw error
  }
}

export async function disconnectGmailAccount(profileId: string) {
  try {
    await prisma.gmailAccount.delete({
      where: { profileId },
    })

    logger.info(`Gmail account disconnected for profile ${profileId}`)
    return { success: true }
  } catch (error) {
    logger.error('Error disconnecting Gmail account', error)
    throw error
  }
}
