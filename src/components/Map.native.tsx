import React from 'react';
import MapView, { Marker } from 'react-native-maps';

export default function Map({ latitude, longitude, onRegionChangeComplete, style, popupText }: any) {
  return (
    <MapView
      style={style}
      initialRegion={{
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      onRegionChangeComplete={onRegionChangeComplete}
    >
      <Marker
        coordinate={{
          latitude,
          longitude,
        }}
        title="Delivery Destination"
        description={popupText || "Selected Location"}
      />
    </MapView>
  );
}
