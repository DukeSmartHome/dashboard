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
  /*  
    function doIt() { 
 var output = $.ajax({
    url: 'https://SOMEAPI.p.mashape.com/', // The URL to the API. You can get this by clicking on "Show CURL example" from an API profile
    type: 'GET', // The HTTP Method, can be GET POST PUT DELETE etc
    data: {}, // Additional parameters here
    dataType: 'json',
    success: function(data) {
    	//
        //Change data.source to data.something , where something is whichever part of the object you want returned.
        //To see the whole object you can output it to your browser console using:
        //console.log(data);
       	document.getElementById("output").innerHTML = data.source; 
        },
    error: function(err) { alert(err); },
    beforeSend: function(xhr) {
    xhr.setRequestHeader("X-Mashape-Authorization", "YOUR_API_KEY"); // Enter here your Mashape key
    }*/
     
         startTime();
});