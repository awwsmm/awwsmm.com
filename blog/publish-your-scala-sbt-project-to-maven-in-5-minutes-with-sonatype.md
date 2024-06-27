---
title: 'Publish your Scala sbt Project to Maven in 5 Minutes with Sonatype'
description: 'Quickly and Easily Publish Your Scala Code for Use in Other Projects'
published: '2021-07-13'
tags: ['scala']
---

## Intro

Say what you will about JavaScript, but [npm](https://www.npmjs.com/) has made it incredibly easy for anyone to publish code. In just a few clicks, you can share a library to make others' lives easier, or publish a little snippet like [`left-pad`](https://qz.com/646467/how-one-programmer-broke-the-internet-by-deleting-a-tiny-piece-of-code/) to cause endless headaches.

Java has long had the [Maven repository](https://mvnrepository.com/) (and accompanying build tool of the same name), which serves a similar purpose: sharing packaged code.

But it can be intimidating for a newbie to publish to Maven -- that's where Sonatype comes in.

Sonatype, Inc.'s [Central Repository](https://central.sonatype.org/) (a complement to Apache's Maven repository) makes it super easy to share code. With just a few lines and a few manual steps, you can publish your package to Maven, and others can easily import it and use it.

sbt's [Using Sonatype](https://www.scala-sbt.org/release/docs/Using-Sonatype.html) guide and Sonatype's [Deployment Guide](https://central.sonatype.org/publish/publish-guide/) cover probably 95% of what you need to know for this process, but there are a few _gotchas_ that I'll highlight below using the ❗ exclamation point emoji.

> Note: this guide assumes that your source code is hosted in a GitHub or GitLab repository.

## Steps

### 1. Create a Sonatype Jira issue

Sonatype syncs with Maven, and so to publish to Maven, you can publish via Sonatype. To do so, you'll need a Sonatype Jira account to create an issue. Do that by [clicking here to create an account](https://issues.sonatype.org/secure/Signup!default.jspa) and then [clicking here to create a Jira issue](https://issues.sonatype.org/secure/CreateIssue.jspa?issuetype=21&pid=10134).

As an example, [here is the ticket I opened](https://issues.sonatype.org/browse/OSSRH-71079) to publish a project of mine to Maven. If you want to publish multiple packages to Maven using Sonatype, you'll need to create multiple Jira tickets, but you only need the one user account.

The fields in the Jira are easy to fill out:

#### Summary

This should include the name of the project. In my case, I'm publishing a small project hosted at https://github.com/awwsmm/zepto, so I've included the name "zepto" in the Jira summary.

#### Group Id

If your project is hosted on GitHub, this should be something like `io.github.awwsmm`, or similar for your GitHub username. See [this guide](https://central.sonatype.org/publish/requirements/coordinates/) for more information on package coordinates.

> ❗ **GOTCHA:** this should _not_ be something like `com.github.awwsmm`. `com.github` coordinates are no longer supported. It _can_ be your personal website, like `com.awwsmm`, but [a bot will comment on your Jira asking you to add a DNS record to prove that you own that website, like here on another one of my Jiras](https://issues.sonatype.org/browse/OSSRH-95101).

#### Project URL

This is where users can go on the web to find information about your project. For me, that's `https://github.com/awwsmm/zepto`, but it could be a `github.io` page or a page on your personal website, or whatever.

#### SCM url

This is the URL that your source code is hosted at. For me, that's `https://github.com/awwsmm/zepto.git`.

### 2. Generate and distribute a PGP key

#### On macOS

On macOS, I recommend that you use https://gpgtools.org/ to create and distribute your PGP key. Simply download the installer and follow the instructions there.

To run `sbt publishSigned` later in this guide, you will also need `gpg2` and `pinentry` installed. You can get those on macOS via `brew` with

```bash
$ brew install gpg2
$ brew install pinentry-mac
```

Note that you need `gpg2` here, not `gpg`. You should [check if you have both installed and `brew uninstall gpg` if it exists](https://stackoverflow.com/a/45932796/2925434)

```bash
$ which gpg gpg2
```

Once you've done that, check that `gpg-agent` is correctly configured, and restart it by `--kill`ing it, per [these instructions](https://superuser.com/a/1628810/728488).

#### On Linux

We'll use a [PGP key](https://en.wikipedia.org/wiki/Pretty_Good_Privacy) to sign this package, so users can be confident that you are the person who created it. To do this, you can mostly follow the instructions from [scala-sbt.org](https://www.scala-sbt.org/release/docs/Using-Sonatype.html)...

Install [GnuPG](https://www.gnupg.org/download/) (on macOS, you can do this via `brew install gnupg`) and verify that it's installed by checking the version

```bash
$ gpg --version
gpg (GnuPG) 2.3.1
...
```

Next, generate a key...

```bash
$ gpg --gen-key
```

...list your keys...

```bash
$ gpg --list-keys
gpg: checking the trustdb
gpg: marginals needed: 3  completes needed: 1  trust model: pgp
gpg: depth: 0  valid:   1  signed:   0  trust: 0-, 0q, 0n, 0m, 0f, 1u
gpg: next trustdb check due at 2023-07-11
/Users/andrew.watson/.gnupg/pubring.kbx
---------------------------------------
pub   ed25519 2021-07-11 [SC] [expires: 2023-07-11]
      1234517530FB96F147C6A146A326F592D39AAAAA
uid           [ultimate] Andrew Watson <my@email.com>
sub   cv25519 2021-07-11 [E] [expires: 2023-07-11]
```

...and distribute the key to some GPG keyserver, like

```bash
$ gpg --keyserver keyserver.ubuntu.com --send-keys 
1234517530FB96F147C6A146A326F592D39AAAAA
gpg: sending key A326F592D39AAAAA to hkp://keyserver.ubuntu.com
```

> ❗ **GOTCHA:** If you get an error like `keyserver send failed: No name` from the command above, it means the keyserver you're trying to send to is no longer active. [You can instead use any other major GPG keyserver](https://stackoverflow.com/a/68132500/2925434), like the Ubuntu one I used above.

[Leonard notes here](https://leonard.io/blog/2017/01/an-in-depth-guide-to-deploying-to-maven-central/) that synchronising these keys around the various keyservers can take some time, but for me it worked almost instantly.

Once you publish your key, you can check that it's visible on the public keyservers by searching for it here: https://keys.openpgp.org/.

### 3. Enable `sbt-pgp`

[As outlined here](https://www.scala-sbt.org/release/docs/Using-Sonatype.html), you'll next want to add the `sbt-pgp` plugin to your project. You can add it to your project's `plugin.sbt` file, or you can add it to `~/.sbt/1.0/plugins/gpg.sbt` to enable it for all sbt projects. The line you should add is

```scala
addSbtPlugin("com.github.sbt" % "sbt-pgp" % "2.2.1")
```

The latest version of this plugin can be found [at the GitHub page for the project](https://github.com/sbt/sbt-pgp).

### 4. Add your Sonatype credentials to your project

Next, add your credentials to your project by following the instructions in [Step 3](https://www.scala-sbt.org/release/docs/Using-Sonatype.html) here. I'll reproduce them to be clear...

Create a file at

```bash
$HOME/.sbt/1.0/sonatype.sbt
```

And add the following line to it

```scala
credentials += Credentials(Path.userHome / ".sbt" / "sonatype_credentials")
```

Then, create the credentials file at

```bash
~/.sbt/sonatype_credentials
```

Add the following information to that file

```
realm=Sonatype Nexus Repository Manager
host=s01.oss.sonatype.org
user=<your username>
password=<your password>
```

The `user` and `password` here are the same username and password you used when creating your account on Sonatype's Jira server in Step 1. You don't need to worry about putting anything in quotes here -- spaces are fine. But...

> ❗ **GOTCHA:** ...be careful! Some older guides say to set `host=oss.sonatype.org`, but this has recently changed to `host=s01.oss.sonatype.org`. More information about this change [can be found here](https://central.sonatype.org/publish/release/).

### 5. Set up your `publish.sbt`

The penultimate step in this process is to configure your project for publishing, by adding a bunch of information to either your project's `build.sbt` (or, as I recommend) `publish.sbt` file.

Replace `username` with your GitHub / GitLab username below, `project` with the name of the project (in my case, these are `awwsmm` and `zepto`, respectively), and all the other obvious fill-in bits, and paste it into a `publish.sbt` file at the root of your project

```scala
ThisBuild / organization := "io.github.username"
ThisBuild / organizationName := "username"
ThisBuild / organizationHomepage := Some(url("https://www.yourwebsite.com"))

ThisBuild / scmInfo := Some(
  ScmInfo(
    url("https://github.com/username/project"),
    "scm:git@github.username/project.git"
  )
)

ThisBuild / developers := List(
  Developer(
    id    = "username",
    name  = "Your Name Goes Here",
    email = "youremail@address.com",
    url   = url("https://www.yourwebsite.com")
  )
)

ThisBuild / description := "Describe your project here..."
ThisBuild / licenses := List("The Unlicense" -> new URL("https://unlicense.org/"))
ThisBuild / homepage := Some(url("https://github.com/username/project"))

// Remove all additional repository other than Maven Central from POM
ThisBuild / pomIncludeRepository := { _ => false }

ThisBuild / publishTo := {
  val nexus = "https://s01.oss.sonatype.org/"
  if (isSnapshot.value) Some("snapshots" at nexus + "content/repositories/snapshots")
  else Some("releases" at nexus + "service/local/staging/deploy/maven2")
}

ThisBuild / publishMavenStyle := true

ThisBuild / versionScheme := Some("early-semver")
```

You can set the `licenses` to whatever you feel is appropriate. Here is GitHub's guide to [choosing a license for your repo](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/creating-a-repository-on-github/licensing-a-repository) -- though be aware that they [probably ignore it](https://news.ycombinator.com/item?id=27736650) anyway.

> ❗ **GOTCHA:** Notice that we've also used `s01.oss.sonatype.org` above!

### 6. Publish!

Once you've got all of that set up, you should be able to publish your project from the `sbt` shell with the `publishSigned` command

```scala
sbt> publishSigned
```

On macOS, this should open up the GPGTools UI, where you can enter the password you associated with your PGP key. The output will then look something like

```bash
[info] Wrote /local/path/to/zepto_2.13-0.4.0.pom
[info] 	published zepto_2.13 to https://s01.oss.sonatype.org/service/local/staging/deploy/maven2/io/github/awwsmm/zepto_2.13/0.4.0/zepto_2.13-0.4.0-sources.jar
[info] 	published zepto_2.13 to https://s01.oss.sonatype.org/service/local/staging/deploy/maven2/io/github/awwsmm/zepto_2.13/0.4.0/zepto_2.13-0.4.0-javadoc.jar
[info] 	published zepto_2.13 to https://s01.oss.sonatype.org/service/local/staging/deploy/maven2/io/github/awwsmm/zepto_2.13/0.4.0/zepto_2.13-0.4.0-javadoc.jar.asc
...
```

You can use your Sonatype username and password to log in to https://s01.oss.sonatype.org/ where you should now see your (pre-release) project!

Note that if you try to click on one of the `.jar` links above, you may get an error like

```
Staging of Repository within profile ID='...' is not yet started!
```

You can [follow along with Sonatype's guide here](https://central.sonatype.org/publish/release/) to release the artifacts to the public.

![Screenshot of my pre-release project listed in my account on sonatype.org](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ue4pc8kh7bmewm41qndl.png)

Select the project, click `Close` from the menu, and then `Release`. You should see your project [on Maven](https://repo1.maven.org/maven2/io/github/awwsmm/zepto_2.13/0.4.0/) almost immediately, though it will take a few hours to show up [in the search engine](https://search.maven.org/artifact/io.github.awwsmm/zepto_2.13).

...and that's it!

You should now be able to import your published library into other projects by adding

```
"io.github.awwsmm" %% "zepto" % "0.4.0"
```

(or whatever is appropriate) to the `libraryDependencies` in the `build.sbt` of another project.