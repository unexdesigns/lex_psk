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

		this.init();

		// Post inicializacija

		this.element.xmap = this;
	}
	

	/** Sukuria žemėlapį, sudeda markerius ir parengia funkcionalumą */
	init() {
		this.map = new google.maps.Map(this.element, this.config.map);

		
 
		$script(this.dependencies, () => {
			this.addMarkers();
			this.fitMarkers();
		})
	}

	/** Sudeda duomenis iš globalaus `data` kintamojo į žemėlapį */
	addMarkers () {

		getPlaces().forEach(place => {
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
		let defaults = {
			map: this.map,
			icon: {
				path: SQUARE_PIN,
				fillColor: '#e0635a',
				fillOpacity: 1,
				strokeColor: 'rgba(0, 0, 0, .12)',
				strokeWeight: 1,
			},
			label: {
				fontFamily: 'Font Awesome\ 5 Free',
				text: ""
    		}
		}, marker = new google.maps.Marker(
			Object.assign({}, defaults, markerConfig)
		)

		this.markers.push(marker);

		return marker;
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
