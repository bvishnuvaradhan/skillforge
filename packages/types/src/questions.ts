export interface Question {
  id: string;
  text: string;
  options: string[];
  topic: string;
  correctAnswer: string;
}

export const ASSESSMENT_QUESTIONS: Question[] = [
  {
    id: "q1",
    text: "What is the worst-case time complexity of accessing an element in an array?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    topic: "Arrays",
    correctAnswer: "O(1)",
  },
  {
    id: "q2",
    text: "Which data structure operates on a Last-In, First-Out (LIFO) basis?",
    options: ["Queue", "Stack", "Linked List", "Binary Tree"],
    topic: "Stacks",
    correctAnswer: "Stack",
  },
  {
    id: "q3",
    text: "Which of the following sorting algorithms has a guaranteed worst-case time complexity of O(n log n)?",
    options: ["Bubble Sort", "Quick Sort", "Insertion Sort", "Merge Sort"],
    topic: "Sorting",
    correctAnswer: "Merge Sort",
  },
  {
    id: "q4",
    text: "What is the time complexity of searching for an element in a balanced Binary Search Tree (BST) in the average case?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    topic: "Trees",
    correctAnswer: "O(log n)",
  },
  {
    id: "q5",
    text: "Which data structure is typically used to implement Breadth-First Search (BFS)?",
    options: ["Stack", "Queue", "Heap", "Hash Map"],
    topic: "Graphs",
    correctAnswer: "Queue",
  },
  {
    id: "q6",
    text: "What is the primary advantage of a doubly linked list over a singly linked list?",
    options: [
      "Uses less memory",
      "Allows traversal in both directions",
      "Faster insertion at the beginning",
      "Simpler implementation",
    ],
    topic: "Linked Lists",
    correctAnswer: "Allows traversal in both directions",
  },
  {
    id: "q7",
    text: "Which of the following is a key feature of Dynamic Programming?",
    options: [
      "Solving subproblems exactly once and storing results",
      "Always choosing the locally optimal choice",
      "Using a divide-and-conquer strategy without caching",
      "Iterating through all possible permutations randomly",
    ],
    topic: "Dynamic Programming",
    correctAnswer: "Solving subproblems exactly once and storing results",
  },
  {
    id: "q8",
    text: "What happens when a stack overflow occurs?",
    options: [
      "The stack size grows dynamically",
      "The program runs out of memory allocated for the stack call history",
      "Elements are automatically popped from the stack",
      "The queue takes over the stack execution",
    ],
    topic: "Stacks",
    correctAnswer: "The program runs out of memory allocated for the stack call history",
  },
  {
    id: "q9",
    text: "What is the time complexity of inserting a new key into a Hash Map (assuming no collisions)?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    topic: "Hash Maps",
    correctAnswer: "O(1)",
  },
  {
    id: "q10",
    text: "In a min-heap, where is the smallest element located?",
    options: ["At the leaf node", "At the root node", "In the middle level", "At the last node"],
    topic: "Heaps",
    correctAnswer: "At the root node",
  },
  {
    id: "q11",
    text: "Which algorithm is used to find the shortest path in a weighted graph with non-negative edge weights?",
    options: ["Kruskal's Algorithm", "Dijkstra's Algorithm", "Floyd-Warshall Algorithm", "Prim's Algorithm"],
    topic: "Graphs",
    correctAnswer: "Dijkstra's Algorithm",
  },
  {
    id: "q12",
    text: "What does the 'A' stand for in AJAX web development?",
    options: ["Asynchronous", "Active", "Angular", "Adaptive"],
    topic: "Web Development",
    correctAnswer: "Asynchronous",
  },
  {
    id: "q13",
    text: "What is the space complexity of a recursive depth-first traversal of a binary tree of height h (ignoring call stack limits)?",
    options: ["O(1)", "O(log h)", "O(h)", "O(n)"],
    topic: "Recursion",
    correctAnswer: "O(h)",
  },
  {
    id: "q14",
    text: "Which concept allows a function to call itself to solve smaller instances of the same problem?",
    options: ["Polymorphism", "Encapsulation", "Recursion", "Inheritance"],
    topic: "Recursion",
    correctAnswer: "Recursion",
  },
  {
    id: "q15",
    text: "What is the main purpose of an index in a database?",
    options: [
      "To encrypt data",
      "To speed up data retrieval operations",
      "To enforce database schema constraints only",
      "To backup database tables",
    ],
    topic: "Databases",
    correctAnswer: "To speed up data retrieval operations",
  },
];
