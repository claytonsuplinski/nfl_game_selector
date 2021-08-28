SEL.load = {};

SEL.load.schedules = function( p ){
	var p = p || {};

	// Get schedules from https://www.pro-football-reference.com/years/2019/games.htm
	$.get('./assets/data/schedules/' + ( p.year || new Date().getFullYear() ) + '.csv', function (data){
		var lines = data.split('\n');
		lines.forEach(function (line){
			var game = line.split(',');
			var week_number = parseInt(game[0]);
			if(!isNaN(week_number)){
				if(SEL.selector.data.schedule.length < week_number) SEL.selector.data.schedule.push([]);
				if(line.length > 8){
					SEL.selector.data.schedule[week_number-1].push({"away_team": game[3], "home_team": game[6], "week": game[0], "day": game[1],
						"date": game[2], "time": game[8], "home_result": "", "away_result": ""});
				}
				else{
					SEL.selector.data.schedule[week_number-1].push({"away_team": game[3], "home_team": game[5], "week": game[0], "day": game[1],
						"date": game[2], "time": game[6], "home_result": "", "away_result": ""});
				}
			}
		});

		if( p.callback ) p.callback();
	}, "text");
};

SEL.load.teams = function( p ){
	var p = p || {};

	$.getJSON('./assets/data/teams.json', function (data){
		SEL.selector.data.teams = data;
		SEL.selector.data.teams.forEach(function(team){
			team.wins = 0;
			team.losses = 0;
		});
		if( p.callback ) p.callback();
	});
};

SEL.load.prediction = function( p ){
	var p = p || {};

	var year = ( p.year || ( new Date() ).getFullYear() );

	$.ajax({
		url      : './assets/data/predictions/' + year + '.json',
		dataType : 'json',
		success  : function( data ){
			if( p.callback ) p.callback( data );
		},
		error    : function( e ){
			console.log( 'Error : could not load prediction for ' + year + '.' );
			console.log( e );
			if( p.callback ) p.callback();
		}
	});
};

SEL.load.result = function( p ){
	var p = p || {};

	var year = ( p.year || ( new Date() ).getFullYear() );

	$.ajax({
		url      : './assets/data/results/' + ( p.year || new Date().getFullYear() ) + '.csv',
		dataType : 'text',
		success  : function( data ){
			var results = {};

			var lines = data.split('\n');
			lines.unshift();
			lines.forEach(function (line){
				var game = line.split(',');

				var week_name = game[0];
				if( week_name && week_name != 'Week' ){
					if( !results[ week_name ] ) results[ week_name ] = [];

					var winning_score = game[ 8 ];
					var  losing_score = game[ 9 ];
					
					results[ week_name ].push({
						winning_team : game[4],
						 losing_team : game[6],
						week         : game[0],
					});
				}
			});

			if( p.callback ) p.callback( results );
		},
		error    : function( e ){
			console.log( 'Error : could not load results for ' + year + '.' );
			console.log( e );
			if( p.callback ) p.callback();
		}
	});
};

SEL.load.navbar_options = function( options ){
	$( "#bs-navbar-collapse-1" ).html(
		'<ul class="nav navbar-nav text-center">' +		
			( options || [] ).map(function( option ){
				return '<li>' +
					'<a onclick="' + option.onclick + '" data-toggle="modal" data-target="#modal">' + option.name + '</a>' +
				'</li>';
			}).join('') +
		'</ul>'
	);
}