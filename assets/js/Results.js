SEL.results = {};

SEL.results.load = function(){
	var self = this;

	var years = [];
	var curr_year = SEL.vars.start_year;
	var end_year  = ( new Date() ).getFullYear();
	while( curr_year <= end_year ){
		years.push( curr_year );
		curr_year++;
	}

	this.data = {};

	var recursive_loader = function( type, years, callback ){
		if( !years.length ){
			if( callback ) callback();
			return;
		}

		var year = years.pop();
		SEL.load[ type ]({
			year,
			callback : function( data ){
				if( data ){
					if( !self.data[ year ] ) self.data[ year ] = {};
					self.data[ year ][ type ] = data;
				}
				recursive_loader( type, years, callback );
			}
		});
	};

	recursive_loader( 'result', years, function(){
		recursive_loader( 'prediction', Object.keys( self.data ), function(){
			self.compile();
			self.draw();
		} );
	} );
};

SEL.results.compile = function(){
	this.totals   = {};
	this.teams    = {};
	this.playoffs = [
		{ name : 'Wild Card' , result_key : 'WildCard' , conferences : [ 'afc', 'nfc' ], prediction_key : 'wild_card'    },
		{ name : 'Divisional', result_key : 'Division' , conferences : [ 'afc', 'nfc' ], prediction_key : 'divisional'   },
		{ name : 'Conference', result_key : 'ConfChamp', conferences : [ 'afc', 'nfc' ], prediction_key : 'championship' },
		{ name : 'Super Bowl', result_key : 'SuperBowl', conferences : [ 'nfl'        ], prediction_key : 'super_bowl'   },
		{ name : 'Champion'  },
	];
	this.playoff_totals = {};

	Object.keys( this.data ).forEach(function( year ){
		var stats = this.data[ year ];
		stats.prediction.teams.forEach(function( team ){
			if( !this.teams[ team.full_name ]         ) this.teams[ team.full_name ]         = { code : team.code };
			if( !this.teams[ team.full_name ][ year ] ) this.teams[ team.full_name ][ year ] = { num_correct : 0, num_total : 0, games : [] };
		}, this);

		if( !this.totals[ year ] ){
			this.totals[ year ]         = { num_correct : 0, num_total : 0 };
			this.playoff_totals[ year ] = { num_correct : 0, num_total : 0 };
			this.playoffs.forEach(function( group ){
				group[ year ] = { num_correct : 0, num_total : 0 };
			});
		}

		var results = this.data[ year ].result;
		stats.prediction.schedule.forEach(function( prediction_week, week_idx ){
			var week_number = week_idx + 1;

			if( results ){
				var result_week = results[ week_idx + 1 ];
				prediction_week.forEach(function( prediction_game ){
					var teams = [ prediction_game.away_team, prediction_game.home_team ];
					var result_game = result_week.find(function( r ){ return ( teams.includes( r.winning_team ) && teams.includes( r.losing_team ) ); });

					if( [ prediction_game.away_result, prediction_game.home_result ].includes( 'W' ) ){
						var prediction_winner = ( prediction_game.away_result == 'W' ? prediction_game.away_team : prediction_game.home_team );
						var prediction_loser  = ( prediction_game.away_result == 'L' ? prediction_game.away_team : prediction_game.home_team );

						this.teams[ prediction_winner ][ year ].num_total++;
						this.teams[ prediction_loser  ][ year ].num_total++;
						this.totals[ year ].num_total++;

						var individual_game_result = { correct : 0, week : week_number, away : teams[0], home : teams[1] };

						if( prediction_winner == result_game.winning_team ){
							this.teams[ prediction_winner ][ year ].num_correct++;
							this.teams[ prediction_loser  ][ year ].num_correct++;
							this.totals[ year ].num_correct++;
							individual_game_result.correct = 1;
						}

						this.teams[ prediction_winner ][ year ].games.push( individual_game_result );
						this.teams[ prediction_loser  ][ year ].games.push( individual_game_result );
					}
				}, this);
			}
		}, this);

		this.playoffs.filter( x => x.name != 'Champion' ).forEach(function( group ){
			if( results ){
				var result_teams = [];
				results[ group.result_key ].forEach(function( game ){
					result_teams.push( game.winning_team, game.losing_team );
				});

				var prediction_teams = [];
				group.conferences.forEach(function( conference ){
					stats.prediction.playoff[ conference ][ group.prediction_key ].forEach(function( team ){
						prediction_teams.push( team.team.full_name );
					});
				});

				this.playoff_totals[ year ].num_correct += group[ year ].num_correct = prediction_teams.filter( t => result_teams.includes( t ) ).length;
				this.playoff_totals[ year ].num_total   += group[ year ].num_total   = result_teams.length;

				if( group.name == 'Super Bowl' ){
					var champion_group = this.playoffs.find( x => x.name == 'Champion' );
					this.playoff_totals[ year ].num_correct += champion_group[ year ].num_correct = Number( stats.prediction.playoff.champion.team.full_name == results[ group.result_key ][ 0 ].winning_team );
					this.playoff_totals[ year ].num_total   += champion_group[ year ].num_total   = 1;
				}
			}
		}, this);
	}, this);
};

SEL.results.display_year_team_results = function( year, team_name ){
	var tmp_html = '';
	var results = this.teams[ team_name ][ year ];
	results.games.forEach(function( game ){
		tmp_html += '<div class="col-xs-5 col-lg-5 team-schedule-week" style="background-color:' + ( game.away == team_name ? '#013368' : '#666' ) + ';"><div class="hidden-xs">' + game.away + '</div></div>';
		tmp_html += '<div class="col-xs-2 col-lg-2 team-schedule-vs"   style="background-color:' + ( game.correct ? '#199b19' : '#bd1616' ) + ';"><span class="hidden-xs">Week </span>'  + game.week + '</div>';
		tmp_html += '<div class="col-xs-5 col-lg-5 team-schedule-week" style="background-color:' + ( game.home == team_name ? '#013368' : '#333' ) + ';"><div class="hidden-xs">' + game.home + '</div></div>';
	});

	$( "#modal-title" ).html( team_name + " - " + year + ' Results (' + results.num_correct + '/' + results.num_total + ')' );
	$( ".modal-body"  ).html( tmp_html );
};

SEL.results.draw = function(){
	SEL.load.navbar_options();
	$( "#week-container" ).html('');

	var team_names = Object.keys( this.teams ).sort( (a,b) => ( a > b ? 1 : -1 ) );
	var years      = Object.keys( this.data ).sort( (a,b) => ( a > b ? 1 : -1 ) );

	var get_accuracy = function( group ){
		return ( 100 * group.num_correct / group.num_total );
	};

	var get_accuracy_color = function( val ){
		if( val < 50 ){
			return 'rgb(' + [ 255, Math.round( 155 + ( 2 * val ) ), 155 ].join(',') + ')';
		}
		return 'rgb(' + [ Math.round( 255 - ( 2 * ( val - 50 ) ) ), 255, 155 ].join(',') + ')';
	};

	$(".container").html(
		'<div id="results" class="select-game-shadow">' +
			'<div class="title">Regular Season Results</div>' +
			'<table>' +
				'<tr>' +
					'<th>Year</th>' +
					team_names.map(function( team_name ){
						return '<th>' + this.teams[ team_name ].code + '</th>';
					}, this).join('') +
					'<th>Total</th>' +
				'</tr>' +
				years.map(function( year ){
					var totals = this.totals[ year ];
					return '<tr>' + 
						'<td class="row-name">' + year + '</td>' +
						team_names.map(function( team_name ){
							var team = this.teams[ team_name ];
							var team_stats = team[ year ];
							if( !team_stats.num_total ) return '<td class="row-value">???</td>';
							var accuracy = get_accuracy( team_stats );
							return '<td class="row-value year-team" style="background:' + get_accuracy_color( accuracy ) + ';" ' + 
										' data-toggle="modal" data-target="#modal" ' +
										' onclick="SEL.results.display_year_team_results( ' + year + ', \'' + team_name + '\' );">' + 
								accuracy.toFixed(0) + 
							'%</td>';
						}, this).join('') +
						( totals.num_total ?
							'<td class="total row-value" style="background:' + get_accuracy_color( get_accuracy(totals) ) + '">' + get_accuracy( totals ).toFixed(0) + '%</td>' :
							'<td class="row-value">???</td>'
						) +
					'</tr>';
				}, this).join('') +
			'</table>' +
			'<div class="title">Post Season Results</div>' +
			'<table>' +
				'<tr>' +
					'<th>Year</th>' +
					this.playoffs.map(function( group ){
						return '<th>' + group.name + '</th>';
					}, this).join('') +
					'<th>Total</th>' +
				'</tr>' +
				years.map(function( year ){
					var totals = this.playoff_totals[ year ];
					return '<tr>' + 
						'<td class="row-name">' + year + '</td>' +
						this.playoffs.map(function( group ){
							var stats = group[ year ];
							if( !stats.num_total ) return '<td class="row-value">???</td>';
							var accuracy = get_accuracy( stats );
							return '<td class="row-value" style="background:' + get_accuracy_color( accuracy ) + '">' + accuracy.toFixed(0) + '%</td>';
						}, this).join('') +
						( totals.num_total ?
							'<td class="total row-value" style="background:' + get_accuracy_color( get_accuracy(totals) ) + '">' + get_accuracy( totals ).toFixed(0) + '%</td>' :
							'<td class="row-value">???</td>'
						) +
					'</tr>';
				}, this).join('') +
			'</table>' +
		'</div>'
	);
}