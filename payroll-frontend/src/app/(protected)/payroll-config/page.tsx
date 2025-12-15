export default function PayrollConfigOverviewPage() {
  return (
    <div>
      <h2 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "8px" }}>
        Payroll Configuration Overview
      </h2>
      <p style={{ fontSize: "14px", color: "#4b5563", marginBottom: "16px" }}>
        This section defines all payroll rules, salary structures, and compliance
        settings that control every salary calculation.
      </p>

      <ul style={{ fontSize: "14px", color: "#374151", paddingLeft: "18px" }}>
        <li>Define pay grades and base salaries by contract type.</li>
        <li>Configure allowances and deductions (transportation, tax, etc.).</li>
        <li>Embed legal compliance: tax rules and insurance brackets.</li>
        <li>Set signing bonuses and resignation/termination benefits.</li>
        <li>
          Ensure all configurations are reviewed and approved before payroll
          runs.
        </li>
      </ul>

      <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "20px" }}>
        Use the menu on the left to configure each part of the Payroll
        Configuration &amp; Policy Setup subsystem.
      </p>
    </div>
  );
}
