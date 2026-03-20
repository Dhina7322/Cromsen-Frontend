import { Package, ShoppingCart, Users, Layers, IndianRupee, TrendingUp, RotateCcw } from "lucide-react";

export default function DashboardOverview({ stats }) {
  return (
    <div className="admin-body-container">
      <div className="kpi-grid">
        <KPI label="Total Revenue" value={`₹${stats.totalRevenue || 0}`} icon={<IndianRupee />} color="#10b981" />
        <KPI label="Total Profit" value={`₹${stats.totalProfit?.toFixed(0) || 0}`} icon={<TrendingUp />} color="#3b82f6" />
        <KPI label="Refund Amount" value={`₹${stats.totalRefunds || 0}`} icon={<RotateCcw />} color="#ef4444" />
        <KPI label="Active Orders" value={stats.orders} icon={<ShoppingCart />} color="#f47121" />
        <KPI label="Registered Users" value={stats.users} icon={<Users />} color="#8b5cf6" />
        <KPI label="Total Products" value={stats.products} icon={<Package />} color="#6366f1" />
      </div>


      <div className="dash-grid-2">
        <div className="dash-card">
          <div className="dash-card-head"><h3 className="dash-card-title">Recent Orders</h3></div>
          <div className="tbl-wrap" style={{ border: 'none' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map(o => (
                  <tr key={o._id}>
                    <td className="order-id">#{o._id.slice(-6)}</td>
                    <td className="cust-name">{o.user?.name || "Guest"}</td>
                    <td className="amt">₹{o.totalAmount || 0}</td>
                    <td><span className={`status-tag s-${o.status?.toLowerCase()}`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-head"><h3 className="dash-card-title">Stock Alerts</h3></div>
          <div className="tbl-wrap" style={{ border: 'none' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.lowStock.map(p => (
                  <tr key={p._id}>
                    <td className="prod-name">{p.name}</td>
                    <td>{p.stock}</td>
                    <td><span className={`stock-badge ${p.stock === 0 ? 'stock-oos' : 'stock-low'}`}>{p.stock === 0 ? 'OOS' : 'Low'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, icon, color }) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon" style={{ background: `${color}15`, color }}>{icon}</div>
      <div>
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
      </div>
    </div>
  );
}
