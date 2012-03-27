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
