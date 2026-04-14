import { useState, useEffect } from "react";
import axios from "axios";

export const useSettings = () => {
  const [settings, setSettings] = useState({
    ai_model: "llama-3.3-70b-versatile",
    language: "English",
    custom_fields: [] as string[],
    instructions: [] as string[],
    confidence_threshold: 0.85,
    auto_approve: true,
    retention_days: 30,
    api_key: "sk_live_••••••••••••••••••••",
    clinic_name: "Health Docs AI Clinic",
    clinic_address: "",
    pdf_theme_color: "#3b82f6",
    clinic_logo_url: "",
    webhook_url: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await axios.get("/api/documents/configuration/workspace");
      setSettings((prev) => ({
        ...prev,
        ...res.data,
      }));
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const addItem = (key: "custom_fields" | "instructions", value: string) => {
    if (!value.trim()) return;
    setSettings((prev) => ({
      ...prev,
      [key]: [...prev[key], value.trim()],
    }));
  };

  const removeItem = (key: "custom_fields" | "instructions", index: number) => {
    setSettings((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const res = await axios.patch(
        "/api/documents/configuration/workspace",
        settings,
      );
      setSettings((prev) => ({
        ...prev,
        ...res.data,
      }));
      alert("Settings saved successfully!");
    } catch (err) {
      console.error("Failed to save settings:", err);
      alert("Error saving settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    settings,
    updateSetting,
    saveSettings,
    isSaving,
    isLoading,
    addItem,
    removeItem,
  };
};
