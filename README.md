# Interaction Framework (IxF)

Version:  1.1.2

IxF is an open web framework used to quickly build out web application interfaces by having a good and consistent style, commonly used widgets, and an easy way to implement those widgets right out of the box. The goal of IxF is to make development and prototyping faster, to ensure best practices in UI design, and to ultimately make the user experience better.

## Documentation & Demo

The [IxF website] (http://irinc.github.com/ixf) uses IxF to demo and document the functionality.

## Getting Started

Start using IxF in a project by downloading the [KickStart] (http://irinc.github.com/ixf/intro/kickstart.html).

## Sample Code

```html
<!-- BEGIN IXF ASSETS -->
<link rel="stylesheet" type="text/css" media="all" href="ixf/styles/screen.css" />
<!--[if lte IE 7]>
<link rel="stylesheet" type="text/css" media="all" href="ixf/styles/screen-ie.css"/>
<![endif]-->
<script type="text/javascript" src="ixf/scripts/jquery.min.js"></script>
<script type="text/javascript" src="ixf/scripts/jquery-ui.min.js"></script>
<script type="text/javascript" src="ixf/scripts/ixf-plugins.min.js"></script>
<script type="text/javascript" src="ixf/scripts/ixf-utilities.min.js"></script>
<!-- END IXF ASSETS -->
```
## Building IxF

* Install [Node.js] (http://nodejs.org/ Node.js)
* Check out IxF from github
* In a terminal or command prompt, cd to the build directory
* Run "node build.js"
* Notice that the ixf directory is updated and the downloads/ixf-kickstart*.zip file has been generated.

