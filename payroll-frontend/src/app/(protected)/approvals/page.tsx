"use client";

import React, { useEffect, useState } from "react";

type PendingConfig = {
  _id: string;
  configType: string;
  status?: string;
  [key: string]: any;
};

type PendingApprovals = {
  payTypes: PendingConfig[];
  payGrades: PendingConfig[];
  allowances: PendingConfig[];
  insuranceBrackets: PendingConfig[];
  taxRules: PendingConfig[];
  benefits: PendingConfig[];
  signingBonuses: PendingConfig[];
  payrollPolicies: PendingConfig[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/payroll-configuration`
  : 'http://localhost:3000/payroll-configuration';

const CONFIG_TYPE_LABELS: Record<string, string> = {
  'pay-types': 'Pay Type',
  'pay-grades': 'Pay Grade',
  'allowances': 'Allowance',
  'insurance-brackets': 'Insurance Bracket',
  'tax-rules': 'Tax Rule',
  'benefits': 'Benefit',
  'signing-bonuses': 'Signing Bonus',
  'payroll-policies': 'Payroll Policy',
};

export default function ApprovalsPage() {
  const [pending, setPending] = useState<PendingApprovals | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchPending = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/pending-approvals`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to load pending approvals (${res.status})`);
      }

      const data = await res.json();
      setPending(data);
    } catch (err: any) {
      setError(err.message || "Error while loading pending approvals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (configType: string, id: string) => {
    const key = `${configType}-${id}`;
    setProcessing(key);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/${configType}/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to approve" }));
        throw new Error(errorData.message || "Failed to approve");
      }

      await fetchPending();
    } catch (err: any) {
      setError(err.message || "Error while approving");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (configType: string, id: string) => {
    if (!confirm("Are you sure you want to reject this configuration?")) {
      return;
    }

    const key = `${configType}-${id}`;
    setProcessing(key);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/${configType}/${id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to reject" }));
        throw new Error(errorData.message || "Failed to reject");
      }

      await fetchPending();
    } catch (err: any) {
      setError(err.message || "Error while rejecting");
    } finally {
      setProcessing(null);
    }
  };

  const renderConfigItem = (item: PendingConfig) => {
    const key = `${item.configType}-${item._id}`;
    const isProcessing = processing === key;

    // Get display name based on config type
    let displayName = "";
    if (item.name) displayName = item.name;
    else if (item.grade) displayName = item.grade;
    else if (item.code) displayName = item.code;
    else displayName = item._id;

    return (
      <>
        <td style={{
          ...tdStyle,
          padding: "16px 24px",
          color: "#0f172a",
          fontWeight: 500
        }}>{CONFIG_TYPE_LABELS[item.configType] || item.configType}</td>
        <td style={{
          ...tdStyle,
          padding: "16px 24px",
          color: "#475569"
        }}>{displayName}</td>
        <td style={{
          ...tdStyle,
          padding: "16px 24px"
        }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => handleApprove(item.configType, item._id)}
              disabled={isProcessing}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                cursor: isProcessing ? "not-allowed" : "pointer",
                backgroundColor: isProcessing ? "#9ca3af" : "#10b981",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 500,
                transition: "all 0.2s ease",
                boxShadow: isProcessing ? "none" : "0 1px 2px rgba(0, 0, 0, 0.1)"
              }}
              onMouseEnter={(e) => {
                if (!isProcessing) {
                  e.currentTarget.style.backgroundColor = "#059669";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.15)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isProcessing) {
                  e.currentTarget.style.backgroundColor = "#10b981";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.1)";
                }
              }}
            >
              {isProcessing ? "Processing..." : "Approve"}
            </button>
            <button
              onClick={() => handleReject(item.configType, item._id)}
              disabled={isProcessing}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                cursor: isProcessing ? "not-allowed" : "pointer",
                backgroundColor: isProcessing ? "#9ca3af" : "#ef4444",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 500,
                transition: "all 0.2s ease",
                boxShadow: isProcessing ? "none" : "0 1px 2px rgba(0, 0, 0, 0.1)"
              }}
              onMouseEnter={(e) => {
                if (!isProcessing) {
                  e.currentTarget.style.backgroundColor = "#dc2626";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.15)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isProcessing) {
                  e.currentTarget.style.backgroundColor = "#ef4444";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.1)";
                }
              }}
            >
              {isProcessing ? "Processing..." : "Reject"}
            </button>
          </div>
        </td>
      </>
    );
  };

  const getAllPendingItems = (): PendingConfig[] => {
    if (!pending) return [];
    return [
      ...pending.payTypes,
      ...pending.payGrades,
      ...pending.allowances,
      ...pending.insuranceBrackets,
      ...pending.taxRules,
      ...pending.benefits,
      ...pending.signingBonuses,
      ...pending.payrollPolicies,
    ];
  };

  const pendingItems = getAllPendingItems();

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
          Approval Dashboard
        </h2>
        <p style={{ 
          fontSize: "15px", 
          color: "#64748b", 
          lineHeight: "1.6"
        }}>
          Review and approve or reject all pending payroll configuration changes. Only approved configurations will be activated.
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

      {loading ? (
        <div style={{
          padding: "60px 24px",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          textAlign: "center",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
        }}>
          <p style={{ fontSize: "14px", color: "#64748b" }}>
            Loading pending approvals…
          </p>
        </div>
      ) : pendingItems.length === 0 ? (
        <div
          style={{
            padding: "48px 24px",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            textAlign: "center",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
          }}
        >
          <p style={{ fontSize: "15px", color: "#64748b", fontWeight: 500 }}>
            ✅ No pending approvals. All configurations are approved or there are no draft configurations.
          </p>
        </div>
      ) : (
        <div style={{
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
            <h3 style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#0f172a",
              margin: 0
            }}>
              Pending Approvals ({pendingItems.length})
            </h3>
          </div>
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
                }}>Configuration Type</th>
                <th style={{
                  ...thStyle,
                  padding: "12px 24px",
                  textAlign: "left",
                  fontWeight: 600,
                  color: "#475569",
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}>Name/Identifier</th>
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
              {pendingItems.map((item, idx) => (
                <tr 
                  key={item._id}
                  style={{
                    borderBottom: idx < pendingItems.length - 1 ? "1px solid #e2e8f0" : "none",
                    transition: "background-color 0.15s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8fafc";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {renderConfigItem(item)}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {pendingItems.length > 0 && (
        <div style={{
          marginTop: "24px",
          padding: "16px 20px",
          backgroundColor: "#f1f5f9",
          borderRadius: "8px",
          border: "1px solid #cbd5e1"
        }}>
          <p style={{ fontSize: "14px", color: "#475569", margin: 0, fontWeight: 500 }}>
            <strong style={{ color: "#0f172a" }}>Total Pending:</strong> {pendingItems.length} configuration(s) awaiting approval
          </p>
        </div>
      )}
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

