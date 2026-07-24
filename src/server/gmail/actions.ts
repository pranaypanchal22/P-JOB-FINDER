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

    const existing = await prisma.gmailAccount.findFirst({
      where: { profileId },
    })

    if (existing) {
      await prisma.gmailAccount.update({
        where: { id: existing.id },
        data: {
          accessTokenEncrypted: tokens.access_token,
          refreshTokenEncrypted: tokens.refresh_token || '',
          tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
        },
      })
    } else {
      await prisma.gmailAccount.create({
        data: {
          profileId,
          email: '', // Will be populated on sync
          accessTokenEncrypted: tokens.access_token,
          refreshTokenEncrypted: tokens.refresh_token || '',
          tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
        },
      })
    }

    logger.info(`Gmail account connected for profile ${profileId}`)
    return { success: true }
  } catch (error) {
    logger.error('Error connecting Gmail account', error)
    throw error
  }
}

export async function syncGmailToApplications(profileId: string) {
  try {
    const gmailAccount = await prisma.gmailAccount.findFirst({
      where: { profileId },
    })

    if (!gmailAccount?.accessTokenEncrypted) {
      throw new Error('Gmail account not connected')
    }

    const gmail = await getGmailClient(gmailAccount.accessTokenEncrypted)
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
          type: 'status_change',
          title: `Status changed to ${match.status}`,
          metadata: JSON.stringify({
            from: 'email_sync',
            reason: match.message,
            source: 'Gmail',
          }),
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
    const gmailAccount = await prisma.gmailAccount.findFirst({
      where: { profileId },
    })

    if (!gmailAccount) {
      throw new Error('Gmail account not found')
    }

    await prisma.gmailAccount.delete({
      where: { id: gmailAccount.id },
    })

    logger.info(`Gmail account disconnected for profile ${profileId}`)
    return { success: true }
  } catch (error) {
    logger.error('Error disconnecting Gmail account', error)
    throw error
  }
}
