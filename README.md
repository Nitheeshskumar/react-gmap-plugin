# react-gmap-plugin
Google Maps plugin for react


## Features
Maps Javascript API is used to render dynamic Map in association with utility functions to customize the behaviour

## Usage with Component

```js
import React from 'react'
import {MapComponent} from 'react-gmap-plugin'

const App=()=>{
const mapRef= React.useRef('') // provide access to the google maps instance anywhere in the component
return  <div className="App" style={{ height: "200px" }}>
        <MapComponent mapRef={mapRef} API="your-api-key"/>
        </div>

}


```
## Usage with Services

```js
import React from 'react'
import {MapComponent,MapServices} from 'react-gmap-plugin'
const {placeMarkerOnClick} = MapServices
const App=()=>{
const mapRef= React.useRef('') // provide access to the google maps instance anywhere in the component
const onMapClick=event=>{
placeMarkerOnClick(mapRef.current,event.latLng)
}
return  <div className="App" style={{ height: "200px" }}>
        <MapComponent mapRef={mapRef} API="your-api-key" onMapClick={onMapClick}/>
        </div>

}


```
## Props

|Name | Type | Description
|---|---|---
API|`String`|**Required**: Your Google Maps API Key. Additionally you can provide libraries or other query params after the key. Eg: `API='yourkey&library=places,geometry'`. Can also be set globally using env variable `REACT_APP_GMAPAPI`. One of either is mandatory
mapRef|`Object`|**Required**: The google maps instance is created on the initial load of map across the application.The instance can be accessed by a component by passign a React ref. This is used when accessing the MapServices functions or while creating your own Services
markerList|`Array`|The list of markers that are shown in the map at a time. For dynamic markers, recommended to keep in a state as array. Eg: ``` markerList={[lat:floatNumber,lng:floatNumber,...anyOtherKeys]}  ```
defaultLocation|`Object`|The initial centered location when map is rendered. `{lat:floatNumber,lng:floatNumber}`. Default:`{lat: 41.2033, lng: -77.1945}` at Pennsylvania.
defaultZoom|`Number`| The default zoom level. Default: `6`
disable|`Boolean`|To disable the map rendering. Default:`false`. When disable is true, the map is not rendered instead an empty div with `className:'map-optional-container'` is rendered. Can be used to enable map on click of a button.
options|`Object`|The optional items when rendering the map. Default: `{center: {lat: 41.2033,lng: -77.1945}, zoom: 6, streetViewControl: false, mapTypeControl: false }`
enableLocationSearch|`Boolean`|A Searchbox is rendered with the map. Default: `false`. css can be adjusted to bring the required UI using the classNames of the search box
onSearch|`function`| Used is association with enableLocationSearch. The function can be called in association with geocode service or any other custom functionalities
onClearSearch|`function`|Any optional callbacks actions. The input is cleared on clicking clear button on search box by default
showDirectionPanel|`Boolean`| To show directions in a panel after calling the directions service. Used with directionsPanelContainer function.
directionsPanelContainer|`function`|Custom wrapper for the directionPanel. Eg: `directionsPanelContainer={(child)=><div className='wrapper'>{child}</div> }`
