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
