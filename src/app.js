'use strict';
let map;
let directionsService;
let directionsRenderer;


let markers = [];

// function to initialize map
function initMap() {
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    // center map on King's College Circle (UofT)
    const myLatlng = new google.maps.LatLng(43.6426, -79.3871)
    map = new google.maps.Map(document.getElementById("map"), {
            center: {
                lat: 43.6629,
                lng: -79.3957
            },
            zoom: 12
        }

    );
    // setup bike layer for map
    const bikeLayer = new google.maps.BicyclingLayer();
    bikeLayer.setMap(map)


}

const url = 'https://tor.publicbikesystem.net/ube/gbfs/v1/en/station_information'
let station_data;
const getStations = async () => {
    let response = await fetch(url)
    let result = await response.json()
    station_data = result.data['stations']
    addStationsToSelect(station_data)
    return result.data
}


function addStationsToSelect(station_data) {
    const dropdown = document.querySelector('#originDropdown')
    for (let i = 0; i < station_data.length; i++) {
        let option = document.createElement('option')
        option.value = i
        option.text = station_data[i].name
        dropdown.appendChild(option)

    }
}

function printStationMarkers() {
    return Promise.all([getStations()])
}

let lat;
let lon;
let myLatlng;
let marker;

printStationMarkers().then(result => {
    for (let i = 0; i < station_data.length; i++) {

        lat = station_data[i]['lat']
        lon = station_data[i]['lon']
        myLatlng = new google.maps.LatLng(lat, lon)
        var marker = new google.maps.Marker({
            position: myLatlng,
            animation: google.maps.Animation.DROP,
            map: map,
            title: station_data[i]['name']
        })
        marker.setMap(map);
        markers.push(marker);
    }
})
let firstStation, firstStationNum;
let secondStation, secondStationNum;

const generateRoute = (station_data) => {
    return Promise.all([getStations(), printStationMarkers()])
}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
    setMapOnAll(null);
}

const getRoute = () => {
    generateRoute().then(result => {
        const dropdown = document.querySelector('#originDropdown')
        if (dropdown.value === "Random") {
            firstStationNum = Math.floor(Math.random() * station_data.length)
        } else {
            firstStationNum = dropdown.value
        }
        firstStation = new google.maps.LatLng(station_data[firstStationNum]['lat'], station_data[firstStationNum]['lon'])
        secondStationNum = Math.floor(Math.random() * station_data.length)

        let secondStation = new google.maps.LatLng(station_data[secondStationNum]['lat'], station_data[secondStationNum]['lon'])

        // checkRoute
        let request = {
            origin: firstStation,
            destination: secondStation,
            travelMode: 'BICYCLING'
        };

        directionsService.route(request, function (response, status) {
            const result = document.querySelector('#generationResult')
            if (status == "OK") {

                if (response.routes[0].legs[0].duration.value <= 1800) {
                    setMapOnAll(null);
                    directionsRenderer.setDirections(response);
                    directionsRenderer.setMap(map);

                    const originAddress = document.querySelector('#originAddress')
                    originAddress.innerText = station_data[firstStationNum]['address']

                    const destinationAddress = document.querySelector('#destinationAddress')
                    destinationAddress.innerText = station_data[secondStationNum]['address']


                    result.innerText = "Estimated Time: " + response.routes[0].legs[0].duration.text;
                } else {
                    return getRoute();
                }
            } else {
                console.log('ERROR')
            }
        })

    })
}

window.onload = function () {
    const button = document.querySelector('#generateButton')
    button.addEventListener('click', getRoute);
}