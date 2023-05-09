---
title: 'Elegant Multi-Line Shell Strings'
description: 'Ergonomic Multi-Line Strings for bash, zsh, and Other Shells'
published: '2022-03-17'
lastUpdated: '2022-03-17'
tags: ['shells']
---

## The State of Multi-Line Strings

Multi-line strings in shells are a pain.

Suppose you want to create a file, using a shell script, which contains the following content

```ts
export default class Greeter {
  greet(name: string) { return 'Hello, ' + name + '!'; }
}
```

How can this be achieved?

### Some Methods

#### Method 1: a multi-line variable

This simple solution works when the variable definition is not indented at all

```sh
var="export default class Greeter {
  greet(name: string) { return 'Hello, ' + name + '!'; }
}"
```

```
$ echo $var
export default class Greeter {
  greet(name: string) { return 'Hello, ' + name + '!'; }
}
```

But what if we're defining `$var` within a function, and we want it indented along with the rest of the function body?

```sh
function my_function() {
  var="export default class Greeter {
    greet(name: string) { return 'Hello, ' + name + '!'; }
  }"
  echo $var
}
```

```sh
$ my_function
export default class Greeter {
    greet(name: string) { return 'Hello, ' + name + '!'; }
  }
```

Oh, well, that's obviously not what we want.

So, simple variable assignment: it works in a very limited subset of cases, when the variable definition is not indented at all. Let's try another method.

#### Method 2: a single-line variable with '`\n`'s for line breaks

In this method, we replace all of the line breaks in the multiline string with `\n` line break characters:

```sh
function my_function() {
  var="export default class Greeter {\n  greet(name: string) { return 'Hello, ' + name + '!'; }\n}"
  echo $var
}
```

```sh
$ my_function
export default class Greeter {
  greet(name: string) { return 'Hello, ' + name + '!'; }
}
```

The result looks good, but the method is messy. What if we want to reformat this like

```ts
export default class Greeter {
  greet(name: string) {
    return 'Hello, ' + name + '!';
  }
}
```

That would involve adding more `\n` characters, and spaces to match the indentation. It's not extremely straightforward:

```sh
function my_function() {
  var="export default class Greeter {\n  greet(name: string) {\n    return 'Hello, ' + name + '!';\n  }\n}"
  echo $var
}
```

So, explicit line break characters: this works if the text you want formatted won't change often, and if the readability of the implementation doesn't matter. If you want the text-generating code itself to be readable or maintainable, this is not a great solution.

So what else can we do?

#### Method 3: Heredocs

Multiline strings are what [Heredocs](https://en.wikipedia.org/wiki/Here_document) were made for:

> In computing, a here document (here-document, here-text, heredoc, hereis, here-string or here-script) is a file literal or input stream literal: it is a section of a source code file that is treated as if it were a separate file. The term is also used for a form of multiline string literals that use similar syntax, preserving line breaks and other whitespace (including indentation) in the text.

So let's see how well they work for our problem

```sh
function my_function() {
  var=$(cat <<EOF
  export default class Greeter {
    greet(name: string) { return 'Hello, ' + name + '!'; }
  }
  EOF)
  echo $var
}
```

```sh
$ my_function
/Users/andrew/test.sh:8: parse error near `var=$(cat <<EOF'
```

Oh, uh, yeah, obviously the delimiter sequence (`EOF` in this case), cannot be indented, and must appear on a line by itself, so we have to write

```sh
function my_function() {
  var=$(cat <<EOF
  export default class Greeter {
    greet(name: string) { return 'Hello, ' + name + '!'; }
  }
EOF
  )
  echo $var
}
```

...which is fine, but sort of breaks indentation of the rest of the function body. It also doesn't work:

```sh
$ my_function
  export default class Greeter {
    greet(name: string) { return 'Hello, ' + name + '!'; }
  }
```

Just like Method #1, this method adds to the output the whitespace we used to indent the function body, which we don't want.

So how can we preserve _only_ the indentation _we want_ (and maybe get rid of that ugly heredoc delimiter)?

### My Method

Here's how I do it

```sh
function my_function() {
  var="$(sed -e 's/^[ ]*\| //g' -e '1d;$d' <<'--------------------'
    | 
    | export default class Greeter {
    |   greet(name: string) { return `Hello, ${name}!`; }
    | }
    | 
--------------------
    )"
  echo $var
}
```

I use pipe characters `|` to define a "margin", which I then strip out using `sed`. `sed -e 's/^[ ]*\| //g'` will remove any number of space characters (`[ ]*`) at the beginning of the line (`^`), followed by a pipe (`|`), followed by one space character (`[ ]`).

> This "margin" method was inspired by [Scala's `String#stripMargin` functionality](https://www.oreilly.com/library/view/scala-cookbook/9781449340292/ch01s03.html), which behaves in a very similar way.

The second `sed` expression, `-e '1d;$d'`, removes the first and last line. I add blank lines to provide a bit of visual whitespace around the content I want to write to the variable. If you don't want one or both of these blank lines, remove them with this slight variation on my method

```sh
function my_function() {
  var="$(sed -e 's/^[ ]*\| //g' <<'--------------------'
    | export default class Greeter {
    |   greet(name: string) { return `Hello, ${name}!`; }
    | }
--------------------
    )"
  echo $var
}
```

I don't mind the line of hyphens, either, as the `EOF` replacement, because it sort of acts like the top and bottom margin of the content. But, if you put the heredoc delimiter in quotes, as I have above, you can also include whitespace in it. So you could do something like

```sh
function my_function() {
  var="$(sed -e 's/^[ ]*\| //g' <<'    +'
    | export default class Greeter {
    |   greet(name: string) { return `Hello, ${name}!`; }
    | }
    +
    )"
  echo $var
}
```

Though I personally think this leaves a bit too much whitespace under the content. Also, many syntax highlighting algorithms have trouble with this.

With any of these variations, you can indent the content to whatever level you like

```sh
function my_function_1() {
  var="$(sed -e 's/^[ ]*\| //g' <<'--------------------'
    | export default class Greeter {
    |   greet(name: string) { return `Hello, ${name}!`; }
    | }
--------------------
    )"
  echo $var
}

function my_function_2() {
  var="$(sed -e 's/^[ ]*\| //g' <<'--------------------'
| export default class Greeter {
|   greet(name: string) { return `Hello, ${name}!`; }
| }
--------------------
    )"
  echo $var
}

function my_function_3() {
  var="$(sed -e 's/^[ ]*\| //g' <<'--------------------'
              | export default class Greeter {
              |   greet(name: string) { return `Hello, ${name}!`; }
              | }
--------------------
    )"
  echo $var
}
```

```sh
$ my_function_1; my_function_2; my_function_3
export default class Greeter {
  greet(name: string) { return `Hello, ${name}!`; }
}
export default class Greeter {
  greet(name: string) { return `Hello, ${name}!`; }
}
export default class Greeter {
  greet(name: string) { return `Hello, ${name}!`; }
}
```

The flexibility -- combined with the visual aesthetics -- of this method is why it's recently become my go-to for multi-line strings in the shell.