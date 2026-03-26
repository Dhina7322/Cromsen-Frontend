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
  UserX,
  Calendar,
  User as UserIcon,
  MapPin,
  FileText,
  Eye,
  X,
  Building
} from "lucide-react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import { getImageUrl } from "../../../utils/imageUtils";

const API = import.meta.env.VITE_API_URL || "/api";

export default function UsersTab() {
  const { showToast } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  const openUserDetail = (user) => {
    setSelectedUser(user);
    setShowModal(true);
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
                    {u.avatar ? (
                      <div className="relative sb-avatar overflow-hidden">
                        <img src={getImageUrl(u.avatar)} className="w-full h-full object-cover absolute inset-0 text-transparent" alt="" onError={(e) => { e.target.style.display = 'none'; if(e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex'; }} />
                        <div className="w-full h-full hidden items-center justify-center absolute inset-0 bg-gray-100 font-bold text-gray-500">
                          {u.name ? u.name[0] : 'U'}
                        </div>
                      </div>
                    ) : (
                      <div className="sb-avatar">{u.name ? u.name[0] : 'U'}</div>
                    )}
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
                     <button className="icon-btn text-blue-600" onClick={() => openUserDetail(u)} title="View Detail"><Eye size={14}/></button>
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

      {showModal && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Customer Details</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 p-1.5 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                {selectedUser.avatar ? (
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden ring-2 ring-gray-50 shadow-sm bg-gray-50">
                    <img src={getImageUrl(selectedUser.avatar)} className="w-full h-full object-cover absolute inset-0 z-10 text-transparent" alt="" onError={(e) => { e.target.style.display = 'none'; if(e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex'; }} />
                    <div className="w-full h-full hidden items-center justify-center absolute inset-0 text-xl font-bold text-blue-600 bg-blue-50">
                      {selectedUser.name?.[0]}
                    </div>
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold border border-blue-100">
                    {selectedUser.name?.[0]}
                  </div>
                )}
                <div>
                  <h4 className="text-base font-bold text-gray-800 leading-tight">{selectedUser.name}</h4>
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mt-0.5">{selectedUser.role} Account</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-center gap-3">
                  <div className="bg-white p-1.5 rounded-lg text-gray-400 shadow-sm"><Mail size={14} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                    <p className="text-[11px] font-semibold text-gray-700 truncate">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-center gap-3">
                  <div className="bg-white p-1.5 rounded-lg text-gray-400 shadow-sm"><Phone size={14} /></div>
                  <div className="flex-1">
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</p>
                    <p className="text-[11px] font-semibold text-gray-700">{selectedUser.phone || "Not provided"}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-center gap-3">
                  <div className="bg-white p-1.5 rounded-lg text-gray-400 shadow-sm"><Building size={14} /></div>
                  <div className="flex-1">
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Company</p>
                    <p className="text-[11px] font-semibold text-gray-700 truncate">{selectedUser.company || "Not provided"}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-center gap-3">
                  <div className="bg-white p-1.5 rounded-lg text-gray-400 shadow-sm"><Calendar size={14} /></div>
                  <div className="flex-1">
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Joined</p>
                    <p className="text-[11px] font-semibold text-gray-700">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {selectedUser.role === 'dealer' && (
                  <>
                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-center gap-3 md:col-span-2">
                      <div className="bg-white p-1.5 rounded-lg text-gray-400 shadow-sm"><MapPin size={14} /></div>
                      <div className="flex-1">
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Company Address</p>
                        <p className="text-[11px] font-semibold text-gray-700">{selectedUser.companyAddress || "Not provided"}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-center gap-3">
                      <div className="bg-white p-1.5 rounded-lg text-gray-400 shadow-sm"><FileText size={14} /></div>
                      <div className="flex-1">
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">GST Number</p>
                        <p className="text-[11px] font-semibold text-gray-700">{selectedUser.gstNumber || "Not provided"}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-center gap-3">
                      <div className="bg-white p-1.5 rounded-lg text-gray-400 shadow-sm"><FileText size={14} /></div>
                      <div className="flex-1">
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">PAN Number</p>
                        <p className="text-[11px] font-semibold text-gray-700">{selectedUser.panNumber || "Not provided"}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-white text-gray-600 font-bold rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 text-sm shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

