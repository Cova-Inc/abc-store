// utils/paginateQuery.js
import { decodeParam } from 'src/utils/axios'; // assuming your existing decode function

// Cache for expensive queries
const QUERY_CACHE = new Map();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export async function paginateQuery({
  Model,
  requestUrl,
  customFilterHandler,
  select,
  sort = { createdAt: -1 },
  enableCache = true,
}) {
  try {
    const { searchParams } = new URL(requestUrl);

    const page = parseInt(searchParams.get('page'), 10) || 1;
    const limit = parseInt(searchParams.get('pageSize'), 10) || 10;
    const skip = (page - 1) * limit;

    const filterEncoded = searchParams.get('filter');
    const filterObj = decodeParam(filterEncoded);
    const filter = { ...filterObj };

    console.log(filter);
    // Apply optional custom filter handler (e.g. for regex on name)
    if (typeof customFilterHandler === 'function') {
      customFilterHandler(filter);
    }

    // Create cache key
    const cacheKey = enableCache ? JSON.stringify({ filter, page, limit, select, sort }) : null;

    // Check cache first
    if (enableCache && cacheKey && QUERY_CACHE.has(cacheKey)) {
      const cached = QUERY_CACHE.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }
      QUERY_CACHE.delete(cacheKey);
    }

    // Execute queries in parallel for better performance
    const [data, total] = await Promise.all([
      Model.find(filter)
        .skip(skip)
        .limit(limit)
        .select(select)
        .sort(sort)
        .lean() // Use lean() for better performance when you don't need Mongoose documents
        .exec(),
      Model.countDocuments(filter).exec(),
    ]);

    const result = { data, total, page, limit };

    // Cache the result
    if (enableCache && cacheKey) {
      QUERY_CACHE.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });

      // Clean up old cache entries
      const now = Date.now();
      QUERY_CACHE.forEach((value, key) => {
        if (now - value.timestamp > CACHE_DURATION) {
          QUERY_CACHE.delete(key);
        }
      });
    }

    return result;
  } catch (error) {
    console.error('paginateQuery error:', error);
    throw new Error(`Failed to fetch paginated data: ${error.message}`);
  }
}

// Utility function to clear cache
export function clearQueryCache() {
  QUERY_CACHE.clear();
}
