let startTime = Math.floor(new Date().getTime() / 1000),
    continueRun = true,
    positions = [],
    lastPositionCheck = startTime,
    distanceMetres = 0,
    closeLoop = false;

navigator.geolocation.getCurrentPosition((pass) => {
    positions.push(pass);
}, (fail) => {
    console.log("Error in getting position: " + fail);
});

let refreshId = setInterval(() => {
    let timeValue = document.getElementById('jog-time-value'),
        distanceValue = document.getElementById('jog-distance-value'),
        currentTime = Math.floor(new Date().getTime() / 1000),
        currentJogTime = currentTime - startTime,
        seconds, secondsStr, minutes, minutesStr, hours, hoursStr;

    // Converting currentJogTime to values
    seconds = currentJogTime % 60;
    (seconds < 10) ? secondsStr = "0" + seconds : secondsStr = seconds;
    currentJogTime = Math.floor(currentJogTime / 60);

    minutes = currentJogTime % 60;
    (minutes < 10) ? minutesStr = "0" + minutes : minutesStr = minutes;
    currentJogTime = Math.floor(currentJogTime / 60);

    hours = currentJogTime;
    (hours < 10) ? hoursStr = "0" + hours : hoursStr = hours;

    timeValue.innerHTML = hoursStr + ":" + minutesStr + ":" + secondsStr;

    // Getting position every 30 seconds
    if ((currentTime - lastPositionCheck) > 15) {
        lastPositionCheck = currentTime;
        navigator.geolocation.getCurrentPosition((pass) => {
            if (positions.length !== 0) {
                distanceMetres += getDistance(positions[positions.length - 1], pass)
            }
            positions.push(pass);
        }, (fail) => {
            console.log("Error in getting position: " + fail);
        });

        distanceValue.innerHTML = (Math.round(distanceMetres * 10) / 10) + "m"
    }

    if (closeLoop) {
        clearInterval(refreshId);
    }
}, 100);

// https://stackoverflow.com/questions/43167417/calculate-distance-between-two-points-in-leaflet
function getDistance(origin, destination) {
    // return distance in meters
    let lon1 = toRadian(origin['coords']['longitude']),
        lat1 = toRadian(origin['coords']['latitude']),
        lon2 = toRadian(destination['coords']['longitude']),
        lat2 = toRadian(destination['coords']['latitude']),
        deltaLat = lat2 - lat1,
        deltaLon = lon2 - lon1,
        a = Math.pow(Math.sin(deltaLat/2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLon/2), 2),
        c = 2 * Math.asin(Math.sqrt(a)),
        EARTH_RADIUS = 6371;

    return c * EARTH_RADIUS * 1000;
}

function toRadian(degree) {
    return degree*Math.PI/180;
}

function stopClick(shouldSave) {
    if (shouldSave) {
        let request = {
            startTime,
            endTime: Math.floor(new Date().getTime() / 1000),
            coords: []
        };
        let endTime = Math.floor(new Date().getTime() / 1000);

        // Send startTime and endTime

        positions.forEach((pos) => {
            request['coords'].push({
                coordTime: pos['timestamp'],
                latitude: pos['coords']['latitude'],
                longitude: pos['coords']['longitude'],
            })
        });

        $.ajax({
            type: 'POST',
            data: request,
            contentType: 'application/json',
            url: 'http://138.68.164.214/jogs/put',
        });

    }

    window.location.href = 'index.html';
}