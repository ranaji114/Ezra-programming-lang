say "Flux Calculator"
say "Choose an operation: +, -, *, /"

first is input_number "First number: "
operation is input "Operation: "
second is input_number "Second number: "

check if operation is "+"
  result is first + second
  say "Result: {first} + {second} = {result}"
otherwise if operation is "-"
  result is first - second
  say "Result: {first} - {second} = {result}"
otherwise if operation is "*"
  result is first * second
  say "Result: {first} * {second} = {result}"
otherwise if operation is "/"
  check if second is 0
    say "Cannot divide by zero."
  otherwise
    result is first / second
    say "Result: {first} / {second} = {result}"
otherwise
  say "Unknown operation: {operation}"
  say "Please use +, -, *, or /."
