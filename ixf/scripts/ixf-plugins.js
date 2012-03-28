/*!
 * IxF Plugins 
 * @description This file is a collection of jquery plugins and modernizr used by IxF.
 * @version     1.1.3 - 2012/3/28
 * @copyright   Copyright © 2012 by Intellectual Reserve, Inc.
 * @URL         http://irinc.github.com/ixf
 * global       ixf, $, window
 */

var ixf = ixf || {};

/*!
 * fixSelect
 * @description	Allows us to style the select box across browsers
 * @version     1.1.3 - 2011/8/11
 * @copyright   Intellectual Reserve, Inc.
 * @URL         http://irinc.github.com/ixf
 * @requires    ui.core.js (1.8+)
 */
(function($) {
	$.widget("ixf.fixSelect", {
		options: {
			selectClass:"select",
			arrowSpanClass:"arrow",
			textSpanClass:"text",
			hoverClass:"hover",
			focusClass:"focus",
			activeClass:"active",
			disabledClass:"disabled",
			padding:0,
			wrapperTag:"span",
			deriveWidth:false
		},
		_create: function(foo) {
			var opts = this.options, elem = this.element, self = this,
				outerWrapper = $('<'+opts.wrapperTag+' />'),
				spanTag = $('<span class="'+opts.textSpanClass+'" />'),
				arrowSpanTag = $('<span class="'+opts.arrowSpanClass+'" />'),
				selected = elem.find(":selected:first"),
				activeClass = opts.activeClass,
				hoverClass = opts.hoverClass,
				focusClass = opts.focusClass,
				widgetName = self.widgetName;
				// selects are often cloned which causes the inner select to get fixed yet again. Lets see if this select has been fixed before, if so kill it so we can reapply
				if(elem.parent("."+opts.selectClass).length){
					elem.fixSelect("destroy");
				}
			opts.spanTag = spanTag;
			opts.arrowSpanTag = arrowSpanTag;
			
			if(elem.is("[multiple]")){ return; }
			/* removed the following, not sure why it was there to start -  !elem.is(":visible") || */
			outerWrapper.addClass(opts.selectClass).css({
				position:"relative"
			});

			if(opts.useID){
				outerWrapper.attr("id", opts.idPrefix+"-"+elem.attr("id"));
			}

			if(selected.length === 0){
				selected = elem.find("option:first");
			}
			self.updateSpanTag(spanTag,selected.text());

			elem.css('opacity', .001); /* .001 intead of 0 is a hack for testing tools like selenium. They require opacity to not be 0. This meets that, but doesn't appear to be displayed at all. No color shift even. */
			elem.wrap(outerWrapper);
			elem.before(spanTag);
			elem.before(arrowSpanTag);

			//redefine variables - needs the var to work correctly for some reason
			var outerWrapper = elem.parent("span");
			var spanTag = elem.siblings("span."+opts.textSpanClass);
			arrowSpanTag = elem.siblings("span."+opts.arrowSpanClass);
			
			self.updateWidths();
			
			elem.css({
				position:"absolute",
				top:0,
				left:0
			});
			
			// there is a chance that the select we are fixing is hidden and so has no dimensions. so for this first width setting if it's not visible, then clone a copy to the body and get it's dimensions. this is totally hackish, but there isn't much we can do
			if(!elem.is(":visible") && !opts.deriveWidth){
				var padding = parseInt(outerWrapper.css("padding-left"),10) + parseInt(outerWrapper.css("padding-right"),10),
					temp = outerWrapper.clone(),newW;
				temp.css({
					position:"absolute",
					top:"-1000em"
				}).appendTo("body");
				
				newW = temp.find("select").outerWidth() - padding;
				
				outerWrapper.css({
					width:newW
				});
				opts.spanTag.css({
					width:newW
				});
				temp.remove();
			}
			
			elem.css('opacity', .001);

			elem
				.bind("change."+widgetName,function() {
					self.updateSpanTag(spanTag,elem.find(":selected").text());
					outerWrapper.removeClass(opts.activeClass);
					if(opts.deriveWidth){
						self.updateWidths(true);
					}
				})
				.bind("focus."+widgetName,function() {
					outerWrapper.addClass(focusClass);
				})
				.bind("blur."+widgetName,function() {
					outerWrapper.removeClass(focusClass);
					outerWrapper.removeClass(activeClass);
				})
				.bind("mousedown."+widgetName,function() {
					outerWrapper.addClass(activeClass);
				})
				.bind("mouseup."+widgetName,function() {
					outerWrapper.removeClass(activeClass);
				})
				.bind("click."+widgetName,function(e){
					outerWrapper.removeClass(activeClass);
				})
				.bind("mouseover."+widgetName,function() {
					outerWrapper.addClass(hoverClass);
				})
				.bind("mouseout."+widgetName,function() {
					outerWrapper.removeClass(hoverClass);
				})
				.bind("keyup."+widgetName,function(){
					self.updateSpanTag(spanTag,elem.find(":selected").text());
				});
			//handle disabled state
			if($(elem).attr("disabled")){
				outerWrapper.addClass(opts.disabledClass);
			}
			//handle readonly state
			if($(elem).attr("readonly")){
				self.readonly("true");
			}
			self.updateWidths();
		},
		disable: function(){
			this.element.parent("span").addClass(this.options.disabledClass);
		},
		enable: function(){
			this.element.parent("span").removeClass(this.options.disabledClass);
		},
		readonly: function(is){
			this.options.readonly = is||true;
		},
		destroy: function() {
			$.Widget.prototype.destroy.apply(this, arguments); // call the default stuff
			var elem = this.element;
			// NEED TO BUILD THIS OUT!
			elem.parent().find("span").remove();
			elem.unwrap()
				.css({
					opacity:"",
					position:"",
					top:"",
					left:""
				})
				.unbind("."+this.widgetName);
		},
		updateWidths: function(skipChange){
			var elem = this.element, opts = this.options, 
				outerWrapper = elem.parent(opts.wrapperTag);
			if(!skipChange){
				elem.trigger("change."+this.widgetName);
			}
			if(elem.is(":visible")){
				if(!opts.deriveWidth){
					outerWrapper.css({
						width:elem.outerWidth() - (outerWrapper.outerWidth() - outerWrapper.width())+parseInt(opts.padding,10)
					});
					opts.spanTag.css({
						width:outerWrapper.width()
					});
				} else {
					// deriveWidth == true so make the select match the span
					// console.debug(outerWrapper,outerWrapper.outerWidth());
					elem.css({
						width:outerWrapper.outerWidth(),
						height:outerWrapper.outerHeight(),
						position:"absolute",
						top:0,
						left:0
					});
				}
			}
		},
		updateSpanTag:function(spanTag,selected){
			if(selected){
				spanTag.text(selected);
			} else {
				spanTag.html("&nbsp;");
			}
		}
	});

	$.extend($.ixf.fixSelect, {
		version: "1.1.3"
	});

	})(jQuery);
/*!
 * fillHeight
 * @description	allows one of X siblings to take up all available space that the other siblings are not taking up.
 * @version     1.0 beta 2  - 2010/10/08
 * @copyright   Intellectual Reserve, Inc.
 * @URL         http://irinc.github.com/ixf
 * @requires	  ui.core.js (1.8+)
 * @Notes		    call it on the element you want to fill the height. Requires the immediate parent to have a height set. It's expected (but not required) that the target element has an overflow:auto or something to allow scrolling if needed for excess content.
 */
(function($) {
	$.widget("ixf.fillHeight", {
		options: {
			autoUpdate: false
		},
		_create: function() {
			var opts = this.options,
				elem = this.element;
		
			if(opts.autoUpdate){
				$(window).bind("resize.fillHeight",function(){
					setTimeout(function(){
						elem.fillHeight("setHeight");
					},10);	
				});
			}
			this.setHeight();
		},
		setHeight:function(){
			var elem = this.element,
				sibHeight = 0;
			elem.siblings(":visible").each(function(){
				sibHeight += $(this).outerHeight(true);
			});
			elem.height(elem.parent().height() - sibHeight-1);
			this._trigger("resize", 0, this);
		},
		destroy: function() {
			$.Widget.prototype.destroy.apply(this, arguments); // call the default stuff
			$(window).unbind("resize.fillHeight");
		}
	});

	$.extend($.ixf.fillHeight, {
		version: "1.0 beta 2"
	});
})(jQuery);
/*!
 * fixHeader
 * @description	Fixes the header at the top of the page/scrollable element when it reaches the top. Scrolls of page with the end of the table.
 * @version		1.4  - 2011/04/11
 * @copyright   Intellectual Reserve, Inc.
 * @URL         http://irinc.github.com/ixf
 * @requires	ui.core.js (1.8+)
 * @optional	jCaret (http://plugins.jquery.com/project/jCaret)
 */
(function($) {
	$.widget("ixf.fixHeader", {
		options: {
			classFilter: /margin\-bottom\-\w+/,
			removeID:true,
			cloneBuffer:100
		},
		_create: function() {
			var opts = this.options, self = this, elem = this.element,
				widgetName = self.widgetName,appendHere;

			opts.uniqueID = Math.floor(Math.random()*99999);
			
			if(!elem.find("tbody").length){
				// no tbody so this is likely a previous clone of the table to do the fixHeader, so don't go on
				return false;
			}
			// this is to do a "fixed" header for a table (for now, could expand to other elements in the future)
			// where to put it. Check if we are in a scrollable div, if so, append to that. If not, append to body.
			opts.container = $(window); // the default if we aren't in a scrollable element
			appendHere = $("body");
			elem.parents().each(function(){
				if(($(this).css("overflow") === "scroll" || $(this).css("overflow") === "auto" || $(this).css("overflowY") === "scroll" || $(this).css("overflowY") === "auto") && !opts.inScrollable && !$(this).is("body")){ // body has overflow auto, so need to check for that as well
					// this one is scrollable, so save it off
					opts.container = $(this);
					appendHere = opts.container;
					opts.inScrollable = true;
					return false; // break out of the loop so we don't keep looking higher
				}
			});
			// create the wrapper
			opts.copy = $('<div class="fixed-head"><p class="invisible">You can safely ignore the following table</p></div>');
			appendHere.append(opts.copy);

			opts.container.bind("scroll.fixHead"+opts.uniqueID,function(){
				// console.debug(self.getHeadLocation());
				self.update();
			});
			$(window).bind("resize.fixHead"+opts.uniqueID,function(){
				self.update();
			});
			// we removed setting up the clone by default. now we check to see if the thead in the table is in a position to require the clone, if it is, then we create the clone then. Offloads some startup time.
			
			// but we still need to set some stuff up on the original thead and fields
			// track focus of cursor
			$("thead input, thead select",elem).bind("focus."+widgetName,function(event){
				opts.lastCol = $(this).closest("td").index();
				self.getCaret(this);
			}).bind("click."+widgetName,function(){
				self.getCaret(this);
			}).bind("blur."+widgetName,function(){
				opts.lastCol = undefined;
			});
			
			// set keyup on the original fields to copy their vals to the clone
			$("thead input",elem).bind("keyup."+widgetName,function(event){
				var index = $("thead input",elem).index($(this));
				if(!opts.copyVisible && opts.cloneMade){ // if copy is hidden then must be interacting with original, so copy the entered value to the copy
					$("thead input",opts.copy.find("table")).eq(index).val($(this).val());
				}
				
				self.getCaret(this);
			});
		},
		cloneThead: function(reClone){
			// console.debug("cloning thead",this.element);
			var opts = this.options, self = this, elem = this.element,
				newTable, tableCopy, headClone, theClone,
				widgetName = self.widgetName,
				theadSelect = "thead select"; // for compression
			
			// if the clone doesn't already exist, check to see if it is required
			if(!opts.cloneMade && self.shouldCloneBeVisible(opts.cloneBuffer)){
				// console.debug("adding table");
				newTable = $('<table></table>').attr("class",elem.attr("class")).addClass("fixHeaderApplied");
				headClone = elem.find("thead").clone(false);
				theClone = newTable.append(headClone);
				opts.copy.append(theClone);
				opts.cloneMade = true;
			}
			
			tableCopy = opts.copy.find("table");
			if(!tableCopy.length){ // no table available, so don't move on
				return;
			}
			
			// tableCopy.find("tbody").remove();
			
			// somehow the wrapper gets copied or inserted (can't figue out where or how), so remove it
			// after new way of setting up table, I don't think this occurs anymore, commenting out for now
			// opts.copy.find(".dataTables_wrapper").remove();
			
			if(!opts.headSetup || reClone){ // only clone stuff once
				/* Remove any children the cloned table has */
				tableCopy.children().remove();
			
				/* Clone the DataTables header */
				headClone = $('thead', elem).clone(false);
				tableCopy.append( headClone );
				
				// see if ther are any margin-bottom-* classes and remove them
				var margins = tableCopy.attr("class").match(opts.classFilter);
				if(margins){
					tableCopy.removeClass(margins[0]);
				}
				
				// headClone.find("input").unbind("keyup"); // don't think this is needed as this is what the next line does
				// now setup the keyups on inputs in the clone to update the original
				$("thead input",tableCopy).unbind("keyup").bind("keyup",function(event){
					if(opts.copyVisible){ // copy is shown so copy back to the original and trigger the keyup event there in case anything fancy is supposed to happen (like the column filtering)
						var index = $("thead input",tableCopy).index($(this));
						// bind this input to the equivelent input on the original table
						$("thead input",elem).eq(index).val($(this).val()).trigger("keyup");
						self.getCaret(this);
					}

				});
			
				// now we need to setup the clicks for sorting
				$("thead th",tableCopy).unbind("click").bind("click",function(event){
					var index = $("thead th",tableCopy).index($(this));
					// bind this input to the equivelent input on the original table
					$("thead th",elem).eq(index).trigger("click");
					return false;
				});
				// set click on the original fields to update the copy
				$("thead th",elem).unbind("click."+widgetName).bind("click."+widgetName,function(event){
					self.cloneThead(true);
				});
				
				
				// now select boxes, we have to re-setup the fixSelect since it clones stuff attached to the original
				$(theadSelect,tableCopy).unbind("change").each(function(i){
					$(this).val($(theadSelect,elem).eq(i).val());
					if(ixf.fixSelectAllowed){
						$(this).fixSelect();
					}
				}).bind("change",function(event){
					var index = $(theadSelect,tableCopy).index($(this));
					// bind this input to the equivelent input on the original table
					$(theadSelect,elem).eq(index).val($(this).val()).trigger("change");
				});
				// set change on the original fields to update the copy
				$(theadSelect,elem).unbind("change."+widgetName).bind("change."+widgetName,function(event){
					var index = $(theadSelect,elem).index($(this));
					$(theadSelect,tableCopy).eq(index).val($(this).val()).trigger("keyup").each(function(){
						if(ixf.fixSelectAllowed){
							$(this).fixSelect("updateWidths");
						}
					});
				});
				
				// track focus of cursor
				$("thead input, thead select",tableCopy).unbind("focus."+widgetName).bind("focus."+widgetName,function(event){
					opts.lastCol = $(this).closest("td").index();
				});
			
				opts.headSetup = true;
			}
			
			/* Set the wrapper width to match that of the cloned table */
			opts.copy.width($(elem).outerWidth());

			/* Copy the widths across - apparently a clone isn't good enough for this */
			$("thead:eq(0)>tr th", elem).each( function (i) {
				$("thead:eq(0)>tr th:eq("+i+")", tableCopy)
					.width( $(this).width() )
					.removeClass().addClass($(this).attr("class"));
			} );
		
			$("thead:eq(0)>tr td", elem).each( function (i) {
				$("thead:eq(0)>tr td:eq("+i+")", tableCopy)
					.width( $(this).width() )
					.removeClass().addClass($(this).attr("class"));
			} );
			self.update(); // update position in case a container changed
		},
		getCaret:function(elem){
			var opts = this.options;
			if($.fn.caret){
				opts.cursorStart = $(elem).caret().start;
				opts.cursorEnd = $(elem).caret().end;
				// console.debug("getCaret",opts.cursorEnd);
			}
		},
		update: function(){
			// console.debug("update",this.element);
			var opts = this.options, self = this, elem = this.element,
				loc,
				copy = opts.copy;
			
			// make sure clone exists
			// console.debug(self.shouldCloneBeVisible());
			if(!opts.cloneMade && self.shouldCloneBeVisible(opts.cloneBuffer)){
				// console.debug("making clone!",elem);
				self.cloneThead();
				return; // cloneThead needs to call update, so lets not continue this thread as we will be back in just a second
			}
			
			if(self.shouldCloneBeVisible()){ // only do the display logic below if the clone should be visible in the first place
				if(elem.parents(".dataTables_wrapper").length){ // this is kind of hardcoded for use with the datatables plugin. Need to do a more generic check for a parent that has a position relative on it, but that is below the "container" element.
					elem = elem.parents(".dataTables_wrapper");
				}
				loc = self.getHeadLocation();
				if(loc.elemBottomYBuffer <= 0 && loc.elemBottomY > 0){ // the bottom of the table came onto the page (from the top), so show the clone
					// console.debug("slide it, going off top, or just coming in from top");
					if(copy.is(":hidden")){
						// console.debug("showing");
						copy.show();
						opts.copyVisible = true; // track visibility
					}
					if(copy.css("position") !== "absolute"){ // hopefully only do this once, the first time it gets transitioned to absolute
						self.setCursor(copy);
					}
					copy.css({
						position:"absolute",
						top:loc.elemBottomY - loc.copyHeight + opts.container.scrollTop(),
						left:loc.elemPosition.left
					});

				} else
				if (loc.elemBottomY <= 0){ // the bottom of the table went off the top of the page, so hide the clone
					// console.debug("hide clone, completely off the top");
					if(copy.is(":visible")){
						copy.hide();
						opts.copyVisible = false; // track visibility
						// self.setCursor(elem); // don't focus when everything goes off the screen, gets you into an endless loop :)
					}
					return;
				} else if(loc.elemPosition.top < 0){ // the top of the table went off the top of the page, so show the clone
					// console.debug("show clone as fixed (top of table is off top of screen)");
					if(copy.is(":hidden")){
						// console.debug("showing");
						copy.show();
						self.setCursor(copy);
						opts.copyVisible = true; // track visibility
					}
					if(copy.css("position") !== "fixed"){ // hopefully only do this once, the first time it gets transitioned to fixed
						self.setCursor(copy);
					}
					copy.css({
						position:"fixed",
						top:opts.inScrollable?opts.container.offset().top:0,
						left:elem.offset().left
					});
				}
			}else if(opts.cloneMade && copy.is(":visible")){ // first time hiding, or the top of the table came onto the page (from the top), or bottom fo the table went off the top of the page, so hide the clone
				copy.hide();
				// if bottom went off top we don't want to reset the cursor
				if(opts.scrollDir === "up"){
					self.setCursor(elem);
				}
				opts.copyVisible = false; // track visibility
			}
		},
		shouldCloneBeVisible:function(buffer){
			buffer = buffer || 0;
			
			var self = this,loc = self.getHeadLocation();
			// console.debug(loc.elemBottomYBuffer);
			if(loc.elemBottomYBuffer <= -buffer && loc.elemBottomY > -buffer){ // the bottom of the table came onto the page (from the top), so show the clone
				// console.debug("bottom came into view from top");
				// show clone
				return true;
			} else if (loc.elemBottomY <= 0){ // the bottom of the table went off the top of the page, so hide the clone
				return false;
			} else if(loc.elemPosition.top < buffer){ // the top of the table went off the top of the page, so show the clone
				return true;
			}
			return false;
		},
		getHeadLocation: function(){
			var opts = this.options, elem = this.element,pos,
				origHead = elem.find("thead"),
				loc = {},
				origElem = elem,newY,theScroll;
			
			// returns how far down we are scrolled
			if (window.innerHeight){
				  theScroll = window.pageYOffset;
			} else if (document.body){
				  theScroll = document.body.scrollTop;
			}
		
			
			if(elem.parents(".dataTables_wrapper").length){ // this is kind of hardcoded for use with the datatables plugin. Need to do a more generic check for a parent that has a position relative on it, but that is below the "container" element.
				elem = elem.parents(".dataTables_wrapper");
			}
			loc.elemPosition = opts.inScrollable?elem.position():elem.offset();

			if(!opts.inScrollable){
				loc.elemPosition.top = loc.elemPosition.top - theScroll;
			}		
			var viewportHeight = $(window).height(),
			viewportTopY = theScroll,
			viewportBottomY = viewportTopY + viewportHeight;

			loc.copyHeight = origHead.outerHeight();
			loc.elemBottomY = loc.elemPosition.top + origElem.height(); // have to use origElem to not get magrin from table
			loc.elemBottomYBuffer = loc.elemBottomY - loc.copyHeight;

			// determine a direction of travel
			newY = opts.container.scrollTop();
			opts.scrollDir = newY < opts.scrollY?"up":"down";
			// console.debug(opts.scrollDir,newY,opts.scrollY);
			opts.scrollY = newY;
			return loc;
		},
		setCursor: function(where){
			// console.debug("setCursor");
			var opts = this.options;
			if(opts.lastCol !== undefined){
				setTimeout(function(){ // need to give a few milliseconds for the clone to be put into place, else it will focus down at the bottom where it was originally
					var cur = $("td:eq("+opts.lastCol+")",where).find("input,select");
					// cur.focus();
					// console.debug("focus");
					if($.fn.caret && cur.is("input") && cur.is("input:visible")){ // if jCaret plugin is available
						// this gives us the ability to put the cursor back to where it was in the previous field.
						// console.debug("setting caret to ",opts.cursorStart,opts.cursorEnd);
						cur.caret({start:opts.cursorStart,end:opts.cursorEnd});
					}
				},10);
			}
		},
		destroy: function() {
			var opts = this.options;
			
			$.Widget.prototype.destroy.apply(this, arguments); // call the default stuff
			opts.copy.remove();
			opts.container.unbind("scroll.fixHead"+opts.uniqueID);
			$(window).unbind("resize.fixHead"+opts.uniqueID);
		}
	});

	$.extend($.ixf.fixHeader, {
		version: "1.4"
	});

	})(jQuery);
/*!
 * jQuery UI Watermark 1.8.ixf.6
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Watermark
 *
 * @copyright   Intellectual Reserve, Inc.
 * @URL         http://irinc.github.com/ixf

 * Depends:
 *	ui.core.js
 * Not officially released jQuery UI version (http://jqueryui.pbworks.com/Watermark) modified to work with jQuery UI 1.8+ - AB
 */
(function($) {

	$.widget("ixf.watermark", {
		options: {
			placeholder: function() {
				var result = $(this).attr("placeholder");
				$(this).data("placeholder", result);
				$(this).removeAttr("placeholder");
				return result;
			},
			opacity: 0,
			allowNative:true,
			animate: true
		},
		_create: function() {
			// check for native browser support, if it's there don't set anything up
			if(this.options.allowNative && 'placeholder' in document.createElement('input')){
				return;
			}
			var o = this.options,
				input = this.element,
				widgetName = this.widgetName,
				placeholder = $.isFunction(o.placeholder) ? o.placeholder.apply(this.element[0]) : o.placeholder;
			
			if(!placeholder){return;}

			input.wrap("<span/>").parent().addClass("ui-watermark-container ui-watermark-" + input[0].tagName.toLowerCase());
			var label = (this.label = $('<label for="' + input.attr("id") + '">' + placeholder + '</label>').insertBefore(input));
			label.addClass("ui-watermark-label");
			label.css({
				left: parseInt(input.css("borderLeftWidth"),10) + parseInt(input.css("paddingLeft"),10),
				top: parseInt(input.css("borderTopWidth"),10) + parseInt(input.css("paddingTop"),10),
				overflow: 'hidden',
				width: input.width()
			});
			if (input.val()) {
				label.hide();
			}
			input.bind("focus." + widgetName, function() {
				if (!o.disabled && !this.value) { o.animate ? label.fadeTo("fast",o.opacity) : label.hide(); }
			}).bind("blur." + widgetName, function() {
				if (!o.disabled && !this.value) { o.animate ? label.fadeTo("fast",1) : label.show(); }
			}).bind("keyup." + widgetName+" change." + widgetName, function(e) {
				if(this.value){label.hide();} else {label.show();}
			});
		},
		destroy: function() {
			var elem = this.element;
			if (elem.data("placeholder")) {
				elem.attr("placeholder", elem.data("placeholder"));
			}
			elem.siblings("label").remove();
			elem.unwrap().unbind("."+this.widgetName).removeData("placeholder");

			$.Widget.prototype.destroy.apply(this, arguments);
		}
	});


	$.extend($.ixf.watermark, {
		version: "1.8.ixf.5"
	});

})(jQuery);
/*!
 * makeVisible
 * @description Scrolls the target element into view when out of the screen (above or below), doesn't scroll if it is onscreen.
 * @version     1.0.5  - 2011/01/11
 * @copyright   Intellectual Reserve, Inc.
 * @URL         http://irinc.github.com/ixf
 * @requires    ui.core.js (1.8+), scrollTo plugin
 * @optional    easing plugin
 */
(function($) { // hide the namespace
	$.fn.makeVisible = function(options) {
		// check for scrollTo, throw error if not available
		if(!$.scrollTo) { alert("scrollTo plugin is required"); return;}
		// define the default settings, then update them with any settings the user has provided
		var opts = $.extend({}, $.fn.makeVisible.defaults, options);
		if(!opts.padTop) opts.padTop = opts.pad;
		if(!opts.padBottom) opts.padBottom = opts.pad;
		return this.each(function(i){
				var self = this; // copy off "this"
				
				// if "this" is an anchor it must be a trigger so set things up for a later triggering
				if(this.nodeName == "A" && !opts.goNow) {
					if(!$(self).data("set.makeVisible")){ // only do if we haven't before

						var href = self.href;
						var self = $($(this).attr("href"));
						$(this).bind("click.makeVisible",function(){
							$.fn.makeVisible.doScroll(self,opts);;
							return false;
						}).bind("remove.makeVisible",function(){
							$(this).unbind(".makeVisible")
								.removeData("set.makeVisible");
						});
						$(self).data("set.makeVisible",true); // set data to say this element is set
					}
				} else { // otherwise it must be a target to go to, so just go to it
					$.fn.makeVisible.doScroll(self,opts);
				}
		});
	};
	// plugin defaults - added as a property on our plugin function
	$.fn.makeVisible.defaults = {
		placeIt: "any",
		pad: 0,
		padTop:false,
		padBottom:false,
		onComplete: false,
		includePad:false,
		easing: "linear",
		speed: 1000
	};
	// from http://www.quirksmode.org/viewport/compatibility.html
	function getScroll(){ // returns how far down we are scrolled
		if (window.innerHeight){
			  pos = window.pageYOffset;
		} else if (document.documentElement && document.documentElement.scrollTop){
			pos = document.documentElement.scrollTop;
		} else if (document.body){
			  pos = document.body.scrollTop;
		}
		return pos
	}

	// from http://www.quirksmode.org/viewport/compatibility.html
	function getHeight(){ // returns the height of the viewing area
		var y;
		if (self.innerHeight){ // all except Explorer
			y = self.innerHeight;
		} else if (document.documentElement && document.documentElement.clientHeight){	// Explorer 6 Strict Mode
			y = document.documentElement.clientHeight;
		} else if (document.body){ // other Explorers
			y = document.body.clientHeight;
		}
		return y;
	}
	$.fn.makeVisible.doScroll = function(theTarget,settings){
		var runScroll = true;
		var forceTop = false;
		var inScrollable = false; // dynamic variable for seeing if the element to scroll to is insided of a scrollable element or not (not = window)
		theTarget = $(theTarget);
		// find information for when scolling the full window
		var viewportHeight = getHeight();
		var viewportTopY = getScroll();
		var viewportBottomY = viewportTopY + viewportHeight;
		var elementHeight = theTarget.outerHeight();
		var elementTopY = theTarget.offset()["top"];
		var elementBottomY = elementTopY + elementHeight;

		var scrollTo = $( $.browser.safari ? 'body' : 'html' );
		
		// find if any parents of the target element are scrollable
		$(theTarget).parents().each(function(){
			if(($(this).css("overflow") == "scroll" || $(this).css("overflow") == "auto" || $(this).css("overflowY") == "scroll" || $(this).css("overflowY") == "auto") && !inScrollable){
				// this one is scrollable, so save it off
				inScrollable = $(this);
			}
		});
		
		// if we have detected we are in a scrollable layer, find info for that layer
		if(inScrollable){
			scrollTo = inScrollable[0]; // change "scrollTo" to be the scollable layer
			viewportTopY = $(inScrollable).offset()["top"];
			viewportHeight = inScrollable.outerHeight(); // needs to be outerHeight to account for padding of scrollable element
			viewportBottomY = viewportTopY + viewportHeight;
		}
		
		if(elementHeight > viewportHeight) forceTop = true; // if the element it taller then the window then we need to trump the bot/mid/any with "top"
		
		// now lets do some math based on where it should be placed
		if(settings.placeIt == "bot") newOffset = elementHeight + settings.padBottom - viewportHeight; // place element at the bottom of the page (after getting full element on screen)
		if(settings.placeIt == "mid") newOffset = elementHeight/2 - viewportHeight/2; // place element in the middle of the screen
		if(settings.placeIt == "top" || forceTop) newOffset = - settings.padTop; // place element at the top of the page (after getting full element on screen)
		
		// if the padding should be on the screen as well (fixed elements on page) then change our math some
		var extra = 0;
		if(settings.includePad){
			// basically we need to make the element "size" include the padding, so adjust the top and bottom y to make it appear bigger
			elementTopY = elementTopY - settings.padTop;
			elementBottomY = elementBottomY + settings.padBottom;
		}
		
		if(elementTopY < viewportTopY){ // the element is above the viewportTopY... so we need move up
			if(settings.placeIt == "any" && !forceTop) newOffset = -settings.padTop;
		}else if (elementBottomY > viewportBottomY){ // the element is below the viewportBottomY... so we need move down
			if(settings.placeIt == "any" && !forceTop) newOffset = elementHeight + settings.padBottom - viewportHeight;
		} else if(settings.placeIt == "any") { // is on the screen already so just on screen is ok
			runScroll = false;
			if(settings.onComplete)settings.onComplete.call(theTarget);
		}
		// if we are scrolling... then scroll on!
		if(runScroll){
			$(scrollTo).stop().scrollTo( theTarget, settings.speed, {easing:settings.easing, offset:newOffset, onAfter:function(){
				if(settings.onComplete) settings.onComplete.call(theTarget);
			}} );
		}
	};
})(jQuery);
/*!
 * MultiSelect
 * @description	Take a multiple select element and breakes it into individual selects
 * @version		  2.0.7 - 2011/08/16
 * @copyright   Intellectual Reserve, Inc.
 * @URL         http://irinc.github.com/ixf
 * @requires	  ui.core.js (1.8+)
 */
(function($) {

	$.widget("ixf.multiSelect", {
		options: {
			addWhere: "bottom", // values(bottom/top) where to show the "adder" link.  new fiels always add to bottom
			maxFields: 0, // what is the maximum number of fields they can have (0 for infinite)
			removePath:"",
			addPath:"",
			removeTitle:"Remove this row",
			addTitle:"Add additional row",
			adderClass:"sprite icon add",
			removerClass:"sprite icon delete",
			removeConfirm:"Are you sure you want to remove this?", // text to be shown in a confirm box making sure you want to delete the item 
			matchWidths:true,
			onAdd: function(){}, // passes in the new select
			onDelete: function(){},
			onChange: function(){} // called after the updateValues function has been fired
		},
		_create: function() {
			var opts = this.options, self = this, elem = this.element,
				uniqueClass,selected;
			elem.hide();
			if(!elem.attr("multiple")){ // only do this on selects that have a multiple attr
				return;
			}
			
			//Override user-defined options
			$.extend(true,opts, elem.data("ms-options"));
					
			// fix for selected attribute not persisting through an F5 type refresh.
			this.element.find(":selected").each(function(){
				this.setAttribute("selected","selected");
			});

			uniqueClass = "ui-multiSelect-"+(Math.floor(Math.random()*999999));

			self._setOption('uniqueClass', uniqueClass);
			
			if(!opts.maxFields) {opts.maxFields = elem.find("option[value]").length;}
			
			// if there isn't a blank value as the first option the script breaks (shows first item but not actually "selected" so when you add a new row the script doesn't know to remove it, and other issues).  So check to see if the first option has a value.  If it does we need to add a new blank option.
			if(elem.find("option:first").val() !== ""){
				elem.prepend('<option></option>');
			}
			// setup an index on the original select to be cloned to other copies
			elem.find("option").each(function(i){
				$(this).attr("msIndex",i);
			});
			// var selected = elem.val();
			selected = elem.find("option:selected"); // ie8 in compatability mode can't use option[selected], so using option:selected per http://bugs.jquery.com/ticket/8025
			
			if(selected && selected.length){
					selected.each(function(){
						// add a dropdown for each existing selected value
						self.addSelect($(this).attr("msIndex"));
					});
			} else {
				// if we didnt' have any values, start with one blank one
				self.addSelect(0);
			}
			opts.setupDone = true;
		},
		makeSelect: function(newIndex){
			var self = this,
				newSelect = this.element.clone(false);
			
			//if <= ie8. Using feature detection as listed http://api.jquery.com/jQuery.support/
			// ie8 and below has a problem with cloning the original select. the clone only shows the originally selected items, not any newly selected items
			if(!$.support.leadingWhitespace){
				newSelect.find(":selected").removeAttr("selected"); // need to clear any existing selections
				this.element.find(":selected").each(function(){ // now add back any selections from the original element one at a time
					newSelect.find("[msIndex="+$(this).attr("msIndex")+"]").attr("selected","selected");
				});
			}
			
			newSelect.find(":selected").filter(function(){
				// remove the selected option that has the value what we want (by index)
				if($(this).attr("msIndex") == newIndex || $(this).attr("msIndex") == "0"){
					return false;
				}
				return true;
			}).remove();
				
			newSelect
			.attr({
				size:"1",
				id:"ui-multiSelect-"+(Math.floor(Math.random()*999999)),
				name:""
			})
			.show()
			.removeAttr("multiple")
			.attr("onchange","") // clear out any existing onchange attribute on the clone (bound events aren't copied with the clone(false)). they should only fire on the original
			.bind("change.multiSelect",function(){
				self._updateValues(newSelect);
				self.element.trigger("change");
			})
			.bind("removeIt.multiSelect",function(){
				var theParent = $(this).parents(".wrapper"), toFocus;
				toFocus = theParent.next(".wrapper").length ? theParent.next() : theParent.prev();
				self._updateValues($(this));
				$(theParent).remove();
				// update what controls are shown
				self.updateControls();
				toFocus.find(":input:visible").eq(0).focus();
			});
			return newSelect;
		},
		addSelect: function(newIndex){
			var opts = this.options,
				uniqueClass = opts.uniqueClass,
				self = this,
				elem = this.element,
				newSelect,wrappers,remover,adder;
			
			if (opts.disabled){return false;}
			
			newSelect = this.makeSelect(newIndex);
			
			wrappers = elem.siblings("."+uniqueClass+":last");
			if(wrappers.length){
				$(wrappers).after(newSelect);
			} else {
				elem.after(newSelect);
			}

			newSelect
			.wrap('<div class="wrapper ui-multiSelect ui-widget '+uniqueClass+'"></div>'); // can't wrap till it's added to the DOM above
			
			remover = $(' <a href="#d" class="remover"><span class="'+opts.removerClass+'">'+opts.removeTitle+'</span></a>').bind("click.multiSelect",function(){
				if($(this).data("canRemove")){
					if(typeof opts.removeConfirm == "string") {self.removeSelect(newSelect);}
					if(typeof opts.removeConfirm == "function") {opts.removeConfirm.call(newSelect);}
				}
				return false;	
			}).data("canRemove",true);
			
			if(opts.removePath){
				remover.find("span").html('<img src="'+opts.removePath+'" alt="'+opts.removeTitle+'"/>');
			}
			
			adder = $('<a href="#d" class="adder"><span class="'+opts.adderClass+'">'+opts.addTitle+'</span></a>').bind("click.multiSelect", function(){
				self.addSelect(0);
				return false;
			});
			
			if(opts.addPath){
				adder.find("span").html('<img src="'+opts.addPath+'" alt="'+opts.addTitle+'"/>');
			}

			newSelect.parents(".wrapper").append(remover).append(adder);
			if(opts.setupDone){newSelect.focus();}
			newSelect.data("oldIndex",newIndex); // save off the selected value for comparison later on
			self.updateControls();
			if(opts.onAdd){
				opts.onAdd.call(newSelect); // run callback
			}
		},
		
		// This only needs to be run after the initial load of selects have been added, or after one is changed or removed.
		_updateValues: function(curSelect){
			// console.debug(curSelect);
			// var curSelect = $(this.element); // the default list
			if (this.options.disabled) {return false;}
			var opts = this.options,uniqueClass = opts.uniqueClass,
				selectList = $(this.element).siblings("."+uniqueClass).find("select"), // all the copies of the original select list
				// loop through selectList and get all the current values
				elem = this.element, // the default list
				curIndex,oldIndex,optionToPlace;
			
			// get the index of the currently selected item from the recently changed select
				curIndex = curSelect.find(":selected").attr("msIndex");
				oldIndex = curSelect.data("oldIndex");
				curSelect.data("oldIndex",curIndex);
			if(oldIndex){
				elem.find("option[msIndex="+oldIndex+"]").removeAttr("selected")[0].removeAttribute("selected");
			}
			if(oldIndex != curIndex){ // not the same, so must be adding/changing data
				// make the new option not selected in the hidden select[multiple]
				if(curIndex){
					elem.find("option[msIndex="+curIndex+"]").attr("selected","selected")[0].setAttribute("selected","selected"); // this uses setAttribute in addition to .attr() due to some weird issues referred to here http://stackoverflow.com/questions/742810/clone-isnt-cloning-select-values and here http://dev.jquery.com/ticket/1294
				}
			}
			
			// walk through each of the select elements
			$(selectList).each(function(){
				var curList = $(this);
				// only do updates if it's not the current select that was changed (it doesn't need updating)
				if(curList.attr("id") != $(curSelect).attr("id")){
					if(curIndex && curIndex != "0"){
						curList.find("option[msIndex="+curIndex+"]").remove();
					}
					if (oldIndex != "0") {
						optionToPlace = curSelect.find("option[msIndex="+oldIndex+"]").clone(true);
						optionToPlace.removeAttr("selected");

						for(var x=oldIndex; x>=0; x--){
							if(curList.find("option[msIndex="+x+"]").length){
								curList.find("option[msIndex="+x+"]").after(optionToPlace);
								break;
							}
						}
					}
				}

			});
			// update what controls are shown
			this.updateControls();
			if(opts.onChange && opts.setupDone){
				opts.onChange.call(this); // run callback
			}
		},
		
		removeSelect: function(toRemove){
			var opts = this.options, removeIt = true;
			if (opts.disabled) {return false;}
			
			if(opts.removeConfirm) {removeIt = confirm(opts.removeConfirm);}
			
			if(removeIt){
				toRemove.trigger("removeIt");
				if(opts.onDelete){
					opts.onDelete.call(); // run callback
				}
			}
		},
		updateControls: function(){
			var opts = this.options,
				uniqueClass = opts.uniqueClass,
				elem = this.element,
				selectList = elem.siblings("."+uniqueClass).find("select:visible"),
				adder = elem.siblings("."+uniqueClass).find(".adder"),
				remover,widestWidth,pad;
				// console.debug(selectList);
			if(selectList.length < opts.maxFields || opts.maxFields == "0"){
				if(opts.addWhere =="bottom"){
					// console.debug("bottom",adder);
					adder.slice(0,adder.length-1).hide();
					adder.eq(adder.length-1).show();
				} else if(opts.addWhere =="top"){
					adder.slice(1,adder.length).hide();	
					adder.slice(0,1).show();
				}
			} else {
				adder.hide();
			}
			
			remover = elem.siblings("."+uniqueClass).find(".remover");
			// console.debug(remover);
			if(remover.length == "1"){
				remover.addClass("disabled").fadeTo(1,0.6);
				remover.data("canRemove",false);
			} else {
				remover.removeClass("disabled");
				// only fade in if it needs fading (take a while to essentially do nothing on really long lists)
				// if(remover.css("opacity") != "1"){
					remover.fadeTo(0,1);
				// }
				remover.data("canRemove",true);
			}
			if(opts.matchWidths){
				widestWidth = 0;
				$(selectList).each(function(){
					$(this).width("");
					if($(this).width() > widestWidth){ widestWidth = $(this).width(); }
				});
				pad = 30; // a safe number to compensate for IE/FF widths including the arrow
				if(opts.matchWidths > 1){
					pad = opts.matchWidths;
					// console.debug("NAN");
				}
				$(selectList).width(widestWidth+pad);
			}
		},
		destroy: function() {
			var opts = this.options,
				uniqueClass = opts.uniqueClass;
			$.Widget.prototype.destroy.apply(this, arguments); // call the default stuff
			
			this.element
				.removeClass("ui-widget ui-helper-reset")
				.removeAttr("role")
				.unbind('.multiSelect')
				.removeData('multiSelect')
				.show();
			$(this.element).siblings("."+uniqueClass).remove();
			this.element.find("option").each(function(i){
				$(this).removeAttr("msIndex");
			});
		}
		
	});

	$.extend($.ixf.multiSelect, {
		version: "2.0.7"
	});

})(jQuery);
/*!
 * finder
 * @description	Mimics the OS X finder. A different way to look at a tree view
 * @version		  1.2.3  - 2010/12/03
 * @copyright   Intellectual Reserve, Inc.
 * @URL         http://irinc.github.com/ixf
 * @requires	  ui.core.js (1.8+), scrollTo plugin
 * @optional	  easing plugin
 */
(function($) {

	$.widget("ixf.finder", {
		options: {
			easing:"linear",
			duration:500,
			columnHeight:300,
			columnWidth:200,
			columnScroll:"auto",
			width:600, // set width or 0 to auto detect
			// maxWidth:300, // if automatically setting width, how big is too big
			scroll:true,
			loadingText:"Loading...",
			gotoClass:"goto",
			focusClass:"ui-state-focus",
			hoverClass:"ui-state-hover",
			activeClass:"ui-state-active",
			activeNowClass:"ui-state-active-now",
			finderClass:"ui-finder"
		},
		_create: function() {
			var opts = this.options, self = this, elem = this.element,
				isAjax,
				source = opts.source,
				// sourceData = opts.sourceData,
				// save off the original content to put back on removal.  Should only ever be a UL
				origContent = elem.find(">ul"),
				//lets make the needed wrappers to make this work
				container = $("<div class='"+opts.finderClass+"-container'></div>"),
				wrapper = $("<div class='"+opts.finderClass+"-wrapper'></div>").append(container).appendTo(elem);

			elem.addClass(opts.finderClass);

			opts.origContent = origContent;
			opts.container = container;
			opts.wrapper = wrapper;
			// opts.elemWidth = elem.width();
			
			if(opts.scroll){
				wrapper.bind("scroll."+opts.widgetName,function(){
					self.updateControls();
				}).attr("tabindex","-1");
			}

			elem.attr({role:"tree"});

			// put in a loading thingy
			container.append("<div class='"+opts.finderClass+"-loader'>"+opts.loadingText+"</div>");
			
			// set some styles and stuff, using themeroller classes so not changeable
			elem.addClass("ui-widget-content ui-widget");

			if(opts.width){
				elem.width(opts.width);
			}
			
			// set overflow of wrapper
			wrapper.css({position:"relative",overflow:opts.scroll?"auto":"hidden"}); /* position:relative is for IE issues */
			
			// if controls are passed in, set them up with proper events
			if(opts.prev){
				$(opts.prev).bind("click."+self.name,function(){
					self.back();
					return false;
				});
			}
			if(opts.next){
				$(opts.next).bind("click."+self.name,function(){
					self.forward();
					return false;
				});
			}
			
			if(source){
				// figure out if the source is on the page or ajax
				if(source.indexOf("#") != "-1"){
					// has a # so must be local content
					opts.sourceData = $(source).hide().clone();
				} else {
					// no # so must be ajax
					$.get(source,function(source){
						opts.sourceData = $(source);
						self.finishInit();
					});
					isAjax = true;
				}
			} else {
				// look in the elem for the source
				if(elem.find(">ul").length){
					opts.origContents = elem.find(">ul");
					opts.sourceData = elem.find(">ul").clone().end().remove();
				}
			}
			
			// when someone clicks on the list, bind the keyboard events
			elem.bind("click."+self.name, function(){
				if(!elem.data("bound") && (opts.focusKeyboard)){ // if they aren't already
					self.bindKeyboard();
				}
				// lets focus on the element that has ui-state-active-now, if one isn't already focused
				if(!$("."+opts.focusClass+" a",elem).length){
					$("."+opts.activeNowClass+" a",elem).focus();
				}
			});

			if(!isAjax){
				self.finishInit();
			}
		},
		// this stuff is separated out due to potentially waiting for an ajax response
		finishInit: function(){
			var opts = this.options, self = this, elem = this.element,
				sourceData = opts.sourceData;
			
			// put a click event on the elem so it's only in one place
			elem.find("."+opts.finderClass+"-list a").live("click."+opts.widgetName,function(event){
				// get stuff we need
				var item = $(this).parent(),
					curLevel = $(this).parents("."+opts.finderClass+"-list"),
					isFolder = item.hasClass(opts.finderClass+"-folder"),
					// find which level we just clicked on
					curLevelNum = curLevel.index(),
					// remove any levels after the one we clicked on
					extras = opts.container.find(">div:gt("+curLevelNum+")"),
					putHere;
				
				putHere = self.createColumn();
				
				// remove the active-now class from anywhere else it might be
				elem.find("li."+opts.activeNowClass+"").removeClass(opts.activeNowClass);
				// same for ui-state-focus
				elem.find("li."+opts.focusClass).removeClass(opts.focusClass);
				// add active, active now and focus to this element
				item.addClass(opts.activeNowClass+" "+opts.focusClass+" "+opts.activeClass);
				item.siblings().removeClass(opts.activeClass).find("a").attr({"aria-expanded":"false"});
				item.find("a").attr({"aria-expanded":"true"});
				
				if(isFolder && extras.length){
					extras.remove();
				} else if(extras.length) {
					extras.not("."+opts.finderClass+"-page").remove();
				}

				if(isFolder){
					if(item.hasClass("ajax") || item.hasClass("folder")){
						// we need to load additional content
						//first add a loader to the LI>A
						item.find("a").append('<span class="'+opts.finderClass+'-loader">'+opts.loadingText+'</span>');
						
						if(item.hasClass("ajax")){
							// now request the new nav
							$.get(this.href,function(data){
								self.loadStructure(item,data,event);
							});
						}

						// remove ajax/folder class from the item so we don't call it again (in cache now)
						item.removeClass("ajax folder");
						
						// also remove it from within the sourceData so we don't request it again
						sourceData.find("#"+item.attr("id")).removeClass("ajax folder");
					} else {
						// not ajax so must be an inline element
						var newList = sourceData.find("#"+item.attr("id")).find(">ul");
						if(newList.length){
							self.createLevel(newList);
						}
					}
					self._trigger("onFolderSelect", event, self);
				} else {
					// no folder so is a page
					var anchor = item.find("a"),
						href = anchor.attr("href");
					
					if(anchor.hasClass(opts.gotoClass)){
						// go to the page, not ajax
						return true;
					}
					
					if(!opts.target){ // no target, so add it as another column in the finder
						// add it to the page
						opts.container.append(putHere);
						self.setContainerWidth();
					} else {
						putHere = $(opts.target);
					}
					
					//if we have a target try and put stuff in it
					if(href.indexOf("#") != "-1"){
						// has a # so must be local content
						var newContent = $(href);
						if(newContent.length){
							putHere.html(newContent.clone().show());
						}
						// else
						// anchor didn't exist, so user may be trying to fire an onclick and just put in a dummy hash, so just don't do anything
						
					} else {
						// no # so must be ajax
						anchor.append('<span class="'+opts.finderClass+'-loader">'+opts.loadingText+'</span>');
						$.get(anchor.attr("href"),function(data){
							putHere.html(data);
							item.find("span."+opts.finderClass+"-loader").remove();
							self._trigger("onPageLoad", 0, item);
						});
					}
					self._trigger("onPageSelect", event, item);
				}
				
				self._trigger("onSelect", event, item);
				return false;
			}).live("focus."+opts.widgetName,function(event){
				// remove the tabindex 0 from anything in the finder
				elem.find("a[tabindex=0]").attr("tabindex","-1");
				elem.find("."+opts.focusClass).removeClass(opts.focusClass); // tried doing this on blur above, but IE wouldn't do it
				$(this).attr("tabindex","0") // add the tabindex back for the last focused thing
					.parent().addClass(opts.focusClass);
			}).live("blur."+opts.widgetName,function(event){
				self.unbindKeyboard();
			});
			
			elem.find("."+opts.finderClass+"-list li").live('mouseover.'+opts.widgetName+' mouseout.'+opts.widgetName, function(event) {
				if (event.type == 'mouseover') {
					$(this).addClass(opts.hoverClass);
				} else {
					$(this).removeClass(opts.hoverClass);
				}
			});
			
			elem.find("a").live('focus.'+opts.widgetName,function(){
				if(!elem.data("bound") && (opts.focusKeyboard)){ // if they aren't already
					self.bindKeyboard();
				}
			});
			
			opts.uid = 0;

			self.tagSource();
			
			// now lets get the first level to show off
			self.createLevel(sourceData);
			elem.find("."+opts.finderClass+"-loader").remove();
			
			elem.find("a:first").attr({tabindex:"0"});
			
			// search for anything that is already selected and make it show as default (:last just in case there are multiple)
			opts.sourceData.find("."+opts.activeNowClass+":last").each(function(){
				$($(this).parents("li").toArray().reverse()).each(function(){
					$("#"+$(this).attr("id")+" a").click();
				});
				$(this).removeClass(opts.activeNowClass); // remove class from the sourceData
				$("#"+$(this).attr("id")).find("a").click();
			});
			
			// track that setup is complete
			opts.setupComplete = true;
			opts.focusKeyboard = true; // if it was set to false for initial load
			
			self._trigger("onInit", 0, self);
			return;	
		},
		// this needs to be separate in case a function needs to be called from an external source to populate the data. Such as a backend that needs to use it's own ajax
		loadStructure: function(item,data,event){
			var opts = this.options, self = this,
				sourceData = opts.sourceData;
			// need to inject this data into the source data
			// run the callback on it to do stuff on it (if set)
			if(opts.parseData){ data = opts.parseData.call("",data); }
			
			// find the curent node in the sourceData
			var curItem = sourceData.find("#"+item.attr("id"));
			// add new stuff to it
			curItem.append(data);
			// new stuff added, so make sure they all have ID's to work with
			self.tagSource();
			// before creating a level make sure to see if the item is still active. otherwise the user may have clicked elsewhere so no need to do it here
			if(item.hasClass(opts.activeClass)){
				self.createLevel(curItem.find(">ul"));
			}
			// remove the loader
			item.find("span."+opts.finderClass+"-loader").remove();
			self._trigger("onFolderLoad", event, item);
		},
		tagSource: function(){
			var opts = this.options;
			opts.sourceData.find("li,ul").each(function(){
				if(!this.id){
					$(this).attr("id","finder-"+opts.uid);
					opts.uid++;
				}
			});
			opts.sourceData.find("a").each(function(){
				var cur = $(this);
				// console.debug(cur.parents("ul").length);
				cur.attr({tabindex:"-1","aria-level":cur.parents("ul").length,role:"treeitem","aria-expanded":"false"});
			});
		},
		createLevel: function(curLevel){
				var opts = this.options, self = this,
					items = curLevel.find(">li"),
					fullLevel = $("<div class='"+opts.finderClass+"-list'><ul></ul></div>").css({"float":"left"}),
					newItem,curScroll = opts.wrapper.scrollLeft();

				fullLevel = self.createColumn();
				fullLevel.prepend("<ul></ul>");
				
				items.each(function(){
					newItem = $(this).clone();
					
					if($(this).hasClass("ajax") || $(this).hasClass("folder")  ||newItem.find(">ul").length){
						newItem.addClass(opts.finderClass+"-folder");
					} else {
						newItem.addClass(opts.finderClass+"-page");
					}
					
					newItem.find(">ul").remove(); // remove any sub lists
					fullLevel.find("ul").append(newItem);
				});

				fullLevel.attr("tabindex","-1"); // for some reason the columns become tabbable wtithout this

				// add it to the page
				// elemWidth = this.element.width(); // for some reason adding a child changes the reported width of the main element. save it off so we can put it back so we dont' mess up math that is needed later
				opts.container.append(fullLevel);
				// this.element.width(elemWidth) // resetting accurate width
				self.setContainerWidth(); // we need to do an initial resize of the container because the extra column causes the container to wrap and throws of some measurements in firefox and sometimes IE
				self.setWidth();
				// self.setContainerWidth(); // this is called in setWidth called above, so shouldn't need it again
				opts.wrapper.scrollLeft(curScroll);
				self.scrollTo(fullLevel,function(){
					// if(opts.setupComplete){fullLevel.find("a:first").focus();}
				});
				self._trigger("onFolderDisplay", 0, fullLevel);
				
		},
		createColumn:function(){
			var opts = this.options,
				newColumn = $("<div class='"+opts.finderClass+"-list'></div>").css({"float":"left"}),
				columnHeight = opts.columnHeight,
				columnWidth = opts.columnWidth,
				columnScroll = opts.columnScroll;
				
				if(columnHeight){
					newColumn.height(columnHeight);
				}
				if(columnScroll){
					newColumn.css({overflowY:columnScroll});
				}
				if(columnWidth){
					newColumn.width(columnWidth);
				}
				return newColumn;
		},
		// sets the width of the container around the lists, but inside the wrapper. It can't just be a number bigger then the sum of the lists for when we have scroll bars showing, they would be incorrect. It can't be auto because the wrapper would constraint it to the wrappers width. So it needs to be the exact width of the sum total of the lists
		setContainerWidth: function(resize){
			var opts = this.options, self = this, elem = this.element,
				lists = elem.find("."+opts.finderClass+"-list"),
				totalWidth = 0;

			lists.each(function(){
				totalWidth = totalWidth + $(this).outerWidth();
			});
			
			opts.container.width(totalWidth);
			if(resize){
				self.scrollTo(self.findFirstCol(),function(){},1);
			}
		},
		move: function(dir){
			var opts = this.options, self = this,
				gotoCol,
				firstCol = self.findFirstCol();
			// find which column is the one we want to move to
			gotoCol = firstCol.parent().children(":eq("+(dir+firstCol.index())+")");

			// if it exists, move to it
			if(gotoCol.length){
				self.gotoCol(gotoCol,function(){
					gotoCol.find("."+opts.activeClass+" a").focus();
				});
			}
			
			//callback for after we move
			self._trigger("onMove", 0, gotoCol);
		},
		forward: function(){
			this.move(1);
		},
		back: function(){
			this.move(-1);
		},
		// this finds the column that is currently displayed as the first column. Displayed is defined as first "mostly showing" column. So there could be a few pixels of col 2 showing, but col 3 is what is mostly showing. or col 3 has the first few pixels cut off.
		findFirstCol:function(){
			var opts = this.options, elem = this.element,
				wrapper = opts.wrapper,
				lists = elem.find("."+opts.finderClass+"-list"),
				itemLCorner,toReturn,
				finderCorner = wrapper.offset().left,
				halfWidth = opts.columnWidth/2;

			lists.each(function(i){
				itemLCorner = $(this).offset().left;
				// checks to see if the current lists top left corner is between the finders top left corner and is at least half way visible
				if(itemLCorner >= (finderCorner-halfWidth) && itemLCorner <= (finderCorner + halfWidth)){
					toReturn = $(this);
				}
			});
			return toReturn;
		},
		gotoCol: function(goTo,callback){
			var opts = this.options,
				gotoCol;
			if(goTo == "last"){
				goTo = $("."+opts.finderClass+"-list").length - 1;
			}
			// find which column is the one we want to move to
			if(typeof goTo == "number"){
				gotoCol = opts.container.children(":eq("+goTo+")");
			} else {
				gotoCol = goTo;
			}
			
			// if it exists, move to it
			if(gotoCol.length){
				// figure out where exactly we are moving to and move there.
				this.scrollTo(gotoCol,callback);
			}
		},
		scrollTo: function(goTo,callback,speed){
			// console.debug("passed in speed",speed);
			var opts = this.options, self = this,wrapper = opts.wrapper,
				callback2;
			if($.scrollTo) {
				if(opts.scrolling){
					return;
				}
				if(!speed){
					speed = opts.duration;
				}
				callback2 = function(){
					if(callback){
						callback();
					}
					self.updateControls();
					opts.scrolling = false;
				};
				// console.debug(speed);
				opts.scrolling = true;
				wrapper.scrollTo(goTo,speed,{axis:"x",easing:opts.easing,onAfter:callback2});
				wrapper.trigger("scroll."+opts.widgetName);
			} else {
				alert("Finder: scrollTo plugin is required");
			}
		},
		getActive: function(){
			var opts = this.options;
			return this.element.find("."+opts.activeClass+" a");
		},
		getVisible: function(){
			var opts = this.options, elem = this.element,
				wrapper = opts.wrapper,
			// how far has the wrapper scrolled left
				lists = elem.find("."+opts.finderClass+"-list"),
			//find the X of the top left of the finder
				itemLCorner,itemRCorner,
				finderLCorner = wrapper.position().left,
				finderRCorner = wrapper.position().left + elem.width();
			
			// loop through each column
			lists.each(function(i){
				// find the left and right X's of the column
				itemLCorner = $(this).position().left;
				itemRCorner = itemLCorner + $(this).width();
				
				// by checking if the finderCorner is within the current columns corners, we will know which one is currently in the pole position
				if(finderLCorner >= itemLCorner && finderLCorner <= itemRCorner){
					// item is in the first position
					opts.firstCol = i;
				}
				
				if(finderRCorner > itemLCorner && itemRCorner <= finderRCorner){
					// item is in the last position
					opts.lastCol = i;
				}
			});
			opts.totalVisible = opts.lastCol - opts.firstCol+1; // +1 because 2-1 = 1 but 2 and 1 showing is 2
		},
		setWidth:function(resizing){
			// this is for updating the widths dynamically
			var elem = this.element,
				opts = this.options,
				newWidth = elem.width(),
				self = this,
				curColumns = elem.find("."+opts.finderClass+"-list");
				// console.debug("elemWidth",elem.width());
				// console.debug("elemOffsetWidth",elem[0].offsetWidth);
				// console.debug("parent width",elem.parent().width());
				// console.debug("parent parent width",elem.parent().parent().width(),elem.parent().parent());
				
			if(opts.numColumns){
				// remainder = parseInt(newWidth,10)%parseInt((curColumns.length > opts.numColumns?opts.numColumns:curColumns.length),10);
				// console.debug("remainder",remainder);
				newWidth = (parseInt(newWidth,10)/parseInt((curColumns.length > opts.numColumns?opts.numColumns:curColumns.length),10));
				// console.debug("newWidth",newWidth);
			}
			// console.debug("newWidth",newWidth);
			curColumns.width(newWidth);
			opts.columnWidth = newWidth; // update the saved width to make sure new columns get the new width
			
			// after updating all column widths, update the wrapper width
			// setTimeout(function(){
				self.setContainerWidth(resizing);
			// },10);
			// opts.elemWidth = elem.width();
		},
		// this is what is called via something like window.resize
		updateWidth:function(){
			this.setWidth(true);
		},
		updateHeight:function(){
			var elem = this.element,
				newHeight = elem.height(),
				opts = this.options,
				diff = elem.find("."+opts.finderClass+"-list:first").outerHeight() - elem.find("."+opts.finderClass+"-list:first").height();
			elem.find("."+opts.finderClass+"-list").height(elem.height()-diff);
			this.options.columnHeight = newHeight;
		},
		updateControls:function(){ // optionally update any controls to show state
			var opts = this.options, elem = this.element,totalCols;
			this.getVisible();
			// need to add functionality to track what column is shown on the left edge (can this be updated onscroll so it's live?)
			// based on the above, turn on or off items marked as prev/next
			totalCols = elem.find("."+opts.finderClass+"-list").length;
			$(opts.prev).add(opts.next).removeClass("disabled");
			if(opts.firstCol === 0){
				// disable prev button
				$(opts.prev).addClass("disabled");
			}
			// console.debug(totalCols);
			if(opts.lastCol == (totalCols - 1) || totalCols <= 1) {
				// disable next button
				$(opts.next).addClass("disabled");
			}
			
		},
		bindKeyboard:function(){
			var opts = this.options, self = this, elem = this.element;
			if(!elem.data("bound")){
				// unbind things just in case so we don't double up
				// due to some weird issues we need to remove for all instances on the page, so use the self.widgetName class
				$(".ui-"+self.widgetName).finder("unbindKeyboard");
				elem.data("bound",true);
				$(document).bind( "keydown."+self.widgetName, function( event ) {
					var curElem = $("."+opts.focusClass,elem),
						keyCode = $.ui.keyCode,
						newCol;
					if(!curElem.length){
						// console.debug(2);
						curElem = opts.wrapper.find("a:first").focus().end();
					}
					switch( event.keyCode ) {
						case keyCode.UP:
							curElem.prevAll(":has(a):first").find("a").focus();
							event.preventDefault();
							break;
						case keyCode.DOWN:
							curElem.nextAll(":has(a):first").find("a").focus();
							event.preventDefault();
							break;
						case keyCode.LEFT:
							newCol = curElem.parents("."+opts.finderClass+"-list").prev();
							newCol.find("."+opts.activeClass+" a").focus();
							if(newCol.length){
								self.gotoCol(newCol);
							}

							event.preventDefault();
							break;
						case keyCode.RIGHT:
							if(curElem.hasClass(opts.activeClass)){
								// already selected so go to next col
								newCol = curElem.parents("."+opts.finderClass+"-list").next();
								newCol.find("."+opts.activeClass+" a").focus();
								if(!newCol.find("."+opts.activeClass+" a").length){
									newCol.find("a:first").focus();
								}
								if(newCol.length){
									self.gotoCol(newCol);
								}
							} else {
								// wasn't selected so fire it off
								curElem.find("a").click();
							}

							event.preventDefault();
							break;
					}
				});

				// now that we are bound, if the user clicks anywhere on the screen other then on the finder, unbind stuff so that keys will work accurately in those sections
				$(document).bind("click."+self.widgetName,function(event){
					var originalElement = event.originalEvent.originalTarget;
					var inSelf = false;
					$(originalElement).parents(opts.wrapper).each(function(){
						if(this == $(opts.filter)[0]){
							inSelf = true;
						} else
						if(this == elem[0]){
							// leave it
							inSelf = true;
						}
					});
					if(!inSelf && originalElement){
						// remove the bindings
						self.unbindKeyboard();
					}
				});
				self._trigger("onbind", 0, self);
			}
		},
		unbindKeyboard:function(){
			var self = this, elem = this.element;
			elem.data("bound",false);
			$(document).unbind('keydown.'+self.widgetName);
			$(document).unbind("click."+self.widgetName);
			self._trigger("onunbind", 0, self);
		},
		destroy: function() {
			var opts = this.options, elem = this.element;
			$.Widget.prototype.destroy.apply(this, arguments); // call the default stuff

			elem.find("."+opts.finderClass+"-list a").die("click.finder");
			elem.html(opts.origContents)
				.removeClass("ui-widget-content ui-widget");
			elem.find("."+opts.finderClass+"-list li").die('mouseover.finder mouseout.finder');
		}
		
	});
	$.extend( $.ixf.finder, {
		version: "1.2.3"
	});
})(jQuery);
/*!
 * masterDetail
 * @description	Facilitates the loading of content from a list/table into a target area. Provides keyboard navigation of the list and caching.
 * @version		  1.2.4  - 2011/04/26
 * @copyright   Intellectual Reserve, Inc.
 * @URL         http://irinc.github.com/ixf
 * @requires	  ui.core.js (1.8+), makeVisible
 */
(function($) {
	$.widget("ixf.masterDetail", {
		options: {
			detailLink:"a", // selector for where the link to the detail is
			focusKeyboard:true, // should we trap the keyboard right off the bat
			filter:"", // selector of where the optional filter field is
			loaderID: "md-loading",
			loaderText: "Loading",
			hashLabel:"detail", // also the ID (without the #) of where it will be loaded into (the detail)
			cacheResults:false,
			hashLabel2:"", // optional hashLabel for a sub-master so we can set it to 0 in one action
			masterParent:"", // optional hashLabel/ID for a parent detail
			masterChild:"", // optional hashLabel/ID for a child detail
			loadFirst:true, // should the script load the first row if none is marked selected or defined in the URL
			selectedClass:"selected",
			mergeMode:2, // see http://benalman.com/code/projects/jquery-bbq/docs/files/jquery-ba-bbq-js.html#jQuery.bbq.pushState
			onloaddetail:function(event,foo){
				// window.location.hash = "detail="+foo.options.curSelected.find("a:first").attr("href");
			},
			nomatch:function(hashLabel,val){
				alert("MasterDetail: Provided ID ("+val+") in the URL is not valid for "+hashLabel);
			},
			error:function(event, self){
				self.element.html("<div class='padding-sm'>There was an error with your request. Please try again or let the website administrator know.</div>");
			}
		},
		_create: function() {
			var opts = this.options, self = this, elem = this.element,
				hashLabel = opts.hashLabel,
				rows,rowID,curVal,curVal2,row;
			opts.hasRows = true;
			opts.hasBBQ = $.bbq;
			opts.clicked = false;

			if(!$.fn.makeVisible){
				alert("MasterDetail Plugin: MakeVisible plugin required for scrolling rows into view");
				return;
			}
			if(!$("#"+hashLabel).length){
				alert("MasterDetail Plugin: Detail element doesn't exist. #"+hashLabel);
				return;
			}
			
			opts.detailTarget = $("#"+hashLabel);
			opts.targetDefault = opts.detailTarget.html();
			
			// setup caching
			if(opts.cacheResults){
				opts.cache = {};
			}
				// console.debug(this);
			// console.debug(elem.is(":visible"));
			if(elem.is(":visible")){ // skip any cloned tables for fixed headers/etc
				elem.addClass("ixf-"+self.widgetName);
				// setup click events based on type (table vs list)
				if(elem.is("table")){
					rows = elem.find("tbody tr");
					opts.wrapper = elem.find("tbody");
					opts.rowType = "tr";
					if(elem.dataTable){
						opts.hasDataTable = true;
					}
					// console.debug(opts.wrapper);
					if(!opts.wrapper.length){
						// has no tbody, so 
						return;
					}
				} else if(elem.is("a")){
					opts.hasRows = false;
				}
				 else { // gonna guess it's a OL or UL
					rows = elem.find("li");
					opts.wrapper = elem;
					opts.rowType = "li";
				}
				if(opts.hasRows){
					// setup row clicks
					$(opts.rowType,opts.wrapper).live("click."+self.widgetName,function(event){
						var row = $(this);
						opts.clicked = true; // track that this is a user initiated addition to the history, not using back/forward buttons or a link
						// console.debug("click!!",row);
						// console.debug("click",row);
						self.triggerRow(row,event,row.attr("ID"));
					});
					// capture the click on anchors (for keyboard navigation)
					$(opts.detailLink,opts.wrapper).live("click."+self.widgetName,function(event){
						event.stopPropagation();
						$(this).parents(opts.rowType+":first").click();
						return false;
					});

					// when someone clicks on the list, bind the keyboard events
					elem.click(function(){
						if(!elem.data("bound") && (opts.focusKeyboard)){ // if they aren't already
							self.bindKeyboard();
						}
					});
				} else {
					// no rows so setup click on the anchor
					rowID = elem.attr("id");
					if(!rowID){
						alert("MasterDetail: All items must have a unique ID. Anchor with issue is: "+elem.text());
						return;
					}
					elem.bind("click."+self.widgetName,function(event){
						event.stopPropagation();
						// $("#"+opts.loaderID).show();
						self.loaderCreate();
						
						opts.lastLoad = $.ajax({	
							url:elem.attr("href"),
							success:function(data){
								self.loadData(data,rowID,event);
							},
							error:function(jqXHR, textStatus, errorThrown){
								// abort only fires if *we* abort it, which we do if they arrow to another master. So trigger the error for any other error code
								if(textStatus !== "abort"){
									self.jqXHR = jqXHR; // save off the ajax response for use in the callback
									self._trigger("error", event, self);
									self._loaderDestroy();
								}
							}
						});
						return false;
					});
				}

				curVal = $.bbq.getState(hashLabel);
				// find the currently selected row and click it to load its content
				if(opts.hasBBQ && curVal && !$("#"+hashLabel).data("clearSelected")){
					if($("#"+curVal).length){
						// $("#"+curVal).click();
						row = $("#"+curVal);
						self.triggerRow(row,false,row.attr("ID"));
					} else {
						opts.nomatch(hashLabel,$.bbq.getState(hashLabel));
					}
				} else if(elem.find("."+opts.selectedClass).length){ // or find the one marked with a selected class
					elem.find("."+opts.selectedClass).click();
				} else if(opts.hasRows) { // or click the first row
					if(opts.loadFirst){
						opts.wrapper.find(opts.rowType+":first").click();
					}
				}
				
				// setup the BBQ (history) stuff
				if(opts.hasBBQ){
					$(window)
						.unbind( 'hashchange.'+hashLabel)
						.bind( 'hashchange.'+hashLabel, function( event ) {
	// console.debug("hashChange",elem);
							// console.debug("hashchange!!");
						curVal = event.getState(hashLabel);
						// console.debug(hashLabel,opts.lastHashVal,curVal);
						if(opts.lastHashVal !== curVal && opts.setupComplete ){
							// console.debug("different, so do something");
							// load the defined row
							// console.debug(curVal,opts.hasRows);
							if(curVal && opts.hasRows){
								// console.debug("hashChange",curVal);
								self.triggerRow($("#"+curVal),event,curVal);
							} else { // no state or no match for the state, so lets try loading the default content
								self.loadData(opts.targetDefault,false,false);
								
								elem.find("."+opts.selectedClass)
									.removeClass(opts.selectedClass)
									.attr("aria-selected","false");
							}
						}
						opts.lastHashVal = event.getState(hashLabel);
					}).trigger('hashchange.'+hashLabel);
				}
				
				// track that setup is complete
				opts.setupComplete = true;
				opts.focusKeyboard = true; // if it was set to false for initial load
			}
			self._trigger("oncreate", 0, self);
		},
		triggerRow:function(row,event,val){
			// console.debug("triggerRow");
			var opts = this.options, self = this,
				rowID = row.attr("id"),source;
				
			if(!rowID){
				opts.nomatch(opts.hashLabel,val);
				return;
			}
			if(!row.hasClass(opts.selectedClass) || !opts.setupComplete){
				row.addClass(opts.selectedClass)
					.attr("aria-selected","true")
					.siblings("."+opts.selectedClass)
					.removeClass(opts.selectedClass)
					.attr("aria-selected","false");
				if(opts.lastLoad){
					opts.lastLoad.abort();
				}
				self._move();

				self._trigger("onclick", 0, self);
				// console.debug("hi",opts.cache);
				// console.debug(opts.cache["row"+rowID]);
				if(opts.cacheResults && opts.cache["row"+rowID]){
					// console.debug("loading from cache");
					self.loadData(opts.cache["row"+rowID],rowID,event);
				
				} else {
					source = row.find(opts.detailLink).attr("href");
					
					if(source.indexOf("#") !== -1){ // if it's local
						self.loadData($(source),rowID,event);
					} else { // else it's ajax
						// $("#"+opts.loaderID).show();
						self.loaderCreate();
						opts.lastLoad = $.ajax({	
							url:row.find(opts.detailLink).attr("href"),
							success:function(data){
								self.loadData(data,rowID,event);
							},
							error:function(jqXHR, textStatus, errorThrown){
								// abort only fires if *we* abort it, which we do if they arrow to another master. So trigger the error for any other error code
								if(textStatus !== "abort"){
									self.jqXHR = jqXHR; // save off the ajax response for use in the callback
									self._trigger("error", event, self);
									self._loaderDestroy();
								}
							}
						});
					}

				}
				opts.curSelected = row;
			}
		},
		loadData:function(data,rowID,event){
			if(data){
				var opts = this.options, self = this,
					detailTarget = opts.detailTarget,
					bbqstate;
				if(opts.masterChild){
					$("#"+opts.masterChild).data("clearSelected",true);
				}
				
				self._trigger("onbeforeloaddetail", event, self);
				if(opts.load){
					self._trigger("load", event, data);
				} else {
					detailTarget.html(data);
					detailTarget.scrollTop(0); // browsers will keep the same scroll location from the previous content. since we have new content we should treat it as such and scroll to the top
				}
				if(opts.cacheResults && rowID && !opts.cache["row"+rowID]){
					opts.cache["row"+rowID] = data;
				}
				self._trigger("onloaddetail", event, self);
				opts.firstLoad = true; // for tracking if we have done the first load for the BBQ. we don't want to set the sub-master to 0 on the first load as it may be specified in the hash
				
				self.loaderDestroy();
				if(opts.hasBBQ && !opts.masterChild){
					bbqstate = {};

					if(opts.masterParent){
						if(detailTarget.data("clearSelected")){
							// rowID = opts.wrapper.find(opts.rowType+":first").attr("id");
							detailTarget.data("clearSelected",""); //clear it
						}
						bbqstate[opts.masterParent] = $("#"+opts.masterParent).data("loadedID");
					}
					bbqstate[opts.hashLabel] = rowID;
					// console.debug("push",bbqstate,opts.clicked);
					if(opts.clicked){ // only add to the history if something was clicked, this way pushstate isn't called again for forward/back buttons. Otherwise if mergMode is 2 (kill vales that aren't explicitly set), it will screw up the history
						$.bbq.pushState(bbqstate,opts.mergeMode);
					}
					opts.clicked = false;
				}
				if(!opts.hasRows){ // only do this for anchors, basically have to clear the selected row since that isn't what will be showing
					$("#"+detailTarget.data("loadedID")).removeClass(opts.selectedClass);
				}
				detailTarget.data("loadedID",rowID);
			}

		},
		bindKeyboard:function(){
			var opts = this.options, self = this, elem = this.element;
			if(!elem.data("bound")){
				// unbind things just in case so we don't double up
				// due to some weird issues we need to remove for all instances on the page, so use the self.widgetName class
				$(".ixf-"+self.widgetName).masterDetail("unbindKeyboard");
				// console.debug("binding",elem);
				elem.data("bound",true);
				// console.debug(self.widgetName);
				// console.debug($(document).add(opts.filter));
				$(document).bind( "keydown."+self.widgetName, function( event ) {
					// console.debug(2);
					var keyCode = $.ui.keyCode;
					switch( event.keyCode ) {
						case keyCode.UP:
							self._move( "prev", event );
							// prevent moving cursor to beginning of text field in some browsers
							event.preventDefault();
							break;
						case keyCode.DOWN:
							self._move( "next", event );
							// prevent moving cursor to end of text field in some browsers
							event.preventDefault();
							break;
					}
				});

				// now that we are bound, if the user clicks anywhere on the screen other then on the table, unbind stuff so that keys will work accurately in those sections
				$(document).bind("click."+self.widgetName,function(event){
					// console.debug(event);
					var originalElement = event.target;
					var inSelf = false;
					$(originalElement).parents(opts.wrapper).each(function(){
						// console.debug(this == elem[0]);
						if(this === $(opts.filter)[0]){
							// console.debug("filter");
							inSelf = true;
						} else
						if(this === elem[0]){
							// console.debug("in wrapper");
							// leave it
							inSelf = true;
							// console.debug("match!!");
						}

					});
					if(!inSelf && originalElement){
						// remove the bindings
						// console.debug("remove em");
						self.unbindKeyboard();
					}
				});
				self._trigger("onbind", 0, self);
			}
		},
		unbindKeyboard:function(){
			var self = this, elem = this.element;
			// console.debug("unbindKeyboard",elem);
			elem.data("bound",false);
			$(document).unbind('keydown.'+self.widgetName);
			// $(document).unbind('keydown');
			$(document).unbind("click."+self.widgetName);
			self._trigger("onunbind", 0, self);
		},
		_move: function(direction,event){
			var opts = this.options, self = this, elem = this.element,
				currentRow = this.getSelectedRow(),theadHeight;
			// console.debug(currentRow.length);
			// currentRow[direction]().click();
			if(currentRow.length && direction){
				if(direction === "prev"){
					currentRow.prev().click();
				} else if(direction === "next"){
					if(currentRow.next().length){
						currentRow.next().click();
					} else if($(opts.more).length){
						$(opts.more).click();
						currentRow.next().click();
					}
					
				}
			} else if(!currentRow.length) {
				// console.debug("no selected visible, selecting");
				// no row selected (possibly due to filtering, so select the first in the list)
				opts.wrapper.find(opts.rowType+":first").click();
			}

			theadHeight = elem.find("thead").height()? elem.find("thead").height():0;
			// console.debug("hey");
			elem.find(opts.rowType+"."+opts.selectedClass).makeVisible({speed:100,padTop:theadHeight,includePad:true});


			if(event){
				event.preventDefault();
			}
			self._trigger("onmove", event, self);
		},
		getSelectedRow: function(){
			var opts = this.options;
			return $(opts.rowType+'.'+opts.selectedClass+':visible',opts.wrapper);
		},
		getSelectedRowID: function(){
			var opts = this.options;
			return $(opts.rowType,opts.wrapper).index(this.getSelectedRow());
		},
		clearCache:function(rowID){
			if(rowID){
				delete this.options.cache["row"+rowID];
			} else {
				this.options.cache = {};
			}

		},
		loaderCreate: function(){
			var opts = this.options,
				detailTarget = opts.detailTarget;
			this.loaderDestroy();
			 // add a loading element
			// if(!$("#"+opts.loaderID).length){ // only one per page, can be reused by multiple if needed
				opts.loader = $('<div id="'+opts.loaderID+'" class="panel-loading"><p>'+opts.loaderText+'</p><span></span></div>');
				$("body").append(opts.loader);
				var detail = detailTarget.offset();
				var left = detail.left + (detailTarget.width()/2);
				opts.loader.css({
					left: left
				}).show();
			// }
		},
		loaderDestroy:function(){
			var opts = this.options;
			if(opts.loader){
				opts.loader.fadeOut(function(){
					$(this).remove();
				});
			}

		},
		destroy: function() {
			// var opts = this.options;
			$.Widget.prototype.destroy.apply(this, arguments); // call the default stuff
		},
		// rowID = the ID the row should be given. data = a JSON object as shown here http://datatables.net/api for fnAddData, dontFollow = only add the row don't click it
		rowCreate:function(rowID,data,dontFollow){
			var opts = this.options,
				elem = this.element.dataTable(),
				newRow, tr;
			if(opts.rowType === "tr"){
				// it's a table, and we will figure on datatables for now
				newRow = elem.fnAddData(data);
				tr = $(elem.fnGetNodes(newRow));
				tr.attr("id",rowID);
			} // else {
			// 			// uhhh not sure for lists
			// 		}
			if(!dontFollow){
				tr.click();
			}
		},
		// rowID = id of row we are destroying, gotoID = id on the page we should then click
		rowDestroy:function(rowID,gotoID){
			var opts = this.options,
				elem = this.element.dataTable(),
				deletedRow;
			if(opts.rowType === "tr"){
				// it's a table, and we will figure on datatables for now
				if($("#"+rowID).length){
					deletedRow = elem.fnDeleteRow($("#"+rowID)[0]);
				}
				
			} // else {
			// 			// uhhh not sure for lists
			// 		}
			if(gotoID){
				$("#"+gotoID).click();
			}
		}

	});

	$.extend($.ixf.masterDetail, {
		version: "1.2.4"
	});

	})(jQuery);
/*!
 * timePicker
 * @description	A time picker for jQuery UI. Parts taken from timePicker by Sam Collet (http://www.texotela.co.uk/code/jquery/timepicker/)
 * @version		  1.5  - 2010/10/25
 * @copyright   Intellectual Reserve, Inc.
 * @URL         http://irinc.github.com/ixf
 * @requires	  ui.core.js (1.8+)
 * @optional	  scrollTo plugin
 */
(function($) {

	$.widget("ixf.timePicker", {
		options: {
			step:30,
			height:200,
			widthPadding:15,
			separator: ':',
			parseSeparators:'[:;\.,]',
			am: "AM",
			pm: "PM",
			parseAm: '(a|A)', // unique identifier for AM
			duration:60, // default duration for two field set
			autoSelect:true, // should the script always start with an item selected
			enforceRange: true,
			useMakeVisible:true,
			showDuration:true,
			makeVisibleOptions: {pad:10,speed:100},
			uiCorners: "ui-corner-bottom",
			listId: "timepicker-list"
		},
		_create: function() {
			var opts = this.options, self = this, elem = this.element;
			
			// setup up the textfield
			elem
				.data("manualTime",false) // for tracking if they are typing in a time
				.data("canClose",true) // for tracking if we can close the list or not
				.bind("focus.timepicker",function(){
					self.showList();
				}) 
				.bind("blur.timepicker",function() {
					if(elem.data("manualTime")){ // if we had a manually typed time, try and figure out what it was
						elem // set back to defaults for next time
							.data("manualTime",false)
							.data("canClose",true);
						self.fixTime(); // make sure any manual entry is cleaned up (if we can)
						self.setTimeVal(this.value);
						if(opts.onPick && !opts.isSecondField){ opts.onPick.apply(self);}
						if(opts.onPickSecond && opts.isSecondField){ opts.onPickSecond.apply(self);}
					}
					self.hideList();
				})
				.attr('autocomplete', 'OFF') // Disable browser autocomplete
				// Key support
				.bind("keypress.timepicker",function(e) {
					var theList = $("#"+opts.listId),
						prev, next,
						active = theList.find("li.ui-state-hover"); // this is the currently selected time
					switch (e.keyCode) {
						case 38: // Up arrow.
						case 63232: // Safari up arrow.
							prev = active.prev().addClass("ui-state-hover")[0]; // add the hover class to the previous LI
							if(!active.length) {prev = theList.find("li:last").addClass("ui-state-hover")[0];}
							if (prev) {
								active.removeClass("ui-state-hover"); // remove it from the previously active LI
								theList[0].scrollTop = prev.offsetTop; // scroll the div to the newly active LI
							}
							self.element.data("manualTime",false); // clear the manual flag since the key they pressed wasn't a navigation related key
							return false;
						// break;
						case 40: // Down arrow.
						case 63233: // Safari down arrow.
							next = active.next().addClass("ui-state-hover")[0];
							if(!active.length){ next = theList.find("li:first").addClass("ui-state-hover")[0];}
							if (next) {
								active.removeClass("selected ui-state-hover");
								theList[0].scrollTop = next.offsetTop;
							}
							self.element.data("manualTime",false); // clear the manual flag since the key they pressed wasn't a navigation related key
							return false;
						// break;
						case 13: // Enter
							// enter doesn't blur the field (just selects currently highlighted line) so we need to duplicate some of the blur stuff
							if (!theList.is(":hidden") && !self.element.data("manualTime")) {
								$("li.ui-state-hover", theList).trigger("selectIt");
								return false; // clear the manual flag since the key they pressed wasn't a navigation related key
							} else {
								self.element // set back to defaults for next time
									.data("manualTime",false)
									.data("canClose",true);
								self.fixTime(); // make sure any manual entry is cleaned up (if we can)
								self.hideList(theList);
							}
						break;
						case 9: // Tab
							if (!theList.is(":hidden") && !self.element.data("manualTime")) {
								// console.debug("tab with no manual entry")
								// $("li.ui-state-hover", theList).trigger("selectIt");
								self.hideList(theList);
							}
						break;
						default: // anything else
							// if they type anything else they must be manually entering a time, let that override anything selected in the dropdown
							self.element.data("manualTime",true);
						break;
					}
				});
			
			// figure out the start/end times (passed, empty, secondField)
			// copy off the original startTime (for secondField when no firstField is selected)
			if(!opts.isSecondField){
				opts.origStartTime = opts.startTime;
				opts.origEndTime = opts.endTime;
			}

			
			if(typeof opts.startTime != "object"){ opts.startTime = this.normaliseTime(this.timeStringToDate(opts.startTime));}
			if(typeof opts.endTime != "object"){ opts.endTime = this.normaliseTime(this.timeStringToDate(opts.endTime));}
			
			if(!opts.startTime){
				opts.startTime = new Date();
				opts.startTime.setHours(0);
				opts.startTime.setMinutes(0);
				opts.startTime.setSeconds(0);
				// console.debug(opts.startTime);
			}
			
			// var startTime = this.normaliseTime(opts.startTime); // normalize the time

			if(!opts.endTime){
				opts.endTime = new Date();
				opts.endTime.setHours(23);
				opts.endTime.setMinutes(59);
				opts.endTime.setSeconds(59);
				// console.debug(opts.endTime);
			}
			// var endTime = this.normaliseTime(opts.endTime); // normalize the time
			// console.debug(startTime);
			
			opts.timeSpan = opts.endTime - opts.startTime;
			
			// we have a second field, so lets set it up
			if(opts.secondField){
				// make a copy of the options for the second field
				var opts2 = $.extend({}, $.ixf.timePicker.defaults, opts);
				
				// add a few new options
				opts2.secondField = false; // clear out that there is a secondField (since this IS the second field)
				opts2.isSecondField = true; // yup, this is the second field
				opts2.firstField = elem; // keep a copy of what the first field was for reference
				$(opts.secondField).timePicker(opts2); // make the second field dropdown
				this.setDuration(); // set the initial duration (if there is one)
			 }

		},
		destroy: function() {
			var opts = this.options;
			// var uniqueClass = opts.uniqueClass;
			this.element
				.removeClass("ui-accordion ui-widget ui-helper-reset")
				.removeAttr("role")
				.unbind(".timepicker");
			$("#"+opts.listId).remove();
			if(opts.secondField){ $(opts.secondField).timePicker("destroy");}
			$.Widget.prototype.destroy.apply(this, arguments);
			
		},
		hideList: function(){
			if(this.element.data("canClose")){
				$("#"+this.options.listId).remove();
				$("body").unbind("keydown.timepicker");
				this.theList.unbind(".timepicker");
			}
		},
		setTimeVal:function(theTime) {
			var opts = this.options,
				elem = this.element,
				theDur,splitRegex,secondTime,secondTimeDate;
			elem
				.val(theTime)
				.change();
			
			if(opts.secondField && theTime){ // we have a second field, so put an end time in it
				// if()
				theDur = opts.duration; // the default
				
				if($(opts.secondField).data("duration")){ // check for a user set duration (so a value in the second field), that means it trumps the opts value
					theDur = $(opts.secondField).data("duration"); // the duration from the second field
				}
				if(opts.show24Hours){
					// if hour is < 12 and has no am/pm then the date function assumes it is PM for some reason. so for 24 time we need to add an "am" to the time if it is less then 12
					splitRegex = new RegExp(opts.parseSeparators);
					var h = theTime.split(splitRegex); // split on the separator
					if(h[0]<12){
						theTime += opts.am;
					}
				}
				// get the time for the second field which is the currently selected time plus the current duration
				secondTime = this.timeStringToDate(theTime).getTime()+(theDur*60*1000);
				secondTimeDate = new Date(secondTime);
				
				secondTime = this.formatTime(secondTimeDate);
				// check if the end time is after the allowed end time, or before the first field time, but ONLY if there is an origEndTime.  Otherwise we allow 24 hour time so the end time can techincally be before the start time
				if((secondTimeDate.getTime() > opts.endTime.getTime() || secondTimeDate.getTime() < this.timeStringToDate(theTime, opts).getTime()) && opts.origEndTime){
					secondTime = this.theList.find("li:last").find("span").text(); // if we didn't have a time from the line above, we must have gone over the end time, so just grab the last possible time
				}
				if(!opts.firstField && $(opts.secondField).data("duration") != "unknown"){
					$(opts.secondField).val(secondTime); // set the second time to the determined time
				}  else {
					this.setDuration(); // we didn't have one before, so gotta do one now
				}
				if(opts.onAutoAdjust && opts.secondField){opts.onAutoAdjust(opts.secondField);} // fire callback for when we do an auto-adjustment to the second field
			}
			if(opts.isSecondField && opts.firstField.val()){ // if this is the secondField then update the duration attr for next time
				this.setDuration();
			} else if(opts.isSecondField && !opts.firstField.val()){ // changed second field without doing the first field, so make note
				elem.data("duration","unknown");
			}
		},
		showList: function(){
			// console.debug("########showList");
			var opts = this.options, self = this, elem = this.element,
				startTime,endTime,diff,curLI;
			// make sure nothing else is showing
			if($("#"+opts.listId).length){ self.hideList();	}	
			// create the list layer (no data yet)
			var theList = $("#"+opts.listId);
			
			theList = $('<ul role="listbox" aria-activedescendant="ui-active-menuitem" id="'+opts.listId+'" class="ui-timePicker ui-menu ui-widget ui-widget-content '+opts.uiCorners+'"></ul>')
				.css({position:"absolute", top:"0px", left:"0px"})
				.hide()
				.appendTo("body");
				// .append("<ul role='listbox' aria-activedescendant='ui-active-menuitem'></ul>");
			this.theList = theList;
			
			// get a list of the times based off of the startTime/endTime/step options
			
			startTime = opts.startTime;
			endTime = opts.endTime;
			if(opts.isSecondField && opts.firstField.val()){
				// console.debug("getting startDate from first Field");
				startTime = this.normaliseTime(this.timeStringToDate(opts.firstField.val()));
			} 
			// console.debug("first guess at startTime is",startTime);
			// figure out endTime

			if(opts.isSecondField && !opts.origEndTime){
				// console.debug("in second field, but no origEndTime, so must be open ended.  Make it 23:59 hrs after start");
				// console.debug("startTime is ",startTime);
				// endTime = startTime;
				// endTime.setHours(23);
				// endTime.setMinutes(59);
				endTime = new Date(startTime);
				endTime.setMilliseconds(opts.timeSpan);
				// console.debug("new endTime is ",endTime);
			}
			endTime.setSeconds(1); // gotta add a second to the endTime so that the endTime will show up as the last option in the second field (just accept it and move on with your life)
			
			var time = new Date(startTime); // Create a new date object.
			opts.times = [];
			while(time <= endTime) {
				// console.debug("adding time");
				opts.times.push(this.formatTime(time)); // format the time with the provided formatting
				time = new Date(time.setMinutes(time.getMinutes() + opts.step)); // make a new time for the next round
			}
			
			// grab the UL
			var timeList = this.theList.find("li").remove().end();

			if(!opts.isSecondField){opts.numSteps = opts.times.length;}
			
			// loop through the times list and put em into the UL
			for(var i = 0; i < opts.times.length; i++) {
				var extra = "";
				if(opts.isSecondField && opts.firstField.val() && opts.showDuration){
					diff = Math.round(i*opts.step/60*100)/100; // figure the duration time
					extra = " ("+diff+" hrs)";
				}
				
				// need to use span to target time specifically for when we are using the duration text on the second field
				curLI = $("<li class='ui-menu-item' role='menuitem'><a><span>" + opts.times[i]+"</span>" +extra+"</a>" + "</li>").bind("selectIt.timePicker",function(){
					self.element.data("canClose",true);
					self.setTimeVal($(this).find("span").text());
					if(opts.onPick && !opts.isSecondField){ opts.onPick.apply(self);}
					if(opts.onPickSecond && opts.isSecondField){ opts.onPickSecond.apply(self);}
					self.hideList();// then hide the list
					
				}).bind("click.timepicker",function(){
					$(this).trigger("selectIt");
				}).bind("mouseover.timepicker",function() {
					// when I mouse over it... add the needed classes, and remove from the rest
					$(this).addClass("ui-state-hover").siblings().removeClass("ui-state-hover");
				});
				
				$(timeList).append(curLI); // now add the LI to the UL
			}
			
			// position the div to the input field
			var offset = this.element.offset(); // find out where it is
			
			this.theList.css({top:(offset.top + this.element[0].offsetHeight), left:offset.left}).show(); // now position it, and add a class to indicate it is visible
			
			// set the height/width of the box
			// height will be passed in
			// for width, find out how wide the list is and set it to that plus some padding
			var newW = this.theList.width()+opts.widthPadding;// 15 or so for scrollbar + provided padding

			if(elem.width() > newW){
				newW = elem.width();
			}
			
			this.theList.css({height:opts.height,overflow:"auto",width:newW});
			
			if($.fn.makeVisible && opts.useMakeVisible){ this.theList.makeVisible(opts.makeVisibleOptions);}
			
			this.matchTime(); // hilight the correct time based on what is alredy in the timeField
			
			$("body").bind("keydown.timepicker", function(e){ 
				if(e.keyCode == 27){ // close if the user hits esc
					self.hideList();
				}
			});
			
			// when you click on a list item you blur from the field, which hides the list.  so we need to have a way to keep the list open, so track if we are interacting with the list when bluring
			this.theList.bind("mouseover.timepicker",function() {
				self.element.data("canClose",false).data("manualTime",false);
			}).bind("mouseout.timepicker",function() {
				self.element.data("canClose",true);
			});
			
		},
		
		// below here are a bunch of time related utility methods (fix,manipulate,compare,etc)
		fixTime: function() { // this makes sure that the manually entered time is within the allowable range (if we are enforcing that)
			var opts = this.options, self = this, elem = this.element,
				newTime,startTime,endTime;
			if(elem.val()){ //only fix if there is something to fix
				newTime = this.timeStringToDate(elem.val());
				if(newTime && (newTime < opts.startTime || newTime > opts.endTime) && opts.enforceRange){
					// it's outside of the range, so do something about it
					startTime = this.formatTime(opts.startTime);
					endTime = this.formatTime(opts.endTime);
					if(opts.onOutOfRange){ opts.onOutOfRange(elem.val(),startTime,endTime,opts);}
					setTimeout(function(){self.element.val("").focus();},50);
				} else {
					// in normal range, so go about your business
					self.element.val(this.formatTime(newTime));
				}
			}
		},
		formatNumber: function(value) {
			return (value < 10 ? '0' : '') + value;
		},
		formatTime: function(time) {
			time = this.normaliseTime(time);
			var opts = this.options;
			var h = time.getHours();
			var hours = opts.show24Hours ? h : (((h + 11) % 12) + 1);
			var minutes = time.getMinutes();
			return this.formatNumber(hours) + opts.separator + this.formatNumber(minutes) + (opts.show24Hours ? '' : ((h < 12) ? ' '+opts.am : ' '+opts.pm));
		},
		matchTime: function(){
			var opts = this.options, theList = this.theList, elem = this.element,
				matchedTime;
			//removed a bunch of logic to take the input.val convert it into a date and back into text.  Not sure why the complexity was there when we can take the existing text.  Check original script for the logic if is found to be needed.
			if(elem.val()){
				matchedTime = $(theList).find("span:contains("+elem.val()+")");

				// if we have a match, select it and scroll to it
				if (matchedTime.length) {
					matchedTime.parentsUntil("li").addClass("ui-state-hover ui-state-active");
					// Scroll to matched time.
					$(theList)[0].scrollTop = matchedTime.parentsUntil("li")[0].offsetTop;
				}
				// remove any selection if the setting says so, or we don't have a value to start with
				if(!opts.autoSelect && !elem.val()){
					$(theList).find("li").removeClass("ui-state-hover ui-state-active");
				}
			}

		},
		normaliseTime: function(time) {
			// time.setFullYear(2001);
			// time.setMonth(0);
			// time.setDate(0);
			return time;
		},
		setDuration:function (){
			var opts = this.options,
				firstField = opts.isSecondField ? opts.firstField : this.element, // toggle for if the user fills out the end time first
				secondField = opts.isSecondField ? this.element : $(opts.secondField),
				firstTime,secondTime,durTime;

			if(secondField.val()){
				firstTime = this.timeStringToDate(firstField.val()).getTime();
				secondTime = this.timeStringToDate(secondField.val()).getTime();
				durTime = (secondTime - firstTime)/60000; // divide by 60 minutes (* 1000 milliseconds)
				$(secondField).data("duration",durTime);
			}
		},
		timeStringToDate:function(time) {
			// cleaned
			var opts = this.options,
				splitRegex,array,hours,amRegex,minutes;
			if (time) {
				splitRegex = new RegExp(opts.parseSeparators);
				array = time.split(splitRegex); // split on the separator
				if(array.length === 1){ // no splitter, so just one "word"
					array = time.match(/\d+/);
					array[1] = "00";
				}
				hours = parseFloat(array[0]); // get the hour
				if(hours == 12){ hours = 0;} // set to midnight, will check for noon next
				amRegex = new RegExp(opts.parseAm);
				if(!time.match(amRegex) && hours < 13 && !opts.show24Hours){ hours = hours+12;} // is PM so add 12 hours to get back to noon
				minutes = parseFloat(array[1]); // get the minute
				time = new Date();
				// var time = new Date(today.getFullYear(), today.getFullMonth(), 0, hours, minutes, 0); // make the time based on the derived time
				time.setHours(hours);
				time.setMinutes(minutes);
				time.setSeconds(0);
				
				return this.normaliseTime(time);
			}
			return null;
		}
		
	});

	$.extend($.ixf.timePicker, {
		version: "1.5"
	});

	})(jQuery);
/*
Now third party scripts
*/

/**
 * jQuery.ScrollTo - Easy element scrolling using jQuery.
 * Copyright (c) 2007-2009 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * Date: 5/25/2009
 * @author Ariel Flesler
 * @version 1.4.2
 *
 * http://flesler.blogspot.com/2007/10/jqueryscrollto.html
 */
;(function( $ ){
	
	var $scrollTo = $.scrollTo = function( target, duration, settings ){
		$(window).scrollTo( target, duration, settings );
	};

	$scrollTo.defaults = {
		axis:'xy',
		duration: parseFloat($.fn.jquery) >= 1.3 ? 0 : 1
	};

	// Returns the element that needs to be animated to scroll the window.
	// Kept for backwards compatibility (specially for localScroll & serialScroll)
	$scrollTo.window = function( scope ){
		return $(window)._scrollable();
	};

	// Hack, hack, hack :)
	// Returns the real elements to scroll (supports window/iframes, documents and regular nodes)
	$.fn._scrollable = function(){
		return this.map(function(){
			var elem = this,
				isWin = !elem.nodeName || $.inArray( elem.nodeName.toLowerCase(), ['iframe','#document','html','body'] ) != -1;

				if( !isWin )
					return elem;

			var doc = (elem.contentWindow || elem).document || elem.ownerDocument || elem;
			
			return $.browser.safari || doc.compatMode == 'BackCompat' ?
				doc.body : 
				doc.documentElement;
		});
	};

	$.fn.scrollTo = function( target, duration, settings ){
		if( typeof duration == 'object' ){
			settings = duration;
			duration = 0;
		}
		if( typeof settings == 'function' )
			settings = { onAfter:settings };
			
		if( target == 'max' )
			target = 9e9;
			
		settings = $.extend( {}, $scrollTo.defaults, settings );
		// Speed is still recognized for backwards compatibility
		duration = duration || settings.speed || settings.duration;
		// Make sure the settings are given right
		settings.queue = settings.queue && settings.axis.length > 1;
		
		if( settings.queue )
			// Let's keep the overall duration
			duration /= 2;
		settings.offset = both( settings.offset );
		settings.over = both( settings.over );

		return this._scrollable().each(function(){
			var elem = this,
				$elem = $(elem),
				targ = target, toff, attr = {},
				win = $elem.is('html,body');

			switch( typeof targ ){
				// A number will pass the regex
				case 'number':
				case 'string':
					if( /^([+-]=)?\d+(\.\d+)?(px|%)?$/.test(targ) ){
						targ = both( targ );
						// We are done
						break;
					}
					// Relative selector, no break!
					targ = $(targ,this);
				case 'object':
					// DOMElement / jQuery
					if( targ.is || targ.style )
						// Get the real position of the target 
						toff = (targ = $(targ)).offset();
			}
			$.each( settings.axis.split(''), function( i, axis ){
				var Pos	= axis == 'x' ? 'Left' : 'Top',
					pos = Pos.toLowerCase(),
					key = 'scroll' + Pos,
					old = elem[key],
					max = $scrollTo.max(elem, axis);

				if( toff ){// jQuery / DOMElement
					attr[key] = toff[pos] + ( win ? 0 : old - $elem.offset()[pos] );

					// If it's a dom element, reduce the margin
					if( settings.margin ){
						attr[key] -= parseInt(targ.css('margin'+Pos)) || 0;
						attr[key] -= parseInt(targ.css('border'+Pos+'Width')) || 0;
					}
					
					attr[key] += settings.offset[pos] || 0;
					
					if( settings.over[pos] )
						// Scroll to a fraction of its width/height
						attr[key] += targ[axis=='x'?'width':'height']() * settings.over[pos];
				}else{ 
					var val = targ[pos];
					// Handle percentage values
					attr[key] = val.slice && val.slice(-1) == '%' ? 
						parseFloat(val) / 100 * max
						: val;
				}

				// Number or 'number'
				if( /^\d+$/.test(attr[key]) )
					// Check the limits
					attr[key] = attr[key] <= 0 ? 0 : Math.min( attr[key], max );

				// Queueing axes
				if( !i && settings.queue ){
					// Don't waste time animating, if there's no need.
					if( old != attr[key] )
						// Intermediate animation
						animate( settings.onAfterFirst );
					// Don't animate this axis again in the next iteration.
					delete attr[key];
				}
			});

			animate( settings.onAfter );			

			function animate( callback ){
				$elem.animate( attr, duration, settings.easing, callback && function(){
					callback.call(this, target, settings);
				});
			};

		}).end();
	};
	
	// Max scrolling position, works on quirks mode
	// It only fails (not too badly) on IE, quirks mode.
	$scrollTo.max = function( elem, axis ){
		var Dim = axis == 'x' ? 'Width' : 'Height',
			scroll = 'scroll'+Dim;
		
		if( !$(elem).is('html,body') )
			return elem[scroll] - $(elem)[Dim.toLowerCase()]();
		
		var size = 'client' + Dim,
			html = elem.ownerDocument.documentElement,
			body = elem.ownerDocument.body;

		return Math.max( html[scroll], body[scroll] ) 
			 - Math.min( html[size]  , body[size]   );
			
	};

	function both( val ){
		return typeof val == 'object' ? val : { top:val, left:val };
	};

})( jQuery );
/*!
 * jScrollTouch plugin 1.0 - http://www.dealinium.com/common/jScrollTouch
 *
 * Copyright (c) 2010 Damien Rottemberg
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Updated by Aaron Barker to newer jQuery stuff
 */
(function($){
	  $.fn.jTouchScroll = function () {
		var isTouchScreen;
		if((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i)) || (navigator.userAgent.match(/iPad/i))) {
			isTouchScreen = 1;
		}else{
			isTouchScreen = 0;
			return;
		}
		$(this).css({'overflow': 'auto'});
			return this.each(function() {
				var cont = $(this),
					height = 0,
					cpos = cont.scrollTop();
		
				cont.scrollTop(100000);
				height = cont.scrollTop();
				cont.scrollTop(cpos);
			
				cont.bind('mousedown touchstart',function(e){
					cpos = cont.scrollTop();
							
					if(isTouchScreen){
						e = e.originalEvent.touches[0];
					}
					
					var sY = e.pageY;
					
					cont.bind('mousemove touchmove',function(ev){
						if(isTouchScreen){
							ev.preventDefault();
							ev = ev.originalEvent.touches[0];
						}	
						var top = cpos-(ev.pageY-sY);
							
						cont.scrollTop(top);
						cpos = cont.scrollTop();
						sY = ev.pageY;
					});
					cont.bind('mouseup touchend',function(ev){	
						cont.unbind('mousemove touchmove mouseup touchend');
						
					});
				});
			});
		};
	})(jQuery);
/*!
 * jQuery.ScrollTo - Easy element scrolling using jQuery.
 * Copyright (c) 2007-2009 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * Date: 5/25/2009
 * @author Ariel Flesler
 * @version 1.4.2
 *
 * http://flesler.blogspot.com/2007/10/jqueryscrollto.html
 */
(function( $ ){

	var $scrollTo = $.scrollTo = function( target, duration, settings ){
		$(window).scrollTo( target, duration, settings );
	};

	$scrollTo.defaults = {
		axis:'xy',
		duration: parseFloat($.fn.jquery) >= 1.3 ? 0 : 1
	};

	// Returns the element that needs to be animated to scroll the window.
	// Kept for backwards compatibility (specially for localScroll & serialScroll)
	$scrollTo.window = function( scope ){
		return $(window)._scrollable();
	};

	// Hack, hack, hack :)
	// Returns the real elements to scroll (supports window/iframes, documents and regular nodes)
	$.fn._scrollable = function(){
		return this.map(function(){
			var elem = this,
				isWin = !elem.nodeName || $.inArray( elem.nodeName.toLowerCase(), ['iframe','#document','html','body'] ) != -1;

				if( !isWin )
					return elem;

			var doc = (elem.contentWindow || elem).document || elem.ownerDocument || elem;

			return $.browser.safari || doc.compatMode == 'BackCompat' ?
				doc.body :
				doc.documentElement;
		});
	};

	$.fn.scrollTo = function( target, duration, settings ){
		if( typeof duration == 'object' ){
			settings = duration;
			duration = 0;
		}
		if( typeof settings == 'function' )
			settings = { onAfter:settings };

		if( target == 'max' )
			target = 9e9;

		settings = $.extend( {}, $scrollTo.defaults, settings );
		// Speed is still recognized for backwards compatibility
		duration = duration || settings.speed || settings.duration;
		// Make sure the settings are given right
		settings.queue = settings.queue && settings.axis.length > 1;

		if( settings.queue )
			// Let's keep the overall duration
			duration /= 2;
		settings.offset = both( settings.offset );
		settings.over = both( settings.over );

		return this._scrollable().each(function(){
			var elem = this,
				$elem = $(elem),
				targ = target, toff, attr = {},
				win = $elem.is('html,body');

			switch( typeof targ ){
				// A number will pass the regex
				case 'number':
				case 'string':
					if( /^([+-]=)?\d+(\.\d+)?(px|%)?$/.test(targ) ){
						targ = both( targ );
						// We are done
						break;
					}
					// Relative selector, no break!
					targ = $(targ,this);
				case 'object':
					// DOMElement / jQuery
					if( targ.is || targ.style )
						// Get the real position of the target
						toff = (targ = $(targ)).offset();
			}
			$.each( settings.axis.split(''), function( i, axis ){
				var Pos	= axis == 'x' ? 'Left' : 'Top',
					pos = Pos.toLowerCase(),
					key = 'scroll' + Pos,
					old = elem[key],
					max = $scrollTo.max(elem, axis);

				if( toff ){// jQuery / DOMElement
					attr[key] = toff[pos] + ( win ? 0 : old - $elem.offset()[pos] );

					// If it's a dom element, reduce the margin
					if( settings.margin ){
						attr[key] -= parseInt(targ.css('margin'+Pos)) || 0;
						attr[key] -= parseInt(targ.css('border'+Pos+'Width')) || 0;
					}

					attr[key] += settings.offset[pos] || 0;

					if( settings.over[pos] )
						// Scroll to a fraction of its width/height
						attr[key] += targ[axis=='x'?'width':'height']() * settings.over[pos];
				}else{
					var val = targ[pos];
					// Handle percentage values
					attr[key] = val.slice && val.slice(-1) == '%' ?
						parseFloat(val) / 100 * max
						: val;
				}

				// Number or 'number'
				if( /^\d+$/.test(attr[key]) )
					// Check the limits
					attr[key] = attr[key] <= 0 ? 0 : Math.min( attr[key], max );

				// Queueing axes
				if( !i && settings.queue ){
					// Don't waste time animating, if there's no need.
					if( old != attr[key] )
						// Intermediate animation
						animate( settings.onAfterFirst );
					// Don't animate this axis again in the next iteration.
					delete attr[key];
				}
			});

			animate( settings.onAfter );

			function animate( callback ){
				$elem.animate( attr, duration, settings.easing, callback && function(){
					callback.call(this, target, settings);
				});
			};

		}).end();
	};

	// Max scrolling position, works on quirks mode
	// It only fails (not too badly) on IE, quirks mode.
	$scrollTo.max = function( elem, axis ){
		var Dim = axis == 'x' ? 'Width' : 'Height',
			scroll = 'scroll'+Dim;

		if( !$(elem).is('html,body') )
			return elem[scroll] - $(elem)[Dim.toLowerCase()]();

		var size = 'client' + Dim,
			html = elem.ownerDocument.documentElement,
			body = elem.ownerDocument.body;

		return Math.max( html[scroll], body[scroll] )
			 - Math.min( html[size]  , body[size]   );

	};

	function both( val ){
		return typeof val == 'object' ? val : { top:val, left:val };
	};

})( jQuery );
/*!
 * jQuery BBQ: Back Button & Query Library - v1.2.1 - 2/17/2010
 * http://benalman.com/projects/jquery-bbq-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function($,window){
	  '$:nomunge'; // Used by YUI compressor.
	  
	  // Some convenient shortcuts.
	  var undefined,
	    aps = Array.prototype.slice,
	    decode = decodeURIComponent,
	    
	    // Method / object references.
	    jq_param = $.param,
	    jq_param_fragment,
	    jq_deparam,
	    jq_deparam_fragment,
	    jq_bbq = $.bbq = $.bbq || {},
	    jq_bbq_pushState,
	    jq_bbq_getState,
	    jq_elemUrlAttr,
	    jq_event_special = $.event.special,
	    
	    // Reused strings.
	    str_hashchange = 'hashchange',
	    str_querystring = 'querystring',
	    str_fragment = 'fragment',
	    str_elemUrlAttr = 'elemUrlAttr',
	    str_location = 'location',
	    str_href = 'href',
	    str_src = 'src',
	    
	    // Reused RegExp.
	    re_trim_querystring = /^.*\?|#.*$/g,
	    re_trim_fragment = /^.*\#/,
	    re_no_escape,
	    
	    // Used by jQuery.elemUrlAttr.
	    elemUrlAttr_cache = {};
	  
	  // A few commonly used bits, broken out to help reduce minified file size.
	  
	  function is_string( arg ) {
	    return typeof arg === 'string';
	  };
	  
	  // Why write the same function twice? Let's curry! Mmmm, curry..
	  
	  function curry( func ) {
	    var args = aps.call( arguments, 1 );
	    
	    return function() {
	      return func.apply( this, args.concat( aps.call( arguments ) ) );
	    };
	  };
	  
	  // Get location.hash (or what you'd expect location.hash to be) sans any
	  // leading #. Thanks for making this necessary, Firefox!
	  function get_fragment( url ) {
	    return url.replace( /^[^#]*#?(.*)$/, '$1' );
	  };
	  
	  // Get location.search (or what you'd expect location.search to be) sans any
	  // leading #. Thanks for making this necessary, IE6!
	  function get_querystring( url ) {
	    return url.replace( /(?:^[^?#]*\?([^#]*).*$)?.*/, '$1' );
	  };
	  
	  // Section: Param (to string)
	  // 
	  // Method: jQuery.param.querystring
	  // 
	  // Retrieve the query string from a URL or if no arguments are passed, the
	  // current window.location.
	  // 
	  // Usage:
	  // 
	  // > jQuery.param.querystring( [ url ] );
	  // 
	  // Arguments:
	  // 
	  //  url - (String) A URL containing query string params to be parsed. If url
	  //    is not passed, the current window.location is used.
	  // 
	  // Returns:
	  // 
	  //  (String) The parsed query string, with any leading "?" removed.
	  //
	  
	  // Method: jQuery.param.querystring (build url)
	  // 
	  // Merge a URL, with or without pre-existing query string params, plus any
	  // object, params string or URL containing query string params into a new URL.
	  // 
	  // Usage:
	  // 
	  // > jQuery.param.querystring( url, params [, merge_mode ] );
	  // 
	  // Arguments:
	  // 
	  //  url - (String) A valid URL for params to be merged into. This URL may
	  //    contain a query string and/or fragment (hash).
	  //  params - (String) A params string or URL containing query string params to
	  //    be merged into url.
	  //  params - (Object) A params object to be merged into url.
	  //  merge_mode - (Number) Merge behavior defaults to 0 if merge_mode is not
	  //    specified, and is as-follows:
	  // 
	  //    * 0: params in the params argument will override any query string
	  //         params in url.
	  //    * 1: any query string params in url will override params in the params
	  //         argument.
	  //    * 2: params argument will completely replace any query string in url.
	  // 
	  // Returns:
	  // 
	  //  (String) Either a params string with urlencoded data or a URL with a
	  //    urlencoded query string in the format 'a=b&c=d&e=f'.
	  
	  // Method: jQuery.param.fragment
	  // 
	  // Retrieve the fragment (hash) from a URL or if no arguments are passed, the
	  // current window.location.
	  // 
	  // Usage:
	  // 
	  // > jQuery.param.fragment( [ url ] );
	  // 
	  // Arguments:
	  // 
	  //  url - (String) A URL containing fragment (hash) params to be parsed. If
	  //    url is not passed, the current window.location is used.
	  // 
	  // Returns:
	  // 
	  //  (String) The parsed fragment (hash) string, with any leading "#" removed.
	  
	  // Method: jQuery.param.fragment (build url)
	  // 
	  // Merge a URL, with or without pre-existing fragment (hash) params, plus any
	  // object, params string or URL containing fragment (hash) params into a new
	  // URL.
	  // 
	  // Usage:
	  // 
	  // > jQuery.param.fragment( url, params [, merge_mode ] );
	  // 
	  // Arguments:
	  // 
	  //  url - (String) A valid URL for params to be merged into. This URL may
	  //    contain a query string and/or fragment (hash).
	  //  params - (String) A params string or URL containing fragment (hash) params
	  //    to be merged into url.
	  //  params - (Object) A params object to be merged into url.
	  //  merge_mode - (Number) Merge behavior defaults to 0 if merge_mode is not
	  //    specified, and is as-follows:
	  // 
	  //    * 0: params in the params argument will override any fragment (hash)
	  //         params in url.
	  //    * 1: any fragment (hash) params in url will override params in the
	  //         params argument.
	  //    * 2: params argument will completely replace any query string in url.
	  // 
	  // Returns:
	  // 
	  //  (String) Either a params string with urlencoded data or a URL with a
	  //    urlencoded fragment (hash) in the format 'a=b&c=d&e=f'.
	  
	  function jq_param_sub( is_fragment, get_func, url, params, merge_mode ) {
	    var result,
	      qs,
	      matches,
	      url_params,
	      hash;
	    
	    if ( params !== undefined ) {
	      // Build URL by merging params into url string.
	      
	      // matches[1] = url part that precedes params, not including trailing ?/#
	      // matches[2] = params, not including leading ?/#
	      // matches[3] = if in 'querystring' mode, hash including leading #, otherwise ''
	      matches = url.match( is_fragment ? /^([^#]*)\#?(.*)$/ : /^([^#?]*)\??([^#]*)(#?.*)/ );
	      
	      // Get the hash if in 'querystring' mode, and it exists.
	      hash = matches[3] || '';
	      
	      if ( merge_mode === 2 && is_string( params ) ) {
	        // If merge_mode is 2 and params is a string, merge the fragment / query
	        // string into the URL wholesale, without converting it into an object.
	        qs = params.replace( is_fragment ? re_trim_fragment : re_trim_querystring, '' );
	        
	      } else {
	        // Convert relevant params in url to object.
	        url_params = jq_deparam( matches[2] );
	        
	        params = is_string( params )
	          
	          // Convert passed params string into object.
	          ? jq_deparam[ is_fragment ? str_fragment : str_querystring ]( params )
	          
	          // Passed params object.
	          : params;
	        
	        qs = merge_mode === 2 ? params                              // passed params replace url params
	          : merge_mode === 1  ? $.extend( {}, params, url_params )  // url params override passed params
	          : $.extend( {}, url_params, params );                     // passed params override url params
	        
	        // Convert params object to a string.
	        qs = jq_param( qs );
	        
	        // Unescape characters specified via $.param.noEscape. Since only hash-
	        // history users have requested this feature, it's only enabled for
	        // fragment-related params strings.
	        if ( is_fragment ) {
	          qs = qs.replace( re_no_escape, decode );
	        }
	      }
	      
	      // Build URL from the base url, querystring and hash. In 'querystring'
	      // mode, ? is only added if a query string exists. In 'fragment' mode, #
	      // is always added.
	      result = matches[1] + ( is_fragment ? '#' : qs || !matches[1] ? '?' : '' ) + qs + hash;
	      
	    } else {
	      // If URL was passed in, parse params from URL string, otherwise parse
	      // params from window.location.
	      result = get_func( url !== undefined ? url : window[ str_location ][ str_href ] );
	    }
	    
	    return result;
	  };
	  
	  jq_param[ str_querystring ]                  = curry( jq_param_sub, 0, get_querystring );
	  jq_param[ str_fragment ] = jq_param_fragment = curry( jq_param_sub, 1, get_fragment );
	  
	  // Method: jQuery.param.fragment.noEscape
	  // 
	  // Specify characters that will be left unescaped when fragments are created
	  // or merged using <jQuery.param.fragment>, or when the fragment is modified
	  // using <jQuery.bbq.pushState>. This option only applies to serialized data
	  // object fragments, and not set-as-string fragments. Does not affect the
	  // query string. Defaults to ",/" (comma, forward slash).
	  // 
	  // Note that this is considered a purely aesthetic option, and will help to
	  // create URLs that "look pretty" in the address bar or bookmarks, without
	  // affecting functionality in any way. That being said, be careful to not
	  // unescape characters that are used as delimiters or serve a special
	  // purpose, such as the "#?&=+" (octothorpe, question mark, ampersand,
	  // equals, plus) characters.
	  // 
	  // Usage:
	  // 
	  // > jQuery.param.fragment.noEscape( [ chars ] );
	  // 
	  // Arguments:
	  // 
	  //  chars - (String) The characters to not escape in the fragment. If
	  //    unspecified, defaults to empty string (escape all characters).
	  // 
	  // Returns:
	  // 
	  //  Nothing.
	  
	  jq_param_fragment.noEscape = function( chars ) {
	    chars = chars || '';
	    var arr = $.map( chars.split(''), encodeURIComponent );
	    re_no_escape = new RegExp( arr.join('|'), 'g' );
	  };
	  
	  // A sensible default. These are the characters people seem to complain about
	  // "uglifying up the URL" the most.
	  jq_param_fragment.noEscape( ',/' );
	  
	  // Section: Deparam (from string)
	  // 
	  // Method: jQuery.deparam
	  // 
	  // Deserialize a params string into an object, optionally coercing numbers,
	  // booleans, null and undefined values; this method is the counterpart to the
	  // internal jQuery.param method.
	  // 
	  // Usage:
	  // 
	  // > jQuery.deparam( params [, coerce ] );
	  // 
	  // Arguments:
	  // 
	  //  params - (String) A params string to be parsed.
	  //  coerce - (Boolean) If true, coerces any numbers or true, false, null, and
	  //    undefined to their actual value. Defaults to false if omitted.
	  // 
	  // Returns:
	  // 
	  //  (Object) An object representing the deserialized params string.
	  
	  $.deparam = jq_deparam = function( params, coerce ) {
	    var obj = {},
	      coerce_types = { 'true': !0, 'false': !1, 'null': null };
	    
	    // Iterate over all name=value pairs.
	    $.each( params.replace( /\+/g, ' ' ).split( '&' ), function(j,v){
	      var param = v.split( '=' ),
	        key = decode( param[0] ),
	        val,
	        cur = obj,
	        i = 0,
	        
	        // If key is more complex than 'foo', like 'a[]' or 'a[b][c]', split it
	        // into its component parts.
	        keys = key.split( '][' ),
	        keys_last = keys.length - 1;
	      
	      // If the first keys part contains [ and the last ends with ], then []
	      // are correctly balanced.
	      if ( /\[/.test( keys[0] ) && /\]$/.test( keys[ keys_last ] ) ) {
	        // Remove the trailing ] from the last keys part.
	        keys[ keys_last ] = keys[ keys_last ].replace( /\]$/, '' );
	        
	        // Split first keys part into two parts on the [ and add them back onto
	        // the beginning of the keys array.
	        keys = keys.shift().split('[').concat( keys );
	        
	        keys_last = keys.length - 1;
	      } else {
	        // Basic 'foo' style key.
	        keys_last = 0;
	      }
	      
	      // Are we dealing with a name=value pair, or just a name?
	      if ( param.length === 2 ) {
	        val = decode( param[1] );
	        
	        // Coerce values.
	        if ( coerce ) {
	          val = val && !isNaN(val)            ? +val              // number
	            : val === 'undefined'             ? undefined         // undefined
	            : coerce_types[val] !== undefined ? coerce_types[val] // true, false, null
	            : val;                                                // string
	        }
	        
	        if ( keys_last ) {
	          // Complex key, build deep object structure based on a few rules:
	          // * The 'cur' pointer starts at the object top-level.
	          // * [] = array push (n is set to array length), [n] = array if n is 
	          //   numeric, otherwise object.
	          // * If at the last keys part, set the value.
	          // * For each keys part, if the current level is undefined create an
	          //   object or array based on the type of the next keys part.
	          // * Move the 'cur' pointer to the next level.
	          // * Rinse & repeat.
	          for ( ; i <= keys_last; i++ ) {
	            key = keys[i] === '' ? cur.length : keys[i];
	            cur = cur[key] = i < keys_last
	              ? cur[key] || ( keys[i+1] && isNaN( keys[i+1] ) ? {} : [] )
	              : val;
	          }
	          
	        } else {
	          // Simple key, even simpler rules, since only scalars and shallow
	          // arrays are allowed.
	          
	          if ( $.isArray( obj[key] ) ) {
	            // val is already an array, so push on the next value.
	            obj[key].push( val );
	            
	          } else if ( obj[key] !== undefined ) {
	            // val isn't an array, but since a second value has been specified,
	            // convert val into an array.
	            obj[key] = [ obj[key], val ];
	            
	          } else {
	            // val is a scalar.
	            obj[key] = val;
	          }
	        }
	        
	      } else if ( key ) {
	        // No value was defined, so set something meaningful.
	        obj[key] = coerce
	          ? undefined
	          : '';
	      }
	    });
	    
	    return obj;
	  };
	  
	  // Method: jQuery.deparam.querystring
	  // 
	  // Parse the query string from a URL or the current window.location,
	  // deserializing it into an object, optionally coercing numbers, booleans,
	  // null and undefined values.
	  // 
	  // Usage:
	  // 
	  // > jQuery.deparam.querystring( [ url ] [, coerce ] );
	  // 
	  // Arguments:
	  // 
	  //  url - (String) An optional params string or URL containing query string
	  //    params to be parsed. If url is omitted, the current window.location
	  //    is used.
	  //  coerce - (Boolean) If true, coerces any numbers or true, false, null, and
	  //    undefined to their actual value. Defaults to false if omitted.
	  // 
	  // Returns:
	  // 
	  //  (Object) An object representing the deserialized params string.
	  
	  // Method: jQuery.deparam.fragment
	  // 
	  // Parse the fragment (hash) from a URL or the current window.location,
	  // deserializing it into an object, optionally coercing numbers, booleans,
	  // null and undefined values.
	  // 
	  // Usage:
	  // 
	  // > jQuery.deparam.fragment( [ url ] [, coerce ] );
	  // 
	  // Arguments:
	  // 
	  //  url - (String) An optional params string or URL containing fragment (hash)
	  //    params to be parsed. If url is omitted, the current window.location
	  //    is used.
	  //  coerce - (Boolean) If true, coerces any numbers or true, false, null, and
	  //    undefined to their actual value. Defaults to false if omitted.
	  // 
	  // Returns:
	  // 
	  //  (Object) An object representing the deserialized params string.
	  
	  function jq_deparam_sub( is_fragment, url_or_params, coerce ) {
	    if ( url_or_params === undefined || typeof url_or_params === 'boolean' ) {
	      // url_or_params not specified.
	      coerce = url_or_params;
	      url_or_params = jq_param[ is_fragment ? str_fragment : str_querystring ]();
	    } else {
	      url_or_params = is_string( url_or_params )
	        ? url_or_params.replace( is_fragment ? re_trim_fragment : re_trim_querystring, '' )
	        : url_or_params;
	    }
	    
	    return jq_deparam( url_or_params, coerce );
	  };
	  
	  jq_deparam[ str_querystring ]                    = curry( jq_deparam_sub, 0 );
	  jq_deparam[ str_fragment ] = jq_deparam_fragment = curry( jq_deparam_sub, 1 );
	  
	  // Section: Element manipulation
	  // 
	  // Method: jQuery.elemUrlAttr
	  // 
	  // Get the internal "Default URL attribute per tag" list, or augment the list
	  // with additional tag-attribute pairs, in case the defaults are insufficient.
	  // 
	  // In the <jQuery.fn.querystring> and <jQuery.fn.fragment> methods, this list
	  // is used to determine which attribute contains the URL to be modified, if
	  // an "attr" param is not specified.
	  // 
	  // Default Tag-Attribute List:
	  // 
	  //  a      - href
	  //  base   - href
	  //  iframe - src
	  //  img    - src
	  //  input  - src
	  //  form   - action
	  //  link   - href
	  //  script - src
	  // 
	  // Usage:
	  // 
	  // > jQuery.elemUrlAttr( [ tag_attr ] );
	  // 
	  // Arguments:
	  // 
	  //  tag_attr - (Object) An object containing a list of tag names and their
	  //    associated default attribute names in the format { tag: 'attr', ... } to
	  //    be merged into the internal tag-attribute list.
	  // 
	  // Returns:
	  // 
	  //  (Object) An object containing all stored tag-attribute values.
	  
	  // Only define function and set defaults if function doesn't already exist, as
	  // the urlInternal plugin will provide this method as well.
	  $[ str_elemUrlAttr ] || ($[ str_elemUrlAttr ] = function( obj ) {
	    return $.extend( elemUrlAttr_cache, obj );
	  })({
	    a: str_href,
	    base: str_href,
	    iframe: str_src,
	    img: str_src,
	    input: str_src,
	    form: 'action',
	    link: str_href,
	    script: str_src
	  });
	  
	  jq_elemUrlAttr = $[ str_elemUrlAttr ];
	  
	  // Method: jQuery.fn.querystring
	  // 
	  // Update URL attribute in one or more elements, merging the current URL (with
	  // or without pre-existing query string params) plus any params object or
	  // string into a new URL, which is then set into that attribute. Like
	  // <jQuery.param.querystring (build url)>, but for all elements in a jQuery
	  // collection.
	  // 
	  // Usage:
	  // 
	  // > jQuery('selector').querystring( [ attr, ] params [, merge_mode ] );
	  // 
	  // Arguments:
	  // 
	  //  attr - (String) Optional name of an attribute that will contain a URL to
	  //    merge params or url into. See <jQuery.elemUrlAttr> for a list of default
	  //    attributes.
	  //  params - (Object) A params object to be merged into the URL attribute.
	  //  params - (String) A URL containing query string params, or params string
	  //    to be merged into the URL attribute.
	  //  merge_mode - (Number) Merge behavior defaults to 0 if merge_mode is not
	  //    specified, and is as-follows:
	  //    
	  //    * 0: params in the params argument will override any params in attr URL.
	  //    * 1: any params in attr URL will override params in the params argument.
	  //    * 2: params argument will completely replace any query string in attr
	  //         URL.
	  // 
	  // Returns:
	  // 
	  //  (jQuery) The initial jQuery collection of elements, but with modified URL
	  //  attribute values.
	  
	  // Method: jQuery.fn.fragment
	  // 
	  // Update URL attribute in one or more elements, merging the current URL (with
	  // or without pre-existing fragment/hash params) plus any params object or
	  // string into a new URL, which is then set into that attribute. Like
	  // <jQuery.param.fragment (build url)>, but for all elements in a jQuery
	  // collection.
	  // 
	  // Usage:
	  // 
	  // > jQuery('selector').fragment( [ attr, ] params [, merge_mode ] );
	  // 
	  // Arguments:
	  // 
	  //  attr - (String) Optional name of an attribute that will contain a URL to
	  //    merge params into. See <jQuery.elemUrlAttr> for a list of default
	  //    attributes.
	  //  params - (Object) A params object to be merged into the URL attribute.
	  //  params - (String) A URL containing fragment (hash) params, or params
	  //    string to be merged into the URL attribute.
	  //  merge_mode - (Number) Merge behavior defaults to 0 if merge_mode is not
	  //    specified, and is as-follows:
	  //    
	  //    * 0: params in the params argument will override any params in attr URL.
	  //    * 1: any params in attr URL will override params in the params argument.
	  //    * 2: params argument will completely replace any fragment (hash) in attr
	  //         URL.
	  // 
	  // Returns:
	  // 
	  //  (jQuery) The initial jQuery collection of elements, but with modified URL
	  //  attribute values.
	  
	  function jq_fn_sub( mode, force_attr, params, merge_mode ) {
	    if ( !is_string( params ) && typeof params !== 'object' ) {
	      // force_attr not specified.
	      merge_mode = params;
	      params = force_attr;
	      force_attr = undefined;
	    }
	    
	    return this.each(function(){
	      var that = $(this),
	        
	        // Get attribute specified, or default specified via $.elemUrlAttr.
	        attr = force_attr || jq_elemUrlAttr()[ ( this.nodeName || '' ).toLowerCase() ] || '',
	        
	        // Get URL value.
	        url = attr && that.attr( attr ) || '';
	      
	      // Update attribute with new URL.
	      that.attr( attr, jq_param[ mode ]( url, params, merge_mode ) );
	    });
	    
	  };
	  
	  $.fn[ str_querystring ] = curry( jq_fn_sub, str_querystring );
	  $.fn[ str_fragment ]    = curry( jq_fn_sub, str_fragment );
	  
	  // Section: History, hashchange event
	  // 
	  // Method: jQuery.bbq.pushState
	  // 
	  // Adds a 'state' into the browser history at the current position, setting
	  // location.hash and triggering any bound <hashchange event> callbacks
	  // (provided the new state is different than the previous state).
	  // 
	  // If no arguments are passed, an empty state is created, which is just a
	  // shortcut for jQuery.bbq.pushState( {}, 2 ).
	  // 
	  // Usage:
	  // 
	  // > jQuery.bbq.pushState( [ params [, merge_mode ] ] );
	  // 
	  // Arguments:
	  // 
	  //  params - (String) A serialized params string or a hash string beginning
	  //    with # to merge into location.hash.
	  //  params - (Object) A params object to merge into location.hash.
	  //  merge_mode - (Number) Merge behavior defaults to 0 if merge_mode is not
	  //    specified (unless a hash string beginning with # is specified, in which
	  //    case merge behavior defaults to 2), and is as-follows:
	  // 
	  //    * 0: params in the params argument will override any params in the
	  //         current state.
	  //    * 1: any params in the current state will override params in the params
	  //         argument.
	  //    * 2: params argument will completely replace current state.
	  // 
	  // Returns:
	  // 
	  //  Nothing.
	  // 
	  // Additional Notes:
	  // 
	  //  * Setting an empty state may cause the browser to scroll.
	  //  * Unlike the fragment and querystring methods, if a hash string beginning
	  //    with # is specified as the params agrument, merge_mode defaults to 2.
	  
	  jq_bbq.pushState = jq_bbq_pushState = function( params, merge_mode ) {
	    if ( is_string( params ) && /^#/.test( params ) && merge_mode === undefined ) {
	      // Params string begins with # and merge_mode not specified, so completely
	      // overwrite window.location.hash.
	      merge_mode = 2;
	    }
	    
	    var has_args = params !== undefined,
	      // Merge params into window.location using $.param.fragment.
	      url = jq_param_fragment( window[ str_location ][ str_href ],
	        has_args ? params : {}, has_args ? merge_mode : 2 );
	    
	    // Set new window.location.href. If hash is empty, use just # to prevent
	    // browser from reloading the page. Note that Safari 3 & Chrome barf on
	    // location.hash = '#'.
	    window[ str_location ][ str_href ] = url + ( /#/.test( url ) ? '' : '#' );
	  };
	  
	  // Method: jQuery.bbq.getState
	  // 
	  // Retrieves the current 'state' from the browser history, parsing
	  // location.hash for a specific key or returning an object containing the
	  // entire state, optionally coercing numbers, booleans, null and undefined
	  // values.
	  // 
	  // Usage:
	  // 
	  // > jQuery.bbq.getState( [ key ] [, coerce ] );
	  // 
	  // Arguments:
	  // 
	  //  key - (String) An optional state key for which to return a value.
	  //  coerce - (Boolean) If true, coerces any numbers or true, false, null, and
	  //    undefined to their actual value. Defaults to false.
	  // 
	  // Returns:
	  // 
	  //  (Anything) If key is passed, returns the value corresponding with that key
	  //    in the location.hash 'state', or undefined. If not, an object
	  //    representing the entire 'state' is returned.
	  
	  jq_bbq.getState = jq_bbq_getState = function( key, coerce ) {
	    return key === undefined || typeof key === 'boolean'
	      ? jq_deparam_fragment( key ) // 'key' really means 'coerce' here
	      : jq_deparam_fragment( coerce )[ key ];
	  };
	  
	  // Method: jQuery.bbq.removeState
	  // 
	  // Remove one or more keys from the current browser history 'state', creating
	  // a new state, setting location.hash and triggering any bound
	  // <hashchange event> callbacks (provided the new state is different than
	  // the previous state).
	  // 
	  // If no arguments are passed, an empty state is created, which is just a
	  // shortcut for jQuery.bbq.pushState( {}, 2 ).
	  // 
	  // Usage:
	  // 
	  // > jQuery.bbq.removeState( [ key [, key ... ] ] );
	  // 
	  // Arguments:
	  // 
	  //  key - (String) One or more key values to remove from the current state,
	  //    passed as individual arguments.
	  //  key - (Array) A single array argument that contains a list of key values
	  //    to remove from the current state.
	  // 
	  // Returns:
	  // 
	  //  Nothing.
	  // 
	  // Additional Notes:
	  // 
	  //  * Setting an empty state may cause the browser to scroll.
	  
	  jq_bbq.removeState = function( arr ) {
	    var state = {};
	    
	    // If one or more arguments is passed..
	    if ( arr !== undefined ) {
	      
	      // Get the current state.
	      state = jq_bbq_getState();
	      
	      // For each passed key, delete the corresponding property from the current
	      // state.
	      $.each( $.isArray( arr ) ? arr : arguments, function(i,v){
	        delete state[ v ];
	      });
	    }
	    
	    // Set the state, completely overriding any existing state.
	    jq_bbq_pushState( state, 2 );
	  };
	  
	  // Event: hashchange event (BBQ)
	  // 
	  // Usage in jQuery 1.4 and newer:
	  // 
	  // In jQuery 1.4 and newer, the event object passed into any hashchange event
	  // callback is augmented with a copy of the location.hash fragment at the time
	  // the event was triggered as its event.fragment property. In addition, the
	  // event.getState method operates on this property (instead of location.hash)
	  // which allows this fragment-as-a-state to be referenced later, even after
	  // window.location may have changed.
	  // 
	  // Note that event.fragment and event.getState are not defined according to
	  // W3C (or any other) specification, but will still be available whether or
	  // not the hashchange event exists natively in the browser, because of the
	  // utility they provide.
	  // 
	  // The event.fragment property contains the output of <jQuery.param.fragment>
	  // and the event.getState method is equivalent to the <jQuery.bbq.getState>
	  // method.
	  // 
	  // > $(window).bind( 'hashchange', function( event ) {
	  // >   var hash_str = event.fragment,
	  // >     param_obj = event.getState(),
	  // >     param_val = event.getState( 'param_name' ),
	  // >     param_val_coerced = event.getState( 'param_name', true );
	  // >   ...
	  // > });
	  // 
	  // Usage in jQuery 1.3.2:
	  // 
	  // In jQuery 1.3.2, the event object cannot to be augmented as in jQuery 1.4+,
	  // so the fragment state isn't bound to the event object and must instead be
	  // parsed using the <jQuery.param.fragment> and <jQuery.bbq.getState> methods.
	  // 
	  // > $(window).bind( 'hashchange', function( event ) {
	  // >   var hash_str = $.param.fragment(),
	  // >     param_obj = $.bbq.getState(),
	  // >     param_val = $.bbq.getState( 'param_name' ),
	  // >     param_val_coerced = $.bbq.getState( 'param_name', true );
	  // >   ...
	  // > });
	  // 
	  // Additional Notes:
	  // 
	  // * Due to changes in the special events API, jQuery BBQ v1.2 or newer is
	  //   required to enable the augmented event object in jQuery 1.4.2 and newer.
	  // * See <jQuery hashchange event> for more detailed information.
	  
	  jq_event_special[ str_hashchange ] = $.extend( jq_event_special[ str_hashchange ], {
	    
	    // Augmenting the event object with the .fragment property and .getState
	    // method requires jQuery 1.4 or newer. Note: with 1.3.2, everything will
	    // work, but the event won't be augmented)
	    add: function( handleObj ) {
	      var old_handler;
	      
	      function new_handler(e) {
	        // e.fragment is set to the value of location.hash (with any leading #
	        // removed) at the time the event is triggered.
	        var hash = e[ str_fragment ] = jq_param_fragment();
	        
	        // e.getState() works just like $.bbq.getState(), but uses the
	        // e.fragment property stored on the event object.
	        e.getState = function( key, coerce ) {
	          return key === undefined || typeof key === 'boolean'
	            ? jq_deparam( hash, key ) // 'key' really means 'coerce' here
	            : jq_deparam( hash, coerce )[ key ];
	        };
	        
	        old_handler.apply( this, arguments );
	      };
	      
	      // This may seem a little complicated, but it normalizes the special event
	      // .add method between jQuery 1.4/1.4.1 and 1.4.2+
	      if ( $.isFunction( handleObj ) ) {
	        // 1.4, 1.4.1
	        old_handler = handleObj;
	        return new_handler;
	      } else {
	        // 1.4.2+
	        old_handler = handleObj.handler;
	        handleObj.handler = new_handler;
	      }
	    }
	    
	  });
	  
	})(jQuery,this);
	/*!
	 * jQuery hashchange event - v1.2 - 2/11/2010
	 * http://benalman.com/projects/jquery-hashchange-plugin/
	 * 
	 * Copyright (c) 2010 "Cowboy" Ben Alman
	 * Dual licensed under the MIT and GPL licenses.
	 * http://benalman.com/about/license/
	 */

	// Script: jQuery hashchange event
	//
	// *Version: 1.2, Last updated: 2/11/2010*
	// 
	// Project Home - http://benalman.com/projects/jquery-hashchange-plugin/
	// GitHub       - http://github.com/cowboy/jquery-hashchange/
	// Source       - http://github.com/cowboy/jquery-hashchange/raw/master/jquery.ba-hashchange.js
	// (Minified)   - http://github.com/cowboy/jquery-hashchange/raw/master/jquery.ba-hashchange.min.js (1.1kb)
	// 
	// About: License
	// 
	// Copyright (c) 2010 "Cowboy" Ben Alman,
	// Dual licensed under the MIT and GPL licenses.
	// http://benalman.com/about/license/
	// 
	// About: Examples
	// 
	// This working example, complete with fully commented code, illustrate one way
	// in which this plugin can be used.
	// 
	// hashchange event - http://benalman.com/code/projects/jquery-hashchange/examples/hashchange/
	// 
	// About: Support and Testing
	// 
	// Information about what version or versions of jQuery this plugin has been
	// tested with, what browsers it has been tested in, and where the unit tests
	// reside (so you can test it yourself).
	// 
	// jQuery Versions - 1.3.2, 1.4.1, 1.4.2
	// Browsers Tested - Internet Explorer 6-8, Firefox 2-3.7, Safari 3-4, Chrome, Opera 9.6-10.1.
	// Unit Tests      - http://benalman.com/code/projects/jquery-hashchange/unit/
	// 
	// About: Known issues
	// 
	// While this jQuery hashchange event implementation is quite stable and robust,
	// there are a few unfortunate browser bugs surrounding expected hashchange
	// event-based behaviors, independent of any JavaScript window.onhashchange
	// abstraction. See the following examples for more information:
	// 
	// Chrome: Back Button - http://benalman.com/code/projects/jquery-hashchange/examples/bug-chrome-back-button/
	// Firefox: Remote XMLHttpRequest - http://benalman.com/code/projects/jquery-hashchange/examples/bug-firefox-remote-xhr/
	// WebKit: Back Button in an Iframe - http://benalman.com/code/projects/jquery-hashchange/examples/bug-webkit-hash-iframe/
	// Safari: Back Button from a different domain - http://benalman.com/code/projects/jquery-hashchange/examples/bug-safari-back-from-diff-domain/
	// 
	// About: Release History
	// 
	// 1.2   - (2/11/2010) Fixed a bug where coming back to a page using this plugin
//	         from a page on another domain would cause an error in Safari 4. Also,
//	         IE6/7 Iframe is now inserted after the body (this actually works),
//	         which prevents the page from scrolling when the event is first bound.
//	         Event can also now be bound before DOM ready, but it won't be usable
//	         before then in IE6/7.
	// 1.1   - (1/21/2010) Incorporated document.documentMode test to fix IE8 bug
//	         where browser version is incorrectly reported as 8.0, despite
//	         inclusion of the X-UA-Compatible IE=EmulateIE7 meta tag.
	// 1.0   - (1/9/2010) Initial Release. Broke out the jQuery BBQ event.special
//	         window.onhashchange functionality into a separate plugin for users
//	         who want just the basic event & back button support, without all the
//	         extra awesomeness that BBQ provides. This plugin will be included as
//	         part of jQuery BBQ, but also be available separately.

	(function($,window,undefined){
	  '$:nomunge'; // Used by YUI compressor.
	  
	  // Method / object references.
	  var fake_onhashchange,
	    jq_event_special = $.event.special,
	    
	    // Reused strings.
	    str_location = 'location',
	    str_hashchange = 'hashchange',
	    str_href = 'href',
	    
	    // IE6/7 specifically need some special love when it comes to back-button
	    // support, so let's do a little browser sniffing..
	    browser = $.browser,
	    mode = document.documentMode,
	    is_old_ie = browser.msie && ( mode === undefined || mode < 8 ),
	    
	    // Does the browser support window.onhashchange? Test for IE version, since
	    // IE8 incorrectly reports this when in "IE7" or "IE8 Compatibility View"!
	    supports_onhashchange = 'on' + str_hashchange in window && !is_old_ie;
	  
	  // Get location.hash (or what you'd expect location.hash to be) sans any
	  // leading #. Thanks for making this necessary, Firefox!
	  function get_fragment( url ) {
	    url = url || window[ str_location ][ str_href ];
	    return url.replace( /^[^#]*#?(.*)$/, '$1' );
	  };
	  
	  // Property: jQuery.hashchangeDelay
	  // 
	  // The numeric interval (in milliseconds) at which the <hashchange event>
	  // polling loop executes. Defaults to 100.
	  
	  $[ str_hashchange + 'Delay' ] = 100;
	  
	  // Event: hashchange event
	  // 
	  // Fired when location.hash changes. In browsers that support it, the native
	  // window.onhashchange event is used (IE8, FF3.6), otherwise a polling loop is
	  // initialized, running every <jQuery.hashchangeDelay> milliseconds to see if
	  // the hash has changed. In IE 6 and 7, a hidden Iframe is created to allow
	  // the back button and hash-based history to work.
	  // 
	  // Usage:
	  // 
	  // > $(window).bind( 'hashchange', function(e) {
	  // >   var hash = location.hash;
	  // >   ...
	  // > });
	  // 
	  // Additional Notes:
	  // 
	  // * The polling loop and Iframe are not created until at least one callback
	  //   is actually bound to 'hashchange'.
	  // * If you need the bound callback(s) to execute immediately, in cases where
	  //   the page 'state' exists on page load (via bookmark or page refresh, for
	  //   example) use $(window).trigger( 'hashchange' );
	  // * The event can be bound before DOM ready, but since it won't be usable
	  //   before then in IE6/7 (due to the necessary Iframe), recommended usage is
	  //   to bind it inside a $(document).ready() callback.
	  
	  jq_event_special[ str_hashchange ] = $.extend( jq_event_special[ str_hashchange ], {
	    
	    // Called only when the first 'hashchange' event is bound to window.
	    setup: function() {
	      // If window.onhashchange is supported natively, there's nothing to do..
	      if ( supports_onhashchange ) { return false; }
	      
	      // Otherwise, we need to create our own. And we don't want to call this
	      // until the user binds to the event, just in case they never do, since it
	      // will create a polling loop and possibly even a hidden Iframe.
	      $( fake_onhashchange.start );
	    },
	    
	    // Called only when the last 'hashchange' event is unbound from window.
	    teardown: function() {
	      // If window.onhashchange is supported natively, there's nothing to do..
	      if ( supports_onhashchange ) { return false; }
	      
	      // Otherwise, we need to stop ours (if possible).
	      $( fake_onhashchange.stop );
	    }
	    
	  });
	  
	  // fake_onhashchange does all the work of triggering the window.onhashchange
	  // event for browsers that don't natively support it, including creating a
	  // polling loop to watch for hash changes and in IE 6/7 creating a hidden
	  // Iframe to enable back and forward.
	  fake_onhashchange = (function(){
	    var self = {},
	      timeout_id,
	      iframe,
	      set_history,
	      get_history;
	    
	    // Initialize. In IE 6/7, creates a hidden Iframe for history handling.
	    function init(){
	      // Most browsers don't need special methods here..
	      set_history = get_history = function(val){ return val; };
	      
	      // But IE6/7 do!
	      if ( is_old_ie ) {
	        
	        // Create hidden Iframe after the end of the body to prevent initial
	        // page load from scrolling unnecessarily.
	        iframe = $('<iframe src="javascript:0"/>').hide().insertAfter( 'body' )[0].contentWindow;
	        
	        // Get history by looking at the hidden Iframe's location.hash.
	        get_history = function() {
	          return get_fragment( iframe.document[ str_location ][ str_href ] );
	        };
	        
	        // Set a new history item by opening and then closing the Iframe
	        // document, *then* setting its location.hash.
	        set_history = function( hash, history_hash ) {
	          if ( hash !== history_hash ) {
	            var doc = iframe.document;
	            doc.open().close();
	            doc[ str_location ].hash = '#' + hash;
	          }
	        };
	        
	        // Set initial history.
	        set_history( get_fragment() );
	      }
	    };
	    
	    // Start the polling loop.
	    self.start = function() {
	      // Polling loop is already running!
	      if ( timeout_id ) { return; }
	      
	      // Remember the initial hash so it doesn't get triggered immediately.
	      var last_hash = get_fragment();
	      
	      // Initialize if not yet initialized.
	      set_history || init();
	      
	      // This polling loop checks every $.hashchangeDelay milliseconds to see if
	      // location.hash has changed, and triggers the 'hashchange' event on
	      // window when necessary.
	      (function loopy(){
	        var hash = get_fragment(),
	          history_hash = get_history( last_hash );
	        
	        if ( hash !== last_hash ) {
	          set_history( last_hash = hash, history_hash );
	          
	          $(window).trigger( str_hashchange );
	          
	        } else if ( history_hash !== last_hash ) {
	          window[ str_location ][ str_href ] = window[ str_location ][ str_href ].replace( /#.*/, '' ) + '#' + history_hash;
	        }
	        
	        timeout_id = setTimeout( loopy, $[ str_hashchange + 'Delay' ] );
	      })();
	    };
	    
	    // Stop the polling loop, but only if an IE6/7 Iframe wasn't created. In
	    // that case, even if there are no longer any bound event handlers, the
	    // polling loop is still necessary for back/next to work at all!
	    self.stop = function() {
	      if ( !iframe ) {
	        timeout_id && clearTimeout( timeout_id );
	        timeout_id = 0;
	      }
	    };
	    
	    return self;
	  })();
	  
	})(jQuery,this);
	
/*
 * jQuery hashchange event - v1.3 - 7/21/2010
 * http://benalman.com/projects/jquery-hashchange-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
	(function($,window,undefined){
		  '$:nomunge'; // Used by YUI compressor.
		  
		  // Reused string.
		  var str_hashchange = 'hashchange',
		    
		    // Method / object references.
		    doc = document,
		    fake_onhashchange,
		    special = $.event.special,
		    
		    // Does the browser support window.onhashchange? Note that IE8 running in
		    // IE7 compatibility mode reports true for 'onhashchange' in window, even
		    // though the event isn't supported, so also test document.documentMode.
		    doc_mode = doc.documentMode,
		    supports_onhashchange = 'on' + str_hashchange in window && ( doc_mode === undefined || doc_mode > 7 );
		  
		  // Get location.hash (or what you'd expect location.hash to be) sans any
		  // leading #. Thanks for making this necessary, Firefox!
		  function get_fragment( url ) {
		    url = url || location.href;
		    return '#' + url.replace( /^[^#]*#?(.*)$/, '$1' );
		  };
		  
		  // Method: jQuery.fn.hashchange
		  // 
		  // Bind a handler to the window.onhashchange event or trigger all bound
		  // window.onhashchange event handlers. This behavior is consistent with
		  // jQuery's built-in event handlers.
		  // 
		  // Usage:
		  // 
		  // > jQuery(window).hashchange( [ handler ] );
		  // 
		  // Arguments:
		  // 
		  //  handler - (Function) Optional handler to be bound to the hashchange
		  //    event. This is a "shortcut" for the more verbose form:
		  //    jQuery(window).bind( 'hashchange', handler ). If handler is omitted,
		  //    all bound window.onhashchange event handlers will be triggered. This
		  //    is a shortcut for the more verbose
		  //    jQuery(window).trigger( 'hashchange' ). These forms are described in
		  //    the <hashchange event> section.
		  // 
		  // Returns:
		  // 
		  //  (jQuery) The initial jQuery collection of elements.
		  
		  // Allow the "shortcut" format $(elem).hashchange( fn ) for binding and
		  // $(elem).hashchange() for triggering, like jQuery does for built-in events.
		  $.fn[ str_hashchange ] = function( fn ) {
		    return fn ? this.bind( str_hashchange, fn ) : this.trigger( str_hashchange );
		  };
		  
		  // Property: jQuery.fn.hashchange.delay
		  // 
		  // The numeric interval (in milliseconds) at which the <hashchange event>
		  // polling loop executes. Defaults to 50.
		  
		  // Property: jQuery.fn.hashchange.domain
		  // 
		  // If you're setting document.domain in your JavaScript, and you want hash
		  // history to work in IE6/7, not only must this property be set, but you must
		  // also set document.domain BEFORE jQuery is loaded into the page. This
		  // property is only applicable if you are supporting IE6/7 (or IE8 operating
		  // in "IE7 compatibility" mode).
		  // 
		  // In addition, the <jQuery.fn.hashchange.src> property must be set to the
		  // path of the included "document-domain.html" file, which can be renamed or
		  // modified if necessary (note that the document.domain specified must be the
		  // same in both your main JavaScript as well as in this file).
		  // 
		  // Usage:
		  // 
		  // jQuery.fn.hashchange.domain = document.domain;
		  
		  // Property: jQuery.fn.hashchange.src
		  // 
		  // If, for some reason, you need to specify an Iframe src file (for example,
		  // when setting document.domain as in <jQuery.fn.hashchange.domain>), you can
		  // do so using this property. Note that when using this property, history
		  // won't be recorded in IE6/7 until the Iframe src file loads. This property
		  // is only applicable if you are supporting IE6/7 (or IE8 operating in "IE7
		  // compatibility" mode).
		  // 
		  // Usage:
		  // 
		  // jQuery.fn.hashchange.src = 'path/to/file.html';
		  
		  $.fn[ str_hashchange ].delay = 50;
		  /*
		  $.fn[ str_hashchange ].domain = null;
		  $.fn[ str_hashchange ].src = null;
		  */
		  
		  // Event: hashchange event
		  // 
		  // Fired when location.hash changes. In browsers that support it, the native
		  // HTML5 window.onhashchange event is used, otherwise a polling loop is
		  // initialized, running every <jQuery.fn.hashchange.delay> milliseconds to
		  // see if the hash has changed. In IE6/7 (and IE8 operating in "IE7
		  // compatibility" mode), a hidden Iframe is created to allow the back button
		  // and hash-based history to work.
		  // 
		  // Usage as described in <jQuery.fn.hashchange>:
		  // 
		  // > // Bind an event handler.
		  // > jQuery(window).hashchange( function(e) {
		  // >   var hash = location.hash;
		  // >   ...
		  // > });
		  // > 
		  // > // Manually trigger the event handler.
		  // > jQuery(window).hashchange();
		  // 
		  // A more verbose usage that allows for event namespacing:
		  // 
		  // > // Bind an event handler.
		  // > jQuery(window).bind( 'hashchange', function(e) {
		  // >   var hash = location.hash;
		  // >   ...
		  // > });
		  // > 
		  // > // Manually trigger the event handler.
		  // > jQuery(window).trigger( 'hashchange' );
		  // 
		  // Additional Notes:
		  // 
		  // * The polling loop and Iframe are not created until at least one handler
		  //   is actually bound to the 'hashchange' event.
		  // * If you need the bound handler(s) to execute immediately, in cases where
		  //   a location.hash exists on page load, via bookmark or page refresh for
		  //   example, use jQuery(window).hashchange() or the more verbose 
		  //   jQuery(window).trigger( 'hashchange' ).
		  // * The event can be bound before DOM ready, but since it won't be usable
		  //   before then in IE6/7 (due to the necessary Iframe), recommended usage is
		  //   to bind it inside a DOM ready handler.
		  
		  // Override existing $.event.special.hashchange methods (allowing this plugin
		  // to be defined after jQuery BBQ in BBQ's source code).
		  special[ str_hashchange ] = $.extend( special[ str_hashchange ], {
		    
		    // Called only when the first 'hashchange' event is bound to window.
		    setup: function() {
		      // If window.onhashchange is supported natively, there's nothing to do..
		      if ( supports_onhashchange ) { return false; }
		      
		      // Otherwise, we need to create our own. And we don't want to call this
		      // until the user binds to the event, just in case they never do, since it
		      // will create a polling loop and possibly even a hidden Iframe.
		      $( fake_onhashchange.start );
		    },
		    
		    // Called only when the last 'hashchange' event is unbound from window.
		    teardown: function() {
		      // If window.onhashchange is supported natively, there's nothing to do..
		      if ( supports_onhashchange ) { return false; }
		      
		      // Otherwise, we need to stop ours (if possible).
		      $( fake_onhashchange.stop );
		    }
		    
		  });
		  
		  // fake_onhashchange does all the work of triggering the window.onhashchange
		  // event for browsers that don't natively support it, including creating a
		  // polling loop to watch for hash changes and in IE 6/7 creating a hidden
		  // Iframe to enable back and forward.
		  fake_onhashchange = (function(){
		    var self = {},
		      timeout_id,
		      
		      // Remember the initial hash so it doesn't get triggered immediately.
		      last_hash = get_fragment(),
		      
		      fn_retval = function(val){ return val; },
		      history_set = fn_retval,
		      history_get = fn_retval;
		    
		    // Start the polling loop.
		    self.start = function() {
		      timeout_id || poll();
		    };
		    
		    // Stop the polling loop.
		    self.stop = function() {
		      timeout_id && clearTimeout( timeout_id );
		      timeout_id = undefined;
		    };
		    
		    // This polling loop checks every $.fn.hashchange.delay milliseconds to see
		    // if location.hash has changed, and triggers the 'hashchange' event on
		    // window when necessary.
		    function poll() {
		      var hash = get_fragment(),
		        history_hash = history_get( last_hash );
		      
		      if ( hash !== last_hash ) {
		        history_set( last_hash = hash, history_hash );
		        
		        $(window).trigger( str_hashchange );
		        
		      } else if ( history_hash !== last_hash ) {
		        location.href = location.href.replace( /#.*/, '' ) + history_hash;
		      }
		      
		      timeout_id = setTimeout( poll, $.fn[ str_hashchange ].delay );
		    };
		    
		    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
		    // vvvvvvvvvvvvvvvvvvv REMOVE IF NOT SUPPORTING IE6/7/8 vvvvvvvvvvvvvvvvvvv
		    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
		    $.browser.msie && !supports_onhashchange && (function(){
		      // Not only do IE6/7 need the "magical" Iframe treatment, but so does IE8
		      // when running in "IE7 compatibility" mode.
		      
		      var iframe,
		        iframe_src;
		      
		      // When the event is bound and polling starts in IE 6/7, create a hidden
		      // Iframe for history handling.
		      self.start = function(){
		        if ( !iframe ) {
		          iframe_src = $.fn[ str_hashchange ].src;
		          iframe_src = iframe_src && iframe_src + get_fragment();
		          
		          // Create hidden Iframe. Attempt to make Iframe as hidden as possible
		          // by using techniques from http://www.paciellogroup.com/blog/?p=604.
		          iframe = $('<iframe tabindex="-1" title="empty"/>').hide()
		            
		            // When Iframe has completely loaded, initialize the history and
		            // start polling.
		            .one( 'load', function(){
		              iframe_src || history_set( get_fragment() );
		              poll();
		            })
		            
		            // Load Iframe src if specified, otherwise nothing.
		            .attr( 'src', iframe_src || 'javascript:0' )
		            
		            // Append Iframe after the end of the body to prevent unnecessary
		            // initial page scrolling (yes, this works).
		            .insertAfter( 'body' )[0].contentWindow;
		          
		          // Whenever `document.title` changes, update the Iframe's title to
		          // prettify the back/next history menu entries. Since IE sometimes
		          // errors with "Unspecified error" the very first time this is set
		          // (yes, very useful) wrap this with a try/catch block.
		          doc.onpropertychange = function(){
		            try {
		              if ( event.propertyName === 'title' ) {
		                iframe.document.title = doc.title;
		              }
		            } catch(e) {}
		          };
		          
		        }
		      };
		      
		      // Override the "stop" method since an IE6/7 Iframe was created. Even
		      // if there are no longer any bound event handlers, the polling loop
		      // is still necessary for back/next to work at all!
		      self.stop = fn_retval;
		      
		      // Get history by looking at the hidden Iframe's location.hash.
		      history_get = function() {
		        return get_fragment( iframe.location.href );
		      };
		      
		      // Set a new history item by opening and then closing the Iframe
		      // document, *then* setting its location.hash. If document.domain has
		      // been set, update that as well.
		      history_set = function( hash, history_hash ) {
		        var iframe_doc = iframe.document,
		          domain = $.fn[ str_hashchange ].domain;
		        
		        if ( hash !== history_hash ) {
		          // Update Iframe with any initial `document.title` that might be set.
		          iframe_doc.title = doc.title;
		          
		          // Opening the Iframe's document after it has been closed is what
		          // actually adds a history entry.
		          iframe_doc.open();
		          
		          // Set document.domain for the Iframe document as well, if necessary.
		          domain && iframe_doc.write( '<script>document.domain="' + domain + '"</script>' );
		          
		          iframe_doc.close();
		          
		          // Update the Iframe's hash, for great justice.
		          iframe.location.hash = hash;
		        }
		      };
		      
		    })();
		    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
		    // ^^^^^^^^^^^^^^^^^^^ REMOVE IF NOT SUPPORTING IE6/7/8 ^^^^^^^^^^^^^^^^^^^
		    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
		    
		    return self;
		  })();
		  
		})(jQuery,this);
/*!
 *
 * Copyright (c) 2010 C. F., Wong (<a href="http://cloudgen.w0ng.hk">Cloudgen Examplet Store</a>)
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * http://plugins.jquery.com/project/jCaret
 */
	(function($){
		  $.fn.caret = function(s, e) {
		    var setPosition = function(el, start, end) {
		      if (el.setSelectionRange) {
		        el.focus();
		        el.setSelectionRange(start, end);
		      }
		      else if(el.createTextRange) {
		        var range = el.createTextRange();
		        range.collapse(true);
		        range.moveEnd('character', end);
		        range.moveStart('character', start);
		        range.select();
		      }
		    };

		    if (s != null && e != null) { //setting range
		      return this.each(function() {
		        setPosition(this, s, e);
		      });      
		    }
		    else if (s != null) { //setting position
		      return this.each(function() {
		        setPosition(this, s, s);
		      });
		    }
		    else { //getting
		      var el = this[0];
		      if (el.createTextRange) {
		        var r = document.selection.createRange().duplicate();

		        var end = el.value.lastIndexOf(r.text) + r.text.length;

		        r.moveEnd('character', el.value.length);
		        var start = (r.text == '') ? el.value.length : el.value.lastIndexOf(r.text);
		        
		        return [start, end];
		      }
		      else {
		        return [el.selectionStart, el.selectionEnd];
		      }
		    }

		  };
	})(jQuery);
/**
 * @summary     DataTables
 * @description Paginate, search and sort HTML tables
 * @version     1.9.0
 * @file        jquery.dataTables.js
 * @author      Allan Jardine (www.sprymedia.co.uk)
 * @contact     www.sprymedia.co.uk/contact
 *
 * @copyright Copyright 2008-2012 Allan Jardine, all rights reserved.
 *
 * This source file is free software, under either the GPL v2 license or a
 * BSD style license, available at:
 *   http://datatables.net/license_gpl2
 *   http://datatables.net/license_bsd
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 * For details please refer to: http://www.datatables.net
 */

/*jslint evil: true, undef: true, browser: true */
/*globals $, jQuery,_fnExternApiFunc,_fnInitialise,_fnInitComplete,_fnLanguageCompat,_fnAddColumn,_fnColumnOptions,_fnAddData,_fnCreateTr,_fnGatherData,_fnBuildHead,_fnDrawHead,_fnDraw,_fnReDraw,_fnAjaxUpdate,_fnAjaxParameters,_fnAjaxUpdateDraw,_fnServerParams,_fnAddOptionsHtml,_fnFeatureHtmlTable,_fnScrollDraw,_fnAdjustColumnSizing,_fnFeatureHtmlFilter,_fnFilterComplete,_fnFilterCustom,_fnFilterColumn,_fnFilter,_fnBuildSearchArray,_fnBuildSearchRow,_fnFilterCreateSearch,_fnDataToSearch,_fnSort,_fnSortAttachListener,_fnSortingClasses,_fnFeatureHtmlPaginate,_fnPageChange,_fnFeatureHtmlInfo,_fnUpdateInfo,_fnFeatureHtmlLength,_fnFeatureHtmlProcessing,_fnProcessingDisplay,_fnVisibleToColumnIndex,_fnColumnIndexToVisible,_fnNodeToDataIndex,_fnVisbleColumns,_fnCalculateEnd,_fnConvertToWidth,_fnCalculateColumnWidths,_fnScrollingWidthAdjust,_fnGetWidestNode,_fnGetMaxLenString,_fnStringToCss,_fnDetectType,_fnSettingsFromNode,_fnGetDataMaster,_fnGetTrNodes,_fnGetTdNodes,_fnEscapeRegex,_fnDeleteIndex,_fnReOrderIndex,_fnColumnOrdering,_fnLog,_fnClearTable,_fnSaveState,_fnLoadState,_fnCreateCookie,_fnReadCookie,_fnDetectHeader,_fnGetUniqueThs,_fnScrollBarWidth,_fnApplyToChildren,_fnMap,_fnGetRowData,_fnGetCellData,_fnSetCellData,_fnGetObjectDataFn,_fnSetObjectDataFn,_fnApplyColumnDefs,_fnBindAction,_fnCallbackReg,_fnCallbackFire,_fnJsonString,_fnRender,_fnNodeToColumnIndex*/

(/** @lends <global> */function($, window, document, undefined) {
	/**
	 * DataTables is a plug-in for the jQuery Javascript library. It is a
	 * highly flexible tool, based upon the foundations of progressive
	 * enhancement, which will add advanced interaction controls to any
	 * HTML table. For a full list of features please refer to
	 * <a href="http://datatables.net">DataTables.net</a>.
	 *
	 * Note that the <i>DataTable</i> object is not a global variable but is
	 * aliased to <i>jQuery.fn.DataTable</i> and <i>jQuery.fn.dataTable</i> through which
	 * it may be  accessed.
	 *
	 *  @class
	 *  @param {object} [oInit={}] Configuration object for DataTables. Options
	 *    are defined by {@link DataTable.defaults}
	 *  @requires jQuery 1.3+
	 *
	 *  @example
	 *    // Basic initialisation
	 *    $(document).ready( function {
	 *      $('#example').dataTable();
	 *    } );
	 *
	 *  @example
	 *    // Initialisation with configuration options - in this case, disable
	 *    // pagination and sorting.
	 *    $(document).ready( function {
	 *      $('#example').dataTable( {
	 *        "bPaginate": false,
	 *        "bSort": false
	 *      } );
	 *    } );
	 */
	var DataTable = function( oInit )
	{


		/**
		 * Add a column to the list used for the table with default values
		 *  @param {object} oSettings dataTables settings object
		 *  @param {node} nTh The th element for this column
		 *  @memberof DataTable#oApi
		 */
		function _fnAddColumn( oSettings, nTh )
		{
			var oDefaults = DataTable.defaults.columns;
			var iCol = oSettings.aoColumns.length;
			var oCol = $.extend( {}, DataTable.models.oColumn, oDefaults, {
				"sSortingClass": oSettings.oClasses.sSortable,
				"sSortingClassJUI": oSettings.oClasses.sSortJUI,
				"nTh": nTh ? nTh : document.createElement('th'),
				"sTitle":    oDefaults.sTitle    ? oDefaults.sTitle    : nTh ? nTh.innerHTML : '',
				"aDataSort": oDefaults.aDataSort ? oDefaults.aDataSort : [iCol],
				"mDataProp": oDefaults.mDataProp ? oDefaults.oDefaults : iCol
			} );
			oSettings.aoColumns.push( oCol );

			/* Add a column specific filter */
			if ( oSettings.aoPreSearchCols[ iCol ] === undefined || oSettings.aoPreSearchCols[ iCol ] === null )
			{
				oSettings.aoPreSearchCols[ iCol ] = $.extend( {}, DataTable.models.oSearch );
			}
			else
			{
				var oPre = oSettings.aoPreSearchCols[ iCol ];

				/* Don't require that the user must specify bRegex, bSmart or bCaseInsensitive */
				if ( oPre.bRegex === undefined )
				{
					oPre.bRegex = true;
				}

				if ( oPre.bSmart === undefined )
				{
					oPre.bSmart = true;
				}

				if ( oPre.bCaseInsensitive === undefined )
				{
					oPre.bCaseInsensitive = true;
				}
			}

			/* Use the column options function to initialise classes etc */
			_fnColumnOptions( oSettings, iCol, null );
		}


		/**
		 * Apply options for a column
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iCol column index to consider
		 *  @param {object} oOptions object with sType, bVisible and bSearchable
		 *  @memberof DataTable#oApi
		 */
		function _fnColumnOptions( oSettings, iCol, oOptions )
		{
			var oCol = oSettings.aoColumns[ iCol ];

			/* User specified column options */
			if ( oOptions !== undefined && oOptions !== null )
			{
				if ( oOptions.sType !== undefined )
				{
					oCol.sType = oOptions.sType;
					oCol._bAutoType = false;
				}

				$.extend( oCol, oOptions );
				_fnMap( oCol, oOptions, "sWidth", "sWidthOrig" );

				/* iDataSort to be applied (backwards compatibility), but aDataSort will take
				 * priority if defined
				 */
				if ( oOptions.iDataSort !== undefined )
				{
					oCol.aDataSort = [ oOptions.iDataSort ];
				}
				_fnMap( oCol, oOptions, "aDataSort" );
			}

			/* Cache the data get and set functions for speed */
			oCol.fnGetData = _fnGetObjectDataFn( oCol.mDataProp );
			oCol.fnSetData = _fnSetObjectDataFn( oCol.mDataProp );

			/* Feature sorting overrides column specific when off */
			if ( !oSettings.oFeatures.bSort )
			{
				oCol.bSortable = false;
			}

			/* Check that the class assignment is correct for sorting */
			if ( !oCol.bSortable ||
					($.inArray('asc', oCol.asSorting) == -1 && $.inArray('desc', oCol.asSorting) == -1) )
			{
				oCol.sSortingClass = oSettings.oClasses.sSortableNone;
				oCol.sSortingClassJUI = "";
			}
			else if ( oCol.bSortable ||
					($.inArray('asc', oCol.asSorting) == -1 && $.inArray('desc', oCol.asSorting) == -1) )
			{
				oCol.sSortingClass = oSettings.oClasses.sSortable;
				oCol.sSortingClassJUI = oSettings.oClasses.sSortJUI;
			}
			else if ( $.inArray('asc', oCol.asSorting) != -1 && $.inArray('desc', oCol.asSorting) == -1 )
			{
				oCol.sSortingClass = oSettings.oClasses.sSortableAsc;
				oCol.sSortingClassJUI = oSettings.oClasses.sSortJUIAscAllowed;
			}
			else if ( $.inArray('asc', oCol.asSorting) == -1 && $.inArray('desc', oCol.asSorting) != -1 )
			{
				oCol.sSortingClass = oSettings.oClasses.sSortableDesc;
				oCol.sSortingClassJUI = oSettings.oClasses.sSortJUIDescAllowed;
			}
		}


		/**
		 * Adjust the table column widths for new data. Note: you would probably want to
		 * do a redraw after calling this function!
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnAdjustColumnSizing ( oSettings )
		{
			/* Not interested in doing column width calculation if autowidth is disabled */
			if ( oSettings.oFeatures.bAutoWidth === false )
			{
				return false;
			}

			_fnCalculateColumnWidths( oSettings );
			for ( var i=0 , iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				oSettings.aoColumns[i].nTh.style.width = oSettings.aoColumns[i].sWidth;
			}
		}


		/**
		 * Covert the index of a visible column to the index in the data array (take account
		 * of hidden columns)
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iMatch Visible column index to lookup
		 *  @returns {int} i the data index
		 *  @memberof DataTable#oApi
		 */
		function _fnVisibleToColumnIndex( oSettings, iMatch )
		{
			var iColumn = -1;

			for ( var i=0 ; i<oSettings.aoColumns.length ; i++ )
			{
				if ( oSettings.aoColumns[i].bVisible === true )
				{
					iColumn++;
				}

				if ( iColumn == iMatch )
				{
					return i;
				}
			}

			return null;
		}


		/**
		 * Covert the index of an index in the data array and convert it to the visible
		 *   column index (take account of hidden columns)
		 *  @param {int} iMatch Column index to lookup
		 *  @param {object} oSettings dataTables settings object
		 *  @returns {int} i the data index
		 *  @memberof DataTable#oApi
		 */
		function _fnColumnIndexToVisible( oSettings, iMatch )
		{
			var iVisible = -1;
			for ( var i=0 ; i<oSettings.aoColumns.length ; i++ )
			{
				if ( oSettings.aoColumns[i].bVisible === true )
				{
					iVisible++;
				}

				if ( i == iMatch )
				{
					return oSettings.aoColumns[i].bVisible === true ? iVisible : null;
				}
			}

			return null;
		}


		/**
		 * Get the number of visible columns
		 *  @returns {int} i the number of visible columns
		 *  @param {object} oS dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnVisbleColumns( oS )
		{
			var iVis = 0;
			for ( var i=0 ; i<oS.aoColumns.length ; i++ )
			{
				if ( oS.aoColumns[i].bVisible === true )
				{
					iVis++;
				}
			}
			return iVis;
		}


		/**
		 * Get the sort type based on an input string
		 *  @param {string} sData data we wish to know the type of
		 *  @returns {string} type (defaults to 'string' if no type can be detected)
		 *  @memberof DataTable#oApi
		 */
		function _fnDetectType( sData )
		{
			var aTypes = DataTable.ext.aTypes;
			var iLen = aTypes.length;

			for ( var i=0 ; i<iLen ; i++ )
			{
				var sType = aTypes[i]( sData );
				if ( sType !== null )
				{
					return sType;
				}
			}

			return 'string';
		}


		/**
		 * Figure out how to reorder a display list
		 *  @param {object} oSettings dataTables settings object
		 *  @returns array {int} aiReturn index list for reordering
		 *  @memberof DataTable#oApi
		 */
		function _fnReOrderIndex ( oSettings, sColumns )
		{
			var aColumns = sColumns.split(',');
			var aiReturn = [];

			for ( var i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				for ( var j=0 ; j<iLen ; j++ )
				{
					if ( oSettings.aoColumns[i].sName == aColumns[j] )
					{
						aiReturn.push( j );
						break;
					}
				}
			}

			return aiReturn;
		}


		/**
		 * Get the column ordering that DataTables expects
		 *  @param {object} oSettings dataTables settings object
		 *  @returns {string} comma separated list of names
		 *  @memberof DataTable#oApi
		 */
		function _fnColumnOrdering ( oSettings )
		{
			var sNames = '';
			for ( var i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				sNames += oSettings.aoColumns[i].sName+',';
			}
			if ( sNames.length == iLen )
			{
				return "";
			}
			return sNames.slice(0, -1);
		}


		/**
		 * Take the column definitions and static columns arrays and calculate how
		 * they relate to column indexes. The callback function will then apply the
		 * definition found for a column to a suitable configuration object.
		 *  @param {object} oSettings dataTables settings object
		 *  @param {array} aoColDefs The aoColumnDefs array that is to be applied
		 *  @param {array} aoCols The aoColumns array that defines columns individually
		 *  @param {function} fn Callback function - takes two parameters, the calculated
		 *    column index and the definition for that column.
		 *  @memberof DataTable#oApi
		 */
		function _fnApplyColumnDefs( oSettings, aoColDefs, aoCols, fn )
		{
			var i, iLen, j, jLen, k, kLen;

			// Column definitions with aTargets
			if ( aoColDefs )
			{
				/* Loop over the definitions array - loop in reverse so first instance has priority */
				for ( i=aoColDefs.length-1 ; i>=0 ; i-- )
				{
					/* Each definition can target multiple columns, as it is an array */
					var aTargets = aoColDefs[i].aTargets;
					if ( !$.isArray( aTargets ) )
					{
						_fnLog( oSettings, 1, 'aTargets must be an array of targets, not a '+(typeof aTargets) );
					}

					for ( j=0, jLen=aTargets.length ; j<jLen ; j++ )
					{
						if ( typeof aTargets[j] === 'number' && aTargets[j] >= 0 )
						{
							/* Add columns that we don't yet know about */
							while( oSettings.aoColumns.length <= aTargets[j] )
							{
								_fnAddColumn( oSettings );
							}

							/* Integer, basic index */
							fn( aTargets[j], aoColDefs[i] );
						}
						else if ( typeof aTargets[j] === 'number' && aTargets[j] < 0 )
						{
							/* Negative integer, right to left column counting */
							fn( oSettings.aoColumns.length+aTargets[j], aoColDefs[i] );
						}
						else if ( typeof aTargets[j] === 'string' )
						{
							/* Class name matching on TH element */
							for ( k=0, kLen=oSettings.aoColumns.length ; k<kLen ; k++ )
							{
								if ( aTargets[j] == "_all" ||
										$(oSettings.aoColumns[k].nTh).hasClass( aTargets[j] ) )
								{
									fn( k, aoColDefs[i] );
								}
							}
						}
					}
				}
			}

			// Statically defined columns array
			if ( aoCols )
			{
				for ( i=0, iLen=aoCols.length ; i<iLen ; i++ )
				{
					fn( i, aoCols[i] );
				}
			}
		}



		/**
		 * Add a data array to the table, creating DOM node etc. This is the parallel to
		 * _fnGatherData, but for adding rows from a Javascript source, rather than a
		 * DOM source.
		 *  @param {object} oSettings dataTables settings object
		 *  @param {array} aData data array to be added
		 *  @returns {int} >=0 if successful (index of new aoData entry), -1 if failed
		 *  @memberof DataTable#oApi
		 */
		function _fnAddData ( oSettings, aDataSupplied )
		{
			var oCol;

			/* Take an independent copy of the data source so we can bash it about as we wish */
			var aDataIn = ($.isArray(aDataSupplied)) ?
					aDataSupplied.slice() :
					$.extend( true, {}, aDataSupplied );

			/* Create the object for storing information about this new row */
			var iRow = oSettings.aoData.length;
			var oData = $.extend( true, {}, DataTable.models.oRow, {
				"_aData": aDataIn
			} );
			oSettings.aoData.push( oData );

			/* Create the cells */
			var nTd, sThisType;
			for ( var i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				oCol = oSettings.aoColumns[i];

				/* Use rendered data for filtering/sorting */
				if ( typeof oCol.fnRender === 'function' && oCol.bUseRendered && oCol.mDataProp !== null )
				{
					_fnSetCellData( oSettings, iRow, i, _fnRender(oSettings, iRow, i) );
				}

				/* See if we should auto-detect the column type */
				if ( oCol._bAutoType && oCol.sType != 'string' )
				{
					/* Attempt to auto detect the type - same as _fnGatherData() */
					var sVarType = _fnGetCellData( oSettings, iRow, i, 'type' );
					if ( sVarType !== null && sVarType !== '' )
					{
						sThisType = _fnDetectType( sVarType );
						if ( oCol.sType === null )
						{
							oCol.sType = sThisType;
						}
						else if ( oCol.sType != sThisType && oCol.sType != "html" )
						{
							/* String is always the 'fallback' option */
							oCol.sType = 'string';
						}
					}
				}
			}

			/* Add to the display array */
			oSettings.aiDisplayMaster.push( iRow );

			/* Create the DOM imformation */
			if ( !oSettings.oFeatures.bDeferRender )
			{
				_fnCreateTr( oSettings, iRow );
			}

			return iRow;
		}


		/**
		 * Read in the data from the target table from the DOM
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnGatherData( oSettings )
		{
			var iLoop, i, iLen, j, jLen, jInner,
					nTds, nTrs, nTd, aLocalData, iThisIndex,
					iRow, iRows, iColumn, iColumns, sNodeName,
					oCol, oData;

			/*
			 * Process by row first
			 * Add the data object for the whole table - storing the tr node. Note - no point in getting
			 * DOM based data if we are going to go and replace it with Ajax source data.
			 */
			if ( oSettings.bDeferLoading || oSettings.sAjaxSource === null )
			{
				nTrs = oSettings.nTBody.childNodes;
				for ( i=0, iLen=nTrs.length ; i<iLen ; i++ )
				{
					if ( nTrs[i].nodeName.toUpperCase() == "TR" )
					{
						iThisIndex = oSettings.aoData.length;
						nTrs[i]._DT_RowIndex = iThisIndex;
						oSettings.aoData.push( $.extend( true, {}, DataTable.models.oRow, {
							"nTr": nTrs[i]
						} ) );

						oSettings.aiDisplayMaster.push( iThisIndex );
						nTds = nTrs[i].childNodes;
						jInner = 0;

						for ( j=0, jLen=nTds.length ; j<jLen ; j++ )
						{
							sNodeName = nTds[j].nodeName.toUpperCase();
							if ( sNodeName == "TD" || sNodeName == "TH" )
							{
								_fnSetCellData( oSettings, iThisIndex, jInner, $.trim(nTds[j].innerHTML) );
								jInner++;
							}
						}
					}
				}
			}

			/* Gather in the TD elements of the Table - note that this is basically the same as
			 * fnGetTdNodes, but that function takes account of hidden columns, which we haven't yet
			 * setup!
			 */
			nTrs = _fnGetTrNodes( oSettings );
			nTds = [];
			for ( i=0, iLen=nTrs.length ; i<iLen ; i++ )
			{
				for ( j=0, jLen=nTrs[i].childNodes.length ; j<jLen ; j++ )
				{
					nTd = nTrs[i].childNodes[j];
					sNodeName = nTd.nodeName.toUpperCase();
					if ( sNodeName == "TD" || sNodeName == "TH" )
					{
						nTds.push( nTd );
					}
				}
			}

			/* Now process by column */
			for ( iColumn=0, iColumns=oSettings.aoColumns.length ; iColumn<iColumns ; iColumn++ )
			{
				oCol = oSettings.aoColumns[iColumn];

				/* Get the title of the column - unless there is a user set one */
				if ( oCol.sTitle === null )
				{
					oCol.sTitle = oCol.nTh.innerHTML;
				}

				var
						bAutoType = oCol._bAutoType,
						bRender = typeof oCol.fnRender === 'function',
						bClass = oCol.sClass !== null,
						bVisible = oCol.bVisible,
						nCell, sThisType, sRendered, sValType;

				/* A single loop to rule them all (and be more efficient) */
				if ( bAutoType || bRender || bClass || !bVisible )
				{
					for ( iRow=0, iRows=oSettings.aoData.length ; iRow<iRows ; iRow++ )
					{
						oData = oSettings.aoData[iRow];
						nCell = nTds[ (iRow*iColumns) + iColumn ];

						/* Type detection */
						if ( bAutoType && oCol.sType != 'string' )
						{
							sValType = _fnGetCellData( oSettings, iRow, iColumn, 'type' );
							if ( sValType !== '' )
							{
								sThisType = _fnDetectType( sValType );
								if ( oCol.sType === null )
								{
									oCol.sType = sThisType;
								}
								else if ( oCol.sType != sThisType &&
										oCol.sType != "html" )
								{
									/* String is always the 'fallback' option */
									oCol.sType = 'string';
								}
							}
						}

						if ( typeof oCol.mDataProp === 'function' )
						{
							nCell.innerHTML = _fnGetCellData( oSettings, iRow, iColumn, 'display' );
						}

						/* Rendering */
						if ( bRender )
						{
							sRendered = _fnRender( oSettings, iRow, iColumn );
							nCell.innerHTML = sRendered;
							if ( oCol.bUseRendered )
							{
								/* Use the rendered data for filtering/sorting */
								_fnSetCellData( oSettings, iRow, iColumn, sRendered );
							}
						}

						/* Classes */
						if ( bClass )
						{
							nCell.className += ' '+oCol.sClass;
						}

						/* Column visability */
						if ( !bVisible )
						{
							oData._anHidden[iColumn] = nCell;
							nCell.parentNode.removeChild( nCell );
						}
						else
						{
							oData._anHidden[iColumn] = null;
						}

						if ( oCol.fnCreatedCell )
						{
							oCol.fnCreatedCell.call( oSettings.oInstance,
									nCell, _fnGetCellData( oSettings, iRow, iColumn, 'display' ), oData._aData, iRow, iColumn
							);
						}
					}
				}
			}

			/* Row created callbacks */
			if ( oSettings.aoRowCreatedCallback.length !== 0 )
			{
				for ( i=0, iLen=oSettings.aoData.length ; i<iLen ; i++ )
				{
					oData = oSettings.aoData[i];
					_fnCallbackFire( oSettings, 'aoRowCreatedCallback', null, [oData.nTr, oData._aData, i] );
				}
			}
		}


		/**
		 * Take a TR element and convert it to an index in aoData
		 *  @param {object} oSettings dataTables settings object
		 *  @param {node} n the TR element to find
		 *  @returns {int} index if the node is found, null if not
		 *  @memberof DataTable#oApi
		 */
		function _fnNodeToDataIndex( oSettings, n )
		{
			return (n._DT_RowIndex!==undefined) ? n._DT_RowIndex : null;
		}


		/**
		 * Take a TD element and convert it into a column data index (not the visible index)
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iRow The row number the TD/TH can be found in
		 *  @param {node} n The TD/TH element to find
		 *  @returns {int} index if the node is found, -1 if not
		 *  @memberof DataTable#oApi
		 */
		function _fnNodeToColumnIndex( oSettings, iRow, n )
		{
			var anCells = _fnGetTdNodes( oSettings, iRow );

			for ( var i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				if ( anCells[i] === n )
				{
					return i;
				}
			}
			return -1;
		}


		/**
		 * Get an array of data for a given row from the internal data cache
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iRow aoData row id
		 *  @param {string} sSpecific data get type ('type' 'filter' 'sort')
		 *  @returns {array} Data array
		 *  @memberof DataTable#oApi
		 */
		function _fnGetRowData( oSettings, iRow, sSpecific )
		{
			var out = [];
			for ( var i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				out.push( _fnGetCellData( oSettings, iRow, i, sSpecific ) );
			}
			return out;
		}


		/**
		 * Get the data for a given cell from the internal cache, taking into account data mapping
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iRow aoData row id
		 *  @param {int} iCol Column index
		 *  @param {string} sSpecific data get type ('display', 'type' 'filter' 'sort')
		 *  @returns {*} Cell data
		 *  @memberof DataTable#oApi
		 */
		function _fnGetCellData( oSettings, iRow, iCol, sSpecific )
		{
			var sData;
			var oCol = oSettings.aoColumns[iCol];
			var oData = oSettings.aoData[iRow]._aData;

			if ( (sData=oCol.fnGetData( oData, sSpecific )) === undefined )
			{
				if ( oSettings.iDrawError != oSettings.iDraw && oCol.sDefaultContent === null )
				{
					_fnLog( oSettings, 0, "Requested unknown parameter '"+oCol.mDataProp+
							"' from the data source for row "+iRow );
					oSettings.iDrawError = oSettings.iDraw;
				}
				return oCol.sDefaultContent;
			}

			/* When the data source is null, we can use default column data */
			if ( sData === null && oCol.sDefaultContent !== null )
			{
				sData = oCol.sDefaultContent;
			}
			else if ( typeof sData === 'function' )
			{
				/* If the data source is a function, then we run it and use the return */
				return sData();
			}

			if ( sSpecific == 'display' && sData === null )
			{
				return '';
			}
			return sData;
		}


		/**
		 * Set the value for a specific cell, into the internal data cache
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iRow aoData row id
		 *  @param {int} iCol Column index
		 *  @param {*} val Value to set
		 *  @memberof DataTable#oApi
		 */
		function _fnSetCellData( oSettings, iRow, iCol, val )
		{
			var oCol = oSettings.aoColumns[iCol];
			var oData = oSettings.aoData[iRow]._aData;

			oCol.fnSetData( oData, val );
		}


		/**
		 * Return a function that can be used to get data from a source object, taking
		 * into account the ability to use nested objects as a source
		 *  @param {string|int|function} mSource The data source for the object
		 *  @returns {function} Data get function
		 *  @memberof DataTable#oApi
		 */
		function _fnGetObjectDataFn( mSource )
		{
			if ( mSource === null )
			{
				/* Give an empty string for rendering / sorting etc */
				return function (data, type) {
					return null;
				};
			}
			else if ( typeof mSource === 'function' )
			{
				return function (data, type) {
					return mSource( data, type );
				};
			}
			else if ( typeof mSource === 'string' && mSource.indexOf('.') != -1 )
			{
				/* If there is a . in the source string then the data source is in a
				 * nested object so we loop over the data for each level to get the next
				 * level down. On each loop we test for undefined, and if found immediatly
				 * return. This allows entire objects to be missing and sDefaultContent to
				 * be used if defined, rather than throwing an error
				 */
				var a = mSource.split('.');
				return function (data, type) {
					for ( var i=0, iLen=a.length ; i<iLen ; i++ )
					{
						data = data[ a[i] ];
						if ( data === undefined )
						{
							return undefined;
						}
					}
					return data;
				};
			}
			else
			{
				/* Array or flat object mapping */
				return function (data, type) {
					return data[mSource];
				};
			}
		}


		/**
		 * Return a function that can be used to set data from a source object, taking
		 * into account the ability to use nested objects as a source
		 *  @param {string|int|function} mSource The data source for the object
		 *  @returns {function} Data set function
		 *  @memberof DataTable#oApi
		 */
		function _fnSetObjectDataFn( mSource )
		{
			if ( mSource === null )
			{
				/* Nothing to do when the data source is null */
				return function (data, val) {};
			}
			else if ( typeof mSource === 'function' )
			{
				return function (data, val) {
					mSource( data, 'set', val );
				};
			}
			else if ( typeof mSource === 'string' && mSource.indexOf('.') != -1 )
			{
				/* Like the get, we need to get data from a nested object.  */
				var a = mSource.split('.');
				return function (data, val) {
					for ( var i=0, iLen=a.length-1 ; i<iLen ; i++ )
					{
						data = data[ a[i] ];
					}
					data[ a[a.length-1] ] = val;
				};
			}
			else
			{
				/* Array or flat object mapping */
				return function (data, val) {
					data[mSource] = val;
				};
			}
		}


		/**
		 * Return an array with the full table data
		 *  @param {object} oSettings dataTables settings object
		 *  @returns array {array} aData Master data array
		 *  @memberof DataTable#oApi
		 */
		function _fnGetDataMaster ( oSettings )
		{
			var aData = [];
			var iLen = oSettings.aoData.length;
			for ( var i=0 ; i<iLen; i++ )
			{
				aData.push( oSettings.aoData[i]._aData );
			}
			return aData;
		}


		/**
		 * Nuke the table
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnClearTable( oSettings )
		{
			oSettings.aoData.splice( 0, oSettings.aoData.length );
			oSettings.aiDisplayMaster.splice( 0, oSettings.aiDisplayMaster.length );
			oSettings.aiDisplay.splice( 0, oSettings.aiDisplay.length );
			_fnCalculateEnd( oSettings );
		}


		/**
		 * Take an array of integers (index array) and remove a target integer (value - not
		 * the key!)
		 *  @param {array} a Index array to target
		 *  @param {int} iTarget value to find
		 *  @memberof DataTable#oApi
		 */
		function _fnDeleteIndex( a, iTarget )
		{
			var iTargetIndex = -1;

			for ( var i=0, iLen=a.length ; i<iLen ; i++ )
			{
				if ( a[i] == iTarget )
				{
					iTargetIndex = i;
				}
				else if ( a[i] > iTarget )
				{
					a[i]--;
				}
			}

			if ( iTargetIndex != -1 )
			{
				a.splice( iTargetIndex, 1 );
			}
		}


		/**
		 * Call the developer defined fnRender function for a given cell (row/column) with
		 * the required parameters and return the result.
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iRow aoData index for the row
		 *  @param {int} iCol aoColumns index for the column
		 *  @returns {*} Return of the developer's fnRender function
		 *  @memberof DataTable#oApi
		 */
		function _fnRender( oSettings, iRow, iCol )
		{
			var oCol = oSettings.aoColumns[iCol];

			return oCol.fnRender( {
				"iDataRow":    iRow,
				"iDataColumn": iCol,
				"oSettings":   oSettings,
				"aData":       oSettings.aoData[iRow]._aData,
				"mDataProp":   oCol.mDataProp
			}, _fnGetCellData(oSettings, iRow, iCol, 'display') );
		}


		/**
		 * Create a new TR element (and it's TD children) for a row
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iRow Row to consider
		 *  @memberof DataTable#oApi
		 */
		function _fnCreateTr ( oSettings, iRow )
		{
			var oData = oSettings.aoData[iRow];
			var nTd;

			if ( oData.nTr === null )
			{
				oData.nTr = document.createElement('tr');

				/* Use a private property on the node to allow reserve mapping from the node
				 * to the aoData array for fast look up
				 */
				oData.nTr._DT_RowIndex = iRow;

				/* Special parameters can be given by the data source to be used on the row */
				if ( oData._aData.DT_RowId )
				{
					oData.nTr.id = oData._aData.DT_RowId;
				}

				if ( oData._aData.DT_RowClass )
				{
					$(oData.nTr).addClass( oData._aData.DT_RowClass );
				}

				/* Process each column */
				for ( var i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
				{
					var oCol = oSettings.aoColumns[i];
					nTd = document.createElement('td');

					/* Render if needed - if bUseRendered is true then we already have the rendered
					 * value in the data source - so can just use that
					 */
					nTd.innerHTML = (typeof oCol.fnRender === 'function' && (!oCol.bUseRendered || oCol.mDataProp === null)) ?
							_fnRender( oSettings, iRow, i ) :
							_fnGetCellData( oSettings, iRow, i, 'display' );

					/* Add user defined class */
					if ( oCol.sClass !== null )
					{
						nTd.className = oCol.sClass;
					}

					if ( oCol.bVisible )
					{
						oData.nTr.appendChild( nTd );
						oData._anHidden[i] = null;
					}
					else
					{
						oData._anHidden[i] = nTd;
					}

					if ( oCol.fnCreatedCell )
					{
						oCol.fnCreatedCell.call( oSettings.oInstance,
								nTd, _fnGetCellData( oSettings, iRow, i, 'display' ), oData._aData, iRow, i
						);
					}
				}

				_fnCallbackFire( oSettings, 'aoRowCreatedCallback', null, [oData.nTr, oData._aData, iRow] );
			}
		}


		/**
		 * Create the HTML header for the table
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnBuildHead( oSettings )
		{
			var i, nTh, iLen, j, jLen;
			var iThs = oSettings.nTHead.getElementsByTagName('th').length;
			var iCorrector = 0;
			var jqChildren;

			/* If there is a header in place - then use it - otherwise it's going to get nuked... */
			if ( iThs !== 0 )
			{
				/* We've got a thead from the DOM, so remove hidden columns and apply width to vis cols */
				for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
				{
					nTh = oSettings.aoColumns[i].nTh;
					nTh.setAttribute('role', 'columnheader');
					if ( oSettings.aoColumns[i].bSortable )
					{
						nTh.setAttribute('tabindex', oSettings.iTabIndex);
						nTh.setAttribute('aria-controls', oSettings.sTableId);
					}

					if ( oSettings.aoColumns[i].sClass !== null )
					{
						$(nTh).addClass( oSettings.aoColumns[i].sClass );
					}

					/* Set the title of the column if it is user defined (not what was auto detected) */
					if ( oSettings.aoColumns[i].sTitle != nTh.innerHTML )
					{
						nTh.innerHTML = oSettings.aoColumns[i].sTitle;
					}
				}
			}
			else
			{
				/* We don't have a header in the DOM - so we are going to have to create one */
				var nTr = document.createElement( "tr" );

				for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
				{
					nTh = oSettings.aoColumns[i].nTh;
					nTh.innerHTML = oSettings.aoColumns[i].sTitle;
					nTh.setAttribute('tabindex', '0');

					if ( oSettings.aoColumns[i].sClass !== null )
					{
						$(nTh).addClass( oSettings.aoColumns[i].sClass );
					}

					nTr.appendChild( nTh );
				}
				$(oSettings.nTHead).html( '' )[0].appendChild( nTr );
				_fnDetectHeader( oSettings.aoHeader, oSettings.nTHead );
			}

			/* ARIA role for the rows */
			$(oSettings.nTHead).children('tr').attr('role', 'row');

			/* Add the extra markup needed by jQuery UI's themes */
			if ( oSettings.bJUI )
			{
				for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
				{
					nTh = oSettings.aoColumns[i].nTh;

					var nDiv = document.createElement('div');
					nDiv.className = oSettings.oClasses.sSortJUIWrapper;
					$(nTh).contents().appendTo(nDiv);

					var nSpan = document.createElement('span');
					nSpan.className = oSettings.oClasses.sSortIcon;
					nDiv.appendChild( nSpan );
					nTh.appendChild( nDiv );
				}
			}

			if ( oSettings.oFeatures.bSort )
			{
				for ( i=0 ; i<oSettings.aoColumns.length ; i++ )
				{
					if ( oSettings.aoColumns[i].bSortable !== false )
					{
						_fnSortAttachListener( oSettings, oSettings.aoColumns[i].nTh, i );
					}
					else
					{
						$(oSettings.aoColumns[i].nTh).addClass( oSettings.oClasses.sSortableNone );
					}
				}
			}

			/* Deal with the footer - add classes if required */
			if ( oSettings.oClasses.sFooterTH !== "" )
			{
				$(oSettings.nTFoot).children('tr').children('th').addClass( oSettings.oClasses.sFooterTH );
			}

			/* Cache the footer elements */
			if ( oSettings.nTFoot !== null )
			{
				var anCells = _fnGetUniqueThs( oSettings, null, oSettings.aoFooter );
				for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
				{
					if ( anCells[i] )
					{
						oSettings.aoColumns[i].nTf = anCells[i];
						if ( oSettings.aoColumns[i].sClass )
						{
							$(anCells[i]).addClass( oSettings.aoColumns[i].sClass );
						}
					}
				}
			}
		}


		/**
		 * Draw the header (or footer) element based on the column visibility states. The
		 * methodology here is to use the layout array from _fnDetectHeader, modified for
		 * the instantaneous column visibility, to construct the new layout. The grid is
		 * traversed over cell at a time in a rows x columns grid fashion, although each
		 * cell insert can cover multiple elements in the grid - which is tracks using the
		 * aApplied array. Cell inserts in the grid will only occur where there isn't
		 * already a cell in that position.
		 *  @param {object} oSettings dataTables settings object
		 *  @param array {objects} aoSource Layout array from _fnDetectHeader
		 *  @param {boolean} [bIncludeHidden=false] If true then include the hidden columns in the calc,
		 *  @memberof DataTable#oApi
		 */
		function _fnDrawHead( oSettings, aoSource, bIncludeHidden )
		{
			var i, iLen, j, jLen, k, kLen, n, nLocalTr;
			var aoLocal = [];
			var aApplied = [];
			var iColumns = oSettings.aoColumns.length;
			var iRowspan, iColspan;

			if (  bIncludeHidden === undefined )
			{
				bIncludeHidden = false;
			}

			/* Make a copy of the master layout array, but without the visible columns in it */
			for ( i=0, iLen=aoSource.length ; i<iLen ; i++ )
			{
				aoLocal[i] = aoSource[i].slice();
				aoLocal[i].nTr = aoSource[i].nTr;

				/* Remove any columns which are currently hidden */
				for ( j=iColumns-1 ; j>=0 ; j-- )
				{
					if ( !oSettings.aoColumns[j].bVisible && !bIncludeHidden )
					{
						aoLocal[i].splice( j, 1 );
					}
				}

				/* Prep the applied array - it needs an element for each row */
				aApplied.push( [] );
			}

			for ( i=0, iLen=aoLocal.length ; i<iLen ; i++ )
			{
				nLocalTr = aoLocal[i].nTr;

				/* All cells are going to be replaced, so empty out the row */
				if ( nLocalTr )
				{
					while( (n = nLocalTr.firstChild) )
					{
						nLocalTr.removeChild( n );
					}
				}

				for ( j=0, jLen=aoLocal[i].length ; j<jLen ; j++ )
				{
					iRowspan = 1;
					iColspan = 1;

					/* Check to see if there is already a cell (row/colspan) covering our target
					 * insert point. If there is, then there is nothing to do.
					 */
					if ( aApplied[i][j] === undefined )
					{
						nLocalTr.appendChild( aoLocal[i][j].cell );
						aApplied[i][j] = 1;

						/* Expand the cell to cover as many rows as needed */
						while ( aoLocal[i+iRowspan] !== undefined &&
								aoLocal[i][j].cell == aoLocal[i+iRowspan][j].cell )
						{
							aApplied[i+iRowspan][j] = 1;
							iRowspan++;
						}

						/* Expand the cell to cover as many columns as needed */
						while ( aoLocal[i][j+iColspan] !== undefined &&
								aoLocal[i][j].cell == aoLocal[i][j+iColspan].cell )
						{
							/* Must update the applied array over the rows for the columns */
							for ( k=0 ; k<iRowspan ; k++ )
							{
								aApplied[i+k][j+iColspan] = 1;
							}
							iColspan++;
						}

						/* Do the actual expansion in the DOM */
						aoLocal[i][j].cell.rowSpan = iRowspan;
						aoLocal[i][j].cell.colSpan = iColspan;
					}
				}
			}
		}


		/**
		 * Insert the required TR nodes into the table for display
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnDraw( oSettings )
		{
			var i, iLen, n;
			var anRows = [];
			var iRowCount = 0;
			var iStripes = oSettings.asStripeClasses.length;
			var iOpenRows = oSettings.aoOpenRows.length;

			/* Provide a pre-callback function which can be used to cancel the draw is false is returned */
			var aPreDraw = _fnCallbackFire( oSettings, 'aoPreDrawCallback', 'preDraw', [oSettings] );
			if ( $.inArray( false, aPreDraw ) !== -1 )
			{
				return;
			}

			oSettings.bDrawing = true;

			/* Check and see if we have an initial draw position from state saving */
			if ( oSettings.iInitDisplayStart !== undefined && oSettings.iInitDisplayStart != -1 )
			{
				if ( oSettings.oFeatures.bServerSide )
				{
					oSettings._iDisplayStart = oSettings.iInitDisplayStart;
				}
				else
				{
					oSettings._iDisplayStart = (oSettings.iInitDisplayStart >= oSettings.fnRecordsDisplay()) ?
							0 : oSettings.iInitDisplayStart;
				}
				oSettings.iInitDisplayStart = -1;
				_fnCalculateEnd( oSettings );
			}

			/* Server-side processing draw intercept */
			if ( oSettings.bDeferLoading )
			{
				oSettings.bDeferLoading = false;
				oSettings.iDraw++;
			}
			else if ( !oSettings.oFeatures.bServerSide )
			{
				oSettings.iDraw++;
			}
			else if ( !oSettings.bDestroying && !_fnAjaxUpdate( oSettings ) )
			{
				return;
			}

			if ( oSettings.aiDisplay.length !== 0 )
			{
				var iStart = oSettings._iDisplayStart;
				var iEnd = oSettings._iDisplayEnd;

				if ( oSettings.oFeatures.bServerSide )
				{
					iStart = 0;
					iEnd = oSettings.aoData.length;
				}

				for ( var j=iStart ; j<iEnd ; j++ )
				{
					var aoData = oSettings.aoData[ oSettings.aiDisplay[j] ];
					if ( aoData.nTr === null )
					{
						_fnCreateTr( oSettings, oSettings.aiDisplay[j] );
					}

					var nRow = aoData.nTr;

					/* Remove the old striping classes and then add the new one */
					if ( iStripes !== 0 )
					{
						var sStripe = oSettings.asStripeClasses[ iRowCount % iStripes ];
						if ( aoData._sRowStripe != sStripe )
						{
							$(nRow).removeClass( aoData._sRowStripe ).addClass( sStripe );
							aoData._sRowStripe = sStripe;
						}
					}

					/* Row callback functions - might want to manipule the row */
					_fnCallbackFire( oSettings, 'aoRowCallback', null,
							[nRow, oSettings.aoData[ oSettings.aiDisplay[j] ]._aData, iRowCount, j] );

					anRows.push( nRow );
					iRowCount++;

					/* If there is an open row - and it is attached to this parent - attach it on redraw */
					if ( iOpenRows !== 0 )
					{
						for ( var k=0 ; k<iOpenRows ; k++ )
						{
							if ( nRow == oSettings.aoOpenRows[k].nParent )
							{
								anRows.push( oSettings.aoOpenRows[k].nTr );
								break;
							}
						}
					}
				}
			}
			else
			{
				/* Table is empty - create a row with an empty message in it */
				anRows[ 0 ] = document.createElement( 'tr' );

				if ( oSettings.asStripeClasses[0] )
				{
					anRows[ 0 ].className = oSettings.asStripeClasses[0];
				}

				var sZero = oSettings.oLanguage.sZeroRecords.replace(
						'_MAX_', oSettings.fnFormatNumber(oSettings.fnRecordsTotal()) );
				if ( oSettings.iDraw == 1 && oSettings.sAjaxSource !== null && !oSettings.oFeatures.bServerSide )
				{
					sZero = oSettings.oLanguage.sLoadingRecords;
				}
				else if ( oSettings.oLanguage.sEmptyTable && oSettings.fnRecordsTotal() === 0 )
				{
					sZero = oSettings.oLanguage.sEmptyTable;
				}

				var nTd = document.createElement( 'td' );
				nTd.setAttribute( 'valign', "top" );
				nTd.colSpan = _fnVisbleColumns( oSettings );
				nTd.className = oSettings.oClasses.sRowEmpty;
				nTd.innerHTML = sZero;

				anRows[ iRowCount ].appendChild( nTd );
			}

			/* Header and footer callbacks */
			_fnCallbackFire( oSettings, 'aoHeaderCallback', 'header', [ $(oSettings.nTHead).children('tr')[0],
				_fnGetDataMaster( oSettings ), oSettings._iDisplayStart, oSettings.fnDisplayEnd(), oSettings.aiDisplay ] );

			_fnCallbackFire( oSettings, 'aoFooterCallback', 'footer', [ $(oSettings.nTFoot).children('tr')[0],
				_fnGetDataMaster( oSettings ), oSettings._iDisplayStart, oSettings.fnDisplayEnd(), oSettings.aiDisplay ] );

			/*
			 * Need to remove any old row from the display - note we can't just empty the tbody using
			 * $().html('') since this will unbind the jQuery event handlers (even although the node
			 * still exists!) - equally we can't use innerHTML, since IE throws an exception.
			 */
			var
					nAddFrag = document.createDocumentFragment(),
					nRemoveFrag = document.createDocumentFragment(),
					nBodyPar, nTrs;

			if ( oSettings.nTBody )
			{
				nBodyPar = oSettings.nTBody.parentNode;
				nRemoveFrag.appendChild( oSettings.nTBody );

				/* When doing infinite scrolling, only remove child rows when sorting, filtering or start
				 * up. When not infinite scroll, always do it.
				 */
				if ( !oSettings.oScroll.bInfinite || !oSettings._bInitComplete ||
						oSettings.bSorted || oSettings.bFiltered )
				{
					while( (n = oSettings.nTBody.firstChild) )
					{
						oSettings.nTBody.removeChild( n );
					}
				}

				/* Put the draw table into the dom */
				for ( i=0, iLen=anRows.length ; i<iLen ; i++ )
				{
					nAddFrag.appendChild( anRows[i] );
				}

				oSettings.nTBody.appendChild( nAddFrag );
				if ( nBodyPar !== null )
				{
					nBodyPar.appendChild( oSettings.nTBody );
				}
			}

			/* Call all required callback functions for the end of a draw */
			_fnCallbackFire( oSettings, 'aoDrawCallback', 'draw', [oSettings] );

			/* Draw is complete, sorting and filtering must be as well */
			oSettings.bSorted = false;
			oSettings.bFiltered = false;
			oSettings.bDrawing = false;

			if ( oSettings.oFeatures.bServerSide )
			{
				_fnProcessingDisplay( oSettings, false );
				if ( !oSettings._bInitComplete )
				{
					_fnInitComplete( oSettings );
				}
			}
		}


		/**
		 * Redraw the table - taking account of the various features which are enabled
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnReDraw( oSettings )
		{
			if ( oSettings.oFeatures.bSort )
			{
				/* Sorting will refilter and draw for us */
				_fnSort( oSettings, oSettings.oPreviousSearch );
			}
			else if ( oSettings.oFeatures.bFilter )
			{
				/* Filtering will redraw for us */
				_fnFilterComplete( oSettings, oSettings.oPreviousSearch );
			}
			else
			{
				_fnCalculateEnd( oSettings );
				_fnDraw( oSettings );
			}
		}


		/**
		 * Add the options to the page HTML for the table
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnAddOptionsHtml ( oSettings )
		{
			/*
			 * Create a temporary, empty, div which we can later on replace with what we have generated
			 * we do it this way to rendering the 'options' html offline - speed :-)
			 */
			var nHolding = $('<div></div>')[0];
			oSettings.nTable.parentNode.insertBefore( nHolding, oSettings.nTable );

			/*
			 * All DataTables are wrapped in a div
			 */
			oSettings.nTableWrapper = $('<div id="'+oSettings.sTableId+'_wrapper" class="'+oSettings.oClasses.sWrapper+'" role="grid"></div>')[0];
			oSettings.nTableReinsertBefore = oSettings.nTable.nextSibling;

			/* Track where we want to insert the option */
			var nInsertNode = oSettings.nTableWrapper;

			/* Loop over the user set positioning and place the elements as needed */
			var aDom = oSettings.sDom.split('');
			var nTmp, iPushFeature, cOption, nNewNode, cNext, sAttr, j;
			for ( var i=0 ; i<aDom.length ; i++ )
			{
				iPushFeature = 0;
				cOption = aDom[i];

				if ( cOption == '<' )
				{
					/* New container div */
					nNewNode = $('<div></div>')[0];

					/* Check to see if we should append an id and/or a class name to the container */
					cNext = aDom[i+1];
					if ( cNext == "'" || cNext == '"' )
					{
						sAttr = "";
						j = 2;
						while ( aDom[i+j] != cNext )
						{
							sAttr += aDom[i+j];
							j++;
						}

						/* Replace jQuery UI constants */
						if ( sAttr == "H" )
						{
							sAttr = "fg-toolbar ui-toolbar ui-widget-header ui-corner-tl ui-corner-tr ui-helper-clearfix";
						}
						else if ( sAttr == "F" )
						{
							sAttr = "fg-toolbar ui-toolbar ui-widget-header ui-corner-bl ui-corner-br ui-helper-clearfix";
						}

						/* The attribute can be in the format of "#id.class", "#id" or "class" This logic
						 * breaks the string into parts and applies them as needed
						 */
						if ( sAttr.indexOf('.') != -1 )
						{
							var aSplit = sAttr.split('.');
							nNewNode.id = aSplit[0].substr(1, aSplit[0].length-1);
							nNewNode.className = aSplit[1];
						}
						else if ( sAttr.charAt(0) == "#" )
						{
							nNewNode.id = sAttr.substr(1, sAttr.length-1);
						}
						else
						{
							nNewNode.className = sAttr;
						}

						i += j; /* Move along the position array */
					}

					nInsertNode.appendChild( nNewNode );
					nInsertNode = nNewNode;
				}
				else if ( cOption == '>' )
				{
					/* End container div */
					nInsertNode = nInsertNode.parentNode;
				}
				else if ( cOption == 'l' && oSettings.oFeatures.bPaginate && oSettings.oFeatures.bLengthChange )
				{
					/* Length */
					nTmp = _fnFeatureHtmlLength( oSettings );
					iPushFeature = 1;
				}
				else if ( cOption == 'f' && oSettings.oFeatures.bFilter )
				{
					/* Filter */
					nTmp = _fnFeatureHtmlFilter( oSettings );
					iPushFeature = 1;
				}
				else if ( cOption == 'r' && oSettings.oFeatures.bProcessing )
				{
					/* pRocessing */
					nTmp = _fnFeatureHtmlProcessing( oSettings );
					iPushFeature = 1;
				}
				else if ( cOption == 't' )
				{
					/* Table */
					nTmp = _fnFeatureHtmlTable( oSettings );
					iPushFeature = 1;
				}
				else if ( cOption ==  'i' && oSettings.oFeatures.bInfo )
				{
					/* Info */
					nTmp = _fnFeatureHtmlInfo( oSettings );
					iPushFeature = 1;
				}
				else if ( cOption == 'p' && oSettings.oFeatures.bPaginate )
				{
					/* Pagination */
					nTmp = _fnFeatureHtmlPaginate( oSettings );
					iPushFeature = 1;
				}
				else if ( DataTable.ext.aoFeatures.length !== 0 )
				{
					/* Plug-in features */
					var aoFeatures = DataTable.ext.aoFeatures;
					for ( var k=0, kLen=aoFeatures.length ; k<kLen ; k++ )
					{
						if ( cOption == aoFeatures[k].cFeature )
						{
							nTmp = aoFeatures[k].fnInit( oSettings );
							if ( nTmp )
							{
								iPushFeature = 1;
							}
							break;
						}
					}
				}

				/* Add to the 2D features array */
				if ( iPushFeature == 1 && nTmp !== null )
				{
					if ( typeof oSettings.aanFeatures[cOption] !== 'object' )
					{
						oSettings.aanFeatures[cOption] = [];
					}
					oSettings.aanFeatures[cOption].push( nTmp );
					nInsertNode.appendChild( nTmp );
				}
			}

			/* Built our DOM structure - replace the holding div with what we want */
			nHolding.parentNode.replaceChild( oSettings.nTableWrapper, nHolding );
		}


		/**
		 * Use the DOM source to create up an array of header cells. The idea here is to
		 * create a layout grid (array) of rows x columns, which contains a reference
		 * to the cell that that point in the grid (regardless of col/rowspan), such that
		 * any column / row could be removed and the new grid constructed
		 *  @param array {object} aLayout Array to store the calculated layout in
		 *  @param {node} nThead The header/footer element for the table
		 *  @memberof DataTable#oApi
		 */
		function _fnDetectHeader ( aLayout, nThead )
		{
			var nTrs = $(nThead).children('tr');
			var nCell;
			var i, j, k, l, iLen, jLen, iColShifted;
			var fnShiftCol = function ( a, i, j ) {
				while ( a[i][j] ) {
					j++;
				}
				return j;
			};

			aLayout.splice( 0, aLayout.length );

			/* We know how many rows there are in the layout - so prep it */
			for ( i=0, iLen=nTrs.length ; i<iLen ; i++ )
			{
				aLayout.push( [] );
			}

			/* Calculate a layout array */
			for ( i=0, iLen=nTrs.length ; i<iLen ; i++ )
			{
				var iColumn = 0;

				/* For every cell in the row... */
				for ( j=0, jLen=nTrs[i].childNodes.length ; j<jLen ; j++ )
				{
					nCell = nTrs[i].childNodes[j];

					if ( nCell.nodeName.toUpperCase() == "TD" ||
							nCell.nodeName.toUpperCase() == "TH" )
					{
						/* Get the col and rowspan attributes from the DOM and sanitise them */
						var iColspan = nCell.getAttribute('colspan') * 1;
						var iRowspan = nCell.getAttribute('rowspan') * 1;
						iColspan = (!iColspan || iColspan===0 || iColspan===1) ? 1 : iColspan;
						iRowspan = (!iRowspan || iRowspan===0 || iRowspan===1) ? 1 : iRowspan;

						/* There might be colspan cells already in this row, so shift our target
						 * accordingly
						 */
						iColShifted = fnShiftCol( aLayout, i, iColumn );

						/* If there is col / rowspan, copy the information into the layout grid */
						for ( l=0 ; l<iColspan ; l++ )
						{
							for ( k=0 ; k<iRowspan ; k++ )
							{
								aLayout[i+k][iColShifted+l] = {
									"cell": nCell,
									"unique": iColspan == 1 ? true : false
								};
								aLayout[i+k].nTr = nTrs[i];
							}
						}
					}
				}
			}
		}


		/**
		 * Get an array of unique th elements, one for each column
		 *  @param {object} oSettings dataTables settings object
		 *  @param {node} nHeader automatically detect the layout from this node - optional
		 *  @param {array} aLayout thead/tfoot layout from _fnDetectHeader - optional
		 *  @returns array {node} aReturn list of unique ths
		 *  @memberof DataTable#oApi
		 */
		function _fnGetUniqueThs ( oSettings, nHeader, aLayout )
		{
			var aReturn = [];
			if ( !aLayout )
			{
				aLayout = oSettings.aoHeader;
				if ( nHeader )
				{
					aLayout = [];
					_fnDetectHeader( aLayout, nHeader );
				}
			}

			for ( var i=0, iLen=aLayout.length ; i<iLen ; i++ )
			{
				for ( var j=0, jLen=aLayout[i].length ; j<jLen ; j++ )
				{
					if ( aLayout[i][j].unique &&
							(!aReturn[j] || !oSettings.bSortCellsTop) )
					{
						aReturn[j] = aLayout[i][j].cell;
					}
				}
			}

			return aReturn;
		}



		/**
		 * Update the table using an Ajax call
		 *  @param {object} oSettings dataTables settings object
		 *  @returns {boolean} Block the table drawing or not
		 *  @memberof DataTable#oApi
		 */
		function _fnAjaxUpdate( oSettings )
		{
			if ( oSettings.bAjaxDataGet )
			{
				oSettings.iDraw++;
				_fnProcessingDisplay( oSettings, true );
				var iColumns = oSettings.aoColumns.length;
				var aoData = _fnAjaxParameters( oSettings );
				_fnServerParams( oSettings, aoData );

				oSettings.fnServerData.call( oSettings.oInstance, oSettings.sAjaxSource, aoData,
						function(json) {
							_fnAjaxUpdateDraw( oSettings, json );
						}, oSettings );
				return false;
			}
			else
			{
				return true;
			}
		}


		/**
		 * Build up the parameters in an object needed for a server-side processing request
		 *  @param {object} oSettings dataTables settings object
		 *  @returns {bool} block the table drawing or not
		 *  @memberof DataTable#oApi
		 */
		function _fnAjaxParameters( oSettings )
		{
			var iColumns = oSettings.aoColumns.length;
			var aoData = [], mDataProp;
			var i;

			aoData.push( { "name": "sEcho",          "value": oSettings.iDraw } );
			aoData.push( { "name": "iColumns",       "value": iColumns } );
			aoData.push( { "name": "sColumns",       "value": _fnColumnOrdering(oSettings) } );
			aoData.push( { "name": "iDisplayStart",  "value": oSettings._iDisplayStart } );
			aoData.push( { "name": "iDisplayLength", "value": oSettings.oFeatures.bPaginate !== false ?
					oSettings._iDisplayLength : -1 } );

			for ( i=0 ; i<iColumns ; i++ )
			{
				mDataProp = oSettings.aoColumns[i].mDataProp;
				aoData.push( { "name": "mDataProp_"+i, "value": typeof(mDataProp)==="function" ? 'function' : mDataProp } );
			}

			/* Filtering */
			if ( oSettings.oFeatures.bFilter !== false )
			{
				aoData.push( { "name": "sSearch", "value": oSettings.oPreviousSearch.sSearch } );
				aoData.push( { "name": "bRegex",  "value": oSettings.oPreviousSearch.bRegex } );
				for ( i=0 ; i<iColumns ; i++ )
				{
					aoData.push( { "name": "sSearch_"+i,     "value": oSettings.aoPreSearchCols[i].sSearch } );
					aoData.push( { "name": "bRegex_"+i,      "value": oSettings.aoPreSearchCols[i].bRegex } );
					aoData.push( { "name": "bSearchable_"+i, "value": oSettings.aoColumns[i].bSearchable } );
				}
			}

			/* Sorting */
			if ( oSettings.oFeatures.bSort !== false )
			{
				var iFixed = oSettings.aaSortingFixed !== null ? oSettings.aaSortingFixed.length : 0;
				var iUser = oSettings.aaSorting.length;
				aoData.push( { "name": "iSortingCols",   "value": iFixed+iUser } );
				for ( i=0 ; i<iFixed ; i++ )
				{
					aoData.push( { "name": "iSortCol_"+i,  "value": oSettings.aaSortingFixed[i][0] } );
					aoData.push( { "name": "sSortDir_"+i,  "value": oSettings.aaSortingFixed[i][1] } );
				}

				for ( i=0 ; i<iUser ; i++ )
				{
					aoData.push( { "name": "iSortCol_"+(i+iFixed),  "value": oSettings.aaSorting[i][0] } );
					aoData.push( { "name": "sSortDir_"+(i+iFixed),  "value": oSettings.aaSorting[i][1] } );
				}

				for ( i=0 ; i<iColumns ; i++ )
				{
					aoData.push( { "name": "bSortable_"+i,  "value": oSettings.aoColumns[i].bSortable } );
				}
			}

			return aoData;
		}


		/**
		 * Add Ajax parameters from plugins
		 *  @param {object} oSettings dataTables settings object
		 *  @param array {objects} aoData name/value pairs to send to the server
		 *  @memberof DataTable#oApi
		 */
		function _fnServerParams( oSettings, aoData )
		{
			_fnCallbackFire( oSettings, 'aoServerParams', 'serverParams', [aoData] );
		}


		/**
		 * Data the data from the server (nuking the old) and redraw the table
		 *  @param {object} oSettings dataTables settings object
		 *  @param {object} json json data return from the server.
		 *  @param {string} json.sEcho Tracking flag for DataTables to match requests
		 *  @param {int} json.iTotalRecords Number of records in the data set, not accounting for filtering
		 *  @param {int} json.iTotalDisplayRecords Number of records in the data set, accounting for filtering
		 *  @param {array} json.aaData The data to display on this page
		 *  @param {string} [json.sColumns] Column ordering (sName, comma separated)
		 *  @memberof DataTable#oApi
		 */
		function _fnAjaxUpdateDraw ( oSettings, json )
		{
			if ( json.sEcho !== undefined )
			{
				/* Protect against old returns over-writing a new one. Possible when you get
				 * very fast interaction, and later queires are completed much faster
				 */
				if ( json.sEcho*1 < oSettings.iDraw )
				{
					return;
				}
				else
				{
					oSettings.iDraw = json.sEcho * 1;
				}
			}

			if ( !oSettings.oScroll.bInfinite ||
					(oSettings.oScroll.bInfinite && (oSettings.bSorted || oSettings.bFiltered)) )
			{
				_fnClearTable( oSettings );
			}
			oSettings._iRecordsTotal = parseInt(json.iTotalRecords, 10);
			oSettings._iRecordsDisplay = parseInt(json.iTotalDisplayRecords, 10);

			/* Determine if reordering is required */
			var sOrdering = _fnColumnOrdering(oSettings);
			var bReOrder = (json.sColumns !== undefined && sOrdering !== "" && json.sColumns != sOrdering );
			var aiIndex;
			if ( bReOrder )
			{
				aiIndex = _fnReOrderIndex( oSettings, json.sColumns );
			}

			var aData = _fnGetObjectDataFn( oSettings.sAjaxDataProp )( json );
			for ( var i=0, iLen=aData.length ; i<iLen ; i++ )
			{
				if ( bReOrder )
				{
					/* If we need to re-order, then create a new array with the correct order and add it */
					var aDataSorted = [];
					for ( var j=0, jLen=oSettings.aoColumns.length ; j<jLen ; j++ )
					{
						aDataSorted.push( aData[i][ aiIndex[j] ] );
					}
					_fnAddData( oSettings, aDataSorted );
				}
				else
				{
					/* No re-order required, sever got it "right" - just straight add */
					_fnAddData( oSettings, aData[i] );
				}
			}
			oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();

			oSettings.bAjaxDataGet = false;
			_fnDraw( oSettings );
			oSettings.bAjaxDataGet = true;
			_fnProcessingDisplay( oSettings, false );
		}



		/**
		 * Generate the node required for filtering text
		 *  @returns {node} Filter control element
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnFeatureHtmlFilter ( oSettings )
		{
			var oPreviousSearch = oSettings.oPreviousSearch;

			var sSearchStr = oSettings.oLanguage.sSearch;
			sSearchStr = (sSearchStr.indexOf('_INPUT_') !== -1) ?
					sSearchStr.replace('_INPUT_', '<input type="text" />') :
					sSearchStr==="" ? '<input type="text" />' : sSearchStr+' <input type="text" />';

			var nFilter = document.createElement( 'div' );
			nFilter.className = oSettings.oClasses.sFilter;
			nFilter.innerHTML = '<label>'+sSearchStr+'</label>';
			if ( !oSettings.aanFeatures.f )
			{
				nFilter.id = oSettings.sTableId+'_filter';
			}

			var jqFilter = $("input", nFilter);
			jqFilter.val( oPreviousSearch.sSearch.replace('"','&quot;') );
			jqFilter.bind( 'keyup.DT', function(e) {
				/* Update all other filter input elements for the new display */
				var n = oSettings.aanFeatures.f;
				for ( var i=0, iLen=n.length ; i<iLen ; i++ )
				{
					if ( n[i] != $(this).parents('div.dataTables_filter')[0] )
					{
						$('input', n[i]).val( this.value );
					}
				}

				/* Now do the filter */
				if ( this.value != oPreviousSearch.sSearch )
				{
					_fnFilterComplete( oSettings, {
						"sSearch": this.value,
						"bRegex": oPreviousSearch.bRegex,
						"bSmart": oPreviousSearch.bSmart ,
						"bCaseInsensitive": oPreviousSearch.bCaseInsensitive
					} );
				}
			} );

			jqFilter
					.attr('aria-controls', oSettings.sTableId)
					.bind( 'keypress.DT', function(e) {
						/* Prevent form submission */
						if ( e.keyCode == 13 )
						{
							return false;
						}
					}
			);

			return nFilter;
		}


		/**
		 * Filter the table using both the global filter and column based filtering
		 *  @param {object} oSettings dataTables settings object
		 *  @param {object} oSearch search information
		 *  @param {int} [iForce] force a research of the master array (1) or not (undefined or 0)
		 *  @memberof DataTable#oApi
		 */
		function _fnFilterComplete ( oSettings, oInput, iForce )
		{
			var oPrevSearch = oSettings.oPreviousSearch;
			var aoPrevSearch = oSettings.aoPreSearchCols;
			var fnSaveFilter = function ( oFilter ) {
				/* Save the filtering values */
				oPrevSearch.sSearch = oFilter.sSearch;
				oPrevSearch.bRegex = oFilter.bRegex;
				oPrevSearch.bSmart = oFilter.bSmart;
				oPrevSearch.bCaseInsensitive = oFilter.bCaseInsensitive;
			};

			/* In server-side processing all filtering is done by the server, so no point hanging around here */
			if ( !oSettings.oFeatures.bServerSide )
			{
				/* Global filter */
				_fnFilter( oSettings, oInput.sSearch, iForce, oInput.bRegex, oInput.bSmart, oInput.bCaseInsensitive );
				fnSaveFilter( oInput );

				/* Now do the individual column filter */
				for ( var i=0 ; i<oSettings.aoPreSearchCols.length ; i++ )
				{
					_fnFilterColumn( oSettings, aoPrevSearch[i].sSearch, i, aoPrevSearch[i].bRegex,
							aoPrevSearch[i].bSmart, aoPrevSearch[i].bCaseInsensitive );
				}

				/* Custom filtering */
				_fnFilterCustom( oSettings );
			}
			else
			{
				fnSaveFilter( oInput );
			}

			/* Tell the draw function we have been filtering */
			oSettings.bFiltered = true;
			$(oSettings.oInstance).trigger('filter', oSettings);

			/* Redraw the table */
			oSettings._iDisplayStart = 0;
			_fnCalculateEnd( oSettings );
			_fnDraw( oSettings );

			/* Rebuild search array 'offline' */
			_fnBuildSearchArray( oSettings, 0 );
		}


		/**
		 * Apply custom filtering functions
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnFilterCustom( oSettings )
		{
			var afnFilters = DataTable.ext.afnFiltering;
			for ( var i=0, iLen=afnFilters.length ; i<iLen ; i++ )
			{
				var iCorrector = 0;
				for ( var j=0, jLen=oSettings.aiDisplay.length ; j<jLen ; j++ )
				{
					var iDisIndex = oSettings.aiDisplay[j-iCorrector];

					/* Check if we should use this row based on the filtering function */
					if ( !afnFilters[i]( oSettings, _fnGetRowData( oSettings, iDisIndex, 'filter' ), iDisIndex ) )
					{
						oSettings.aiDisplay.splice( j-iCorrector, 1 );
						iCorrector++;
					}
				}
			}
		}


		/**
		 * Filter the table on a per-column basis
		 *  @param {object} oSettings dataTables settings object
		 *  @param {string} sInput string to filter on
		 *  @param {int} iColumn column to filter
		 *  @param {bool} bRegex treat search string as a regular expression or not
		 *  @param {bool} bSmart use smart filtering or not
		 *  @param {bool} bCaseInsensitive Do case insenstive matching or not
		 *  @memberof DataTable#oApi
		 */
		function _fnFilterColumn ( oSettings, sInput, iColumn, bRegex, bSmart, bCaseInsensitive )
		{
			if ( sInput === "" )
			{
				return;
			}

			var iIndexCorrector = 0;
			var rpSearch = _fnFilterCreateSearch( sInput, bRegex, bSmart, bCaseInsensitive );

			for ( var i=oSettings.aiDisplay.length-1 ; i>=0 ; i-- )
			{
				var sData = _fnDataToSearch( _fnGetCellData( oSettings, oSettings.aiDisplay[i], iColumn, 'filter' ),
						oSettings.aoColumns[iColumn].sType );
				if ( ! rpSearch.test( sData ) )
				{
					oSettings.aiDisplay.splice( i, 1 );
					iIndexCorrector++;
				}
			}
		}


		/**
		 * Filter the data table based on user input and draw the table
		 *  @param {object} oSettings dataTables settings object
		 *  @param {string} sInput string to filter on
		 *  @param {int} iForce optional - force a research of the master array (1) or not (undefined or 0)
		 *  @param {bool} bRegex treat as a regular expression or not
		 *  @param {bool} bSmart perform smart filtering or not
		 *  @param {bool} bCaseInsensitive Do case insenstive matching or not
		 *  @memberof DataTable#oApi
		 */
		function _fnFilter( oSettings, sInput, iForce, bRegex, bSmart, bCaseInsensitive )
		{
			var i;
			var rpSearch = _fnFilterCreateSearch( sInput, bRegex, bSmart, bCaseInsensitive );
			var oPrevSearch = oSettings.oPreviousSearch;

			/* Check if we are forcing or not - optional parameter */
			if ( !iForce )
			{
				iForce = 0;
			}

			/* Need to take account of custom filtering functions - always filter */
			if ( DataTable.ext.afnFiltering.length !== 0 )
			{
				iForce = 1;
			}

			/*
			 * If the input is blank - we want the full data set
			 */
			if ( sInput.length <= 0 )
			{
				oSettings.aiDisplay.splice( 0, oSettings.aiDisplay.length);
				oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
			}
			else
			{
				/*
				 * We are starting a new search or the new search string is smaller
				 * then the old one (i.e. delete). Search from the master array
				 */
				if ( oSettings.aiDisplay.length == oSettings.aiDisplayMaster.length ||
						oPrevSearch.sSearch.length > sInput.length || iForce == 1 ||
						sInput.indexOf(oPrevSearch.sSearch) !== 0 )
				{
					/* Nuke the old display array - we are going to rebuild it */
					oSettings.aiDisplay.splice( 0, oSettings.aiDisplay.length);

					/* Force a rebuild of the search array */
					_fnBuildSearchArray( oSettings, 1 );

					/* Search through all records to populate the search array
					 * The the oSettings.aiDisplayMaster and asDataSearch arrays have 1 to 1
					 * mapping
					 */
					for ( i=0 ; i<oSettings.aiDisplayMaster.length ; i++ )
					{
						if ( rpSearch.test(oSettings.asDataSearch[i]) )
						{
							oSettings.aiDisplay.push( oSettings.aiDisplayMaster[i] );
						}
					}
				}
				else
				{
					/* Using old search array - refine it - do it this way for speed
					 * Don't have to search the whole master array again
					 */
					var iIndexCorrector = 0;

					/* Search the current results */
					for ( i=0 ; i<oSettings.asDataSearch.length ; i++ )
					{
						if ( ! rpSearch.test(oSettings.asDataSearch[i]) )
						{
							oSettings.aiDisplay.splice( i-iIndexCorrector, 1 );
							iIndexCorrector++;
						}
					}
				}
			}
		}


		/**
		 * Create an array which can be quickly search through
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iMaster use the master data array - optional
		 *  @memberof DataTable#oApi
		 */
		function _fnBuildSearchArray ( oSettings, iMaster )
		{
			if ( !oSettings.oFeatures.bServerSide )
			{
				/* Clear out the old data */
				oSettings.asDataSearch.splice( 0, oSettings.asDataSearch.length );

				var aArray = (iMaster && iMaster===1) ?
						oSettings.aiDisplayMaster : oSettings.aiDisplay;

				for ( var i=0, iLen=aArray.length ; i<iLen ; i++ )
				{
					oSettings.asDataSearch[i] = _fnBuildSearchRow( oSettings,
							_fnGetRowData( oSettings, aArray[i], 'filter' ) );
				}
			}
		}


		/**
		 * Create a searchable string from a single data row
		 *  @param {object} oSettings dataTables settings object
		 *  @param {array} aData Row data array to use for the data to search
		 *  @memberof DataTable#oApi
		 */
		function _fnBuildSearchRow( oSettings, aData )
		{
			var sSearch = '';
			if ( oSettings.__nTmpFilter === undefined )
			{
				oSettings.__nTmpFilter = document.createElement('div');
			}
			var nTmp = oSettings.__nTmpFilter;

			for ( var j=0, jLen=oSettings.aoColumns.length ; j<jLen ; j++ )
			{
				if ( oSettings.aoColumns[j].bSearchable )
				{
					var sData = aData[j];
					sSearch += _fnDataToSearch( sData, oSettings.aoColumns[j].sType )+'  ';
				}
			}

			/* If it looks like there is an HTML entity in the string, attempt to decode it */
			if ( sSearch.indexOf('&') !== -1 )
			{
				nTmp.innerHTML = sSearch;
				sSearch = nTmp.textContent ? nTmp.textContent : nTmp.innerText;

				/* IE and Opera appear to put an newline where there is a <br> tag - remove it */
				sSearch = sSearch.replace(/\n/g," ").replace(/\r/g,"");
			}

			return sSearch;
		}

		/**
		 * Build a regular expression object suitable for searching a table
		 *  @param {string} sSearch string to search for
		 *  @param {bool} bRegex treat as a regular expression or not
		 *  @param {bool} bSmart perform smart filtering or not
		 *  @param {bool} bCaseInsensitive Do case insenstive matching or not
		 *  @returns {RegExp} constructed object
		 *  @memberof DataTable#oApi
		 */
		function _fnFilterCreateSearch( sSearch, bRegex, bSmart, bCaseInsensitive )
		{
			var asSearch, sRegExpString;

			if ( bSmart )
			{
				/* Generate the regular expression to use. Something along the lines of:
				 * ^(?=.*?\bone\b)(?=.*?\btwo\b)(?=.*?\bthree\b).*$
				 */
				asSearch = bRegex ? sSearch.split( ' ' ) : _fnEscapeRegex( sSearch ).split( ' ' );
				sRegExpString = '^(?=.*?'+asSearch.join( ')(?=.*?' )+').*$';
				return new RegExp( sRegExpString, bCaseInsensitive ? "i" : "" );
			}
			else
			{
				sSearch = bRegex ? sSearch : _fnEscapeRegex( sSearch );
				return new RegExp( sSearch, bCaseInsensitive ? "i" : "" );
			}
		}


		/**
		 * Convert raw data into something that the user can search on
		 *  @param {string} sData data to be modified
		 *  @param {string} sType data type
		 *  @returns {string} search string
		 *  @memberof DataTable#oApi
		 */
		function _fnDataToSearch ( sData, sType )
		{
			if ( typeof DataTable.ext.ofnSearch[sType] === "function" )
			{
				return DataTable.ext.ofnSearch[sType]( sData );
			}
			else if ( sType == "html" )
			{
				return sData.replace(/[\r\n]/g," ").replace( /<.*?>/g, "" );
			}
			else if ( typeof sData === "string" )
			{
				return sData.replace(/[\r\n]/g," ");
			}
			else if ( sData === null )
			{
				return '';
			}
			return sData;
		}


		/**
		 * scape a string stuch that it can be used in a regular expression
		 *  @param {string} sVal string to escape
		 *  @returns {string} escaped string
		 *  @memberof DataTable#oApi
		 */
		function _fnEscapeRegex ( sVal )
		{
			var acEscape = [ '/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\', '$', '^' ];
			var reReplace = new RegExp( '(\\' + acEscape.join('|\\') + ')', 'g' );
			return sVal.replace(reReplace, '\\$1');
		}



		/**
		 * Generate the node required for the info display
		 *  @param {object} oSettings dataTables settings object
		 *  @returns {node} Information element
		 *  @memberof DataTable#oApi
		 */
		function _fnFeatureHtmlInfo ( oSettings )
		{
			var nInfo = document.createElement( 'div' );
			nInfo.className = oSettings.oClasses.sInfo;

			/* Actions that are to be taken once only for this feature */
			if ( !oSettings.aanFeatures.i )
			{
				/* Add draw callback */
				oSettings.aoDrawCallback.push( {
					"fn": _fnUpdateInfo,
					"sName": "information"
				} );

				/* Add id */
				nInfo.id = oSettings.sTableId+'_info';
			}
			oSettings.nTable.setAttribute( 'aria-describedby', oSettings.sTableId+'_info' );

			return nInfo;
		}


		/**
		 * Update the information elements in the display
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnUpdateInfo ( oSettings )
		{
			/* Show information about the table */
			if ( !oSettings.oFeatures.bInfo || oSettings.aanFeatures.i.length === 0 )
			{
				return;
			}

			var
					iStart = oSettings._iDisplayStart+1, iEnd = oSettings.fnDisplayEnd(),
					iMax = oSettings.fnRecordsTotal(), iTotal = oSettings.fnRecordsDisplay(),
					sStart = oSettings.fnFormatNumber( iStart ), sEnd = oSettings.fnFormatNumber( iEnd ),
					sMax = oSettings.fnFormatNumber( iMax ), sTotal = oSettings.fnFormatNumber( iTotal ),
					sOut;

			/* When infinite scrolling, we are always starting at 1. _iDisplayStart is used only
			 * internally
			 */
			if ( oSettings.oScroll.bInfinite )
			{
				sStart = oSettings.fnFormatNumber( 1 );
			}

			if ( oSettings.fnRecordsDisplay() === 0 &&
					oSettings.fnRecordsDisplay() == oSettings.fnRecordsTotal() )
			{
				/* Empty record set */
				sOut = oSettings.oLanguage.sInfoEmpty+ oSettings.oLanguage.sInfoPostFix;
			}
			else if ( oSettings.fnRecordsDisplay() === 0 )
			{
				/* Rmpty record set after filtering */
				sOut = oSettings.oLanguage.sInfoEmpty +' '+
						oSettings.oLanguage.sInfoFiltered.replace('_MAX_', sMax)+
						oSettings.oLanguage.sInfoPostFix;
			}
			else if ( oSettings.fnRecordsDisplay() == oSettings.fnRecordsTotal() )
			{
				/* Normal record set */
				sOut = oSettings.oLanguage.sInfo.
						replace('_START_', sStart).
						replace('_END_',   sEnd).
						replace('_TOTAL_', sTotal)+
						oSettings.oLanguage.sInfoPostFix;
			}
			else
			{
				/* Record set after filtering */
				sOut = oSettings.oLanguage.sInfo.
						replace('_START_', sStart).
						replace('_END_',   sEnd).
						replace('_TOTAL_', sTotal) +' '+
						oSettings.oLanguage.sInfoFiltered.replace('_MAX_',
								oSettings.fnFormatNumber(oSettings.fnRecordsTotal()))+
						oSettings.oLanguage.sInfoPostFix;
			}

			if ( oSettings.oLanguage.fnInfoCallback !== null )
			{
				sOut = oSettings.oLanguage.fnInfoCallback.call( oSettings.oInstance,
						oSettings, iStart, iEnd, iMax, iTotal, sOut );
			}

			var n = oSettings.aanFeatures.i;
			for ( var i=0, iLen=n.length ; i<iLen ; i++ )
			{
				$(n[i]).html( sOut );
			}
		}



		/**
		 * Draw the table for the first time, adding all required features
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnInitialise ( oSettings )
		{
			var i, iLen, iAjaxStart=oSettings.iInitDisplayStart;

			/* Ensure that the table data is fully initialised */
			if ( oSettings.bInitialised === false )
			{
				setTimeout( function(){ _fnInitialise( oSettings ); }, 200 );
				return;
			}

			/* Show the display HTML options */
			_fnAddOptionsHtml( oSettings );

			/* Build and draw the header / footer for the table */
			_fnBuildHead( oSettings );
			_fnDrawHead( oSettings, oSettings.aoHeader );
			if ( oSettings.nTFoot )
			{
				_fnDrawHead( oSettings, oSettings.aoFooter );
			}

			/* Okay to show that something is going on now */
			_fnProcessingDisplay( oSettings, true );

			/* Calculate sizes for columns */
			if ( oSettings.oFeatures.bAutoWidth )
			{
				_fnCalculateColumnWidths( oSettings );
			}

			for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				if ( oSettings.aoColumns[i].sWidth !== null )
				{
					oSettings.aoColumns[i].nTh.style.width = _fnStringToCss( oSettings.aoColumns[i].sWidth );
				}
			}

			/* If there is default sorting required - let's do it. The sort function will do the
			 * drawing for us. Otherwise we draw the table regardless of the Ajax source - this allows
			 * the table to look initialised for Ajax sourcing data (show 'loading' message possibly)
			 */
			if ( oSettings.oFeatures.bSort )
			{
				_fnSort( oSettings );
			}
			else if ( oSettings.oFeatures.bFilter )
			{
				_fnFilterComplete( oSettings, oSettings.oPreviousSearch );
			}
			else
			{
				oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
				_fnCalculateEnd( oSettings );
				_fnDraw( oSettings );
			}

			/* if there is an ajax source load the data */
			if ( oSettings.sAjaxSource !== null && !oSettings.oFeatures.bServerSide )
			{
				var aoData = [];
				_fnServerParams( oSettings, aoData );
				oSettings.fnServerData.call( oSettings.oInstance, oSettings.sAjaxSource, aoData, function(json) {
					var aData = (oSettings.sAjaxDataProp !== "") ?
							_fnGetObjectDataFn( oSettings.sAjaxDataProp )(json) : json;

					/* Got the data - add it to the table */
					for ( i=0 ; i<aData.length ; i++ )
					{
						_fnAddData( oSettings, aData[i] );
					}

					/* Reset the init display for cookie saving. We've already done a filter, and
					 * therefore cleared it before. So we need to make it appear 'fresh'
					 */
					oSettings.iInitDisplayStart = iAjaxStart;

					if ( oSettings.oFeatures.bSort )
					{
						_fnSort( oSettings );
					}
					else
					{
						oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
						_fnCalculateEnd( oSettings );
						_fnDraw( oSettings );
					}

					_fnProcessingDisplay( oSettings, false );
					_fnInitComplete( oSettings, json );
				}, oSettings );
				return;
			}

			/* Server-side processing initialisation complete is done at the end of _fnDraw */
			if ( !oSettings.oFeatures.bServerSide )
			{
				_fnProcessingDisplay( oSettings, false );
				_fnInitComplete( oSettings );
			}
		}


		/**
		 * Draw the table for the first time, adding all required features
		 *  @param {object} oSettings dataTables settings object
		 *  @param {object} [json] JSON from the server that completed the table, if using Ajax source
		 *    with client-side processing (optional)
		 *  @memberof DataTable#oApi
		 */
		function _fnInitComplete ( oSettings, json )
		{
			oSettings._bInitComplete = true;
			_fnCallbackFire( oSettings, 'aoInitComplete', 'init', [oSettings, json] );
		}


		/**
		 * Language compatibility - when certain options are given, and others aren't, we
		 * need to duplicate the values over, in order to provide backwards compatibility
		 * with older language files.
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnLanguageCompat( oLanguage )
		{
			/* Backwards compatibility - if there is no sEmptyTable given, then use the same as
			 * sZeroRecords - assuming that is given.
			 */
			if ( !oLanguage.sEmptyTable && oLanguage.sZeroRecords )
			{
				_fnMap( oLanguage, oLanguage, 'sZeroRecords', 'sEmptyTable' );
			}

			/* Likewise with loading records */
			if ( !oLanguage.sLoadingRecords && oLanguage.sZeroRecords )
			{
				_fnMap( oLanguage, oLanguage, 'sZeroRecords', 'sLoadingRecords' );
			}
		}



		/**
		 * Generate the node required for user display length changing
		 *  @param {object} oSettings dataTables settings object
		 *  @returns {node} Display length feature node
		 *  @memberof DataTable#oApi
		 */
		function _fnFeatureHtmlLength ( oSettings )
		{
			if ( oSettings.oScroll.bInfinite )
			{
				return null;
			}

			/* This can be overruled by not using the _MENU_ var/macro in the language variable */
			var sName = 'name="'+oSettings.sTableId+'_length"';
			var sStdMenu = '<select size="1" '+sName+'>';
			var i, iLen;
			var aLengthMenu = oSettings.aLengthMenu;

			if ( aLengthMenu.length == 2 && typeof aLengthMenu[0] === 'object' &&
					typeof aLengthMenu[1] === 'object' )
			{
				for ( i=0, iLen=aLengthMenu[0].length ; i<iLen ; i++ )
				{
					sStdMenu += '<option value="'+aLengthMenu[0][i]+'">'+aLengthMenu[1][i]+'</option>';
				}
			}
			else
			{
				for ( i=0, iLen=aLengthMenu.length ; i<iLen ; i++ )
				{
					sStdMenu += '<option value="'+aLengthMenu[i]+'">'+aLengthMenu[i]+'</option>';
				}
			}
			sStdMenu += '</select>';

			var nLength = document.createElement( 'div' );
			if ( !oSettings.aanFeatures.l )
			{
				nLength.id = oSettings.sTableId+'_length';
			}
			nLength.className = oSettings.oClasses.sLength;
			nLength.innerHTML = '<label>'+oSettings.oLanguage.sLengthMenu.replace( '_MENU_', sStdMenu )+'</label>';

			/*
			 * Set the length to the current display length - thanks to Andrea Pavlovic for this fix,
			 * and Stefan Skopnik for fixing the fix!
			 */
			$('select option[value="'+oSettings._iDisplayLength+'"]', nLength).attr("selected", true);

			$('select', nLength).bind( 'change.DT', function(e) {
				var iVal = $(this).val();

				/* Update all other length options for the new display */
				var n = oSettings.aanFeatures.l;
				for ( i=0, iLen=n.length ; i<iLen ; i++ )
				{
					if ( n[i] != this.parentNode )
					{
						$('select', n[i]).val( iVal );
					}
				}

				/* Redraw the table */
				oSettings._iDisplayLength = parseInt(iVal, 10);
				_fnCalculateEnd( oSettings );

				/* If we have space to show extra rows (backing up from the end point - then do so */
				if ( oSettings.fnDisplayEnd() == oSettings.fnRecordsDisplay() )
				{
					oSettings._iDisplayStart = oSettings.fnDisplayEnd() - oSettings._iDisplayLength;
					if ( oSettings._iDisplayStart < 0 )
					{
						oSettings._iDisplayStart = 0;
					}
				}

				if ( oSettings._iDisplayLength == -1 )
				{
					oSettings._iDisplayStart = 0;
				}

				_fnDraw( oSettings );
			} );


			$('select', nLength).attr('aria-controls', oSettings.sTableId);

			return nLength;
		}


		/**
		 * Rcalculate the end point based on the start point
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnCalculateEnd( oSettings )
		{
			if ( oSettings.oFeatures.bPaginate === false )
			{
				oSettings._iDisplayEnd = oSettings.aiDisplay.length;
			}
			else
			{
				/* Set the end point of the display - based on how many elements there are
				 * still to display
				 */
				if ( oSettings._iDisplayStart + oSettings._iDisplayLength > oSettings.aiDisplay.length ||
						oSettings._iDisplayLength == -1 )
				{
					oSettings._iDisplayEnd = oSettings.aiDisplay.length;
				}
				else
				{
					oSettings._iDisplayEnd = oSettings._iDisplayStart + oSettings._iDisplayLength;
				}
			}
		}



		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Note that most of the paging logic is done in
		 * DataTable.ext.oPagination
		 */

		/**
		 * Generate the node required for default pagination
		 *  @param {object} oSettings dataTables settings object
		 *  @returns {node} Pagination feature node
		 *  @memberof DataTable#oApi
		 */
		function _fnFeatureHtmlPaginate ( oSettings )
		{
			if ( oSettings.oScroll.bInfinite )
			{
				return null;
			}

			var nPaginate = document.createElement( 'div' );
			nPaginate.className = oSettings.oClasses.sPaging+oSettings.sPaginationType;

			DataTable.ext.oPagination[ oSettings.sPaginationType ].fnInit( oSettings, nPaginate,
					function( oSettings ) {
						_fnCalculateEnd( oSettings );
						_fnDraw( oSettings );
					}
			);

			/* Add a draw callback for the pagination on first instance, to update the paging display */
			if ( !oSettings.aanFeatures.p )
			{
				oSettings.aoDrawCallback.push( {
					"fn": function( oSettings ) {
						DataTable.ext.oPagination[ oSettings.sPaginationType ].fnUpdate( oSettings, function( oSettings ) {
							_fnCalculateEnd( oSettings );
							_fnDraw( oSettings );
						} );
					},
					"sName": "pagination"
				} );
			}
			return nPaginate;
		}


		/**
		 * Alter the display settings to change the page
		 *  @param {object} oSettings dataTables settings object
		 *  @param {string|int} mAction Paging action to take: "first", "previous", "next" or "last"
		 *    or page number to jump to (integer)
		 *  @returns {bool} true page has changed, false - no change (no effect) eg 'first' on page 1
		 *  @memberof DataTable#oApi
		 */
		function _fnPageChange ( oSettings, mAction )
		{
			var iOldStart = oSettings._iDisplayStart;

			if ( typeof mAction === "number" )
			{
				oSettings._iDisplayStart = mAction * oSettings._iDisplayLength;
				if ( oSettings._iDisplayStart > oSettings.fnRecordsDisplay() )
				{
					oSettings._iDisplayStart = 0;
				}
			}
			else if ( mAction == "first" )
			{
				oSettings._iDisplayStart = 0;
			}
			else if ( mAction == "previous" )
			{
				oSettings._iDisplayStart = oSettings._iDisplayLength>=0 ?
						oSettings._iDisplayStart - oSettings._iDisplayLength :
						0;

				/* Correct for underrun */
				if ( oSettings._iDisplayStart < 0 )
				{
					oSettings._iDisplayStart = 0;
				}
			}
			else if ( mAction == "next" )
			{
				if ( oSettings._iDisplayLength >= 0 )
				{
					/* Make sure we are not over running the display array */
					if ( oSettings._iDisplayStart + oSettings._iDisplayLength < oSettings.fnRecordsDisplay() )
					{
						oSettings._iDisplayStart += oSettings._iDisplayLength;
					}
				}
				else
				{
					oSettings._iDisplayStart = 0;
				}
			}
			else if ( mAction == "last" )
			{
				if ( oSettings._iDisplayLength >= 0 )
				{
					var iPages = parseInt( (oSettings.fnRecordsDisplay()-1) / oSettings._iDisplayLength, 10 ) + 1;
					oSettings._iDisplayStart = (iPages-1) * oSettings._iDisplayLength;
				}
				else
				{
					oSettings._iDisplayStart = 0;
				}
			}
			else
			{
				_fnLog( oSettings, 0, "Unknown paging action: "+mAction );
			}
			$(oSettings.oInstance).trigger('page', oSettings);

			return iOldStart != oSettings._iDisplayStart;
		}



		/**
		 * Generate the node required for the processing node
		 *  @param {object} oSettings dataTables settings object
		 *  @returns {node} Processing element
		 *  @memberof DataTable#oApi
		 */
		function _fnFeatureHtmlProcessing ( oSettings )
		{
			var nProcessing = document.createElement( 'div' );

			if ( !oSettings.aanFeatures.r )
			{
				nProcessing.id = oSettings.sTableId+'_processing';
			}
			nProcessing.innerHTML = oSettings.oLanguage.sProcessing;
			nProcessing.className = oSettings.oClasses.sProcessing;
			oSettings.nTable.parentNode.insertBefore( nProcessing, oSettings.nTable );

			return nProcessing;
		}


		/**
		 * Display or hide the processing indicator
		 *  @param {object} oSettings dataTables settings object
		 *  @param {bool} bShow Show the processing indicator (true) or not (false)
		 *  @memberof DataTable#oApi
		 */
		function _fnProcessingDisplay ( oSettings, bShow )
		{
			if ( oSettings.oFeatures.bProcessing )
			{
				var an = oSettings.aanFeatures.r;
				for ( var i=0, iLen=an.length ; i<iLen ; i++ )
				{
					an[i].style.visibility = bShow ? "visible" : "hidden";
				}
			}

			$(oSettings.oInstance).trigger('processing', [oSettings, bShow]);
		}



		/**
		 * Add any control elements for the table - specifically scrolling
		 *  @param {object} oSettings dataTables settings object
		 *  @returns {node} Node to add to the DOM
		 *  @memberof DataTable#oApi
		 */
		function _fnFeatureHtmlTable ( oSettings )
		{
			/* Check if scrolling is enabled or not - if not then leave the DOM unaltered */
			if ( oSettings.oScroll.sX === "" && oSettings.oScroll.sY === "" )
			{
				return oSettings.nTable;
			}

			/*
			 * The HTML structure that we want to generate in this function is:
			 *  div - nScroller
			 *    div - nScrollHead
			 *      div - nScrollHeadInner
			 *        table - nScrollHeadTable
			 *          thead - nThead
			 *    div - nScrollBody
			 *      table - oSettings.nTable
			 *        thead - nTheadSize
			 *        tbody - nTbody
			 *    div - nScrollFoot
			 *      div - nScrollFootInner
			 *        table - nScrollFootTable
			 *          tfoot - nTfoot
			 */
			var
					nScroller = document.createElement('div'),
					nScrollHead = document.createElement('div'),
					nScrollHeadInner = document.createElement('div'),
					nScrollBody = document.createElement('div'),
					nScrollFoot = document.createElement('div'),
					nScrollFootInner = document.createElement('div'),
					nScrollHeadTable = oSettings.nTable.cloneNode(false),
					nScrollFootTable = oSettings.nTable.cloneNode(false),
					nThead = oSettings.nTable.getElementsByTagName('thead')[0],
					nTfoot = oSettings.nTable.getElementsByTagName('tfoot').length === 0 ? null :
							oSettings.nTable.getElementsByTagName('tfoot')[0],
					oClasses = oSettings.oClasses;

			nScrollHead.appendChild( nScrollHeadInner );
			nScrollFoot.appendChild( nScrollFootInner );
			nScrollBody.appendChild( oSettings.nTable );
			nScroller.appendChild( nScrollHead );
			nScroller.appendChild( nScrollBody );
			nScrollHeadInner.appendChild( nScrollHeadTable );
			nScrollHeadTable.appendChild( nThead );
			if ( nTfoot !== null )
			{
				nScroller.appendChild( nScrollFoot );
				nScrollFootInner.appendChild( nScrollFootTable );
				nScrollFootTable.appendChild( nTfoot );
			}

			nScroller.className = oClasses.sScrollWrapper;
			nScrollHead.className = oClasses.sScrollHead;
			nScrollHeadInner.className = oClasses.sScrollHeadInner;
			nScrollBody.className = oClasses.sScrollBody;
			nScrollFoot.className = oClasses.sScrollFoot;
			nScrollFootInner.className = oClasses.sScrollFootInner;

			if ( oSettings.oScroll.bAutoCss )
			{
				nScrollHead.style.overflow = "hidden";
				nScrollHead.style.position = "relative";
				nScrollFoot.style.overflow = "hidden";
				nScrollBody.style.overflow = "auto";
			}

			nScrollHead.style.border = "0";
			nScrollHead.style.width = "100%";
			nScrollFoot.style.border = "0";
			nScrollHeadInner.style.width = "150%"; /* will be overwritten */

			/* Modify attributes to respect the clones */
			nScrollHeadTable.removeAttribute('id');
			nScrollHeadTable.style.marginLeft = "0";
			oSettings.nTable.style.marginLeft = "0";
			if ( nTfoot !== null )
			{
				nScrollFootTable.removeAttribute('id');
				nScrollFootTable.style.marginLeft = "0";
			}

			/* Move any caption elements from the body to the header */
			var nCaptions = $(oSettings.nTable).children('caption');
			for ( var i=0, iLen=nCaptions.length ; i<iLen ; i++ )
			{
				nScrollHeadTable.appendChild( nCaptions[i] );
			}

			/*
			 * Sizing
			 */
			/* When xscrolling add the width and a scroller to move the header with the body */
			if ( oSettings.oScroll.sX !== "" )
			{
				nScrollHead.style.width = _fnStringToCss( oSettings.oScroll.sX );
				nScrollBody.style.width = _fnStringToCss( oSettings.oScroll.sX );

				if ( nTfoot !== null )
				{
					nScrollFoot.style.width = _fnStringToCss( oSettings.oScroll.sX );
				}

				/* When the body is scrolled, then we also want to scroll the headers */
				$(nScrollBody).scroll( function (e) {
					nScrollHead.scrollLeft = this.scrollLeft;

					if ( nTfoot !== null )
					{
						nScrollFoot.scrollLeft = this.scrollLeft;
					}
				} );
			}

			/* When yscrolling, add the height */
			if ( oSettings.oScroll.sY !== "" )
			{
				nScrollBody.style.height = _fnStringToCss( oSettings.oScroll.sY );
			}

			/* Redraw - align columns across the tables */
			oSettings.aoDrawCallback.push( {
				"fn": _fnScrollDraw,
				"sName": "scrolling"
			} );

			/* Infinite scrolling event handlers */
			if ( oSettings.oScroll.bInfinite )
			{
				$(nScrollBody).scroll( function() {
					/* Use a blocker to stop scrolling from loading more data while other data is still loading */
					if ( !oSettings.bDrawing && $(this).scrollTop() !== 0 )
					{
						/* Check if we should load the next data set */
						if ( $(this).scrollTop() + $(this).height() >
								$(oSettings.nTable).height() - oSettings.oScroll.iLoadGap )
						{
							/* Only do the redraw if we have to - we might be at the end of the data */
							if ( oSettings.fnDisplayEnd() < oSettings.fnRecordsDisplay() )
							{
								_fnPageChange( oSettings, 'next' );
								_fnCalculateEnd( oSettings );
								_fnDraw( oSettings );
							}
						}
					}
				} );
			}

			oSettings.nScrollHead = nScrollHead;
			oSettings.nScrollFoot = nScrollFoot;

			return nScroller;
		}


		/**
		 * Update the various tables for resizing. It's a bit of a pig this function, but
		 * basically the idea to:
		 *   1. Re-create the table inside the scrolling div
		 *   2. Take live measurements from the DOM
		 *   3. Apply the measurements
		 *   4. Clean up
		 *  @param {object} o dataTables settings object
		 *  @returns {node} Node to add to the DOM
		 *  @memberof DataTable#oApi
		 */
		function _fnScrollDraw ( o )
		{
			var
					nScrollHeadInner = o.nScrollHead.getElementsByTagName('div')[0],
					nScrollHeadTable = nScrollHeadInner.getElementsByTagName('table')[0],
					nScrollBody = o.nTable.parentNode,
					i, iLen, j, jLen, anHeadToSize, anHeadSizers, anFootSizers, anFootToSize, oStyle, iVis,
					iWidth, aApplied=[], iSanityWidth,
					nScrollFootInner = (o.nTFoot !== null) ? o.nScrollFoot.getElementsByTagName('div')[0] : null,
					nScrollFootTable = (o.nTFoot !== null) ? nScrollFootInner.getElementsByTagName('table')[0] : null,
					ie67 = $.browser.msie && $.browser.version <= 7;

			/*
			 * 1. Re-create the table inside the scrolling div
			 */

			/* Remove the old minimised thead and tfoot elements in the inner table */
			var nTheadSize = o.nTable.getElementsByTagName('thead');
			if ( nTheadSize.length > 0 )
			{
				o.nTable.removeChild( nTheadSize[0] );
			}

			var nTfootSize;
			if ( o.nTFoot !== null )
			{
				/* Remove the old minimised footer element in the cloned header */
				nTfootSize = o.nTable.getElementsByTagName('tfoot');
				if ( nTfootSize.length > 0 )
				{
					o.nTable.removeChild( nTfootSize[0] );
				}
			}

			/* Clone the current header and footer elements and then place it into the inner table */
			nTheadSize = o.nTHead.cloneNode(true);
			o.nTable.insertBefore( nTheadSize, o.nTable.childNodes[0] );

			if ( o.nTFoot !== null )
			{
				nTfootSize = o.nTFoot.cloneNode(true);
				o.nTable.insertBefore( nTfootSize, o.nTable.childNodes[1] );
			}

			/*
			 * 2. Take live measurements from the DOM - do not alter the DOM itself!
			 */

			/* Remove old sizing and apply the calculated column widths
			 * Get the unique column headers in the newly created (cloned) header. We want to apply the
			 * calclated sizes to this header
			 */
			if ( o.oScroll.sX === "" )
			{
				nScrollBody.style.width = '100%';
				nScrollHeadInner.parentNode.style.width = '100%';
			}

			var nThs = _fnGetUniqueThs( o, nTheadSize );
			for ( i=0, iLen=nThs.length ; i<iLen ; i++ )
			{
				iVis = _fnVisibleToColumnIndex( o, i );
				nThs[i].style.width = o.aoColumns[iVis].sWidth;
			}

			if ( o.nTFoot !== null )
			{
				_fnApplyToChildren( function(n) {
					n.style.width = "";
				}, nTfootSize.getElementsByTagName('tr') );
			}

			/* Size the table as a whole */
			iSanityWidth = $(o.nTable).outerWidth();
			if ( o.oScroll.sX === "" )
			{
				/* No x scrolling */
				o.nTable.style.width = "100%";

				/* I know this is rubbish - but IE7 will make the width of the table when 100% include
				 * the scrollbar - which is shouldn't. When there is a scrollbar we need to take this
				 * into account.
				 */
				if ( ie67 && ($('tbody', nScrollBody).height() > nScrollBody.offsetHeight ||
						$(nScrollBody).css('overflow-y') == "scroll")  )
				{
					o.nTable.style.width = _fnStringToCss( $(o.nTable).outerWidth()-o.oScroll.iBarWidth );
				}
			}
			else
			{
				if ( o.oScroll.sXInner !== "" )
				{
					/* x scroll inner has been given - use it */
					o.nTable.style.width = _fnStringToCss(o.oScroll.sXInner);
				}
				else if ( iSanityWidth == $(nScrollBody).width() &&
						$(nScrollBody).height() < $(o.nTable).height() )
				{
					/* There is y-scrolling - try to take account of the y scroll bar */
					o.nTable.style.width = _fnStringToCss( iSanityWidth-o.oScroll.iBarWidth );
					if ( $(o.nTable).outerWidth() > iSanityWidth-o.oScroll.iBarWidth )
					{
						/* Not possible to take account of it */
						o.nTable.style.width = _fnStringToCss( iSanityWidth );
					}
				}
				else
				{
					/* All else fails */
					o.nTable.style.width = _fnStringToCss( iSanityWidth );
				}
			}

			/* Recalculate the sanity width - now that we've applied the required width, before it was
			 * a temporary variable. This is required because the column width calculation is done
			 * before this table DOM is created.
			 */
			iSanityWidth = $(o.nTable).outerWidth();

			/* We want the hidden header to have zero height, so remove padding and borders. Then
			 * set the width based on the real headers
			 */
			anHeadToSize = o.nTHead.getElementsByTagName('tr');
			anHeadSizers = nTheadSize.getElementsByTagName('tr');

			_fnApplyToChildren( function(nSizer, nToSize) {
				oStyle = nSizer.style;
				oStyle.paddingTop = "0";
				oStyle.paddingBottom = "0";
				oStyle.borderTopWidth = "0";
				oStyle.borderBottomWidth = "0";
				oStyle.height = 0;

				iWidth = $(nSizer).width();
				nToSize.style.width = _fnStringToCss( iWidth );
				aApplied.push( iWidth );
			}, anHeadSizers, anHeadToSize );
			$(anHeadSizers).height(0);

			if ( o.nTFoot !== null )
			{
				/* Clone the current footer and then place it into the body table as a "hidden header" */
				anFootSizers = nTfootSize.getElementsByTagName('tr');
				anFootToSize = o.nTFoot.getElementsByTagName('tr');

				_fnApplyToChildren( function(nSizer, nToSize) {
					oStyle = nSizer.style;
					oStyle.paddingTop = "0";
					oStyle.paddingBottom = "0";
					oStyle.borderTopWidth = "0";
					oStyle.borderBottomWidth = "0";
					oStyle.height = 0;

					iWidth = $(nSizer).width();
					nToSize.style.width = _fnStringToCss( iWidth );
					aApplied.push( iWidth );
				}, anFootSizers, anFootToSize );
				$(anFootSizers).height(0);
			}

			/*
			 * 3. Apply the measurements
			 */

			/* "Hide" the header and footer that we used for the sizing. We want to also fix their width
			 * to what they currently are
			 */
			_fnApplyToChildren( function(nSizer) {
				nSizer.innerHTML = "";
				nSizer.style.width = _fnStringToCss( aApplied.shift() );
			}, anHeadSizers );

			if ( o.nTFoot !== null )
			{
				_fnApplyToChildren( function(nSizer) {
					nSizer.innerHTML = "";
					nSizer.style.width = _fnStringToCss( aApplied.shift() );
				}, anFootSizers );
			}

			/* Sanity check that the table is of a sensible width. If not then we are going to get
			 * misalignment - try to prevent this by not allowing the table to shrink below its min width
			 */
			if ( $(o.nTable).outerWidth() < iSanityWidth )
			{
				/* The min width depends upon if we have a vertical scrollbar visible or not */
				var iCorrection = ((nScrollBody.scrollHeight > nScrollBody.offsetHeight ||
						$(nScrollBody).css('overflow-y') == "scroll")) ?
						iSanityWidth+o.oScroll.iBarWidth : iSanityWidth;

				/* IE6/7 are a law unto themselves... */
				if ( ie67 && (nScrollBody.scrollHeight >
						nScrollBody.offsetHeight || $(nScrollBody).css('overflow-y') == "scroll")  )
				{
					o.nTable.style.width = _fnStringToCss( iCorrection-o.oScroll.iBarWidth );
				}

				/* Apply the calculated minimum width to the table wrappers */
				nScrollBody.style.width = _fnStringToCss( iCorrection );
				nScrollHeadInner.parentNode.style.width = _fnStringToCss( iCorrection );

				if ( o.nTFoot !== null )
				{
					nScrollFootInner.parentNode.style.width = _fnStringToCss( iCorrection );
				}

				/* And give the user a warning that we've stopped the table getting too small */
				if ( o.oScroll.sX === "" )
				{
					_fnLog( o, 1, "The table cannot fit into the current element which will cause column"+
							" misalignment. The table has been drawn at its minimum possible width." );
				}
				else if ( o.oScroll.sXInner !== "" )
				{
					_fnLog( o, 1, "The table cannot fit into the current element which will cause column"+
							" misalignment. Increase the sScrollXInner value or remove it to allow automatic"+
							" calculation" );
				}
			}
			else
			{
				nScrollBody.style.width = _fnStringToCss( '100%' );
				nScrollHeadInner.parentNode.style.width = _fnStringToCss( '100%' );

				if ( o.nTFoot !== null )
				{
					nScrollFootInner.parentNode.style.width = _fnStringToCss( '100%' );
				}
			}


			/*
			 * 4. Clean up
			 */
			if ( o.oScroll.sY === "" )
			{
				/* IE7< puts a vertical scrollbar in place (when it shouldn't be) due to subtracting
				 * the scrollbar height from the visible display, rather than adding it on. We need to
				 * set the height in order to sort this. Don't want to do it in any other browsers.
				 */
				if ( ie67 )
				{
					nScrollBody.style.height = _fnStringToCss( o.nTable.offsetHeight+o.oScroll.iBarWidth );
				}
			}

			if ( o.oScroll.sY !== "" && o.oScroll.bCollapse )
			{
				nScrollBody.style.height = _fnStringToCss( o.oScroll.sY );

				var iExtra = (o.oScroll.sX !== "" && o.nTable.offsetWidth > nScrollBody.offsetWidth) ?
						o.oScroll.iBarWidth : 0;
				if ( o.nTable.offsetHeight < nScrollBody.offsetHeight )
				{
					nScrollBody.style.height = _fnStringToCss( $(o.nTable).height()+iExtra );
				}
			}

			/* Finally set the width's of the header and footer tables */
			var iOuterWidth = $(o.nTable).outerWidth();
			nScrollHeadTable.style.width = _fnStringToCss( iOuterWidth );
			nScrollHeadInner.style.width = _fnStringToCss( iOuterWidth );

			if ( o.nTFoot !== null )
			{
				nScrollFootInner.style.width = _fnStringToCss( o.nTable.offsetWidth );
				nScrollFootTable.style.width = _fnStringToCss( o.nTable.offsetWidth );
			}

			/* If sorting or filtering has occurred, jump the scrolling back to the top */
			if ( o.bSorted || o.bFiltered )
			{
				nScrollBody.scrollTop = 0;
			}
		}


		/**
		 * Apply a given function to the display child nodes of an element array (typically
		 * TD children of TR rows
		 *  @param {function} fn Method to apply to the objects
		 *  @param array {nodes} an1 List of elements to look through for display children
		 *  @param array {nodes} an2 Another list (identical structure to the first) - optional
		 *  @memberof DataTable#oApi
		 */
		function _fnApplyToChildren( fn, an1, an2 )
		{
			for ( var i=0, iLen=an1.length ; i<iLen ; i++ )
			{
				for ( var j=0, jLen=an1[i].childNodes.length ; j<jLen ; j++ )
				{
					if ( an1[i].childNodes[j].nodeType == 1 )
					{
						if ( an2 )
						{
							fn( an1[i].childNodes[j], an2[i].childNodes[j] );
						}
						else
						{
							fn( an1[i].childNodes[j] );
						}
					}
				}
			}
		}



		/**
		 * Convert a CSS unit width to pixels (e.g. 2em)
		 *  @param {string} sWidth width to be converted
		 *  @param {node} nParent parent to get the with for (required for relative widths) - optional
		 *  @returns {int} iWidth width in pixels
		 *  @memberof DataTable#oApi
		 */
		function _fnConvertToWidth ( sWidth, nParent )
		{
			if ( !sWidth || sWidth === null || sWidth === '' )
			{
				return 0;
			}

			if ( !nParent )
			{
				nParent = document.getElementsByTagName('body')[0];
			}

			var iWidth;
			var nTmp = document.createElement( "div" );
			nTmp.style.width = _fnStringToCss( sWidth );

			nParent.appendChild( nTmp );
			iWidth = nTmp.offsetWidth;
			nParent.removeChild( nTmp );

			return ( iWidth );
		}


		/**
		 * Calculate the width of columns for the table
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnCalculateColumnWidths ( oSettings )
		{
			var iTableWidth = oSettings.nTable.offsetWidth;
			var iUserInputs = 0;
			var iTmpWidth;
			var iVisibleColumns = 0;
			var iColums = oSettings.aoColumns.length;
			var i, iIndex, iCorrector, iWidth;
			var oHeaders = $('th', oSettings.nTHead);
			var widthAttr = oSettings.nTable.getAttribute('width');

			/* Convert any user input sizes into pixel sizes */
			for ( i=0 ; i<iColums ; i++ )
			{
				if ( oSettings.aoColumns[i].bVisible )
				{
					iVisibleColumns++;

					if ( oSettings.aoColumns[i].sWidth !== null )
					{
						iTmpWidth = _fnConvertToWidth( oSettings.aoColumns[i].sWidthOrig,
								oSettings.nTable.parentNode );
						if ( iTmpWidth !== null )
						{
							oSettings.aoColumns[i].sWidth = _fnStringToCss( iTmpWidth );
						}

						iUserInputs++;
					}
				}
			}

			/* If the number of columns in the DOM equals the number that we have to process in
			 * DataTables, then we can use the offsets that are created by the web-browser. No custom
			 * sizes can be set in order for this to happen, nor scrolling used
			 */
			if ( iColums == oHeaders.length && iUserInputs === 0 && iVisibleColumns == iColums &&
					oSettings.oScroll.sX === "" && oSettings.oScroll.sY === "" )
			{
				for ( i=0 ; i<oSettings.aoColumns.length ; i++ )
				{
					iTmpWidth = $(oHeaders[i]).width();
					if ( iTmpWidth !== null )
					{
						oSettings.aoColumns[i].sWidth = _fnStringToCss( iTmpWidth );
					}
				}
			}
			else
			{
				/* Otherwise we are going to have to do some calculations to get the width of each column.
				 * Construct a 1 row table with the widest node in the data, and any user defined widths,
				 * then insert it into the DOM and allow the browser to do all the hard work of
				 * calculating table widths.
				 */
				var
						nCalcTmp = oSettings.nTable.cloneNode( false ),
						nTheadClone = oSettings.nTHead.cloneNode(true),
						nBody = document.createElement( 'tbody' ),
						nTr = document.createElement( 'tr' ),
						nDivSizing;

				nCalcTmp.removeAttribute( "id" );
				nCalcTmp.appendChild( nTheadClone );
				if ( oSettings.nTFoot !== null )
				{
					nCalcTmp.appendChild( oSettings.nTFoot.cloneNode(true) );
					_fnApplyToChildren( function(n) {
						n.style.width = "";
					}, nCalcTmp.getElementsByTagName('tr') );
				}

				nCalcTmp.appendChild( nBody );
				nBody.appendChild( nTr );

				/* Remove any sizing that was previously applied by the styles */
				var jqColSizing = $('thead th', nCalcTmp);
				if ( jqColSizing.length === 0 )
				{
					jqColSizing = $('tbody tr:eq(0)>td', nCalcTmp);
				}

				/* Apply custom sizing to the cloned header */
				var nThs = _fnGetUniqueThs( oSettings, nTheadClone );
				iCorrector = 0;
				for ( i=0 ; i<iColums ; i++ )
				{
					var oColumn = oSettings.aoColumns[i];
					if ( oColumn.bVisible && oColumn.sWidthOrig !== null && oColumn.sWidthOrig !== "" )
					{
						nThs[i-iCorrector].style.width = _fnStringToCss( oColumn.sWidthOrig );
					}
					else if ( oColumn.bVisible )
					{
						nThs[i-iCorrector].style.width = "";
					}
					else
					{
						iCorrector++;
					}
				}

				/* Find the biggest td for each column and put it into the table */
				for ( i=0 ; i<iColums ; i++ )
				{
					if ( oSettings.aoColumns[i].bVisible )
					{
						var nTd = _fnGetWidestNode( oSettings, i );
						if ( nTd !== null )
						{
							nTd = nTd.cloneNode(true);
							if ( oSettings.aoColumns[i].sContentPadding !== "" )
							{
								nTd.innerHTML += oSettings.aoColumns[i].sContentPadding;
							}
							nTr.appendChild( nTd );
						}
					}
				}

				/* Build the table and 'display' it */
				var nWrapper = oSettings.nTable.parentNode;
				nWrapper.appendChild( nCalcTmp );

				/* When scrolling (X or Y) we want to set the width of the table as appropriate. However,
				 * when not scrolling leave the table width as it is. This results in slightly different,
				 * but I think correct behaviour
				 */
				if ( oSettings.oScroll.sX !== "" && oSettings.oScroll.sXInner !== "" )
				{
					nCalcTmp.style.width = _fnStringToCss(oSettings.oScroll.sXInner);
				}
				else if ( oSettings.oScroll.sX !== "" )
				{
					nCalcTmp.style.width = "";
					if ( $(nCalcTmp).width() < nWrapper.offsetWidth )
					{
						nCalcTmp.style.width = _fnStringToCss( nWrapper.offsetWidth );
					}
				}
				else if ( oSettings.oScroll.sY !== "" )
				{
					nCalcTmp.style.width = _fnStringToCss( nWrapper.offsetWidth );
				}
				else if ( widthAttr )
				{
					nCalcTmp.style.width = _fnStringToCss( widthAttr );
				}
				nCalcTmp.style.visibility = "hidden";

				/* Scrolling considerations */
				_fnScrollingWidthAdjust( oSettings, nCalcTmp );

				/* Read the width's calculated by the browser and store them for use by the caller. We
				 * first of all try to use the elements in the body, but it is possible that there are
				 * no elements there, under which circumstances we use the header elements
				 */
				var oNodes = $("tbody tr:eq(0)", nCalcTmp).children();
				if ( oNodes.length === 0 )
				{
					oNodes = _fnGetUniqueThs( oSettings, $('thead', nCalcTmp)[0] );
				}

				/* Browsers need a bit of a hand when a width is assigned to any columns when
				 * x-scrolling as they tend to collapse the table to the min-width, even if
				 * we sent the column widths. So we need to keep track of what the table width
				 * should be by summing the user given values, and the automatic values
				 */
				if ( oSettings.oScroll.sX !== "" )
				{
					var iTotal = 0;
					iCorrector = 0;
					for ( i=0 ; i<oSettings.aoColumns.length ; i++ )
					{
						if ( oSettings.aoColumns[i].bVisible )
						{
							if ( oSettings.aoColumns[i].sWidthOrig === null )
							{
								iTotal += $(oNodes[iCorrector]).outerWidth();
							}
							else
							{
								iTotal += parseInt(oSettings.aoColumns[i].sWidth.replace('px',''), 10) +
										($(oNodes[iCorrector]).outerWidth() - $(oNodes[iCorrector]).width());
							}
							iCorrector++;
						}
					}

					nCalcTmp.style.width = _fnStringToCss( iTotal );
					oSettings.nTable.style.width = _fnStringToCss( iTotal );
				}

				iCorrector = 0;
				for ( i=0 ; i<oSettings.aoColumns.length ; i++ )
				{
					if ( oSettings.aoColumns[i].bVisible )
					{
						iWidth = $(oNodes[iCorrector]).width();
						if ( iWidth !== null && iWidth > 0 )
						{
							oSettings.aoColumns[i].sWidth = _fnStringToCss( iWidth );
						}
						iCorrector++;
					}
				}

				var cssWidth = $(nCalcTmp).css('width');
				oSettings.nTable.style.width = (cssWidth.indexOf('%') !== -1) ?
						cssWidth : _fnStringToCss( $(nCalcTmp).outerWidth() );
				nCalcTmp.parentNode.removeChild( nCalcTmp );
			}

			if ( widthAttr )
			{
				oSettings.nTable.style.width = _fnStringToCss( widthAttr );
			}
		}


		/**
		 * Adjust a table's width to take account of scrolling
		 *  @param {object} oSettings dataTables settings object
		 *  @param {node} n table node
		 *  @memberof DataTable#oApi
		 */
		function _fnScrollingWidthAdjust ( oSettings, n )
		{
			if ( oSettings.oScroll.sX === "" && oSettings.oScroll.sY !== "" )
			{
				/* When y-scrolling only, we want to remove the width of the scroll bar so the table
				 * + scroll bar will fit into the area avaialble.
				 */
				var iOrigWidth = $(n).width();
				n.style.width = _fnStringToCss( $(n).outerWidth()-oSettings.oScroll.iBarWidth );
			}
			else if ( oSettings.oScroll.sX !== "" )
			{
				/* When x-scrolling both ways, fix the table at it's current size, without adjusting */
				n.style.width = _fnStringToCss( $(n).outerWidth() );
			}
		}


		/**
		 * Get the widest node
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iCol column of interest
		 *  @returns {string} max strlens for each column
		 *  @memberof DataTable#oApi
		 */
		function _fnGetWidestNode( oSettings, iCol )
		{
			var iMaxIndex = _fnGetMaxLenString( oSettings, iCol );
			if ( iMaxIndex < 0 )
			{
				return null;
			}

			if ( oSettings.aoData[iMaxIndex].nTr === null )
			{
				var n = document.createElement('td');
				n.innerHTML = _fnGetCellData( oSettings, iMaxIndex, iCol, '' );
				return n;
			}
			return _fnGetTdNodes(oSettings, iMaxIndex)[iCol];
		}


		/**
		 * Get the maximum strlen for each data column
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iCol column of interest
		 *  @returns {string} max strlens for each column
		 *  @memberof DataTable#oApi
		 */
		function _fnGetMaxLenString( oSettings, iCol )
		{
			var iMax = -1;
			var iMaxIndex = -1;

			for ( var i=0 ; i<oSettings.aoData.length ; i++ )
			{
				var s = _fnGetCellData( oSettings, i, iCol, 'display' )+"";
				s = s.replace( /<.*?>/g, "" );
				if ( s.length > iMax )
				{
					iMax = s.length;
					iMaxIndex = i;
				}
			}

			return iMaxIndex;
		}


		/**
		 * Append a CSS unit (only if required) to a string
		 *  @param {array} aArray1 first array
		 *  @param {array} aArray2 second array
		 *  @returns {int} 0 if match, 1 if length is different, 2 if no match
		 *  @memberof DataTable#oApi
		 */
		function _fnStringToCss( s )
		{
			if ( s === null )
			{
				return "0px";
			}

			if ( typeof s == 'number' )
			{
				if ( s < 0 )
				{
					return "0px";
				}
				return s+"px";
			}

			/* Check if the last character is not 0-9 */
			var c = s.charCodeAt( s.length-1 );
			if (c < 0x30 || c > 0x39)
			{
				return s;
			}
			return s+"px";
		}


		/**
		 * Get the width of a scroll bar in this browser being used
		 *  @returns {int} width in pixels
		 *  @memberof DataTable#oApi
		 */
		function _fnScrollBarWidth ()
		{
			var inner = document.createElement('p');
			var style = inner.style;
			style.width = "100%";
			style.height = "200px";
			style.padding = "0px";

			var outer = document.createElement('div');
			style = outer.style;
			style.position = "absolute";
			style.top = "0px";
			style.left = "0px";
			style.visibility = "hidden";
			style.width = "200px";
			style.height = "150px";
			style.padding = "0px";
			style.overflow = "hidden";
			outer.appendChild(inner);

			document.body.appendChild(outer);
			var w1 = inner.offsetWidth;
			outer.style.overflow = 'scroll';
			var w2 = inner.offsetWidth;
			if ( w1 == w2 )
			{
				w2 = outer.clientWidth;
			}

			document.body.removeChild(outer);
			return (w1 - w2);
		}



		/**
		 * Change the order of the table
		 *  @param {object} oSettings dataTables settings object
		 *  @param {bool} bApplyClasses optional - should we apply classes or not
		 *  @memberof DataTable#oApi
		 */
		function _fnSort ( oSettings, bApplyClasses )
		{
			var
					i, iLen, j, jLen, k, kLen,
					sDataType, nTh,
					aaSort = [],
					aiOrig = [],
					oSort = DataTable.ext.oSort,
					aoData = oSettings.aoData,
					aoColumns = oSettings.aoColumns,
					oAria = oSettings.oLanguage.oAria;

			/* No sorting required if server-side or no sorting array */
			if ( !oSettings.oFeatures.bServerSide &&
					(oSettings.aaSorting.length !== 0 || oSettings.aaSortingFixed !== null) )
			{
				if ( oSettings.aaSortingFixed !== null )
				{
					aaSort = oSettings.aaSortingFixed.concat( oSettings.aaSorting );
				}
				else
				{
					aaSort = oSettings.aaSorting.slice();
				}

				/* If there is a sorting data type, and a fuction belonging to it, then we need to
				 * get the data from the developer's function and apply it for this column
				 */
				for ( i=0 ; i<aaSort.length ; i++ )
				{
					var iColumn = aaSort[i][0];
					var iVisColumn = _fnColumnIndexToVisible( oSettings, iColumn );
					sDataType = oSettings.aoColumns[ iColumn ].sSortDataType;
					if ( DataTable.ext.afnSortData[sDataType] )
					{
						var aData = DataTable.ext.afnSortData[sDataType]( oSettings, iColumn, iVisColumn );
						for ( j=0, jLen=aoData.length ; j<jLen ; j++ )
						{
							_fnSetCellData( oSettings, j, iColumn, aData[j] );
						}
					}
				}

				/* Create a value - key array of the current row positions such that we can use their
				 * current position during the sort, if values match, in order to perform stable sorting
				 */
				for ( i=0, iLen=oSettings.aiDisplayMaster.length ; i<iLen ; i++ )
				{
					aiOrig[ oSettings.aiDisplayMaster[i] ] = i;
				}

				/* Build an internal data array which is specific to the sort, so we can get and prep
				 * the data to be sorted only once, rather than needing to do it every time the sorting
				 * function runs. This make the sorting function a very simple comparison
				 */
				var iSortLen = aaSort.length;
				var fnSortFormat, aDataSort;
				for ( i=0, iLen=aoData.length ; i<iLen ; i++ )
				{
					for ( j=0 ; j<iSortLen ; j++ )
					{
						aDataSort = aoColumns[ aaSort[j][0] ].aDataSort;

						for ( k=0, kLen=aDataSort.length ; k<kLen ; k++ )
						{
							sDataType = aoColumns[ aDataSort[k] ].sType;
							fnSortFormat = oSort[ (sDataType ? sDataType : 'string')+"-pre" ];

							aoData[i]._aSortData[ aDataSort[k] ] = fnSortFormat ?
									fnSortFormat( _fnGetCellData( oSettings, i, aDataSort[k], 'sort' ) ) :
									_fnGetCellData( oSettings, i, aDataSort[k], 'sort' );
						}
					}
				}

				/* Do the sort - here we want multi-column sorting based on a given data source (column)
				 * and sorting function (from oSort) in a certain direction. It's reasonably complex to
				 * follow on it's own, but this is what we want (example two column sorting):
				 *  fnLocalSorting = function(a,b){
				 *  	var iTest;
				 *  	iTest = oSort['string-asc']('data11', 'data12');
				 *  	if (iTest !== 0)
				 *  		return iTest;
				 *    iTest = oSort['numeric-desc']('data21', 'data22');
				 *    if (iTest !== 0)
				 *  		return iTest;
				 *  	return oSort['numeric-asc']( aiOrig[a], aiOrig[b] );
				 *  }
				 * Basically we have a test for each sorting column, if the data in that column is equal,
				 * test the next column. If all columns match, then we use a numeric sort on the row
				 * positions in the original data array to provide a stable sort.
				 */
				oSettings.aiDisplayMaster.sort( function ( a, b ) {
					var k, l, lLen, iTest, aDataSort, sDataType;
					for ( k=0 ; k<iSortLen ; k++ )
					{
						aDataSort = aoColumns[ aaSort[k][0] ].aDataSort;

						for ( l=0, lLen=aDataSort.length ; l<lLen ; l++ )
						{
							sDataType = aoColumns[ aDataSort[l] ].sType;

							iTest = oSort[ (sDataType ? sDataType : 'string')+"-"+aaSort[k][1] ](
									aoData[a]._aSortData[ aDataSort[l] ],
									aoData[b]._aSortData[ aDataSort[l] ]
							);

							if ( iTest !== 0 )
							{
								return iTest;
							}
						}
					}

					return oSort['numeric-asc']( aiOrig[a], aiOrig[b] );
				} );
			}

			/* Alter the sorting classes to take account of the changes */
			if ( (bApplyClasses === undefined || bApplyClasses) && !oSettings.oFeatures.bDeferRender )
			{
				_fnSortingClasses( oSettings );
			}

			for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				nTh = aoColumns[i].nTh;
				nTh.removeAttribute('aria-sort');
				nTh.removeAttribute('aria-label');

				/* In ARIA only the first sorting column can be marked as sorting - no multi-sort option */
				if ( aoColumns[i].bSortable )
				{
					if ( aaSort.length > 0 && aaSort[0][0] == i )
					{
						nTh.setAttribute('aria-sort', aaSort[0][1]=="asc" ? "ascending" : "descending" );

						var nextSort = (aoColumns[i].asSorting[ aaSort[0][2]+1 ]) ?
								aoColumns[i].asSorting[ aaSort[0][2]+1 ] : aoColumns[i].asSorting[0];
						nTh.setAttribute('aria-label', aoColumns[i].sTitle+
								(nextSort=="asc" ? oAria.sSortAscending : oAria.sSortDescending) );
					}
					else
					{
						nTh.setAttribute('aria-label', aoColumns[i].sTitle+
								(aoColumns[i].asSorting[0]=="asc" ? oAria.sSortAscending : oAria.sSortDescending) );
					}
				}
				else
				{
					nTh.setAttribute('aria-label', aoColumns[i].sTitle);
				}
			}

			/* Tell the draw function that we have sorted the data */
			oSettings.bSorted = true;
			$(oSettings.oInstance).trigger('sort', oSettings);

			/* Copy the master data into the draw array and re-draw */
			if ( oSettings.oFeatures.bFilter )
			{
				/* _fnFilter() will redraw the table for us */
				_fnFilterComplete( oSettings, oSettings.oPreviousSearch, 1 );
			}
			else
			{
				oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
				oSettings._iDisplayStart = 0; /* reset display back to page 0 */
				_fnCalculateEnd( oSettings );
				_fnDraw( oSettings );
			}
		}


		/**
		 * Attach a sort handler (click) to a node
		 *  @param {object} oSettings dataTables settings object
		 *  @param {node} nNode node to attach the handler to
		 *  @param {int} iDataIndex column sorting index
		 *  @param {function} [fnCallback] callback function
		 *  @memberof DataTable#oApi
		 */
		function _fnSortAttachListener ( oSettings, nNode, iDataIndex, fnCallback )
		{
			_fnBindAction( nNode, {}, function (e) {
				/* If the column is not sortable - don't to anything */
				if ( oSettings.aoColumns[iDataIndex].bSortable === false )
				{
					return;
				}

				/*
				 * This is a little bit odd I admit... I declare a temporary function inside the scope of
				 * _fnBuildHead and the click handler in order that the code presented here can be used
				 * twice - once for when bProcessing is enabled, and another time for when it is
				 * disabled, as we need to perform slightly different actions.
				 *   Basically the issue here is that the Javascript engine in modern browsers don't
				 * appear to allow the rendering engine to update the display while it is still excuting
				 * it's thread (well - it does but only after long intervals). This means that the
				 * 'processing' display doesn't appear for a table sort. To break the js thread up a bit
				 * I force an execution break by using setTimeout - but this breaks the expected
				 * thread continuation for the end-developer's point of view (their code would execute
				 * too early), so we on;y do it when we absolutely have to.
				 */
				var fnInnerSorting = function () {
					var iColumn, iNextSort;

					/* If the shift key is pressed then we are multipe column sorting */
					if ( e.shiftKey )
					{
						/* Are we already doing some kind of sort on this column? */
						var bFound = false;
						for ( var i=0 ; i<oSettings.aaSorting.length ; i++ )
						{
							if ( oSettings.aaSorting[i][0] == iDataIndex )
							{
								bFound = true;
								iColumn = oSettings.aaSorting[i][0];
								iNextSort = oSettings.aaSorting[i][2]+1;

								if ( !oSettings.aoColumns[iColumn].asSorting[iNextSort] )
								{
									/* Reached the end of the sorting options, remove from multi-col sort */
									oSettings.aaSorting.splice( i, 1 );
								}
								else
								{
									/* Move onto next sorting direction */
									oSettings.aaSorting[i][1] = oSettings.aoColumns[iColumn].asSorting[iNextSort];
									oSettings.aaSorting[i][2] = iNextSort;
								}
								break;
							}
						}

						/* No sort yet - add it in */
						if ( bFound === false )
						{
							oSettings.aaSorting.push( [ iDataIndex,
								oSettings.aoColumns[iDataIndex].asSorting[0], 0 ] );
						}
					}
					else
					{
						/* If no shift key then single column sort */
						if ( oSettings.aaSorting.length == 1 && oSettings.aaSorting[0][0] == iDataIndex )
						{
							iColumn = oSettings.aaSorting[0][0];
							iNextSort = oSettings.aaSorting[0][2]+1;
							if ( !oSettings.aoColumns[iColumn].asSorting[iNextSort] )
							{
								iNextSort = 0;
							}
							oSettings.aaSorting[0][1] = oSettings.aoColumns[iColumn].asSorting[iNextSort];
							oSettings.aaSorting[0][2] = iNextSort;
						}
						else
						{
							oSettings.aaSorting.splice( 0, oSettings.aaSorting.length );
							oSettings.aaSorting.push( [ iDataIndex,
								oSettings.aoColumns[iDataIndex].asSorting[0], 0 ] );
						}
					}

					/* Run the sort */
					_fnSort( oSettings );
				}; /* /fnInnerSorting */

				if ( !oSettings.oFeatures.bProcessing )
				{
					fnInnerSorting();
				}
				else
				{
					_fnProcessingDisplay( oSettings, true );
					setTimeout( function() {
						fnInnerSorting();
						if ( !oSettings.oFeatures.bServerSide )
						{
							_fnProcessingDisplay( oSettings, false );
						}
					}, 0 );
				}

				/* Call the user specified callback function - used for async user interaction */
				if ( typeof fnCallback == 'function' )
				{
					fnCallback( oSettings );
				}
			} );
		}


		/**
		 * Set the sorting classes on the header, Note: it is safe to call this function
		 * when bSort and bSortClasses are false
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnSortingClasses( oSettings )
		{
			var i, iLen, j, jLen, iFound;
			var aaSort, sClass;
			var iColumns = oSettings.aoColumns.length;
			var oClasses = oSettings.oClasses;

			for ( i=0 ; i<iColumns ; i++ )
			{
				if ( oSettings.aoColumns[i].bSortable )
				{
					$(oSettings.aoColumns[i].nTh).removeClass( oClasses.sSortAsc +" "+ oClasses.sSortDesc +
							" "+ oSettings.aoColumns[i].sSortingClass );
				}
			}

			if ( oSettings.aaSortingFixed !== null )
			{
				aaSort = oSettings.aaSortingFixed.concat( oSettings.aaSorting );
			}
			else
			{
				aaSort = oSettings.aaSorting.slice();
			}

			/* Apply the required classes to the header */
			for ( i=0 ; i<oSettings.aoColumns.length ; i++ )
			{
				if ( oSettings.aoColumns[i].bSortable )
				{
					sClass = oSettings.aoColumns[i].sSortingClass;
					iFound = -1;
					for ( j=0 ; j<aaSort.length ; j++ )
					{
						if ( aaSort[j][0] == i )
						{
							sClass = ( aaSort[j][1] == "asc" ) ?
									oClasses.sSortAsc : oClasses.sSortDesc;
							iFound = j;
							break;
						}
					}
					$(oSettings.aoColumns[i].nTh).addClass( sClass );

					if ( oSettings.bJUI )
					{
						/* jQuery UI uses extra markup */
						var jqSpan = $("span."+oClasses.sSortIcon,  oSettings.aoColumns[i].nTh);
						jqSpan.removeClass(oClasses.sSortJUIAsc +" "+ oClasses.sSortJUIDesc +" "+
								oClasses.sSortJUI +" "+ oClasses.sSortJUIAscAllowed +" "+ oClasses.sSortJUIDescAllowed );

						var sSpanClass;
						if ( iFound == -1 )
						{
							sSpanClass = oSettings.aoColumns[i].sSortingClassJUI;
						}
						else if ( aaSort[iFound][1] == "asc" )
						{
							sSpanClass = oClasses.sSortJUIAsc;
						}
						else
						{
							sSpanClass = oClasses.sSortJUIDesc;
						}

						jqSpan.addClass( sSpanClass );
					}
				}
				else
				{
					/* No sorting on this column, so add the base class. This will have been assigned by
					 * _fnAddColumn
					 */
					$(oSettings.aoColumns[i].nTh).addClass( oSettings.aoColumns[i].sSortingClass );
				}
			}

			/*
			 * Apply the required classes to the table body
			 * Note that this is given as a feature switch since it can significantly slow down a sort
			 * on large data sets (adding and removing of classes is always slow at the best of times..)
			 * Further to this, note that this code is admitadly fairly ugly. It could be made a lot
			 * simpiler using jQuery selectors and add/removeClass, but that is significantly slower
			 * (on the order of 5 times slower) - hence the direct DOM manipulation here.
			 * Note that for defered drawing we do use jQuery - the reason being that taking the first
			 * row found to see if the whole column needs processed can miss classes since the first
			 * column might be new.
			 */
			sClass = oClasses.sSortColumn;

			if ( oSettings.oFeatures.bSort && oSettings.oFeatures.bSortClasses )
			{
				var nTds = _fnGetTdNodes( oSettings );

				/* Remove the old classes */
				if ( oSettings.oFeatures.bDeferRender )
				{
					$(nTds).removeClass(sClass+'1 '+sClass+'2 '+sClass+'3');
				}
				else if ( nTds.length >= iColumns )
				{
					for ( i=0 ; i<iColumns ; i++ )
					{
						if ( nTds[i].className.indexOf(sClass+"1") != -1 )
						{
							for ( j=0, jLen=(nTds.length/iColumns) ; j<jLen ; j++ )
							{
								nTds[(iColumns*j)+i].className =
										$.trim( nTds[(iColumns*j)+i].className.replace( sClass+"1", "" ) );
							}
						}
						else if ( nTds[i].className.indexOf(sClass+"2") != -1 )
						{
							for ( j=0, jLen=(nTds.length/iColumns) ; j<jLen ; j++ )
							{
								nTds[(iColumns*j)+i].className =
										$.trim( nTds[(iColumns*j)+i].className.replace( sClass+"2", "" ) );
							}
						}
						else if ( nTds[i].className.indexOf(sClass+"3") != -1 )
						{
							for ( j=0, jLen=(nTds.length/iColumns) ; j<jLen ; j++ )
							{
								nTds[(iColumns*j)+i].className =
										$.trim( nTds[(iColumns*j)+i].className.replace( " "+sClass+"3", "" ) );
							}
						}
					}
				}

				/* Add the new classes to the table */
				var iClass = 1, iTargetCol;
				for ( i=0 ; i<aaSort.length ; i++ )
				{
					iTargetCol = parseInt( aaSort[i][0], 10 );
					for ( j=0, jLen=(nTds.length/iColumns) ; j<jLen ; j++ )
					{
						nTds[(iColumns*j)+iTargetCol].className += " "+sClass+iClass;
					}

					if ( iClass < 3 )
					{
						iClass++;
					}
				}
			}
		}



		/**
		 * Save the state of a table in a cookie such that the page can be reloaded
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnSaveState ( oSettings )
		{
			if ( !oSettings.oFeatures.bStateSave || oSettings.bDestroying )
			{
				return;
			}

			/* Store the interesting variables */
			var i, iLen, bInfinite=oSettings.oScroll.bInfinite;
			var oState = {
				"iCreate":      new Date().getTime(),
				"iStart":       (bInfinite ? 0 : oSettings._iDisplayStart),
				"iEnd":         (bInfinite ? oSettings._iDisplayLength : oSettings._iDisplayEnd),
				"iLength":      oSettings._iDisplayLength,
				"aaSorting":    $.extend( true, [], oSettings.aaSorting ),
				"oSearch":      $.extend( true, {}, oSettings.oPreviousSearch ),
				"aoSearchCols": $.extend( true, [], oSettings.aoPreSearchCols ),
				"abVisCols":    []
			};

			for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				oState.abVisCols.push( oSettings.aoColumns[i].bVisible );
			}

			_fnCallbackFire( oSettings, "aoStateSaveParams", 'stateSaveParams', [oSettings, oState] );

			oSettings.fnStateSave.call( oSettings.oInstance, oSettings, oState );
		}


		/**
		 * Attempt to load a saved table state from a cookie
		 *  @param {object} oSettings dataTables settings object
		 *  @param {object} oInit DataTables init object so we can override settings
		 *  @memberof DataTable#oApi
		 */
		function _fnLoadState ( oSettings, oInit )
		{
			if ( !oSettings.oFeatures.bStateSave )
			{
				return;
			}

			var oData = oSettings.fnStateLoad.call( oSettings.oInstance, oSettings );
			if ( !oData )
			{
				return;
			}

			/* Allow custom and plug-in manipulation functions to alter the saved data set and
			 * cancelling of loading by returning false
			 */
			var abStateLoad = _fnCallbackFire( oSettings, 'aoStateLoadParams', 'stateLoadParams', [oSettings, oData] );
			if ( $.inArray( false, abStateLoad ) !== -1 )
			{
				return;
			}

			/* Store the saved state so it might be accessed at any time */
			oSettings.oLoadedState = $.extend( true, {}, oData );

			/* Restore key features */
			oSettings._iDisplayStart    = oData.iStart;
			oSettings.iInitDisplayStart = oData.iStart;
			oSettings._iDisplayEnd      = oData.iEnd;
			oSettings._iDisplayLength   = oData.iLength;
			oSettings.aaSorting         = oData.aaSorting.slice();
			oSettings.saved_aaSorting   = oData.aaSorting.slice();

			/* Search filtering  */
			$.extend( oSettings.oPreviousSearch, oData.oSearch );
			$.extend( true, oSettings.aoPreSearchCols, oData.aoSearchCols );

			/* Column visibility state
			 * Pass back visibiliy settings to the init handler, but to do not here override
			 * the init object that the user might have passed in
			 */
			oInit.saved_aoColumns = [];
			for ( var i=0 ; i<oData.abVisCols.length ; i++ )
			{
				oInit.saved_aoColumns[i] = {};
				oInit.saved_aoColumns[i].bVisible = oData.abVisCols[i];
			}

			_fnCallbackFire( oSettings, 'aoStateLoaded', 'stateLoaded', [oSettings, oData] );
		}


		/**
		 * Create a new cookie with a value to store the state of a table
		 *  @param {string} sName name of the cookie to create
		 *  @param {string} sValue the value the cookie should take
		 *  @param {int} iSecs duration of the cookie
		 *  @param {string} sBaseName sName is made up of the base + file name - this is the base
		 *  @param {function} fnCallback User definable function to modify the cookie
		 *  @memberof DataTable#oApi
		 */
		function _fnCreateCookie ( sName, sValue, iSecs, sBaseName, fnCallback )
		{
			var date = new Date();
			date.setTime( date.getTime()+(iSecs*1000) );

			/*
			 * Shocking but true - it would appear IE has major issues with having the path not having
			 * a trailing slash on it. We need the cookie to be available based on the path, so we
			 * have to append the file name to the cookie name. Appalling. Thanks to vex for adding the
			 * patch to use at least some of the path
			 */
			var aParts = window.location.pathname.split('/');
			var sNameFile = sName + '_' + aParts.pop().replace(/[\/:]/g,"").toLowerCase();
			var sFullCookie, oData;

			if ( fnCallback !== null )
			{
				oData = (typeof $.parseJSON === 'function') ?
						$.parseJSON( sValue ) : eval( '('+sValue+')' );
				sFullCookie = fnCallback( sNameFile, oData, date.toGMTString(),
						aParts.join('/')+"/" );
			}
			else
			{
				sFullCookie = sNameFile + "=" + encodeURIComponent(sValue) +
						"; expires=" + date.toGMTString() +"; path=" + aParts.join('/')+"/";
			}

			/* Are we going to go over the cookie limit of 4KiB? If so, try to delete a cookies
			 * belonging to DataTables. This is FAR from bullet proof
			 */
			var sOldName="", iOldTime=9999999999999;
			var iLength = _fnReadCookie( sNameFile )!==null ? document.cookie.length :
					sFullCookie.length + document.cookie.length;

			if ( iLength+10 > 4096 ) /* Magic 10 for padding */
			{
				var aCookies =document.cookie.split(';');
				for ( var i=0, iLen=aCookies.length ; i<iLen ; i++ )
				{
					if ( aCookies[i].indexOf( sBaseName ) != -1 )
					{
						/* It's a DataTables cookie, so eval it and check the time stamp */
						var aSplitCookie = aCookies[i].split('=');
						try { oData = eval( '('+decodeURIComponent(aSplitCookie[1])+')' ); }
						catch( e ) { continue; }

						if ( oData.iCreate && oData.iCreate < iOldTime )
						{
							sOldName = aSplitCookie[0];
							iOldTime = oData.iCreate;
						}
					}
				}

				if ( sOldName !== "" )
				{
					document.cookie = sOldName+"=; expires=Thu, 01-Jan-1970 00:00:01 GMT; path="+
							aParts.join('/') + "/";
				}
			}

			document.cookie = sFullCookie;
		}


		/**
		 * Read an old cookie to get a cookie with an old table state
		 *  @param {string} sName name of the cookie to read
		 *  @returns {string} contents of the cookie - or null if no cookie with that name found
		 *  @memberof DataTable#oApi
		 */
		function _fnReadCookie ( sName )
		{
			var
					aParts = window.location.pathname.split('/'),
					sNameEQ = sName + '_' + aParts[aParts.length-1].replace(/[\/:]/g,"").toLowerCase() + '=',
					sCookieContents = document.cookie.split(';');

			for( var i=0 ; i<sCookieContents.length ; i++ )
			{
				var c = sCookieContents[i];

				while (c.charAt(0)==' ')
				{
					c = c.substring(1,c.length);
				}

				if (c.indexOf(sNameEQ) === 0)
				{
					return decodeURIComponent( c.substring(sNameEQ.length,c.length) );
				}
			}
			return null;
		}



		/**
		 * Return the settings object for a particular table
		 *  @param {node} nTable table we are using as a dataTable
		 *  @returns {object} Settings object - or null if not found
		 *  @memberof DataTable#oApi
		 */
		function _fnSettingsFromNode ( nTable )
		{
			for ( var i=0 ; i<DataTable.settings.length ; i++ )
			{
				if ( DataTable.settings[i].nTable === nTable )
				{
					return DataTable.settings[i];
				}
			}

			return null;
		}


		/**
		 * Return an array with the TR nodes for the table
		 *  @param {object} oSettings dataTables settings object
		 *  @returns {array} TR array
		 *  @memberof DataTable#oApi
		 */
		function _fnGetTrNodes ( oSettings )
		{
			var aNodes = [];
			var aoData = oSettings.aoData;
			for ( var i=0, iLen=aoData.length ; i<iLen ; i++ )
			{
				if ( aoData[i].nTr !== null )
				{
					aNodes.push( aoData[i].nTr );
				}
			}
			return aNodes;
		}


		/**
		 * Return an flat array with all TD nodes for the table, or row
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} [iIndividualRow] aoData index to get the nodes for - optional
		 *    if not given then the return array will contain all nodes for the table
		 *  @returns {array} TD array
		 *  @memberof DataTable#oApi
		 */
		function _fnGetTdNodes ( oSettings, iIndividualRow )
		{
			var anReturn = [];
			var iCorrector;
			var anTds;
			var iRow, iRows=oSettings.aoData.length,
					iColumn, iColumns, oData, sNodeName, iStart=0, iEnd=iRows;

			/* Allow the collection to be limited to just one row */
			if ( iIndividualRow !== undefined )
			{
				iStart = iIndividualRow;
				iEnd = iIndividualRow+1;
			}

			for ( iRow=iStart ; iRow<iEnd ; iRow++ )
			{
				oData = oSettings.aoData[iRow];
				if ( oData.nTr !== null )
				{
					/* get the TD child nodes - taking into account text etc nodes */
					anTds = [];
					for ( iColumn=0, iColumns=oData.nTr.childNodes.length ; iColumn<iColumns ; iColumn++ )
					{
						sNodeName = oData.nTr.childNodes[iColumn].nodeName.toLowerCase();
						if ( sNodeName == 'td' || sNodeName == 'th' )
						{
							anTds.push( oData.nTr.childNodes[iColumn] );
						}
					}

					iCorrector = 0;
					for ( iColumn=0, iColumns=oSettings.aoColumns.length ; iColumn<iColumns ; iColumn++ )
					{
						if ( oSettings.aoColumns[iColumn].bVisible )
						{
							anReturn.push( anTds[iColumn-iCorrector] );
						}
						else
						{
							anReturn.push( oData._anHidden[iColumn] );
							iCorrector++;
						}
					}
				}
			}

			return anReturn;
		}


		/**
		 * Log an error message
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iLevel log error messages, or display them to the user
		 *  @param {string} sMesg error message
		 *  @memberof DataTable#oApi
		 */
		function _fnLog( oSettings, iLevel, sMesg )
		{
			var sAlert = (oSettings===null) ?
					"DataTables warning: "+sMesg :
					"DataTables warning (table id = '"+oSettings.sTableId+"'): "+sMesg;

			if ( iLevel === 0 )
			{
				if ( DataTable.ext.sErrMode == 'alert' )
				{
					alert( sAlert );
				}
				else
				{
					throw sAlert;
				}
				return;
			}
			else if ( console !== undefined && console.log )
			{
				console.log( sAlert );
			}
		}


		/**
		 * See if a property is defined on one object, if so assign it to the other object
		 *  @param {object} oRet target object
		 *  @param {object} oSrc source object
		 *  @param {string} sName property
		 *  @param {string} [sMappedName] name to map too - optional, sName used if not given
		 *  @memberof DataTable#oApi
		 */
		function _fnMap( oRet, oSrc, sName, sMappedName )
		{
			if ( sMappedName === undefined )
			{
				sMappedName = sName;
			}
			if ( oSrc[sName] !== undefined )
			{
				oRet[sMappedName] = oSrc[sName];
			}
		}


		/**
		 * Extend objects - very similar to jQuery.extend, but deep copy objects, and shallow
		 * copy arrays. The reason we need to do this, is that we don't want to deep copy array
		 * init values (such as aaSorting) since the dev wouldn't be able to override them, but
		 * we do want to deep copy arrays.
		 *  @param {object} oOut Object to extend
		 *  @param {object} oExtender Object from which the properties will be applied to oOut
		 *  @returns {object} oOut Reference, just for convenience - oOut === the return.
		 *  @memberof DataTable#oApi
		 *  @todo This doesn't take account of arrays inside the deep copied objects.
		 */
		function _fnExtend( oOut, oExtender )
		{
			for ( var prop in oOut )
			{
				if ( oOut.hasOwnProperty(prop) && oExtender[prop] !== undefined )
				{
					if ( typeof oInit[prop] === 'object' && $.isArray(oExtender[prop]) === false )
					{
						$.extend( true, oOut[prop], oExtender[prop] );
					}
					else
					{
						oOut[prop] = oExtender[prop];
					}
				}
			}

			return oOut;
		}


		/**
		 * Bind an event handers to allow a click or return key to activate the callback.
		 * This is good for accessability since a return on the keyboard will have the
		 * same effect as a click, if the element has focus.
		 *  @param {element} n Element to bind the action to
		 *  @param {object} oData Data object to pass to the triggered function
		 *  @param {function) fn Callback function for when the event is triggered
				*  @memberof DataTable#oApi
		 */
		function _fnBindAction( n, oData, fn )
		{
			$(n)
					.bind( 'click.DT', oData, function (e) {
						fn(e);
						n.blur(); // Remove focus outline for mouse users
					} )
					.bind( 'keypress.DT', oData, function (e){
						if ( e.which === 13 ) {
							fn(e);
						} } )
					.bind( 'selectstart.DT', function () {
						/* Take the brutal approach to cancelling text selection */
						return false;
					} );
		}


		/**
		 * Register a callback function. Easily allows a callback function to be added to
		 * an array store of callback functions that can then all be called together.
		 *  @param {object} oSettings dataTables settings object
		 *  @param {string} sStore Name of the array storeage for the callbacks in oSettings
		 *  @param {function} fn Function to be called back
		 *  @param {string) sName Identifying name for the callback (i.e. a label)
				*  @memberof DataTable#oApi
		 */
		function _fnCallbackReg( oSettings, sStore, fn, sName )
		{
			if ( fn )
			{
				oSettings[sStore].push( {
					"fn": fn,
					"sName": sName
				} );
			}
		}


		/**
		 * Fire callback functions and trigger events. Note that the loop over the callback
		 * array store is done backwards! Further note that you do not want to fire off triggers
		 * in time sensitive applications (for example cell creation) as its slow.
		 *  @param {object} oSettings dataTables settings object
		 *  @param {string} sStore Name of the array storeage for the callbacks in oSettings
		 *  @param {string} sTrigger Name of the jQuery custom event to trigger. If null no trigger
		 *    is fired
		 *  @param {array) aArgs Array of arguments to pass to the callback function / trigger
				*  @memberof DataTable#oApi
		 */
		function _fnCallbackFire( oSettings, sStore, sTrigger, aArgs )
		{
			var aoStore = oSettings[sStore];
			var aRet =[];

			for ( var i=aoStore.length-1 ; i>=0 ; i-- )
			{
				aRet.push( aoStore[i].fn.apply( oSettings.oInstance, aArgs ) );
			}

			if ( sTrigger !== null )
			{
				$(oSettings.oInstance).trigger(sTrigger, aArgs);
			}

			return aRet;
		}


		/**
		 * JSON stringify. If JSON.stringify it provided by the browser, json2.js or any other
		 * library, then we use that as it is fast, safe and accurate. If the function isn't
		 * available then we need to built it ourselves - the insperation for this function comes
		 * from Craig Buckler ( http://www.sitepoint.com/javascript-json-serialization/ ). It is
		 * not perfect and absolutely should not be used as a replacement to json2.js - but it does
		 * do what we need, without requiring a dependency for DataTables.
		 *  @param {object} o JSON object to be converted
		 *  @returns {string} JSON string
		 *  @memberof DataTable#oApi
		 */
		var _fnJsonString = (window.JSON) ? JSON.stringify : function( o )
		{
			/* Not an object or array */
			var sType = typeof o;
			if (sType !== "object" || o === null)
			{
				// simple data type
				if (sType === "string")
				{
					o = '"'+o+'"';
				}
				return o+"";
			}

			/* If object or array, need to recurse over it */
			var
					sProp, mValue,
					json = [],
					bArr = $.isArray(o);

			for (sProp in o)
			{
				mValue = o[sProp];
				sType = typeof mValue;

				if (sType === "string")
				{
					mValue = '"'+mValue+'"';
				}
				else if (sType === "object" && mValue !== null)
				{
					mValue = _fnJsonString(mValue);
				}

				json.push((bArr ? "" : '"'+sProp+'":') + mValue);
			}

			return (bArr ? "[" : "{") + json + (bArr ? "]" : "}");
		};




		/**
		 * Perform a jQuery selector action on the table's TR elements (from the tbody) and
		 * return the resulting jQuery object.
		 *  @param {string|node|jQuery} sSelector jQuery selector or node collection to act on
		 *  @param {object} [oOpts] Optional parameters for modifying the rows to be included
		 *  @param {string} [oOpts.filter=none] Select TR elements that meet the current filter
		 *    criterion ("applied") or all TR elements (i.e. no filter).
		 *  @param {string} [oOpts.order=current] Order of the TR elements in the processed array.
		 *    Can be either 'current', whereby the current sorting of the table is used, or
		 *    'original' whereby the original order the data was read into the table is used.
		 *  @param {string} [oOpts.page=all] Limit the selection to the currently displayed page
		 *    ("current") or not ("all"). If 'current' is given, then order is assumed to be
		 *    'current' and filter is 'applied', regardless of what they might be given as.
		 *  @returns {object} jQuery object, filtered by the given selector.
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Highlight every second row
		 *      oTable.$('tr:odd').css('backgroundColor', 'blue');
		 *    } );
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Filter to rows with 'Webkit' in them, add a background colour and then
		 *      // remove the filter, thus highlighting the 'Webkit' rows only.
		 *      oTable.fnFilter('Webkit');
		 *      oTable.$('tr', {"filter": "applied"}).css('backgroundColor', 'blue');
		 *      oTable.fnFilter('');
		 *    } );
		 */
		this.$ = function ( sSelector, oOpts )
		{
			var i, iLen, a = [];
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );

			if ( !oOpts )
			{
				oOpts = {};
			}

			oOpts = $.extend( {}, {
				"filter": "none", // applied
				"order": "current", // "original"
				"page": "all" // current
			}, oOpts );

			// Current page implies that order=current and fitler=applied, since it is fairly
			// senseless otherwise
			if ( oOpts.page == 'current' )
			{
				for ( i=oSettings._iDisplayStart, iLen=oSettings.fnDisplayEnd() ; i<iLen ; i++ )
				{
					a.push( oSettings.aoData[ oSettings.aiDisplay[i] ].nTr );
				}
			}
			else if ( oOpts.order == "current" && oOpts.filter == "none" )
			{
				for ( i=0, iLen=oSettings.aiDisplayMaster.length ; i<iLen ; i++ )
				{
					a.push( oSettings.aoData[ oSettings.aiDisplayMaster[i] ].nTr );
				}
			}
			else if ( oOpts.order == "current" && oOpts.filter == "applied" )
			{
				for ( i=0, iLen=oSettings.aiDisplay.length ; i<iLen ; i++ )
				{
					a.push( oSettings.aoData[ oSettings.aiDisplay[i] ].nTr );
				}
			}
			else if ( oOpts.order == "original" && oOpts.filter == "none" )
			{
				for ( i=0, iLen=oSettings.aoData.length ; i<iLen ; i++ )
				{
					a.push( oSettings.aoData[ i ].nTr );
				}
			}
			else if ( oOpts.order == "original" && oOpts.filter == "applied" )
			{
				for ( i=0, iLen=oSettings.aoData.length ; i<iLen ; i++ )
				{
					if ( $.inArray( i, oSettings.aiDisplay ) !== -1 )
					{
						a.push( oSettings.aoData[ i ].nTr );
					}
				}
			}
			else
			{
				_fnLog( oSettings, 1, "Unknown selection options" );
			}

			/* We need to filter on the TR elements and also 'find' in their descendants
			 * to make the selector act like it would in a full table - so we need
			 * to build both results and then combine them together
			 */
			var jqA = $(a);
			var jqTRs = jqA.filter( sSelector );
			var jqDescendants = jqA.find( sSelector );

			return $( [].concat($.makeArray(jqTRs), $.makeArray(jqDescendants)) );
		};


		/**
		 * Almost identical to $ in operation, but in this case returns the data for the matched
		 * rows - as such, the jQuery selector used should match TR row nodes or TD/TH cell nodes
		 * rather than any decendents, so the data can be obtained for the row/cell. If matching
		 * rows are found, the data returned is the original data array/object that was used to
		 * create the row (or a generated array if from a DOM source).
		 *
		 * This method is often useful incombination with $ where both functions are given the
		 * same parameters and the array indexes will match identically.
		 *  @param {string|node|jQuery} sSelector jQuery selector or node collection to act on
		 *  @param {object} [oOpts] Optional parameters for modifying the rows to be included
		 *  @param {string} [oOpts.filter=none] Select elements that meet the current filter
		 *    criterion ("applied") or all elements (i.e. no filter).
		 *  @param {string} [oOpts.order=current] Order of the data in the processed array.
		 *    Can be either 'current', whereby the current sorting of the table is used, or
		 *    'original' whereby the original order the data was read into the table is used.
		 *  @param {string} [oOpts.page=all] Limit the selection to the currently displayed page
		 *    ("current") or not ("all"). If 'current' is given, then order is assumed to be
		 *    'current' and filter is 'applied', regardless of what they might be given as.
		 *  @returns {array} Data for the matched elements. If any elements, as a result of the
		 *    selector, were not TR, TD or TH elements in the DataTable, they will have a null
		 *    entry in the array.
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Get the data from the first row in the table
		 *      var data = oTable._('tr:first');
		 *
		 *      // Do something useful with the data
		 *      alert( "First cell is: "+data[0] );
		 *    } );
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Filter to 'Webkit' and get all data for
		 *      oTable.fnFilter('Webkit');
		 *      var data = oTable._('tr', {"filter": "applied"});
		 *
		 *      // Do something with the data
		 *      alert( data.length+" rows matched the filter" );
		 *    } );
		 */
		this._ = function ( sSelector, oOpts )
		{
			var aOut = [];
			var i, iLen, iIndex;
			var aTrs = this.$( sSelector, oOpts );

			for ( i=0, iLen=aTrs.length ; i<iLen ; i++ )
			{
				aOut.push( this.fnGetData(aTrs[i]) );
			}

			return aOut;
		};


		/**
		 * Add a single new row or multiple rows of data to the table. Please note
		 * that this is suitable for client-side processing only - if you are using
		 * server-side processing (i.e. "bServerSide": true), then to add data, you
		 * must add it to the data source, i.e. the server-side, through an Ajax call.
		 *  @param {array|object} mData The data to be added to the table. This can be:
		 *    <ul>
		 *      <li>1D array of data - add a single row with the data provided</li>
		 *      <li>2D array of arrays - add multiple rows in a single call</li>
		 *      <li>object - data object when using <i>mDataProp</i></li>
		 *      <li>array of objects - multiple data objects when using <i>mDataProp</i></li>
		 *    </ul>
		 *  @param {bool} [bRedraw=true] redraw the table or not
		 *  @returns {array} An array of integers, representing the list of indexes in
		 *    <i>aoData</i> ({@link DataTable.models.oSettings}) that have been added to
		 *    the table.
		 *  @dtopt API
		 *
		 *  @example
		 *    // Global var for counter
		 *    var giCount = 2;
		 *
		 *    $(document).ready(function() {
		 *      $('#example').dataTable();
		 *    } );
		 *
		 *    function fnClickAddRow() {
		 *      $('#example').dataTable().fnAddData( [
		 *        giCount+".1",
		 *        giCount+".2",
		 *        giCount+".3",
		 *        giCount+".4" ]
		 *      );
		 *
		 *      giCount++;
		 *    }
		 */
		this.fnAddData = function( mData, bRedraw )
		{
			if ( mData.length === 0 )
			{
				return [];
			}

			var aiReturn = [];
			var iTest;

			/* Find settings from table node */
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );

			/* Check if we want to add multiple rows or not */
			if ( typeof mData[0] === "object" && mData[0] !== null )
			{
				for ( var i=0 ; i<mData.length ; i++ )
				{
					iTest = _fnAddData( oSettings, mData[i] );
					if ( iTest == -1 )
					{
						return aiReturn;
					}
					aiReturn.push( iTest );
				}
			}
			else
			{
				iTest = _fnAddData( oSettings, mData );
				if ( iTest == -1 )
				{
					return aiReturn;
				}
				aiReturn.push( iTest );
			}

			oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();

			if ( bRedraw === undefined || bRedraw )
			{
				_fnReDraw( oSettings );
			}
			return aiReturn;
		};


		/**
		 * This function will make DataTables recalculate the column sizes, based on the data
		 * contained in the table and the sizes applied to the columns (in the DOM, CSS or
		 * through the sWidth parameter). This can be useful when the width of the table's
		 * parent element changes (for example a window resize).
		 *  @param {boolean} [bRedraw=true] Redraw the table or not, you will typically want to
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable( {
		 *        "sScrollY": "200px",
		 *        "bPaginate": false
		 *      } );
		 *
		 *      $(window).bind('resize', function () {
		 *        oTable.fnAdjustColumnSizing();
		 *      } );
		 *    } );
		 */
		this.fnAdjustColumnSizing = function ( bRedraw )
		{
			var oSettings = _fnSettingsFromNode(this[DataTable.ext.iApiIndex]);
			_fnAdjustColumnSizing( oSettings );

			if ( bRedraw === undefined || bRedraw )
			{
				this.fnDraw( false );
			}
			else if ( oSettings.oScroll.sX !== "" || oSettings.oScroll.sY !== "" )
			{
				/* If not redrawing, but scrolling, we want to apply the new column sizes anyway */
				this.oApi._fnScrollDraw(oSettings);
			}
		};


		/**
		 * Quickly and simply clear a table
		 *  @param {bool} [bRedraw=true] redraw the table or not
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Immediately 'nuke' the current rows (perhaps waiting for an Ajax callback...)
		 *      oTable.fnClearTable();
		 *    } );
		 */
		this.fnClearTable = function( bRedraw )
		{
			/* Find settings from table node */
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );
			_fnClearTable( oSettings );

			if ( bRedraw === undefined || bRedraw )
			{
				_fnDraw( oSettings );
			}
		};


		/**
		 * The exact opposite of 'opening' a row, this function will close any rows which
		 * are currently 'open'.
		 *  @param {node} nTr the table row to 'close'
		 *  @returns {int} 0 on success, or 1 if failed (can't find the row)
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable;
		 *
		 *      // 'open' an information row when a row is clicked on
		 *      $('#example tbody tr').click( function () {
		 *        if ( oTable.fnIsOpen(this) ) {
		 *          oTable.fnClose( this );
		 *        } else {
		 *          oTable.fnOpen( this, "Temporary row opened", "info_row" );
		 *        }
		 *      } );
		 *
		 *      oTable = $('#example').dataTable();
		 *    } );
		 */
		this.fnClose = function( nTr )
		{
			/* Find settings from table node */
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );

			for ( var i=0 ; i<oSettings.aoOpenRows.length ; i++ )
			{
				if ( oSettings.aoOpenRows[i].nParent == nTr )
				{
					var nTrParent = oSettings.aoOpenRows[i].nTr.parentNode;
					if ( nTrParent )
					{
						/* Remove it if it is currently on display */
						nTrParent.removeChild( oSettings.aoOpenRows[i].nTr );
					}
					oSettings.aoOpenRows.splice( i, 1 );
					return 0;
				}
			}
			return 1;
		};


		/**
		 * Remove a row for the table
		 *  @param {mixed} mTarget The index of the row from aoData to be deleted, or
		 *    the TR element you want to delete
		 *  @param {function|null} [fnCallBack] Callback function
		 *  @param {bool} [bRedraw=true] Redraw the table or not
		 *  @returns {array} The row that was deleted
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Immediately remove the first row
		 *      oTable.fnDeleteRow( 0 );
		 *    } );
		 */
		this.fnDeleteRow = function( mTarget, fnCallBack, bRedraw )
		{
			/* Find settings from table node */
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );
			var i, iLen, iAODataIndex;

			iAODataIndex = (typeof mTarget === 'object') ?
					_fnNodeToDataIndex(oSettings, mTarget) : mTarget;

			/* Return the data array from this row */
			var oData = oSettings.aoData.splice( iAODataIndex, 1 );

			/* Update the _DT_RowIndex parameter */
			for ( i=0, iLen=oSettings.aoData.length ; i<iLen ; i++ )
			{
				if ( oSettings.aoData[i].nTr !== null )
				{
					oSettings.aoData[i].nTr._DT_RowIndex = i;
				}
			}

			/* Remove the target row from the search array */
			var iDisplayIndex = $.inArray( iAODataIndex, oSettings.aiDisplay );
			oSettings.asDataSearch.splice( iDisplayIndex, 1 );

			/* Delete from the display arrays */
			_fnDeleteIndex( oSettings.aiDisplayMaster, iAODataIndex );
			_fnDeleteIndex( oSettings.aiDisplay, iAODataIndex );

			/* If there is a user callback function - call it */
			if ( typeof fnCallBack === "function" )
			{
				fnCallBack.call( this, oSettings, oData );
			}

			/* Check for an 'overflow' they case for dislaying the table */
			if ( oSettings._iDisplayStart >= oSettings.aiDisplay.length )
			{
				oSettings._iDisplayStart -= oSettings._iDisplayLength;
				if ( oSettings._iDisplayStart < 0 )
				{
					oSettings._iDisplayStart = 0;
				}
			}

			if ( bRedraw === undefined || bRedraw )
			{
				_fnCalculateEnd( oSettings );
				_fnDraw( oSettings );
			}

			return oData;
		};


		/**
		 * Restore the table to it's original state in the DOM by removing all of DataTables
		 * enhancements, alterations to the DOM structure of the table and event listeners.
		 *  @param {boolean} [bRemove=false] Completely remove the table from the DOM
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      // This example is fairly pointless in reality, but shows how fnDestroy can be used
		 *      var oTable = $('#example').dataTable();
		 *      oTable.fnDestroy();
		 *    } );
		 */
		this.fnDestroy = function ( bRemove )
		{
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );
			var nOrig = oSettings.nTableWrapper.parentNode;
			var nBody = oSettings.nTBody;
			var i, iLen;

			bRemove = (bRemove===undefined) ? false : true;

			/* Flag to note that the table is currently being destroyed - no action should be taken */
			oSettings.bDestroying = true;

			/* Restore hidden columns */
			for ( i=0, iLen=oSettings.aoDestroyCallback.length ; i<iLen ; i++ ) {
				oSettings.aoDestroyCallback[i].fn();
			}

			/* Restore hidden columns */
			for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				if ( oSettings.aoColumns[i].bVisible === false )
				{
					this.fnSetColumnVis( i, true );
				}
			}

			/* Blitz all DT events */
			$(oSettings.nTableWrapper).find('*').andSelf().unbind('.DT');

			/* If there is an 'empty' indicator row, remove it */
			$('tbody>tr>td.'+oSettings.oClasses.sRowEmpty, oSettings.nTable).parent().remove();

			/* When scrolling we had to break the table up - restore it */
			if ( oSettings.nTable != oSettings.nTHead.parentNode )
			{
				$(oSettings.nTable).children('thead').remove();
				oSettings.nTable.appendChild( oSettings.nTHead );
			}

			if ( oSettings.nTFoot && oSettings.nTable != oSettings.nTFoot.parentNode )
			{
				$(oSettings.nTable).children('tfoot').remove();
				oSettings.nTable.appendChild( oSettings.nTFoot );
			}

			/* Remove the DataTables generated nodes, events and classes */
			oSettings.nTable.parentNode.removeChild( oSettings.nTable );
			$(oSettings.nTableWrapper).remove();

			oSettings.aaSorting = [];
			oSettings.aaSortingFixed = [];
			_fnSortingClasses( oSettings );

			$(_fnGetTrNodes( oSettings )).removeClass( oSettings.asStripeClasses.join(' ') );

			$('th, td', oSettings.nTHead).removeClass( [
				oSettings.oClasses.sSortable,
				oSettings.oClasses.sSortableAsc,
				oSettings.oClasses.sSortableDesc,
				oSettings.oClasses.sSortableNone ].join(' ')
			);
			if ( oSettings.bJUI )
			{
				$('th span.'+oSettings.oClasses.sSortIcon
						+ ', td span.'+oSettings.oClasses.sSortIcon, oSettings.nTHead).remove();

				$('th, td', oSettings.nTHead).each( function () {
					var jqWrapper = $('div.'+oSettings.oClasses.sSortJUIWrapper, this);
					var kids = jqWrapper.contents();
					$(this).append( kids );
					jqWrapper.remove();
				} );
			}

			/* Add the TR elements back into the table in their original order */
			if ( !bRemove && oSettings.nTableReinsertBefore )
			{
				nOrig.insertBefore( oSettings.nTable, oSettings.nTableReinsertBefore );
			}
			else if ( !bRemove )
			{
				nOrig.appendChild( oSettings.nTable );
			}

			for ( i=0, iLen=oSettings.aoData.length ; i<iLen ; i++ )
			{
				if ( oSettings.aoData[i].nTr !== null )
				{
					nBody.appendChild( oSettings.aoData[i].nTr );
				}
			}

			/* Restore the width of the original table */
			if ( oSettings.oFeatures.bAutoWidth === true )
			{
				oSettings.nTable.style.width = _fnStringToCss(oSettings.sDestroyWidth);
			}

			/* If the were originally odd/even type classes - then we add them back here. Note
			 * this is not fool proof (for example if not all rows as odd/even classes - but
			 * it's a good effort without getting carried away
			 */
			$(nBody).children('tr:even').addClass( oSettings.asDestroyStripes[0] );
			$(nBody).children('tr:odd').addClass( oSettings.asDestroyStripes[1] );

			/* Remove the settings object from the settings array */
			for ( i=0, iLen=DataTable.settings.length ; i<iLen ; i++ )
			{
				if ( DataTable.settings[i] == oSettings )
				{
					DataTable.settings.splice( i, 1 );
				}
			}

			/* End it all */
			oSettings = null;
		};


		/**
		 * Redraw the table
		 *  @param {bool} [bComplete=true] Re-filter and resort (if enabled) the table before the draw.
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Re-draw the table - you wouldn't want to do it here, but it's an example :-)
		 *      oTable.fnDraw();
		 *    } );
		 */
		this.fnDraw = function( bComplete )
		{
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );
			if ( bComplete )
			{
				_fnCalculateEnd( oSettings );
				_fnDraw( oSettings );
			}
			else
			{
				_fnReDraw( oSettings );
			}
		};


		/**
		 * Filter the input based on data
		 *  @param {string} sInput String to filter the table on
		 *  @param {int|null} [iColumn] Column to limit filtering to
		 *  @param {bool} [bRegex=false] Treat as regular expression or not
		 *  @param {bool} [bSmart=true] Perform smart filtering or not
		 *  @param {bool} [bShowGlobal=true] Show the input global filter in it's input box(es)
		 *  @param {bool} [bCaseInsensitive=true] Do case-insensitive matching (true) or not (false)
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Sometime later - filter...
		 *      oTable.fnFilter( 'test string' );
		 *    } );
		 */
		this.fnFilter = function( sInput, iColumn, bRegex, bSmart, bShowGlobal, bCaseInsensitive )
		{
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );

			if ( !oSettings.oFeatures.bFilter )
			{
				return;
			}

			if ( bRegex === undefined || bRegex === null )
			{
				bRegex = false;
			}

			if ( bSmart === undefined || bSmart === null )
			{
				bSmart = true;
			}

			if ( bShowGlobal === undefined || bShowGlobal === null )
			{
				bShowGlobal = true;
			}

			if ( bCaseInsensitive === undefined || bCaseInsensitive === null )
			{
				bCaseInsensitive = true;
			}

			if ( iColumn === undefined || iColumn === null )
			{
				/* Global filter */
				_fnFilterComplete( oSettings, {
					"sSearch":sInput+"",
					"bRegex": bRegex,
					"bSmart": bSmart,
					"bCaseInsensitive": bCaseInsensitive
				}, 1 );

				if ( bShowGlobal && oSettings.aanFeatures.f )
				{
					var n = oSettings.aanFeatures.f;
					for ( var i=0, iLen=n.length ; i<iLen ; i++ )
					{
						$('input', n[i]).val( sInput );
					}
				}
			}
			else
			{
				/* Single column filter */
				$.extend( oSettings.aoPreSearchCols[ iColumn ], {
					"sSearch": sInput+"",
					"bRegex": bRegex,
					"bSmart": bSmart,
					"bCaseInsensitive": bCaseInsensitive
				} );
				_fnFilterComplete( oSettings, oSettings.oPreviousSearch, 1 );
			}
		};


		/**
		 * Get the data for the whole table, an individual row or an individual cell based on the
		 * provided parameters.
		 *  @param {int|node} [mRow] A TR row node, TD/TH cell node or an integer. If given as
		 *    a TR node then the data source for the whole row will be returned. If given as a
		 *    TD/TH cell node then iCol will be automatically calculated and the data for the
		 *    cell returned. If given as an integer, then this is treated as the aoData internal
		 *    data index for the row (see fnGetPosition) and the data for that row used.
		 *  @param {int} [iCol] Optional column index that you want the data of.
		 *  @returns {array|object|string} If mRow is undefined, then the data for all rows is
		 *    returned. If mRow is defined, just data for that row, and is iCol is
		 *    defined, only data for the designated cell is returned.
		 *  @dtopt API
		 *
		 *  @example
		 *    // Row data
		 *    $(document).ready(function() {
		 *      oTable = $('#example').dataTable();
		 *
		 *      oTable.$('tr').click( function () {
		 *        var data = oTable.fnGetData( this );
		 *        // ... do something with the array / object of data for the row
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Individual cell data
		 *    $(document).ready(function() {
		 *      oTable = $('#example').dataTable();
		 *
		 *      oTable.$('td').click( function () {
		 *        var sData = oTable.fnGetData( this );
		 *        alert( 'The cell clicked on had the value of '+sData );
		 *      } );
		 *    } );
		 */
		this.fnGetData = function( mRow, iCol )
		{
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );

			if ( mRow !== undefined )
			{
				var iRow = mRow;
				if ( typeof mRow === 'object' )
				{
					var sNode = mRow.nodeName.toLowerCase();
					if (sNode === "tr" )
					{
						iRow = _fnNodeToDataIndex(oSettings, mRow);
					}
					else if ( sNode === "td" )
					{
						iRow = _fnNodeToDataIndex(oSettings, mRow.parentNode);
						iCol = _fnNodeToColumnIndex( oSettings, iRow, mRow );
					}
				}

				if ( iCol !== undefined )
				{
					return _fnGetCellData( oSettings, iRow, iCol, '' );
				}
				return (oSettings.aoData[iRow]!==undefined) ?
						oSettings.aoData[iRow]._aData : null;
			}
			return _fnGetDataMaster( oSettings );
		};


		/**
		 * Get an array of the TR nodes that are used in the table's body. Note that you will
		 * typically want to use the '$' API method in preference to this as it is more
		 * flexible.
		 *  @param {int} [iRow] Optional row index for the TR element you want
		 *  @returns {array|node} If iRow is undefined, returns an array of all TR elements
		 *    in the table's body, or iRow is defined, just the TR element requested.
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Get the nodes from the table
		 *      var nNodes = oTable.fnGetNodes( );
		 *    } );
		 */
		this.fnGetNodes = function( iRow )
		{
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );

			if ( iRow !== undefined ) {
				return (oSettings.aoData[iRow]!==undefined) ?
						oSettings.aoData[iRow].nTr : null;
			}
			return _fnGetTrNodes( oSettings );
		};


		/**
		 * Get the array indexes of a particular cell from it's DOM element
		 * and column index including hidden columns
		 *  @param {node} nNode this can either be a TR, TD or TH in the table's body
		 *  @returns {int} If nNode is given as a TR, then a single index is returned, or
		 *    if given as a cell, an array of [row index, column index (visible)] is given.
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      $('#example tbody td').click( function () {
		 *        // Get the position of the current data from the node
		 *        var aPos = oTable.fnGetPosition( this );
		 *
		 *        // Get the data array for this row
		 *        var aData = oTable.fnGetData( aPos[0] );
		 *
		 *        // Update the data array and return the value
		 *        aData[ aPos[1] ] = 'clicked';
		 *        this.innerHTML = 'clicked';
		 *      } );
		 *
		 *      // Init DataTables
		 *      oTable = $('#example').dataTable();
		 *    } );
		 */
		this.fnGetPosition = function( nNode )
		{
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );
			var sNodeName = nNode.nodeName.toUpperCase();

			if ( sNodeName == "TR" )
			{
				return _fnNodeToDataIndex(oSettings, nNode);
			}
			else if ( sNodeName == "TD" || sNodeName == "TH" )
			{
				var iDataIndex = _fnNodeToDataIndex( oSettings, nNode.parentNode );
				var iColumnIndex = _fnNodeToColumnIndex( oSettings, iDataIndex, nNode );
				return [ iDataIndex, _fnColumnIndexToVisible(oSettings, iColumnIndex ), iColumnIndex ];
			}
			return null;
		};


		/**
		 * Check to see if a row is 'open' or not.
		 *  @param {node} nTr the table row to check
		 *  @returns {boolean} true if the row is currently open, false otherwise
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable;
		 *
		 *      // 'open' an information row when a row is clicked on
		 *      $('#example tbody tr').click( function () {
		 *        if ( oTable.fnIsOpen(this) ) {
		 *          oTable.fnClose( this );
		 *        } else {
		 *          oTable.fnOpen( this, "Temporary row opened", "info_row" );
		 *        }
		 *      } );
		 *
		 *      oTable = $('#example').dataTable();
		 *    } );
		 */
		this.fnIsOpen = function( nTr )
		{
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );
			var aoOpenRows = oSettings.aoOpenRows;

			for ( var i=0 ; i<oSettings.aoOpenRows.length ; i++ )
			{
				if ( oSettings.aoOpenRows[i].nParent == nTr )
				{
					return true;
				}
			}
			return false;
		};


		/**
		 * This function will place a new row directly after a row which is currently
		 * on display on the page, with the HTML contents that is passed into the
		 * function. This can be used, for example, to ask for confirmation that a
		 * particular record should be deleted.
		 *  @param {node} nTr The table row to 'open'
		 *  @param {string|node|jQuery} mHtml The HTML to put into the row
		 *  @param {string} sClass Class to give the new TD cell
		 *  @returns {node} The row opened. Note that if the table row passed in as the
		 *    first parameter, is not found in the table, this method will silently
		 *    return.
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable;
		 *
		 *      // 'open' an information row when a row is clicked on
		 *      $('#example tbody tr').click( function () {
		 *        if ( oTable.fnIsOpen(this) ) {
		 *          oTable.fnClose( this );
		 *        } else {
		 *          oTable.fnOpen( this, "Temporary row opened", "info_row" );
		 *        }
		 *      } );
		 *
		 *      oTable = $('#example').dataTable();
		 *    } );
		 */
		this.fnOpen = function( nTr, mHtml, sClass )
		{
			/* Find settings from table node */
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );

			/* Check that the row given is in the table */
			var nTableRows = _fnGetTrNodes( oSettings );
			if ( $.inArray(nTr, nTableRows) === -1 )
			{
				return;
			}

			/* the old open one if there is one */
			this.fnClose( nTr );

			var nNewRow = document.createElement("tr");
			var nNewCell = document.createElement("td");
			nNewRow.appendChild( nNewCell );
			nNewCell.className = sClass;
			nNewCell.colSpan = _fnVisbleColumns( oSettings );

			if (typeof mHtml === "string")
			{
				nNewCell.innerHTML = mHtml;
			}
			else
			{
				$(nNewCell).html( mHtml );
			}

			/* If the nTr isn't on the page at the moment - then we don't insert at the moment */
			var nTrs = $('tr', oSettings.nTBody);
			if ( $.inArray(nTr, nTrs) != -1  )
			{
				$(nNewRow).insertAfter(nTr);
			}

			oSettings.aoOpenRows.push( {
				"nTr": nNewRow,
				"nParent": nTr
			} );

			return nNewRow;
		};


		/**
		 * Change the pagination - provides the internal logic for pagination in a simple API
		 * function. With this function you can have a DataTables table go to the next,
		 * previous, first or last pages.
		 *  @param {string|int} mAction Paging action to take: "first", "previous", "next" or "last"
		 *    or page number to jump to (integer), note that page 0 is the first page.
		 *  @param {bool} [bRedraw=true] Redraw the table or not
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *      oTable.fnPageChange( 'next' );
		 *    } );
		 */
		this.fnPageChange = function ( mAction, bRedraw )
		{
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );
			_fnPageChange( oSettings, mAction );
			_fnCalculateEnd( oSettings );

			if ( bRedraw === undefined || bRedraw )
			{
				_fnDraw( oSettings );
			}
		};


		/**
		 * Show a particular column
		 *  @param {int} iCol The column whose display should be changed
		 *  @param {bool} bShow Show (true) or hide (false) the column
		 *  @param {bool} [bRedraw=true] Redraw the table or not
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Hide the second column after initialisation
		 *      oTable.fnSetColumnVis( 1, false );
		 *    } );
		 */
		this.fnSetColumnVis = function ( iCol, bShow, bRedraw )
		{
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );
			var i, iLen;
			var aoColumns = oSettings.aoColumns;
			var aoData = oSettings.aoData;
			var nTd, nCell, anTrs, jqChildren, bAppend, iBefore;

			/* No point in doing anything if we are requesting what is already true */
			if ( aoColumns[iCol].bVisible == bShow )
			{
				return;
			}

			/* Show the column */
			if ( bShow )
			{
				var iInsert = 0;
				for ( i=0 ; i<iCol ; i++ )
				{
					if ( aoColumns[i].bVisible )
					{
						iInsert++;
					}
				}

				/* Need to decide if we should use appendChild or insertBefore */
				bAppend = (iInsert >= _fnVisbleColumns( oSettings ));

				/* Which coloumn should we be inserting before? */
				if ( !bAppend )
				{
					for ( i=iCol ; i<aoColumns.length ; i++ )
					{
						if ( aoColumns[i].bVisible )
						{
							iBefore = i;
							break;
						}
					}
				}

				for ( i=0, iLen=aoData.length ; i<iLen ; i++ )
				{
					if ( aoData[i].nTr !== null )
					{
						if ( bAppend )
						{
							aoData[i].nTr.appendChild(
									aoData[i]._anHidden[iCol]
							);
						}
						else
						{
							aoData[i].nTr.insertBefore(
									aoData[i]._anHidden[iCol],
									_fnGetTdNodes( oSettings, i )[iBefore] );
						}
					}
				}
			}
			else
			{
				/* Remove a column from display */
				for ( i=0, iLen=aoData.length ; i<iLen ; i++ )
				{
					if ( aoData[i].nTr !== null )
					{
						nTd = _fnGetTdNodes( oSettings, i )[iCol];
						aoData[i]._anHidden[iCol] = nTd;
						nTd.parentNode.removeChild( nTd );
					}
				}
			}

			/* Clear to set the visible flag */
			aoColumns[iCol].bVisible = bShow;

			/* Redraw the header and footer based on the new column visibility */
			_fnDrawHead( oSettings, oSettings.aoHeader );
			if ( oSettings.nTFoot )
			{
				_fnDrawHead( oSettings, oSettings.aoFooter );
			}

			/* If there are any 'open' rows, then we need to alter the colspan for this col change */
			for ( i=0, iLen=oSettings.aoOpenRows.length ; i<iLen ; i++ )
			{
				oSettings.aoOpenRows[i].nTr.colSpan = _fnVisbleColumns( oSettings );
			}

			/* Do a redraw incase anything depending on the table columns needs it
			 * (built-in: scrolling)
			 */
			if ( bRedraw === undefined || bRedraw )
			{
				_fnAdjustColumnSizing( oSettings );
				_fnDraw( oSettings );
			}

			_fnSaveState( oSettings );
		};


		/**
		 * Get the settings for a particular table for external manipulation
		 *  @returns {object} DataTables settings object. See
		 *    {@link DataTable.models.oSettings}
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *      var oSettings = oTable.fnSettings();
		 *
		 *      // Show an example parameter from the settings
		 *      alert( oSettings._iDisplayStart );
		 *    } );
		 */
		this.fnSettings = function()
		{
			return _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );
		};


		/**
		 * Sort the table by a particular row
		 *  @param {int} iCol the data index to sort on. Note that this will not match the
		 *    'display index' if you have hidden data entries
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Sort immediately with columns 0 and 1
		 *      oTable.fnSort( [ [0,'asc'], [1,'asc'] ] );
		 *    } );
		 */
		this.fnSort = function( aaSort )
		{
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );
			oSettings.aaSorting = aaSort;
			_fnSort( oSettings );
		};


		/**
		 * Attach a sort listener to an element for a given column
		 *  @param {node} nNode the element to attach the sort listener to
		 *  @param {int} iColumn the column that a click on this node will sort on
		 *  @param {function} [fnCallback] callback function when sort is run
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Sort on column 1, when 'sorter' is clicked on
		 *      oTable.fnSortListener( document.getElementById('sorter'), 1 );
		 *    } );
		 */
		this.fnSortListener = function( nNode, iColumn, fnCallback )
		{
			_fnSortAttachListener( _fnSettingsFromNode( this[DataTable.ext.iApiIndex] ), nNode, iColumn,
					fnCallback );
		};


		/**
		 * Update a table cell or row - this method will accept either a single value to
		 * update the cell with, an array of values with one element for each column or
		 * an object in the same format as the original data source. The function is
		 * self-referencing in order to make the multi column updates easier.
		 *  @param {object|array|string} mData Data to update the cell/row with
		 *  @param {node|int} mRow TR element you want to update or the aoData index
		 *  @param {int} [iColumn] The column to update (not used of mData is an array or object)
		 *  @param {bool} [bRedraw=true] Redraw the table or not
		 *  @param {bool} [bAction=true] Perform predraw actions or not
		 *  @returns {int} 0 on success, 1 on error
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *      oTable.fnUpdate( 'Example update', 0, 0 ); // Single cell
		 *      oTable.fnUpdate( ['a', 'b', 'c', 'd', 'e'], 1, 0 ); // Row
		 *    } );
		 */
		this.fnUpdate = function( mData, mRow, iColumn, bRedraw, bAction )
		{
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );
			var iVisibleColumn, i, iLen, sDisplay;
			var iRow = (typeof mRow === 'object') ?
					_fnNodeToDataIndex(oSettings, mRow) : mRow;

			if ( oSettings.__fnUpdateDeep === undefined && $.isArray(mData) && typeof mData === 'object' )
			{
				/* Array update - update the whole row */
				oSettings.aoData[iRow]._aData = mData.slice();

				/* Flag to the function that we are recursing */
				oSettings.__fnUpdateDeep = true;
				for ( i=0 ; i<oSettings.aoColumns.length ; i++ )
				{
					this.fnUpdate( _fnGetCellData( oSettings, iRow, i ), iRow, i, false, false );
				}
				oSettings.__fnUpdateDeep = undefined;
			}
			else if ( oSettings.__fnUpdateDeep === undefined && mData !== null && typeof mData === 'object' )
			{
				/* Object update - update the whole row - assume the developer gets the object right */
				oSettings.aoData[iRow]._aData = $.extend( true, {}, mData );

				oSettings.__fnUpdateDeep = true;
				for ( i=0 ; i<oSettings.aoColumns.length ; i++ )
				{
					this.fnUpdate( _fnGetCellData( oSettings, iRow, i ), iRow, i, false, false );
				}
				oSettings.__fnUpdateDeep = undefined;
			}
			else
			{
				/* Individual cell update */
				_fnSetCellData( oSettings, iRow, iColumn, mData );
				sDisplay = _fnGetCellData( oSettings, iRow, iColumn, 'display' );

				var oCol = oSettings.aoColumns[iColumn];
				if ( oCol.fnRender !== null )
				{
					sDisplay = _fnRender( oSettings, iRow, iColumn );
					if ( oCol.bUseRendered )
					{
						_fnSetCellData( oSettings, iRow, iColumn, sDisplay );
					}
				}

				if ( oSettings.aoData[iRow].nTr !== null )
				{
					/* Do the actual HTML update */
					_fnGetTdNodes( oSettings, iRow )[iColumn].innerHTML = sDisplay;
				}
			}

			/* Modify the search index for this row (strictly this is likely not needed, since fnReDraw
			 * will rebuild the search array - however, the redraw might be disabled by the user)
			 */
			var iDisplayIndex = $.inArray( iRow, oSettings.aiDisplay );
			oSettings.asDataSearch[iDisplayIndex] = _fnBuildSearchRow( oSettings,
					_fnGetRowData( oSettings, iRow, 'filter' ) );

			/* Perform pre-draw actions */
			if ( bAction === undefined || bAction )
			{
				_fnAdjustColumnSizing( oSettings );
			}

			/* Redraw the table */
			if ( bRedraw === undefined || bRedraw )
			{
				_fnReDraw( oSettings );
			}
			return 0;
		};


		/**
		 * Provide a common method for plug-ins to check the version of DataTables being used, in order
		 * to ensure compatibility.
		 *  @param {string} sVersion Version string to check for, in the format "X.Y.Z". Note that the
		 *    formats "X" and "X.Y" are also acceptable.
		 *  @returns {boolean} true if this version of DataTables is greater or equal to the required
		 *    version, or false if this version of DataTales is not suitable
		 *  @method
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *      alert( oTable.fnVersionCheck( '1.9.0' ) );
		 *    } );
		 */
		this.fnVersionCheck = DataTable.ext.fnVersionCheck;


		/*
		 * This is really a good bit rubbish this method of exposing the internal methods
		 * publically... - To be fixed in 2.0 using methods on the prototype
		 */


		/**
		 * Create a wrapper function for exporting an internal functions to an external API.
		 *  @param {string} sFunc API function name
		 *  @returns {function} wrapped function
		 *  @memberof DataTable#oApi
		 */
		function _fnExternApiFunc (sFunc)
		{
			return function() {
				var aArgs = [_fnSettingsFromNode(this[DataTable.ext.iApiIndex])].concat(
						Array.prototype.slice.call(arguments) );
				return DataTable.ext.oApi[sFunc].apply( this, aArgs );
			};
		}


		/**
		 * Reference to internal functions for use by plug-in developers. Note that these
		 * methods are references to internal functions and are considered to be private.
		 * If you use these methods, be aware that they are liable to change between versions
		 * (check the upgrade notes).
		 *  @namespace
		 */
		this.oApi = {
			"_fnExternApiFunc": _fnExternApiFunc,
			"_fnInitialise": _fnInitialise,
			"_fnInitComplete": _fnInitComplete,
			"_fnLanguageCompat": _fnLanguageCompat,
			"_fnAddColumn": _fnAddColumn,
			"_fnColumnOptions": _fnColumnOptions,
			"_fnAddData": _fnAddData,
			"_fnCreateTr": _fnCreateTr,
			"_fnGatherData": _fnGatherData,
			"_fnBuildHead": _fnBuildHead,
			"_fnDrawHead": _fnDrawHead,
			"_fnDraw": _fnDraw,
			"_fnReDraw": _fnReDraw,
			"_fnAjaxUpdate": _fnAjaxUpdate,
			"_fnAjaxParameters": _fnAjaxParameters,
			"_fnAjaxUpdateDraw": _fnAjaxUpdateDraw,
			"_fnServerParams": _fnServerParams,
			"_fnAddOptionsHtml": _fnAddOptionsHtml,
			"_fnFeatureHtmlTable": _fnFeatureHtmlTable,
			"_fnScrollDraw": _fnScrollDraw,
			"_fnAdjustColumnSizing": _fnAdjustColumnSizing,
			"_fnFeatureHtmlFilter": _fnFeatureHtmlFilter,
			"_fnFilterComplete": _fnFilterComplete,
			"_fnFilterCustom": _fnFilterCustom,
			"_fnFilterColumn": _fnFilterColumn,
			"_fnFilter": _fnFilter,
			"_fnBuildSearchArray": _fnBuildSearchArray,
			"_fnBuildSearchRow": _fnBuildSearchRow,
			"_fnFilterCreateSearch": _fnFilterCreateSearch,
			"_fnDataToSearch": _fnDataToSearch,
			"_fnSort": _fnSort,
			"_fnSortAttachListener": _fnSortAttachListener,
			"_fnSortingClasses": _fnSortingClasses,
			"_fnFeatureHtmlPaginate": _fnFeatureHtmlPaginate,
			"_fnPageChange": _fnPageChange,
			"_fnFeatureHtmlInfo": _fnFeatureHtmlInfo,
			"_fnUpdateInfo": _fnUpdateInfo,
			"_fnFeatureHtmlLength": _fnFeatureHtmlLength,
			"_fnFeatureHtmlProcessing": _fnFeatureHtmlProcessing,
			"_fnProcessingDisplay": _fnProcessingDisplay,
			"_fnVisibleToColumnIndex": _fnVisibleToColumnIndex,
			"_fnColumnIndexToVisible": _fnColumnIndexToVisible,
			"_fnNodeToDataIndex": _fnNodeToDataIndex,
			"_fnVisbleColumns": _fnVisbleColumns,
			"_fnCalculateEnd": _fnCalculateEnd,
			"_fnConvertToWidth": _fnConvertToWidth,
			"_fnCalculateColumnWidths": _fnCalculateColumnWidths,
			"_fnScrollingWidthAdjust": _fnScrollingWidthAdjust,
			"_fnGetWidestNode": _fnGetWidestNode,
			"_fnGetMaxLenString": _fnGetMaxLenString,
			"_fnStringToCss": _fnStringToCss,
			"_fnDetectType": _fnDetectType,
			"_fnSettingsFromNode": _fnSettingsFromNode,
			"_fnGetDataMaster": _fnGetDataMaster,
			"_fnGetTrNodes": _fnGetTrNodes,
			"_fnGetTdNodes": _fnGetTdNodes,
			"_fnEscapeRegex": _fnEscapeRegex,
			"_fnDeleteIndex": _fnDeleteIndex,
			"_fnReOrderIndex": _fnReOrderIndex,
			"_fnColumnOrdering": _fnColumnOrdering,
			"_fnLog": _fnLog,
			"_fnClearTable": _fnClearTable,
			"_fnSaveState": _fnSaveState,
			"_fnLoadState": _fnLoadState,
			"_fnCreateCookie": _fnCreateCookie,
			"_fnReadCookie": _fnReadCookie,
			"_fnDetectHeader": _fnDetectHeader,
			"_fnGetUniqueThs": _fnGetUniqueThs,
			"_fnScrollBarWidth": _fnScrollBarWidth,
			"_fnApplyToChildren": _fnApplyToChildren,
			"_fnMap": _fnMap,
			"_fnGetRowData": _fnGetRowData,
			"_fnGetCellData": _fnGetCellData,
			"_fnSetCellData": _fnSetCellData,
			"_fnGetObjectDataFn": _fnGetObjectDataFn,
			"_fnSetObjectDataFn": _fnSetObjectDataFn,
			"_fnApplyColumnDefs": _fnApplyColumnDefs,
			"_fnBindAction": _fnBindAction,
			"_fnExtend": _fnExtend,
			"_fnCallbackReg": _fnCallbackReg,
			"_fnCallbackFire": _fnCallbackFire,
			"_fnJsonString": _fnJsonString,
			"_fnRender": _fnRender,
			"_fnNodeToColumnIndex": _fnNodeToColumnIndex
		};

		$.extend( DataTable.ext.oApi, this.oApi );

		for ( var sFunc in DataTable.ext.oApi )
		{
			if ( sFunc )
			{
				this[sFunc] = _fnExternApiFunc(sFunc);
			}
		}


		var _that = this;
		return this.each(function() {

			var i=0, iLen, j, jLen, k, kLen;
			var sId = this.getAttribute( 'id' );
			var bInitHandedOff = false;
			var bUsePassedData = false;


			/* Sanity check */
			if ( this.nodeName.toLowerCase() != 'table' )
			{
				_fnLog( null, 0, "Attempted to initialise DataTables on a node which is not a "+
						"table: "+this.nodeName );
				return;
			}

			/* Check to see if we are re-initialising a table */
			for ( i=0, iLen=DataTable.settings.length ; i<iLen ; i++ )
			{
				/* Base check on table node */
				if ( DataTable.settings[i].nTable == this )
				{
					if ( oInit === undefined || oInit.bRetrieve )
					{
						return DataTable.settings[i].oInstance;
					}
					else if ( oInit.bDestroy )
					{
						DataTable.settings[i].oInstance.fnDestroy();
						break;
					}
					else
					{
						_fnLog( DataTable.settings[i], 0, "Cannot reinitialise DataTable.\n\n"+
								"To retrieve the DataTables object for this table, pass no arguments or see "+
								"the docs for bRetrieve and bDestroy" );
						return;
					}
				}

				/* If the element we are initialising has the same ID as a table which was previously
				 * initialised, but the table nodes don't match (from before) then we destroy the old
				 * instance by simply deleting it. This is under the assumption that the table has been
				 * destroyed by other methods. Anyone using non-id selectors will need to do this manually
				 */
				if ( DataTable.settings[i].sTableId == this.id )
				{
					DataTable.settings.splice( i, 1 );
					break;
				}
			}

			/* Ensure the table has an ID - required for accessibility */
			if ( sId === null )
			{
				sId = "DataTables_Table_"+(DataTable.ext._oExternConfig.iNextUnique++);
				this.id = sId;
			}

			/* Create the settings object for this table and set some of the default parameters */
			var oSettings = $.extend( true, {}, DataTable.models.oSettings, {
				"nTable":        this,
				"oApi":          _that.oApi,
				"oInit":         oInit,
				"sDestroyWidth": $(this).width(),
				"sInstance":     sId,
				"sTableId":      sId
			} );
			DataTable.settings.push( oSettings );

			// Need to add the instance after the instance after the settings object has been added
			// to the settings array, so we can self reference the table instance if more than one
			oSettings.oInstance = (_that.length===1) ? _that : $(this).dataTable();

			/* Setting up the initialisation object */
			if ( !oInit )
			{
				oInit = {};
			}

			// Backwards compatibility, before we apply all the defaults
			if ( oInit.oLanguage )
			{
				_fnLanguageCompat( oInit.oLanguage );
			}

			oInit = _fnExtend( $.extend(true, {}, DataTable.defaults), oInit );

			// Map the initialisation options onto the settings object
			_fnMap( oSettings.oFeatures, oInit, "bPaginate" );
			_fnMap( oSettings.oFeatures, oInit, "bLengthChange" );
			_fnMap( oSettings.oFeatures, oInit, "bFilter" );
			_fnMap( oSettings.oFeatures, oInit, "bSort" );
			_fnMap( oSettings.oFeatures, oInit, "bInfo" );
			_fnMap( oSettings.oFeatures, oInit, "bProcessing" );
			_fnMap( oSettings.oFeatures, oInit, "bAutoWidth" );
			_fnMap( oSettings.oFeatures, oInit, "bSortClasses" );
			_fnMap( oSettings.oFeatures, oInit, "bServerSide" );
			_fnMap( oSettings.oFeatures, oInit, "bDeferRender" );
			_fnMap( oSettings.oScroll, oInit, "sScrollX", "sX" );
			_fnMap( oSettings.oScroll, oInit, "sScrollXInner", "sXInner" );
			_fnMap( oSettings.oScroll, oInit, "sScrollY", "sY" );
			_fnMap( oSettings.oScroll, oInit, "bScrollCollapse", "bCollapse" );
			_fnMap( oSettings.oScroll, oInit, "bScrollInfinite", "bInfinite" );
			_fnMap( oSettings.oScroll, oInit, "iScrollLoadGap", "iLoadGap" );
			_fnMap( oSettings.oScroll, oInit, "bScrollAutoCss", "bAutoCss" );
			_fnMap( oSettings, oInit, "asStripClasses", "asStripeClasses" ); // legacy
			_fnMap( oSettings, oInit, "asStripeClasses" );
			_fnMap( oSettings, oInit, "fnServerData" );
			_fnMap( oSettings, oInit, "fnFormatNumber" );
			_fnMap( oSettings, oInit, "sServerMethod" );
			_fnMap( oSettings, oInit, "aaSorting" );
			_fnMap( oSettings, oInit, "aaSortingFixed" );
			_fnMap( oSettings, oInit, "aLengthMenu" );
			_fnMap( oSettings, oInit, "sPaginationType" );
			_fnMap( oSettings, oInit, "sAjaxSource" );
			_fnMap( oSettings, oInit, "sAjaxDataProp" );
			_fnMap( oSettings, oInit, "iCookieDuration" );
			_fnMap( oSettings, oInit, "sCookiePrefix" );
			_fnMap( oSettings, oInit, "sDom" );
			_fnMap( oSettings, oInit, "bSortCellsTop" );
			_fnMap( oSettings, oInit, "iTabIndex" );
			_fnMap( oSettings, oInit, "oSearch", "oPreviousSearch" );
			_fnMap( oSettings, oInit, "aoSearchCols", "aoPreSearchCols" );
			_fnMap( oSettings, oInit, "iDisplayLength", "_iDisplayLength" );
			_fnMap( oSettings, oInit, "bJQueryUI", "bJUI" );
			_fnMap( oSettings, oInit, "fnCookieCallback" );
			_fnMap( oSettings, oInit, "fnStateLoad" );
			_fnMap( oSettings, oInit, "fnStateSave" );
			_fnMap( oSettings.oLanguage, oInit, "fnInfoCallback" );

			/* Callback functions which are array driven */
			_fnCallbackReg( oSettings, 'aoDrawCallback',       oInit.fnDrawCallback,      'user' );
			_fnCallbackReg( oSettings, 'aoServerParams',       oInit.fnServerParams,      'user' );
			_fnCallbackReg( oSettings, 'aoStateSaveParams',    oInit.fnStateSaveParams,   'user' );
			_fnCallbackReg( oSettings, 'aoStateLoadParams',    oInit.fnStateLoadParams,   'user' );
			_fnCallbackReg( oSettings, 'aoStateLoaded',        oInit.fnStateLoaded,       'user' );
			_fnCallbackReg( oSettings, 'aoRowCallback',        oInit.fnRowCallback,       'user' );
			_fnCallbackReg( oSettings, 'aoRowCreatedCallback', oInit.fnCreatedRow,        'user' );
			_fnCallbackReg( oSettings, 'aoHeaderCallback',     oInit.fnHeaderCallback,    'user' );
			_fnCallbackReg( oSettings, 'aoFooterCallback',     oInit.fnFooterCallback,    'user' );
			_fnCallbackReg( oSettings, 'aoInitComplete',       oInit.fnInitComplete,      'user' );
			_fnCallbackReg( oSettings, 'aoPreDrawCallback',    oInit.fnPreDrawCallback,   'user' );

			if ( oSettings.oFeatures.bServerSide && oSettings.oFeatures.bSort &&
					oSettings.oFeatures.bSortClasses )
			{
				/* Enable sort classes for server-side processing. Safe to do it here, since server-side
				 * processing must be enabled by the developer
				 */
				_fnCallbackReg( oSettings, 'aoDrawCallback', _fnSortingClasses, 'server_side_sort_classes' );
			}
			else if ( oSettings.oFeatures.bDeferRender )
			{
				_fnCallbackReg( oSettings, 'aoDrawCallback', _fnSortingClasses, 'defer_sort_classes' );
			}

			if ( oInit.bJQueryUI )
			{
				/* Use the JUI classes object for display. You could clone the oStdClasses object if
				 * you want to have multiple tables with multiple independent classes
				 */
				$.extend( oSettings.oClasses, DataTable.ext.oJUIClasses );

				if ( oInit.sDom === DataTable.defaults.sDom && DataTable.defaults.sDom === "lfrtip" )
				{
					/* Set the DOM to use a layout suitable for jQuery UI's theming */
					oSettings.sDom = '<"H"lfr>t<"F"ip>';
				}
			}
			else
			{
				$.extend( oSettings.oClasses, DataTable.ext.oStdClasses );
			}
			$(this).addClass( oSettings.oClasses.sTable );

			/* Calculate the scroll bar width and cache it for use later on */
			if ( oSettings.oScroll.sX !== "" || oSettings.oScroll.sY !== "" )
			{
				oSettings.oScroll.iBarWidth = _fnScrollBarWidth();
			}

			if ( oSettings.iInitDisplayStart === undefined )
			{
				/* Display start point, taking into account the save saving */
				oSettings.iInitDisplayStart = oInit.iDisplayStart;
				oSettings._iDisplayStart = oInit.iDisplayStart;
			}

			/* Must be done after everything which can be overridden by a cookie! */
			if ( oInit.bStateSave )
			{
				oSettings.oFeatures.bStateSave = true;
				_fnLoadState( oSettings, oInit );
				_fnCallbackReg( oSettings, 'aoDrawCallback', _fnSaveState, 'state_save' );
			}

			if ( oInit.iDeferLoading !== null )
			{
				oSettings.bDeferLoading = true;
				oSettings._iRecordsTotal = oInit.iDeferLoading;
				oSettings._iRecordsDisplay = oInit.iDeferLoading;
			}

			if ( oInit.aaData !== null )
			{
				bUsePassedData = true;
			}

			/* Language definitions */
			if ( oInit.oLanguage.sUrl !== "" )
			{
				/* Get the language definitions from a file - because this Ajax call makes the language
				 * get async to the remainder of this function we use bInitHandedOff to indicate that
				 * _fnInitialise will be fired by the returned Ajax handler, rather than the constructor
				 */
				oSettings.oLanguage.sUrl = oInit.oLanguage.sUrl;
				$.getJSON( oSettings.oLanguage.sUrl, null, function( json ) {
					_fnLanguageCompat( json );
					$.extend( true, oSettings.oLanguage, oInit.oLanguage, json );
					_fnInitialise( oSettings );
				} );
				bInitHandedOff = true;
			}
			else
			{
				$.extend( true, oSettings.oLanguage, oInit.oLanguage );
			}


			/*
			 * Stripes
			 */

			/* Remove row stripe classes if they are already on the table row */
			var bStripeRemove = false;
			var anRows = $(this).children('tbody').children('tr');
			for ( i=0, iLen=oSettings.asStripeClasses.length ; i<iLen ; i++ )
			{
				if ( anRows.filter(":lt(2)").hasClass( oSettings.asStripeClasses[i]) )
				{
					bStripeRemove = true;
					break;
				}
			}

			if ( bStripeRemove )
			{
				/* Store the classes which we are about to remove so they can be readded on destroy */
				oSettings.asDestroyStripes = [ '', '' ];
				if ( $(anRows[0]).hasClass(oSettings.oClasses.sStripeOdd) )
				{
					oSettings.asDestroyStripes[0] += oSettings.oClasses.sStripeOdd+" ";
				}
				if ( $(anRows[0]).hasClass(oSettings.oClasses.sStripeEven) )
				{
					oSettings.asDestroyStripes[0] += oSettings.oClasses.sStripeEven;
				}
				if ( $(anRows[1]).hasClass(oSettings.oClasses.sStripeOdd) )
				{
					oSettings.asDestroyStripes[1] += oSettings.oClasses.sStripeOdd+" ";
				}
				if ( $(anRows[1]).hasClass(oSettings.oClasses.sStripeEven) )
				{
					oSettings.asDestroyStripes[1] += oSettings.oClasses.sStripeEven;
				}

				anRows.removeClass( oSettings.asStripeClasses.join(' ') );
			}


			/*
			 * Columns
			 * See if we should load columns automatically or use defined ones
			 */
			var anThs = [];
			var aoColumnsInit;
			var nThead = this.getElementsByTagName('thead');
			if ( nThead.length !== 0 )
			{
				_fnDetectHeader( oSettings.aoHeader, nThead[0] );
				anThs = _fnGetUniqueThs( oSettings );
			}

			/* If not given a column array, generate one with nulls */
			if ( oInit.aoColumns === null )
			{
				aoColumnsInit = [];
				for ( i=0, iLen=anThs.length ; i<iLen ; i++ )
				{
					aoColumnsInit.push( null );
				}
			}
			else
			{
				aoColumnsInit = oInit.aoColumns;
			}

			/* Add the columns */
			for ( i=0, iLen=aoColumnsInit.length ; i<iLen ; i++ )
			{
				/* Short cut - use the loop to check if we have column visibility state to restore */
				if ( oInit.saved_aoColumns !== undefined && oInit.saved_aoColumns.length == iLen )
				{
					if ( aoColumnsInit[i] === null )
					{
						aoColumnsInit[i] = {};
					}
					aoColumnsInit[i].bVisible = oInit.saved_aoColumns[i].bVisible;
				}

				_fnAddColumn( oSettings, anThs ? anThs[i] : null );
			}

			/* Apply the column definitions */
			_fnApplyColumnDefs( oSettings, oInit.aoColumnDefs, aoColumnsInit, function (iCol, oDef) {
				_fnColumnOptions( oSettings, iCol, oDef );
			} );


			/*
			 * Sorting
			 * Check the aaSorting array
			 */
			for ( i=0, iLen=oSettings.aaSorting.length ; i<iLen ; i++ )
			{
				if ( oSettings.aaSorting[i][0] >= oSettings.aoColumns.length )
				{
					oSettings.aaSorting[i][0] = 0;
				}
				var oColumn = oSettings.aoColumns[ oSettings.aaSorting[i][0] ];

				/* Add a default sorting index */
				if ( oSettings.aaSorting[i][2] === undefined )
				{
					oSettings.aaSorting[i][2] = 0;
				}

				/* If aaSorting is not defined, then we use the first indicator in asSorting */
				if ( oInit.aaSorting === undefined && oSettings.saved_aaSorting === undefined )
				{
					oSettings.aaSorting[i][1] = oColumn.asSorting[0];
				}

				/* Set the current sorting index based on aoColumns.asSorting */
				for ( j=0, jLen=oColumn.asSorting.length ; j<jLen ; j++ )
				{
					if ( oSettings.aaSorting[i][1] == oColumn.asSorting[j] )
					{
						oSettings.aaSorting[i][2] = j;
						break;
					}
				}
			}

			/* Do a first pass on the sorting classes (allows any size changes to be taken into
			 * account, and also will apply sorting disabled classes if disabled
			 */
			_fnSortingClasses( oSettings );


			/*
			 * Final init
			 * Cache the header, body and footer as required, creating them if needed
			 */
			var thead = $(this).children('thead');
			if ( thead.length === 0 )
			{
				thead = [ document.createElement( 'thead' ) ];
				this.appendChild( thead[0] );
			}
			oSettings.nTHead = thead[0];

			var tbody = $(this).children('tbody');
			if ( tbody.length === 0 )
			{
				tbody = [ document.createElement( 'tbody' ) ];
				this.appendChild( tbody[0] );
			}
			oSettings.nTBody = tbody[0];
			oSettings.nTBody.setAttribute( "role", "alert" );
			oSettings.nTBody.setAttribute( "aria-live", "polite" );
			oSettings.nTBody.setAttribute( "aria-relevant", "all" );

			var tfoot = $(this).children('tfoot');
			if ( tfoot.length > 0 )
			{
				oSettings.nTFoot = tfoot[0];
				_fnDetectHeader( oSettings.aoFooter, oSettings.nTFoot );
			}

			/* Check if there is data passing into the constructor */
			if ( bUsePassedData )
			{
				for ( i=0 ; i<oInit.aaData.length ; i++ )
				{
					_fnAddData( oSettings, oInit.aaData[ i ] );
				}
			}
			else
			{
				/* Grab the data from the page */
				_fnGatherData( oSettings );
			}

			/* Copy the data index array */
			oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();

			/* Initialisation complete - table can be drawn */
			oSettings.bInitialised = true;

			/* Check if we need to initialise the table (it might not have been handed off to the
			 * language processor)
			 */
			if ( bInitHandedOff === false )
			{
				_fnInitialise( oSettings );
			}
		} );
	};

	/**
	 * Version string for plug-ins to check compatibility. Allowed format is
	 * a.b.c.d.e where: a:int, b:int, c:int, d:string(dev|beta), e:int. d and
	 * e are optional
	 *  @member
	 *  @type string
	 *  @default Version number
	 */
	DataTable.version = "1.9.0";

	/**
	 * Private data store, containing all of the settings objects that are created for the
	 * tables on a given page.
	 *
	 * Note that the <i>DataTable.settings</i> object is aliased to <i>jQuery.fn.dataTableExt</i>
	 * through which it may be accessed and manipulated, or <i>jQuery.fn.dataTable.settings</i>.
	 *  @member
	 *  @type array
	 *  @default []
	 *  @private
	 */
	DataTable.settings = [];

	/**
	 * Object models container, for the various models that DataTables has available
	 * to it. These models define the objects that are used to hold the active state
	 * and configuration of the table.
	 *  @namespace
	 */
	DataTable.models = {};


	/**
	 * DataTables extension options and plug-ins. This namespace acts as a collection "area"
	 * for plug-ins that can be used to extend the default DataTables behaviour - indeed many
	 * of the build in methods use this method to provide their own capabilities (sorting methods
	 * for example).
	 *
	 * Note that this namespace is aliased to jQuery.fn.dataTableExt so it can be readily accessed
	 * and modified by plug-ins.
	 *  @namespace
	 */
	DataTable.models.ext = {
		/**
		 * Plug-in filtering functions - this method of filtering is complimentary to the default
		 * type based filtering, and a lot more comprehensive as it allows you complete control
		 * over the filtering logic. Each element in this array is a function (parameters
		 * described below) that is called for every row in the table, and your logic decides if
		 * it should be included in the filtered data set or not.
		 *   <ul>
		 *     <li>
		 *       Function input parameters:
		 *       <ul>
		 *         <li>{object} DataTables settings object: see {@link DataTable.models.oSettings}.</li>
		 *         <li>{array|object} Data for the row to be processed (same as the original format
		 *           that was passed in as the data source, or an array from a DOM data source</li>
		 *         <li>{int} Row index in aoData ({@link DataTable.models.oSettings.aoData}), which can
		 *           be useful to retrieve the TR element if you need DOM interaction.</li>
		 *       </ul>
		 *     </li>
		 *     <li>
		 *       Function return:
		 *       <ul>
		 *         <li>{boolean} Include the row in the filtered result set (true) or not (false)</li>
		 *       </ul>
		 *     </il>
		 *   </ul>
		 *  @type array
		 *  @default []
		 *
		 *  @example
		 *    // The following example shows custom filtering being applied to the fourth column (i.e.
		 *    // the aData[3] index) based on two input values from the end-user, matching the data in
		 *    // a certain range.
		 *    $.fn.dataTableExt.afnFiltering.push(
		 *      function( oSettings, aData, iDataIndex ) {
		 *        var iMin = document.getElementById('min').value * 1;
		 *        var iMax = document.getElementById('max').value * 1;
		 *        var iVersion = aData[3] == "-" ? 0 : aData[3]*1;
		 *        if ( iMin == "" && iMax == "" ) {
		 *          return true;
		 *        }
		 *        else if ( iMin == "" && iVersion < iMax ) {
		 *          return true;
		 *        }
		 *        else if ( iMin < iVersion && "" == iMax ) {
		 *          return true;
		 *        }
		 *        else if ( iMin < iVersion && iVersion < iMax ) {
		 *          return true;
		 *        }
		 *        return false;
		 *      }
		 *    );
		 */
		"afnFiltering": [],


		/**
		 * Plug-in sorting functions - this method of sorting is complimentary to the default type
		 * based sorting that DataTables does automatically, allowing much greater control over the
		 * the data that is being used to sort a column. This is useful if you want to do sorting
		 * based on live data (for example the contents of an 'input' element) rather than just the
		 * static string that DataTables knows of. The way these plug-ins work is that you create
		 * an array of the values you wish to be sorted for the column in question and then return
		 * that array. Which pre-sorting function is run here depends on the sSortDataType parameter
		 * that is used for the column (if any). This is the corollary of <i>ofnSearch</i> for sort
		 * data.
		 *   <ul>
		 *     <li>
		 *       Function input parameters:
		 *       <ul>
		 *         <li>{object} DataTables settings object: see {@link DataTable.models.oSettings}.</li>
		 *         <li>{int} Target column index</li>
		 *       </ul>
		 *     </li>
		 *     <li>
		 *       Function return:
		 *       <ul>
		 *         <li>{array} Data for the column to be sorted upon</li>
		 *       </ul>
		 *     </il>
		 *   </ul>
		 *
		 * Note that as of v1.9, it is typically preferable to use <i>mDataProp</i> to prepare data for
		 * the different uses that DataTables can put the data to. Specifically <i>mDataProp</i> when
		 * used as a function will give you a 'type' (sorting, filtering etc) that you can use to
		 * prepare the data as required for the different types. As such, this method is deprecated.
		 *  @type array
		 *  @default []
		 *  @deprecated
		 *
		 *  @example
		 *    // Updating the cached sorting information with user entered values in HTML input elements
		 *    jQuery.fn.dataTableExt.afnSortData['dom-text'] = function ( oSettings, iColumn )
		 *    {
		 *      var aData = [];
		 *      $( 'td:eq('+iColumn+') input', oSettings.oApi._fnGetTrNodes(oSettings) ).each( function () {
		 *        aData.push( this.value );
		 *      } );
		 *      return aData;
		 *    }
		 */
		"afnSortData": [],


		/**
		 * Feature plug-ins - This is an array of objects which describe the feature plug-ins that are
		 * available to DataTables. These feature plug-ins are accessible through the sDom initialisation
		 * option. As such, each feature plug-in must describe a function that is used to initialise
		 * itself (fnInit), a character so the feature can be enabled by sDom (cFeature) and the name
		 * of the feature (sFeature). Thus the objects attached to this method must provide:
		 *   <ul>
		 *     <li>{function} fnInit Initialisation of the plug-in
		 *       <ul>
		 *         <li>
		 *           Function input parameters:
		 *           <ul>
		 *             <li>{object} DataTables settings object: see {@link DataTable.models.oSettings}.</li>
		 *           </ul>
		 *         </li>
		 *         <li>
		 *           Function return:
		 *           <ul>
		 *             <li>{node|null} The element which contains your feature. Note that the return
		 *                may also be void if your plug-in does not require to inject any DOM elements
		 *                into DataTables control (sDom) - for example this might be useful when
		 *                developing a plug-in which allows table control via keyboard entry.</li>
		 *           </ul>
		 *         </il>
		 *       </ul>
		 *     </li>
		 *     <li>{character} cFeature Character that will be matched in sDom - case sensitive</li>
		 *     <li>{string} sFeature Feature name</li>
		 *   </ul>
		 *  @type array
		 *  @default []
		 *
		 *  @example
		 *    // How TableTools initialises itself.
		 *    $.fn.dataTableExt.aoFeatures.push( {
		 *      "fnInit": function( oSettings ) {
		 *        return new TableTools( { "oDTSettings": oSettings } );
		 *      },
		 *      "cFeature": "T",
		 *      "sFeature": "TableTools"
		 *    } );
		 */
		"aoFeatures": [],


		/**
		 * Type detection plug-in functions - DataTables utilises types to define how sorting and
		 * filtering behave, and types can be either  be defined by the developer (sType for the
		 * column) or they can be automatically detected by the methods in this array. The functions
		 * defined in the array are quite simple, taking a single parameter (the data to analyse)
		 * and returning the type if it is a known type, or null otherwise.
		 *   <ul>
		 *     <li>
		 *       Function input parameters:
		 *       <ul>
		 *         <li>{*} Data from the column cell to be analysed</li>
		 *       </ul>
		 *     </li>
		 *     <li>
		 *       Function return:
		 *       <ul>
		 *         <li>{string|null} Data type detected, or null if unknown (and thus pass it
		 *           on to the other type detection functions.</li>
		 *       </ul>
		 *     </il>
		 *   </ul>
		 *  @type array
		 *  @default []
		 *
		 *  @example
		 *    // Currency type detection plug-in:
		 *    jQuery.fn.dataTableExt.aTypes.push(
		 *      function ( sData ) {
		 *        var sValidChars = "0123456789.-";
		 *        var Char;
		 *
		 *        // Check the numeric part
		 *        for ( i=1 ; i<sData.length ; i++ ) {
		 *          Char = sData.charAt(i);
		 *          if (sValidChars.indexOf(Char) == -1) {
		 *            return null;
		 *          }
		 *        }
		 *
		 *        // Check prefixed by currency
		 *        if ( sData.charAt(0) == '$' || sData.charAt(0) == '&pound;' ) {
		 *          return 'currency';
		 *        }
		 *        return null;
		 *      }
		 *    );
		 */
		"aTypes": [],


		/**
		 * Provide a common method for plug-ins to check the version of DataTables being used,
		 * in order to ensure compatibility.
		 *  @type function
		 *  @param {string} sVersion Version string to check for, in the format "X.Y.Z". Note
		 *    that the formats "X" and "X.Y" are also acceptable.
		 *  @returns {boolean} true if this version of DataTables is greater or equal to the
		 *    required version, or false if this version of DataTales is not suitable
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *      alert( oTable.fnVersionCheck( '1.9.0' ) );
		 *    } );
		 */
		"fnVersionCheck": function( sVersion )
		{
			/* This is cheap, but very effective */
			var fnZPad = function (Zpad, count)
			{
				while(Zpad.length < count) {
					Zpad += '0';
				}
				return Zpad;
			};
			var aThis = DataTable.ext.sVersion.split('.');
			var aThat = sVersion.split('.');
			var sThis = '', sThat = '';

			for ( var i=0, iLen=aThat.length ; i<iLen ; i++ )
			{
				sThis += fnZPad( aThis[i], 3 );
				sThat += fnZPad( aThat[i], 3 );
			}

			return parseInt(sThis, 10) >= parseInt(sThat, 10);
		},


		/**
		 * Index for what 'this' index API functions should use
		 *  @type int
		 *  @default 0
		 */
		"iApiIndex": 0,


		/**
		 * Pre-processing of filtering data plug-ins - When you assign the sType for a column
		 * (or have it automatically detected for you by DataTables or a type detection plug-in),
		 * you will typically be using this for custom sorting, but it can also be used to provide
		 * custom filtering by allowing you to pre-processing the data and returning the data in
		 * the format that should be filtered upon. This is done by adding functions this object
		 * with a parameter name which matches the sType for that target column. This is the
		 * corollary of <i>afnSortData</i> for filtering data.
		 *   <ul>
		 *     <li>
		 *       Function input parameters:
		 *       <ul>
		 *         <li>{*} Data from the column cell to be prepared for filtering</li>
		 *       </ul>
		 *     </li>
		 *     <li>
		 *       Function return:
		 *       <ul>
		 *         <li>{string|null} Formatted string that will be used for the filtering.</li>
		 *       </ul>
		 *     </il>
		 *   </ul>
		 *
		 * Note that as of v1.9, it is typically preferable to use <i>mDataProp</i> to prepare data for
		 * the different uses that DataTables can put the data to. Specifically <i>mDataProp</i> when
		 * used as a function will give you a 'type' (sorting, filtering etc) that you can use to
		 * prepare the data as required for the different types. As such, this method is deprecated.
		 *  @type object
		 *  @default {}
		 *  @deprecated
		 *
		 *  @example
		 *    $.fn.dataTableExt.ofnSearch['title-numeric'] = function ( sData ) {
		 *      return sData.replace(/\n/g," ").replace( /<.*?>/g, "" );
		 *    }
		 */
		"ofnSearch": {},


		/**
		 * Container for all private functions in DataTables so they can be exposed externally
		 *  @type object
		 *  @default {}
		 */
		"oApi": {},


		/**
		 * Storage for the various classes that DataTables uses
		 *  @type object
		 *  @default {}
		 */
		"oStdClasses": {},


		/**
		 * Storage for the various classes that DataTables uses - jQuery UI suitable
		 *  @type object
		 *  @default {}
		 */
		"oJUIClasses": {},


		/**
		 * Pagination plug-in methods - The style and controls of the pagination can significantly
		 * impact on how the end user interacts with the data in your table, and DataTables allows
		 * the addition of pagination controls by extending this object, which can then be enabled
		 * through the <i>sPaginationType</i> initialisation parameter. Each pagination type that
		 * is added is an object (the property name of which is what <i>sPaginationType</i> refers
		 * to) that has two properties, both methods that are used by DataTables to update the
		 * control's state.
		 *   <ul>
		 *     <li>
		 *       fnInit -  Initialisation of the paging controls. Called only during initialisation
		 *         of the table. It is expected that this function will add the required DOM elements
		 *         to the page for the paging controls to work. The element pointer
		 *         'oSettings.aanFeatures.p' array is provided by DataTables to contain the paging
		 *         controls (note that this is a 2D array to allow for multiple instances of each
		 *         DataTables DOM element). It is suggested that you add the controls to this element
		 *         as children
		 *       <ul>
		 *         <li>
		 *           Function input parameters:
		 *           <ul>
		 *             <li>{object} DataTables settings object: see {@link DataTable.models.oSettings}.</li>
		 *             <li>{node} Container into which the pagination controls must be inserted</li>
		 *             <li>{function} Draw callback function - whenever the controls cause a page
		 *               change, this method must be called to redraw the table.</li>
		 *           </ul>
		 *         </li>
		 *         <li>
		 *           Function return:
		 *           <ul>
		 *             <li>No return required</li>
		 *           </ul>
		 *         </il>
		 *       </ul>
		 *     </il>
		 *     <li>
		 *       fnInit -  This function is called whenever the paging status of the table changes and is
		 *         typically used to update classes and/or text of the paging controls to reflex the new
		 *         status.
		 *       <ul>
		 *         <li>
		 *           Function input parameters:
		 *           <ul>
		 *             <li>{object} DataTables settings object: see {@link DataTable.models.oSettings}.</li>
		 *             <li>{function} Draw callback function - in case you need to redraw the table again
		 *               or attach new event listeners</li>
		 *           </ul>
		 *         </li>
		 *         <li>
		 *           Function return:
		 *           <ul>
		 *             <li>No return required</li>
		 *           </ul>
		 *         </il>
		 *       </ul>
		 *     </il>
		 *   </ul>
		 *  @type object
		 *  @default {}
		 *
		 *  @example
		 *    $.fn.dataTableExt.oPagination.four_button = {
		 *      "fnInit": function ( oSettings, nPaging, fnCallbackDraw ) {
		 *        nFirst = document.createElement( 'span' );
		 *        nPrevious = document.createElement( 'span' );
		 *        nNext = document.createElement( 'span' );
		 *        nLast = document.createElement( 'span' );
		 *
		 *        nFirst.appendChild( document.createTextNode( oSettings.oLanguage.oPaginate.sFirst ) );
		 *        nPrevious.appendChild( document.createTextNode( oSettings.oLanguage.oPaginate.sPrevious ) );
		 *        nNext.appendChild( document.createTextNode( oSettings.oLanguage.oPaginate.sNext ) );
		 *        nLast.appendChild( document.createTextNode( oSettings.oLanguage.oPaginate.sLast ) );
		 *
		 *        nFirst.className = "paginate_button first";
		 *        nPrevious.className = "paginate_button previous";
		 *        nNext.className="paginate_button next";
		 *        nLast.className = "paginate_button last";
		 *
		 *        nPaging.appendChild( nFirst );
		 *        nPaging.appendChild( nPrevious );
		 *        nPaging.appendChild( nNext );
		 *        nPaging.appendChild( nLast );
		 *
		 *        $(nFirst).click( function () {
		 *          oSettings.oApi._fnPageChange( oSettings, "first" );
		 *          fnCallbackDraw( oSettings );
		 *        } );
		 *
		 *        $(nPrevious).click( function() {
		 *          oSettings.oApi._fnPageChange( oSettings, "previous" );
		 *          fnCallbackDraw( oSettings );
		 *        } );
		 *
		 *        $(nNext).click( function() {
		 *          oSettings.oApi._fnPageChange( oSettings, "next" );
		 *          fnCallbackDraw( oSettings );
		 *        } );
		 *
		 *        $(nLast).click( function() {
		 *          oSettings.oApi._fnPageChange( oSettings, "last" );
		 *          fnCallbackDraw( oSettings );
		 *        } );
		 *
		 *        $(nFirst).bind( 'selectstart', function () { return false; } );
		 *        $(nPrevious).bind( 'selectstart', function () { return false; } );
		 *        $(nNext).bind( 'selectstart', function () { return false; } );
		 *        $(nLast).bind( 'selectstart', function () { return false; } );
		 *      },
		 *
		 *      "fnUpdate": function ( oSettings, fnCallbackDraw ) {
		 *        if ( !oSettings.aanFeatures.p ) {
		 *          return;
		 *        }
		 *
		 *        // Loop over each instance of the pager
		 *        var an = oSettings.aanFeatures.p;
		 *        for ( var i=0, iLen=an.length ; i<iLen ; i++ ) {
		 *          var buttons = an[i].getElementsByTagName('span');
		 *          if ( oSettings._iDisplayStart === 0 ) {
		 *            buttons[0].className = "paginate_disabled_previous";
		 *            buttons[1].className = "paginate_disabled_previous";
		 *          }
		 *          else {
		 *            buttons[0].className = "paginate_enabled_previous";
		 *            buttons[1].className = "paginate_enabled_previous";
		 *          }
		 *
		 *          if ( oSettings.fnDisplayEnd() == oSettings.fnRecordsDisplay() ) {
		 *            buttons[2].className = "paginate_disabled_next";
		 *            buttons[3].className = "paginate_disabled_next";
		 *          }
		 *          else {
		 *            buttons[2].className = "paginate_enabled_next";
		 *            buttons[3].className = "paginate_enabled_next";
		 *          }
		 *        }
		 *      }
		 *    };
		 */
		"oPagination": {},


		/**
		 * Sorting plug-in methods - Sorting in DataTables is based on the detected type of the
		 * data column (you can add your own type detection functions, or override automatic
		 * detection using sType). With this specific type given to the column, DataTables will
		 * apply the required sort from the functions in the object. Each sort type must provide
		 * two mandatory methods, one each for ascending and descending sorting, and can optionally
		 * provide a pre-formatting method that will help speed up sorting by allowing DataTables
		 * to pre-format the sort data only once (rather than every time the actual sort functions
		 * are run). The two sorting functions are typical Javascript sort methods:
		 *   <ul>
		 *     <li>
		 *       Function input parameters:
		 *       <ul>
		 *         <li>{*} Data to compare to the second parameter</li>
		 *         <li>{*} Data to compare to the first parameter</li>
		 *       </ul>
		 *     </li>
		 *     <li>
		 *       Function return:
		 *       <ul>
		 *         <li>{int} Sorting match: <0 if first parameter should be sorted lower than
		 *           the second parameter, ===0 if the two parameters are equal and >0 if
		 *           the first parameter should be sorted height than the second parameter.</li>
		 *       </ul>
		 *     </il>
		 *   </ul>
		 *  @type object
		 *  @default {}
		 *
		 *  @example
		 *    // Case-sensitive string sorting, with no pre-formatting method
		 *    $.extend( $.fn.dataTableExt.oSort, {
		 *      "string-case-asc": function(x,y) {
		 *        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		 *      },
		 *      "string-case-desc": function(x,y) {
		 *        return ((x < y) ? 1 : ((x > y) ? -1 : 0));
		 *      }
		 *    } );
		 *
		 *  @example
		 *    // Case-insensitive string sorting, with pre-formatting
		 *    $.extend( $.fn.dataTableExt.oSort, {
		 *      "string-pre": function(x) {
		 *        return x.toLowerCase();
		 *      },
		 *      "string-asc": function(x,y) {
		 *        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		 *      },
		 *      "string-desc": function(x,y) {
		 *        return ((x < y) ? 1 : ((x > y) ? -1 : 0));
		 *      }
		 *    } );
		 */
		"oSort": {},


		/**
		 * Version string for plug-ins to check compatibility. Allowed format is
		 * a.b.c.d.e where: a:int, b:int, c:int, d:string(dev|beta), e:int. d and
		 * e are optional
		 *  @type string
		 *  @default Version number
		 */
		"sVersion": DataTable.version,


		/**
		 * How should DataTables report an error. Can take the value 'alert' or 'throw'
		 *  @type string
		 *  @default alert
		 */
		"sErrMode": "alert",


		/**
		 * Store information for DataTables to access globally about other instances
		 *  @namespace
		 *  @private
		 */
		"_oExternConfig": {
			/* int:iNextUnique - next unique number for an instance */
			"iNextUnique": 0
		}
	};




	/**
	 * Template object for the way in which DataTables holds information about
	 * search information for the global filter and individual column filters.
	 *  @namespace
	 */
	DataTable.models.oSearch = {
		/**
		 * Flag to indicate if the filtering should be case insensitive or not
		 *  @type boolean
		 *  @default true
		 */
		"bCaseInsensitive": true,

		/**
		 * Applied search term
		 *  @type string
		 *  @default <i>Empty string</i>
		 */
		"sSearch": "",

		/**
		 * Flag to indicate if the search term should be interpreted as a
		 * regular expression (true) or not (false) and therefore and special
		 * regex characters escaped.
		 *  @type boolean
		 *  @default false
		 */
		"bRegex": false,

		/**
		 * Flag to indicate if DataTables is to use its smart filtering or not.
		 *  @type boolean
		 *  @default true
		 */
		"bSmart": true
	};




	/**
	 * Template object for the way in which DataTables holds information about
	 * each individual row. This is the object format used for the settings
	 * aoData array.
	 *  @namespace
	 */
	DataTable.models.oRow = {
		/**
		 * TR element for the row
		 *  @type node
		 *  @default null
		 */
		"nTr": null,

		/**
		 * Data object from the original data source for the row. This is either
		 * an array if using the traditional form of DataTables, or an object if
		 * using mDataProp options. The exact type will depend on the passed in
		 * data from the data source, or will be an array if using DOM a data
		 * source.
		 *  @type array|object
		 *  @default []
		 */
		"_aData": [],

		/**
		 * Sorting data cache - this array is ostensibly the same length as the
		 * number of columns (although each index is generated only as it is
		 * needed), and holds the data that is used for sorting each column in the
		 * row. We do this cache generation at the start of the sort in order that
		 * the formatting of the sort data need be done only once for each cell
		 * per sort. This array should not be read from or written to by anything
		 * other than the master sorting methods.
		 *  @type array
		 *  @default []
		 *  @private
		 */
		"_aSortData": [],

		/**
		 * Array of TD elements that are cached for hidden rows, so they can be
		 * reinserted into the table if a column is made visible again (or to act
		 * as a store if a column is made hidden). Only hidden columns have a
		 * reference in the array. For non-hidden columns the value is either
		 * undefined or null.
		 *  @type array nodes
		 *  @default []
		 *  @private
		 */
		"_anHidden": [],

		/**
		 * Cache of the class name that DataTables has applied to the row, so we
		 * can quickly look at this variable rather than needing to do a DOM check
		 * on className for the nTr property.
		 *  @type string
		 *  @default <i>Empty string</i>
		 *  @private
		 */
		"_sRowStripe": ""
	};



	/**
	 * Template object for the column information object in DataTables. This object
	 * is held in the settings aoColumns array and contains all the information that
	 * DataTables needs about each individual column.
	 *
	 * Note that this object is related to {@link DataTable.defaults.columns}
	 * but this one is the internal data store for DataTables's cache of columns.
	 * It should NOT be manipulated outside of DataTables. Any configuration should
	 * be done through the initialisation options.
	 *  @namespace
	 */
	DataTable.models.oColumn = {
		/**
		 * A list of the columns that sorting should occur on when this column
		 * is sorted. That this property is an array allows multi-column sorting
		 * to be defined for a column (for example first name / last name columns
		 * would benefit from this). The values are integers pointing to the
		 * columns to be sorted on (typically it will be a single integer pointing
		 * at itself, but that doesn't need to be the case).
		 *  @type array
		 */
		"aDataSort": null,

		/**
		 * Define the sorting directions that are applied to the column, in sequence
		 * as the column is repeatedly sorted upon - i.e. the first value is used
		 * as the sorting direction when the column if first sorted (clicked on).
		 * Sort it again (click again) and it will move on to the next index.
		 * Repeat until loop.
		 *  @type array
		 */
		"asSorting": null,

		/**
		 * Flag to indicate if the column is searchable, and thus should be included
		 * in the filtering or not.
		 *  @type boolean
		 */
		"bSearchable": null,

		/**
		 * Flag to indicate if the column is sortable or not.
		 *  @type boolean
		 */
		"bSortable": null,

		/**
		 * When using fnRender, you have two options for what to do with the data,
		 * and this property serves as the switch. Firstly, you can have the sorting
		 * and filtering use the rendered value (true - default), or you can have
		 * the sorting and filtering us the original value (false).
		 *
		 * *NOTE* It is it is advisable now to use mDataProp as a function and make
		 * use of the 'type' that it gives, allowing (potentially) different data to
		 * be used for sorting, filtering, display and type detection.
		 *  @type boolean
		 *  @deprecated
		 */
		"bUseRendered": null,

		/**
		 * Flag to indicate if the column is currently visible in the table or not
		 *  @type boolean
		 */
		"bVisible": null,

		/**
		 * Flag to indicate to the type detection method if the automatic type
		 * detection should be used, or if a column type (sType) has been specified
		 *  @type boolean
		 *  @default true
		 *  @private
		 */
		"_bAutoType": true,

		/**
		 * Developer definable function that is called whenever a cell is created (Ajax source,
		 * etc) or processed for input (DOM source). This can be used as a compliment to fnRender
		 * allowing you to modify the DOM element (add background colour for example) when the
		 * element is available (since it is not when fnRender is called).
		 *  @type function
		 *  @param {element} nTd The TD node that has been created
		 *  @param {*} sData The Data for the cell
		 *  @param {array|object} oData The data for the whole row
		 *  @param {int} iRow The row index for the aoData data store
		 *  @default null
		 */
		"fnCreatedCell": null,

		/**
		 * Function to get data from a cell in a column. You should <b>never</b>
		 * access data directly through _aData internally in DataTables - always use
		 * the method attached to this property. It allows mDataProp to function as
		 * required. This function is automatically assigned by the column
		 * initialisation method
		 *  @type function
		 *  @param {array|object} oData The data array/object for the array
		 *    (i.e. aoData[]._aData)
		 *  @param {string} sSpecific The specific data type you want to get -
		 *    'display', 'type' 'filter' 'sort'
		 *  @returns {*} The data for the cell from the given row's data
		 *  @default null
		 */
		"fnGetData": null,

		/**
		 * Custom display function that will be called for the display of each cell
		 * in this column.
		 *  @type function
		 *  @param {object} o Object with the following parameters:
		 *  @param {int}    o.iDataRow The row in aoData
		 *  @param {int}    o.iDataColumn The column in question
		 *  @param {array   o.aData The data for the row in question
				*  @param {object} o.oSettings The settings object for this DataTables instance
		 *  @returns {string} The string you which to use in the display
		 *  @default null
		 */
		"fnRender": null,

		/**
		 * Function to set data for a cell in the column. You should <b>never</b>
		 * set the data directly to _aData internally in DataTables - always use
		 * this method. It allows mDataProp to function as required. This function
		 * is automatically assigned by the column initialisation method
		 *  @type function
		 *  @param {array|object} oData The data array/object for the array
		 *    (i.e. aoData[]._aData)
		 *  @param {*} sValue Value to set
		 *  @default null
		 */
		"fnSetData": null,

		/**
		 * Property to read the value for the cells in the column from the data
		 * source array / object. If null, then the default content is used, if a
		 * function is given then the return from the function is used.
		 *  @type function|int|string|null
		 *  @default null
		 */
		"mDataProp": null,

		/**
		 * Unique header TH/TD element for this column - this is what the sorting
		 * listener is attached to (if sorting is enabled.)
		 *  @type node
		 *  @default null
		 */
		"nTh": null,

		/**
		 * Unique footer TH/TD element for this column (if there is one). Not used
		 * in DataTables as such, but can be used for plug-ins to reference the
		 * footer for each column.
		 *  @type node
		 *  @default null
		 */
		"nTf": null,

		/**
		 * The class to apply to all TD elements in the table's TBODY for the column
		 *  @type string
		 *  @default null
		 */
		"sClass": null,

		/**
		 * When DataTables calculates the column widths to assign to each column,
		 * it finds the longest string in each column and then constructs a
		 * temporary table and reads the widths from that. The problem with this
		 * is that "mmm" is much wider then "iiii", but the latter is a longer
		 * string - thus the calculation can go wrong (doing it properly and putting
		 * it into an DOM object and measuring that is horribly(!) slow). Thus as
		 * a "work around" we provide this option. It will append its value to the
		 * text that is found to be the longest string for the column - i.e. padding.
		 *  @type string
		 */
		"sContentPadding": null,

		/**
		 * Allows a default value to be given for a column's data, and will be used
		 * whenever a null data source is encountered (this can be because mDataProp
		 * is set to null, or because the data source itself is null).
		 *  @type string
		 *  @default null
		 */
		"sDefaultContent": null,

		/**
		 * Name for the column, allowing reference to the column by name as well as
		 * by index (needs a lookup to work by name).
		 *  @type string
		 */
		"sName": null,

		/**
		 * Custom sorting data type - defines which of the available plug-ins in
		 * afnSortData the custom sorting will use - if any is defined.
		 *  @type string
		 *  @default std
		 */
		"sSortDataType": 'std',

		/**
		 * Class to be applied to the header element when sorting on this column
		 *  @type string
		 *  @default null
		 */
		"sSortingClass": null,

		/**
		 * Class to be applied to the header element when sorting on this column -
		 * when jQuery UI theming is used.
		 *  @type string
		 *  @default null
		 */
		"sSortingClassJUI": null,

		/**
		 * Title of the column - what is seen in the TH element (nTh).
		 *  @type string
		 */
		"sTitle": null,

		/**
		 * Column sorting and filtering type
		 *  @type string
		 *  @default null
		 */
		"sType": null,

		/**
		 * Width of the column
		 *  @type string
		 *  @default null
		 */
		"sWidth": null,

		/**
		 * Width of the column when it was first "encountered"
		 *  @type string
		 *  @default null
		 */
		"sWidthOrig": null
	};



	/**
	 * Initialisation options that can be given to DataTables at initialisation
	 * time.
	 *  @namespace
	 */
	DataTable.defaults = {
		/**
		 * An array of data to use for the table, passed in at initialisation which
		 * will be used in preference to any data which is already in the DOM. This is
		 * particularly useful for constructing tables purely in Javascript, for
		 * example with a custom Ajax call.
		 *  @type array
		 *  @default null
		 *  @dtopt Option
		 *
		 *  @example
		 *    // Using a 2D array data source
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "aaData": [
		 *          ['Trident', 'Internet Explorer 4.0', 'Win 95+', 4, 'X'],
		 *          ['Trident', 'Internet Explorer 5.0', 'Win 95+', 5, 'C'],
		 *        ],
		 *        "aoColumns": [
		 *          { "sTitle": "Engine" },
		 *          { "sTitle": "Browser" },
		 *          { "sTitle": "Platform" },
		 *          { "sTitle": "Version" },
		 *          { "sTitle": "Grade" }
		 *        ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Using an array of objects as a data source (mDataProp)
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "aaData": [
		 *          {
		 *            "engine":   "Trident",
		 *            "browser":  "Internet Explorer 4.0",
		 *            "platform": "Win 95+",
		 *            "version":  4,
		 *            "grade":    "X"
		 *          },
		 *          {
		 *            "engine":   "Trident",
		 *            "browser":  "Internet Explorer 5.0",
		 *            "platform": "Win 95+",
		 *            "version":  5,
		 *            "grade":    "C"
		 *          }
		 *        ],
		 *        "aoColumns": [
		 *          { "sTitle": "Engine",   "mDataProp": "engine" },
		 *          { "sTitle": "Browser",  "mDataProp": "browser" },
		 *          { "sTitle": "Platform", "mDataProp": "platform" },
		 *          { "sTitle": "Version",  "mDataProp": "version" },
		 *          { "sTitle": "Grade",    "mDataProp": "grade" }
		 *        ]
		 *      } );
		 *    } );
		 */
		"aaData": null,


		/**
		 * If sorting is enabled, then DataTables will perform a first pass sort on
		 * initialisation. You can define which column(s) the sort is performed upon,
		 * and the sorting direction, with this variable. The aaSorting array should
		 * contain an array for each column to be sorted initially containing the
		 * column's index and a direction string ('asc' or 'desc').
		 *  @type array
		 *  @default [[0,'asc']]
		 *  @dtopt Option
		 *
		 *  @example
		 *    // Sort by 3rd column first, and then 4th column
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aaSorting": [[2,'asc'], [3,'desc']]
		 *      } );
		 *    } );
		 *
		 *    // No initial sorting
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aaSorting": []
		 *      } );
		 *    } );
		 */
		"aaSorting": [[0,'asc']],


		/**
		 * This parameter is basically identical to the aaSorting parameter, but
		 * cannot be overridden by user interaction with the table. What this means
		 * is that you could have a column (visible or hidden) which the sorting will
		 * always be forced on first - any sorting after that (from the user) will
		 * then be performed as required. This can be useful for grouping rows
		 * together.
		 *  @type array
		 *  @default null
		 *  @dtopt Option
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aaSortingFixed": [[0,'asc']]
		 *      } );
		 *    } )
		 */
		"aaSortingFixed": null,


		/**
		 * This parameter allows you to readily specify the entries in the length drop
		 * down menu that DataTables shows when pagination is enabled. It can be
		 * either a 1D array of options which will be used for both the displayed
		 * option and the value, or a 2D array which will use the array in the first
		 * position as the value, and the array in the second position as the
		 * displayed options (useful for language strings such as 'All').
		 *  @type array
		 *  @default [ 10, 25, 50, 100 ]
		 *  @dtopt Option
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aLengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Setting the default display length as well as length menu
		 *    // This is likely to be wanted if you remove the '10' option which
		 *    // is the iDisplayLength default.
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "iDisplayLength": 25,
		 *        "aLengthMenu": [[25, 50, 100, -1], [25, 50, 100, "All"]]
		 *      } );
		 *    } );
		 */
		"aLengthMenu": [ 10, 25, 50, 100 ],


		/**
		 * The aoColumns option in the initialisation parameter allows you to define
		 * details about the way individual columns behave. For a full list of
		 * column options that can be set, please see
		 * {@link DataTable.defaults.columns}. Note that if you use aoColumns to
		 * define your columns, you must have an entry in the array for every single
		 * column that you have in your table (these can be null if you don't which
		 * to specify any options).
		 *  @member
		 */
		"aoColumns": null,

		/**
		 * Very similar to aoColumns, aoColumnDefs allows you to target a specific
		 * column, multiple columns, or all columns, using the aTargets property of
		 * each object in the array. This allows great flexibility when creating
		 * tables, as the aoColumnDefs arrays can be of any length, targeting the
		 * columns you specifically want. aoColumnDefs may use any of the column
		 * options available: {@link DataTable.defaults.columns}, but it _must_
		 * have aTargets defined in each object in the array. Values in the aTargets
		 * array may be:
		 *   <ul>
		 *     <li>a string - class name will be matched on the TH for the column</li>
		 *     <li>0 or a positive integer - column index counting from the left</li>
		 *     <li>a negative integer - column index counting from the right</li>
		 *     <li>the string "_all" - all columns (i.e. assign a default)</li>
		 *   </ul>
		 *  @member
		 */
		"aoColumnDefs": null,


		/**
		 * Basically the same as oSearch, this parameter defines the individual column
		 * filtering state at initialisation time. The array must be of the same size
		 * as the number of columns, and each element be an object with the parameters
		 * "sSearch" and "bEscapeRegex" (the latter is optional). 'null' is also
		 * accepted and the default will be used.
		 *  @type array
		 *  @default []
		 *  @dtopt Option
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aoSearchCols": [
		 *          null,
		 *          { "sSearch": "My filter" },
		 *          null,
		 *          { "sSearch": "^[0-9]", "bEscapeRegex": false }
		 *        ]
		 *      } );
		 *    } )
		 */
		"aoSearchCols": [],


		/**
		 * An array of CSS classes that should be applied to displayed rows. This
		 * array may be of any length, and DataTables will apply each class
		 * sequentially, looping when required.
		 *  @type array
		 *  @default [ 'odd', 'even' ]
		 *  @dtopt Option
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "asStripeClasses": [ 'strip1', 'strip2', 'strip3' ]
		 *      } );
		 *    } )
		 */
		"asStripeClasses": [ 'odd', 'even' ],


		/**
		 * Enable or disable automatic column width calculation. This can be disabled
		 * as an optimisation (it takes some time to calculate the widths) if the
		 * tables widths are passed in using aoColumns.
		 *  @type boolean
		 *  @default true
		 *  @dtopt Features
		 *
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "bAutoWidth": false
		 *      } );
		 *    } );
		 */
		"bAutoWidth": true,


		/**
		 * Deferred rendering can provide DataTables with a huge speed boost when you
		 * are using an Ajax or JS data source for the table. This option, when set to
		 * true, will cause DataTables to defer the creation of the table elements for
		 * each row until they are needed for a draw - saving a significant amount of
		 * time.
		 *  @type boolean
		 *  @default false
		 *  @dtopt Features
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable( {
		 *        "sAjaxSource": "sources/arrays.txt",
		 *        "bDeferRender": true
		 *      } );
		 *    } );
		 */
		"bDeferRender": false,


		/**
		 * Replace a DataTable which matches the given selector and replace it with
		 * one which has the properties of the new initialisation object passed. If no
		 * table matches the selector, then the new DataTable will be constructed as
		 * per normal.
		 *  @type boolean
		 *  @default false
		 *  @dtopt Options
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "sScrollY": "200px",
		 *        "bPaginate": false
		 *      } );
		 *
		 *      // Some time later....
		 *      $('#example').dataTable( {
		 *        "bFilter": false,
		 *        "bDestroy": true
		 *      } );
		 *    } );
		 */
		"bDestroy": false,


		/**
		 * Enable or disable filtering of data. Filtering in DataTables is "smart" in
		 * that it allows the end user to input multiple words (space separated) and
		 * will match a row containing those words, even if not in the order that was
		 * specified (this allow matching across multiple columns). Note that if you
		 * wish to use filtering in DataTables this must remain 'true' - to remove the
		 * default filtering input box and retain filtering abilities, please use
		 * @ref{sDom}.
		 *  @type boolean
		 *  @default true
		 *  @dtopt Features
		 *
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "bFilter": false
		 *      } );
		 *    } );
		 */
		"bFilter": true,


		/**
		 * Enable or disable the table information display. This shows information
		 * about the data that is currently visible on the page, including information
		 * about filtered data if that action is being performed.
		 *  @type boolean
		 *  @default true
		 *  @dtopt Features
		 *
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "bInfo": false
		 *      } );
		 *    } );
		 */
		"bInfo": true,


		/**
		 * Enable jQuery UI ThemeRoller support (required as ThemeRoller requires some
		 * slightly different and additional mark-up from what DataTables has
		 * traditionally used).
		 *  @type boolean
		 *  @default false
		 *  @dtopt Features
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "bJQueryUI": true
		 *      } );
		 *    } );
		 */
		"bJQueryUI": false,


		/**
		 * Allows the end user to select the size of a formatted page from a select
		 * menu (sizes are 10, 25, 50 and 100). Requires pagination (bPaginate).
		 *  @type boolean
		 *  @default true
		 *  @dtopt Features
		 *
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "bLengthChange": false
		 *      } );
		 *    } );
		 */
		"bLengthChange": true,


		/**
		 * Enable or disable pagination.
		 *  @type boolean
		 *  @default true
		 *  @dtopt Features
		 *
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "bPaginate": false
		 *      } );
		 *    } );
		 */
		"bPaginate": true,


		/**
		 * Enable or disable the display of a 'processing' indicator when the table is
		 * being processed (e.g. a sort). This is particularly useful for tables with
		 * large amounts of data where it can take a noticeable amount of time to sort
		 * the entries.
		 *  @type boolean
		 *  @default false
		 *  @dtopt Features
		 *
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "bProcessing": true
		 *      } );
		 *    } );
		 */
		"bProcessing": false,


		/**
		 * Retrieve the DataTables object for the given selector. Note that if the
		 * table has already been initialised, this parameter will cause DataTables
		 * to simply return the object that has already been set up - it will not take
		 * account of any changes you might have made to the initialisation object
		 * passed to DataTables (setting this parameter to true is an acknowledgement
		 * that you understand this). bDestroy can be used to reinitialise a table if
		 * you need.
		 *  @type boolean
		 *  @default false
		 *  @dtopt Options
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      initTable();
		 *      tableActions();
		 *    } );
		 *
		 *    function initTable ()
		 *    {
		 *      return $('#example').dataTable( {
		 *        "sScrollY": "200px",
		 *        "bPaginate": false,
		 *        "bRetrieve": true
		 *      } );
		 *    }
		 *
		 *    function tableActions ()
		 *    {
		 *      var oTable = initTable();
		 *      // perform API operations with oTable
		 *    }
		 */
		"bRetrieve": false,


		/**
		 * Indicate if DataTables should be allowed to set the padding / margin
		 * etc for the scrolling header elements or not. Typically you will want
		 * this.
		 *  @type boolean
		 *  @default true
		 *  @dtopt Options
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "bScrollAutoCss": false,
		 *        "sScrollY": "200px"
		 *      } );
		 *    } );
		 */
		"bScrollAutoCss": true,


		/**
		 * When vertical (y) scrolling is enabled, DataTables will force the height of
		 * the table's viewport to the given height at all times (useful for layout).
		 * However, this can look odd when filtering data down to a small data set,
		 * and the footer is left "floating" further down. This parameter (when
		 * enabled) will cause DataTables to collapse the table's viewport down when
		 * the result set will fit within the given Y height.
		 *  @type boolean
		 *  @default false
		 *  @dtopt Options
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "sScrollY": "200",
		 *        "bScrollCollapse": true
		 *      } );
		 *    } );
		 */
		"bScrollCollapse": false,


		/**
		 * Enable infinite scrolling for DataTables (to be used in combination with
		 * sScrollY). Infinite scrolling means that DataTables will continually load
		 * data as a user scrolls through a table, which is very useful for large
		 * dataset. This cannot be used with pagination, which is automatically
		 * disabled. Note - the Scroller extra for DataTables is recommended in
		 * in preference to this option.
		 *  @type boolean
		 *  @default false
		 *  @dtopt Features
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "bScrollInfinite": true,
		 *        "bScrollCollapse": true,
		 *        "sScrollY": "200px"
		 *      } );
		 *    } );
		 */
		"bScrollInfinite": false,


		/**
		 * Configure DataTables to use server-side processing. Note that the
		 * sAjaxSource parameter must also be given in order to give DataTables a
		 * source to obtain the required data for each draw.
		 *  @type boolean
		 *  @default false
		 *  @dtopt Features
		 *  @dtopt Server-side
		 *
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "bServerSide": true,
		 *        "sAjaxSource": "xhr.php"
		 *      } );
		 *    } );
		 */
		"bServerSide": false,


		/**
		 * Enable or disable sorting of columns. Sorting of individual columns can be
		 * disabled by the "bSortable" option for each column.
		 *  @type boolean
		 *  @default true
		 *  @dtopt Features
		 *
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "bSort": false
		 *      } );
		 *    } );
		 */
		"bSort": true,


		/**
		 * Allows control over whether DataTables should use the top (true) unique
		 * cell that is found for a single column, or the bottom (false - default).
		 * This is useful when using complex headers.
		 *  @type boolean
		 *  @default false
		 *  @dtopt Options
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "bSortCellsTop": true
		 *      } );
		 *    } );
		 */
		"bSortCellsTop": false,


		/**
		 * Enable or disable the addition of the classes 'sorting_1', 'sorting_2' and
		 * 'sorting_3' to the columns which are currently being sorted on. This is
		 * presented as a feature switch as it can increase processing time (while
		 * classes are removed and added) so for large data sets you might want to
		 * turn this off.
		 *  @type boolean
		 *  @default true
		 *  @dtopt Features
		 *
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "bSortClasses": false
		 *      } );
		 *    } );
		 */
		"bSortClasses": true,


		/**
		 * Enable or disable state saving. When enabled a cookie will be used to save
		 * table display information such as pagination information, display length,
		 * filtering and sorting. As such when the end user reloads the page the
		 * display display will match what thy had previously set up.
		 *  @type boolean
		 *  @default false
		 *  @dtopt Features
		 *
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "bStateSave": true
		 *      } );
		 *    } );
		 */
		"bStateSave": false,


		/**
		 * Customise the cookie and / or the parameters being stored when using
		 * DataTables with state saving enabled. This function is called whenever
		 * the cookie is modified, and it expects a fully formed cookie string to be
		 * returned. Note that the data object passed in is a Javascript object which
		 * must be converted to a string (JSON.stringify for example).
		 *  @type function
		 *  @param {string} sName Name of the cookie defined by DataTables
		 *  @param {object} oData Data to be stored in the cookie
		 *  @param {string} sExpires Cookie expires string
		 *  @param {string} sPath Path of the cookie to set
		 *  @returns {string} Cookie formatted string (which should be encoded by
		 *    using encodeURIComponent())
		 *  @dtopt Callbacks
		 *
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "fnCookieCallback": function (sName, oData, sExpires, sPath) {
		 *          // Customise oData or sName or whatever else here
		 *          return sName + "="+JSON.stringify(oData)+"; expires=" + sExpires +"; path=" + sPath;
		 *        }
		 *      } );
		 *    } );
		 */
		"fnCookieCallback": null,


		/**
		 * This function is called when a TR element is created (and all TD child
		 * elements have been inserted), or registered if using a DOM source, allowing
		 * manipulation of the TR element (adding classes etc).
		 *  @type function
		 *  @param {node} nRow "TR" element for the current row
		 *  @param {array} aData Raw data array for this row
		 *  @param {int} iDataIndex The index of this row in aoData
		 *  @dtopt Callbacks
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "fnCreatedRow": function( nRow, aData, iDataIndex ) {
		 *          // Bold the grade for all 'A' grade browsers
		 *          if ( aData[4] == "A" )
		 *          {
		 *            $('td:eq(4)', nRow).html( '<b>A</b>' );
		 *          }
		 *        }
		 *      } );
		 *    } );
		 */
		"fnCreatedRow": null,


		/**
		 * This function is called on every 'draw' event, and allows you to
		 * dynamically modify any aspect you want about the created DOM.
		 *  @type function
		 *  @param {object} oSettings DataTables settings object
		 *  @dtopt Callbacks
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "fnDrawCallback": function() {
		 *          alert( 'DataTables has redrawn the table' );
		 *        }
		 *      } );
		 *    } );
		 */
		"fnDrawCallback": null,


		/**
		 * Identical to fnHeaderCallback() but for the table footer this function
		 * allows you to modify the table footer on every 'draw' even.
		 *  @type function
		 *  @param {node} nFoot "TR" element for the footer
		 *  @param {array} aData Full table data (as derived from the original HTML)
		 *  @param {int} iStart Index for the current display starting point in the
		 *    display array
		 *  @param {int} iEnd Index for the current display ending point in the
		 *    display array
		 *  @param {array int} aiDisplay Index array to translate the visual position
		 *    to the full data array
		 *  @dtopt Callbacks
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "fnFooterCallback": function( nFoot, aData, iStart, iEnd, aiDisplay ) {
		 *          nFoot.getElementsByTagName('th')[0].innerHTML = "Starting index is "+iStart;
		 *        }
		 *      } );
		 *    } )
		 */
		"fnFooterCallback": null,


		/**
		 * When rendering large numbers in the information element for the table
		 * (i.e. "Showing 1 to 10 of 57 entries") DataTables will render large numbers
		 * to have a comma separator for the 'thousands' units (e.g. 1 million is
		 * rendered as "1,000,000") to help readability for the end user. This
		 * function will override the default method DataTables uses.
		 *  @type function
		 *  @member
		 *  @param {int} iIn number to be formatted
		 *  @returns {string} formatted string for DataTables to show the number
		 *  @dtopt Callbacks
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "fnFormatNumber": function ( iIn ) {
		 *          if ( iIn &lt; 1000 ) {
		 *            return iIn;
		 *          } else {
		 *            var
		 *              s=(iIn+""),
		 *              a=s.split(""), out="",
		 *              iLen=s.length;
		 *
		 *            for ( var i=0 ; i&lt;iLen ; i++ ) {
		 *              if ( i%3 === 0 &amp;&amp; i !== 0 ) {
		 *                out = "'"+out;
		 *              }
		 *              out = a[iLen-i-1]+out;
		 *            }
		 *          }
		 *          return out;
		 *        };
		 *      } );
		 *    } );
		 */
		"fnFormatNumber": function ( iIn ) {
			if ( iIn < 1000 )
			{
				// A small optimisation for what is likely to be the majority of use cases
				return iIn;
			}

			var s=(iIn+""), a=s.split(""), out="", iLen=s.length;

			for ( var i=0 ; i<iLen ; i++ )
			{
				if ( i%3 === 0 && i !== 0 )
				{
					out = this.oLanguage.sInfoThousands+out;
				}
				out = a[iLen-i-1]+out;
			}
			return out;
		},


		/**
		 * This function is called on every 'draw' event, and allows you to
		 * dynamically modify the header row. This can be used to calculate and
		 * display useful information about the table.
		 *  @type function
		 *  @param {node} nHead "TR" element for the header
		 *  @param {array} aData Full table data (as derived from the original HTML)
		 *  @param {int} iStart Index for the current display starting point in the
		 *    display array
		 *  @param {int} iEnd Index for the current display ending point in the
		 *    display array
		 *  @param {array int} aiDisplay Index array to translate the visual position
		 *    to the full data array
		 *  @dtopt Callbacks
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "fnHeaderCallback": function( nHead, aData, iStart, iEnd, aiDisplay ) {
		 *          nHead.getElementsByTagName('th')[0].innerHTML = "Displaying "+(iEnd-iStart)+" records";
		 *        }
		 *      } );
		 *    } )
		 */
		"fnHeaderCallback": null,


		/**
		 * The information element can be used to convey information about the current
		 * state of the table. Although the internationalisation options presented by
		 * DataTables are quite capable of dealing with most customisations, there may
		 * be times where you wish to customise the string further. This callback
		 * allows you to do exactly that.
		 *  @type function
		 *  @param {object} oSettings DataTables settings object
		 *  @param {int} iStart Starting position in data for the draw
		 *  @param {int} iEnd End position in data for the draw
		 *  @param {int} iMax Total number of rows in the table (regardless of
		 *    filtering)
		 *  @param {int} iTotal Total number of rows in the data set, after filtering
		 *  @param {string} sPre The string that DataTables has formatted using it's
		 *    own rules
		 *  @returns {string} The string to be displayed in the information element.
		 *  @dtopt Callbacks
		 *
		 *  @example
		 *    $('#example').dataTable( {
		 *      "fnInfoCallback": function( oSettings, iStart, iEnd, iMax, iTotal, sPre ) {
		 *        return iStart +" to "+ iEnd;
		 *      }
		 *    } );
		 */
		"fnInfoCallback": null,


		/**
		 * Called when the table has been initialised. Normally DataTables will
		 * initialise sequentially and there will be no need for this function,
		 * however, this does not hold true when using external language information
		 * since that is obtained using an async XHR call.
		 *  @type function
		 *  @param {object} oSettings DataTables settings object
		 *  @param {object} json The JSON object request from the server - only
		 *    present if client-side Ajax sourced data is used
		 *  @dtopt Callbacks
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "fnInitComplete": function(oSettings, json) {
		 *          alert( 'DataTables has finished its initialisation.' );
		 *        }
		 *      } );
		 *    } )
		 */
		"fnInitComplete": null,


		/**
		 * Called at the very start of each table draw and can be used to cancel the
		 * draw by returning false, any other return (including undefined) results in
		 * the full draw occurring).
		 *  @type function
		 *  @param {object} oSettings DataTables settings object
		 *  @returns {boolean} False will cancel the draw, anything else (including no
		 *    return) will allow it to complete.
		 *  @dtopt Callbacks
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "fnPreDrawCallback": function( oSettings ) {
		 *          if ( $('#test').val() == 1 ) {
		 *            return false;
		 *          }
		 *        }
		 *      } );
		 *    } );
		 */
		"fnPreDrawCallback": null,


		/**
		 * This function allows you to 'post process' each row after it have been
		 * generated for each table draw, but before it is rendered on screen. This
		 * function might be used for setting the row class name etc.
		 *  @type function
		 *  @param {node} nRow "TR" element for the current row
		 *  @param {array} aData Raw data array for this row
		 *  @param {int} iDisplayIndex The display index for the current table draw
		 *  @param {int} iDisplayIndexFull The index of the data in the full list of
		 *    rows (after filtering)
		 *  @dtopt Callbacks
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
		 *          // Bold the grade for all 'A' grade browsers
		 *          if ( aData[4] == "A" )
		 *          {
		 *            $('td:eq(4)', nRow).html( '<b>A</b>' );
		 *          }
		 *        }
		 *      } );
		 *    } );
		 */
		"fnRowCallback": null,


		/**
		 * This parameter allows you to override the default function which obtains
		 * the data from the server ($.getJSON) so something more suitable for your
		 * application. For example you could use POST data, or pull information from
		 * a Gears or AIR database.
		 *  @type function
		 *  @member
		 *  @param {string} sSource HTTP source to obtain the data from (sAjaxSource)
		 *  @param {array} aoData A key/value pair object containing the data to send
		 *    to the server
		 *  @param {function} fnCallback to be called on completion of the data get
		 *    process that will draw the data on the page.
		 *  @param {object} oSettings DataTables settings object
		 *  @dtopt Callbacks
		 *  @dtopt Server-side
		 *
		 *  @example
		 *    // POST data to server
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "bProcessing": true,
		 *        "bServerSide": true,
		 *        "sAjaxSource": "xhr.php",
		 *        "fnServerData": function ( sSource, aoData, fnCallback ) {
		 *          $.ajax( {
		 *            "dataType": 'json',
		 *            "type": "POST",
		 *            "url": sSource,
		 *            "data": aoData,
		 *            "success": fnCallback
		 *          } );
		 *        }
		 *      } );
		 *    } );
		 */
		"fnServerData": function ( sUrl, aoData, fnCallback, oSettings ) {
			oSettings.jqXHR = $.ajax( {
				"url":  sUrl,
				"data": aoData,
				"success": function (json) {
					$(oSettings.oInstance).trigger('xhr', oSettings);
					fnCallback( json );
				},
				"dataType": "json",
				"cache": false,
				"type": oSettings.sServerMethod,
				"error": function (xhr, error, thrown) {
					if ( error == "parsererror" ) {
						alert( "DataTables warning: JSON data from server could not be parsed. "+
								"This is caused by a JSON formatting error." );
					}
				}
			} );
		},


		/**
		 * It is often useful to send extra data to the server when making an Ajax
		 * request - for example custom filtering information, and this callback
		 * function makes it trivial to send extra information to the server. The
		 * passed in parameter is the data set that has been constructed by
		 * DataTables, and you can add to this or modify it as you require.
		 *  @type function
		 *  @param {array} aoData Data array (array of objects which are name/value
		 *    pairs) that has been constructed by DataTables and will be sent to the
		 *    server. In the case of Ajax sourced data with server-side processing
		 *    this will be an empty array, for server-side processing there will be a
		 *    significant number of parameters!
		 *  @returns {undefined} Ensure that you modify the aoData array passed in,
		 *    as this is passed by reference.
		 *  @dtopt Callbacks
		 *  @dtopt Server-side
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "bProcessing": true,
		 *        "bServerSide": true,
		 *        "sAjaxSource": "scripts/server_processing.php",
		 *        "fnServerParams": function ( aoData ) {
		 *          aoData.push( { "name": "more_data", "value": "my_value" } );
		 *        }
		 *      } );
		 *    } );
		 */
		"fnServerParams": null,


		/**
		 * Load the table state. With this function you can define from where, and how, the
		 * state of a table is loaded. By default DataTables will load from its state saving
		 * cookie, but you might wish to use local storage (HTML5) or a server-side database.
		 *  @type function
		 *  @member
		 *  @param {object} oSettings DataTables settings object
		 *  @return {object} The DataTables state object to be loaded
		 *  @dtopt Callbacks
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "bStateSave": true,
		 *        "fnStateSave": function (oSettings, oData) {
		 *          var o;
		 *
		 *          // Send an Ajax request to the server to get the data. Note that
		 *          // this is a synchronous request.
		 *          $.ajax( {
		 *            "url": "/state_load",
		 *            "async": false,
		 *            "dataType": "json",
		 *            "success": function (json) {
		 *              o = json;
		 *            }
		 *          } );
		 *
		 *          return o;
		 *        }
		 *      } );
		 *    } );
		 */
		"fnStateLoad": function ( oSettings ) {
			var sData = this.oApi._fnReadCookie( oSettings.sCookiePrefix+oSettings.sInstance );
			var oData;

			try {
				oData = (typeof $.parseJSON === 'function') ?
						$.parseJSON(sData) : eval( '('+sData+')' );
			} catch (e) {
				oData = null;
			}

			return oData;
		},


		/**
		 * Callback which allows modification of the saved state prior to loading that state.
		 * This callback is called when the table is loading state from the stored data, but
		 * prior to the settings object being modified by the saved state. Note that for
		 * plug-in authors, you should use the 'stateLoadParams' event to load parameters for
		 * a plug-in.
		 *  @type function
		 *  @param {object} oSettings DataTables settings object
		 *  @param {object} oData The state object that is to be loaded
		 *  @dtopt Callbacks
		 *
		 *  @example
		 *    // Remove a saved filter, so filtering is never loaded
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "bStateSave": true,
		 *        "fnStateLoadParams": function (oSettings, oData) {
		 *          oData.oFilter.sSearch = "";
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Disallow state loading by returning false
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "bStateSave": true,
		 *        "fnStateLoadParams": function (oSettings, oData) {
		 *          return false;
		 *      } );
		 *    } );
		 */
		"fnStateLoadParams": null,


		/**
		 * Callback that is called when the state has been loaded from the state saving method
		 * and the DataTables settings object has been modified as a result of the loaded state.
		 *  @type function
		 *  @param {object} oSettings DataTables settings object
		 *  @param {object} oData The state object that was loaded
		 *  @dtopt Callbacks
		 *
		 *  @example
		 *    // Show an alert with the filtering value that was saved
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "bStateSave": true,
		 *        "fnStateLoaded": function (oSettings, oData) {
		 *          alert( 'Saved filter was: '+oData.oFilter.sSearch );
		 *      } );
		 *    } );
		 */
		"fnStateLoaded": null,


		/**
		 * Save the table state. This function allows you to define where and how the state
		 * information for the table is stored - by default it will use a cookie, but you
		 * might want to use local storage (HTML5) or a server-side database.
		 *  @type function
		 *  @member
		 *  @param {object} oSettings DataTables settings object
		 *  @param {object} oData The state object to be saved
		 *  @dtopt Callbacks
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "bStateSave": true,
		 *        "fnStateSave": function (oSettings, oData) {
		 *          // Send an Ajax request to the server with the state object
		 *          $.ajax( {
		 *            "url": "/state_save",
		 *            "data": oData,
		 *            "dataType": "json",
		 *            "method": "POST"
		 *            "success": function () {}
		 *          } );
		 *        }
		 *      } );
		 *    } );
		 */
		"fnStateSave": function ( oSettings, oData ) {
			this.oApi._fnCreateCookie(
					oSettings.sCookiePrefix+oSettings.sInstance,
					this.oApi._fnJsonString(oData),
					oSettings.iCookieDuration,
					oSettings.sCookiePrefix,
					oSettings.fnCookieCallback
			);
		},


		/**
		 * Callback which allows modification of the state to be saved. Called when the table
		 * has changed state a new state save is required. This method allows modification of
		 * the state saving object prior to actually doing the save, including addition or
		 * other state properties or modification. Note that for plug-in authors, you should
		 * use the 'stateSaveParams' event to save parameters for a plug-in.
		 *  @type function
		 *  @param {object} oSettings DataTables settings object
		 *  @param {object} oData The state object to be saved
		 *  @dtopt Callbacks
		 *
		 *  @example
		 *    // Remove a saved filter, so filtering is never saved
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "bStateSave": true,
		 *        "fnStateLoadParams": function (oSettings, oData) {
		 *          oData.oFilter.sSearch = "";
		 *      } );
		 *    } );
		 */
		"fnStateSaveParams": null,


		/**
		 * Duration of the cookie which is used for storing session information. This
		 * value is given in seconds.
		 *  @type int
		 *  @default 7200 <i>(2 hours)</i>
		 *  @dtopt Options
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "iCookieDuration": 60*60*24 // 1 day
		 *      } );
		 *    } )
		 */
		"iCookieDuration": 7200,


		/**
		 * When enabled DataTables will not make a request to the server for the first
		 * page draw - rather it will use the data already on the page (no sorting etc
		 * will be applied to it), thus saving on an XHR at load time. iDeferLoading
		 * is used to indicate that deferred loading is required, but it is also used
		 * to tell DataTables how many records there are in the full table (allowing
		 * the information element and pagination to be displayed correctly).
		 *  @type int
		 *  @default null
		 *  @dtopt Options
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "bServerSide": true,
		 *        "sAjaxSource": "scripts/server_processing.php",
		 *        "iDeferLoading": 57
		 *      } );
		 *    } );
		 */
		"iDeferLoading": null,


		/**
		 * Number of rows to display on a single page when using pagination. If
		 * feature enabled (bLengthChange) then the end user will be able to override
		 * this to a custom setting using a pop-up menu.
		 *  @type int
		 *  @default 10
		 *  @dtopt Options
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "iDisplayLength": 50
		 *      } );
		 *    } )
		 */
		"iDisplayLength": 10,


		/**
		 * Define the starting point for data display when using DataTables with
		 * pagination. Note that this parameter is the number of records, rather than
		 * the page number, so if you have 10 records per page and want to start on
		 * the third page, it should be "20".
		 *  @type int
		 *  @default 0
		 *  @dtopt Options
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "iDisplayStart": 20
		 *      } );
		 *    } )
		 */
		"iDisplayStart": 0,


		/**
		 * The scroll gap is the amount of scrolling that is left to go before
		 * DataTables will load the next 'page' of data automatically. You typically
		 * want a gap which is big enough that the scrolling will be smooth for the
		 * user, while not so large that it will load more data than need.
		 *  @type int
		 *  @default 100
		 *  @dtopt Options
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "bScrollInfinite": true,
		 *        "bScrollCollapse": true,
		 *        "sScrollY": "200px",
		 *        "iScrollLoadGap": 50
		 *      } );
		 *    } );
		 */
		"iScrollLoadGap": 100,


		/**
		 * By default DataTables allows keyboard navigation of the table (sorting, paging,
		 * and filtering) by adding a tabindex attribute to the required elements. This
		 * allows you to tab through the controls and press the enter key to activate them.
		 * The tabindex is default 0, meaning that the tab follows the flow of the document.
		 * You can overrule this using this parameter if you wish. Use a value of -1 to
		 * disable built-in keyboard navigation.
		 *  @type int
		 *  @default 0
		 *  @dtopt Options
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "iTabIndex": 1
		 *      } );
		 *    } );
		 */
		"iTabIndex": 0,


		/**
		 * All strings that DataTables uses in the user interface that it creates
		 * are defined in this object, allowing you to modified them individually or
		 * completely replace them all as required.
		 *  @namespace
		 */
		"oLanguage": {
			/**
			 * Strings that are used for WAI-ARIA labels and controls only (these are not
			 * actually visible on the page, but will be read by screenreaders, and thus
			 * must be internationalised as well).
			 *  @namespace
			 */
			"oAria": {
				/**
				 * ARIA label that is added to the table headers when the column may be
				 * sorted ascending by activing the column (click or return when focused).
				 * Note that the column header is prefixed to this string.
				 *  @type string
				 *  @default : activate to sort column ascending
				 *  @dtopt Language
				 *
				 *  @example
				 *    $(document).ready(function() {
				 *      $('#example').dataTable( {
				 *        "oLanguage": {
				 *          "oAria": {
				 *            "sSortAscending": " - click/return to sort ascending"
				 *          }
				 *        }
				 *      } );
				 *    } );
				 */
				"sSortAscending": ": activate to sort column ascending",

				/**
				 * ARIA label that is added to the table headers when the column may be
				 * sorted descending by activing the column (click or return when focused).
				 * Note that the column header is prefixed to this string.
				 *  @type string
				 *  @default : activate to sort column ascending
				 *  @dtopt Language
				 *
				 *  @example
				 *    $(document).ready(function() {
				 *      $('#example').dataTable( {
				 *        "oLanguage": {
				 *          "oAria": {
				 *            "sSortDescending": " - click/return to sort descending"
				 *          }
				 *        }
				 *      } );
				 *    } );
				 */
				"sSortDescending": ": activate to sort column descending"
			},

			/**
			 * Pagination string used by DataTables for the two built-in pagination
			 * control types ("two_button" and "full_numbers")
			 *  @namespace
			 */
			"oPaginate": {
				/**
				 * Text to use when using the 'full_numbers' type of pagination for the
				 * button to take the user to the first page.
				 *  @type string
				 *  @default First
				 *  @dtopt Language
				 *
				 *  @example
				 *    $(document).ready(function() {
				 *      $('#example').dataTable( {
				 *        "oLanguage": {
				 *          "oPaginate": {
				 *            "sFirst": "First page"
				 *          }
				 *        }
				 *      } );
				 *    } );
				 */
				"sFirst": "First",


				/**
				 * Text to use when using the 'full_numbers' type of pagination for the
				 * button to take the user to the last page.
				 *  @type string
				 *  @default Last
				 *  @dtopt Language
				 *
				 *  @example
				 *    $(document).ready(function() {
				 *      $('#example').dataTable( {
				 *        "oLanguage": {
				 *          "oPaginate": {
				 *            "sLast": "Last page"
				 *          }
				 *        }
				 *      } );
				 *    } );
				 */
				"sLast": "Last",


				/**
				 * Text to use when using the 'full_numbers' type of pagination for the
				 * button to take the user to the next page.
				 *  @type string
				 *  @default Next
				 *  @dtopt Language
				 *
				 *  @example
				 *    $(document).ready(function() {
				 *      $('#example').dataTable( {
				 *        "oLanguage": {
				 *          "oPaginate": {
				 *            "sNext": "Next page"
				 *          }
				 *        }
				 *      } );
				 *    } );
				 */
				"sNext": "Next",


				/**
				 * Text to use when using the 'full_numbers' type of pagination for the
				 * button to take the user to the previous page.
				 *  @type string
				 *  @default Previous
				 *  @dtopt Language
				 *
				 *  @example
				 *    $(document).ready(function() {
				 *      $('#example').dataTable( {
				 *        "oLanguage": {
				 *          "oPaginate": {
				 *            "sPrevious": "Previous page"
				 *          }
				 *        }
				 *      } );
				 *    } );
				 */
				"sPrevious": "Previous"
			},

			/**
			 * This string is shown in preference to sZeroRecords when the table is
			 * empty of data (regardless of filtering). Note that this is an optional
			 * parameter - if it is not given, the value of sZeroRecords will be used
			 * instead (either the default or given value).
			 *  @type string
			 *  @default No data available in table
			 *  @dtopt Language
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      $('#example').dataTable( {
			 *        "oLanguage": {
			 *          "sEmptyTable": "No data available in table"
			 *        }
			 *      } );
			 *    } );
			 */
			"sEmptyTable": "No data available in table",


			/**
			 * This string gives information to the end user about the information that
			 * is current on display on the page. The _START_, _END_ and _TOTAL_
			 * variables are all dynamically replaced as the table display updates, and
			 * can be freely moved or removed as the language requirements change.
			 *  @type string
			 *  @default Showing _START_ to _END_ of _TOTAL_ entries
			 *  @dtopt Language
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      $('#example').dataTable( {
			 *        "oLanguage": {
			 *          "sInfo": "Got a total of _TOTAL_ entries to show (_START_ to _END_)"
			 *        }
			 *      } );
			 *    } );
			 */
			"sInfo": "Showing _START_ to _END_ of _TOTAL_ entries",


			/**
			 * Display information string for when the table is empty. Typically the
			 * format of this string should match sInfo.
			 *  @type string
			 *  @default Showing 0 to 0 of 0 entries
			 *  @dtopt Language
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      $('#example').dataTable( {
			 *        "oLanguage": {
			 *          "sInfoEmpty": "No entries to show"
			 *        }
			 *      } );
			 *    } );
			 */
			"sInfoEmpty": "Showing 0 to 0 of 0 entries",


			/**
			 * When a user filters the information in a table, this string is appended
			 * to the information (sInfo) to give an idea of how strong the filtering
			 * is. The variable _MAX_ is dynamically updated.
			 *  @type string
			 *  @default (filtered from _MAX_ total entries)
			 *  @dtopt Language
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      $('#example').dataTable( {
			 *        "oLanguage": {
			 *          "sInfoFiltered": " - filtering from _MAX_ records"
			 *        }
			 *      } );
			 *    } );
			 */
			"sInfoFiltered": "(filtered from _MAX_ total entries)",


			/**
			 * If can be useful to append extra information to the info string at times,
			 * and this variable does exactly that. This information will be appended to
			 * the sInfo (sInfoEmpty and sInfoFiltered in whatever combination they are
			 * being used) at all times.
			 *  @type string
			 *  @default <i>Empty string</i>
			 *  @dtopt Language
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      $('#example').dataTable( {
			 *        "oLanguage": {
			 *          "sInfoPostFix": "All records shown are derived from real information."
			 *        }
			 *      } );
			 *    } );
			 */
			"sInfoPostFix": "",


			/**
			 * DataTables has a build in number formatter (fnFormatNumber) which is used
			 * to format large numbers that are used in the table information. By
			 * default a comma is used, but this can be trivially changed to any
			 * character you wish with this parameter.
			 *  @type string
			 *  @default ,
			 *  @dtopt Language
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      $('#example').dataTable( {
			 *        "oLanguage": {
			 *          "sInfoThousands": "'"
			 *        }
			 *      } );
			 *    } );
			 */
			"sInfoThousands": ",",


			/**
			 * Detail the action that will be taken when the drop down menu for the
			 * pagination length option is changed. The '_MENU_' variable is replaced
			 * with a default select list of 10, 25, 50 and 100, and can be replaced
			 * with a custom select box if required.
			 *  @type string
			 *  @default Show _MENU_ entries
			 *  @dtopt Language
			 *
			 *  @example
			 *    // Language change only
			 *    $(document).ready(function() {
			 *      $('#example').dataTable( {
			 *        "oLanguage": {
			 *          "sLengthMenu": "Display _MENU_ records"
			 *        }
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Language and options change
			 *    $(document).ready(function() {
			 *      $('#example').dataTable( {
			 *        "oLanguage": {
			 *          "sLengthMenu": 'Display <select>'+
			 *            '<option value="10">10</option>'+
			 *            '<option value="20">20</option>'+
			 *            '<option value="30">30</option>'+
			 *            '<option value="40">40</option>'+
			 *            '<option value="50">50</option>'+
			 *            '<option value="-1">All</option>'+
			 *            '</select> records'
			 *        }
			 *      } );
			 *    } );
			 */
			"sLengthMenu": "Show _MENU_ entries",


			/**
			 * When using Ajax sourced data and during the first draw when DataTables is
			 * gathering the data, this message is shown in an empty row in the table to
			 * indicate to the end user the the data is being loaded. Note that this
			 * parameter is not used when loading data by server-side processing, just
			 * Ajax sourced data with client-side processing.
			 *  @type string
			 *  @default Loading...
			 *  @dtopt Language
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "oLanguage": {
			 *          "sLoadingRecords": "Please wait - loading..."
			 *        }
			 *      } );
			 *    } );
			 */
			"sLoadingRecords": "Loading...",


			/**
			 * Text which is displayed when the table is processing a user action
			 * (usually a sort command or similar).
			 *  @type string
			 *  @default Processing...
			 *  @dtopt Language
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      $('#example').dataTable( {
			 *        "oLanguage": {
			 *          "sProcessing": "DataTables is currently busy"
			 *        }
			 *      } );
			 *    } );
			 */
			"sProcessing": "Processing...",


			/**
			 * Details the actions that will be taken when the user types into the
			 * filtering input text box. The variable "_INPUT_", if used in the string,
			 * is replaced with the HTML text box for the filtering input allowing
			 * control over where it appears in the string. If "_INPUT_" is not given
			 * then the input box is appended to the string automatically.
			 *  @type string
			 *  @default Search:
			 *  @dtopt Language
			 *
			 *  @example
			 *    // Input text box will be appended at the end automatically
			 *    $(document).ready(function() {
			 *      $('#example').dataTable( {
			 *        "oLanguage": {
			 *          "sSearch": "Filter records:"
			 *        }
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Specify where the filter should appear
			 *    $(document).ready(function() {
			 *      $('#example').dataTable( {
			 *        "oLanguage": {
			 *          "sSearch": "Apply filter _INPUT_ to table"
			 *        }
			 *      } );
			 *    } );
			 */
			"sSearch": "Search:",


			/**
			 * All of the language information can be stored in a file on the
			 * server-side, which DataTables will look up if this parameter is passed.
			 * It must store the URL of the language file, which is in a JSON format,
			 * and the object has the same properties as the oLanguage object in the
			 * initialiser object (i.e. the above parameters). Please refer to one of
			 * the example language files to see how this works in action.
			 *  @type string
			 *  @default <i>Empty string - i.e. disabled</i>
			 *  @dtopt Language
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      $('#example').dataTable( {
			 *        "oLanguage": {
			 *          "sUrl": "http://www.sprymedia.co.uk/dataTables/lang.txt"
			 *        }
			 *      } );
			 *    } );
			 */
			"sUrl": "",


			/**
			 * Text shown inside the table records when the is no information to be
			 * displayed after filtering. sEmptyTable is shown when there is simply no
			 * information in the table at all (regardless of filtering).
			 *  @type string
			 *  @default No matching records found
			 *  @dtopt Language
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      $('#example').dataTable( {
			 *        "oLanguage": {
			 *          "sZeroRecords": "No records to display"
			 *        }
			 *      } );
			 *    } );
			 */
			"sZeroRecords": "No matching records found"
		},


		/**
		 * This parameter allows you to have define the global filtering state at
		 * initialisation time. As an object the "sSearch" parameter must be
		 * defined, but all other parameters are optional. When "bRegex" is true,
		 * the search string will be treated as a regular expression, when false
		 * (default) it will be treated as a straight string. When "bSmart"
		 * DataTables will use it's smart filtering methods (to word match at
		 * any point in the data), when false this will not be done.
		 *  @namespace
		 *  @extends DataTable.models.oSearch
		 *  @dtopt Options
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "oSearch": {"sSearch": "Initial search"}
		 *      } );
		 *    } )
		 */
		"oSearch": $.extend( {}, DataTable.models.oSearch ),


		/**
		 * By default DataTables will look for the property 'aaData' when obtaining
		 * data from an Ajax source or for server-side processing - this parameter
		 * allows that property to be changed. You can use Javascript dotted object
		 * notation to get a data source for multiple levels of nesting.
		 *  @type string
		 *  @default aaData
		 *  @dtopt Options
		 *  @dtopt Server-side
		 *
		 *  @example
		 *    // Get data from { "data": [...] }
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable( {
		 *        "sAjaxSource": "sources/data.txt",
		 *        "sAjaxDataProp": "data"
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Get data from { "data": { "inner": [...] } }
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable( {
		 *        "sAjaxSource": "sources/data.txt",
		 *        "sAjaxDataProp": "data.inner"
		 *      } );
		 *    } );
		 */
		"sAjaxDataProp": "aaData",


		/**
		 * You can instruct DataTables to load data from an external source using this
		 * parameter (use aData if you want to pass data in you already have). Simply
		 * provide a url a JSON object can be obtained from. This object must include
		 * the parameter 'aaData' which is the data source for the table.
		 *  @type string
		 *  @default null
		 *  @dtopt Options
		 *  @dtopt Server-side
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "sAjaxSource": "http://www.sprymedia.co.uk/dataTables/json.php"
		 *      } );
		 *    } )
		 */
		"sAjaxSource": null,


		/**
		 * This parameter can be used to override the default prefix that DataTables
		 * assigns to a cookie when state saving is enabled.
		 *  @type string
		 *  @default SpryMedia_DataTables_
		 *  @dtopt Options
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "sCookiePrefix": "my_datatable_",
		 *      } );
		 *    } );
		 */
		"sCookiePrefix": "SpryMedia_DataTables_",


		/**
		 * This initialisation variable allows you to specify exactly where in the
		 * DOM you want DataTables to inject the various controls it adds to the page
		 * (for example you might want the pagination controls at the top of the
		 * table). DIV elements (with or without a custom class) can also be added to
		 * aid styling. The follow syntax is used:
		 *   <ul>
		 *     <li>The following options are allowed:
		 *       <ul>
		 *         <li>'l' - Length changing</li
		 *         <li>'f' - Filtering input</li>
		 *         <li>'t' - The table!</li>
		 *         <li>'i' - Information</li>
		 *         <li>'p' - Pagination</li>
		 *         <li>'r' - pRocessing</li>
		 *       </ul>
		 *     </li>
		 *     <li>The following constants are allowed:
		 *       <ul>
		 *         <li>'H' - jQueryUI theme "header" classes ('fg-toolbar ui-widget-header ui-corner-tl ui-corner-tr ui-helper-clearfix')</li>
		 *         <li>'F' - jQueryUI theme "footer" classes ('fg-toolbar ui-widget-header ui-corner-bl ui-corner-br ui-helper-clearfix')</li>
		 *       </ul>
		 *     </li>
		 *     <li>The following syntax is expected:
		 *       <ul>
		 *         <li>'&lt;' and '&gt;' - div elements</li>
		 *         <li>'&lt;"class" and '&gt;' - div with a class</li>
		 *         <li>'&lt;"#id" and '&gt;' - div with an ID</li>
		 *       </ul>
		 *     </li>
		 *     <li>Examples:
		 *       <ul>
		 *         <li>'&lt;"wrapper"flipt&gt;'</li>
		 *         <li>'&lt;lf&lt;t&gt;ip&gt;'</li>
		 *       </ul>
		 *     </li>
		 *   </ul>
		 *  @type string
		 *  @default lfrtip <i>(when bJQueryUI is false)</i> <b>or</b>
		 *    <"H"lfr>t<"F"ip> <i>(when bJQueryUI is true)</i>
		 *  @dtopt Options
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "sDom": '&lt;"top"i&gt;rt&lt;"bottom"flp&gt;&lt;"clear"&lgt;'
		 *      } );
		 *    } );
		 */
		"sDom": "lfrtip",


		/**
		 * DataTables features two different built-in pagination interaction methods
		 * ('two_button' or 'full_numbers') which present different page controls to
		 * the end user. Further methods can be added using the API (see below).
		 *  @type string
		 *  @default two_button
		 *  @dtopt Options
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "sPaginationType": "full_numbers"
		 *      } );
		 *    } )
		 */
		"sPaginationType": "two_button",


		/**
		 * Enable horizontal scrolling. When a table is too wide to fit into a certain
		 * layout, or you have a large number of columns in the table, you can enable
		 * x-scrolling to show the table in a viewport, which can be scrolled. This
		 * property can by any CSS unit, or a number (in which case it will be treated
		 * as a pixel measurement).
		 *  @type string
		 *  @default <i>blank string - i.e. disabled</i>
		 *  @dtopt Features
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "sScrollX": "100%",
		 *        "bScrollCollapse": true
		 *      } );
		 *    } );
		 */
		"sScrollX": "",


		/**
		 * This property can be used to force a DataTable to use more width than it
		 * might otherwise do when x-scrolling is enabled. For example if you have a
		 * table which requires to be well spaced, this parameter is useful for
		 * "over-sizing" the table, and thus forcing scrolling. This property can by
		 * any CSS unit, or a number (in which case it will be treated as a pixel
		 * measurement).
		 *  @type string
		 *  @default <i>blank string - i.e. disabled</i>
		 *  @dtopt Options
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "sScrollX": "100%",
		 *        "sScrollXInner": "110%"
		 *      } );
		 *    } );
		 */
		"sScrollXInner": "",


		/**
		 * Enable vertical scrolling. Vertical scrolling will constrain the DataTable
		 * to the given height, an enable scrolling for any data which overflows the
		 * current viewport. This can be used as an alternative to paging to display
		 * a lot of data in a small area (although paging and scrolling can both be
		 * enabled at the same time). This property can by any CSS unit, or a number
		 * (in which case it will be treated as a pixel measurement).
		 *  @type string
		 *  @default <i>blank string - i.e. disabled</i>
		 *  @dtopt Features
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "sScrollY": "200px",
		 *        "bPaginate": false
		 *      } );
		 *    } );
		 */
		"sScrollY": "",


		/**
		 * Set the HTTP method that is used to make the Ajax call for server-side
		 * processing or Ajax sourced data.
		 *  @type string
		 *  @default GET
		 *  @dtopt Options
		 *  @dtopt Server-side
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "bServerSide": true,
		 *        "sAjaxSource": "scripts/post.php",
		 *        "sServerMethod": "POST"
		 *      } );
		 *    } );
		 */
		"sServerMethod": "GET"
	};



	/**
	 * Column options that can be given to DataTables at initialisation time.
	 *  @namespace
	 */
	DataTable.defaults.columns = {
		/**
		 * Allows a column's sorting to take multiple columns into account when
		 * doing a sort. For example first name / last name columns make sense to
		 * do a multi-column sort over the two columns.
		 *  @type array
		 *  @default null <i>Takes the value of the column index automatically</i>
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Using aoColumnDefs
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumnDefs": [
		 *          { "aDataSort": [ 0, 1 ], "aTargets": [ 0 ] },
		 *          { "aDataSort": [ 1, 0 ], "aTargets": [ 1 ] },
		 *          { "aDataSort": [ 2, 3, 4 ], "aTargets": [ 2 ] }
		 *        ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Using aoColumns
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumns": [
		 *          { "aDataSort": [ 0, 1 ] },
		 *          { "aDataSort": [ 1, 0 ] },
		 *          { "aDataSort": [ 2, 3, 4 ] },
		 *          null,
		 *          null
		 *        ]
		 *      } );
		 *    } );
		 */
		"aDataSort": null,


		/**
		 * You can control the default sorting direction, and even alter the behaviour
		 * of the sort handler (i.e. only allow ascending sorting etc) using this
		 * parameter.
		 *  @type array
		 *  @default [ 'asc', 'desc' ]
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Using aoColumnDefs
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumnDefs": [
		 *          { "asSorting": [ "asc" ], "aTargets": [ 1 ] },
		 *          { "asSorting": [ "desc", "asc", "asc" ], "aTargets": [ 2 ] },
		 *          { "asSorting": [ "desc" ], "aTargets": [ 3 ] }
		 *        ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Using aoColumns
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumns": [
		 *          null,
		 *          { "asSorting": [ "asc" ] },
		 *          { "asSorting": [ "desc", "asc", "asc" ] },
		 *          { "asSorting": [ "desc" ] },
		 *          null
		 *        ]
		 *      } );
		 *    } );
		 */
		"asSorting": [ 'asc', 'desc' ],


		/**
		 * Enable or disable filtering on the data in this column.
		 *  @type boolean
		 *  @default true
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Using aoColumnDefs
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumnDefs": [
		 *          { "bSearchable": false, "aTargets": [ 0 ] }
		 *        ] } );
		 *    } );
		 *
		 *  @example
		 *    // Using aoColumns
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumns": [
		 *          { "bSearchable": false },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ] } );
		 *    } );
		 */
		"bSearchable": true,


		/**
		 * Enable or disable sorting on this column.
		 *  @type boolean
		 *  @default true
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Using aoColumnDefs
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumnDefs": [
		 *          { "bSortable": false, "aTargets": [ 0 ] }
		 *        ] } );
		 *    } );
		 *
		 *  @example
		 *    // Using aoColumns
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumns": [
		 *          { "bSortable": false },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ] } );
		 *    } );
		 */
		"bSortable": true,


		/**
		 * When using fnRender() for a column, you may wish to use the original data
		 * (before rendering) for sorting and filtering (the default is to used the
		 * rendered data that the user can see). This may be useful for dates etc.
		 *
		 * *NOTE* It is it is advisable now to use mDataProp as a function and make
		 * use of the 'type' that it gives, allowing (potentially) different data to
		 * be used for sorting, filtering, display and type detection.
		 *  @type boolean
		 *  @default true
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Using aoColumnDefs
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumnDefs": [
		 *          {
		 *            "fnRender": function ( oObj ) {
		 *              return oObj.aData[0] +' '+ oObj.aData[3];
		 *            },
		 *            "bUseRendered": false,
		 *            "aTargets": [ 0 ]
		 *          }
		 *        ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Using aoColumns
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumns": [
		 *          {
		 *            "fnRender": function ( oObj ) {
		 *              return oObj.aData[0] +' '+ oObj.aData[3];
		 *            },
		 *            "bUseRendered": false
		 *          },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ]
		 *      } );
		 *    } );
		 */
		"bUseRendered": true,


		/**
		 * Enable or disable the display of this column.
		 *  @type boolean
		 *  @default true
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Using aoColumnDefs
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumnDefs": [
		 *          { "bVisible": false, "aTargets": [ 0 ] }
		 *        ] } );
		 *    } );
		 *
		 *  @example
		 *    // Using aoColumns
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumns": [
		 *          { "bVisible": false },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ] } );
		 *    } );
		 */
		"bVisible": true,


		/**
		 * Developer definable function that is called whenever a cell is created (Ajax source,
		 * etc) or processed for input (DOM source). This can be used as a compliment to fnRender
		 * allowing you to modify the DOM element (add background colour for example) when the
		 * element is available (since it is not when fnRender is called).
		 *  @type function
		 *  @param {element} nTd The TD node that has been created
		 *  @param {*} sData The Data for the cell
		 *  @param {array|object} oData The data for the whole row
		 *  @param {int} iRow The row index for the aoData data store
		 *  @param {int} iCol The column index for aoColumns
		 *  @dtopt Columns
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumnDefs": [ {
		 *          "aTargets": [3],
		 *          "fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {
		 *            if ( sData == "1.7" ) {
		 *              $(nTd).css('color', 'blue')
		 *            }
		 *          }
		 *        } ]
		 *      });
		 *    } );
		 */
		"fnCreatedCell": null,


		/**
		 * Custom display function that will be called for the display of each cell in
		 * this column.
		 *  @type function
		 *  @param {object} o Object with the following parameters:
		 *  @param {int}    o.iDataRow The row in aoData
		 *  @param {int}    o.iDataColumn The column in question
		 *  @param {array}  o.aData The data for the row in question
		 *  @param {object} o.oSettings The settings object for this DataTables instance
		 *  @param {object} o.mDataProp The data property used for this column
		 *  @param {*}      val The current cell value
		 *  @returns {string} The string you which to use in the display
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Using aoColumnDefs
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumnDefs": [
		 *          {
		 *            "fnRender": function ( o, val ) {
		 *              return o.aData[0] +' '+ o.aData[3];
		 *            },
		 *            "aTargets": [ 0 ]
		 *          }
		 *        ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Using aoColumns
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumns": [
		 *          { "fnRender": function ( o, val ) {
		 *            return o.aData[0] +' '+ o.aData[3];
		 *          } },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ]
		 *      } );
		 *    } );
		 */
		"fnRender": null,


		/**
		 * The column index (starting from 0!) that you wish a sort to be performed
		 * upon when this column is selected for sorting. This can be used for sorting
		 * on hidden columns for example.
		 *  @type int
		 *  @default -1 <i>Use automatically calculated column index</i>
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Using aoColumnDefs
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumnDefs": [
		 *          { "iDataSort": 1, "aTargets": [ 0 ] }
		 *        ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Using aoColumns
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumns": [
		 *          { "iDataSort": 1 },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ]
		 *      } );
		 *    } );
		 */
		"iDataSort": -1,


		/**
		 * This property can be used to read data from any JSON data source property,
		 * including deeply nested objects / properties. mDataProp can be given in a
		 * number of different ways which effect its behaviour:
		 *   <ul>
		 *     <li>integer - treated as an array index for the data source. This is the
		 *       default that DataTables uses (incrementally increased for each column).</li>
		 *     <li>string - read an object property from the data source. Note that you can
		 *       use Javascript dotted notation to read deep properties/arrays from the
		 *       data source.</li>
		 *     <li>null -  the sDafaultContent option will use used for the cell (empty
		 *       string by default. This can be useful on generated columns such as
		 *       edit / delete action columns.</li>
		 *     <li>function - the function given will be executed whenever DataTables
		 *       needs to set or get the data for a cell in the column. The function
		 *       takes three parameters:
		 *       <ul>
		 *         <li>{array|object} The data source for the row</li>
		 *         <li>{string} The type call data requested - this will be 'set' when
		 *           setting data or 'filter', 'display', 'type' or 'sort' when gathering
		 *           data.</li>
		 *         <li>{*} Data to set when the second parameter is 'set'.</li>
		 *       </ul>
		 *       The return value from the function is not required when 'set' is the type
		 *       of call, but otherwise the return is what will be used for the data
		 *       requested.</li>
		 *    </ul>
		 *  @type string|int|function|null
		 *  @default null <i>Use automatically calculated column index</i>
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Read table data from objects
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable( {
		 *        "sAjaxSource": "sources/deep.txt",
		 *        "aoColumns": [
		 *          { "mDataProp": "engine" },
		 *          { "mDataProp": "browser" },
		 *          { "mDataProp": "platform.inner" },
		 *          { "mDataProp": "platform.details.0" },
		 *          { "mDataProp": "platform.details.1" }
		 *        ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Using mDataProp as a function to provide different information for
		 *    // sorting, filtering and display. In this case, currency (price)
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable( {
		 *        "aoColumnDefs": [
		 *        {
		 *          "aTargets": [ 0 ],
		 *          "mDataProp": function ( source, type, val ) {
		 *            if (type === 'set') {
		 *              source.price = val;
		 *              // Store the computed dislay and filter values for efficiency
		 *              source.price_display = val=="" ? "" : "$"+numberFormat(val);
		 *              source.price_filter  = val=="" ? "" : "$"+numberFormat(val)+" "+val;
		 *              return;
		 *            }
		 *            else if (type === 'display') {
		 *              return source.price_display;
		 *            }
		 *            else if (type === 'filter') {
		 *              return source.price_filter;
		 *            }
		 *            // 'sort' and 'type' both just use the integer
		 *            return source.price;
		 *          }
		 *        ]
		 *      } );
		 *    } );
		 */
		"mDataProp": null,


		/**
		 * Class to give to each cell in this column.
		 *  @type string
		 *  @default <i>Empty string</i>
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Using aoColumnDefs
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumnDefs": [
		 *          { "sClass": "my_class", "aTargets": [ 0 ] }
		 *        ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Using aoColumns
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumns": [
		 *          { "sClass": "my_class" },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ]
		 *      } );
		 *    } );
		 */
		"sClass": "",

		/**
		 * When DataTables calculates the column widths to assign to each column,
		 * it finds the longest string in each column and then constructs a
		 * temporary table and reads the widths from that. The problem with this
		 * is that "mmm" is much wider then "iiii", but the latter is a longer
		 * string - thus the calculation can go wrong (doing it properly and putting
		 * it into an DOM object and measuring that is horribly(!) slow). Thus as
		 * a "work around" we provide this option. It will append its value to the
		 * text that is found to be the longest string for the column - i.e. padding.
		 * Generally you shouldn't need this, and it is not documented on the
		 * general DataTables.net documentation
		 *  @type string
		 *  @default <i>Empty string<i>
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Using aoColumns
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumns": [
		 *          null,
		 *          null,
		 *          null,
		 *          {
		 *            "sContentPadding": "mmm"
		 *          }
		 *        ]
		 *      } );
		 *    } );
		 */
		"sContentPadding": "",


		/**
		 * Allows a default value to be given for a column's data, and will be used
		 * whenever a null data source is encountered (this can be because mDataProp
		 * is set to null, or because the data source itself is null).
		 *  @type string
		 *  @default null
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Using aoColumnDefs
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumnDefs": [
		 *          {
		 *            "mDataProp": null,
		 *            "sDefaultContent": "Edit",
		 *            "aTargets": [ -1 ]
		 *          }
		 *        ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Using aoColumns
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumns": [
		 *          null,
		 *          null,
		 *          null,
		 *          {
		 *            "mDataProp": null,
		 *            "sDefaultContent": "Edit"
		 *          }
		 *        ]
		 *      } );
		 *    } );
		 */
		"sDefaultContent": null,


		/**
		 * This parameter is only used in DataTables' server-side processing. It can
		 * be exceptionally useful to know what columns are being displayed on the
		 * client side, and to map these to database fields. When defined, the names
		 * also allow DataTables to reorder information from the server if it comes
		 * back in an unexpected order (i.e. if you switch your columns around on the
		 * client-side, your server-side code does not also need updating).
		 *  @type string
		 *  @default <i>Empty string</i>
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Using aoColumnDefs
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumnDefs": [
		 *          { "sName": "engine", "aTargets": [ 0 ] },
		 *          { "sName": "browser", "aTargets": [ 1 ] },
		 *          { "sName": "platform", "aTargets": [ 2 ] },
		 *          { "sName": "version", "aTargets": [ 3 ] },
		 *          { "sName": "grade", "aTargets": [ 4 ] }
		 *        ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Using aoColumns
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumns": [
		 *          { "sName": "engine" },
		 *          { "sName": "browser" },
		 *          { "sName": "platform" },
		 *          { "sName": "version" },
		 *          { "sName": "grade" }
		 *        ]
		 *      } );
		 *    } );
		 */
		"sName": "",


		/**
		 * Defines a data source type for the sorting which can be used to read
		 * realtime information from the table (updating the internally cached
		 * version) prior to sorting. This allows sorting to occur on user editable
		 * elements such as form inputs.
		 *  @type string
		 *  @default std
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Using aoColumnDefs
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumnDefs": [
		 *          { "sSortDataType": "dom-text", "aTargets": [ 2, 3 ] },
		 *          { "sType": "numeric", "aTargets": [ 3 ] },
		 *          { "sSortDataType": "dom-select", "aTargets": [ 4 ] },
		 *          { "sSortDataType": "dom-checkbox", "aTargets": [ 5 ] }
		 *        ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Using aoColumns
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumns": [
		 *          null,
		 *          null,
		 *          { "sSortDataType": "dom-text" },
		 *          { "sSortDataType": "dom-text", "sType": "numeric" },
		 *          { "sSortDataType": "dom-select" },
		 *          { "sSortDataType": "dom-checkbox" }
		 *        ]
		 *      } );
		 *    } );
		 */
		"sSortDataType": "std",


		/**
		 * The title of this column.
		 *  @type string
		 *  @default null <i>Derived from the 'TH' value for this column in the
		 *    original HTML table.</i>
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Using aoColumnDefs
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumnDefs": [
		 *          { "sTitle": "My column title", "aTargets": [ 0 ] }
		 *        ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Using aoColumns
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumns": [
		 *          { "sTitle": "My column title" },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ]
		 *      } );
		 *    } );
		 */
		"sTitle": null,


		/**
		 * The type allows you to specify how the data for this column will be sorted.
		 * Four types (string, numeric, date and html (which will strip HTML tags
		 * before sorting)) are currently available. Note that only date formats
		 * understood by Javascript's Date() object will be accepted as type date. For
		 * example: "Mar 26, 2008 5:03 PM". May take the values: 'string', 'numeric',
		 * 'date' or 'html' (by default). Further types can be adding through
		 * plug-ins.
		 *  @type string
		 *  @default null <i>Auto-detected from raw data</i>
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Using aoColumnDefs
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumnDefs": [
		 *          { "sType": "html", "aTargets": [ 0 ] }
		 *        ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Using aoColumns
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumns": [
		 *          { "sType": "html" },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ]
		 *      } );
		 *    } );
		 */
		"sType": null,


		/**
		 * Defining the width of the column, this parameter may take any CSS value
		 * (3em, 20px etc). DataTables applys 'smart' widths to columns which have not
		 * been given a specific width through this interface ensuring that the table
		 * remains readable.
		 *  @type string
		 *  @default null <i>Automatic</i>
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Using aoColumnDefs
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumnDefs": [
		 *          { "sWidth": "20%", "aTargets": [ 0 ] }
		 *        ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Using aoColumns
		 *    $(document).ready(function() {
		 *      $('#example').dataTable( {
		 *        "aoColumns": [
		 *          { "sWidth": "20%" },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ]
		 *      } );
		 *    } );
		 */
		"sWidth": null
	};



	/**
	 * DataTables settings object - this holds all the information needed for a
	 * given table, including configuration, data and current application of the
	 * table options. DataTables does not have a single instance for each DataTable
	 * with the settings attached to that instance, but rather instances of the
	 * DataTable "class" are created on-the-fly as needed (typically by a
	 * $().dataTable() call) and the settings object is then applied to that
	 * instance.
	 *
	 * Note that this object is related to {@link DataTable.defaults} but this
	 * one is the internal data store for DataTables's cache of columns. It should
	 * NOT be manipulated outside of DataTables. Any configuration should be done
	 * through the initialisation options.
	 *  @namespace
	 *  @todo Really should attach the settings object to individual instances so we
	 *    don't need to create new instances on each $().dataTable() call (if the
	 *    table already exists). It would also save passing oSettings around and
	 *    into every single function. However, this is a very significant
	 *    architecture change for DataTables and will almost certainly break
	 *    backwards compatibility with older installations. This is something that
	 *    will be done in 2.0.
	 */
	DataTable.models.oSettings = {
		/**
		 * Primary features of DataTables and their enablement state.
		 *  @namespace
		 */
		"oFeatures": {

			/**
			 * Flag to say if DataTables should automatically try to calculate the
			 * optimum table and columns widths (true) or not (false).
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bAutoWidth": null,

			/**
			 * Delay the creation of TR and TD elements until they are actually
			 * needed by a driven page draw. This can give a significant speed
			 * increase for Ajax source and Javascript source data, but makes no
			 * difference at all fro DOM and server-side processing tables.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bDeferRender": null,

			/**
			 * Enable filtering on the table or not. Note that if this is disabled
			 * then there is no filtering at all on the table, including fnFilter.
			 * To just remove the filtering input use sDom and remove the 'f' option.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bFilter": null,

			/**
			 * Table information element (the 'Showing x of y records' div) enable
			 * flag.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bInfo": null,

			/**
			 * Present a user control allowing the end user to change the page size
			 * when pagination is enabled.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bLengthChange": null,

			/**
			 * Pagination enabled or not. Note that if this is disabled then length
			 * changing must also be disabled.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bPaginate": null,

			/**
			 * Processing indicator enable flag whenever DataTables is enacting a
			 * user request - typically an Ajax request for server-side processing.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bProcessing": null,

			/**
			 * Server-side processing enabled flag - when enabled DataTables will
			 * get all data from the server for every draw - there is no filtering,
			 * sorting or paging done on the client-side.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bServerSide": null,

			/**
			 * Sorting enablement flag.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bSort": null,

			/**
			 * Apply a class to the columns which are being sorted to provide a
			 * visual highlight or not. This can slow things down when enabled since
			 * there is a lot of DOM interaction.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bSortClasses": null,

			/**
			 * State saving enablement flag.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bStateSave": null
		},


		/**
		 * Scrolling settings for a table.
		 *  @namespace
		 */
		"oScroll": {
			/**
			 * Indicate if DataTables should be allowed to set the padding / margin
			 * etc for the scrolling header elements or not. Typically you will want
			 * this.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bAutoCss": null,

			/**
			 * When the table is shorter in height than sScrollY, collapse the
			 * table container down to the height of the table (when true).
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bCollapse": null,

			/**
			 * Infinite scrolling enablement flag. Now deprecated in favour of
			 * using the Scroller plug-in.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bInfinite": null,

			/**
			 * Width of the scrollbar for the web-browser's platform. Calculated
			 * during table initialisation.
			 *  @type int
			 *  @default 0
			 */
			"iBarWidth": 0,

			/**
			 * Space (in pixels) between the bottom of the scrolling container and
			 * the bottom of the scrolling viewport before the next page is loaded
			 * when using infinite scrolling.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type int
			 */
			"iLoadGap": null,

			/**
			 * Viewport width for horizontal scrolling. Horizontal scrolling is
			 * disabled if an empty string.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type string
			 */
			"sX": null,

			/**
			 * Width to expand the table to when using x-scrolling. Typically you
			 * should not need to use this.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type string
			 *  @deprecated
			 */
			"sXInner": null,

			/**
			 * Viewport height for vertical scrolling. Vertical scrolling is disabled
			 * if an empty string.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type string
			 */
			"sY": null
		},

		/**
		 * Language information for the table.
		 *  @namespace
		 *  @extends DataTable.defaults.oLanguage
		 */
		"oLanguage": {
			/**
			 * Information callback function. See
			 * {@link DataTable.defaults.fnInfoCallback}
			 *  @type function
			 *  @default
			 */
			"fnInfoCallback": null
		},

		/**
		 * Array referencing the nodes which are used for the features. The
		 * parameters of this object match what is allowed by sDom - i.e.
		 *   <ul>
		 *     <li>'l' - Length changing</li>
		 *     <li>'f' - Filtering input</li>
		 *     <li>'t' - The table!</li>
		 *     <li>'i' - Information</li>
		 *     <li>'p' - Pagination</li>
		 *     <li>'r' - pRocessing</li>
		 *   </ul>
		 *  @type array
		 *  @default []
		 */
		"aanFeatures": [],

		/**
		 * Store data information - see {@link DataTable.models.oRow} for detailed
		 * information.
		 *  @type array
		 *  @default []
		 */
		"aoData": [],

		/**
		 * Array of indexes which are in the current display (after filtering etc)
		 *  @type array
		 *  @default []
		 */
		"aiDisplay": [],

		/**
		 * Array of indexes for display - no filtering
		 *  @type array
		 *  @default []
		 */
		"aiDisplayMaster": [],

		/**
		 * Store information about each column that is in use
		 *  @type array
		 *  @default []
		 */
		"aoColumns": [],

		/**
		 * Store information about the table's header
		 *  @type array
		 *  @default []
		 */
		"aoHeader": [],

		/**
		 * Store information about the table's footer
		 *  @type array
		 *  @default []
		 */
		"aoFooter": [],

		/**
		 * Search data array for regular expression searching
		 *  @type array
		 *  @default []
		 */
		"asDataSearch": [],

		/**
		 * Store the applied global search information in case we want to force a
		 * research or compare the old search to a new one.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @namespace
		 *  @extends DataTable.models.oSearch
		 */
		"oPreviousSearch": {},

		/**
		 * Store the applied search for each column - see
		 * {@link DataTable.models.oSearch} for the format that is used for the
		 * filtering information for each column.
		 *  @type array
		 *  @default []
		 */
		"aoPreSearchCols": [],

		/**
		 * Sorting that is applied to the table. Note that the inner arrays are
		 * used in the following manner:
		 * <ul>
		 *   <li>Index 0 - column number</li>
		 *   <li>Index 1 - current sorting direction</li>
		 *   <li>Index 2 - index of asSorting for this column</li>
		 * </ul>
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type array
		 *  @todo These inner arrays should really be objects
		 */
		"aaSorting": null,

		/**
		 * Sorting that is always applied to the table (i.e. prefixed in front of
		 * aaSorting).
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type array|null
		 *  @default null
		 */
		"aaSortingFixed": null,

		/**
		 * Classes to use for the striping of a table.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type array
		 *  @default []
		 */
		"asStripeClasses": null,

		/**
		 * If restoring a table - we should restore its striping classes as well
		 *  @type array
		 *  @default []
		 */
		"asDestroyStripes": [],

		/**
		 * If restoring a table - we should restore its width
		 *  @type int
		 *  @default 0
		 */
		"sDestroyWidth": 0,

		/**
		 * Callback functions array for every time a row is inserted (i.e. on a draw).
		 *  @type array
		 *  @default []
		 */
		"aoRowCallback": [],

		/**
		 * Callback functions for the header on each draw.
		 *  @type array
		 *  @default []
		 */
		"aoHeaderCallback": [],

		/**
		 * Callback function for the footer on each draw.
		 *  @type array
		 *  @default []
		 */
		"aoFooterCallback": [],

		/**
		 * Array of callback functions for draw callback functions
		 *  @type array
		 *  @default []
		 */
		"aoDrawCallback": [],

		/**
		 * Array of callback functions for row created function
		 *  @type array
		 *  @default []
		 */
		"aoRowCreatedCallback": [],

		/**
		 * Callback functions for just before the table is redrawn. A return of
		 * false will be used to cancel the draw.
		 *  @type array
		 *  @default []
		 */
		"aoPreDrawCallback": [],

		/**
		 * Callback functions for when the table has been initialised.
		 *  @type array
		 *  @default []
		 */
		"aoInitComplete": [],


		/**
		 * Callbacks for modifying the settings to be stored for state saving, prior to
		 * saving state.
		 *  @type array
		 *  @default []
		 */
		"aoStateSaveParams": [],

		/**
		 * Callbacks for modifying the settings that have been stored for state saving
		 * prior to using the stored values to restore the state.
		 *  @type array
		 *  @default []
		 */
		"aoStateLoadParams": [],

		/**
		 * Callbacks for operating on the settings object once the saved state has been
		 * loaded
		 *  @type array
		 *  @default []
		 */
		"aoStateLoaded": [],

		/**
		 * Cache the table ID for quick access
		 *  @type string
		 *  @default <i>Empty string</i>
		 */
		"sTableId": "",

		/**
		 * The TABLE node for the main table
		 *  @type node
		 *  @default null
		 */
		"nTable": null,

		/**
		 * Permanent ref to the thead element
		 *  @type node
		 *  @default null
		 */
		"nTHead": null,

		/**
		 * Permanent ref to the tfoot element - if it exists
		 *  @type node
		 *  @default null
		 */
		"nTFoot": null,

		/**
		 * Permanent ref to the tbody element
		 *  @type node
		 *  @default null
		 */
		"nTBody": null,

		/**
		 * Cache the wrapper node (contains all DataTables controlled elements)
		 *  @type node
		 *  @default null
		 */
		"nTableWrapper": null,

		/**
		 * Indicate if when using server-side processing the loading of data
		 * should be deferred until the second draw.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type boolean
		 *  @default false
		 */
		"bDeferLoading": false,

		/**
		 * Indicate if all required information has been read in
		 *  @type boolean
		 *  @default false
		 */
		"bInitialised": false,

		/**
		 * Information about open rows. Each object in the array has the parameters
		 * 'nTr' and 'nParent'
		 *  @type array
		 *  @default []
		 */
		"aoOpenRows": [],

		/**
		 * Dictate the positioning of DataTables' control elements - see
		 * {@link DataTable.model.oInit.sDom}.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type string
		 *  @default null
		 */
		"sDom": null,

		/**
		 * Which type of pagination should be used.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type string
		 *  @default two_button
		 */
		"sPaginationType": "two_button",

		/**
		 * The cookie duration (for bStateSave) in seconds.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type int
		 *  @default 0
		 */
		"iCookieDuration": 0,

		/**
		 * The cookie name prefix.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type string
		 *  @default <i>Empty string</i>
		 */
		"sCookiePrefix": "",

		/**
		 * Callback function for cookie creation.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type function
		 *  @default null
		 */
		"fnCookieCallback": null,

		/**
		 * Array of callback functions for state saving. Each array element is an
		 * object with the following parameters:
		 *   <ul>
		 *     <li>function:fn - function to call. Takes two parameters, oSettings
		 *       and the JSON string to save that has been thus far created. Returns
		 *       a JSON string to be inserted into a json object
		 *       (i.e. '"param": [ 0, 1, 2]')</li>
		 *     <li>string:sName - name of callback</li>
		 *   </ul>
		 *  @type array
		 *  @default []
		 */
		"aoStateSave": [],

		/**
		 * Array of callback functions for state loading. Each array element is an
		 * object with the following parameters:
		 *   <ul>
		 *     <li>function:fn - function to call. Takes two parameters, oSettings
		 *       and the object stored. May return false to cancel state loading</li>
		 *     <li>string:sName - name of callback</li>
		 *   </ul>
		 *  @type array
		 *  @default []
		 */
		"aoStateLoad": [],

		/**
		 * State that was loaded from the cookie. Useful for back reference
		 *  @type object
		 *  @default null
		 */
		"oLoadedState": null,

		/**
		 * Source url for AJAX data for the table.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type string
		 *  @default null
		 */
		"sAjaxSource": null,

		/**
		 * Property from a given object from which to read the table data from. This
		 * can be an empty string (when not server-side processing), in which case
		 * it is  assumed an an array is given directly.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type string
		 */
		"sAjaxDataProp": null,

		/**
		 * Note if draw should be blocked while getting data
		 *  @type boolean
		 *  @default true
		 */
		"bAjaxDataGet": true,

		/**
		 * The last jQuery XHR object that was used for server-side data gathering.
		 * This can be used for working with the XHR information in one of the
		 * callbacks
		 *  @type object
		 *  @default null
		 */
		"jqXHR": null,

		/**
		 * Function to get the server-side data.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type function
		 */
		"fnServerData": null,

		/**
		 * Functions which are called prior to sending an Ajax request so extra
		 * parameters can easily be sent to the server
		 *  @type array
		 *  @default []
		 */
		"aoServerParams": [],

		/**
		 * Send the XHR HTTP method - GET or POST (could be PUT or DELETE if
		 * required).
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type string
		 */
		"sServerMethod": null,

		/**
		 * Format numbers for display.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type function
		 */
		"fnFormatNumber": null,

		/**
		 * List of options that can be used for the user selectable length menu.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type array
		 *  @default []
		 */
		"aLengthMenu": null,

		/**
		 * Counter for the draws that the table does. Also used as a tracker for
		 * server-side processing
		 *  @type int
		 *  @default 0
		 */
		"iDraw": 0,

		/**
		 * Indicate if a redraw is being done - useful for Ajax
		 *  @type boolean
		 *  @default false
		 */
		"bDrawing": false,

		/**
		 * Draw index (iDraw) of the last error when parsing the returned data
		 *  @type int
		 *  @default -1
		 */
		"iDrawError": -1,

		/**
		 * Paging display length
		 *  @type int
		 *  @default 10
		 */
		"_iDisplayLength": 10,

		/**
		 * Paging start point - aiDisplay index
		 *  @type int
		 *  @default 0
		 */
		"_iDisplayStart": 0,

		/**
		 * Paging end point - aiDisplay index. Use fnDisplayEnd rather than
		 * this property to get the end point
		 *  @type int
		 *  @default 10
		 *  @private
		 */
		"_iDisplayEnd": 10,

		/**
		 * Server-side processing - number of records in the result set
		 * (i.e. before filtering), Use fnRecordsTotal rather than
		 * this property to get the value of the number of records, regardless of
		 * the server-side processing setting.
		 *  @type int
		 *  @default 0
		 *  @private
		 */
		"_iRecordsTotal": 0,

		/**
		 * Server-side processing - number of records in the current display set
		 * (i.e. after filtering). Use fnRecordsDisplay rather than
		 * this property to get the value of the number of records, regardless of
		 * the server-side processing setting.
		 *  @type boolean
		 *  @default 0
		 *  @private
		 */
		"_iRecordsDisplay": 0,

		/**
		 * Flag to indicate if jQuery UI marking and classes should be used.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type boolean
		 */
		"bJUI": null,

		/**
		 * The classes to use for the table
		 *  @type object
		 *  @default {}
		 */
		"oClasses": {},

		/**
		 * Flag attached to the settings object so you can check in the draw
		 * callback if filtering has been done in the draw. Deprecated in favour of
		 * events.
		 *  @type boolean
		 *  @default false
		 *  @deprecated
		 */
		"bFiltered": false,

		/**
		 * Flag attached to the settings object so you can check in the draw
		 * callback if sorting has been done in the draw. Deprecated in favour of
		 * events.
		 *  @type boolean
		 *  @default false
		 *  @deprecated
		 */
		"bSorted": false,

		/**
		 * Indicate that if multiple rows are in the header and there is more than
		 * one unique cell per column, if the top one (true) or bottom one (false)
		 * should be used for sorting / title by DataTables.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type boolean
		 */
		"bSortCellsTop": null,

		/**
		 * Initialisation object that is used for the table
		 *  @type object
		 *  @default null
		 */
		"oInit": null,

		/**
		 * Destroy callback functions - for plug-ins to attach themselves to the
		 * destroy so they can clean up markup and events.
		 *  @type array
		 *  @default []
		 */
		"aoDestroyCallback": [],


		/**
		 * Get the number of records in the current record set, before filtering
		 *  @type function
		 */
		"fnRecordsTotal": function ()
		{
			if ( this.oFeatures.bServerSide ) {
				return parseInt(this._iRecordsTotal, 10);
			} else {
				return this.aiDisplayMaster.length;
			}
		},

		/**
		 * Get the number of records in the current record set, after filtering
		 *  @type function
		 */
		"fnRecordsDisplay": function ()
		{
			if ( this.oFeatures.bServerSide ) {
				return parseInt(this._iRecordsDisplay, 10);
			} else {
				return this.aiDisplay.length;
			}
		},

		/**
		 * Set the display end point - aiDisplay index
		 *  @type function
		 *  @todo Should do away with _iDisplayEnd and calculate it on-the-fly here
		 */
		"fnDisplayEnd": function ()
		{
			if ( this.oFeatures.bServerSide ) {
				if ( this.oFeatures.bPaginate === false || this._iDisplayLength == -1 ) {
					return this._iDisplayStart+this.aiDisplay.length;
				} else {
					return Math.min( this._iDisplayStart+this._iDisplayLength,
							this._iRecordsDisplay );
				}
			} else {
				return this._iDisplayEnd;
			}
		},

		/**
		 * The DataTables object for this table
		 *  @type object
		 *  @default null
		 */
		"oInstance": null,

		/**
		 * Unique identifier for each instance of the DataTables object. If there
		 * is an ID on the table node, then it takes that value, otherwise an
		 * incrementing internal counter is used.
		 *  @type string
		 *  @default null
		 */
		"sInstance": null,

		/**
		 * tabindex attribute value that is added to DataTables control elements, allowing
		 * keyboard navigation of the table and its controls.
		 */
		"iTabIndex": 0
	};

	/**
	 * Extension object for DataTables that is used to provide all extension options.
	 *
	 * Note that the <i>DataTable.ext</i> object is available through
	 * <i>jQuery.fn.dataTable.ext</i> where it may be accessed and manipulated. It is
	 * also aliased to <i>jQuery.fn.dataTableExt</i> for historic reasons.
	 *  @namespace
	 *  @extends DataTable.models.ext
	 */
	DataTable.ext = $.extend( true, {}, DataTable.models.ext );

	$.extend( DataTable.ext.oStdClasses, {
		"sTable": "dataTable",

		/* Two buttons buttons */
		"sPagePrevEnabled": "paginate_enabled_previous",
		"sPagePrevDisabled": "paginate_disabled_previous",
		"sPageNextEnabled": "paginate_enabled_next",
		"sPageNextDisabled": "paginate_disabled_next",
		"sPageJUINext": "",
		"sPageJUIPrev": "",

		/* Full numbers paging buttons */
		"sPageButton": "paginate_button",
		"sPageButtonActive": "paginate_active",
		"sPageButtonStaticDisabled": "paginate_button paginate_button_disabled",
		"sPageFirst": "first",
		"sPagePrevious": "previous",
		"sPageNext": "next",
		"sPageLast": "last",

		/* Striping classes */
		"sStripeOdd": "odd",
		"sStripeEven": "even",

		/* Empty row */
		"sRowEmpty": "dataTables_empty",

		/* Features */
		"sWrapper": "dataTables_wrapper",
		"sFilter": "dataTables_filter",
		"sInfo": "dataTables_info",
		"sPaging": "dataTables_paginate paging_", /* Note that the type is postfixed */
		"sLength": "dataTables_length",
		"sProcessing": "dataTables_processing",

		/* Sorting */
		"sSortAsc": "sorting_asc",
		"sSortDesc": "sorting_desc",
		"sSortable": "sorting", /* Sortable in both directions */
		"sSortableAsc": "sorting_asc_disabled",
		"sSortableDesc": "sorting_desc_disabled",
		"sSortableNone": "sorting_disabled",
		"sSortColumn": "sorting_", /* Note that an int is postfixed for the sorting order */
		"sSortJUIAsc": "",
		"sSortJUIDesc": "",
		"sSortJUI": "",
		"sSortJUIAscAllowed": "",
		"sSortJUIDescAllowed": "",
		"sSortJUIWrapper": "",
		"sSortIcon": "",

		/* Scrolling */
		"sScrollWrapper": "dataTables_scroll",
		"sScrollHead": "dataTables_scrollHead",
		"sScrollHeadInner": "dataTables_scrollHeadInner",
		"sScrollBody": "dataTables_scrollBody",
		"sScrollFoot": "dataTables_scrollFoot",
		"sScrollFootInner": "dataTables_scrollFootInner",

		/* Misc */
		"sFooterTH": ""
	} );


	$.extend( DataTable.ext.oJUIClasses, DataTable.ext.oStdClasses, {
		/* Two buttons buttons */
		"sPagePrevEnabled": "fg-button ui-button ui-state-default ui-corner-left",
		"sPagePrevDisabled": "fg-button ui-button ui-state-default ui-corner-left ui-state-disabled",
		"sPageNextEnabled": "fg-button ui-button ui-state-default ui-corner-right",
		"sPageNextDisabled": "fg-button ui-button ui-state-default ui-corner-right ui-state-disabled",
		"sPageJUINext": "ui-icon ui-icon-circle-arrow-e",
		"sPageJUIPrev": "ui-icon ui-icon-circle-arrow-w",

		/* Full numbers paging buttons */
		"sPageButton": "fg-button ui-button ui-state-default",
		"sPageButtonActive": "fg-button ui-button ui-state-default ui-state-disabled",
		"sPageButtonStaticDisabled": "fg-button ui-button ui-state-default ui-state-disabled",
		"sPageFirst": "first ui-corner-tl ui-corner-bl",
		"sPageLast": "last ui-corner-tr ui-corner-br",

		/* Features */
		"sPaging": "dataTables_paginate fg-buttonset ui-buttonset fg-buttonset-multi "+
				"ui-buttonset-multi paging_", /* Note that the type is postfixed */

		/* Sorting */
		"sSortAsc": "ui-state-default",
		"sSortDesc": "ui-state-default",
		"sSortable": "ui-state-default",
		"sSortableAsc": "ui-state-default",
		"sSortableDesc": "ui-state-default",
		"sSortableNone": "ui-state-default",
		"sSortJUIAsc": "css_right ui-icon ui-icon-triangle-1-n",
		"sSortJUIDesc": "css_right ui-icon ui-icon-triangle-1-s",
		"sSortJUI": "css_right ui-icon ui-icon-carat-2-n-s",
		"sSortJUIAscAllowed": "css_right ui-icon ui-icon-carat-1-n",
		"sSortJUIDescAllowed": "css_right ui-icon ui-icon-carat-1-s",
		"sSortJUIWrapper": "DataTables_sort_wrapper",
		"sSortIcon": "DataTables_sort_icon",

		/* Scrolling */
		"sScrollHead": "dataTables_scrollHead ui-state-default",
		"sScrollFoot": "dataTables_scrollFoot ui-state-default",

		/* Misc */
		"sFooterTH": "ui-state-default"
	} );


	/*
	 * Variable: oPagination
	 * Purpose:
	 * Scope:    jQuery.fn.dataTableExt
	 */
	$.extend( DataTable.ext.oPagination, {
		/*
		 * Variable: two_button
		 * Purpose:  Standard two button (forward/back) pagination
		 * Scope:    jQuery.fn.dataTableExt.oPagination
		 */
		"two_button": {
			/*
			 * Function: oPagination.two_button.fnInit
			 * Purpose:  Initialise dom elements required for pagination with forward/back buttons only
			 * Returns:  -
			 * Inputs:   object:oSettings - dataTables settings object
			 *           node:nPaging - the DIV which contains this pagination control
			 *           function:fnCallbackDraw - draw function which must be called on update
			 */
			"fnInit": function ( oSettings, nPaging, fnCallbackDraw )
			{
				var oLang = oSettings.oLanguage.oPaginate;
				var oClasses = oSettings.oClasses;
				var fnClickHandler = function ( e ) {
					if ( oSettings.oApi._fnPageChange( oSettings, e.data.action ) )
					{
						fnCallbackDraw( oSettings );
					}
				};

				var sAppend = (!oSettings.bJUI) ?
						'<a class="'+oSettings.oClasses.sPagePrevDisabled+'" tabindex="'+oSettings.iTabIndex+'" role="button">'+oLang.sPrevious+'</a>'+
								'<a class="'+oSettings.oClasses.sPageNextDisabled+'" tabindex="'+oSettings.iTabIndex+'" role="button">'+oLang.sNext+'</a>'
						:
						'<a class="'+oSettings.oClasses.sPagePrevDisabled+'" tabindex="'+oSettings.iTabIndex+'" role="button"><span class="'+oSettings.oClasses.sPageJUIPrev+'"></span></a>'+
								'<a class="'+oSettings.oClasses.sPageNextDisabled+'" tabindex="'+oSettings.iTabIndex+'" role="button"><span class="'+oSettings.oClasses.sPageJUINext+'"></span></a>';
				$(nPaging).append( sAppend );

				var els = $('a', nPaging);
				var nPrevious = els[0],
						nNext = els[1];

				oSettings.oApi._fnBindAction( nPrevious, {action: "previous"}, fnClickHandler );
				oSettings.oApi._fnBindAction( nNext,     {action: "next"},     fnClickHandler );

				/* ID the first elements only */
				if ( !oSettings.aanFeatures.p )
				{
					nPaging.id = oSettings.sTableId+'_paginate';
					nPrevious.id = oSettings.sTableId+'_previous';
					nNext.id = oSettings.sTableId+'_next';

					nPrevious.setAttribute('aria-controls', oSettings.sTableId);
					nNext.setAttribute('aria-controls', oSettings.sTableId);
				}
			},

			/*
			 * Function: oPagination.two_button.fnUpdate
			 * Purpose:  Update the two button pagination at the end of the draw
			 * Returns:  -
			 * Inputs:   object:oSettings - dataTables settings object
			 *           function:fnCallbackDraw - draw function to call on page change
			 */
			"fnUpdate": function ( oSettings, fnCallbackDraw )
			{
				if ( !oSettings.aanFeatures.p )
				{
					return;
				}

				var oClasses = oSettings.oClasses;
				var an = oSettings.aanFeatures.p;

				/* Loop over each instance of the pager */
				for ( var i=0, iLen=an.length ; i<iLen ; i++ )
				{
					if ( an[i].childNodes.length !== 0 )
					{
						an[i].childNodes[0].className = ( oSettings._iDisplayStart === 0 ) ?
								oClasses.sPagePrevDisabled : oClasses.sPagePrevEnabled;

						an[i].childNodes[1].className = ( oSettings.fnDisplayEnd() == oSettings.fnRecordsDisplay() ) ?
								oClasses.sPageNextDisabled : oClasses.sPageNextEnabled;
					}
				}
			}
		},


		/*
		 * Variable: iFullNumbersShowPages
		 * Purpose:  Change the number of pages which can be seen
		 * Scope:    jQuery.fn.dataTableExt.oPagination
		 */
		"iFullNumbersShowPages": 5,

		/*
		 * Variable: full_numbers
		 * Purpose:  Full numbers pagination
		 * Scope:    jQuery.fn.dataTableExt.oPagination
		 */
		"full_numbers": {
			/*
			 * Function: oPagination.full_numbers.fnInit
			 * Purpose:  Initialise dom elements required for pagination with a list of the pages
			 * Returns:  -
			 * Inputs:   object:oSettings - dataTables settings object
			 *           node:nPaging - the DIV which contains this pagination control
			 *           function:fnCallbackDraw - draw function which must be called on update
			 */
			"fnInit": function ( oSettings, nPaging, fnCallbackDraw )
			{
				var oLang = oSettings.oLanguage.oPaginate;
				var oClasses = oSettings.oClasses;
				var fnClickHandler = function ( e ) {
					if ( oSettings.oApi._fnPageChange( oSettings, e.data.action ) )
					{
						fnCallbackDraw( oSettings );
					}
				};

				$(nPaging).append(
						'<a  tabindex="'+oSettings.iTabIndex+'" class="'+oClasses.sPageButton+" "+oClasses.sPageFirst+'">'+oLang.sFirst+'</a>'+
								'<a  tabindex="'+oSettings.iTabIndex+'" class="'+oClasses.sPageButton+" "+oClasses.sPagePrevious+'">'+oLang.sPrevious+'</a>'+
								'<span></span>'+
								'<a tabindex="'+oSettings.iTabIndex+'" class="'+oClasses.sPageButton+" "+oClasses.sPageNext+'">'+oLang.sNext+'</a>'+
								'<a tabindex="'+oSettings.iTabIndex+'" class="'+oClasses.sPageButton+" "+oClasses.sPageLast+'">'+oLang.sLast+'</a>'
				);
				var els = $('a', nPaging);
				var nFirst = els[0],
						nPrev = els[1],
						nNext = els[2],
						nLast = els[3];

				oSettings.oApi._fnBindAction( nFirst, {action: "first"},    fnClickHandler );
				oSettings.oApi._fnBindAction( nPrev,  {action: "previous"}, fnClickHandler );
				oSettings.oApi._fnBindAction( nNext,  {action: "next"},     fnClickHandler );
				oSettings.oApi._fnBindAction( nLast,  {action: "last"},     fnClickHandler );

				/* ID the first elements only */
				if ( !oSettings.aanFeatures.p )
				{
					nPaging.id = oSettings.sTableId+'_paginate';
					nFirst.id =oSettings.sTableId+'_first';
					nPrev.id =oSettings.sTableId+'_previous';
					nNext.id =oSettings.sTableId+'_next';
					nLast.id =oSettings.sTableId+'_last';
				}
			},

			/*
			 * Function: oPagination.full_numbers.fnUpdate
			 * Purpose:  Update the list of page buttons shows
			 * Returns:  -
			 * Inputs:   object:oSettings - dataTables settings object
			 *           function:fnCallbackDraw - draw function to call on page change
			 */
			"fnUpdate": function ( oSettings, fnCallbackDraw )
			{
				if ( !oSettings.aanFeatures.p )
				{
					return;
				}

				var iPageCount = DataTable.ext.oPagination.iFullNumbersShowPages;
				var iPageCountHalf = Math.floor(iPageCount / 2);
				var iPages = Math.ceil((oSettings.fnRecordsDisplay()) / oSettings._iDisplayLength);
				var iCurrentPage = Math.ceil(oSettings._iDisplayStart / oSettings._iDisplayLength) + 1;
				var sList = "";
				var iStartButton, iEndButton, i, iLen;
				var oClasses = oSettings.oClasses;
				var anButtons, anStatic, nPaginateList;
				var an = oSettings.aanFeatures.p;
				var fnBind = function (j) {
					oSettings.oApi._fnBindAction( this, {"page": j+iStartButton-1}, function(e) {
						/* Use the information in the element to jump to the required page */
						oSettings.oApi._fnPageChange( oSettings, e.data.page );
						fnCallbackDraw( oSettings );
						e.preventDefault();
					} );
				};

				/* Pages calculation */
				if (iPages < iPageCount)
				{
					iStartButton = 1;
					iEndButton = iPages;
				}
				else if (iCurrentPage <= iPageCountHalf)
				{
					iStartButton = 1;
					iEndButton = iPageCount;
				}
				else if (iCurrentPage >= (iPages - iPageCountHalf))
				{
					iStartButton = iPages - iPageCount + 1;
					iEndButton = iPages;
				}
				else
				{
					iStartButton = iCurrentPage - Math.ceil(iPageCount / 2) + 1;
					iEndButton = iStartButton + iPageCount - 1;
				}

				/* Build the dynamic list */
				for ( i=iStartButton ; i<=iEndButton ; i++ )
				{
					sList += (iCurrentPage !== i) ?
							'<a tabindex="'+oSettings.iTabIndex+'" class="'+oClasses.sPageButton+'">'+oSettings.fnFormatNumber(i)+'</a>' :
							'<a tabindex="'+oSettings.iTabIndex+'" class="'+oClasses.sPageButtonActive+'">'+oSettings.fnFormatNumber(i)+'</a>';
				}

				/* Loop over each instance of the pager */
				for ( i=0, iLen=an.length ; i<iLen ; i++ )
				{
					if ( an[i].childNodes.length === 0 )
					{
						continue;
					}

					/* Build up the dynamic list forst - html and listeners */
					$('span:eq(0)', an[i])
							.html( sList )
							.children('a').each( fnBind );

					/* Update the premanent botton's classes */
					anButtons = an[i].getElementsByTagName('a');
					anStatic = [
						anButtons[0], anButtons[1],
						anButtons[anButtons.length-2], anButtons[anButtons.length-1]
					];

					$(anStatic).removeClass( oClasses.sPageButton+" "+oClasses.sPageButtonActive+" "+oClasses.sPageButtonStaticDisabled );
					$([anStatic[0], anStatic[1]]).addClass(
							(iCurrentPage==1) ?
									oClasses.sPageButtonStaticDisabled :
									oClasses.sPageButton
					);
					$([anStatic[2], anStatic[3]]).addClass(
							(iPages===0 || iCurrentPage===iPages || oSettings._iDisplayLength===-1) ?
									oClasses.sPageButtonStaticDisabled :
									oClasses.sPageButton
					);
				}
			}
		}
	} );

	$.extend( DataTable.ext.oSort, {
		/*
		 * text sorting
		 */
		"string-pre": function ( a )
		{
			if ( typeof a != 'string' ) { a = ''; }
			return a.toLowerCase();
		},

		"string-asc": function ( x, y )
		{
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		},

		"string-desc": function ( x, y )
		{
			return ((x < y) ? 1 : ((x > y) ? -1 : 0));
		},


		/*
		 * html sorting (ignore html tags)
		 */
		"html-pre": function ( a )
		{
			return a.replace( /<.*?>/g, "" ).toLowerCase();
		},

		"html-asc": function ( x, y )
		{
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		},

		"html-desc": function ( x, y )
		{
			return ((x < y) ? 1 : ((x > y) ? -1 : 0));
		},


		/*
		 * date sorting
		 */
		"date-pre": function ( a )
		{
			var x = Date.parse( a );

			if ( isNaN(x) || x==="" )
			{
				x = Date.parse( "01/01/1970 00:00:00" );
			}
			return x;
		},

		"date-asc": function ( x, y )
		{
			return x - y;
		},

		"date-desc": function ( x, y )
		{
			return y - x;
		},


		/*
		 * numerical sorting
		 */
		"numeric-pre": function ( a )
		{
			return (a=="-" || a==="") ? 0 : a*1;
		},

		"numeric-asc": function ( x, y )
		{
			return x - y;
		},

		"numeric-desc": function ( x, y )
		{
			return y - x;
		}
	} );


	$.extend( DataTable.ext.aTypes, [
		/*
		 * Function: -
		 * Purpose:  Check to see if a string is numeric
		 * Returns:  string:'numeric' or null
		 * Inputs:   mixed:sText - string to check
		 */
		function ( sData )
		{
			/* Allow zero length strings as a number */
			if ( typeof sData === 'number' )
			{
				return 'numeric';
			}
			else if ( typeof sData !== 'string' )
			{
				return null;
			}

			var sValidFirstChars = "0123456789-";
			var sValidChars = "0123456789.";
			var Char;
			var bDecimal = false;

			/* Check for a valid first char (no period and allow negatives) */
			Char = sData.charAt(0);
			if (sValidFirstChars.indexOf(Char) == -1)
			{
				return null;
			}

			/* Check all the other characters are valid */
			for ( var i=1 ; i<sData.length ; i++ )
			{
				Char = sData.charAt(i);
				if (sValidChars.indexOf(Char) == -1)
				{
					return null;
				}

				/* Only allowed one decimal place... */
				if ( Char == "." )
				{
					if ( bDecimal )
					{
						return null;
					}
					bDecimal = true;
				}
			}

			return 'numeric';
		},

		/*
		 * Function: -
		 * Purpose:  Check to see if a string is actually a formatted date
		 * Returns:  string:'date' or null
		 * Inputs:   string:sText - string to check
		 */
		function ( sData )
		{
			var iParse = Date.parse(sData);
			if ( (iParse !== null && !isNaN(iParse)) || (typeof sData === 'string' && sData.length === 0) )
			{
				return 'date';
			}
			return null;
		},

		/*
		 * Function: -
		 * Purpose:  Check to see if a string should be treated as an HTML string
		 * Returns:  string:'html' or null
		 * Inputs:   string:sText - string to check
		 */
		function ( sData )
		{
			if ( typeof sData === 'string' && sData.indexOf('<') != -1 && sData.indexOf('>') != -1 )
			{
				return 'html';
			}
			return null;
		}
	] );


	// jQuery aliases
	$.fn.DataTable = DataTable;
	$.fn.dataTable = DataTable;
	$.fn.dataTableSettings = DataTable.settings;
	$.fn.dataTableExt = DataTable.ext;


	// Information about events fired by DataTables - for documentation.
	/**
	 * Draw event, fired whenever the table is redrawn on the page, at the same point as
	 * fnDrawCallback. This may be useful for binding events or performing calculations when
	 * the table is altered at all.
	 *  @name DataTable#draw
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
	 */

	/**
	 * Filter event, fired when the filtering applied to the table (using the build in global
	 * global filter, or column filters) is altered.
	 *  @name DataTable#filter
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
	 */

	/**
	 * Page change event, fired when the paging of the table is altered.
	 *  @name DataTable#page
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
	 */

	/**
	 * Sort event, fired when the sorting applied to the table is altered.
	 *  @name DataTable#sort
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
	 */

	/**
	 * DataTables initialisation complete event, fired when the table is fully drawn,
	 * including Ajax data loaded, if Ajax data is required.
	 *  @name DataTable#init
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} oSettings DataTables settings object
	 *  @param {object} json The JSON object request from the server - only
	 *    present if client-side Ajax sourced data is used</li></ol>
	 */

	/**
	 * State save event, fired when the table has changed state a new state save is required.
	 * This method allows modification of the state saving object prior to actually doing the
	 * save, including addition or other state properties (for plug-ins) or modification
	 * of a DataTables core property.
	 *  @name DataTable#stateSaveParams
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} oSettings DataTables settings object
	 *  @param {object} json The state information to be saved
	 */

	/**
	 * State load event, fired when the table is loading state from the stored data, but
	 * prior to the settings object being modified by the saved state - allowing modification
	 * of the saved state is required or loading of state for a plug-in.
	 *  @name DataTable#stateLoadParams
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} oSettings DataTables settings object
	 *  @param {object} json The saved state information
	 */

	/**
	 * State loaded event, fired when state has been loaded from stored data and the settings
	 * object has been modified by the loaded data.
	 *  @name DataTable#stateLoaded
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} oSettings DataTables settings object
	 *  @param {object} json The saved state information
	 */

	/**
	 * Processing event, fired when DataTables is doing some kind of processing (be it,
	 * sort, filter or anything else). Can be used to indicate to the end user that
	 * there is something happening, or that something has finished.
	 *  @name DataTable#processing
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} oSettings DataTables settings object
	 *  @param {boolean} bShow Flag for if DataTables is doing processing or not
	 */

	/**
	 * Ajax (XHR) event, fired whenever an Ajax request is completed from a request to
	 * made to the server for new data (note that this trigger is called in fnServerData,
	 * if you override fnServerData and which to use this event, you need to trigger it in
	 * you success function).
	 *  @name DataTable#xhr
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
	 */
}(jQuery, window, document, undefined));/**
 * @preserve jquery.layout 1.3.0 - Release Candidate 30.3
 * $Date: 2012-03-10 08:00:00 (Sat, 10 Mar 2012) $
 * $Rev: 303003 $
 *
 * Copyright (c) 2012
 *   Fabrizio Balliano (http://www.fabrizioballiano.net)
 *   Kevin Dalman (http://allpro.net)
 *
 * Dual licensed under the GPL (http://www.gnu.org/licenses/gpl.html)
 * and MIT (http://www.opensource.org/licenses/mit-license.php) licenses.
 *
 * Changelog: http://layout.jquery-dev.net/changelog.cfm#1.3.0.rc30.3
 *
 * Docs: http://layout.jquery-dev.net/documentation.html
 * Tips: http://layout.jquery-dev.net/tips.html
 * Help: http://groups.google.com/group/jquery-ui-layout
 */

/* JavaDoc Info: http://code.google.com/closure/compiler/docs/js-for-compiler.html
 * {!Object}	non-nullable type (never NULL)
 * {?string}	nullable type (sometimes NULL) - default for {Object}
 * {number=}	optional parameter
 * {*}			ALL types
 */

// NOTE: For best readability, view with a fixed-width font and tabs equal to 4-chars

;(function ($) {

// alias Math methods - used a lot!
	var	min		= Math.min
			,	max		= Math.max
			,	round	= Math.floor
			;
	function isStr (v) { return $.type(v) === "string"; }

	function runPluginCallbacks (Instance, a_fn) {
		if ($.isArray(a_fn))
			for (var i=0, c=a_fn.length; i<c; i++) {
				var fn = a_fn[i];
				try {
					if (isStr(fn)) // 'name' of a function
						fn = eval(fn);
					if ($.isFunction(fn))
						fn( Instance );
				} catch (ex) {}
			}
	};


	/*
	 *	GENERIC $.layout METHODS - used by all layouts
	 */
	$.layout = {

		version:	"1.3.rc30.3"
		,	revision:	0.033003 // 1.3.0 final = 1.0300 - major(n+).minor(nn)+patch(nn+)

		// LANGUAGE CUSTOMIZATION
		,	language: {
			//	Tips and messages for resizers, togglers, custom buttons, etc.
			Open:			"Open"	// eg: "Open Pane"
			,	Close:			"Close"
			,	Resize:			"Resize"
			,	Slide:			"Slide Open"
			,	Pin:			"Pin"
			,	Unpin:			"Un-Pin"
			,	noRoomToOpenTip: "Not enough room to show this pane."
			,	minSizeWarning:	"Panel has reached its minimum size"
			,	maxSizeWarning:	"Panel has reached its maximum size"
			//	Developer error messages
			,	pane:					"pane"		// description of "layout pane element"
			,	selector:				"selector"	// description of "jQuery-selector"
			,	errButton:				"Error Adding Button \n\nInvalid "
			,	errContainerMissing:	"UI Layout Initialization Error\n\nThe specified layout-container does not exist."
			,	errCenterPaneMissing:	"UI Layout Initialization Error\n\nThe center-pane element does not exist.\n\nThe center-pane is a required element."
			,	errContainerHeight:		"UI Layout Initialization Warning\n\nThe layout-container \"CONTAINER\" has no height.\n\nTherefore the layout is 0-height and hence 'invisible'!"
		}

		// can update code here if $.browser is phased out
		,	browser: {
			mozilla:	!!$.browser.mozilla
			,	webkit:		!!$.browser.webkit || !!$.browser.safari // webkit = jQ 1.4
			,	msie:		!!$.browser.msie
			,	isIE6:		!!$.browser.msie && $.browser.version === 6
			,	version:	$.browser.version // not used in Layout core, but may be used by plugins
		}

		// *PREDEFINED* EFFECTS & DEFAULTS
		// MUST list effect here - OR MUST set an fxSettings option (can be an empty hash: {})
		,	effects: {

			//	Pane Open/Close Animations
			slide: {
				all:	{ duration:  "fast"	} // eg: duration: 1000, easing: "easeOutBounce"
				,	north:	{ direction: "up"	}
				,	south:	{ direction: "down"	}
				,	east:	{ direction: "right"}
				,	west:	{ direction: "left"	}
			}
			,	drop: {
				all:	{ duration:  "slow"	} // eg: duration: 1000, easing: "easeOutQuint"
				,	north:	{ direction: "up"	}
				,	south:	{ direction: "down"	}
				,	east:	{ direction: "right"}
				,	west:	{ direction: "left"	}
			}
			,	scale: {
				all:	{ duration:	"fast"	}
			}
			//	these are not recommended, but can be used
			,	blind:		{}
			,	clip:		{}
			,	explode:	{}
			,	fade:		{}
			,	fold:		{}
			,	puff:		{}

			//	Pane Resize Animations
			,	size: {
				all:	{ easing:	"swing"	}
			}
		}

		// INTERNAL CONFIG DATA - DO NOT CHANGE THIS!
		,	config: {
			optionRootKeys:	"effects,panes,north,south,west,east,center".split(",")
			,	allPanes:		"north,south,west,east,center".split(",")
			,	borderPanes:	"north,south,west,east".split(",")
			,	oppositeEdge: {
				north:	"south"
				,	south:	"north"
				,	east: 	"west"
				,	west: 	"east"
			}
			//	CSS used in multiple places
			,	hidden:  { visibility: "hidden" }
			,	visible: { visibility: "visible" }
			//	layout element settings
			,	resizers: {
				cssReq: {
					position: 	"absolute"
					,	padding: 	0
					,	margin: 	0
					,	fontSize:	"1px"
					,	textAlign:	"left"	// to counter-act "center" alignment!
					,	overflow: 	"hidden" // prevent toggler-button from overflowing
					//	SEE $.layout.defaults.zIndexes.resizer_normal
				}
				,	cssDemo: { // DEMO CSS - applied if: options.PANE.applyDemoStyles=true
					background: "#DDD"
					,	border:		"none"
				}
			}
			,	togglers: {
				cssReq: {
					position: 	"absolute"
					,	display: 	"block"
					,	padding: 	0
					,	margin: 	0
					,	overflow:	"hidden"
					,	textAlign:	"center"
					,	fontSize:	"1px"
					,	cursor: 	"pointer"
					,	zIndex: 	1
				}
				,	cssDemo: { // DEMO CSS - applied if: options.PANE.applyDemoStyles=true
					background: "#AAA"
				}
			}
			,	content: {
				cssReq: {
					position:	"relative" /* contain floated or positioned elements */
				}
				,	cssDemo: { // DEMO CSS - applied if: options.PANE.applyDemoStyles=true
					overflow:	"auto"
					,	padding:	"10px"
				}
				,	cssDemoPane: { // DEMO CSS - REMOVE scrolling from 'pane' when it has a content-div
					overflow:	"hidden"
					,	padding:	0
				}
			}
			,	panes: { // defaults for ALL panes - overridden by 'per-pane settings' below
				cssReq: {
					position: 	"absolute"
					,	margin:		0
					//	$.layout.defaults.zIndexes.pane_normal
				}
				,	cssDemo: { // DEMO CSS - applied if: options.PANE.applyDemoStyles=true
					padding:	"10px"
					,	background:	"#FFF"
					,	border:		"1px solid #BBB"
					,	overflow:	"auto"
				}
			}
			,	north: {
				side:			"Top"
				,	sizeType:		"Height"
				,	dir:			"horz"
				,	cssReq: {
					top: 		0
					,	bottom: 	"auto"
					,	left: 		0
					,	right: 		0
					,	width: 		"auto"
					//	height: 	DYNAMIC
				}
			}
			,	south: {
				side:			"Bottom"
				,	sizeType:		"Height"
				,	dir:			"horz"
				,	cssReq: {
					top: 		"auto"
					,	bottom: 	0
					,	left: 		0
					,	right: 		0
					,	width: 		"auto"
					//	height: 	DYNAMIC
				}
			}
			,	east: {
				side:			"Right"
				,	sizeType:		"Width"
				,	dir:			"vert"
				,	cssReq: {
					left: 		"auto"
					,	right: 		0
					,	top: 		"auto" // DYNAMIC
					,	bottom: 	"auto" // DYNAMIC
					,	height: 	"auto"
					//	width: 		DYNAMIC
				}
			}
			,	west: {
				side:			"Left"
				,	sizeType:		"Width"
				,	dir:			"vert"
				,	cssReq: {
					left: 		0
					,	right: 		"auto"
					,	top: 		"auto" // DYNAMIC
					,	bottom: 	"auto" // DYNAMIC
					,	height: 	"auto"
					//	width: 		DYNAMIC
				}
			}
			,	center: {
				dir:			"center"
				,	cssReq: {
					left: 		"auto" // DYNAMIC
					,	right: 		"auto" // DYNAMIC
					,	top: 		"auto" // DYNAMIC
					,	bottom: 	"auto" // DYNAMIC
					,	height: 	"auto"
					,	width: 		"auto"
				}
			}
		}

		// CALLBACK FUNCTION NAMESPACE - used to store reusable callback functions
		,	callbacks: {}

		// LAYOUT-PLUGIN REGISTRATION
		// more plugins can added beyond this default list
		,	plugins: {
			draggable:		!!$.fn.draggable // resizing
			,	effects: {
				core:		!!$.effects		// animimations (specific effects tested by initOptions)
				,	slide:		$.effects && $.effects.slide // default effect
			}
		}

//	arrays of plugin or other methods to be triggered for events in *each layout* - will be passed 'Instance'
		,	onCreate:	[]	// runs when layout is just starting to be created - right after options are set
		,	onLoad:		[]	// runs after layout container and global events init, but before initPanes is called
		,	onReady:	[]	// runs after initialization *completes* - ie, after initPanes completes successfully
		,	onDestroy:	[]	// runs after layout is destroyed
		,	onUnload:	[]	// runs after layout is destroyed OR when page unloads
		,	afterOpen:	[]	// runs after setAsOpen() completes
		,	afterClose:	[]	// runs after setAsClosed() completes

		/*
		 *	GENERIC UTILITY METHODS
		 */

		// calculate and return the scrollbar width, as an integer
		,	scrollbarWidth:		function () { return window.scrollbarWidth  || $.layout.getScrollbarSize('width'); }
		,	scrollbarHeight:	function () { return window.scrollbarHeight || $.layout.getScrollbarSize('height'); }
		,	getScrollbarSize:	function (dim) {
			var $c	= $('<div style="position: absolute; top: -10000px; left: -10000px; width: 100px; height: 100px; overflow: scroll;"></div>').appendTo("body");
			var d	= { width: $c.width() - $c[0].clientWidth, height: $c.height() - $c[0].clientHeight };
			$c.remove();
			window.scrollbarWidth	= d.width;
			window.scrollbarHeight	= d.height;
			return dim.match(/^(width|height)$/) ? d[dim] : d;
		}


		/**
		 * Returns hash container 'display' and 'visibility'
		 *
		 * @see	$.swap() - swaps CSS, runs callback, resets CSS
		 */
		,	showInvisibly: function ($E, force) {
			if (!$E) return {};
			if (!$E.jquery) $E = $($E);
			var CSS = {
				display:	$E.css('display')
				,	visibility:	$E.css('visibility')
			};
			if (force || CSS.display === "none") { // only if not *already hidden*
				$E.css({ display: "block", visibility: "hidden" }); // show element 'invisibly' so can be measured
				return CSS;
			}
			else return {};
		}

		/**
		 * Returns data for setting size of an element (container or a pane).
		 *
		 * @see  _create(), onWindowResize() for container, plus others for pane
		 * @return JSON  Returns a hash of all dimensions: top, bottom, left, right, outerWidth, innerHeight, etc
		 */
		,	getElementDimensions: function ($E) {
			var
					d	= {}			// dimensions hash
					,	x	= d.css = {}	// CSS hash
					,	i	= {}			// TEMP insets
					,	b, p				// TEMP border, padding
					,	N	= $.layout.cssNum
					,	off = $E.offset()
					;
			d.offsetLeft = off.left;
			d.offsetTop  = off.top;

			$.each("Left,Right,Top,Bottom".split(","), function (idx, e) { // e = edge
				b = x["border" + e] = $.layout.borderWidth($E, e);
				p = x["padding"+ e] = $.layout.cssNum($E, "padding"+e);
				i[e] = b + p; // total offset of content from outer side
				d["inset"+ e] = p;
			});

			d.offsetWidth	= $E.innerWidth();	// offsetWidth is used in calc when doing manual resize
			d.offsetHeight	= $E.innerHeight();	// ditto
			d.outerWidth	= $E.outerWidth();
			d.outerHeight	= $E.outerHeight();
			d.innerWidth	= max(0, d.outerWidth  - i.Left - i.Right);
			d.innerHeight	= max(0, d.outerHeight - i.Top  - i.Bottom);

			x.width		= $E.width();
			x.height	= $E.height();
			x.top		= N($E,"top",true);
			x.bottom	= N($E,"bottom",true);
			x.left		= N($E,"left",true);
			x.right		= N($E,"right",true);

			//d.visible	= $E.is(":visible");// && x.width > 0 && x.height > 0;

			return d;
		}

		,	getElementCSS: function ($E, list) {
			var
					CSS	= {}
					,	style	= $E[0].style
					,	props	= list.split(",")
					,	sides	= "Top,Bottom,Left,Right".split(",")
					,	attrs	= "Color,Style,Width".split(",")
					,	p, s, a, i, j, k
					;
			for (i=0; i < props.length; i++) {
				p = props[i];
				if (p.match(/(border|padding|margin)$/))
					for (j=0; j < 4; j++) {
						s = sides[j];
						if (p === "border")
							for (k=0; k < 3; k++) {
								a = attrs[k];
								CSS[p+s+a] = style[p+s+a];
							}
						else
							CSS[p+s] = style[p+s];
					}
				else
					CSS[p] = style[p];
			};
			return CSS
		}

		/**
		 * Return the innerWidth for the current browser/doctype
		 *
		 * @see  initPanes(), sizeMidPanes(), initHandles(), sizeHandles()
		 * @param  {Array.<Object>}	$E  Must pass a jQuery object - first element is processed
		 * @param  {number=}			outerWidth (optional) Can pass a width, allowing calculations BEFORE element is resized
		 * @return {number}			Returns the innerWidth of the elem by subtracting padding and borders
		 */
		,	cssWidth: function ($E, outerWidth) {
			var
					b = $.layout.borderWidth
					,	n = $.layout.cssNum
					;
			// a 'calculated' outerHeight can be passed so borders and/or padding are removed if needed
			if (outerWidth <= 0) return 0;

			if (!$.support.boxModel) return outerWidth;

			// strip border and padding from outerWidth to get CSS Width
			var W = outerWidth
					- b($E, "Left")
					- b($E, "Right")
					- n($E, "paddingLeft")
					- n($E, "paddingRight")
					;

			return max(0,W);
		}

		/**
		 * Return the innerHeight for the current browser/doctype
		 *
		 * @see  initPanes(), sizeMidPanes(), initHandles(), sizeHandles()
		 * @param  {Array.<Object>}	$E  Must pass a jQuery object - first element is processed
		 * @param  {number=}			outerHeight  (optional) Can pass a width, allowing calculations BEFORE element is resized
		 * @return {number}			Returns the innerHeight of the elem by subtracting padding and borders
		 */
		,	cssHeight: function ($E, outerHeight) {
			var
					b = $.layout.borderWidth
					,	n = $.layout.cssNum
					;
			// a 'calculated' outerHeight can be passed so borders and/or padding are removed if needed
			if (outerHeight <= 0) return 0;

			if (!$.support.boxModel) return outerHeight;

			// strip border and padding from outerHeight to get CSS Height
			var H = outerHeight
					- b($E, "Top")
					- b($E, "Bottom")
					- n($E, "paddingTop")
					- n($E, "paddingBottom")
					;

			return max(0,H);
		}

		/**
		 * Returns the 'current CSS numeric value' for a CSS property - 0 if property does not exist
		 *
		 * @see  Called by many methods
		 * @param {Array.<Object>}	$E					Must pass a jQuery object - first element is processed
		 * @param {string}			prop				The name of the CSS property, eg: top, width, etc.
		 * @param {boolean=}			[allowAuto=false]	true = return 'auto' if that is value; false = return 0
		 * @return {(string|number)}						Usually used to get an integer value for position (top, left) or size (height, width)
		 */
		,	cssNum: function ($E, prop, allowAuto) {
			if (!$E.jquery) $E = $($E);
			var CSS = $.layout.showInvisibly($E)
					,	p	= $.curCSS($E[0], prop, true)
					,	v	= allowAuto && p=="auto" ? p : (parseInt(p, 10) || 0);
			$E.css( CSS ); // RESET
			return v;
		}

		,	borderWidth: function (el, side) {
			if (el.jquery) el = el[0];
			var b = "border"+ side.substr(0,1).toUpperCase() + side.substr(1); // left => Left
			return $.curCSS(el, b+"Style", true) === "none" ? 0 : (parseInt($.curCSS(el, b+"Width", true), 10) || 0);
		}

		/**
		 * Mouse-tracking utility - FUTURE REFERENCE
		 *
		 * init: if (!window.mouse) {
		 *			window.mouse = { x: 0, y: 0 };
		 *			$(document).mousemove( $.layout.trackMouse );
		 *		}
		 *
		 * @param {Object}		evt
		 *
		 ,	trackMouse: function (evt) {
		 window.mouse = { x: evt.clientX, y: evt.clientY };
		 }
		 */

		/**
		 * SUBROUTINE for preventPrematureSlideClose option
		 *
		 * @param {Object}		evt
		 * @param {Object=}		el
		 */
		,	isMouseOverElem: function (evt, el) {
			var
					$E	= $(el || this)
					,	d	= $E.offset()
					,	T	= d.top
					,	L	= d.left
					,	R	= L + $E.outerWidth()
					,	B	= T + $E.outerHeight()
					,	x	= evt.pageX	// evt.clientX ?
					,	y	= evt.pageY	// evt.clientY ?
					;
			// if X & Y are < 0, probably means is over an open SELECT
			return ($.layout.browser.msie && x < 0 && y < 0) || ((x >= L && x <= R) && (y >= T && y <= B));
		}

		/**
		 * Message/Logging Utility
		 *
		 * @example $.layout.msg("My message");				// log text
		 * @example $.layout.msg("My message", true);		// alert text
		 * @example $.layout.msg({ foo: "bar" }, "Title");	// log hash-data, with custom title
		 * @example $.layout.msg({ foo: "bar" }, true, "Title", { sort: false }); -OR-
		 * @example $.layout.msg({ foo: "bar" }, "Title", { sort: false, display: true }); // alert hash-data
		 *
		 * @param {(Object|string)}			info			String message OR Hash/Array
		 * @param {(Boolean|string|Object)=}	[popup=false]	True means alert-box - can be skipped
		 * @param {(Object|string)=}			[debugTitle=""]	Title for Hash data - can be skipped
		 * @param {Object=}					[debutOpts={}]	Extra options for debug output
		 */
		,	msg: function (info, popup, debugTitle, debugOpts) {
			if ($.isPlainObject(info) && window.debugData) {
				if (typeof popup === "string") {
					debugOpts	= debugTitle;
					debugTitle	= popup;
				}
				else if (typeof debugTitle === "object") {
					debugOpts	= debugTitle;
					debugTitle	= null;
				}
				var t = debugTitle || "log( <object> )"
						,	o = $.extend({ sort: false, returnHTML: false, display: false }, debugOpts);
				if (popup === true || o.display)
					debugData( info, t, o );
				else if (window.console)
					console.log(debugData( info, t, o ));
			}
			else if (popup)
				alert(info);
			else if (window.console)
				console.log(info);
		}

	};

	var	lang = $.layout.language; // alias used in defaults...

// DEFAULT OPTIONS - CHANGE IF DESIRED
	$.layout.defaults = {
		/*
		 *	LAYOUT & LAYOUT-CONTAINER OPTIONS
		 *	- none of these options are applicable to individual panes
		 */
		name:						""			// Not required, but useful for buttons and used for the state-cookie
		,	containerClass:				"ui-layout-container" // layout-container element
		,	scrollToBookmarkOnLoad:		true		// after creating a layout, scroll to bookmark in URL (.../page.htm#myBookmark)
		,	resizeWithWindow:			true		// bind thisLayout.resizeAll() to the window.resize event
		,	resizeWithWindowDelay:		200			// delay calling resizeAll because makes window resizing very jerky
		,	resizeWithWindowMaxDelay:	0			// 0 = none - force resize every XX ms while window is being resized
		,	onresizeall_start:			null		// CALLBACK when resizeAll() STARTS	- NOT pane-specific
		,	onresizeall_end:			null		// CALLBACK when resizeAll() ENDS	- NOT pane-specific
		,	onload_start:				null		// CALLBACK when Layout inits - after options initialized, but before elements
		,	onload_end:					null		// CALLBACK when Layout inits - after EVERYTHING has been initialized
		,	onunload_start:				null		// CALLBACK when Layout is destroyed OR onWindowUnload
		,	onunload_end:				null		// CALLBACK when Layout is destroyed OR onWindowUnload
		,	autoBindCustomButtons:		false		// search for buttons with ui-layout-button class and auto-bind them
		,	initPanes:					true		// false = DO NOT initialize the panes onLoad - will init later
		,	showErrorMessages:			true		// enables fatal error messages to warn developers of common errors
		,	showDebugMessages:			false		// display console-and-alert debug msgs - IF this Layout version _has_ debugging code!
//	Changing this zIndex value will cause other zIndex values to automatically change
		,	zIndex:						null		// the PANE zIndex - resizers and masks will be +1
//	DO NOT CHANGE the zIndex values below unless you clearly understand their relationships
		,	zIndexes: {								// set _default_ z-index values here...
			pane_normal:			0			// normal z-index for panes
			,	content_mask:			1			// applied to overlays used to mask content INSIDE panes during resizing
			,	resizer_normal:			2			// normal z-index for resizer-bars
			,	pane_sliding:			100			// applied to *BOTH* the pane and its resizer when a pane is 'slid open'
			,	pane_animate:			1000		// applied to the pane when being animated - not applied to the resizer
			,	resizer_drag:			10000		// applied to the CLONED resizer-bar when being 'dragged'
		}
		/*
		 *	PANE DEFAULT SETTINGS
		 *	- settings under the 'panes' key become the default settings for *all panes*
		 *	- ALL pane-options can also be set specifically for each panes, which will override these 'default values'
		 */
		,	panes: { // default options for 'all panes' - will be overridden by 'per-pane settings'
			applyDemoStyles: 		false		// NOTE: renamed from applyDefaultStyles for clarity
			,	closable:				true		// pane can open & close
			,	resizable:				true		// when open, pane can be resized
			,	slidable:				true		// when closed, pane can 'slide open' over other panes - closes on mouse-out
			,	initClosed:				false		// true = init pane as 'closed'
			,	initHidden: 			false 		// true = init pane as 'hidden' - no resizer-bar/spacing
			//	SELECTORS
			//,	paneSelector:			""			// MUST be pane-specific - jQuery selector for pane
			,	contentSelector:		".ui-layout-content" // INNER div/element to auto-size so only it scrolls, not the entire pane!
			,	contentIgnoreSelector:	".ui-layout-ignore"	// element(s) to 'ignore' when measuring 'content'
			,	findNestedContent:		false		// true = $P.find(contentSelector), false = $P.children(contentSelector)
			//	GENERIC ROOT-CLASSES - for auto-generated classNames
			,	paneClass:				"ui-layout-pane"	// Layout Pane
			,	resizerClass:			"ui-layout-resizer"	// Resizer Bar
			,	togglerClass:			"ui-layout-toggler"	// Toggler Button
			,	buttonClass:			"ui-layout-button"	// CUSTOM Buttons	- eg: '[ui-layout-button]-toggle/-open/-close/-pin'
			//	ELEMENT SIZE & SPACING
			//,	size:					100			// MUST be pane-specific -initial size of pane
			,	minSize:				0			// when manually resizing a pane
			,	maxSize:				0			// ditto, 0 = no limit
			,	spacing_open:			6			// space between pane and adjacent panes - when pane is 'open'
			,	spacing_closed:			6			// ditto - when pane is 'closed'
			,	togglerLength_open:		50			// Length = WIDTH of toggler button on north/south sides - HEIGHT on east/west sides
			,	togglerLength_closed: 	50			// 100% OR -1 means 'full height/width of resizer bar' - 0 means 'hidden'
			,	togglerAlign_open:		"center"	// top/left, bottom/right, center, OR...
			,	togglerAlign_closed:	"center"	// 1 => nn = offset from top/left, -1 => -nn == offset from bottom/right
			,	togglerTip_open:		lang.Close	// Toggler tool-tip (title)
			,	togglerTip_closed:		lang.Open	// ditto
			,	togglerContent_open:	""			// text or HTML to put INSIDE the toggler
			,	togglerContent_closed:	""			// ditto
			//	RESIZING OPTIONS
			,	resizerDblClickToggle:	true		//
			,	autoResize:				true		// IF size is 'auto' or a percentage, then recalc 'pixel size' whenever the layout resizes
			,	autoReopen:				true		// IF a pane was auto-closed due to noRoom, reopen it when there is room? False = leave it closed
			,	resizerDragOpacity:		1			// option for ui.draggable
			//,	resizerCursor:			""			// MUST be pane-specific - cursor when over resizer-bar
			,	maskContents:			false		// true = add DIV-mask over-or-inside this pane so can 'drag' over IFRAMES
			,	maskObjects:			false		// true = add IFRAME-mask over-or-inside this pane to cover objects/applets - content-mask will overlay this mask
			,	maskZindex:				null		// will override zIndexes.content_mask if specified - not applicable to iframe-panes
			,	resizingGrid:			false		// grid size that the resizers will snap-to during resizing, eg: [20,20]
			,	livePaneResizing:		false		// true = LIVE Resizing as resizer is dragged
			,	liveContentResizing:	false		// true = re-measure header/footer heights as resizer is dragged
			,	liveResizingTolerance:	1			// how many px change before pane resizes, to control performance
			//	TIPS & MESSAGES - also see lang object
			,	noRoomToOpenTip:		lang.noRoomToOpenTip
			,	resizerTip:				lang.Resize	// Resizer tool-tip (title)
			,	sliderTip:				lang.Slide	// resizer-bar triggers 'sliding' when pane is closed
			,	sliderCursor:			"pointer"	// cursor when resizer-bar will trigger 'sliding'
			,	slideTrigger_open:		"click"		// click, dblclick, mouseenter
			,	slideTrigger_close:		"mouseleave"// click, mouseleave
			,	slideDelay_open:		300			// applies only for mouseenter event - 0 = instant open
			,	slideDelay_close:		300			// applies only for mouseleave event (300ms is the minimum!)
			,	hideTogglerOnSlide:		false		// when pane is slid-open, should the toggler show?
			,	preventQuickSlideClose:	$.layout.browser.webkit // Chrome triggers slideClosed as it is opening
			,	preventPrematureSlideClose: false	// handle incorrect mouseleave trigger, like when over a SELECT-list in IE
			//	HOT-KEYS & MISC
			,	showOverflowOnHover:	false		// will bind allowOverflow() utility to pane.onMouseOver
			,	enableCursorHotkey:		true		// enabled 'cursor' hotkeys
			//,	customHotkey:			""			// MUST be pane-specific - EITHER a charCode OR a character
			,	customHotkeyModifier:	"SHIFT"		// either 'SHIFT', 'CTRL' or 'CTRL+SHIFT' - NOT 'ALT'
			//	PANE ANIMATION
			//	NOTE: fxSss_open, fxSss_close & fxSss_size options (eg: fxName_open) are auto-generated if not passed
			,	fxName:					"slide" 	// ('none' or blank), slide, drop, scale -- only relevant to 'open' & 'close', NOT 'size'
			,	fxSpeed:				null		// slow, normal, fast, 200, nnn - if passed, will OVERRIDE fxSettings.duration
			,	fxSettings:				{}			// can be passed, eg: { easing: "easeOutBounce", duration: 1500 }
			,	fxOpacityFix:			true		// tries to fix opacity in IE to restore anti-aliasing after animation
			,	animatePaneSizing:		false		// true = animate resizing after dragging resizer-bar OR sizePane() is called
			/*  NOTE: Action-specific FX options are auto-generated from the options above if not specifically set:
			 fxName_open:			"slide"		// 'Open' pane animation
			 fnName_close:			"slide"		// 'Close' pane animation
			 fxName_size:			"slide"		// 'Size' pane animation - when animatePaneSizing = true
			 fxSpeed_open:			null
			 fxSpeed_close:			null
			 fxSpeed_size:			null
			 fxSettings_open:		{}
			 fxSettings_close:		{}
			 fxSettings_size:		{}
			 */
			//	CHILD/NESTED LAYOUTS
			,	childOptions:			null		// Layout-options for nested/child layout - even {} is valid as options
			,	initChildLayout:		true		// true = child layout will be created as soon as _this_ layout completes initialization
			,	destroyChildLayout:		true		// true = destroy child-layout if this pane is destroyed
			,	resizeChildLayout:		true		// true = trigger child-layout.resizeAll() when this pane is resized
			//	PANE CALLBACKS
			,	triggerEventsOnLoad:	false		// true = trigger onopen OR onclose callbacks when layout initializes
			,	triggerEventsDuringLiveResize: true	// true = trigger onresize callback REPEATEDLY if livePaneResizing==true
			,	onshow_start:			null		// CALLBACK when pane STARTS to Show	- BEFORE onopen/onhide_start
			,	onshow_end:				null		// CALLBACK when pane ENDS being Shown	- AFTER  onopen/onhide_end
			,	onhide_start:			null		// CALLBACK when pane STARTS to Close	- BEFORE onclose_start
			,	onhide_end:				null		// CALLBACK when pane ENDS being Closed	- AFTER  onclose_end
			,	onopen_start:			null		// CALLBACK when pane STARTS to Open
			,	onopen_end:				null		// CALLBACK when pane ENDS being Opened
			,	onclose_start:			null		// CALLBACK when pane STARTS to Close
			,	onclose_end:			null		// CALLBACK when pane ENDS being Closed
			,	onresize_start:			null		// CALLBACK when pane STARTS being Resized ***FOR ANY REASON***
			,	onresize_end:			null		// CALLBACK when pane ENDS being Resized ***FOR ANY REASON***
			,	onsizecontent_start:	null		// CALLBACK when sizing of content-element STARTS
			,	onsizecontent_end:		null		// CALLBACK when sizing of content-element ENDS
			,	onswap_start:			null		// CALLBACK when pane STARTS to Swap
			,	onswap_end:				null		// CALLBACK when pane ENDS being Swapped
			,	ondrag_start:			null		// CALLBACK when pane STARTS being ***MANUALLY*** Resized
			,	ondrag_end:				null		// CALLBACK when pane ENDS being ***MANUALLY*** Resized
		}
		/*
		 *	PANE-SPECIFIC SETTINGS
		 *	- options listed below MUST be specified per-pane - they CANNOT be set under 'panes'
		 *	- all options under the 'panes' key can also be set specifically for any pane
		 *	- most options under the 'panes' key apply only to 'border-panes' - NOT the the center-pane
		 */
		,	north: {
			paneSelector:			".ui-layout-north"
			,	size:					"auto"		// eg: "auto", "30%", .30, 200
			,	resizerCursor:			"n-resize"	// custom = url(myCursor.cur)
			,	customHotkey:			""			// EITHER a charCode (43) OR a character ("o")
		}
		,	south: {
			paneSelector:			".ui-layout-south"
			,	size:					"auto"
			,	resizerCursor:			"s-resize"
			,	customHotkey:			""
		}
		,	east: {
			paneSelector:			".ui-layout-east"
			,	size:					200
			,	resizerCursor:			"e-resize"
			,	customHotkey:			""
		}
		,	west: {
			paneSelector:			".ui-layout-west"
			,	size:					200
			,	resizerCursor:			"w-resize"
			,	customHotkey:			""
		}
		,	center: {
			paneSelector:			".ui-layout-center"
			,	minWidth:				0
			,	minHeight:				0
		}
	};

	$.layout.optionsMap = {
		// layout/global options - NOT pane-options
		layout: ("stateManagement,effects,zIndexes,"
				+	"name,zIndex,scrollToBookmarkOnLoad,showErrorMessages,"
				+	"resizeWithWindow,resizeWithWindowDelay,resizeWithWindowMaxDelay,"
				+	"onresizeall,onresizeall_start,onresizeall_end,onload,onunload,autoBindCustomButtons").split(",")
//	borderPanes: [ ALL options that are NOT specified as 'layout' ]
		// default.panes options that apply to the center-pane (most options apply _only_ to border-panes)
		,	center: ("paneClass,contentSelector,contentIgnoreSelector,findNestedContent,applyDemoStyles,triggerEventsOnLoad,"
				+	"showOverflowOnHover,maskContents,maskObjects,liveContentResizing,"
				+	"childOptions,initChildLayout,resizeChildLayout,destroyChildLayout,"
				+	"onresize,onresize_start,onresize_end,onsizecontent,onsizecontent_start,onsizecontent_end").split(",")
		// options that MUST be specifically set 'per-pane' - CANNOT set in the panes (defaults) key
		,	noDefault: ("paneSelector,resizerCursor,customHotkey").split(",")
	};

	/**
	 * Processes options passed in converts flat-format data into subkey (JSON) format
	 * In flat-format, subkeys are _currently_ separated with 2 underscores, like north__optName
	 * Plugins may also call this method so they can transform their own data
	 *
	 * @param  {!Object}	hash	Data/options passed by user - may be a single level or nested levels
	 * @return {Object}				Returns hash of minWidth & minHeight
	 */
	$.layout.transformData = function (hash) {
		var	json = { panes: {}, center: {} } // init return object
				,	data, branch, optKey, keys, key, val, i, c;

		if (typeof hash !== "object") return json; // no options passed

		// convert all 'flat-keys' to 'sub-key' format
		for (optKey in hash) {
			branch	= json;
			data	= $.layout.optionsMap.layout;
			val		= hash[ optKey ];
			keys	= optKey.split("__"); // eg: west__size or north__fxSettings__duration
			c		= keys.length - 1;
			// convert underscore-delimited to subkeys
			for (i=0; i <= c; i++) {
				key = keys[i];
				if (i === c)
					branch[key] = val;
				else if (!branch[key])
					branch[key] = {}; // create the subkey
				// recurse to sub-key for next loop - if not done
				branch = branch[key];
			}
		}

		return json;
	}

// INTERNAL CONFIG DATA - DO NOT CHANGE THIS!
	$.layout.backwardCompatibility = {
		// data used by renameOldOptions()
		map: {
			//	OLD Option Name:			NEW Option Name
			applyDefaultStyles:			"applyDemoStyles"
			,	resizeNestedLayout:			"resizeChildLayout"
			,	resizeWhileDragging:		"livePaneResizing"
			,	resizeContentWhileDragging:	"liveContentResizing"
			,	triggerEventsWhileDragging:	"triggerEventsDuringLiveResize"
			,	maskIframesOnResize:		"maskContents"
			,	useStateCookie:				"stateManagement.enabled"
			,	"cookie.autoLoad":			"stateManagement.autoLoad"
			,	"cookie.autoSave":			"stateManagement.autoSave"
			,	"cookie.keys":				"stateManagement.stateKeys"
			,	"cookie.name":				"stateManagement.cookie.name"
			,	"cookie.domain":			"stateManagement.cookie.domain"
			,	"cookie.path":				"stateManagement.cookie.path"
			,	"cookie.expires":			"stateManagement.cookie.expires"
			,	"cookie.secure":			"stateManagement.cookie.secure"
		}
		/**
		 * @param {Object}	opts
		 */
		,	renameOptions: function (opts) {
			var map = $.layout.backwardCompatibility.map
					,	oldData, newData, value
					;
			for (var itemPath in map) {
				oldData	= getBranch( itemPath );
				value	= oldData.branch[ oldData.key ]
				if (value !== undefined) {
					newData = getBranch( map[itemPath], true )
					newData.branch[ newData.key ] = value;
					delete oldData.branch[ oldData.key ];
				}
			}

			/**
			 * @param {string}	path
			 * @param {boolean=}	[create=false]	Create path if does not exist
			 */
			function getBranch (path, create) {
				var a = path.split(".") // split keys into array
						,	c = a.length - 1
						,	D = { branch: opts, key: a[c] } // init branch at top & set key (last item)
						,	i = 0, k, undef;
				for (; i<c; i++) { // skip the last key (data)
					k = a[i];
					if (D.branch[ k ] == undefined) { // child-key does not exist
						if (create) {
							D.branch = D.branch[ k ] = {}; // create child-branch
						}
						else // can't go any farther
							D.branch = {}; // branch is undefined
					}
					else
						D.branch = D.branch[ k ]; // get child-branch
				}
				return D;
			};
		}
		/**
		 * @param {Object}	opts
		 */
		,	renameAllOptions: function (opts) {
			var ren = $.layout.backwardCompatibility.renameOptions;
			// rename root (layout) options
			ren( opts );
			// rename 'defaults' to 'panes'
			if (opts.defaults) {
				if (typeof opts.panes !== "object")
					opts.panes = {};
				$.extend(true, opts.panes, opts.defaults);
				delete opts.defaults;
			}
			// rename options in the the options.panes key
			if (opts.panes) ren( opts.panes );
			// rename options inside *each pane key*, eg: options.west
			$.each($.layout.config.allPanes, function (i, pane) {
				if (opts[pane]) ren( opts[pane] );
			});
			return opts;
		}
	};



	/*	============================================================
	 *	BEGIN WIDGET: $( selector ).layout( {options} );
	 *	============================================================
	 */
	$.fn.layout = function (opts) {
		var

			// local aliases to global data
				browser	= $.layout.browser
				,	lang	= $.layout.language // internal alias
				,	_c		= $.layout.config

			// local aliases to utlity methods
				,	cssW	= $.layout.cssWidth
				,	cssH	= $.layout.cssHeight
				,	elDims	= $.layout.getElementDimensions
				,	elCSS	= $.layout.getElementCSS

		/**
		 * options - populated by initOptions()
		 */
				,	options = $.extend(true, {}, $.layout.defaults)
				,	effects	= options.effects = $.extend(true, {}, $.layout.effects)

		/**
		 * layout-state object
		 */
				,	state = {
			// generate unique ID to use for event.namespace so can unbind only events added by 'this layout'
			id:			"layout"+ $.now()	// code uses alias: sID
			,	initialized: false
			,	container:	{} // init all keys
			,	north:		{}
			,	south:		{}
			,	east:		{}
			,	west:		{}
			,	center:		{}
		}

		/**
		 * parent/child-layout pointers
		 */
//,	hasParentLayout	= false	- exists ONLY as Instance.hasParentLayout
				,	children = {
			north:		null
			,	south:		null
			,	east:		null
			,	west:		null
			,	center:		null
		}

			/*
			 * ###########################
			 *  INTERNAL HELPER FUNCTIONS
			 * ###########################
			 */

		/**
		 * Manages all internal timers
		 */
				,	timer = {
			data:	{}
			,	set:	function (s, fn, ms) { timer.clear(s); timer.data[s] = setTimeout(fn, ms); }
			,	clear:	function (s) { var t=timer.data; if (t[s]) {clearTimeout(t[s]); delete t[s];} }
		}

				,	_log = function (msg, popup) {
			$.layout.msg( msg, (popup && options.showErrorMessages) );
		}

		/**
		 * Executes a Callback function after a trigger event, like resize, open or close
		 *
		 * @param {?string}				pane	This is passed only so we can pass the 'pane object' to the callback
		 * @param {(string|function())}	v_fn	Accepts a function name, OR a comma-delimited array: [0]=function name, [1]=argument
		 */
				,	_execCallback = function (pane, v_fn) {
			if (!v_fn) return;
			var fn;
			try {
				if (typeof v_fn === "function")
					fn = v_fn;
				else if (!isStr(v_fn))
					return;
				else if (v_fn.match(/,/)) {
					// function name cannot contain a comma, so must be a function name AND a 'name' parameter
					var
							args = v_fn.split(",")
							,	fn = eval(args[0])
							;
					if (typeof fn=="function" && args.length > 1)
						return fn(args[1]); // pass the argument parsed from 'list'
				}
				else // just the name of an external function?
					fn = eval(v_fn);

				if ($.isFunction( fn )) {
					if (pane && $Ps[pane])
					// pass data: pane-name, pane-element, pane-state, pane-options, and layout-name
						return fn( pane, $Ps[pane], state[pane], options[pane], options.name );
					else // must be a layout/container callback - pass suitable info
						return fn( Instance, state, options, options.name );
				}
			}
			catch (ex) {}
		}

				,	trigger = function (fnName, pane) {
			var o	= options
					,	fn	= pane && o[pane] ? o[pane][fnName] : o[fnName];
			if (fn) _execCallback(pane || null, fn);
		}

		/**
		 * cure iframe display issues in IE & other browsers
		 */
				,	_fixIframe = function (pane) {
			if (browser.mozilla) return; // skip FireFox - it auto-refreshes iframes onShow
			var $P = $Ps[pane];
			// if the 'pane' is an iframe, do it
			if (state[pane].tagName === "IFRAME")
				$P.css(_c.hidden).css(_c.visible);
			else // ditto for any iframes INSIDE the pane
				$P.find('IFRAME').css(_c.hidden).css(_c.visible);
		}

		/**
		 * @param  {string}		pane		Can accept ONLY a 'pane' (east, west, etc)
		 * @param  {number=}		outerSize	(optional) Can pass a width, allowing calculations BEFORE element is resized
		 * @return {number}		Returns the innerHeight/Width of el by subtracting padding and borders
		 */
				,	cssSize = function (pane, outerSize) {
			var fn = _c[pane].dir=="horz" ? cssH : cssW;
			return fn($Ps[pane], outerSize);
		}

		/**
		 * @param  {string}		pane		Can accept ONLY a 'pane' (east, west, etc)
		 * @return {Object}		Returns hash of minWidth & minHeight
		 */
				,	cssMinDims = function (pane) {
			// minWidth/Height means CSS width/height = 1px
			var
					$P	= $Ps[pane]
			dir	= _c[pane].dir
					,	d	= {
				minWidth:	1001 - cssW($P, 1000)
				,	minHeight:	1001 - cssH($P, 1000)
			}
			;
			if (dir === "horz") d.minSize = d.minHeight;
			if (dir === "vert") d.minSize = d.minWidth;
			return d;
		}

			// TODO: see if these methods can be made more useful...
			// TODO: *maybe* return cssW/H from these so caller can use this info

		/**
		 * @param {(string|!Object)}		el
		 * @param {number=}				outerWidth
		 * @param {boolean=}				[autoHide=false]
		 */
				,	setOuterWidth = function (el, outerWidth, autoHide) {
			var $E = el, w;
			if (isStr(el)) $E = $Ps[el]; // west
			else if (!el.jquery) $E = $(el);
			w = cssW($E, outerWidth);
			$E.css({ width: w });
			if (w > 0) {
				if (autoHide && $E.data('autoHidden') && $E.innerHeight() > 0) {
					$E.show().data('autoHidden', false);
					if (!browser.mozilla) // FireFox refreshes iframes - IE does not
					// make hidden, then visible to 'refresh' display after animation
						$E.css(_c.hidden).css(_c.visible);
				}
			}
			else if (autoHide && !$E.data('autoHidden'))
				$E.hide().data('autoHidden', true);
		}

		/**
		 * @param {(string|!Object)}		el
		 * @param {number=}				outerHeight
		 * @param {boolean=}				[autoHide=false]
		 */
				,	setOuterHeight = function (el, outerHeight, autoHide) {
			var $E = el, h;
			if (isStr(el)) $E = $Ps[el]; // west
			else if (!el.jquery) $E = $(el);
			h = cssH($E, outerHeight);
			$E.css({ height: h, visibility: "visible" }); // may have been 'hidden' by sizeContent
			if (h > 0 && $E.innerWidth() > 0) {
				if (autoHide && $E.data('autoHidden')) {
					$E.show().data('autoHidden', false);
					if (!browser.mozilla) // FireFox refreshes iframes - IE does not
						$E.css(_c.hidden).css(_c.visible);
				}
			}
			else if (autoHide && !$E.data('autoHidden'))
				$E.hide().data('autoHidden', true);
		}

		/**
		 * @param {(string|!Object)}		el
		 * @param {number=}				outerSize
		 * @param {boolean=}				[autoHide=false]
		 */
				,	setOuterSize = function (el, outerSize, autoHide) {
			if (_c[pane].dir=="horz") // pane = north or south
				setOuterHeight(el, outerSize, autoHide);
			else // pane = east or west
				setOuterWidth(el, outerSize, autoHide);
		}


		/**
		 * Converts any 'size' params to a pixel/integer size, if not already
		 * If 'auto' or a decimal/percentage is passed as 'size', a pixel-size is calculated
		 *
		 /**
		 * @param  {string}				pane
		 * @param  {(string|number)=}	size
		 * @param  {string=}				[dir]
		 * @return {number}
		 */
				,	_parseSize = function (pane, size, dir) {
			if (!dir) dir = _c[pane].dir;

			if (isStr(size) && size.match(/%/))
				size = (size === '100%') ? -1 : parseInt(size, 10) / 100; // convert % to decimal

			if (size === 0)
				return 0;
			else if (size >= 1)
				return parseInt(size, 10);

			var o = options, avail = 0;
			if (dir=="horz") // north or south or center.minHeight
				avail = sC.innerHeight - ($Ps.north ? o.north.spacing_open : 0) - ($Ps.south ? o.south.spacing_open : 0);
			else if (dir=="vert") // east or west or center.minWidth
				avail = sC.innerWidth - ($Ps.west ? o.west.spacing_open : 0) - ($Ps.east ? o.east.spacing_open : 0);

			if (size === -1) // -1 == 100%
				return avail;
			else if (size > 0) // percentage, eg: .25
				return round(avail * size);
			else if (pane=="center")
				return 0;
			else { // size < 0 || size=='auto' || size==Missing || size==Invalid
				// auto-size the pane
				var
						$P	= $Ps[pane]
						,	dim	= (dir === "horz" ? "height" : "width")
						,	vis	= $.layout.showInvisibly($P) // show pane invisibly if hidden
						,	s	= $P.css(dim); // SAVE current size
				;
				$P.css(dim, "auto");
				size = (dim === "height") ? $P.outerHeight() : $P.outerWidth(); // MEASURE
				$P.css(dim, s).css(vis); // RESET size & visibility
				return size;
			}
		}

		/**
		 * Calculates current 'size' (outer-width or outer-height) of a border-pane - optionally with 'pane-spacing' added
		 *
		 * @param  {(string|!Object)}	pane
		 * @param  {boolean=}			[inclSpace=false]
		 * @return {number}				Returns EITHER Width for east/west panes OR Height for north/south panes - adjusted for boxModel & browser
		 */
				,	getPaneSize = function (pane, inclSpace) {
			var
					$P	= $Ps[pane]
					,	o	= options[pane]
					,	s	= state[pane]
					,	oSp	= (inclSpace ? o.spacing_open : 0)
					,	cSp	= (inclSpace ? o.spacing_closed : 0)
					;
			if (!$P || s.isHidden)
				return 0;
			else if (s.isClosed || (s.isSliding && inclSpace))
				return cSp;
			else if (_c[pane].dir === "horz")
				return $P.outerHeight() + oSp;
			else // dir === "vert"
				return $P.outerWidth() + oSp;
		}

		/**
		 * Calculate min/max pane dimensions and limits for resizing
		 *
		 * @param  {string}		pane
		 * @param  {boolean=}	[slide=false]
		 */
				,	setSizeLimits = function (pane, slide) {
			if (!isInitialized()) return;
			var
					o				= options[pane]
					,	s				= state[pane]
					,	c				= _c[pane]
					,	dir				= c.dir
					,	side			= c.side.toLowerCase()
					,	type			= c.sizeType.toLowerCase()
					,	isSliding		= (slide != undefined ? slide : s.isSliding) // only open() passes 'slide' param
					,	$P				= $Ps[pane]
					,	paneSpacing		= o.spacing_open
				//	measure the pane on the *opposite side* from this pane
					,	altPane			= _c.oppositeEdge[pane]
					,	altS			= state[altPane]
					,	$altP			= $Ps[altPane]
					,	altPaneSize		= (!$altP || altS.isVisible===false || altS.isSliding ? 0 : (dir=="horz" ? $altP.outerHeight() : $altP.outerWidth()))
					,	altPaneSpacing	= ((!$altP || altS.isHidden ? 0 : options[altPane][ altS.isClosed !== false ? "spacing_closed" : "spacing_open" ]) || 0)
				//	limitSize prevents this pane from 'overlapping' opposite pane
					,	containerSize	= (dir=="horz" ? sC.innerHeight : sC.innerWidth)
					,	minCenterDims	= cssMinDims("center")
					,	minCenterSize	= dir=="horz" ? max(options.center.minHeight, minCenterDims.minHeight) : max(options.center.minWidth, minCenterDims.minWidth)
				//	if pane is 'sliding', then ignore center and alt-pane sizes - because 'overlays' them
					,	limitSize		= (containerSize - paneSpacing - (isSliding ? 0 : (_parseSize("center", minCenterSize, dir) + altPaneSize + altPaneSpacing)))
					,	minSize			= s.minSize = max( _parseSize(pane, o.minSize), cssMinDims(pane).minSize )
					,	maxSize			= s.maxSize = min( (o.maxSize ? _parseSize(pane, o.maxSize) : 100000), limitSize )
					,	r				= s.resizerPosition = {} // used to set resizing limits
					,	top				= sC.insetTop
					,	left			= sC.insetLeft
					,	W				= sC.innerWidth
					,	H				= sC.innerHeight
					,	rW				= o.spacing_open // subtract resizer-width to get top/left position for south/east
					;
			switch (pane) {
				case "north":	r.min = top + minSize;
					r.max = top + maxSize;
					break;
				case "west":	r.min = left + minSize;
					r.max = left + maxSize;
					break;
				case "south":	r.min = top + H - maxSize - rW;
					r.max = top + H - minSize - rW;
					break;
				case "east":	r.min = left + W - maxSize - rW;
					r.max = left + W - minSize - rW;
					break;
			};
		}

		/**
		 * Returns data for setting the size/position of center pane. Also used to set Height for east/west panes
		 *
		 * @return JSON  Returns a hash of all dimensions: top, bottom, left, right, (outer) width and (outer) height
		 */
				,	calcNewCenterPaneDims = function () {
			var d = {
				top:	getPaneSize("north", true) // true = include 'spacing' value for pane
				,	bottom:	getPaneSize("south", true)
				,	left:	getPaneSize("west", true)
				,	right:	getPaneSize("east", true)
				,	width:	0
				,	height:	0
			};

			// NOTE: sC = state.container
			// calc center-pane outer dimensions
			d.width		= sC.innerWidth - d.left - d.right;  // outerWidth
			d.height	= sC.innerHeight - d.bottom - d.top; // outerHeight
			// add the 'container border/padding' to get final positions relative to the container
			d.top		+= sC.insetTop;
			d.bottom	+= sC.insetBottom;
			d.left		+= sC.insetLeft;
			d.right		+= sC.insetRight;

			return d;
		}


		/**
		 * @param {!Object}		el
		 * @param {boolean=}		[allStates=false]
		 */
				,	getHoverClasses = function (el, allStates) {
			var
					$El		= $(el)
					,	type	= $El.data("layoutRole")
					,	pane	= $El.data("layoutEdge")
					,	o		= options[pane]
					,	root	= o[type +"Class"]
					,	_pane	= "-"+ pane // eg: "-west"
					,	_open	= "-open"
					,	_closed	= "-closed"
					,	_slide	= "-sliding"
					,	_hover	= "-hover " // NOTE the trailing space
					,	_state	= $El.hasClass(root+_closed) ? _closed : _open
					,	_alt	= _state === _closed ? _open : _closed
					,	classes = (root+_hover) + (root+_pane+_hover) + (root+_state+_hover) + (root+_pane+_state+_hover)
					;
			if (allStates) // when 'removing' classes, also remove alternate-state classes
				classes += (root+_alt+_hover) + (root+_pane+_alt+_hover);

			if (type=="resizer" && $El.hasClass(root+_slide))
				classes += (root+_slide+_hover) + (root+_pane+_slide+_hover);

			return $.trim(classes);
		}
				,	addHover	= function (evt, el) {
			var $E = $(el || this);
			if (evt && $E.data("layoutRole") === "toggler")
				evt.stopPropagation(); // prevent triggering 'slide' on Resizer-bar
			$E.addClass( getHoverClasses($E) );
		}
				,	removeHover	= function (evt, el) {
			var $E = $(el || this);
			$E.removeClass( getHoverClasses($E, true) );
		}

				,	onResizerEnter	= function (evt) { // ALSO called by toggler.mouseenter
			if ($.fn.disableSelection)
				$("body").disableSelection();
		}
				,	onResizerLeave	= function (evt, el) {
			var
					e = el || this // el is only passed when called by the timer
					,	pane = $(e).data("layoutEdge")
					,	name = pane +"ResizerLeave"
					;
			timer.clear(pane+"_openSlider"); // cancel slideOpen timer, if set
			timer.clear(name); // cancel enableSelection timer - may re/set below
			// this method calls itself on a timer because it needs to allow
			// enough time for dragging to kick-in and set the isResizing flag
			// dragging has a 100ms delay set, so this delay must be >100
			if (!el) // 1st call - mouseleave event
				timer.set(name, function(){ onResizerLeave(evt, e); }, 200);
			// if user is resizing, then dragStop will enableSelection(), so can skip it here
			else if (!state[pane].isResizing && $.fn.enableSelection) // 2nd call - by timer
				$("body").enableSelection();
		}

			/*
			 * ###########################
			 *   INITIALIZATION METHODS
			 * ###########################
			 */

		/**
		 * Initialize the layout - called automatically whenever an instance of layout is created
		 *
		 * @see  none - triggered onInit
		 * @return  mixed	true = fully initialized | false = panes not initialized (yet) | 'cancel' = abort
		 */
				,	_create = function () {
			// initialize config/options
			initOptions();
			var o = options;

			// TEMP state so isInitialized returns true during init process
			state.creatingLayout = true;

			// init plugins for this layout, if there are any (eg: stateManagement)
			runPluginCallbacks( Instance, $.layout.onCreate );

			// options & state have been initialized, so now run beforeLoad callback
			// onload will CANCEL layout creation if it returns false
			if (false === _execCallback(null, o.onload_start))
				return 'cancel';

			// initialize the container element
			_initContainer();

			// bind hotkey function - keyDown - if required
			initHotkeys();

			// bind window.onunload
			$(window).bind("unload."+ sID, unload);

			// init plugins for this layout, if there are any (eg: customButtons)
			runPluginCallbacks( Instance, $.layout.onLoad );

			// if this layout's container is another layout's pane, then set child/parent pointers
			var parent = $N.data("parentLayout");
			if (parent) {
				Instance.hasParentLayout = true;
				var pane = $N.data("layoutEdge"); // container's pane-name in parent-layout
				// set pointers to THIS child-layout in parent-layout
				// NOTE: parent.PANE.child is an ALIAS to parent.children.PANE
				parent[pane].child = parent.children[pane] = Instance;
			}

			// if layout elements are hidden, then layout WILL NOT complete initialization!
			// initLayoutElements will set initialized=true and run the onload callback IF successful
			if (o.initPanes) _initLayoutElements();

			delete state.creatingLayout;

			return state.initialized;
		}

		/**
		 * Initialize the layout IF not already
		 *
		 * @see  All methods in Instance run this test
		 * @return  boolean	true = layoutElements have been initialized | false = panes are not initialized (yet)
		 */
				,	isInitialized = function () {
			if (state.initialized || state.creatingLayout) return true;	// already initialized
			else return _initLayoutElements();	// try to init panes NOW
		}

		/**
		 * Initialize the layout - called automatically whenever an instance of layout is created
		 *
		 * @see  _create() & isInitialized
		 * @return  An object pointer to the instance created
		 */
				,	_initLayoutElements = function (retry) {
			// initialize config/options
			var o = options;

			// CANNOT init panes inside a hidden container!
			if (!$N.is(":visible")) {
				// handle Chrome bug where popup window 'has no height'
				// if layout is BODY element, try again in 50ms
				// SEE: http://layout.jquery-dev.net/samples/test_popup_window.html
				if ( !retry && browser.webkit && $N[0].tagName === "BODY" )
					setTimeout(function(){ _initLayoutElements(true); }, 50);
				return false;
			}

			// a center pane is required, so make sure it exists
			if (!getPane("center").length) {
				_log( lang.errCenterPaneMissing, true );
				return false;
			}

			// TEMP state so isInitialized returns true during init process
			state.creatingLayout = true;

			// update Container dims
			$.extend(sC, elDims( $N ));

			// check to see if this layout 'nested' inside a pane
			if ($N.data("layoutRole") === "pane")
				o.resizeWithWindow = false;

			// initialize all layout elements
			initPanes();	// size & position panes - calls initHandles() - which calls initResizable()

			if (o.scrollToBookmarkOnLoad) {
				var l = self.location;
				if (l.hash) l.replace( l.hash ); // scrollTo Bookmark
			}

			// bind resizeAll() for 'this layout instance' to window.resize event
			if (o.resizeWithWindow)
				$(window).bind("resize."+ sID, windowResize);

			delete state.creatingLayout;
			state.initialized = true;

			// init plugins for this layout, if there are any
			runPluginCallbacks( Instance, $.layout.onReady );

			// now run the onload callback, if exists
			_execCallback(null, o.onload_end || o.onload);

			return true; // elements initialized successfully
		}

		/**
		 * Initialize nested layouts - called when _initLayoutElements completes
		 *
		 * NOT CURRENTLY USED
		 *
		 * @see _initLayoutElements
		 * @return  An object pointer to the instance created
		 */
				,	_initChildLayouts = function () {
			$.each(_c.allPanes, function (idx, pane) {
				if (options[pane].initChildLayout)
					createChildLayout( pane );
			});
		}

		/**
		 * Initialize nested layouts for a specific pane - can optionally pass layout-options
		 *
		 * @see _initChildLayouts
		 * @param {string}	pane		The pane being opened, ie: north, south, east, or west
		 * @param {Object=}	[opts]		Layout-options - if passed, will OVERRRIDE options[pane].childOptions
		 * @return  An object pointer to the layout instance created - or null
		 */
				,	createChildLayout = function (pane, opts) {
			var	$P	= $Ps[pane]
					,	o	= opts || options[pane].childOptions
					,	C	= children
					,	d	= "layout"
				//	see if a child-layout ALREADY exists on this element
					,	L	= $P ? (C[pane] = $P.data(d) || null) : false
					;
			// if no layout exists, but childOptions are set, try to create the layout now
			if (!L && $P && o)
				L = C[pane] = $P.layout(o) || null;
			if (L)
				L.hasParentLayout = true;	// set parent-flag in child - DO NOT set pointer or else have infinite recursion!
			Instance[pane].child = C[pane];	// set pane-object pointer, even if null
		}

				,	windowResize = function () {
			var delay = Number(options.resizeWithWindowDelay);
			if (delay < 10) delay = 100; // MUST have a delay!
			// resizing uses a delay-loop because the resize event fires repeatly - except in FF, but delay anyway
			timer.clear("winResize"); // if already running
			timer.set("winResize", function(){
				timer.clear("winResize");
				timer.clear("winResizeRepeater");
				var dims = elDims( $N );
				// only trigger resizeAll() if container has changed size
				if (dims.innerWidth !== sC.innerWidth || dims.innerHeight !== sC.innerHeight)
					resizeAll();
			}, delay);
			// ALSO set fixed-delay timer, if not already running
			if (!timer.data["winResizeRepeater"]) setWindowResizeRepeater();
		}

				,	setWindowResizeRepeater = function () {
			var delay = Number(options.resizeWithWindowMaxDelay);
			if (delay > 0)
				timer.set("winResizeRepeater", function(){ setWindowResizeRepeater(); resizeAll(); }, delay);
		}

				,	unload = function () {
			var o = options;

			_execCallback(null, o.onunload_start);

			// trigger plugin callabacks for this layout (eg: stateManagement)
			runPluginCallbacks( Instance, $.layout.onUnload );

			_execCallback(null, o.onunload_end || o.onunload);
		}

		/**
		 * Validate and initialize container CSS and events
		 *
		 * @see  _create()
		 */
				,	_initContainer = function () {
			var
					N		= $N[0]
					,	tag		= sC.tagName = N.tagName
					,	id		= sC.id = N.id
					,	cls		= sC.className = N.className
					,	o		= options
					,	name	= o.name
					,	fullPage= (tag === "BODY")
					,	props	= "overflow,position,margin,padding,border"
					,	CSS		= {}
					,	hid		= "hidden" // used A LOT!
					;
			// sC -> state.container
			sC.selector = $N.selector.split(".slice")[0];
			sC.ref		= (o.name ? o.name +' layout / ' : '') + tag + (id ? "#"+id : cls ? '.['+cls+']' : ''); // used in messages

			$N	.data("layout", Instance)
					.data("layoutContainer", sID)	// unique identifier for internal use
					.addClass(o.containerClass)
			;

			// SAVE original container CSS for use in destroy()
			var css = "layoutCSS";
			if (!$N.data(css)) {
				// handle props like overflow different for BODY & HTML - has 'system default' values
				if (fullPage) {
					CSS = $.extend( elCSS($N, props), {
						height:		$N.css("height")
						,	overflow:	$N.css("overflow")
						,	overflowX:	$N.css("overflowX")
						,	overflowY:	$N.css("overflowY")
					});
					// ALSO SAVE <HTML> CSS
					var $H = $("html");
					$H.data(css, {
						height:		"auto" // FF would return a fixed px-size!
						,	overflow:	$H.css("overflow")
						,	overflowX:	$H.css("overflowX")
						,	overflowY:	$H.css("overflowY")
					});
				}
				else // handle props normally for non-body elements
					CSS = elCSS($N, props+",top,bottom,left,right,width,height,overflow,overflowX,overflowY");

				$N.data(css, CSS);
			}

			try { // format html/body if this is a full page layout
				if (fullPage) {
					$("html").css({
						height:		"100%"
						,	overflow:	hid
						,	overflowX:	hid
						,	overflowY:	hid
					});
					$("body").css({
						position:	"relative"
						,	height:		"100%"
						,	overflow:	hid
						,	overflowX:	hid
						,	overflowY:	hid
						,	margin:		0
						,	padding:	0		// TODO: test whether body-padding could be handled?
						,	border:		"none"	// a body-border creates problems because it cannot be measured!
					});

					// set current layout-container dimensions
					$.extend(sC, elDims( $N ));
				}
				else { // set required CSS for overflow and position
					// ENSURE container will not 'scroll'
					CSS = { overflow: hid, overflowX: hid, overflowY: hid }
					var
							p = $N.css("position")
							,	h = $N.css("height")
							;
					// if this is a NESTED layout, then container/outer-pane ALREADY has position and height
					if (!$N.data("layoutRole")) {
						if (!p || !p.match(/fixed|absolute|relative/))
							CSS.position = "relative"; // container MUST have a 'position'
						/*
						 if (!h || h=="auto")
						 CSS.height = "100%"; // container MUST have a 'height'
						 */
					}
					$N.css( CSS );

					// set current layout-container dimensions
					if ( $N.is(":visible") ) {
						$.extend(sC, elDims( $N ));
						if (o.showErrorMessages && sC.innerHeight < 1)
							_log( lang.errContainerHeight.replace(/CONTAINER/, sC.ref), true );
					}
				}
			} catch (ex) {}
		}

		/**
		 * Bind layout hotkeys - if options enabled
		 *
		 * @see  _create() and addPane()
		 * @param {string=}	[panes=""]	The edge(s) to process
		 */
				,	initHotkeys = function (panes) {
			panes = panes ? panes.split(",") : _c.borderPanes;
			// bind keyDown to capture hotkeys, if option enabled for ANY pane
			$.each(panes, function (i, pane) {
				var o = options[pane];
				if (o.enableCursorHotkey || o.customHotkey) {
					$(document).bind("keydown."+ sID, keyDown); // only need to bind this ONCE
					return false; // BREAK - binding was done
				}
			});
		}

		/**
		 * Build final OPTIONS data
		 *
		 * @see  _create()
		 */
				,	initOptions = function () {
			var data, d, pane, key, val, i, c, o;

			// reprocess user's layout-options to have correct options sub-key structure
			opts = $.layout.transformData( opts ); // panes = default subkey

			// auto-rename old options for backward compatibility
			opts = $.layout.backwardCompatibility.renameAllOptions( opts );

			// if user-options has 'panes' key (pane-defaults), process it...
			if (!$.isEmptyObject(opts.panes)) {
				// REMOVE any pane-defaults that MUST be set per-pane
				data = $.layout.optionsMap.noDefault;
				for (i=0, c=data.length; i<c; i++) {
					key = data[i];
					delete opts.panes[key]; // OK if does not exist
				}
				// REMOVE any layout-options specified under opts.panes
				data = $.layout.optionsMap.layout;
				for (i=0, c=data.length; i<c; i++) {
					key = data[i];
					delete opts.panes[key]; // OK if does not exist
				}
			}

			// MOVE any NON-layout-options to opts.panes
			data = $.layout.optionsMap.layout;
			var rootKeys = $.layout.config.optionRootKeys;
			for (key in opts) {
				val = opts[key];
				if ($.inArray(key, rootKeys) < 0 && $.inArray(key, data) < 0) {
					if (!opts.panes[key])
						opts.panes[key] = $.isPlainObject(val) ? $.extend(true, {}, val) : val;
					delete opts[key]
				}
			}

			// START by updating ALL options from opts
			$.extend(true, options, opts);

			// CREATE final options (and config) for EACH pane
			$.each(_c.allPanes, function (i, pane) {

				// apply 'pane-defaults' to CONFIG.[PANE]
				_c[pane] = $.extend( true, {}, _c.panes, _c[pane] );

				d = options.panes;
				o = options[pane];

				// center-pane uses SOME keys in defaults.panes branch
				if (pane === 'center') {
					// ONLY copy keys from opts.panes listed in: $.layout.optionsMap.center
					data = $.layout.optionsMap.center;		// list of 'center-pane keys'
					for (i=0, c=data.length; i<c; i++) {	// loop the list...
						key = data[i];
						// only need to use pane-default if pane-specific value not set
						if (!opts.center[key] && (opts.panes[key] || !o[key]))
							o[key] = d[key]; // pane-default
					}
				}
				else {
					// border-panes use ALL keys in defaults.panes branch
					o = options[pane] = $.extend({}, d, o); // re-apply pane-specific opts AFTER pane-defaults
					createFxOptions( pane );
					// ensure all border-pane-specific base-classes exist
					if (!o.resizerClass)	o.resizerClass	= "ui-layout-resizer";
					if (!o.togglerClass)	o.togglerClass	= "ui-layout-toggler";
				}
				// ensure we have base pane-class (ALL panes)
				if (!o.paneClass) o.paneClass = "ui-layout-pane";
			});

			// update options.zIndexes if a zIndex-option specified
			var zo	= opts.zIndex
					,	z	= options.zIndexes;
			if (zo > 0) {
				z.pane_normal		= zo;
				z.content_mask		= max(zo+1, z.content_mask);	// MIN = +1
				z.resizer_normal	= max(zo+2, z.resizer_normal);	// MIN = +2
			}

			function createFxOptions ( pane ) {
				var	o = options[pane]
						,	d = options.panes;
				// ensure fxSettings key to avoid errors
				if (!o.fxSettings) o.fxSettings = {};
				if (!d.fxSettings) d.fxSettings = {};

				$.each(["_open","_close","_size"], function (i,n) {
					var
							sName		= "fxName"+ n
							,	sSpeed		= "fxSpeed"+ n
							,	sSettings	= "fxSettings"+ n
						// recalculate fxName according to specificity rules
							,	fxName = o[sName] =
							o[sName]	// options.west.fxName_open
									||	d[sName]	// options.panes.fxName_open
									||	o.fxName	// options.west.fxName
									||	d.fxName	// options.panes.fxName
									||	"none"		// MEANS $.layout.defaults.panes.fxName == "" || false || null || 0
							;
					// validate fxName to ensure is valid effect - MUST have effect-config data in options.effects
					if (fxName === "none" || !$.effects || !$.effects[fxName] || !options.effects[fxName])
						fxName = o[sName] = "none"; // effect not loaded OR unrecognized fxName

					// set vars for effects subkeys to simplify logic
					var	fx		= options.effects[fxName] || {}	// effects.slide
							,	fx_all	= fx.all	|| null				// effects.slide.all
							,	fx_pane	= fx[pane]	|| null				// effects.slide.west
							;
					// create fxSpeed[_open|_close|_size]
					o[sSpeed] =
							o[sSpeed]				// options.west.fxSpeed_open
									||	d[sSpeed]				// options.west.fxSpeed_open
									||	o.fxSpeed				// options.west.fxSpeed
									||	d.fxSpeed				// options.panes.fxSpeed
									||	null					// DEFAULT - let fxSetting.duration control speed
					;
					// create fxSettings[_open|_close|_size]
					o[sSettings] = $.extend(
							{}
							,	fx_all					// effects.slide.all
							,	fx_pane					// effects.slide.west
							,	d.fxSettings			// options.panes.fxSettings
							,	o.fxSettings			// options.west.fxSettings
							,	d[sSettings]			// options.panes.fxSettings_open
							,	o[sSettings]			// options.west.fxSettings_open
					);
				});

				// DONE creating action-specific-settings for this pane,
				// so DELETE generic options - are no longer meaningful
				delete o.fxName;
				delete o.fxSpeed;
				delete o.fxSettings;
			}

			// DELETE 'panes' key now that we are done - values were copied to EACH pane
			delete options.panes;
		}

		/**
		 * Initialize module objects, styling, size and position for all panes
		 *
		 * @see  _initElements()
		 * @param {string}	pane		The pane to process
		 */
				,	getPane = function (pane) {
			var sel = options[pane].paneSelector
			if (sel.substr(0,1)==="#") // ID selector
			// NOTE: elements selected 'by ID' DO NOT have to be 'children'
				return $N.find(sel).eq(0);
			else { // class or other selector
				var $P = $N.children(sel).eq(0);
				// look for the pane nested inside a 'form' element
				return $P.length ? $P : $N.children("form:first").children(sel).eq(0);
			}
		}

				,	initPanes = function () {
			// NOTE: do north & south FIRST so we can measure their height - do center LAST
			$.each(_c.allPanes, function (idx, pane) {
				addPane( pane, true );
			});

			// init the pane-handles NOW in case we have to hide or close the pane below
			initHandles();

			// now that all panes have been initialized and initially-sized,
			// make sure there is really enough space available for each pane
			$.each(_c.borderPanes, function (i, pane) {
				if ($Ps[pane] && state[pane].isVisible) { // pane is OPEN
					setSizeLimits(pane);
					makePaneFit(pane); // pane may be Closed, Hidden or Resized by makePaneFit()
				}
			});
			// size center-pane AGAIN in case we 'closed' a border-pane in loop above
			sizeMidPanes("center");

			//	Chrome/Webkit sometimes fires callbacks BEFORE it completes resizing!
			//	Before RC30.3, there was a 10ms delay here, but that caused layout
			//	to load asynchrously, which is BAD, so try skipping delay for now

			// process pane contents and callbacks, and init/resize child-layout if exists
			$.each(_c.allPanes, function (i, pane) {
				var o = options[pane];
				if ($Ps[pane]) {
					if (state[pane].isVisible) { // pane is OPEN
						sizeContent(pane);
						// trigger pane.onResize if triggerEventsOnLoad = true
						if (o.triggerEventsOnLoad)
							_execCallback(pane, o.onresize_end || o.onresize);
						// resize child - IF inner-layout already exists (created before this layout)
						resizeChildLayout(pane);
					}
					// init childLayout - even if pane is not visible
					if (o.initChildLayout && o.childOptions)
						createChildLayout(pane);
				}
			});
		}

		/**
		 * Add a pane to the layout - subroutine of initPanes()
		 *
		 * @see  initPanes()
		 * @param {string}	pane			The pane to process
		 * @param {boolean=}	[force=false]	Size content after init
		 */
				,	addPane = function (pane, force) {
			if (!force && !isInitialized()) return;
			var
					o		= options[pane]
					,	s		= state[pane]
					,	c		= _c[pane]
					,	fx		= s.fx
					,	dir		= c.dir
					,	spacing	= o.spacing_open || 0
					,	isCenter = (pane === "center")
					,	CSS		= {}
					,	$P		= $Ps[pane]
					,	size, minSize, maxSize
					;

			// if pane-pointer already exists, remove the old one first
			if ($P)
				removePane( pane, false, true, false );
			else
				$Cs[pane] = false; // init

			$P = $Ps[pane] = getPane(pane);
			if (!$P.length) {
				$Ps[pane] = false; // logic
				return;
			}

			// SAVE original Pane CSS
			if (!$P.data("layoutCSS")) {
				var props = "position,top,left,bottom,right,width,height,overflow,zIndex,display,backgroundColor,padding,margin,border";
				$P.data("layoutCSS", elCSS($P, props));
			}

			// add classes, attributes & events
			$P	.data("parentLayout", Instance)
					.data("layoutRole", "pane")
					.data("layoutEdge", pane)
					.css(c.cssReq).css("zIndex", options.zIndexes.pane_normal)
					.css(o.applyDemoStyles ? c.cssDemo : {}) // demo styles
					.addClass( o.paneClass +" "+ o.paneClass+"-"+pane ) // default = "ui-layout-pane ui-layout-pane-west" - may be a dupe of 'paneSelector'
					.bind("mouseenter."+ sID, addHover )
					.bind("mouseleave."+ sID, removeHover );

			// create alias for pane data in Instance - initHandles will add more
			Instance[pane] = { name: pane, pane: $Ps[pane], options: options[pane], state: state[pane], child: children[pane] };

			// see if this pane has a 'scrolling-content element'
			initContent(pane, false); // false = do NOT sizeContent() - called later

			if (!isCenter) {
				// call _parseSize AFTER applying pane classes & styles - but before making visible (if hidden)
				// if o.size is auto or not valid, then MEASURE the pane and use that as its 'size'
				size	= s.size = _parseSize(pane, o.size);
				minSize	= _parseSize(pane,o.minSize) || 1;
				maxSize	= _parseSize(pane,o.maxSize) || 100000;
				if (size > 0) size = max(min(size, maxSize), minSize);

				// state for border-panes
				s.isClosed  = false; // true = pane is closed
				s.isSliding = false; // true = pane is currently open by 'sliding' over adjacent panes
				s.isResizing= false; // true = pane is in process of being resized
				s.isHidden	= false; // true = pane is hidden - no spacing, resizer or toggler is visible!

				// array for 'pin buttons' whose classNames are auto-updated on pane-open/-close
				if (!s.pins) s.pins = [];
			}
			//	states common to ALL panes
			s.tagName	= $P[0].tagName;
			s.edge		= pane;		// useful if pane is (or about to be) 'swapped' - easy find out where it is (or is going)
			s.noRoom	= false;	// true = pane 'automatically' hidden due to insufficient room - will unhide automatically
			s.isVisible	= true;		// false = pane is invisible - closed OR hidden - simplify logic

			// set css-position to account for container borders & padding
			switch (pane) {
				case "north": 	CSS.top 	= sC.insetTop;
					CSS.left 	= sC.insetLeft;
					CSS.right	= sC.insetRight;
					break;
				case "south": 	CSS.bottom	= sC.insetBottom;
					CSS.left 	= sC.insetLeft;
					CSS.right 	= sC.insetRight;
					break;
				case "west": 	CSS.left 	= sC.insetLeft; // top, bottom & height set by sizeMidPanes()
					break;
				case "east": 	CSS.right 	= sC.insetRight; // ditto
					break;
				case "center":	// top, left, width & height set by sizeMidPanes()
			}

			if (dir === "horz") // north or south pane
				CSS.height = cssH($P, size);
			else if (dir === "vert") // east or west pane
				CSS.width = cssW($P, size);
			//else if (isCenter) {}

			$P.css(CSS); // apply size -- top, bottom & height will be set by sizeMidPanes
			if (dir != "horz") sizeMidPanes(pane, true); // true = skipCallback

			// close or hide the pane if specified in settings
			if (o.initClosed && o.closable && !o.initHidden)
				close(pane, true, true); // true, true = force, noAnimation
			else if (o.initHidden || o.initClosed)
				hide(pane); // will be completely invisible - no resizer or spacing
			else if (!s.noRoom)
			// make the pane visible - in case was initially hidden
				$P.css("display","block");
			// ELSE setAsOpen() - called later by initHandles()

			// RESET visibility now - pane will appear IF display:block
			$P.css("visibility","visible");

			// check option for auto-handling of pop-ups & drop-downs
			if (o.showOverflowOnHover)
				$P.hover( allowOverflow, resetOverflow );

			// if adding a pane AFTER initialization, then...
			if (state.initialized) {
				initHandles( pane );
				initHotkeys( pane );
				resizeAll(); // will sizeContent if pane is visible
				if (s.isVisible) { // pane is OPEN
					if (o.triggerEventsOnLoad)
						_execCallback(pane, o.onresize_end || o.onresize);
					resizeChildLayout(pane);
				}
				if (o.initChildLayout && o.childOptions)
					createChildLayout(pane);
			}
		}

		/**
		 * Initialize module objects, styling, size and position for all resize bars and toggler buttons
		 *
		 * @see  _create()
		 * @param {string=}	[panes=""]	The edge(s) to process
		 */
				,	initHandles = function (panes) {
			panes = panes ? panes.split(",") : _c.borderPanes;

			// create toggler DIVs for each pane, and set object pointers for them, eg: $R.north = north toggler DIV
			$.each(panes, function (i, pane) {
				var $P		= $Ps[pane];
				$Rs[pane]	= false; // INIT
				$Ts[pane]	= false;
				if (!$P) return; // pane does not exist - skip

				var
						o		= options[pane]
						,	s		= state[pane]
						,	c		= _c[pane]
						,	rClass	= o.resizerClass
						,	tClass	= o.togglerClass
						,	side	= c.side.toLowerCase()
						,	spacing	= (s.isVisible ? o.spacing_open : o.spacing_closed)
						,	_pane	= "-"+ pane // used for classNames
						,	_state	= (s.isVisible ? "-open" : "-closed") // used for classNames
						,	I		= Instance[pane]
					// INIT RESIZER BAR
						,	$R		= I.resizer = $Rs[pane] = $("<div></div>")
					// INIT TOGGLER BUTTON
						,	$T		= I.toggler = (o.closable ? $Ts[pane] = $("<div></div>") : false)
						;

				//if (s.isVisible && o.resizable) ... handled by initResizable
				if (!s.isVisible && o.slidable)
					$R.attr("title", o.sliderTip).css("cursor", o.sliderCursor);

				$R	// if paneSelector is an ID, then create a matching ID for the resizer, eg: "#paneLeft" => "paneLeft-resizer"
						.attr("id", (o.paneSelector.substr(0,1)=="#" ? o.paneSelector.substr(1) + "-resizer" : ""))
						.data("parentLayout", Instance)
						.data("layoutRole", "resizer")
						.data("layoutEdge", pane)
						.css(_c.resizers.cssReq).css("zIndex", options.zIndexes.resizer_normal)
						.css(o.applyDemoStyles ? _c.resizers.cssDemo : {}) // add demo styles
						.addClass(rClass +" "+ rClass+_pane)
						.hover(addHover, removeHover) // ALWAYS add hover-classes, even if resizing is not enabled - handle with CSS instead
						.hover(onResizerEnter, onResizerLeave) // ALWAYS NEED resizer.mouseleave to balance toggler.mouseenter
						.appendTo($N) // append DIV to container
				;

				if ($T) {
					$T	// if paneSelector is an ID, then create a matching ID for the resizer, eg: "#paneLeft" => "#paneLeft-toggler"
							.attr("id", (o.paneSelector.substr(0,1)=="#" ? o.paneSelector.substr(1) + "-toggler" : ""))
							.data("parentLayout", Instance)
							.data("layoutRole", "toggler")
							.data("layoutEdge", pane)
							.css(_c.togglers.cssReq) // add base/required styles
							.css(o.applyDemoStyles ? _c.togglers.cssDemo : {}) // add demo styles
							.addClass(tClass +" "+ tClass+_pane)
							.hover(addHover, removeHover) // ALWAYS add hover-classes, even if toggling is not enabled - handle with CSS instead
							.bind("mouseenter", onResizerEnter) // NEED toggler.mouseenter because mouseenter MAY NOT fire on resizer
							.appendTo($R) // append SPAN to resizer DIV
					;
					// ADD INNER-SPANS TO TOGGLER
					if (o.togglerContent_open) // ui-layout-open
						$("<span>"+ o.togglerContent_open +"</span>")
								.data("layoutRole", "togglerContent")
								.data("layoutEdge", pane)
								.addClass("content content-open")
								.css("display","none")
								.appendTo( $T )
							//.hover( addHover, removeHover ) // use ui-layout-toggler-west-hover .content-open instead!
						;
					if (o.togglerContent_closed) // ui-layout-closed
						$("<span>"+ o.togglerContent_closed +"</span>")
								.data("layoutRole", "togglerContent")
								.data("layoutEdge", pane)
								.addClass("content content-closed")
								.css("display","none")
								.appendTo( $T )
							//.hover( addHover, removeHover ) // use ui-layout-toggler-west-hover .content-closed instead!
						;
					// ADD TOGGLER.click/.hover
					enableClosable(pane);
				}

				// add Draggable events
				initResizable(pane);

				// ADD CLASSNAMES & SLIDE-BINDINGS - eg: class="resizer resizer-west resizer-open"
				if (s.isVisible)
					setAsOpen(pane);	// onOpen will be called, but NOT onResize
				else {
					setAsClosed(pane);	// onClose will be called
					bindStartSlidingEvent(pane, true); // will enable events IF option is set
				}

			});

			// SET ALL HANDLE DIMENSIONS
			sizeHandles();
		}


		/**
		 * Initialize scrolling ui-layout-content div - if exists
		 *
		 * @see  initPane() - or externally after an Ajax injection
		 * @param {string}	[pane]			The pane to process
		 * @param {boolean=}	[resize=true]	Size content after init
		 */
				,	initContent = function (pane, resize) {
			if (!isInitialized()) return;
			var
					o	= options[pane]
					,	sel	= o.contentSelector
					,	I	= Instance[pane]
					,	$P	= $Ps[pane]
					,	$C
					;
			if (sel) $C = I.content = $Cs[pane] = (o.findNestedContent)
					? $P.find(sel).eq(0) // match 1-element only
					: $P.children(sel).eq(0)
			;
			if ($C && $C.length) {
				$C.data("layoutRole", "content");
				// SAVE original Pane CSS
				if (!$C.data("layoutCSS"))
					$C.data("layoutCSS", elCSS($C, "height"));
				$C.css( _c.content.cssReq );
				if (o.applyDemoStyles) {
					$C.css( _c.content.cssDemo ); // add padding & overflow: auto to content-div
					$P.css( _c.content.cssDemoPane ); // REMOVE padding/scrolling from pane
				}
				state[pane].content = {}; // init content state
				if (resize !== false) sizeContent(pane);
				// sizeContent() is called AFTER init of all elements
			}
			else
				I.content = $Cs[pane] = false;
		}


		/**
		 * Add resize-bars to all panes that specify it in options
		 * -dependancy: $.fn.resizable - will skip if not found
		 *
		 * @see  _create()
		 * @param {string=}	[panes=""]	The edge(s) to process
		 */
				,	initResizable = function (panes) {
			var	draggingAvailable = $.layout.plugins.draggable
					,	side // set in start()
					;
			panes = panes ? panes.split(",") : _c.borderPanes;

			$.each(panes, function (idx, pane) {
				var o = options[pane];
				if (!draggingAvailable || !$Ps[pane] || !o.resizable) {
					o.resizable = false;
					return true; // skip to next
				}

				var s		= state[pane]
						,	z		= options.zIndexes
						,	c		= _c[pane]
						,	side	= c.dir=="horz" ? "top" : "left"
						,	opEdge	= _c.oppositeEdge[pane]
						,	masks	=  pane +",center,"+ opEdge + (c.dir=="horz" ? ",west,east" : "")
						,	$P 		= $Ps[pane]
						,	$R		= $Rs[pane]
						,	base	= o.resizerClass
						,	lastPos	= 0 // used when live-resizing
						,	r, live // set in start because may change
					//	'drag' classes are applied to the ORIGINAL resizer-bar while dragging is in process
						,	resizerClass		= base+"-drag"				// resizer-drag
						,	resizerPaneClass	= base+"-"+pane+"-drag"		// resizer-north-drag
					//	'helper' class is applied to the CLONED resizer-bar while it is being dragged
						,	helperClass			= base+"-dragging"			// resizer-dragging
						,	helperPaneClass		= base+"-"+pane+"-dragging" // resizer-north-dragging
						,	helperLimitClass	= base+"-dragging-limit"	// resizer-drag
						,	helperPaneLimitClass = base+"-"+pane+"-dragging-limit"	// resizer-north-drag
						,	helperClassesSet	= false 					// logic var
						;

				if (!s.isClosed)
					$R.attr("title", o.resizerTip)
							.css("cursor", o.resizerCursor); // n-resize, s-resize, etc

				$R.draggable({
					containment:	$N[0] // limit resizing to layout container
					,	axis:			(c.dir=="horz" ? "y" : "x") // limit resizing to horz or vert axis
					,	delay:			0
					,	distance:		1
					,	grid:			o.resizingGrid
					//	basic format for helper - style it using class: .ui-draggable-dragging
					,	helper:			"clone"
					,	opacity:		o.resizerDragOpacity
					,	addClasses:		false // avoid ui-state-disabled class when disabled
					//,	iframeFix:		o.draggableIframeFix // TODO: consider using when bug is fixed
					,	zIndex:			z.resizer_drag

					,	start: function (e, ui) {
						// REFRESH options & state pointers in case we used swapPanes
						o = options[pane];
						s = state[pane];
						// re-read options
						live = o.livePaneResizing;

						// ondrag_start callback - will CANCEL hide if returns false
						// TODO: dragging CANNOT be cancelled like this, so see if there is a way?
						if (false === _execCallback(pane, o.ondrag_start)) return false;

						s.isResizing	= true; // prevent pane from closing while resizing
						timer.clear(pane+"_closeSlider"); // just in case already triggered

						// SET RESIZER LIMITS - used in drag()
						setSizeLimits(pane); // update pane/resizer state
						r = s.resizerPosition;
						lastPos = ui.position[ side ]

						$R.addClass( resizerClass +" "+ resizerPaneClass ); // add drag classes
						helperClassesSet = false; // reset logic var - see drag()

						// DISABLE TEXT SELECTION (probably already done by resizer.mouseOver)
						$('body').disableSelection();

						// MASK PANES CONTAINING IFRAMES, APPLETS OR OTHER TROUBLESOME ELEMENTS
						showMasks( masks );
					}

					,	drag: function (e, ui) {
						if (!helperClassesSet) { // can only add classes after clone has been added to the DOM
							//$(".ui-draggable-dragging")
							ui.helper
									.addClass( helperClass +" "+ helperPaneClass ) // add helper classes
									.css({ right: "auto", bottom: "auto" })	// fix dir="rtl" issue
									.children().css("visibility","hidden")	// hide toggler inside dragged resizer-bar
							;
							helperClassesSet = true;
							// draggable bug!? RE-SET zIndex to prevent E/W resize-bar showing through N/S pane!
							if (s.isSliding) $Ps[pane].css("zIndex", z.pane_sliding);
						}
						// CONTAIN RESIZER-BAR TO RESIZING LIMITS
						var limit = 0;
						if (ui.position[side] < r.min) {
							ui.position[side] = r.min;
							limit = -1;
						}
						else if (ui.position[side] > r.max) {
							ui.position[side] = r.max;
							limit = 1;
						}
						// ADD/REMOVE dragging-limit CLASS
						if (limit) {
							ui.helper.addClass( helperLimitClass +" "+ helperPaneLimitClass ); // at dragging-limit
							window.defaultStatus = (limit>0 && pane.match(/north|west/)) || (limit<0 && pane.match(/south|east/)) ? lang.maxSizeWarning : lang.minSizeWarning;
						}
						else {
							ui.helper.removeClass( helperLimitClass +" "+ helperPaneLimitClass ); // not at dragging-limit
							window.defaultStatus = "";
						}
						// DYNAMICALLY RESIZE PANES IF OPTION ENABLED
						// won't trigger unless resizer has actually moved!
						if (live && Math.abs(ui.position[side] - lastPos) >= o.liveResizingTolerance) {
							lastPos = ui.position[side];
							resizePanes(e, ui, pane)
						}
					}

					,	stop: function (e, ui) {
						$('body').enableSelection(); // RE-ENABLE TEXT SELECTION
						window.defaultStatus = ""; // clear 'resizing limit' message from statusbar
						$R.removeClass( resizerClass +" "+ resizerPaneClass ); // remove drag classes from Resizer
						s.isResizing = false;
						resizePanes(e, ui, pane, true, masks); // true = resizingDone
					}

				});
			});

			/**
			 * resizePanes
			 *
			 * Sub-routine called from stop() - and drag() if livePaneResizing
			 *
			 * @param {!Object}		evt
			 * @param {!Object}		ui
			 * @param {string}		pane
			 * @param {boolean=}		[resizingDone=false]
			 */
			var resizePanes = function (evt, ui, pane, resizingDone, masks) {
				var	dragPos	= ui.position
						,	c		= _c[pane]
						,	o		= options[pane]
						,	s		= state[pane]
						,	resizerPos
						;
				switch (pane) {
					case "north":	resizerPos = dragPos.top; break;
					case "west":	resizerPos = dragPos.left; break;
					case "south":	resizerPos = sC.offsetHeight - dragPos.top  - o.spacing_open; break;
					case "east":	resizerPos = sC.offsetWidth  - dragPos.left - o.spacing_open; break;
				};
				// remove container margin from resizer position to get the pane size
				var newSize = resizerPos - sC["inset"+ c.side];

				// Disable OR Resize Mask(s) created in drag.start
				if (!resizingDone) {
					// ensure we meet liveResizingTolerance criteria
					if (Math.abs(newSize - s.size) < o.liveResizingTolerance)
						return; // SKIP resize this time
					// resize the pane
					manualSizePane(pane, newSize, false, true); // true = noAnimation
					sizeMasks(); // resize all visible masks
				}
				else { // resizingDone
					// ondrag_end callback
					if (false !== _execCallback(pane, o.ondrag_end || o.ondrag))
						manualSizePane(pane, newSize, false, true); // true = noAnimation
					hideMasks(); // hide all masks, which include panes with 'content/iframe-masks'
					if (s.isSliding && masks) // RE-SHOW only 'object-masks' so objects won't show through sliding pane
						showMasks( masks, true ); // true = onlyForObjects
				}
			};
		}

		/**
		 *	sizeMask
		 *
		 *	Needed to overlay a DIV over an IFRAME-pane because mask CANNOT be *inside* the pane
		 *	Called when mask created, and during livePaneResizing
		 */
				,	sizeMask = function () {
			var $M		= $(this)
					,	pane	= $M.data("layoutMask") // eg: "west"
					,	s		= state[pane]
					;
			// only masks over an IFRAME-pane need manual resizing
			if (s.tagName == "IFRAME" && s.isVisible) // no need to mask closed/hidden panes
				$M.css({
					top:	s.offsetTop
					,	left:	s.offsetLeft
					,	width:	s.outerWidth
					,	height:	s.outerHeight
				});
			/* ALT Method...
			 var $P = $Ps[pane];
			 $M.css( $P.position() ).css({ width: $P[0].offsetWidth, height: $P[0].offsetHeight });
			 */
		}
				,	sizeMasks = function () {
			$Ms.each( sizeMask ); // resize all 'visible' masks
		}

				,	showMasks = function (panes, onlyForObjects) {
			var a	= panes ? panes.split(",") : $.layout.config.allPanes
					,	z	= options.zIndexes
					,	o, s;
			$.each(a, function(i,p){
				s = state[p];
				o = options[p];
				if (s.isVisible && ( (!onlyForObjects && o.maskContents) || o.maskObjects )) {
					getMasks(p).each(function(){
						sizeMask.apply(this);
						this.style.zIndex = s.isSliding ? z.pane_sliding+1 : z.pane_normal+1
						this.style.display = "block";
					});
				}
			});
		}

				,	hideMasks = function () {
			// ensure no pane is resizing - could be a timing issue
			var skip;
			$.each( $.layout.config.borderPanes, function(i,p){
				if (state[p].isResizing) {
					skip = true;
					return false; // BREAK
				}
			});
			if (!skip)
				$Ms.hide(); // hide ALL masks
		}

				,	getMasks = function (pane) {
			var $Masks	= $([])
					,	$M, i = 0, c = $Ms.length
					;
			for (; i<c; i++) {
				$M = $Ms.eq(i);
				if ($M.data("layoutMask") === pane)
					$Masks = $Masks.add( $M );
			}
			if ($Masks.length)
				return $Masks;
			else
				return createMasks(pane);
		}

		/**
		 *	createMasks
		 *
		 *	Generates both DIV (ALWAYS used) and IFRAME (optional) elements as masks
		 *	An IFRAME mask is created *under* the DIV when maskObjects=true, because a DIV cannot mask an applet
		 */
				,	createMasks = function (pane) {
			var
					$P		= $Ps[pane]
					,	s		= state[pane]
					,	o		= options[pane]
					,	z		= options.zIndexes
				//,	objMask	= o.maskObjects && s.tagName != "IFRAME" // check for option
					,	$Masks	= $([])
					,	isIframe, el, $M, css, i
					;
			if (!o.maskContents && !o.maskObjects) return $Masks;
			// if o.maskObjects=true, then loop TWICE to create BOTH kinds of mask, else only create a DIV
			for (i=0; i < (o.maskObjects ? 2 : 1); i++) {
				isIframe = o.maskObjects && i==0;
				el = document.createElement( isIframe ? "iframe" : "div" );
				$M = $(el).data("layoutMask", pane); // add data to relate mask to pane
				el.className = "ui-layout-mask ui-layout-mask-"+ pane; // for user styling
				css = el.style;
				// styles common to both DIVs and IFRAMES
				css.display		= "block";
				css.position	= "absolute";
				if (isIframe) { // IFRAME-only props
					el.frameborder = 0;
					el.src		= "about:blank";
					css.opacity	= 0;
					css.filter	= "Alpha(Opacity='0')";
					css.border	= 0;
				}
				// if pane is an IFRAME, then must mask the pane itself
				if (s.tagName == "IFRAME") {
					// NOTE sizing done by a subroutine so can be called during live-resizing
					css.zIndex	= z.pane_normal+1; // 1-higher than pane
					$N.append( el ); // append to LAYOUT CONTAINER
				}
				// otherwise put masks *inside the pane* to mask its contents
				else {
					$M.addClass("ui-layout-mask-inside-pane");
					css.zIndex	= o.maskZindex || z.content_mask; // usually 1, but customizable
					css.top		= 0;
					css.left	= 0;
					css.width	= "100%";
					css.height	= "100%";
					$P.append( el ); // append INSIDE pane element
				}
				// add to return object
				$Masks = $Masks.add( el );
				// add Mask to cached array so can be resized & reused
				$Ms = $Ms.add( el );
			}
			return $Masks;
		}


		/**
		 * Destroy this layout and reset all elements
		 *
		 * @param {boolean=}	[destroyChildren=false]		Destory Child-Layouts first?
		 */
				,	destroy = function (destroyChildren) {
			// UNBIND layout events and remove global object
			$(window).unbind("."+ sID);		// resize & unload
			$(document).unbind("."+ sID);	// keyDown (hotkeys)

			// reset layout-container
			$N	.clearQueue()
					.removeData("layout")
					.removeData("layoutContainer")
					.removeClass(options.containerClass)
			;

			// remove all mask elements that have been created
			$Ms.remove();

			// loop all panes to remove layout classes, attributes and bindings
			$.each(_c.allPanes, function (i, pane) {
				removePane( pane, false, true, destroyChildren ); // true = skipResize
			});

			// do NOT reset container CSS if is a 'pane' (or 'content') in an outer-layout - ie, THIS layout is 'nested'
			var css = "layoutCSS";
			if ($N.data(css) && !$N.data("layoutRole")) // RESET CSS
				$N.css( $N.data(css) ).removeData(css);

			// for full-page layouts, also reset the <HTML> CSS
			if (sC.tagName === "BODY" && ($N = $("html")).data(css)) // RESET <HTML> CSS
				$N.css( $N.data(css) ).removeData(css);

			// trigger plugins for this layout, if there are any
			runPluginCallbacks( Instance, $.layout.onDestroy );

			// trigger state-management and onunload callback
			unload();

			// clear the Instance of everything except for container & options (so could recreate)
			// RE-CREATE: myLayout = myLayout.container.layout( myLayout.options );
			for (n in Instance)
				if (!n.match(/^(container|options)$/)) delete Instance[ n ];
			// add a 'destroyed' flag to make it easy to check
			Instance.destroyed = true;
		}

		/**
		 * Remove a pane from the layout - subroutine of destroy()
		 *
		 * @see  destroy()
		 * @param {string}	pane				The pane to process
		 * @param {boolean=}	[remove=false]		Remove the DOM element?
		 * @param {boolean=}	[skipResize=false]	Skip calling resizeAll()?
		 */
				,	removePane = function (pane, remove, skipResize, destroyChild) {
			if (!isInitialized()) return;
			var	$P	= $Ps[pane]
					,	$C	= $Cs[pane]
					,	$R	= $Rs[pane]
					,	$T	= $Ts[pane]
					;
			// NOTE: elements can still exist even after remove()
			//		so check for missing data(), which is cleared by removed()
			if ($P && $.isEmptyObject( $P.data() )) $P = false;
			if ($C && $.isEmptyObject( $C.data() )) $C = false;
			if ($R && $.isEmptyObject( $R.data() )) $R = false;
			if ($T && $.isEmptyObject( $T.data() )) $T = false;

			if ($P) $P.stop(true, true);

			//	check for a child layout
			var	o	= options[pane]
					,	s	= state[pane]
					,	d	= "layout"
					,	css	= "layoutCSS"
					,	Child	= children[pane] || ($P ? $P.data(d) : 0) || ($C ? $C.data(d) : 0) || null
					,	destroy	= destroyChild !== undefined ? destroyChild : o.destroyChildLayout
					;

			// FIRST destroy the child-layout(s)
			if (destroy && Child && !Child.destroyed) {
				Child.destroy(true);	// tell child-layout to destroy ALL its child-layouts too
				if (Child.destroyed)	// destroy was successful
					Child = null;		// clear pointer for logic below
			}

			if ($P && remove && !Child)
				$P.remove();
			else if ($P) {
				//	create list of ALL pane-classes that need to be removed
				var	root	= o.paneClass // default="ui-layout-pane"
						,	pRoot	= root +"-"+ pane // eg: "ui-layout-pane-west"
						,	_open	= "-open"
						,	_sliding= "-sliding"
						,	_closed	= "-closed"
						,	classes	= [	root, root+_open, root+_closed, root+_sliding,		// generic classes
					pRoot, pRoot+_open, pRoot+_closed, pRoot+_sliding ]	// pane-specific classes
						;
				$.merge(classes, getHoverClasses($P, true)); // ADD hover-classes
				// remove all Layout classes from pane-element
				$P	.removeClass( classes.join(" ") ) // remove ALL pane-classes
						.removeData("layoutParent")
						.removeData("layoutRole")
						.removeData("layoutEdge")
						.removeData("autoHidden")	// in case set
						.unbind("."+ sID) // remove ALL Layout events
					// TODO: remove these extra unbind commands when jQuery is fixed
					//.unbind("mouseenter"+ sID)
					//.unbind("mouseleave"+ sID)
				;
				// do NOT reset CSS if this pane/content is STILL the container of a nested layout!
				// the nested layout will reset its 'container' CSS when/if it is destroyed
				if ($C && $C.data(d)) {
					// a content-div may not have a specific width, so give it one to contain the Layout
					$C.width( $C.width() );
					Child.resizeAll(); // now resize the Layout
				}
				else if ($C)
					$C.css( $C.data(css) ).removeData(css).removeData("layoutRole");
				// remove pane AFTER content in case there was a nested layout
				if (!$P.data(d))
					$P.css( $P.data(css) ).removeData(css);
			}

			// REMOVE pane resizer and toggler elements
			if ($T) $T.remove();
			if ($R) $R.remove();

			// CLEAR all pointers and state data
			Instance[pane] = $Ps[pane] = $Cs[pane] = $Rs[pane] = $Ts[pane] = children[pane] = false;
			s = { removed: true };

			if (!skipResize)
				resizeAll();
		}


			/*
			 * ###########################
			 *	   ACTION METHODS
			 * ###########################
			 */

		/**
		 * Completely 'hides' a pane, including its spacing - as if it does not exist
		 * The pane is not actually 'removed' from the source, so can use 'show' to un-hide it
		 *
		 * @param {string}	pane		The pane being hidden, ie: north, south, east, or west
		 * @param {boolean=}	[noAnimation=false]
		 */
				,	hide = function (pane, noAnimation) {
			if (!isInitialized()) return;
			var
					o	= options[pane]
					,	s	= state[pane]
					,	$P	= $Ps[pane]
					,	$R	= $Rs[pane]
					;
			if (!$P || s.isHidden) return; // pane does not exist OR is already hidden

			// onhide_start callback - will CANCEL hide if returns false
			if (state.initialized && false === _execCallback(pane, o.onhide_start)) return;

			s.isSliding = false; // just in case

			// now hide the elements
			if ($R) $R.hide(); // hide resizer-bar
			if (!state.initialized || s.isClosed) {
				s.isClosed = true; // to trigger open-animation on show()
				s.isHidden  = true;
				s.isVisible = false;
				$P.hide(); // no animation when loading page
				sizeMidPanes(_c[pane].dir === "horz" ? "" : "center");
				if (state.initialized || o.triggerEventsOnLoad)
					_execCallback(pane, o.onhide_end || o.onhide);
			}
			else {
				s.isHiding = true; // used by onclose
				close(pane, false, noAnimation); // adjust all panes to fit
			}
		}

		/**
		 * Show a hidden pane - show as 'closed' by default unless openPane = true
		 *
		 * @param {string}	pane		The pane being opened, ie: north, south, east, or west
		 * @param {boolean=}	[openPane=false]
		 * @param {boolean=}	[noAnimation=false]
		 * @param {boolean=}	[noAlert=false]
		 */
				,	show = function (pane, openPane, noAnimation, noAlert) {
			if (!isInitialized()) return;
			var
					o	= options[pane]
					,	s	= state[pane]
					,	$P	= $Ps[pane]
					,	$R	= $Rs[pane]
					;
			if (!$P || !s.isHidden) return; // pane does not exist OR is not hidden

			// onshow_start callback - will CANCEL show if returns false
			if (false === _execCallback(pane, o.onshow_start)) return;

			s.isSliding = false; // just in case
			s.isShowing = true; // used by onopen/onclose
			//s.isHidden  = false; - will be set by open/close - if not cancelled

			// now show the elements
			//if ($R) $R.show(); - will be shown by open/close
			if (openPane === false)
				close(pane, true); // true = force
			else
				open(pane, false, noAnimation, noAlert); // adjust all panes to fit
		}


		/**
		 * Toggles a pane open/closed by calling either open or close
		 *
		 * @param {string}	pane   The pane being toggled, ie: north, south, east, or west
		 * @param {boolean=}	[slide=false]
		 */
				,	toggle = function (pane, slide) {
			if (!isInitialized()) return;
			if (!isStr(pane)) {
				pane.stopImmediatePropagation(); // pane = event
				pane = $(this).data("layoutEdge"); // bound to $R.dblclick
			}
			var s = state[pane];
			if (s.isHidden)
				show(pane); // will call 'open' after unhiding it
			else if (s.isClosed)
				open(pane, !!slide);
			else
				close(pane);
		}


		/**
		 * Utility method used during init or other auto-processes
		 *
		 * @param {string}	pane   The pane being closed
		 * @param {boolean=}	[setHandles=false]
		 */
				,	_closePane = function (pane, setHandles) {
			var
					$P	= $Ps[pane]
					,	s	= state[pane]
					;
			$P.hide();
			s.isClosed = true;
			s.isVisible = false;
			// UNUSED: if (setHandles) setAsClosed(pane, true); // true = force
		}

		/**
		 * Close the specified pane (animation optional), and resize all other panes as needed
		 *
		 * @param {string}	pane		The pane being closed, ie: north, south, east, or west
		 * @param {boolean=}	[force=false]
		 * @param {boolean=}	[noAnimation=false]
		 * @param {boolean=}	[skipCallback=false]
		 */
				,	close = function (pane, force, noAnimation, skipCallback) {
			if (!state.initialized && $Ps[pane]) {
				_closePane(pane); // INIT pane as closed
				return;
			}
			if (!isInitialized()) return;

			var
					$P	= $Ps[pane]
					,	$R	= $Rs[pane]
					,	$T	= $Ts[pane]
					,	o	= options[pane]
					,	s	= state[pane]
					,	c	= _c[pane]
					,	doFX, isShowing, isHiding, wasSliding;

			// QUEUE in case another action/animation is in progress
			$N.queue(function( queueNext ){

				if ( !$P
						||	(!o.closable && !s.isShowing && !s.isHiding)	// invalid request // (!o.resizable && !o.closable) ???
						||	(!force && s.isClosed && !s.isShowing)			// already closed
						) return queueNext();

				// transfer logic vars to temp vars
				isShowing	= s.isShowing;
				isHiding	= s.isHiding;
				wasSliding	= s.isSliding;
				// now clear the logic vars
				delete s.isShowing;
				delete s.isHiding;

				// onclose_start callback - will CANCEL hide if returns false
				// SKIP if just 'showing' a hidden pane as 'closed'
				if (!isShowing && false === _execCallback(pane, o.onclose_start)) return queueNext();

				doFX		= !noAnimation && !s.isClosed && (o.fxName_close != "none");
				s.isMoving	= true;
				s.isClosed	= true;
				s.isVisible	= false;
				// update isHidden BEFORE sizing panes
				if (isHiding) s.isHidden = true;
				else if (isShowing) s.isHidden = false;

				if (s.isSliding) // pane is being closed, so UNBIND trigger events
					bindStopSlidingEvents(pane, false); // will set isSliding=false
				else // resize panes adjacent to this one
					sizeMidPanes(_c[pane].dir === "horz" ? "" : "center", false); // false = NOT skipCallback

				// if this pane has a resizer bar, move it NOW - before animation
				setAsClosed(pane);

				// CLOSE THE PANE
				if (doFX) { // animate the close
					// mask panes with objects
					var masks = "center"+ (c.dir=="horz" ? ",west,east" : "");
					showMasks( masks, true );	// true = ONLY mask panes with maskObjects=true
					lockPaneForFX(pane, true);	// need to set left/top so animation will work
					$P.hide( o.fxName_close, o.fxSettings_close, o.fxSpeed_close, function () {
						lockPaneForFX(pane, false); // undo
						if (s.isClosed) close_2();
						queueNext();
					});
				}
				else { // hide the pane without animation
					$P.hide();
					close_2();
					queueNext();
				};
			});

			// SUBROUTINE
			function close_2 () {
				s.isMoving	= false;
				bindStartSlidingEvent(pane, true); // will enable if o.slidable = true

				// if opposite-pane was autoClosed, see if it can be autoOpened now
				var altPane = _c.oppositeEdge[pane];
				if (state[ altPane ].noRoom) {
					setSizeLimits( altPane );
					makePaneFit( altPane );
				}

				// hide any masks shown while closing
				hideMasks();

				if (!skipCallback && (state.initialized || o.triggerEventsOnLoad)) {
					// onclose callback - UNLESS just 'showing' a hidden pane as 'closed'
					if (!isShowing) _execCallback(pane, o.onclose_end || o.onclose);
					// onhide OR onshow callback
					if (isShowing)	_execCallback(pane, o.onshow_end || o.onshow);
					if (isHiding)	_execCallback(pane, o.onhide_end || o.onhide);
				}
			}
		}

		/**
		 * @param {string}	pane	The pane just closed, ie: north, south, east, or west
		 */
				,	setAsClosed = function (pane) {
			var
					$P		= $Ps[pane]
					,	$R		= $Rs[pane]
					,	$T		= $Ts[pane]
					,	o		= options[pane]
					,	s		= state[pane]
					,	side	= _c[pane].side.toLowerCase()
					,	inset	= "inset"+ _c[pane].side
					,	rClass	= o.resizerClass
					,	tClass	= o.togglerClass
					,	_pane	= "-"+ pane // used for classNames
					,	_open	= "-open"
					,	_sliding= "-sliding"
					,	_closed	= "-closed"
					;
			$R
					.css(side, sC[inset]) // move the resizer
					.removeClass( rClass+_open +" "+ rClass+_pane+_open )
					.removeClass( rClass+_sliding +" "+ rClass+_pane+_sliding )
					.addClass( rClass+_closed +" "+ rClass+_pane+_closed )
					.unbind("dblclick."+ sID)
			;
			// DISABLE 'resizing' when closed - do this BEFORE bindStartSlidingEvent?
			if (o.resizable && $.layout.plugins.draggable)
				$R
						.draggable("disable")
						.removeClass("ui-state-disabled") // do NOT apply disabled styling - not suitable here
						.css("cursor", "default")
						.attr("title","")
				;

			// if pane has a toggler button, adjust that too
			if ($T) {
				$T
						.removeClass( tClass+_open +" "+ tClass+_pane+_open )
						.addClass( tClass+_closed +" "+ tClass+_pane+_closed )
						.attr("title", o.togglerTip_closed) // may be blank
				;
				// toggler-content - if exists
				$T.children(".content-open").hide();
				$T.children(".content-closed").css("display","block");
			}

			// sync any 'pin buttons'
			syncPinBtns(pane, false);

			if (state.initialized) {
				// resize 'length' and position togglers for adjacent panes
				sizeHandles();
			}
		}

		/**
		 * Open the specified pane (animation optional), and resize all other panes as needed
		 *
		 * @param {string}	pane		The pane being opened, ie: north, south, east, or west
		 * @param {boolean=}	[slide=false]
		 * @param {boolean=}	[noAnimation=false]
		 * @param {boolean=}	[noAlert=false]
		 */
				,	open = function (pane, slide, noAnimation, noAlert) {
			if (!isInitialized()) return;
			var
					$P	= $Ps[pane]
					,	$R	= $Rs[pane]
					,	$T	= $Ts[pane]
					,	o	= options[pane]
					,	s	= state[pane]
					,	c	= _c[pane]
					,	doFX, isShowing;

			// QUEUE in case another action/animation is in progress
			$N.queue(function( queueNext ){

				if ( !$P
						||	(!o.resizable && !o.closable && !s.isShowing)	// invalid request
						||	(s.isVisible && !s.isSliding)					// already open
						) return queueNext();

				// pane can ALSO be unhidden by just calling show(), so handle this scenario
				if (s.isHidden && !s.isShowing) {
					show(pane, true);
					return;
				}

				if (o.autoResize && s.size != o.size) // resize pane to original size set in options
					sizePane(pane, o.size, true, true, true); // true=skipCallback/forceResize/noAnimation
				else
					setSizeLimits(pane, slide);

				//setSizeLimits(pane, slide); // update pane-state
				// onopen_start callback - will CANCEL hide if returns false
				if (false === _execCallback(pane, o.onopen_start)) return;

				// make sure there is enough space available to open the pane
				setSizeLimits(pane, slide); // update pane-state
				if (s.minSize > s.maxSize) { // INSUFFICIENT ROOM FOR PANE TO OPEN!
					syncPinBtns(pane, false); // make sure pin-buttons are reset
					if (!noAlert && o.noRoomToOpenTip)
						alert(o.noRoomToOpenTip);
					return queueNext(); // ABORT
				}

				if (slide) // START Sliding - will set isSliding=true
					bindStopSlidingEvents(pane, true); // BIND trigger events to close sliding-pane
				else if (s.isSliding) // PIN PANE (stop sliding) - open pane 'normally' instead
					bindStopSlidingEvents(pane, false); // UNBIND trigger events - will set isSliding=false
				else if (o.slidable)
					bindStartSlidingEvent(pane, false); // UNBIND trigger events

				s.noRoom = false; // will be reset by makePaneFit if 'noRoom'
				makePaneFit(pane);

				// transfer logic var to temp var
				isShowing = s.isShowing;
				// now clear the logic var
				delete s.isShowing;

				doFX		= !noAnimation && s.isClosed && (o.fxName_open != "none");
				s.isMoving	= true;
				s.isVisible	= true;
				s.isClosed	= false;
				// update isHidden BEFORE sizing panes - WHY??? Old?
				if (isShowing) s.isHidden = false;

				if (doFX) { // ANIMATE
					// mask panes with objects
					var masks = "center"+ (c.dir=="horz" ? ",west,east" : "");
					if (s.isSliding) masks += ","+ _c.oppositeEdge[pane];
					showMasks( masks, true );	// true = ONLY mask panes with maskObjects=true
					lockPaneForFX(pane, true);	// need to set left/top so animation will work
					$P.show( o.fxName_open, o.fxSettings_open, o.fxSpeed_open, function() {
						lockPaneForFX(pane, false); // undo
						if (s.isVisible) open_2(); // continue
						queueNext();
					});
				}
				else {// no animation
					$P.show();	// just show pane and...
					open_2();	// continue
					queueNext();
				};
			});

			// SUBROUTINE
			function open_2 () {
				s.isMoving	= false;

				// cure iframe display issues
				_fixIframe(pane);

				// NOTE: if isSliding, then other panes are NOT 'resized'
				if (!s.isSliding) { // resize all panes adjacent to this one
					hideMasks(); // remove any masks shown while opening
					sizeMidPanes(_c[pane].dir=="vert" ? "center" : "", false); // false = NOT skipCallback
				}

				// set classes, position handles and execute callbacks...
				setAsOpen(pane);
			};

		}

		/**
		 * @param {string}	pane		The pane just opened, ie: north, south, east, or west
		 * @param {boolean=}	[skipCallback=false]
		 */
				,	setAsOpen = function (pane, skipCallback) {
			var
					$P		= $Ps[pane]
					,	$R		= $Rs[pane]
					,	$T		= $Ts[pane]
					,	o		= options[pane]
					,	s		= state[pane]
					,	side	= _c[pane].side.toLowerCase()
					,	inset	= "inset"+ _c[pane].side
					,	rClass	= o.resizerClass
					,	tClass	= o.togglerClass
					,	_pane	= "-"+ pane // used for classNames
					,	_open	= "-open"
					,	_closed	= "-closed"
					,	_sliding= "-sliding"
					;
			$R
					.css(side, sC[inset] + getPaneSize(pane)) // move the resizer
					.removeClass( rClass+_closed +" "+ rClass+_pane+_closed )
					.addClass( rClass+_open +" "+ rClass+_pane+_open )
			;
			if (s.isSliding)
				$R.addClass( rClass+_sliding +" "+ rClass+_pane+_sliding )
			else // in case 'was sliding'
				$R.removeClass( rClass+_sliding +" "+ rClass+_pane+_sliding )

			if (o.resizerDblClickToggle)
				$R.bind("dblclick", toggle );
			removeHover( 0, $R ); // remove hover classes
			if (o.resizable && $.layout.plugins.draggable)
				$R	.draggable("enable")
						.css("cursor", o.resizerCursor)
						.attr("title", o.resizerTip);
			else if (!s.isSliding)
				$R.css("cursor", "default"); // n-resize, s-resize, etc

			// if pane also has a toggler button, adjust that too
			if ($T) {
				$T	.removeClass( tClass+_closed +" "+ tClass+_pane+_closed )
						.addClass( tClass+_open +" "+ tClass+_pane+_open )
						.attr("title", o.togglerTip_open); // may be blank
				removeHover( 0, $T ); // remove hover classes
				// toggler-content - if exists
				$T.children(".content-closed").hide();
				$T.children(".content-open").css("display","block");
			}

			// sync any 'pin buttons'
			syncPinBtns(pane, !s.isSliding);

			// update pane-state dimensions - BEFORE resizing content
			$.extend(s, elDims($P));

			if (state.initialized) {
				// resize resizer & toggler sizes for all panes
				sizeHandles();
				// resize content every time pane opens - to be sure
				sizeContent(pane, true); // true = remeasure headers/footers, even if 'pane.isMoving'
			}

			if (!skipCallback && (state.initialized || o.triggerEventsOnLoad) && $P.is(":visible")) {
				// onopen callback
				_execCallback(pane, o.onopen_end || o.onopen);
				// onshow callback - TODO: should this be here?
				if (s.isShowing) _execCallback(pane, o.onshow_end || o.onshow);
				// ALSO call onresize because layout-size *may* have changed while pane was closed
				if (state.initialized) {
					_execCallback(pane, o.onresize_end || o.onresize);
					resizeChildLayout(pane);
				}
			}
		}


		/**
		 * slideOpen / slideClose / slideToggle
		 *
		 * Pass-though methods for sliding
		 */
				,	slideOpen = function (evt_or_pane) {
			if (!isInitialized()) return;
			var
					evt		= isStr(evt_or_pane) ? null : evt_or_pane
					,	pane	= evt ? $(this).data("layoutEdge") : evt_or_pane
					,	s		= state[pane]
					,	delay	= options[pane].slideDelay_open
					;
			// prevent event from triggering on NEW resizer binding created below
			if (evt) evt.stopImmediatePropagation();

			if (s.isClosed && evt && evt.type === "mouseenter" && delay > 0)
			// trigger = mouseenter - use a delay
				timer.set(pane+"_openSlider", open_NOW, delay);
			else
				open_NOW(); // will unbind events if is already open

			/**
			 * SUBROUTINE for timed open
			 */
			function open_NOW () {
				if (!s.isClosed) // skip if no longer closed!
					bindStopSlidingEvents(pane, true); // BIND trigger events to close sliding-pane
				else if (!s.isMoving)
					open(pane, true); // true = slide - open() will handle binding
			};
		}

				,	slideClose = function (evt_or_pane) {
			if (!isInitialized()) return;
			var
					evt		= isStr(evt_or_pane) ? null : evt_or_pane
					,	pane	= evt ? $(this).data("layoutEdge") : evt_or_pane
					,	o		= options[pane]
					,	s		= state[pane]
					,	delay	= s.isMoving ? 1000 : 300 // MINIMUM delay - option may override
					;
			if (s.isClosed || s.isResizing)
				return; // skip if already closed OR in process of resizing
			else if (o.slideTrigger_close === "click")
				close_NOW(); // close immediately onClick
			else if (o.preventQuickSlideClose && s.isMoving)
				return; // handle Chrome quick-close on slide-open
			else if (o.preventPrematureSlideClose && evt && $.layout.isMouseOverElem(evt, $Ps[pane]))
				return; // handle incorrect mouseleave trigger, like when over a SELECT-list in IE
			else if (evt) // trigger = mouseleave - use a delay
			// 1 sec delay if 'opening', else .3 sec
				timer.set(pane+"_closeSlider", close_NOW, max(o.slideDelay_close, delay));
			else // called programically
				close_NOW();

			/**
			 * SUBROUTINE for timed close
			 */
			function close_NOW () {
				if (s.isClosed) // skip 'close' if already closed!
					bindStopSlidingEvents(pane, false); // UNBIND trigger events - TODO: is this needed here?
				else if (!s.isMoving)
					close(pane); // close will handle unbinding
			};
		}

		/**
		 * @param {string}	pane		The pane being opened, ie: north, south, east, or west
		 */
				,	slideToggle = function (pane) { toggle(pane, true); }


		/**
		 * Must set left/top on East/South panes so animation will work properly
		 *
		 * @param {string}	pane	The pane to lock, 'east' or 'south' - any other is ignored!
		 * @param {boolean}	doLock  true = set left/top, false = remove
		 */
				,	lockPaneForFX = function (pane, doLock) {
			var $P	= $Ps[pane]
					,	s	= state[pane]
					,	o	= options[pane]
					,	z	= options.zIndexes
					;
			if (doLock) {
				$P.css({ zIndex: z.pane_animate }); // overlay all elements during animation
				if (pane=="south")
					$P.css({ top: sC.insetTop + sC.innerHeight - $P.outerHeight() });
				else if (pane=="east")
					$P.css({ left: sC.insetLeft + sC.innerWidth - $P.outerWidth() });
			}
			else { // animation DONE - RESET CSS
				// TODO: see if this can be deleted. It causes a quick-close when sliding in Chrome
				$P.css({ zIndex: (s.isSliding ? z.pane_sliding : z.pane_normal) });
				if (pane=="south")
					$P.css({ top: "auto" });
				else if (pane=="east")
					$P.css({ left: "auto" });
				// fix anti-aliasing in IE - only needed for animations that change opacity
				if (browser.msie && o.fxOpacityFix && o.fxName_open != "slide" && $P.css("filter") && $P.css("opacity") == 1)
					$P[0].style.removeAttribute('filter');
			}
		}


		/**
		 * Toggle sliding functionality of a specific pane on/off by adding removing 'slide open' trigger
		 *
		 * @see  open(), close()
		 * @param {string}	pane	The pane to enable/disable, 'north', 'south', etc.
		 * @param {boolean}	enable	Enable or Disable sliding?
		 */
				,	bindStartSlidingEvent = function (pane, enable) {
			var o		= options[pane]
					,	$P		= $Ps[pane]
					,	$R		= $Rs[pane]
					,	trigger	= o.slideTrigger_open.toLowerCase()
					;
			if (!$R || (enable && !o.slidable)) return;

			// make sure we have a valid event
			if (trigger.match(/mouseover/))
				trigger = o.slideTrigger_open = "mouseenter";
			else if (!trigger.match(/click|dblclick|mouseenter/))
				trigger = o.slideTrigger_open = "click";

			$R
				// add or remove trigger event
					[enable ? "bind" : "unbind"](trigger +'.'+ sID, slideOpen)
				// set the appropriate cursor & title/tip
					.css("cursor", enable ? o.sliderCursor : "default")
					.attr("title", enable ? o.sliderTip : "")
			;
		}

		/**
		 * Add or remove 'mouseleave' events to 'slide close' when pane is 'sliding' open or closed
		 * Also increases zIndex when pane is sliding open
		 * See bindStartSlidingEvent for code to control 'slide open'
		 *
		 * @see  slideOpen(), slideClose()
		 * @param {string}	pane	The pane to process, 'north', 'south', etc.
		 * @param {boolean}	enable	Enable or Disable events?
		 */
				,	bindStopSlidingEvents = function (pane, enable) {
			var	o		= options[pane]
					,	s		= state[pane]
					,	c		= _c[pane]
					,	z		= options.zIndexes
					,	trigger	= o.slideTrigger_close.toLowerCase()
					,	action	= (enable ? "bind" : "unbind")
					,	$P		= $Ps[pane]
					,	$R		= $Rs[pane]
					;
			s.isSliding = enable; // logic
			timer.clear(pane+"_closeSlider"); // just in case

			// remove 'slideOpen' trigger event from resizer
			// ALSO will raise the zIndex of the pane & resizer
			if (enable) bindStartSlidingEvent(pane, false);

			// RE/SET zIndex - increases when pane is sliding-open, resets to normal when not
			$P.css("zIndex", enable ? z.pane_sliding : z.pane_normal);
			$R.css("zIndex", enable ? z.pane_sliding+2 : z.resizer_normal); // NOTE: mask = pane_sliding+1

			// make sure we have a valid event
			if (!trigger.match(/click|mouseleave/))
				trigger = o.slideTrigger_close = "mouseleave"; // also catches 'mouseout'

			// add/remove slide triggers
			$R[action](trigger, slideClose); // base event on resize
			// need extra events for mouseleave
			if (trigger === "mouseleave") {
				// also close on pane.mouseleave
				$P[action]("mouseleave."+ sID, slideClose);
				// cancel timer when mouse moves between 'pane' and 'resizer'
				$R[action]("mouseenter."+ sID, cancelMouseOut);
				$P[action]("mouseenter."+ sID, cancelMouseOut);
			}

			if (!enable)
				timer.clear(pane+"_closeSlider");
			else if (trigger === "click" && !o.resizable) {
				// IF pane is not resizable (which already has a cursor and tip)
				// then set the a cursor & title/tip on resizer when sliding
				$R.css("cursor", enable ? o.sliderCursor : "default");
				$R.attr("title", enable ? o.togglerTip_open : ""); // use Toggler-tip, eg: "Close Pane"
			}

			// SUBROUTINE for mouseleave timer clearing
			function cancelMouseOut (evt) {
				timer.clear(pane+"_closeSlider");
				evt.stopPropagation();
			}
		}


		/**
		 * Hides/closes a pane if there is insufficient room - reverses this when there is room again
		 * MUST have already called setSizeLimits() before calling this method
		 *
		 * @param {string}	pane					The pane being resized
		 * @param {boolean=}	[isOpening=false]		Called from onOpen?
		 * @param {boolean=}	[skipCallback=false]	Should the onresize callback be run?
		 * @param {boolean=}	[force=false]
		 */
				,	makePaneFit = function (pane, isOpening, skipCallback, force) {
			var
					o	= options[pane]
					,	s	= state[pane]
					,	c	= _c[pane]
					,	$P	= $Ps[pane]
					,	$R	= $Rs[pane]
					,	isSidePane 	= c.dir==="vert"
					,	hasRoom		= false
					;
			// special handling for center & east/west panes
			if (pane === "center" || (isSidePane && s.noVerticalRoom)) {
				// see if there is enough room to display the pane
				// ERROR: hasRoom = s.minHeight <= s.maxHeight && (isSidePane || s.minWidth <= s.maxWidth);
				hasRoom = (s.maxHeight >= 0);
				if (hasRoom && s.noRoom) { // previously hidden due to noRoom, so show now
					$P.show();
					if ($R) $R.show();
					s.isVisible = true;
					s.noRoom = false;
					if (isSidePane) s.noVerticalRoom = false;
					_fixIframe(pane);
				}
				else if (!hasRoom && !s.noRoom) { // not currently hidden, so hide now
					$P.hide();
					if ($R) $R.hide();
					s.isVisible = false;
					s.noRoom = true;
				}
			}

			// see if there is enough room to fit the border-pane
			if (pane === "center") {
				// ignore center in this block
			}
			else if (s.minSize <= s.maxSize) { // pane CAN fit
				hasRoom = true;
				if (s.size > s.maxSize) // pane is too big - shrink it
					sizePane(pane, s.maxSize, skipCallback, force, true); // true = noAnimation
				else if (s.size < s.minSize) // pane is too small - enlarge it
					sizePane(pane, s.minSize, skipCallback, force, true);
				else if ($R && $P.is(":visible")) {
					// make sure resizer-bar is positioned correctly
					// handles situation where nested layout was 'hidden' when initialized
					var
							side = c.side.toLowerCase()
							,	pos  = s.size + sC["inset"+ c.side]
							;
					if ($.layout.cssNum($R, side) != pos) $R.css( side, pos );
				}

				// if was previously hidden due to noRoom, then RESET because NOW there is room
				if (s.noRoom) {
					// s.noRoom state will be set by open or show
					if (s.wasOpen && o.closable) {
						if (o.autoReopen)
							open(pane, false, true, true); // true = noAnimation, true = noAlert
						else // leave the pane closed, so just update state
							s.noRoom = false;
					}
					else
						show(pane, s.wasOpen, true, true); // true = noAnimation, true = noAlert
				}
			}
			else { // !hasRoom - pane CANNOT fit
				if (!s.noRoom) { // pane not set as noRoom yet, so hide or close it now...
					s.noRoom = true; // update state
					s.wasOpen = !s.isClosed && !s.isSliding;
					if (s.isClosed){} // SKIP
					else if (o.closable) // 'close' if possible
						close(pane, true, true); // true = force, true = noAnimation
					else // 'hide' pane if cannot just be closed
						hide(pane, true); // true = noAnimation
				}
			}
		}


		/**
		 * sizePane / manualSizePane
		 * sizePane is called only by internal methods whenever a pane needs to be resized
		 * manualSizePane is an exposed flow-through method allowing extra code when pane is 'manually resized'
		 *
		 * @param {string}	pane					The pane being resized
		 * @param {number}	size					The *desired* new size for this pane - will be validated
		 * @param {boolean=}	[skipCallback=false]	Should the onresize callback be run?
		 * @param {boolean=}	[noAnimation=false]
		 */
				,	manualSizePane = function (pane, size, skipCallback, noAnimation) {
			if (!isInitialized()) return;
			var
					o = options[pane]
					,	s = state[pane]
				//	if resizing callbacks have been delayed and resizing is now DONE, force resizing to complete...
					,	forceResize = o.livePaneResizing && !s.isResizing
					;
			// ANY call to manualSizePane disables autoResize - ie, percentage sizing
			o.autoResize = false;
			// flow-through...
			sizePane(pane, size, skipCallback, forceResize, noAnimation); // will animate resize if option enabled
		}

		/**
		 * @param {string}	pane					The pane being resized
		 * @param {number}	size					The *desired* new size for this pane - will be validated
		 * @param {boolean=}	[skipCallback=false]	Should the onresize callback be run?
		 * @param {boolean=}	[force=false]			Force resizing even if does not seem necessary
		 * @param {boolean=}	[noAnimation=false]
		 */
				,	sizePane = function (pane, size, skipCallback, force, noAnimation) {
			if (!isInitialized()) return;
			var
					o		= options[pane]
					,	s		= state[pane]
					,	$P		= $Ps[pane]
					,	$R		= $Rs[pane]
					,	side	= _c[pane].side.toLowerCase()
					,	dimName	= _c[pane].sizeType.toLowerCase()
					,	inset	= "inset"+ _c[pane].side
					,	skipResizeWhileDragging = s.isResizing && !o.triggerEventsDuringLiveResize
					,	doFX	= noAnimation !== true && o.animatePaneSizing
					,	oldSize, newSize
					;
			// QUEUE in case another action/animation is in progress
			$N.queue(function( queueNext ){
				// calculate 'current' min/max sizes
				setSizeLimits(pane); // update pane-state
				oldSize = s.size;
				size = _parseSize(pane, size); // handle percentages & auto
				size = max(size, _parseSize(pane, o.minSize));
				size = min(size, s.maxSize);
				if (size < s.minSize) { // not enough room for pane!
					makePaneFit(pane, false, skipCallback);	// will hide or close pane
					return queueNext();
				}

				// IF newSize is same as oldSize, then nothing to do - abort
				if (!force && size === oldSize)
					return queueNext();

				// onresize_start callback CANNOT cancel resizing because this would break the layout!
				if (!skipCallback && state.initialized && s.isVisible)
					_execCallback(pane, o.onresize_start);

				// resize the pane, and make sure its visible
				newSize = cssSize(pane, size);

				if (doFX && $P.is(":visible")) { // ANIMATE
					var fx		= $.layout.effects.size[pane] || $.layout.effects.size.all
							,	easing	= o.fxSettings_size.easing || fx.easing
							,	z		= options.zIndexes
							,	props	= {};
					props[ dimName ] = newSize +'px';
					s.isMoving = true;
					// overlay all elements during animation
					$P.css({ zIndex: z.pane_animate })
							.show().animate( props, o.fxSpeed_size, easing, function(){
								// reset zIndex after animation
								$P.css({ zIndex: (s.isSliding ? z.pane_sliding : z.pane_normal) });
								s.isMoving = false;
								sizePane_2(); // continue
								queueNext();
							});
				}
				else { // no animation
					$P.css( dimName, newSize );	// resize pane
					// if pane is visible, then
					if ($P.is(":visible"))
						sizePane_2(); // continue
					else {
						// pane is NOT VISIBLE, so just update state data...
						// when pane is *next opened*, it will have the new size
						s.size = size;				// update state.size
						$.extend(s, elDims($P));	// update state dimensions
					}
					queueNext();
				};

			});

			// SUBROUTINE
			function sizePane_2 () {
				/*	Panes are sometimes not sized precisely in some browsers!?
				 *	This code will resize the pane up to 3 times to nudge the pane to the correct size
				 */
				var	actual	= dimName==='width' ? $P.outerWidth() : $P.outerHeight()
						,	tries	= [{
					pane:		pane
					,	count:		1
					,	target:		size
					,	actual:		actual
					,	correct:	(size === actual)
					,	attempt:	size
					,	cssSize:	newSize
				}]
						,	lastTry = tries[0]
						,	msg		= 'Inaccurate size after resizing the '+ pane +'-pane.'
						;
				while ( !lastTry.correct ) {
					thisTry = { pane: pane, count: lastTry.count+1, target: size };

					if (lastTry.actual > size)
						thisTry.attempt = max(0, lastTry.attempt - (lastTry.actual - size));
					else // lastTry.actual < size
						thisTry.attempt = max(0, lastTry.attempt + (size - lastTry.actual));

					thisTry.cssSize = cssSize(pane, thisTry.attempt);
					$P.css( dimName, thisTry.cssSize );

					thisTry.actual	= dimName=='width' ? $P.outerWidth() : $P.outerHeight();
					thisTry.correct	= (size === thisTry.actual);

					// if showDebugMessages, log attempts and alert the user of this *non-fatal error*
					if (options.showDebugMessages) {
						if ( tries.length === 1) {
							_log(msg, false);
							_log(lastTry, false);
						}
						_log(thisTry, false);
					}

					// after 4 tries, is as close as its gonna get!
					if (tries.length > 3) break;

					tries.push( thisTry );
					lastTry = tries[ tries.length - 1 ];
				}
				// END TESTING CODE

				// update pane-state dimensions
				s.size = size;
				$.extend(s, elDims($P));

				// reposition the resizer-bar
				if ($R && $P.is(":visible")) $R.css( side, size + sC[inset] );

				sizeContent(pane);

				if (!skipCallback && !skipResizeWhileDragging && state.initialized && s.isVisible) {
					_execCallback(pane, o.onresize_end || o.onresize);
					resizeChildLayout(pane);
				}

				// resize all the adjacent panes, and adjust their toggler buttons
				// when skipCallback passed, it means the controlling method will handle 'other panes'
				if (!skipCallback) {
					// also no callback if live-resize is in progress and NOT triggerEventsDuringLiveResize
					if (!s.isSliding) sizeMidPanes(_c[pane].dir=="horz" ? "" : "center", skipResizeWhileDragging, force);
					sizeHandles();
				}

				// if opposite-pane was autoClosed, see if it can be autoOpened now
				var altPane = _c.oppositeEdge[pane];
				if (size < oldSize && state[ altPane ].noRoom) {
					setSizeLimits( altPane );
					makePaneFit( altPane, false, skipCallback );
				}

				// DEBUG - ALERT user/developer so they know there was a sizing problem
				if (options.showDebugMessages && tries.length > 1)
					_log(msg +'\nSee the Error Console for details.', true);
			}
		}

		/**
		 * @see  initPanes(), sizePane(), resizeAll(), open(), close(), hide()
		 * @param {string}	panes					The pane(s) being resized, comma-delmited string
		 * @param {boolean=}	[skipCallback=false]	Should the onresize callback be run?
		 * @param {boolean=}	[force=false]
		 */
				,	sizeMidPanes = function (panes, skipCallback, force) {
			panes = (panes ? panes : "east,west,center").split(",");

			$.each(panes, function (i, pane) {
				if (!$Ps[pane]) return; // NO PANE - skip
				var
						o		= options[pane]
						,	s		= state[pane]
						,	$P		= $Ps[pane]
						,	$R		= $Rs[pane]
						,	isCenter= (pane=="center")
						,	hasRoom	= true
						,	CSS		= {}
						,	newCenter	= calcNewCenterPaneDims()
						;
				// update pane-state dimensions
				$.extend(s, elDims($P));

				if (pane === "center") {
					if (!force && s.isVisible && newCenter.width === s.outerWidth && newCenter.height === s.outerHeight)
						return true; // SKIP - pane already the correct size
					// set state for makePaneFit() logic
					$.extend(s, cssMinDims(pane), {
						maxWidth:	newCenter.width
						,	maxHeight:	newCenter.height
					});
					CSS = newCenter;
					// convert OUTER width/height to CSS width/height
					CSS.width	= cssW($P, CSS.width);
					// NEW - allow pane to extend 'below' visible area rather than hide it
					CSS.height	= cssH($P, CSS.height);
					hasRoom		= CSS.width >= 0 && CSS.height >= 0; // height >= 0 = ALWAYS TRUE NOW
					// during layout init, try to shrink east/west panes to make room for center
					if (!state.initialized && o.minWidth > s.outerWidth) {
						var
								reqPx	= o.minWidth - s.outerWidth
								,	minE	= options.east.minSize || 0
								,	minW	= options.west.minSize || 0
								,	sizeE	= state.east.size
								,	sizeW	= state.west.size
								,	newE	= sizeE
								,	newW	= sizeW
								;
						if (reqPx > 0 && state.east.isVisible && sizeE > minE) {
							newE = max( sizeE-minE, sizeE-reqPx );
							reqPx -= sizeE-newE;
						}
						if (reqPx > 0 && state.west.isVisible && sizeW > minW) {
							newW = max( sizeW-minW, sizeW-reqPx );
							reqPx -= sizeW-newW;
						}
						// IF we found enough extra space, then resize the border panes as calculated
						if (reqPx === 0) {
							if (sizeE != minE)
								sizePane('east', newE, true, force, true); // true = skipCallback/noAnimation - initPanes will handle when done
							if (sizeW != minW)
								sizePane('west', newW, true, force, true);
							// now start over!
							sizeMidPanes('center', skipCallback, force);
							return; // abort this loop
						}
					}
				}
				else { // for east and west, set only the height, which is same as center height
					// set state.min/maxWidth/Height for makePaneFit() logic
					if (s.isVisible && !s.noVerticalRoom)
						$.extend(s, elDims($P), cssMinDims(pane))
					if (!force && !s.noVerticalRoom && newCenter.height === s.outerHeight)
						return true; // SKIP - pane already the correct size
					// east/west have same top, bottom & height as center
					CSS.top		= newCenter.top;
					CSS.bottom	= newCenter.bottom;
					// NEW - allow pane to extend 'below' visible area rather than hide it
					CSS.height	= cssH($P, newCenter.height);
					s.maxHeight	= CSS.height;
					hasRoom		= (s.maxHeight >= 0); // ALWAYS TRUE NOW
					if (!hasRoom) s.noVerticalRoom = true; // makePaneFit() logic
				}

				if (hasRoom) {
					// resizeAll passes skipCallback because it triggers callbacks after ALL panes are resized
					if (!skipCallback && state.initialized)
						_execCallback(pane, o.onresize_start);

					$P.css(CSS); // apply the CSS to pane
					if (s.noRoom && !s.isClosed && !s.isHidden)
						makePaneFit(pane); // will re-open/show auto-closed/hidden pane
					if (s.isVisible) {
						$.extend(s, elDims($P)); // update pane dimensions
						if (state.initialized) sizeContent(pane); // also resize the contents, if exists
					}
				}
				else if (!s.noRoom && s.isVisible) // no room for pane
					makePaneFit(pane); // will hide or close pane

				if (!s.isVisible)
					return true; // DONE - next pane

				/*
				 * Extra CSS for IE6 or IE7 in Quirks-mode - add 'width' to NORTH/SOUTH panes
				 * Normally these panes have only 'left' & 'right' positions so pane auto-sizes
				 * ALSO required when pane is an IFRAME because will NOT default to 'full width'
				 */
				if (pane === "center") { // finished processing midPanes
					var b = $.layout.browser;
					var fix = b.isIE6 || (b.msie && !$.support.boxModel);
					if ($Ps.north && (fix || state.north.tagName=="IFRAME"))
						$Ps.north.css("width", cssW($Ps.north, sC.innerWidth));
					if ($Ps.south && (fix || state.south.tagName=="IFRAME"))
						$Ps.south.css("width", cssW($Ps.south, sC.innerWidth));
				}

				// resizeAll passes skipCallback because it triggers callbacks after ALL panes are resized
				if (!skipCallback && state.initialized) {
					_execCallback(pane, o.onresize_end || o.onresize);
					resizeChildLayout(pane);
				}
			});
		}


		/**
		 * @see  window.onresize(), callbacks or custom code
		 */
				,	resizeAll = function () {
			if (!state.initialized) {
				_initLayoutElements();
				return; // no need to resize since we just initialized!
			}
			var	oldW	= sC.innerWidth
					,	oldH	= sC.innerHeight
					;
			// cannot size layout when 'container' is hidden or collapsed
			if (!$N.is(":visible:") ) return;
			$.extend( state.container, elDims( $N ) ); // UPDATE container dimensions
			if (!sC.outerHeight) return;

			// onresizeall_start will CANCEL resizing if returns false
			// state.container has already been set, so user can access this info for calcuations
			if (false === _execCallback(null, options.onresizeall_start)) return false;

			var	// see if container is now 'smaller' than before
					shrunkH	= (sC.innerHeight < oldH)
					,	shrunkW	= (sC.innerWidth < oldW)
					,	$P, o, s, dir
					;
			// NOTE special order for sizing: S-N-E-W
			$.each(["south","north","east","west"], function (i, pane) {
				if (!$Ps[pane]) return; // no pane - SKIP
				s	= state[pane];
				o	= options[pane];
				dir	= _c[pane].dir;

				if (o.autoResize && s.size != o.size) // resize pane to original size set in options
					sizePane(pane, o.size, true, true, true); // true=skipCallback/forceResize/noAnimation
				else {
					setSizeLimits(pane);
					makePaneFit(pane, false, true, true); // true=skipCallback/forceResize
				}
			});

			sizeMidPanes("", true, true); // true=skipCallback, true=forceResize
			sizeHandles(); // reposition the toggler elements

			// trigger all individual pane callbacks AFTER layout has finished resizing
			o = options; // reuse alias
			$.each(_c.allPanes, function (i, pane) {
				$P = $Ps[pane];
				if (!$P) return; // SKIP
				if (state[pane].isVisible) { // undefined for non-existent panes
					_execCallback(pane, o[pane].onresize_end || o[pane].onresize); // callback - if exists
					resizeChildLayout(pane);
				}
			});

			_execCallback(null, o.onresizeall_end || o.onresizeall); // onresizeall callback, if exists
		}


		/**
		 * Whenever a pane resizes or opens that has a nested layout, trigger resizeAll
		 *
		 * @param {string}	pane		The pane just resized or opened
		 */
				,	resizeChildLayout = function (pane) {
			if (!options[pane].resizeChildLayout) return;
			var
					$P	= $Ps[pane]
					,	$C	= $Cs[pane]
					,	d	= "layout"
					,	P	= Instance[pane]
					,	L	= children[pane]
					;
			// user may have manually set EITHER instance pointer, so handle that
			if (P.child && !L) {
				// have to reverse the pointers!
				var el = P.child.container;
				L = children[pane] = (el ? el.data(d) : 0) || null; // set pointer _directly_ to layout instance
			}

			// if a layout-pointer exists, see if child has been destroyed
			if (L && L.destroyed)
				L = children[pane] = null; // clear child pointers
			// no child layout pointer is set - see if there is a child layout NOW
			if (!L)	L = children[pane] = $P.data(d) || ($C ? $C.data(d) : 0) || null; // set/update child pointers

			// ALWAYS refresh the pane.child alias
			P.child = children[pane];

			if (L) L.resizeAll();
		}


		/**
		 * IF pane has a content-div, then resize all elements inside pane to fit pane-height
		 *
		 * @param {string=}	[panes=""]		The pane(s) being resized
		 * @param {boolean=}	[remeasure=false]	Should the content (header/footer) be remeasured?
		 */
				,	sizeContent = function (panes, remeasure) {
			if (!isInitialized()) return;

			panes = panes ? panes.split(",") : _c.allPanes;
			$.each(panes, function (idx, pane) {
				var
						$P	= $Ps[pane]
						,	$C	= $Cs[pane]
						,	o	= options[pane]
						,	s	= state[pane]
						,	m	= s.content // m = measurements
						;
				if (!$P || !$C || !$P.is(":visible")) return true; // NOT VISIBLE - skip

				// onsizecontent_start will CANCEL resizing if returns false
				if (false === _execCallback(null, o.onsizecontent_start)) return;

				// skip re-measuring offsets if live-resizing
				if ((!s.isMoving && !s.isResizing) || o.liveContentResizing || remeasure || m.top == undefined) {
					_measure();
					// if any footers are below pane-bottom, they may not measure correctly,
					// so allow pane overflow and re-measure
					if (m.hiddenFooters > 0 && $P.css("overflow") === "hidden") {
						$P.css("overflow", "visible");
						_measure(); // remeasure while overflowing
						$P.css("overflow", "hidden");
					}
				}
				// NOTE: spaceAbove/Below *includes* the pane paddingTop/Bottom, but not pane.borders
				var newH = s.innerHeight - (m.spaceAbove - s.css.paddingTop) - (m.spaceBelow - s.css.paddingBottom);

				if (!$C.is(":visible") || m.height != newH) {
					// size the Content element to fit new pane-size - will autoHide if not enough room
					setOuterHeight($C, newH, true); // true=autoHide
					m.height = newH; // save new height
				};

				if (state.initialized) {
					_execCallback(pane, o.onsizecontent_end || o.onsizecontent);
					resizeChildLayout(pane);
				}

				function _below ($E) {
					return max(s.css.paddingBottom, (parseInt($E.css("marginBottom"), 10) || 0));
				};

				function _measure () {
					var
							ignore	= options[pane].contentIgnoreSelector
							,	$Fs		= $C.nextAll().not(ignore || ':lt(0)') // not :lt(0) = ALL
							,	$Fs_vis	= $Fs.filter(':visible')
							,	$F		= $Fs_vis.filter(':last')
							;
					m = {
						top:			$C[0].offsetTop
						,	height:			$C.outerHeight()
						,	numFooters:		$Fs.length
						,	hiddenFooters:	$Fs.length - $Fs_vis.length
						,	spaceBelow:		0 // correct if no content footer ($E)
					}
					m.spaceAbove	= m.top; // just for state - not used in calc
					m.bottom		= m.top + m.height;
					if ($F.length)
					//spaceBelow = (LastFooter.top + LastFooter.height) [footerBottom] - Content.bottom + max(LastFooter.marginBottom, pane.paddingBotom)
						m.spaceBelow = ($F[0].offsetTop + $F.outerHeight()) - m.bottom + _below($F);
					else // no footer - check marginBottom on Content element itself
						m.spaceBelow = _below($C);
				};
			});
		}


		/**
		 * Called every time a pane is opened, closed, or resized to slide the togglers to 'center' and adjust their length if necessary
		 *
		 * @see  initHandles(), open(), close(), resizeAll()
		 * @param {string=}	[panes=""]		The pane(s) being resized
		 */
				,	sizeHandles = function (panes) {
			panes = panes ? panes.split(",") : _c.borderPanes;

			$.each(panes, function (i, pane) {
				var
						o	= options[pane]
						,	s	= state[pane]
						,	$P	= $Ps[pane]
						,	$R	= $Rs[pane]
						,	$T	= $Ts[pane]
						,	$TC
						;
				if (!$P || !$R) return;

				var
						dir			= _c[pane].dir
						,	_state		= (s.isClosed ? "_closed" : "_open")
						,	spacing		= o["spacing"+ _state]
						,	togAlign	= o["togglerAlign"+ _state]
						,	togLen		= o["togglerLength"+ _state]
						,	paneLen
						,	offset
						,	CSS = {}
						;

				if (spacing === 0) {
					$R.hide();
					return;
				}
				else if (!s.noRoom && !s.isHidden) // skip if resizer was hidden for any reason
					$R.show(); // in case was previously hidden

				// Resizer Bar is ALWAYS same width/height of pane it is attached to
				if (dir === "horz") { // north/south
					paneLen = $P.outerWidth(); // s.outerWidth ||
					s.resizerLength = paneLen;
					$R.css({
						width:	cssW($R, paneLen) // account for borders & padding
						,	height:	cssH($R, spacing) // ditto
						,	left:	$.layout.cssNum($P, "left")
					});
				}
				else { // east/west
					paneLen = $P.outerHeight(); // s.outerHeight ||
					s.resizerLength = paneLen;
					$R.css({
						height:	cssH($R, paneLen) // account for borders & padding
						,	width:	cssW($R, spacing) // ditto
						,	top:	sC.insetTop + getPaneSize("north", true) // TODO: what if no North pane?
						//,	top:	$.layout.cssNum($Ps["center"], "top")
					});
				}

				// remove hover classes
				removeHover( o, $R );

				if ($T) {
					if (togLen === 0 || (s.isSliding && o.hideTogglerOnSlide)) {
						$T.hide(); // always HIDE the toggler when 'sliding'
						return;
					}
					else
						$T.show(); // in case was previously hidden

					if (!(togLen > 0) || togLen === "100%" || togLen > paneLen) {
						togLen = paneLen;
						offset = 0;
					}
					else { // calculate 'offset' based on options.PANE.togglerAlign_open/closed
						if (isStr(togAlign)) {
							switch (togAlign) {
								case "top":
								case "left":	offset = 0;
									break;
								case "bottom":
								case "right":	offset = paneLen - togLen;
									break;
								case "middle":
								case "center":
								default:		offset = round((paneLen - togLen) / 2); // 'default' catches typos
							}
						}
						else { // togAlign = number
							var x = parseInt(togAlign, 10); //
							if (togAlign >= 0) offset = x;
							else offset = paneLen - togLen + x; // NOTE: x is negative!
						}
					}

					if (dir === "horz") { // north/south
						var width = cssW($T, togLen);
						$T.css({
							width:	width  // account for borders & padding
							,	height:	cssH($T, spacing) // ditto
							,	left:	offset // TODO: VERIFY that toggler  positions correctly for ALL values
							,	top:	0
						});
						// CENTER the toggler content SPAN
						$T.children(".content").each(function(){
							$TC = $(this);
							$TC.css("marginLeft", round((width-$TC.outerWidth())/2)); // could be negative
						});
					}
					else { // east/west
						var height = cssH($T, togLen);
						$T.css({
							height:	height // account for borders & padding
							,	width:	cssW($T, spacing) // ditto
							,	top:	offset // POSITION the toggler
							,	left:	0
						});
						// CENTER the toggler content SPAN
						$T.children(".content").each(function(){
							$TC = $(this);
							$TC.css("marginTop", round((height-$TC.outerHeight())/2)); // could be negative
						});
					}

					// remove ALL hover classes
					removeHover( 0, $T );
				}

				// DONE measuring and sizing this resizer/toggler, so can be 'hidden' now
				if (!state.initialized && (o.initHidden || s.noRoom)) {
					$R.hide();
					if ($T) $T.hide();
				}
			});
		}


		/**
		 * @param {string}	pane
		 */
				,	enableClosable = function (pane) {
			if (!isInitialized()) return;
			var $T = $Ts[pane], o = options[pane];
			if (!$T) return;
			o.closable = true;
			$T	.bind("click."+ sID, function(evt){ evt.stopPropagation(); toggle(pane); })
					.css("visibility", "visible")
					.css("cursor", "pointer")
					.attr("title", state[pane].isClosed ? o.togglerTip_closed : o.togglerTip_open) // may be blank
					.show();
		}
		/**
		 * @param {string}	pane
		 * @param {boolean=}	[hide=false]
		 */
				,	disableClosable = function (pane, hide) {
			if (!isInitialized()) return;
			var $T = $Ts[pane];
			if (!$T) return;
			options[pane].closable = false;
			// is closable is disable, then pane MUST be open!
			if (state[pane].isClosed) open(pane, false, true);
			$T	.unbind("."+ sID)
					.css("visibility", hide ? "hidden" : "visible") // instead of hide(), which creates logic issues
					.css("cursor", "default")
					.attr("title", "");
		}


		/**
		 * @param {string}	pane
		 */
				,	enableSlidable = function (pane) {
			if (!isInitialized()) return;
			var $R = $Rs[pane], o = options[pane];
			if (!$R || !$R.data('draggable')) return;
			options[pane].slidable = true;
			if (s.isClosed)
				bindStartSlidingEvent(pane, true);
		}
		/**
		 * @param {string}	pane
		 */
				,	disableSlidable = function (pane) {
			if (!isInitialized()) return;
			var $R = $Rs[pane];
			if (!$R) return;
			options[pane].slidable = false;
			if (state[pane].isSliding)
				close(pane, false, true);
			else {
				bindStartSlidingEvent(pane, false);
				$R	.css("cursor", "default")
						.attr("title", "");
				removeHover(null, $R[0]); // in case currently hovered
			}
		}


		/**
		 * @param {string}	pane
		 */
				,	enableResizable = function (pane) {
			if (!isInitialized()) return;
			var $R = $Rs[pane], o = options[pane];
			if (!$R || !$R.data('draggable')) return;
			o.resizable = true;
			$R.draggable("enable");
			if (!state[pane].isClosed)
				$R	.css("cursor", o.resizerCursor)
						.attr("title", o.resizerTip);
		}
		/**
		 * @param {string}	pane
		 */
				,	disableResizable = function (pane) {
			if (!isInitialized()) return;
			var $R = $Rs[pane];
			if (!$R || !$R.data('draggable')) return;
			options[pane].resizable = false;
			$R	.draggable("disable")
					.css("cursor", "default")
					.attr("title", "");
			removeHover(null, $R[0]); // in case currently hovered
		}


		/**
		 * Move a pane from source-side (eg, west) to target-side (eg, east)
		 * If pane exists on target-side, move that to source-side, ie, 'swap' the panes
		 *
		 * @param {string}	pane1		The pane/edge being swapped
		 * @param {string}	pane2		ditto
		 */
				,	swapPanes = function (pane1, pane2) {
			if (!isInitialized()) return;
			// change state.edge NOW so callbacks can know where pane is headed...
			state[pane1].edge = pane2;
			state[pane2].edge = pane1;
			// run these even if NOT state.initialized
			var cancelled = false;
			if (false === _execCallback(pane1, options[pane1].onswap_start)) cancelled = true;
			if (!cancelled && false === _execCallback(pane2, options[pane2].onswap_start)) cancelled = true;
			if (cancelled) {
				state[pane1].edge = pane1; // reset
				state[pane2].edge = pane2;
				return;
			}

			var
					oPane1	= copy( pane1 )
					,	oPane2	= copy( pane2 )
					,	sizes	= {}
					;
			sizes[pane1] = oPane1 ? oPane1.state.size : 0;
			sizes[pane2] = oPane2 ? oPane2.state.size : 0;

			// clear pointers & state
			$Ps[pane1] = false;
			$Ps[pane2] = false;
			state[pane1] = {};
			state[pane2] = {};

			// ALWAYS remove the resizer & toggler elements
			if ($Ts[pane1]) $Ts[pane1].remove();
			if ($Ts[pane2]) $Ts[pane2].remove();
			if ($Rs[pane1]) $Rs[pane1].remove();
			if ($Rs[pane2]) $Rs[pane2].remove();
			$Rs[pane1] = $Rs[pane2] = $Ts[pane1] = $Ts[pane2] = false;

			// transfer element pointers and data to NEW Layout keys
			move( oPane1, pane2 );
			move( oPane2, pane1 );

			// cleanup objects
			oPane1 = oPane2 = sizes = null;

			// make panes 'visible' again
			if ($Ps[pane1]) $Ps[pane1].css(_c.visible);
			if ($Ps[pane2]) $Ps[pane2].css(_c.visible);

			// fix any size discrepancies caused by swap
			resizeAll();

			// run these even if NOT state.initialized
			_execCallback(pane1, options[pane1].onswap_end || options[pane1].onswap);
			_execCallback(pane2, options[pane2].onswap_end || options[pane2].onswap);

			return;

			function copy (n) { // n = pane
				var
						$P	= $Ps[n]
						,	$C	= $Cs[n]
						;
				return !$P ? false : {
					pane:		n
					,	P:			$P ? $P[0] : false
					,	C:			$C ? $C[0] : false
					,	state:		$.extend(true, {}, state[n])
					,	options:	$.extend(true, {}, options[n])
				}
			};

			function move (oPane, pane) {
				if (!oPane) return;
				var
						P		= oPane.P
						,	C		= oPane.C
						,	oldPane = oPane.pane
						,	c		= _c[pane]
						,	side	= c.side.toLowerCase()
						,	inset	= "inset"+ c.side
					//	save pane-options that should be retained
						,	s		= $.extend({}, state[pane])
						,	o		= options[pane]
					//	RETAIN side-specific FX Settings - more below
						,	fx		= { resizerCursor: o.resizerCursor }
						,	re, size, pos
						;
				$.each("fxName,fxSpeed,fxSettings".split(","), function (i, k) {
					fx[k +"_open"]  = o[k +"_open"];
					fx[k +"_close"] = o[k +"_close"];
					fx[k +"_size"]  = o[k +"_size"];
				});

				// update object pointers and attributes
				$Ps[pane] = $(P)
						.data("layoutEdge", pane)
						.css(_c.hidden)
						.css(c.cssReq)
				;
				$Cs[pane] = C ? $(C) : false;

				// set options and state
				options[pane]	= $.extend({}, oPane.options, fx);
				state[pane]		= $.extend({}, oPane.state);

				// change classNames on the pane, eg: ui-layout-pane-east ==> ui-layout-pane-west
				re = new RegExp(o.paneClass +"-"+ oldPane, "g");
				P.className = P.className.replace(re, o.paneClass +"-"+ pane);

				// ALWAYS regenerate the resizer & toggler elements
				initHandles(pane); // create the required resizer & toggler

				// if moving to different orientation, then keep 'target' pane size
				if (c.dir != _c[oldPane].dir) {
					size = sizes[pane] || 0;
					setSizeLimits(pane); // update pane-state
					size = max(size, state[pane].minSize);
					// use manualSizePane to disable autoResize - not useful after panes are swapped
					manualSizePane(pane, size, true, true); // true/true = skipCallback/noAnimation)
				}
				else // move the resizer here
					$Rs[pane].css(side, sC[inset] + (state[pane].isVisible ? getPaneSize(pane) : 0));


				// ADD CLASSNAMES & SLIDE-BINDINGS
				if (oPane.state.isVisible && !s.isVisible)
					setAsOpen(pane, true); // true = skipCallback
				else {
					setAsClosed(pane);
					bindStartSlidingEvent(pane, true); // will enable events IF option is set
				}

				// DESTROY the object
				oPane = null;
			};
		}


		/**
		 * INTERNAL method to sync pin-buttons when pane is opened or closed
		 * Unpinned means the pane is 'sliding' - ie, over-top of the adjacent panes
		 *
		 * @see  open(), setAsOpen(), setAsClosed()
		 * @param {string}	pane   These are the params returned to callbacks by layout()
		 * @param {boolean}	doPin  True means set the pin 'down', False means 'up'
		 */
				,	syncPinBtns = function (pane, doPin) {
			if ($.layout.plugins.buttons)
				$.each(state[pane].pins, function (i, selector) {
					$.layout.buttons.setPinState(Instance, $(selector), pane, doPin);
				});
		}

				;	// END var DECLARATIONS

		/**
		 * Capture keys when enableCursorHotkey - toggle pane if hotkey pressed
		 *
		 * @see  document.keydown()
		 */
		function keyDown (evt) {
			if (!evt) return true;
			var code = evt.keyCode;
			if (code < 33) return true; // ignore special keys: ENTER, TAB, etc

			var
					PANE = {
						38: "north" // Up Cursor	- $.ui.keyCode.UP
						,	40: "south" // Down Cursor	- $.ui.keyCode.DOWN
						,	37: "west"  // Left Cursor	- $.ui.keyCode.LEFT
						,	39: "east"  // Right Cursor	- $.ui.keyCode.RIGHT
					}
					,	ALT		= evt.altKey // no worky!
					,	SHIFT	= evt.shiftKey
					,	CTRL	= evt.ctrlKey
					,	CURSOR	= (CTRL && code >= 37 && code <= 40)
					,	o, k, m, pane
					;

			if (CURSOR && options[PANE[code]].enableCursorHotkey) // valid cursor-hotkey
				pane = PANE[code];
			else if (CTRL || SHIFT) // check to see if this matches a custom-hotkey
				$.each(_c.borderPanes, function (i, p) { // loop each pane to check its hotkey
					o = options[p];
					k = o.customHotkey;
					m = o.customHotkeyModifier; // if missing or invalid, treated as "CTRL+SHIFT"
					if ((SHIFT && m=="SHIFT") || (CTRL && m=="CTRL") || (CTRL && SHIFT)) { // Modifier matches
						if (k && code === (isNaN(k) || k <= 9 ? k.toUpperCase().charCodeAt(0) : k)) { // Key matches
							pane = p;
							return false; // BREAK
						}
					}
				});

			// validate pane
			if (!pane || !$Ps[pane] || !options[pane].closable || state[pane].isHidden)
				return true;

			toggle(pane);

			evt.stopPropagation();
			evt.returnValue = false; // CANCEL key
			return false;
		};


		/*
		 * ######################################
		 *	UTILITY METHODS
		 *	called externally or by initButtons
		 * ######################################
		 */

		/**
		 * Change/reset a pane overflow setting & zIndex to allow popups/drop-downs to work
		 *
		 * @param {Object=}   [el]	(optional) Can also be 'bound' to a click, mouseOver, or other event
		 */
		function allowOverflow (el) {
			if (!isInitialized()) return;
			if (this && this.tagName) el = this; // BOUND to element
			var $P;
			if (isStr(el))
				$P = $Ps[el];
			else if ($(el).data("layoutRole"))
				$P = $(el);
			else
				$(el).parents().each(function(){
					if ($(this).data("layoutRole")) {
						$P = $(this);
						return false; // BREAK
					}
				});
			if (!$P || !$P.length) return; // INVALID

			var
					pane	= $P.data("layoutEdge")
					,	s		= state[pane]
					;

			// if pane is already raised, then reset it before doing it again!
			// this would happen if allowOverflow is attached to BOTH the pane and an element
			if (s.cssSaved)
				resetOverflow(pane); // reset previous CSS before continuing

			// if pane is raised by sliding or resizing, or its closed, then abort
			if (s.isSliding || s.isResizing || s.isClosed) {
				s.cssSaved = false;
				return;
			}

			var
					newCSS	= { zIndex: (options.zIndexes.resizer_normal + 1) }
					,	curCSS	= {}
					,	of		= $P.css("overflow")
					,	ofX		= $P.css("overflowX")
					,	ofY		= $P.css("overflowY")
					;
			// determine which, if any, overflow settings need to be changed
			if (of != "visible") {
				curCSS.overflow = of;
				newCSS.overflow = "visible";
			}
			if (ofX && !ofX.match(/visible|auto/)) {
				curCSS.overflowX = ofX;
				newCSS.overflowX = "visible";
			}
			if (ofY && !ofY.match(/visible|auto/)) {
				curCSS.overflowY = ofX;
				newCSS.overflowY = "visible";
			}

			// save the current overflow settings - even if blank!
			s.cssSaved = curCSS;

			// apply new CSS to raise zIndex and, if necessary, make overflow 'visible'
			$P.css( newCSS );

			// make sure the zIndex of all other panes is normal
			$.each(_c.allPanes, function(i, p) {
				if (p != pane) resetOverflow(p);
			});

		};
		/**
		 * @param {Object=}   [el]	(optional) Can also be 'bound' to a click, mouseOver, or other event
		 */
		function resetOverflow (el) {
			if (!isInitialized()) return;
			if (this && this.tagName) el = this; // BOUND to element
			var $P;
			if (isStr(el))
				$P = $Ps[el];
			else if ($(el).data("layoutRole"))
				$P = $(el);
			else
				$(el).parents().each(function(){
					if ($(this).data("layoutRole")) {
						$P = $(this);
						return false; // BREAK
					}
				});
			if (!$P || !$P.length) return; // INVALID

			var
					pane	= $P.data("layoutEdge")
					,	s		= state[pane]
					,	CSS		= s.cssSaved || {}
					;
			// reset the zIndex
			if (!s.isSliding && !s.isResizing)
				$P.css("zIndex", options.zIndexes.pane_normal);

			// reset Overflow - if necessary
			$P.css( CSS );

			// clear var
			s.cssSaved = false;
		};

		/*
		 * #####################
		 * CREATE/RETURN LAYOUT
		 * #####################
		 */

		// validate that container exists
		var $N = $(this).eq(0); // FIRST matching Container element
		if (!$N.length) {
			if (options.showErrorMessages)
				_log( lang.errContainerMissing, true );
			return null;
		};

		// Users retrieve Instance of a layout with: $N.layout() OR $N.data("layout")
		// return the Instance-pointer if layout has already been initialized
		if ($N.data("layoutContainer") && $N.data("layout"))
			return $N.data("layout"); // cached pointer

		// init global vars
		var
				$Ps	= {}	// Panes x5		- set in initPanes()
				,	$Cs	= {}	// Content x5	- set in initPanes()
				,	$Rs	= {}	// Resizers x4	- set in initHandles()
				,	$Ts	= {}	// Togglers x4	- set in initHandles()
				,	$Ms	= $([])	// Masks - up to 2 masks per pane (IFRAME + DIV)
			//	aliases for code brevity
				,	sC	= state.container // alias for easy access to 'container dimensions'
				,	sID	= state.id // alias for unique layout ID/namespace - eg: "layout435"
				;

		// create Instance object to expose data & option Properties, and primary action Methods
		var Instance = {
			//	layout data
			options:			options			// property - options hash
			,	state:				state			// property - dimensions hash
			//	object pointers
			,	container:			$N				// property - object pointers for layout container
			,	panes:				$Ps				// property - object pointers for ALL Panes: panes.north, panes.center
			,	contents:			$Cs				// property - object pointers for ALL Content: contents.north, contents.center
			,	resizers:			$Rs				// property - object pointers for ALL Resizers, eg: resizers.north
			,	togglers:			$Ts				// property - object pointers for ALL Togglers, eg: togglers.north
			//	border-pane open/close
			,	hide:				hide			// method - ditto
			,	show:				show			// method - ditto
			,	toggle:				toggle			// method - pass a 'pane' ("north", "west", etc)
			,	open:				open			// method - ditto
			,	close:				close			// method - ditto
			,	slideOpen:			slideOpen		// method - ditto
			,	slideClose:			slideClose		// method - ditto
			,	slideToggle:		slideToggle		// method - ditto
			//	pane actions
			,	setSizeLimits:		setSizeLimits	// method - pass a 'pane' - update state min/max data
			,	_sizePane:			sizePane		// method -intended for user by plugins only!
			,	sizePane:			manualSizePane	// method - pass a 'pane' AND an 'outer-size' in pixels or percent, or 'auto'
			,	sizeContent:		sizeContent		// method - ditto
			,	swapPanes:			swapPanes		// method - pass TWO 'panes' - will swap them
			//	layout control
			,	createChildLayout:	createChildLayout// method - pass a 'pane' and (optional) layout-options (OVERRIDES options[pane].childOptions
			,	destroy:			destroy			// method - no parameters
			,	addPane:			addPane			// method - pass a 'pane'
			,	removePane:			removePane		// method - pass a 'pane' to remove from layout, add 'true' to delete the pane-elem
			,	initPanes:			isInitialized	// method - no parameters
			,	initContent:		initContent		// method - ditto
			,	resizeAll:			resizeAll		// method - no parameters
			,	allowOverflow:		allowOverflow	// utility - pass calling element (this)
			,	resetOverflow:		resetOverflow	// utility - ditto
			//	special option setting
			,	enableClosable:		enableClosable
			,	disableClosable:	disableClosable
			,	enableSlidable:		enableSlidable
			,	disableSlidable:	disableSlidable
			,	enableResizable:	enableResizable
			,	disableResizable:	disableResizable
			//	event triggering
			,	trigger:			trigger
			//	alias collections of options, state and children - created in addPane and extended elsewhere
			,	hasParentLayout:	false
			,	children:			children
			,	north:				false
			,	south:				false
			,	west:				false
			,	east:				false
			,	center:				false
		};

		// create the border layout NOW
		if (_create() === 'cancel') // onload_start callback returned false to CANCEL layout creation
			return null;
		else // true OR false -- if layout-elements did NOT init (hidden or do not exist), can auto-init later
			return Instance; // return the Instance object

	}




	/**
	 * jquery.layout.state 1.0
	 * $Date: 2011-07-16 08:00:00 (Sat, 16 July 2011) $
	 *
	 * Copyright (c) 2010
	 *   Kevin Dalman (http://allpro.net)
	 *
	 * Dual licensed under the GPL (http://www.gnu.org/licenses/gpl.html)
	 * and MIT (http://www.opensource.org/licenses/mit-license.php) licenses.
	 *
	 * @dependancies: UI Layout 1.3.0.rc30.1 or higher
	 * @dependancies: $.ui.cookie (above)
	 *
	 * @support: http://groups.google.com/group/jquery-ui-layout
	 */
	/*
	 *	State-management options stored in options.stateManagement, which includes a .cookie hash
	 *	Default options saves ALL KEYS for ALL PANES, ie: pane.size, pane.isClosed, pane.isHidden
	 *
	 *	// STATE/COOKIE OPTIONS
	 *	@example $(el).layout({
	 stateManagement: {
	 enabled:	true
	 ,	stateKeys:	"east.size,west.size,east.isClosed,west.isClosed"
	 ,	cookie:		{ name: "appLayout", path: "/" }
	 }
	 })
	 *	@example $(el).layout({ stateManagement__enabled: true }) // enable auto-state-management using cookies
	 *	@example $(el).layout({ stateManagement__cookie: { name: "appLayout", path: "/" } })
	 *	@example $(el).layout({ stateManagement__cookie__name: "appLayout", stateManagement__cookie__path: "/" })
	 *
	 *	// STATE/COOKIE METHODS
	 *	@example myLayout.saveCookie( "west.isClosed,north.size,south.isHidden", {expires: 7} );
	 *	@example myLayout.loadCookie();
	 *	@example myLayout.deleteCookie();
	 *	@example var JSON = myLayout.readState();	// CURRENT Layout State
	 *	@example var JSON = myLayout.readCookie();	// SAVED Layout State (from cookie)
	 *	@example var JSON = myLayout.state.stateData;	// LAST LOADED Layout State (cookie saved in layout.state hash)
	 *
	 *	CUSTOM STATE-MANAGEMENT (eg, saved in a database)
	 *	@example var JSON = myLayout.readState( "west.isClosed,north.size,south.isHidden" );
	 *	@example myLayout.loadState( JSON );
	 */

	/**
	 *	UI COOKIE UTILITY
	 *
	 *	A $.cookie OR $.ui.cookie namespace *should be standard*, but until then...
	 *	This creates $.ui.cookie so Layout does not need the cookie.jquery.js plugin
	 *	NOTE: This utility is REQUIRED by the layout.state plugin
	 *
	 *	Cookie methods in Layout are created as part of State Management
	 */
	if (!$.ui) $.ui = {};
	$.ui.cookie = {

		// TODO: is the cookieEnabled property fully cross-browser???
		acceptsCookies: !!navigator.cookieEnabled

		,	read: function (name) {
			var
					c		= document.cookie
					,	cs		= c ? c.split(';') : []
					,	pair	// loop var
					;
			for (var i=0, n=cs.length; i < n; i++) {
				pair = $.trim(cs[i]).split('='); // name=value pair
				if (pair[0] == name) // found the layout cookie
					return decodeURIComponent(pair[1]);

			}
			return null;
		}

		,	write: function (name, val, cookieOpts) {
			var
					params	= ''
					,	date	= ''
					,	clear	= false
					,	o		= cookieOpts || {}
					,	x		= o.expires
					;
			if (x && x.toUTCString)
				date = x;
			else if (x === null || typeof x === 'number') {
				date = new Date();
				if (x > 0)
					date.setDate(date.getDate() + x);
				else {
					date.setFullYear(1970);
					clear = true;
				}
			}
			if (date)		params += ';expires='+ date.toUTCString();
			if (o.path)		params += ';path='+ o.path;
			if (o.domain)	params += ';domain='+ o.domain;
			if (o.secure)	params += ';secure';
			document.cookie = name +'='+ (clear ? "" : encodeURIComponent( val )) + params; // write or clear cookie
		}

		,	clear: function (name) {
			$.ui.cookie.write(name, '', {expires: -1});
		}

	};
// if cookie.jquery.js is not loaded, create an alias to replicate it
// this may be useful to other plugins or code dependent on that plugin
	if (!$.cookie) $.cookie = function (k, v, o) {
		var C = $.ui.cookie;
		if (v === null)
			C.clear(k);
		else if (v === undefined)
			return C.read(k);
		else
			C.write(k, v, o);
	};


// tell Layout that the state plugin is available
	$.layout.plugins.stateManagement = true;

//	Add State-Management options to layout.defaults
	$.layout.config.optionRootKeys.push("stateManagement");
	$.layout.defaults.stateManagement = {
		enabled:	false	// true = enable state-management, even if not using cookies
		,	autoSave:	true	// Save a state-cookie when page exits?
		,	autoLoad:	true	// Load the state-cookie when Layout inits?
		// List state-data to save - must be pane-specific
		,	stateKeys:	"north.size,south.size,east.size,west.size,"+
				"north.isClosed,south.isClosed,east.isClosed,west.isClosed,"+
				"north.isHidden,south.isHidden,east.isHidden,west.isHidden"
		,	cookie: {
			name:	""	// If not specified, will use Layout.name, else just "Layout"
			,	domain:	""	// blank = current domain
			,	path:	""	// blank = current page, '/' = entire website
			,	expires: ""	// 'days' to keep cookie - leave blank for 'session cookie'
			,	secure:	false
		}
	};
// Set stateManagement as a layout-option, NOT a pane-option
	$.layout.optionsMap.layout.push("stateManagement");

	/*
	 *	State Management methods
	 */
	$.layout.state = {

		/**
		 * Get the current layout state and save it to a cookie
		 *
		 * myLayout.saveCookie( keys, cookieOpts )
		 *
		 * @param {Object}			inst
		 * @param {(string|Array)=}	keys
		 * @param {Object=}			opts
		 */
		saveCookie: function (inst, keys, cookieOpts) {
			var o	= inst.options
					,	oS	= o.stateManagement
					,	oC	= $.extend(true, {}, oS.cookie, cookieOpts || null)
					,	data = inst.state.stateData = inst.readState( keys || oS.stateKeys ) // read current panes-state
					;
			$.ui.cookie.write( oC.name || o.name || "Layout", $.layout.state.encodeJSON(data), oC );
			return $.extend(true, {}, data); // return COPY of state.stateData data
		}

		/**
		 * Remove the state cookie
		 *
		 * @param {Object}	inst
		 */
		,	deleteCookie: function (inst) {
			var o = inst.options;
			$.ui.cookie.clear( o.stateManagement.cookie.name || o.name || "Layout" );
		}

		/**
		 * Read & return data from the cookie - as JSON
		 *
		 * @param {Object}	inst
		 */
		,	readCookie: function (inst) {
			var o = inst.options;
			var c = $.ui.cookie.read( o.stateManagement.cookie.name || o.name || "Layout" );
			// convert cookie string back to a hash and return it
			return c ? $.layout.state.decodeJSON(c) : {};
		}

		/**
		 * Get data from the cookie and USE IT to loadState
		 *
		 * @param {Object}	inst
		 */
		,	loadCookie: function (inst) {
			var c = $.layout.state.readCookie(inst); // READ the cookie
			if (c) {
				inst.state.stateData = $.extend(true, {}, c); // SET state.stateData
				inst.loadState(c); // LOAD the retrieved state
			}
			return c;
		}

		/**
		 * Update layout options from the cookie, if one exists
		 *
		 * @param {Object}		inst
		 * @param {Object=}		stateData
		 * @param {boolean=}	animate
		 */
		,	loadState: function (inst, stateData, animate) {
			stateData = $.layout.transformData( stateData ); // panes = default subkey
			if ($.isEmptyObject( stateData )) return;
			$.extend(true, inst.options, stateData); // update layout options
			// if layout has already been initialized, then UPDATE layout state
			if (inst.state.initialized) {
				var pane, vis, o, s, h, c
						,	noAnimate = (animate===false)
						;
				$.each($.layout.config.borderPanes, function (idx, pane) {
					state = inst.state[pane];
					o = stateData[ pane ];
					if (typeof o != 'object') return; // no key, continue
					s	= o.size;
					c	= o.initClosed;
					h	= o.initHidden;
					vis	= state.isVisible;
					// resize BEFORE opening
					// resize BEFORE opening
					if (!vis)
						inst.sizePane(pane, s, false, false);
					if (h === true)			inst.hide(pane, noAnimate);
					else if (c === false)	inst.open (pane, false, noAnimate);
					else if (c === true)	inst.close(pane, false, noAnimate);
					else if (h === false)	inst.show (pane, false, noAnimate);
					// resize AFTER any other actions
					if (vis)
						inst.sizePane(pane, s, false, noAnimate); // animate resize if option passed
				});
			};
		}

		/**
		 * Get the *current layout state* and return it as a hash
		 *
		 * @param {Object=}			inst
		 * @param {(string|Array)=}	keys
		 */
		,	readState: function (inst, keys) {
			var
					data	= {}
					,	alt		= { isClosed: 'initClosed', isHidden: 'initHidden' }
					,	state	= inst.state
					,	panes	= $.layout.config.allPanes
					,	pair, pane, key, val
					;
			if (!keys) keys = inst.options.stateManagement.stateKeys; // if called by user
			if ($.isArray(keys)) keys = keys.join(",");
			// convert keys to an array and change delimiters from '__' to '.'
			keys = keys.replace(/__/g, ".").split(',');
			// loop keys and create a data hash
			for (var i=0, n=keys.length; i < n; i++) {
				pair = keys[i].split(".");
				pane = pair[0];
				key  = pair[1];
				if ($.inArray(pane, panes) < 0) continue; // bad pane!
				val = state[ pane ][ key ];
				if (val == undefined) continue;
				if (key=="isClosed" && state[pane]["isSliding"])
					val = true; // if sliding, then *really* isClosed
				( data[pane] || (data[pane]={}) )[ alt[key] ? alt[key] : key ] = val;
			}
			return data;
		}

		/**
		 *	Stringify a JSON hash so can save in a cookie or db-field
		 */
		,	encodeJSON: function (JSON) {
			return parse(JSON);
			function parse (h) {
				var D=[], i=0, k, v, t; // k = key, v = value
				for (k in h) {
					v = h[k];
					t = typeof v;
					if (t == 'string')		// STRING - add quotes
						v = '"'+ v +'"';
					else if (t == 'object')	// SUB-KEY - recurse into it
						v = parse(v);
					D[i++] = '"'+ k +'":'+ v;
				}
				return '{'+ D.join(',') +'}';
			};
		}

		/**
		 *	Convert stringified JSON back to a hash object
		 *	@see		$.parseJSON(), adding in jQuery 1.4.1
		 */
		,	decodeJSON: function (str) {
			try { return $.parseJSON ? $.parseJSON(str) : window["eval"]("("+ str +")") || {}; }
			catch (e) { return {}; }
		}


		,	_create: function (inst) {
			var _	= $.layout.state;
			//	ADD State-Management plugin methods to inst
			$.extend( inst, {
				//	readCookie - update options from cookie - returns hash of cookie data
				readCookie:		function () { return _.readCookie(inst); }
				//	deleteCookie
				,	deleteCookie:	function () { _.deleteCookie(inst); }
				//	saveCookie - optionally pass keys-list and cookie-options (hash)
				,	saveCookie:		function (keys, cookieOpts) { return _.saveCookie(inst, keys, cookieOpts); }
				//	loadCookie - readCookie and use to loadState() - returns hash of cookie data
				,	loadCookie:		function () { return _.loadCookie(inst); }
				//	loadState - pass a hash of state to use to update options
				,	loadState:		function (stateData, animate) { _.loadState(inst, stateData, animate); }
				//	readState - returns hash of current layout-state
				,	readState:		function (keys) { return _.readState(inst, keys); }
				//	add JSON utility methods too...
				,	encodeJSON:		_.encodeJSON
				,	decodeJSON:		_.decodeJSON
			});

			// init state.stateData key, even if plugin is initially disabled
			inst.state.stateData = {};

			// read and load cookie-data per options
			var oS = inst.options.stateManagement;
			if (oS.enabled) {
				if (oS.autoLoad) // update the options from the cookie
					inst.loadCookie();
				else // don't modify options - just store cookie data in state.stateData
					inst.state.stateData = inst.readCookie();
			}
		}

		,	_unload: function (inst) {
			var oS = inst.options.stateManagement;
			if (oS.enabled) {
				if (oS.autoSave) // save a state-cookie automatically
					inst.saveCookie();
				else // don't save a cookie, but do store state-data in state.stateData key
					inst.state.stateData = inst.readState();
			}
		}

	};

// add state initialization method to Layout's onCreate array of functions
	$.layout.onCreate.push( $.layout.state._create );
	$.layout.onUnload.push( $.layout.state._unload );




	/**
	 * jquery.layout.buttons 1.0
	 * $Date: 2011-07-16 08:00:00 (Sat, 16 July 2011) $
	 *
	 * Copyright (c) 2010
	 *   Kevin Dalman (http://allpro.net)
	 *
	 * Dual licensed under the GPL (http://www.gnu.org/licenses/gpl.html)
	 * and MIT (http://www.opensource.org/licenses/mit-license.php) licenses.
	 *
	 * @dependancies: UI Layout 1.3.0.rc30.1 or higher
	 *
	 * @support: http://groups.google.com/group/jquery-ui-layout
	 *
	 * Docs: [ to come ]
	 * Tips: [ to come ]
	 */

// tell Layout that the state plugin is available
	$.layout.plugins.buttons = true;

//	Add buttons options to layout.defaults
	$.layout.defaults.autoBindCustomButtons = false;
// Specify autoBindCustomButtons as a layout-option, NOT a pane-option
	$.layout.optionsMap.layout.push("autoBindCustomButtons");

	var lang = $.layout.language;

	/*
	 *	Button methods
	 */
	$.layout.buttons = {

		/**
		 * Searches for .ui-layout-button-xxx elements and auto-binds them as layout-buttons
		 *
		 * @see  _create()
		 *
		 * @param  {Object}		inst	Layout Instance object
		 */
		init: function (inst) {
			var pre		= "ui-layout-button-"
					,	layout	= inst.options.name || ""
					,	name;
			$.each("toggle,open,close,pin,toggle-slide,open-slide".split(","), function (i, action) {
				$.each($.layout.config.borderPanes, function (ii, pane) {
					$("."+pre+action+"-"+pane).each(function(){
						// if button was previously 'bound', data.layoutName was set, but is blank if layout has no 'name'
						name = $(this).data("layoutName") || $(this).attr("layoutName");
						if (name == undefined || name === layout)
							inst.bindButton(this, action, pane);
					});
				});
			});
		}

		/**
		 * Helper function to validate params received by addButton utilities
		 *
		 * Two classes are added to the element, based on the buttonClass...
		 * The type of button is appended to create the 2nd className:
		 *  - ui-layout-button-pin		// action btnClass
		 *  - ui-layout-button-pin-west	// action btnClass + pane
		 *  - ui-layout-button-toggle
		 *  - ui-layout-button-open
		 *  - ui-layout-button-close
		 *
		 * @param {Object}			inst		Layout Instance object
		 * @param {(string|!Object)}	selector	jQuery selector (or element) for button, eg: ".ui-layout-north .toggle-button"
		 * @param {string}   		pane 		Name of the pane the button is for: 'north', 'south', etc.
		 *
		 * @return {Array.<Object>}	If both params valid, the element matching 'selector' in a jQuery wrapper - otherwise returns null
		 */
		,	get: function (inst, selector, pane, action) {
			var $E	= $(selector)
					,	o	= inst.options
					,	err	= o.showErrorMessages
					;
			if (!$E.length) { // element not found
				if (err) $.layout.msg(lang.errButton + lang.selector +": "+ selector, true);
			}
			else if ($.inArray(pane, $.layout.config.borderPanes) < 0) { // invalid 'pane' sepecified
				if (err) $.layout.msg(lang.errButton + lang.pane +": "+ pane, true);
				$E = $("");  // NO BUTTON
			}
			else { // VALID
				var btn = o[pane].buttonClass +"-"+ action;
				$E	.addClass( btn +" "+ btn +"-"+ pane )
						.data("layoutName", o.name); // add layout identifier - even if blank!
			}
			return $E;
		}


		/**
		 * NEW syntax for binding layout-buttons - will eventually replace addToggle, addOpen, etc.
		 *
		 * @param {Object}			inst		Layout Instance object
		 * @param {(string|!Object)}	selector	jQuery selector (or element) for button, eg: ".ui-layout-north .toggle-button"
		 * @param {string}			action
		 * @param {string}			pane
		 */
		,	bind: function (inst, selector, action, pane) {
			var _ = $.layout.buttons;
			switch (action.toLowerCase()) {
				case "toggle":			_.addToggle	(inst, selector, pane); break;
				case "open":			_.addOpen	(inst, selector, pane); break;
				case "close":			_.addClose	(inst, selector, pane); break;
				case "pin":				_.addPin	(inst, selector, pane); break;
				case "toggle-slide":	_.addToggle	(inst, selector, pane, true); break;
				case "open-slide":		_.addOpen	(inst, selector, pane, true); break;
			}
			return inst;
		}

		/**
		 * Add a custom Toggler button for a pane
		 *
		 * @param {Object}			inst		Layout Instance object
		 * @param {(string|!Object)}	selector	jQuery selector (or element) for button, eg: ".ui-layout-north .toggle-button"
		 * @param {string}  			pane 		Name of the pane the button is for: 'north', 'south', etc.
		 * @param {boolean=}			slide 		true = slide-open, false = pin-open
		 */
		,	addToggle: function (inst, selector, pane, slide) {
			$.layout.buttons.get(inst, selector, pane, "toggle")
					.click(function(evt){
						inst.toggle(pane, !!slide);
						evt.stopPropagation();
					});
			return inst;
		}

		/**
		 * Add a custom Open button for a pane
		 *
		 * @param {Object}			inst		Layout Instance object
		 * @param {(string|!Object)}	selector	jQuery selector (or element) for button, eg: ".ui-layout-north .toggle-button"
		 * @param {string}			pane 		Name of the pane the button is for: 'north', 'south', etc.
		 * @param {boolean=}			slide 		true = slide-open, false = pin-open
		 */
		,	addOpen: function (inst, selector, pane, slide) {
			$.layout.buttons.get(inst, selector, pane, "open")
					.attr("title", lang.Open)
					.click(function (evt) {
						inst.open(pane, !!slide);
						evt.stopPropagation();
					});
			return inst;
		}

		/**
		 * Add a custom Close button for a pane
		 *
		 * @param {Object}			inst		Layout Instance object
		 * @param {(string|!Object)}	selector	jQuery selector (or element) for button, eg: ".ui-layout-north .toggle-button"
		 * @param {string}   		pane 		Name of the pane the button is for: 'north', 'south', etc.
		 */
		,	addClose: function (inst, selector, pane) {
			$.layout.buttons.get(inst, selector, pane, "close")
					.attr("title", lang.Close)
					.click(function (evt) {
						inst.close(pane);
						evt.stopPropagation();
					});
			return inst;
		}

		/**
		 * Add a custom Pin button for a pane
		 *
		 * Four classes are added to the element, based on the paneClass for the associated pane...
		 * Assuming the default paneClass and the pin is 'up', these classes are added for a west-pane pin:
		 *  - ui-layout-pane-pin
		 *  - ui-layout-pane-west-pin
		 *  - ui-layout-pane-pin-up
		 *  - ui-layout-pane-west-pin-up
		 *
		 * @param {Object}			inst		Layout Instance object
		 * @param {(string|!Object)}	selector	jQuery selector (or element) for button, eg: ".ui-layout-north .toggle-button"
		 * @param {string}   		pane 		Name of the pane the pin is for: 'north', 'south', etc.
		 */
		,	addPin: function (inst, selector, pane) {
			var	_	= $.layout.buttons
					,	$E	= _.get(inst, selector, pane, "pin");
			if ($E.length) {
				var s = inst.state[pane];
				$E.click(function (evt) {
					_.setPinState(inst, $(this), pane, (s.isSliding || s.isClosed));
					if (s.isSliding || s.isClosed) inst.open( pane ); // change from sliding to open
					else inst.close( pane ); // slide-closed
					evt.stopPropagation();
				});
				// add up/down pin attributes and classes
				_.setPinState(inst, $E, pane, (!s.isClosed && !s.isSliding));
				// add this pin to the pane data so we can 'sync it' automatically
				// PANE.pins key is an array so we can store multiple pins for each pane
				s.pins.push( selector ); // just save the selector string
			}
			return inst;
		}

		/**
		 * Change the class of the pin button to make it look 'up' or 'down'
		 *
		 * @see  addPin(), syncPins()
		 *
		 * @param {Object}			inst	Layout Instance object
		 * @param {Array.<Object>}	$Pin	The pin-span element in a jQuery wrapper
		 * @param {string}			pane	These are the params returned to callbacks by layout()
		 * @param {boolean}			doPin	true = set the pin 'down', false = set it 'up'
		 */
		,	setPinState: function (inst, $Pin, pane, doPin) {
			var updown = $Pin.attr("pin");
			if (updown && doPin === (updown=="down")) return; // already in correct state
			var
					pin		= inst.options[pane].buttonClass +"-pin"
					,	side	= pin +"-"+ pane
					,	UP		= pin +"-up "+	side +"-up"
					,	DN		= pin +"-down "+side +"-down"
					;
			$Pin
					.attr("pin", doPin ? "down" : "up") // logic
					.attr("title", doPin ? lang.Unpin : lang.Pin)
					.removeClass( doPin ? UP : DN )
					.addClass( doPin ? DN : UP )
			;
		}

		/**
		 * INTERNAL function to sync 'pin buttons' when pane is opened or closed
		 * Unpinned means the pane is 'sliding' - ie, over-top of the adjacent panes
		 *
		 * @see  open(), close()
		 *
		 * @param {Object}			inst	Layout Instance object
		 * @param {string}	pane	These are the params returned to callbacks by layout()
		 * @param {boolean}	doPin	True means set the pin 'down', False means 'up'
		 */
		,	syncPinBtns: function (inst, pane, doPin) {
			// REAL METHOD IS _INSIDE_ LAYOUT - THIS IS HERE JUST FOR REFERENCE
			$.each(state[pane].pins, function (i, selector) {
				$.layout.buttons.setPinState(inst, $(selector), pane, doPin);
			});
		}


		,	_load: function (inst) {
			var	_	= $.layout.buttons;
			// ADD Button methods to Layout Instance
			// Note: sel = jQuery Selector string
			$.extend( inst, {
				bindButton:		function (sel, action, pane) { return _.bind(inst, sel, action, pane); }
				//	DEPRECATED METHODS
				,	addToggleBtn:	function (sel, pane, slide) { return _.addToggle(inst, sel, pane, slide); }
				,	addOpenBtn:		function (sel, pane, slide) { return _.addOpen(inst, sel, pane, slide); }
				,	addCloseBtn:	function (sel, pane) { return _.addClose(inst, sel, pane); }
				,	addPinBtn:		function (sel, pane) { return _.addPin(inst, sel, pane); }
			});

			// init state array to hold pin-buttons
			for (var i=0; i<4; i++) {
				var pane = $.layout.config.borderPanes[i];
				inst.state[pane].pins = [];
			}

			// auto-init buttons onLoad if option is enabled
			if ( inst.options.autoBindCustomButtons )
				_.init(inst);
		}

		,	_unload: function (inst) {
			// TODO: unbind all buttons???
		}

	};

// add initialization method to Layout's onLoad array of functions
	$.layout.onLoad.push(  $.layout.buttons._load );
//$.layout.onUnload.push( $.layout.buttons._unload );



	/**
	 * jquery.layout.browserZoom 1.0
	 * $Date: 2011-12-29 08:00:00 (Thu, 29 Dec 2011) $
	 *
	 * Copyright (c) 2012
	 *   Kevin Dalman (http://allpro.net)
	 *
	 * Dual licensed under the GPL (http://www.gnu.org/licenses/gpl.html)
	 * and MIT (http://www.opensource.org/licenses/mit-license.php) licenses.
	 *
	 * @dependancies: UI Layout 1.3.0.rc30.1 or higher
	 *
	 * @support: http://groups.google.com/group/jquery-ui-layout
	 *
	 * @todo: Extend logic to handle other problematic zooming in browsers
	 * @todo: Add hotkey/mousewheel bindings to _instantly_ respond to these zoom event
	 */

// tell Layout that the plugin is available
	$.layout.plugins.browserZoom = true;

	$.layout.defaults.browserZoomCheckInterval = 1000;
	$.layout.optionsMap.layout.push("browserZoomCheckInterval");

	/*
	 *	browserZoom methods
	 */
	$.layout.browserZoom = {

		_init: function (inst) {
			$.layout.browserZoom._setTimer(inst);
		}

		,	_setTimer: function (inst) {
			if (inst.destroyed) return;
			var o = inst.options
					,	s = inst.state
					,	z = s.browserZoom = $.layout.browserZoom.ratio()
					;
			if (o.resizeWithWindow && z !== false) {
				setTimeout(function(){
					if (inst.destroyed) return;
					var d = $.layout.browserZoom.ratio();
					if (d !== s.browserZoom) {
						s.browserZoom = d;
						inst.resizeAll();
					}
					$.layout.browserZoom._setTimer(inst); // set a NEW timeout
				},	Math.max( o.browserZoomCheckInterval, 100 )); // MINIMUM 100ms interval, for performance
			}
		}

		,	ratio: function () {
			var w	= window
					,	s	= screen
					,	d	= document
					,	dE	= d.documentElement || d.body
					,	b	= $.layout.browser
					,	v	= b.version
					,	r, sW, cW
					;
			// we can ignore all browsers that fire window.resize event onZoom
			if ((b.msie && v > 8)
					||	!b.msie
					) return false; // don't need to track zoom

			if (s.deviceXDPI)
				return calc(s.deviceXDPI, s.systemXDPI);
			// everything below is just for future reference!
			if (b.webkit && (r = d.body.getBoundingClientRect))
				return calc((r.left - r.right), d.body.offsetWidth);
			if (b.webkit && (sW = w.outerWidth))
				return calc(sW, w.innerWidth);
			if ((sW = s.width) && (cW = dE.clientWidth))
				return calc(sW, cW);
			return false; // no match, so cannot - or don't need to - track zoom

			function calc (x,y) { return (parseInt(x,10) / parseInt(y,10) * 100).toFixed(); }
		}

	};
// add initialization method to Layout's onLoad array of functions
	$.layout.onReady.push( $.layout.browserZoom._init );



})( jQuery );/*
* qTip2 - Pretty powerful tooltips
* http://craigsworks.com/projects/qtip2/
*
* Version: 2.0.0pre
* Copyright 2009-2010 Craig Michael Thompson - http://craigsworks.com
*
* Dual licensed under MIT or GPLv2 licenses
*   http://en.wikipedia.org/wiki/MIT_License
*   http://en.wikipedia.org/wiki/GNU_General_Public_License
*
* Date: Wed Feb 23 23:51:34 2011 +0000
*/
"use strict",function(a,b,c){function z(b){var c=this,d=b.elements,e=d.tooltip,f=".bgiframe-"+b.id,g="tooltipmove"+f+" tooltipshow"+f;a.extend(c,{init:function(){d.bgiframe=a('<iframe class="ui-tooltip-bgiframe" frameborder="0" tabindex="-1" src="javascript:\'\';"  style="display:block; position:absolute; z-index:-1; filter:alpha(opacity=0);"></iframe>'),d.bgiframe.appendTo(e),e.bind(g,c.adjust)},adjust:function(){var a=b.get("dimensions"),c=b.plugins.tip,f=b.elements.tip,g,h;h=parseInt(e.css("border-left-width"),10)||0,h={left:-h,top:-h},c&&f&&(g=c.corner.precedance==="x"?["width","left"]:["height","top"],h[g[1]]-=f[g[0]]()),d.bgiframe.css(h).css(a)},destroy:function(){c.iframe.remove(),e.unbind(g)}}),c.init()}function y(c){var f=this,h=c.options.show.modal,i=c.elements,j=i.tooltip,k="#qtip-overlay",l=".qtipmodal",m="tooltipshow"+l+" tooltiphide"+l;c.checks.modal={"^show.modal.(on|blur)$":function(){f.init(),i.overlay.toggle(j.is(":visible"))}},a.extend(f,{init:function(){h.on&&(j.unbind(l).bind(m,function(b,c,d){var e=b.type.replace("tooltip","");a.isFunction(h[e])?h[e].call(i.overlay,d,c):f[e](d)}),f.create(),h.blur===d&&i.overlay.unbind(l+c.id).bind("click"+l+c.id,function(){c.hide.call(c)}),i.overlay.css("cursor",h.blur?"pointer":""))},create:function(){var c=a(k),d;if(c.length){i.overlay=c;return c}d=i.overlay=a("<div />",{id:k.substr(1),css:{position:"absolute",top:0,left:0,display:"none"},mousedown:function(){return e}}).appendTo(document.body),a(b).bind("resize"+l,function(){d.css({height:Math.max(a(b).height(),a(document).height()),width:Math.max(a(b).width(),a(document).width())})}).trigger("resize");return d},toggle:function(b){var h=i.overlay,k=c.options.show.modal.effect,l=b?"show":"hide",m;h||(h=f.create());if(!h.is(":animated")||b)h.stop(d,e),b&&(m=parseInt(a.css(j[0],"z-index"),10),h.css("z-index",(m||g.zindex)-1)),a.isFunction(k)?k.call(h,b):k===e?h[l]():h.fadeTo(90,b?.7:0,function(){b||a(this).hide()})},show:function(){f.toggle(d)},hide:function(){f.toggle(e)},destroy:function(){var d=i.overlay;d&&(a(k).each(function(){var b=a(this).data("qtip");if(b&&b.id!==b.id&&b.options.show.modal)return d=e}),d?(i.overlay.remove(),a(b).unbind(l)):i.overlay.unbind(l+c.id)),j.unbind(m)}}),f.init()}function x(b,g){function v(a){var b=a.precedance==="y",c=n[b?"width":"height"],d=n[b?"height":"width"],e=a.string().indexOf("center")>-1,f=c*(e?.5:1),g=Math.pow,h=Math.round,i,j,k,l=Math.sqrt(g(f,2)+g(d,2)),m=[p/f*l,p/d*l];m[2]=Math.sqrt(g(m[0],2)-g(p,2)),m[3]=Math.sqrt(g(m[1],2)-g(p,2)),i=l+m[2]+m[3]+(e?0:m[0]),j=i/l,k=[h(j*d),h(j*c)];return{height:k[b?0:1],width:k[b?1:0]}}function u(b){var c=k.titlebar&&b.y==="top",d=c?k.titlebar:k.content,e=a.browser.mozilla,f=e?"-moz-":a.browser.webkit?"-webkit-":"",g=b.y+(e?"":"-")+b.x,h=f+(e?"border-radius-"+g:"border-"+g+"-radius");return parseInt(d.css(h),10)||parseInt(l.css(h),10)||0}function t(a,b,c){b=b?b:a[a.precedance];var d=k.titlebar&&a.y==="top",e=d?k.titlebar:k.content,f="border-"+b+"-width",g=parseInt(e.css(f),10);return(c?g||parseInt(l.css(f),10):g)||0}function s(b,e,f,g){if(k.tip){var h=a.extend({},i.corner),l=f.adjusted,n;i.corner.fixed!==d&&(l.left&&(h.x=h.x==="center"?l.left>0?"left":"right":h.x==="left"?"right":"left"),l.top&&(h.y=h.y==="center"?l.top>0?"top":"bottom":h.y==="top"?"bottom":"top"),h.string()!==m.corner&&(m.top!==l.top||m.left!==l.left)&&(n=i.update(h))),n||(n=i.position(h,0)),n.right!==c&&(n.left=n.right),n.bottom!==c&&(n.top=n.bottom),n.option=Math.max(0,j.offset),f.left-=n.left.charAt?n.option:(n.right?-1:1)*n.left,f.top-=n.top.charAt?n.option:(n.bottom?-1:1)*n.top,m.left=l.left,m.top=l.top,m.corner=h.string()}}var i=this,j=b.options.style.tip,k=b.elements,l=k.tooltip,m={top:0,left:0,corner:""},n={width:j.width,height:j.height},o={},p=j.border||0,q=".qtip-tip",r=a("<canvas />")[0].getContext;i.corner=f,i.mimic=f,b.checks.tip={"^position.my|style.tip.(corner|mimic|border)$":function(){i.init()||i.destroy(),b.reposition()},"^style.tip.(height|width)$":function(){n={width:j.width,height:j.height},i.create(),i.update(),b.reposition()},"^content.title.text|style.(classes|widget)$":function(){k.tip&&i.update()}},a.extend(i,{init:function(){var b=i.detectCorner()&&(r||a.browser.msie);b&&(i.create(),i.update(),l.unbind(q).bind("tooltipmove"+q,s));return b},detectCorner:function(){var a=j.corner,c=b.options.position,f=c.at,g=c.my.string?c.my.string():c.my;if(a===e||g===e&&f===e)return e;a===d?i.corner=new h.Corner(g):a.string||(i.corner=new h.Corner(a),i.corner.fixed=d);return i.corner.string()!=="centercenter"},detectColours:function(){var c=k.tip.css({backgroundColor:"",border:""}),d=i.corner,e=d[d.precedance],f="border-"+e+"-color",g="border"+e.charAt(0)+e.substr(1)+"Color",h=/rgba?\(0, 0, 0(, 0)?\)|transparent/i,m="background-color",p="transparent",q=k.titlebar&&(d.y==="top"||d.y==="center"&&c.position().top+n.height/2+j.offset<k.titlebar.outerHeight(1)),r=q?k.titlebar:k.content;o.fill=c.css(m)||p,o.border=c[0].style[g];if(!o.fill||h.test(o.fill))o.fill=r.css(m),h.test(o.fill)&&(o.fill=l.css(m));if(!o.border||h.test(o.border)){o.border=l.css(f);if(h.test(o.border)||o.border===a(document.body).css("color"))o.border=r.css(f)!==a(b.elements.content).css("color")?r.css(f):p}a("*",c).add(c).css(m,p).css("border","0px dashed transparent")},create:function(){var b=n.width,c=n.height,d;k.tip&&k.tip.remove(),k.tip=a("<div />",{"class":"ui-tooltip-tip"}).css({width:b,height:c}).prependTo(l),r?a("<canvas />").appendTo(k.tip)[0].getContext("2d").save():(d='<vml:shape coordorigin="0,0" style="display:block; position:absolute; behavior:url(#default#VML);"></vml:shape>',k.tip.html(p?d+=d:d))},update:function(b){var c=k.tip,g=c.children(),l=n.width,m=n.height,q="px solid ",s="px dashed transparent",u=j.mimic,x=Math.round,y,z,A,B,C;b||(b=i.corner),u===e?u=b:(u=new h.Corner(u),u.precedance=b.precedance,u.x==="inherit"?u.x=b.x:u.y==="inherit"?u.y=b.y:u.x===u.y&&(u[b.precedance]=b[b.precedance])),y=u.precedance,i.detectColours(),p=o.border==="transparent"||o.border==="#123456"?0:j.border===d?t(b,f,d):j.border,A=w(u,l,m),C=v(b),c.css(C),b.precedance==="y"?B=[x(u.x==="left"?p:u.x==="right"?C.width-l-p:(C.width-l)/2),x(u.y==="top"?C.height-m:0)]:B=[x(u.x==="left"?C.width-l:0),x(u.y==="top"?p:u.y==="bottom"?C.height-m-p:(C.height-m)/2)],r?(g.attr(C),z=g[0].getContext("2d"),z.restore(),z.save(),z.clearRect(0,0,3e3,3e3),z.translate(B[0],B[1]),z.beginPath(),z.moveTo(A[0][0],A[0][1]),z.lineTo(A[1][0],A[1][1]),z.lineTo(A[2][0],A[2][1]),z.closePath(),z.fillStyle=o.fill,z.strokeStyle=o.border,z.lineWidth=p*2,z.lineJoin="miter",z.miterLimit=100,z.stroke(),z.fill()):(A="m"+A[0][0]+","+A[0][1]+" l"+A[1][0]+","+A[1][1]+" "+A[2][0]+","+A[2][1]+" xe",B[2]=p&&/^(r|b)/i.test(b.string())?1:0,g.css({antialias:""+(u.string().indexOf("center")>-1),left:B[0]-B[2]*Number(y==="x"),top:B[1]-B[2]*Number(y==="y"),width:l+p,height:m+p}).each(function(b){var c=a(this);c.attr({coordsize:l+p+" "+(m+p),path:A,fillcolor:o.fill,filled:!!b,stroked:!b}).css({display:p||b?"block":"none"}),!b&&p>0&&c.html()===""&&c.html('<vml:stroke weight="'+p*2+'px" color="'+o.border+'" miterlimit="1000" joinstyle="miter"  style="behavior:url(#default#VML); display:block;" />')}));return i.position(b,1)},position:function(b,c){var f=k.tip,g={},h=Math.max(0,j.offset),l,m,n;if(j.corner===e||!f)return e;b=b||i.corner,l=b.precedance,m=v(b),n=a.browser.msie&&p&&/^(b|r)/i.test(b.string())?1:0,a.each(l==="y"?[b.x,b.y]:[b.y,b.x],function(a,c){var e,f;c==="center"?(e=l==="y"?"left":"top",g[e]="50%",g["margin-"+e]=-Math.round(m[l==="y"?"width":"height"]/2)+h):(e=t(b,c,d),f=u(b),g[c]=a||!p?t(b,c)+(a?0:f):h+(f>e?f:0))}),g[b[l]]-=m[l==="x"?"width":"height"]+n,c&&f.css({top:"",bottom:"",left:"",right:"",margin:""}).css(g);return g},destroy:function(){k.tip&&k.tip.remove(),l.unbind(q)}}),i.init()}function w(a,b,c){var d=Math.ceil(b/2),e=Math.ceil(c/2),f={bottomright:[[0,0],[b,c],[b,0]],bottomleft:[[0,0],[b,0],[0,c]],topright:[[0,c],[b,0],[b,c]],topleft:[[0,0],[0,c],[b,c]],topcenter:[[0,c],[d,0],[b,c]],bottomcenter:[[0,0],[b,0],[d,c]],rightcenter:[[0,0],[b,e],[0,c]],leftcenter:[[b,0],[b,c],[0,e]]};f.lefttop=f.bottomright,f.righttop=f.bottomleft,f.leftbottom=f.topright,f.rightbottom=f.topleft;return f[a.string()]}function v(b){var c=this,d=b.elements.tooltip,e=b.options.content.ajax,f=".qtip-ajax",g=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;b.checks.ajax={"^content.ajax":function(a,b,d){b==="ajax"&&(e=d),b==="once"?c.once(e.once):e&&e.url?c.load():c.once(0)}},a.extend(c,{init:function(){e&&e.url&&(c.load(),d.one("tooltipshow",function(){c.once(e.once)}))},once:function(a){d[(a?"un":"")+"bind"]("tooltipshow"+f,c.load)},load:function(){function j(a,c,d){b.set("content.text",c+": "+d)}function i(c){h&&(c=a("<div/>").append(c.replace(g,"")).find(h)),b.set("content.text",c)}var d=e.url.indexOf(" "),f=e.url,h;d>-1&&(h=f.substr(d),f=f.substr(0,d)),a.ajax(a.extend({success:i,error:j,context:b},e,{url:f}));return c}}),c.init()}function u(b,c){var i,j,k,l,m=a(this),n=a(document.body),o=this===document?n:m,p=m.metadata?m.metadata(c.metadata):f,u=c.metadata.type==="html5"&&p?p[c.metadata.name]:f,v=m.data(c.metadata.name||"qtipopts");try{v=typeof v==="string"?(new Function("return "+v))():v}catch(w){r("Unable to parse HTML5 attribute data: "+v)}l=a.extend(d,{},g.defaults,c,typeof v==="object"?s(v):f,s(u||p)),p&&a.removeData(this,"metadata"),j=l.position,l.id=b;if("boolean"===typeof l.content.text){k=m.attr(l.content.attr);if(l.content.attr!==e&&k)l.content.text=k;else return e}j.container===e&&(j.container=n),j.target===e&&(j.target=o),l.show.target===e&&(l.show.target=o),l.show.solo===d&&(l.show.solo=n),l.hide.target===e&&(l.hide.target=o),l.position.viewport===d&&(l.position.viewport=j.container),j.at=new h.Corner(j.at),j.my=new h.Corner(j.my);if(a.data(this,"qtip"))if(l.overwrite)m.qtip("destroy");else if(l.overwrite===e)return e;a.attr(this,"title")&&(a.data(this,q,a.attr(this,"title")),m.removeAttr("title")),i=new t(m,l,b,!!k),a.data(this,"qtip",i),m.bind("remove.qtip",function(){i.destroy()});return i}function t(p,r,t,u){function M(c,d,e,f){f=parseInt(f,10)!==0;var g=".qtip-"+t,h={show:c&&r.show.target[0],hide:d&&r.hide.target[0],tooltip:e&&v.rendered&&A.tooltip[0],content:e&&v.rendered&&A.content[0],container:f&&r.position.container[0]===w?document:r.position.container[0],window:f&&b};v.rendered?a([]).pushStack(a.grep([h.show,h.hide,h.tooltip,h.container,h.content,h.window],function(a){return typeof a==="object"})).unbind(g):c&&r.show.target.unbind(g+"-create")}function L(c,d,f,h){function y(a){D()&&v.reposition(a)}function x(a){if(z.hasClass(l))return e;clearTimeout(v.timers.inactive),v.timers.inactive=setTimeout(function(){v.hide(a)},r.hide.inactive)}function u(b){if(z.hasClass(l))return e;var c=a(b.relatedTarget||b.target),d=c.closest(m)[0]===z[0],f=c[0]===n.show[0];clearTimeout(v.timers.show),clearTimeout(v.timers.hide);if(k.target==="mouse"&&d||r.hide.fixed&&(/mouse(out|leave|move)/.test(b.type)&&(d||f))){b.stopPropagation(),b.preventDefault();return e}z.stop(1,1),r.hide.delay>0?v.timers.hide=setTimeout(function(){v.hide(b)},r.hide.delay):v.hide(b)}function s(a){if(z.hasClass(l))return e;n.show.trigger("qtip-"+t+"-inactive"),clearTimeout(v.timers.show),clearTimeout(v.timers.hide);var b=function(){v.show(a)};r.show.delay>0?v.timers.show=setTimeout(b,r.show.delay):b()}var j=".qtip-"+t,k=r.position,n={show:r.show.target,hide:r.hide.target,container:k.container[0]===w?a(document):k.container,doc:a(document)},o={show:String(r.show.event).split(" "),hide:String(r.hide.event).split(" ")},q=a.browser.msie&&parseInt(a.browser.version,10)===6;f&&(r.hide.fixed&&(n.hide=n.hide.add(z),z.bind("mouseover"+j,function(){z.hasClass(l)||clearTimeout(v.timers.hide)})),k.target==="mouse"&&r.hide.event&&z.bind("mouseleave"+j,function(a){(a.relatedTarget||a.target)!==n.show[0]&&v.hide(a)}),z.bind("mouseenter"+j+" mouseleave"+j,function(a){v[a.type==="mouseenter"?"focus":"blur"](a)})),d&&("number"===typeof r.hide.inactive&&(n.show.bind("qtip-"+t+"-inactive",x),a.each(g.inactiveEvents,function(a,b){n.hide.add(A.tooltip).bind(b+j+"-inactive",x)})),a.each(o.hide,function(b,c){var d=a.inArray(c,o.show),e=a(n.hide);d>-1&&e.add(n.show).length===e.length||c==="unfocus"?(n.show.bind(c+j,function(a){D()?u(a):s(a)}),delete o.show[d]):n.hide.bind(c+j,u)})),c&&a.each(o.show,function(a,b){n.show.bind(b+j,s)}),h&&((k.adjust.resize||k.viewport)&&a(a.event.special.resize?k.viewport:b).bind("resize"+j,y),(k.viewport||q&&z.css("position")==="fixed")&&a(k.viewport).bind("scroll"+j,y),/unfocus/i.test(r.hide.event)&&n.doc.bind("mousedown"+j,function(b){var c=a(b.target);c.parents(m).length===0&&c.add(p).length>1&&D()&&!z.hasClass(l)&&v.hide(b)}),k.target==="mouse"&&n.doc.bind("mousemove"+j,function(a){k.adjust.mouse&&!z.hasClass(l)&&D()&&v.reposition(a||i)}))}function K(b,c){var f=A.content;if(!v.rendered||!b)return e;a.isFunction(b)&&(b=b.call(p,v)||""),b.jquery&&b.length>0?f.empty().append(b.css({display:"block"})):f.html(b),z.queue("fx",function(b){function e(a){c=c.not(a),c.length===0&&(v.redraw(),v.rendered&&D()&&v.reposition(B.event),b())}var c=f.find("img:not([height]):not([width])");c.each(function(b,c){var f=["abort","error","load","unload",""].join(".qtip-image ");a(this).bind(f,function(){clearTimeout(v.timers.img[b]),e(this)}),function g(){if(c.height&&c.width)return e(c);v.timers.img[b]=setTimeout(g,20)}();return d}),c.length===0&&e(c)});return v}function J(b){var c=A.title;if(!v.rendered||!b)return e;a.isFunction(b)&&(b=b.call(p,v)||""),b.jquery&&b.length>0?c.empty().append(b.css({display:"block"})):c.html(b),v.redraw(),v.rendered&&D()&&v.reposition(B.event)}function I(a){var b=A.button,c=A.title;if(!v.rendered)return e;a?(c||H(),G()):b.remove()}function H(){var b=x+"-title";A.titlebar&&F(),A.titlebar=a("<div />",{"class":j+"-titlebar "+(r.style.widget?"ui-widget-header":"")}).append(A.title=a("<div />",{id:b,"class":j+"-title","aria-atomic":d})).insertBefore(A.content),r.content.title.button?G():v.rendered&&v.redraw()}function G(){var b=r.content.title.button;A.button&&A.button.remove(),b.jquery?A.button=b:A.button=a("<a />",{"class":"ui-state-default "+(r.style.widget?"":j+"-icon"),title:"Close tooltip","aria-label":"Close tooltip"}).prepend(a("<span />",{"class":"ui-icon ui-icon-close",html:"&times;"})),A.button.appendTo(A.titlebar).attr("role","button").hover(function(b){a(this).toggleClass("ui-state-hover",b.type==="mouseenter")}).click(function(a){z.hasClass(l)||v.hide(a);return e}).bind("mousedown keydown mouseup keyup mouseout",function(b){a(this).toggleClass("ui-state-active ui-state-focus",b.type.substr(-4)==="down")}),v.redraw()}function F(){A.title&&(A.titlebar.remove(),A.titlebar=A.title=A.button=f,v.reposition())}function E(){var a=r.style.widget;z.toggleClass(k,a),A.content.toggleClass(k+"-content",a),A.titlebar&&A.titlebar.toggleClass(k+"-header",a),A.button&&A.button.toggleClass(j+"-icon",!a)}function D(){return z&&z.css("left")!==o&&z.css("visibility")!=="hidden"}function C(a){var b=0,c,d=r,e=a.split(".");while(d=d[e[b++]])b<e.length&&(c=d);return[c||r,e.pop()]}var v=this,w=document.body,x=j+"-"+t,y=0,z,A,B;v.id=t,v.rendered=e,v.elements=A={target:p},v.timers={img:[]},v.options=r,v.checks={},v.plugins={},v.cache=B={event:{},target:f,disabled:e,attr:u},v.checks.builtin={"^id$":function(b,c,f){var h=f===d?g.nextid:f,i=j+"-"+h;h!==e&&h.length>0&&!a("#"+i).length&&(z[0].id=i,A.content[0].id=i+"-content",A.title[0].id=i+"-title")},"^content.text$":function(a,b,c){K(c)},"^content.title.text$":function(a,b,c){if(!c)return F();!A.title&&c&&H(),J(c)},"^content.title.button$":function(a,b,c){I(c)},"^position.(my|at)$":function(a,b,c){"string"===typeof c&&(a[b]=new h.Corner(c))},"^position.container$":function(a,b,c){v.rendered&&z.appendTo(c)},"^(show|hide).(event|target|fixed|delay|inactive)$":function(a,b,c,d,e){var f=[1,0,0];f[e[0]==="show"?"push":"unshift"](0),M.apply(v,f),L.apply(v,[1,1,0,0])},"^show.ready$":function(){v.rendered||v.show()},"^style.classes$":function(b,c,d){a.attr(z[0],"class",j+" qtip ui-helper-reset "+d)},"^style.widget|content.title":E,"^events.(render|show|move|hide|focus|blur)$":function(b,c,d){z[(a.isFunction(d)?"":"un")+"bind"]("tooltip"+c,d)}},a.extend(v,{render:function(b){if(v.rendered)return e;var c=r.content.text,f=r.content.title.text,g=a.Event("tooltiprender");a.attr(p[0],"aria-describedby",x),z=A.tooltip=a("<div/>").attr({id:x,"class":j+" qtip ui-helper-reset "+r.style.classes,role:"alert","aria-live":"polite","aria-atomic":e,"aria-describedby":x+"-content","aria-hidden":d}).toggleClass(l,B.disabled).data("qtip",v).appendTo(r.position.container).append(A.content=a("<div />",{"class":j+"-content",id:x+"-content","aria-atomic":d})),v.rendered=d,f&&(H(),J(f)),K(c),E(),a.each(h,function(){this.initialize==="render"&&this(v)}),L(1,1,1,1),a.each(r.events,function(a,b){if(b){var c=a==="toggle"?"tooltipshow tooltiphide":"tooltip"+a;z.bind(c,b)}}),z.css("visibility","hidden").queue("fx",function(a){g.originalEvent=B.event,z.trigger(g,[v]),(r.show.ready||b)&&v.show(B.event),a()});return v},get:function(a){var b,c;switch(a.toLowerCase()){case"dimensions":b={height:z.outerHeight(),width:z.outerWidth()};break;case"offset":b=h.offset(z,r.position.container);break;default:c=C(a.toLowerCase()),b=c[0][c[1]],b=b.precedance?b.string():b}return b},set:function(b,c){function j(a,b){var c,e,f;if(v.rendered){for(c in h)for(e in h[c])if(f=(new RegExp(e,"i")).exec(a))b.push(f),h[c][e].apply(v,b)}else a==="show.ready"&&b[2]&&(y=0,v.render(d))}var f=/^position.(my|at|adjust|target|container)|style|content/i,g=e,h=v.checks,i;"string"===typeof b?(i=b,b={},b[i]=c):b=a.extend(d,{},b),a.each(b,function(c,d){var e=C(c.toLowerCase()),h;h=e[0][e[1]],e[0][e[1]]="object"===typeof d&&d.nodeType?a(d):d,b[c]=[e[0],e[1],d,h],g=f.test(c)||g}),s(r),y=1,a.each(b,j),y=0,g&&D()&&v.rendered&&v.reposition();return v},toggle:function(b,c){function j(){b?a.browser.msie&&z[0].style.removeAttribute("filter"):z.css({display:"",visibility:"hidden",width:"",opacity:"",left:"",top:""})}if(!v.rendered)if(b)v.render(1);else return e;var d=b?"show":"hide",g=r[d],h=D(),i;(typeof b).search("boolean|number")&&(b=!h);if(h===b)return v;if(c){if(/over|enter/.test(c.type)&&/out|leave/.test(B.event.type)&&c.target===r.show.target[0]&&z.has(c.relatedTarget).length)return v;B.event=a.extend({},c)}i=a.Event("tooltip"+d),i.originalEvent=c?B.event:f,z.trigger(i,[v,90]);if(i.isDefaultPrevented())return v;a.attr(z[0],"aria-hidden",!b),b?(z.hide().css({visibility:""}),v.focus(c),v.reposition(c,0),g.solo&&a(m,g.solo).not(z).qtip("hide",i)):(clearTimeout(v.timers.show),v.blur(c)),z.stop(1,1),a.isFunction(g.effect)?(g.effect.call(z,v),z.queue("fx",function(a){j.call(this,a),a()})):g.effect===e?(z[d](),j.call(z)):z.fadeTo(90,b?1:0,j),b&&g.target.trigger("qtip-"+t+"-inactive");return v},show:function(a){return v.toggle(d,a)},hide:function(a){return v.toggle(e,a)},focus:function(b){if(!v.rendered)return e;var c=a(m),d=parseInt(z[0].style.zIndex,10),f=g.zindex+c.length,h=a.extend({},b),i,j;z.hasClass(n)||(d!==f&&(c.each(function(){this.style.zIndex>d&&(this.style.zIndex=this.style.zIndex-1)}),c.filter("."+n).qtip("blur",h)),j=a.Event("tooltipfocus"),j.originalEvent=h,z.trigger(j,[v,f]),j.isDefaultPrevented()||(z.addClass(n)[0].style.zIndex=f));return v},blur:function(b){var c=a.extend({},b),d;z.removeClass(n),d=a.Event("tooltipblur"),d.originalEvent=c,z.trigger(d,[v]);return v},reposition:function(f,k){if(!v.rendered||y)return e;y=d;var l=r.position.target,m=r.position,n=m.my,o=m.at,p=m.adjust,q=z.outerWidth(),s=z.outerHeight(),t=0,u=0,x=a.Event("tooltipmove"),A=z.css("position")==="fixed",C=m.viewport.jquery?m.viewport:a(b),E={left:0,top:0},F=(v.plugins.tip||{}).corner,G={left:function(a){var b=C.scrollLeft,c=n.x==="left"?q:n.x==="right"?-q:-q/2,d=o.x==="left"?t:o.x==="right"?-t:-t/2,e=F&&F.precedance==="x"?g.defaults.style.tip.width:0,f=b-a-e,h=a+q-C.width-b+e,i=c-(n.precedance==="x"||n.x===n.y?d:0),j=n.x==="center";f>0&&(n.x!=="left"||h>0)?E.left-=i+(j?0:2*p.x):h>0&&(n.x!=="right"||f>0)&&(E.left-=j?-i:i+2*p.x),E.left!==a&&j&&(E.left-=p.x),E.left<0&&-E.left>h&&(E.left=a);return E.left-a},top:function(a){var b=C.scrollTop,c=n.y==="top"?s:n.y==="bottom"?-s:-s/2,d=o.y==="top"?u:o.y==="bottom"?-u:-u/2,e=F&&F.precedance==="y"?g.defaults.style.tip.height:0,f=b-a-e,h=a+s-C.height-b+e,i=c-(n.precedance==="y"||n.x===n.y?d:0),j=n.y==="center";f>0&&(n.y!=="top"||h>0)?E.top-=i+(j?0:2*p.y):h>0&&(n.y!=="bottom"||f>0)&&(E.top-=j?-i:i+2*p.y),E.top!==a&&j&&(E.top-=p.y),E.top<0&&-E.top>h&&(E.top=a);return E.top-a}};k=k===c||!!k||e,C=C?{elem:C,height:C[(C[0]===b?"h":"outerH")+"eight"](),width:C[(C[0]===b?"w":"outerW")+"idth"](),scrollLeft:C.scrollLeft(),scrollTop:C.scrollTop()}:e;if(l==="mouse")o={x:"left",y:"top"},f=f&&(f.type==="resize"||f.type==="scroll")?B.event:p.mouse||!f||!f.pageX?a.extend({},i):f,E={top:f.pageY,left:f.pageX};else{l==="event"&&(f&&f.target&&f.type!=="scroll"&&f.type!=="resize"?l=B.target=a(f.target):l=B.target),l=a(l).eq(0);if(l.length===0)return v;l[0]===document||l[0]===b?(t=l.width(),u=l.height(),l[0]===b&&(E={top:A?0:C.scrollTop,left:A?0:C.scrollLeft})):l.is("area")&&h.imagemap?E=h.imagemap(l,o):l[0].namespaceURI=="http://www.w3.org/2000/svg"&&h.svg?E=h.svg(l,o):(t=l.outerWidth(),u=l.outerHeight(),E=h.offset(l,m.container)),E.offset&&(t=E.width,u=E.height,E=E.offset),E.left+=o.x==="right"?t:o.x==="center"?t/2:0,E.top+=o.y==="bottom"?u:o.y==="center"?u/2:0}E.left+=p.x+(n.x==="right"?-q:n.x==="center"?-q/2:0),E.top+=p.y+(n.y==="bottom"?-s:n.y==="center"?-s/2:0),m.viewport.jquery&&l[0]!==b&&l[0]!==w?E.adjusted={left:G.left(E.left),top:G.top(E.top)}:E.adjusted={left:0,top:0},z.attr("class",function(b,c){return a.attr(this,"class").replace(/ui-tooltip-pos-\w+/i,"")}).addClass(j+"-pos-"+n.abbreviation()),x.originalEvent=a.extend({},f),z.trigger(x,[v,E,C.elem]);if(x.isDefaultPrevented())return v;delete E.adjusted,k&&isNaN(E.left,E.top)?D()&&a.isFunction(m.effect)&&(m.effect.call(z,v,E),z.queue(function(b){var c=a(this);c.css({opacity:"",height:""}),a.browser.msie&&this.style&&this.style.removeAttribute("filter"),b()})):z.css(E),y=e;return v},redraw:function(){if(!v.rendered||(!a.browser.msie||a.browser.version>=8))return e;var b=j+"-fluid",c;z.css({width:"auto",height:"auto"}).addClass(b),c={height:z.outerHeight(),width:z.outerWidth()},a.each(["width","height"],function(a,b){var d=parseInt(z.css("max-"+b),10)||0,e=parseInt(z.css("min-"+b),10)||0;c[b]=d+e?Math.min(Math.max(c[b],e),d):c[b]}),z.css(c).removeClass(b);return v},disable:function(b){var c=l;"boolean"!==typeof b&&(b=!z.hasClass(c)&&!B.disabled),v.rendered?(z.toggleClass(c,b),a.attr(z[0],"aria-disabled",b)):B.disabled=!!b;return v},enable:function(){v.disable(e)},destroy:function(){var b=p[0],c=a.data(b,q);v.rendered&&(z.remove(),a.each(v.plugins,function(){this.destroy&&this.destroy()})),clearTimeout(v.timers.show),clearTimeout(v.timers.hide),M(1,1,1,1),a.removeData(b,"qtip"),c&&a.attr(b,"title",c),p.removeAttr("aria-describedby").unbind(".qtip");return p}})}function s(b){var c;if(!b||"object"!==typeof b)return e;"object"!==typeof b.metadata&&(b.metadata={type:b.metadata});if("content"in b){if("object"!==typeof b.content||b.content.jquery)b.content={text:b.content};c=b.content.text||e,!a.isFunction(c)&&(!c&&!c.attr||c.length<1||"object"===typeof c&&!c.jquery)&&(b.content.text=e),"title"in b.content&&("object"!==typeof b.content.title&&(b.content.title={text:b.content.title}),c=b.content.title.text||e,!a.isFunction(c)&&(!c&&!c.attr||c.length<1||"object"===typeof c&&!c.jquery)&&(b.content.title.text=e))}"position"in b&&("object"!==typeof b.position&&(b.position={my:b.position,at:b.position})),"show"in b&&("object"!==typeof b.show&&(b.show.jquery?b.show={target:b.show}:b.show={event:b.show})),"hide"in b&&("object"!==typeof b.hide&&(b.hide.jquery?b.hide={target:b.hide}:b.hide={event:b.hide})),"style"in b&&("object"!==typeof b.style&&(b.style={classes:b.style})),a.each(h,function(){this.sanitize&&this.sanitize(b)});return b}function r(){var c=b.console;return c&&(c.error||c.log||a.noop).apply(c,arguments)}var d=!0,e=!1,f=null,g,h,i,j="ui-tooltip",k="ui-widget",l="ui-state-disabled",m="div.qtip."+j,n=j+"-focus",o="-31000px",p="_replacedByqTip",q="oldtitle";g=a.fn.qtip=function(b,h,i){var j=String(b).toLowerCase(),k=f,l=j==="disable"?[d]:a.makeArray(arguments).slice(1,10),m=l[l.length-1],n=this[0]?a.data(this[0],"qtip"):f;if(!arguments.length&&n||j==="api")return n;if("string"===typeof b){this.each(function(){var b=a.data(this,"qtip");if(!b)return d;m&&m.timeStamp&&(b.cache.event=m);if(j==="option"&&h)if(a.isPlainObject(h)||i!==c)b.set(h,i);else{k=b.get(h);return e}else b[j]&&b[j].apply(b[j],l)});return k!==f?k:this}if("object"===typeof b||!arguments.length){n=s(a.extend(d,{},b));return g.bind.call(this,n,m)}},g.bind=function(b,c){return this.each(function(f){function p(b){function c(){o.render(typeof b==="object"||i.show.ready),k.show.unbind(l.show),k.hide.unbind(l.hide)}if(o.cache.disabled)return e;o.cache.event=a.extend({},b),i.show.delay>0?(clearTimeout(o.timers.show),o.timers.show=setTimeout(c,i.show.delay),l.show!==l.hide&&k.hide.bind(l.hide,function(){clearTimeout(o.timers.show)})):c()}var i,k,l,m=!b.id||b.id===e||b.id.length<1||a("#"+j+"-"+b.id).length?g.nextid++:b.id,n=".qtip-"+m+"-create",o=u.call(this,m,b);if(o===e)return d;i=o.options,a.each(h,function(){this.initialize==="initialize"&&this(o)}),k={show:i.show.target,hide:i.hide.target},l={show:String(i.show.event).replace(" ",n+" ")+n,hide:String(i.hide.event).replace(" ",n+" ")+n},k.show.bind(l.show,p),(i.show.ready||i.prerender)&&p(c)})},h=g.plugins={Corner:function(a){a=String(a).replace(/([A-Z])/," $1").replace(/middle/gi,"center").toLowerCase(),this.x=(a.match(/left|right/i)||a.match(/center/)||["inherit"])[0].toLowerCase(),this.y=(a.match(/top|bottom|center/i)||["inherit"])[0].toLowerCase(),this.precedance=a.charAt(0).search(/^(t|b)/)>-1?"y":"x",this.string=function(){return this.precedance==="y"?this.y+this.x:this.x+this.y},this.abbreviation=function(){var a=this.x.substr(0,1),b=this.y.substr(0,1);return a===b?a:a==="c"||a!=="c"&&b!=="c"?b+a:a+b}},offset:function(c,d){function k(a,b){e.left+=b*a.scrollLeft(),e.top+=b*a.scrollTop()}var e=c.offset(),f=d,g=0,i=document.body,j;if(f){do{if(f[0]===i)break;f.css("position")!=="static"&&(j=f.position(),e.left-=j.left+(parseInt(f.css("borderLeftWidth"),10)||0),e.top-=j.top+(parseInt(f.css("borderTopWidth"),10)||0),g++)}while(f=f.offsetParent());(d[0]!==i||g>1)&&k(d,1),h.iOS&&k(a(b),-1)}return e},iOS:parseFloat((/CPU.+OS ([0-9_]{3}).*AppleWebkit.*Mobile/i.exec(navigator.userAgent)||[0,"4_2"])[1].replace("_","."))<4.1,fn:{attr:function(b,c){if(this.length){var d=this[0],e="title",f=a.data(d,"qtip");if(b===e){if(arguments.length<2)return a.data(d,q);if(typeof f==="object"){f&&f.rendered&&f.options.content.attr===e&&f.cache.attr&&f.set("content.text",c),a.fn["attr"+p].apply(this,arguments),a.data(d,q,a.attr(d,e));return this.removeAttr("title")}}}},clone:function(b){var c=a([]),d;a("*",this).add(this).each(function(){var b=a.data(this,q);b&&(a.attr(this,"title",b),c=c.add(this))}),d=a.fn["clone"+p].apply(this,arguments),c.removeAttr("title");return d},remove:a.ui?f:function(b,c){a(this).each(function(){c||(!b||a.filter(b,[this]).length)&&a("*",this).add(this).each(function(){a(this).triggerHandler("remove")})})}}},a.each(h.fn,function(b,c){if(!c)return d;var e=a.fn[b+p]=a.fn[b];a.fn[b]=function(){return c.apply(this,arguments)||e.apply(this,arguments)}}),a(b).bind("load.qtip",function(){var b="mousemove";a(document).bind(b+".qtip",function(a){i={pageX:a.pageX,pageY:a.pageY,type:b}})}),g.version="2.0.0pre",g.nextid=0,g.inactiveEvents="click dblclick mousedown mouseup mousemove mouseleave mouseenter".split(" "),g.zindex=15e3,g.defaults={prerender:e,id:e,overwrite:d,content:{text:d,attr:"title",title:{text:e,button:e}},position:{my:"top left",at:"bottom right",target:e,container:e,viewport:e,adjust:{x:0,y:0,mouse:d,resize:d},effect:d},show:{target:e,event:"mouseenter",effect:d,delay:90,solo:e,ready:e},hide:{target:e,event:"mouseleave",effect:d,delay:0,fixed:e,inactive:e},style:{classes:"",widget:e},events:{render:f,move:f,show:f,hide:f,toggle:f,focus:f,blur:f}},h.ajax=function(a){var b=a.plugins.ajax;return"object"===typeof b?b:a.plugins.ajax=new v(a)},h.ajax.initialize="render",h.ajax.sanitize=function(a){var b=a.content,c;b&&"ajax"in b&&(c=b.ajax,typeof c!=="object"&&(c=a.content.ajax={url:c}),"boolean"!==typeof c.once&&c.once&&(c.once=!!c.once))},a.extend(d,g.defaults,{content:{ajax:{once:d}}}),h.tip=function(a){var b=a.plugins.tip;return"object"===typeof b?b:a.plugins.tip=new x(a)},h.tip.initialize="render",h.tip.sanitize=function(a){var b=a.style,c;b&&"tip"in b&&(c=a.style.tip,typeof c!=="object"&&(a.style.tip={corner:c}),/string|boolean/i.test(typeof c.corner)||(c.corner=d),typeof c.width!=="number"&&delete c.width,typeof c.height!=="number"&&delete c.height,typeof c.border!=="number"&&c.border!==d&&delete c.border,typeof c.offset!=="number"&&delete c.offset)},a.extend(d,g.defaults,{style:{tip:{corner:d,mimic:e,width:6,height:6,border:d,offset:0}}}),h.imagemap=function(b,c){function l(a,b){var d=0,e=1,f=1,g=0,h=0,i=a.width,j=a.height;while(i>0&&j>0&&e>0&&f>0){i=Math.floor(i/2),j=Math.floor(j/2),c.x==="left"?e=i:c.x==="right"?e=a.width-i:e+=Math.floor(i/2),c.y==="top"?f=j:c.y==="bottom"?f=a.height-j:f+=Math.floor(j/2),d=b.length;while(d--){if(b.length<2)break;g=b[d][0]-a.offset.left,h=b[d][1]-a.offset.top,(c.x==="left"&&g>=e||c.x==="right"&&g<=e||c.x==="center"&&(g<e||g>a.width-e)||c.y==="top"&&h>=f||c.y==="bottom"&&h<=f||c.y==="center"&&(h<f||h>a.height-f))&&b.splice(d,1)}}return{left:b[0][0],top:b[0][1]}}var d=b.attr("shape").toLowerCase(),e=b.attr("coords").split(","),f=[],g=a('img[usemap="#'+b.parent("map").attr("name")+'"]'),h=g.offset(),i={width:0,height:0,offset:{top:1e10,right:0,bottom:0,left:1e10}},j=0,k=0;h.left+=Math.ceil((g.outerWidth()-g.width())/2),h.top+=Math.ceil((g.outerHeight()-g.height())/2);if(d==="poly"){j=e.length;while(j--)k=[parseInt(e[--j],10),parseInt(e[j+1],10)],k[0]>i.offset.right&&(i.offset.right=k[0]),k[0]<i.offset.left&&(i.offset.left=k[0]),k[1]>i.offset.bottom&&(i.offset.bottom=k[1]),k[1]<i.offset.top&&(i.offset.top=k[1]),f.push(k)}else f=a.map(e,function(a){return parseInt(a,10)});switch(d){case"rect":i={width:Math.abs(f[2]-f[0]),height:Math.abs(f[3]-f[1]),offset:{left:f[0],top:f[1]}};break;case"circle":i={width:f[2]+2,height:f[2]+2,offset:{left:f[0],top:f[1]}};break;case"poly":a.extend(i,{width:Math.abs(i.offset.right-i.offset.left),height:Math.abs(i.offset.bottom-i.offset.top)}),c.string()==="centercenter"?i.offset={left:i.offset.left+i.width/2,top:i.offset.top+i.height/2}:i.offset=l(i,f.slice()),i.width=i.height=0}i.offset.left+=h.left,i.offset.top+=h.top;return i},h.svg=function(b,c){var d=a(document),e=b[0],f={width:0,height:0,offset:{top:1e10,left:1e10}},g,h,i,j,k;if(e.getBBox&&e.parentNode){g=e.getBBox(),h=e.getScreenCTM(),i=e.farthestViewportElement||e;if(!i.createSVGPoint)return f;j=i.createSVGPoint(),j.x=g.x,j.y=g.y,k=j.matrixTransform(h),f.offset.left=k.x,f.offset.top=k.y,j.x+=g.width,j.y+=g.height,k=j.matrixTransform(h),f.width=k.x-f.offset.left,f.height=k.y-f.offset.top,f.offset.left+=d.scrollLeft(),f.offset.top+=d.scrollTop()}return f},h.modal=function(a){var b=a.plugins.modal;return"object"===typeof b?b:a.plugins.modal=new y(a)},h.modal.initialize="render",h.modal.sanitize=function(a){a.show&&(typeof a.show.modal!=="object"?a.show.modal={on:!!a.show.modal}:typeof a.show.modal.on==="undefined"&&(a.show.modal.on=d))},a.extend(d,g.defaults,{show:{modal:{on:e,effect:d,blur:d}}}),h.bgiframe=function(b){var c=a.browser,d=b.plugins.bgiframe;if(!h.bgiframe.needBGI||(!c.msie||c.version.charAt(0)!=="6"))return e;return"object"===typeof d?d:b.plugins.bgiframe=new z(b)},h.bgiframe.initialize="render",h.bgiframe.needBGI=a("select, object").length>0}(jQuery,window);
/*!
 * jQuery UI AriaTabs (31.01.11)
 * http://github.com/fnagel/jQuery-Accessible-RIA
 *
 * Copyright (c) 2009 Felix Nagel for Namics (Deustchland) GmbH
 * Copyright (c) 2010 Felix Nagel
 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 *
 * Depends: ui.core.js 1.8.x
 *   		ui.tabs.js
 */
(function($) {
	$.fn.extend($.ui.tabs.prototype,{

		// when widget is initiated
		_create: function() {
			var self = this, options = this.options;
			// add jQuery address default options
			if ($.address) {
				var jqAddressDefOpt = {
					enable: true,
					title: {
						enable: true,
						split: ' | '
					}
				};
				if (!$.isEmptyObject(options.jqAddress)) $.extend(true, jqAddressDefOpt, options.jqAddress );
				else options.jqAddress = {};
				$.extend(true, options.jqAddress, jqAddressDefOpt);
			}

			// add jQuery Address stuff
			if ($.address && options.jqAddress.enable) var anchorId = "#" + $.address.value().replace("/", '');

			// fire original function
			self._tabify(true);

			// accessibility: needed to prevent blur() when enter key is pushed to enable forms mode in screenreader
			// needs to be fixed in tabs widget in line 333
			this.anchors.bind(options.event + '.tabs-accessibility', function() { this.focus(); });


			// ARIA
			// self.element.attr("role", "application");
			self.list.attr("role", "tablist");
			for (x = 0; x < self.anchors.length; x++) {
				// add jQuery Address stuff | get proper tab by anchor
				if ($.address && options.jqAddress.enable && anchorId != "#" && $(self.anchors[x]).attr("href") == anchorId) self.select(x);
				// init aria atrributes for each panel and anchor
				self._ariaInit(x);
			}

			// keyboard
			self.list.keydown( function(event){
				var ret = false;
				switch (event.keyCode) {
					case $.ui.keyCode.RIGHT:
						self.select(options.selected+1);
						break;
					case $.ui.keyCode.DOWN:
						self.select(options.selected+1);
						// FIXME issues with NVDA: down key is needed for reading content
						// return false;
						ret = true;
						break;
					case $.ui.keyCode.UP:
						self.select(options.selected-1);
						break;
					case $.ui.keyCode.LEFT:
						self.select(options.selected-1);
						break;
					case $.ui.keyCode.END:
						self.select(self.anchors.length-1);
						break;
					case $.ui.keyCode.HOME:
						self.select(0);
						break;
				}
				return ret;
			});

			// add jQuery address stuff
			if ($.address && this.options.jqAddress.enable) {
				$.address.externalChange(function(event) {
					// Select the proper tab
					var anchorId = "#" + event.value.replace("/", '');
					var x = 0;
					while (x < self.anchors.length) {
						if ($(self.anchors[x]).attr("href") == anchorId) {
							self.select(x);
							return;
						}
						x++;
					}
				});
			}
			self.initiated = true;
		},

		_original_load: $.ui.tabs.prototype.load,
		// called whenever a tab is selected but if option collapsible is set | fired once at init for the chosen tab
		load: function(index) {

			// add jQuery Address stuff
			// workaround: only set values when user interacts aka not on init
			// ToDO use this.initiated to check for init
			if ($.address && this.options.jqAddress.enable) {
				if ($(this.anchors[0]).attr("aria-selected") !== undefined) {
					if (this.options.forceFirst === 0 && index !== 0) {
						// if there is no anchor to keep, prevent double entry
						if ($.address.value() == "") $.address.history(false);
						$.address.value($(this.anchors[0]).attr("href").replace(/^#/, ''));
						$.address.history(true);
						this.options.forceFirst = false;
					}
					if (this.options.jqAddress.title.enable) $.address.title($.address.title().split(this.options.jqAddress.title.split)[0] + this.options.jqAddress.title.split + $(this.anchors[index]).text());
					$.address.value($(this.anchors[index]).attr("href").replace(/^#/, ''));
				} else {
					this.options.forceFirst = index;
				}
			}

			// hide all unselected
			for (x = 0; x < this.anchors.length; x++) {
				// anchors
				this._ariaSet(x, false);
				// remove ARIA live settings
				if ($.data(this.anchors[x], 'href.tabs')) {
					$(this.panels[x])
						.removeAttr("aria-live")
						.removeAttr("aria-busy");
				}
			}
			// is remote? set ARIA states
			if ($.data(this.anchors[index], 'href.tabs')) {
				$(this.panels[index])
					.attr("aria-live", "polite")
					.attr("aria-busy", "true");
			}
			// fire original function
			this._original_load(index);

			// is remote? end ARIA busy
			if ($.data(this.anchors[index], 'href.tabs')) {
				$(this.panels[index])
					.attr("aria-busy", "false");
					// TODO jQuery Address: title is wrong when using Ajax Tab
			}
			// set state for the activated tab
			this._ariaSet(index, true);
		},

		// sets aria states for single tab and its panel
		_ariaSet: function(index, state) {
			var tabindex = (state) ? 0 : -1;
			var anchor = $(this.anchors[index]);
			// set ARIA state for loaded tab
			anchor.attr("tabindex", tabindex)
				.attr("aria-selected", state);
			// set focus and remove focus CSS class
			if (state) {
				if (!$.browser.msie && this.initiated) anchor.focus();
			} else {
				// needed to remove CSS class set by original widget
				anchor.closest("li").removeClass("ui-state-focus");
			}
			// set ARIA state for loaded tab
			$(this.panels[index])
				.attr("aria-hidden", !state)
				.attr("aria-expanded", state);
			// accessibility: needed to prevent blur() because IE loses focus when using keyboard control
			// this needs rto be fixed in jQuery UI Tabs in line 402
			if ($.browser.msie && this.initiated) this.options.timeout = window.setTimeout(function() { anchor.focus(); }, 100);
			// update virtual Buffer
			if (state) this._updateVirtualBuffer();
		},

		// sets all attributes when plugin is called or if tab is added
		_ariaInit: function(index) {
			var self = this;
			// get widget generated ID of the panel
			var panelId = $(this.panels[index]).attr("id");
			// ARIA anchors and li's
			$(this.anchors[index])
				.attr("aria-controls", panelId)
				.attr("id", panelId+"-tab")
			// set role to the li not the a because of NVDA tabindex issue
			.parent().attr("role", "tab");
			// ARIA panels aka content wrapper
			$(this.panels[index])
				.attr("role", "tabpanel")
				// add tabpanel to the tabindex
				.attr("tabindex", 0)
				.attr("aria-labelledby", panelId+"-tab");
			// if collapsible, set event to toggle ARIA state
			if (this.options.collapsible) {
				$(this.anchors[index]).bind(this.options.event, function(event) {
					// get class to negate it to set states correctly when panel is collapsed
					self._ariaSet(index, !$(self.panels[index]).hasClass("ui-tabs-hide"));
				});
			}
		},

		_original_add: $.ui.tabs.prototype.add,
		// called when a tab is added
		add: function(url, label, index) {
			// fire original function
			this._original_add(url, label, index);
			// ARIA
			this.element
				.attr("aria-live", "polite")
				.attr("aria-relevant","additions");

			// if no index is defined tab should be added at the end of the tab list
			if (index) {
				this._ariaInit(index);
				this._ariaSet(index, false);
			} else {
				this._ariaInit(this.anchors.length-1);
				this._ariaSet(this.anchors.length-1, false);
			}
		},

		_original_remove: $.ui.tabs.prototype.remove,
		// called when a tab is removed
		remove: function(index) {
			// fire original function
			this._original_remove(index);
			// ARIA
			this.element
				.attr("aria-live", "polite")
				.attr("aria-relevant","removals");
		},

		_original_destroy: $.ui.tabs.prototype.destroy,
		// removes all the setted attributes
		destroy: function() {
			var self = this, options = this.options;
			// remove ARIA attribute
			// wrapper element
			self.element
				.removeAttr("role")
				.removeAttr("aria-live")
				.removeAttr("aria-relevant");
			// ul element
			self.list.removeAttr("role");
			for (x = 0; x < self.anchors.length; x++) {
				// tabs
				$(self.anchors[x])
					.removeAttr("aria-selected")
					.removeAttr("aria-controls")
					.removeAttr("role")
					.removeAttr("id")
					.removeAttr("tabindex")
				// remove presentation role of the li element
				.parent().removeAttr("role");
				// tab panels
				$(self.panels[x])
					.removeAttr("aria-hidden")
					.removeAttr("aria-expanded")
					.removeAttr("aria-labelledby")
					.removeAttr("aria-live")
					.removeAttr("aria-busy")
					.removeAttr("aria-relevant")
					.removeAttr("role");
			}
			// remove virtual buffer form
			$("body>form #virtualBufferForm").parent().remove();
			// fire original function
			this._original_destroy();
		},

		// updates virtual buffer | for older screenreader
		_updateVirtualBuffer: function() {
			var form = $("body>form #virtualBufferForm");
			if(form.length) {
				if (form.val() == "1") form.val("0"); else  form.val("1");
				if (form.hasClass("ui-accessibility-odd")) form.addClass("ui-accessibility-even").removeClass("ui-accessibility-odd");
				else form.addClass("ui-accessibility-odd").removeClass("ui-accessibility-even");
			} else {
				$("body").append('<form><input id="virtualBufferForm" type="hidden" value="1" /></form>');
			}
		}
	});
})(jQuery);
/*!
 * Modernizr v2.0.6
 * http://www.modernizr.com
 *
 * Copyright (c) 2009-2011 Faruk Ates, Paul Irish, Alex Sexton
 * Dual-licensed under the BSD or MIT licenses: www.modernizr.com/license/
 */

/*
 * Modernizr tests which native CSS3 and HTML5 features are available in
 * the current UA and makes the results available to you in two ways:
 * as properties on a global Modernizr object, and as classes on the
 * <html> element. This information allows you to progressively enhance
 * your pages with a granular level of control over the experience.
 *
 * Modernizr has an optional (not included) conditional resource loader
 * called Modernizr.load(), based on Yepnope.js (yepnopejs.com).
 * To get a build that includes Modernizr.load(), as well as choosing
 * which tests to include, go to www.modernizr.com/download/
 *
 * Authors        Faruk Ates, Paul Irish, Alex Sexton, 
 * Contributors   Ryan Seddon, Ben Alman
 */

window.Modernizr = (function( window, document, undefined ) {

    var version = '2.0.6',

    Modernizr = {},
    
    // option for enabling the HTML classes to be added
    enableClasses = true,

    docElement = document.documentElement,
    docHead = document.head || document.getElementsByTagName('head')[0],

    /**
     * Create our "modernizr" element that we do most feature tests on.
     */
    mod = 'modernizr',
    modElem = document.createElement(mod),
    mStyle = modElem.style,

    /**
     * Create the input element for various Web Forms feature tests.
     */
    inputElem = document.createElement('input'),

    smile = ':)',

    toString = Object.prototype.toString,

    // List of property values to set for css tests. See ticket #21
    prefixes = ' -webkit- -moz- -o- -ms- -khtml- '.split(' '),

    // Following spec is to expose vendor-specific style properties as:
    //   elem.style.WebkitBorderRadius
    // and the following would be incorrect:
    //   elem.style.webkitBorderRadius

    // Webkit ghosts their properties in lowercase but Opera & Moz do not.
    // Microsoft foregoes prefixes entirely <= IE8, but appears to
    //   use a lowercase `ms` instead of the correct `Ms` in IE9

    // More here: http://github.com/Modernizr/Modernizr/issues/issue/21
    domPrefixes = 'Webkit Moz O ms Khtml'.split(' '),

    ns = {'svg': 'http://www.w3.org/2000/svg'},

    tests = {},
    inputs = {},
    attrs = {},

    classes = [],

    featureName, // used in testing loop


    // Inject element with style element and some CSS rules
    injectElementWithStyles = function( rule, callback, nodes, testnames ) {

      var style, ret, node,
          div = document.createElement('div');

      if ( parseInt(nodes, 10) ) {
          // In order not to give false positives we create a node for each test
          // This also allows the method to scale for unspecified uses
          while ( nodes-- ) {
              node = document.createElement('div');
              node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
              div.appendChild(node);
          }
      }

      // <style> elements in IE6-9 are considered 'NoScope' elements and therefore will be removed
      // when injected with innerHTML. To get around this you need to prepend the 'NoScope' element
      // with a 'scoped' element, in our case the soft-hyphen entity as it won't mess with our measurements.
      // http://msdn.microsoft.com/en-us/library/ms533897%28VS.85%29.aspx
      style = ['&shy;', '<style>', rule, '</style>'].join('');
      div.id = mod;
      div.innerHTML += style;
      docElement.appendChild(div);

      ret = callback(div, rule);
      div.parentNode.removeChild(div);

      return !!ret;

    },


    // adapted from matchMedia polyfill
    // by Scott Jehl and Paul Irish
    // gist.github.com/786768
    testMediaQuery = function( mq ) {

      if ( window.matchMedia ) {
        return matchMedia(mq).matches;
      }

      var bool;

      injectElementWithStyles('@media ' + mq + ' { #' + mod + ' { position: absolute; } }', function( node ) {
        bool = (window.getComputedStyle ?
                  getComputedStyle(node, null) :
                  node.currentStyle)['position'] == 'absolute';
      });

      return bool;

     },


    /**
      * isEventSupported determines if a given element supports the given event
      * function from http://yura.thinkweb2.com/isEventSupported/
      */
    isEventSupported = (function() {

      var TAGNAMES = {
        'select': 'input', 'change': 'input',
        'submit': 'form', 'reset': 'form',
        'error': 'img', 'load': 'img', 'abort': 'img'
      };

      function isEventSupported( eventName, element ) {

        element = element || document.createElement(TAGNAMES[eventName] || 'div');
        eventName = 'on' + eventName;

        // When using `setAttribute`, IE skips "unload", WebKit skips "unload" and "resize", whereas `in` "catches" those
        var isSupported = eventName in element;

        if ( !isSupported ) {
          // If it has no `setAttribute` (i.e. doesn't implement Node interface), try generic element
          if ( !element.setAttribute ) {
            element = document.createElement('div');
          }
          if ( element.setAttribute && element.removeAttribute ) {
            element.setAttribute(eventName, '');
            isSupported = is(element[eventName], 'function');

            // If property was created, "remove it" (by setting value to `undefined`)
            if ( !is(element[eventName], undefined) ) {
              element[eventName] = undefined;
            }
            element.removeAttribute(eventName);
          }
        }

        element = null;
        return isSupported;
      }
      return isEventSupported;
    })();

    // hasOwnProperty shim by kangax needed for Safari 2.0 support
    var _hasOwnProperty = ({}).hasOwnProperty, hasOwnProperty;
    if ( !is(_hasOwnProperty, undefined) && !is(_hasOwnProperty.call, undefined) ) {
      hasOwnProperty = function (object, property) {
        return _hasOwnProperty.call(object, property);
      };
    }
    else {
      hasOwnProperty = function (object, property) { /* yes, this can give false positives/negatives, but most of the time we don't care about those */
        return ((property in object) && is(object.constructor.prototype[property], undefined));
      };
    }

    /**
     * setCss applies given styles to the Modernizr DOM node.
     */
    function setCss( str ) {
        mStyle.cssText = str;
    }

    /**
     * setCssAll extrapolates all vendor-specific css strings.
     */
    function setCssAll( str1, str2 ) {
        return setCss(prefixes.join(str1 + ';') + ( str2 || '' ));
    }

    /**
     * is returns a boolean for if typeof obj is exactly type.
     */
    function is( obj, type ) {
        return typeof obj === type;
    }

    /**
     * contains returns a boolean for if substr is found within str.
     */
    function contains( str, substr ) {
        return !!~('' + str).indexOf(substr);
    }

    /**
     * testProps is a generic CSS / DOM property test; if a browser supports
     *   a certain property, it won't return undefined for it.
     *   A supported CSS property returns empty string when its not yet set.
     */
    function testProps( props, prefixed ) {
        for ( var i in props ) {
            if ( mStyle[ props[i] ] !== undefined ) {
                return prefixed == 'pfx' ? props[i] : true;
            }
        }
        return false;
    }

    /**
     * testPropsAll tests a list of DOM properties we want to check against.
     *   We specify literally ALL possible (known and/or likely) properties on
     *   the element including the non-vendor prefixed one, for forward-
     *   compatibility.
     */
    function testPropsAll( prop, prefixed ) {

        var ucProp  = prop.charAt(0).toUpperCase() + prop.substr(1),
            props   = (prop + ' ' + domPrefixes.join(ucProp + ' ') + ucProp).split(' ');

        return testProps(props, prefixed);
    }

    /**
     * testBundle tests a list of CSS features that require element and style injection.
     *   By bundling them together we can reduce the need to touch the DOM multiple times.
     */
    /*>>testBundle*/
    var testBundle = (function( styles, tests ) {
        var style = styles.join(''),
            len = tests.length;

        injectElementWithStyles(style, function( node, rule ) {
            var style = document.styleSheets[document.styleSheets.length - 1],
                // IE8 will bork if you create a custom build that excludes both fontface and generatedcontent tests.
                // So we check for cssRules and that there is a rule available
                // More here: https://github.com/Modernizr/Modernizr/issues/288 & https://github.com/Modernizr/Modernizr/issues/293
                cssText = style.cssRules && style.cssRules[0] ? style.cssRules[0].cssText : style.cssText || "",
                children = node.childNodes, hash = {};

            while ( len-- ) {
                hash[children[len].id] = children[len];
            }

            /*>>touch*/           Modernizr['touch'] = ('ontouchstart' in window) || hash['touch'].offsetTop === 9; /*>>touch*/
            /*>>csstransforms3d*/ Modernizr['csstransforms3d'] = hash['csstransforms3d'].offsetLeft === 9;          /*>>csstransforms3d*/
            /*>>generatedcontent*/Modernizr['generatedcontent'] = hash['generatedcontent'].offsetHeight >= 1;       /*>>generatedcontent*/
            /*>>fontface*/        Modernizr['fontface'] = /src/i.test(cssText) &&
                                                                  cssText.indexOf(rule.split(' ')[0]) === 0;        /*>>fontface*/
        }, len, tests);

    })([
        // Pass in styles to be injected into document
        /*>>fontface*/        '@font-face {font-family:"font";src:url("https://")}'         /*>>fontface*/
        
        /*>>touch*/           ,['@media (',prefixes.join('touch-enabled),('),mod,')',
                                '{#touch{top:9px;position:absolute}}'].join('')           /*>>touch*/
                                
        /*>>csstransforms3d*/ ,['@media (',prefixes.join('transform-3d),('),mod,')',
                                '{#csstransforms3d{left:9px;position:absolute}}'].join('')/*>>csstransforms3d*/
                                
        /*>>generatedcontent*/,['#generatedcontent:after{content:"',smile,'";visibility:hidden}'].join('')  /*>>generatedcontent*/
    ],
      [
        /*>>fontface*/        'fontface'          /*>>fontface*/
        /*>>touch*/           ,'touch'            /*>>touch*/
        /*>>csstransforms3d*/ ,'csstransforms3d'  /*>>csstransforms3d*/
        /*>>generatedcontent*/,'generatedcontent' /*>>generatedcontent*/
        
    ]);/*>>testBundle*/


    /**
     * Tests
     * -----
     */

    tests['flexbox'] = function() {
        /**
         * setPrefixedValueCSS sets the property of a specified element
         * adding vendor prefixes to the VALUE of the property.
         * @param {Element} element
         * @param {string} property The property name. This will not be prefixed.
         * @param {string} value The value of the property. This WILL be prefixed.
         * @param {string=} extra Additional CSS to append unmodified to the end of
         * the CSS string.
         */
        function setPrefixedValueCSS( element, property, value, extra ) {
            property += ':';
            element.style.cssText = (property + prefixes.join(value + ';' + property)).slice(0, -property.length) + (extra || '');
        }

        /**
         * setPrefixedPropertyCSS sets the property of a specified element
         * adding vendor prefixes to the NAME of the property.
         * @param {Element} element
         * @param {string} property The property name. This WILL be prefixed.
         * @param {string} value The value of the property. This will not be prefixed.
         * @param {string=} extra Additional CSS to append unmodified to the end of
         * the CSS string.
         */
        function setPrefixedPropertyCSS( element, property, value, extra ) {
            element.style.cssText = prefixes.join(property + ':' + value + ';') + (extra || '');
        }

        var c = document.createElement('div'),
            elem = document.createElement('div');

        setPrefixedValueCSS(c, 'display', 'box', 'width:42px;padding:0;');
        setPrefixedPropertyCSS(elem, 'box-flex', '1', 'width:10px;');

        c.appendChild(elem);
        docElement.appendChild(c);

        var ret = elem.offsetWidth === 42;

        c.removeChild(elem);
        docElement.removeChild(c);

        return ret;
    };

    // On the S60 and BB Storm, getContext exists, but always returns undefined
    // http://github.com/Modernizr/Modernizr/issues/issue/97/

    tests['canvas'] = function() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    };

    tests['canvastext'] = function() {
        return !!(Modernizr['canvas'] && is(document.createElement('canvas').getContext('2d').fillText, 'function'));
    };

    // This WebGL test may false positive. 
    // But really it's quite impossible to know whether webgl will succeed until after you create the context. 
    // You might have hardware that can support a 100x100 webgl canvas, but will not support a 1000x1000 webgl 
    // canvas. So this feature inference is weak, but intentionally so.
    
    // It is known to false positive in FF4 with certain hardware and the iPad 2.
    
    tests['webgl'] = function() {
        return !!window.WebGLRenderingContext;
    };

    /*
     * The Modernizr.touch test only indicates if the browser supports
     *    touch events, which does not necessarily reflect a touchscreen
     *    device, as evidenced by tablets running Windows 7 or, alas,
     *    the Palm Pre / WebOS (touch) phones.
     *
     * Additionally, Chrome (desktop) used to lie about its support on this,
     *    but that has since been rectified: http://crbug.com/36415
     *
     * We also test for Firefox 4 Multitouch Support.
     *
     * For more info, see: http://modernizr.github.com/Modernizr/touch.html
     */

    tests['touch'] = function() {
        return Modernizr['touch'];
    };

    /**
     * geolocation tests for the new Geolocation API specification.
     *   This test is a standards compliant-only test; for more complete
     *   testing, including a Google Gears fallback, please see:
     *   http://code.google.com/p/geo-location-javascript/
     * or view a fallback solution using google's geo API:
     *   http://gist.github.com/366184
     */
    tests['geolocation'] = function() {
        return !!navigator.geolocation;
    };

    // Per 1.6:
    // This used to be Modernizr.crosswindowmessaging but the longer
    // name has been deprecated in favor of a shorter and property-matching one.
    // The old API is still available in 1.6, but as of 2.0 will throw a warning,
    // and in the first release thereafter disappear entirely.
    tests['postmessage'] = function() {
      return !!window.postMessage;
    };

    // Web SQL database detection is tricky:

    // In chrome incognito mode, openDatabase is truthy, but using it will
    //   throw an exception: http://crbug.com/42380
    // We can create a dummy database, but there is no way to delete it afterwards.

    // Meanwhile, Safari users can get prompted on any database creation.
    //   If they do, any page with Modernizr will give them a prompt:
    //   http://github.com/Modernizr/Modernizr/issues/closed#issue/113

    // We have chosen to allow the Chrome incognito false positive, so that Modernizr
    //   doesn't litter the web with these test databases. As a developer, you'll have
    //   to account for this gotcha yourself.
    tests['websqldatabase'] = function() {
      var result = !!window.openDatabase;
      /*  if (result){
            try {
              result = !!openDatabase( mod + "testdb", "1.0", mod + "testdb", 2e4);
            } catch(e) {
            }
          }  */
      return result;
    };

    // Vendors had inconsistent prefixing with the experimental Indexed DB:
    // - Webkit's implementation is accessible through webkitIndexedDB
    // - Firefox shipped moz_indexedDB before FF4b9, but since then has been mozIndexedDB
    // For speed, we don't test the legacy (and beta-only) indexedDB
    tests['indexedDB'] = function() {
      for ( var i = -1, len = domPrefixes.length; ++i < len; ){
        if ( window[domPrefixes[i].toLowerCase() + 'IndexedDB'] ){
          return true;
        }
      }
      return !!window.indexedDB;
    };

    // documentMode logic from YUI to filter out IE8 Compat Mode
    //   which false positives.
    tests['hashchange'] = function() {
      return isEventSupported('hashchange', window) && (document.documentMode === undefined || document.documentMode > 7);
    };

    // Per 1.6:
    // This used to be Modernizr.historymanagement but the longer
    // name has been deprecated in favor of a shorter and property-matching one.
    // The old API is still available in 1.6, but as of 2.0 will throw a warning,
    // and in the first release thereafter disappear entirely.
    tests['history'] = function() {
      return !!(window.history && history.pushState);
    };

    tests['draganddrop'] = function() {
        return isEventSupported('dragstart') && isEventSupported('drop');
    };

    // Mozilla is targeting to land MozWebSocket for FF6
    // bugzil.la/659324
    tests['websockets'] = function() {
        for ( var i = -1, len = domPrefixes.length; ++i < len; ){
          if ( window[domPrefixes[i] + 'WebSocket'] ){
            return true;
          }
        }
        return 'WebSocket' in window;
    };


    // http://css-tricks.com/rgba-browser-support/
    tests['rgba'] = function() {
        // Set an rgba() color and check the returned value

        setCss('background-color:rgba(150,255,150,.5)');

        return contains(mStyle.backgroundColor, 'rgba');
    };

    tests['hsla'] = function() {
        // Same as rgba(), in fact, browsers re-map hsla() to rgba() internally,
        //   except IE9 who retains it as hsla

        setCss('background-color:hsla(120,40%,100%,.5)');

        return contains(mStyle.backgroundColor, 'rgba') || contains(mStyle.backgroundColor, 'hsla');
    };

    tests['multiplebgs'] = function() {
        // Setting multiple images AND a color on the background shorthand property
        //  and then querying the style.background property value for the number of
        //  occurrences of "url(" is a reliable method for detecting ACTUAL support for this!

        setCss('background:url(https://),url(https://),red url(https://)');

        // If the UA supports multiple backgrounds, there should be three occurrences
        //   of the string "url(" in the return value for elemStyle.background

        return /(url\s*\(.*?){3}/.test(mStyle.background);
    };


    // In testing support for a given CSS property, it's legit to test:
    //    `elem.style[styleName] !== undefined`
    // If the property is supported it will return an empty string,
    // if unsupported it will return undefined.

    // We'll take advantage of this quick test and skip setting a style
    // on our modernizr element, but instead just testing undefined vs
    // empty string.


    tests['backgroundsize'] = function() {
        return testPropsAll('backgroundSize');
    };

    tests['borderimage'] = function() {
        return testPropsAll('borderImage');
    };


    // Super comprehensive table about all the unique implementations of
    // border-radius: http://muddledramblings.com/table-of-css3-border-radius-compliance

    tests['borderradius'] = function() {
        return testPropsAll('borderRadius');
    };

    // WebOS unfortunately false positives on this test.
    tests['boxshadow'] = function() {
        return testPropsAll('boxShadow');
    };

    // FF3.0 will false positive on this test
    tests['textshadow'] = function() {
        return document.createElement('div').style.textShadow === '';
    };


    tests['opacity'] = function() {
        // Browsers that actually have CSS Opacity implemented have done so
        //  according to spec, which means their return values are within the
        //  range of [0.0,1.0] - including the leading zero.

        setCssAll('opacity:.55');

        // The non-literal . in this regex is intentional:
        //   German Chrome returns this value as 0,55
        // https://github.com/Modernizr/Modernizr/issues/#issue/59/comment/516632
        return /^0.55$/.test(mStyle.opacity);
    };


    tests['cssanimations'] = function() {
        return testPropsAll('animationName');
    };


    tests['csscolumns'] = function() {
        return testPropsAll('columnCount');
    };


    tests['cssgradients'] = function() {
        /**
         * For CSS Gradients syntax, please see:
         * http://webkit.org/blog/175/introducing-css-gradients/
         * https://developer.mozilla.org/en/CSS/-moz-linear-gradient
         * https://developer.mozilla.org/en/CSS/-moz-radial-gradient
         * http://dev.w3.org/csswg/css3-images/#gradients-
         */

        var str1 = 'background-image:',
            str2 = 'gradient(linear,left top,right bottom,from(#9f9),to(white));',
            str3 = 'linear-gradient(left top,#9f9, white);';

        setCss(
            (str1 + prefixes.join(str2 + str1) + prefixes.join(str3 + str1)).slice(0, -str1.length)
        );

        return contains(mStyle.backgroundImage, 'gradient');
    };


    tests['cssreflections'] = function() {
        return testPropsAll('boxReflect');
    };


    tests['csstransforms'] = function() {
        return !!testProps(['transformProperty', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform']);
    };


    tests['csstransforms3d'] = function() {

        var ret = !!testProps(['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective']);

        // Webkitâ€™s 3D transforms are passed off to the browser's own graphics renderer.
        //   It works fine in Safari on Leopard and Snow Leopard, but not in Chrome in
        //   some conditions. As a result, Webkit typically recognizes the syntax but
        //   will sometimes throw a false positive, thus we must do a more thorough check:
        if ( ret && 'webkitPerspective' in docElement.style ) {

          // Webkit allows this media query to succeed only if the feature is enabled.
          // `@media (transform-3d),(-o-transform-3d),(-moz-transform-3d),(-ms-transform-3d),(-webkit-transform-3d),(modernizr){ ... }`
          ret = Modernizr['csstransforms3d'];
        }
        return ret;
    };


    tests['csstransitions'] = function() {
        return testPropsAll('transitionProperty');
    };


    /*>>fontface*/
    // @font-face detection routine by Diego Perini
    // http://javascript.nwbox.com/CSSSupport/
    tests['fontface'] = function() {
        return Modernizr['fontface'];
    };
    /*>>fontface*/

    // CSS generated content detection
    tests['generatedcontent'] = function() {
        return Modernizr['generatedcontent'];
    };



    // These tests evaluate support of the video/audio elements, as well as
    // testing what types of content they support.
    //
    // We're using the Boolean constructor here, so that we can extend the value
    // e.g.  Modernizr.video     // true
    //       Modernizr.video.ogg // 'probably'
    //
    // Codec values from : http://github.com/NielsLeenheer/html5test/blob/9106a8/index.html#L845
    //                     thx to NielsLeenheer and zcorpan

    // Note: in FF 3.5.1 and 3.5.0, "no" was a return value instead of empty string.
    //   Modernizr does not normalize for that.

    tests['video'] = function() {
        var elem = document.createElement('video'),
            bool = false;
            
        // IE9 Running on Windows Server SKU can cause an exception to be thrown, bug #224
        try {
            if ( bool = !!elem.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = elem.canPlayType('video/ogg; codecs="theora"');

                // Workaround required for IE9, which doesn't report video support without audio codec specified.
                //   bug 599718 @ msft connect
                var h264 = 'video/mp4; codecs="avc1.42E01E';
                bool.h264 = elem.canPlayType(h264 + '"') || elem.canPlayType(h264 + ', mp4a.40.2"');

                bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"');
            }
            
        } catch(e) { }
        
        return bool;
    };

    tests['audio'] = function() {
        var elem = document.createElement('audio'),
            bool = false;

        try { 
            if ( bool = !!elem.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = elem.canPlayType('audio/ogg; codecs="vorbis"');
                bool.mp3  = elem.canPlayType('audio/mpeg;');

                // Mimetypes accepted:
                //   https://developer.mozilla.org/En/Media_formats_supported_by_the_audio_and_video_elements
                //   http://bit.ly/iphoneoscodecs
                bool.wav  = elem.canPlayType('audio/wav; codecs="1"');
                bool.m4a  = elem.canPlayType('audio/x-m4a;') || elem.canPlayType('audio/aac;');
            }
        } catch(e) { }
        
        return bool;
    };


    // Firefox has made these tests rather unfun.

    // In FF4, if disabled, window.localStorage should === null.

    // Normally, we could not test that directly and need to do a
    //   `('localStorage' in window) && ` test first because otherwise Firefox will
    //   throw http://bugzil.la/365772 if cookies are disabled

    // However, in Firefox 4 betas, if dom.storage.enabled == false, just mentioning
    //   the property will throw an exception. http://bugzil.la/599479
    // This looks to be fixed for FF4 Final.

    // Because we are forced to try/catch this, we'll go aggressive.

    // FWIW: IE8 Compat mode supports these features completely:
    //   http://www.quirksmode.org/dom/html5.html
    // But IE8 doesn't support either with local files

    tests['localstorage'] = function() {
        try {
            return !!localStorage.getItem;
        } catch(e) {
            return false;
        }
    };

    tests['sessionstorage'] = function() {
        try {
            return !!sessionStorage.getItem;
        } catch(e){
            return false;
        }
    };


    tests['webworkers'] = function() {
        return !!window.Worker;
    };


    tests['applicationcache'] = function() {
        return !!window.applicationCache;
    };


    // Thanks to Erik Dahlstrom
    tests['svg'] = function() {
        return !!document.createElementNS && !!document.createElementNS(ns.svg, 'svg').createSVGRect;
    };

    // specifically for SVG inline in HTML, not within XHTML
    // test page: paulirish.com/demo/inline-svg
    tests['inlinesvg'] = function() {
      var div = document.createElement('div');
      div.innerHTML = '<svg/>';
      return (div.firstChild && div.firstChild.namespaceURI) == ns.svg;
    };

    // Thanks to F1lt3r and lucideer, ticket #35
    tests['smil'] = function() {
        return !!document.createElementNS && /SVG/.test(toString.call(document.createElementNS(ns.svg, 'animate')));
    };

    tests['svgclippaths'] = function() {
        // Possibly returns a false positive in Safari 3.2?
        return !!document.createElementNS && /SVG/.test(toString.call(document.createElementNS(ns.svg, 'clipPath')));
    };

    // input features and input types go directly onto the ret object, bypassing the tests loop.
    // Hold this guy to execute in a moment.
    function webforms() {
        // Run through HTML5's new input attributes to see if the UA understands any.
        // We're using f which is the <input> element created early on
        // Mike Taylr has created a comprehensive resource for testing these attributes
        //   when applied to all input types:
        //   http://miketaylr.com/code/input-type-attr.html
        // spec: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-input-element.html#input-type-attr-summary
        
        // Only input placeholder is tested while textarea's placeholder is not. 
        // Currently Safari 4 and Opera 11 have support only for the input placeholder
        // Both tests are available in feature-detects/forms-placeholder.js
        Modernizr['input'] = (function( props ) {
            for ( var i = 0, len = props.length; i < len; i++ ) {
                attrs[ props[i] ] = !!(props[i] in inputElem);
            }
            return attrs;
        })('autocomplete autofocus list placeholder max min multiple pattern required step'.split(' '));

        // Run through HTML5's new input types to see if the UA understands any.
        //   This is put behind the tests runloop because it doesn't return a
        //   true/false like all the other tests; instead, it returns an object
        //   containing each input type with its corresponding true/false value

        // Big thanks to @miketaylr for the html5 forms expertise. http://miketaylr.com/
        Modernizr['inputtypes'] = (function(props) {

            for ( var i = 0, bool, inputElemType, defaultView, len = props.length; i < len; i++ ) {

                inputElem.setAttribute('type', inputElemType = props[i]);
                bool = inputElem.type !== 'text';

                // We first check to see if the type we give it sticks..
                // If the type does, we feed it a textual value, which shouldn't be valid.
                // If the value doesn't stick, we know there's input sanitization which infers a custom UI
                if ( bool ) {

                    inputElem.value         = smile;
                    inputElem.style.cssText = 'position:absolute;visibility:hidden;';

                    if ( /^range$/.test(inputElemType) && inputElem.style.WebkitAppearance !== undefined ) {

                      docElement.appendChild(inputElem);
                      defaultView = document.defaultView;

                      // Safari 2-4 allows the smiley as a value, despite making a slider
                      bool =  defaultView.getComputedStyle &&
                              defaultView.getComputedStyle(inputElem, null).WebkitAppearance !== 'textfield' &&
                              // Mobile android web browser has false positive, so must
                              // check the height to see if the widget is actually there.
                              (inputElem.offsetHeight !== 0);

                      docElement.removeChild(inputElem);

                    } else if ( /^(search|tel)$/.test(inputElemType) ){
                      // Spec doesnt define any special parsing or detectable UI
                      //   behaviors so we pass these through as true

                      // Interestingly, opera fails the earlier test, so it doesn't
                      //  even make it here.

                    } else if ( /^(url|email)$/.test(inputElemType) ) {
                      // Real url and email support comes with prebaked validation.
                      bool = inputElem.checkValidity && inputElem.checkValidity() === false;

                    } else if ( /^color$/.test(inputElemType) ) {
                        // chuck into DOM and force reflow for Opera bug in 11.00
                        // github.com/Modernizr/Modernizr/issues#issue/159
                        docElement.appendChild(inputElem);
                        docElement.offsetWidth;
                        bool = inputElem.value != smile;
                        docElement.removeChild(inputElem);

                    } else {
                      // If the upgraded input compontent rejects the :) text, we got a winner
                      bool = inputElem.value != smile;
                    }
                }

                inputs[ props[i] ] = !!bool;
            }
            return inputs;
        })('search tel url email datetime date month week time datetime-local number range color'.split(' '));
    }


    // End of test definitions
    // -----------------------



    // Run through all tests and detect their support in the current UA.
    // todo: hypothetically we could be doing an array of tests and use a basic loop here.
    for ( var feature in tests ) {
        if ( hasOwnProperty(tests, feature) ) {
            // run the test, throw the return value into the Modernizr,
            //   then based on that boolean, define an appropriate className
            //   and push it into an array of classes we'll join later.
            featureName  = feature.toLowerCase();
            Modernizr[featureName] = tests[feature]();

            classes.push((Modernizr[featureName] ? '' : 'no-') + featureName);
        }
    }

    // input tests need to run.
    Modernizr.input || webforms();


    /**
     * addTest allows the user to define their own feature tests
     * the result will be added onto the Modernizr object,
     * as well as an appropriate className set on the html element
     *
     * @param feature - String naming the feature
     * @param test - Function returning true if feature is supported, false if not
     */
     Modernizr.addTest = function ( feature, test ) {
       if ( typeof feature == "object" ) {
         for ( var key in feature ) {
           if ( hasOwnProperty( feature, key ) ) { 
             Modernizr.addTest( key, feature[ key ] );
           }
         }
       } else {

         feature = feature.toLowerCase();

         if ( Modernizr[feature] !== undefined ) {
           // we're going to quit if you're trying to overwrite an existing test
           // if we were to allow it, we'd do this:
           //   var re = new RegExp("\\b(no-)?" + feature + "\\b");  
           //   docElement.className = docElement.className.replace( re, '' );
           // but, no rly, stuff 'em.
           return; 
         }

         test = typeof test == "boolean" ? test : !!test();

         docElement.className += ' ' + (test ? '' : 'no-') + feature;
         Modernizr[feature] = test;

       }

       return Modernizr; // allow chaining.
     };
    

    // Reset modElem.cssText to nothing to reduce memory footprint.
    setCss('');
    modElem = inputElem = null;

    //>>BEGIN IEPP
    // Enable HTML 5 elements for styling (and printing) in IE.
    if ( window.attachEvent && (function(){ var elem = document.createElement('div');
                                            elem.innerHTML = '<elem></elem>';
                                            return elem.childNodes.length !== 1; })() ) {
                                              
        // iepp v2 by @jon_neal & afarkas : github.com/aFarkas/iepp/
        (function(win, doc) {
          win.iepp = win.iepp || {};
          var iepp = win.iepp,
            elems = iepp.html5elements || 'abbr|article|aside|audio|canvas|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video',
            elemsArr = elems.split('|'),
            elemsArrLen = elemsArr.length,
            elemRegExp = new RegExp('(^|\\s)('+elems+')', 'gi'),
            tagRegExp = new RegExp('<(\/*)('+elems+')', 'gi'),
            filterReg = /^\s*[\{\}]\s*$/,
            ruleRegExp = new RegExp('(^|[^\\n]*?\\s)('+elems+')([^\\n]*)({[\\n\\w\\W]*?})', 'gi'),
            docFrag = doc.createDocumentFragment(),
            html = doc.documentElement,
            head = html.firstChild,
            bodyElem = doc.createElement('body'),
            styleElem = doc.createElement('style'),
            printMedias = /print|all/,
            body;
          function shim(doc) {
            var a = -1;
            while (++a < elemsArrLen)
              // Use createElement so IE allows HTML5-named elements in a document
              doc.createElement(elemsArr[a]);
          }

          iepp.getCSS = function(styleSheetList, mediaType) {
            if(styleSheetList+'' === undefined){return '';}
            var a = -1,
              len = styleSheetList.length,
              styleSheet,
              cssTextArr = [];
            while (++a < len) {
              styleSheet = styleSheetList[a];
              //currently no test for disabled/alternate stylesheets
              if(styleSheet.disabled){continue;}
              mediaType = styleSheet.media || mediaType;
              // Get css from all non-screen stylesheets and their imports
              if (printMedias.test(mediaType)) cssTextArr.push(iepp.getCSS(styleSheet.imports, mediaType), styleSheet.cssText);
              //reset mediaType to all with every new *not imported* stylesheet
              mediaType = 'all';
            }
            return cssTextArr.join('');
          };

          iepp.parseCSS = function(cssText) {
            var cssTextArr = [],
              rule;
            while ((rule = ruleRegExp.exec(cssText)) != null){
              // Replace all html5 element references with iepp substitute classnames
              cssTextArr.push(( (filterReg.exec(rule[1]) ? '\n' : rule[1]) +rule[2]+rule[3]).replace(elemRegExp, '$1.iepp_$2')+rule[4]);
            }
            return cssTextArr.join('\n');
          };

          iepp.writeHTML = function() {
            var a = -1;
            body = body || doc.body;
            while (++a < elemsArrLen) {
              var nodeList = doc.getElementsByTagName(elemsArr[a]),
                nodeListLen = nodeList.length,
                b = -1;
              while (++b < nodeListLen)
                if (nodeList[b].className.indexOf('iepp_') < 0)
                  // Append iepp substitute classnames to all html5 elements
                  nodeList[b].className += ' iepp_'+elemsArr[a];
            }
            docFrag.appendChild(body);
            html.appendChild(bodyElem);
            // Write iepp substitute print-safe document
            bodyElem.className = body.className;
            bodyElem.id = body.id;
            // Replace HTML5 elements with <font> which is print-safe and shouldn't conflict since it isn't part of html5
            bodyElem.innerHTML = body.innerHTML.replace(tagRegExp, '<$1font');
          };


          iepp._beforePrint = function() {
            // Write iepp custom print CSS
            styleElem.styleSheet.cssText = iepp.parseCSS(iepp.getCSS(doc.styleSheets, 'all'));
            iepp.writeHTML();
          };

          iepp.restoreHTML = function(){
            // Undo everything done in onbeforeprint
            bodyElem.innerHTML = '';
            html.removeChild(bodyElem);
            html.appendChild(body);
          };

          iepp._afterPrint = function(){
            // Undo everything done in onbeforeprint
            iepp.restoreHTML();
            styleElem.styleSheet.cssText = '';
          };



          // Shim the document and iepp fragment
          shim(doc);
          shim(docFrag);

          //
          if(iepp.disablePP){return;}

          // Add iepp custom print style element
          head.insertBefore(styleElem, head.firstChild);
          styleElem.media = 'print';
          styleElem.className = 'iepp-printshim';
          win.attachEvent(
            'onbeforeprint',
            iepp._beforePrint
          );
          win.attachEvent(
            'onafterprint',
            iepp._afterPrint
          );
        })(window, document);
    }
    //>>END IEPP

    // Assign private properties to the return object with prefix
    Modernizr._version      = version;

    // expose these for the plugin API. Look in the source for how to join() them against your input
    Modernizr._prefixes     = prefixes;
    Modernizr._domPrefixes  = domPrefixes;
    
    // Modernizr.mq tests a given media query, live against the current state of the window
    // A few important notes:
    //   * If a browser does not support media queries at all (eg. oldIE) the mq() will always return false
    //   * A max-width or orientation query will be evaluated against the current state, which may change later.
    //   * You must specify values. Eg. If you are testing support for the min-width media query use: 
    //       Modernizr.mq('(min-width:0)')
    // usage:
    // Modernizr.mq('only screen and (max-width:768)')
    Modernizr.mq            = testMediaQuery;   
    
    // Modernizr.hasEvent() detects support for a given event, with an optional element to test on
    // Modernizr.hasEvent('gesturestart', elem)
    Modernizr.hasEvent      = isEventSupported; 

    // Modernizr.testProp() investigates whether a given style property is recognized
    // Note that the property names must be provided in the camelCase variant.
    // Modernizr.testProp('pointerEvents')
    Modernizr.testProp      = function(prop){
        return testProps([prop]);
    };        

    // Modernizr.testAllProps() investigates whether a given style property,
    //   or any of its vendor-prefixed variants, is recognized
    // Note that the property names must be provided in the camelCase variant.
    // Modernizr.testAllProps('boxSizing')    
    Modernizr.testAllProps  = testPropsAll;     


    
    // Modernizr.testStyles() allows you to add custom styles to the document and test an element afterwards
    // Modernizr.testStyles('#modernizr { position:absolute }', function(elem, rule){ ... })
    Modernizr.testStyles    = injectElementWithStyles; 


    // Modernizr.prefixed() returns the prefixed or nonprefixed property name variant of your input
    // Modernizr.prefixed('boxSizing') // 'MozBoxSizing'
    
    // Properties must be passed as dom-style camelcase, rather than `box-sizing` hypentated style.
    // Return values will also be the camelCase variant, if you need to translate that to hypenated style use:
    //
    //     str.replace(/([A-Z])/g, function(str,m1){ return '-' + m1.toLowerCase(); }).replace(/^ms-/,'-ms-');
    
    // If you're trying to ascertain which transition end event to bind to, you might do something like...
    // 
    //     var transEndEventNames = {
    //       'WebkitTransition' : 'webkitTransitionEnd',
    //       'MozTransition'    : 'transitionend',
    //       'OTransition'      : 'oTransitionEnd',
    //       'msTransition'     : 'msTransitionEnd', // maybe?
    //       'transition'       : 'transitionEnd'
    //     },
    //     transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ];
    
    Modernizr.prefixed      = function(prop){
      return testPropsAll(prop, 'pfx');
    };



    // Remove "no-js" class from <html> element, if it exists:
    docElement.className = docElement.className.replace(/\bno-js\b/, '')
                            
                            // Add the new classes to the <html> element.
                            + (enableClasses ? ' js ' + classes.join(' ') : '');

    return Modernizr;

})(this, this.document);