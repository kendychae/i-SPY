# Map Marker Clustering Algorithm and Data Structure

## Version 1.0

**Last Updated:** March 20, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Algorithm Selection](#algorithm-selection)
3. [Data Structures](#data-structures)
4. [Clustering Algorithm](#clustering-algorithm)
5. [Radius Thresholds](#radius-thresholds)
6. [Cluster Display](#cluster-display)
7. [Performance Considerations](#performance-considerations)
8. [Implementation Plan](#implementation-plan)

---

## Overview

Map marker clustering is essential for the VIGILUX platform to prevent visual clutter when displaying multiple incident reports on the map. This document defines the algorithm, data structures, and thresholds for efficiently clustering nearby markers while maintaining usability and performance.

### Goals

1. **Prevent Map Clutter:** Reduce visual noise when many incidents are close together
2. **Maintain Performance:** Render maps quickly even with thousands of incidents
3. **Preserve Context:** Users should understand incident density at a glance
4. **Support Interaction:** Easy drill-down into clusters to view individual incidents

### Approach

We will implement a **grid-based clustering algorithm** with zoom-level-dependent thresholds, optimized for mobile devices.

---

## Algorithm Selection

### Evaluated Algorithms

| Algorithm      | Pros                                      | Cons                                            | Selected   |
| -------------- | ----------------------------------------- | ----------------------------------------------- | ---------- |
| **Grid-Based** | Fast O(n), predictable, easy to implement | Less natural clustering                         | ✅ **Yes** |
| K-Means        | Natural clusters, statistically optimal   | Slow O(nk iterations), requires iteration count | ❌ No      |
| DBSCAN         | Density-based, no predefined count        | O(n log n), complex, unpredictable results      | ❌ No      |
| Hierarchical   | Works at all zoom levels                  | O(n²), memory intensive                         | ❌ No      |

### Why Grid-Based?

Grid-based clustering divides the map into a grid of cells at each zoom level. All markers within the same grid cell are clustered together.

**Benefits:**

- **Performance:** O(n) time complexity - linear with number of markers
- **Predictability:** Consistent behavior across zoom levels
- **Simplicity:** Easy to implement and debug
- **Mobile-Friendly:** Low memory footprint and fast computation

---

## Data Structures

### 1. Marker Data Structure

Each incident report marker contains:

```typescript
interface IncidentMarker {
  id: string; // Unique incident ID (UUID)
  latitude: number; // Decimal degrees
  longitude: number; // Decimal degrees
  incident_type: string; // Category (theft, vandalism, etc.)
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string; // Report status
  title: string; // Short description
  created_at: string; // ISO8601 timestamp
  media_count: number; // Number of attached media files
}
```

### 2. Cluster Data Structure

```typescript
interface MarkerCluster {
  id: string; // Cluster ID (generated)
  latitude: number; // Cluster center latitude
  longitude: number; // Cluster center longitude
  count: number; // Number of markers in cluster
  markers: IncidentMarker[]; // Array of contained markers
  bounds: {
    // Bounding box
    north: number;
    south: number;
    east: number;
    west: number;
  };
  categoryBreakdown: {
    // Count by category
    [key: string]: number;
  };
  priorityBreakdown: {
    // Count by priority
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  highestPriority: string; // Dominant priority in cluster
  dominantCategory: string; // Most common incident type
}
```

### 3. Grid Cell Structure

```typescript
interface GridCell {
  x: number; // Grid column index
  y: number; // Grid row index
  markers: IncidentMarker[]; // Markers in this cell
  cluster?: MarkerCluster; // Resulting cluster (if > threshold)
}
```

---

## Clustering Algorithm

### Grid-Based Clustering Process

```
1. Determine current map zoom level and bounds
   ↓
2. Calculate grid cell size based on zoom level
   ↓
3. Create grid data structure (2D array or hash map)
   ↓
4. Iterate through all markers:
   - Calculate grid cell coordinates (x, y)
   - Add marker to corresponding cell
   ↓
5. For each non-empty cell:
   - If cell contains 1 marker: render individual marker
   - If cell contains 2+ markers: create cluster
   ↓
6. Calculate cluster properties:
   - Center point (average lat/lng)
   - Count
   - Category breakdown
   - Priority analysis
   ↓
7. Return array of individual markers and clusters
```

### Pseudocode

```javascript
function clusterMarkers(markers, zoomLevel, mapBounds) {
  const gridSize = getGridSize(zoomLevel);
  const grid = new Map();

  // Step 1: Assign markers to grid cells
  for (const marker of markers) {
    if (!isInBounds(marker, mapBounds)) continue;

    const cellKey = getCellKey(marker.latitude, marker.longitude, gridSize);

    if (!grid.has(cellKey)) {
      grid.set(cellKey, []);
    }

    grid.get(cellKey).push(marker);
  }

  // Step 2: Create clusters or individual markers
  const result = [];

  for (const [cellKey, cellMarkers] of grid.entries()) {
    if (cellMarkers.length === 1) {
      // Single marker - render as individual
      result.push({
        type: 'marker',
        data: cellMarkers[0],
      });
    } else {
      // Multiple markers - create cluster
      result.push({
        type: 'cluster',
        data: createCluster(cellMarkers),
      });
    }
  }

  return result;
}

function getCellKey(lat, lng, gridSize) {
  const x = Math.floor(lng / gridSize);
  const y = Math.floor(lat / gridSize);
  return `${x},${y}`;
}

function createCluster(markers) {
  const avgLat =
    markers.reduce((sum, m) => sum + m.latitude, 0) / markers.length;
  const avgLng =
    markers.reduce((sum, m) => sum + m.longitude, 0) / markers.length;

  // Calculate category breakdown
  const categoryBreakdown = {};
  const priorityBreakdown = { low: 0, medium: 0, high: 0, urgent: 0 };

  for (const marker of markers) {
    categoryBreakdown[marker.incident_type] =
      (categoryBreakdown[marker.incident_type] || 0) + 1;
    priorityBreakdown[marker.priority]++;
  }

  return {
    id: generateClusterId(),
    latitude: avgLat,
    longitude: avgLng,
    count: markers.length,
    markers: markers,
    categoryBreakdown,
    priorityBreakdown,
    highestPriority: getHighestPriority(priorityBreakdown),
    dominantCategory: getDominantCategory(categoryBreakdown),
  };
}
```

---

## Radius Thresholds

### Zoom-Level-Based Grid Sizes

Grid cell size adapts based on map zoom level to provide appropriate clustering:

| Zoom Level | View Area         | Grid Cell Size  | Description                             |
| ---------- | ----------------- | --------------- | --------------------------------------- |
| 0-5        | World/Continent   | 2.0° (~222 km)  | Continental view - heavy clustering     |
| 6-8        | Country/Region    | 0.5° (~55 km)   | Regional view - moderate clustering     |
| 9-11       | Metro Area        | 0.1° (~11 km)   | City view - light clustering            |
| 12-14      | City/Neighborhood | 0.02° (~2.2 km) | Neighborhood - minimal clustering       |
| 15-17      | Street Level      | 0.005° (~550 m) | Street detail - very minimal clustering |
| 18-21      | Building Level    | No clustering   | Individual markers only                 |

### Dynamic Threshold Formula

```javascript
function getGridSize(zoomLevel) {
  if (zoomLevel <= 5) return 2.0;
  if (zoomLevel <= 8) return 0.5;
  if (zoomLevel <= 11) return 0.1;
  if (zoomLevel <= 14) return 0.02;
  if (zoomLevel <= 17) return 0.005;
  return 0; // No clustering at highest zoom
}
```

### Minimum Cluster Size

- **Default:** 2 markers (always cluster 2+ markers in same cell)
- **Configurable:** Can be adjusted based on user preferences or device performance

---

## Cluster Display

### Visual Representation

#### Cluster Marker Design

```
┌─────────────────────┐
│   Circular Badge    │
│                     │
│      ┌─────┐       │
│      │  47 │       │  ← Count badge
│      └─────┘       │
│                     │
│   Category Color    │  ← Border/background color
│                     │
│   Priority Ring     │  ← Outer ring for priority
│                     │
└─────────────────────┘
```

#### Cluster Badge Styling

**Size Based on Count:**

- 2-9 markers: Small badge (40px)
- 10-49 markers: Medium badge (50px)
- 50-99 markers: Large badge (60px)
- 100+ markers: Extra large badge (70px)

**Color Based on Dominant Category:**

- Theft: `#E53E3E` (Red)
- Vandalism: `#DD6B20` (Orange)
- Assault: `#C05621` (Dark Orange)
- Suspicious Activity: `#D69E2E` (Yellow)
- Traffic Violation: `#38B2AC` (Teal)
- Noise Complaint: `#4299E1` (Blue)
- Fire: `#E53E3E` (Red)
- Medical Emergency: `#E53E3E` (Red)
- Other: `#718096` (Gray)

**Priority Ring:**

- Urgent: Thick red outer ring (3px)
- High: Medium orange outer ring (2px)
- Medium: Thin yellow outer ring (1px)
- Low: No outer ring

### Cluster Interaction

#### On Tap/Click

**Option 1: Zoom In**

- Zoom map to focus on cluster area
- Re-cluster at higher zoom level
- Show individual markers if possible

**Option 2: Expand Spiderfier**

- Spread markers in circular pattern around cluster
- Each marker clickable individually
- "Collapse" button to reset

**Option 3: List View**

- Open bottom sheet/modal with list of incidents
- Each item shows title, incident type, time
- Tap item to view details

**Recommended:** Use Option 1 (Zoom In) for mobile simplicity

#### On Hover (Web Only)

- Show tooltip with cluster summary:
  - Total count
  - Category breakdown (top 3)
  - Time range (oldest to newest)

### Individual Marker Design

Single markers display:

- **Icon:** Category-specific icon (consistent with app design)
- **Color:** Based on priority
- **Badge:** Small status indicator (if resolved/closed)
- **Animation:** Subtle pulse for recent reports (< 24 hours)

---

## Performance Considerations

### Target Metrics

| Metric                      | Target  | Measurement        |
| --------------------------- | ------- | ------------------ |
| Clustering Time             | < 50ms  | For 1,000 markers  |
| Re-clustering (zoom change) | < 100ms | For 5,000 markers  |
| Memory Usage                | < 10 MB | For 10,000 markers |
| Render Time                 | < 16ms  | 60 FPS target      |

### Optimization Strategies

#### 1. Viewport Filtering

Only cluster markers within the current visible map bounds plus a small buffer:

```javascript
function filterMarkersInViewport(markers, bounds, bufferPercent = 0.2) {
  const latRange = bounds.north - bounds.south;
  const lngRange = bounds.east - bounds.west;

  const bufferedBounds = {
    north: bounds.north + latRange * bufferPercent,
    south: bounds.south - latRange * bufferPercent,
    east: bounds.east + lngRange * bufferPercent,
    west: bounds.west - lngRange * bufferPercent,
  };

  return markers.filter(
    (m) =>
      m.latitude >= bufferedBounds.south &&
      m.latitude <= bufferedBounds.north &&
      m.longitude >= bufferedBounds.west &&
      m.longitude <= bufferedBounds.east
  );
}
```

#### 2. Incremental Clustering

When zooming, reuse existing clusters and only re-cluster affected cells:

- **Zoom Out:** Merge existing clusters into larger ones
- **Zoom In:** Split clusters into smaller ones or individual markers
- **Pan:** Only cluster newly visible areas

#### 3. Web Workers (React Native Workers)

Offload clustering computation to background thread:

```javascript
// Main thread
const worker = new Worker('clusterWorker.js');

worker.postMessage({
  markers: visibleMarkers,
  zoomLevel: currentZoom,
  bounds: mapBounds,
});

worker.onmessage = (event) => {
  const clusteredMarkers = event.data;
  updateMapMarkers(clusteredMarkers);
};
```

#### 4. Caching

Cache clustering results for each zoom level and viewport region:

```javascript
const clusterCache = new Map();

function getCachedClusters(zoomLevel, bounds) {
  const cacheKey = `${zoomLevel}-${boundsToString(bounds)}`;

  if (clusterCache.has(cacheKey)) {
    return clusterCache.get(cacheKey);
  }

  const clusters = performClustering(markers, zoomLevel, bounds);
  clusterCache.set(cacheKey, clusters);

  return clusters;
}
```

#### 5. Data Pagination

For very large datasets (> 10,000 markers):

- Server-side clustering for initial load
- Client-side clustering for visible markers
- Progressive loading as user pans/zooms
- Virtual viewport with marker streaming

#### 6. Spatial Indexing

Use R-tree or Quadtree for efficient spatial queries:

```javascript
import RBush from 'rbush';

const spatialIndex = new RBush();

// Index all markers
spatialIndex.load(
  markers.map((m) => ({
    minX: m.longitude,
    minY: m.latitude,
    maxX: m.longitude,
    maxY: m.latitude,
    data: m,
  }))
);

// Query markers in bounds
const visibleMarkers = spatialIndex.search({
  minX: bounds.west,
  minY: bounds.south,
  maxX: bounds.east,
  maxY: bounds.north,
});
```

### Large Dataset Handling

For 10,000+ markers:

1. **Backend Pre-clustering:** Generate cluster data on server
2. **Level-of-Detail (LOD):** Serve different detail levels per zoom
3. **Tile-Based Rendering:** Cluster per map tile (256x256px)
4. **Progressive Enhancement:** Load high-priority markers first

---

## Implementation Plan

### Phase 1: Foundation (Week 4)

- ✅ Document algorithm and data structures
- ⏳ Create marker and cluster data models
- ⏳ Implement basic grid-based clustering (no optimizations)
- ⏳ Add zoom-level threshold configuration

### Phase 2: Basic Integration (Week 5)

- Integrate with React Native Maps
- Implement cluster component rendering
- Add basic interaction (zoom on tap)
- Test with 100-500 markers

### Phase 3: Optimization (Week 6)

- Implement viewport filtering
- Add caching layer
- Optimize re-clustering on zoom/pan
- Performance testing with 5,000+ markers

### Phase 4: Advanced Features (Week 7+)

- Implement spiderfier (cluster expansion)
- Add cluster animations
- Server-side clustering for large datasets
- Spatial indexing with R-tree

---

## Libraries and Tools

### Recommended React Native Libraries

| Library                             | Purpose                | Link                                                                 |
| ----------------------------------- | ---------------------- | -------------------------------------------------------------------- |
| **react-native-maps**               | Base map component     | [npm](https://www.npmjs.com/package/react-native-maps)               |
| **react-native-maps-super-cluster** | Built-in clustering    | [npm](https://www.npmjs.com/package/react-native-maps-super-cluster) |
| **rbush**                           | Spatial indexing       | [npm](https://www.npmjs.com/package/rbush)                           |
| **react-native-maps-clustering**    | Alternative clustering | [npm](https://www.npmjs.com/package/react-native-maps-clustering)    |

### Custom vs Library

**Custom Implementation (Recommended):**

- Full control over algorithm and behavior
- Lighter weight (no dependencies)
- Easier to optimize for our specific use case
- Educational value for team

**Library-Based (Alternative):**

- Faster initial development
- Community-tested and maintained
- May include features we don't need
- Less control over customization

---

## Testing Strategy

### Unit Tests

```javascript
describe('Marker Clustering', () => {
  it('should create cluster for markers in same grid cell', () => {
    const markers = [
      { id: '1', latitude: 34.0522, longitude: -118.2437 },
      { id: '2', latitude: 34.0523, longitude: -118.2438 },
    ];

    const result = clusterMarkers(markers, 10, bounds);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('cluster');
    expect(result[0].data.count).toBe(2);
  });

  it('should not cluster at high zoom levels', () => {
    const markers = [
      { id: '1', latitude: 34.0522, longitude: -118.2437 },
      { id: '2', latitude: 34.0523, longitude: -118.2438 },
    ];

    const result = clusterMarkers(markers, 18, bounds);
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('marker');
  });
});
```

### Performance Tests

```javascript
describe('Clustering Performance', () => {
  it('should cluster 1000 markers in < 50ms', () => {
    const markers = generateRandomMarkers(1000);
    const startTime = performance.now();

    clusterMarkers(markers, 12, bounds);

    const duration = performance.now() - startTime;
    expect(duration).toBeLessThan(50);
  });
});
```

---

## Future Enhancements

1. **Heat Map Mode:** Toggle between clusters and heat map visualization
2. **Time-Based Clustering:** Cluster by time period (today, this week, this month)
3. **Category Filtering:** Show/hide specific incident types
4. **Smart Zoom:** Auto-zoom to optimal level for dataset
5. **Cluster Statistics:** Detailed analytics within clusters
6. **Custom Cluster Icons:** User-configurable cluster appearance

---

## References

- [Clustering MapView - React Native Maps](https://github.com/react-native-maps/react-native-maps/blob/master/docs/clustering.md)
- [Google Maps Clustering Algorithm](https://developers.google.com/maps/documentation/javascript/marker-clustering)
- [Mapbox Clustering](https://docs.mapbox.com/mapbox-gl-js/example/cluster/)
- [RBush - High-Performance 2D Spatial Index](https://github.com/mourner/rbush)

---

**Document Maintained By:** Development Team  
**Last Reviewed:** March 20, 2026  
**Next Review Date:** April 20, 2026
