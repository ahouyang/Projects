$(function() {
	class Player {
		constructor(object) {
			this.object = object;
			this.init();
		}
		init() {
			this.GamesPlayed = this.object.stats.GamesPlayed['#text'];
			this.Fg2PtAtt = this.object.stats.Fg2PtAtt['#text'];
			this.Fg2PtMade = this.object.stats.Fg2PtMade['#text'];
			this.Fg3PtAtt = this.object.stats.Fg3PtAtt['#text'];
			this.Fg3PtMade = this.object.stats.Fg3PtMade['#text'];
			this.FtAtt = this.object.stats.FtAtt['#text'];
			this.FtMade = this.object.stats.FtMade['#text'];
			this.PtsPerGame = this.object.stats.PtsPerGame['#text'];
			this.Fg2PtPct = this.object.stats.Fg2PtPct['#text'];
			this.Fg3PtPct = this.object.stats.Fg3PtPct['#text'];
			this.FgPct = this.object.stats.FgPct['#text'];
			this.name = this.object.player.LastName + ', ' + this.object.player.FirstName;
			this.tsp = this.object.stats.Pts['#text'] / (2 * (+this.object.stats.FgAtt['#text'] + (0.44 * this.object.stats.FtAtt['#text'])));
		}
		getTeamAbbreviation() {
			return this.object.team.Abbreviation;
		}
		toStringWithTeam() {
			return this.object.player.LastName + ', ' + this.object.player.FirstName + ' ' + this.object.player.Position + ' ' + this.object.team.Abbreviation;
		}
		toStringWithoutTeam() {
			return this.object.player.LastName + ', ' + this.object.player.FirstName + ' ' + this.object.player.Position;
		}
		getPlayerName() {
			return this.object.player.LastName + this.object.player.FirstName;
		}
		getLabel(){

		}
		getDIVwithTeam() {
			return '<div id=' + this.getPlayerName() + '>' + this.toStringWithTeam() + '</div>';
		}
		getDIVwithoutTeam() {
			return '<div id=' + this.getPlayerName() + ' class="player">' + this.toStringWithoutTeam() + '</div>';
		}
	}
	class Team {
		constructor(object) {
			this.object = object;
		}
		getAbbreviation() {
			return this.object.team.Abbreviation;
		}
		getTeamName() {
			return this.object.team.City + ' ' + this.object.team.Name;
		}
		getRecord() {
			return this.object.stats.Wins['#text'] + '-' + this.object.stats.Losses['#text'];
		}
		getDIV() {
			return '<div id=' + this.getAbbreviation() + '>' + this.getTeamName() + ' ' + this.getRecord() + '</div>';
		}
		getPointsFor() {
			return this.object.stats.Pts['#text'];
		}
		getPointsAgainst() {
			return this.object.stats.PtsAgainst['#text'];
		}

	}

	function callServer(inURL, done) {
		$.ajax({
			type: "GET",
			url: inURL,
			dataType: 'json',
			async: false,
			headers: {
				"Authorization": "Basic " + btoa("ahouyang" + ":" + "thec600g")
			},
			data: '',
			success: done,
			error: function() {
				console.log('error');
			}
		});
	}

	var players = [];
	callServer('https://api.mysportsfeeds.com/v1.1/pull/nba/2016-2017-regular/cumulative_player_stats.json',
		function(data) {
			for (let i = 0; i < data.cumulativeplayerstats.playerstatsentry.length; i++) {
				let playerObject = data.cumulativeplayerstats.playerstatsentry[i];
				let p = new Player(playerObject);
				players.push(p);
			}
		});
	var teams = [];
	callServer('https://api.mysportsfeeds.com/v1.1/pull/nba/2016-2017-regular/overall_team_standings.json',
		function(data) {
			for (let i = 0; i < data.overallteamstandings.teamstandingsentry.length; i++) {
				let teamObject = data.overallteamstandings.teamstandingsentry[i];
				let t = new Team(teamObject);
				teams.push(t);
			}
		});

	$('#teams').delegate('div', 'click', function() {
		var $this = $(this);
		var id = $this.attr('id');
		if ($this.hasClass('displaying')) {
			$('#' + id + ' div').empty();
			$this.removeClass('displaying');
		} else {
			$this.addClass('displaying');
			for (var i = 0; i < players.length; i++) {
				var team = players[i].getTeamAbbreviation();
				if (team == id) {
					$this.append(players[i].getDIVwithoutTeam());

					//$this.append('<div>' + players[i].toStringWithoutTeam() + '</div>');
				}
			}
		}
	});

	for (let i = 0; i < teams.length; i++) {
		$('#teams').append(teams[i].getDIV());
	}

	$('#playersList').delegate('div', 'click', function() {
		if ($(this).hasClass('selected')) {
			$(this).removeClass('selected');
			$('#selected div#' + $(this).attr('id')).remove();
		} else {
			$(this).clone().appendTo('#selected');
			$(this).addClass('selected');
		}

	});
	$('#selected').delegate('div', 'click', function() {
		$(this).remove();
	});

	for (let i = 0; i < players.length; i++) {
		$('#playersList').append(players[i].getDIVwithTeam());
	}
	function makeGraph(xAxis, yAxis){
		var ctx = $('#myChart');
		var playerData = [];
		var names = [];
		$('#selected').children('div').each(function(){
			for(let i = 0; i < players.length; i++){
				if($(this).attr('id') == players[i].getPlayerName()){
					let point = {
						x: players[i][xAxis],
						y: players[i][yAxis]
					};
					playerData.push(point);
					names.push(players[i].name);
				}
			}
		});
		var scatterChart = new Chart(ctx, {
			type: 'scatter',
			data: {
				labels: names,
				datasets: [{
					label: xAxis + ' vs. ' + yAxis,
					data: playerData
				}]
			},
			options: {
				tooltips: {
					callbacks: {
						beforeLabel: function(tooltipItem, data){
							return data.labels[tooltipItem.index];
						}
					}
				},
				scales: {
					xAxes: [{
						type: 'linear',
						position: 'bottom',
						scaleLabel: {
							display: true,
							labelString: xAxis
						}
					}],
					yAxes: [{
						scaleLabel: {
							display: true,
							labelString: yAxis
						}
					}]
				},
				showLines: false
			}
		});
	}
	// var xUnit = $('#xAxis').val();
	// var yUnit = $('#yAxis').val();
	// $('#graph').click(makeGraph(xUnit, yUnit));
	$('#graph').click(function(){
		let xUnit = $('#xAxis').val();
		let yUnit = $('#yAxis').val();
		makeGraph(xUnit, yUnit);
	});

});