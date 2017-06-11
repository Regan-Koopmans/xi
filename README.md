# Xi

Xi is a toy/experimental functional language that compiles currently to JavaScript. I am working on 
allowing translation to other languages like Python. The language is inspired by 
pure-functional languages like Haskell, and shares many of the idioms from that language.

## Features

The compiler is in a **very** early stage, but it can do the following:

- translate basic functions
- call functions (nested arbitrarily)
- // comments!
- warnings for unused variables
- errors for undefined functions

## Syntax

```
// This is a "variable". A function that takes no parameters, and always returns 25.

a := @-> 25

// Here is a more interesting function:

b := @b -> b + 1

// We can now call b with a:

b(a())

// Which returns 26
```


## Wait, why not use lambdas?

Lambda expressions are already supported in JavaScript (where they are known as "arrow functions"). My compiler does not make use of this feature, because it is my hope that the lambda expressions
in Xi will eventually be more powerful than those supported natively in JavaScript (or in other languages like Python).

## Future Work / Current Goals

In the near future I would like to complete the JavaScript implementation. After that, I would like to create translation functions for Python, and perhaps other simple dynamic languages.

Much later, I would like to compile to native (probably the LLVM platform.)