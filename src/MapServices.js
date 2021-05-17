/* global google */
export const placeMarkerOnClick = (map, location) => {
  let marker = new google.maps.Marker({
    position: location,
    map: map
  });
  google.maps.event.addListener(marker, 'click', event => {
    const markerlocation = event.latLng;
    const infowindow = new google.maps.InfoWindow({
      content: 'Latitude: ' + markerlocation.lat() + '<br>Longitude: ' + markerlocation.lng()
    });
    infowindow.open(map, marker);
  });
  google.maps.event.addListener(marker, 'rightclick', function () {
    marker.setMap(null);
    marker = null;
  });
};
export const placeMarkerAfterGeoCode = (map, item, callback, elementList) => {
  let marker = new google.maps.Marker({
    position: item.geometry.location,
    map: map,
    address: item.formatted_address
  });
  map.panTo(item.geometry.location);
  map.setZoom(17);
  google.maps.event.addListener(marker, 'click', event => {
    elementList.infowindowList.forEach(el => {
      el.close();
    });
    const markerlocation = event.latLng;
    const infowindow = new google.maps.InfoWindow({
      content: '<div><strong>' + item.formatted_address + '</strong><br>Latitude: ' + markerlocation.lat() + '<br>Longitude: ' + markerlocation.lng(),
      address: item.formatted_address
    });
    elementList.infowindowList.push(infowindow);
    infowindow.open(map, marker);
    callback && callback({ ...item,
      geometry: {
        location: {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        }
      }
    });
  });
  google.maps.event.addListener(marker, 'dblclick', event => {
    callback && callback({ ...item,
      geometry: {
        location: {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        }
      }
    });
  });
  google.maps.event.addListener(marker, 'rightclick', () => {
    callback && callback({
      geometry: {
        location: {
          lat: '',
          lng: ''
        }
      },
      formatted_address: ''
    });
    marker.setMap(null);
    marker = null;
  });
};
export const reverseGeocodeService = (map, latlong, callback, elementList) => {
  const geocoder = new google.maps.Geocoder();
  const latlng = new google.maps.LatLng(latlong.lat(), latlong.lng());
  geocoder.geocode({
    location: latlng
  }, function (results, status) {
    if (status === 'OK') {
      placeMarkerAfterGeoCode(map, results[0], callback, elementList);
      callback(results[0]);
    }
  }).catch(e => e);
};
export const geocode = (map, address, callback) => {
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({
    address: address
  }, function (results, status) {
    if (status === 'OK') {
      map.panTo(results[0].geometry.location);
      map.setZoom(17);
      callback && callback(results);
    } else {
      throw status;
    }
  });
};
export const geocodeWithMarker = (map, address, callback, elementList) => {
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({
    address: address
  }, function (results, status) {
    if (status === 'OK') {
      map.panTo(results[0].geometry.location);
      map.setZoom(17);
      placeMarkerAfterGeoCode(map, results[0], callback, elementList);
      callback && callback({ ...results[0],
        geometry: {
          location: {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
          }
        }
      });
    } else {
      throw status;
    }
  });
};
export const showDirection = async (stationsArr, callback) => {
  let Tdistance = 0;

  if (stationsArr.length > 0) {
    const service = new google.maps.DirectionsService();
    const stations = stationsArr.map(el => ({
      lat: parseFloat(el.lat),
      lng: parseFloat(el.lng),
      name: el.name
    })); // Divide route to several parts because max stations limit is 25 (23 waypoints + 1 origin + 1 destination)

    const parts = [],
          max = 24;

    for (let i = 0; i < stations.length; i = i + max) {
      parts.push(stations.slice(i, i + max + 1));
    } // Service callback to process service results


    const service_callback = async (response, status) => {
      if (status !== 'OK') {
        return 'bb';
      }

      Tdistance += calcTotalDistance(response.routes[0].legs);
      callback(Tdistance);
      callback(1000);
      return 'aa';
    }; // Send requests to service to get route (for stations count <= 25 only one request will be sent)
    // parts.forEach((element, i) => {


    for (let i = 0; i < parts.length; i++) {
      // Waypoints does not include first station (origin) and last station (destination)
      const waypoints = [];

      for (let j = 1; j < parts[i].length - 1; j++) {
        waypoints.push({
          location: parts[i][j],
          stopover: true
        });
      } // Service options


      const service_options = {
        origin: parts[i][0],
        destination: parts[i][parts[i].length - 1],
        waypoints: waypoints,
        travelMode: 'DRIVING'
      }; // Send request
      // eslint-disable-next-line no-await-in-loop

      await service.route(service_options, service_callback);
    } // console.log(Tdistance);

  }

  return Tdistance;
};
export const showInfoWindow = (map, marker, content, callback) => {
  const Infocontent = content || '<strong> Marker </strong>';
  const infowindow = new google.maps.InfoWindow({
    content: Infocontent
  });
  infowindow.open(map, marker);
  callback&& callback(infowindow);
};
export const calcTotalDistance = legs => {
  const sum = legs.map(el => el.distance.value).reduce((a, b) => a + b);
  return sum / 1000;
};
export const mapFitBounds = (map, coordinates) => {
  // Zoom and center map automatically by stations (each station will be in visible map area)
  const stations = coordinates.filter(el => el?.lat && typeof parseFloat(el?.lat) === 'number' && typeof parseFloat(el?.lng) === 'number');
  const lngs = stations.map(function (station) {
    return parseFloat(station.lng);
  });
  const lats = stations.map(function (station) {
    return parseFloat(station.lat);
  });

  if (lngs.length > 0 && lats.length > 0) {
    map.fitBounds({
      west: Math.min.apply(null, lngs),
      east: Math.max.apply(null, lngs),
      north: Math.min.apply(null, lats),
      south: Math.max.apply(null, lats)
    });
  }
};
export const advancedDirections = (map, stationsArr, callback) => {
  if (stationsArr.length > 0) {
    const service = new google.maps.DirectionsService();
    const stations = stationsArr.map(el => ({
      lat: parseFloat(el.lat),
      lng: parseFloat(el.lng),
      name: el.name
    }));
    mapFitBounds(map, stations); // Divide route to several parts because max stations limit is 25 (23 waypoints + 1 origin + 1 destination)

    const parts = [],
          max = 24;

    for (let i = 0; i < stations.length; i = i + max) {
      parts.push(stations.slice(i, i + max + 1));
    } // Service callback to process service results


    const service_callback = function (response, status) {
      if (status !== 'OK') {
        return;
      }

      const renderer = new google.maps.DirectionsRenderer();
      const directionsPanel = document.getElementById('directionsPanel');
      renderer.setMap(map);

      if (directionsPanel) {
        renderer.setPanel(document.getElementById('directionsPanel'));
      }

      renderer.setOptions({
        suppressMarkers: true,
        preserveViewport: true
      });
      renderer.setDirections(response);
      callback && callback(renderer);
    }; // Send requests to service to get route (for stations count <= 25 only one request will be sent)


    parts.forEach((element, i) => {
      // Waypoints does not include first station (origin) and last station (destination)
      const waypoints = [];

      for (let j = 1; j < parts[i].length - 1; j++) {
        waypoints.push({
          location: parts[i][j],
          stopover: true
        });
      } // Service options


      const service_options = {
        origin: parts[i][0],
        destination: parts[i][parts[i].length - 1],
        waypoints: waypoints,
        travelMode: 'DRIVING'
      }; // Send request

      service.route(service_options, service_callback);
    });
  }
};

export const loadGMaps = (API, callback) => {
  const existingScript = document.getElementById('googleMaps');

  if (!existingScript) {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API}`;
    script.id = 'googleMaps';
    document.body.appendChild(script);

    script.onload = () => {
      if (callback) {
        callback();
      }
    };
  }

  if (existingScript && callback) {
    callback();
  }
};

export default {loadGMaps,advancedDirections,mapFitBounds,showInfoWindow,showDirection,geocode,reverseGeocodeService,placeMarkerAfterGeoCode,placeMarkerOnClick}
