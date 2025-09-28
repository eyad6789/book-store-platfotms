const Redis = require('redis');
const crypto = require('crypto');

class CacheService {
  constructor() {
    this.redis = null;
    this.isConnected = false;
    this.initializeRedis();
  }

  async initializeRedis() {
    try {
      this.redis = Redis.createClient({ 
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            console.error('Redis connection refused');
            return new Error('Redis connection refused');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Redis retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      this.redis.on('error', (err) => {
        console.error('Redis error:', err);
        this.isConnected = false;
      });

      this.redis.on('connect', () => {
        console.log('Redis connected successfully');
        this.isConnected = true;
      });

      this.redis.on('disconnect', () => {
        console.log('Redis disconnected');
        this.isConnected = false;
      });

      await this.redis.connect();
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      this.isConnected = false;
    }
  }

  // Cache popular books with TTL
  async getCachedBooks(key, fetchFunction, ttl = 3600) {
    if (!this.isConnected) {
      console.warn('Redis not connected, executing fetch function directly');
      return await fetchFunction();
    }

    try {
      const cached = await this.redis.get(key);
      if (cached) {
        console.log(`Cache hit for key: ${key}`);
        return JSON.parse(cached);
      }
      
      console.log(`Cache miss for key: ${key}, fetching data`);
      const data = await fetchFunction();
      
      // Cache the result
      await this.redis.setEx(key, ttl, JSON.stringify(data));
      return data;
    } catch (error) {
      console.error('Cache error:', error);
      // Fallback to direct fetch if cache fails
      return await fetchFunction();
    }
  }

  // Invalidate cache patterns
  async invalidatePattern(pattern) {
    if (!this.isConnected) {
      console.warn('Redis not connected, cannot invalidate cache pattern');
      return;
    }

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(keys);
        console.log(`Invalidated ${keys.length} cache keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  // Cache search results
  async cacheSearchResults(query, filters, results, ttl = 1800) {
    if (!this.isConnected) return;

    try {
      const cacheKey = `search:${this.hashObject({ query, ...filters })}`;
      await this.redis.setEx(cacheKey, ttl, JSON.stringify(results));
      console.log(`Cached search results for key: ${cacheKey}`);
    } catch (error) {
      console.error('Search cache error:', error);
    }
  }

  // Get cached search results
  async getCachedSearchResults(query, filters) {
    if (!this.isConnected) return null;

    try {
      const cacheKey = `search:${this.hashObject({ query, ...filters })}`;
      const cached = await this.redis.get(cacheKey);
      
      if (cached) {
        console.log(`Search cache hit for key: ${cacheKey}`);
        return JSON.parse(cached);
      }
      
      return null;
    } catch (error) {
      console.error('Search cache retrieval error:', error);
      return null;
    }
  }

  // Cache categories
  async cacheCategories(categories, ttl = 7200) { // 2 hours
    if (!this.isConnected) return;

    try {
      await this.redis.setEx('categories:all', ttl, JSON.stringify(categories));
      console.log('Categories cached successfully');
    } catch (error) {
      console.error('Categories cache error:', error);
    }
  }

  // Get cached categories
  async getCachedCategories() {
    if (!this.isConnected) return null;

    try {
      const cached = await this.redis.get('categories:all');
      if (cached) {
        console.log('Categories cache hit');
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      console.error('Categories cache retrieval error:', error);
      return null;
    }
  }

  // Cache bookstore data
  async cacheBookstore(bookstoreId, data, ttl = 3600) {
    if (!this.isConnected) return;

    try {
      const cacheKey = `bookstore:${bookstoreId}`;
      await this.redis.setEx(cacheKey, ttl, JSON.stringify(data));
      console.log(`Bookstore ${bookstoreId} cached successfully`);
    } catch (error) {
      console.error('Bookstore cache error:', error);
    }
  }

  // Get cached bookstore data
  async getCachedBookstore(bookstoreId) {
    if (!this.isConnected) return null;

    try {
      const cacheKey = `bookstore:${bookstoreId}`;
      const cached = await this.redis.get(cacheKey);
      
      if (cached) {
        console.log(`Bookstore cache hit for ID: ${bookstoreId}`);
        return JSON.parse(cached);
      }
      
      return null;
    } catch (error) {
      console.error('Bookstore cache retrieval error:', error);
      return null;
    }
  }

  // Cache user session data
  async cacheUserSession(userId, sessionData, ttl = 86400) { // 24 hours
    if (!this.isConnected) return;

    try {
      const cacheKey = `session:${userId}`;
      await this.redis.setEx(cacheKey, ttl, JSON.stringify(sessionData));
      console.log(`User session cached for ID: ${userId}`);
    } catch (error) {
      console.error('Session cache error:', error);
    }
  }

  // Get cached user session
  async getCachedUserSession(userId) {
    if (!this.isConnected) return null;

    try {
      const cacheKey = `session:${userId}`;
      const cached = await this.redis.get(cacheKey);
      
      if (cached) {
        console.log(`Session cache hit for user ID: ${userId}`);
        return JSON.parse(cached);
      }
      
      return null;
    } catch (error) {
      console.error('Session cache retrieval error:', error);
      return null;
    }
  }

  // Invalidate user session
  async invalidateUserSession(userId) {
    if (!this.isConnected) return;

    try {
      const cacheKey = `session:${userId}`;
      await this.redis.del(cacheKey);
      console.log(`Session invalidated for user ID: ${userId}`);
    } catch (error) {
      console.error('Session invalidation error:', error);
    }
  }

  // Cache popular searches
  async cachePopularSearches(searches, ttl = 3600) {
    if (!this.isConnected) return;

    try {
      await this.redis.setEx('popular_searches', ttl, JSON.stringify(searches));
      console.log('Popular searches cached successfully');
    } catch (error) {
      console.error('Popular searches cache error:', error);
    }
  }

  // Get cached popular searches
  async getCachedPopularSearches() {
    if (!this.isConnected) return null;

    try {
      const cached = await this.redis.get('popular_searches');
      if (cached) {
        console.log('Popular searches cache hit');
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      console.error('Popular searches cache retrieval error:', error);
      return null;
    }
  }

  // Set simple key-value cache
  async set(key, value, ttl = 3600) {
    if (!this.isConnected) return false;

    try {
      await this.redis.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  // Get simple key-value cache
  async get(key) {
    if (!this.isConnected) return null;

    try {
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Delete cache key
  async delete(key) {
    if (!this.isConnected) return false;

    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  // Increment counter (for rate limiting, analytics, etc.)
  async increment(key, ttl = 3600) {
    if (!this.isConnected) return 0;

    try {
      const count = await this.redis.incr(key);
      if (count === 1) {
        // Set expiration only on first increment
        await this.redis.expire(key, ttl);
      }
      return count;
    } catch (error) {
      console.error('Cache increment error:', error);
      return 0;
    }
  }

  // Hash object for consistent cache keys
  hashObject(obj) {
    const sortedObj = this.sortObjectKeys(obj);
    const str = JSON.stringify(sortedObj);
    return crypto.createHash('md5').update(str).digest('hex');
  }

  // Sort object keys recursively for consistent hashing
  sortObjectKeys(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sortObjectKeys(item));
    }

    const sortedKeys = Object.keys(obj).sort();
    const sortedObj = {};
    
    for (const key of sortedKeys) {
      sortedObj[key] = this.sortObjectKeys(obj[key]);
    }
    
    return sortedObj;
  }

  // Get cache statistics
  async getStats() {
    if (!this.isConnected) {
      return { connected: false, error: 'Redis not connected' };
    }

    try {
      const info = await this.redis.info('memory');
      const keyspace = await this.redis.info('keyspace');
      
      return {
        connected: true,
        memory: info,
        keyspace: keyspace,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return { connected: false, error: error.message };
    }
  }

  // Cleanup expired keys (manual cleanup if needed)
  async cleanup() {
    if (!this.isConnected) return;

    try {
      // This is handled automatically by Redis, but we can force cleanup if needed
      console.log('Cache cleanup initiated');
      // Add any custom cleanup logic here
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }

  // Close Redis connection
  async close() {
    if (this.redis && this.isConnected) {
      try {
        await this.redis.quit();
        console.log('Redis connection closed');
      } catch (error) {
        console.error('Error closing Redis connection:', error);
      }
    }
  }
}

// Create singleton instance
const cacheService = new CacheService();

module.exports = cacheService;
