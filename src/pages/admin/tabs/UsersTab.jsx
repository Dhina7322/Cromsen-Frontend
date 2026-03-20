import React, { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert, 
  Mail, 
  Phone,
  UserCheck,
  UserX
} from "lucide-react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";

const API = "/api";

export default function UsersTab() {
  const { showToast } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/users`, {
        params: { limit: 100 } // Fetch more for local filtering/display
      });
      setUsers(res.data.users || []);
      setTotalUsers(res.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      await axios.put(`${API}/users/${user._id}/toggle-status`);
      showToast("success", `User ${user.isBlocked ? 'unblocked' : 'blocked'}`);
      fetchUsers();
    } catch (err) {
      showToast("error", "Failed to update user status");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure? This will delete all user data.")) return;
    try {
      await axios.delete(`${API}/users/${id}`);
      showToast("success", "User deleted");
      fetchUsers();
    } catch (err) {
      showToast("error", "Failed to delete user");
    }
  };

  return (
    <div className="section-gap">
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="searchbox">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search by name, email or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="p-role p-role--sub">{totalUsers} Total Users</div>
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact Info</th>
              <th>Joined Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(u => 
              (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
              (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
              (u.phone || "").toLowerCase().includes(searchTerm.toLowerCase())
            ).map(u => (
              <tr key={u._id}>
                <td>
                  <div className="cust-cell">
                    <div className="sb-avatar">{u.name ? u.name[0] : 'U'}</div>
                    <div style={{ marginLeft: '10px' }}>
                      <div className="cust-name">{u.name || 'Anonymous User'}</div>
                      <div className={`cust-role role-${u.role || 'customer'}`} style={{ fontSize: '10px', marginTop: '4px' }}>
                        {u.role === 'dealer' ? 'Dealer' : 'Retailer'}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-gray-600"><Mail size={12}/> {u.email}</div>
                    {u.phone && <div className="flex items-center gap-2 text-gray-600"><Phone size={12}/> {u.phone}</div>}
                  </div>
                </td>
                <td className="date-cell">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                   <span className={`status-tag ${u.isBlocked ? 's-cancelled' : 's-delivered'}`}>
                     <i></i> {u.isBlocked ? 'Blocked' : 'Active'}
                   </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                   <div className="row-acts">
                     <button className={`icon-btn ${u.isBlocked ? 'text-green-600' : 'text-orange-600'}`} onClick={() => toggleUserStatus(u)} title={u.isBlocked ? "Unblock" : "Block"}>
                       {u.isBlocked ? <UserCheck size={14}/> : <UserX size={14}/>}
                     </button>
                     <button className="icon-btn danger" onClick={() => deleteUser(u._id)} title="Delete Account"><Trash2 size={14}/></button>
                   </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan="5" className="empty-row">No customers found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
