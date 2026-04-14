import { useState, useEffect } from "react";
import axios from "axios";

import dummyTrends from "./data.json";

export const useOverview = () => {
  const [stats, setStats] = useState({
    totalProcessed: 0,
    pendingReview: 0,
    accuracyRate: 0,
  });
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>(dummyTrends);
  const [schedule, setSchedule] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null,
  );

  const [insights, setInsights] = useState<any[]>([
    {
      id: 1,
      label: "Glucose Trend",
      value: "+5.2%",
      status: "up",
      description: "Slightly higher than last month's average.",
    },
    {
      id: 2,
      label: "Adherence",
      value: "92%",
      status: "stable",
      description: "Consistent medication intake maintained.",
    },
    {
      id: 3,
      label: "Hemoglobin",
      value: "-0.4",
      status: "down",
      description: "Stabilizing within the normal clinical range.",
    },
  ]);

  const [quickActions, setQuickActions] = useState<any[]>([
    {
      id: 1,
      label: "Upload Report",
      icon: "FilePlus",
      color: "blue",
      href: "/dashboard/documents",
    },
    {
      id: 2,
      label: "Review Trends",
      icon: "Activity",
      color: "indigo",
      href: "#",
    },
    {
      id: 3,
      label: "Share Summary",
      icon: "Share2",
      color: "emerald",
      href: "#",
    },
    {
      id: 4,
      label: "Quick Note",
      icon: "Edit3",
      color: "amber",
      href: "#",
    },
  ]);

  const [vitals, setVitals] = useState<any[]>([
    {
      id: 1,
      label: "Blood Pressure",
      value: "120/80",
      unit: "mmHg",
      status: "normal",
      icon: "Activity",
    },
    {
      id: 2,
      label: "Heart Rate",
      value: "72",
      unit: "bpm",
      status: "normal",
      icon: "Heart",
    },
    {
      id: 3,
      label: "SpO2",
      value: "98",
      unit: "%",
      status: "normal",
      icon: "Wind",
    },
    {
      id: 4,
      label: "Temperature",
      value: "98.6",
      unit: "°F",
      status: "normal",
      icon: "Thermometer",
    },
  ]);

  const fetchData = async (pId: number | null = selectedPatientId) => {
    try {
      // Fetch patients list
      const patientsRes = await axios.get("/api/documents/patients");
      setPatients(patientsRes.data);

      const params = pId ? { patient_id: pId } : {};

      // Fetch dynamic stats
      const statsRes = await axios.get("/api/documents/stats/", { params });
      setStats(statsRes.data);

      // Fetch dynamic alerts
      const alertsRes = await axios.get("/api/documents/alerts", { params });
      setAlerts(alertsRes.data);

      // Keep the overview chart deterministic with the bundled dummy trend data.
      setTrends(dummyTrends);

      // Fetch schedule
      const scheduleRes = await axios.get("/api/documents/analysis/schedule", {
        params,
      });
      setSchedule(scheduleRes.data);

      // Fetch recent documents
      const docsRes = await axios.get("/api/documents/", { params });
      const mappedDocs = docsRes.data.slice(0, 5).map((doc: any) => ({
        id: doc.id,
        filename: doc.filename,
        status: doc.status.charAt(0).toUpperCase() + doc.status.slice(1),
        confidence: Math.round((doc.confidence_score || 0) * 100),
        date: new Date(doc.created_at).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
      setRecentDocs(mappedDocs);
    } catch (err) {
      console.error("Failed to fetch overview data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-refresh every 15 seconds to catch new uploads
    const interval = setInterval(() => {
      fetchData();
    }, 15000);

    return () => clearInterval(interval);
  }, [selectedPatientId]);

  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("30D");

  const filteredRecentDocs = recentDocs.filter((doc) =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return {
    stats,
    recentDocs: filteredRecentDocs,
    allRecentDocs: recentDocs,
    trends,
    schedule,
    alerts,
    insights,
    quickActions,
    vitals,
    patients,
    selectedPatientId,
    setSelectedPatientId,
    isLoading,
    fetchData,
    searchQuery,
    setSearchQuery,
    dateRange,
    setDateRange,
  };
};
