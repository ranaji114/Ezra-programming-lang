export const CHAPTERS = [
  {
    id: 1,
    title: 'Getting Started',
    subtitle: 'Install Ezra and write your first program',
    icon: '🚀',
    sections: [
      {
        type: 'text',
        content: 'Ezra is a readable, indentation-based scripting language built in Rust. It is designed to be simple, clean, and easy to learn.',
      },
      {
        type: 'text',
        content: 'Every Ezra program is a `.ez` file. You run it with the `ezra run` command.',
      },
      {
        type: 'code',
        label: 'Hello World',
        code: 'say "Hello, World!"',
        output: 'Hello, World!',
      },
      {
        type: 'text',
        content: '`say` prints a value followed by a newline. It is the most basic output statement in Ezra.',
      },
      {
        type: 'code',
        label: 'Multiple outputs',
        code: 'say "Hello"\nsay "from Ezra!"\nsay 42',
        output: 'Hello\nfrom Ezra!\n42',
      },
      {
        type: 'tip',
        content: 'Ezra uses indentation (spaces) to define code blocks. Use 2 spaces per level. Tabs are not supported.',
      },
    ],
  },
  {
    id: 2,
    title: 'Variables',
    subtitle: 'Store and use values',
    icon: '📦',
    sections: [
      {
        type: 'text',
        content: 'In Ezra, you create a variable using the `is` keyword. It works like `=` in other languages.',
      },
      {
        type: 'code',
        label: 'Basic variables',
        code: 'name is "Ankur"\nage is 25\nscore is 9.5\n\nsay name\nsay age\nsay score',
        output: 'Ankur\n25\n9.5',
      },
      {
        type: 'text',
        content: 'Ezra has 6 built-in types: number, text, bool (yes/no), nothing, list, and object.',
      },
      {
        type: 'code',
        label: 'All types',
        code: 'num   is 42\ntxt   is "hello"\nbool  is yes\nnone  is nothing\n\nsay type_of(num)\nsay type_of(txt)\nsay type_of(bool)\nsay type_of(none)',
        output: 'number\ntext\nbool\nnothing',
      },
      {
        type: 'code',
        label: 'let and const',
        code: 'let count is 0\ncount is 10\nsay count\n\nconst PI is 3.14159\nsay PI',
        output: '10\n3.14159',
      },
      {
        type: 'tip',
        content: 'Use `const` for values that should never change. Trying to reassign a const will throw an error.',
      },
    ],
  },
  {
    id: 3,
    title: 'Text & Interpolation',
    subtitle: 'Work with strings',
    icon: '💬',
    sections: [
      {
        type: 'text',
        content: 'Text values use double quotes. You can embed expressions inside `{ }` — this is called interpolation.',
      },
      {
        type: 'code',
        label: 'String interpolation',
        code: 'name is "Ezra"\nversion is "1.0.0"\nsay "Welcome to {name} v{version}!"\nsay "2 + 2 = {2 + 2}"',
        output: 'Welcome to Ezra v1.0.0!\n2 + 2 = 4',
      },
      {
        type: 'code',
        label: 'Text methods',
        code: 'msg is "  Hello, World!  "\nsay msg.upper()\nsay msg.lower()\nsay msg.trim()\nsay msg.contains("World")',
        output: '  HELLO, WORLD!  \n  hello, world!  \nHello, World!\nyes',
      },
      {
        type: 'code',
        label: 'Split and join',
        code: 'words is "apple,banana,mango"\nlist  is words.split(",")\nsay list\njoined is list.join(" | ")\nsay joined',
        output: '[apple, banana, mango]\napple | banana | mango',
      },
      {
        type: 'code',
        label: 'String length and index',
        code: 'word is "Ezra"\nsay word.length\nsay word[0]\nsay word[1]',
        output: '4\nE\nz',
      },
    ],
  },
  {
    id: 4,
    title: 'Numbers & Math',
    subtitle: 'Arithmetic and math functions',
    icon: '🔢',
    sections: [
      {
        type: 'text',
        content: 'All numbers in Ezra are 64-bit floating point. You can use the standard arithmetic operators.',
      },
      {
        type: 'code',
        label: 'Basic arithmetic',
        code: 'say 10 + 3\nsay 10 - 3\nsay 10 * 3\nsay 10 / 3\nsay 10 % 3\nsay 2 ** 8',
        output: '13\n7\n30\n3.3333333333333335\n1\n256',
      },
      {
        type: 'code',
        label: 'Math functions',
        code: 'say abs(-5)\nsay sqrt(16)\nsay floor(3.7)\nsay ceil(3.2)\nsay round(3.5)\nsay max(10, 5)\nsay min(10, 5)',
        output: '5\n4\n3\n4\n4\n10\n5',
      },
      {
        type: 'code',
        label: 'Compound assignment',
        code: 'x is 10\nx += 5\nsay x\nx *= 2\nsay x\nx -= 3\nsay x',
        output: '15\n30\n27',
      },
      {
        type: 'tip',
        content: 'Division by zero throws a runtime error: `error: divide by zero`.',
      },
    ],
  },
  {
    id: 5,
    title: 'Conditions',
    subtitle: 'Make decisions in your code',
    icon: '🔀',
    sections: [
      {
        type: 'text',
        content: 'Use `check if` to run code only when a condition is true. Add `otherwise` for the else branch.',
      },
      {
        type: 'code',
        label: 'Basic check if',
        code: 'age is 20\ncheck if age >= 18\n  say "Adult"\notherwise\n  say "Minor"',
        output: 'Adult',
      },
      {
        type: 'code',
        label: 'Otherwise if chain',
        code: 'score is 78\ncheck if score >= 90\n  say "Grade A"\notherwise if score >= 75\n  say "Grade B"\notherwise if score >= 60\n  say "Grade C"\notherwise\n  say "Try again"',
        output: 'Grade B',
      },
      {
        type: 'code',
        label: 'Comparison operators',
        code: 'x is 5\nsay x > 3\nsay x < 3\nsay x is 5\nsay x is not 3\nsay x >= 5\nsay x <= 4',
        output: 'yes\nno\nyes\nyes\nyes\nno',
      },
      {
        type: 'code',
        label: 'Logical operators',
        code: 'a is yes\nb is no\nsay a and b\nsay a or b\nsay not a\n\nx is 5\nsay x > 3 and x < 10\nsay x < 3 or x > 4',
        output: 'no\nyes\nno\nyes\nyes',
      },
      {
        type: 'tip',
        content: '`and` and `or` are short-circuit operators — the right side is only evaluated when needed.',
      },
    ],
  },
  {
    id: 6,
    title: 'Loops',
    subtitle: 'Repeat code with loops',
    icon: '🔄',
    sections: [
      {
        type: 'text',
        content: 'Ezra has four types of loops: `repeat`, `for each`, `while`, and `until`.',
      },
      {
        type: 'code',
        label: 'repeat N times',
        code: 'repeat 3 times\n  say "tick"',
        output: 'tick\ntick\ntick',
      },
      {
        type: 'code',
        label: 'for each',
        code: 'names is ["Alice", "Bob", "Carol"]\nfor each name in names\n  say "Hello {name}"',
        output: 'Hello Alice\nHello Bob\nHello Carol',
      },
      {
        type: 'code',
        label: 'while loop',
        code: 'i is 1\nwhile i <= 5\n  say i\n  i += 1',
        output: '1\n2\n3\n4\n5',
      },
      {
        type: 'code',
        label: 'break and next',
        code: 'for each n in [1, 2, 3, 4, 5]\n  check if n is 3\n    break\n  say n\n\nsay "---"\nfor each n in [1, 2, 3, 4, 5]\n  check if n % 2 is 0\n    next\n  say n',
        output: '1\n2\n---\n1\n3\n5',
      },
      {
        type: 'code',
        label: 'range() loop',
        code: 'for each i in range(5)\n  say i\n\nfor each i in range(2, 8)\n  say i',
        output: '0\n1\n2\n3\n4\n2\n3\n4\n5\n6\n7',
      },
    ],
  },
  {
    id: 7,
    title: 'Functions',
    subtitle: 'Reusable blocks of code',
    icon: '⚙️',
    sections: [
      {
        type: 'text',
        content: 'Define functions with `give`. Return values with `return` or the arrow shorthand `->`.',
      },
      {
        type: 'code',
        label: 'Basic function',
        code: 'give add(a, b)\n  -> a + b\n\nsay add(3, 4)\nsay add(10, 20)',
        output: '7\n30',
      },
      {
        type: 'code',
        label: 'Multi-line function',
        code: 'give greet(name, lang)\n  check if lang is "hindi"\n    return "Namaste {name}!"\n  return "Hello {name}!"\n\nsay greet("Ankur", "hindi")\nsay greet("World", "english")',
        output: 'Namaste Ankur!\nHello World!',
      },
      {
        type: 'code',
        label: 'Recursive function',
        code: 'give factorial(n)\n  check if n <= 1\n    -> 1\n  -> n * factorial(n - 1)\n\nsay factorial(5)\nsay factorial(10)',
        output: '120\n3628800',
      },
      {
        type: 'code',
        label: 'Arrow functions (lambdas)',
        code: 'double is n -> n * 2\nsay double(5)\n\nadd is (a, b) -> a + b\nsay add(3, 7)',
        output: '10\n10',
      },
      {
        type: 'tip',
        content: 'A function that reaches the end without returning produces `nothing`.',
      },
    ],
  },
  {
    id: 8,
    title: 'Lists',
    subtitle: 'Collections of values',
    icon: '📋',
    sections: [
      {
        type: 'text',
        content: 'Lists are ordered collections. Create them with square brackets. Index starts at 0.',
      },
      {
        type: 'code',
        label: 'Creating and indexing',
        code: 'nums is [10, 20, 30, 40]\nsay nums[0]\nsay nums[2]\nsay nums.length',
        output: '10\n30\n4',
      },
      {
        type: 'code',
        label: 'List methods',
        code: 'nums is [3, 1, 4, 1, 5]\nsay nums.sort()\nsay nums.reverse()\nsay nums.sum()\nsay nums.avg()',
        output: '[1, 1, 3, 4, 5]\n[5, 4, 1, 1, 3]\n14\n2.8',
      },
      {
        type: 'code',
        label: 'filter, map, reduce',
        code: 'nums is [1, 2, 3, 4, 5]\nevens   is nums.filter(n -> n % 2 is 0)\ndoubled is nums.map(n -> n * 2)\ntotal   is nums.reduce((a, n) -> a + n, 0)\nsay evens\nsay doubled\nsay total',
        output: '[2, 4]\n[2, 4, 6, 8, 10]\n15',
      },
      {
        type: 'code',
        label: 'push, take, drop',
        code: 'items is [1, 2, 3]\nitems is items.push(4)\nsay items\nsay items.take(2)\nsay items.drop(2)',
        output: '[1, 2, 3, 4]\n[1, 2]\n[3, 4]',
      },
    ],
  },
  {
    id: 9,
    title: 'Objects',
    subtitle: 'Key-value data structures',
    icon: '🗂️',
    sections: [
      {
        type: 'text',
        content: 'Objects store named values (key-value pairs). Access fields with dot notation.',
      },
      {
        type: 'code',
        label: 'Creating objects',
        code: 'user is { name: "Ankur", age: 25, city: "India" }\nsay user.name\nsay user.age\nsay user["city"]',
        output: 'Ankur\n25\nIndia',
      },
      {
        type: 'code',
        label: 'Object methods',
        code: 'person is { name: "Rana", score: 95 }\nsay person.keys()\nsay person.values()\nsay person.has("score")',
        output: '[name, score]\n[Rana, 95]\nyes',
      },
      {
        type: 'code',
        label: 'List of objects',
        code: 'users is [\n  { name: "Alice", age: 25 },\n  { name: "Bob",   age: 17 }\n]\nfor each u in users\n  check if u.age >= 18\n    say "{u.name} is adult"\n  otherwise\n    say "{u.name} is minor"',
        output: 'Alice is adult\nBob is minor',
      },
    ],
  },
  {
    id: 10,
    title: 'Error Handling',
    subtitle: 'Handle errors gracefully',
    icon: '🛡️',
    sections: [
      {
        type: 'text',
        content: 'Use `try`/`catch`/`finally` to handle runtime errors. Use `throw` to raise your own errors.',
      },
      {
        type: 'code',
        label: 'try/catch/finally',
        code: 'try\n  x is 10 / 0\ncatch err\n  say "Caught: {err}"\nfinally\n  say "Always runs"',
        output: 'Caught: divide by zero\nAlways runs',
      },
      {
        type: 'code',
        label: 'throw custom error',
        code: 'give check_age(age)\n  check if age < 0\n    throw "Age cannot be negative"\n  -> age\n\ntry\n  check_age(-5)\ncatch err\n  say "Error: {err}"',
        output: 'Error: Age cannot be negative',
      },
      {
        type: 'code',
        label: 'assert',
        code: 'x is 42\nassert x > 0, "x must be positive"\nsay "Assertion passed!"\n\ntry\n  assert x > 100, "x must be > 100"\ncatch err\n  say err',
        output: 'Assertion passed!\nx must be > 100',
      },
      {
        type: 'tip',
        content: 'Common errors: `divide by zero`, `undefined variable`, `list index out of bounds`, `wrong number of arguments`.',
      },
    ],
  },
  {
    id: 11,
    title: 'Pattern Matching',
    subtitle: 'Match values with pick/when',
    icon: '🎯',
    sections: [
      {
        type: 'text',
        content: '`pick` matches a value against multiple `when` clauses. It is cleaner than long if/else chains.',
      },
      {
        type: 'code',
        label: 'Basic pick/when',
        code: 'day is "monday"\npick day\n  when "monday"\n    say "Start of the week"\n  when "friday"\n    say "Almost weekend!"\n  when "saturday"\n    say "Weekend!"\n  otherwise\n    say "Regular day"',
        output: 'Start of the week',
      },
      {
        type: 'code',
        label: 'Pick with numbers',
        code: 'score is 3\npick score\n  when 1\n    say "Beginner"\n  when 2\n    say "Intermediate"\n  when 3\n    say "Advanced"\n  otherwise\n    say "Unknown level"',
        output: 'Advanced',
      },
    ],
  },
  {
    id: 12,
    title: 'Modules',
    subtitle: 'Organize and reuse code',
    icon: '📦',
    sections: [
      {
        type: 'text',
        content: 'Import standard library modules with `use`. Import specific names with `from ... use`.',
      },
      {
        type: 'code',
        label: 'Math module',
        code: 'use "std/math" as math\nsay math.pi\nsay math.sqrt(16)\nsay math.sin(0)',
        output: '3.141592653589793\n4\n0',
      },
      {
        type: 'code',
        label: 'from ... use',
        code: 'from "std/math" use sqrt, pi\nsay pi\nsay sqrt(25)',
        output: '3.141592653589793\n5',
      },
      {
        type: 'code',
        label: 'JSON module',
        code: 'data is { name: "Ezra", version: 1 }\njson is stringify_json(data)\nsay json\nparsed is parse_json(json)\nsay parsed.name',
        output: '{"name":"Ezra","version":1}\nEzra',
      },
    ],
  },
  {
    id: 13,
    title: 'File I/O',
    subtitle: 'Read and write files',
    icon: '📁',
    sections: [
      {
        type: 'text',
        content: 'Ezra has built-in functions for file operations. Note: file I/O is only available in the native binary, not the browser playground.',
      },
      {
        type: 'code',
        label: 'Write and read a file',
        code: 'write_file("hello.txt", "Hello from Ezra!")\ncontent is read_file("hello.txt")\nsay content\nsay file_exists("hello.txt")',
        output: 'Hello from Ezra!\nyes',
      },
      {
        type: 'code',
        label: 'Append and delete',
        code: 'write_file("log.txt", "Line 1\n")\nappend_file("log.txt", "Line 2\n")\ncontent is read_file("log.txt")\nsay content\nfile_delete("log.txt")',
        output: 'Line 1\nLine 2\n',
      },
      {
        type: 'code',
        label: 'List directory',
        code: 'files is list_dir(".")\nfor each f in files\n  say f',
        output: '(lists files in current directory)',
      },
    ],
  },
  {
    id: 14,
    title: 'Complete Example',
    subtitle: 'Put it all together',
    icon: '🏆',
    sections: [
      {
        type: 'text',
        content: 'Here is a complete Ezra program that uses multiple features together.',
      },
      {
        type: 'code',
        label: 'Grade Calculator',
        code: 'give get_grade(score)\n  check if score >= 90\n    -> "A"\n  otherwise if score >= 75\n    -> "B"\n  otherwise if score >= 60\n    -> "C"\n  otherwise\n    -> "F"\n\nscores is [92, 78, 55, 88, 65]\n\nfor each s in scores\n  grade is get_grade(s)\n  say "Score {s} → Grade {grade}"\n\npassing is scores.filter(s -> s >= 60)\nsay "Passing: {len(passing)} / {len(scores)}"',
        output: 'Score 92 → Grade A\nScore 78 → Grade B\nScore 55 → Grade F\nScore 88 → Grade B\nScore 65 → Grade C\nPassing: 4 / 5',
      },
      {
        type: 'code',
        label: 'Fibonacci',
        code: 'give fib(n)\n  check if n <= 1\n    -> n\n  -> fib(n-1) + fib(n-2)\n\nfor each i in range(10)\n  say "fib({i}) = {fib(i)}"',
        output: 'fib(0) = 0\nfib(1) = 1\nfib(2) = 1\nfib(3) = 2\nfib(4) = 3\nfib(5) = 5\nfib(6) = 8\nfib(7) = 13\nfib(8) = 21\nfib(9) = 34',
      },
    ],
  },
];
