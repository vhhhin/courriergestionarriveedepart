export const API_CONFIG = {
  BASE_URL: 'http://localhost:8001/api',
  ENDPOINTS: {
    HEALTH: '/health',
    COURIERS: {
      INCOMING: '/couriers/arrivee/search',
      OUTGOING: '/couriers/depart/search'
    },
    DECISIONS: {
      SEARCH: '/decisions/search',
      LIST: '/decisions',
      CREATE: '/decisions',
      UPDATE: '/decisions',
      DELETE: '/decisions'
    }
  }
};
