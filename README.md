# Interaction Framework (IxF)

Version:  1.1.4

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

## jQuery Plugins Used in IxF

The ixf-plugins.js file that is built contains several jQuery plugins (located in build/scripts/lib and
build/scripts/3plib).  It is likely that a project that uses IxF will not use all of these plugins.
Therefore, you may decide to create a custom ixf-plugins.js file that only contains those plugins your
project will need.  Below are the plugins that are included in ixf-plugins.js:

### IxF Plugins
* jquery.ixf.fillHeight.js (1.0.2) - Take up all available space that the other siblings are not taking up
* jquery.ixf.finder.js (1.2.3) - Mimics the OS X finder--a different way to look at a tree view
* jquery.ixf.fixHeader.js (1.4) - Fixes the header at the top of the page/scrollable element when it reaches the top. Scrolls of page with the end of the table.  Uses caret.
* jquery.ixf.fixSelect.js (1.1.3) - Style the select box across browsers
* jquery.ixf.makeVisible.js (1.0.5) - Scrolls the target element into view when out of the screen (above or below), doesn't scroll if it is onscreen. Uses scrollTo.
* jquery.ixf.masterDetail.js (1.2.4) - Master/Detail.  Depends on makeVisible, bbq, hashchange
* jquery.ixf.multiSelect.js (2.0.7) - Takes a multiple select element and breaks it into individual selects
* jquery.ixf.timePicker.js (1.5) - Time Picker
* jquery.ixf.watermark.js (1.8.6) - Adds watermark for text field hints

### 3rd Party Plugins
* jquery.ariatabs.js (31.01.11) - Used by IxF Tabs
* jquery.bbq.js (1.2.1) - Back Button & Query Library.  Used by ixf.masterDetail.
* jquery.caret.js (0.9) - Put the cursor back to where it was in the previous field.  Used by ixf.fixHeader.
* jquery.dataTables.js (1.9.0) - Used by IxF Tables
* jquery.hashchange.js (1.2) - Hash change events.  Used by ixf.masterDetail.
* jquery.jTouchScroll.js (1.0) - Scroll different parts of the screen in iPhone/iPad/iPod Safari without moving the rest.
* jquery.layout.js (1.3.0) - Used by IxF Layouts
* jquery.qtip.js (2.0.0pre) - Used by IxF Popups
* jquery.scrollTo.js (1.4.2) - Easy element scrolling. Used by ixf.makeVisible.

## Building IxF

* Install [Node.js](http://nodejs.org/).
* Check out the master branch of IxF from github.
* Look at build/build.js and make sure you understand what the build does.  It concatenates the files (except jquery.js and jquery-ui.js) from build/scripts/*lib into build/scripts/ixf-plugins.js.  It compresses build/scripts/ixf-utilities.js and build/scripts/ixf-plugins.js into build/scripts/ixf-*.min.js.  It copies build/scripts/*.js, build/scripts/3plib/jquery*.min.js, build/styles/*, and build/images/* to ixf/*.  It creates a downloads/ixf-kickstart*.zip file containing build/kickstart/* and ixf/*.
* If you are doing a new release, modify the versionNumber in build/build.js (line 8).
* In a terminal or command prompt, cd to the build directory.
* Run "node build.js".
* Notice that the ixf directory is updated and the downloads/ixf-kickstart*.zip file has been generated.
* Merge the changes in the ixf directory from the "master" branch to the "gh-pages" branch so that the website will use the latest build.

## Running the IxF Website Locally

*  Install [Jekkyl](https://github.com/mojombo/jekyll/wiki/install)
	* **Note for Macs** - If you have the version of Xcode from the Mac App Store, you may need to install the gcc compiler separately before you will be able to install jekyll. The [standalone gcc compiler](https://github.com/kennethreitz/osx-gcc-installer) is available on github.
	* **Note for Windows** - To install ruby, go to [rubyinstaller.org](http://rubyinstaller.org/downloads/) and download/install the latest rubyinstaller-*.exe AND DevKit-*.exe.  Follow the [install instructions](http://github.com/oneclick/rubyinstaller/wiki/Development-Kit) for the DevKit.
*  In a terminal or command prompt, change to the directory where your IxF repo is installed.
*  Run "jekyll --server" command.
*  Open a browser window to http://localhost:4000

## Updating Documentation

* Commit changes to the "gh-pages" branch.
* When a new version of IxF is released, update index.html, intro/changelog.html, and intro/kickstart.html.
* Merge changes in the ixf directory from the "master" branch to the "gh-pages" branch.

