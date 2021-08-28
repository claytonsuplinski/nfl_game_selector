SEL.save = {};

SEL.save.draw = function(){
	$("#modal-title").html("Save/Load");
	$(".modal-body").html(
		[
			{ name : 'Save', onclick : 'SEL.save.save_predictions();' },
			{ name : 'Load', onclick : 'SEL.save.get_predictions();'  },
		].map(function( button ){
			return '<div class="interface-button" onclick="' + button.onclick + '">' + 
				button.name +
			'</div>';
		}).join('') +
		'<input id="load-input" type="file" style="display:none;" />'
	);
}

SEL.save.get_predictions = function(){
	var self = this;
	$( "#load-input" ).change(function( e ){ self.load_predictions( e ); });
	$( "#load-input" ).trigger( 'click' );
}

SEL.save.load_predictions = function( e ){
	var reader = new FileReader();
	reader.onload = function( ev ){
		SEL.selector.data = JSON.parse( ev.target.result );
		SEL.selector.init();
		SEL.selector.draw();
	};
	reader.readAsText( e.target.files[ 0 ] );
}

SEL.save.save_predictions = function(){
	var content = "data:text/json;charset=utf-8," + encodeURIComponent( JSON.stringify( SEL.selector.data ) );
	var ele = document.createElement( 'a' );
	ele.setAttribute( "href",     content      );
	ele.setAttribute( "download", SEL.selector.data.year + ".json" );
	document.body.appendChild( ele );
	ele.click();
	ele.remove();
}