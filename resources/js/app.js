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

const MAX_CONNECTIONS = 15;

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

    //optional inputs
    const selectedDeparture = getAirportDataByICAO(document.getElementById('selectedDeparture').value);

    //calculates the estimated flight distance from the desired flight time
    const estimatedFlightDistance = (desiredFlightTime / 60) * selectedAircraft.cruiseSpeed;

    //determines if the desired flight time is too much for the selected aircraft
    if (connections == 0 && estimatedFlightDistance > selectedAircraft.maxFlightDistance) {
        connections = Math.floor(estimatedFlightDistance / selectedAircraft.maxFlightDistance);
        console.warn("The desired flight time surpasses the selected aircrafts capability, assigning " + connections + " connections.");
    }

    console.log("Generating a flight plan from " + selectedDeparture[3] + ", with a desired flight time of " + desiredFlightTime + " minutes (" + estimatedFlightDistance + " NM), with " + connections + " connections, using " + selectedAircraft.name);
    generateFlightPlan(selectedDeparture, connections);
}

function generateFlightPlan(_departingAirport, _connections) {

    //get airports in range of departing airport
    var airportsInRange = getAirportsInRange(_departingAirport, 1000);
    console.log(airportsInRange);
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

function getAirportDataByICAO(icao) {
    var airport;
    if (icao != "") {

        airports.forEach((item) => {
            if (item[1] == icao) {
                airport = item;
            }
        });

        if (airport == undefined) {
            console.error("Invalid ICAO!");
        }
    }
    else {
        airport = getRandomAirport(airports);
    }


    return airport;
}

function getRandomAircraft() {
    return aircraft[Math.floor(Math.random() * aircraft.length)];
}

function getAirportsInRange(_airport, _range) {
    var airportsInRange = [];

    airports.forEach((item) => {
        const dist = getDistance(_airport, item);
        if (dist <= _range && item != _airport) {
            airportsInRange.push(item);
        }
    });

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

function getRandomAirport(airports) {
    return airports[Math.floor(Math.random() * airports.length)]
}