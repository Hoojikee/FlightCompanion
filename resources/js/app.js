var airports = [];
const aircraft = [
    { name: "B744", maxFlightDistance: 7285, maxPassengerCount: 400, cruiseSpeed: 528 },
    { name: "B733", maxFlightDistance: 2255, maxPassengerCount: 149, cruiseSpeed: 430 },
    { name: "B736", maxFlightDistance: 3235, maxPassengerCount: 149, cruiseSpeed: 453 },
    { name: "B737U", maxFlightDistance: 3010, maxPassengerCount: 149, cruiseSpeed: 453 },
    { name: "B737NG", maxFlightDistance: 3235, maxPassengerCount: 149, cruiseSpeed: 453 },
    { name: "B738", maxFlightDistance: 2935, maxPassengerCount: 184, cruiseSpeed: 453 },
    { name: "B73MAX8", maxFlightDistance: 3550, maxPassengerCount: 178, cruiseSpeed: 453 },
    { name: "B739ER", maxFlightDistance: 2950, maxPassengerCount: 189, cruiseSpeed: 453 },
    { name: "B739NG", maxFlightDistance: 2950, maxPassengerCount: 189, cruiseSpeed: 453 },
    { name: "B739U", maxFlightDistance: 2950, maxPassengerCount: 189, cruiseSpeed: 453 },
    { name: "B77W", maxFlightDistance: 7370, maxPassengerCount: 389, cruiseSpeed: 499 },
    { name: "B736", maxFlightDistance: 3300, maxPassengerCount: 180, cruiseSpeed: 447 },
    { name: "B736", maxFlightDistance: 7250, maxPassengerCount: 293, cruiseSpeed: 470 },
    { name: "MD80", maxFlightDistance: 1800, maxPassengerCount: 172, cruiseSpeed: 448 },
    { name: "MD82", maxFlightDistance: 1800, maxPassengerCount: 172, cruiseSpeed: 448 },
    { name: "Q400", maxFlightDistance: 1100, maxPassengerCount: 90, cruiseSpeed: 300 },
    { name: "E195", maxFlightDistance: 2300, maxPassengerCount: 122, cruiseSpeed: 447 }
];

//tweakable values
const MAX_CONNECTIONS = 15;
const THRESHOLD = .05;
const MAX_NUM_OF_FLIGHTPLANS = 10;

$('document').ready(function () {

    //populates the aircraft dropdown
    const aircraftDropdown = document.getElementById('aircraft');
    aircraft.forEach((item) => {
        var opt = document.createElement('option');
        opt.value = item.name;
        opt.innerHTML = item.name;
        aircraftDropdown.appendChild(opt);
    });

    //populates the connection dropdown
    const connectionsDropdown = document.getElementById('numOfConnections');
    for (var i = 0; i <= MAX_CONNECTIONS; i++) {
        var opt = document.createElement('option');
        opt.value = i;
        opt.innerHTML = i;
        connectionsDropdown.appendChild(opt);
    }

    //loads data from csv and populates the arrays with the data
    loadData();
});

function loadData() {
    //Airports
    Papa.parse("https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/airports.csv", {
        download: true,
        complete: function (results) {
            airports = results.data;
            console.log("Loaded airports!");
            console.log();
        }
    });
}

function submit() {

    //required inputs
    const desiredFlightTime = document.getElementById('maxTime').value;
    const selectedAircraft = getAircraft(document.getElementById('aircraft').value);
    const connections = document.getElementById('numOfConnections').value;

    //filters
    const smallAirports = document.getElementById('smallAirport').checked;
    const mediumAirports = document.getElementById('mediumAirport').checked;
    const largeAirports = document.getElementById('largeAirport').checked;
    const closedAirports = document.getElementById('largeAirport').checked;
    const heliports = document.getElementById('largeAirport').checked;

    var filters = [smallAirports, mediumAirports, largeAirports, closedAirports, heliports];

    //optional inputs
    const selectedDeparture = getAirportData(document.getElementById('selectedDeparture').value);
    const selectedArrival = getAirportData(document.getElementById('selectedArrival').value);

    if (selectedArrival == null && selectedDeparture == null) {
        selectedDeparture == getRandomAirport(filters, airports);
    }

    //calculates the estimated flight distance from the desired flight time
    const estimatedFlightDistance = (desiredFlightTime / 60) * selectedAircraft.cruiseSpeed;

    //determines if the desired flight time is too much for the selected aircraft
    if (connections == 0 && estimatedFlightDistance > selectedAircraft.maxFlightDistance) {
        connections = Math.floor(estimatedFlightDistance / selectedAircraft.maxFlightDistance);
        console.warn("The desired flight time surpasses the selected aircrafts capability, assigning " + connections + " connections.");
    }

    var flightplans = [];
    var fails = 0;

    while (flightplans.length < MAX_NUM_OF_FLIGHTPLANS && fails < 10) {
        if (selectedDeparture != null && selectedArrival == null) {
            console.log("Generating a flight plan from " + selectedDeparture[3] + ", with a desired flight time of " + desiredFlightTime + " minutes (" + estimatedFlightDistance + " NM), with " + connections + " connections, using " + selectedAircraft.name);
        }
        else if (selectedDeparture == null && selectedArrival != null) {
            console.log("Generating a flight plan to " + selectedArrival[3] + ", with a desired flight time of " + desiredFlightTime + " minutes (" + estimatedFlightDistance + " NM), with " + connections + " connections, using " + selectedAircraft.name);
        }

        const flightPlan = generateFlightPlan(selectedDeparture, selectedArrival, connections, estimatedFlightDistance, filters);

        //validate flightplans
        if (flightPlan.indexOf(flightPlan) > -1) {
            flightplans.push(flightPlan);
        }
        else {
            fails++;
        }
    }
}

function generateFlightPlan(_departingAirport, _arrivingAirport, _connections, _efd, filters) {

    var flightplan = [];


    if (_departingAirport != null && _arrivingAirport != null && _connections == 0) {
        flightplan.push(_arrivingAirport);
    }
    else if (_departingAirport != null && _arrivingAirport != null && _connections > 0) {
        //generate airports between the 2 airports
    }
    else if (_departingAirport != null && _arrivingAirport == null) {
        flightplan.push(_departingAirport);

        //get airports in range of departing airport
        var airportsInRange = getAirportsInRange(_departingAirport, _efd, filters);

        //if connections = 0 then should just randomly pick from the top airports that fit in the threshold
        if (_connections == 0) {
            flightplan.push(getRandomAirportThreshold(airportsInRange, _efd, _departingAirport));
        }
        else {
            //loop by nunmber of connections
            for (var j = 1; j <= _connections; j++) {
                flightplan = recursiveFunction(_efd, flightplan, airportsInRange, false, filters);
            }
        }
    }
    else if (_departingAirport == null && _arrivingAirport != null) {

        //get airports in range of departing airport
        var airportsInRange = getAirportsInRange(_arrivingAirport, _efd, filters);

        //if connections = 0 then should just randomly pick from the top airports that fit in the threshold
        if (_connections == 0) {
            flightplan.push(getRandomAirportThreshold(airportsInRange, _efd, _arrivingAirport));
        }
        else {
            //loop by nunmber of connections
            for (var j = 1; j <= _connections; j++) {
                flightplan = recursiveFunction(_efd, flightplan, airportsInRange, true, filters);
            }
        }

        flightplan.push(_arrivingAirport);
    }

    console.log(flightplan);

    return flightplan;
}

function recursiveFunction(_distance, _flightplan, _airports, _shouldReverse, filters) {
    if (_distance > 0 && _airports.length > 0) {
        //selects a random airport
        var airportToAdd;
        var tries = 0
        while (airportToAdd == null && tries < 10) {
            airportToAdd = getRandomAirportThreshold(_airports, _distance, _flightplan[_flightplan.length - 1]);
            if (airportToAdd == null) {
                tries++;
            }
        }

        if (airportToAdd != null) {
            //gets the distance from the last airport in flight plan and the airport to add to the flight plan
            const dist = getDistance(_flightplan[_flightplan.length - 1], airportToAdd);

            //subtracts the distance from the total distance
            _distance = _distance - dist;

            //adds the selected airport to the flight
            if (!_shouldReverse) {
                _flightplan.push(airportToAdd);
            }
            else {
                _flightplan.unshift(airportToAdd);
            }
            //removes the selected airport from the array to prevent selecting duplicates
            const index = _airports.indexOf(airportToAdd);
            if (index > -1) {
                _airports.splice(index, 1);
            }

            //updates the airport list so that they are now airports within distance to the selected airport
            _airports = getAirportsInRange(_flightplan[_flightplan.length - 1], _distance, filters);
            for (var i = 0; i < _flightplan.length; i++) {
                const indexToRemove = _airports.indexOf(_flightplan[i]);
                if (indexToRemove > -1) {
                    _airports.splice(indexToRemove, 1);
                }
            }

            return recursiveFunction(_distance, _flightplan, _airports, _shouldReverse);
        }
        else {
            var err = "Failed to continue generating flightplans because: ";
            if (tries < 10)
                err + "Exceeded the number of tries to generate a random airport from threshold."
            else if (airportToAdd == null)
                err + "No available airports to add."
            console.err(err);
            return _flightplan;
        }
    }
    else {
        return _flightplan;
    }
}

//helper functions

function getAircraft(value) {
    var _aircraft;

    if (value == "Random Aircraft") {
        _aircraft = getRandomAircraft();
        console.log(_aircraft);
    }
    else {
        aircraft.forEach((item) => {
            if (item.name == value) {
                _aircraft = item;
            }
        });
    }

    return _aircraft;
}

function getAirportData(input) {
    var airport;
    if (input != "") {

        airports.forEach((item) => {
            if (item[1] == input || item[3] == input) {
                airport = item;
            }
        });

        if (airport == undefined) {
            console.error("Invalid input!");
        }
    }

    return airport;
}

function getRandomAircraft() {
    return aircraft[Math.floor(Math.random() * aircraft.length)];
}

function getAirportsInRange(_airport, _range, filters) {
    var airportsInRange = [];

    airports.forEach((item) => {
        const dist = getDistance(_airport, item);
        if ((filters[0] == true && item[2] === "small_airport") ||
            (filters[1] == true && item[2] === "medium_airport") ||
            (filters[2] == true && item[2] === "large_airport") ||
            (filters[3] == true && item[2] === "closed_airport") ||
            (filters[4] == true && item[2] === "heliport")) {
            if (dist <= _range && item != _airport) {
                airportsInRange.push(item);
            }
        }
    });

    //sorts the array in ascending order
    airportsInRange.sort(function (a, b) { return getDistance(_airport, a) - getDistance(_airport, b) });

    return airportsInRange;
}

function getDistance(_airport1, _airport2) {
    const lat1 = _airport1[4];
    const lat2 = _airport2[4];
    const lon1 = _airport1[5];
    const lon2 = _airport2[5];

    const R = 6371e3; // metres

    var a1 = lat1 * Math.PI / 180; // φ, λ in radians
    var b2 = lat2 * Math.PI / 180;
    var Δφ = (lat2 - lat1) * Math.PI / 180;
    var Δλ = (lon2 - lon1) * Math.PI / 180;

    var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(a1) * Math.cos(b2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    var d = R * c; // in metres

    return (d / 1852); // in nautical miles
}

function getRandomAirport(filters, _airports) {
    var filteredAirports = [];

    _airports.forEach((item) => {
        if ((filters[0] == true && item[2] === "small_airport") ||
            (filters[1] == true && item[2] === "medium_airport") ||
            (filters[2] == true && item[2] === "large_airport") ||
            (filters[3] == true && item[2] === "closed_airport") ||
            (filters[4] == true && item[2] === "heliport")) {
            filteredAirports.push(item);
        }
    });

    return filteredAirports[Math.floor(Math.random() * filteredAirports.length)];
}

function getRandomAirportThreshold(_airports, _range, _airport) {
    var airportsInThreshold = [];
    var thresholdRange = _range - (_range * THRESHOLD);

    //adds all airports that fit into the threshold range to an array
    _airports.forEach((item) => {
        const dist = getDistance(_airport, item);
        if (dist >= thresholdRange && item != _airport) {
            airportsInThreshold.push(item);
        }
    });

    //if there are no airports that fit into the threshold do something
    if (airportsInThreshold.length == 0) {
        //do something
        console.error("There are no airports that into the fit into the threshold range.");
        return null;
    }

    //else return a random airport from the threshold
    else {
        return airportsInThreshold[Math.floor(Math.random() * airportsInThreshold.length)];
    }
}