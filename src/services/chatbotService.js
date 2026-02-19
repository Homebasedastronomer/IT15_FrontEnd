const cannedResponses = [
  {
    keywords: ['deadline', 'when', 'cutoff'],
    reply:
      'Enrollment validation closes on February 28, 2026. Pending records should be finalized before 5:00 PM.',
  },
  {
    keywords: ['status', 'pending'],
    reply:
      'There are 312 pending enrollment requests. Priority programs this week are BSIT and BSBA for section balancing.',
  },
  {
    keywords: ['course', 'subject', 'slot'],
    reply:
      'Most sections are at 85-95% capacity. IT-331 and CS-305 may need overflow sections based on current projections.',
  },
  {
    keywords: ['report', 'analytics'],
    reply:
      'The latest utilization and demand reports were generated this week. You can review them under the Reports navigation tab.',
  },
]

export async function askEnrollmentBot(message) {
  await new Promise((resolve) => setTimeout(resolve, 650))

  const normalizedMessage = message.toLowerCase()
  const matched = cannedResponses.find((entry) =>
    entry.keywords.some((keyword) => normalizedMessage.includes(keyword)),
  )

  if (matched) {
    return matched.reply
  }

  return 'I can help with enrollment status, schedule timelines, course slots, and dashboard reports. Try asking about those topics.'
}