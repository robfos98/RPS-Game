var firebaseConfig = {
    apiKey: "AIzaSyBSork4La_XCHyu4MKc4GYbDX3eu9_VpJI",
    authDomain: "pcojert-36540.firebaseapp.com",
    databaseURL: "https://pcojert-36540.firebaseio.com",
    projectId: "pcojert-36540",
    storageBucket: "pcojert-36540.appspot.com",
    messagingSenderId: "576973917757",
    appId: "1:576973917757:web:b2d7f4498fce5071626454"
};

firebase.initializeApp(firebaseConfig);
var database = firebase.database();

var whichPlayer = 0;
var wins = 0;
var losses = 0;
var beenHere = false;
var waiting = false;
var otherWaiting = false;
var thisDelete = false;
var otherDelete = false;
var kickRequest = false;
var stillHere = false;
var RPS = "RPS";
var nextThrow = "";
var otherThrow = "";
var lastMessage = "";
var lastOtherMessage = "";
var maybeNewMessage = "";

function resetPlayer(x){
    database.ref("Player" + x).set({
        exists: false,
        throw: "",
        lastMessage: "",
        kickRequest: true
    });
};

function newPlayer(){
    database.ref().on("value", function(snapshot) {
        if(!beenHere){
            beenHere = true;
            if(!snapshot.val().Player1.exists){
                whichPlayer = 1;
            }
            else if(!snapshot.val().Player2.exists){
                whichPlayer = 2;
            }
            else{
                if(snapshot.val().Player1.kickRequest){
                    resetPlayer(1);
                    $("body").empty();
                    alert("Please reload.");
                }
                else if(snapshot.val().Player2.kickRequest){
                    resetPlayer(2);
                    $("body").empty();
                    alert("Please reload.");
                }
                else{
                    database.ref("Player1/kickRequest").set(true);
                    database.ref("Player2/kickRequest").set(true);
                    $("body").empty();
                }
                return;
            }
            database.ref("Player" + whichPlayer + "/exists").set(true);
            database.ref("Player" + whichPlayer + "/kickRequest").set(false);
        }
    }, function(errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
};

newPlayer();

function calculate(){
    thisDelete = true;
    otherDelete = true;
    nextThrow = RPS.indexOf(nextThrow);
    otherThrow = RPS.indexOf(otherThrow);
    nextThrow = (nextThrow - otherThrow) % 3;
    if(nextThrow === 0){
        alert("It's a tie.");
    }
    else if(nextThrow === 1){
        wins++;
        if(wins < 10){
            $("#wins").text("00" + wins);
        }
        else if(wins < 100){
            $("#wins").text("0" + wins);
        }
        else if(wins < 1000){
            $("#wins").text(wins);
        }
    }
    else{
        losses++;
        if(losses < 10){
            $("#losses").text("00" + losses);
        }
        else if(wins < 100){
            $("#losses").text("0" + losses);
        }
        else if(wins < 1000){
            $("#losses").text(losses);
        }
    }
    nextThrow = "";
    otherThrow = "";
    database.ref("Player" + whichPlayer + "/throw").set("");
};

$("button").on("click",function(){
    if(waiting || thisDelete || otherDelete){
        return;
    }
    nextThrow = $(this).text().slice(0,1);
    if(nextThrow === "E"){
        return;
    }
    database.ref("Player" + whichPlayer + "/throw").set(nextThrow);
    if(!otherWaiting){
        waiting = true;
    }
    else{
        calculate();
    }
});

database.ref().on("value", function(snapshot) {
    if(whichPlayer === 0){
        return;
    }
    if(whichPlayer === 1){
        if(snapshot.val().Player1.kickRequest){
            kickRequest = true;
            stillHere = confirm("Are you still playing?")
            if(stillHere){
                kickRequest = false;
                database.ref("Player1/kickRequest").set(false);
            }
        }
        else{
            if(!snapshot.val().Player1.exists){
                $("body").empty();
            }
        }
        if(thisDelete){
            if(snapshot.val().Player1.throw === ""){
                thisDelete = false;
            }
        }
        otherThrow = snapshot.val().Player2.throw;
        maybeNewMessage = snapshot.val().Player2.lastMessage;
    }
    else{
        if(snapshot.val().Player2.kickRequest){
            kickRequest = true;
            stillHere = confirm("Are you still playing?")
            if(stillHere){
                kickRequest = false;
                database.ref("Player2/kickRequest").set(false);
            }
        }
        else{
            if(!snapshot.val().Player2.exists){
                $("body").empty();
            }
        }
        if(thisDelete){
            if(snapshot.val().Player2.throw === ""){
                thisDelete = false;
            }
        }
        otherThrow = snapshot.val().Player1.throw;
        maybeNewMessage = snapshot.val().Player1.lastMessage;
    }
    if(maybeNewMessage !== lastOtherMessage){
        console.log("here");
        lastOtherMessage = maybeNewMessage;
        maybeNewMessage = "<article class='left'>" + lastOtherMessage + "</article>";
        $("section").prepend(maybeNewMessage);
    }
    maybeNewMessage = "";
    if(otherThrow !== ""){
        if(otherDelete){
            return;
        }
        if(!waiting){
            otherWaiting = true;
        }
        else{
            waiting = false;
            calculate();
        }
    }
    else{
        if(otherDelete){
            otherDelete = false;
        }
    }
});

$("#enter").on("click", function(){
    event.preventDefault();
    lastMessage = $("input").val().trim();
    $("input").val("");
    database.ref("Player" + whichPlayer + "/lastMessage").set(lastMessage);
    lastMessage = "<article class='right'>" + lastMessage + "</article>";
    $("section").prepend(lastMessage);
    lastMessage = "";
});