import { useState } from "react";
import { useSession, useSignOut } from "../hooks/useAuth.js";

// Initial sample assets for the Asset Management system
const INITIAL_ASSETS = [
  {
    id: "AST-1049",
    name: "MacBook Pro 16\" M3 Max",
    category: "Hardware",
    assignedTo: "Sarah Connor (Engineering)",
    status: "Active",
    value: "$3,499",
    purchased: "2025-11-14",
  },
  {
    id: "AST-1050",
    name: "Dell XPS 15 9530",
    category: "Hardware",
    assignedTo: "Alex Murphy (Product)",
    status: "Active",
    value: "$2,299",
    purchased: "2026-01-20",
  },
  {
    id: "AST-2031",
    name: "Dell PowerEdge R760 Rack Server",
    category: "Servers",
    assignedTo: "IT Infrastructure Core",
    status: "Maintenance",
    value: "$12,450",
    purchased: "2024-06-18",
  },
  {
    id: "AST-3004",
    name: "Cisco Catalyst 9300 48-Port Switch",
    category: "Networking",
    assignedTo: "Floor 4 Server Room",
    status: "Active",
    value: "$4,800",
    purchased: "2025-03-10",
  },
  {
    id: "AST-4012",
    name: "Dell UltraSharp 32\" 4K USB-C Monitor",
    category: "Monitors",
    assignedTo: "Unassigned (Storage Room B)",
    status: "In Stock",
    value: "$899",
    purchased: "2026-02-05",
  },
  {
    id: "AST-5021",
    name: "Sony A7 IV 4K Video Production Kit",
    category: "Media",
    assignedTo: "Marketing & Video Team",
    status: "Active",
    value: "$3,100",
    purchased: "2025-08-22",
  },
];

export function DashboardPage() {
  const { data: session } = useSession();
  const signOutMutation = useSignOut();

  const [activeTab, setActiveTab] = useState("assets");
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal for Adding Asset
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: "",
    category: "Hardware",
    assignedTo: "",
    value: "",
    status: "Active",
  });

  // Backend session verify state
  const [apiResponse, setApiResponse] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleSignOut = async () => {
    try {
      await signOutMutation.mutateAsync();
    } catch (err) {
      console.error("Sign out failed", err);
    }
  };

  const handleAddAsset = (e) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.assignedTo) return;

    const created = {
      id: `AST-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newAsset.name,
      category: newAsset.category,
      assignedTo: newAsset.assignedTo,
      status: newAsset.status,
      value: newAsset.value ? (newAsset.value.startsWith("$") ? newAsset.value : `$${newAsset.value}`) : "$0",
      purchased: new Date().toISOString().split("T")[0],
    };

    setAssets([created, ...assets]);
    setNewAsset({ name: "", category: "Hardware", assignedTo: "", value: "", status: "Active" });
    setIsAddModalOpen(false);
  };

  const handleTestBackendApi = async () => {
    setApiLoading(true);
    setApiError("");
    setApiResponse(null);

    try {
      const baseUrl = import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:3000";
      const res = await fetch(`${baseUrl}/api/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
      }

      const json = await res.json();
      setApiResponse(json);
    } catch (err) {
      setApiError(err.message || "Failed to reach protected backend API");
    } finally {
      setApiLoading(false);
    }
  };

  // Filtered Assets
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "All" || asset.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || asset.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const user = session?.user;

  return (
    <div className="dashboard-wrapper">
      {/* Top Navigation Bar */}
      <header className="main-navbar">
        <div className="navbar-brand">
          <div className="brand-icon">📦</div>
          <div>
            <h1 className="brand-title">AssetHub</h1>
            <span className="brand-sub">Enterprise Asset Management</span>
          </div>
        </div>

        <div className="navbar-actions">
          <div className="user-profile-badge">
            {user?.image ? (
              <img src={user.image} alt="" className="user-nav-avatar" />
            ) : (
              <div className="user-nav-avatar-fallback">
                {user?.name ? user.name[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : "U"}
              </div>
            )}
            <div className="user-info-text">
              <span className="user-nav-name">{user?.name || "Authenticated User"}</span>
              <span className="user-nav-email">{user?.email}</span>
            </div>
          </div>

          <button
            type="button"
            className="logout-btn"
            disabled={signOutMutation.isPending}
            onClick={handleSignOut}
          >
            {signOutMutation.isPending ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="dashboard-content">
        {/* Metric Cards Row */}
        <section className="metrics-row">
          <div className="metric-card">
            <span className="metric-label">Total Registered Assets</span>
            <div className="metric-value">{assets.length}</div>
            <span className="metric-trend text-positive">↑ Active Inventory</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Operational / Assigned</span>
            <div className="metric-value">
              {assets.filter((a) => a.status === "Active").length}
            </div>
            <span className="metric-trend text-neutral">Currently in use</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">In Maintenance / Audit</span>
            <div className="metric-value text-warning">
              {assets.filter((a) => a.status === "Maintenance").length}
            </div>
            <span className="metric-trend text-warning">Requires attention</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Available in Stock</span>
            <div className="metric-value">
              {assets.filter((a) => a.status === "In Stock").length}
            </div>
            <span className="metric-trend text-positive">Ready for deployment</span>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="tabs-header">
          <button
            type="button"
            className={`tab-btn ${activeTab === "assets" ? "active" : ""}`}
            onClick={() => setActiveTab("assets")}
          >
            📋 Asset Inventory ({assets.length})
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === "session" ? "active" : ""}`}
            onClick={() => setActiveTab("session")}
          >
            🔐 Auth Session & Backend API
          </button>
        </div>

        {/* Tab 1: Asset Inventory */}
        {activeTab === "assets" && (
          <section className="inventory-section">
            <div className="inventory-toolbar">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search assets by tag, name, or assignee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="dropdown-filter"
                >
                  <option value="All">All Categories</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Servers">Servers</option>
                  <option value="Networking">Networking</option>
                  <option value="Monitors">Monitors</option>
                  <option value="Media">Media</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="dropdown-filter"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="In Stock">In Stock</option>
                </select>

                <button
                  type="button"
                  className="add-btn"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  + Add Asset
                </button>
              </div>
            </div>

            {/* Assets Table */}
            <div className="table-responsive">
              <table className="assets-table">
                <thead>
                  <tr>
                    <th>Tag ID</th>
                    <th>Asset Name</th>
                    <th>Category</th>
                    <th>Assigned To</th>
                    <th>Est. Value</th>
                    <th>Purchase Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-state">
                        No assets found matching your search and filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAssets.map((asset) => (
                      <tr key={asset.id}>
                        <td>
                          <code className="asset-tag">{asset.id}</code>
                        </td>
                        <td className="asset-name-cell">{asset.name}</td>
                        <td>{asset.category}</td>
                        <td>{asset.assignedTo}</td>
                        <td className="asset-value-cell">{asset.value}</td>
                        <td>{asset.purchased}</td>
                        <td>
                          <span
                            className={`status-pill ${
                              asset.status === "Active"
                                ? "pill-active"
                                : asset.status === "Maintenance"
                                ? "pill-maintenance"
                                : "pill-stock"
                            }`}
                          >
                            {asset.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Tab 2: Session and API Verification */}
        {activeTab === "session" && (
          <section className="session-section">
            <div className="dashboard-grid">
              {/* Profile Details */}
              <div className="dashboard-card">
                <h3>Current Better Auth Session</h3>
                <p style={{ color: "var(--text)", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
                  Managed securely with httpOnly cookies, auto-refreshed via TanStack Query.
                </p>

                <div className="profile-info-list">
                  <div className="info-row">
                    <span className="info-label">User ID</span>
                    <code className="inline-code">{user?.id}</code>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Name</span>
                    <span>{user?.name || "Not provided"}</span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Email</span>
                    <span>{user?.email}</span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Email Verification</span>
                    <span className={user?.emailVerified ? "badge-success" : "badge-warning"}>
                      {user?.emailVerified ? "Verified" : "Unverified"}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Session ID</span>
                    <code className="inline-code">{session?.session?.id || "Active Cookie Session"}</code>
                  </div>
                </div>
              </div>

              {/* Protected API Test */}
              <div className="dashboard-card">
                <h3>Backend Verification (<code>GET /api/me</code>)</h3>
                <p style={{ color: "var(--text)", fontSize: "0.9rem", marginBottom: "1rem" }}>
                  Verify that the Express <code>requireAuth</code> middleware validates this active session via credentials:
                </p>

                <button
                  type="button"
                  className="submit-btn"
                  style={{ width: "auto" }}
                  disabled={apiLoading}
                  onClick={handleTestBackendApi}
                >
                  {apiLoading ? "Verifying..." : "Call /api/me with Credentials"}
                </button>

                {apiError && (
                  <div className="auth-error-banner" style={{ marginTop: "1rem" }}>
                    {apiError}
                  </div>
                )}

                {apiResponse && (
                  <div style={{ marginTop: "1rem" }}>
                    <p style={{ color: "var(--text)", fontSize: "0.85rem", marginBottom: "0.4rem" }}>
                      Backend Response:
                    </p>
                    <pre className="json-box">{JSON.stringify(apiResponse, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Add Asset Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Register New Asset</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsAddModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAsset} className="auth-form" style={{ marginTop: "1rem" }}>
              <div className="form-group">
                <label>Asset Model / Name</label>
                <input
                  type="text"
                  placeholder="e.g. MacBook Pro 14 M3"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={newAsset.category}
                  onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
                  className="dropdown-filter"
                  style={{ width: "100%" }}
                >
                  <option value="Hardware">Hardware (Laptops/PCs)</option>
                  <option value="Servers">Servers & Cloud</option>
                  <option value="Networking">Networking</option>
                  <option value="Monitors">Monitors</option>
                  <option value="Media">Media & AV</option>
                </select>
              </div>

              <div className="form-group">
                <label>Assigned To / Department</label>
                <input
                  type="text"
                  placeholder="e.g. Alex (Engineering) or Storage"
                  value={newAsset.assignedTo}
                  onChange={(e) => setNewAsset({ ...newAsset, assignedTo: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Estimated Value</label>
                <input
                  type="text"
                  placeholder="e.g. 1999"
                  value={newAsset.value}
                  onChange={(e) => setNewAsset({ ...newAsset, value: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Current Status</label>
                <select
                  value={newAsset.status}
                  onChange={(e) => setNewAsset({ ...newAsset, status: e.target.value })}
                  className="dropdown-filter"
                  style={{ width: "100%" }}
                >
                  <option value="Active">Active (In Use)</option>
                  <option value="In Stock">In Stock (Available)</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                <button type="submit" className="submit-btn">
                  Add Asset
                </button>
                <button
                  type="button"
                  className="logout-btn"
                  style={{ width: "auto" }}
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
