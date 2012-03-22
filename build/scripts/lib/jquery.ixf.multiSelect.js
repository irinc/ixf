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
