import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import { gmail_v1 } from 'googleapis'

export interface EmailMatch {
  applicationId: string
  status: 'interviewing' | 'offer' | 'rejected'
  message: string
}

const statusPatterns = {
  interviewing: /interview|call|meeting|schedule|next round|phone screen/i,
  offer: /offer|excited to|welcome|congratulations|hired/i,
  rejected: /regret|unfortunately|not moving forward|declined/i,
}

export async function syncGmailEmails(
  _profileId: string,
  gmail: gmail_v1.Gmail
): Promise<EmailMatch[]> {
  try {
    const messages = await gmail.users.messages.list({
      userId: 'me',
      q: 'subject:(interview OR offer OR rejected OR feedback) -label:spam',
      maxResults: 50,
    })

    if (!messages.data.messages) return []

    const matches: EmailMatch[] = []

    for (const message of messages.data.messages) {
      if (!message.id) continue

      const full = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full',
      })

      const subject = getHeaderValue(full.data.payload?.headers, 'Subject')
      const from = getHeaderValue(full.data.payload?.headers, 'From')
      const body = getMessageBody(full.data.payload)

      const email = `${subject} ${body}`.toLowerCase()

      // Match status
      let detectedStatus: 'interviewing' | 'offer' | 'rejected' | null = null
      if (statusPatterns.rejected.test(email)) {
        detectedStatus = 'rejected'
      } else if (statusPatterns.offer.test(email)) {
        detectedStatus = 'offer'
      } else if (statusPatterns.interviewing.test(email)) {
        detectedStatus = 'interviewing'
      }

      if (!detectedStatus) continue

      // Find matching application
      const application = await prisma.application.findFirst({
        where: {
          job: {
            company: { contains: extractCompany(from) },
          },
        },
      })

      if (application) {
        matches.push({
          applicationId: application.id,
          status: detectedStatus,
          message: subject,
        })
      }
    }

    return matches
  } catch (error) {
    logger.error('Error syncing Gmail emails', error)
    throw error
  }
}

function getHeaderValue(headers: any[] | undefined, name: string): string {
  if (!headers) return ''
  return headers.find((h) => h.name === name)?.value || ''
}

function getMessageBody(payload: any): string {
  if (payload?.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64').toString()
      }
    }
  }
  return payload?.body?.data ? Buffer.from(payload.body.data, 'base64').toString() : ''
}

function extractCompany(from: string): string {
  const match = from.match(/@([^.]+)/)
  return match ? match[1] : ''
}
