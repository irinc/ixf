$(function(){
	// Put your project-specific code here.
	//Dismiss Error Messages
	$(".alert a.close").click(function(){
		$(this).parent().fadeOut();
	});
	
	// the following does the initial setup of ixf stuff (panels, popups, etc). But some functionality depends on stuff the project.js may call such as settting up tabs. The following line must be called for the IXF to work properly and should most likely be at the END of your onload call.
	ixf.setup();	// DO NOT REMOVE
});


