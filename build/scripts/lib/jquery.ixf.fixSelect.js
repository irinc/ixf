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
