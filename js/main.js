$(function () {
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
        }, 30000);
    }

    function checkTime(i) {
        if (i < 10) {
            i = "0" + i
        }; // add zero in front of numbers < 10
        return i;
    }

    function getTimes() {
        var output = $.ajax({
            url: "https://transloc-api-1-2.p.mashape.com/arrival-estimates.json?agencies=176&callback=call&routes=4000421%2C4000592%2C4005122&stops=4002123%2C4023414%2C4021521", // The URL to the API. You can get this by clicking on "Show CURL example" from an API profile
            type: 'GET', // The HTTP Method, can be GET POST PUT DELETE etc
            data: {}, // Additional parameters here
            dataType: 'json',
            success: function (data) {
                //
                //Change data.source to data.something , where something is whichever part of the object you want returned.
                //To see the whole object you can output it to your browser console using:
                console.log(data);
                document.getElementById("output").innerHTML = data;
            },
            error: function (err) {
                alert(err);
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader("X-Mashape-Authorization", "7eLsoFnNpomshsN6Xyqfr5Xyf4aOp16e11WjsnQz1nsMDnB8YI"); // Enter here your Mashape key
            }
        });
    }
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
    startTime();
    getTimes();
});