SEL.home = {};

SEL.home.draw = function(){
	SEL.load.navbar_options();
	$( "#week-container" ).html('');
	$(".container").html(
		[
			{ name : 'New Prediction'  , onclick : 'SEL.selector.load();'        },
			{ name : 'Load Prediction' , onclick : 'SEL.save.get_predictions();' },
			{ name : 'Previous Results', onclick : 'SEL.results.load();'         },
		].map(function( button ){
			return '<div class="interface-button" onclick="' + button.onclick + '">' + 
				button.name +
			'</div>';
		}).join('') +
		'<input id="load-input" type="file" style="display:none;" />'
	);
}