# Interaction Framework (IxF)

Version:  1.1.3

IxF is an open web framework used to quickly build out web application interfaces by having a good and consistent style, commonly used widgets, and an easy way to implement those widgets right out of the box. The goal of IxF is to make development and prototyping faster, to ensure best practices in UI design, and to ultimately make the user experience better.

## Documentation & Demo

The [IxF website](http://irinc.github.com/ixf) uses IxF to demo and document the functionality.

## Getting Started

Start using IxF in a project by downloading the [KickStart](http://irinc.github.com/ixf/intro/kickstart.html).

## Building IxF

* Install [Node.js](http://nodejs.org/).
* Check out the master branch of IxF from github.
* Modify the versionNumber in build/build.js (line 8).
* In a terminal or command prompt, cd to the build directory.
* Run "node build.js".
* Notice that the ixf directory is updated and the downloads/ixf-kickstart*.zip file has been generated.
* Merge the changes in the ixf directory from the "master" branch to the "gh-pages" branch so that the website will use the latest build.

## Updating Documentation

* Commit changes to the "gh-pages" branch.
* When a new version of IxF is released, update index.html, intro/changelog.html, and intro/kickstart.html.
* Merge changes in the ixf directory from the "master" branch to the "gh-pages" branch.

