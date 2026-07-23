import { logger } from '@/lib/logger'

/**
 * Generate PDF filename following convention: FirstName_LastName_Company_Role_Tailored_CV.pdf
 */
export function generatePdfFilename(
  firstName: string,
  lastName: string,
  company: string,
  role: string
): string {
  const sanitize = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '')
  return `${sanitize(firstName)}_${sanitize(lastName)}_${sanitize(company)}_${sanitize(role)}_Tailored_CV.pdf`
}

/**
 * Convert resume JSON to ATS-compliant HTML suitable for PDF export.
 * Single column, no tables, no graphics, standard fonts, plain bullets.
 */
export function generateATSHtml(resumeData: any): string {
  const contact = resumeData.contact || {}
  const summary = resumeData.summary || ''
  const skills = resumeData.skills || []
  const experience = resumeData.experience || []
  const education = resumeData.education || []
  const certifications = resumeData.certifications || []

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${contact.name || 'Resume'}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.4;
      max-width: 8.5in;
      margin: 0.5in;
      color: #000;
      background: #fff;
    }
    h1 { font-size: 16pt; margin: 0 0 3pt 0; text-align: center; }
    h2 { font-size: 12pt; margin: 10pt 0 6pt 0; border-bottom: 1pt solid #000; }
    p { margin: 0 0 6pt 0; }
    ul { margin: 6pt 0 6pt 20pt; padding: 0; }
    li { margin: 0 0 3pt 0; }
    .contact { text-align: center; font-size: 10pt; margin: 0 0 12pt 0; }
    .contact-item { display: inline; margin: 0 10pt 0 0; }
    .job-header { font-weight: bold; margin: 6pt 0 2pt 0; }
    .job-meta { font-size: 10pt; color: #333; margin: 0 0 4pt 0; }
  </style>
</head>
<body>
  <!-- Contact -->
  <h1>${contact.name || ''}</h1>
  <div class="contact">
    ${contact.email ? `<span class="contact-item">${contact.email}</span>` : ''}
    ${contact.phone ? `<span class="contact-item">${contact.phone}</span>` : ''}
    ${contact.location ? `<span class="contact-item">${contact.location}</span>` : ''}
  </div>

  <!-- Summary -->
  ${summary ? `<p>${summary}</p>` : ''}

  <!-- Skills -->
  ${
    skills && skills.length > 0
      ? `
  <h2>SKILLS</h2>
  ${skills.map((s: any) => {
    if (typeof s === 'string') return `<p>${s}</p>`
    if (s.category && s.items) {
      return `<p><strong>${s.category}:</strong> ${s.items.join(', ')}</p>`
    }
    return ''
  }).join('')}
  `
      : ''
  }

  <!-- Experience -->
  ${
    experience && experience.length > 0
      ? `
  <h2>EXPERIENCE</h2>
  ${experience
    .map(
      (job: any) => `
  <div class="job-header">${job.title}${job.company ? ` at ${job.company}` : ''}</div>
  <div class="job-meta">
    ${job.location ? job.location : ''}
    ${job.start ? `| ${job.start}${job.end ? ` - ${job.end}` : ''}` : ''}
  </div>
  ${job.description ? `<p>${job.description}</p>` : ''}
  ${
    job.highlights && job.highlights.length > 0
      ? `<ul>${job.highlights.map((h: string) => `<li>${h}</li>`).join('')}</ul>`
      : ''
  }
  `
    )
    .join('')}
  `
      : ''
  }

  <!-- Education -->
  ${
    education && education.length > 0
      ? `
  <h2>EDUCATION</h2>
  ${education
    .map(
      (edu: any) => `
  <div class="job-header">${edu.degree || ''}${edu.field ? ` in ${edu.field}` : ''}</div>
  <p>${edu.school || ''}${edu.graduated ? ` | ${edu.graduated}` : ''}</p>
  `
    )
    .join('')}
  `
      : ''
  }

  <!-- Certifications -->
  ${
    certifications && certifications.length > 0
      ? `
  <h2>CERTIFICATIONS</h2>
  <ul>
  ${certifications.map((c: string) => `<li>${c}</li>`).join('')}
  </ul>
  `
      : ''
  }
</body>
</html>
  `.trim()

  return html
}

/**
 * Stub: In production, use Puppeteer to generate PDF from HTML.
 * For now, just return a flag that PDF generation is needed.
 */
export async function generatePDF(_html: string, filename: string): Promise<Buffer> {
  logger.info(`PDF generation stub: ${filename}`)
  // In production: use Puppeteer or similar
  // const browser = await puppeteer.launch();
  // const page = await browser.newPage();
  // await page.setContent(html);
  // const pdf = await page.pdf({ format: 'A4' });
  // await browser.close();
  // return pdf;

  // Stub: return empty buffer
  return Buffer.from('PDF generation stub - implement with Puppeteer or similar')
}
