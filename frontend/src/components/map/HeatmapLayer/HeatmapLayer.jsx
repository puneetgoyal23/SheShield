import { useEffect, useMemo, useState } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { HeatmapLayer as DeckHeatmapLayer } from '@deck.gl/aggregation-layers';
import useSafetyStore from '../../../stores/safetyStore';
import useReportStore from '../../../stores/reportStore';

// Converted from the previous Google Maps rgba strings to RGB arrays for deck.gl
const COLOR_RANGE = [
  [0, 255, 255],
  [0, 191, 255],
  [0, 127, 255],
  [0, 63, 255],
  [0, 0, 255],
  [0, 0, 223],
  [0, 0, 191],
  [0, 0, 159],
  [0, 0, 127],
  [63, 0, 91],
  [127, 0, 63],
  [191, 0, 31],
  [255, 0, 0]
];

const HeatmapLayer = () => {
  const map = useMap();
  
  const heatMapData = useSafetyStore((s) => s.heatMapData);
  const isHeatmapVisible = useSafetyStore((s) => s.isHeatmapVisible);
  const timeSlot = useSafetyStore((s) => s.timeSlot);
  const reports = useReportStore((s) => s.reports);
  
  const [overlay, setOverlay] = useState(null);

  // Combine external mock API heatmap data with local community reports
  const combinedHeatMapData = useMemo(() => {
    const combined = [...(heatMapData || [])];
    
    if (reports && reports.length > 0) {
      reports.forEach(report => {
        if (report.position && report.position.length >= 2) {
          // [lat, lng, weight]
          combined.push([report.position[0], report.position[1], 0.6]);
        }
      });
    }
    
    return combined;
  }, [heatMapData, reports]);

  // Create and manage the GoogleMapsOverlay instance lifecycle
  useEffect(() => {
    if (!map) return;
    
    // interleaved: true renders deck.gl directly in the Maps WebGL context,
    // avoiding a separate canvas that causes recursive map artifacts on zoom.
    const newOverlay = new GoogleMapsOverlay({ interleaved: true });
    newOverlay.setMap(map);
    setOverlay(newOverlay);
    
    return () => {
      newOverlay.setProps({ layers: [] });
      newOverlay.setMap(null);
    };
  }, [map]);

  // Update deck.gl layers when data or visibility changes
  useEffect(() => {
    if (!overlay) return;

    if (!isHeatmapVisible || combinedHeatMapData.length === 0) {
      overlay.setProps({ layers: [] });
      return;
    }

    // Adapt visualization based on time of day
    const radius = timeSlot.id === 'night' ? 35 : (timeSlot.id === 'day' ? 20 : 25);

    const dataPoints = combinedHeatMapData
      .filter(pt => typeof pt[0] === 'number' && typeof pt[1] === 'number' && !Number.isNaN(pt[0]) && !Number.isNaN(pt[1]))
      .map(pt => ({
        // deck.gl expects [longitude, latitude]
        position: [pt[1], pt[0]],
        weight: pt[2] || 1
      }));

    const deckLayer = new DeckHeatmapLayer({
      id: 'safety-heatmap',
      data: dataPoints,
      getPosition: d => d.position,
      getWeight: d => d.weight,
      radiusPixels: radius,
      colorRange: COLOR_RANGE,
      intensity: 1
    });

    overlay.setProps({ layers: [deckLayer] });

  }, [overlay, combinedHeatMapData, isHeatmapVisible, timeSlot]);

  return null;
};

export default HeatmapLayer;
