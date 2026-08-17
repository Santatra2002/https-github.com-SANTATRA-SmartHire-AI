// backend/src/utils/parseSkills.js
const parseSkills = (skillsRaw) => {
    if (!skillsRaw) return [];
    try {
      const parsed = JSON.parse(skillsRaw);
      return Array.isArray(parsed) ? parsed : [String(parsed)];
    } catch {
      return skillsRaw
        .split(/[,/\n]/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
    }
  };
  
  module.exports = { parseSkills };