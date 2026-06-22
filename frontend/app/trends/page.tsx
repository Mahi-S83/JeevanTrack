"use client";
import { useState, useEffect } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from "recharts";
import { Loader2, TrendingUp, Activity, Droplet, Sun, Heart, Flame, ArrowUp, ArrowDown, Minus, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

type TrendData = {
  date: string;
  test_name: string;
  value: number;
  unit: string;
  normal_range: string;
};

type TrendMetric = {
  key: string;
  label: string;
  icon: any;
  color: string;
  gradientFrom: string;
  gradientTo: string;
};

const metrics: TrendMetric[] = [
  { key: "hemoglobin", label: "Hemoglobin", icon: Droplet, color: "#EF4444", gradientFrom: "#EF4444", gradientTo: "#FCA5A5" },
  { key: "iron", label: "Iron", icon: Activity, color: "#F97316", gradientFrom: "#F97316", gradientTo: "#FDBA74" },
  { key: "vitamin", label: "Vitamin D", icon: Sun, color: "#EAB308", gradientFrom: "#EAB308", gradientTo: "#FDE047" },
  { key: "cholesterol", label: "Cholesterol", icon: Heart, color: "#8B5CF6", gradientFrom: "#8B5CF6", gradientTo: "#C4B5FD" },
  { key: "sodium", label: "Sodium", icon: Droplet, color: "#06B6D4", gradientFrom: "#06B6D4", gradientTo: "#67E8F9" },
  { key: "sugar", label: "Blood Sugar", icon: Flame, color: "#DC2626", gradientFrom: "#DC2626", gradientTo: "#FCA5A5" },
];

export default function TrendsPage() {
  const [selectedMetric, setSelectedMetric] = useState("hemoglobin");
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTrends(selectedMetric);
  }, [selectedMetric]);

  const fetchTrends = async (metric: string) => {
    try {
      setLoading(true);
      setError("");

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        setError("Not authenticated. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await fetch(`https://jeevantrack-backend.onrender.com/trends/${metric}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      
      // Handle different response formats
      let trendData = [];
      if (result.data_points && Array.isArray(result.data_points)) {
        trendData = result.data_points;
      } else if (Array.isArray(result)) {
        trendData = result;
      } else {
        trendData = [];
      }

      setData(trendData);
    } catch (err: any) {
      console.error('Failed to fetch trends:', err);
      setError(err.message || "Failed to load trend data.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const getMetricInfo = (key: string) => {
    return metrics.find(m => m.key === key) || metrics[0];
  };

  const currentMetric = getMetricInfo(selectedMetric);

  // Format data for Recharts
  const chartData = data.map((item) => ({
    date: item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
    value: item.value || 0,
    unit: item.unit || '',
    normalRange: item.normal_range || '',
    fullDate: item.date || '',
  }));

  // Calculate stats
  const values = data.map(d => d.value).filter(v => v !== null && v !== undefined);
  const latestValue = values.length > 0 ? values[values.length - 1] : null;
  const previousValue = values.length > 1 ? values[values.length - 2] : null;
  const averageValue = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
  const maxValue = values.length > 0 ? Math.max(...values) : null;
  const minValue = values.length > 0 ? Math.min(...values) : null;

  let trend = 'neutral';
  let trendIcon = Minus;
  let trendColor = '#5a7a80';
  if (latestValue !== null && previousValue !== null) {
    if (latestValue > previousValue) {
      trend = 'up';
      trendIcon = ArrowUp;
      trendColor = '#22C55E';
    } else if (latestValue < previousValue) {
      trend = 'down';
      trendIcon = ArrowDown;
      trendColor = '#EF4444';
    }
  }

  const TrendIcon = trendIcon;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-10 h-10 text-[#F97316] animate-spin" />
        <p className="text-[#5a7a80]">Loading {currentMetric.label} trends...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#1a2e32] flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-[#F97316]" />
            Health Trends
          </h1>
          <p className="text-sm text-[#5a7a80] mt-1">
            Track your lab values over time
          </p>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 flex-wrap">
        {metrics.map((metric) => {
          const isActive = selectedMetric === metric.key;
          const Icon = metric.icon;
          return (
            <button
              key={metric.key}
              onClick={function() { setSelectedMetric(metric.key); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'bg-[#F97316] text-white shadow-md'
                  : 'bg-white border border-gray-200 text-[#5a7a80] hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} style={{ color: isActive ? 'white' : metric.color }} />
              {metric.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-2xl mb-6 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-[#5a7a80] font-medium">Latest</p>
          <p className="text-2xl font-semibold text-[#1a2e32]">
            {latestValue !== null ? latestValue : '—'}
          </p>
          <p className="text-xs text-[#5a7a80]">{data.length > 0 ? data[data.length - 1]?.unit || '' : ''}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-[#5a7a80] font-medium">Average</p>
          <p className="text-2xl font-semibold text-[#1a2e32]">
            {averageValue !== null ? averageValue.toFixed(1) : '—'}
          </p>
          <p className="text-xs text-[#5a7a80]">{data.length > 0 ? data[0]?.unit || '' : ''}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-[#5a7a80] font-medium">Range</p>
          <p className="text-2xl font-semibold text-[#1a2e32]">
            {minValue !== null && maxValue !== null ? `${minValue} – ${maxValue}` : '—'}
          </p>
          <p className="text-xs text-[#5a7a80]">{data.length > 0 ? data[0]?.unit || '' : ''}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-[#5a7a80] font-medium">Trend</p>
          <div className="flex items-center gap-2">
            <TrendIcon className={`w-5 h-5`} style={{ color: trendColor }} />
            <p className="text-2xl font-semibold text-[#1a2e32]">
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'}
            </p>
          </div>
          <p className="text-xs text-[#5a7a80]">{data.length} data points</p>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1a2e32]">
              {currentMetric.label} Trend
            </h3>
            <span className="text-xs text-[#5a7a80]">
              {data.length} records
            </span>
          </div>
          <div className="w-full h-100 min-h-75">
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.3}/>
          <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis 
        dataKey="date" 
        tick={{ fontSize: 11, fill: '#5a7a80' }}
        axisLine={{ stroke: '#e0e0e0' }}
        tickLine={false}
      />
      <YAxis 
        tick={{ fontSize: 11, fill: '#5a7a80' }}
        axisLine={{ stroke: '#e0e0e0' }}
        tickLine={false}
        label={{ 
          value: data.length > 0 ? data[0]?.unit || '' : '', 
          angle: -90, 
          position: 'insideLeft',
          style: { fill: '#5a7a80', fontSize: 11 }
        }}
      />
      <Tooltip 
        contentStyle={{ 
          borderRadius: '12px', 
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          padding: '12px 16px'
        }}
        formatter={(value: any) => [`${value} ${data.length > 0 ? data[0]?.unit || '' : ''}`, currentMetric.label]}
        labelFormatter={(label) => `Date: ${label}`}
      />
      <Area 
        type="monotone" 
        dataKey="value" 
        stroke={currentMetric.color} 
        strokeWidth={3}
        fill="url(#colorValue)" 
        dot={{ r: 4, strokeWidth: 2, fill: 'white', stroke: currentMetric.color }}
        activeDot={{ r: 7, strokeWidth: 2, fill: currentMetric.color }}
      />
    </AreaChart>
  </ResponsiveContainer>
</div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <TrendingUp className="w-12 h-12 text-[#5a7a80]/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#1a2e32]">No trend data available</h3>
          <p className="text-[#5a7a80] mt-2">
            Upload reports with lab values to see trends for {currentMetric.label}.
          </p>
        </div>
      )}
    </div>
  );
}