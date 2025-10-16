// src/components/Overview.jsx
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Flag, CheckCircle, AlertCircle } from 'lucide-react';
import { getOverviewMetrics } from '../services/api';
import './Overview.css';

function Overview() {
  const [period, setPeriod] = useState('daily');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getOverviewMetrics(period);
      setData(result.data);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="overview-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overview-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  // Prepare pie chart data
  const accuracyPieData = data?.pieChartData?.accuracyPie?.datasets?.[0]?.data || [0, 0];
  const flagPieData = data?.pieChartData?.flagPie?.datasets?.[0]?.data || [0, 0];

  const accuracyChartData = [
    { name: 'Unmodified', value: accuracyPieData[0] },
    { name: 'Modified', value: accuracyPieData[1] }
  ];

  const flagChartData = [
    { name: '✅', value: flagPieData[0] },
    { name: 'Flagged', value: flagPieData[1] }
  ];

  // Prepare line chart data
  const lineChartData = data?.lineChartData?.labels?.map((label, index) => ({
    date: label,
    accuracy: data.lineChartData.datasets[0]?.data[index] || 0,
    flag: data.lineChartData.datasets[1]?.data[index] || 0
  })) || [];

  const COLORS = ['#10b981', '#3b82f6', '#ef4444'];

  return (
    <div className="overview-container">
      {/* Header */}
      <div className="overview-header">
        <div className="header-left">
          <h1>Overview</h1>
          <p className="subtitle">Dashboard metrics and analytics</p>
        </div>
        
        <div className="period-selector">
          <button 
            className={period === 'daily' ? 'active' : ''} 
            onClick={() => setPeriod('daily')}
          >
            Daily
          </button>
          <button 
            className={period === 'monthly' ? 'active' : ''} 
            onClick={() => setPeriod('monthly')}
          >
            Monthly
          </button>
          <button 
            className={period === 'yearly' ? 'active' : ''} 
            onClick={() => setPeriod('yearly')}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon accuracy">
            <CheckCircle size={24} />
          </div>
          <div className="metric-content">
            <h3>Accuracy Rate</h3>
            <div className="metric-value">
              {data?.accuracyRate?.rate?.toFixed(2)}%
            </div>
            <p className="metric-subtitle">
              {data?.accuracyRate?.send} / {data?.accuracyRate?.total} sent
            </p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon flag">
            <Flag size={24} />
          </div>
          <div className="metric-content">
            <h3>Flag Rate</h3>
            <div className="metric-value">
              {data?.flagRate?.rate?.toFixed(2)}%
            </div>
            <p className="metric-subtitle">
              {data?.flagRate?.flagged} / {data?.flagRate?.total} flagged
            </p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon performance">
            <TrendingUp size={24} />
          </div>
          <div className="metric-content">
            <h3>Total Performance</h3>
            <div className="metric-value">
              {data?.rawMetrics?.total_records || 0}
            </div>
            <p className="metric-subtitle">Total records</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon improvement">
            <AlertCircle size={24} />
          </div>
          <div className="metric-content">
            <h3>Unsolved Flags</h3>
            <div className="metric-value">
              {data?.flagRate?.flagged || 0}
            </div>
            <p className="metric-subtitle">Needs attention</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-container">
        {/* Pie Charts */}
        <div className="chart-section">
          <h2>Distribution Analysis</h2>
          <div className="pie-charts">
            <div className="chart-wrapper">
              <h3>Accuracy Breakdown</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={accuracyChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {accuracyChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-wrapper">
              <h3>Flag Status</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={flagChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {flagChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={[COLORS[0], COLORS[2]][index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Line Chart */}
        <div className="chart-section">
          <h2>Trend Analysis</h2>
          <div className="line-chart">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#3b82f6" 
                  name="Accuracy Rate (%)"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="flag" 
                  stroke="#ef4444" 
                  name="Flag Rate (%)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Overview;
