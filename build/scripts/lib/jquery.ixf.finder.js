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
