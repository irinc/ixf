buster.spec.expose();

describe("Autocomplete", function () {
	before(function() {
		window.languages = [{label:"c++",id:"c++"}, {label:"java",id:"java"}, {label:"php",id:"php"}, {label:"coldfusion",id:"coldfusion"}, {label:"javascript",id:"javascript"}, {label:"asp",id:"asp"}, {label:"ruby",id:"ruby"}, {label:"python",id:"python"}, {label:"c",id:"c"}, {label:"scala",id:"scala"}, {label:"groovy",id:"groovy"}, {label:"haskell",id:"haskell"}, {label:"perl",id:"perl"}];

		$("body").append('<input type="text" id="autocomplete1" class="ixf-autocomplete" data-ac-source="languages" data-ac-alternate-id="hidden1">');
		$("body").append('<input type="hidden" id="hidden1">');

		ixf.setup();

	});

	// Make sure that the source is narrowed down to those items that match the text entered
	// and that selecting an item puts the value in the input box.

	it("data-ac-source", function() {
		var field = $('#autocomplete1'), ac = field.autocomplete();

		field.val("java");
		field.data("autocomplete")._search(field.val());

		var children = $("ul.ui-autocomplete").children();

		expect(2).toEqual(children.length);

		//Select the last item

		var item = $("ul.ui-autocomplete").children().last().addClass("active");

		field.data("autocomplete").menu._trigger( "selected", jQuery.Event("keydown", {keyCode: $.ui.keyCode.ENTER }), { item: item } );

		expect("javascript").toEqual(field.val());
	});

	// Make sure that the alternate hidden field value is updated to the ID of the selected item.

	it("data-ac-alternate-id", function() {
		var field = $('#autocomplete1'), ac = field.autocomplete();

		field.val("ruby");
		field.data("autocomplete")._search(field.val());

		var item = $("ul.ui-autocomplete").children().last().addClass("active");

		field.data("autocomplete").menu._trigger( "selected", jQuery.Event("keydown", {keyCode: $.ui.keyCode.ENTER }), { item: item } );

		expect("ruby").toEqual($("#hidden1").val());

	});

	after(function() {
		$("#autocomplete1").remove();
		$("#hidden1").remove();
		delete(window.languages);
	});
});