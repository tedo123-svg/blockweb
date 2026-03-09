import React, { useState, useEffect } from 'react';
import { LogOut, Download, Filter, BarChart3, Users, MessageSquare, UserCog, FileText, X, Eye, Menu } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import UserManagement from './UserManagement';
import ReportDetailModal from './ReportDetailModal';
import LanguageToggle from './LanguageToggle';
import DateDisplay from './DateDisplay';
import { useLanguage } from '../contexts/LanguageContext';
import { API_URL } from '../config/api';

function SubCityDashboard({ user, token, onLogout }) {
  const [activeTab, setActiveTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', topic: '', woreda: '', subCity: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    fetchReports();
    fetchStatistics();
  }, []);

  const fetchReports = async () => {
    try {
      const params = new URLSearchParams(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const response = await fetch(`${API_URL}/api/reports?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/statistics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    fetchReports();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({ startDate: '', endDate: '', topic: '', woreda: '', subCity: '' });
    setTimeout(() => fetchReports(), 100);
  };

  const loadEthiopicFont = async () => {
    // Try to fetch a font that supports Ethiopic characters. This is required for Amharic.
    // We use a Google Fonts CDN URL for Noto Sans Ethiopic.
    const fontUrl = 'https://fonts.gstatic.com/s/notosansethiopic/v12/xn7ZkdCkF_kSgXb2i9K3eV2ZcQ.ttf';

    try {
      const res = await fetch(fontUrl);
      if (!res.ok) throw new Error('Font download failed');

      const arrayBuffer = await res.arrayBuffer();
      let binary = '';
      const bytes = new Uint8Array(arrayBuffer);
      const chunkSize = 0x8000;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
      }

      return btoa(binary);
    } catch (err) {
      console.warn('Unable to load Ethiopic font for PDF export:', err);
      return null;
    }
  };

  const exportToPDF = async () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const title = 'Woreda Discussion Reports';
    const generatedAt = `Generated: ${new Date().toLocaleDateString()}`;

    const fontBase64 = await loadEthiopicFont();
    if (fontBase64) {
      doc.addFileToVFS('NotoSansEthiopic.ttf', fontBase64);
      doc.addFont('NotoSansEthiopic.ttf', 'NotoSansEthiopic', 'normal');
      doc.setFont('NotoSansEthiopic');
    }

    doc.setFontSize(18);
    doc.text(title, 40, 40);
    doc.setFontSize(10);
    doc.text(generatedAt, 40, 58);

    const tableData = reports.map(r => ([
      r.woredaName,
      r.subCity || 'N/A',
      r.discussionDate,
      r.mainTopic,
      `${r.totalParticipants}`,
      `${r.maleParticipants}`,
      `${r.femaleParticipants}`,
      r.description || '-',
      r.positiveIdeas || '-',
      r.negativeIssues || '-',
      r.recommendations || '-'
    ]));

    doc.autoTable({
      head: [[
        'Woreda',
        'Sub-City',
        'Date',
        'Topic',
        'Total',
        'Male',
        'Female',
        'Description',
        'Positive Ideas',
        'Negative Issues',
        'Recommendations'
      ]],
      body: tableData,
      startY: 72,
      margin: { left: 40, right: 40 },
      styles: {
        fontSize: 8,
        cellPadding: 6,
        overflow: 'linebreak',
        cellWidth: 'wrap',
        halign: 'left'
      },
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      bodyStyles: { textColor: 30 },
      theme: 'grid',
      tableWidth: 'auto',
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 70 },
        2: { cellWidth: 55 },
        3: { cellWidth: 80 },
        4: { cellWidth: 40 },
        5: { cellWidth: 40 },
        6: { cellWidth: 40 },
        7: { cellWidth: 120 },
        8: { cellWidth: 120 },
        9: { cellWidth: 120 },
        10: { cellWidth: 120 }
      }
    });

    doc.save(`reports-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToExcel = () => {
    const exportData = reports.map(r => ({
      'Woreda': r.woredaName,
      'Sub-City': r.subCity || 'N/A',
      'Date': r.discussionDate,
      'Location': r.location,
      'Facilitator': r.facilitatorName,
      'Topic': r.mainTopic,
      'Total Participants': r.totalParticipants,
      'Male': r.maleParticipants,
      'Female': r.femaleParticipants,
      'Description': r.description,
      'Positive Ideas': r.positiveIdeas,
      'Negative Issues': r.negativeIssues,
      'Recommendations': r.recommendations
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reports');
    XLSX.writeFile(workbook, `reports-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const genderData = statistics ? [
    { name: 'Male', value: statistics.totalMale },
    { name: 'Female', value: statistics.totalFemale }
  ] : [];

  const topicData = statistics ? Object.entries(statistics.topicCounts).map(([name, value]) => ({ name, value })) : [];

  const COLORS = ['#1e40af', '#1e3a8a', '#3b82f6', '#60a5fa'];

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <div>
      <div className="navbar">
        <div className="navbar-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img 
              src="/logo.svg" 
              alt="Logo" 
              style={{ 
                height: '50px', 
                width: '50px', 
                objectFit: 'contain'
              }} 
            />
            <h1>{t('sub_city_dashboard')}</h1>
          </div>
        </div>

        <button
          className="navbar-toggle"
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          <Menu size={20} />
        </button>

        <div className={`navbar-items ${mobileMenuOpen ? 'open' : ''}`}>
          <LanguageToggle />
          <span className="navbar-user">{t('administrator')}</span>
          <button onClick={onLogout} className="btn btn-secondary">
            <LogOut size={16} style={{ marginRight: '8px', display: 'inline' }} />
            {t('logout')}
          </button>
        </div>
      </div>

      <div className="container">
        {/* Tab Navigation */}
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '8px', 
          marginBottom: '24px',
          display: 'flex',
          gap: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <button
            onClick={() => setActiveTab('reports')}
            style={{
              flex: 1,
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              background: activeTab === 'reports' ? 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)' : 'transparent',
              color: activeTab === 'reports' ? 'white' : '#64748b',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <FileText size={18} />
            {t('reports_analytics')}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              flex: 1,
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              background: activeTab === 'users' ? 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)' : 'transparent',
              color: activeTab === 'users' ? 'white' : '#64748b',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <UserCog size={18} />
            {t('user_management')}
          </button>
        </div>

        {activeTab === 'reports' && (
          <>
            {statistics && (
              <div className="grid grid-2" style={{ marginBottom: '24px' }}>
                <div className="stat-card">
                  <MessageSquare size={32} style={{ margin: '0 auto 12px' }} />
                  <h3>{statistics.totalDiscussions}</h3>
                  <p>{t('total_discussions')}</p>
                </div>
                <div className="stat-card">
                  <Users size={32} style={{ margin: '0 auto 12px' }} />
                  <h3>{statistics.totalParticipants}</h3>
                  <p>{t('total_participants')}</p>
                </div>
                <div className="stat-card">
                  <BarChart3 size={32} style={{ margin: '0 auto 12px' }} />
                  <h3>{statistics.totalMale}</h3>
                  <p>{t('male_participants')}</p>
                </div>
                <div className="stat-card">
                  <BarChart3 size={32} style={{ margin: '0 auto 12px' }} />
                  <h3>{statistics.totalFemale}</h3>
                  <p>{t('female_participants')}</p>
                </div>
              </div>
            )}

            {statistics && (
              <div className="grid grid-2" style={{ marginBottom: '24px' }}>
                <div className="card">
                  <h3 style={{ marginBottom: '16px', color: '#334155' }}>{t('gender_distribution')}</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie 
                        data={genderData} 
                        cx="50%" 
                        cy="50%" 
                        labelLine={false} 
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} 
                        outerRadius={80} 
                        fill="#8884d8" 
                        dataKey="value"
                      >
                        {genderData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="card">
                  <h3 style={{ marginBottom: '16px', color: '#334155' }}>{t('topics_discussed')}</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={topicData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#1e40af" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ color: '#334155', margin: 0 }}>{t('all_reports')}</h2>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => setShowFilters(!showFilters)} 
                    className="btn btn-secondary"
                    style={{ position: 'relative' }}
                  >
                    <Filter size={16} style={{ marginRight: '8px', display: 'inline' }} />
                    {t('filters')}
                    {activeFiltersCount > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: '#ef4444',
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                      }}>
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>
                  <button onClick={exportToPDF} className="btn btn-secondary">
                    <Download size={16} style={{ marginRight: '8px', display: 'inline' }} />
                    PDF
                  </button>
                  <button onClick={exportToExcel} className="btn btn-primary">
                    <Download size={16} style={{ marginRight: '8px', display: 'inline' }} />
                    Excel
                  </button>
                </div>
              </div>

              {showFilters && (
                <div style={{ 
                  background: '#f8fafc', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  marginBottom: '20px',
                  border: '2px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ color: '#334155', margin: 0 }}>{t('filters')}</h3>
                    <button onClick={() => setShowFilters(false)} className="btn btn-secondary" style={{ padding: '4px 8px' }}>
                      <X size={16} />
                    </button>
                  </div>
                  <div className="grid grid-2">
                    <div className="form-group">
                      <label>{t('start_date')}</label>
                      <input 
                        type="date" 
                        name="startDate" 
                        value={filters.startDate} 
                        onChange={handleFilterChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('end_date')}</label>
                      <input 
                        type="date" 
                        name="endDate" 
                        value={filters.endDate} 
                        onChange={handleFilterChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('topic')}</label>
                      <input 
                        type="text" 
                        name="topic" 
                        value={filters.topic} 
                        onChange={handleFilterChange}
                        placeholder={t('search_topic')}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('woreda_name')}</label>
                      <input 
                        type="text" 
                        name="woreda" 
                        value={filters.woreda} 
                        onChange={handleFilterChange}
                        placeholder={t('search_woreda')}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('sub_city')}</label>
                      <input 
                        type="text" 
                        name="subCity" 
                        value={filters.subCity} 
                        onChange={handleFilterChange}
                        placeholder={t('search_subcity')}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                    <button onClick={applyFilters} className="btn btn-primary">
                      {t('apply_filters')}
                    </button>
                    <button onClick={clearFilters} className="btn btn-secondary">
                      {t('clear_all')}
                    </button>
                  </div>
                </div>
              )}

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>{t('woreda_name')}</th>
                      <th>{t('sub_city')}</th>
                      <th>{t('date')}</th>
                      <th>{t('topic')}</th>
                      <th>{t('location')}</th>
                      <th>{t('participants')}</th>
                      <th>{t('male')}</th>
                      <th>{t('female')}</th>
                      <th>{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                          {t('no_reports_found')}
                        </td>
                      </tr>
                    ) : (
                      reports.map(report => (
                        <tr key={report.id}>
                          <td>{report.woredaName}</td>
                          <td>{report.subCity || 'N/A'}</td>
                          <td><DateDisplay date={report.discussionDate} /></td>
                          <td>{report.mainTopic}</td>
                          <td>{report.location}</td>
                          <td>{report.totalParticipants}</td>
                          <td>{report.maleParticipants}</td>
                          <td>{report.femaleParticipants}</td>
                          <td>
                            <button
                              onClick={() => setSelectedReport(report)}
                              className="btn btn-primary"
                              style={{ padding: '6px 12px', fontSize: '13px' }}
                            >
                              <Eye size={14} style={{ marginRight: '4px', display: 'inline' }} />
                              {t('view')}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && <UserManagement token={token} />}
      </div>

      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}

export default SubCityDashboard;
