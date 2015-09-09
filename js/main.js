$(function () {
    var weatherRefresh = 30000,
        clockRefresh = 30000,
        busRefresh = 10000;

    var date = new Date();
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var month = monthNames[date.getMonth()];
    var day = date.getDate();
    var year = date.getFullYear();

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
            C1 = 4006684   #e2000f
            C1 weekends = 4007026   #e2000f
            CCX = 4005486   #f9b120
            CCX weekends = 4007030   #bae053
    
            Stop Info
            Swift -> West = 4157330
            Swift -> East = 4151494
            Swift @ Faber = 4173498
    
            */

    var names = {
        "4006684": "C1",
        "4007026": "C1",
        "4005486": "CCX",
        "4007030": "CCX",
        "4007024": "CSW",
        "4007028": "C3"
    }
    var colors = {
        "4006684": "rgba(226,0,15,",
        "4007026": "rgba(226,0,15,",
        "4005486": "rgba(249,177,32,",
        "4007030": "rgba(186,224,83,",
        "4007024": "rgba(0,98,155,",
        "4007028": "rgba(1,130,132,"
    }

    var firstTime = true;

    function newBusDisplay(routes) {
        var $west = $('#west .arrivals');
        var $east = $('#east .arrivals');
        $west.empty();
        $east.empty();
        for (var i = 0; i < 2; ++i) {
            var arrivalLngth = routes.data[i].arrivals.length;
            var whichWay = i == 0 ? $west : $east;
            for (var j = 0; j < arrivalLngth && j < 4; ++j) {
                // Process Bus Data
                var arrivalTime = routes.data[i].arrivals[j].arrival_at
                var busName = names[routes.data[i].arrivals[j].route_id];
                var busColor = colors[routes.data[i].arrivals[j].route_id];
                var busID = routes.data[i].arrivals[j].vehicle_id;
                var delta = Math.floor((Math.abs(new Date(arrivalTime) - new Date())) / 60000);
                if (delta <= 5)
                    var deltaHTML = '<div class="delta important">' + delta + ' min</div>';
                else
                    var deltaHTML = '<div class="delta">' + delta + ' min</div>';

                if (i == 0)
                    var html = '<div data-time="' + delta + '" data-id="' + busID + '" class="arrival fadeInUp animated ">' + deltaHTML + ' till <div style="background-color:' + busColor + '0.6);" class="busName">' + busName + '</div></div>';
                else
                    var html = '<div data-time="' + delta + '" data-id="' + busID + '" class="arrival fadeInUp animated "><div style="background-color:' + busColor + '0.6);" class="busName">' + busName + '</div> in ' + deltaHTML + '</div>';
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
            westHTML = [],
            eastHTML = [],
            oldWest = [],
            oldEast = [];

        for (var i = 0; i < 2; ++i) {
            var arrivalLngth = routes.data[i].arrivals.length;
            var whichDelta = i == 0 ? westDelta : eastDelta;
            var whichWay = i == 0 ? westHTML : eastHTML;
            var whichID = i == 0 ? wID : eID;
            for (var j = 0; j < arrivalLngth && j < 4; ++j) {
                // Process Bus Data
                var arrivalTime = routes.data[i].arrivals[j].arrival_at;
                var busName = names[routes.data[i].arrivals[j].route_id];
                var busColor = colors[routes.data[i].arrivals[j].route_id];
                var busID = routes.data[i].arrivals[j].vehicle_id;
                var delta = Math.floor((Math.abs(new Date(arrivalTime) - new Date())) / 60000);

                if (delta <= 5)
                    var deltaHTML = '<div class="delta important">' + delta + ' min</div>';
                else
                    var deltaHTML = '<div class="delta">' + delta + ' min</div>';

                if (i == 0)
                    var html = '<div data-time="' + delta + '" data-id="' + busID + '" class="arrival fadeInUp animated ">' + deltaHTML + ' till <div style="background-color:' + busColor + '0.6);" class="busName">' + busName + '</div></div>';
                else
                    var html = '<div data-time="' + delta + '" data-id="' + busID + '" class="arrival fadeInUp animated "><div style="background-color:' + busColor + '0.6);" class="busName">' + busName + '</div> in ' + deltaHTML + '</div>';
                whichWay.push(html);
                whichDelta.push(delta);
                whichID.push(busID);
            }
        }

        for (var i = 1; i <= 4; ++i) {
            oldWest[i - 1] = parseInt($('#west .arrival:nth-child(' + i + ')').attr('data-time'));
            oldEast[i - 1] = parseInt($('#east .arrival:nth-child(' + i + ')').attr('data-time'));
        }
        updateSide('west', oldWest, westDelta, westHTML, wID);
        updateSide('east', oldEast, eastDelta, eastHTML, eID);

    }

    function updateSide(whichSide, oldArr, newArr, newHTML, ID) {
        var side = '#' + whichSide;
        // If the top bus is gone, remove it and shift everything up
        if ($(side + ' .arrival:nth-child(1)').attr('data-id') != ID[0]) {
            $(side + ' .arrival:nth-child(1)').remove();
            $(side + ' .arrivals').append(newHTML[3]);
        }

        // Run through the entire list and update numbers
        for (var i = 0; i < 4; ++i) {
            if (oldArr[i] != newArr[i]) {
                var $this = $(side + ' .arrival:nth-child(' + (i + 1) + ')'),
                    delta = newArr[i],
                    $delta = $this.children('.delta');
                $this.attr('data-time', delta);
                $delta.fadeOut(0);
                $delta.html(delta + ' min');
                if (delta <= 5)
                    $this.children('.delta').addClass('important');
                $delta.fadeIn(1000);
            }
        }
    }


    function getBuses() {
        var output = $.ajax({
            url: "https://transloc-api-1-2.p.mashape.com/arrival-estimates.json?agencies=176&callback=call&routes=4006684%2C4007024%2C4007028%2C4007026%2C4005486%2C4007030&stops=4157330%2C4151494%2C4173498",
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
                xhr.setRequestHeader("X-Mashape-Authorization", "7eLsoFnNpomshsN6Xyqfr5Xyf4aOp16e11WjsnQz1nsMDnB8YI"); // Enter here your Mashape key
            }
        });
        var t = setTimeout(function () {
            getBuses();
        }, busRefresh);
    }

    function getWeather() {
        $.simpleWeather({
            location: 'Durham, NC',
            woeid: '',
            unit: 'f',
            success: function (weather) {
                /* html = '<ul><li class="currently">' + weather.currently + '</li>';
                 html += '<li>' + weather.wind.direction + ' ' + weather.wind.speed + ' ' + weather.units.speed + '</li></ul>';*/
                html = '<h2><i class="icon-' + weather.code + '"></i> ' + weather.temp + '&deg;' + weather.units.temp + '</h2>';
                html += '<div><span id="currently">' + weather.currently + '</span>  |  wind from ' + weather.wind.direction + ' at ' + weather.wind.speed + ' ' + weather.units.speed + '</div>'
                $("#weather").html(html);
            },
            error: function (error) {
                $("#weather").html('<p>' + error + '</p>');
            }
        });
        var t = setTimeout(function () {
            getWeather();
        }, weatherRefresh);
    }

    startTime();
    getBuses();
    getWeather();
});