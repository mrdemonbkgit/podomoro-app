export interface Quote {
  text: string;
  author: string;
  context: 'work' | 'break' | 'both';
}

export const MOTIVATIONAL_QUOTES: Quote[] = [
  // Work-focused quotes
  {
    text: 'Focus on being productive instead of busy',
    author: 'Tim Ferriss',
    context: 'work',
  },
  {
    text: 'The secret of getting ahead is getting started',
    author: 'Mark Twain',
    context: 'work',
  },
  {
    text: "It's not about time, it's about focus",
    author: 'Anonymous',
    context: 'work',
  },
  {
    text: 'Do the hard jobs first. The easy jobs will take care of themselves',
    author: 'Dale Carnegie',
    context: 'work',
  },
  {
    text: 'Amateurs sit and wait for inspiration, the rest of us just get up and go to work',
    author: 'Stephen King',
    context: 'work',
  },

  // Break-focused quotes
  {
    text: "Rest when you're weary. Refresh and renew yourself",
    author: 'Ralph Marston',
    context: 'break',
  },
  {
    text: 'Take rest; a field that has rested gives a bountiful crop',
    author: 'Ovid',
    context: 'break',
  },
  {
    text: 'Almost everything will work again if you unplug it for a few minutes',
    author: 'Anne Lamott',
    context: 'break',
  },
  {
    text: 'Sometimes the most productive thing you can do is relax',
    author: 'Mark Black',
    context: 'break',
  },
  {
    text: 'Your mind will answer most questions if you learn to relax',
    author: 'William S. Burroughs',
    context: 'break',
  },

  // Universal quotes
  {
    text: "You don't have to be great to start, but you have to start to be great",
    author: 'Zig Ziglar',
    context: 'both',
  },
  {
    text: 'The only way to do great work is to love what you do',
    author: 'Steve Jobs',
    context: 'both',
  },
  {
    text: 'Success is the sum of small efforts repeated day in and day out',
    author: 'Robert Collier',
    context: 'both',
  },
  {
    text: 'The way to get started is to quit talking and begin doing',
    author: 'Walt Disney',
    context: 'both',
  },
  {
    text: 'Quality is not an act, it is a habit',
    author: 'Aristotle',
    context: 'both',
  },
  {
    text: "Don't watch the clock; do what it does. Keep going",
    author: 'Sam Levenson',
    context: 'both',
  },
  {
    text: "Whether you think you can or think you can't, you're right",
    author: 'Henry Ford',
    context: 'both',
  },
  {
    text: 'Great things are done by a series of small things brought together',
    author: 'Vincent Van Gogh',
    context: 'both',
  },
  {
    text: "If it's still in your mind, it's worth taking the risk",
    author: 'Paulo Coelho',
    context: 'both',
  },
  {
    text: 'Make it meaningful',
    author: 'Anonymous',
    context: 'both',
  },
];

/**
 * Get a random quote appropriate for the current session type
 */
export const getRandomQuote = (isWorkSession: boolean): Quote => {
  const contextFilter = isWorkSession ? ['work', 'both'] : ['break', 'both'];
  const filteredQuotes = MOTIVATIONAL_QUOTES.filter((q) =>
    contextFilter.includes(q.context)
  );
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  return filteredQuotes[randomIndex];
};
