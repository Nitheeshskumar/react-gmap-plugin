/* global google */
import React from 'react';
import PropTypes from 'prop-types';
import {loadGMaps} from './MapServices';

const MapComponent = ({
  options,
  onMarkerClick,
  onMapClick,
  markerList = [],
  mapRef,
  disable,
  enableLocationSearch,
  onSearch,
  onClearSearch,
  showDirectionPanel,
  directionsPanelContainer,
  API,defaultLocation,defaultZoom,
  markerIcon
}) => {
  const ref = React.useRef();
  const [inputRef, setInputRef] = React.useState();
  React.useEffect(() => {
    if (!disable) {
      loadGMaps(API || process.env.REACT_APP_GMAPAPI, () => {
        const Pennsylvania = {
          lat: 41.2033,
          lng: -77.1945
        };
        const initialOptions = {
          center: defaultLocation||Pennsylvania,
          zoom: defaultZoom||6,
          streetViewControl: false,
          mapTypeControl: false
        };
        const map = new google.maps.Map(ref.current, { ...initialOptions,
          ...options
        });
        mapRef.current = map;
        setInputRef(map);
        google.maps.event.addListener(map, 'click', event => {
          onMapClick && onMapClick(event);
        });
      });
    } // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [disable]);
  React.useEffect(() => {
    const markerArr = [];

    if (mapRef.current) {
      const map = mapRef.current;
      markerList.forEach(el => {
        if (el?.lat) {
          const marker = new google.maps.Marker({
            position: {
              lat: parseFloat(el.lat),
              lng: parseFloat(el.lng)
            },
            name: el.name,
            icon: markerIcon|| '',
            map: map
          });
          google.maps.event.addListener(marker, 'click', event => {
            onMarkerClick && onMarkerClick(marker, event, el);
          });
          markerArr.push(marker);
        }
      });

      if (markerList.length === 1 && markerList[0]?.lat && markerList[0]?.lng) {
        map.setCenter({
          lat: parseFloat(markerList[0]?.lat),
          lng: parseFloat(markerList[0]?.lng)
        });
        map.setZoom(17);
      }
    }

    return () => {
      markerArr.forEach(el => {
        el.setMap(null);
      });
    }; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markerList, mapRef.current, inputRef]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, ' ', disable ? /*#__PURE__*/React.createElement("div", {
    className: "map-optional-container"
  }) :
  /*#__PURE__*/
  React.createElement(React.Fragment, null, enableLocationSearch && /*#__PURE__*/React.createElement(SearchLocation, {
    mapRef: inputRef,
    onSearch: onSearch,
    onClearSearch: onClearSearch
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: '100%'
    }
  }, showDirectionPanel && directionsPanelContainer( /*#__PURE__*/React.createElement("div", {
    id: "directionsPanel",
    className: "directionsPanel"
  })), /*#__PURE__*/React.createElement("div", {
    id: "map",
    style: {
      height: '100%'
    },
    ref: ref
  }, ' '))));
};

export default /*#__PURE__*/React.memo(MapComponent);
export const SearchLocation = ({
  onSearch,
  onClearSearch
}) => {
  const inputEl = React.useRef();

  const clearSearch = () => {
    inputEl.current.value = '';
    onClearSearch();
  };

  return /*#__PURE__*/React.createElement("div", {
    className: "mapWrap",
    id: "mapWrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mapSearch"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mapSearchwrap"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "street"
  }, "Search on Map"), /*#__PURE__*/React.createElement("span", {
    className: "clearSearch"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Enter a location",
    ref: inputEl,
    onKeyDown: onSearch
  }), inputEl.current?.value && /*#__PURE__*/React.createElement("div", {
    className: "clearbutton",
    onClick: clearSearch
  })))));
};
export const PlacesAutoComplete = ({
  mapRef
}) => {
  const inputEl = React.useRef();
  React.useEffect(() => {
    if (mapRef) {
      const options = {
        componentRestrictions: {
          country: 'us'
        },
        fields: ['formatted_address', 'geometry', 'name'],
        origin: mapRef.getCenter(),
        strictBounds: false,
        types: ['address']
      };
      const autocomplete = new google.maps.places.Autocomplete(inputEl.current, options);
      autocomplete.bindTo('bounds', mapRef);
      const marker = new google.maps.Marker({
        map: mapRef,
        anchorPoint: new google.maps.Point(0, -29)
      });
      autocomplete.addListener('place_changed', () => {
        marker.setVisible(false);
        const place = autocomplete.getPlace();

        if (!place.geometry || !place.geometry.location) {
          // User entered the name of a Place that was not suggested and
          // pressed the Enter key, or the Place Details request failed.
          window.alert("No details available for input: '" + place.name + "'");
          return;
        } // If the place has a geometry, then present it on a map.


        if (place.geometry.viewport) {
          mapRef.fitBounds(place.geometry.viewport);
        } else {
          mapRef.setCenter(place.geometry.location);
          mapRef.setZoom(17);
        }

        marker.setPosition(place.geometry.location);
        marker.setVisible(true);
        google.maps.event.addListener(marker, 'click', event => {
          const markerlocation = event.latLng;
          const infowindow = new google.maps.InfoWindow({
            content: '<strong>' + place.formatted_address + '</strong><br>Latitude: ' + markerlocation.lat() + '<br>Longitude: ' + markerlocation.lng()
          });
          infowindow.open(mapRef, marker);
        });
      });
    }
  }, [mapRef]);
  return /*#__PURE__*/React.createElement("div", {
    className: "mapWrap",
    id: "mapWrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mapSearch"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mapSearchwrap"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "street"
  }, "Search on Map"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Enter a location",
    ref: inputEl
  }))));
};
SearchLocation.propTypes = {
  onClearSearch: PropTypes.func,
  onSearch: PropTypes.func
};
MapComponent.propTypes = {
  options: PropTypes.object,
  onMarkerClick: PropTypes.func,
  onMapClick: PropTypes.func,
  markerList: PropTypes.array,
  mapRef: PropTypes.object,
  disable: PropTypes.bool,
  enableLocationSearch: PropTypes.bool,
  onSearch: PropTypes.func,
  onClearSearch: PropTypes.func,
  showDirectionPanel: PropTypes.bool,
  directionsPanelContainer: PropTypes.func,
  defaultLocation:PropTypes.object,
  defaultZoom:PropTypes.number,
  markerIcon:PropTypes.oneOfType([PropTypes.string,PropTypes.element])
};
PlacesAutoComplete.propTypes = {
  mapRef: PropTypes.object
};
