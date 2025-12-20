/**
 * API Constants
 * Centralized API endpoint definitions
 */

// Data retrieval endpoints
export const GET_DATA_API = '/api/get_data';
export const FILTER_DEPT_API = '/filter_dept';

// Mutation endpoints
export const ADD_DEPARTMENT_API = '/add-Department';
export const UPDATE_NODE_API = '/Update-Node';
export const REMOVE_NODE_API = '/Remove-Node';

// Cache configuration
export const CACHE_CONFIG = {
  REVALIDATE_INTERVAL: parseInt(
    process.env.NEXT_PUBLIC_CACHE_REVALIDATE_INTERVAL || '60000'
  ),
  STALE_WHILE_REVALIDATE: 120000, // 2 minutes
};