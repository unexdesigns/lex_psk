/* eslint "parserOptions/sourceType": "module" */

/**
 * Čia talpinamas visas funkcionalumas susijęs su Google Maps API
 */

import {data}    from './map.data.js';
import {style}   from './map.style.js';
import $script from 'scriptjs';

class xMap {
	constructor(element, config){
		// Defaults
		const defaults = {
			map: {
				center: {
					lat: 55.513661757303204,
					lng: 382.3113278808594
				},
				zoom: 9,
				minZoom: 8,
				gestureHandling: 'greedy',
				fullscreenControl: false,
				mapTypeControl: false,
				streetViewControl: false,
				styles: style
			}
		};

		// Inicializacija vidinės konfiguracijos
		this.config       = {};
		this.dependencies = []
		this.element      = $(element)[0];
		this.map          = {};
		this.markers      = [];

		this.config.map = Object.assign({}, defaults.map, config);

		require(['js-marker-clusterer'], () => {
			this.init();
		});


		// Post inicializacija

		this.element.xmap = this;
	}

	/** Sukuria žemėlapį, sudeda markerius ir parengia funkcionalumą */
	init() {
		this.map = new google.maps.Map(this.element, this.config.map);
		this.addMarkers();
		this.clusterMarkers();
		this.fitMarkers();
		this.route();
		this.events();
	}

	events() {
	}

	/** Sudeda duomenis iš globalaus `data` kintamojo į žemėlapį */
	addMarkers () {
		getPlaces().forEach((place, i) => {
			let marker = this.addMarker({
				title: place.name,
				position: place.position
			});
		});

	}

	/** Prizoominą žemėlapį, kad matytųsi visi markeriai */
	fitMarkers(){
		let bounds = new google.maps.LatLngBounds();

		this.markers.forEach(marker => {
			bounds.extend(marker.getPosition());
		})

		this.map.fitBounds(bounds);
	}

	/**
	 * Prideda markerį prie žemėlapio
	 * @param {MarkerOptions} markerConfig
	 * @returns {Marker}
	 * @memberof xMap
	 */
	addMarker (markerConfig) {
		let marker = new google.maps.Marker(
			Object.assign({}, {
				map: this.map,
				icon: this.default.marker.icon,
			}, markerConfig)
		);

		this.markers.push(marker);

		return marker;
	}

	/** Paslepia visus markerius */
	hideMarkers () {
		this.markers.forEach((marker, i) => {
			this.markers[i].setMap(null);
		});
		this.clusterer.clearMarkers();
	}

	/** Rodo visus markerius */
	showMarkers () {
		this.markers.forEach(marker => {
			marker.setMap(this.map);
		});
		this.clusterMarkers();
	}

	clusterMarkers() {
		this.clusterer = new MarkerClusterer(this.map, this.markers, {
			gridSize: 36,
			styles: this.default.cluster.styles
		});
	}

	/** Inicializuoja `directions service`, paskaičiuoja ir rodo maršrutą  */
	route() {
		let places = this.markers.slice(0, 4);

		this.directions = {
			markers: places,
			Service: new google.maps.DirectionsService(),
			Renderer: new google.maps.DirectionsRenderer({
				map: this.map,
				markerOptions: {
					icon: {
						url: '/prototype/bin/route_marker.png',
						origin: new google.maps.Point(0, 0),
						anchor: new google.maps.Point(9, 9),
						scaledSize: new google.maps.Size(18, 18)
					}
				},
				polylineOptions: {
					strokeColor: '#E64D4F'
				}
			})
		};
		this.directions.markers = places;
		this.directions.Service  = new google.maps.DirectionsService();



		/** Parametrai maršruto užklausai  */
		this.directions.request = {
			origin:      this.directions.markers[0].getPosition(),
			destination: this.directions.markers[this.directions.markers.length - 1].getPosition(),
			waypoints  : this.directions.markers.slice(1, this.directions.markers.length).map(marker => {
				return {
					location: marker.position
				}
			}),
			travelMode: 'DRIVING',
		}

		this.directions.Service.route(this.directions.request, (result, status) => {
			if (status === 'OK') {
				this.hideMarkers();

				// enable routed markers
				this.directions.markers.forEach((marker) => {
					marker.setMap(this.map);
				})

				this.directions.Renderer.setDirections(result);
			} else {
				console.log('ROUTE ERROR: ' + status, result);
			}
		});

		// HACK | Maršruto sukurtų markerių išlupimas
		// https://stackoverflow.com/questions/18770599/display-label-for-each-waypoint-pin-on-google-map-api

		google.maps.event.addListener(this.directions.Renderer, 'directions_changed', function () {
				var self = this,
					markersArray = []; //empty the array

				setTimeout(function () { //wait until markers render
					for (var k in self) { //search everything in directionsDisplay
						if (typeof self[k].markers != 'undefined') { //  its that the markers?
							var markers = self[k].markers;
							for (var i = 0; i < markers.length; ++i) {
								markersArray.push(markers[i]);
								markersArray[i].setLabel({ //lets change the label!
									color: "black",
									fontSize: "16px",
									text: i.toString()
								});
							}
						}
					}
					console.log(markersArray); // now markersArray have all the markers 
				}, 0);
			});

	}

	get default() {
		return {
			marker: {
				icon: {
					url: '/prototype/bin/marker.png',
					origin: new google.maps.Point(0, 0),
					anchor: new google.maps.Point(14, 28),
					scaledSize: new google.maps.Size(28, 28)
				}
			},
			cluster: {
				styles: [{
					textColor: 'rgba(0, 0, 0, 0.57)',
					url: '/prototype/bin/m1.png',
					height: 36,
					width: 36
				}]
			}
		}
	}
}

window.map = map;

function initMap(){
	new xMap('#map');
}

/** Paima pavadinimus iš `./map-data.js` ir geokoduoja į koordinates */
function parseGlobalData(){
	data.forEach(region => {
		Promise.all(region.places.map(place => {
			return new Promise(resolve => {
				$.get('https://maps.googleapis.com/maps/api/geocode/json', {
					address: place.name,
					key: 'AIzaSyCwsqyR30H2vUlJuTotTffzLQpPnfvgG0E'
				}, res => {
					res.location_id = region.location_id;
					res.place_id = place.place_id;
					resolve(res);
				});
			});
		})).then(responses => {
			responses.forEach(response => {
				if (response.status === 'OK') {
					let places = _.find(data, {
						location_id: response.location_id
					}).places;

					let place = _.find(places, {
						place_id: response.place_id
					});

					place.parsed = response.results[0];
				}
			});
		});
	});
}

/** Grąžina vieną sujungtą vietų masyvą */
function getPlaces(){
	let places_array = [];

	data.forEach(location => {
		location.places.forEach(place => {
			places_array.push(place);
		})
	})

	return places_array;
}

window.data = data;
window.initMap = initMap;
