class Player {
	constructor(object) {
		this.object = object;
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
}
class Team {
	constructor(object) {
		this.object = object;
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
$('#teams').on('load', function() {
	var players = [];
	callServer('https://api.mysportsfeeds.com/v1.1/pull/nba/2016-2017-regular/cumulative_player_stats.json?playerstats=2PA,2PM,3PA,3PM,FTA,FTM',
		function(data) {
			let length = 0;
			for (let i = 0; i < data.cumulativeplayerstats.playerstatsentry.length; i++) {
				let playerObject = data.cumulativeplayerstats.playerstatsentry[i];
				let p = new Player(playerObject);
				players.push(p);
			}

		});

	$('#teamsList').delegate('div', 'click', function() {
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
					$this.append('<div>' + players[i].toStringWithoutTeam() + '</div>');
				}
			}
		}
	});
	//$('#table').css('visibility', 'visible');
	callServer('https://api.mysportsfeeds.com/v1.1/pull/nba/2016-2017-regular/overall_team_standings.json?teamstats=W,L,PTS,PTSA',
		function(data) {
			for (var i = 0; i < data.overallteamstandings.teamstandingsentry.length; i++) {
				var city = data.overallteamstandings.teamstandingsentry[i].team.City;
				var name = data.overallteamstandings.teamstandingsentry[i].team.Name;
				var fullName = city + ' ' + name;
				var record = data.overallteamstandings.teamstandingsentry[i].stats.Wins['#text'] + '-' +
					data.overallteamstandings.teamstandingsentry[i].stats.Losses['#text'];
				var id = data.overallteamstandings.teamstandingsentry[i].team.Abbreviation;
				$('#teams').append('<div id=' + id + '>' + fullName + ' ' + record + '</div>');
			}
		});
});


// //$('#playersList').delegate('div', 'click', setup)
// for (var i = 0; i < playerStats.cumulativeplayerstats.playerstatsentry.length; i++) {
// 	var firstName = playerStats.cumulativeplayerstats.playerstatsentry[i].player.FirstName;
// 	var lastName = playerStats.cumulativeplayerstats.playerstatsentry[i].player.LastName;
// 	var id = lastName + firstName;
// 	var position = playerStats.cumulativeplayerstats.playerstatsentry[i].player.Position;
// 	var team = playerStats.cumulativeplayerstats.playerstatsentry[i].team.Abbreviation;
// 	var fullString = lastName + ', ' + firstName + ' ' + position + ' ' + team;
// 	$('#playersList').append('<div id=' + id + '>' + fullString + '<div>');
// 	setupPlayerClick(playerStats.cumulativeplayerstats.playerstatsentry[i]);
// }