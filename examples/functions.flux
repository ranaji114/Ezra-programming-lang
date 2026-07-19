give add(a, b)
  -> a + b

give greet(name)
  say "Hello {name.upper()}"
  return "done"

result is add(2, 3)
say "2 + 3 = {result}"

status is greet("rana")
say status

count is 0
repeat 3 times
  count += 1
  say "count {count}"
