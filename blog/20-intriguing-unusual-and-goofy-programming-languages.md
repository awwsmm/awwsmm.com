---
title: '20 Intriguing, Unusual, and Goofy Programming Languages'
description: 'A collection of esoteric and thought-provoking programming languages.'
published: '2019-11-16'
lastUpdated: '2019-11-16'
tags: ['esolangs', 'language-design']
---

> Originally posted on [Dev.To](https://dev.to/awwsmm/20-intriguing-unusual-and-goofy-programming-languages-238f)

> _"Beware the Jabberwock, my son!
The jaws that bite, the claws that catch!
Beware the Jubjub bird, and shun
The frumious Bandersnatch!"_
> 
> -- [Lewis Carroll](http://www.jabberwocky.com/carroll/jabber/jabberwocky.html)

---

Despite how it can feel sometimes, programming languages are usually designed to make our lives easier. Expressing complex relationships between classes, bounds-checking data, and interacting with the user is much easier in Java than it is in [CPU opcodes](https://en.wikipedia.org/wiki/Opcode), for instance (and only slightly less verbose).

But some language designers have other goals in mind. A programming language might be designed for easy vectorisation of data, or easy multithreading, or performance. And some are designed so that the only keyword is `chicken`. [Different strokes.](https://www.youtube.com/watch?v=Qw9oX-kZ_9k)

Below is my curated list of 20 interesting, beautiful, and disorienting programming languages. Most of these are considered ["esoteric"](https://en.wikipedia.org/wiki/Esoteric_programming_language) though some of them are actually used by serious programmers on a regular basis. See if you can tell which are which.

---

<a name="toc"></a>
## Table of Contents

1.  [brainfuck](#brainfuck)
2.  [chicken](#chicken)
3.  [legit](#legit)
4.  [Malbolge](#malbolge)
5.  [APL](#apl)
6.  [(D♭, D♭♭, and) Velato](#velato)
7.  [Piet](#piet)
8.  [Whitespace](#whitespace)
9.  [INTERCAL](#intercal)
10. [Unary Except Every Zero Is Replaced with the Title of This Programming Language or, Alternately, Is Replaced with the Smallest Counter-Example to the Goldbach Conjecture. Compilers and Interpreters Only Have to Implement the Former Option](#unary)
11. [Seed (and Befunge)](#seed)
12. [LISP](#lisp)
13. [Funciton](#funciton)
14. [///](#slashes)
15. [Factory](#factory)
16. [golfing languages](#golf)
17. [languages with 2-dimensional source code](#2d)
18. [languages which emphasise source code aesthetics](#aesthetics)
19. [languages built so that the source code looks like ___](#imitation)
20. [Q#](#qsharp)

---

<a name="brainfuck"></a>
## \#1. [brainfuck](https://esolangs.org/wiki/Brainfuck)

> [online interpreter](https://copy.sh/brainfuck/)

> *__Related:__ [Unibrain](https://esolangs.org/wiki/Unibrain)*

Brainfuck (sometimes styled brainf\_\_\_, brainf***, or just BF) is the poster child for esoteric programming languages (__esolangs__). A program which prints "hello world" in BF looks like:

```bf
+[-[<<[+[--->]-[<<<]]]>>>-]>-.---.>..>.<<<<-.<+.>>>>>.>.<<.<-.
```

Brainfuck is a __tape-based__ language. You can imagine a program in a tape-based language as an extremely long, one-dimensional array of (initially) zeros. There is a pointer, which is initially at one end of the tape and can be moved forward or backward, one memory cell at a time. The values in cells can be incremented or decremented (restricting them to integer values), and there are brackets which allow for loops.

There are eight commands in the BF language specification. The cell to which the pointer is currently pointing is referred to as the "current cell":

```
>  move the pointer one cell to the right
<  move the pointer one cell to the left
+  increment the value in the current cell
-  decrement the value in the current cell
.  output the character represented by the value in this cell
,  input a character and store it in the cell at the pointer
[  jump past the next ] if the cell under the pointer is zero
]  jump back to the most recent [ if the cell under the pointer is nonzero
```

That's it! Any other character which appears in a brainfuck program is assumed to be a comment and is ignored. Brainfuck is [Turing complete](https://en.wikipedia.org/wiki/Turing_completeness) and so, theoretically, it can perform any computational task that any other programming language can, though it might take a bit more time to program it in BF.

Brainfuck has inspired countless imitator languages, including:

 - [__( ͡° ͜ʖ ͡°)fuck__](https://esolangs.org/wiki/(_%CD%A1%C2%B0_%CD%9C%CA%96_%CD%A1%C2%B0)fuck) -- similar to brainfuck, but the commands are all replaced by [Lenny faces](https://en.wikipedia.org/wiki/List_of_emoticons#Lenny_Face)
 - __[Bodyfuck](https://vimeo.com/7133810)__ -- a gestural interpreter for brainfuck
 - __[I hate your bf-derivative really I do](https://esolangs.org/wiki/I_hate_your_bf-derivative_really_I_do)__ -- a language with the same character set as BF, but where all of the characters have different meanings; designed to frustrate BF enthusiasts
 - __[JSFuck](https://esolangs.org/wiki/JSFuck)__ -- an "esoteric subset" of JavaScript, which only uses the characters `+`, `!`, `(`, `)`, `[`, `]`, creating a BF-like syntax in which a "Hello, World!" program requires more than 10,000 source code characters
 - __[TreeHugger](https://esolangs.org/wiki/Treehugger)__ -- a derivative of BF which uses an infinite binary tree data structure, rather than an infinite tape
 - __[POGAACK](https://esolangs.org/wiki/POGAACK)__ -- a BF / Chicken crossover

[[ back to Table of Contents ]](#toc)

<a name="chicken"></a>
## \#2. [chicken](https://esolangs.org/wiki/Chicken)

Chicken is probably the best known __single-keyword__ language, even though, technically, there are eleven instructions in the stack-based Chicken language, which correspond to eleven _opcodes_, numbered 0 through 10.

> Chicken was inspired by [a paper](https://isotropic.org/papers/chicken.pdf) written by Doug Zongker to poke fun at [unintelligible academic presentations](https://www.wired.com/2007/05/post-1/).

The opcode number gives the number of times (given by `#` in the below table) that the `chicken` keyword must appear (separated by spaces) in order to represent that specific instruction:

|  #  | command |
|:--- |:--- |
| 0   | stop execution |
| 1   | push the string "chicken" onto the stack |
| 2   | add the top two values from the stack |
| 3   | subtract the top two values from the stack |
| 4   | multiply the top two values from the stack |
| 5   | compare the top two values from the stack for equality, push a "truthy" or "falsy" result onto the stack |
| 6   | double wide instruction. Next instruction indicates source to load from. 0 loads from stack, 1 loads from user input. Top of stack points to address/index to load onto stack. |
| 7   | top of stack points to address/index to store to. The value below that will be popped and stored. |
| 8   | the top of stack is a relative offset to jump to. The value below that is the condition. Jump only happens if condition is truthy. |
| 9   | interprets the top value on the stack as ASCII and pushes the corresponding character |
| 10+n| pushes the literal number `n-10` onto the stack. |

When the program stops, whatever happens to be on the stack is printed to the screen (this is common in languages designed for [code golfing](https://en.wikipedia.org/wiki/Code_golf)). This means that a [self-replicating _quine_ program](https://en.wikipedia.org/wiki/Quine_(computing)) is quite easy to create in the language:

```
chicken
```

As the keyword `chicken` appears once in the first line, the string "chicken" is pushed onto the stack. The end of the program is then reached and the stack (which contains only the word "chicken") is printed to the screen. The program has reproduced its own source code exactly. This is quite difficult to do in most languages, though Mame (given name Yusuke Endoh) has created [this absolutely bonkers _quine relay_](https://github.com/mame/quine-relay), which cycles through 100 different programming languages, each outputting the source code of the next one. (Seriously, [go check out some of their projects on GitHub](https://github.com/mame), they're nuts.)

[[ back to Table of Contents ]](#toc)

<a name="legit"></a>
## \#3. [legit](https://morr.cc/legit/)

> _**Related:** [Dirst](https://esolangs.org/wiki/Dirst)_

Legit (pronounced with a hard "g") is a Turing-complete programming language where programs "are defined entirely by the graph of commits in a [Git](https://www.git-scm.com/) repository." The content of the repository itself is completely ignored.

Legit instructions are encoded in the commit messages in a Git repo. Execution proceeds normally from a commit to its parent (moving _down_ the output of a `git log --graph --oneline` command). If a commit has multiple parents, they form a stack of commands, indexed from 0 (the eldest commit), the top of the stack is popped and value must be a number corresponding to the proper parent index. Program flow can be controlled, though, with `goto`-like commands that can jump to particular commits.

A ["Hello World!" program in legit](https://github.com/blinry/legit-hello) looks like:

```
$ git log --graph --oneline
*   b63fd70 (HEAD -> master, origin/master, origin/HEAD) Merge pull request #1 from rohieb/master
|\  
| *   1f44c51 0
| |\  
| |/  
|/|   
* | b9e1e95 "Hello world\n"
| * fbb02fe "Hello world!\n"
|/  
*   8013037 (tag: reverse-loop) dup
|\  
| * 6883822 write 1 left [reverse-loop]
*   e0a4d04 (tag: print-loop) 1 right read dup
|\  
| * d646ef4 put [print-loop]
* 25a3a62 quit
```

Notice that there are two lines which say "Hello World", and the second one has a "!" added at the end. The creator of the language made this program, then merged a PR for that change. Since legit programs are themselves Git repositories, there's _no such thing as version control_ with a legit program, at least version control with Git itself. This means programs can end up looking messy as changes are made.

The language creator, Sebastian Morr, has discussed how difficult it can be to write legit programs:

> _"I’ll be honest with you: I got tired of writing Git commands by hand to create legit programs. One consequence of the execution going top-down is that you have to write your programs backwards, and each time I’d make a typo, I’d have to start all over, because the commits above that would be invalidated. So… I started to write shell scripts, which would then generate my legit programs."_

In spite of this, he's managed to write [a brainfuck interpreter in legit](https://github.com/blinry/legit-brainfuck), indirectly showing that legit is Turing complete. Morr's challenge to users of his language? _Write a legit quine:_

> _"Write a legit program that prints the Git commands required to create itself! Good luck."_

[[ back to Table of Contents ]](#toc)

<a name="malbolge"></a>
## \#4. [Malbolge](https://en.wikipedia.org/wiki/Malbolge)

> [online interpreter](http://www.malbolge.doleczek.pl/)

Named after [the eighth circle of Hell](http://www.fullbooks.com/Dante-s-Inferno8.html) from Dante's _Inferno_, Malbolge is a language specifically designed to be nearly impossible to use. Malbolge programs use base-3 arithmetic (so there are _tritwise_ operations instead of _bitwise_ ones), alter and encrypt their own source code, and are actively sabotaged by bug-features in the implementation and specification.

The creator of Malbolge, Ben Olmstead, says that [if he could make the language more difficult to code in, he would](https://esoteric.codes/blog/interview-with-ben-olmstead):

> _"I know there is a mismatch between the documented and implemented tables.  I have noticed that some people decide that the bug is in the specification, and others decide the bug is in the implementation; it certainly makes Malbolge harder to use, and fragments the user community (such as it is)."_
>
> _"If I were to make a Malbolge 2000, I would definitely make [the documentation](http://www.lscheffer.com/malbolge.shtml) subtly wrong."_

Malbolge is so difficult to write in, that even Olmstead has never written a program in it, beyond "a program that printed 'H' and exited". The first "Hello, World!" for Malbolge wasn't _written_, it was [_discovered_ eight years after the language was released](http://acooke.org/malbolge.html) by a [beam search](https://en.wikipedia.org/wiki/Beam_search) algorithm, exploring the space of all possible Malbolge programs until one was found to produce the correct output.

Here's a sample "Hello World!" program in Malbolge:

```
(=<`#9]~6ZY32Vx/4Rs+0No-&Jk)"Fh}|Bcy?`=*z]Kw%oG4UUS0/@-ejc(:'8dc
```

Ryan Kusnery, collector of weird languages, has declared that "the day that someone writes, in Malbolge, a program that simply copies its input to its output, is the day my hair spontaneously turns green. It's the day that elephants are purple and camels fly, and a cow can fit through a needle's eye."

Despite Kusnery's certainty about the impossibility of such a program, professional esoteric programmer Matthias Lutter has managed to write [a Malbolge quine](https://lutter.cc/malbolge/quine.html), which, though coming in at 800+ lines, does manage to exactly output its source code ([try it out here](http://www.malbolge.doleczek.pl/) if you've got about an hour to waste).

[[ back to Table of Contents ]](#toc)

<a name="apl"></a>
## \#5. [APL](https://en.wikipedia.org/wiki/APL_(programming_language))

I think A Programming Language (APL) is one of the most impressive esoteric languages (if you can call it that) I've ever encountered, mainly because it existed decades before most other languages on this list.

> The only other major languages around at the time of APL were  [COBOL](https://en.wikipedia.org/wiki/COBOL#Scope_termination), [LISP](https://en.wikipedia.org/wiki/Lisp_(programming_language)#Examples), [FORTRAN](https://en.wikipedia.org/wiki/Fortran#Simple_FORTRAN_II_program), and [ALGOL](https://en.wikipedia.org/wiki/ALGOL#Code_sample_comparisons), the spiritual precursor to the C family of languages.

APL was [created by Kenneth Iverson in the early 1960s](https://en.wikipedia.org/wiki/APL_(programming_language)) with a primary goal of providing easy, concise manipulation of arrays, matrices, and higher-dimensional data structures. Matrix manipulation is common in mathematics, physics, and computation-heavy sciences. Providing an easy way to create and manipulate these data structures should make these scientists' lives easier. Theoretically.

Manipulation of multi-dimensional arrays is of course still critical to these fields, so modern languages like [MATLAB, Wolfram Language, and R](https://en.wikipedia.org/wiki/APL_(programming_language)#Derivative_languages) have drawn much inspiration from APL. The biggest difference between these more modern languages and APL is APL's character set.

In an ALGOL-like (C-like) language, you might define an array of numbers like:

```C
int array[] = { 1, 2, 3, 4, 5, 6 };
```

In APL, this looks like

```
array ← ⍳6
```

The leftwards-pointing arrow `←` is used for assignment, and the iota character `⍳` is used to create an array of integers from `1` to `N`, where `N` is the number which follows the `⍳` character.

APL introduces a wide variety of uncommon characters which perform different functions. This has the effect of keeping the code itself very compact, often at the cost of readability (for the programmer accustomed to languages like ALGOL, FORTRAN, COBOL, or LISP). The following C code:

```C
int arr[] = { 4, 5, 6, 7 };
int len = sizeof(arr)/sizeof(arr[0]);
int sum = 0;

for (int ii = 0; ii < len; ++ii)
  sum += arr[ii];
```

...can be compressed dramatically with APL:

```
sum ← +/(3+⍳4)
```

APL uses _vectorised_ operations to add `3` to every element of the array created by `⍳4`. `⍳4` creates the array `[1, 2, 3, 4]`, and `3+⍳4` adds `3` to each element of that array, to get `[4, 5, 6, 7]`. Then, the "sum over" operator `+/` sums the elements of that array `4 + 5 + 6 + 7` to get `22`, which is then assigned to `sum` via the leftward-pointing arrow.

I hope this explanation has given you just a small taste of what APL is capable of. Some modern languages like R make heavy use of vectorised operations, which can make manipulation of data very easy and concise, but it does take some getting used to.

Masters of APL can write incredibly complex programs using only a few dozen characters (though many of these are APL-specific characters). [For your enjoyment / confusion](https://en.wikipedia.org/wiki/APL_(programming_language)#Game_of_Life), here is the entirety of [John Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life), written in [Dyalog APL](https://en.wikipedia.org/wiki/APL_(programming_language)#Dyalog_APL), a modern dialect of the language:

```
life ← {↑1 ⍵∨.∧3 4=+/,¯1 0 1∘.⊖¯1 0 1∘.⌽⊂⍵}
```

If anyone can explain that to me in the comments, step-by-step, I would be extremely impressed.

[[ back to Table of Contents ]](#toc)

<a name="velato"></a>
## \#6. (D♭, D♭♭, and) Velato

> _**Related:** [Choon](https://web.archive.org/web/20160131122814/http://www.stephensykes.com/choon/choon.html), [Musical Notes](https://esolangs.org/wiki/Musical_notes)_


[__D♭__](https://esolangs.org/wiki/D%E2%99%AD) (pronounced "dee flat", like the musical note) and [D♭♭](https://esolangs.org/wiki/D%E2%99%AD%E2%99%AD) ("dee double flat") are [joke languages](https://esolangs.org/wiki/Joke_language_list), never actually implemented as far as I can tell. Which is unfortunate, because D♭ was supposed to offer "_minor_ but _key_ improvement[s]" to the C# language, including:

- `LowerClass`, `MiddleClass` and `UpperClass` objects, which are distinguished according to the properties they can have and their permitted interactions with the other `Class`es. `UpperClass` entities can become `friends` via the `Lobby`, for instance:

    ```
    UpperClass BigShotRepublican
    {
      Investments portfolio;
      Yacht coasts[6];
      Lobby<Politicians> inPocket;
    }
    ```

- More "visually intuitive" exception handling, with the addition of new keywords `throwUp`, `upChuck`, `puke`, `ralph`, and `hurl`. As the language documentation notes:

    > These convey different levels of exception severity and can be used by your application to determine the size of the `bucket` needed to catch the exception... Sometimes the `bucket` can overflow, so you'll need to stack `bucket`s so they catch the overflow.

- New _generics_, including `Hash`, `Pot`, `Coke`, and `Crystal`. According to the documentation, "[a]ll the generics are handled in the `StreetCorner.Pharmacy` namespace" and can "accelerate the performance of your application" and "enhance your end-user experience", but should be used in moderation.

While D♭ would have offered these (and more) improvements on the C# language, __D♭♭__ would have provided similar benefits (presumably) over the C language.

[__Velato__](http://velato.net/) is another musical language, though it differs from D♭ and D♭♭ in that it's actually been implemented. Velato source code is written in [MIDI](https://en.wikipedia.org/wiki/MIDI) files -- the pitch and ordering of notes determines the action of the program.

The first note of the program is the "root note", which can be changed by playing the note a major second interval from the root note. Other intervals and grouping of notes determine other operations; for example, the modulus operator `%` is encoded by playing the fifth, then the fifth again, then the sixth of the root note.

A sample "Hello, World!" program in Velato might look like:

!["Hello, World!" in Velato](https://thepracticaldev.s3.amazonaws.com/i/vfh67pcfht42wc12v270.gif)

> [Listen here!](https://www.youtube.com/watch?v=Fhni-6Q5z80)

Though the ordering of concurrent ("stacked") notes does affect the operation of the program, so sheet music alone can't fully describe a Velato program.

[[ back to Table of Contents ]](#toc)

<a name="piet"></a>
## \#7. [Piet](https://esolangs.org/wiki/Piet)

> _**Related:** [Skastic](https://esolangs.org/wiki/Skastic)_

Another _artistic_ esoteric language is Piet, named after the Dutch painter [Piet Mondrian](https://en.wikipedia.org/wiki/Piet_Mondrian), famous for his abstract art, composed of simple geometric shapes:

![Piet Mondrian's 1930 work of art, "Composition II in Red, Blue, and_Yellow"](https://thepracticaldev.s3.amazonaws.com/i/vj6tzyratvcqhllembfr.jpg)

[Piet programs are "written"](http://www.dangermouse.net/esoteric/piet.html) as pixels in bitmap files, in 3 different shades of 6 different hues, plus white and black, for a total of 20 different colors. The "colorful" colors (all but white and black) are [arranged in a torus](http://homepages.vub.ac.be/~diddesen/piet/index.html), where moving from the base hue to its "dark" hue to its "light" hue and back to the base hue is all considered movement in the same (positive) direction. Similarly, movement from red -> yellow -> green -> cyan -> blue -> magenta -> red -> ... is cyclical and directed (positive), as well.

When the program starts, Piet "reads" the colors of the pixels in the bitmap, starting in the top-left corner of the image. Execution proceeds from the left to the right until a "wall" of black pixels is encountered, at which point, the direction of program execution changes and pixels are read from top-to bottom (always changing direction by rotating by 90 degrees clockwise). The edges of the canvas are considered "black pixels", as well.

The transitions between colored areas encode the action of the program. For instance, if we "rotate" the hue by one unit (e.g. from red -> yellow) as we move along the image, that encodes an "add" action. If we also change the "lightness" by one unit (e.g. from red -> dark yellow), that encodes a "subtract" action. Movement into or out of a white area encodes no action, and is the only way to change the color without performing an action (this is useful for loops).

Because the program only depends on transitions between colors, and not the colors themselves, or the direction of movement across the "canvas", programs can be very simple or very "artistic". For example, [here's a program which gets a number from the user, squares it, then prints the square](http://homepages.vub.ac.be/~diddesen/piet/index.html):

![A simple program in Piet](https://thepracticaldev.s3.amazonaws.com/i/i77oznhfqnyu147wxesz.png)

...and here's that same program, [_zhuzhed_](https://www.merriam-webster.com/words-at-play/zhuzh-zhoosh-queer-eye-origin-kressley) up a bit:

![That same program, made to look a bit nicer](https://thepracticaldev.s3.amazonaws.com/i/1clwo2qss6zurm2kisdw.png)

One of the nicest Piet programs I've seen is [this one, which prints "Piet"](https://en.wikipedia.org/wiki/Esoteric_programming_language#Piet):

![A very nice-looking program in Piet](https://thepracticaldev.s3.amazonaws.com/i/4auzkqsxjc8aclmgi171.gif)

Now we just need someone to combine Piet and Velato and create a language where programs are encoded within multimedia files.

[[ back to Table of Contents ]](#toc)

<a name="whitespace"></a>
## \#8. [Whitespace](https://en.wikipedia.org/wiki/Whitespace_(programming_language))

> _**Related:** [Anguish](http://blogs.perl.org/users/zoffix_znet/2016/05/anguish-invisible-programming-language-and-invisible-data-theft.html)_

The importance of whitespace characters (spaces, line breaks, tabs, etc.) in a programming language exists on a spectrum. Some languages don't care very much, [some care quite a lot](https://en.wikipedia.org/wiki/Off-side_rule) (see: Python), and at least one language _only_ cares about whitespace characters. That language is called -- creatively enough -- Whitespace.

All visible characters (digits, letters, punctuation, etc.) are ignored by Whitespace. In fact, most whitespace characters are actually ignored by Whitespace, too. The [space (ASCII 32), tab (ASCII 9) and line feed (ASCII 10) characters](https://hackage.haskell.org/package/whitespace-0.4/src/docs/tutorial.html) are the only characters which carry any meaning in a Whitespace program.

A "Hello, world!" program in Whitespace looks like this ("dots" `.` added to the end of each line so "trailing whitespace" is not removed in this browser):

```
   	  	   .
	.
     		  	 	.
	.
     		 		  .
	.
     		 		  .
	.
     		 				.
	.
     	 		  .
	.
     	     .
	.
     	 	 			.
	.
     		 				.
	.
     			  	 .
	.
     		 		  .
	.
     		  	  .
	.
     	    	.
	.
  .


```

(You can click and drag to highlight the spaces and tabs in the code above. Or try it out in [this web REPL](https://vii5ard.github.io/whitespace/).)

Whitespace code is written one command at a time, where a particular sequence of tabs, spaces, and line feeds indicates a certain category of commands -- I/O, stack manipulation, arithmetic. Once the category is selected, the particular command in that category is selected with another sequence of tabs, spaces, and line feeds. All numbers are binary encoded (space = 0, tab = 1) and all characters are indicated by their ASCII indices (again, binary encoded, so tab-space-space-space-space-tab-tab is `1000011` or `67` or `C`).

All sorts of programs have been written in Whitespace, including [quines](https://github.com/vii5ard/whitespace/blob/master/example/quine.ws), [Brainfuck interpreters](https://github.com/vii5ard/brainfuck-whitespace), and more. And some Whitespace programs have surely been hidden in the source code for other languages. These _polyglot_ programs could be run as Whitespace code -- where all the visible characters are ignored -- or as code in the "host" language, provided the whitespace needed for the hidden Whitespace program is not significant.

Just in case you needed another thing to worry about.

[[ back to Table of Contents ]](#toc)

<a name="intercal"></a>
## \#9. [INTERCAL](https://en.wikipedia.org/wiki/INTERCAL)

INTERCAL, short for _Compiler Language With No Pronounceable Acronym_, is arguably the first-ever esoteric language.

> _"...created as a parody by Don Woods and James M. Lyon, two Princeton University students, in 1972...[INTERCAL] satirizes aspects of the various programming languages at the time, as well as the proliferation of proposed language constructs and notations in the 1960s."_ [[ source ]](https://en.wikipedia.org/wiki/INTERCAL)

INTERCAL is designed to be confusing and difficult to work with. Common symbols are pointlessly renamed (`'` is a "spark", `"` is "rabbit ears", `:` is a "twospot", ...), numbers can only be given as input by spelling out the digits one at a time (`TWO FIVE SIX` is the number `256`), and an undocumented "feature" means that programs can be rejected by the compiler for not being polite (not using the keyword `PLEASE` enough) -- or for being overly polite (using `PLEASE` too much).

[Wikipedia offers this _amazing_ quote](https://en.wikipedia.org/wiki/INTERCAL#Details) from the INTERCAL reference manual

> It is a well-known and oft-demonstrated fact that a person whose work is incomprehensible is held in high esteem. For example, if one were to state that the simplest way to store a value of 65536 in a 32-bit INTERCAL variable is:

```
DO :1 <- #0¢#256
```

> any sensible programmer would say that that was absurd. Since this is indeed the simplest method, the programmer would be made to look foolish in front of his boss, who would of course happen to turn up, as bosses are wont to do. The effect would be no less devastating for the programmer having been correct.

INTERCAL is a very forgiving language, though. Anything the INTERCAL compiler -- `ick` -- can't understand is simply ignored. This means that all INTERCAL programs are by definition bug-free! Which is good, because the original INTERCAL was written for the [EBCDIC](https://en.wikipedia.org/wiki/EBCDIC) character set, but latter versions moved to ASCII. As a result, different dialects of INTERCAL have totally different instruction sets.

And for the fifteen people on the planet who want to get INTERCAL working with .NET, you're in luck -- [someone's had enough free time to make that a reality](https://github.com/jawhitti/INTERCAL).

[[ back to Table of Contents ]](#toc)

<a name="unary"></a>
## \#10. [Unary Except Every Zero Is Replaced with the Title of This Programming Language or, Alternately, Is Replaced with the Smallest Counter-Example to the Goldbach Conjecture. Compilers and Interpreters Only Have to Implement the Former Option](https://esolangs.org/wiki/Unary_Except_Every_Zero_Is_Replaced_with_the_Title_of_This_Programming_Language_or,_Alternately,_Is_Replaced_with_the_Smallest_Counter-Example_to_the_Goldbach_Conjecture._Compilers_and_Interpreters_Only_Have_to_Implement_the_Former_Option)

In the section on [brainfuck](#brainfuck), above, we saw just a tiny sample of the _hundreds_ of BF-derivative languages that exist. While there are some interesting derivative languages, I tried my best not to include any of them, since this article would quickly devolve into nonsense.

However, there's one _special bit of nonsense_ that I'd like to share with you from the brainfuck world. It's a little language called _Unary Except Every Zero Is Replaced with the Title of This Programming Language or, Alternately, Is Replaced with the Smallest Counter-Example to the Goldbach Conjecture. Compilers and Interpreters Only Have to Implement the Former Option_. (For the rest of this entry, I will refer to the aforementioned language as "this language".)

This language is what it sounds like, it's a derivative of the [_Unary_ programming language](https://esolangs.org/wiki/Unary). Unary has the same commands as BF, but they're encoded in a [_unary numeral system_](https://en.wikipedia.org/wiki/Unary_numeral_system) -- that is, a system which only has a single symbol. In this case, that symbol is `0`.

> Unary systems aren't as unusual as they may sound, and you've almost certainly encountered one before. If you've ever had to track a hand-raised vote or keep track of wins and losses in a series of games, you may have used [_tallies_](https://en.wikipedia.org/wiki/Tally_marks). In this system, a single straight line represents `1`, two single straight lines represent `2`, and so on. Tally marks are a unary numeral system.

In Unary, brainfuck commands are encoded in binary using the following table:

| brainfuck command | binary index |
|:-:|:-:|
| > |	000 | 
| < |	001 |
| + |	010 |
| - |	011 |
| . |	100 |
| , |	101 |
| [ |	110 |
| ] |	111 |

To write a Unary program, one starts by writing a brainfuck program. As an example, here's a very simple BF program that simply adds the number `2` to the number `3` and prints the result to the terminal:

```
++>+++[<+>-]++++++++[<++++++>-]<.
```

([Try it out here!](https://copy.sh/brainfuck/))

In Unary, we first convert all of these BF symbols to their binary equivalents:

```
010010000010010010110001010000011111010010010010010010010010110001010010010010010010000011111001100
```

...then, we prepend a `1` to this very large binary number:

```
1010010000010010010110001010000011111010010010010010010010010110001010010010010010010000011111001100
```

...and finally, we convert this number to unary. [Wolfram|Alpha](https://www.wolframalpha.com/input/?t=crmtb01&f=ob&i=1010010000010010010110001010000011111010010010010010010010010110001010010010010010010000011111001100%20in%20decimal) tells me that this number is equivalent to

```
812,443,533,011,490,965,255,226,984,396
```

...in decimal ("about 812 octillion"), so a unary representation of this number would simply be that many `0`s, back-to-back.

What makes _this language_ different from the Unary language is that this language then replaces each of those `0` characters with either:

 - the title of _this_ programming language, or, alternatively
 - the smallest counter-example to [the Goldbach Conjecture](https://en.wikipedia.org/wiki/Goldbach%27s_conjecture)

The Goldbach Conjecture (aka. "Goldbach's Conjecture") states that

> ...every even integer greater than 2 can be expressed as the sum of two primes. [[ source ]](https://en.wikipedia.org/wiki/Goldbach%27s_conjecture)

Presumably, we would replace each `0` with that smallest integer, which (as of this writing), is bounded on the low end by at least [4 * 10^18](https://en.wikipedia.org/wiki/Goldbach%27s_conjecture#Verified_results). However, since Goldbach's Conjecture hasn't yet actually been disproven, we can't replace `0` with anything except the name of this programming language. Luckily, "compilers and interpreters only have to implement the former option".

Even so, the above `2+3` program in this language would be quite long, as the name of this programming language is 238 characters. Encoding that single small program in this language would require about [a billion trillion terabytes](https://www.wolframalpha.com/input/?t=crmtb01&f=ob&i=812%2C443%2C533%2C011%2C490%2C965%2C255%2C226%2C984%2C396+*+238+bytes+in+TB) of disk space. This language is a strong contender for the most resource-inefficient language in the universe.

[[ back to Table of Contents ]](#toc)

<a name="seed"></a>
## \#11. [Seed (and Befunge)](https://esolangs.org/wiki/Seed)

Seed is related to an earlier esolang named [Befunge](https://en.wikipedia.org/wiki/Befunge), in which programs are written on a 2-dimensional grid. In Befunge, the user defines "arrow" instructions to move pointers around the program. For example, a Befunge "Hello, World!" could be written like:

```
>              v
v  ,,,,,"Hello"<
>48*,          v
v,,,,,,"World!"<
>25*,@
```

You can see the `>` `v`, and `<` characters, which literally point in the direction that the code should be interpreted / compiled. (There's also a `^` character which is not used here.)

Befunge was designed specifically to be difficult to compile. Because it can be executed in any one of four directions (left-to-right, right-to-left, top-to-bottom, or bottom-to-top), and because it provides facilities for self-modifying code, it can be extremely difficult for a compiler to reason about Befunge source code.

Seed takes this relatively nice (but definitely unusual) language and makes it completely ridiculous. A Seed program is only ever composed of two numbers: a length, and a random seed. The random seed is fed to a [Mersenne Twister](https://en.wikipedia.org/wiki/Mersenne_Twister) algorithm, which is used to generate a random string of the specified length. Seed will then attempt to run that random string as a Befunge program. That's it.

Seed is an extremely easy language to program in -- all it requires is two numbers -- but, because of its inherent randomness, it requires huge amounts of resources. Programming in Seed usually means generating lots of random programs of a specified length and checking the program output against the desired output. As there are [96 valid characters in a Befunge program](https://esolangs.org/wiki/Seed) (ASCII 32 through 126, plus line feed), there are `96^n` possible Befunge programs containing `n` characters. Testing all valid programs of length 5 therefore requires generating and running over 8 billion unique Befunge programs.

In spite of this, some enthusiasts have somehow managed to write Seed programs which actually do useful (?) things. For example, this program:

```
1 186
```

...does nothing and exits, while this program:

```
4 80814037
```

...prints the character `'h'`. Because the number of possible programs increases exponentially as the length of the program increases, a "Hello World" program is incredibly difficult, yet esolang enthusiast [Krzysztof Szewczyk](https://github.com/KrzysztofSzewczyk) has still managed to find a solution with a random seed of only 4151 digits. Like I said, easy to program in!

[[ back to Table of Contents ]](#toc)

<a name="lisp"></a>
## \#12. [LISP](https://en.wikipedia.org/wiki/Lisp_(programming_language))

The more I learn about LISP, the more I like it. First released in 1958, [LISP is one of the oldest high-level languages](https://web.archive.org/web/20010727170154/http://mitpress.mit.edu/sicp/full-text/book/book-Z-H-5.html) still in common use today (only a year younger than FORTRAN, which is still popular in the scientific community). LISP stands for LISt Processor and essentially that's what it does -- it processes lists.

Everything in LISP is either an _atom_ or a _list_. Lists can contain atoms, as well as other lists. Atoms are "indivisible" and are things like numbers, strings, and so on. For example, the following list:

```lisp
(1 "hey" (+ 7 x))
```

...contains three elements: the atom `1`, the atom `"hey"`, and the list `(+ 7 x)`, which contains three elements of its own.

Note that there are no type declarations in LISP. The reason for this is twofold. First, LISP uses a kind of dynamic typing and can check whether an atom is a string or a number, and can provide compile-time warnings if a programmer tries to code some odd operation like dividing a number by a string. Second, LISP is such an old language that [type theory hadn't really yet evolved as a field of study](https://www.quora.com/Why-is-Lisp-dynamically-typed) at the time the language was created. So "list" and "atom" are the only two types.

[Here's a simple LISP program](https://www.tutorialspoint.com/lisp/lisp_input_output.htm) (in the "Common LISP" dialect) which asks a user for a radius, and then gives the area of a circle with that radius:

```lisp
(defun AreaOfCircle()
  (terpri)
  (princ "Enter Radius: ")
  (setq radius (read))
  (setq area (* 3.1416 radius radius))
  (princ "Area: ")
  (write area)
)
(AreaOfCircle)
```

([Try it out here!](https://rextester.com/IDHEMA40743))

Notice how every statement in the above program is a list, including I/O and execution of various functions. LISP has the ability to manipulate lists, as well:

```lisp
(append '(1 2 3) '() '(a) '(5 6))
```

> Here, [`'x` is syntactic sugar for `(quote x...)`](https://stackoverflow.com/a/1539175/2925434), which simply returns the elements `x...` without evaluating them (which is the default behaviour).

The above list manipulates several other lists by appending them to one another, in order. The result of the above code snippet is the list:

```lisp
(1 2 3 a 5 6)
```

> Note how the atom `a` hasn't been evaluated and replaced with a number or string.

Because LISP provides methods to operate on lists, and because every LISP program is itself composed of nothing more than lists, LISP programs define data structures within the LISP language! This means that [macros](https://stackoverflow.com/a/4621882/2925434) -- code which manipulates and runs other bits of code -- are common among LISP developers. LISP syntax defines program input, output, and the source code of the program itself. [This concept, called _homoiconicity_](https://dev.to/awwsmm/concept-of-the-day-homoiconicity-4did), is part of what makes LISP a bit foreign to users of ALGOL-like (C-like) languages.

If you want to learn a cool, new (to you, at least) language in 2020, may I suggest LISP?

[[ back to Table of Contents ]](#toc)

<a name="funciton"></a>
## \#13. [Funciton](https://esolangs.org/wiki/Funciton)

Funciton is a programming language whose name looks like someone misspelled "function" and which I always pronounce as "funky town" in my head when I read it.

Funciton is a flowchart-like, two-dimensional language. A factorial function in Funciton might look like:

```
                   ╓───╖
                   ║ ! ║
                   ╙─┬─╜   ┌───╖  ╔═══╗
               ┌─────┴─────┤ > ╟──╢ 2 ║
               │           ╘═╤═╝  ╚═══╝
 ╔════╗  ┌───╖ │             │
 ║ −1 ╟──┤ + ╟─┴─┐           │
 ╚════╝  ╘═╤═╝   │           │
         ┌─┴─╖   │    ╔═══╗  │
         │ ! ║   │    ║ 1 ║  │
         ╘═╤═╝   │    ╚═╤═╝  │
           │   ┌─┴─╖  ┌─┴─╖  │
           │   │ × ╟──┤ ? ╟──┘
           │   ╘═╤═╝  ╘═╤═╝
           └─────┘      │
```

Every _element_ of a Funciton program is written inside of a rectangle (or "box") made of ASCII lines and double-lines. The lines between boxes carry data around the program. As Funciton programs are rotation-invariant, there are five possible kinds of boxes:

1. double-lined on all sides: literal value OR input OR comment
2. double-lined on three sides: lambda expression
3. double-lined on two adjacent sides: function call
4. double-lined on two opposite sides: function declaration
5. double-lined on a single side: invoke a lambda function
6. double-lined on no sides: `NOT` operator (see below)

If a box has no connectors, then no data can be passed to it or read from it, so that box becomes a comment:

```
  ╔═════════════════════════════════════╗
  ║  Won't you take me to... Funciton?  ║
  ╚═════════════════════════════════════╝
```

A box with a single line emanating from it is either a literal or is requesting input from STDIN:

```
  ╔═════════════════════════════════╗  ╔══════╗
  ║  this is the literal number 42  ║  ║  42  ╟────
  ╚═════════════════════════════════╝  ╚══════╝
  ╔════════════════════════════════╗   ╔══════╗
  ║  this box requests user input  ║   ║      ╟────
  ╚════════════════════════════════╝   ╚══════╝
```

"Rotation-invariant" means that the above `42` can be written as

```
                                        │
╔══════╗        ╔══════╗  ╔══════╗  ╔═══╧══╗
║  42  ╟───  ───╢  42  ║  ║  42  ║  ║  42  ║
╚══════╝        ╚══════╝  ╚═══╤══╝  ╚══════╝
                              │
```

...and it means the same thing (a literal number `42`) in each case. Data "flows" out of boxes like this and into the "lines" connecting boxes, and "loose ends" indicate that data should be written to STDOUT. So each of the four boxes above writes `42`, converted to the character `*`, to STDOUT. (Although technically, these must be four separate programs, because an individual Funciton program can only have a single output.)

The lines (or "wires") aren't passive in Funciton, and T-junctions define splitters, when the input comes in as the perpendicular line of the T-junction...

```
╔══════╗   │   ╔════════════════════════════════════════════╗
║  42  ╟───┤   ║  Each output line carries the value `42`.  ║
╚══════╝   │   ╚════════════════════════════════════════════╝
```

...as well as `NAND` gates, when the output is the perpendicular line:

```
╔══════╗     ╔══════╗  ╔═══════════════════════════════════╗
║  42  ╟──┬──╢  25  ║  ║  Output is (42 NAND 25) or `55`.  ║
╚══════╝  │  ╚══════╝  ╚═══════════════════════════════════╝
```

Using just the splitter and the `NAND` gate, we can define `NOT`, `AND`, `OR`, and `XOR`, which allow us to then define any additional conceivable functions:

```
                                                  ┌──────────────────────┐
╓─────╖        ╓─────╖            ╓────╖          │  ╓─────╖             │
║ not ║     ┌──╢ and ╟──┐      ┌──╢ or ╟──┐       ├──╢ xor ╟─────┐       │
╙──┬──╜     │  ╙─────╜  │     ┌┴┐ ╙────╜ ┌┴┐      │  ╙─────╜ ┌┐  │    ┌┐ │
   │        └─────┬─────┘     └┬┘        └┬┘      └───┬──────┤├──┴──┬─┤├─┘
  ┌┴┐            ┌┴┐           └────┬─────┘           │      └┘     │ └┘
  └┬┘            └┬┘                │                 └────┬────────┘
   │              │                                        │
```

If Funcitown sounds interesting to you, I suggest you check out [its esolangs wiki page](https://esolangs.org/wiki/Funciton), or, just [marvel at this implementation of "99 bottles of beer"](https://esolangs.org/wiki/Funciton/99_bottles_of_beer_on_the_wall), written in Funciton.

[[ back to Table of Contents ]](#toc)

<a name="slashes"></a>
## \#14. [///](https://esolangs.org/wiki////)

> _**Related:** [Thue](https://esolangs.org/wiki/Thue)_

/// (pronounced "slashes") is a language where all computation is performed via [ed](https://en.wikipedia.org/wiki/Ed_(text_editor))-style string substitution. The only "syntax" the language has is a single construct, formed using the forward slash `/` character, which is used to define string replacements of the form:

```bash
/pattern/replacement/initial
```

The `initial` string is searched for the `pattern`, which is removed and replaced with the `replacement`. This search-and-replace procedure is then repeated, again, from the beginning of the new (modified) string. If the `pattern` cannot be found in the string, then the `initial` (or newly-modified) string is printed to the console and the program terminates.

For example:

```bash
/NAME/Karl Hungus/Hello, NAME!
```

The above /// program will search the string `Hello, NAME!` for the substring `NAME`, which, when found, it will replace with the string `Karl Hungus`:

```bash
/NAME/Karl Hungus/Hello, Karl Hungus!
```

After a single iteration, the substring `NAME` can no longer be found in the modified string, so the program terminates, printing `Hello, Karl Hungus!` to the terminal.

There is only a single other special character in /// and that's the backslash `\` character, which can be used to escape the `/` character as well as itself. Any program which contains no `/` or `\` characters is trivially a quine, printing its source code to the console.

A more difficult quine in /// is one which *only* contains the `\` and `/` characters ([leaning toothpick syndrome](https://en.wikipedia.org/wiki/Leaning_toothpick_syndrome) to the extreme):

```
/\/\/\/\\\\/\\\\\\\/\\\\\\\/\\\\\\\/\\\\\\\\\\\\\\\\\\\\\\//\/\/\/\\\/\/\\////\\////\\\///\\////\\\///\\////\\\///\\////\\\///\\\///\\\///\\\///\\////\\\///\\\///\\\///\\\///\\\///\\\///\\\///\\////\\\///\\\///\\\///\\\///\\\///\\\///\\\///\\////\\\///\\\///\\\///\\\///\\\///\\\///\\\///\\////\\\///\\\///\\\///\\\///\\\///\\\///\\\///\\\///\\\///\\\///\\\///\\\///\\\///\\\///\\\///\\\///\\\///\\\///\\\///\\\///\\\///\\\///\\////\\////\\\///\\////\\\///\\////\\\///\\////\\\///\\\///\\\///\\////\\\///\\////\\\///\\\///\\////\\////\\////\\////\\\///\\////\\\///\\////\\////\\\///\\////\\////\\\///\\////\\\///\\////\\\///\\////\\\///\\\///\\\///\\////\\\///\\\///\\\///\\////\\\///\\\///\\////\\////\\////\\////\\\///\\////\\////\\\///\\////\\////\\\///\\////\\\///\\////\\\///\\////\\\///\\\///\\\///\\\///\\////\\\///\\\///\\////\\////\\\///\\\///\\\///\\////\\\///\\\///\\\///\\////\\\///\\\///\\\///\\////\\\///\\\///\\\///\\\///\\\///\\\///\\\///\\////\\\///\\\///\\\///\\\///\\\///\\\///\\\///\\////\\\///\\\///\\\///\\////\\\///\\\///\\\///\\\///\\////\\////\\////\\////\\\///\\////\\////\\\///\\////\\////\\\///\\////\\\///\\////\\\///\\////\\\///\\\///\\\///\\\///\\////\\\///\\\///\\\///\\////\\\///\\\///\\\///\\////\\\///\\\///\\\///\\////\\\///\\\///\\\///\\\///\\\///\\\///\\\///\\\///\\\///\\\///\\////\\////\\////\\////\\\///\\////\\\///\\////\\\//\/\/\/\\\/\\\/\\////\//\//\/\/\/\\\\/\\//\\\/\\\/\\\/\\\\\\\/\\\\\\\/\\\/\\\\////\//\//\/\/\/\\\\/\\\/\\\/\\\/\\\\\\\\\\////\/\/\
```

/// was indirectly shown to be Turing-Complete by [Ørjan Johansen](https://esolangs.org/wiki/%C3%98rjan_Johansen), who used the language to create an interpreter for a different esolang, [Bitwise Cyclic Tag](https://esolangs.org/wiki/Bitwise_Cyclic_Tag), which is itself Turing-Complete.

[[ back to Table of Contents ]](#toc)

<a name="factory"></a>
## \#15. [Factory](https://esolangs.org/wiki/Factory)

Factory is a really interesting language, where your commands move a "claw" around the "byte factory". You can pick up `1`s and `0`s with the claw, move them into storage spaces, and create "shipments" of bits that are grouped into 8-bit bytes and "delivered" to the standard output as ASCII characters. Factory program files have the `.claw` extension, for obvious reasons.

The byte factory looks like this initially:

```
     |
     |
    / \
    \ /



    [1]    | _____________ | _____________ | _____________ |    X    |   [:=:]  | [    ] | !!!!!!!! | &&& 
production |storage space 1|storage space 2|storage space 3| garbage | shipping | supply | Invertor | and
```

The different rooms have different purposes:

 - `production` creates a constant stream of `1`s at the start of the program, but can be changed to a stream of `0`s if a `0` is "dropped" into the room from the claw (dropping a `1` switches production back to a stream of `1`s)
 - the `storage space`s each hold a stack of bits. Bits dropped from the claw are added to the top of the stack and the claw can pick up the stack at any point, carrying that bit and all bits above it.
 - bits dropped into the `garbage` are destroyed and lost forever
 - `shipping` works like a `storage space`, until the bits are delivered to STDOUT as ASCII characters
 - `supply` receives input characters from the user, which are converted to bits and stored as a stack in reverse order (so the first bit of the first character is at the top of the stack)
 - the `invertor` accepts a single bit which it inverts (`0` becomes `1` and `1` becomes `0`)
 - the `and` room accepts two bits, destroying one of them. If either bit is a `0`, the other bit is destroyed so only a `0` remains

The programmer instructs the claw to move around the factory, picking up and dropping bits and stacks of bits into the various rooms:

 - `<` tells the claw to move left one room (if the claw is in the `production` room already, it will not move)
 - `>` tells the claw to move right one room (if the claw is in the `and` room already, it will not move)
 - `v` tells the claw to drop all of its bits into this room, if it is carrying any, and pick up the top bit in this room otherwise
 - `O` ships the contents of the shipping room
 - `I` asks for an input into the supply room
 - and so on...

Factory is a really neat creation that's half game, half programming language. I would love to see a Factory debugger that actually shows the claw moving around the factory, picking up bits and dropping them off in different locations. It's probably not the most useful programming language, but it's definitely unique.

[[ back to Table of Contents ]](#toc)

<a name="golf"></a>
## \#16. golfing languages

For these next few entries, I'd like to discuss a few broader categories of languages, rather than individual languages themselves. The first category I'll start with is [__golfing languages__](https://esolangs.org/wiki/Golf).

Golfing languages are used in [_code golf_](https://en.wikipedia.org/wiki/Code_golf), a competition where users try to write a program with the smallest source code possible, usually measured in bytes. [Code Golf Stack Exchange](https://codegolf.stackexchange.com/) (CGSE) is a vibrant community of programming language enthusiasts who use mainstream and esoteric languages alike. [APL](#apl) is a common language for code golfing, though many languages were specifically created for golfing, including:

- [GolfScript](https://esolangs.org/wiki/GolfScript) (obviously)
- [J](https://en.wikipedia.org/wiki/J_(programming_language)) and [Jelly](https://github.com/DennisMitchell/jellylanguage)
- [@](https://esolangs.org/wiki/@)
- [Brachylog](https://esolangs.org/wiki/Brachylog)
- [05AB1E](https://github.com/Adriandmen/05AB1E)

...and many more. I've grouped J and Jelly together because the developers behind Jelly say they were influenced primarily by the J programming language, and J was designed by... [Kenneth E. Iverson](https://en.wikipedia.org/wiki/J_(programming_language)), creator of APL. You can find these and many more golfing languages listed on CGSE's [Showcase of Languages](https://codegolf.stackexchange.com/questions/44680/showcase-of-languages) thread.

To give you a taste of what code golfing is like, here's [a challenge to write a program which can detect palindromes](https://codegolf.stackexchange.com/questions/110582/im-a-palindrome-are-you/), that is, strings which are read the same forwards and backwards. It doesn't matter how the program accomplishes this, but it needs to somehow indicate when input passed to it is palindromic or not. For reference, a minimal-ish palindrome-detecting program written in Java might look like:

```java
import java.util.*; 

public class P {
  public static void main (String a[]) {

    String o, r = "";
    Scanner s = new Scanner(System.in);

    o = s.nextLine();  

    for (int i = o.length() - 1; i >= 0; i--)
      r = r + o.charAt(i);

    System.out.println(o.equals(r));
  }
}
```

I've left whitespace in for clarity, but in a real code golf competition, we would compress this to:

```java
import java.util.*;public class P {public static void main(String a[]){String o,r="";Scanner s=new Scanner(System.in);o=s.nextLine();for(int i=o.length()-1;i>=0;i--)r=r+o.charAt(i);System.out.println(o.equals(r));}}
```

...and count the bytes in the solution. Since these are all ASCII characters, the number of bytes is simply the number of characters and __my solution in Java has 216 bytes__. How about some of these golfing languages?

Here's a solution in [Brachylog](https://codegolf.stackexchange.com/a/110584/79936) (3 bytes):

```
I↔I
```

...here's one in [Jelly](https://codegolf.stackexchange.com/a/110583/79936) (5 bytes):

```
ḂŒ
ŒḂ
```

...and 05AB1E (3 bytes):

```
ÂQÂ
```

...J (15 bytes):

```
-:|.NB. .BN.|:-
```

...GolfScript (11 bytes):

```
.-1%=#=%1-.
```

...and Dyalog APL (6 bytes):

```
⌽≡⊢⊢≡⌽
```

My solution suddenly looks much less impressive in comparison. You can see that most of these golfing languages use UNICODE characters extensively in their source code: a single character can encode a hugely complex operation, so using a code golf language usually means simply memorizing what lots and lots of individual characters do. If you're interested in code golfing, I recommend you check out the Code Golf Stack Exchange, or join a local in-person code golfing competition (usually, these are restricted to a single language or a pre-defined set of languages).

[[ back to Table of Contents ]](#toc)

<a name="2d"></a>
## \#17. languages with 2-dimensional source code

As [most](https://www.omniglot.com/writing/direction.htm) natural, written languages are read only in one direction (in English, left-to-right) and "wrap" around the edge of a page, it's intuitive that programming languages should do the same thing. But some language designers have decided to make "better" use of the 2D space in which these languages can be written and displayed, allowing source code to be read left-to-right, top-to-bottom, or diagonally. This wider variety of reading directions has led to creations like:

- [Hexagony](https://esolangs.org/wiki/Hexagony)
- [RunR](https://esolangs.org/wiki/RunR)
- [Re:direction](https://esolangs.org/wiki/Re:direction)
- [Beeswax](https://esolangs.org/wiki/Beeswax)
- [☃](https://esolangs.org/wiki/%E2%98%83)
- [MineFriff](https://esolangs.org/wiki/MineFriff)
- [Half Broken Car in Heavy Traffic](https://esolangs.org/wiki/Half-Broken_Car_in_Heavy_Traffic)
- [Maze](https://esolangs.org/wiki/Maze)

...among others. These languages usually include constructs which change the direction in which the code should be read, much like [Piet](#piet)'s "walls" of black pixels.

__Re:direction__ only uses UNICODE arrows (◄, ▲, ►, ▼) to direct program flow and add those directions to a queue, plus a single instruction for popping directions from the queue (♦), which can allow for looping and control flow. Output from the program can only be integers, but those integers can be interpreted as ASCII characters. For example, here's [a "Hello, World!" program](https://esolangs.org/wiki/Re:direction#Hello_world_program) written in Re:direction, which you can [try out here](https://tio.run/#re-direction)!

In __Hexagony__ and __Beeswax__, code is written on a hexagonal grid of fixed-width characters. A "Hello, World!" program in Hexagony might look like:

```
   H ; e ;
  l ; d ; *
 ; r ; o ; W
l ; ; o ; * 4
 3 3 ; @ . >
  ; 2 3 < \
   4 ; * /
```

...and a program to print the `N`-th Fibonacci number in Beeswax might look like:

```
           ;{#'<>~P~L#MM@>+@'p@{;
 _`n`TN`F(`{`)=`X~P~K#{; d~@M<
```

Beeswax provides additional complexity by allowing the programmer to summon "bees", which act as pointers, moving around the program in various directions and completing tasks independently of one another.

In __Maze__, the program's source code looks like... a maze:

```
               ##,##,##    // fibonacci
            ##,##,^^,##,##
            ##,..,<>,PP,##
            ##,..,##,..,##,##,##,##,##,##,##,##  // left column is fib(n), right column is fib(n+1).
##,##,##,##,##,%D,..,LD,..,**,..,..,..,..,..,##  // the small left loop sets fib(n) to 0; simultaneously,
##,..,..,..,##,>>,##,..,## ##,##,##,##,##,..,##  // the small right loop sets a clone of fib(n+1) to fib(n+1)+f(n).
##,MM,##,..,##,..,##,..,##,##,..,..,..,##,..,##  // (this technique is similar to brainfuck [->+<])
##,..,**,FL,..,02,##,%R,..,##,..,##,PP,##,..,##  // the small loop at the bottom does nothing, but make sure
##,##,##,NL,##,##,##,%D,<>,01,FR,..,..,##,..,##  // that the original fib(n+1) is synchronized with the other cars.
      ##,>>,##,##,##,..,##,##,03,##,##,##,..,##  // then fib(n+1) goes to left column and fib(n+1)+fib(n) to right column
      ##,(),##,..,..,FM,..,..,%R,..,..,..,..,##
      ##,##,##,..,##,..,##,##,##,##,##,##,##,##
            ##,..,..,..,##
            ##,##,##,##,##
PP-> +=1
MM-> -=1
FR-> IF ** THEN %U ELSE %D
FL-> IF ==0 THEN %D ELSE %L
FM-> IF ** THEN %L ELSE %R
LD-> IF ** THEN %L ELSE %D
NL-> ="\n"
```

In this language, "cars" are spawned from the starting position `^^`, of which there can be only one per "map". Commas `,` are used to separate "cells" of the program and every cell is a two-character sequence. Cars cannot move through walls `##`, but instead follow the path `..` and have actions performed on them by functions, which are composed of two capital letters and are defined within the source code but outside of the maze, as seen above (`PP`, `MM`, etc.).

[Oliver Faircliff](https://github.com/olls) has even designed this nice, animated [Maze interpreter in C++](https://github.com/olls/maze-interpreter-v3) which looks more like a low-budget smartphone game than a programming language.

There are a huge variety of two-dimensional (and [higher-dimensional](https://esolangs.org/wiki/Category:Multi-dimensional_languages)) programming languages out there and many are quite a bit more complex than arrows directing the flow of the program. For example, the (as-yet-unimplemented) language __Infinite Dimensional Tengwar Meltdown__ (IDTM) is an esoteric language written in the [Tengwar](https://en.wikipedia.org/wiki/Tengwar) script from Lord of the Rings. It's an infinite-dimensional, pointer-based language where data exists on an array of infinite size and code decays via entropy over time (see also: [Entropy](https://esolangs.org/wiki/Entropy)). So loops, which are run multiple times, will _degrade_ and change their meaning over the course of the program.

Just when you thought esoteric languages couldn't get weirder.

[[ back to Table of Contents ]](#toc)

<a name="aesthetics"></a>
## \#18. languages which emphasise source code aesthetics

When you think of the _aesthetics_ of source code, you probably think about whitespace. The visual structure of a program is largely defined by blocks of code, blank lines, indentation, and more. You might not think about how the _characters_ of the source code can affect its aesthetic properties. For instance, characters with lots of curves can give a "wavy", "bubbly", or "smooth" appearance:

```
s@Ss@S$3CO0oc896$3Cs@S$3CO0oc896O0os@S$3CO0oc896c896
```

...while characters with lots of straight lines can communicate "jaggedness", "sharpness", or "clutter":

```
/\|EL/H>+-_=IT\MN|F#^<ZK/k\vx|/>+V|Xzw/WF#^<ZK/k\vx|/>+-_=\
```

Some language designers _have indeed_ thought about the aesthetic properties of certain characters and have used them to achieve a particular goal with their languages. For instance, the creator of [Grass](http://www.blue.sky.or.jp/grass/) wanted to make a language where the source code looks like an unkempt lawn. All Grass source code is written using only the characters `w`, `W`, and `v`:

```
　　　　_, ._
　　（　・ω・）　んも〜
　　○=｛=｝〇,
　 　|:::::::::＼, ', ´
､､､､し ､､､((（.＠）ｗｖｗｗＷＷｗｖｗｗＷｗｗｖｗｗｗｗＷＷＷｗｗＷｗ
ｗＷＷＷＷＷＷｗｗｗｗＷｗｗｖｗＷＷｗＷｗｗｖｗＷＷＷ

作ってみたｗｗｗｗｗ
とりあえず公開ｗｗｗｗｗｗｗっうぇ
```

Other language designers require their source code to resemble some kind of [ASCII art](https://en.wikipedia.org/wiki/ASCII_art), like [DNA#](https://esolangs.org/wiki/DNA-Sharp) (a play on C#), which has source code that looks like DNA double-helices:

```
    AT
   T--A
  A----T
  T-----A
  T-----A
  G----C
   T--A
    GC
    CG
   C--G
  A----T
  A-----T
  T-----A
  A----T
   A--T
    GC
    AT
   C--G
  T----A
  C-----G
  T-----A
  G----C
   C--G
    CG
...
```

If you're interested in these kinds of languages, there are many descriptions for as-yet-unimplemented programming languages like these over at [esolangs.org](https://esolangs.org/wiki/Main_Page), including:

...[Cactusi](https://esolangs.org/wiki/Cactusi), whose source code should look like cactuses in a desert (or the [Google Chrome dinosaur game](https://elgoog.im/t-rex/))

```
     ||    ||  
   ==||   =||=
_____||____||____
```

...[Tree](https://esolangs.org/wiki/Tree), which is meant to look like, well, a tree (or a shrub of some kind):

```
      ^
    ^^|^^
   ^^\|/^^
   H^ |/^^^
     \| e
      |/
   ol~|
     \|
  , 32|
   \/ |
    \ |  W
 l   \| /
 \  d |/  o
  \/ !|r /  
   \/ |\/
    \ |/
     \|
```

...or [Rotary](https://esolangs.org/wiki/Rotary), a BF derivative where source code must be written in circles:

```
     !!!,.v
  !!!      !!!
 !            !
!              !
!              !
!              !
 !            !
  !!!      !!!
     !!!!!!

     !!!,.^
  !!!      !!!
 !            !
!              !
!              !
!              !
 !            !
  !!!      !!!
     !!!!!!
```

"Source code as art" is certainly a concept that is alive and well, at least among the esolang community.

[[ back to Table of Contents ]](#toc)

<a name="imitation"></a>
## \#19. languages built so that the source code looks like ___

In a slightly different category from those languages in [#18](#aesthetics) are the following languages, which are written using reduced character sets, or add lots of extra "decoration" in an attempt to make the language look like...

### a recipe

The [Chef](https://esolangs.org/wiki/Chef) programming language (not to be confused with the [Chef configuration management tool](https://en.wikipedia.org/wiki/Chef_(software))), is a language designed so that its source code looks like a recipe. Here's a "Hello, World!" program in Chef:

```
Hello World Souffle.

This recipe prints the immortal words "Hello world!", in a basically brute force way. It also makes a lot of food for one person.

Ingredients.
72 g haricot beans
101 eggs
108 g lard
111 cups oil
32 zucchinis
119 ml water
114 g red salmon
100 g dijon mustard
33 potatoes

Method.
Put potatoes into the mixing bowl. Put dijon mustard into the mixing bowl. Put lard into the mixing bowl. Put red salmon into the mixing bowl. Put oil into the mixing bowl. Put water into the mixing bowl. Put zucchinis into the mixing bowl. Put oil into the mixing bowl. Put lard into the mixing bowl. Put lard into the mixing bowl. Put eggs into the mixing bowl. Put haricot beans into the mixing bowl. Liquefy contents of the mixing bowl. Pour contents of the mixing bowl into the baking dish.

Serves 1.
```

One of Chef's design principles is that "[p]rogram recipes should not only generate valid output, but be easy to prepare and delicious." Whether or not the above souflée recipe is "delicious" is, I suppose, open to interpretation, but there is a [different "Hello, World!" recipe](http://www.mike-worth.com/2013/03/31/baking-a-hello-world-cake/) that makes a surprisingly good chocolate cake.

### Braille

[Louis Braille](https://en.wikipedia.org/wiki/Louis_Braille) is the inventor of the tactile writing system for the visually impaired now known commonly as [braille](https://en.wikipedia.org/wiki/Braille) (all-lowercase), but he also lends his surname to the programming language [Braille](https://esolangs.org/wiki/Braille) (capitalised).

Braille (the programming language) is written using only the UNICODE braille codes (U+2800 to U+28FF). As there are 256 codes (written on a 2x8 grid), the creator of Braille (Brian McPherson) decided to arrange them in a 16x16 grid, where there are 16 actions that can be performed along with a single hexadecimal digit passed to that action.

Here's a Braille program that prints "Hello, World!" in ASCII characters:

```
 ⠆⠄⡒⡆⡘⠀⢐⠊⠦⢦⠗⢾⠿⠂⢢⢾⢦⢦⠮⢄
```

And a "Hello, World!" that prints its output in braille:

```
 ⠆⡆⢤⡔⠈⠖⠙⠇⠗⠕⠺⠀⠂⠕⠇⠇⠑⠓
```

### a play

The (in)famous [Shakespeare](https://esolangs.org/wiki/Shakespeare) language adds lots of extra decoration to the source code so that it resembles one of the plays of its namesake. The language's creators summarise it as follows:

> _"The characters in the play are variables. If you want to assign a character, let's say Hamlet, a negative value, you put him and another character on the stage and let that character insult Hamlet._
> 
> _Input and output [are] done be having someone tell a character to listen [to] their heart [or] speak their mind. The language contains conditionals, where characters ask each other questions, and jumps, where they decide to go to a specific act or scene. Characters are also stacks that can be pushed and popped."_

There's a ["Hello, World!"](http://shakespearelang.sourceforge.net/report/shakespeare/#SECTION00091000000000000000) written in Shakespeare that's just a bit too long to reproduce here, but here's a program which takes any input, reverses it, and prints the reversed string:

```
Outputting Input Reversedly.

Othello, a stacky man.
Lady Macbeth, who pushes him around till he pops.


                    Act I: The one and only.

                    Scene I: In the beginning, there was nothing.

[Enter Othello and Lady Macbeth]

Othello:
 You are nothing!

                    Scene II: Pushing to the very end.

Lady Macbeth:
 Open your mind! Remember yourself.

Othello:
 You are as hard as the sum of yourself and a stone wall. Am I as
 horrid as a flirt-gill?

Lady Macbeth:
 If not, let us return to scene II. Recall your imminent death!

Othello:
 You are as small as the difference between yourself and a hair!

                    Scene III: Once you pop, you can't stop!

Lady Macbeth:
 Recall your unhappy childhood. Speak your mind!

Othello:
 You are as vile as the sum of yourself and a toad! Are you better
 than nothing?

Lady Macbeth:
 If so, let us return to scene III.

                    Scene IV: The end.

[Exeunt]
```

### rock lyrics

The [Rockstar](https://esolangs.org/wiki/Rockstar) language is designed so that its source code looks like lyrics to a cheesy 80s rock ballad. It was created by Dylan Beattie in 2018, inspired by [a tweet](https://twitter.com/paulstovell/status/1013960369465782273?lang=en) which suggested that someone should develop a language called Rockstar to confuse recruiters, who are always looking for "rockstar developers" for their clients.

Here's FizzBuzz in Rockstar:

```
 Midnight takes your heart and your soul
 While your heart is as high as your soul
 Put your heart without your soul into your heart
 
 Give back your heart
 
 
 Desire is a lovestruck ladykiller
 My world is nothing 
 Fire is ice
 Hate is water
 Until my world is Desire,
 Build my world up
 If Midnight taking my world, Fire is nothing and Midnight taking my world, Hate is nothing
 Shout "FizzBuzz!"
 Take it to the top
 
 If Midnight taking my world, Fire is nothing
 Shout "Fizz!"
 Take it to the top
 
 If Midnight taking my world, Hate is nothing
 Say "Buzz!"
 Take it to the top
   
 Whisper my world
 ```

### fetish erotica

Last but not least is [Fetlang](https://esolangs.org/wiki/Fetlang), a very NSFW language whose source code resembles [fetish erotica](https://github.com/fetlang/fetlang), and is "licensed under the BSDM (BSD, modified) license".

Here's a relatively tame Fetlang program that just echoes the arguments passed to it:

```
Make Sean moan
Worship Carrie's feet

Bind Amy to Saint Andrew's Cross
    Have Amy hogtie Sean
    If Amy is Carrie's bitch
        Make Slave scream Sean's name
        Make Sean moan
```

It only gets more risqué from there.

[[ back to Table of Contents ]](#toc)

<a name="qsharp"></a>
## \#20. Q&#35;

"The future is quantum", asserted IBM in [a 2017 blog post](https://www.ibm.com/blogs/research/2017/11/the-future-is-quantum/), which conveniently touted their own quantum computer, the IBM Q. The theoretical foundations of quantum computing were laid by Paul Benioff, Richard Feynman, and many others [in the early 1980s](https://en.wikipedia.org/wiki/Quantum_computing), but it's only recently that engineering has caught up to theory and the construction of quantum computers like the IBM Q has become possible.

Quantum computing offers immense advantages over traditional (classical) computing in particular domains like cryptography, physical simulations, and highly-parallelisable problems like solving systems of equations. Recently, Google proclaimed [_quantum supremacy_](https://www.nature.com/articles/s41586-019-1666-5) with an algorithm that ran on their 54-qubit Sycamore quantum processor in just 200 seconds. An equivalent algorithm would require 10,000 years of processing time on a state-of-the-art classical supercomputer, rendering it practically impossible.

Programming a quantum computer is entirely different from programming a classical computer, because quantum effects like entanglement, coherence, and uncertainty come into play. Even at the most fundamental level, quantum programming differs from classical programming. The traditional logical AND, OR, and NOT gates are replaced by [Hadamard gates](https://en.wikipedia.org/wiki/Hadamard_gate), [Toffoli gates](https://en.wikipedia.org/wiki/Toffoli_gate), and [Pauli X, Y, Z gates](https://en.wikipedia.org/wiki/Pauli_matrices). It is _not_ a matter of simply learning a new programming language to learn quantum computing, but rather like learning an entirely new, extremely difficult skill (with a lot of mathematics and physics behind it).

Still, Microsoft has attempted to make the transition from classical programming to quantum programming as smooth as possible with their [Q# programming language](https://en.wikipedia.org/wiki/Q_Sharp), first released to the public in late 2017. Q# joins Microsoft's "sharp" family of programming languages, preceded by C# and F#. There are extensions for Q# for Microsoft's Visual Studio and [VS Code](https://marketplace.visualstudio.com/items?itemName=quantum.quantum-devkit-vscode) IDEs, which are packaged with quantum simulators (since most people don't yet have access to actual quantum computers).

Q# code looks quite similar to C# code, and Microsoft have provided lots of helpful documentation and [examples](https://docs.microsoft.com/en-us/quantum/quickstart?view=qsharp-preview&tabs=tabid-python) for you to get started. Because Q# is designed to run on actual quantum computers, it is usually run from within another language (like Python or C#), and the quantum simulator from that language interacts with Q#.

For example, here's a bit of Q# code, that -- when called within C# host code -- will measure the value of one of a pair of [entangled](https://en.wikipedia.org/wiki/Quantum_entanglement) qubits, followed by the second one. The same value will _always_ be returned due to the entangled state:

```c#
operation TestBellState(count : Int, initial : Result) : (Int, Int, Int) {
  mutable numOnes = 0;
  mutable agree = 0;

  using ((q0, q1) = (Qubit(), Qubit())) {
    for (test in 1..count) {
      Set(initial, q0);
      Set(Zero, q1);

      H(q0);
      CNOT(q0, q1);
      let res = M(q0);

      if (M(q1) == res) {
        set agree += 1;
      }

      // Count the number of ones we saw:
      if (res == One) {
        set numOnes += 1;
      }
    }
    
    Set(Zero, q0);
    Set(Zero, q1);
  }

  // Return number of times we saw a |0> and number of times we saw a |1>
  return (count-numOnes, numOnes, agree);
}
```

[[ back to Table of Contents ]](#toc)

---

Programming languages, like real-world languages, come in a wide variety of shapes and forms. Not every language needs to be declarative, or functional, or object-oriented. A language doesn't even need to have the ability to define named variables or functions in order to be able to compute anything you throw at it. There are a huge range of possibilities, as the above list attests to.

If you're as fascinated with programming languages as I am, I recommend you pay a visit to [esolangs.org](https://esolangs.org/), where you can learn more about these and many other esoteric languages. If you're interested in creating your own programming language, __watch this space__. I hope to put out a guide within the next few months on developing your own language and compiler from scratch!

---

If you liked what you read above, you should follow me on [Dev.To](https://dev.to/awwsmm) or [Twitter](https://twitter.com/_awwsmm) to get more of that sweet, sweet content. If you _really_ liked it, maybe you could support me by donating just a few of your country's currency units to me at [Ko-Fi](https://ko-fi.com/awwsmm).

Whatever you do, thanks for reading!
