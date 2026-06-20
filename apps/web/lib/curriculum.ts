// Automatically generated from curriculum_parsed.json. Do not edit manually.

export interface CurriculumModule {
  id: string;
  name: string;
  tech: string;
  games: string;
  topics: string;
  difficulty: string;
}

export interface CurriculumPart {
  id: number;
  title: string;
  modules: CurriculumModule[];
}

export const CURRICULUM_DATA: CurriculumPart[] = [
  {
    "id": 1,
    "title": "PART 1: Programming + OOP",
    "modules": [
      {
        "id": "1",
        "name": "Variables, Data Types & Operators",
        "tech": "C, C++, Java, Python, JavaScript",
        "games": "CodeCombat, Lightbot, Codemonkey, Blockly Games",
        "topics": "Variables, Constants, Primitive/Non-Primitive Data Types, Type Conversion, Arithmetic/Relational/Logical/Assignment/Unary Operators, Expressions, Operator Precedence",
        "difficulty": "⭐"
      },
      {
        "id": "2",
        "name": "Input, Output & Program Flow",
        "tech": "C, C++, Java, Python",
        "games": "CodeCombat, CheckiO, CodinGame, Codemonkey",
        "topics": "Console Input/Output, Formatting Output, Reading Multiple Inputs, Execution Flow, Program Lifecycle, Basic Error Messages",
        "difficulty": "⭐"
      },
      {
        "id": "3",
        "name": "Decision Making",
        "tech": "All Languages",
        "games": "Robozzle, Cargo-Bot, CodeCombat, Blockly Games",
        "topics": "if, if-else, else-if ladder, nested if, switch-case, conditional operators, logical decision making",
        "difficulty": "⭐⭐"
      },
      {
        "id": "4",
        "name": "Loops & Iteration",
        "tech": "All Languages",
        "games": "Human Resource Machine, 7 Billion Humans, Autonauts, The Farmer Was Replaced",
        "topics": "for loop, while loop, do-while loop, nested loops, infinite loops, break, continue, loop optimization",
        "difficulty": "⭐⭐"
      },
      {
        "id": "5",
        "name": "Functions & Modular Programming",
        "tech": "C, C++, Java, Python",
        "games": "Lightbot, Robozzle, Human Resource Machine, CodeCombat",
        "topics": "Functions, Parameters, Arguments, Return Values, Function Overloading, Scope, Local/Global Variables, Modular Programming",
        "difficulty": "⭐⭐"
      },
      {
        "id": "6",
        "name": "Recursion & Advanced Thinking",
        "tech": "C++, Java, Python",
        "games": "Recursed, Baba Is You, The Talos Principle, CodinGame",
        "topics": "Recursion, Base Case, Recursive Calls, Tail Recursion, Divide and Conquer, Backtracking Basics",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "7",
        "name": "Memory & Program Internals",
        "tech": "C, C++, Java",
        "games": "TIS-100, SHENZHEN I/O, Exapunks, Human Resource Machine",
        "topics": "Memory Layout, Stack/Heap Memory, Pointers, References, Addresses, Dynamic Memory Allocation, Memory Leaks, Garbage Collection Basics",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "8",
        "name": "Debugging, Testing & Complexity",
        "tech": "All Languages",
        "games": "Exapunks, SHENZHEN I/O, CodinGame, CheckiO",
        "topics": "Debugging, Tracing, Breakpoints, Error Handling, Exception Basics, Unit Testing Basics, Dry Run Analysis, Time/Space Complexity Intro",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "9",
        "name": "Classes, Objects & Constructors",
        "tech": "Java, C++, Python, C#",
        "games": "Robocode, Battlecode, CodeCombat, Screeps",
        "topics": "Classes, Objects, Attributes, Methods, Constructors, Destructors, Object Lifecycle",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "10",
        "name": "Core OOP Principles",
        "tech": "Java, C++, C#",
        "games": "Battlecode, Robocode, Screeps, CodeCombat",
        "topics": "Encapsulation, Inheritance, Polymorphism, Abstraction, Method Overloading, Method Overriding, Access Modifiers",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "11",
        "name": "Advanced OOP Relationships",
        "tech": "Java, C++, Python",
        "games": "Screeps, Factorio, Mindustry, Shapez",
        "topics": "Interfaces, Abstract Classes, Composition, Aggregation, Association, Dependency Relationships",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "12",
        "name": "Design Patterns & Software Design",
        "tech": "Java, C++, Python",
        "games": "Screeps, Factorio, Mindustry, Battlecode",
        "topics": "SOLID Principles, Factory Pattern, Singleton Pattern, Strategy Pattern, Observer Pattern, Dependency Injection, Clean Code Concepts",
        "difficulty": "⭐⭐⭐⭐⭐"
      },
      {
        "id": "13",
        "name": "Real-World Software Engineering",
        "tech": "Any",
        "games": "Screeps, Factorio, CodinGame, Battlecode",
        "topics": "Refactoring, Code Reusability, Maintainability, Project Structure, Documentation, Collaboration Concepts, Version Control Concepts, Code Reviews",
        "difficulty": "⭐⭐⭐⭐⭐"
      }
    ]
  },
  {
    "id": 2,
    "title": "PART 2: Data Structures & Algorithms (DSA)",
    "modules": [
      {
        "id": "1",
        "name": "Arrays & Array Manipulation",
        "tech": "C, C++, Java, Python",
        "games": "Shapez, Factorio, CodinGame, 7 Billion Humans",
        "topics": "1D/2D Arrays, Traversal, Insertion, Deletion, Searching, Updating Elements, Prefix Sum, Difference Array, Sliding Window Basics, Two Pointers",
        "difficulty": "⭐⭐"
      },
      {
        "id": "2",
        "name": "Strings",
        "tech": "C++, Java, Python",
        "games": "CodinGame, 7 Billion Humans, The Farmer Was Replaced, Bitburner",
        "topics": "String Traversal, Manipulation, Palindromes, Anagrams, Pattern Matching, Frequency Counting, Substrings, String Hashing Basics",
        "difficulty": "⭐⭐"
      },
      {
        "id": "3",
        "name": "Searching Algorithms",
        "tech": "C++, Java, Python",
        "games": "CodinGame, Bitburner, Shapez, Factorio",
        "topics": "Linear Search, Binary Search, Lower Bound, Upper Bound, Binary Search on Answer, Ternary Search Basics",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "4",
        "name": "Sorting Algorithms",
        "tech": "C++, Java, Python",
        "games": "CodinGame, Bitburner, Shapez, Factorio",
        "topics": "Bubble/Selection/Insertion/Merge/Quick/Heap/Counting/Radix Sort, Custom Sorting",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "5",
        "name": "Stack",
        "tech": "C++, Java, Python",
        "games": "Human Resource Machine, TIS-100, SpaceChem, Baba Is You",
        "topics": "Push, Pop, Peek, Balanced Parentheses, Infix/Postfix/Prefix Expressions, Monotonic Stack, Next Greater Element",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "6",
        "name": "Queue & Deque",
        "tech": "C++, Java, Python",
        "games": "Mindustry, Factorio, Shapez, 7 Billion Humans",
        "topics": "Queue, Circular Queue, Deque, Priority Queue Basics, Scheduling Problems",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "7",
        "name": "Linked Lists",
        "tech": "C, C++, Java",
        "games": "SHENZHEN I/O, Exapunks, TIS-100, Bitburner",
        "topics": "Singly/Doubly/Circular Linked List, Reversal, Fast & Slow Pointers, Merge Lists",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "8",
        "name": "Hashing",
        "tech": "C++, Java, Python",
        "games": "Screeps, Bitburner, CodinGame, Factorio",
        "topics": "Hash Maps, Hash Sets, Frequency Tables, Collision Basics, Lookup Optimization",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "9",
        "name": "Recursion & Backtracking",
        "tech": "C++, Java, Python",
        "games": "Recursed, Baba Is You, The Talos Principle, CodinGame",
        "topics": "Recursive Calls, N-Queens, Rat in Maze, Sudoku Solver, Permutations, Combinations",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "10",
        "name": "Trees",
        "tech": "C++, Java, Python",
        "games": "Screeps, Bitburner, The Talos Principle, Baba Is You",
        "topics": "Binary Tree, Traversals, Height, Diameter, Tree Views, Lowest Common Ancestor",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "11",
        "name": "Binary Search Trees & Balanced Trees",
        "tech": "C++, Java",
        "games": "Screeps, Bitburner, CodinGame, Factorio",
        "topics": "BST, AVL Tree, Red Black Tree Concepts, Tree Rotations",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "12",
        "name": "Heap & Priority Queue",
        "tech": "C++, Java, Python",
        "games": "Factorio, Mindustry, Screeps, Shapez",
        "topics": "Min Heap, Max Heap, Heapify, Priority Queue, Top K Problems",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "13",
        "name": "Graphs",
        "tech": "C++, Java, Python",
        "games": "Screeps, Mindustry, Factorio, CodinGame",
        "topics": "Graph Representation, Adjacency List/Matrix, Directed/Undirected/Weighted Graph",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "14",
        "name": "Graph Traversal",
        "tech": "C++, Java, Python",
        "games": "Screeps, CodinGame, Mindustry, Factorio",
        "topics": "BFS, DFS, Connected Components, Cycle Detection, Bipartite Graph",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "15",
        "name": "Shortest Path Algorithms",
        "tech": "C++, Java, Python",
        "games": "Screeps, CodinGame, Mindustry, Into the Breach",
        "topics": "Dijkstra, Bellman-Ford, Floyd-Warshall, A*, Multi-source BFS",
        "difficulty": "⭐⭐⭐⭐⭐"
      },
      {
        "id": "16",
        "name": "Greedy Algorithms",
        "tech": "C++, Java, Python",
        "games": "Mini Metro, Mini Motorways, Factorio, Mindustry",
        "topics": "Activity Selection, Interval Scheduling, Huffman Coding, Fractional Knapsack",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "17",
        "name": "Dynamic Programming",
        "tech": "C++, Java, Python",
        "games": "Stephen's Sausage Roll, Baba Is You, The Talos Principle, CodinGame",
        "topics": "Memoization, Tabulation, Knapsack, LCS, LIS, Matrix DP, DP on Trees, Bitmask DP Basics",
        "difficulty": "⭐⭐⭐⭐⭐"
      },
      {
        "id": "18",
        "name": "Advanced DSA",
        "tech": "C++, Java",
        "games": "Screeps, CodinGame, TIS-100, SHENZHEN I/O",
        "topics": "Trie, Segment Tree, Fenwick Tree, Union Find (DSU), Sparse Table, Advanced Range Queries",
        "difficulty": "⭐⭐⭐⭐⭐"
      }
    ]
  },
  {
    "id": 3,
    "title": "PART 3: DBMS + Operating Systems + Computer Networks",
    "modules": [
      {
        "id": "1",
        "name": "Database Fundamentals",
        "tech": "SQL, MySQL, PostgreSQL, SQLite",
        "games": "SQL Murder Mystery, SQL Island, Select Star SQL, DataLemur",
        "topics": "Database Concepts, Data vs Information, DBMS vs File System, Schema, Instance, Keys Overview, Database Architecture",
        "difficulty": "⭐"
      },
      {
        "id": "2",
        "name": "SQL Fundamentals",
        "tech": "SQL",
        "games": "SQL Murder Mystery, SQL Island, Select Star SQL, DataLemur",
        "topics": "SELECT, WHERE, ORDER BY, LIMIT, DISTINCT, Aliases, Basic Filtering",
        "difficulty": "⭐⭐"
      },
      {
        "id": "3",
        "name": "Advanced SQL",
        "tech": "SQL",
        "games": "Select Star SQL, DataLemur, SQLBolt, LeetCode Database",
        "topics": "JOINs, GROUP BY, HAVING, Aggregate Functions, Subqueries, Nested Queries, Views",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "4",
        "name": "Database Design",
        "tech": "SQL",
        "games": "dbdiagram.io, Lucidchart, Vertabelo Academy, SQL Murder Mystery",
        "topics": "ER Models, ER Diagrams, Cardinality, Relationships, Schema Design, Constraints",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "5",
        "name": "Normalization",
        "tech": "SQL",
        "games": "Vertabelo Academy, Lucidchart, SQLBolt, DataLemur",
        "topics": "1NF, 2NF, 3NF, BCNF, Functional Dependency, Multivalued Dependency",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "6",
        "name": "Transactions & Concurrency",
        "tech": "SQL",
        "games": "PostgreSQL Labs, MySQL Labs, DataGrip Exercises, Interactive SQL Labs",
        "topics": "ACID Properties, Transactions, Commit, Rollback, Concurrency, Deadlocks, Isolation Levels",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "7",
        "name": "Indexing & Query Optimization",
        "tech": "SQL",
        "games": "DataLemur, PostgreSQL Explain Labs, MySQL Explain Labs, LeetCode Database",
        "topics": "Indexes, B-Trees, Query Optimization, Execution Plans, Clustering",
        "difficulty": "⭐⭐⭐⭐⭐"
      },
      {
        "id": "8",
        "name": "NoSQL Databases",
        "tech": "MongoDB, Redis",
        "games": "MongoDB University, MongoDB Playground, Redis University, MongoDB Atlas Labs",
        "topics": "Documents, Collections, Aggregation, Replication, Sharding, Key-Value Stores",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "9",
        "name": "OS Fundamentals",
        "tech": "C, C++",
        "games": "TIS-100, SHENZHEN I/O, Exapunks, Human Resource Machine",
        "topics": "Operating System Basics, Kernel, User Mode, System Calls, Boot Process",
        "difficulty": "⭐⭐"
      },
      {
        "id": "10",
        "name": "Processes & Threads",
        "tech": "C, C++",
        "games": "SHENZHEN I/O, Exapunks, TIS-100, 7 Billion Humans",
        "topics": "Process, Thread, Context Switching, PCB, Multithreading",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "11",
        "name": "CPU Scheduling",
        "tech": "C, C++",
        "games": "TIS-100, Mindustry, Factorio, Exapunks",
        "topics": "FCFS, SJF, Round Robin, Priority Scheduling, Throughput, Turnaround Time",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "12",
        "name": "Synchronization",
        "tech": "C, Java",
        "games": "7 Billion Humans, Exapunks, SHENZHEN I/O, TIS-100",
        "topics": "Critical Section, Mutex, Semaphore, Monitor, Producer Consumer, Readers Writers",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "13",
        "name": "Deadlocks",
        "tech": "C, Java",
        "games": "Exapunks, Factorio, Mindustry, Screeps",
        "topics": "Deadlock Conditions, Prevention, Avoidance, Detection, Recovery",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "14",
        "name": "Memory Management",
        "tech": "C, C++",
        "games": "TIS-100, SHENZHEN I/O, Exapunks, Human Resource Machine",
        "topics": "Paging, Segmentation, Virtual Memory, Address Translation, Fragmentation",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "15",
        "name": "File Systems",
        "tech": "C, Linux",
        "games": "Exapunks, SHENZHEN I/O, Grey Hack, Hacknet",
        "topics": "File Allocation, Directories, Inodes, Journaling, Permissions",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "16",
        "name": "Networking Fundamentals",
        "tech": "C, Python",
        "games": "Hacknet, Grey Hack, Uplink, Cisco Packet Tracer",
        "topics": "Network Basics, Topologies, Devices, Data Transmission",
        "difficulty": "⭐⭐"
      },
      {
        "id": "17",
        "name": "OSI & TCP/IP Models",
        "tech": "C, Python",
        "games": "Hacknet, Grey Hack, Cisco Packet Tracer, Uplink",
        "topics": "OSI Layers, TCP/IP Layers, Encapsulation, Decapsulation",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "18",
        "name": "IP Addressing & Subnetting",
        "tech": "Networking Concepts",
        "games": "Cisco Packet Tracer, Grey Hack, Hacknet, GNS3 Labs",
        "topics": "IPv4, IPv6, Subnet Masks, CIDR, Address Classes",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "19",
        "name": "Routing & Switching",
        "tech": "Networking Concepts",
        "games": "Cisco Packet Tracer, GNS3, Hacknet, Grey Hack",
        "topics": "Routing, Static/Dynamic Routing, Switching, VLAN",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "20",
        "name": "Transport Layer",
        "tech": "C, Python",
        "games": "Hacknet, Grey Hack, Uplink, Packet Tracer",
        "topics": "TCP, UDP, Flow Control, Congestion Control, Three-Way Handshake",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "21",
        "name": "Application Layer",
        "tech": "Python, JavaScript",
        "games": "Hacknet, Grey Hack, Packet Tracer, Uplink",
        "topics": "HTTP, HTTPS, FTP, SMTP, DNS, DHCP",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "22",
        "name": "Network Security",
        "tech": "Python, Linux",
        "games": "Grey Hack, Hacknet, Uplink, NITE Team 4",
        "topics": "Firewalls, Encryption, Authentication, VPN, IDS, Network Attacks",
        "difficulty": "⭐⭐⭐⭐"
      }
    ]
  },
  {
    "id": 4,
    "title": "PART 4: Web Development + Software Engineering",
    "modules": [
      {
        "id": "1",
        "name": "HTML Fundamentals",
        "tech": "HTML5",
        "games": "CSS Diner, Codepip HTML Challenges, Frontend Mentor, Scrimba HTML Challenges",
        "topics": "HTML Structure, Head & Body, Headings, Paragraphs, Links, Images, Lists, Tables, Forms, Semantic HTML",
        "difficulty": "⭐"
      },
      {
        "id": "2",
        "name": "CSS Fundamentals",
        "tech": "CSS3",
        "games": "Flexbox Froggy, Grid Garden, CSS Diner, Flexbox Defense",
        "topics": "Selectors, Box Model, Margin, Padding, Borders, Positioning, Display, Units, Colors",
        "difficulty": "⭐⭐"
      },
      {
        "id": "3",
        "name": "Responsive Design",
        "tech": "HTML, CSS",
        "games": "Flexbox Froggy, Grid Garden, Frontend Mentor, DevChallenges",
        "topics": "Flexbox, CSS Grid, Media Queries, Mobile First Design, Responsive Layouts",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "4",
        "name": "JavaScript Fundamentals",
        "tech": "JavaScript",
        "games": "CheckiO",
        "topics": "Variables, Functions, Arrays, Objects, Loops, Conditions, Scope, ES6 Basics",
        "difficulty": "⭐⭐"
      },
      {
        "id": "5",
        "name": "Advanced JavaScript",
        "tech": "JavaScript",
        "games": "Bitburner, Screeps, Frontend Mentor, JavaScript30",
        "topics": "Closures, Hoisting, Callbacks, Promises, Async/Await, Event Loop, Modules",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "6",
        "name": "DOM Manipulation",
        "tech": "JavaScript",
        "games": "JavaScript30, Frontend Mentor, DevChallenges, CodePen Challenges",
        "topics": "DOM, Events, Event Delegation, Dynamic Content, Form Validation",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "7",
        "name": "TypeScript",
        "tech": "TypeScript",
        "games": "TypeHero, Total TypeScript Challenges, Frontend Mentor, Type Challenges",
        "topics": "Types, Interfaces, Generics, Enums, Type Guards",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "8",
        "name": "React Fundamentals",
        "tech": "JavaScript, TypeScript",
        "games": "React.gg, Frontend Mentor, DevChallenges, Scrimba React Challenges",
        "topics": "Components, JSX, Props, State, Events, Rendering",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "9",
        "name": "React Hooks",
        "tech": "React",
        "games": "React.gg, Frontend Mentor, React Challenges, DevChallenges",
        "topics": "useState, useEffect, useRef, useMemo, useCallback, Custom Hooks",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "10",
        "name": "State Management",
        "tech": "React",
        "games": "React.gg, Frontend Mentor, Redux Tutorials, Zustand Challenges",
        "topics": "Context API, Redux, Zustand, Global State, State Architecture",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "11",
        "name": "Routing & SPA",
        "tech": "React",
        "games": "React.gg, Frontend Mentor, DevChallenges, React Router Projects",
        "topics": "Routing, Dynamic Routes, Navigation, SPA Architecture",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "12",
        "name": "Frontend Architecture",
        "tech": "React, TypeScript",
        "games": "Frontend Mentor, DevChallenges, RealWorld React App, React.gg",
        "topics": "Folder Structure, Reusable Components, Design Systems, Performance Optimization",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "13",
        "name": "Node.js Fundamentals",
        "tech": "JavaScript",
        "games": "Screeps, Bitburner, NodeSchool, Backend Challenges",
        "topics": "Runtime, Modules, File System, Event Loop, Streams",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "14",
        "name": "Express.js",
        "tech": "JavaScript",
        "games": "NodeSchool, Backend Mentor, Express Challenges, RealWorld API",
        "topics": "Routes, Middleware, Controllers, Error Handling",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "15",
        "name": "REST APIs",
        "tech": "JavaScript, TypeScript",
        "games": "Backend Mentor, Postman Challenges, RealWorld API, API Battles",
        "topics": "GET, POST, PUT, PATCH, DELETE, Status Codes, API Design",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "16",
        "name": "Authentication & Security",
        "tech": "JavaScript, TypeScript",
        "games": "Backend Mentor, OWASP Juice Shop, PortSwigger Web Academy, RealWorld API",
        "topics": "JWT, Sessions, Cookies, OAuth, Password Hashing, Authentication Flow",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "17",
        "name": "Databases in Web Apps",
        "tech": "SQL, MongoDB",
        "games": "MongoDB University, SQL Murder Mystery, DataLemur, Backend Mentor",
        "topics": "CRUD, Mongoose, ORM, Relationships, Aggregation",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "18",
        "name": "Real-Time Applications",
        "tech": "JavaScript",
        "games": "Socket.IO Challenges, Multiplayer Game Tutorials, Screeps, Backend Mentor",
        "topics": "WebSockets, Real-Time Chat, Notifications, Live Updates",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "19",
        "name": "Git & GitHub",
        "tech": "Git, GitHub",
        "games": "Learn Git Branching, Oh My Git!, GitHub Skills, Git Immersion",
        "topics": "Commit, Branch, Merge, Rebase, Pull Requests",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "20",
        "name": "Testing",
        "tech": "Jest, Vitest",
        "games": "Testing JavaScript, Frontend Mentor, RealWorld Projects, Codewars Testing Challenges",
        "topics": "Unit Testing, Integration Testing, Mocking, Test Coverage",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "21",
        "name": "Software Development Lifecycle",
        "tech": "Agile, Scrum",
        "games": "Scrum Simulations, Jira Tutorials, Agile Games, Team Simulators",
        "topics": "SDLC, Agile, Scrum, Kanban, Sprint Planning",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "22",
        "name": "Design Patterns in Web Apps",
        "tech": "JavaScript, TypeScript",
        "games": "Screeps, Factorio, Refactoring Guru, Pattern Challenges",
        "topics": "Singleton, Factory, Observer, Strategy, Adapter",
        "difficulty": "⭐⭐⭐⭐⭐"
      },
      {
        "id": "23",
        "name": "DevOps Basics",
        "tech": "Docker, GitHub Actions",
        "games": "Docker Labs, Play with Docker, Katacoda Scenarios, GitHub Actions Labs",
        "topics": "Containers, CI/CD, Deployment, Automation",
        "difficulty": "⭐⭐⭐⭐"
      }
    ]
  },
  {
    "id": 5,
    "title": "PART 5: Artificial Intelligence + Machine Learning",
    "modules": [
      {
        "id": "1",
        "name": "Python for AI & ML",
        "tech": "Python",
        "games": "CodeCombat, CheckiO, Py.CheckiO, Codingame",
        "topics": "Variables, Functions, Lists, Dictionaries, Sets, Tuples, File Handling, OOP in Python",
        "difficulty": "⭐"
      },
      {
        "id": "2",
        "name": "Mathematics for AI",
        "tech": "Python",
        "games": "Brilliant, Mathigon, Exponential Idle, Euclidea",
        "topics": "Linear Algebra, Vectors, Matrices, Probability, Statistics, Calculus Basics",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "3",
        "name": "NumPy",
        "tech": "Python",
        "games": "Kaggle Learn, NumPy Challenges, DataCamp Exercises, LeetCode NumPy",
        "topics": "Arrays, Matrix Operations, Broadcasting, Vectorization, Numerical Computing",
        "difficulty": "⭐⭐"
      },
      {
        "id": "4",
        "name": "Pandas",
        "tech": "Python",
        "games": "Kaggle Learn, DataCamp, DataLemur, Pandas Challenges",
        "topics": "DataFrames, Cleaning Data, Filtering, GroupBy, Aggregation",
        "difficulty": "⭐⭐"
      },
      {
        "id": "5",
        "name": "Data Visualization",
        "tech": "Python",
        "games": "Kaggle, DataCamp, Plotly Tutorials, Streamlit Challenges",
        "topics": "Matplotlib, Seaborn, Plotly, Dashboards",
        "difficulty": "⭐⭐"
      },
      {
        "id": "6",
        "name": "Machine Learning Fundamentals",
        "tech": "Python",
        "games": "while True: learn(), Kaggle Learn, Google ML Crash Course, DataCamp",
        "topics": "Features, Labels, Training, Testing, Validation, Bias, Variance",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "7",
        "name": "Supervised Learning",
        "tech": "Python",
        "games": "Kaggle, Google ML Crash Course, DataCamp, FastAI",
        "topics": "Linear Regression, Logistic Regression, Evaluation Metrics, Classification",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "8",
        "name": "Decision Trees & Ensemble Learning",
        "tech": "Python",
        "games": "Kaggle, DataCamp, FastAI, Google ML Labs",
        "topics": "Decision Trees, Random Forest, XGBoost, Gradient Boosting",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "9",
        "name": "Unsupervised Learning",
        "tech": "Python",
        "games": "Kaggle, DataCamp, FastAI, ML Playground",
        "topics": "Clustering, K-Means, Hierarchical Clustering, PCA",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "10",
        "name": "Model Evaluation",
        "tech": "Python",
        "games": "Kaggle, Google ML, DataCamp, FastAI",
        "topics": "Precision, Recall, F1 Score, ROC-AUC, Cross Validation",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "11",
        "name": "Neural Networks",
        "tech": "Python",
        "games": "TensorFlow Playground, FastAI, Kaggle, Google ML",
        "topics": "Perceptron, Activation Functions, Forward Propagation, Backpropagation",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "12",
        "name": "TensorFlow & PyTorch",
        "tech": "Python",
        "games": "Kaggle, FastAI, PyTorch Tutorials, TensorFlow Tutorials",
        "topics": "Tensors, Models, Training Loops, Optimizers",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "13",
        "name": "Computer Vision",
        "tech": "Python",
        "games": "Kaggle, FastAI, OpenCV Challenges, CV Playground",
        "topics": "Images, CNNs, Object Detection, Segmentation, OpenCV",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "14",
        "name": "Natural Language Processing",
        "tech": "Python",
        "games": "Kaggle, Hugging Face Course, FastAI, NLP Labs",
        "topics": "Tokenization, Embeddings, Sentiment Analysis, Text Classification",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "15",
        "name": "Recurrent Networks",
        "tech": "Python",
        "games": "TensorFlow Tutorials, PyTorch Tutorials, Kaggle, NLP Labs",
        "topics": "RNN, LSTM, GRU, Sequence Models",
        "difficulty": "⭐⭐⭐⭐⭐"
      },
      {
        "id": "16",
        "name": "Transformers",
        "tech": "Python",
        "games": "Hugging Face Course, Transformer Explainer, Kaggle, FastAI",
        "topics": "Attention, Self Attention, Encoder, Decoder, Transformer Architecture",
        "difficulty": "⭐⭐⭐⭐⭐"
      },
      {
        "id": "17",
        "name": "Large Language Models (LLMs)",
        "tech": "Python",
        "games": "Hugging Face, OpenAI API Projects, LangChain Tutorials, LlamaIndex Tutorials",
        "topics": "GPT, Llama, Claude Concepts, Prompt Engineering, Fine-Tuning Basics",
        "difficulty": "⭐⭐⭐⭐⭐"
      },
      {
        "id": "18",
        "name": "Retrieval-Augmented Generation (RAG)",
        "tech": "Python",
        "games": "LangChain, LlamaIndex, RAG Challenges, OpenAI Cookbook",
        "topics": "Embeddings, Vector Databases, Chunking, Retrieval, Context Injection",
        "difficulty": "⭐⭐⭐⭐⭐"
      },
      {
        "id": "19",
        "name": "AI Agents",
        "tech": "Python",
        "games": "CrewAI Labs, LangGraph, AutoGen, Agent Challenges",
        "topics": "Multi-Agent Systems, Tool Calling, Planning, Memory",
        "difficulty": "⭐⭐⭐⭐⭐"
      },
      {
        "id": "20",
        "name": "Model Deployment",
        "tech": "Python",
        "games": "Streamlit Challenges, Hugging Face Spaces, Render Deployments, Docker Labs",
        "topics": "APIs, Deployment, Inference, Hosting",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "21",
        "name": "MLOps",
        "tech": "Python",
        "games": "Docker Labs, Kubeflow Tutorials, MLflow Tutorials, GitHub Actions Labs",
        "topics": "Experiment Tracking, Model Versioning, Pipelines, Monitoring",
        "difficulty": "⭐⭐⭐⭐⭐"
      },
      {
        "id": "22",
        "name": "AI Product Development",
        "tech": "Python, JavaScript",
        "games": "Kaggle, Hugging Face, OpenAI Projects, LangChain Projects",
        "topics": "AI SaaS, Chatbots, AI Assistants, Recommendation Systems",
        "difficulty": "⭐⭐⭐⭐⭐"
      },
      {
        "id": "23",
        "name": "Recommendation Systems",
        "tech": "Python",
        "games": "Kaggle, MovieLens Projects, FastAI, Recommender Labs",
        "topics": "Collaborative Filtering, Content-Based Filtering, Hybrid Systems",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "24",
        "name": "Reinforcement Learning",
        "tech": "Python",
        "games": "OpenAI Gym, Unity ML Agents, PettingZoo, Stable Baselines",
        "topics": "Agent, Environment, Reward, Q Learning, Deep RL",
        "difficulty": "⭐⭐⭐⭐⭐"
      },
      {
        "id": "25",
        "name": "Generative AI",
        "tech": "Python",
        "games": "Hugging Face, Diffusers, OpenAI Projects, Stability AI Labs",
        "topics": "Diffusion Models, Image Generation, Text Generation, Multimodal AI",
        "difficulty": "⭐⭐⭐⭐⭐"
      }
    ]
  },
  {
    "id": 6,
    "title": "PART 6: Cloud + DevOps + Security + System Design + Emerging Tech",
    "modules": [
      {
        "id": "1",
        "name": "Cloud Fundamentals",
        "tech": "AWS, Azure, Google Cloud",
        "games": "AWS Cloud Quest, Google Cloud Skills Boost, Azure Training Days, Cloud Resume Challenge",
        "topics": "Cloud Computing, IaaS, PaaS, SaaS, Public/Private/Hybrid Cloud, Regions, Availability Zones",
        "difficulty": "⭐⭐"
      },
      {
        "id": "2",
        "name": "Compute Services",
        "tech": "AWS EC2, Azure VM, GCP Compute Engine",
        "games": "AWS Cloud Quest, Cloud Resume Challenge, Google Skills Boost, Azure Labs",
        "topics": "Virtual Machines, Auto Scaling, Load Balancers, Compute Resources",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "3",
        "name": "Cloud Storage",
        "tech": "S3, Azure Blob, Cloud Storage",
        "games": "AWS Cloud Quest, GCP Labs, Azure Labs, Cloud Resume Challenge",
        "topics": "Object/Block/File Storage, Backup, Lifecycle Rules",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "4",
        "name": "Cloud Databases",
        "tech": "RDS, DynamoDB, CosmosDB, Firestore",
        "games": "AWS Cloud Quest, GCP Labs, Azure Labs, MongoDB University",
        "topics": "Managed Databases, Scaling, Replication, Backups",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "5",
        "name": "Serverless Computing",
        "tech": "AWS Lambda, Azure Functions, Cloud Functions",
        "games": "AWS Cloud Quest, Serverless Challenges, Cloud Resume Challenge, GCP Labs",
        "topics": "FaaS, Event Driven Systems, Serverless APIs, Cost Optimization",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "6",
        "name": "Linux Fundamentals",
        "tech": "Linux, Bash",
        "games": "Hacknet, Grey Hack, Bandit (OverTheWire), Terminus",
        "topics": "Commands, Permissions, Shell, Processes, Filesystem",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "7",
        "name": "Docker",
        "tech": "Docker",
        "games": "Play With Docker, Docker Labs, Katacoda, Docker Challenges",
        "topics": "Containers, Images, Dockerfile, Docker Compose",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "8",
        "name": "Kubernetes",
        "tech": "Kubernetes",
        "games": "Kubernetes Game, Killercoda, Katacoda, Play With Kubernetes",
        "topics": "Pods, Deployments, Services, Scaling, Ingress",
        "difficulty": "⭐⭐⭐⭐⭐"
      },
      {
        "id": "9",
        "name": "CI/CD",
        "tech": "GitHub Actions, Jenkins",
        "games": "GitHub Skills, CI/CD Labs, Jenkins Tutorials, DevOps Playground",
        "topics": "Pipelines, Build Automation, Testing Automation, Deployment Automation",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "10",
        "name": "Infrastructure as Code",
        "tech": "Terraform, CloudFormation",
        "games": "HashiCorp Learn, AWS Labs, Azure Labs, Terraform Challenges",
        "topics": "IaC, Provisioning, Automation, Infrastructure Management",
        "difficulty": "⭐⭐⭐⭐⭐"
      },
      {
        "id": "11",
        "name": "Cybersecurity Fundamentals",
        "tech": "Linux, Networking",
        "games": "Bandit, Hacknet, Grey Hack, PicoCTF",
        "topics": "CIA Triad, Threats, Vulnerabilities, Security Principles",
        "difficulty": "⭐⭐"
      },
      {
        "id": "12",
        "name": "Web Security",
        "tech": "Web Apps",
        "games": "OWASP Juice Shop, PortSwigger Web Academy, PicoCTF, HackTheBox Academy",
        "topics": "XSS, CSRF, SQL Injection, Authentication Flaws",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "13",
        "name": "Cryptography",
        "tech": "Python",
        "games": "CryptoHack, PicoCTF, HackTheBox, OverTheWire",
        "topics": "Encryption, Hashing, RSA, AES, Digital Signatures",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "14",
        "name": "Ethical Hacking",
        "tech": "Linux, Networking",
        "games": "Hack The Box, TryHackMe, PicoCTF, PortSwigger",
        "topics": "Enumeration, Exploitation, Privilege Escalation, Reconnaissance",
        "difficulty": "⭐⭐⭐⭐⭐"
      },
      {
        "id": "15",
        "name": "Digital Forensics",
        "tech": "Linux",
        "games": "CyberDefenders, Blue Team Labs, TryHackMe, PicoCTF",
        "topics": "Log Analysis, Memory Analysis, Incident Response, Malware Investigation",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "16",
        "name": "System Design Fundamentals",
        "tech": "Any",
        "games": "Factorio, Mindustry, Satisfactory, Shapez 2",
        "topics": "Scalability, Throughput, Latency, Bottlenecks, Capacity Planning",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "17",
        "name": "Distributed Systems",
        "tech": "Java, Go, Python",
        "games": "Factorio, Satisfactory, AWS Labs, Distributed Systems Simulators",
        "topics": "Distributed Architecture, Consensus, Replication, Partitioning",
        "difficulty": "⭐⭐⭐⭐⭐"
      },
      {
        "id": "18",
        "name": "Caching & Performance",
        "tech": "Redis",
        "games": "System Design Labs, Redis University, AWS Labs, Factorio",
        "topics": "Caching, CDN, Performance Optimization, Cache Invalidation",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "19",
        "name": "Messaging Systems",
        "tech": "Kafka, RabbitMQ",
        "games": "Kafka Labs, RabbitMQ Tutorials, AWS Labs, Distributed Simulators",
        "topics": "Queues, Pub/Sub, Event Driven Architecture",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "20",
        "name": "Large Scale System Design",
        "tech": "Any",
        "games": "System Design Primer, AWS Labs, GCP Labs, Design Simulators",
        "topics": "URL Shortener, Chat System, YouTube/Instagram Design, Distributed Databases",
        "difficulty": "⭐⭐⭐⭐⭐"
      },
      {
        "id": "21",
        "name": "Blockchain Fundamentals",
        "tech": "Solidity",
        "games": "CryptoZombies, Ethernaut, Buildspace, LearnWeb3",
        "topics": "Blocks, Transactions, Consensus, Smart Contracts",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "22",
        "name": "Smart Contracts",
        "tech": "Solidity",
        "games": "CryptoZombies, Ethernaut, Buildspace, Chainshot",
        "topics": "Solidity, ERC20, ERC721, Contract Security",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "23",
        "name": "Android Development",
        "tech": "Kotlin, Java",
        "games": "Android Codelabs, Jetpack Compose Challenges, Google Android Basics, Droidcon Samples",
        "topics": "Activities, Fragments, Intents, Room Database, MVVM",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "24",
        "name": "Cross Platform Development",
        "tech": "Dart, Flutter",
        "games": "Flutter Codelabs, Flutter Challenges, App Ideas Collection, Flutter Samples",
        "topics": "Widgets, State Management, Navigation, API Integration",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "25",
        "name": "IoT Fundamentals",
        "tech": "C, C++, Python",
        "games": "Wokwi, Tinkercad Circuits, Arduino Projects Hub, Blynk Challenges",
        "topics": "Sensors, Microcontrollers, Arduino, ESP32, IoT Communication",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "26",
        "name": "AIoT & Smart Systems",
        "tech": "Python, C++",
        "games": "Wokwi, Edge Impulse, Tinkercad, Arduino Cloud",
        "topics": "Edge AI, Sensor Analytics, Smart Automation, AIoT Systems",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "27",
        "name": "Game Development Fundamentals",
        "tech": "C#, C++",
        "games": "Unity Learn, Godot Learn, Brackeys Challenges, GameDev.tv",
        "topics": "Game Loops, Physics, Input Systems, Scenes",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "28",
        "name": "AI in Games",
        "tech": "C#, Python",
        "games": "Unity ML-Agents, Godot AI Labs, OpenAI Gym, Screeps",
        "topics": "Pathfinding, Behavior Trees, NPC AI, Reinforcement Learning",
        "difficulty": "⭐⭐⭐⭐⭐"
      }
    ]
  },
  {
    "id": 7,
    "title": "PART 7: Full-Stack Integration",
    "modules": [
      {
        "id": "1",
        "name": "Frontend Layer",
        "tech": "HTML, CSS, JavaScript, TypeScript",
        "games": "Flexbox Froggy, Grid Garden, Frontend Mentor, React.gg",
        "topics": "Semantic HTML, Forms, Accessibility, Flexbox/Grid, Responsive Design, DOM, Events, Async Programming, React Components/Hooks/State/Routing",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "2",
        "name": "Frontend → Backend Communication",
        "tech": "JavaScript, TypeScript",
        "games": "Postman, Hoppscotch, Frontend Mentor, Backend Mentor",
        "topics": "REST APIs, HTTP Methods, JSON, Axios, Fetch API, API Testing",
        "difficulty": "⭐⭐⭐"
      },
      {
        "id": "3",
        "name": "Backend Layer",
        "tech": "Node.js, Express.js",
        "games": "NodeSchool, Backend Mentor, Screeps, Bitburner",
        "topics": "Express, Middleware, Routing, Controllers, Services, Validation, Error Handling",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "4",
        "name": "Database Integration",
        "tech": "MongoDB, PostgreSQL",
        "games": "MongoDB University, SQL Murder Mystery, DataLemur, Backend Mentor",
        "topics": "CRUD, Mongoose, Prisma, Relationships, Aggregation",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "5",
        "name": "Authentication System",
        "tech": "JWT, OAuth, Cookies",
        "games": "OWASP Juice Shop, PortSwigger, Backend Mentor, Auth Labs",
        "topics": "Login, Signup, Password Hashing, JWT, Sessions, Role Based Access",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "6",
        "name": "Full MERN Stack",
        "tech": "MongoDB, Express, React, Node",
        "games": "Portfolio, E-Commerce, Chat App, LMS (Projects)",
        "topics": "MERN Architecture, API Integration, State Management, Deployment",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "7",
        "name": "Software Architecture",
        "tech": "Node.js, React",
        "games": "Screeps, Factorio, Mindustry, Shapez",
        "topics": "MVC, Layered Architecture, Clean Architecture, Repository Pattern, Service Layer",
        "difficulty": "⭐⭐⭐⭐⭐"
      },
      {
        "id": "8",
        "name": "Cloud Deployment",
        "tech": "Vercel, Render, AWS",
        "games": "AWS Cloud Quest, Cloud Resume Challenge, Vercel Projects, Render Deployments",
        "topics": "Hosting, Domains, SSL, Environment Variables, Production Deployment",
        "difficulty": "⭐⭐⭐⭐"
      },
      {
        "id": "9",
        "name": "DevOps Integration",
        "tech": "Docker, GitHub Actions",
        "games": "Docker Labs, GitHub Skills, Killercoda, Katacoda",
        "topics": "Containers, CI/CD, Deployment Pipelines, Monitoring",
        "difficulty": "⭐⭐⭐⭐⭐"
      },
      {
        "id": "10",
        "name": "Security Layer",
        "tech": "OWASP",
        "games": "OWASP Juice Shop, PortSwigger, HackTheBox Academy, TryHackMe",
        "topics": "XSS, CSRF, SQL Injection, Authentication Security, Rate Limiting",
        "difficulty": "⭐⭐⭐⭐⭐"
      },
      {
        "id": "11",
        "name": "AI Integration",
        "tech": "OpenAI/Groq/Gemini APIs, Vector DBs",
        "games": "Hugging Face, LangChain, LlamaIndex, OpenAI Cookbook",
        "topics": "AI Chatbots, RAG, Embeddings, Vector Search, AI Agents",
        "difficulty": "⭐⭐⭐⭐⭐"
      },
      {
        "id": "12",
        "name": "Production-Level Full Stack",
        "tech": "MERN, PostgreSQL, Redis, Docker, AWS",
        "games": "-",
        "topics": "Scaling, Caching, Queues, Monitoring, Logging, System Design",
        "difficulty": "⭐⭐⭐⭐⭐"
      }
    ]
  }
];
