// Book condition options ordered from best to worst
export const BOOK_CONDITIONS = [
  'Like New',
  'Very Good', 
  'Good',
  'Fair',
  'Poor'
];

// Book genre options
export const BOOK_GENRES = [
  'Fiction',
  'Non-Fiction',
  'Science Fiction',
  'Fantasy',
  'Mystery',
  'Romance',
  'Thriller',
  'Biography',
  'History',
  'Self-Help',
  'Business',
  'Technology',
  'Other'
];

// Helper function to get condition rating (5 stars for Like New, 1 star for Poor)
export const getConditionStars = (condition) => {
  const conditionMap = {
    'Like New': 5,
    'Very Good': 4,
    'Good': 3,
    'Fair': 2,
    'Poor': 1
  };
  return conditionMap[condition] || 3;
};

// Helper function to get condition color for tags
export const getConditionColor = (condition) => {
  const colors = {
    'Like New': 'green',
    'Very Good': 'blue',
    'Good': 'cyan',
    'Fair': 'orange',
    'Poor': 'red'
  };
  return colors[condition] || 'default';
};
