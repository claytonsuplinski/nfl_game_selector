function select_game(index, home, week){
	var game = schedule_data[week][index];
	
	var away_team = teams.filter(function (team) { 
		return team.full_name == game.away_team;
	})[0];
	var home_team = teams.filter(function (team) { 
		return team.full_name == game.home_team;
	})[0];
	
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
	load_week();
}