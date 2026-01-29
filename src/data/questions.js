
export const questions = [
    {
        id: 1,
        title: "Two Sum",
        description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
        
Input format: First line contains numbers separated by space. Second line contains the target.
Output: Space separated indices (smaller index first).`,
        testCases: [
            // Public Case 1
            { input: "2 7 11 15\n9", output: "0 1", hidden: false },
            // Public Case 2
            { input: "3 2 4\n6", output: "1 2", hidden: false },
            // Hidden Case
            { input: "3 3\n6", output: "0 1", hidden: true }
        ],
        starterCode: {
            python: `def two_sum(nums, target):\n    # Write your logic here\n    # Example: return [0, 1]\n    pass`,
            javascript: `function twoSum(nums, target) {\n    // Write your logic here\n    // Example: return [0, 1];\n}`,
            c: `#include <stdio.h>\n#include <stdlib.h>\n\nvoid twoSum(int* nums, int numsSize, int target) {\n    // Write your logic here\n    // Print result e.g. printf("0 1");\n}`,
            java: `import java.util.*;\n\nclass Main {\n    public static void twoSum(int[] nums, int target) {\n        // Write logic\n        // System.out.println("0 1");\n    }\n}`
        }
    },
    {
        id: 2,
        title: "Palindrome Number",
        description: `Determine whether an integer is a palindrome. An integer is a palindrome when it reads the same backward as forward.
        
Input: An integer
Output: true or false (Return boolean in Python/JS)`,
        testCases: [
            { input: "121", output: "true", hidden: false },
            { input: "-121", output: "false", hidden: false },
            { input: "12321", output: "true", hidden: true }
        ],
        starterCode: {
            python: `def is_palindrome(x):\n    # Write your logic here\n    return False`,
            javascript: `function isPalindrome(x) {\n    // Write your logic here\n    return false;\n}`,
            c: `#include <stdio.h>\n#include <stdbool.h>\n\nvoid isPalindrome(int x) {\n    // Logic\n    printf("true");\n}`,
            java: `class Main {\n    public static void isPalindrome(int x) {\n        System.out.println("true");\n    }\n}`
        }
    },
    {
        id: 3,
        title: "Factorial Calculation",
        description: `Calculate the factorial of a non-negative integer n.
        
Input: An integer n
Output: The factorial of n`,
        testCases: [
            { input: "5", output: "120", hidden: false },
            { input: "0", output: "1", hidden: false },
            { input: "6", output: "720", hidden: true }
        ],
        starterCode: {
            python: `def factorial(n):\n    # Write your logic here\n    return 0`,
            javascript: `function factorial(n) {\n    // Write your logic here\n    return 0;\n}`,
            c: `#include <stdio.h>\n\nvoid factorial(int n) {\n    printf("%d", n);\n}`,
            java: `class Main {\n    public static void factorial(int n) {\n        System.out.println(n);\n    }\n}`
        }
    },
    {
        id: 4,
        title: "Odd or Even",
        description: `Given an integer n, determine if it is odd or even.
        
Input: An integer
Output: "Odd" or "Even" (String)`,
        testCases: [
            { input: "2", output: "Even", hidden: false },
            { input: "7", output: "Odd", hidden: false },
            { input: "100", output: "Even", hidden: true }
        ],
        starterCode: {
            python: `def check_odd_even(n):\n    # Write your logic here\n    return "Even"`,
            javascript: `function checkOddEven(n) {\n    // Write your logic here\n    return "Even";\n}`,
            c: `#include <stdio.h>\n\nvoid checkOddEven(int n) {\n    printf("Even");\n}`,
            java: `class Main {\n    public static void checkOddEven(int n) {\n        System.out.println("Even");\n    }\n}`
        }
    }
];
