$(function () {
    // Weather variables
    var weatherRefresh = 30000,
        clockRefresh = 30000,
        busRefresh = 8000;

    // Other variables
    var date = new Date(),
        people = ["Andrew", "Aryan", "Bryce", "Eric", "Jason", "Jerone", "Kelsey", "Molly", "Sarah", "Surya"],
        monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        month = monthNames[date.getMonth()],
        day = date.getDate(),
        year = date.getFullYear(),
        voice;

    // load voice
    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = function () {
            voices = window.speechSynthesis.getVoices();
            voice = voices.filter(function (voice) {
                return voice.name == 'Google UK English Male';
            })[0];
        };
    }
    speakAlert('Welcome Smart Homies!', false);

    $('#date').html(month + " " + day + ", " + year);

    function startTime() {
        var today = new Date();
        var h = today.getHours();
        var m = today.getMinutes();
        m = checkTime(m);
        var ampm = h >= 12 ? 'pm' : 'am';
        h = h % 12;
        h = h ? h : 12;
        $('#clock').html(h + ":" + m + "<span>" + ampm + "</span>");
        var t = setTimeout(function () {
            startTime()
        }, clockRefresh);
    }

    function checkTime(i) {
        if (i < 10) {
            i = "0" + i
        }; // add zero in front of numbers < 10
        return i;
    }


    /* Route Info
    C1 = 4008330   #e2000f
    C1 Weekends = 4007592   #e2000f
    CCX = 4005486   #f9b120
    CCX Weekends = 4008336   #bae053

    Stop Info
    Swift -> West = 4157330
    Swift -> East = 4151494
    Swift @ Faber = 4173498
    */

    var names = {
        "4008330": "C1", // C1
        //"4007592": "C1", // C1 Weekends
        //"4005486": "CCX",
        //"4008336": "CCX", // CCX Weekends
        "4008332": "CSW",
        //"4008334": "C3",
        //"4008340": "C3",
        //"4008342": "C2",
        "4016096": "SWS",
        "4016572": "CSWIFT",
    }
    var colors = {
        "4008330": "rgba(226,0,15,",
        "4007592": "rgba(226,0,15,",
        "4005486": "rgba(249,177,32,",
        "4008336": "rgba(186,224,83,",
        "4008332": "rgba(0,98,155,",
        "4008334": "rgba(1,130,132,",
        "4008340": "rgba(1,130,132,",
        "4008342": "rgba(232,240,0,"
    }

    var firstTime = true;
    var reminderHTML = '<div class="reminder" data-reminder="-1" data-name="a"></div>';

    function newBusDisplay(routes) {
        var $west = $('#west .arrivals');
        var $east = $('#east .arrivals');
        $west.empty();
        $east.empty();
        
        // left side (to West), then right side (to East), then swift (west)
        for (var i = 0; i <= 2; ++i) {
            var arrivalLngth = routes.data[i].arrivals.length;
            //kelsey is updating this, trying to make swift also count as west
            var whichWay = i != 1 ? $east : $west;
            
            // for each bus, max of 4
            for (var j = 0; j < arrivalLngth && j < 4; ++j) {
                // Process Bus Data
                var arrivalTime = routes.data[i].arrivals[j].arrival_at
                var busName = names[routes.data[i].arrivals[j].route_id];
                var busColor = colors[routes.data[i].arrivals[j].route_id];
                var busID = routes.data[i].arrivals[j].vehicle_id;
                var delta = Math.floor((Math.abs(new Date(arrivalTime) - new Date())) / 60000);

                if (delta == 0)
                    var deltaHTML = '<div class="delta important"><1 min</div>';
                else if (delta <= 5)
                    var deltaHTML = '<div class="delta important">' + delta + ' min</div>';
                else
                    var deltaHTML = '<div class="delta">' + delta + ' min</div>';

                // output based on left or right (west or east)
                if (i % 2 == 1)
                    var html = '<div data-time="' + delta + '" data-id="' + busID + '" class="arrival fadeInUp animated ">' + reminderHTML + deltaHTML + '<div class="ti"> till </div><div style="background-color:' + busColor + '0.6);" class="busName">' + busName + '</div></div>';
                else
                    var html = '<div data-time="' + delta + '" data-id="' + busID + '" class="arrival fadeInUp animated "><div style="background-color:' + busColor + '0.6);" class="busName">' + busName + '</div><div class="ti"> in </div>' + deltaHTML + reminderHTML + '</div>';
                whichWay.append(html);
            }
        }
    }

    function updateBusDisplay(routes) {
        var $west = $('#west .arrivals'),
            $east = $('#east .arrivals'),
            westDelta = [],
            eastDelta = [],
            wID = [],
            eID = [],
            westHTML = '',
            eastHTML = '',
            oldWest = [],
            oldEast = [];

        for (var i = 0; i < 2; ++i) {
            var arrivalLngth = routes.data[i].arrivals.length;
            var whichDelta = i != 1 ? eastDelta : westDelta;
            var whichID = i == 1 ? wID : eID;
            for (var j = 0; j < arrivalLngth && j < 4; ++j) {
                // Process Bus Data
                var arrivalTime = routes.data[i].arrivals[j].arrival_at;
                var busName = names[routes.data[i].arrivals[j].route_id];
                var busColor = colors[routes.data[i].arrivals[j].route_id];
                var busID = routes.data[i].arrivals[j].vehicle_id;
                var delta = Math.floor((Math.abs(new Date(arrivalTime) - new Date())) / 60000);

                if (delta == 0)
                    var deltaHTML = '<div class="delta important"><1 min</div>';
                else if (delta <= 5)
                    var deltaHTML = '<div class="delta important">' + delta + ' min</div>';
                else
                    var deltaHTML = '<div class="delta">' + delta + ' min</div>';
                var html = '';

                if (i != 1)
                    eastHTML += '<div data-time="' + delta + '" data-id="' + busID + '" class="arrival fadeInUp animated "><div style="background-color:' + busColor + '0.6);" class="busName">' + busName + '</div><div class="ti"> in </div>' + deltaHTML + reminderHTML + '</div>';
                else
                    westHTML += '<div data-time="' + delta + '" data-id="' + busID + '" class="arrival fadeInUp animated ">' + reminderHTML + deltaHTML + '<div class="ti"> till </div><div style="background-color:' + busColor + '0.6);" class="busName">' + busName + '</div></div>';
                

                whichDelta.push(delta);
                whichID.push(busID);
                0
            }
        }

        for (var i = 1; i <= $('#west .arrival').length; ++i) {
            oldWest[i - 1] = parseInt($('#west .arrival:nth-child(' + i + ')').attr('data-time'));
        }
        for (var i = 1; i <= $('#east .arrival').length; ++i) {
            oldEast[i - 1] = parseInt($('#east .arrival:nth-child(' + i + ')').attr('data-time'));
        }
        updateSide('west', oldWest, westDelta, westHTML, wID);
        updateSide('east', oldEast, eastDelta, eastHTML, eID);

    }

    function updateSide(whichSide, oldArr, newArr, newHTML, ID) {
        var side = '#' + whichSide;
        // If the top bus is gone or if there are more buses, refresh everything
        if ((newArr.length != oldArr.length)) {
            refreshSide(side, newHTML);
        }
        var shouldRefresh = false;
        // Check if any of the buses are wrong
        for (var i = 0; i < oldArr.length; ++i) {
            if ($(side + ' .arrival:nth-child(' + (i + 1) + ')').attr('data-id') != ID[i])
                shouldRefresh = true;
        }
        if (shouldRefresh) {
            refreshSide(side, newHTML);
        }

        // Run through the entire list and update times
        for (var i = 0; i < newArr.length; ++i) {
            var $this = $(side + ' .arrival:nth-child(' + (i + 1) + ')'),
                delta = newArr[i];

            if (parseInt($this.children('.reminder').attr('data-reminder')) == delta) {
                var $rem = $this.children('.reminder'),
                    name = $rem.attr('data-name'),
                    busName = $this.children('.busName').html();
                speakAlert(name + ', your ' + busName + ' heading to ' + whichSide + 'campus will arrive in ' + delta + ' minutes.', true);
                $rem.attr('data-reminder', -1);
                $rem.attr('data-name', 'a');
                $rem.removeClass('on');
            }
            if (oldArr[i] != newArr[i]) {
                var $delta = $this.children('.delta');

                $this.attr('data-time', delta);
                $delta.fadeOut(0);
                $delta.html(delta + ' min');

                if (delta == 0)
                    $this.children('.delta').html('<1 min');
                else if (delta <= 5)
                    $this.children('.delta').addClass('important');
                $delta.fadeIn(1000);
            }
        }
    }

    function refreshSide(side, newHTML) {
        var putBack = new Array();
        for (var i = 1; i <= $(side + ' .arrival').length; ++i) {
            var $this = $(side + ' .arrival:nth-child(' + i + ')');
            if ($this.children('.reminder').hasClass('on')) {
                var alertTemp = {
                    "vehicle_id": $this.attr('data-id'),
                    "name": $this.children('.reminder').attr('data-name'),
                    "reminder": $this.children('.reminder').attr('data-reminder'),
                };
                putBack.push(alertTemp);
            }
        }
        $(side + ' .arrivals').empty();
        $(side + ' .arrivals').append(newHTML);
        // Restore alerts
        for (var i = 0; i < putBack.length; ++i) {
            var id = putBack[i].vehicle_id;
            for (var j = 1; j <= $(side + ' .arrival').length; ++j) {
                var $this = $(side + ' .arrival:nth-child(' + j + ')');
                if (id == $this.attr('data-id')) { // Match found
                    var alertButton = $this.children('.reminder');
                    alertButton.addClass('on');
                    alertButton.attr('data-name', putBack[i].name);
                    alertButton.attr('data-reminder', putBack[i].reminder);
                    break;
                }
            }
        }
    }


    function getBuses() {
        var output = $.ajax({
            url: "https://transloc-api-1-2.p.rapidapi.com/arrival-estimates.json?agencies=176&routes=4016572%2C4016096%2C4008330&stops=4258582%2C4188202%2C4188200&callback=call",
            //deprecated url: "https://transloc-api-1-2.p.mashape.com/arrival-estimates.json?agencies=176&callback=call&routes=4008330,4007588,4007592,4005486,4008336,4008332,4008334,4008340,4008342&stops=4188202,4188200", //c3 stop 4189296
            type: 'GET',
            data: {},
            dataType: 'json',
            success: function (routes) {
                if (firstTime) {
                    newBusDisplay(routes);
                    firstTime = false;
                } else {
                    updateBusDisplay(routes);
                }
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader("X-Mashape-Authorization", "7eLsoFnNpomshsN6Xyqfr5Xyf4aOp16e11WjsnQz1nsMDnB8YI");
            }
        });
        var t = setTimeout(function () {
            getBuses();
        }, busRefresh);
    }

    function getWeather() {
        $("#weather").fadeOut(0);
        $.simpleWeather({
            woeid: '2394734',
            unit: 'f',
            success: function (weather) {
                html = '<h2><i class="icon-' + weather.code + '"></i> ' + weather.temp + '&deg;' + weather.units.temp + '</h2>';
                html += '<div>Wind from ' + weather.wind.direction + ' at ' + weather.wind.speed + ' mph<br><span id="currently">' + weather.currently + '</span></div>'
                $("#weather").html(html);
                $("#weather").fadeIn(1200);
            },
            error: function (error) {
                console.log("error");
            }
        });
        var t = setTimeout(function () {
            getWeather();
        }, weatherRefresh);
    }

    function speakAlert(message, dingOrNot) {
        if(dingOrNot)
            $('#ding').trigger('play');
        
        if ('speechSynthesis' in window) {
            setTimeout(function () {
                var msg = new SpeechSynthesisUtterance();
                msg.text = message;
                msg.voice = voice;
                speechSynthesis.speak(msg);
            }, 200);
        }
    }

    $(".arrivals").delegate(".reminder", "click", function () {
        if (!$(this).hasClass('on')) {
            var time = 0,
                name = '',
                $thisRem = $(this),
                delta = parseInt($thisRem.parent().attr('data-time'));

            if (delta < 5) {
                // Cannot add alert
                notify('Alerts for close buses are not supported.', 'bad');
            } else {
                // Enter Modal Mode
                updateButtons(delta);
                $("#name").val('');
                $("#modal").fadeIn(350);
                $("#mainPage").fadeOut(0);

                $(".alertTime").click(function () {
                    time = $(this).attr('data-time');
                    $("#minutes").fadeOut(0);
                    $("#name_holder").fadeIn(300);
                    $("#name").focus();
                    $('.person').click(function () {
                        var name = $(this).html();
                        $thisRem.attr('data-reminder', time);
                        $thisRem.attr('data-name', name);
                        $thisRem.addClass('on');
                        closeModal();
                        notify('&#10004; Alert added successfully.', 'good');
                    });
                    $("#name").keyup(function (e) {
                        if (13 == e.keyCode) {
                            // Exit Modal 
                            $thisRem.attr('data-reminder', time);
                            $thisRem.attr('data-name', $("#name").val());
                            $thisRem.addClass('on');
                            closeModal();
                            notify('&#10004; Alert added successfully.', 'good');
                        }
                    });
                });
            }
        }
    });

    $('#close').click(function () {
        closeModal();
    });

    function closeModal() {
        $("#modal").fadeOut(0);
        $("#mainPage").fadeIn(500);
        $("#name_holder").fadeOut(0);
        $("#minutes").fadeIn(0);
    }

    function updateButtons(delta) {
        var times = [];
        if (delta == 5) {
            times = [3, 4];
        } else if (delta == 6) {
            times = [3, 4, 5];
        } else if (delta == 7) {
            times = [3, 4, 5, 6];
        } else if (delta >= 8 && delta <= 10) {
            times = [3, 4, 5, 7];
        } else if (delta > 10 && delta <= 16) {
            times = [3, 5, 6, 8];
        } else if (delta >= 16) {
            times = [3, 5, 10, 15];
        }

        var html = '<span>Remind me when the bus is...</span>';
        for (var i = 0; i < times.length; ++i) {
            html += '<button class="alertTime" data-time="' + times[i] + '">' + times[i] + ' minutes away</button>';
        }
        $('#minutes div').empty();
        $('#minutes div').append(html);
    }

    function notify(msg, which) {
        var $which = $('#' + which);
        $which.html(msg);
        $which.fadeIn(300).css("display", "inline-block");
        setTimeout(function () {
            $which.fadeOut(300);
        }, 2000);
    }

    function shuffle(array) {
        var currentIndex = array.length,
            temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    // Initialize names
    for (var i = 0; i < people.length; ++i) {
        $("#people_buttons").append('<div class="person">' + people[i] + '</div>');
    }
    startTime();
    getBuses();
    getWeather();
});
