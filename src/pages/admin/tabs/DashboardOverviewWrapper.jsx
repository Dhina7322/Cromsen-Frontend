import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardOverview from "./DashboardOverview";
import { useOutletContext } from "react-router-dom";

export default function DashboardOverviewWrapper() {
  const { showToast } = useOutletContext();
  const [stats, setStats] = useState({ products: 0, categories: 0, orders: 0, users: 0, totalRevenue: 0, totalProfit: 0, totalRefunds: 0, recentOrders: [], lowStock: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const API = import.meta.env.VITE_API_URL || "/api";
        const res = await axios.get(`${API}/admin/stats`);
        setStats({
          products: res.data.totalProducts,
          categories: res.data.totalCategories,
          orders: res.data.totalOrders,
          users: res.data.totalUsers,
          totalRevenue: res.data.totalRevenue,
          totalProfit: res.data.totalProfit,
          totalRefunds: res.data.totalRefunds,
          recentOrders: res.data.recentOrders || [],
          lowStock: res.data.lowStock || []
        });

      } catch (err) {
        showToast("error", "Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [showToast]);

  if (loading) return null; // Parent handles spinner

  return <DashboardOverview stats={stats} />;
}
