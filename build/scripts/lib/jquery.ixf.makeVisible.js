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
