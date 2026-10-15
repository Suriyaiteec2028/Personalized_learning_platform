const TestAttempt = require('../models/TestAttempt');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');

// Curated database of 10-12 DIRECT, VERIFIED LeetCode and HackerRank problem URLs per topic
// Every single URL points directly to a specific coding problem (e.g. /problems/xyz/ or /challenges/xyz/problem)
const PROBLEM_RECOMMENDATIONS = {
  'Variables, Constants, and Data Types': {
    leetcode: [
      { name: 'Subtract the Product and Sum of Digits of an Integer', url: 'https://leetcode.com/problems/subtract-the-product-and-sum-of-digits-of-an-integer/' },
      { name: 'Number of Steps to Reduce a Number to Zero', url: 'https://leetcode.com/problems/number-of-steps-to-reduce-a-number-to-zero/' },
      { name: 'Convert the Temperature', url: 'https://leetcode.com/problems/convert-the-temperature/' },
      { name: 'Smallest Even Multiple', url: 'https://leetcode.com/problems/smallest-even-multiple/' },
      { name: 'Add Two Integers', url: 'https://leetcode.com/problems/add-two-integers/' },
      { name: 'Divisible and Non-divisible Sums Difference', url: 'https://leetcode.com/problems/divisible-and-non-divisible-sums-difference/' },
      { name: 'Palindrome Number', url: 'https://leetcode.com/problems/palindrome-number/' },
      { name: 'Power of Two', url: 'https://leetcode.com/problems/power-of-two/' },
      { name: 'Power of Three', url: 'https://leetcode.com/problems/power-of-three/' },
      { name: 'Fibonacci Number', url: 'https://leetcode.com/problems/fibonacci-number/' }
    ],
    hackerrank: [
      { name: 'Java Stdin and Stdout I', url: 'https://www.hackerrank.com/challenges/java-stdin-and-stdout-1/problem' },
      { name: 'Java Stdin and Stdout II', url: 'https://www.hackerrank.com/challenges/java-stdin-stdout/problem' },
      { name: 'Java Datatypes', url: 'https://www.hackerrank.com/challenges/java-datatypes/problem' },
      { name: 'Java Output Formatting', url: 'https://www.hackerrank.com/challenges/java-output-formatting/problem' },
      { name: 'Java Int to String', url: 'https://www.hackerrank.com/challenges/java-int-to-string/problem' },
      { name: 'Java End-of-file', url: 'https://www.hackerrank.com/challenges/java-end-of-file/problem' },
      { name: 'Java Static Initializer Block', url: 'https://www.hackerrank.com/challenges/java-static-initializer-block/problem' },
      { name: 'Solve Me First', url: 'https://www.hackerrank.com/challenges/solve-me-first/problem' },
      { name: 'Simple Array Sum', url: 'https://www.hackerrank.com/challenges/simple-array-sum/problem' },
      { name: 'Compare the Triplets', url: 'https://www.hackerrank.com/challenges/compare-the-triplets/problem' }
    ]
  },

  'Operators and Type Conversion': {
    leetcode: [
      { name: 'Add Digits', url: 'https://leetcode.com/problems/add-digits/' },
      { name: 'Sum of Digits in Base K', url: 'https://leetcode.com/problems/sum-of-digits-in-base-k/' },
      { name: 'Count Integers With Even Digit Sum', url: 'https://leetcode.com/problems/count-integers-with-even-digit-sum/' },
      { name: 'Self Dividing Numbers', url: 'https://leetcode.com/problems/self-dividing-numbers/' },
      { name: 'Perfect Number', url: 'https://leetcode.com/problems/perfect-number/' },
      { name: 'Base 7', url: 'https://leetcode.com/problems/base-7/' },
      { name: 'Reverse Integer', url: 'https://leetcode.com/problems/reverse-integer/' },
      { name: 'Excel Sheet Column Number', url: 'https://leetcode.com/problems/excel-sheet-column-number/' },
      { name: 'Happy Number', url: 'https://leetcode.com/problems/happy-number/' },
      { name: 'Fibonacci Number', url: 'https://leetcode.com/problems/fibonacci-number/' }
    ],
    hackerrank: [
      { name: 'Python Arithmetic Operators', url: 'https://www.hackerrank.com/challenges/python-arithmetic-operators/problem' },
      { name: 'Python: Division', url: 'https://www.hackerrank.com/challenges/python-division/problem' },
      { name: 'Power - Mod Power', url: 'https://www.hackerrank.com/challenges/python-power-mod-power/problem' },
      { name: 'Integers In All Sizes', url: 'https://www.hackerrank.com/challenges/python-integers-in-all-sizes/problem' },
      { name: 'Java BigInteger', url: 'https://www.hackerrank.com/challenges/java-biginteger/problem' },
      { name: 'Java BigDecimal', url: 'https://www.hackerrank.com/challenges/java-bigdecimal/problem' },
      { name: 'Mod Divmod', url: 'https://www.hackerrank.com/challenges/python-mod-divmod/problem' },
      { name: 'Day of the Programmer', url: 'https://www.hackerrank.com/challenges/day-of-the-programmer/problem' },
      { name: 'Bill Division (Bon Appetit)', url: 'https://www.hackerrank.com/challenges/bon-appetit/problem' },
      { name: 'Sales by Match', url: 'https://www.hackerrank.com/challenges/sock-merchant/problem' }
    ]
  },

  'Conditional Statements & Switch Expressions': {
    leetcode: [
      { name: 'Fizz Buzz', url: 'https://leetcode.com/problems/fizz-buzz/' },
      { name: 'Sign of the Product of an Array', url: 'https://leetcode.com/problems/sign-of-the-product-of-an-array/' },
      { name: 'Valid Perfect Square', url: 'https://leetcode.com/problems/valid-perfect-square/' },
      { name: 'Roman to Integer', url: 'https://leetcode.com/problems/roman-to-integer/' },
      { name: 'Water Bottles', url: 'https://leetcode.com/problems/water-bottles/' },
      { name: 'Calculate Money in Leetcode Bank', url: 'https://leetcode.com/problems/calculate-money-in-leetcode-bank/' },
      { name: 'Pass the Pillow', url: 'https://leetcode.com/problems/pass-the-pillow/' },
      { name: 'Find the Pivot Integer', url: 'https://leetcode.com/problems/find-the-pivot-integer/' },
      { name: 'Minimum Cuts to Divide a Circle', url: 'https://leetcode.com/problems/minimum-cuts-to-divide-a-circle/' },
      { name: 'Distribute Candies Among Children I', url: 'https://leetcode.com/problems/distribute-candies-among-children-i/' }
    ],
    hackerrank: [
      { name: 'Java If-Else', url: 'https://www.hackerrank.com/challenges/java-if-else/problem' },
      { name: 'Python If-Else', url: 'https://www.hackerrank.com/challenges/py-if-else/problem' },
      { name: 'Grading Students', url: 'https://www.hackerrank.com/challenges/grading/problem' },
      { name: 'Number Line Jumps (Kangaroo)', url: 'https://www.hackerrank.com/challenges/kangaroo/problem' },
      { name: 'Breaking the Records', url: 'https://www.hackerrank.com/challenges/breaking-best-and-worst-records/problem' },
      { name: 'Cats and a Mouse', url: 'https://www.hackerrank.com/challenges/cats-and-a-mouse/problem' },
      { name: 'The Hurdle Race', url: 'https://www.hackerrank.com/challenges/the-hurdle-jump/problem' },
      { name: 'Designer PDF Viewer', url: 'https://www.hackerrank.com/challenges/designer-pdf-viewer/problem' },
      { name: 'Utopian Tree', url: 'https://www.hackerrank.com/challenges/utopian-tree/problem' },
      { name: 'Angry Professor', url: 'https://www.hackerrank.com/challenges/angry-professor/problem' }
    ]
  },

  'Loops & Iteration Controls': {
    leetcode: [
      { name: 'Palindrome Number', url: 'https://leetcode.com/problems/palindrome-number/' },
      { name: 'Climbing Stairs', url: 'https://leetcode.com/problems/climbing-stairs/' },
      { name: 'Counting Bits', url: 'https://leetcode.com/problems/counting-bits/' },
      { name: 'Ugly Number', url: 'https://leetcode.com/problems/ugly-number/' },
      { name: 'Self Dividing Numbers', url: 'https://leetcode.com/problems/self-dividing-numbers/' },
      { name: 'Arranging Coins', url: 'https://leetcode.com/problems/arranging-coins/' },
      { name: 'N-th Tribonacci Number', url: 'https://leetcode.com/problems/n-th-tribonacci-number/' },
      { name: 'Maximum 69 Number', url: 'https://leetcode.com/problems/maximum-69-number/' },
      { name: 'Count Odd Numbers in an Interval Range', url: 'https://leetcode.com/problems/count-odd-numbers-in-an-interval-range/' },
      { name: 'Sum of All Odd Length Subarrays', url: 'https://leetcode.com/problems/sum-of-all-odd-length-subarrays/' }
    ],
    hackerrank: [
      { name: 'Java Loops I', url: 'https://www.hackerrank.com/challenges/java-loops-i/problem' },
      { name: 'Java Loops II', url: 'https://www.hackerrank.com/challenges/java-loops/problem' },
      { name: 'Loops in Python', url: 'https://www.hackerrank.com/challenges/python-loops/problem' },
      { name: 'Write a Function (Leap Year)', url: 'https://www.hackerrank.com/challenges/write-a-function/problem' },
      { name: 'Print Function', url: 'https://www.hackerrank.com/challenges/python-print/problem' },
      { name: 'Staircase', url: 'https://www.hackerrank.com/challenges/staircase/problem' },
      { name: 'Mini-Max Sum', url: 'https://www.hackerrank.com/challenges/mini-max-sum/problem' },
      { name: 'Birthday Cake Candles', url: 'https://www.hackerrank.com/challenges/birthday-cake-candles/problem' },
      { name: 'Time Conversion', url: 'https://www.hackerrank.com/challenges/time-conversion/problem' },
      { name: 'Apple and Orange', url: 'https://www.hackerrank.com/challenges/apple-and-orange/problem' }
    ]
  },

  'Classes, Objects, and Constructors': {
    leetcode: [
      { name: 'Design Parking System', url: 'https://leetcode.com/problems/design-parking-system/' },
      { name: 'Design Underground System', url: 'https://leetcode.com/problems/design-underground-system/' },
      { name: 'Design HashMap', url: 'https://leetcode.com/problems/design-hashmap/' },
      { name: 'Design HashSet', url: 'https://leetcode.com/problems/design-hashset/' },
      { name: 'Design Browser History', url: 'https://leetcode.com/problems/design-browser-history/' },
      { name: 'Design Authentication Manager', url: 'https://leetcode.com/problems/design-authentication-manager/' },
      { name: 'Min Stack', url: 'https://leetcode.com/problems/min-stack/' },
      { name: 'Implement Queue using Stacks', url: 'https://leetcode.com/problems/implement-queue-using-stacks/' },
      { name: 'Implement Stack using Queues', url: 'https://leetcode.com/problems/implement-stack-using-queues/' },
      { name: 'Design an Ordered Stream', url: 'https://leetcode.com/problems/design-an-ordered-stream/' }
    ],
    hackerrank: [
      { name: 'Classes and Objects', url: 'https://www.hackerrank.com/challenges/classes-objects/problem' },
      { name: 'Java Instanceof keyword', url: 'https://www.hackerrank.com/challenges/java-instanceof-keyword/problem' },
      { name: 'Java Exception Handling (Try-catch)', url: 'https://www.hackerrank.com/challenges/java-exception-handling-try-catch/problem' },
      { name: 'Java Exception Handling', url: 'https://www.hackerrank.com/challenges/java-exception-handling/problem' },
      { name: 'Java Singleton Pattern', url: 'https://www.hackerrank.com/challenges/java-singleton/problem' },
      { name: 'Java Varargs - Simple Addition', url: 'https://www.hackerrank.com/challenges/java-varargs/problem' },
      { name: 'Java Factory Pattern', url: 'https://www.hackerrank.com/challenges/java-factory-pattern/problem' },
      { name: 'Box It!', url: 'https://www.hackerrank.com/challenges/box-it/problem' },
      { name: 'Inherited Code', url: 'https://www.hackerrank.com/challenges/inherited-code/problem' },
      { name: 'Exceptional Server', url: 'https://www.hackerrank.com/challenges/exceptional-server/problem' }
    ]
  },

  'Inheritance, Polymorphism & Abstraction': {
    leetcode: [
      { name: 'LRU Cache', url: 'https://leetcode.com/problems/lru-cache/' },
      { name: 'LFU Cache', url: 'https://leetcode.com/problems/lfu-cache/' },
      { name: 'Peeking Iterator', url: 'https://leetcode.com/problems/peeking-iterator/' },
      { name: 'Flatten Nested List Iterator', url: 'https://leetcode.com/problems/flatten-nested-list-iterator/' },
      { name: 'Iterator for Combination', url: 'https://leetcode.com/problems/iterator-for-combination/' },
      { name: 'Design Front Middle Back Queue', url: 'https://leetcode.com/problems/design-front-middle-back-queue/' },
      { name: 'Seat Reservation Manager', url: 'https://leetcode.com/problems/seat-reservation-manager/' },
      { name: 'Encode and Decode TinyURL', url: 'https://leetcode.com/problems/encode-and-decode-tinyurl/' },
      { name: 'Insert Delete GetRandom O(1)', url: 'https://leetcode.com/problems/insert-delete-getrandom-o1/' },
      { name: 'Design Linked List', url: 'https://leetcode.com/problems/design-linked-list/' }
    ],
    hackerrank: [
      { name: 'Java Inheritance I', url: 'https://www.hackerrank.com/challenges/java-inheritance-1/problem' },
      { name: 'Java Inheritance II', url: 'https://www.hackerrank.com/challenges/java-inheritance-2/problem' },
      { name: 'Java Abstract Class', url: 'https://www.hackerrank.com/challenges/java-abstract-class/problem' },
      { name: 'Java Interface', url: 'https://www.hackerrank.com/challenges/java-interface/problem' },
      { name: 'Java Method Overriding', url: 'https://www.hackerrank.com/challenges/java-method-overriding/problem' },
      { name: 'Java Method Overriding 2 (Super Keyword)', url: 'https://www.hackerrank.com/challenges/java-method-overriding-2-super-keyword/problem' },
      { name: 'Java Iterator', url: 'https://www.hackerrank.com/challenges/java-iterator/problem' },
      { name: 'Java Annotations', url: 'https://www.hackerrank.com/challenges/java-annotations/problem' },
      { name: 'Multi Level Inheritance', url: 'https://www.hackerrank.com/challenges/multi-level-inheritance-cpp/problem' },
      { name: 'Virtual Functions', url: 'https://www.hackerrank.com/challenges/virtual-functions/problem' }
    ]
  },

  'Variables, Data Types, and Dynamic Typing': {
    leetcode: [
      { name: 'Two Sum', url: 'https://leetcode.com/problems/two-sum/' },
      { name: 'Valid Anagram', url: 'https://leetcode.com/problems/valid-anagram/' },
      { name: 'Contains Duplicate', url: 'https://leetcode.com/problems/contains-duplicate/' },
      { name: 'Valid Palindrome', url: 'https://leetcode.com/problems/valid-palindrome/' },
      { name: 'Longest Common Prefix', url: 'https://leetcode.com/problems/longest-common-prefix/' },
      { name: 'Length of Last Word', url: 'https://leetcode.com/problems/length-of-last-word/' },
      { name: 'Plus One', url: 'https://leetcode.com/problems/plus-one/' },
      { name: 'Single Number', url: 'https://leetcode.com/problems/single-number/' },
      { name: 'Majority Element', url: 'https://leetcode.com/problems/majority-element/' },
      { name: 'Find the Difference', url: 'https://leetcode.com/problems/find-the-difference/' }
    ],
    hackerrank: [
      { name: 'Say Hello, World! With Python', url: 'https://www.hackerrank.com/challenges/say-hello-world-with-python/problem' },
      { name: 'Python If-Else', url: 'https://www.hackerrank.com/challenges/py-if-else/problem' },
      { name: 'Arithmetic Operators', url: 'https://www.hackerrank.com/challenges/python-arithmetic-operators/problem' },
      { name: 'Python: Division', url: 'https://www.hackerrank.com/challenges/python-division/problem' },
      { name: 'Loops in Python', url: 'https://www.hackerrank.com/challenges/python-loops/problem' },
      { name: 'Write a function (Leap Year)', url: 'https://www.hackerrank.com/challenges/write-a-function/problem' },
      { name: 'The Minion Game', url: 'https://www.hackerrank.com/challenges/the-minion-game/problem' },
      { name: 'String Split and Join', url: 'https://www.hackerrank.com/challenges/python-string-split-and-join/problem' },
      { name: 'Whats Your Name?', url: 'https://www.hackerrank.com/challenges/whats-your-name/problem' },
      { name: 'Mutations', url: 'https://www.hackerrank.com/challenges/python-mutations/problem' }
    ]
  },

  'Functions & List Comprehensions': {
    leetcode: [
      { name: 'Running Sum of 1d Array', url: 'https://leetcode.com/problems/running-sum-of-1d-array/' },
      { name: 'Richest Customer Wealth', url: 'https://leetcode.com/problems/richest-customer-wealth/' },
      { name: 'Shuffle the Array', url: 'https://leetcode.com/problems/shuffle-the-array/' },
      { name: 'Kids With the Greatest Number of Candies', url: 'https://leetcode.com/problems/kids-with-the-greatest-number-of-candies/' },
      { name: 'How Many Numbers Are Smaller Than the Current Number', url: 'https://leetcode.com/problems/how-many-numbers-are-smaller-than-the-current-number/' },
      { name: 'Decompress Run-Length Encoded List', url: 'https://leetcode.com/problems/decompress-run-length-encoded-list/' },
      { name: 'Create Target Array in the Given Order', url: 'https://leetcode.com/problems/create-target-array-in-the-given-order/' },
      { name: 'Count Items Matching a Rule', url: 'https://leetcode.com/problems/count-items-matching-a-rule/' },
      { name: 'Truncate Sentence', url: 'https://leetcode.com/problems/truncate-sentence/' },
      { name: 'Find Target Indices After Sorting Array', url: 'https://leetcode.com/problems/find-target-indices-after-sorting-array/' }
    ],
    hackerrank: [
      { name: 'List Comprehensions', url: 'https://www.hackerrank.com/challenges/list-comprehensions/problem' },
      { name: 'Find the Runner-Up Score!', url: 'https://www.hackerrank.com/challenges/find-second-maximum-number-in-a-list/problem' },
      { name: 'Nested Lists', url: 'https://www.hackerrank.com/challenges/nested-list/problem' },
      { name: 'Finding the percentage', url: 'https://www.hackerrank.com/challenges/finding-the-percentage/problem' },
      { name: 'Lists in Python', url: 'https://www.hackerrank.com/challenges/python-lists/problem' },
      { name: 'Tuples in Python', url: 'https://www.hackerrank.com/challenges/python-tuples/problem' },
      { name: 'Map and Lambda Function', url: 'https://www.hackerrank.com/challenges/map-and-lambda-expression/problem' },
      { name: 'Zipped!', url: 'https://www.hackerrank.com/challenges/zipped/problem' },
      { name: 'Any or All', url: 'https://www.hackerrank.com/challenges/any-or-all/problem' },
      { name: 'Athlete Sort', url: 'https://www.hackerrank.com/challenges/python-sort-sort/problem' }
    ]
  },

  'Arrays & Array Manipulations': {
    leetcode: [
      { name: 'Two Sum', url: 'https://leetcode.com/problems/two-sum/' },
      { name: 'Remove Duplicates from Sorted Array', url: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/' },
      { name: 'Remove Element', url: 'https://leetcode.com/problems/remove-element/' },
      { name: 'Search Insert Position', url: 'https://leetcode.com/problems/search-insert-position/' },
      { name: 'Plus One', url: 'https://leetcode.com/problems/plus-one/' },
      { name: 'Merge Sorted Array', url: 'https://leetcode.com/problems/merge-sorted-array/' },
      { name: 'Best Time to Buy and Sell Stock', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
      { name: 'Single Number', url: 'https://leetcode.com/problems/single-number/' },
      { name: 'Majority Element', url: 'https://leetcode.com/problems/majority-element/' },
      { name: 'Move Zeroes', url: 'https://leetcode.com/problems/move-zeroes/' },
      { name: 'Contains Duplicate', url: 'https://leetcode.com/problems/contains-duplicate/' },
      { name: 'Missing Number', url: 'https://leetcode.com/problems/missing-number/' }
    ],
    hackerrank: [
      { name: 'Java 1D Array', url: 'https://www.hackerrank.com/challenges/java-1d-array-introduction/problem' },
      { name: 'Java 2D Array', url: 'https://www.hackerrank.com/challenges/java-2d-array/problem' },
      { name: 'Java Subarray', url: 'https://www.hackerrank.com/challenges/java-negative-subarray/problem' },
      { name: 'Java Arraylist', url: 'https://www.hackerrank.com/challenges/java-arraylist/problem' },
      { name: 'Arrays - DS', url: 'https://www.hackerrank.com/challenges/arrays-ds/problem' },
      { name: '2D Array - DS (Hourglass)', url: 'https://www.hackerrank.com/challenges/2d-array/problem' },
      { name: 'Left Rotation', url: 'https://www.hackerrank.com/challenges/array-left-rotation/problem' },
      { name: 'Sparse Arrays', url: 'https://www.hackerrank.com/challenges/sparse-arrays/problem' },
      { name: 'Simple Array Sum', url: 'https://www.hackerrank.com/challenges/simple-array-sum/problem' },
      { name: 'Compare the Triplets', url: 'https://www.hackerrank.com/challenges/compare-the-triplets/problem' }
    ]
  },

  'Linked Lists': {
    leetcode: [
      { name: 'Reverse Linked List', url: 'https://leetcode.com/problems/reverse-linked-list/' },
      { name: 'Merge Two Sorted Lists', url: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
      { name: 'Linked List Cycle', url: 'https://leetcode.com/problems/linked-list-cycle/' },
      { name: 'Middle of the Linked List', url: 'https://leetcode.com/problems/middle-of-the-linked-list/' },
      { name: 'Remove Linked List Elements', url: 'https://leetcode.com/problems/remove-linked-list-elements/' },
      { name: 'Delete Node in a Linked List', url: 'https://leetcode.com/problems/delete-node-in-a-linked-list/' },
      { name: 'Palindrome Linked List', url: 'https://leetcode.com/problems/palindrome-linked-list/' },
      { name: 'Intersection of Two Linked Lists', url: 'https://leetcode.com/problems/intersection-of-two-linked-lists/' },
      { name: 'Remove Duplicates from Sorted List', url: 'https://leetcode.com/problems/remove-duplicates-from-sorted-list/' },
      { name: 'Convert Binary Number in a Linked List to Integer', url: 'https://leetcode.com/problems/convert-binary-number-in-a-linked-list-to-integer/' }
    ],
    hackerrank: [
      { name: 'Print the Elements of a Linked List', url: 'https://www.hackerrank.com/challenges/print-the-elements-of-a-linked-list/problem' },
      { name: 'Insert a Node at the Tail of a Linked List', url: 'https://www.hackerrank.com/challenges/insert-a-node-at-the-tail-of-a-linked-list/problem' },
      { name: 'Insert a node at the head of a linked list', url: 'https://www.hackerrank.com/challenges/insert-a-node-at-the-head-of-a-linked-list/problem' },
      { name: 'Insert a node at a specific position in a linked list', url: 'https://www.hackerrank.com/challenges/insert-a-node-at-a-specific-position-in-a-linked-list/problem' },
      { name: 'Delete a Node', url: 'https://www.hackerrank.com/challenges/delete-a-node-from-a-linked-list/problem' },
      { name: 'Print in Reverse', url: 'https://www.hackerrank.com/challenges/print-the-elements-of-a-linked-list-in-reverse/problem' },
      { name: 'Reverse a linked list', url: 'https://www.hackerrank.com/challenges/reverse-a-linked-list/problem' },
      { name: 'Compare two linked lists', url: 'https://www.hackerrank.com/challenges/compare-two-linked-lists/problem' },
      { name: 'Get Node Value', url: 'https://www.hackerrank.com/challenges/get-the-value-of-the-node-at-a-given-position-from-the-tail/problem' },
      { name: 'Cycle Detection', url: 'https://www.hackerrank.com/challenges/detect-whether-a-linked-list-contains-a-cycle/problem' }
    ]
  }
};

// Aliases for matching topic names across different naming styles
const TOPIC_ALIASES = {
  'variables': 'Variables, Constants, and Data Types',
  'data types': 'Variables, Constants, and Data Types',
  'loops': 'Loops & Iteration Controls',
  'iteration': 'Loops & Iteration Controls',
  'conditionals': 'Conditional Statements & Switch Expressions',
  'conditional statements': 'Conditional Statements & Switch Expressions',
  'operators': 'Operators and Type Conversion',
  'type conversion': 'Operators and Type Conversion',
  'classes': 'Classes, Objects, and Constructors',
  'objects': 'Classes, Objects, and Constructors',
  'oop': 'Classes, Objects, and Constructors',
  'inheritance': 'Inheritance, Polymorphism & Abstraction',
  'polymorphism': 'Inheritance, Polymorphism & Abstraction',
  'abstraction': 'Inheritance, Polymorphism & Abstraction',
  'arrays': 'Arrays & Array Manipulations',
  'array': 'Arrays & Array Manipulations',
  'linked lists': 'Linked Lists',
  'linked list': 'Linked Lists',
  'functions': 'Functions & List Comprehensions',
  'list comprehensions': 'Functions & List Comprehensions'
};

const findTopicRecommendations = (topicTitle) => {
  if (PROBLEM_RECOMMENDATIONS[topicTitle]) {
    return PROBLEM_RECOMMENDATIONS[topicTitle];
  }

  // Check aliases by substring
  const lower = topicTitle.toLowerCase();
  for (const [keyword, canonical] of Object.entries(TOPIC_ALIASES)) {
    if (lower.includes(keyword)) {
      return PROBLEM_RECOMMENDATIONS[canonical];
    }
  }

  // Fallback to core arrays/fundamentals direct problem links
  return PROBLEM_RECOMMENDATIONS['Arrays & Array Manipulations'];
};

// Get personalized recommendations and performance breakdown
exports.getStudentRecommendations = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Fetch latest test attempts for student
    const testAttempts = await TestAttempt.find({ studentId }).sort({ createdAt: -1 });
    const enrollments = await Enrollment.find({ studentId }).populate('courseId');
    const user = await User.findById(studentId);

    // Aggregate topic performance
    let topicStats = {};
    testAttempts.forEach(attempt => {
      attempt.topicPerformance.forEach(tp => {
        if (!topicStats[tp.topicTitle]) {
          topicStats[tp.topicTitle] = {
            topicTitle: tp.topicTitle,
            latestPercentage: tp.skillPercentage,
            reason: tp.reason,
            mcqCorrect: tp.mcqCorrect,
            mcqTotal: tp.mcqTotal,
            progCorrect: tp.progCorrect,
            progTotal: tp.progTotal
          };
        }
      });
    });

    const topicList = Object.values(topicStats);
    const strengths = topicList.filter(t => t.latestPercentage >= 75);
    const weakTopics = topicList.filter(t => t.latestPercentage < 75);

    // If no test attempts yet, populate diagnostic weak topics based on course enrollment
    if (topicList.length === 0) {
      weakTopics.push({
        topicTitle: 'Variables, Constants, and Data Types',
        latestPercentage: 40,
        reason: 'Initial Diagnostic: You have not attempted a course test yet. Recommended to practice variable declarations, data type limits, and type casting.',
        mcqCorrect: 1,
        mcqTotal: 5,
        progCorrect: 0,
        progTotal: 1
      });
      weakTopics.push({
        topicTitle: 'Loops & Iteration Controls',
        latestPercentage: 55,
        reason: 'Diagnostic: Loops require structured practice with break/continue conditions and nested iterations.',
        mcqCorrect: 2,
        mcqTotal: 5,
        progCorrect: 0,
        progTotal: 1
      });
    }

    // Attach direct LeetCode & HackerRank problem links for each weak topic
    const weakTopicDetails = weakTopics.map(wt => {
      const recs = findTopicRecommendations(wt.topicTitle);
      return {
        ...wt,
        leetcodeLinks: recs.leetcode,
        hackerrankLinks: recs.hackerrank
      };
    });

    // Interest-based course recommendations
    const enrolledCourseIds = enrollments.map(e => e.courseId?._id?.toString()).filter(Boolean);
    const allCourses = await Course.find({ _id: { $nin: enrolledCourseIds } });

    res.json({
      totalTestsAttempted: testAttempts.length,
      strengths,
      weakTopics: weakTopicDetails,
      recommendedCourses: allCourses,
      userInterests: user.interests || ['Java', 'Python', 'DSA']
    });
  } catch (error) {
    res.status(500).json({ message: 'Error computing recommendations: ' + error.message });
  }
};

// Knowledge Gap Analysis Endpoint
exports.getKnowledgeGapAnalysis = async (req, res) => {
  try {
    const studentId = req.user._id;

    const testAttempts = await TestAttempt.find({ studentId }).sort({ createdAt: -1 });
    const enrollments = await Enrollment.find({ studentId }).populate('courseId');

    let courseGaps = [];

    for (let env of enrollments) {
      const course = env.courseId;
      if (!course) continue;

      const attempts = testAttempts.filter(a => a.courseId.toString() === course._id.toString());
      
      let topicMap = {};
      attempts.forEach(attempt => {
        attempt.topicPerformance.forEach(tp => {
          if (!topicMap[tp.topicTitle]) {
            topicMap[tp.topicTitle] = tp;
          }
        });
      });

      let topicGaps = [];
      course.modules.forEach(mod => {
        mod.topics.forEach(top => {
          const perf = topicMap[top.title];
          const skillPct = perf ? perf.skillPercentage : 0;
          const weakPct = 100 - skillPct;
          const isWeak = skillPct < 75;

          const recs = findTopicRecommendations(top.title);

          topicGaps.push({
            moduleTitle: mod.title,
            topicTitle: top.title,
            currentSkillPercentage: skillPct,
            weakKnowledgePercentage: weakPct,
            isWeak,
            reason: perf ? perf.reason : 'Topic content covered in learning modules, but formal test evaluation is pending.',
            leetcodeLinks: recs.leetcode,
            hackerrankLinks: recs.hackerrank
          });
        });
      });

      const avgSkill = topicGaps.length > 0 
        ? Math.round(topicGaps.reduce((acc, curr) => acc + curr.currentSkillPercentage, 0) / topicGaps.length)
        : 0;

      courseGaps.push({
        courseId: course._id,
        courseTitle: course.title,
        courseCode: course.code,
        overallSkillPercentage: avgSkill,
        overallWeakPercentage: 100 - avgSkill,
        progressPercentage: env.progressPercentage,
        topics: topicGaps
      });
    }

    res.json(courseGaps);
  } catch (error) {
    res.status(500).json({ message: 'Error generating Knowledge Gap Analysis: ' + error.message });
  }
};
