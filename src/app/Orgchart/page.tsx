"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import OrgChartView from "./OrgChartView";

/**
 * Loading skeleton component
 */
function OrgChartSkeleton() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin">
          <svg
            className="w-12 h-12 text-red-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <p className="mt-4 text-gray-600">Loading organization chart...</p>
      </div>
    </div>
  );
}

/**
 * Main OrgChart Page Component
 * - Extracts group from URL query params
 * - Passes to OrgChartView which uses SWR caching
 */
function OrgChartPageContent() {
  const searchParams = useSearchParams();
  const group = searchParams.get("group") || "";

  return (
    <div className="w-full">
      {group && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-700">
            Viewing organization: <strong>{group}</strong>
          </p>
        </div>
      )}
      <OrgChartView selectedGroup={group} />
    </div>
  );
}

export default function OrgChartPage() {
  return (
    <Suspense fallback={<OrgChartSkeleton />}>
      <OrgChartPageContent />
    </Suspense>
  );
}
