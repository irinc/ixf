/*!
 * fillHeight
 * @description	allows one of X siblings to take up all available space that the other siblings are not taking up.
 * @version     1.0.2  - 2010/10/08
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
		version: "1.0.2"
	});
})(jQuery);
