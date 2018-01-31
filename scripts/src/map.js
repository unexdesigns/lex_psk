/* Čia talpinamas visas funkcionalumas susijęs su Google Maps API */
/* global MarkerClusterer */

import {data}    from './map.data.js';
import {style}   from './map.style.js';

/** Klasė operuoti su Google Maps */
class xMap {
    /** Inicializuojami numatyti objektai
     * @param {HTMLElement} element, elementas, kuriame bus kraunamas žemėlapis
     * @param {object} [config] - žemėlapio konfiguracija
     */
    constructor(element, config) {
        // Defaults
        const defaults = {
            map: {
                center: {
                    lat: 55.513661757303204,
                    lng: 382.3113278808594,
                },
                zoom             : 9,
                minZoom          : 8,
                gestureHandling  : 'greedy',
                fullscreenControl: false,
                mapTypeControl   : false,
                streetViewControl: false,
                styles           : style,
            },
        };

        // Inicializacija vidinės konfiguracijos
        this.config = {};
        this.dependencies = [];
        this.element = $(element)[0];
        this.map = {};
        this.markers = [];

        this.config.map = Object.assign({}, defaults.map, config);

        this.init();

        // Post inicializacija

        this.element.xmap = this;
    }

    /** Sukuria žemėlapį, sudeda markerius ir parengia funkcionalumą */
    init() {
        this.map = new google.maps.Map(this.element, this.config.map);
        this.addMarkers();
        this.clusterMarkers();
        this.fitMarkers();
        // this.route();
        this.events();
    }

    /** Elgesys į įvairius 'click', 'load' įvykius */
    events() {
    }

    /** Sudeda duomenis iš globalaus `data` kintamojo į žemėlapį */
    addMarkers() {
        getPlaces().forEach((place, i) => {
            this.addMarker({
                title   : place.name,
                position: place.position,
            });
        });
    }

    /** Sutalpina visus žemėlapio markerius į ekraną */
    fitMarkers() {
        let bounds = new google.maps.LatLngBounds();

        this.markers.forEach((marker) => {
            bounds.extend(marker.getPosition());
        });

        this.map.fitBounds(bounds);
    }

    /**
     * Prideda markerį prie žemėlapio
     * @param {MarkerOptions} markerConfig
     * @return {Marker}
     * @memberof xMap
     */
    addMarker(markerConfig) {
        let marker = new google.maps.Marker(
            Object.assign({}, {
                map   : this.map,
                icon  : this.default.marker.icon,
                zIndex: 100,
            }, markerConfig)
        );

        this.markers.push(marker);

        return marker;
    }

    /** Paslepia visus markerius */
    hideMarkers() {
        this.markers.forEach((marker, i) => {
            this.markers[i].setMap(null);
        });
        this.clusterer.clearMarkers();
    }

    /** Rodo visus markerius */
    showMarkers() {
        this.markers.forEach((marker) => {
            marker.setMap(this.map);
        });
        this.clusterMarkers();
    }

    /** Sugrupuoja artimai esančius žymeklius */
    clusterMarkers() {
        this.clusterer = new MarkerClusterer(this.map, this.markers, {
            gridSize: 36,
            styles  : this.default.cluster.styles,
        });
    }

    /** Inicializuoja `directions service`, paskaičiuoja ir rodo maršrutą  */
    route() {
        let places = this.markers.slice(4, 8),
            routeIcon = {
                url       : '/prototype/bin/route_marker.png',
                origin    : new google.maps.Point(0, 0),
                anchor    : new google.maps.Point(12, 12),
                scaledSize: new google.maps.Size(24, 24),
            };

        // Directions
        this.directions = {
            markers : places,
            Service : new google.maps.DirectionsService(),
            Renderer: new google.maps.DirectionsRenderer({
                map          : this.map,
                markerOptions: {
                    icon: routeIcon,
                },
                polylineOptions: {
                    strokeColor: '#E64D4F',
                },
            }),
        };
        this.directions.markers = places;
        this.directions.Service = new google.maps.DirectionsService();

        let mar = this.directions.markers,
            ren = this.directions.Renderer;

        // Parametrai maršruto užklausai
        this.directions.request = {
            origin     : mar[0].getPosition(),
            destination: mar[mar.length - 1].getPosition(),
            waypoints  : mar.slice(1, mar.length - 1).map((marker) => {
                return {
                    location: marker.position,
                };
            }),
            travelMode: 'DRIVING',
        };

        console.log(this.directions.request);

        this.directions.Service.route(this.directions.request, (result, code) => {
            if (code === 'OK') {
                this.hideMarkers();

                // enable routed markers
                mar.forEach((marker) => {
                    marker.setMap(this.map);
                });

                ren.setDirections(result);
            } else {
                console.log('ROUTE ERROR: ' + code, result);
            }
        });

        // HACK | Maršruto sukurtų markerių išlupimas
        // https://stackoverflow.com/questions/18770599/display-label-for-each-waypoint-pin-on-google-map-api

        google.maps.event.addListener(ren, 'directions_changed', () => {
                var markersArray = []; // empty the array

                setTimeout(function() { // wait until markers render
                    for (var k in ren) { // search everything in directionsDisplay
                        if (typeof ren[k].markers != 'undefined') { //  its that the markers?
                            ren[k].markers.forEach((m, i) => {
                                markersArray.push(m);
                                m.setLabel({ // lets change the label!
                                    color     : 'rgba(0, 0, 0, .58)',
                                    fontSize  : '12px',
                                    fontWeight: '700',
                                    text      : (i + 1).toString(),
                                });

                                if (i < ren[k].markers.length - 1) {
                                    m.setIcon(Object.assign({}, routeIcon,
                                        {url: '/prototype/bin/route_marker_yellow.png'}
                                    ));
                                }
                            });
                        }
                    }
                    console.log(markersArray); // now markersArray have all the markers
                }, 0);
            });
    }

    /** Numatyti parametrai įvairiems žemėlapio objektams (markeriams, clusteriams) */
    get default() {
        return {
            marker: {
                icon: {
                    url       : '/prototype/bin/marker.png',
                    origin    : new google.maps.Point(0, 0),
                    anchor    : new google.maps.Point(14, 28),
                    scaledSize: new google.maps.Size(28, 28),
                },
            },
            cluster: {
                styles: [{
                    textColor: 'rgba(0, 0, 0, 0.57)',
                    url      : '/prototype/bin/m1.png',
                    height   : 36,
                    width    : 36,
                }],
            },
        };
    }
}

/** Ši funkcija kviečiama, kai užkraunamas Google Maps API */
function initMap() {
    require(['js-marker-clusterer'], () => {
        new xMap('#map');
    });
}

/* exports parseGlobalData */
/** Paima pavadinimus iš `./map-data.js` ir geokoduoja į koordinates */
function parseGlobalData() {
    data.forEach((region) => {
        Promise.all(region.places.map((place) => {
            return new Promise((resolve) => {
                $.get('https://maps.googleapis.com/maps/api/geocode/json', {
                    address: place.name,
                    key    : 'AIzaSyCwsqyR30H2vUlJuTotTffzLQpPnfvgG0E',
                }, (res) => {
                    res.location_id = region.location_id;
                    res.place_id = place.place_id;
                    resolve(res);
                });
            });
        })).then((responses) => {
            responses.forEach((response) => {
                if (response.status === 'OK') {
                    let places = _.find(data, {
                        location_id: response.location_id,
                    }).places;

                    let place = _.find(places, {
                        place_id: response.place_id,
                    });

                    place.parsed = response.results[0];
                }
            });
        });
    });
}

/** Grąžina vieną sujungtą vietų masyvą
 * @return {array}
*/
function getPlaces() {
    let places_array = [];

    data.forEach((location) => {
        location.places.forEach((place) => {
            places_array.push(place);
        });
    });

    return places_array;
}


window.map = map;
window.data = data;
window.initMap = initMap;
