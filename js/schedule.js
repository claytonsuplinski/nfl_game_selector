function load_schedule(){
	var tmp_html = "";
	var conferences = ["AFC", "NFC"];
	var divisions = ["North", "South", "East", "West"];
	conferences.forEach(function (conference){
		tmp_html += "<div class='col-xs-12 standings-conference' style='background:"+(conference == "AFC" ? "#DB2128" : "#033A75" )+"'>"+conference+"</div>";
		divisions.forEach(function (division){
			var division_teams = teams.filter(function (team) { 
				return team.conference == conference && team.division == division;
			});
			tmp_html += "<div class='col-md-1 col-xs-2 standings-division'>";
				tmp_html += division[0];
			tmp_html += "</div>";
			tmp_html += "<div class='col-md-2 col-xs-10 division-container'>";
			division_teams.forEach(function (team){
				tmp_html += "<div class='col-xs-12 team-schedule' onclick='load_team_schedule(\""+team.code+"\");' style='background-color:"+team.color+";background-image:url(\"./teamIcons/"+team.code+".png\");'>"+team.code+"</div>";
			});
			tmp_html += "</div>";
		});
	});	
	$("#standings-title").html("Schedule");
	$("#standings-container").html(tmp_html);
}

function load_team_schedule(code){
	var team = teams.filter(function (team) { 
		return team.code == code;
	})[0];
	var tmp_html = "";
	schedule_data.forEach(function (week, week_number){
		var game = week.filter(function (game) { 
			return (game.away_team == team.full_name || game.home_team == team.full_name);
		});
		if(game.length > 0){
			game = game[0];
			var game_index = week.indexOf(game);
			var away_team = teams.filter(function (team) { 
				return team.full_name == game.away_team;
			})[0];
			var home_team = teams.filter(function (team) { 
				return team.full_name == game.home_team;
			})[0];
			var win_color = "";
			if(game.home_result == "W"){
				win_color = home_team.color;
			}
			if(game.away_result == "W"){
				win_color = away_team.color;
			}
			tmp_html += '<div class="col-xs-5 col-lg-5 team-schedule-week" onclick="select_game('+game_index+', 0, '+week_number+');load_team_schedule(\''+code+'\');" style="background-color:'+away_team.color+';background-image:url(\'./teamIcons/'+away_team.code+'.png\');"><div class="hidden-xs">'+game.away_team+'</div></div>';
			tmp_html += '<div class="col-xs-2 col-lg-2 team-schedule-vs" style="background-color:'+win_color+';"><span class="hidden-xs">Week </span>'+(week_number+1)+'</div>';
			tmp_html += '<div class="col-xs-5 col-lg-5 team-schedule-week" onclick="select_game('+game_index+', 1, '+week_number+');load_team_schedule(\''+code+'\');" style="background-color:'+home_team.color+';background-image:url(\'./teamIcons/'+home_team.code+'.png\');"><div class="hidden-xs">'+game.home_team+'</div></div>';
		}
		else{//Bye Week
			tmp_html += '<div class="col-xs-12 team-schedule-vs">BYE</div>';
		}
	});
	$("#standings-title").html(team.full_name + "&nbsp;&nbsp;<button class='btn btn-primary btn-xs' onclick='load_schedule();'>Back</button>");
	$("#standings-container").html(tmp_html);
}
