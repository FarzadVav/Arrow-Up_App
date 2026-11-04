"use client";

import { useState, useCallback } from "react";

export type HistoryItemType =
  | "daily"
  | "upcoming"
  | "missions"
  | "todos"
  | "framework"
  | "journals";

export interface UseHistoryActionsOptions {
  id: number;
  type: HistoryItemType;
  onMutated?: () => void;
}

export function useHistoryActions({
  id,
  type,
  onMutated,
}: UseHistoryActionsOptions) {
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleRestore = useCallback(async () => {
    if (isRestoring) return;
    setIsRestoring(true);
    try {
      const res = await fetch("/api/history/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type }),
      });
      const data = await res.json();
      if (data.success) {
        onMutated?.();
      }
    } catch (err) {
      console.error("Failed to restore entity:", err);
    } finally {
      setIsRestoring(false);
    }
  }, [id, type, isRestoring, onMutated]);

  const handlePermanentDelete = useCallback(async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/history/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type }),
      });
      const data = await res.json();
      if (data.success) {
        setDeleteDialogOpen(false);
        onMutated?.();
      }
    } catch (err) {
      console.error("Failed to permanently delete entity:", err);
    } finally {
      setIsDeleting(false);
    }
  }, [id, type, isDeleting, onMutated]);

  return {
    isRestoring,
    isDeleting,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleRestore,
    handlePermanentDelete,
  };
}

export default useHistoryActions;
