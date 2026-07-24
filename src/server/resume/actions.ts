'use server'

import { prisma } from '../../lib/db'
import { logger } from '../../lib/logger'
import { tailorResume } from './tailor'
import { generateATSHtml, generatePdfFilename } from './pdf'
import crypto from 'crypto'

export async function tailorResumeForJob(
  profileId: string,
  jobId: string,
  jobTitle: string,
  jobDescription: string,
  desiredSkills: string[]
) {
  try {
    // Get profile with structured resume
    const profile = await prisma.userProfile.findUnique({
      where: { id: profileId },
    })

    if (!profile) throw new Error('Profile not found')

    const structuredResume = JSON.parse(profile.structuredResumeJson || '{}')
    if (!structuredResume || Object.keys(structuredResume).length === 0) {
      throw new Error('No structured resume found')
    }

    // Tailor resume
    const tailored = tailorResume(structuredResume, jobTitle, jobDescription, desiredSkills)

    // Generate HTML
    const htmlContent = generateATSHtml(tailored.tailoredResume)

    // Calculate hash of base resume for tracking changes
    const baseResumeHash = crypto
      .createHash('sha256')
      .update(profile.structuredResumeJson || '')
      .digest('hex')

    // Generate PDF filename
    const pdfFilename = generatePdfFilename(
      structuredResume.contact?.name?.split(' ')[0] || 'FirstName',
      structuredResume.contact?.name?.split(' ').pop() || 'LastName',
      jobTitle.split(' ')[0], // Company would come from job, using title for now
      jobTitle
    )

    // Save to database
    const resumeVersion = await prisma.resumeVersion.create({
      data: {
        profileId,
        jobId,
        baseResumeHash,
        tailoredResumeJson: JSON.stringify(tailored.tailoredResume),
        htmlPath: `/api/resume/${jobId}/preview.html`, // Virtual path
        pdfPath: `/api/resume/${jobId}/${pdfFilename}`, // Virtual path
        changeSummary: JSON.stringify(tailored.changeSummary),
        keywordReport: JSON.stringify(tailored.keywordReport),
        truthCheckReport: JSON.stringify(tailored.truthCheckReport),
      },
    })

    logger.info(`Tailored resume for job ${jobId}: ${resumeVersion.id}`)

    return {
      success: true,
      resumeVersionId: resumeVersion.id,
      tailored,
      htmlContent,
      pdfFilename,
      warnings: tailored.warnings,
    }
  } catch (error) {
    logger.error('Error tailoring resume', error)
    throw error
  }
}

export async function getResumeVersion(resumeVersionId: string) {
  try {
    const version = await prisma.resumeVersion.findUnique({
      where: { id: resumeVersionId },
      include: { job: true, profile: true },
    })

    if (!version) throw new Error('Resume version not found')

    return version
  } catch (error) {
    logger.error('Error fetching resume version', error)
    throw error
  }
}

export async function listResumeVersionsForJob(jobId: string) {
  try {
    const versions = await prisma.resumeVersion.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' },
    })
    return versions
  } catch (error) {
    logger.error('Error listing resume versions', error)
    return []
  }
}
