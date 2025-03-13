// Calculate match percentage between job skills and user skills
export const calculateMatchPercentage = (jobSkills: string[], userSkills: string[]): number => {
  if (!jobSkills.length || !userSkills.length) return 0;
  
  // Convert to lowercase for case-insensitive matching
  const jobSkillsLower = jobSkills.map(skill => skill.toLowerCase());
  const userSkillsLower = userSkills.map(skill => skill.toLowerCase());
  
  // Count matching skills
  const matchingSkills = jobSkillsLower.filter(skill => 
    userSkillsLower.some(userSkill => userSkill.includes(skill) || skill.includes(userSkill))
  );
  
  // Calculate percentage
  const percentage = Math.floor((matchingSkills.length / jobSkills.length) * 100);
  
  // Apply minimum threshold and cap
  return Math.min(Math.max(percentage, 60), 99);
};

// Find matching skills between job and user
export const findMatchingSkills = (jobSkills: string[], userSkills: string[]): string[] => {
  const jobSkillsLower = jobSkills.map(skill => skill.toLowerCase());
  const userSkillsLower = userSkills.map(skill => skill.toLowerCase());
  
  return jobSkills.filter((skill, index) => 
    userSkillsLower.some(userSkill => 
      userSkill.includes(jobSkillsLower[index]) || jobSkillsLower[index].includes(userSkill)
    )
  );
};

// Find missing skills (skills the job requires but user doesn't have)
export const findMissingSkills = (jobSkills: string[], userSkills: string[]): string[] => {
  const matchingSkills = findMatchingSkills(jobSkills, userSkills);
  return jobSkills.filter(skill => !matchingSkills.includes(skill));
};

// Match jobs to user skills and return sorted by match percentage
export const matchJobsToSkills = (jobs: any[], userSkills: string[]): any[] => {
  return jobs.map(job => {
    const matchPercentage = calculateMatchPercentage(job.skills, userSkills);
    const matchingSkills = findMatchingSkills(job.skills, userSkills).map(skill => ({
      name: skill,
      match: 85 + Math.floor(Math.random() * 15) // 85-100% match for individual skills
    }));
    const missingSkills = findMissingSkills(job.skills, userSkills);
    
    return {
      ...job,
      matchPercentage,
      matchingSkills,
      missingSkills
    };
  }).sort((a, b) => b.matchPercentage - a.matchPercentage);
};
