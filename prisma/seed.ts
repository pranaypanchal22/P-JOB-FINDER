import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.gmailMessage.deleteMany()
  await prisma.gmailAccount.deleteMany()
  await prisma.applicationEvent.deleteMany()
  await prisma.application.deleteMany()
  await prisma.resumeVersion.deleteMany()
  await prisma.jobScore.deleteMany()
  await prisma.job.deleteMany()
  await prisma.setting.deleteMany()
  await prisma.userProfile.deleteMany()

  // Create test profile
  const profile = await prisma.userProfile.create({
    data: {
      name: 'Alex Johnson',
      email: 'alex@example.com',
      phone: '555-0123',
      location: 'San Francisco, CA',
      linkedinUrl: 'https://linkedin.com/in/alexjohnson',
      githubUrl: 'https://github.com/alexjohnson',
      portfolioUrl: 'https://alexjohnson.dev',
      workAuthorization: 'US Citizen',
      sponsorshipNeeds: false,
      targetRoles: JSON.stringify(['DevOps Engineer', 'SRE', 'Cloud Infrastructure']),
      targetLocations: JSON.stringify(['San Francisco', 'Remote', 'New York']),
      remotePreference: 'flexible',
      skills: JSON.stringify(['Kubernetes', 'Docker', 'Terraform', 'AWS', 'GCP', 'Python', 'Go', 'CI/CD']),
      tools: JSON.stringify(['Jenkins', 'GitLab CI', 'GitHub Actions', 'ArgoCD', 'Prometheus', 'Grafana']),
      cloudPlatforms: JSON.stringify(['AWS', 'GCP', 'Azure']),
      programmingLanguages: JSON.stringify(['Python', 'Go', 'Bash', 'JavaScript', 'TypeScript']),
      certifications: JSON.stringify(['AWS Solutions Architect Associate', 'CKA']),
      education: JSON.stringify([
        {
          school: 'UC Berkeley',
          degree: 'B.S.',
          field: 'Computer Science',
          graduated: '2018',
        },
      ]),
      structuredResumeJson: JSON.stringify({
        contact: {
          name: 'Alex Johnson',
          email: 'alex@example.com',
          phone: '555-0123',
          location: 'San Francisco, CA',
        },
        summary: 'DevOps engineer with 6 years of experience in cloud infrastructure, containerization, and CI/CD pipelines.',
        skills: [
          { category: 'Cloud Platforms', items: ['AWS', 'GCP', 'Azure'] },
          { category: 'Containerization', items: ['Docker', 'Kubernetes'] },
          { category: 'IaC', items: ['Terraform', 'CloudFormation'] },
          { category: 'Languages', items: ['Python', 'Go', 'Bash'] },
        ],
        experience: [
          {
            company: 'TechCorp',
            title: 'Senior DevOps Engineer',
            location: 'San Francisco, CA',
            start: '2021-01',
            end: null,
            description: 'Lead infrastructure modernization efforts',
            highlights: [
              'Reduced deployment time by 60% through CI/CD optimization',
              'Managed Kubernetes clusters with 200+ nodes',
              'Mentored team of 4 engineers',
            ],
          },
          {
            company: 'CloudStart',
            title: 'DevOps Engineer',
            location: 'Remote',
            start: '2019-03',
            end: '2020-12',
            description: 'Automated cloud infrastructure provisioning',
            highlights: [
              'Implemented IaC with Terraform for AWS infrastructure',
              'Set up CI/CD pipelines using GitHub Actions',
              'Reduced infrastructure costs by 40%',
            ],
          },
        ],
        education: [
          {
            school: 'UC Berkeley',
            degree: 'B.S.',
            field: 'Computer Science',
            graduated: '2018',
          },
        ],
        certifications: ['AWS Solutions Architect Associate', 'CKA'],
        projects: [],
        links: [],
        awards: [],
        customSections: [],
      }),
    },
  })

  console.log(`✓ Created profile: ${profile.email}`)

  // Create test jobs
  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        source: 'remoteok',
        sourceJobId: 'remoteok-001',
        title: 'DevOps Engineer',
        company: 'TechVision Inc',
        normalizedTitle: 'devops engineer',
        normalizedCompany: 'techvision inc',
        location: 'Remote',
        remoteType: 'remote',
        employmentType: 'full-time',
        description: 'We are looking for an experienced DevOps engineer to join our infrastructure team...',
        requirements: 'Kubernetes, Docker, AWS, Terraform, 5+ years experience',
        url: 'https://remoteok.io/jobs/001',
        applyUrl: 'https://remoteok.io/apply/001',
        postedAt: new Date('2024-01-15'),
        salaryMin: 120000,
        salaryMax: 160000,
        currency: 'USD',
        rawJson: JSON.stringify({ source: 'remoteok' }),
      },
    }),
    prisma.job.create({
      data: {
        source: 'manual',
        title: 'Senior SRE',
        company: 'CloudScale Systems',
        normalizedTitle: 'senior sre',
        normalizedCompany: 'cloudscale systems',
        location: 'New York, NY',
        remoteType: 'hybrid',
        employmentType: 'full-time',
        description: 'Lead SRE role managing infrastructure for high-scale systems...',
        requirements: 'Kubernetes, Go, monitoring experience',
        url: 'https://example.com/jobs/sre-001',
        postedAt: new Date('2024-01-20'),
        salaryMin: 150000,
        salaryMax: 200000,
        currency: 'USD',
        rawJson: JSON.stringify({ source: 'manual' }),
      },
    }),
    prisma.job.create({
      data: {
        source: 'remoteok',
        sourceJobId: 'remoteok-002',
        title: 'Cloud Infrastructure Engineer',
        company: 'DataFlow Inc',
        normalizedTitle: 'cloud infrastructure engineer',
        normalizedCompany: 'dataflow inc',
        location: 'Remote',
        remoteType: 'remote',
        employmentType: 'full-time',
        description: 'Build and maintain cloud infrastructure for big data platform...',
        requirements: 'AWS, GCP, Terraform, Python, 3+ years',
        url: 'https://remoteok.io/jobs/002',
        applyUrl: 'https://remoteok.io/apply/002',
        postedAt: new Date('2024-01-10'),
        salaryMin: 130000,
        salaryMax: 170000,
        currency: 'USD',
        rawJson: JSON.stringify({ source: 'remoteok' }),
      },
    }),
    prisma.job.create({
      data: {
        source: 'manual',
        title: 'Platform Engineer',
        company: 'Startup XYZ',
        normalizedTitle: 'platform engineer',
        normalizedCompany: 'startup xyz',
        location: 'San Francisco, CA',
        remoteType: 'onsite',
        employmentType: 'full-time',
        description: 'Build internal platform for engineering team...',
        requirements: 'Kubernetes, Python, gRPC',
        url: 'https://example.com/jobs/platform-001',
        postedAt: new Date('2024-01-18'),
        salaryMin: 110000,
        salaryMax: 150000,
        currency: 'USD',
        rawJson: JSON.stringify({ source: 'manual' }),
      },
    }),
  ])

  console.log(`✓ Created ${jobs.length} jobs`)

  // Create applications with different statuses
  const applications = await Promise.all([
    prisma.application.create({
      data: {
        jobId: jobs[0].id,
        profileId: profile.id,
        status: 'applied',
        dateSaved: new Date('2024-01-15'),
        dateApplied: new Date('2024-01-16'),
        recruiterName: 'Sarah Chen',
        recruiterEmail: 'sarah.chen@techvision.com',
        notes: 'Great fit for the role, waiting to hear back',
        nextFollowUpDate: new Date('2024-02-15'),
      },
    }),
    prisma.application.create({
      data: {
        jobId: jobs[1].id,
        profileId: profile.id,
        status: 'saved',
        dateSaved: new Date('2024-01-20'),
        notes: 'High priority - dream company',
      },
    }),
    prisma.application.create({
      data: {
        jobId: jobs[2].id,
        profileId: profile.id,
        status: 'interviewing',
        dateSaved: new Date('2024-01-12'),
        dateApplied: new Date('2024-01-13'),
        lastContactDate: new Date('2024-01-25'),
        recruiterName: 'Mike Johnson',
        recruiterEmail: 'mike@dataflow.io',
        nextFollowUpDate: new Date('2024-02-08'),
      },
    }),
  ])

  console.log(`✓ Created ${applications.length} applications`)

  // Create application events
  await prisma.applicationEvent.create({
    data: {
      applicationId: applications[0].id,
      type: 'status_change',
      title: 'Status changed to Applied',
      description: 'Application submitted to TechVision Inc',
      metadata: JSON.stringify({ from: 'saved', to: 'applied' }),
    },
  })

  await prisma.applicationEvent.create({
    data: {
      applicationId: applications[2].id,
      type: 'status_change',
      title: 'Status changed to Interviewing',
      description: 'First round interview scheduled',
      metadata: JSON.stringify({ from: 'applied', to: 'interviewing' }),
    },
  })

  console.log(`✓ Created application events`)

  console.log('✅ Seed complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
