function load_standings(){
	var tmp_html = "";
	var conferences = ["AFC", "NFC"];
	var divisions = ["North", "South", "East", "West"];
	conferences.forEach(function (conference){
		tmp_html += "<div class='col-xs-12 standings-conference' style='background:"+(conference == "AFC" ? "#DB2128" : "#033A75" )+"'>"+conference+"</div>";
		divisions.forEach(function (division){
			var division_teams = teams.filter(function (team) { 
				return team.conference == conference && team.division == division;
			});
			
			function compare(a,b) {
			  if (a.last_nom < b.last_nom)
				return -1;
			  if (a.last_nom > b.last_nom)
				return 1;
			  return 0;
			}

			division_teams.sort(function (a, b){
				if (a.wins > b.wins){return -1;}
				if (a.wins < b.wins){return 1;}
				return 0;
			});
			
			division_teams.sort(function (a, b){
				if (a.losses > b.losses){return 1;}
				if (a.losses < b.losses){return -1;}
				return 0;
			});
			
			division_teams.sort(function (a, b){
				var a_wp = (a.wins + a.losses > 0 ? a.wins / (a.wins + a.losses) : 0);
				var b_wp = (b.wins + b.losses > 0 ? b.wins / (b.wins + b.losses) : 0);
				if (a_wp > b_wp){return -1;}
				if (a_wp < b_wp){return 1;}
				return 0;
			});	
			
			tmp_html += "<div class='col-md-1 col-xs-2 standings-division'>";
				tmp_html += division[0];
			tmp_html += "</div>";
			tmp_html += "<div class='col-md-2 col-xs-10 division-container'>";
			division_teams.forEach(function (team){
				tmp_html += "<div class='col-xs-12 team-record' style='background-color:"+team.color+";background-image:url(\"./teamIcons/"+team.code+".png\");'>";
				tmp_html += "<span class='standings-code'>" + team.code + "</span>&nbsp;";
				tmp_html += team.wins + "-" + team.losses;
				tmp_html += "</div>";
			});
			tmp_html += "</div>";
		});
	});	
	$("#standings-title").html("Standings");
	$("#standings-container").html(tmp_html);
}