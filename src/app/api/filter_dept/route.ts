import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const groupName = searchParams.get("group");

    // Use GAS URL from environment
    const gasUrl = process.env.NEXT_PUBLIC_GAS_DATA_URL;
    
    if (!gasUrl) {
      throw new Error("GAS_DATA_URL is not configured");
    }

    console.log("Fetching data from GAS for filter_dept:", gasUrl);

    const res = await axios.get(gasUrl, {
      timeout: 15000,
    });

    // Safely extract data with multiple fallback options
    let allNodes = [];
    
    if (res.data) {
      if (Array.isArray(res.data)) {
        allNodes = res.data;
      } else if (Array.isArray(res.data?.data)) {
        allNodes = res.data.data;
      } else if (res.data?.data && typeof res.data.data === 'object') {
        // If it's an object but not an array, try to convert it
        console.warn("Data format unexpected, attempting to handle:", typeof res.data.data);
        allNodes = [];
      }
    }

    // Ensure allNodes is always an array
    if (!Array.isArray(allNodes)) {
      console.warn("allNodes is not an array, received:", typeof allNodes);
      allNodes = [];
    }

    console.log(`Received ${allNodes.length} nodes from GAS`);

    // If no group specified, return all nodes
    if (!groupName) {
      const response = NextResponse.json({ data: allNodes });
      response.headers.set(
        "Cache-Control",
        "public, s-maxage=60, stale-while-revalidate=120"
      );
      return response;
    }

    // Find root group node
    const rootGroup = allNodes.find(
      (n: any) =>
        n.name === groupName &&
        Array.isArray(n.tags) &&
        n.tags.includes("group")
    );

    if (!rootGroup) {
      console.warn(`Group '${groupName}' not found in ${allNodes.length} nodes`);
      return NextResponse.json(
        { data: [], message: `Group '${groupName}' not found` },
        { status: 404 }
      );
    }

    // DFS to get all nodes in the group hierarchy
    const result: any[] = [];
    const visited = new Set<string | number>();

    function dfs(nodeId: string | number) {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const current = allNodes.find((n: any) => n.id === nodeId);
      if (current) result.push(current);

      allNodes.forEach((n: any) => {
        // GROUP → GROUP (parent-child group relationship)
        if (
          n.pid === nodeId &&
          Array.isArray(n.tags) &&
          n.tags.includes("group")
        ) {
          dfs(n.id);
        }

        // GROUP → EMPLOYEE (direct employees in group)
        if (
          n.pid === nodeId &&
          Array.isArray(n.tags) &&
          n.tags.includes("emp")
        ) {
          dfs(n.id);
        }

        // EMPLOYEE → EMPLOYEE (subordinates)
        if (n.stpid === nodeId) {
          dfs(n.id);
        }
      });
    }

    dfs(rootGroup.id);

    console.log(`DFS traversal found ${result.length} nodes for group '${groupName}'`);

    // Set cache headers
    const response = NextResponse.json({
      data: result,
      group: groupName,
      nodeCount: result.length,
    });

    response.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=120"
    );

    return response;
  } catch (error) {
    console.error("GET /api/filter_dept failed:", error);

    return NextResponse.json(
      {
        data: [],
        error: error instanceof Error ? error.message : "Failed to fetch data",
      },
      { status: 500 }
    );
  }
}
