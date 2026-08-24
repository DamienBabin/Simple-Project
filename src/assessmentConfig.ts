export type AssessmentQuestion = {
  id: string
  text: string
}

export type AssessmentCategory = {
  id: string
  code: 'S' | 'I' | 'M' | 'P' | 'L' | 'E'
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
    id: 'social-security',
    code: 'S',
    name: 'Social Security',
    description: 'How clearly Social Security benefits and claiming decisions fit the retirement plan.',
    questions: [
      'We understand our estimated Social Security benefits at different claiming ages.',
      'We have discussed when each household member should consider claiming benefits.',
      'Our plan considers spousal and survivor benefit options.',
      'We understand how earned income, taxes, and Medicare may affect our benefits.',
      'Our Social Security strategy is reviewed when our circumstances or rules change.',
    ].map((text, questionIndex) => ({ id: `social-security-${questionIndex + 1}`, text })),
  },
  {
    id: 'income-planning',
    code: 'I',
    name: 'Income Planning',
    description: 'How prepared the household is to create reliable, sustainable retirement income.',
    questions: [
      'We have documented our expected essential and discretionary retirement expenses.',
      'We understand which income sources are guaranteed and which may vary.',
      'We have a coordinated plan for withdrawals from our retirement accounts.',
      'Our income plan accounts for inflation and a potentially long retirement.',
      'We know how unexpected expenses or income changes would be handled.',
    ].map((text, questionIndex) => ({ id: `income-planning-${questionIndex + 1}`, text })),
  },
  {
    id: 'market-risk',
    code: 'M',
    name: 'Market Risk',
    description: 'How well investment risk is understood, managed, and aligned with retirement goals.',
    questions: [
      'We understand both our willingness and financial ability to accept investment risk.',
      'Our investment allocation reflects our retirement timeline and income needs.',
      'Our investments are diversified across appropriate types of assets.',
      'We have a plan for funding expenses during a significant market decline.',
      'Our portfolio is reviewed and rebalanced on a consistent schedule.',
    ].map((text, questionIndex) => ({ id: `market-risk-${questionIndex + 1}`, text })),
  },
  {
    id: 'personal-taxes',
    code: 'P',
    name: 'Personal Taxes',
    description: 'How effectively tax considerations are coordinated with retirement decisions.',
    questions: [
      'We understand our current and expected future income tax brackets.',
      'Our withdrawal plan considers the tax treatment of each account type.',
      'We actively consider capital gains and losses when making investment decisions.',
      'We periodically evaluate tax-planning opportunities with qualified professionals.',
      'Our financial and tax professionals coordinate on major retirement decisions.',
    ].map((text, questionIndex) => ({ id: `personal-taxes-${questionIndex + 1}`, text })),
  },
  {
    id: 'long-term-care',
    code: 'L',
    name: 'Long Term Care',
    description: 'How prepared the household is for future care needs and their financial impact.',
    questions: [
      'We have discussed the possibility of needing long-term care.',
      'We have identified our preferred care setting and who may be involved.',
      'We understand the potential cost of care in our preferred location.',
      'We have evaluated insurance, self-funding, and other funding approaches.',
      'Our family understands our care preferences and where important information is kept.',
    ].map((text, questionIndex) => ({ id: `long-term-care-${questionIndex + 1}`, text })),
  },
  {
    id: 'estate-planning',
    code: 'E',
    name: 'Estate Planning',
    description: 'How current and coordinated the household’s legacy and incapacity plans are.',
    questions: [
      'Our wills, trusts, and other estate documents reflect our current wishes.',
      'Beneficiary designations are current and coordinated with our estate plan.',
      'We have current financial powers of attorney and healthcare directives.',
      'Account ownership and asset titling align with our estate-planning goals.',
      'Our estate plan is reviewed with qualified professionals after major life changes.',
    ].map((text, questionIndex) => ({ id: `estate-planning-${questionIndex + 1}`, text })),
  },
]
