export interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: string
}

export interface ChatHistory {
  id: string
  title: string
  lastActivity: string
  messages: Message[]
}

export const aiSuggestedPrompts = [
  { id: '1', title: 'Explain a Concept', prompt: 'Can you explain how React hooks work under the hood?' },
  { id: '2', title: 'Help with Code', prompt: 'I have a bug in my Java program. Can you help me find it?' },
  { id: '3', title: 'Generate Quiz', prompt: 'Create a 5-question multiple choice quiz on Operating Systems.' },
  { id: '4', title: 'Practice Problems', prompt: 'Give me 3 practice problems for SQL JOINs.' },
  { id: '5', title: 'Summarize Notes', prompt: 'Summarize the key points of Computer Networks OSI model.' },
  { id: '6', title: 'Create Study Plan', prompt: 'Help me create a 2-week study plan for Data Structures & Algorithms.' },
]

export const mockChatHistories: ChatHistory[] = [
  {
    id: 'chat-1',
    title: 'React Hooks Explanation',
    lastActivity: '2 hours ago',
    messages: [
      { id: 'm1', role: 'user', content: 'Explain React useEffect hook with an example.', timestamp: '10:00 AM' },
      { id: 'm2', role: 'ai', content: 'The `useEffect` hook lets you perform side effects in function components. It takes two arguments: a callback function and a dependency array.\n\n```javascript\nimport { useEffect, useState } from "react";\n\nfunction Example() {\n  const [count, setCount] = useState(0);\n\n  useEffect(() => {\n    document.title = `You clicked ${count} times`;\n  }, [count]);\n\n  return (\n    <button onClick={() => setCount(count + 1)}>\n      Click me\n    </button>\n  );\n}\n```\n\nHere, the effect runs every time `count` changes.', timestamp: '10:00 AM' },
    ],
  },
  {
    id: 'chat-2',
    title: 'Java Generics',
    lastActivity: 'Yesterday',
    messages: [
      { id: 'm1', role: 'user', content: 'What are generics in Java?', timestamp: 'Yesterday' },
      { id: 'm2', role: 'ai', content: 'Generics in Java enable types (classes and interfaces) to be parameters when defining classes, interfaces and methods. Much like the more familiar formal parameters used in method declarations, type parameters provide a way for you to re-use the same code with different inputs.\n\nBenefits:\n1. Stronger type checks at compile time.\n2. Elimination of casts.\n3. Enabling programmers to implement generic algorithms.\n\nWould you like a code example?', timestamp: 'Yesterday' },
    ],
  },
  {
    id: 'chat-3',
    title: 'SQL JOIN Optimization',
    lastActivity: '2 days ago',
    messages: [
      { id: 'm1', role: 'user', content: 'How do I optimize SQL JOIN queries?', timestamp: '2 days ago' },
      { id: 'm2', role: 'ai', content: 'Optimizing SQL JOINs involves several strategies:\n\n1. **Index the Join Columns**: Ensure foreign keys and columns used in the `ON` clause are indexed.\n2. **Select Only Needed Columns**: Avoid `SELECT *`. Retrieve only the columns you actually need.\n3. **Join Order**: The query optimizer usually handles this, but filtering down large tables early using `WHERE` clauses before joining can help.\n4. **Avoid Cross Joins**: Unless absolutely necessary, avoid Cartesian products.\n\nCan I provide specific advice for a query you are working on?', timestamp: '2 days ago' },
    ],
  },
  {
    id: 'chat-4',
    title: 'Python Data Structures',
    lastActivity: 'Last week',
    messages: [
      { id: 'm1', role: 'user', content: 'What is the difference between a list and a tuple in Python?', timestamp: 'Last week' },
      { id: 'm2', role: 'ai', content: 'In Python, both `list` and `tuple` are used to store collections of data, but they have a key difference:\n\n* **Lists are mutable:** You can add, remove, or change elements after the list is created. They are defined using square brackets `[]`.\n* **Tuples are immutable:** Once created, you cannot change their elements. They are defined using parentheses `()`.\n\nTuples are generally slightly faster and are used when you want to ensure the data cannot be modified accidentally.', timestamp: 'Last week' },
    ],
  },
]
