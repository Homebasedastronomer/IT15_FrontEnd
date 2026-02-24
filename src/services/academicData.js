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
    yearLevels: {
      '1st Year': ['IT101 - Introduction to Computing', 'IT102 - Computer Programming 1'],
      '2nd Year': ['IT201 - Data Structures and Algorithms', 'IT202 - Database Management Systems'],
      '3rd Year': ['IT301 - Web Systems and Technologies', 'IT302 - Information Assurance and Security'],
      '4th Year': ['IT401 - Capstone Project 1', 'IT402 - Capstone Project 2'],
    },
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
    yearLevels: {
      '1st Year': ['CS101 - Discrete Mathematics', 'CS102 - Computer Programming 1'],
      '2nd Year': ['CS201 - Object Oriented Programming', 'CS202 - Computer Organization'],
      '3rd Year': ['CS301 - Automata Theory', 'CS302 - Software Engineering'],
      '4th Year': ['CS401 - Thesis 1', 'CS402 - Thesis 2'],
    },
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
    yearLevels: {
      '1st Year': ['IS101 - Introduction to Information Systems', 'IS102 - Fundamentals of Business'],
      '2nd Year': ['IS201 - Systems Analysis and Design', 'IS202 - Database Systems'],
      '3rd Year': ['IS301 - Enterprise Architecture', 'IS302 - Business Intelligence'],
      '4th Year': ['IS401 - Project Management', 'IS402 - Systems Integration'],
    },
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
    yearLevels: {
      '1st Year': ['DIT101 - Computer Fundamentals', 'DIT102 - Productivity Tools'],
      '2nd Year': ['DIT201 - Technical Support', 'DIT202 - Basic Web Development'],
    },
    createdAt: '2026-01-22',
  },
]

const subjects = [
  {
    id: 's-1',
    code: 'IT101',
    title: 'Introduction to Computing',
    units: 3,
    offeredIn: '1st Semester',
    termIndicator: 'Per Semester',
    programCode: 'BSIT',
    description: 'Foundational concepts in computer systems, software, and digital literacy.',
    prerequisites: [],
    corequisites: [],
    createdAt: '2026-02-20',
  },
  {
    id: 's-2',
    code: 'IT201',
    title: 'Data Structures and Algorithms',
    units: 3,
    offeredIn: '2nd Semester',
    termIndicator: 'Per Semester',
    programCode: 'BSIT',
    description: 'Abstract data types, algorithm analysis, and problem-solving techniques.',
    prerequisites: ['IT102'],
    corequisites: [],
    createdAt: '2026-02-18',
  },
  {
    id: 's-3',
    code: 'CS301',
    title: 'Automata Theory',
    units: 3,
    offeredIn: '1st Term',
    termIndicator: 'Per Term',
    programCode: 'BSCS',
    description: 'Finite automata, regular languages, and computation models.',
    prerequisites: ['CS201'],
    corequisites: [],
    createdAt: '2026-02-12',
  },
  {
    id: 's-4',
    code: 'IS301',
    title: 'Enterprise Architecture',
    units: 3,
    offeredIn: '2nd Term',
    termIndicator: 'Per Term',
    programCode: 'BSIS',
    description: 'Strategic alignment of business processes and information systems.',
    prerequisites: ['IS201'],
    corequisites: ['IS202'],
    createdAt: '2026-02-09',
  },
  {
    id: 's-5',
    code: 'IT302',
    title: 'Information Assurance and Security',
    units: 3,
    offeredIn: '2nd Semester',
    termIndicator: 'Both',
    programCode: 'BSIT',
    description: 'Cybersecurity principles, risk management, and secure systems practices.',
    prerequisites: ['IT201'],
    corequisites: [],
    createdAt: '2026-02-17',
  },
  {
    id: 's-6',
    code: 'DIT202',
    title: 'Basic Web Development',
    units: 2,
    offeredIn: 'Summer Term',
    termIndicator: 'Both',
    programCode: 'DIT',
    description: 'Introductory web development with HTML, CSS, and JavaScript basics.',
    prerequisites: [],
    corequisites: [],
    createdAt: '2026-01-25',
  },
]

export async function getPrograms() {
  await wait()
  return programs
}

export async function getSubjects() {
  await wait(260)
  return subjects
}