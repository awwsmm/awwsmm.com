---
title: 'Eliminate Unnecessary Builds With Git Hooks'
description: 'Writing Git Commit Hooks in Bash, Java, and Scala'
published: '2022-01-02'
lastUpdated: '2022-01-14'
---

## Writing a Git Hook in Bash

[Git Hooks](https://www.atlassian.com/git/tutorials/git-hooks) can be a very useful addition to a developer's workflow.

For instance, as I'm working on [rewriting my new website using Next.js](https://www.awwsmm.com/blog/hello-world), I've set up [eslint](https://eslint.org) and have pretty strict linting rules when running Next builds.

Unfortunately, Git doesn't follow these rules by default. So it's easy to forget to run the linter, run a `git push`, and end up with a failing production build on [Vercel](https://vercel.com).

To avoid this, I've set up a simple Git Hook which runs `eslint` before every `git push`, and fails the `push` if the linter returns any `error`s:

```sh
# .git/hooks/pre-push

# pipe output (with colors) to .temp file
RESULT=$(script -q .temp npm run lint)

# if .temp file contains "error", fail
if grep --quiet error .temp; then
  printf "\n  !! Will not push -- found linting errors:\n"
  sed '1,5d' .temp | cat
  rm .temp
  exit 1
else
  rm .temp
  exit 0
fi
```

The above script runs `npm run lint`, captures the output ([with text colors](https://stackoverflow.com/a/3515296/2925434)) to a `.temp` file, and then `grep`s for `error` in that file. If it finds any instances of the word "error", it won't `push`, but will instead print the output of the `npm run lint` command:

```sh
$ git push

  !! Will not push -- found linting errors:

/Users/andrew/Git/awwsmm.com/components/CommitGroupComponent.tsx
   2:1  error  Imports should be sorted alphabetically  sort-imports
  24:4  error  Missing semicolon                        semi

✖ 2 problems (2 errors, 0 warnings)
  1 error and 0 warnings potentially fixable with the `--fix` option.

error: failed to push some refs to 'github.com:awwsmm/awwsmm.com.git'
```

This prevents useless builds on Vercel which will fail because of linting errors.

**Note:** make sure your `.git/hooks/<file>` is executable (`chmod +x .git/hooks/<file>`), or it will not prevent the particular action from occurring. It's probably best to play around with a `pre-commit` hook rather than a `pre-push` one, when testing.

## Writing a Git Hook in Java

We can do a similar thing using Java instead of bash scripting. For this example, we'll look at writing a `pre-commit` hook in Java. Instead of writing Java code to the `pre-commit` file directly, we'll add a bit of indirection.

First, create a file called `PreCommit.java` in the `.git/hooks/` directory and add some pre-commit logic to it. In this case, we're just going to fail every commit:

```java
public class PreCommit {
  public static void main (String[] args) {
    System.out.println("Java says: no committing please.");
    System.exit(1);
  }
}
```

The `System.exit(1)` gives the same result as `exit 1` in the Bash script -- the commit will fail to complete.

Next, we'll make the `.git/hooks/pre-commit` file executable with

```sh
$ chmod +x .git/hooks/pre-commit
```

...and modify its contents to read:

```sh
#!/bin/sh

# get the path to this script file
DIR=$(dirname "$0")

# Java >= 11
exec java $DIR/PreCommit.java "$@"
```

> If you're using Java 11+, you can also write this [all as a single file](https://stackoverflow.com/a/61899256/2925434), though I personally don't recommend this method as it combines Bash and Java syntax in a single file, which can be difficult for IDEs to handle in terms of syntax highlighting, etc.

With this in place, we'll now see a message like

```sh
$ git commit -m "update gitignore, more hook testing"
Java says: no committing please.
```

Note that in Java versions &lt; 11, we need to compile this script first with `javac`, so `pre-commit` should instead look something like

```sh
#!/bin/sh
DIR=$(dirname "$0")

# Java < 11
javac $DIR/PreCommit.java "$@"
exec java -classpath $DIR PreCommit
!#
```

## Writing a Git Hook in Scala

The process for [writing a Git Hook in Scala](https://alvinalexander.com/scala/scala-shell-script-example-exec-syntax/) is very similar to writing one in Java. First, define a `pre-commit.scala` file with the following contents

```scala
object Hook {
  def main (args: Array[String]): Unit = {
    System.out.println("Scala says: no committing please.");
    System.exit(1);
  }
}
```

(Note that, in Scala, the name of the class doesn't have to match the name of the file.)

Then, modify the contents of `pre-commit` to read

```sh
#!/bin/sh
DIR=$(dirname "$0")
exec scala $DIR/pre-commit.scala "$@"
!#
```

Finally, try to commit:

```sh
$ git commit -m "update gitignore, more hook testing"
Scala says: no committing please.
```

That's all there is to it.

As it takes a while for the JVM to boot up when running Git Hooks in Java or Scala, it's probably not extremely practical to do so... unless you have a lot of logic in your hook which is easier to read in Java / Scala than in a Bash script.

But anyway, it's good to know that it can be done.