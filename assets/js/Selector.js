SEL.selector = {};

SEL.selector.init = function(){
	SEL.load.navbar_options([
		{ name : 'Schedule' , onclick : 'SEL.schedule.draw();'  },
		{ name : 'Standings', onclick : 'SEL.standings.draw();' },
		{ name : 'Save/Load', onclick : 'SEL.save.draw();'      },
	]);
	this.load_weeks();
	SEL.playoff.init();
};

SEL.selector.load = function(){
	var self = this;

	this.data = { schedule : [], curr_week : 0, week_index : 0, weeks : [], year : ( new Date() ).getFullYear() };

	SEL.load.schedules({
		callback : function(){
			SEL.load.teams({
				callback : function(){
					self.init();
					self.draw();
				}
			});
		}
	});
};

SEL.selector.load_weeks = function(){
	this.data.weeks = [];
	for( var i=0; i < this.data.schedule.length; i++ ) this.data.weeks.push({ name : i+1 });
	this.data.weeks.push({ name : 'WC', onclick : 'SEL.playoff.select_round(\'Wild Card\');'                });
	this.data.weeks.push({ name : 'DV', onclick : 'SEL.playoff.select_round(\'Divisional Round\');'         });
	this.data.weeks.push({ name : 'CH', onclick : 'SEL.playoff.select_round(\'Conference Championships\');' });
	this.data.weeks.push({ name : 'SB', onclick : 'SEL.playoff.select_round(\'Super Bowl\');'               });
};

SEL.selector.select_game = function(index, home, week){
	var game = this.data.schedule[week][index];
	
	var away_team = this.data.teams.find(function (team) { 
		return team.full_name == game.away_team;
	});
	var home_team = this.data.teams.find(function (team) { 
		return team.full_name == game.home_team;
	});
	
	if(home && game.home_result != "W"){
		if(game.away_result == "W"){
			away_team.wins--;
			home_team.losses--;
		}
		home_team.wins++;
		game.home_result = "W";
		away_team.losses++;
		game.away_result = "L";
	}
	else if(!home && game.away_result != "W"){
		if(game.home_result == "W"){
			home_team.wins--;
			away_team.losses--;
		}
		home_team.losses++;
		game.home_result = "L";
		away_team.wins++;
		game.away_result = "W";
	}

	SEL.playoff.reset();

	this.draw();
}

SEL.selector.week_header_html = function( label ){
	return "<div class='col-xs-12 week-header select-game-shadow'>" + label + "</div>";
};

SEL.selector.get_team_icon = function( team ){
	return './assets/img/team_logos/' + team.code + '.png';
};

SEL.selector.game_html = function( game, game_index ){
	var away_team = this.data.teams.find(function(team){ return team.full_name == game.away_team; });
	var home_team = this.data.teams.find(function(team){ return team.full_name == game.home_team; });

	var home_color = home_team.color;
	var away_color = away_team.color;
	var  win_color = "";
	if     ( game.away_result == "W" ) home_color = away_color = win_color = away_team.color;
	else if( game.home_result == "W" ) home_color = away_color = win_color = home_team.color;

	return '<div class="col-md-6 col-xs-12 select-game">' +
		'<div class="col-xs-12 select-game-shadow">' +
			'<div class="col-md-12">' +
				'<div class="col-md-4 col-xs-12 select-date" style="background-color:' + home_color + ';">' +
					game.date +
				'</div>' +
				'<div class="col-md-4 col-xs-12 select-date select-day" style="background-color:' + win_color + ';">' +
					game.day +
				'</div>' +
				'<div class="col-md-4 col-xs-12 select-date select-time" style="background-color:' + home_color + ';">' +
					game.time +
				'</div>' +
			'</div>' +
			'<div class="col-xs-12">' +
				'<div class="col-xs-4 team-code" style="background-color:' + away_color + ';">' +
					away_team.code + " (" + away_team.wins + "-" + away_team.losses + ")" +
					"<br>" + game.away_result +
				'</div>' +
				'<div class="col-xs-8 select-team select-away-team" onclick="SEL.selector.select_game(' + game_index + ', 0, ' + this.data.curr_week + ');" style="background-color:' + win_color + ';background-image:url(\'' + this.get_team_icon( away_team ) + '\');">' +
				'</div>' +
				'<div class="col-xs-4 team-code" style="background-color:' + home_color + ';">' +
					home_team.code + " (" + home_team.wins + "-" + home_team.losses + ")" +
					"<br>" + game.home_result +
				'</div>' +
				'<div class="col-xs-8 select-team select-home-team" onclick="SEL.selector.select_game(' + game_index + ', 1, ' + this.data.curr_week + ');" style="background-color:' + home_color + ';background-image:url(\'' + this.get_team_icon( home_team ) + '\');">' +
				'</div>' +
			'</div>' +
		'</div>' +
	'</div>';
};

SEL.selector.draw_week_navbar = function(){
	var curr_week = this.data.curr_week;
	if( curr_week == -1 ) curr_week = this.data.playoff.curr_round.index + this.data.schedule.length;
	$("#week-container").html(
		'<table><tr>' +
			this.data.weeks.map(function( week, i ){
				var onclick = 'SEL.selector.set_week_index(' + i + ');' + ( week.onclick || 'SEL.selector.select_week(' + i + ');' );
				return '<td onclick="' + onclick + '" ' + ( curr_week == i ? 'class="active"' : '' ) + '>' +
					week.name +
				'</td>';
			}, this).join('') +
		'</tr></table>'
	);
}

SEL.selector.set_week_index = function( idx ){
	this.data.week_index = idx;
};

SEL.selector.next_week = function( offset ){
	var week_index = ( this.data.week_index + offset ) % this.data.weeks.length;
	while( week_index < 0 ) week_index += this.data.weeks.length;
	this.set_week_index( week_index );
	var week = this.data.weeks[ week_index ];
	if( week.onclick ) eval( week.onclick );
	else               this.select_week( week_index );
};

SEL.selector.select_week = function( idx ){
	this.data.curr_week = idx;
	this.draw();
	$( "body" ).scrollTop( 0 );
}

SEL.selector.draw = function(){
	if( this.data.curr_week == -1 ) SEL.playoff.draw();
	else{
		$('.container').html(
			this.week_header_html( 'Week ' + ( this.data.curr_week + 1 ) ) +
			this.data.schedule[ this.data.curr_week ].map(function( game, game_index ){ return this.game_html( game, game_index ); }, this).join('')
		);
	}
	this.draw_week_navbar();
}