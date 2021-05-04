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

