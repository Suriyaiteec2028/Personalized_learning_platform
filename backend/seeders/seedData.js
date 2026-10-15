const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('../models/Course');
const Question = require('../models/Question');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const coursesData = [
  {
    title: 'Java Programming',
    code: 'JAVA101',
    category: 'Programming Languages',
    description: 'Master Java from basic variables and OOP principles to advanced collections, exception handling, and multithreading.',
    difficulty: 'Beginner',
    isDefault: true,
    modules: [
      {
        moduleNumber: 1,
        title: 'Variables, Constants, and Data Types',
        description: 'Understand how memory is allocated, primitive data types, type casting, and variable declarations in Java.',
        topics: [
          {
            topicNumber: 1,
            title: 'Variables, Constants, and Data Types',
            explanation: 'In Java, a variable is a named container in memory used to store data values. Primitive types include int (32-bit), double (64-bit float), boolean (true/false), and char (16-bit Unicode). Constants are defined using the `final` keyword, ensuring their value cannot be reassigned once initialized.',
            codeExample: `public class Main {\n    public static void main(String[] args) {\n        final double PI = 3.14159;\n        int studentAge = 21;\n        char grade = 'A';\n        boolean isEnrolled = true;\n        System.out.println("Age: " + studentAge + ", Grade: " + grade);\n    }\n}`,
            diagram: `+---------------------------------------------------+
|               JAVA DATA TYPES                     |
+-------------------------+-------------------------+
|     Primitive Types     |   Non-Primitive Types   |
| (int, double, char, etc)|  (Strings, Arrays, etc) |
+-------------------------+-------------------------+
| Allocated on Stack      | Allocated on Heap       |
+-------------------------+-------------------------+`,
            practicalNotes: 'Always use primitive types for maximum performance when object wrappers like Integer are not explicitly needed.'
          },
          {
            topicNumber: 2,
            title: 'Operators and Type Conversion',
            explanation: 'Java supports Arithmetic (+, -, *, /, %), Relational (==, !=, >, <), and Logical (&&, ||, !) operators. Implicit widening conversion happens automatically from smaller to larger types (e.g., int to double), while explicit narrowing conversion requires casting.',
            codeExample: `public class TypeCasting {\n    public static void main(String[] args) {\n        int count = 9;\n        double result = count; // Widening\n        double val = 9.78;\n        int intVal = (int) val; // Narrowing: 9\n        System.out.println("Narrowed integer: " + intVal);\n    }\n}`,
            diagram: `Byte -> Short -> Int -> Long -> Float -> Double (Widening: Automatic)
Double -> Float -> Long -> Int -> Short -> Byte (Narrowing: Explicit Cast required)`,
            practicalNotes: 'Narrowing conversions truncate fractional decimal values without rounding.'
          }
        ]
      },
      {
        moduleNumber: 2,
        title: 'Control Flow & Loops',
        description: 'Learn decision-making constructs (if-else, switch) and repetitive execution using for, while, and do-while loops.',
        topics: [
          {
            topicNumber: 1,
            title: 'Conditional Statements & Switch Expressions',
            explanation: 'Conditional statements direct program execution flow. Java provides if, else-if, else statements, and switch statements to test equality against multiple fixed values.',
            codeExample: `public class Conditionals {\n    public static void main(String[] args) {\n        int score = 85;\n        if (score >= 90) {\n            System.out.println("Grade A");\n        } else if (score >= 80) {\n            System.out.println("Grade B");\n        } else {\n            System.out.println("Grade C");\n        }\n    }\n}`,
            diagram: `[Start] -> [Condition Score >= 90?] --True--> [Grade A]
                   |
                 False
                   v
             [Condition Score >= 80?] --True--> [Grade B]
                   |
                 False -> [Grade C]`,
            practicalNotes: 'Use switch statements for multi-branch code based on discrete discrete primitive or String values.'
          },
          {
            topicNumber: 2,
            title: 'Loops & Iteration Controls',
            explanation: 'For loops iterate a known number of times. While loops check conditions before executing, and do-while loops execute at least once before testing the condition. Break exits a loop early, while continue skips the current iteration.',
            codeExample: `public class LoopsDemo {\n    public static void main(String[] args) {\n        for (int i = 1; i <= 5; i++) {\n            if (i == 3) continue;\n            System.out.println("Iteration: " + i);\n        }\n    }\n}`,
            diagram: `[For Loop Initialization] -> [Condition Check] --True--> [Execute Loop Body] -> [Increment] -> [Condition Check...]
                                     |
                                   False -> [Exit Loop]`,
            practicalNotes: 'Be careful with loop counter boundary conditions to prevent infinite loops.'
          }
        ]
      },
      {
        moduleNumber: 3,
        title: 'Object-Oriented Programming (Classes & Inheritance)',
        description: 'Understand core OOP fundamentals including Classes, Objects, Constructors, Inheritance, Encapsulation, and Polymorphism.',
        topics: [
          {
            topicNumber: 1,
            title: 'Classes, Objects, and Constructors',
            explanation: 'A class is a blueprint for creating objects. Objects encapsulate state (fields) and behavior (methods). Constructors initialize new instance variables when objects are instantiated using the `new` keyword.',
            codeExample: `class Student {\n    String name;\n    int roll;\n    Student(String name, int roll) {\n        this.name = name;\n        this.roll = roll;\n    }\n    void display() {\n        System.out.println(name + " - Roll: " + roll);\n    }\n}`,
            diagram: `+----------------------------------+
|          CLASS: Student          |
+----------------------------------+
| Attributes: name, roll           |
| Methods: display()               |
+----------------------------------+
                | Instantiation (new)
                v
+----------------------------------+
| OBJECT: student1 (Alice, 101)    |
+----------------------------------+`,
            practicalNotes: 'Constructors have no return type and match the exact name of the class.'
          },
          {
            topicNumber: 2,
            title: 'Inheritance, Polymorphism & Abstraction',
            explanation: 'Inheritance allows a subclass to acquire properties from a superclass using `extends`. Polymorphism allows methods to perform different actions based on object type (Method Overriding). Abstraction hides implementation details using Abstract Classes or Interfaces.',
            codeExample: `abstract class Animal {\n    abstract void makeSequence();\n}\nclass Dog extends Animal {\n    void makeSequence() {\n        System.out.println("Woof Woof!");\n    }\n}`,
            diagram: `    [Animal (Abstract Class)]
                  ^
                  | extends
               [Dog Class]`,
            practicalNotes: 'Java supports single class inheritance but multiple interface inheritance.'
          }
        ]
      }
    ]
  },
  {
    title: 'Python Programming',
    code: 'PY101',
    category: 'Programming Languages',
    description: 'Learn Python syntax, dynamic typing, data structures (lists, dicts), functions, object-oriented concepts, and file processing.',
    difficulty: 'Beginner',
    isDefault: true,
    modules: [
      {
        moduleNumber: 1,
        title: 'Python Fundamentals & Dynamic Variables',
        description: 'Explore Python dynamic typing, variable declarations, primitive types, and basic I/O functions.',
        topics: [
          {
            topicNumber: 1,
            title: 'Variables, Data Types, and Dynamic Typing',
            explanation: 'Python is dynamically typed; variable types are inferred automatically at runtime. Built-in types include int, float, str, bool, and NoneType.',
            codeExample: `user_name = "Suriya"\nuser_score = 98.5\nis_active = True\nprint(f"User: {user_name}, Score: {user_score}")`,
            diagram: `Variables in Python are references pointing to objects in memory:
user_name ----> [ String Object: "Suriya" ]
user_score ---> [ Float Object: 98.5 ]`,
            practicalNotes: 'Python variable names are case-sensitive and follow snake_case convention.'
          }
        ]
      },
      {
        moduleNumber: 2,
        title: 'Functions & Data Structures',
        description: 'Master Python functions, lambda expressions, lists, tuples, sets, and dictionary manipulations.',
        topics: [
          {
            topicNumber: 1,
            title: 'Functions & List Comprehensions',
            explanation: 'Functions are defined using `def`. Python supports positional arguments, keyword arguments, default values, and concise list comprehensions.',
            codeExample: `def calculate_total(prices, tax_rate=0.05):\n    return [price * (1 + tax_rate) for price in prices]\n\nitems = [100, 200, 300]\nprint(calculate_total(items))`,
            diagram: `[Input List: 100, 200, 300] -> [List Comprehension] -> [Output List: 105.0, 210.0, 315.0]`,
            practicalNotes: 'List comprehensions are faster and more readable than manual append loops.'
          }
        ]
      }
    ]
  },
  {
    title: 'DSA Using Java',
    code: 'DSA101',
    category: 'Data Structures & Algorithms',
    description: 'Comprehensive Data Structures & Algorithms course in Java covering Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, and Sorting.',
    difficulty: 'Intermediate',
    isDefault: true,
    modules: [
      {
        moduleNumber: 1,
        title: 'Arrays & Two Pointers Algorithm',
        description: 'Understand array data structures, sliding window, and two-pointer traversal techniques.',
        topics: [
          {
            topicNumber: 1,
            title: 'Arrays & Array Manipulations',
            explanation: 'Arrays store elements in contiguous memory locations. Two-pointer algorithms optimize search operations from O(N^2) to O(N) by traversing from both ends simultaneously.',
            codeExample: `public class TwoSumSorted {\n    public static boolean hasPairWithSum(int[] arr, int target) {\n        int left = 0, right = arr.length - 1;\n        while(left < right) {\n            int sum = arr[left] + arr[right];\n            if (sum == target) return true;\n            if (sum < target) left++;\n            else right--;\n        }\n        return false;\n    }\n}`,
            diagram: `Pointers:  Left -> [ 1, 3, 5, 7, 10 ] <- Right
Sum check: arr[Left] + arr[Right] vs Target`,
            practicalNotes: 'Two pointer technique requires the input array to be sorted.'
          }
        ]
      },
      {
        moduleNumber: 2,
        title: 'Linked Lists & Dynamic Nodes',
        description: 'Master Singly, Doubly, and Circular Linked Lists with node pointer operations.',
        topics: [
          {
            topicNumber: 1,
            title: 'Linked Lists',
            explanation: 'A Linked List is a linear data structure where elements are not stored in contiguous memory. Each node contains a data payload and a reference pointer to the next node.',
            codeExample: `class Node {\n    int val;\n    Node next;\n    Node(int val) {\n        this.val = val;\n        this.next = null;\n    }\n}`,
            diagram: `[ Head: Node 1 ] -> [ Node 2 ] -> [ Node 3 ] -> null`,
            practicalNotes: 'Linked lists allow O(1) insertion and deletion at head without array shifting.'
          }
        ]
      }
    ]
  },
  {
    title: 'React.js Frontend Masterclass',
    code: 'REACT101',
    category: 'Web Development',
    description: 'Learn modern React with JSX, functional components, hooks (useState, useEffect), state management, and component architecture.',
    difficulty: 'Intermediate',
    isDefault: false,
    modules: [
      {
        moduleNumber: 1,
        title: 'React Components & State Management',
        description: 'Build interactive user interfaces using reusable React components and dynamic state hooks.',
        topics: [
          {
            topicNumber: 1,
            title: 'React Hooks & Virtual DOM',
            explanation: 'React uses a Virtual DOM to optimize view updates. Hooks like useState and useEffect allow functional components to manage local state and lifecycle side effects.',
            codeExample: `import React, { useState } from 'react';\nexport function Counter() {\n    const [count, setCount] = useState(0);\n    return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;\n}`,
            diagram: `[ State Change ] -> [ Virtual DOM Diff ] -> [ Minimal Real DOM Update ]`,
            practicalNotes: 'Never mutate state directly; always use the setter function.'
          }
        ]
      }
    ]
  },
  {
    title: 'HTML5, CSS3 & Modern Web UI',
    code: 'WEB101',
    category: 'Web Development',
    description: 'Master semantic HTML tags, Flexbox, Grid, CSS responsiveness, and web design fundamentals.',
    difficulty: 'Beginner',
    isDefault: false,
    modules: [
      {
        moduleNumber: 1,
        title: 'Modern CSS Layouts',
        description: 'Build responsive web pages using CSS Flexbox, Grid, and media queries.',
        topics: [
          {
            topicNumber: 1,
            title: 'Flexbox & CSS Grid',
            explanation: 'CSS Flexbox simplifies 1D layout alignment, while CSS Grid provides powerful 2D grid positioning for responsive web design.',
            codeExample: `.container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}`,
            diagram: `+-------------------------------------------------------+
|  [ Flex Item 1 ]   [ Flex Item 2 ]   [ Flex Item 3 ]  |
+-------------------------------------------------------+`,
            practicalNotes: 'Use Flexbox for components and navigation bars; use Grid for page-level layouts.'
          }
        ]
      }
    ]
  }
];

const seedQuestions = async (courseMap) => {
  const javaCourse = courseMap['JAVA101'];
  const pythonCourse = courseMap['PY101'];
  const dsaCourse = courseMap['DSA101'];

  const questions = [
    // Java Questions for Variables & Data Types
    {
      courseId: javaCourse._id,
      moduleTitle: 'Variables, Constants, and Data Types',
      topicTitle: 'Variables, Constants, and Data Types',
      type: 'mcq',
      questionText: 'Which keyword is used in Java to make a variable constant and unmodifiable?',
      options: ['static', 'final', 'const', 'immutable'],
      correctAnswer: 1, // 'final'
      points: 1
    },
    {
      courseId: javaCourse._id,
      moduleTitle: 'Variables, Constants, and Data Types',
      topicTitle: 'Variables, Constants, and Data Types',
      type: 'mcq',
      questionText: 'What is the default initial value of an uninitialized primitive int instance variable in Java?',
      options: ['null', '0', 'undefined', '-1'],
      correctAnswer: 1, // '0'
      points: 1
    },
    {
      courseId: javaCourse._id,
      moduleTitle: 'Variables, Constants, and Data Types',
      topicTitle: 'Variables, Constants, and Data Types',
      type: 'mcq',
      questionText: 'What is the size of a Java primitive `double` data type in memory?',
      options: ['16-bit', '32-bit', '64-bit', '128-bit'],
      correctAnswer: 2, // '64-bit'
      points: 1
    },
    {
      courseId: javaCourse._id,
      moduleTitle: 'Variables, Constants, and Data Types',
      topicTitle: 'Variables, Constants, and Data Types',
      type: 'mcq',
      questionText: 'Which of the following is NOT a valid Java identifier?',
      options: ['_studentCount', '$amount', '1stRank', 'student_age'],
      correctAnswer: 2, // '1stRank'
      points: 1
    },
    {
      courseId: javaCourse._id,
      moduleTitle: 'Variables, Constants, and Data Types',
      topicTitle: 'Variables, Constants, and Data Types',
      type: 'mcq',
      questionText: 'Which data type should be preferred for absolute precise financial currency calculations in Java?',
      options: ['float', 'double', 'BigDecimal', 'int'],
      correctAnswer: 2, // 'BigDecimal'
      points: 1
    },
    {
      courseId: javaCourse._id,
      moduleTitle: 'Variables, Constants, and Data Types',
      topicTitle: 'Variables, Constants, and Data Types',
      type: 'programming',
      questionText: 'Write a Java method `public static double convertCelsiusToFahrenheit(double celsius)` that converts Celsius temperature to Fahrenheit using formula: (celsius * 9/5) + 32.',
      sampleCode: `public class Solution {\n    public static double convertCelsiusToFahrenheit(double celsius) {\n        // Your code here\n        return 0.0;\n    }\n}`,
      correctAnswer: `return (celsius * 9.0 / 5.0) + 32;`,
      expectedKeywords: ['double', 'return', '32'],
      testCases: [
        { input: '0', expectedOutput: '32.0' },
        { input: '100', expectedOutput: '212.0' }
      ],
      points: 5
    },

    // Java Questions for Operators and Type Conversion
    {
      courseId: javaCourse._id,
      moduleTitle: 'Variables, Constants, and Data Types',
      topicTitle: 'Operators and Type Conversion',
      type: 'mcq',
      questionText: 'What happens during narrowing type casting from double to int in Java?',
      options: ['The value is rounded up', 'The fractional decimal digits are truncated', 'A Compilation Error is thrown', 'The value is automatically converted to String'],
      correctAnswer: 1,
      points: 1
    },
    {
      courseId: javaCourse._id,
      moduleTitle: 'Variables, Constants, and Data Types',
      topicTitle: 'Operators and Type Conversion',
      type: 'mcq',
      questionText: 'What is the output of `5 % 2` in Java?',
      options: ['2.5', '2', '1', '0'],
      correctAnswer: 2,
      points: 1
    },
    {
      courseId: javaCourse._id,
      moduleTitle: 'Variables, Constants, and Data Types',
      topicTitle: 'Operators and Type Conversion',
      type: 'mcq',
      questionText: 'Which binary logical operator performs short-circuit evaluation in Java?',
      options: ['&', '&&', '|', '^'],
      correctAnswer: 1,
      points: 1
    },
    {
      courseId: javaCourse._id,
      moduleTitle: 'Variables, Constants, and Data Types',
      topicTitle: 'Operators and Type Conversion',
      type: 'mcq',
      questionText: 'What is the value of `int a = 5; int b = a++;`?',
      options: ['a=6, b=5', 'a=6, b=6', 'a=5, b=5', 'a=5, b=6'],
      correctAnswer: 0,
      points: 1
    },
    {
      courseId: javaCourse._id,
      moduleTitle: 'Variables, Constants, and Data Types',
      topicTitle: 'Operators and Type Conversion',
      type: 'mcq',
      questionText: 'What is the result of `10 + 20 + "Java"`?',
      options: ['1020Java', '30Java', 'Java30', 'Error'],
      correctAnswer: 1,
      points: 1
    },
    {
      courseId: javaCourse._id,
      moduleTitle: 'Variables, Constants, and Data Types',
      topicTitle: 'Operators and Type Conversion',
      type: 'programming',
      questionText: 'Write a Java program to swap two integer variables without using a third temporary variable.',
      sampleCode: `public class Solution {\n    public static void swap(int a, int b) {\n        // Your code here\n    }\n}`,
      correctAnswer: `a = a + b; b = a - b; a = a - b;`,
      expectedKeywords: ['+', '-'],
      points: 5
    },

    // Java Questions for Loops & Conditionals
    {
      courseId: javaCourse._id,
      moduleTitle: 'Control Flow & Loops',
      topicTitle: 'Loops & Iteration Controls',
      type: 'mcq',
      questionText: 'Which loop guarantees that its body will execute at least once regardless of condition?',
      options: ['for loop', 'while loop', 'do-while loop', 'for-each loop'],
      correctAnswer: 2,
      points: 1
    },
    {
      courseId: javaCourse._id,
      moduleTitle: 'Control Flow & Loops',
      topicTitle: 'Loops & Iteration Controls',
      type: 'mcq',
      questionText: 'What does the `continue` statement do inside a loop body?',
      options: ['Terminates the entire loop', 'Skips the remaining code in current iteration and moves to next', 'Restarts the loop from 0', 'Exits the method'],
      correctAnswer: 1,
      points: 1
    },
    {
      courseId: javaCourse._id,
      moduleTitle: 'Control Flow & Loops',
      topicTitle: 'Loops & Iteration Controls',
      type: 'mcq',
      questionText: 'What is the output of `for(int i=0; i<3; i++) System.out.print(i);`?',
      options: ['0123', '012', '123', '01'],
      correctAnswer: 1,
      points: 1
    },
    {
      courseId: javaCourse._id,
      moduleTitle: 'Control Flow & Loops',
      topicTitle: 'Loops & Iteration Controls',
      type: 'mcq',
      questionText: 'Which statement is used to jump out of a switch block or loop prematurely?',
      options: ['skip', 'stop', 'break', 'return'],
      correctAnswer: 2,
      points: 1
    },
    {
      courseId: javaCourse._id,
      moduleTitle: 'Control Flow & Loops',
      topicTitle: 'Loops & Iteration Controls',
      type: 'mcq',
      questionText: 'What occurs if the termination condition in a while loop is never met?',
      options: ['Compilation Error', 'Infinite Loop', 'NullPointerException', 'StackOverflowError'],
      correctAnswer: 1,
      points: 1
    },
    {
      courseId: javaCourse._id,
      moduleTitle: 'Control Flow & Loops',
      topicTitle: 'Loops & Iteration Controls',
      type: 'programming',
      questionText: 'Write a Java method `public static int factorial(int n)` that uses a loop to compute the factorial of a given non-negative integer n.',
      sampleCode: `public class Solution {\n    public static int factorial(int n) {\n        // Your code here\n        return 1;\n    }\n}`,
      correctAnswer: `int fact = 1; for(int i=1; i<=n; i++) fact *= i; return fact;`,
      expectedKeywords: ['for', 'return'],
      points: 5
    },

    // Python Questions
    {
      courseId: pythonCourse._id,
      moduleTitle: 'Python Fundamentals & Dynamic Variables',
      topicTitle: 'Variables, Data Types, and Dynamic Typing',
      type: 'mcq',
      questionText: 'What happens when you reassign a variable to a different data type in Python?',
      options: ['TypeError is thrown', 'Python dynamically rebinds the variable to the new object', 'The code fails at compilation', 'Manual casting is required'],
      correctAnswer: 1,
      points: 1
    },
    {
      courseId: pythonCourse._id,
      moduleTitle: 'Python Fundamentals & Dynamic Variables',
      topicTitle: 'Variables, Data Types, and Dynamic Typing',
      type: 'programming',
      questionText: 'Write a Python function `def is_even(num):` that returns True if num is even and False otherwise.',
      sampleCode: `def is_even(num):\n    # Write code here\n    pass`,
      correctAnswer: `return num % 2 == 0`,
      expectedKeywords: ['return', '%'],
      points: 5
    },

    // DSA Questions
    {
      courseId: dsaCourse._id,
      moduleTitle: 'Arrays & Two Pointers Algorithm',
      topicTitle: 'Arrays & Array Manipulations',
      type: 'mcq',
      questionText: 'What is the time complexity of searching for an element in an unsorted array of size N?',
      options: ['O(1)', 'O(log N)', 'O(N)', 'O(N^2)'],
      correctAnswer: 2,
      points: 1
    },
    {
      courseId: dsaCourse._id,
      moduleTitle: 'Arrays & Two Pointers Algorithm',
      topicTitle: 'Arrays & Array Manipulations',
      type: 'programming',
      questionText: 'Write a Java method `public static int findMax(int[] nums)` that returns the maximum integer in an array.',
      sampleCode: `public class Solution {\n    public static int findMax(int[] nums) {\n        // Code here\n        return 0;\n    }\n}`,
      correctAnswer: `int max = nums[0]; for(int n : nums) if(n > max) max = n; return max;`,
      expectedKeywords: ['for', 'return'],
      points: 5
    },

    // Linked List Questions
    {
      courseId: dsaCourse._id,
      moduleTitle: 'Linked Lists & Dynamic Nodes',
      topicTitle: 'Linked Lists',
      type: 'mcq',
      questionText: 'What is the primary advantage of a Singly Linked List over a contiguous Array?',
      options: ['Random access O(1)', 'O(1) dynamic insertion at head without resizing', 'Lower memory overhead per element', 'Faster binary search'],
      correctAnswer: 1,
      points: 1
    },
    {
      courseId: dsaCourse._id,
      moduleTitle: 'Linked Lists & Dynamic Nodes',
      topicTitle: 'Linked Lists',
      type: 'programming',
      questionText: 'Write a Java method `public static Node reverse(Node head)` to reverse a singly linked list and return the new head.',
      sampleCode: `public class Solution {\n    public static Node reverse(Node head) {\n        // Your code here\n        return head;\n    }\n}`,
      correctAnswer: `Node prev = null, curr = head; while(curr != null) { Node next = curr.next; curr.next = prev; prev = curr; curr = next; } return prev;`,
      expectedKeywords: ['while', 'curr', 'prev', 'next'],
      points: 5
    }
  ];

  await Question.insertMany(questions);
  console.log(`Seeded ${questions.length} questions successfully!`);
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/personalized_learning_platform');
    console.log('MongoDB Connected for Seeding');

    await Course.deleteMany({});
    await Question.deleteMany({});
    await User.deleteMany({});

    console.log('Cleared existing courses, questions, and users.');

    const createdCourses = await Course.insertMany(coursesData);
    console.log(`Seeded ${createdCourses.length} courses.`);

    const courseMap = {};
    createdCourses.forEach(c => {
      courseMap[c.code] = c;
    });

    await seedQuestions(courseMap);

    // Create a default Teacher account
    const salt = await bcrypt.genSalt(10);
    const teacherPassword = await bcrypt.hash('teacher123', salt);
    
    const defaultTeacher = await User.create({
      name: 'Dr. Alan Turing',
      email: 'teacher@platform.com',
      password: teacherPassword,
      role: 'teacher',
      teacherCode: 'TCH7A9X2',
      institution: 'Institute of Computer Science',
      department: 'Software Engineering',
      qualification: 'Ph.D. in Computer Science',
      phone: '+1 555-0198'
    });
    console.log(`Default Teacher created! Code: ${defaultTeacher.teacherCode}`);

    // Create a default Student account
    const studentPassword = await bcrypt.hash('student123', salt);
    const defaultStudent = await User.create({
      name: 'Alice Johnson',
      email: 'student@platform.com',
      password: studentPassword,
      role: 'student',
      connectedTeacherId: defaultTeacher._id,
      rollNumber: 'CS2026-042',
      institution: 'Institute of Computer Science',
      department: 'Computer Science',
      gender: 'Female',
      interests: ['Java', 'DSA', 'Full Stack Web Development']
    });
    console.log(`Default Student created! Connected to Teacher ${defaultTeacher.name}`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();
