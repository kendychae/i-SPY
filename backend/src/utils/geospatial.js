/**
 * Geospatial Query Utilities for VIGILUX Platform
 * 
 * This module provides high-performance geospatial query functions
 * for finding incidents within specific geographic areas.
 * 
 * Uses PostgreSQL's built-in trigonometric functions for distance calculations.
 * For production with large datasets, consider enabling PostGIS extension.
 */

const db = require('../config/database');

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in meters
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Find incidents within a radius of a location
 * @param {number} latitude - Center point latitude
 * @param {number} longitude - Center point longitude
 * @param {number} radiusMeters - Search radius in meters
 * @param {Object} options - Additional filter options
 * @returns {Promise<Array>} Array of incidents with distances
 */
async function findIncidentsNearby(latitude, longitude, radiusMeters, options = {}) {
  try {
    const {
      limit = 100,
      offset = 0,
      incident_type = null,
      status = ['submitted', 'under_review', 'investigating'],
      start_date = null,
      end_date = null,
      sort_by = 'distance' // 'distance' or 'created_at'
    } = options;

    // Validate inputs
    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      throw new Error('Invalid latitude');
    }
    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      throw new Error('Invalid longitude');
    }
    if (isNaN(radiusMeters) || radiusMeters <= 0) {
      throw new Error('Invalid radius');
    }

    // Build query conditions
    const conditions = [];
    const params = [latitude, longitude, radiusMeters];
    let paramCount = 3;

    // Filter by incident type
    if (incident_type) {
      const types = Array.isArray(incident_type) ? incident_type : [incident_type];
      paramCount++;
      conditions.push(`r.incident_type = ANY($${paramCount}::text[])`);
      params.push(types);
    }

    // Filter by status
    if (status && status.length > 0) {
      const statuses = Array.isArray(status) ? status : [status];
      paramCount++;
      conditions.push(`r.status = ANY($${paramCount}::text[])`);
      params.push(statuses);
    }

    // Filter by date range
    if (start_date) {
      paramCount++;
      conditions.push(`r.created_at >= $${paramCount}`);
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      conditions.push(`r.created_at <= $${paramCount}`);
      params.push(end_date);
    }

    const whereClause = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';

    // Determine sort order
    const orderBy = sort_by === 'created_at' ? 'r.created_at DESC' : 'distance_meters ASC';

    // Query with Haversine distance calculation
    const query = `
      SELECT 
        r.*,
        (6371000 * acos(
          cos(radians($1)) * 
          cos(radians(r.latitude)) * 
          cos(radians(r.longitude) - radians($2)) + 
          sin(radians($1)) * 
          sin(radians(r.latitude))
        )) AS distance_meters,
        (SELECT COUNT(*) FROM media WHERE report_id = r.id) as media_count
      FROM reports r
      WHERE (6371000 * acos(
        cos(radians($1)) * 
        cos(radians(r.latitude)) * 
        cos(radians(r.longitude) - radians($2)) + 
        sin(radians($1)) * 
        sin(radians(r.latitude))
      )) <= $3
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limit, offset);

    const result = await db.query(query, params);

    return result.rows;

  } catch (error) {
    console.error('Error in findIncidentsNearby:', error);
    throw error;
  }
}

/**
 * Find incidents within a bounding box
 * @param {Object} bounds - Bounding box coordinates
 * @param {number} bounds.north - Northern latitude
 * @param {number} bounds.south - Southern latitude
 * @param {number} bounds.east - Eastern longitude
 * @param {number} bounds.west - Western longitude
 * @param {Object} options - Additional filter options
 * @returns {Promise<Array>} Array of incidents within bounds
 */
async function findIncidentsInBounds(bounds, options = {}) {
  try {
    const { north, south, east, west } = bounds;
    const {
      limit = 1000,
      incident_type = null,
      status = null
    } = options;

    // Validate bounds
    if (isNaN(north) || isNaN(south) || isNaN(east) || isNaN(west)) {
      throw new Error('Invalid bounding box coordinates');
    }
    if (north < -90 || north > 90 || south < -90 || south > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }
    if (east < -180 || east > 180 || west < -180 || west > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }
    if (north < south) {
      throw new Error('North latitude must be greater than south latitude');
    }

    // Build query conditions
    const conditions = [
      'r.latitude >= $1',
      'r.latitude <= $2',
      'r.longitude >= $3',
      'r.longitude <= $4'
    ];
    const params = [south, north, west, east];
    let paramCount = 4;

    // Filter by incident type
    if (incident_type) {
      const types = Array.isArray(incident_type) ? incident_type : [incident_type];
      paramCount++;
      conditions.push(`r.incident_type = ANY($${paramCount}::text[])`);
      params.push(types);
    }

    // Filter by status
    if (status) {
      const statuses = Array.isArray(status) ? status : [status];
      paramCount++;
      conditions.push(`r.status = ANY($${paramCount}::text[])`);
      params.push(statuses);
    }

    paramCount++;
    params.push(limit);

    const query = `
      SELECT 
        r.*,
        (SELECT COUNT(*) FROM media WHERE report_id = r.id) as media_count
      FROM reports r
      WHERE ${conditions.join(' AND ')}
      ORDER BY r.created_at DESC
      LIMIT $${paramCount}
    `;

    const result = await db.query(query, params);

    return result.rows;

  } catch (error) {
    console.error('Error in findIncidentsInBounds:', error);
    throw error;
  }
}

/**
 * Get incident density by grid cells (for clustering)
 * @param {Object} bounds - Map bounds
 * @param {number} gridSize - Grid cell size in degrees
 * @returns {Promise<Array>} Array of grid cells with incident counts
 */
async function getIncidentDensity(bounds, gridSize = 0.1) {
  try {
    const { north, south, east, west } = bounds;

    const query = `
      SELECT 
        FLOOR(latitude / $5) * $5 AS grid_lat,
        FLOOR(longitude / $5) * $5 AS grid_lng,
        COUNT(*) as incident_count,
        json_agg(
          json_build_object(
            'id', id,
            'incident_type', incident_type,
            'priority', priority,
            'latitude', latitude,
            'longitude', longitude
          )
        ) as incidents
      FROM reports
      WHERE 
        latitude >= $1 AND 
        latitude <= $2 AND 
        longitude >= $3 AND 
        longitude <= $4 AND
        status IN ('submitted', 'under_review', 'investigating')
      GROUP BY grid_lat, grid_lng
      ORDER BY incident_count DESC
    `;

    const result = await db.query(query, [south, north, west, east, gridSize]);

    return result.rows;

  } catch (error) {
    console.error('Error in getIncidentDensity:', error);
    throw error;
  }
}

/**
 * Find the nearest incident to a location
 * @param {number} latitude - Reference latitude
 * @param {number} longitude - Reference longitude
 * @param {Object} options - Filter options
 * @returns {Promise<Object|null>} Nearest incident or null
 */
async function findNearestIncident(latitude, longitude, options = {}) {
  try {
    const {
      incident_type = null,
      max_distance = 10000 // Maximum 10km by default
    } = options;

    const conditions = [];
    const params = [latitude, longitude, max_distance];
    let paramCount = 3;

    if (incident_type) {
      const types = Array.isArray(incident_type) ? incident_type : [incident_type];
      paramCount++;
      conditions.push(`incident_type = ANY($${paramCount}::text[])`);
      params.push(types);
    }

    const whereClause = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        *,
        (6371000 * acos(
          cos(radians($1)) * 
          cos(radians(latitude)) * 
          cos(radians(longitude) - radians($2)) + 
          sin(radians($1)) * 
          sin(radians(latitude))
        )) AS distance_meters
      FROM reports
      WHERE (6371000 * acos(
        cos(radians($1)) * 
        cos(radians(latitude)) * 
        cos(radians(longitude) - radians($2)) + 
        sin(radians($1)) * 
        sin(radians(latitude))
      )) <= $3
      ${whereClause}
      ORDER BY distance_meters ASC
      LIMIT 1
    `;

    const result = await db.query(query, params);

    return result.rows.length > 0 ? result.rows[0] : null;

  } catch (error) {
    console.error('Error in findNearestIncident:', error);
    throw error;
  }
}

/**
 * Create a spatial index on the reports table for better performance
 * This function should be called during database setup/migration
 */
async function createSpatialIndex() {
  try {
    // Check if index already exists
    const checkQuery = `
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'reports' AND indexname = 'idx_reports_location'
    `;

    const checkResult = await db.query(checkQuery);

    if (checkResult.rows.length === 0) {
      // Create composite index on latitude and longitude
      const createIndexQuery = `
        CREATE INDEX idx_reports_location 
        ON reports (latitude, longitude);
      `;

      await db.query(createIndexQuery);
      console.log('✅ Spatial index created successfully');
    } else {
      console.log('ℹ️  Spatial index already exists');
    }

  } catch (error) {
    console.error('Error creating spatial index:', error);
    throw error;
  }
}

/**
 * Get statistics about incidents in an area
 * @param {number} latitude - Center latitude
 * @param {number} longitude - Center longitude
 * @param {number} radiusMeters - Search radius
 * @returns {Promise<Object>} Statistics object
 */
async function getAreaStatistics(latitude, longitude, radiusMeters) {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_incidents,
        COUNT(*) FILTER (WHERE status = 'submitted') as submitted,
        COUNT(*) FILTER (WHERE status = 'under_review') as under_review,
        COUNT(*) FILTER (WHERE status = 'investigating') as investigating,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
        COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_count,
        COUNT(*) FILTER (WHERE priority = 'high') as high_priority_count,
        json_object_agg(
          incident_type, 
          type_count
        ) as incidents_by_type
      FROM (
        SELECT 
          incident_type,
          status,
          priority,
          COUNT(*) OVER (PARTITION BY incident_type) as type_count
        FROM reports
        WHERE (6371000 * acos(
          cos(radians($1)) * 
          cos(radians(latitude)) * 
          cos(radians(longitude) - radians($2)) + 
          sin(radians($1)) * 
          sin(radians(latitude))
        )) <= $3
      ) subquery
      GROUP BY ()
    `;

    const result = await db.query(query, [latitude, longitude, radiusMeters]);

    return result.rows.length > 0 ? result.rows[0] : {
      total_incidents: 0,
      submitted: 0,
      under_review: 0,
      investigating: 0,
      resolved: 0,
      urgent_count: 0,
      high_priority_count: 0,
      incidents_by_type: {}
    };

  } catch (error) {
    console.error('Error in getAreaStatistics:', error);
    throw error;
  }
}

module.exports = {
  calculateDistance,
  findIncidentsNearby,
  findIncidentsInBounds,
  getIncidentDensity,
  findNearestIncident,
  createSpatialIndex,
  getAreaStatistics
};
