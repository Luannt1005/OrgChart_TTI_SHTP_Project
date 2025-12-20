/**
 * Custom Hook: useOrgData
 * Provides global organization data with SWR caching
 * Time-based revalidation: 60 seconds
 */

'use client';

import useSWR, { SWRConfiguration } from 'swr';
import { OrgNode, ApiResponse } from '@/types/orgchart';
import { swrFetcher } from '@/lib/api-client';
import { GET_DATA_API } from '@/constant/api';

const CACHE_REVALIDATE_INTERVAL = parseInt(
  process.env.NEXT_PUBLIC_CACHE_REVALIDATE_INTERVAL || '60000'
);

interface UseOrgDataOptions extends SWRConfiguration {
  onSuccess?: (data: OrgNode[]) => void;
  onError?: (error: Error) => void;
}

export function useOrgData(options?: UseOrgDataOptions) {
  // Build SWR config safely, avoiding callback conflicts
  const baseConfig: SWRConfiguration = {
    // Time-based revalidation strategy (Option A)
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: true,
    focusThrottleInterval: CACHE_REVALIDATE_INTERVAL,
    dedupingInterval: CACHE_REVALIDATE_INTERVAL, // Deduplicate requests within 60s
    compare: (a, b) => {
      // Custom comparison to avoid unnecessary re-renders
      return JSON.stringify(a) === JSON.stringify(b);
    },
  };

  // Merge options without spreading callbacks multiple times
  const swrConfig: SWRConfiguration = {
    ...baseConfig,
    ...(options && {
      ...options,
      // Only set callbacks if they exist
      ...(options.onSuccess && { onSuccess: options.onSuccess }),
      ...(options.onError && { onError: options.onError }),
    }),
  };

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<OrgNode>>(
    GET_DATA_API,
    swrFetcher,
    swrConfig
  );

  // Extract nodes array from response
  const nodes = data?.data ?? [];

  // Extract unique group names
  const groups = Array.from(
    new Set(
      nodes
        .filter(node => node.tags?.includes('group'))
        .map(node => node.name)
        .filter(Boolean)
    )
  ).sort();

  return {
    nodes,
    groups,
    loading: isLoading,
    error: error as Error | null,
    mutate, // Manual revalidation trigger
    rawData: data,
  };
}

/**
 * Helper hook to get filtered data by group
 * Uses cached global data to avoid extra API calls
 */
export function useFilteredOrgData(groupName?: string) {
  const { nodes, loading, error, mutate } = useOrgData();

  // Perform client-side filtering from cached data
  const filteredNodes = groupName
    ? filterNodesByGroup(nodes, groupName)
    : nodes;

  return {
    nodes: filteredNodes,
    loading,
    error,
    mutate,
    allNodes: nodes,
  };
}

/**
 * DFS filtering function to get nodes for a specific group
 */
function filterNodesByGroup(
  nodes: OrgNode[],
  groupName: string
): OrgNode[] {
  const targetNode = nodes.find(
    n => n.name === groupName && n.tags?.includes('group')
  );

  if (!targetNode) return [];

  const filtered: OrgNode[] = [];
  const visited = new Set<string | number>();

  const allNodes = nodes;

  function dfs(nodeId: string | number) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const current = allNodes.find((n: any) => n.id === nodeId);
    if (current) filtered.push(current);

    allNodes.forEach((n: any) => {
      // 🔹 GROUP → GROUP
      if (
        n.pid === nodeId &&
        Array.isArray(n.tags) &&
        n.tags.includes("group")
      ) {
        dfs(n.id);
      }

      // 🔹 GROUP → EMP
      if (
        n.pid === nodeId &&
        Array.isArray(n.tags) &&
        n.tags.includes("emp")
      ) {
        dfs(n.id);
      }

      // 🔹 EMP → EMP
      if (n.stpid === nodeId) {
        dfs(n.id);
      }
    });
  }

  dfs(targetNode.id);
  return filtered;
}

/**
 * Hook to manually trigger cache revalidation
 * Useful after create/update/delete operations
 */
export function useRevalidateOrgData() {
  const { mutate } = useOrgData();

  const revalidate = async () => {
    try {
      await mutate();
      return true;
    } catch (error) {
      console.error('Failed to revalidate org data:', error);
      return false;
    }
  };

  return { revalidate };
}
