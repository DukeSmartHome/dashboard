$(function () {
    var weatherRefresh = 30000,
        clockRefresh = 30000,
        busRefresh = 30000;

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
        "4007030": "CCX"
    }
    var colors = {
        "4006684": "rgba(226,0,15,",
        "4007026": "rgba(226,0,15,",
        "4005486": "rgba(249,177,32,",
        "4007030": "rgba(186,224,83,"
    }

    function getBuses() {
        var output = $.ajax({
            url: "https://transloc-api-1-2.p.mashape.com/arrival-estimates.json?agencies=176&callback=call&routes=4006684%2C4007026%2C4005486%2C4007030&stops=4157330%2C4151494%2C4173498",
            type: 'GET',
            data: {},
            dataType: 'json',
            success: function (routes) {
                updateBusDisplay(routes);
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader("X-Mashape-Authorization", "7eLsoFnNpomshsN6Xyqfr5Xyf4aOp16e11WjsnQz1nsMDnB8YI"); // Enter here your Mashape key
            }
        });
        var t = setTimeout(function () {
            getBuses();
        }, busRefresh);
    }

    function updateBusDisplay(routes) {
        var $west = $('#west .arrivals');
        var $east = $('#east .arrivals');
        $west.fadeOut(0);
        $east.fadeOut(0);
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
                var delta = Math.round((Math.abs(new Date(arrivalTime) - new Date())) / 60000);
                
                var html = '<div class="arrival"><div style="background-color:' + busColor + '0.6);" class="busName">' + busName + '</div> in ' + delta + ' min</div>';
console.log(html);
               whichWay.append(html);
            }
        }
        $west.fadeIn(650);
        $east.fadeIn(650);
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
                html += '<div>Conditions are <span id="currently">' + weather.currently + '</span>, wind from ' + weather.wind.direction + ' at ' + weather.wind.speed + ' ' + weather.units.speed + '.</div>'
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