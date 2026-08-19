/**
 * Birthday Studio - Relationship Definitions
 */

export const RELATIONSHIPS = [
  { id: 'Sister', label: 'Sister', suggestedCategory: 'Emotional' },
  { id: 'Brother', label: 'Brother', suggestedCategory: 'Funny' },
  { id: 'Younger Sister', label: 'Younger Sister', suggestedCategory: 'Sweet' },
  { id: 'Younger Brother', label: 'Younger Brother', suggestedCategory: 'Funny' },
  { id: 'Friend - Male', label: 'Friend (Male)', suggestedCategory: 'Short' },
  { id: 'Friend - Female', label: 'Friend (Female)', suggestedCategory: 'Sweet' },
  { id: 'Mother', label: 'Mother', suggestedCategory: 'Emotional' },
  { id: 'Father', label: 'Father', suggestedCategory: 'Respectful' },
  { id: 'Grandmother', label: 'Grandmother', suggestedCategory: 'Emotional' },
  { id: 'Grandfather', label: 'Grandfather', suggestedCategory: 'Respectful' },
  { id: 'Uncle', label: 'Uncle', suggestedCategory: 'Formal' },
  { id: 'Aunt', label: 'Aunt', suggestedCategory: 'Sweet' },
  { id: 'Relative', label: 'Relative', suggestedCategory: 'Formal' },
  { id: 'Partner', label: 'Partner / Spouse', suggestedCategory: 'Romantic' },
  { id: 'Custom', label: 'Custom Relationship', suggestedCategory: 'Short' }
];

export function getRelationshipById(id) {
  return RELATIONSHIPS.find(r => r.id === id) || RELATIONSHIPS[0];
}
