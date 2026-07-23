import { google } from 'googleapis'
import { logger } from '@/lib/logger'

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
)

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

export function getAuthUrl(): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  })
}

export async function getTokenFromCode(code: string) {
  try {
    const { tokens } = await oauth2Client.getToken(code)
    logger.info('OAuth tokens obtained')
    return tokens
  } catch (error) {
    logger.error('Error getting OAuth tokens', error)
    throw error
  }
}

export async function getGmailClient(accessToken: string) {
  oauth2Client.setCredentials({
    access_token: accessToken,
  })
  return google.gmail({ version: 'v1', auth: oauth2Client })
}
