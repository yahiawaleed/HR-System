"use client";

import React, { useEffect, useState, FormEvent } from "react";

type Backup = {
  _id: string;
  backupType: string;
  triggeredBy?: string;
  data: any;
  createdAt: string;
  updatedAt: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/payroll-configuration`
  : 'http://localhost:3001/payroll-configuration';

export default function SystemAdminPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/backups`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to load backups (${res.status})`);
      }

      const data = await res.json();
      setBackups(data);
    } catch (err: any) {
      setError(err.message || "Error while loading backups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      setCreating(true);
      const res = await fetch(`${API_BASE}/backups/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to create backup" }));
        throw new Error(errorData.message || "Failed to create backup");
      }

      setMessage("Backup created successfully!");
      await fetchBackups();
    } catch (err: any) {
      setError(err.message || "Error while creating backup");
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = async (backupId: string) => {
    if (!confirm("Are you sure you want to restore this backup? This will replace all current configuration data!")) {
      return;
    }

    setError(null);
    setMessage(null);

    try {
      setRestoring(backupId);
      const res = await fetch(`${API_BASE}/backups/${backupId}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to restore backup" }));
        throw new Error(errorData.message || "Failed to restore backup");
      }

      setMessage("Configuration restored successfully!");
      await fetchBackups();
    } catch (err: any) {
      setError(err.message || "Error while restoring backup");
    } finally {
      setRestoring(null);
    }
  };

  const handleDelete = async (backupId: string) => {
    if (!confirm("Are you sure you want to delete this backup?")) {
      return;
    }

    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE}/backups/${backupId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to delete backup");
      }

      setMessage("Backup deleted successfully!");
      await fetchBackups();
    } catch (err: any) {
      setError(err.message || "Error while deleting backup");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div style={{ maxWidth: "1400px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ 
          fontSize: "28px", 
          fontWeight: 700, 
          marginBottom: "8px",
          color: "#0f172a",
          letterSpacing: "-0.02em"
        }}>
          System Administration
        </h2>
        <p style={{ 
          fontSize: "15px", 
          color: "#64748b", 
          lineHeight: "1.6"
        }}>
          Manage configuration backups and restore system settings. Only System Admins can perform restore and delete operations.
        </p>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "24px",
            padding: "12px 16px",
            borderRadius: "8px",
            backgroundColor: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            fontSize: "14px",
            fontWeight: 500,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
          }}
        >
          {error}
        </div>
      )}

      {message && (
        <div
          style={{
            marginBottom: "24px",
            padding: "12px 16px",
            borderRadius: "8px",
            backgroundColor: "#d1fae5",
            border: "1px solid #a7f3d0",
            color: "#065f46",
            fontSize: "14px",
            fontWeight: 500,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
          }}
        >
          {message}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Create Backup Section */}
        <section
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: 600,
              marginBottom: "8px",
              color: "#0f172a"
            }}
          >
            Create New Backup
          </h3>
          <p style={{ 
            fontSize: "14px", 
            color: "#64748b", 
            marginBottom: "20px",
            lineHeight: "1.6"
          }}>
            Create a snapshot of all payroll configuration data including pay grades, allowances, tax rules, insurance brackets, and company settings.
          </p>
          <form onSubmit={handleCreateBackup}>
            <button
              type="submit"
              disabled={creating}
              style={{
                padding: "12px 24px",
                borderRadius: "8px",
                border: "none",
                cursor: creating ? "not-allowed" : "pointer",
                backgroundColor: creating ? "#9ca3af" : "#3b82f6",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 600,
                transition: "all 0.2s ease",
                boxShadow: creating ? "none" : "0 1px 3px rgba(0, 0, 0, 0.1)"
              }}
              onMouseEnter={(e) => {
                if (!creating) {
                  e.currentTarget.style.backgroundColor = "#2563eb";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.15)";
                }
              }}
              onMouseLeave={(e) => {
                if (!creating) {
                  e.currentTarget.style.backgroundColor = "#3b82f6";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
                }
              }}
            >
              {creating ? "Creating Backup..." : "Create Backup"}
            </button>
          </form>
        </section>

        {/* Backups List */}
        <section style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          overflow: "hidden"
        }}>
          <div style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc"
          }}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "#0f172a",
                margin: 0
              }}
            >
              Existing Backups
            </h3>
          </div>

          {loading ? (
            <div style={{ padding: "40px 24px", textAlign: "center" }}>
              <p style={{ fontSize: "14px", color: "#64748b" }}>
                Loading backups…
              </p>
            </div>
          ) : backups.length === 0 ? (
            <div style={{ padding: "40px 24px", textAlign: "center" }}>
              <p style={{ fontSize: "14px", color: "#64748b" }}>
                No backups found. Create your first backup above.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc" }}>
                    <th style={{
                      ...thStyle,
                      padding: "12px 24px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#475569",
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}>Created At</th>
                    <th style={{
                      ...thStyle,
                      padding: "12px 24px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#475569",
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}>Type</th>
                    <th style={{
                      ...thStyle,
                      padding: "12px 24px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#475569",
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}>Triggered By</th>
                    <th style={{
                      ...thStyle,
                      padding: "12px 24px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#475569",
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {backups.map((backup, idx) => (
                    <tr 
                      key={backup._id}
                      style={{
                        borderBottom: idx < backups.length - 1 ? "1px solid #e2e8f0" : "none",
                        transition: "background-color 0.15s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <td style={{
                        ...tdStyle,
                        padding: "16px 24px",
                        color: "#475569"
                      }}>{formatDate(backup.createdAt)}</td>
                      <td style={{
                        ...tdStyle,
                        padding: "16px 24px",
                        color: "#475569"
                      }}>{backup.backupType}</td>
                      <td style={{
                        ...tdStyle,
                        padding: "16px 24px",
                        color: "#475569"
                      }}>{backup.triggeredBy || "—"}</td>
                      <td style={{
                        ...tdStyle,
                        padding: "16px 24px"
                      }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => handleRestore(backup._id)}
                            disabled={restoring === backup._id}
                            style={{
                              padding: "8px 16px",
                              borderRadius: "6px",
                              border: "none",
                              cursor: restoring === backup._id ? "not-allowed" : "pointer",
                              backgroundColor: restoring === backup._id ? "#9ca3af" : "#10b981",
                              color: "#ffffff",
                              fontSize: "13px",
                              fontWeight: 500,
                              transition: "all 0.2s ease",
                              boxShadow: restoring === backup._id ? "none" : "0 1px 2px rgba(0, 0, 0, 0.1)"
                            }}
                            onMouseEnter={(e) => {
                              if (restoring !== backup._id) {
                                e.currentTarget.style.backgroundColor = "#059669";
                                e.currentTarget.style.transform = "translateY(-1px)";
                                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.15)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (restoring !== backup._id) {
                                e.currentTarget.style.backgroundColor = "#10b981";
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.1)";
                              }
                            }}
                          >
                            {restoring === backup._id ? "Restoring..." : "Restore"}
                          </button>
                          <button
                            onClick={() => handleDelete(backup._id)}
                            disabled={restoring === backup._id}
                            style={{
                              padding: "8px 16px",
                              borderRadius: "6px",
                              border: "none",
                              cursor: restoring === backup._id ? "not-allowed" : "pointer",
                              backgroundColor: "#dc2626",
                              color: "#ffffff",
                              fontSize: "12px",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  borderBottom: "1px solid #e5e7eb",
  padding: "12px",
  fontWeight: 600,
  backgroundColor: "#f3f4f6",
};

const tdStyle: React.CSSProperties = {
  borderBottom: "1px solid #e5e7eb",
  padding: "12px",
};

