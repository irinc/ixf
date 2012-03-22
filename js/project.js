$(function(){
	// Put your project-specific code here.
	//Dismiss Error Messages
	$(".alert a.close").click(function(){
		$(this).parent().fadeOut();
	});




	// the following does the initial setup of ixf stuff (panels, popups, etc). But some functionality depends on stuff the project.js may call such as settting up tabs. The following line must be called for the IXF to work properly and should most likely be at the END of your onload call.
	ixf.setup();	// DO NOT REMOVE
});

ixf.callbacks.preSetup = function(){
	$("div.source:not(.done)").each(function(){
		var source = $(this).html();

		parsedSource = source.replace(/\</g,"&lt;");

		var viewCode = $("<div class='source-wrapper'><p>This is how the code looked BEFORE any JavaSript changed anything.</p><pre class='html'><code>"+parsedSource+"</code></pre></div>").hide();
		var link = $("<p><a href=\"\" class=\"viewSource text-sm\">&raquo; View HTML Source</a></p>").click(function(){
			$(this).next().toggle();
			return false;
		});
		$(this).after(link);
		$(link).after(viewCode);
		$(this).addClass("done");
	});

	// call the syntax highlighter
	// SyntaxHighlighter.all();
	$("pre.javascript").beautifyCode('javascript');
	$(".html").beautifyCode('javascript');
	$("pre.css").beautifyCode('css');
};
