import React, { useState, useEffect } from 'react';
import { LogOut, Plus, FileText, Eye } from 'lucide-react';
import ReportForm from './ReportForm';
import ReportDetailModal from './ReportDetailModal';
import LanguageToggle from './LanguageToggle';
import DateDisplay from './DateDisplay';
import { useLanguage } from '../contexts/LanguageContext';

function WoredaDashboard({ user, token, onLogout }) {
  const [showForm, setShowForm] = useState(false);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleReportSubmit = () => {
    setShowForm(false);
    fetchReports();
  };

  return (
    <div>
      <div className="navbar">
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
          <h1>{t('woreda_reporting_system')}</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <LanguageToggle />
          <span style={{ color: '#64748b' }}>{user.woredaName}</span>
          <button onClick={onLogout} className="btn btn-secondary">
            <LogOut size={16} style={{ marginRight: '8px', display: 'inline' }} />
            {t('logout')}
          </button>
        </div>
      </div>

      <div className="container">
        {!showForm ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: 'white' }}>{t('my_reports')}</h2>
              <button onClick={() => setShowForm(true)} className="btn btn-primary">
                <Plus size={16} style={{ marginRight: '8px', display: 'inline' }} />
                {t('new_report')}
              </button>
            </div>

            <div className="card">
              {reports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                  <p>{t('no_reports_yet')}</p>
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>{t('date')}</th>
                      <th>{t('topic')}</th>
                      <th>{t('location')}</th>
                      <th>{t('participants')}</th>
                      <th>{t('submitted')}</th>
                      <th>{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(report => (
                      <tr key={report.id}>
                        <td><DateDisplay date={report.discussionDate} /></td>
                        <td>{report.mainTopic}</td>
                        <td>{report.location}</td>
                        <td>{report.totalParticipants}</td>
                        <td><DateDisplay date={report.submittedAt} format="long" /></td>
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
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          <ReportForm 
            user={user} 
            token={token} 
            onSubmit={handleReportSubmit}
            onCancel={() => setShowForm(false)}
          />
        )}
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

export default WoredaDashboard;
