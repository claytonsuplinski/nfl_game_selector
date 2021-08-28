SEL.playoff = {};

SEL.playoff.init = function(){
	this.tba = { team : 'TBA', seed : -1 };

	this.rounds = [
		{ name : 'Wild Card'               , key : 'wild_card'   , conferences : [ 'afc', 'nfc' ] },
		{ name : 'Divisional Round'        , key : 'divisional'  , conferences : [ 'afc', 'nfc' ] },
		{ name : 'Conference Championships', key : 'championship', conferences : [ 'afc', 'nfc' ] },
		{ name : 'Super Bowl'              , key : 'super_bowl'  , conferences : [ 'nfl'        ] }
	];
	this.rounds.forEach(function( r, i ){ r.index = i; });
	
	if( !SEL.selector.data.playoff ){
		SEL.selector.data.playoff = {
			curr_round : this.rounds[ 0 ],
			champion   : this.tba,
			nfl        : {
				super_bowl   : [this.tba, this.tba]
			},
			afc        : {
				teams        : [this.tba, this.tba, this.tba, this.tba, this.tba, this.tba],
				wild_card    : [this.tba, this.tba, this.tba, this.tba],
				divisional   : [this.tba, this.tba, this.tba, this.tba],
				championship : [this.tba, this.tba],
			},
			nfc        : {
				teams        : [this.tba, this.tba, this.tba, this.tba, this.tba, this.tba],
				wild_card    : [this.tba, this.tba, this.tba, this.tba],
				divisional   : [this.tba, this.tba, this.tba, this.tba],
				championship : [this.tba, this.tba],
			},
		};
	
		var tmp_divisions = [
			"AFC North",
			"AFC South",
			"AFC East",
			"AFC West",
			"NFC North",
			"NFC South",
			"NFC East",
			"NFC West"
		];
		
		var sorted_teams = SEL.selector.data.teams;
		
		sorted_teams.sort(function (a, b){
			if (a.wins > b.wins){return -1;}
			if (a.wins < b.wins){return 1;}
			return 0;
		});
		
		sorted_teams.sort(function (a, b){
			if (a.losses > b.losses){return 1;}
			if (a.losses < b.losses){return -1;}
			return 0;
		});
		
		sorted_teams.sort(function (a, b){
			var a_wp = (a.wins + a.losses > 0 ? a.wins / (a.wins + a.losses) : 0);
			var b_wp = (b.wins + b.losses > 0 ? b.wins / (b.wins + b.losses) : 0);
			if (a_wp > b_wp){return -1;}
			if (a_wp < b_wp){return 1;}
			return 0;
		});	
		
		var afc_division = 0;
		var nfc_division = 0;
		var afc_wild_card = 0;
		var nfc_wild_card = 0;
		sorted_teams.forEach(function(team){
			if(team.conference == "AFC"){
				var division_index = tmp_divisions.indexOf(team.conference + " " + team.division);
				if(division_index != -1){
					var tmp_team = { team, seed : 1+afc_division };
					SEL.selector.data.playoff.afc.teams[afc_division] = tmp_team;
					if(afc_division < 1){
						SEL.selector.data.playoff.afc.divisional[1 + afc_division] = tmp_team;
					}
					else{
						SEL.selector.data.playoff.afc.wild_card[6-afc_division] = tmp_team;
					}
					afc_division++;
					tmp_divisions.splice(division_index, 1);
				}
				else if(afc_wild_card < 3){
					var tmp_team = { team, seed : 5+afc_wild_card };
					SEL.selector.data.playoff.afc.teams[4+afc_wild_card] = tmp_team;
					afc_wild_card++;
					SEL.selector.data.playoff.afc.wild_card[3 - afc_wild_card] = tmp_team;
				}
			}
			else if(team.conference == "NFC"){
				var division_index = tmp_divisions.indexOf(team.conference + " " + team.division);
				if(division_index != -1){
					var tmp_team = { team, seed : 1+nfc_division };
					SEL.selector.data.playoff.nfc.teams[nfc_division] = tmp_team;
					if(nfc_division < 1){
						SEL.selector.data.playoff.nfc.divisional[1 + nfc_division] = tmp_team;
					}
					else{
						SEL.selector.data.playoff.nfc.wild_card[6-nfc_division] = tmp_team;
					}
					nfc_division++;
					tmp_divisions.splice(division_index, 1);
				}
				else if(nfc_wild_card < 3){
					var tmp_team = { team, seed : 5+nfc_wild_card };
					SEL.selector.data.playoff.nfc.teams[4+nfc_wild_card] = tmp_team;
					nfc_wild_card++;
					SEL.selector.data.playoff.nfc.wild_card[3 - nfc_wild_card] = tmp_team;
				}
			}
		});
		
		this.sort_round(SEL.selector.data.playoff.afc.wild_card);
		this.sort_round(SEL.selector.data.playoff.nfc.wild_card);
		this.sort_round(SEL.selector.data.playoff.afc.divisional);
		this.sort_round(SEL.selector.data.playoff.nfc.divisional);
	}

	this.update_schedule();
};

SEL.playoff.reset = function(){
	SEL.selector.data.playoff = false;
	this.init();
};

SEL.playoff.select_round = function( round_name ){
	var round = this.rounds.find( r => r.name == round_name );
	if( round ){
		this.update_schedule();
		SEL.selector.data.playoff.curr_round = round;
		SEL.selector.data.curr_week = -1;
		SEL.selector.draw_week_navbar();
		this.draw();
		$( "body" ).scrollTop( 0 );
	}
};

SEL.playoff.get_round_teams = function( conference, round ){
	var output = [];
	for(var i=0; i< SEL.selector.data.playoff[conference][round].length/2; i++){
		var away_team = SEL.selector.data.playoff[conference][round][i];
		var home_team = SEL.selector.data.playoff[conference][round][ SEL.selector.data.playoff[conference][round].length - 1 - i ];
		output.push([ away_team, home_team ]);
	}
	return output;
};

SEL.playoff.update_schedule = function(){
	this.schedule = [];
	this.rounds.forEach(function( round ){
		var curr_round = [];
		round.conferences.forEach(function( conference ){
			this.get_round_teams( conference, round.key ).forEach(function( game ){
				var away = game[ 0 ];
				var home = game[ 1 ];
				var result = this.get_game_result( conference, round.index, away.team.code, home.team.code );
				curr_round.push({
					away_result : result.away_result,
					home_result : result.home_result,
					away_team   : away.team.full_name || 'TBA',
					home_team   : home.team.full_name || 'TBA',
					away_code   : away.team.code      || 'TBA',
					home_code   : home.team.code      || 'TBA',
					away_seed   : away.seed,
					home_seed   : home.seed,
					conference,
					round,
				});
			}, this);
		}, this);
		this.schedule.push( curr_round );
	}, this);
};

SEL.playoff.get_game_result = function( conference, round_index, away, home ){
	if( ![ away, home ].includes( undefined ) ){
		var next_round_teams = [ SEL.selector.data.playoff.champion ];
		if( round_index < this.rounds.length - 1 ){
			var next_round_index = round_index + 1;
			var next_round = this.rounds[ next_round_index ];
			var next_conference = ( next_round.conferences.includes( conference ) ? conference : 'nfl' );
			next_round_teams = this.get_round_teams( next_conference, next_round.key );
		}

		next_round_teams = next_round_teams.flat().filter( t => t.team );
		if     ( next_round_teams.find( t => t.team.code == home ) && !next_round_teams.find( t => t.team_code == away ) ) return { away_result : 'L', home_result : 'W' };
		else if( next_round_teams.find( t => t.team.code == away ) && !next_round_teams.find( t => t.team_code == home ) ) return { away_result : 'W', home_result : 'L' };
	}
	return { away_result : '', home_result : '' };
};

SEL.playoff.in_round = function(team, round){
	return (round.filter(function (t) { 
		return t == team;
	}).length > 0 ? true : false);
};

SEL.playoff.sort_round = function(round){
	return round.sort(function (a, b){
		if (a.seed > b.seed){return -1;}
		if (a.seed < b.seed){return 1;}
		return 0;
	});
};

SEL.playoff.select_game = function( winner, loser, conference, round, game_index ){ 
	var winning_team = SEL.selector.data.playoff[conference][round].find(function (team) { 
		return team.team.code == winner;
	});
	var losing_team = SEL.selector.data.playoff[conference][round].find(function (team) { 
		return team.team.code == loser;
	});
	
	switch(round){
		case "wild_card":
			if(this.in_round(losing_team, SEL.selector.data.playoff[ conference ]["divisional"])){
				SEL.selector.data.playoff[ conference ]["divisional"][SEL.selector.data.playoff[ conference ]["divisional"].indexOf(losing_team)] = winning_team;
				if(this.in_round(losing_team, SEL.selector.data.playoff[ conference ]["championship"])){
					SEL.selector.data.playoff[ conference ]["championship"][SEL.selector.data.playoff[ conference ]["championship"].indexOf(losing_team)] = this.tba;
					SEL.selector.data.playoff[ conference ]["championship"] = this.sort_round(SEL.selector.data.playoff[ conference ]["championship"]);
					if(this.in_round(losing_team, SEL.selector.data.playoff[ "nfl" ]["super_bowl"])){
						SEL.selector.data.playoff[ "nfl" ]["super_bowl"][SEL.selector.data.playoff[ "nfl" ]["super_bowl"].indexOf(losing_team)] = this.tba;
						SEL.selector.data.playoff[ "nfl" ]["super_bowl"] = this.sort_round(SEL.selector.data.playoff[ "nfl" ]["super_bowl"]);
						if(SEL.selector.data.playoff.champion == losing_team){
							SEL.selector.data.playoff.champion = this.tba;
						}
					}
				}
			}
			else if(!this.in_round(winning_team, SEL.selector.data.playoff[ conference ]["divisional"])){
				SEL.selector.data.playoff[ conference ]["divisional"][SEL.selector.data.playoff[ conference ]["divisional"].indexOf(this.tba)] = winning_team;
			}
			SEL.selector.data.playoff[ conference ]["divisional"] = this.sort_round(SEL.selector.data.playoff[ conference ]["divisional"]);
			break;
		case "divisional":
			if(this.in_round(losing_team, SEL.selector.data.playoff[ conference ]["championship"])){
				SEL.selector.data.playoff[ conference ]["championship"][SEL.selector.data.playoff[ conference ]["championship"].indexOf(losing_team)] = winning_team;
				SEL.selector.data.playoff[ conference ]["championship"] = this.sort_round(SEL.selector.data.playoff[ conference ]["championship"]);
				if(this.in_round(losing_team, SEL.selector.data.playoff[ "nfl" ]["super_bowl"])){
					SEL.selector.data.playoff[ "nfl" ]["super_bowl"][SEL.selector.data.playoff[ "nfl" ]["super_bowl"].indexOf(losing_team)] = this.tba;
					SEL.selector.data.playoff[ "nfl" ]["super_bowl"] = this.sort_round(SEL.selector.data.playoff[ "nfl" ]["super_bowl"]);
					if(SEL.selector.data.playoff.champion == losing_team){
						SEL.selector.data.playoff.champion = this.tba;
					}
				}
			}			
			else if(!this.in_round(winning_team, SEL.selector.data.playoff[ conference ]["championship"])){
				SEL.selector.data.playoff[ conference ]["championship"][SEL.selector.data.playoff[ conference ]["championship"].indexOf(this.tba)] = winning_team;
			}
			SEL.selector.data.playoff[ conference ]["championship"] = this.sort_round(SEL.selector.data.playoff[ conference ]["championship"]);
			break;
		case "championship":
			if(this.in_round(losing_team, SEL.selector.data.playoff[ "nfl" ]["super_bowl"])){
				SEL.selector.data.playoff[ "nfl" ]["super_bowl"][SEL.selector.data.playoff[ "nfl" ]["super_bowl"].indexOf(losing_team)] = winning_team;
				SEL.selector.data.playoff[ "nfl" ]["super_bowl"] = this.sort_round(SEL.selector.data.playoff[ "nfl" ]["super_bowl"]);
				if(SEL.selector.data.playoff.champion == losing_team){
					SEL.selector.data.playoff.champion = this.tba;
				}
			}
			else if(!this.in_round(winning_team, SEL.selector.data.playoff[ "nfl" ]["super_bowl"])){
				SEL.selector.data.playoff[ "nfl" ]["super_bowl"][SEL.selector.data.playoff[ "nfl" ]["super_bowl"].indexOf(this.tba)] = winning_team;
			}
			SEL.selector.data.playoff[ "nfl" ]["super_bowl"] = this.sort_round(SEL.selector.data.playoff[ "nfl" ]["super_bowl"]);
			break;
		case "super_bowl":
			SEL.selector.data.playoff.champion = winning_team;
			break;
	};

	var game = this.schedule[ SEL.selector.data.playoff.curr_round.index ][ game_index ];
	if( winner == game.away_code ){
		game.away_result = 'W';
		game.home_result = 'L';
	}
	else if( winner == game.home_code ){
		game.home_result = 'W';
		game.away_result = 'L';
	}

	this.draw();
};

SEL.playoff.game_html = function( game, game_index ){
	var away_team = SEL.selector.data.teams.find(function(team){ return team.full_name == game.away_team; }) || this.tba;
	var home_team = SEL.selector.data.teams.find(function(team){ return team.full_name == game.home_team; }) || this.tba;

	var home_color = home_team.color || '#777';
	var away_color = away_team.color || '#777';
	var  win_color = "";
	if     ( game.away_result == "W" ) home_color = away_color = win_color = away_team.color;
	else if( game.home_result == "W" ) home_color = away_color = win_color = home_team.color;

	var home_onclick = 'SEL.playoff.select_game(' + [ home_team.code, away_team.code, game.conference, game.round.key ].map( x => '\'' + x + '\'' ).join(',') + ', ' + game_index + ');';
	var away_onclick = 'SEL.playoff.select_game(' + [ away_team.code, home_team.code, game.conference, game.round.key ].map( x => '\'' + x + '\'' ).join(',') + ', ' + game_index + ');';
	if( [ home_team.team, away_team.team ].includes( 'TBA' ) ) home_onclick = away_onclick = '';

	return '<div class="col-md-6 col-xs-12 select-game">' +
		'<div class="col-xs-12 select-game-shadow">' +
			'<div class="col-md-12">' +
				'<div class="col-md-4 col-xs-12 select-date" style="background-color:' + home_color + ';">' +
					game.conference.toUpperCase() +
				'</div>' +
				'<div class="col-md-4 col-xs-12 select-date select-day" style="background-color:' + win_color + ';"></div>' +
				'<div class="col-md-4 col-xs-12 select-date select-time" style="background-color:' + home_color + ';">' +
					game.round.name +
				'</div>' +
			'</div>' +
			'<div class="col-xs-12">' +
				'<div class="col-xs-4 team-code" style="background-color:' + away_color + ';">' +
					( game.away_seed == -1 ? '' : "(" + game.away_seed + ") " ) +
					( away_team.code || 'TBA' ) +
					"<br>" + game.away_result +
				'</div>' +
				'<div class="col-xs-8 select-team select-away-team" onclick="' + away_onclick + '" style="background-color:' + win_color + ';background-image:url(\'' + SEL.selector.get_team_icon( away_team ) + '\');">' +
				'</div>' +
				'<div class="col-xs-4 team-code" style="background-color:' + home_color + ';">' +
					( game.home_seed == -1 ? '' : "(" + game.home_seed + ") " ) + 
					( home_team.code || 'TBA' ) +
					"<br>" + game.home_result +
				'</div>' +
				'<div class="col-xs-8 select-team select-home-team" onclick="' + home_onclick + '" style="background-color:' + home_color + ';background-image:url(\'' + SEL.selector.get_team_icon( home_team ) + '\');">' +
				'</div>' +
			'</div>' +
		'</div>' +
	'</div>';
};

SEL.playoff.draw = function(){
	$( ".container" ).html(
		SEL.selector.week_header_html( SEL.selector.data.playoff.curr_round.name ) +
		this.schedule[ SEL.selector.data.playoff.curr_round.index ].map(function( game, game_index ){
			return this.game_html( game, game_index );
		}, this).join('')
	);
};