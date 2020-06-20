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
    console.log(result.data)
    return result.data
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
        console.log(station_data[i])

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
// generateRoute().then(result => {
//     firstStationNum = Math.floor(Math.random() * station_data.length)
//     secondStationNum = Math.floor(Math.random() * station_data.length)

//     console.log("first Station: " + station_data[firstStationNum]['name'])
//     let firstStation = new google.maps.LatLng(station_data[firstStationNum]['lat'], station_data[firstStationNum]['lon'])
//     console.log("lat lng of first " + firstStation)

//     console.log("second location " + station_data[secondStationNum]['name'])
//     let secondStation = new google.maps.LatLng(station_data[secondStationNum]['lat'], station_data[secondStationNum]['lon'])

//     // checkRoute
//     let request = {
//         origin: firstStation, 
//         destination: secondStation, 
//         travelMode: 'BICYCLING'
//     };
//     directionsService.route(request, function(response, status) {
//         if(status == "OK") {
//             if(response.routes[0].legs[0].duration.value <= 1800){
//                 console.log(response.routes[0].legs[0].duration.value)
//                 directionsRenderer.setDirections(response);
//                 directionsRenderer.setMap(map);
//             }
//             else {
//                 console.log('route is over 30 mins... finding new route' + response)
//             }
//         }
//         else{
//             console.log('ERROR')
//         }
//     })

// })
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

window.onload = function () {
    console.log(markers)
    const button = document.querySelector('#generateButton')
    button.addEventListener('click', function () {
        generateRoute().then(result => {
            firstStationNum = Math.floor(Math.random() * station_data.length)
            secondStationNum = Math.floor(Math.random() * station_data.length)

            console.log("first Station: " + station_data[firstStationNum]['name'])
            let firstStation = new google.maps.LatLng(station_data[firstStationNum]['lat'], station_data[firstStationNum]['lon'])
            console.log("lat lng of first " + firstStation)

            console.log("second location " + station_data[secondStationNum]['name'])
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
                        console.log(response.routes[0].legs[0].duration.value)
                        setMapOnAll(null);
                        console.log(map)
                        directionsRenderer.setDirections(response);
                        directionsRenderer.setMap(map);
                        
                        const originInfo = document.querySelector('#originInfo')
                        let originText = document.createElement('p')
                        originText.appendChild(document.createTextNode(station_data[firstStationNum]['address']))
                        originInfo.appendChild(originText)
                        console.log(originInfo)

                        const destinationInfo = document.querySelector('#destinationInfo')
                        let destinationText = document.createElement('p')
                        destinationText.appendChild(document.createTextNode(station_data[secondStationNum]['address']))
                        destinationInfo.appendChild(destinationText)
                        console.log(destinationInfo)
                        
                        result.appendChild(document.createTextNode("Estimated Time: " + response.routes[0].legs[0].duration.text))
                    } else {
                        console.log('route is over 30 mins... finding new route' + response)
                        
                        // result.appendChild(document.createTextNode('Result generated was over 30 mins.. click Generate to try again.'))
                    }
                } else {
                    console.log('ERROR')
                }
            })

        })
    })
}