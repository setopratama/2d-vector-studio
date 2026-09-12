// src/hooks/useErrorLogs.ts
import { useState, useEffect, useCallback } from 'react';
import { ErrorLogItem } from '../types/errorLog';

export function useErrorLogs() {
  const [errorLogs, setErrorLogs] = useState<ErrorLogItem[]>([]);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const fetchErrorLogs = useCallback(async () => {
    try {
      setIsLoadingLogs(true);
      const res = await fetch('/api/logs/errors');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.logs)) {
          setErrorLogs(data.logs);
        }
      }
    } catch (err) {
      console.warn('Gagal memuat log error:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  const clearErrorLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/logs/errors', { method: 'DELETE' });
      if (res.ok) {
        setErrorLogs([]);
      }
    } catch (err) {
      console.error('Gagal membersihkan log error:', err);
    }
  }, []);

  const openErrorModal = useCallback(() => {
    fetchErrorLogs();
    setIsErrorModalOpen(true);
  }, [fetchErrorLogs]);

  const closeErrorModal = useCallback(() => {
    setIsErrorModalOpen(false);
  }, []);

  // Fetch initial error logs on mount
  useEffect(() => {
    fetchErrorLogs();
  }, [fetchErrorLogs]);

  return {
    errorLogs,
    isErrorModalOpen,
    isLoadingLogs,
    openErrorModal,
    closeErrorModal,
    fetchErrorLogs,
    clearErrorLogs,
  };
}
