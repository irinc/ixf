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
				var opts2 = $.extend({}, $.ui.timePicker.defaults, opts); 
				
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
