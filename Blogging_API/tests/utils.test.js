const calculateReadingTime = require('./../server/utils/calculateReadingTime');

describe('Utility Function: calculateReadingTime', () => {
  it('should calculate reading time for short text', () => {
    const text = 'This is a short blog post.';
    const result = calculateReadingTime(text);
    expect(result).toBe('1 min read');
  });

  it('should calculate reading time for a long text', () => {
    const text = 'word '.repeat(600); // 600 words
    const result = calculateReadingTime(text);
    expect(result).toBe('3 min read');
  });

  it('should handle empty text gracefully', () => {
    const text = '';
    const result = calculateReadingTime(text);
    expect(result).toBe('1 min read'); // Minimum reading time is 1 minute
  });
});
