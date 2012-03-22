# Interaction Framework (IxF)

Version:  1.1.2

IxF is an open web framework used to quickly build out web application interfaces by having a good and consistent style, commonly used widgets, and an easy way to implement those widgets right out of the box. The goal of IxF is to make development and prototyping faster, to ensure best practices in UI design, and to ultimately make the user experience better.

## Documentation & Demo

The [IxF website] (http://irinc.github.com/ixf) uses IxF to demo and document the functionality.

## Getting Started

Start using IxF in a project by downloading the [KickStart] (http://irinc.github.com/ixf/intro/kickstart.html).

## Sample Code

	&lt;!-- BEGIN IXF ASSETS --&gt;
  &lt;link rel=&quot;stylesheet&quot; type=&quot;text/css&quot; media=&quot;all&quot; href=&quot;ixf/styles/screen.css&quot; /&gt;
  &lt;!--[if lte IE 7]&gt;
  &lt;link rel=&quot;stylesheet&quot; type=&quot;text/css&quot; media=&quot;all&quot; href=&quot;ixf/styles/screen-ie.css&quot;/&gt;
  &lt;![endif]--&gt;
  &lt;script type=&quot;text/javascript&quot; src=&quot;ixf/scripts/jquery.min.js&quot;&gt;&lt;/script&gt;
  &lt;script type=&quot;text/javascript&quot; src=&quot;ixf/scripts/jquery-ui.min.js&quot;&gt;&lt;/script&gt;
  &lt;script type=&quot;text/javascript&quot; src=&quot;ixf/scripts/ixf-plugins.min.js&quot;&gt;&lt;/script&gt;
  &lt;script type=&quot;text/javascript&quot; src=&quot;ixf/scripts/ixf-utilities.min.js&quot;&gt;&lt;/script&gt;
  &lt;!-- END IXF ASSETS --&gt;

## Building IxF

* Install [Node.js] (http://nodejs.org/ Node.js)
* Check out IxF from github
* In a terminal or command prompt, cd to the build directory
* Run "node build.js"
* Notice that the ixf directory is updated and the downloads/ixf-kickstart*.zip file has been generated.

