---
title: 'Code as Art'
description: 'Computer programming as an art form in and of itself'
published: '2024-08-17'
tags: ['esolangs']
ogImageUrl: "/blog/code-as-art/banner.png"
ogImageAltText: "Quine Relay -- Copyright (c) 2013, 2014 Yusuke Endoh (@mametter), @hirekoke"
---

## Digital Art

In almost all circumstances, code is a means to an end.

The phrase "computer programming" itself describes the activity of _programming_ a _computer_ to accomplish a particular task. Often, that task is logical. Most computer programs do something "useful", whether that's calculating the best route from your home to work, balancing a budget, or running your [smart fridge's Twitter client](https://www.cbsnews.com/news/teen-goes-viral-for-tweeting-from-lg-smart-fridge-after-mom-confiscates-all-electronics/).

But many programs are written solely to produce something of aesthetic value.

Recently, Generative AI applications like [Midjourney](https://www.midjourney.com/showcase), which can produce visual art from text prompts, have seen a lot of press. But consider also [dwitter.net](https://www.dwitter.net/top/all), where JavaScript programs of 140 characters or fewer create moving 3D landscapes, gyrating fractals, and even [self-playing games of Pong](https://www.dwitter.net/d/135). And also programmers like [Grzegorz Witczak](https://codepen.io/Wujek_Greg/pen/LmrweG), [Ben Evans](https://codepen.io/ivorjetski/pen/xxGYWQG), and [Diana A. Smith](https://diana-adrianne.com/) who create photorealistic works of art using only [CSS](https://en.wikipedia.org/wiki/CSS), a language otherwise used mainly to style fonts, borders, and backgrounds on web pages.

[Digital art](https://en.wikipedia.org/wiki/Digital_art) is not a new phenomenon. Nearly as long as computers have existed, programmers have been using them to express themselves aesthetically.

> Traditional artists have been inspired by digital art, as well. Consider Dalí's [_Painting of Gala looking at the Mediterranean sea which from a distance of 20 meters is transformed into a portrait of Abraham Lincoln (Homage to Rothko)_](https://www.salvador-dali.org/en/artwork/catalogue-raisonne-paintings/obra/871/painting-of-gala-looking-at-the-mediterranean-sea-which-from-a-distance-of-20-meters-is-transformed-into-a-portrait-of-abraham-lincoln-homage-to-rothko), produced in 1976, which appears to show a pixelated image of Abraham Lincoln when viewed from a distance.

For most digital artists, code is a _medium_, like marble for a sculptor, or a canvas for a painter. Code is the material through which the art is _expressed_. Though it takes time and skill to produce, a canvas itself is not usually seen as art itself. But [could it be](https://www.npr.org/2021/09/29/1041492941/jens-haaning-kunsten-take-the-money-and-run-art-denmark-blank)?

## Readability

Developers often talk about writing ["clean"](https://en.wiktionary.org/wiki/clean_code) or ["elegant" code](https://www.quora.com/What-do-programmers-mean-by-elegant-code). Most programming languages are ["general-purpose"](https://en.wikipedia.org/wiki/General-purpose_programming_language), meaning they can be used to accomplish a variety of tasks. Accordingly, there are often many different ways to accomplish the _same_ task, using the same programming language.

Robert C. Martin's [_Clean Code: A Handbook of Agile Software Craftsmanship_](https://www.oreilly.com/library/view/clean-code-a/9780136083238/) gives many examples of "unclean" code, with tips and rules of thumb for rewriting the code in a "clean" way.

In the overwhelming majority of cases, the most important aspect of code is its functionality -- usually to perform some computational task. A _secondary_ aspect of the code is its _readability_, closely related to the "cleanliness", "elegance", or "aesthetics" of the code.

As a quick example, consider this 3x3 matrix

```scala
val identity = Array(1, 0, 0, 0, 1, 0, 0, 0, 1)
```

Which elements are on the diagonal of this matrix?

It's much more _readable_ if we [manually format it](https://scalameta.org/scalafmt/docs/configuration.html#-format-off) as follows

```scala
val identity = Array(1, 0, 0,
                     0, 1, 0,
                     0, 0, 1)
```

These two arrays are functionally identical. But _aesthetically_, the source code used to construct the latter array is more "readable" than the former. Functionality is paramount, but aesthetics are a close second.

But what if a program (or an entire programming language) were designed _primarily_ for its aesthetic qualities?

## Unreadability

Formatting code for readability -- or to follow established patterns and idioms -- is the norm. But some programmers do the opposite (intentionally or otherwise).

Every year, the International Obfuscated C Code Contest ([IOCCC](https://www.ioccc.org/)) accepts submissions of C code which accomplish some task, but do it in an unusual, hard-to-decipher way. These programs are functional, but are purposely formatted so as to be as _unreadable_ as possible (they are _obfuscated_).

Some programming languages have been designed specifically to accomplish as much as possible in as few characters as possible. [APL](https://en.wikipedia.org/wiki/APL_(programming_language)#Game_of_Life) is a "serious" (non-"esoteric") and very terse programming language which programmers may be familiar with, but many [code golf](https://en.wikipedia.org/wiki/Code_golf) languages have been created specifically to minimize source code size in a similar way.

And some programmers choose to format their code so that their entire ray-tracing C++ program can [fit on the back of a business card](https://mzucker.github.io/2016/08/03/miniray.html), or so [the source code](https://github.com/mame/quine-relay/blob/master/QR.rb) of their [ouroborous quine](https://en.wikipedia.org/wiki/Quine_(computing)#Ouroboros_programs) written in Ruby looks like a dragon (see the header image of this blog post), or so that they [look like and can be read as poems](https://code-poetry.com/). All of these examples use "serious" programming languages in an "unserious" way.

## Esoteric Languages

There are also many programming languages where the [aesthetics of the source code](https://www.awwsmm.com/blog/20-intriguing-unusual-and-goofy-programming-languages#aesthetics) is more important than what is actually written in that code. As most programming languages are written using ASCII or Unicode character sets, [some of these](https://web.archive.org/web/20240205064805/https://blue.sky.or.jp/grass/) look like [ASCII art](https://en.wikipedia.org/wiki/ASCII_art)...

```
　　　　_, ._
　　（　・ω・）　んも〜
　　○=｛=｝〇,
　 　|:::::::::＼, ', ´
､､､､し ､､､((（.＠）ｗｖｗｗＷＷｗｖｗｗＷｗｗｖｗｗｗｗＷＷＷｗｗＷｗ
ｗＷＷＷＷＷＷｗｗｗｗＷｗｗｖｗＷＷｗＷｗｗｖｗＷＷＷ
```


...though most just look like [jumbled messes of characters](https://esolangs.org/wiki/Labyrinth)

```
 72_1_108::_3+:}
    0          _ """
     11_{78_23_" " "
     4         4 ".{@
     _         " {
     1           }"
     08_100_33"""""
```

Some esoteric programming languages are [non-textual](https://esolangs.org/wiki/Category:Non-textual). The source code of these programs can be visual, as with [Piet](https://www.dangermouse.net/esoteric/piet/samples.html)

!["Hello World" in the Piet programming language](/blog/code-as-art/piet.gif)

or [Nice](https://esolangs.org/wiki/Nice) (which does not yet have a working interpreter)

!["Hello World" in the Nice programming language](/blog/code-as-art/nice.png)

Other languages are auditory, meaning programs are encoded as sound. Usually, these programs can also be written [as individual notes](https://esolangs.org/wiki/Sound), or as [sheet music](https://esolangs.org/wiki/Hello_world_program_in_esoteric_languages_(D-G)#Fugue)

!["Hello World" in the Fugue programming language](/blog/code-as-art/fugue.png)

<figure style="display:block;text-align:center">
  <figcaption>Listen to the above program</figcaption>
  <audio controls src="/blog/code-as-art/fugue-hello-world.mp3"></audio>
</figure>

In many cases, the simplest implementation of a program in these languages is not the most aesthetically pleasing. Programmers will opt for beautiful programs over efficient ones. 

For example, the following Piet program gets a number as input from the user, squares it, and prints the result

![A sample Piet program](https://thepracticaldev.s3.amazonaws.com/i/1clwo2qss6zurm2kisdw.png)

...but so does this one

![A simple Piet program](https://thepracticaldev.s3.amazonaws.com/i/i77oznhfqnyu147wxesz.png)

## Code as Art

> "There is no generally agreed definition of what constitutes art" [[Wikipedia](https://en.wikipedia.org/wiki/Art)]

Even in languages which aren't specifically designed to have "beautiful" source code, some programmers opt to format their code in ways which trade efficiency, practicality, or readability for aesthetic appeal.

There is no single, correct solution to a problem which can be solved by a program. Different programs can accomplish the same task in different ways. Weighing tradeoffs and choosing one solution over another is part of the art of computer programming.

The human desire to be creative and express one's individuality does not end where a keyboard begins. Hundreds of esoteric programming languages can attest to that.

Whether textual, visual, or auditory, code can be used as a medium to create art, but it can also _be_ art itself.