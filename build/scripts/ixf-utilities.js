/*!
 * IxF Utilities
 * @description This file is for initializing all of the IXF functionality.
 * @version     X.X.X
 * @copyright   Copyright © Y_Y_Y_Y Intellectual Reserve, Inc.
 * @URL         http://irinc.github.com/ixf
 * dependencies ixf-plugins.js
 * global       ixf,$,window
 */

var ixf = ixf || {}; // for use in keeping track of anything related to the IXF so we don't pollute the global namespace
ixf.version = "X.X.X";
ixf.isSetup = {}; // for keeping track of things that are setup.

// IE7/8 and FF < 4 have issues with the bigger sprites, trying to load them up as early in the process as possible. Even cached it needs time to parse
ixf.browserVer = parseInt($.browser.version,10);
if (($.browser.msie && (ixf.browserVer == 7 || ixf.browserVer == 8)) || ($.browser.mozilla && ixf.browserVer < 4)) {
	var reg = new RegExp(/"([^"]*)"/i);
	var url = $("html").addClass("sprite").css("background-image");
	var matches1 = url.match(reg);
	var sprite = new Image();
	if (matches1 != null && matches1.length > 1) {
		sprite.src = matches1[1];
	if (sprite.src) { // ie8
		ixf.sprite1 = sprite.src;
			$("html").removeClass("sprite");
		}
	}
	var url2 = $("html").addClass("ui-tooltip-close").css("background-image");
	var matches2 = url2.match(reg);
	var sprite2 = new Image();
	if (matches2 != null && matches2.length > 1) {
		sprite2.src = matches2[1];
		if (sprite2.src) { // ie8
			ixf.sprite2 = sprite2.src;
			$("html").removeClass("ui-tooltip-close");
		}
	}
}

ixf.actionBarPadding = 20; // extra padding above action bar so content doesn't end right at the top of it
ixf.panelMinHeight = 200; // can't be in CSS since the height is set dynamically to be the full available height
ixf.strings = {
	columnFilter:"Column Filter",
	tableFilter:"Table Filter",
	autocompleteLabel:'This field is an autocomplete. Start typing then press down to hear options.',
	columnSortAsc:'Sorting column ascending',
	columnSortDesc:'Sorting column descending',
	loaderText:'Loading',
	fileBrowse:'Browse...',
	tabError:"Couldn't load this tab."
};
ixf.dataTable = {
	rows: 1000,
	moreRows: 10,
	ajaxDelay: 500
};
ixf.popup = {
	content:{clone:true,title:{button:true}},
	position: {
		my: 'top center',
		at: 'bottom center',
		viewport:true
	},
	show: {event:"click"},
	hide: {event:"click"},
	style:{ tip: { corner:true, width: 24, height: 14, mimic:'center' } },
	fadeTime:200
};
ixf.callbacks = {
	preSetup: function(){}, // stuff to fire everytime ixf.setup is run, but before any of the ixf setup actually occurs (apply patches, etc)
	postSetup: function(){} // stuff to fire evertime after ixf.setup is run
};
ixf.percentages = {
	good: 70,
	bad: 30,
	hideNum:false
};
ixf.fixSelectPadding = 5;

ixf.fixSelectAllowed = $.ixf.fixSelect;

if($.browser.msie && ixf.fixSelectAllowed){
	if(ixf.browserVer === 7 || ixf.browserVer === 8){
		ixf.fixSelectAllowed = false;
	}
}

// stuff we want to happen as soon as possible (not onload) as it effects the display of CSS releated stuff, which shouldn't have to wait for onload to be done.

// lets do some browser detection and apply some classes accordingly. this gives us a simple hook for targeting browsers without the need for css hacks or additional .css files
var putHere = $("html"),
	curBrowser;

if($.browser.msie){
	curBrowser = "ie";
	putHere.addClass("ie"+parseInt($.browser.version,10));
	// if a layer (like autocomplete) goes beyond the viewport IE will add back in body scrollbars to accomodate. This forces the height so it can't do that. Doesn't work in IE9, reevaluate when it (IE9) goes to beta
	$(window).bind("resize",function(){
		$("body").height($(window).height());
	});
}
if($.browser.webkit){
	curBrowser = "webkit";
}
if($.browser.mozilla){
	curBrowser = "mozilla";
}
putHere.addClass(curBrowser);

// since we are moving towards a "one page" site (ajax loading content after the initial load), we need to be able to call a number of things many times (after additional content is loaded), not just once after page load. So setting up several things outside of the onload so they are available globally, but then will call them onload later on.

ixf.setupPanels = function(container){
	container = container||$("body");
	// setup the layout plugin
	if($('.ui-layout-center:not(.ui-layout-pane)',container).length && $.layout){ // only if we have the correct element(s) in place, and the layout plugin
		var optionList = ["closable","resizable","minSize","maxSize","initClosed","size"],
			layoutDefaults = {
				defaults:{
					spacing_open: 9,
					spacing_closed: 9,
					resizeWhileDragging:true,
					size:300,
					minSize:200,
					slidable: true,
					slideTrigger_open: "mouseover",
					resizeWithWindowDelay:1,
					onresize:function(panel){
						if($(".ixf-actions",container).length){
							$(window).trigger("resize.actionBar");
						}
						$(".ixf-fixed",container).each(function(){
							var cur = $(this);
							if(cur.data("fixHeader")){
								cur.fixHeader("cloneThead");
							}
						});
						// ixf.matchWidth(); // update any elments that need to be the full width of their parent
						$(".ui-layout-"+panel,container).find(".ui-finder.fullwidth").finder("updateWidth");
						// $(".ixf-popup").qtip("reposition");
					},
					onclose:function(panel){
						if($(".ixf-actions",container).length){
							$(window).trigger("resize.actionBar");
						}
						// $(".ixf-popup").qtip("reposition");
					}
				},
				north:{
					resizerCursor:"row-resize"
				},
				south:{
					resizerCursor:"row-resize"
				},
				east:{
					resizerCursor:"col-resize"
				},
				west:{
					resizerCursor:"col-resize"
				}
			};

			layoutDefaults = $.extend(true,layoutDefaults, ixf.layoutDefaults);

		$(".ui-layout-center:not(.ui-layout-pane)",container).each(function(){
			var parent = $(this).parent(),
				curLayout,
				panelsStuff = {},
				// extend any general options that are set
				paneDefaults = $.extend(true,layoutDefaults, parent.data("layout-options"));

			// now extend any specific options we have exposed. First on the containing element for options applied to all sub panels
			$.each(optionList,function(index,value){
				panelsStuff[value] = parent.data("layout-"+value);
			});
			paneDefaults.defaults = $.extend(true,paneDefaults.defaults, panelsStuff);

			// now per panel
			$(parent).children(".ui-layout-north, .ui-layout-east, .ui-layout-west, .ui-layout-south, .ui-layout-center").each(function(){
				var cur = $(this),
					paneStuff = {},
					// find out which pane this is
					pane = this.className.match(/ui\-layout-([a-zA-Z]*)/)[1];
				// console.debug(pane);
				// first get the general options
				paneDefaults[pane] = $.extend(true,paneDefaults[pane], cur.data("layout-options"));

				// now the specifics
				if(cur.data("layout-size") && cur.data("layout-size") < paneDefaults.defaults.minSize){
					 // size is smaller then the default allows, so set the minSize to match for this pane
					paneStuff.minSize = cur.data("layout-size");
				}

				$.each(optionList,function(index,value){
					paneStuff[value] = cur.data("layout-"+value.toLowerCase());
				});
				paneDefaults[pane] = $.extend(true,paneDefaults[pane], paneStuff);
			});

			// console.debug(parent,paneDefaults);
			// got all the options, lets run the script
			curLayout = parent.layout(paneDefaults);

			// now add elements to hold the "pins"
			// console.debug("doing this for ",curLayout.container);
			$.each(curLayout.resizers,function(pane,exists){
				// console.debug("parsing following resizer",pane,exists);
				if(exists && pane !== "center"){
					$(this).append("<div id='button-"+curLayout.state.id+"-"+pane+"'></div>");
					// console.debug(curLayout.state.id,pane,$("#button-"+curLayout.state.id+"-"+pane));
					curLayout.addPinBtn( "#button-"+curLayout.state.id+"-"+pane, pane );
				}
			});
		});
	}
}; // end setupPanels

ixf.destroyPanels = function(toDestroy){
	if(toDestroy){
		toDestroy.destroy();
	}
};

ixf.setupGeneral = function(container){ // run all the small one liners and simpler widgets to set various things up
	container = container||$("body");
	// adds iPad/iPhone scrolling ability in panes
	if($.fn.jTouchScroll){$(".ixf-panel").jTouchScroll();}

	// adds nice looking select to ALL select boxes
	if(ixf.fixSelectAllowed){
		$.ixf.fixSelect.prototype.options.padding = ixf.fixSelectPadding;
		$("select:not([multiple]):not(.nofix)",container).fixSelect();
	}
	// adds class for fixing the ixf-button padding when it has an element with a sprite inside it
	$(".ixf-button:has(.sprite)").addClass("spritefix");

	// adds watermark for text field hints
	if($.ixf.watermark){
		// $(":text[placeholder]").watermark();
		// $(":password[placeholder]").watermark();
		// can't use the above :text or :password pseduo selector due to a jquery bug http://bugs.jquery.com/ticket/7071 so do it the long way (still in jquery 1.4.4, targeted for 1.4.5)
		$("input[type=password][placeholder],input[type=text][placeholder],textarea[placeholder]",container).watermark();
	}

	// add some aria stuff for accessibility
	$(".ixf-panel",container).attr({ role: "region" });
	// TODO: also add aria-labelledby for the summary concept, need to make our own summary

	// adds some basic master detail stuff
	if($.ixf.masterDetail){
		$(".ixf-master",container).masterDetail();
	}
//INITITALIZE MULTISELECT
	if($.ixf.multiSelect){
		$(".multiselect[multiple]",container).multiSelect({
			onAdd: function(){
				if(ixf.fixSelectAllowed){
					$(this).fixSelect();
				}
			},
			onChange: function(){
				if(ixf.fixSelectAllowed){
					$(this.element).siblings("."+this.options.uniqueClass).find("select").each(function(){
						$(this).fixSelect("updateWidths");
					});
				}
			},
			create:function(a,b){
				if(ixf.fixSelectAllowed){
					// make sure to update the widths of any existing select elements to make sure they are all the same width
					$(this).siblings("."+$(this).data("multiSelect").options.uniqueClass).find("select").fixSelect("updateWidths");
				}
			}
		});
	}
// INITIALIZE AUTOCOMPLETE
	if($.ui.autocomplete){
		$(".ixf-autocomplete",container).each(function(){
			var cur = $(this),
				options = {},
				source;

			// see if we want to populate a second (likely hidden) field with different data then what we display
			if(cur.data("ac-alternate-id")){
				options.select = function(event,request){
					//http://stackoverflow.com/questions/9063298/getting-the-input-that-autocomplete-is-called-on-in-select-event
					var ac = $(event.target);
					$("#"+$(this).data("ac-alternate-id")).val(request.item.id);
				};
			}
			// if the source has a . or / then it is likely a URL, so leave it a string
			if(cur.data("ac-source").match(/[\.\/]/)){
				source = cur.data("ac-source");
			} else {
				// otherwise it's a variable name for an array or function
				source = eval(cur.data("ac-source")); // yes eval is evil, but whatchagonnado? Best way to easily pass in info on the fly. Open to suggestions :)
			}
			options.source = source;

			// pull in any other general options that may have been set
			options = $.extend(true,options, cur.data("ac-options"));
			// call the autocomplete
			cur.autocomplete(options);
		});
	}
// INITIALIZE TABS
	if($.ui.tabs){
		function fixTabAbort(event,ui){ // fix for http://dev.jqueryui.com/ticket/5465
			$(ui.tab).data("cache.tabs",($(ui.panel).html() === "") ? false : true);
		}
		$('.ixf-tabs-wrapper',container).each(function(){
			var cur = $(this),
				tabptions,
				disabledtabs = [];

			taboptions = {
				cache: true,
				spinner:"",
				// panelTemplate: '<div><div class="padding-md">Loading content...</div></div>',
				select:function(event,ui){
					var loader = $('<div class="panel-loading" id="tab-loader-'+ui.index+'"><p>'+ixf.strings.loaderText+'</p><span></span></div>'),
						detail = $(ui.panel).parents(".ui-tabs"),
						left = detail.offset().left + (detail.width()/2);
					$("body").append(loader);

					loader.css({
						left: left
					}).show();
				},
				ajaxOptions: {
					error: function(xhr, status, index, anchor) {
						$(anchor.hash).html(ixf.strings.tabError);
					}
				},
				show:function(event,ui){
					// because tabs have different heights and change the scrollbar showing or not, the actionbar needs to be updated
					$(window).trigger("resize.actionBar");
					if(!$(ui.tab).data("href.tabs") || $(ui.panel).html().length){
						$("#tab-loader-"+ui.index).remove();
					}
					ixf.a11yupdate();
					$(".ixf-accordion",ui.panel).accordion("resize"); // any accordions inside of hidden tabs would have the wrong height, so tell them to update their size when shown
					// console.debug(ui.panel);
				},
				load:function(event,ui){
					fixTabAbort(event,ui); // fix for http://dev.jqueryui.com/ticket/5465
					$("#tab-loader-"+ui.index).fadeOut(function(){$(this).remove();});
				}
			};

			taboptions = $.extend(true,taboptions, cur.data("tabs-options"));
			// console.debug(taboptions);
			var tabs = cur.tabs(taboptions);
			// lets setup some tab tracking via the URL and history, requires an ID on the tabs, so make sure it's there
			if(tabs.attr("id")){
				tabs.tabs({ event: 'change' });

				// Define our own click handler for the tabs, overriding the default.
				tabs.find('ul.ui-tabs-nav a').click(function(){
					var state = {};
					// Set the state!
					state[ $(this).closest( '.ixf-tabs-wrapper' ).attr( 'id' ) ] = $(this).parent().prevAll().length;
					$.bbq.pushState( state );
				});
				$(window).bind( 'hashchange.tabs', function(e) {
					tabs.each(function(){
						var curState = $.bbq.getState( this.id, true );
						// console.debug(curState);
						// if(curState !== undefined){
							$(this).find('ul.ui-tabs-nav a').eq( curState || 0 ).triggerHandler( 'change' );
						// }
					});
				}).trigger( 'hashchange.tabs' );
			}
		});
	}
// INITIALIZE ACCORDION
	if($.ui.accordion){
		$(".ixf-accordion.default",container).each(function(){
			var curElem = $(this),
				options = {
					header: "h3",
					change: function(event, ui) {
						ui.oldHeader.attr("aria-selected","false");
						ui.newHeader.attr("aria-selected","true");
					}
				};
			options = $.extend(true,options, curElem.data("ac-options"));
			curElem.accordion(options).find("h3[aria-expanded=true]").attr("aria-selected","true");
		});
	}
// INITIALIZE STANDARD DATE PICKER
	if($.ui.datepicker){
		$('.datepicker',container).datepicker({
			showButtonPanel: true,
			dayNamesMin: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
			showOn: 'both',
			buttonText:'select date',
			dateFormat: 'M dd, yy',
			showAnim: 'fadeIn'
		});
	}
// INITIALIZE STANDARD TIME PICKER
	if($.ixf.timePicker){
		$('input.timepicker',container).each(function(){
			var curElem = $(this),
				options = {},
				secondField = curElem.data("tp-secondfield"),
				startTime = curElem.data("tp-starttime"),
				endTime = curElem.data("tp-endtime");
			if(startTime){options.startTime = startTime;}
			if(endTime){options.endTime = endTime;}
			if(secondField){options.secondField = secondField;}
			options = $.extend(true,options, curElem.data("tp-options"));
			curElem.timePicker(options);
		});
	}
// INITIALIZE ACTIONBAR
	$("div.ixf-actions",container).each(function(){
		var actionBar = $(this);
		if(!actionBar.data("actionBar")){
			var placeholder = $("<div class='action-placeholder'></div>").css("height",actionBar.outerHeight()+ixf.actionBarPadding); // add margin that is the height of the action bar plus XX padding
			$(actionBar).after(placeholder);

			actionBar.data("actionBar",true);
		}
	});
// FIX INPUT=FILE FIELDS
	// this tries to do something with the file upload field. Browsers don't give us proper access, so this isn't perfect. But better then nothing...I hope
	$("input[type=file]:not(.ixf-file)",container).each(function(){
		var elem = $(this),
			wrapper = $('<span class="ixf-file-fixer"></span>'),
			fakefile = $('<input type="text" class="ixf-fakefile" name="" value="" id="">'),
			fakebrowse = $('<a href="#d" class="ixf-button">'+ixf.strings.fileBrowse+'</a>');
			fakebrowse.bind("click",function(e){
				elem.click();
				return false;
			});
		//If'n we don't want to use IxF files
		if (!$(this).hasClass('file-input-override')) {
			elem
				.wrap(wrapper)
				.addClass("ixf-file")
				.bind("change.file",function(){
					fakefile.val($(this).val());
				});
			elem.after(fakebrowse).after(fakefile);
			fakefile.bind("select",function(){
				elem.trigger("select");
			});
		}
	});
// INITIALIZE PERCENTAGE BARS
	$(".ixf-percentage",container).each(function(){
		if(!$(this).data("hasPercentage")){
			var curElem = $(this),
				percentage = curElem.text(),
				num = parseInt(percentage,10),
				bar = $("<span class='ixf-percentage-bar'></span>"),
				fill = $("<span class='ixf-percentage-fill'></span>"),
				fillType = "neutral",
				opts = ixf.percentages,
				good = opts.good,
				bad = opts.bad,
				topColor = "good";

			curElem.wrapInner("<span class='percentage-text'></span>");

			if(curElem.data("percentage-good")){
				good = curElem.data("percentage-good");
			}
			if(curElem.data("percentage-bad")){
				bad = curElem.data("percentage-bad");
			}
			if(curElem.data("percentage-hideNum")){
				opts.hideNum = curElem.data("percentage-hideNum");
			}
			if(bad > good){
				topColor = "bad";
			}

			if((topColor === "good" && num >= good) || (topColor === "bad" && num <= good)){
				fillType = "good";
			}

			if((topColor === "good" && num <= bad) || (topColor === "bad" && num >= bad)){
				fillType = "bad";
			}

			if(opts.hideNum){
				curElem.find(".percentage-text").hide();
				bar.css("width","100%");
			}


			curElem.prepend(bar);
			bar.prepend(fill).attr("title",percentage);
			fill.width(percentage).addClass(fillType);
			curElem.data("hasPercentage",true);
		}
	});
// INITIALIZE ACCESSIBILITY STUFF
	if(!$("#a11ybuffertrick").length){
		$("body").append('<input type="hidden" id="a11ybuffertrick" />');
	}
	// tables TH's need the scope attribute, will set them up for columns
	$("thead th:not([scope])",container).attr("scope","col");

	// autocompletes are setup per page because the are so custom, but lets add some a11y stuff as best we can. have to delay it a bit to allow any page level onload stuff to be added
	setTimeout(function(){
		$(".ui-autocomplete-input",container).each(function(){
			var cur = $(this), label;
			// see if it has a label
			if($("label[for="+cur.attr("id")+"]").length){
				label = $("label[for="+cur.attr("id")+"]");
			}
			// if not lets add one
			if(!label){
				label = $("<label for='"+cur.attr("id")+"'></label>");
				cur.before(label);
			}
			if(!label.find("span.autocompletelabel").length){
				label.append('<span class="invisible autocompletelabel">'+ixf.strings.autocompleteLabel+'</span>');
			}
			ixf.a11yupdate();
		});

	},100);

}; // end setupGeneral

function movePopup(event,api){ // defined outside of the setup so it can be called via multiple setups
	// this closes popups when their triggers scroll of the screen. this won't catch it if they are in additional scrolling elements, just in ixf-panel for now
	var parentPanel = $(api.elements.target).parents(".ixf-panel");
	if(!parentPanel.data("qtipClose")){
		parentPanel.bind("scroll",function(){
			$("a.active-trigger",this).each(function(){
				// parentPanel.data("qtipCloseByScroll",true);
				var parentTop = $(this).offset().top-parentPanel.offset().top,
					pad = $(this).height()/2;
				if(parentTop < 0 - pad || parentTop > parentPanel.outerHeight() - pad){
					$(this).qtip("hide");
				} // else {
					// $(this).qtip("reposition");
				// }
			});
		}).trigger("scroll").data("qtipClose",true);
	}
}

ixf.setupPopups = function(container){
	container = container||$("body");
	// setup qtip on any anchors (and now form fields) that are marked to do so. Set the title of the tooltip via the title attribute, and what hidden element is supposed to show as the href (<a href="#the_elem">) or data-pop-source attribute.

	if(typeof String.prototype.trim !== 'function') {
		String.prototype.trim = function() {
			return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
		}
	}

	// give a class of "closer" to any elements within the target you want the user to click to make the qtip close
	// console.debug($("a.ixf-popup, :input.ixf-popup",container).length,container);
	$(".ixf-popup",container).each(function(){
		// make sure we haven't setup qtip already
		if(!$(this).data("qtip")){
			var curtip = $(this),
				setTitle = curtip.attr("title")?"":curtip.attr("title","&nbsp;"), // qtip script apparently requires a title, so give it one if it doesn't have one
				source = curtip.data("pop-source"),
				href = source?source:curtip.attr("href"),
				isInline = source?source.trim().indexOf("#") === 0:href.trim().indexOf("#") === 0,
				content,
				parentPanel = curtip.closest(".ixf-panel,.ixf-panels,body"),
				options = {
					content:{title:{text:curtip.attr("title")}},
					show: {
						effect: function(){
							// IE opacity issue - http://bugs.jquery.com/ticket/6652 once fixed can hopefully drop the if/else
							if(!$("html").hasClass("ie8")){
								$(this).fadeIn(ixf.popup.fadeTime,function(){
									this.style.filter = "";
								});
							} else {
								$(this).show();
							}
						}
					},
					hide: {effect: function(){$(this).fadeOut(ixf.popup.fadeTime);}},
					events:{
						hide:function(event,api){
							// console.debug(event,api.elements.content);
							var parentPanel = $(api.elements.target).parents(".ixf-panel");
							// if there are no more open popups in this panel
							if($("a.ixf-popup.active-trigger",parentPanel).length <= 1 || parentPanel.data("qtipCloseByScroll")){
								// remove the scroll event
								parentPanel.unbind("scroll.popup").data("qtipClose",false).data("qtipCloseByScroll",false);
							}
							api.elements.target.removeClass("active-trigger");
						},
						render:function(event,api){ // render only fires first time
							movePopup(event,api);
						},
						show:function(event,api){ // show is each time after that. move is every time
							api.elements.target.addClass("active-trigger");
							movePopup(event,api);
							// if content is visible in another popup, hide that popup
							if(isInline && !$.contains(this,content[0])){
								if(content.closest(".ui-tooltip").length){
									content.closest(".ui-tooltip").qtip("hide");
								}
								// now show it in the new one
								api.elements.content.html("").append(content.show());
							}

							$(this).css("opacity","1");
						}
					},
					position:{
						container:parentPanel
					}
				},
				sideTip = {height:24,width:14},
				sizeClass,extras = {};
			// update with any ixf options that were set, before we look at per instance options
			options = $.extend(true,options, ixf.popup);
			// console.debug(target);

			sizeClass = curtip.data("pop-size")?"popup-"+curtip.data("pop-size"):"";
			if(curtip.is(":input")){ // if this is a form field, then do some form specific stuff
				if(!curtip.data("pop-method")){ // gonna figure that most of the time form fields want to be on focus, but check for a user set option first
					curtip.data("pop-method","focus");
				}
				if(!curtip.data("pop-direction")){ // gonna figure that most of the time form fields will want to go east. But check for a direction first in case one is set by the user.
					curtip.data("pop-direction","east");
				}
			}

			if(curtip.data("pop-method") === "focus"){ // click, hover, focus
				options.show.event = "focus";
				options.hide.event = "blur";
			}
			if(curtip.data("pop-hover") || curtip.data("pop-method") === "hover"){
				options = $.extend(true,options, {
					show:{event : 'mouseover', delay:1000},
					hide:'unfocus mouseleave',
					events: {
						hide: function(event, api) {
							if($(this).is(':visible') && !$(this).is(':animated') && event.originalEvent.type === 'mouseleave') {
								event.preventDefault();
							}
						}
					}
				});
			}

			if(isInline){
				$(href).find(".closer").bind("click",function(){
					$(this).parents('.ui-tooltip').qtip('hide');
					return false;
				}).end().hide();

				content = $(href);
				// link is for inline content
				options = $.extend(true,options, {
					content:{text:function(){
						// text is actually appended in a show event (for trickery using multiple links for the same content). to get proper dimensions for popup we need to put a clone into the popup temporarily
						var foo = $("<div></div>");
						foo.append(content.clone().show());
						// console.debug(foo);
						return foo.html();
					}},
					id:curtip.attr("id"),
					style:{classes : sizeClass}
				});


			} else {
				content = "";
				// no hash so guessing it is ajax
				var loading = '<div class="loading-xl margin-sm" title="'+ixf.strings.loaderText+'"></div>';
				options = $.extend(true,options, {
					content:{
						ajax:{
							url:curtip.attr("href"),
							once:false,
							beforeSend: function() {
								curtip.qtip('option', 'content.text', loading);
							}
						}
					},
					style:{classes : sizeClass}
				});
			}

			if(curtip.data("pop-close")){
				options.hide.event = curtip.data("pop-close");
			}

			if(curtip.data("pop-direction")){
				switch (curtip.data("pop-direction")) {
					case "east":
						extras = {
							position:{my : 'left center',at : 'right center'},
							style:{classes : "qtip-east "+sizeClass,tip: sideTip}
						};
					break;
					case "west":
						extras = {
							position:{my : 'right center',at : 'left center'},
							style:{classes : "qtip-west "+sizeClass,tip: sideTip}
						};
					break;
					case "north":
						extras = {
							position:{my : 'bottom center',at : 'top center'},
							style:{classes : "qtip-north "+sizeClass}
						};
					break;
					case "right":
						extras = {
							position:{my : 'top right',at : 'bottom right',adjust : {x : -10}},
							style:{classes : "qtip-right "+sizeClass}
						};
					break;
					case "left":
						extras = {
							position:{my : 'top left',at : 'bottom left',adjust : {x : 10}},
							style:{classes : "qtip-left "+sizeClass}
						};
					break;
				}
				options = $.extend(true,options, extras);
			}

			options = $.extend(true,options, curtip.data("pop-options"));
			// console.debug(options);
			curtip.qtip(options);
			if(!curtip.data("pop-hover")){
				curtip.click(function(){ return false; });
			}
		}

	});
}; // end setupPopups

ixf.setupDataTables = function(container){
	container = container||$("body");
	// only grab tables that are visible (not cloned for fixedHeader) that haven't been previously setup (.dt-setup)
	$("table.ixf-table-default:not(.dt-setup):not(.fixHeaderApplied)",container).each(function(){
		$(this).addClass("dt-setup");
		if($(this).parents(".fixed-head").length) {
			return;
		}
		var curtable = $(this),
			curtableID = curtable.attr("id"),
			rows = ixf.dataTable.rows,
			moreRows = ixf.dataTable.moreRows,
			filterRow = curtable.find("thead:first tr:has(td)"),
			headerRow = curtable.find("thead:first tr:has(th)"),
			dataRow = curtable.find("tbody:first tr:first"),
			filterRowCells = filterRow.find("td"),
			headerRowCells = headerRow.find("th"),
			dataRowCells = dataRow.find("td"),
			isAjax = false,
			replaceFilterRow,
			options = {
				bAutoWidth:false, // this tells the plugin to not fix the widths of the columns. This allows us to have a fluid width
				'sDom': 'rt', // this tells the plugin to not output any header (search box, etc)
				"oLanguage": { // these 3 lines clear the text out of the input label
					"sSearch": ""
				},
				fnDrawCallback:function(a){ // this sets up all the stuff we want to happen whenever the table is changed due to sorting or filtering
					// var theTable = $(a.nTable);
					// console.debug(a);
					// get some info for the reults tet and more button change values based on if this is ajax or static
					var totalRows = a._iRecordsTotal?a._iRecordsTotal:a.aoData.length, // total of all rows in table (or server table)
						matchedRows = a._iRecordsDisplay?a._iRecordsDisplay:a.aiDisplay.length, // number that matched when a filter is done
						shownRows = $(a.nTable).find("tbody tr:visible").length, // number shown (could be smaller then matchedRows due to dt-rows limit)
						maxDisplay = a.aiDisplay.length?a.aiDisplay.length:a._iDisplayLength,
						more = $("#"+curtableID+"-more"),
						info = $("#"+curtableID+"-info"),
						ascCols,descCols;
						// console.debug("totalRows = "+totalRows);
						// console.debug("matchedRows = "+matchedRows);
						// console.debug("shownRows = "+shownRows);
						// console.debug("maxDisplay = "+maxDisplay);

					if(more.length){
						// console.debug(more);
						if(shownRows >= matchedRows || maxDisplay > totalRows){
							more.hide();
						} else {
							more.show();
						}
					}

					if(info.length){
						// console.debug(shownRows>matchedRows, s);
						info.attr({"aria-live":"polite","aria-atomic":"true"});
						info.find(".dt-showing").text((matchedRows?shownRows:matchedRows)+" "); // logic is for saying "0" rows. if no matched rows, must be showing 0
						info.find(".dt-results").text(matchedRows+" "); // extra space is for IE7
					}

					// update column soring titles
					ascCols = $(a.nTable).find("thead .sorting_asc a").attr("title",ixf.strings.columnSortAsc);
					descCols = $(a.nTable).find("thead .sorting_desc a").attr("title",ixf.strings.columnSortDesc);
					$(a.nTable).find("thead a").not(ascCols).not(descCols).attr("title","");
					if($(a.nTable).data("skippedFirst") && !$(a.nTable).data("gettingMore")){ // thead would focus onload without this (skippedFirst). Also don't focus when clicking more button
						// bring the thead back into view, makes sure that results are not hidden under it
						$("thead",a.nTable).makeVisible({speed:0});
					}
					$(a.nTable).data("skippedFirst",true);
					ixf.setup(a.nTable);
					$(a.nTable).data("gettingMore",false);
				},
				fnInitComplete:function(a){
					var tbl = $(a.nTable);
					if(tbl.data("fixHeader")){ // update the fixedheader
						tbl.fixHeader("cloneThead");
					}

					//set the filter input fields with the values from the saved state

					var cols = a.aoPreSearchCols, headInputs = tbl.find("thead input"),
							inputs = headInputs.length > 0 ? headInputs : tbl.find("tfoot input"),
							columns = inputs.parent().parent().children(), input, searchString;

					if(columns.length > 0 && columns.length == cols.length ) {
						for ( var i=0; i<cols.length ; i++ ){
							searchString = cols[i].sSearch;
							if(searchString.length>0){
								input = $(columns[i]).find("input");
								input.val(searchString);
							}
						}
					}
				}
			};
		if(curtable.data("dt-rows")){
			rows = curtable.data("dt-rows");
			moreRows = rows;
		}
		if(curtable.data("dt-rows-more")){
			moreRows = curtable.data("dt-rows-more");
		}

		if(curtable.data("dt-show-filter")){
			options = $.extend(true,options, {
				'sDom': 'f' // they want the filter element, so add it back in
			});
		}
		if(curtable.data("dt-ajax-url")){
			// table should be loaded via ajax, lots of work to do
			options = $.extend(true,options, {
				"bProcessing": true,
				"bServerSide": true,
				"sAjaxSource": curtable.data("dt-ajax-url") // url where we should pull from
			});
			isAjax = true;
			// sometimes is needs to be a post... lets accomodate it
			if(curtable.data("dt-ajax-post")){
				options = $.extend(true,options, {
					"fnServerData": function ( sSource, aoData, fnCallback ) {
						$.ajax( {
							"dataType": 'json',
							"type": "POST",
							"url": sSource,
							"data": aoData,
							"success": fnCallback
						} );
					}
				});
			}
		}

		// now lets do some per column stuff
		var noSort = [],
			colTypes = [],
			colFilter = [],
			hideEm = [];
		headerRowCells.each(function(i){
			var curTH = $(this),
				curIndex = curTH.index(),
				tbodyTD = dataRowCells.eq(curIndex),
				filterTD = filterRowCells.eq(curIndex),
				hasInput = tbodyTD.find(":input").length,
				locObj;
			curTH.data("origIndex",curIndex);
			// check for it being empty (or visibly empty) and mark it as not sortable/searchable
			if(curTH.html().match(/^\s*&nbsp;\s*$|^\s$/) || curTH.find("input").length || curTH.data("dt-sort") === "no"){
				noSort.push(i);
				curTH.find("a").bind("click",function(event){ // just in case there is still an anchor in there
					event.preventDefault();
				});
			}
			// check for a dt-sort-* class that sets the column to sort on and which direction
			if(curTH.data("dt-sort") && curTH.data("dt-sort") !== "no"){
				options = $.extend(true,options, {
					"aaSorting": [[i,curTH.data("dt-sort")]]
				});
			}
			if(curTH.data("dt-id-col")){
				curTH.data("dt-hide",true);
				options = $.extend(true,options, {
					"fnRowCallback": function ( nRow, aData, iDisplayIndex ) {
						$(nRow).attr("id",(curTH.data("dt-id-prefix")||"")+aData[curIndex]);
						return nRow;
					}
				});
			}
			if(curTH.data("dt-hide")){
				hideEm.push(i);
			}
			// check for custom sortTypes per column
			if(curTH.data("dt-sort-type") || curTH.data("dt-sort-data-type") || hasInput){
				locObj = {
					sType: curTH.data("dt-sort-type")
				};
				if(hasInput){
					if(tbodyTD.find(":checkbox").length){
						curTH.data("dt-sort-data-type","dom-checkbox");
					} else {
						curTH.data("dt-sort-data-type","dom-inputs");
					}
				}
				if(curTH.data("dt-sort-data-type")){
					locObj = {
						sSortDataType: curTH.data("dt-sort-data-type")
					};
				}

				colTypes.push(locObj);
			} else {
				colTypes.push(null);
			}
			// check for initial filter values
			if(filterRow.length){
				var val = filterTD.find(":input:not(.nofilter)").val()||"";
				if(filterTD.find(":input").is("select")){
					colFilter.push({"sSearch":val?"^"+val:"","bEscapeRegex":false});
				} else {
					colFilter.push({"sSearch":val});
				}
			} else { // no filter row so just add null
				colFilter.push(null);
			}
		});
		// console.debug(colFilter);
		// console.debug(hideEm);
		options = $.extend(true,options, {
			"aoColumnDefs": [
				{ "bSortable": false, "aTargets": noSort },
				{ "bSearchable": false, "aTargets": noSort },
				{ "bVisible": false, "aTargets": hideEm }
			],
			"aoColumns": colTypes,
			"aoSearchCols": colFilter,
			"iDisplayLength": rows // set the number of rows, either the default or the provided number
		});
		// user can pass in ANY option via the dt-option data- attribute, called last so it can trump anything else. must be formated with single quotes wrapping the value and double quotes used inside
		if(curtable.data("dt-options")){
			options = $.extend(true,options, curtable.data("dt-options"));
		}

		// if we are hiding columns AND have a TD that spans ALL columns
		if(hideEm.length && headerRowCells.length == filterRow.find("td[colspan]").attr("colspan")){
			// datatables pukes when you try to hide a column and the colspan doesn't match. no, you can't try to outsmart it by making the colspan less then it should originally be, that makes it puke too
			filterRow.remove();
			replaceFilterRow = true;
		}

		var oTable = curtable.dataTable(options).addClass("dt-setup");
		if(replaceFilterRow){
			filterRow.attr("colspan",headerRowCells.length - hideEm.length);
			headerRow.before(filterRow);
		}

		// setup stuff to update the aData array with new values when any input fields are updated. this is for filtering as sorting will run the dom-inputs custom sort
		$("tbody :input",curtable).live("change.dt",function(){
			var pos = oTable.fnGetPosition( $(this).closest("td")[0] );
			var val = $(this).val();
			if($(this).is(":checkbox")){
				val = this.checked===true ? "1" : "0";
			}
			var aData = oTable.fnGetData( pos[0] );
			aData[ pos[1] ] = val;
		});

		// do the above on any checkboxes, those don't seem to be in the aData array correct by default
		// $("tbody :checkbox",curtable).trigger("change.dt");

		// check for and set up the per column filtering
		// if the filterRow and headerRow counts aren't equal, then we likely have a colspan for the filterRow so it is probably a global filter. So skip this section and setup the global filter as normal
		if(filterRow.length && filterRowCells.length === headerRowCells.length){
			// we have a row with TD's instead of TH's. Must be a filtering row (I hope)
			$("td",filterRow).each(function(){
				// for each TD set the appropriate filter up
				var td = $(this),
					index = filterRowCells.index(td),
					input,th,curID,origIndex;
				// find equiv TH so we can grab the text
				th = headerRowCells.eq(index);
				origIndex = th.data("origIndex");
				if(td.find("input").length && !td.find("input").hasClass("nofilter")){
					input = td.find("input").bind("keyup.dt",function(){
						var curInput = $(this);
						clearTimeout(ixf.dataTable.ajaxTimer);
						ixf.dataTable.ajaxTimer = setTimeout(function(){
							oTable.fnFilter( curInput.val(), origIndex );
						},isAjax?ixf.dataTable.ajaxDelay:0);
					});
					if(input.val() && input.data("oldVal")){ // only trigger the event if there is a current value AND we have documented an old value. This prevents triggering on initialization
						input.trigger("keyup");
					}
					input.data("oldVal",input.val());
				}
				if(td.find("select").length && !td.find("select").hasClass("nofilter")){
					input = td.find("select").bind("change.dt",function(){
						// var curInput = $(this);
						// this one is a bit unique. because "active" could be contained within "inactive" we need to change how we search the column.  the "^" makes a regular expression that must match the beginning of the string, the extra "true" at the end tells the script to parse this as a regular expression instead of as a string with a ^ at the front
						oTable.fnFilter( this.value?"^"+this.value:"", origIndex, true, false );
					});
					if(input.val() && input.data("oldVal")){ // only trigger the event if there is a current value AND we have documented an old value. This prevents triggering on initialization
						input.trigger("change");
					}
					input.data("oldVal",input.val());
				}
				if(input){ // if we had an input (some columns might not)
					if(!input.attr("id")){
						input.attr("id","dt-"+curtableID+"-"+Math.floor(Math.random()*1000));
					}
					curID = input.attr("id");

					input.attr("title",th.find("a").text()+" "+ixf.strings.columnFilter)
						.before('<label for="'+curID+'" class="invisible">'+th.find("a").text()+" "+ixf.strings.columnFilter+'</label>');

				}
			});
		}

		// setup the more button
		if($("#"+curtableID+"-more").length && rows !== 1000){
			$("#"+curtableID+"-more").click(function(){
				oTable.fnSettings()._iDisplayLength = parseInt(oTable.fnSettings()._iDisplayLength,10) + parseInt(moreRows,10);
				$(oTable).data("gettingMore",true);
				oTable.fnDraw();
				// ixf.matchWidth();
				return false; // don't follow the # or whatever
			}).attr("role","button");
		}
		// setup a filter that is not provided by the datatable script
		if($("#"+curtableID+"-filter").length){
			$("#"+curtableID+"-filter").bind("keyup.dt",function(){
				var curInput = this;
				clearTimeout(ixf.dataTable.ajaxTimer);
				ixf.dataTable.ajaxTimer = setTimeout(function(){
					oTable.fnFilter( curInput.value );
				},isAjax?ixf.dataTable.ajaxDelay:0);
			}).attr("title",ixf.strings.tableFilter)
			.before('<label for="'+curtableID+'-filter" class="invisible">'+ixf.strings.tableFilter+'</label>');
		}

		// find the filter that is setup by the datatable script
		if(curtable.data("dt-show-filter")){
			var filter = curtable.siblings(".dataTables_wrapper").find("input");

			if(!filter.attr("id")){
				filter.attr("id",curtableID+"-filter");
			}
			// curID = filter.attr("id");

			filter.attr("title",ixf.strings.tableFilter)
			.before('<label for="'+curtableID+'-filter" class="invisible">'+ixf.strings.tableFilter+'</label>');
		}

		// setup the loading indicator for ajax stuff
		curtable.siblings(".dataTables_processing").addClass("panel-loading").html("<p>Loading</p><span></span>").show(); // clear out what the plugin puts in there


		// make sure anchors used for column headings don't go to a #d or something
		curtable.find("thead a").bind("click.dt",function(e){
			e.preventDefault();
		});

	}); // each


	// adds the fixed header functionality to any tables with ixf-fixed class on them
	if($.ixf.fixHeader && !$("html").hasClass("ie7")){
		$("table.ixf-fixed:not(.fixHeaderApplied)",container).fixHeader();
	}

	if($.fn.dataTableExt) {
		// the following is a dataTable extension for sorting columns based on input/select/checkbox fields
		$.fn.dataTableExt.afnSortData['dom-inputs'] = function  ( oSettings, iColumn ){
			var aData = [];
			$( 'td:eq('+iColumn+') :input', oSettings.oApi._fnGetTrNodes(oSettings) ).each( function () {
				var val = $(this).val();
				if($(this).is(":checkbox")){
					val = this.checked===true ? "1" : "0";
				}
				aData.push( val );
			} );
			return aData;
		};
		$.fn.dataTableExt.afnSortData['dom-checkbox'] = function  ( oSettings, iColumn ){
			var aData = [];
			$( 'td:eq('+iColumn+') input', oSettings.oApi._fnGetTrNodes(oSettings) ).each( function () {
				aData.push( this.checked===true ? "1" : "0" );
			} );
			return aData;
		};
	}

}; // end setupDataTables

// a collection of things that only need to be setup once. Live events, window level stuff, etc
ixf.oneTime = function(){
	// Match the min-height of all tab panels (only if marked to be matched). Requires tabs to be called first
	$(window).bind("resize.setMinHeight",function(){ // always set it up, so it's there for any dynamic content
		if($('.ixf-set-minheight .ui-tabs-panel').length){ // only do this if elements with this class exist
			$('.ixf-set-minheight').each(function(){
				var parentPanel = $(this).closest(".ixf-panel"),
					h,
					tabY = parseInt($('.ui-tabs-panel:visible:first',this).position().top,10), //find the Y of tabs
					extraP = 0; // for tracking any additional padding from wrappers around the tabs (bottom padding only since the tabY compensates for any top already)

				$('.ixf-set-minheight .ui-tabs-panel',parentPanel).css("minHeight",""); // gotta remove the minHeight for if we are resizing down, otherwise a previous height will be as small as we can go

				h = parentPanel.height() - $("div.action-placeholder",parentPanel).height();

				// console.debug($('.ixf-set-minheight .ui-tabs-panel:visible:first'));
				parentPanel.each(function(){
					extraP += parseInt($(this).css("paddingBottom"),10);
				});
				$('.ixf-set-minheight .ui-tabs-panel',parentPanel).each(function(){
					var extra = $(this).outerHeight(true) - $(this).height();
					$(this).css("minHeight",h - tabY - extra + extraP);
				});
			});
		} // end if ixf-set-minheight
	});
	// make sure the input is visible above the actionBar
	// :input appears to be very slow in IE, so doing the equivelent of listin each element which is much faster
	$("input, textarea, select, button, a").live("focus",function(){
		// but only if there is an actionbar to worry about, in the current panel
		var parentPanel = $(this).closest(".ixf-panel"),
			actionBarPlaceholder = $("div.action-placeholder",parentPanel);
		if(actionBarPlaceholder.length){
			$(this).makeVisible({
				goNow:true,
				padBottom:actionBarPlaceholder.outerHeight(),
				includePad:true,
				speed:50
			});
		}
	});

	// setup the close links on alert boxes
	$(".ixf-alert a.close").live("click",function(){
		$(this).closest(".ixf-alert").fadeOut(function(){
			if(!$(this).hasClass("keep")){
				$(this).remove();
			}
		});
	});

	// add page events for actionbar
	$(window)
		.unbind("resize.actionBar") // clear any existing ones first (old copies)
		.bind("resize.actionBar",function(){
			$(".ixf-actions").each(function(){
				var actionBar = $(this),
					actionBarPanel = actionBar.parents(".ixf-panel"),
					botMargin = 0,
					newW = actionBarPanel[0].scrollWidth,
					newBottom;

				// determine where the bottom of the pane is. can't be bottom of the page as the actionbar may be center and there may be a south.
				newBottom = $(window).height() - (actionBarPanel.offset().top + actionBarPanel.outerHeight());

				// this checks for if there is a horizontal scrollbar and adjusts things accordingly
				actionBarPanel[0].scrollLeft=1;
	            if (actionBarPanel[0].scrollLeft>0) {
					actionBarPanel[0].scrollLeft=0;
					botMargin = 15;
					newW = actionBarPanel.width() - 15;
				}
				actionBar.css({
					width: newW - (actionBar.outerWidth(true) - actionBar.width()),
					left: actionBarPanel.offset().left,
					bottom:newBottom + botMargin
				});
			});
		});
	// need to have a tiny bit of time for other resize calculations to occur
	setTimeout(function(){
		$(window).trigger("resize");
	},10);

	// if any content opens or closes the height of the scrollable area will change and so the width of the actionbar may be incorrect. Run the resize on any click of the body
	$("a").live("click.actionBar",function(){
		$(window).trigger("resize");
	});
};

// this is a function to call when needing to force the virtual buffer to update in screen readers
ixf.a11yupdate = function(){
// function a11yupdate(){
	$("#a11ybuffertrick").val(Date());
};

// this should be called from the project.js, and should be called in an onload
ixf.setup = function(container){
	container = container||$("body");
	ixf.callbacks.preSetup(container);
	// console.debug("setupIxf");
	if(!ixf.isSetup.oneTime){
		ixf.oneTime();
		ixf.isSetup.oneTime = true;
	}
// function setupIxf(){
		// console.time("setupIxf");
		// console.time("setupPanels");
	ixf.setupPanels(container);
		// console.timeEnd("setupPanels");
		// console.time("setupPopups");
	ixf.setupPopups(container);
		// console.timeEnd("setupPopups");
		// console.time("setupDataTables");
	ixf.setupDataTables(container);
		// console.timeEnd("setupDataTables");
		// console.time("setupGeneral");
	ixf.setupGeneral(container);
		// console.timeEnd("setupGeneral");
	ixf.callbacks.postSetup(container);
	// this should be at or very near the end of the onload call
	$(window).trigger("resize");
	// console.timeEnd("setupIxf");
};
// this resize needs to occur before we run ixfSetup, so is removed from the ixf.oneTime that it would logically go in
$(function(){
	// the layout plugin has the panes take up the height of their parent. Since we are using the ixf-panels wrapper (for the border) it needs to be given a height.  The code below determines that height and updates it on resize of the window.
	if(!ixf.isSetup.panelResize && $(".ixf-panels").length){
		$(window).bind("resize.panels",function(){
			// var newH = $(window).height() - $(".ixf-header").height() - $(".ixf-subheader").height() - ($(".ixf-smallapp-header").height()*2) - parseInt($(".ixf-panels").css("borderBottomWidth"),10);
			var newH = parseInt($(window).height() - $(".ixf-panels").offset().top - parseInt($(".ixf-panels").css("borderBottomWidth"),10),10) - $(".ixf-smallapp-header").height();
			// console.debug(newH,newH2);
			if(newH < ixf.panelMinHeight){
				newH = ixf.panelMinHeight;
			}

			$(".ixf-panels").height(newH);
			if(!$(".ui-layout-center").length){
				// should hopefully only be a single .ixf-panel now. so set it's height appropriately (normally layout plugin does this)
				var panel = $(".ixf-panels > .ixf-panel");
				var panels = $(".ixf-panels");
				panel.height(newH-(panel.innerHeight()-panel.height()))
					.width(panels.width()-(panel.innerWidth()-panel.width()));
			}
		}).trigger("resize.panels");

		// general datatable setup
		// this makes HTML the default for any column the script can't autodetect. only needs to be done once, so can be in the onload
		if($.fn.dataTableExt){
			$.fn.dataTableExt.aTypes.push(
				function ( sData ) {
					return 'html';
				}
			);
		}
		// trying to make size adjustments when the user comes back to the browser tab after changing the size of the window
		$(window).focus(function(){
			$(window).trigger("resize");
		});
		ixf.isSetup.panelResize = true;
	}
});
