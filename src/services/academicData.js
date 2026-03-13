const wait = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms))

const programs = [
  {
    id: 'p-1',
    code: 'BSIT',
    name: 'Bachelor of Science in Information Technology',
    type: "Bachelor's",
    duration: '4 Years',
    totalUnits: 162,
    status: 'Active',
    description:
      'A program focused on software development, networking, and systems administration for industry-ready IT professionals.',
    createdAt: '2026-02-19',
  },
  {
    id: 'p-2',
    code: 'BSCS',
    name: 'Bachelor of Science in Computer Science',
    type: "Bachelor's",
    duration: '4 Years',
    totalUnits: 165,
    status: 'Active',
    description:
      'A computing program centered on algorithms, artificial intelligence, and software engineering foundations.',
    createdAt: '2026-02-14',
  },
  {
    id: 'p-3',
    code: 'BSIS',
    name: 'Bachelor of Science in Information Systems',
    type: "Bachelor's",
    duration: '4 Years',
    totalUnits: 160,
    status: 'Under Review',
    description:
      'A blend of business processes and information technology with focus on enterprise systems and analytics.',
    createdAt: '2026-02-10',
  },
  {
    id: 'p-4',
    code: 'DIT',
    name: 'Diploma in Information Technology',
    type: 'Diploma',
    duration: '2 Years',
    totalUnits: 96,
    status: 'Phased Out',
    description:
      'A two-year diploma covering practical IT skills in support, productivity tools, and basic development.',
    createdAt: '2026-01-22',
  },
  {
    id: 'p-5',
    code: 'BSCE',
    name: 'Bachelor of Science in Computer Engineering',
    type: "Bachelor's",
    duration: '4 Years',
    totalUnits: 168,
    status: 'Active',
    description:
      'An engineering-centered program combining hardware systems, embedded software, and computing architecture.',
    createdAt: '2026-02-06',
  },
  {
    id: 'p-6',
    code: 'BSCY',
    name: 'Bachelor of Science in Cybersecurity',
    type: "Bachelor's",
    duration: '4 Years',
    totalUnits: 164,
    status: 'Active',
    description:
      'A security-focused program covering threat defense, incident response, digital forensics, and governance.',
    createdAt: '2026-02-04',
  },
  {
    id: 'p-7',
    code: 'BSDA',
    name: 'Bachelor of Science in Data Analytics',
    type: "Bachelor's",
    duration: '4 Years',
    totalUnits: 161,
    status: 'Active',
    description:
      'A data program focused on statistics, data engineering, machine learning, and business intelligence.',
    createdAt: '2026-02-02',
  },
  {
    id: 'p-8',
    code: 'BSSE',
    name: 'Bachelor of Science in Software Engineering',
    type: "Bachelor's",
    duration: '4 Years',
    totalUnits: 166,
    status: 'Active',
    description:
      'A software lifecycle-focused program emphasizing architecture, testing, delivery, and product quality.',
    createdAt: '2026-01-31',
  },
]

const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year']

const courseBlueprintByYear = {
  '1st Year': [
    'Fundamentals of Computing',
    'Programming Logic and Design',
    'Digital Systems and Productivity',
    'Mathematics for Computing',
    'Communication and Technical Writing',
  ],
  '2nd Year': [
    'Data Structures and Algorithms',
    'Object-Oriented Programming',
    'Database Systems',
    'Human-Computer Interaction',
    'Networking Essentials',
  ],
  '3rd Year': [
    'Web Application Development',
    'Information Security and Governance',
    'Systems Analysis and Design',
    'Cloud and Distributed Systems',
    'Research Methods in IT',
  ],
  '4th Year': [
    'Advanced Topics Seminar',
    'Capstone Project 1',
    'Capstone Project 2',
    'Professional Practice and Ethics',
    'Industry Internship',
  ],
}

const toYearDigit = (yearLevel) => {
  if (yearLevel === '1st Year') return 1
  if (yearLevel === '2nd Year') return 2
  if (yearLevel === '3rd Year') return 3
  return 4
}

const offeredInByIndex = ['1st Semester', '1st Semester', '2nd Semester', '2nd Semester', 'Summer Term']

const subjects = programs.flatMap((program, programIndex) => {
  return yearLevels.flatMap((yearLevel) => {
    return courseBlueprintByYear[yearLevel].map((courseTitle, courseIndex) => {
      const yearDigit = toYearDigit(yearLevel)
      const subjectCode = `${program.code}${yearDigit}${String(courseIndex + 1).padStart(2, '0')}`

      return {
        id: `s-${programIndex + 1}-${yearDigit}-${courseIndex + 1}`,
        code: subjectCode,
        title: `${courseTitle} (${program.code})`,
        units: courseIndex === 4 ? 2 : 3,
        yearLevel,
        offeredIn: offeredInByIndex[courseIndex],
        termIndicator: 'Per Semester',
        programCode: program.code,
        description: `${courseTitle} course under ${program.name}.`,
        prerequisites: yearDigit > 1 && courseIndex < 2 ? [`${program.code}${yearDigit - 1}0${courseIndex + 1}`] : [],
        createdAt: '2026-03-13',
      }
    })
  })
})

export async function getPrograms() {
  await wait()
  return programs
}

export async function getSubjects() {
  await wait(260)
  return subjects
}