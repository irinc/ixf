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
