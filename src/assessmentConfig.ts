export type AssessmentQuestion = {
  id: string
  text: string
}

export type AssessmentCategory = {
  id: string
  name: string
  description: string
  questions: AssessmentQuestion[]
}

export const SCORE_OPTIONS = [
  { value: 1, label: 'Very Poor' },
  { value: 2, label: 'Poor' },
  { value: 3, label: 'Average' },
  { value: 4, label: 'Good' },
  { value: 5, label: 'Excellent' },
] as const

export const PROGRESS_THRESHOLDS = {
  warningMinimum: 50,
  successMinimum: 75,
} as const

// SAMPLE DATA: Replace these questions when the final assessment content is ready.
export const ASSESSMENT_CATEGORIES: AssessmentCategory[] = [
  {
    id: 'operations',
    name: 'Operations',
    description: 'How consistently day-to-day work is planned, completed, and improved.',
    questions: [
      'Our team follows documented operating procedures.',
      'Responsibilities and ownership are clear across the team.',
      'We track the most important operational performance measures.',
      'Recurring delays and bottlenecks are identified and addressed.',
      'Our current processes can support future growth.',
    ].map((text, questionIndex) => ({ id: `operations-${questionIndex + 1}`, text })),
  },
  {
    id: 'technology',
    name: 'Technology',
    description: 'How well technology supports productivity, visibility, and growth.',
    questions: [
      'Our systems reliably support the work our team performs.',
      'Important tools and systems work together effectively.',
      'Employees receive appropriate training on business technology.',
      'We can access accurate information when decisions need to be made.',
      'Our technology plan supports our future business goals.',
    ].map((text, questionIndex) => ({ id: `technology-${questionIndex + 1}`, text })),
  },
  {
    id: 'security',
    name: 'Security',
    description: 'How well information, systems, and business continuity are protected.',
    questions: [
      'Access to sensitive information is controlled and reviewed.',
      'Employees receive regular security awareness guidance.',
      'Critical information is backed up and recovery is tested.',
      'We have a clear plan for responding to a security incident.',
      'Security risks are reviewed as the business changes.',
    ].map((text, questionIndex) => ({ id: `security-${questionIndex + 1}`, text })),
  },
  {
    id: 'processes',
    name: 'Processes',
    description: 'How clearly work moves from request to completion across the organization.',
    questions: [
      'Core workflows are documented and easy to understand.',
      'Teams use consistent methods to complete recurring work.',
      'Handoffs between people or departments are reliable.',
      'We regularly review processes for improvement opportunities.',
      'Process changes are communicated and adopted successfully.',
    ].map((text, questionIndex) => ({ id: `processes-${questionIndex + 1}`, text })),
  },
  {
    id: 'customer-experience',
    name: 'Customer Experience',
    description: 'How consistently the organization understands and serves its customers.',
    questions: [
      'We understand what matters most to our customers.',
      'Customers receive a consistent experience across interactions.',
      'Customer feedback is collected and reviewed regularly.',
      'Problems are resolved quickly with clear ownership.',
      'We use customer insights to improve products or services.',
    ].map((text, questionIndex) => ({ id: `customer-experience-${questionIndex + 1}`, text })),
  },
]
