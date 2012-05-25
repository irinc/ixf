# Interaction Framework (IxF)

Version:  1.1.3

IxF is an open web framework used to quickly build out web application 
interfaces by having a good and consistent style, commonly used widgets, 
and an easy way to implement those widgets right out of the box. The goal 
of IxF is to make development and prototyping faster, to ensure best 
practices in UI design, and to ultimately make the user experience better.

## Start Using IxF

Start using IxF in a project by downloading the [KickStart](http://irinc.github.com/ixf/intro/kickstart.html).  
Notice that the HTML tags have specific classes 

## Documentation & Demo

The [IxF website](http://irinc.github.com/ixf) uses IxF to demo and document the functionality.

## Repo Organization

The build directory contains all of the source code and build script for IxF.  All other 
directories and files (other than README.md, LICENSE, and NOTICE files) 
are for the website/demo.

## Building IxF

* Install [Node.js](http://nodejs.org/).
* Check out the master branch of IxF from github.
* Look at build/build.js and make sure you understand what the build does.  It concatenates the files (except jquery.js and jquery-ui.js) in build/scripts/*lib into build/scripts/ixf-plugins.js.  It compresses build/scripts/ixf-utilities.js and build/scripts/ixf-plugins.js into build/scripts/ixf-*.min.js.  It copies build/scripts/*.js, build/scripts/3plib/jquery*.min.js, build/styles/*, and build/images/* to ixf/*.  It creates a downloads/ixf-kickstart*.zip file containing build/kickstart/* and ixf/*.
* If you are doing a new release, modify the versionNumber in build/build.js (line 8).
* In a terminal or command prompt, cd to the build directory.
* Run "node build.js".
* Notice that the ixf directory is updated and the downloads/ixf-kickstart*.zip file has been generated.
* Merge the changes in the ixf directory from the "master" branch to the "gh-pages" branch so that the website will use the latest build.

## Running the IxF Website Locally

*  Install [Jekkyl](https://github.com/mojombo/jekyll/wiki/install)
	* **Note for Macs** - If you have the version of Xcode from the Mac App Store, you may need to install the gcc compiler separately before you will be able to install jekyll. The [standalone gcc compiler](https://github.com/kennethreitz/osx-gcc-installer) is available on github.
*  In a terminal or command prompt, change to the directory where your IxF repo is installed.
*  Run "jekyll --server" command.
*  Open a browser window to http://localhost:4000

## Updating Documentation

* Commit changes to the "gh-pages" branch.
* When a new version of IxF is released, update index.html, intro/changelog.html, and intro/kickstart.html.
* Merge changes in the ixf directory from the "master" branch to the "gh-pages" branch.

