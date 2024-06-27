---
title: 'Managing Your Python Project with Git and PyBuilder'
description: 'Maintain control of your code!'
published: '2018-09-25'
tags: ['git', 'python']
---

> Originally posted on [Dev.To](https://dev.to/awwsmm/managing-your-python-project-with-git-and-pybuilder-21if)

# Introduction

Most of my recent work has been in Java, a language which offers lots of project management tools. The most famous of these is probably [Maven](https://maven.apache.org/index.html). Maven helps you to keep your code and dependencies organized, and makes it easy to compile and package your code.

Maybe it's because Java tends to be a much more verbose language (and therefore needs special tools to help wrangle it into submission), or maybe it's because lots of people use Python for small scripts and helper functions, but I've struggled to find a Maven-like program to use when I'm coding in Python. Recently, I put some effort into getting a new Python project organized and I've found what I think is the best solution for managing a large Python project: PyBuilder + Git.

## PyBuilder

[PyBuilder](http://pybuilder.github.io/) is a project management tool meant primarily for Python. It organizes your code with a consistent directory structure (for source code, scripts, and tests), manages unit testing and code coverage, and can package your code for easy sharing or uploading to the Python Package Index ([PyPI](https://pypi.org/)). Using [pydoc](https://docs.python.org/3/library/pydoc.html), we can also add proper documentation to the list of available features. A full introduction to PyBuilder can be found [here](http://pybuilder.github.io/documentation/tutorial.html).

## Git

[Git](https://git-scm.com/) is probably the most popular version control system (VCS) available today. By managing version control through a pseudo-filesystem, rather than the delta-based approach of other VCSes, every copy ("clone") of a Git project is a complete backup of all code committed to that repository. Distributed VCSes like Git are also supremely resistant to intentional falsification and hardware failures, and allow for extremely flexible collaborative environments. A full introduction to Git can be found [here](https://git-scm.com/book/en/v2).

## Why both?

Git doesn't care what your project looks like. It could have a very rigid directory structure, or it could be a directory full of GBs of cat memes. By combining the organizational power and project management of PyBuilder with the version control of Git, we get a Python project that is easy to navigate, easy to manage, and easy to dive into and start contributing to.

Note that both PyBuilder and Git could (and do) have books written about them. This tutorial is not meant to be an exhaustive introduction to either piece of software, but is meant more for someone who is trying to organize their Python project, has some familiarity with Git, and has a desire to ignore all of the pitfalls that I fell into to get to this point. Let's go!

# Setting up Git

Before we install PyBuilder, we have to set up Git. I'm running this tutorial on a clean, minimal-install [Ubuntu (18.04.1 LTS)](https://www.ubuntu.com/download/desktop) VM, so I'll do everything from scratch.

## Installing Git

To find out if you have Git installed already (if you forgot or if you're on a new system), run the command

```shell
andrew@ubuntuvm:~$ whereis git
```

If you have Git installed, this should return something like

```
git: /usr/bin/git /use/share/man/man1/git.1.gz
```

My new VM doesn't have Git installed, so we'll start there. Ubuntu is a Debian-based Unix-like OS, so it has the Advanced Packaging Tool, `apt`. Git can be installed easily on Ubuntu via `apt`:

```shell
andrew@ubuntuvm:~$ sudo apt-get install git
```

And we can verify the installation by getting the Git version:

```shell
andrew@ubuntuvm:~$ git --version
git version 2.17.1
```

## Setting Up a New Git Repository

Git repositories can be _cloned_ -- that is, copied from an existing repository -- or created from scratch. For this tutorial, I'll assume you have some Python code on your computer that you want to assemble into a new Git repository. To do that, let's first make a directory where all the code will live, and then `init`ialize a new git repo:

```shell
andrew@ubuntuvm:~$ mkdir MyProject
andrew@ubuntuvm:~$ cd MyProject
andrew@ubuntuvm:~/MyProject$ git init
Initialized empty git repository in /home/andrew/MyProject/.git
```

The `.git/` directory contains all of the information that Git needs to manage your files:

```shell
andrew@ubuntuvm:~/MyProject$ sudo apt-get install tree 
andrew@ubuntuvm:~/MyProject$ tree .git/

.git/
|-- HEAD
|-- branches
|-- config
|-- description
|-- hooks
|   |-- applypatch-msg.sample
|   |-- commit-msg.sample
|   |-- post-update.sample
|   |-- pre-applypatch.sample
|   |-- pre-commit.sample
|   |-- pre-push.sample
|   |-- pre-rebase.sample
|   |-- prepare-commit-msg.sample
|   `-- update.sample
|-- info
|   `-- exclude
|-- objects
|   |-- info
|   `-- pack
`-- refs
    |-- heads
    `-- tags
```

But most of the time, you won't need to worry about what's in there, you can interact with Git through `git` commands. Before we learn about those, though, let's get our project organized with PyBuilder.

# Setting up PyBuilder

The recommended way to use PyBuilder is to install it using [pip](https://pypi.org/project/pip/), and within a virtual environment. First, let's set up the virtual environment.

## Setting up a Virtual Environment

Since I'm running this tutorial on an Ubuntu system, I already have Python installed (and I'm assuming you do, too, since you're reading this tutorial about how to organize your Python project). If you don't, the [Python Software Foundation](https://www.python.org/downloads/) has instructions on how to download Python so you can use it on your system.

The next step involves a tool called `pip`, which is [installed differently on different OSes and different versions of Python](https://www.makeuseof.com/tag/install-pip-for-python/). In my case, I'm going to install `pip` with the command:

```shell
andrew@ubuntuvm:~/MyProject$ sudo apt-get install python3-pip
```

...and then make sure pip is up-to-date with:

```shell
andrew@ubuntuvm:~/MyProject$ python3 -m pip install --user --upgrade pip
```

Note that I'm using the `python3` command and not `python`, since Ubuntu 18 is set up to use Python 3.6.6 by default. Next, I can use pip to install `virtualenv`:

```shell
andrew@ubuntuvm:~/MyProject$ python3 -m pip install --user virtualenv
```

If you get a warning like

```
The script virtualenv is installed in `/home/andrew/.local/bin` which is not on PATH.
Consider adding this directory to PATH or, if you prefer to suppress this warning, use --no-warn-script-location.
```

You can address this issue by adding the noted location to your system's `$PATH` variable:

```shell
andrew@ubuntuvm:~/MyProject$ export PATH=$PATH:/home/andrew/.local/bin
andrew@ubuntuvm:~/MyProject$ echo $PATH
/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:
/usr/local/games:/snap/bin:/home/andrew/.local/bin
```

Finally, create a virtual environment with

```shell
andrew@ubuntuvm:~/MyProject$ virtualenv env
```

This simply creates the `env` directory within the `MyProject` directory. You can enter the virtual environment with the command

```shell
andrew@ubuntuvm:~/MyProject$ source env/bin/activate
(env) andrew@ubuntuvm:~/MyProject$ 
```

The `(env)` before the command prompt indicates that you're within the virtual environment. You can exit the virtual environment at any time with the command

```shell
(env) andrew@ubuntuvm:~/MyProject$ deactivate
andrew@ubuntuvm:~/MyProject$ 
```

Note that `(env)` no longer appears at the beginning of the command prompt.

## Installing PyBuilder

PyBuilder is really easy to install. Enter the virtual environment and `pip install`:

```shell
andrew@ubuntuvm:~/MyProject$ source env/bin/activate
(env) andrew@ubuntuvm:~/MyProject$ pip install pybuilder
```

We can start a blank PyBuilder project with

```shell
(env) andrew@ubuntuvm:~/MyProject$ pyb --start-project
```

You can hit `Enter` / `Return` to accept all of the defaults (these can be changed if you like, but for simplicity's sake, we'll use the defaults here). Note that we don't have to type out the verbose `pybuilder`, but just `pyb`. You should now have a `MyProject` directory that looks like

```shell
(env) andrew@ubuntuvm:~/MyProject$ ls
build.py  docs  env  setup.py  src
```

...where `docs`, `env`, and `src` are all directories. Your `src` directory should look like:

```shell
(env) andrew@ubuntuvm:~/MyProject$ tree src/
src/
|-- main
|   |-- python
|   `-- scripts
`-- unittest
    `-- python

5 directories, 0 files
```

The next thing to do is to add some source code to `src/main/python`, some scripts to `/src/main/scripts` and some unit tests to `/src/unittest/python`. To make things easy on myself, I like to make softlinks within environments like this:

```shell
(env) andrew@ubuntuvm:~/MyProject$ ln -s src/main/python/ source
(env) andrew@ubuntuvm:~/MyProject$ ln -s src/main/scripts/ script
(env) andrew@ubuntuvm:~/MyProject$ ln -s src/unittest/python test
(env) andrew@ubuntuvm:~/MyProject$ ls
build.py  docs  env  script  setup.py  source  src  test
```

Now I don't need to remember if the directory was `src/main/script` or `src/python/scripts` or if the unit tests are in `src/unittests` or `src/python/main/unittest` or whatever. Everything is in the main directory and everything is singular (ie. `test` instead of `tests`).

## Managing a PyBuilder Project

PyBuilder, like many other project management frameworks, is based on the idea of a "build lifecycle", where there are common tasks you'll want to run over and over, like "compile", "run", "document", etc. As an interpreted language, Python doesn't have a "compile" stage in its build lifecycle, but it has most of the main ones. PyBuilder defines [lots of different lifecycle stages](https://gist.github.com/miebach/9752025), but the most common ones are

 * `pyb publish` and
 * `pyb clean`

_"What about unit tests?"_ you cry. _"WHAT ABOUT CODE COVERAGE?"_ you scream in anguish. They're covered under `publish`, don't worry. Before we add any code to the project, let's take a look at `build.py`:

```python
from pybuilder.core import use_plugin, init

use_plugin("python.core")
use_plugin("python.unittest")
use_plugin("python.install_dependencies")
use_plugin("python.flake8")
use_plugin("python.coverage")
use_plugin("python.distutils")


name = "MyProject"
default_task = "publish"


@init
def set_properties(project):
    pass
```

`build.py` defines the plugins, settings, tasks, and so on that will be used throughout the build lifecycle. Let's add a few things here, like a description, an author, and some project properties (it's difficult to find a list of these online, but [if you search for `self.home_page` in PyBuilder's `core.py` code](https://github.com/pybuilder/pybuilder/blob/master/src/main/python/pybuilder/core.py), that list is pretty close to what's available to use):

```python
from pybuilder.core import use_plugin, init, Author

use_plugin("python.core")
use_plugin("python.unittest")
use_plugin("python.install_dependencies")
use_plugin("python.flake8")
use_plugin("python.coverage")
use_plugin("python.distutils")

name    = "MyProject"
version = "1.0"

summary = "Example PyBuilder / Git project"
url     = "https://github.com/awwsmm/PybGit"

description = """An example PyBuilder / Git project for project management
and file version control. See blog post at http://bit.ly/2QY65wO for a
more through explanation."""

authors      = [Author("Andrew Watson", "andrew.watson@nibrt.ie")]
license      = "None"
default_task = "publish"

@init
def initialize(project):
    project.build_depends_on("mockito")

@init
def set_properties(project):
    pass
```

Note that we had to add `Author` to the import list to add a list of authors to the project. Everything else is fairly self explanatory; note in particular that the GitHub URL doesn't need to match the name of the directory in which we've saved the project. We also added a dependency on `mockito`, which we'll use for some unit testing. What about `default_task`, though? That defines what PyBuilder should do when we just enter `pyb` at the command prompt, with no additional arguments. Let's try that now:

```shell
(env) andrew@ubuntuvm:~/MyProject$ pyb
PyBuilder version 0.11.17
Build started at 2018-09-25 12:45:38
------------------------------------------------------------
[INFO]  Building MyProject version 1.0
[INFO]  Executing build in /home/andrew/MyProject
[INFO]  Going to execute task publish
[INFO]  Running unit tests
[INFO]  Executing unit tests from Python modules in /home/andrew/MyProject/src/unittest/python
[WARN]  No unit tests executed.
[INFO]  All unit tests passed.
[INFO]  Building distribution in /home/andrew/MyProject/target/dist/MyProject-1.0
[INFO]  Copying scripts to /home/andrew/MyProject/target/dist/MyProject- 1.0/scripts
[INFO]  Writing setup.py as /home/andrew/MyProject/target/dist/MyProject-1.0/setup.py
[INFO]  Collecting coverage information
[WARN]  coverage_branch_threshold_warn is 0 and branch coverage will not be checked
[WARN]  coverage_branch_partial_threshold_warn is 0 and partial branch coverage will not be checked
[INFO]  Running unit tests
[INFO]  Executing unit tests from Python modules in /home/andrew/MyProject/src/unittest/python
[WARN]  No unit tests executed.
[INFO]  All unit tests passed.
Coverage.py warning: No data was collected. (no-data-collected)
[INFO]  Overall coverage is 100%
[INFO]  Overall coverage branch coverage is 100%
[INFO]  Overall coverage partial branch coverage is 100%
------------------------------------------------------------
BUILD FAILED - No data to report.
------------------------------------------------------------
Build finished at 2018-09-25 12:45:38
Build took 0 seconds (619 ms)
```

We got the error message `BUILD FAILED - No data to report.` because we don't yet have any files in the project. Let's add a few.

Add the following text to `/src/main/python/example_hello.py` (aka. `source/example_hello.py`):

```python
import sys

"""Prints \"Hello World!\" to the given output stream."""
def hello_world(out):
    """
    Prints \"Hello World!\".
    >>> import sys
    >>> hello_world(sys.stdout)
    Hello World!\n
    """
    out.write("Hello World!\n")

"""

Below:

 > Required in order to run the documentation checker on this code.

 > The comment
     pragma: no cover
   means that this block of code will not be checked for unit test
   coverage by the `coverage` module.

"""

if __name__ == "__main__": # pragma: no cover
    import doctest
    doctest.testmod()
```

Next, we need to add some unit tests for this source code. Add the following text to `test/example_hello_tests.py`:

```python
from mockito import mock, verify
import unittest

from example_hello import hello_world

class HelloWorldTest(unittest.TestCase):

    def test_correct_message(self):
        out = mock()
        hello_world(out)
        verify(out).write("Hello World!\n")
```

By convention (and required by PyBuilder), the unit tests for `source/abcd.py` will be in `test/abcd_tests.py`. Note that, above, we're using both [the standard Python unit test package `unittest`](https://docs.python.org/3/library/unittest.html) as well as [the mock object package `mockito`](https://pypi.org/project/mockito/). Mockito isn't strictly necessary for unit testing, but it can make things faster and easier.

We're also importing the method `hello_world` from the file `example_hello` (without the `.py`). PyBuilder knows where to find these files and everything "just works". Let's try building our package again with `pyb`:

```shell
(env) andrew@ubuntuvm:~/MyProject$ pyb
PyBuilder version 0.11.17
Build started at 2018-09-25 14:22:11
------------------------------------------------------------
[INFO]  Building MyProject version 1.0
[INFO]  Executing build in /home/andrew/MyProject
[INFO]  Going to execute task publish
[INFO]  Running unit tests
[INFO]  Executing unit tests from Python modules in /home/andrew/MyProject/src/unittest/python
[INFO]  Executed 1 unit tests
[ERROR] Test has error: unittest.loader._FailedTest.example_hello_tests
------------------------------------------------------------
BUILD FAILED - There were 1 error(s) and 0 failure(s) in unit tests
------------------------------------------------------------
Build finished at 2018-09-25 14:22:11
Build took 0 seconds (318 ms)
```

What happened? Let's run `pyb` again with the `-v` (verbose) flag:

```shell
(env) andrew@ubuntuvm:~/MyProject$ pyb -v
PyBuilder version 0.11.17
Build started at 2018-09-25 14:22:21
------------------------------------------------------------
[INFO]  Building MyProject version 1.0
[INFO]  Executing build in /home/andrew/MyProject
[INFO]  Going to execute task publish
[INFO]  Running unit tests
[INFO]  Executing unit tests from Python modules in /home/andrew/MyProject/src/unittest/python
[INFO]  Executed 1 unit tests
[ERROR] Test has error: unittest.loader._FailedTest.example_hello_tests
ImportError: Failed to import test module: example_hello_tests
Traceback (most recent call last):
  File "/usr/lib/python3.5/unittest/loader.py", line 153, in loadTestsFromName
    module = __import__(module_name)
  File "/home/andrew/MyProject/src/unittest/python/example_hello_tests.py", line 1, in <module>
    from mockito import mock, verify
ImportError: No module named 'mockito'


------------------------------------------------------------
BUILD FAILED - There were 1 error(s) and 0 failure(s) in unit tests
------------------------------------------------------------
Build finished at 2018-09-25 14:22:21
Build took 0 seconds (312 ms)
```

Oh! It's because we forgot to install the dependencies that we included in `build.py` (namely, Mockito). Let's do that now:

```shell
(env) andrew@ubuntuvm:~/MyProject$ pyb install_dependencies
PyBuilder version 0.11.17
Build started at 2018-09-25 14:25:13
------------------------------------------------------------
[INFO]  Building MyProject version 1.0
[INFO]  Executing build in /home/andrew/MyProject
[INFO]  Going to execute task install_dependencies
[INFO]  Installing all dependencies
[INFO]  Processing batch dependency 'mockito'
------------------------------------------------------------
BUILD SUCCESSFUL
------------------------------------------------------------
Build Summary
             Project: MyProject
             Version: 1.0
      Base directory: /home/andrew/MyProject
        Environments:
               Tasks: install_dependencies [3247 ms]
Build finished at 2018-09-25 14:25:16
Build took 3 seconds (3259 ms)
```

Yes, it really is that easy. We can run `pyb` again now, and we get a `BUILD SUCCESSFUL` at the end:

```shell
(env) andrew@ubuntuvm:~/MyProject$ pyb
PyBuilder version 0.11.17
Build started at 2018-09-25 14:25:19
------------------------------------------------------------
[INFO]  Building MyProject version 1.0
[INFO]  Executing build in /home/andrew/MyProject
[INFO]  Going to execute task publish
[INFO]  Running unit tests
[INFO]  Executing unit tests from Python modules in /home/andrew/MyProject/src/unittest/python
[INFO]  Executed 1 unit tests
[INFO]  All unit tests passed.
[INFO]  Building distribution in /home/andrew/MyProject/target/dist/MyProject-1.0
[INFO]  Copying scripts to /home/andrew/MyProject/target/dist/MyProject-1.0/scripts
[INFO]  Writing setup.py as /home/andrew/MyProject/target/dist/MyProject-1.0/setup.py
[INFO]  Collecting coverage information
[WARN]  coverage_branch_threshold_warn is 0 and branch coverage will not be checked
[WARN]  coverage_branch_partial_threshold_warn is 0 and partial branch coverage will not be checked
[INFO]  Running unit tests
[INFO]  Executing unit tests from Python modules in /home/andrew/MyProject/src/unittest/python
[INFO]  Executed 1 unit tests
[INFO]  All unit tests passed.
[INFO]  Overall coverage is 100%
[INFO]  Overall coverage branch coverage is 100%
[INFO]  Overall coverage partial branch coverage is 100%
[INFO]  Building binary distribution in /home/andrew/MyProject/target/dist/MyProject-1.0
------------------------------------------------------------
BUILD SUCCESSFUL
------------------------------------------------------------
Build Summary
             Project: MyProject
             Version: 1.0
      Base directory: /home/andrew/MyProject
        Environments:
               Tasks: prepare [248 ms] compile_sources [0 ms] run_unit_tests [40 ms] package [3 ms] run_integration_tests [0 ms] verify [401 ms] publish [516 ms]
Build finished at 2018-09-25 14:25:20
Build took 1 seconds (1222 ms)
```

Don't forget to always run `pyb install_dependencies` after you add any new dependencies to the `build.py` file. Note that PyBuilder ran our unit test that we defined in `example_hello_tests.py`. As long as you place the tests in the correct directory, PyBuilder knows where to find them and what to do with them. Let's add another, slightly more complicated, example. Create a new file called `source/example_primes.py` and add the following text to it:

```python
import math
import itertools

"""Returns a list of N primes, beginning with [2, 3, 5...]."""
def first_N_primes(N):
    """
    Returns a list of N primes, beginning with [2, 3, 5...]. Returns an empty
    list if the user supplies a non-positive number. Floating point numbers
    are rounded up.
    >>> first_N_primes(0)
    []
    >>> first_N_primes(3.14)
    [2, 3, 5, 7]
    >>> first_N_primes(-42)
    []
    >>> first_N_primes(10)
    [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
    """
    if (N <= 0):
        return []

    primes = [2]
    prime  = (x for x in itertools.count(2) if not any ([x%y==0 for y in range(2, int(math.ceil(math.sqrt(x)))+1)]))

    for n in range(1, int(math.ceil(N))):
        primes.append(next(prime))

    return primes

if __name__ == "__main__": # pragma: no cover
    import doctest
    doctest.testmod()
```

Note that we've again added this "doctest" block at the bottom of this bit of source code... why? It allows us to verify that the documentation we've written (example usage, beginning with `>>>`) actually works as advertised:

```shell
(env) andrew@ubuntuvm:~/MyProject$ python3 source/example_primes.py -v
Trying:
    first_N_primes(0)
Expecting:
    []
ok
Trying:
    first_N_primes(3.14)
Expecting:
    [2, 3, 5, 7]
ok
Trying:
    first_N_primes(-42)
Expecting:
    []
ok
Trying:
    first_N_primes(10)
Expecting:
    [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
ok
1 items had no tests:
    __main__
1 items passed all tests:
   4 tests in __main__.first_N_primes
4 tests in 2 items.
4 passed and 0 failed.
Test passed.
```

I don't know about you, but I think that's pretty cool. `doctest` verifies that our documentation examples actually produce the output that we say they should. If you only want to view the documentation, you can do that with:

```shell
(env) andrew@ubuntuvm:~/MyProject$ python3 -i source/example_primes.py
>>> help(first_N_primes)
```

...or just

```shell
(env) andrew@ubuntuvm:~/MyProject$ pydoc ./source/example_primes.py
```

Note that you can also get nicely-formatted HTML help by adding the `-w` flag above. Let's add another set of unit tests for `example_primes`. In `test/example_primes_tests.py`, add the following lines of code:

```python
import unittest

from example_primes import first_N_primes

class FirstNPrimesTest(unittest.TestCase):

    """ test negative float input """
    def test_negFloatInput(self):
        self.assertEqual(first_N_primes(-14.3), [])

    """ test positive integer input """
    def test_posIntInput(self):
        self.assertEqual(first_N_primes(6), [2, 3, 5, 7, 11, 13])
```

Running `pyb` again verifies that we have 3 unit tests (all of which passed) and that we have 100% code coverage! Success!

## Python Scripts in PyBuilder

One more thing worth touching on for this intro to PyBuilder is the idea of _scripts_. A good way to keep code neat is to keep method and class definitions in `source/` and runnable scripts which use those methods and classes in `script/`. Let's write a short script that uses the single method defined in `source/example_primes.py`. Create a file called `script/example_primes_script.py` and add the following code to it:

```python
#!/usr/bin/env python
import sys

from example_primes import first_N_primes

N = 10
print("The first",N,"primes are:")

for n in first_N_primes(N):
    print(n)
print()
```

We then re-publish the code with `pyb`, and we can install the package locally (within the virtual environment) with the command:

```shell
(env) andrew@ubuntuvm:~/MyProject$ pip install target/diest/MyProject-1.0/dist/MyProject-1.0.tar.gz
```

This makes all of the scripts in the project available for us to use, right on the command line. Simply write:

```shell
(env) andrew@ubuntuvm:~/MyProject$ example_primes_script.py
The first 10 primes are:
2
3
5
7
11
13
17
19
23
29
```

Ta da! PyBuilder, again, knows where the scripts are and makes them available to use. If you change any code, make sure you re-publish with `pyb` and reinstall using the `pip install` command above. That will make your code available to use freely within the virtual environment.

# Managing Things with Git

As I said earlier, this doesn't attempt to be an introduction to Git by any means, but there are a few commands here that we can review, which will help us to maintain this project. First, let's see what's changed since we initialized everything with `git init` way back at the beginning of this tutorial:

```shell
(env) andrew@ubuntuvm:~/MyProject$ git status
On branch master

Initial commit

Untracked files:
  (use "git add <file>..." to include in what will be committed)

        .coverage
        __pycache__/
        build.py
        env/
        script
        setup.py
        source
        src/
        target/
        test

nothing added to commit but untracked files present (use "git add" to track)
```

...okay, everything. A good `.gitignore` file is probably in order, since we don't want our repo to be clogged with the hundreds of files in our virtual environment directory, `env`. Probably, we only want to commit our source code, unit tests, scripts, and information about our build environment (also maybe our soft links). Let's `gitignore` everything else. Create a file called `.gitignore` and add the following lines to it:

```
.coverage
__pycache__
env
target
```

If directories are added to `.gitignore`, that directory and everything in it is ignored when we run `git status`. Let's see what we have left:

```shell
(env) andrew@ubuntuvm:~/MyProject$ git status

On branch master

Initial commit

Untracked files:
  (use "git add <file>..." to include in what will be committed)

        .gitignore
        build.py
        script
        setup.py
        source
        src/
        test

nothing added to commit but untracked files present (use "git add" to track)
```

Okay! Just code, soft links, and some configuration files. Let's add all of this to our initial commit:

```shell
(env) andrew@ubuntuvm:~/MyProject$ git add .gitignore

(env) andrew@ubuntuvm:~/MyProject$ git add *
```

Note that here you might get a warning about some files being ignored -- that's fine, we purposefully put those files in `.gitignore` because we wanted to ignore them. Let's commit these files to our local git repo:

```shell
(env) andrew@ubuntuvm:~/MyProject$ git commit -am "initial commit"
```

We've committed all (`-a`) the files we had staged and added a message (`-m`) which indicates that this is our first commit to this repo. Next, if you have a GitHub (or other similar account like BitBucket, etc.), you can easily create a remote repo to host your code.

## Creating a GitHub Repository

To create a remote repository hosted on GitHub, simply go to your profile page:

![](https://thepracticaldev.s3.amazonaws.com/i/hlyvcrh4ktr88bej7qad.PNG)

Click the "Repositories" link at the top:

![](https://thepracticaldev.s3.amazonaws.com/i/ekcwyrapxyxjkb4n1cmy.PNG)

Then click the green "New" button over on the right:

![](https://thepracticaldev.s3.amazonaws.com/i/bxotj4in6qd8qjmjjcfj.PNG)

Name your repo, give it a description...

![](https://thepracticaldev.s3.amazonaws.com/i/rcjmfuenl7sdmbgaz0qi.PNG)

...and follow the instructions! We want to "push an existing repository from the command line", because we've already got our directory structure all figured out and added our files, etc. Make sure you've [added your ssh key to GitHub](https://jdblischak.github.io/2014-09-18-chicago/novice/git/05-sshkeys.html) so that you can push to your remote repo, and run the following two commands (as the instructions tell you to do):

```shell
(env) andrew@ubuntuvm:~/MyProject$ git remote add origin git@github.com:awwsmm/PybGit.git

(env) andrew@ubuntuvm:~/MyProject$ git push -u origin master
```

That's it! You now have a Git/PyBuilder project with version control, unit tests, documentation, and a nice, organized directory structure:

![](https://thepracticaldev.s3.amazonaws.com/i/usojnbbre9nv17zpkrsr.PNG)

## Oh Wait, One More Thing

Say we forgot to add a file to our remote repo, or we've changed something and we want to update it. No worries. Now that we have our remote repo up and running, it's pretty easy. Let's make a new file called `script/example_hello_script.py` and add the following code to it:

```python
#!/usr/bin/env python
import sys

"""
Writes "Hello from a script!" to stdout.
"""

sys.stdout.write("Hello from a script!\n")
```


Nothing special here. But we need to go through a few steps. First, re-publish the project with `pyb publish` (or just `pyb`, as we've been doing, since we have the `default_task` set to "publish" in our `build.py` file):

```shell
(env) andrew@ubuntuvm:~/MyProject$ pyb
```

Then, re-install the package in our virtual environment:

```shell
(env) andrew@ubuntuvm:~/MyProject$ pip install target/dist/MyProject-1.0/dist/MyProject-1.0.tar.gz
```

Verify that our new script works before we commit it to our local repo:

```shell
(env) andrew@ubuntuvm:~/MyProject$ example_hello_script.py
Hello from a script!
```

It does, cool. If we run `git status`, we can see that the repository has changed -- we have a new untracked file.

```shell
(env) andrew@ubuntuvm:~/MyProject$ git status
On branch master
Your branch is up-to-date with 'origin/master'.
Untracked files:
  (use "git add <file>..." to include in what will be committed)

        src/main/scripts/example_hello_script.py

nothing added to commit but untracked files present (use "git add" to track)
```

Add it to Git (make sure it's tracked) with:

```shell
(env) andrew@ubuntuvm:~/MyProject$ git add src/main/scripts/example_hello_script.py
```

(Note that we can't use our soft links here to make this command shorter.) Commit our changes to the local repository with

```shell
(env) andrew@ubuntuvm:~/MyProject$ git commit -am "new hello script"
```

...and push them to the remote one with

```shell
(env) andrew@ubuntuvm:~/MyProject$ git push
```

We can see that this commit has been pushed to the remote repo (there are now two commits instead of one):

![](https://thepracticaldev.s3.amazonaws.com/i/9nlaep3840vyy4pnimxh.PNG)

# Conclusion

And that's it. Hopefully this guide has helped you to avoid some of the missteps that I made in getting my PyBuilder/Git project up and running.

All the code from this post is available at [awwsmm.com/PybGit](https://github.com/awwsmm/PybGit).
