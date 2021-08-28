SEL.schedule = {};

SEL.schedule.draw = function(){
	var tmp_html = "";
	var conferences = ["AFC", "NFC"];
	var divisions = ["North", "South", "East", "West"];
	conferences.forEach(function (conference){
		tmp_html += "<div class='col-xs-12 standings-conference' style='background:"+(conference == "AFC" ? "#DB2128" : "#033A75" )+"'>"+conference+"</div>";
		divisions.forEach(function (division){
			var division_teams = SEL.selector.data.teams.filter(function (team) { 
				return team.conference == conference && team.division == division;
			});
			tmp_html += "<div class='col-md-1 col-xs-2 standings-division'>";
				tmp_html += division[0];
			tmp_html += "</div>";
			tmp_html += "<div class='col-md-2 col-xs-10 division-container'>";
			division_teams.forEach(function (team){
				tmp_html += "<div class='col-xs-12 team-schedule' onclick='SEL.schedule.draw_team(\""+team.code+"\");' style='background-color:"+team.color+";background-image:url(\"" + SEL.selector.get_team_icon( team ) + "\");'>"+team.code+"</div>";
			});
			tmp_html += "</div>";
		});
	});	
	$("#modal-title").html("Schedule");
	$(".modal-body").html(tmp_html);
}

SEL.schedule.draw_team = function(code){
	var team = SEL.selector.data.teams.filter(function (team) { 
		return team.code == code;
	})[0];
	var tmp_html = "";
	SEL.selector.data.schedule.forEach(function (week, week_number){
		var game = week.filter(function (game) { 
			return (game.away_team == team.full_name || game.home_team == team.full_name);
		});
		if(game.length > 0){
			game = game[0];
			var game_index = week.indexOf(game);
			var away_team = SEL.selector.data.teams.filter(function (team) { 
				return team.full_name == game.away_team;
			})[0];
			var home_team = SEL.selector.data.teams.filter(function (team) { 
				return team.full_name == game.home_team;
			})[0];
			var win_color = "";
			if(game.home_result == "W"){
				win_color = home_team.color;
			}
			if(game.away_result == "W"){
				win_color = away_team.color;
			}
			tmp_html += '<div class="col-xs-5 col-lg-5 team-schedule-week" onclick="SEL.selector.select_game('+game_index+', 0, '+week_number+');SEL.schedule.draw_team(\''+code+'\');" style="background-color:'+away_team.color+';background-image:url(\'' + SEL.selector.get_team_icon( away_team ) + '\');"><div class="hidden-xs">'+game.away_team+'</div></div>';
			tmp_html += '<div class="col-xs-2 col-lg-2 team-schedule-vs" style="background-color:'+win_color+';"><span class="hidden-xs">Week </span>'+(week_number+1)+'</div>';
			tmp_html += '<div class="col-xs-5 col-lg-5 team-schedule-week" onclick="SEL.selector.select_game('+game_index+', 1, '+week_number+');SEL.schedule.draw_team(\''+code+'\');" style="background-color:'+home_team.color+';background-image:url(\'' + SEL.selector.get_team_icon( home_team ) + '\');"><div class="hidden-xs">'+game.home_team+'</div></div>';
		}
		else{//Bye Week
			tmp_html += '<div class="col-xs-12 team-schedule-vs">BYE</div>';
		}
	});
	$("#modal-title").html(team.full_name + "&nbsp;&nbsp;<button class='btn btn-primary btn-xs' onclick='SEL.schedule.draw();'>Back</button>");
	$(".modal-body").html(tmp_html);
}
