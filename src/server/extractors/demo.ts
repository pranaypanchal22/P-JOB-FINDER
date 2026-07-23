import { JobExtractor, JobSearchInput, ExtractedJob } from './types'

const DEMO_JOBS: ExtractedJob[] = [
  {
    source: 'demo',
    sourceJobId: 'demo-1',
    title: 'Senior DevOps Engineer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    remoteType: 'remote',
    url: 'https://example.com/demo-1',
    description: 'Looking for experienced DevOps engineer with Kubernetes expertise',
    postedAt: new Date(Date.now() - 86400000).toISOString(),
    salaryMin: 150000,
    salaryMax: 200000,
    currency: 'USD',
    raw: {},
  },
  {
    source: 'demo',
    sourceJobId: 'demo-2',
    title: 'Cloud Infrastructure Engineer',
    company: 'CloudPlatform Inc',
    location: 'Remote',
    remoteType: 'remote',
    url: 'https://example.com/demo-2',
    description: 'Build and maintain cloud infrastructure on AWS. Python and Terraform skills required.',
    postedAt: new Date(Date.now() - 172800000).toISOString(),
    salaryMin: 130000,
    salaryMax: 180000,
    currency: 'USD',
    raw: {},
  },
  {
    source: 'demo',
    sourceJobId: 'demo-3',
    title: 'SRE (Site Reliability Engineer)',
    company: 'FinanceApps',
    location: 'New York, NY',
    remoteType: 'hybrid',
    url: 'https://example.com/demo-3',
    description: 'Join our SRE team. Experience with monitoring, incident response, and Python automation.',
    postedAt: new Date(Date.now() - 259200000).toISOString(),
    salaryMin: 140000,
    salaryMax: 190000,
    currency: 'USD',
    raw: {},
  },
  {
    source: 'demo',
    sourceJobId: 'demo-4',
    title: 'Backend Engineer (Python)',
    company: 'DataSystems',
    location: 'Austin, TX',
    remoteType: 'remote',
    url: 'https://example.com/demo-4',
    description: 'Python backend engineer. Work on scalable systems. Docker and Kubernetes experience a plus.',
    postedAt: new Date(Date.now() - 345600000).toISOString(),
    salaryMin: 120000,
    salaryMax: 160000,
    currency: 'USD',
    raw: {},
  },
  {
    source: 'demo',
    sourceJobId: 'demo-5',
    title: 'DevOps/SRE Lead',
    company: 'StartupXYZ',
    location: 'Seattle, WA',
    remoteType: 'remote',
    url: 'https://example.com/demo-5',
    description: 'Lead our DevOps and SRE efforts. Manage team of 3-4. Infrastructure automation focus.',
    postedAt: new Date(Date.now() - 432000000).toISOString(),
    salaryMin: 160000,
    salaryMax: 220000,
    currency: 'USD',
    raw: {},
  },
]

export const demoExtractor: JobExtractor = {
  name: 'Demo',
  enabled: false,
  async search(input: JobSearchInput): Promise<ExtractedJob[]> {
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay

    const query = input.query.toLowerCase()
    const filtered = DEMO_JOBS.filter(job => {
      const matchesQuery =
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query)

      const matchesLocation = !input.location || job.location.toLowerCase().includes(input.location.toLowerCase())

      const matchesRemote = !input.remote || job.remoteType !== 'office'

      return matchesQuery && matchesLocation && matchesRemote
    })

    return filtered.slice(0, input.limit ?? 50)
  },
}
