// Flexible validation functions for all colleges

export const validateRollNumber = (rollNo: string): boolean => {
  if (!rollNo.trim()) return true // Optional field
  
  const cleanRoll = rollNo.trim()
  
  // Exact backend validation logic:
  // 1. Main pattern: ^[A-Za-z0-9][A-Za-z0-9.\-_]{2,23}[A-Za-z0-9]$
  const mainPattern = /^[A-Za-z0-9][A-Za-z0-9.\-_]{2,23}[A-Za-z0-9]$/
  
  // 2. No consecutive special characters
  const noConsecutiveDots = !cleanRoll.includes('..')
  const noConsecutiveHyphens = !cleanRoll.includes('--')
  const noConsecutiveUnderscores = !cleanRoll.includes('__')
  const noMixedConsecutive1 = !cleanRoll.includes('-.')
  const noMixedConsecutive2 = !cleanRoll.includes('-_')
  const noMixedConsecutive3 = !cleanRoll.includes('._-')
  
  return mainPattern.test(cleanRoll) && 
         noConsecutiveDots && 
         noConsecutiveHyphens && 
         noConsecutiveUnderscores && 
         noMixedConsecutive1 && 
         noMixedConsecutive2 && 
         noMixedConsecutive3
}

export const validateEmail = (email: string): boolean => {
  const pattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
  return pattern.test(email) && email.length <= 254 && !email.includes('..')
}

export const validateName = (name: string): boolean => {
  const pattern = /^[A-Za-z\s\-']{2,50}$/
  return pattern.test(name.trim()) && !name.includes('  ') && name.trim().length >= 2
}

// Roll number format examples for different colleges
export const getRollNumberExamples = (): string[] => [
  'CH.EN.U4CYS22001',  // Your college format
  '19BCE001',          // VIT format
  'CSE-2021-045',      // Common format
  'B.Tech_CS_123',     // Another format
  '2K21A0501',         // JNTU format
  'ME19B001',          // IIT format
  'CS.B.Tech.2021.45', // Detailed format
]

export const getRollNumberHelpText = (): string => {
  return 'Enter your college roll number (4-25 characters, start/end with letter/number, no consecutive special chars). Examples: CH.EN.U4CYS22001, 19BCE001, CSE-2021-045'
}
