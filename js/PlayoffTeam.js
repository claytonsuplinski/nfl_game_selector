function PlayoffTeam(team, seed){
	this.team = team;
	this.seed = seed;
};

PlayoffTeam.prototype.get_html = function(opponent, conference, round){	
	if(this.team == "vs"){
		return '<div class="col-xs-2 col-lg-2 team-schedule-vs" style="background-color:#333;">'+
			'vs</div>';
	}
	if(this.team == "TBA"){
		return '<div class="col-xs-5 col-lg-5 team-schedule-week" style="background-color:#555;">'+
			'<div class="hidden-xs">'+
			'TBA</div></div>';
	}
	
	if(opponent != undefined && opponent.team != "TBA"){
		return '<div class="col-xs-5 col-lg-5 team-schedule-week" '+
			' onclick="tmp_playoff.pick_game(&quot;'+this.team.code+'&quot;, &quot;'+opponent.team.code+'&quot;,'+
			' &quot;'+conference+'&quot;, &quot;'+round+'&quot;);" '+
			' style="background-color:'+
			this.team.color+';background-image:url(\'./teamIcons/'+
			this.team.code+'.png\');"><div class="hidden-xs">'+
			"("+this.seed+") "+this.team.code+'</div></div>';
	}
	
	return '<div class="col-xs-5 col-lg-5 team-schedule-week" style="background-color:'+
			this.team.color+';background-image:url(\'./teamIcons/'+
			this.team.code+'.png\');"><div class="hidden-xs">'+
			"("+this.seed+") "+this.team.code+'</div></div>';
};

PlayoffTeam.prototype.get_champion_html = function(){
	if(this.team == "TBA"){
		return '<div class="col-xs-12 col-lg-12 team-schedule-week" style="background-color:#555;text-align:center;">'+
			'<div class="hidden-xs">'+
			'TBA</div></div>';
	}
	return '<div class="col-xs-12 col-lg-12 team-schedule-week" style="background-color:'+
			this.team.color+';background-image:url(\'./teamIcons/'+
			this.team.code+'.png\'); text-align:center;">'+
			this.team.full_name+'</div>';
};