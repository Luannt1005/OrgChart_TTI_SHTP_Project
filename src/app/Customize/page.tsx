'use client';

import { useEffect, useRef, useState, useCallback } from "react";
import OrgChart from "@balkangraph/orgchart.js";

const LOAD_URL =
  "https://script.google.com/macros/s/AKfycbzbWJUtJ77FWSWkyR_A6RaEvvK9WKFlnNIRTDsXLggcxihknZcF4JhAGgIybKMmE807/exec";

const ORG_ID = "org_admin_1";

const Customize = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);
  const originalNodesRef = useRef<any[]>([]); // Store original nodes
  
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  /* ================= SAVE ================= */
  const saveData = useCallback(async () => {
    if (!chartInstance.current || isSaving) return;

    setIsSaving(true);

    try {
      const chart = chartInstance.current;
      
      // Update original nodes with current state from chart
      const allNodes = originalNodesRef.current.map((originalNode: any) => {
        const currentNode = chart.get(originalNode.id);
        
        if (currentNode) {
          // Merge original node with current state
          return {
            ...originalNode,
            pid: currentNode.pid || originalNode.pid || '',
            ppid: currentNode.ppid || originalNode.ppid || '',
            stpid: currentNode.stpid || originalNode.stpid || '',
            name: currentNode.name || originalNode.name || '',
            title: currentNode.title || originalNode.title || '',
            photo: currentNode.photo || originalNode.photo || '',
            img: currentNode.img || originalNode.img || '',
            tags: Array.isArray(currentNode.tags) ? currentNode.tags : (currentNode.tags ? [currentNode.tags] : []),
            // Preserve any other properties from original
            ...Object.keys(originalNode).reduce((acc: any, key: string) => {
              if (!['id', 'pid', 'ppid', 'stpid', 'name', 'title', 'photo', 'img', 'tags'].includes(key)) {
                acc[key] = originalNode[key];
              }
              return acc;
            }, {})
          };
        }
        return originalNode;
      });

      console.log("Saving all nodes:", allNodes);
      console.log("Total nodes:", allNodes.length);

      const response = await fetch("/api/save_data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_id: ORG_ID,
          org_data: { data: allNodes }
        })
      });

      const result = await response.json();
      console.log("Save response:", result);
      
      if (response.ok && result.success) {
        const now = new Date().toLocaleTimeString('vi-VN');
        setLastSaveTime(now);
        setHasChanges(false);
        alert("✅ Đã lưu thành công");
      } else {
        console.error("Save failed:", result);
        alert("❌ Lỗi khi lưu dữ liệu");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("❌ Lỗi kết nối");
    } finally {
      setIsSaving(false);
    }
  }, [isSaving]);

  /* ================= LOAD ================= */
  useEffect(() => {
    fetch(`${LOAD_URL}?org_id=${ORG_ID}`)
      .then(res => res.json())
      .then(res => {
        if (!res.org_data || !chartRef.current) return;

        const orgJson = JSON.parse(res.org_data);
        console.log("Loaded org data:", orgJson);

        // Store original nodes
        originalNodesRef.current = orgJson.data;

        const chartNodes = orgJson.data.map((n: any) => ({
          ...n,
          tags: Array.isArray(n.tags) ? n.tags : (n.tags ? [n.tags] : []),
          img: n.img || n.photo || "",
        }));

        chartInstance.current = new OrgChart(chartRef.current, {
          template: "olivia",
          enableDragDrop: true,
          nodeBinding: {
            field_0: "name",
            field_1: "title",
            img_0: "photo"
          },
        });

        chartInstance.current.load(chartNodes);

        // Listen for changes
        chartInstance.current.on('update', () => {
          console.log("Chart updated");
          setHasChanges(true);
        });

        chartInstance.current.on('drop', () => {
          console.log("Node dropped");
          setHasChanges(true);
        });

        chartInstance.current.on('remove', () => {
          console.log("Node removed");
          setHasChanges(true);
        });
      })
      .catch(err => console.error("Load error", err));
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 10,
          display: "flex",
          gap: "10px",
          alignItems: "center",
          background: "#f3f4f6",
          padding: "8px 12px",
          borderRadius: 6
        }}
      >
        {lastSaveTime && (
          <span style={{ fontSize: "12px", color: "#666" }}>
            💾 Lần lưu gần nhất: {lastSaveTime}
          </span>
        )}
        {hasChanges && (
          <span style={{ fontSize: "12px", color: "#ea8c55" }}>
            ⚠️ Có thay đổi chưa lưu
          </span>
        )}
        <button
          onClick={() => saveData()}
          disabled={isSaving}
          style={{
            padding: "8px 16px",
            background: isSaving ? "#9ca3af" : "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: isSaving ? "not-allowed" : "pointer",
            fontWeight: "bold"
          }}
        >
          {isSaving ? "Đang lưu..." : "Cập nhật"}
        </button>
      </div>

      <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default Customize;
