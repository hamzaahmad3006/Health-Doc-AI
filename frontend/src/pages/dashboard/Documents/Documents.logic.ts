import { useState, useEffect } from "react";
import axios from "axios";

export const useDocuments = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get("/api/documents/");
      // Mapping API response to UI model
      const mappedDocs = res.data.map((doc: any) => ({
        id: doc.id,
        filename: doc.filename,
        status: doc.status,
        confidence: doc.confidence_score,
        isApproved: doc.is_approved,
        date: new Date(doc.created_at).toLocaleDateString(),
        extractedData: doc.extracted_data,
      }));
      setDocuments(mappedDocs);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [rejectionAlert, setRejectionAlert] = useState<{ message: string; filename: string } | null>(null);

  const handleUpload = async (file: File) => {
    // Single file upload (backward compatible)
    await handleMultiUpload([file]);
  };

  const handleMultiUpload = async (files: File[]) => {
    setIsUploading(true);
    setRejectionAlert(null);
    setUploadProgress({ current: 0, total: files.length });

    const rejectedFiles: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        setUploadProgress({ current: i + 1, total: files.length });
        const formData = new FormData();
        formData.append("file", files[i]);

        try {
          await axios.post("/api/documents/upload/", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
        } catch (uploadErr: any) {
          // Check if this is a non-medical rejection (422)
          if (uploadErr?.response?.status === 422) {
            const detail = uploadErr.response.data?.detail;
            if (detail?.type === "non_medical") {
              rejectedFiles.push(files[i].name);
              setRejectionAlert({
                message: detail.message || "This document is not a medical report.",
                filename: files[i].name,
              });
              continue; // Skip this file, continue with others
            }
          }
          throw uploadErr; // Re-throw other errors
        }
      }
      await fetchDocuments();

      if (rejectedFiles.length > 0) {
        if (rejectedFiles.length < files.length) {
          // Some passed, some rejected
          setRejectionAlert({
            message: `${rejectedFiles.length} file(s) rejected — they do not appear to be medical documents. Other files uploaded successfully.`,
            filename: rejectedFiles.join(", "),
          });
        }
        // If all were rejected, the last setRejectionAlert from inside the loop is already sufficient, 
        // but we ensure it persists.
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const dismissRejectionAlert = () => setRejectionAlert(null);

  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  const viewDetails = (doc: any) => {
    setSelectedDoc(doc);
  };

  const closeDetails = () => {
    setSelectedDoc(null);
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;

    try {
      await axios.delete(`/api/documents/${docId}`);
      await fetchDocuments();
      if (selectedDoc?.id === docId) {
        closeDetails();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleUpdateDocument = async (docId: string, updates: any) => {
    try {
      const res = await axios.patch(`/api/documents/${docId}`, updates);
      await fetchDocuments();
      // Update selectedDoc if it's the one being edited
      if (selectedDoc?.id === docId) {
        const updated = {
          id: res.data.id,
          filename: res.data.filename,
          status: res.data.status,
          confidence: res.data.confidence_score,
          isApproved: res.data.is_approved,
          date: new Date(res.data.created_at).toLocaleDateString(),
          extractedData: res.data.extracted_data,
        };
        setSelectedDoc(updated);
      }
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleApproveDocument = async (docId: string) => {
    await handleUpdateDocument(docId, { is_approved: true });
  };

  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocuments = documents.filter((doc) => {
    const matchesFilter = (() => {
      if (filter === "All") return true;
      const status = doc.status.toLowerCase();
      if (filter === "Completed") return status === "completed";
      if (filter === "Processing")
        return status === "processing" || status === "pending";
      if (filter === "Error") return status === "failed" || status === "error";
      return false;
    })();

    const matchesSearch = doc.filename
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleExport = async (format: "csv" | "json" = "csv") => {
    try {
      const response = await axios.get(`/api/documents/export/${format}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `documents_export_${new Date().toISOString().split("T")[0]}.${format}`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  return {
    documents: filteredDocuments,
    allDocuments: documents,
    isLoading,
    isUploading,
    uploadProgress,
    handleUpload,
    handleMultiUpload,
    handleDelete,
    selectedDoc,
    viewDetails,
    closeDetails,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    handleExport,
    handleUpdateDocument,
    handleApproveDocument,
    rejectionAlert,
    dismissRejectionAlert,
  };
};
