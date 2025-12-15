"use client";
import { useState } from "react";

type Props = {
  id: string;
  endpoint: string; // e.g. "pay-types"
  onChange?: () => void;
};

export default function ApproveRejectButtons({ id, endpoint, onChange }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleAction(action: "approve" | "reject") {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/payroll-configuration/${endpoint}/${id}/${action}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ approvedBy: "manager123" }),
        }
      );

      if (!res.ok) {
        alert("Error performing action");
        return;
      }

      if (onChange) onChange();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      <button
        disabled={loading}
        onClick={() => handleAction("approve")}
        className="px-3 py-1 bg-green-600 text-white rounded"
      >
        Approve
      </button>

      <button
        disabled={loading}
        onClick={() => handleAction("reject")}
        className="px-3 py-1 bg-red-600 text-white rounded"
      >
        Reject
      </button>
    </div>
  );
}
