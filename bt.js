/**
 * Created by Thomas on 08/06/2017.
 */


// ** globals **
var players = {};
var totalScore = 0;
var playerReady = false;
var gameBegun = false;
var wrappers = {
    "menu" : "block",
    "blindTest": "flex",
    "scores": "block"
};

function show(wrapper) {
    if (wrappers.hasOwnProperty(wrapper)) {
        for (var wrap in wrappers) {
            var w = document.getElementById(wrap);
            w.style.display = "none";
        }
        document.getElementById(wrapper).style.display = wrappers[wrapper];
    }
}

// ** HomePage Menu **
var playersForm = document.getElementById('players');
var addButton = document.getElementById('addPlayer');
var validate = document.getElementById('validatePlayers');

//add a player input to the list
function addPlayer(e) {
    e.preventDefault();

    var inp = document.createElement('input');
    inp.type = 'text';
    inp.name = 'player';
    inp.placeholder = 'Nom Joueur ...';

    playersForm.insertBefore(inp, addButton);
    inp.focus();
}

//validate players then launch blind test
function validatePlayers(e) {
    var els = playersForm.elements;

    for (var i = 0, len = els.length; i < len; i++) {
        var player = els[i];
        if (player.name === 'player' && player.value.trim() !== '') {
            players[player.value.trim()] = 0;
        }
    }

    if (playerReady) {
        //initiate Players Score menu
        initiatePlayers(players);
        initiatePlayersScores(players);

        //launch Blind Test
        launchBlindTest();
        gameBegun = true;
    } else {
        alert('veuillez attendre que le player soit prêt');
    }

}

playersForm.addEventListener('submit', addPlayer);
validate.addEventListener('click', validatePlayers);

// ** Blind Test Core **
var scoreDisplay = document.getElementById("scoreDisplay");
var next = document.getElementById("next");

//randomize videos
(function (t) {
    for (var i = t.length - 1; i > 0; i--) {
        var tmp = t[i];
        var j = Math.floor(Math.random() * (i + 1));
        t[i] = t[j];
        t[j] = tmp;
    }
})(videos);

var videoPlayingIndex = 0;

// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '360',
        width: '640',
        videoId: videos[videoPlayingIndex][1],
        playerVars: {
            start: 0,
            fs:0,
            playsinline: 1,
            end: videos[videoPlayingIndex][2]
        },
        events: {
            'onReady': onPlayerReady,
            'onError': onPlayerError,
            'onStateChange': onPlayerStateChange
        }
    });
}

function launchBlindTest() {
    show('blindTest');
    player.setVolume(60);
    player.playVideo();
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    if (gameBegun) {
        event.target.setVolume(60);
        event.target.playVideo();
    } else {
        playerReady = true;
    }
}

function onPlayerError(error) {
    console.log('erreur : ', error);
    playNext();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var playing = false;
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        playing = true;
    }
    if (playing && event.data === YT.PlayerState.ENDED) {
        playing = false;
        displayAnswer();
    }
}

function initiatePlayersScores(players) {
    for (var name in players) {
        var pDiv = document.createElement('div');
        pDiv.className = "flex-score";
        pDiv.id = "score-" + name;
        pDiv.style.width = "20%";
        pDiv.textContent = name;
        scoreDisplay.appendChild(pDiv);
    }
}

function updateBackgroundScores() {
    for (var name in players) {
        var sc = document.getElementById("score-" + name);

        sc.style.width = (( players[name] / totalScore ) * 80 + 20 ) + "%";
    }
}

function displayAnswer() {
    player.stopVideo();

    var name = videos[videoPlayingIndex][0].replace(/( )*-( )*/g, '\n');
    displayResult(name);
}

function playNext() {
    videoPlayingIndex++;
    if (videoPlayingIndex >= videos.length) {
        displayResult("C'est fini !");
    } else {
        updateBackgroundScores();
        show('blindTest');
        player.loadVideoById({
            videoId:videos[videoPlayingIndex][1],
            startSeconds:0,
            endSeconds:videos[videoPlayingIndex][2]
        })
    }
}

next.addEventListener('click', displayAnswer, false);

// ** Result Screen **
var playersScores = document.getElementById('playersScores');
var result = document.getElementById('result');
var nextSong = document.getElementById('nextSong');

//Display Result
function displayResult(name) {
    show('scores');
    result.innerText = name;
}

//update score
function updateScore(plus, ev) {
    var e = ev.target;
    var name = e.parentNode.id;
    
    players[name] += plus ? 1 : -1;
    totalScore += plus ? 1 : -1;

    var textNode = plus ? e.previousSibling : e.nextSibling;

    textNode.nodeValue = players[name];
}

//called once after creating players
function initiatePlayers(players) {
    var minScore = updateScore.bind(null, false);
    var plusScore = updateScore.bind(null, true);

    for (var pl in players) {
        //create player's score wrapper
        var wrap = document.createElement('div');
        wrap.className = 'score-wrapper';
        wrap.id=pl;

        //create button to change score
        var min=document.createElement('input');
        min.type = 'button';
        min.value = '-';
        min.addEventListener('click', minScore);

        var plus=document.createElement('input');
        plus.type = 'button';
        plus.value = '+';
        plus.addEventListener('click', plusScore);

        //add to the dom
        wrap.appendChild(document.createTextNode(pl));
        wrap.appendChild(document.createElement('br'));
        wrap.appendChild(min);
        wrap.appendChild(document.createTextNode(players[pl]));
        wrap.appendChild(plus);

        playersScores.appendChild(wrap);
    }
}

nextSong.addEventListener('click', playNext);
