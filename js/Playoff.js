function Playoff(){
	
	this.vs = new PlayoffTeam("vs", -1);
	this.tba = new PlayoffTeam("TBA", 999);
	
	this.afc = "";
	this.nfc = "";
	
	this.champion = this.tba;
	
	this.init();
};

Playoff.prototype.init = function(){
	this.nfl = {};
	this.afc = {};
	this.nfc = {};
	this.afc.teams = [this.tba, this.tba, this.tba, this.tba, this.tba, this.tba];
	this.nfc.teams = [this.tba, this.tba, this.tba, this.tba, this.tba, this.tba];
	this.afc.wild_card = [this.tba, this.tba, this.tba, this.tba];
	this.nfc.wild_card = [this.tba, this.tba, this.tba, this.tba];
	this.afc.divisional = [this.tba, this.tba, this.tba, this.tba];
	this.nfc.divisional = [this.tba, this.tba, this.tba, this.tba];
	this.afc.championship = [this.tba, this.tba];
	this.nfc.championship = [this.tba, this.tba];
	this.nfl.super_bowl = [this.tba, this.tba];
	
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
	
	var sorted_teams = teams;
	
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
	var self = this;
	sorted_teams.forEach(function(team){
		if(team.conference == "AFC"){
			var division_index = tmp_divisions.indexOf(team.conference + " " + team.division);
			if(division_index != -1){
				var tmp_team = new PlayoffTeam(team, 1+afc_division)
				self.afc.teams[afc_division] = tmp_team;
				if(afc_division < 1){
					self.afc.divisional[1 + afc_division] = tmp_team;
				}
				else{
					self.afc.wild_card[6-afc_division] = tmp_team;
				}
				afc_division++;
				tmp_divisions.splice(division_index, 1);
			}
			else if(afc_wild_card < 3){
				var tmp_team = new PlayoffTeam(team, 5+afc_wild_card)
				self.afc.teams[4+afc_wild_card] = tmp_team;
				afc_wild_card++;
				self.afc.wild_card[3 - afc_wild_card] = tmp_team;
			}
		}
		else if(team.conference == "NFC"){
			var division_index = tmp_divisions.indexOf(team.conference + " " + team.division);
			if(division_index != -1){
				var tmp_team = new PlayoffTeam(team, 1+nfc_division)
				self.nfc.teams[nfc_division] = tmp_team;
				if(nfc_division < 1){
					self.nfc.divisional[1 + nfc_division] = tmp_team;
				}
				else{
					self.nfc.wild_card[6-nfc_division] = tmp_team;
				}
				nfc_division++;
				tmp_divisions.splice(division_index, 1);
			}
			else if(nfc_wild_card < 3){
				var tmp_team = new PlayoffTeam(team, 5+nfc_wild_card);
				self.nfc.teams[4+nfc_wild_card] = tmp_team;
				nfc_wild_card++;
				self.nfc.wild_card[3 - nfc_wild_card] = tmp_team;
			}
		}
	});
	
	this.sort_round(this.afc.wild_card);
	this.sort_round(this.nfc.wild_card);
	this.sort_round(this.afc.divisional);
	this.sort_round(this.nfc.divisional);
};

Playoff.prototype.get_playoff_round_html = function(conference, round){
	var tmp_html = "";
	for(var i=0; i< this[conference][round].length/2; i++){
		var away_team = this[conference][round][i];
		var home_team = this[conference][round][this[conference][round].length - 1 - i];
		tmp_html += away_team.get_html(home_team, conference, round);
		tmp_html += this.vs.get_html();
		tmp_html += home_team.get_html(away_team, conference, round);
	}
	return tmp_html;
};

Playoff.prototype.in_round = function(team, round){
	return (round.filter(function (t) { 
		return t == team;
	}).length > 0 ? true : false);
};

Playoff.prototype.sort_round = function(round){
	return round.sort(function (a, b){
		if (a.seed > b.seed){return -1;}
		if (a.seed < b.seed){return 1;}
		return 0;
	});
};

Playoff.prototype.pick_game = function(winner, loser, conference, round){
	var winning_team = this[conference][round].filter(function (team) { 
		return team.team.code == winner;
	})[0];
	var losing_team = this[conference][round].filter(function (team) { 
		return team.team.code == loser;
	})[0];
	
	switch(round){
		case "wild_card":
			if(this.in_round(losing_team, this[conference]["divisional"])){
				this[conference]["divisional"][this[conference]["divisional"].indexOf(losing_team)] = winning_team;
				if(this.in_round(losing_team, this[conference]["championship"])){
					this[conference]["championship"][this[conference]["championship"].indexOf(losing_team)] = this.tba;
					this[conference]["championship"] = this.sort_round(this[conference]["championship"]);
					if(this.in_round(losing_team, this["nfl"]["super_bowl"])){
						this["nfl"]["super_bowl"][this["nfl"]["super_bowl"].indexOf(losing_team)] = this.tba;
						this["nfl"]["super_bowl"] = this.sort_round(this["nfl"]["super_bowl"]);
						if(this.champion == losing_team){
							this.champion = this.tba;
						}
					}
				}
			}
			else if(!this.in_round(winning_team, this[conference]["divisional"])){
				this[conference]["divisional"][this[conference]["divisional"].indexOf(this.tba)] = winning_team;
			}
			this[conference]["divisional"] = this.sort_round(this[conference]["divisional"]);
			break;
		case "divisional":
			if(this.in_round(losing_team, this[conference]["championship"])){
				this[conference]["championship"][this[conference]["championship"].indexOf(losing_team)] = winning_team;
				this[conference]["championship"] = this.sort_round(this[conference]["championship"]);
				if(this.in_round(losing_team, this["nfl"]["super_bowl"])){
					this["nfl"]["super_bowl"][this["nfl"]["super_bowl"].indexOf(losing_team)] = this.tba;
					this["nfl"]["super_bowl"] = this.sort_round(this["nfl"]["super_bowl"]);
					if(this.champion == losing_team){
						this.champion = this.tba;
					}
				}
			}			
			else if(!this.in_round(winning_team, this[conference]["championship"])){
				this[conference]["championship"][this[conference]["championship"].indexOf(this.tba)] = winning_team;
			}
			this[conference]["championship"] = this.sort_round(this[conference]["championship"]);
			break;
		case "championship":
			if(this.in_round(losing_team, this["nfl"]["super_bowl"])){
				this["nfl"]["super_bowl"][this["nfl"]["super_bowl"].indexOf(losing_team)] = winning_team;
				this["nfl"]["super_bowl"] = this.sort_round(this["nfl"]["super_bowl"]);
				if(this.champion == losing_team){
					this.champion = this.tba;
				}
			}
			else if(!this.in_round(winning_team, this["nfl"]["super_bowl"])){
				this["nfl"]["super_bowl"][this["nfl"]["super_bowl"].indexOf(this.tba)] = winning_team;
			}
			this["nfl"]["super_bowl"] = this.sort_round(this["nfl"]["super_bowl"]);
			break;
		case "super_bowl":
			this.champion = winning_team;
			break;
	};
	this.display();
};

Playoff.prototype.display = function(){
	var tmp_html = "";
	tmp_html += '<div class="col-xs-12 col-lg-12 team-schedule-vs">Wild Card</div>';
	
	var self = this;
	
	tmp_html += this.get_playoff_round_html("afc", "wild_card");
	tmp_html += this.get_playoff_round_html("nfc", "wild_card");
	
	tmp_html += '<div class="col-xs-12 col-lg-12 team-schedule-vs">Divisional</div>';
	
	tmp_html += this.get_playoff_round_html("afc", "divisional");
	tmp_html += this.get_playoff_round_html("nfc", "divisional");
	
	tmp_html += '<div class="col-xs-12 col-lg-12 team-schedule-vs">Conference</div>';
	
	tmp_html += this.get_playoff_round_html("afc", "championship");
	tmp_html += this.get_playoff_round_html("nfc", "championship");
	
	tmp_html += '<div class="col-xs-12 col-lg-12 team-schedule-vs">Super Bowl</div>';
	
	tmp_html += this.get_playoff_round_html("nfl", "super_bowl");
	
	tmp_html += '<div class="col-xs-12 col-lg-12 team-schedule-vs">Champion</div>';
	
	tmp_html += this.champion.get_champion_html();

	$("#standings-title").html("Playoffs");
	$("#standings-container").html(tmp_html);
};