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
