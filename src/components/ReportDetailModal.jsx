import React from 'react';
import { X, Calendar, MapPin, User, Users, FileText, Lightbulb, AlertCircle, CheckSquare, Paperclip } from 'lucide-react';
import { API_URL } from '../config/api';

function ReportDetailModal({ report, onClose }) {
  if (!report) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
        <div style={{
          position: 'sticky',
          top: 0,
          background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
          color: 'white',
          padding: '24px',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'start'
        }}>
          <div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>{report.mainTopic}</h2>
            <p style={{ margin: 0, opacity: 0.9 }}>{report.woredaName} - {report.subCity || 'N/A'}</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '6px',
              padding: '8px',
              cursor: 'pointer',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Basic Information */}
          <div style={{
            background: '#f8fafc',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <h3 style={{ color: '#334155', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} color="#1e40af" />
              Basic Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>
                  <Calendar size={16} />
                  Date
                </div>
                <div style={{ color: '#334155', fontWeight: '500' }}>{report.discussionDate}</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>
                  <MapPin size={16} />
                  Location
                </div>
                <div style={{ color: '#334155', fontWeight: '500' }}>{report.location}</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>
                  <User size={16} />
                  Facilitator
                </div>
                <div style={{ color: '#334155', fontWeight: '500' }}>{report.facilitatorName}</div>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div style={{
            background: '#f0fdf4',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <h3 style={{ color: '#334155', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="#22c55e" />
              Participants
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#22c55e' }}>{report.totalParticipants}</div>
                <div style={{ color: '#64748b', fontSize: '14px' }}>Total</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>{report.maleParticipants}</div>
                <div style={{ color: '#64748b', fontSize: '14px' }}>Male</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ec4899' }}>{report.femaleParticipants}</div>
                <div style={{ color: '#64748b', fontSize: '14px' }}>Female</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#334155', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} color="#1e40af" />
              Description / Background
            </h3>
            <div style={{
              background: '#f8fafc',
              padding: '16px',
              borderRadius: '8px',
              color: '#334155',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}>
              {report.description || 'No description provided'}
            </div>
          </div>

          {/* Positive Ideas */}
          {report.positiveIdeas && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#334155', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lightbulb size={20} color="#22c55e" />
                Positive Ideas / Opportunities
              </h3>
              <div style={{
                background: '#f0fdf4',
                padding: '16px',
                borderRadius: '8px',
                color: '#166534',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                border: '2px solid #bbf7d0'
              }}>
                {report.positiveIdeas}
              </div>
            </div>
          )}

          {/* Negative Issues */}
          {report.negativeIssues && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#334155', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={20} color="#ef4444" />
                Negative Issues / Challenges
              </h3>
              <div style={{
                background: '#fef2f2',
                padding: '16px',
                borderRadius: '8px',
                color: '#991b1b',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                border: '2px solid #fecaca'
              }}>
                {report.negativeIssues}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {report.recommendations && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#334155', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckSquare size={20} color="#1e40af" />
                Key Recommendations
              </h3>
              <div style={{
                background: '#eff6ff',
                padding: '16px',
                borderRadius: '8px',
                color: '#1e40af',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                border: '2px solid #bfdbfe'
              }}>
                {report.recommendations}
              </div>
            </div>
          )}

          {/* Attachments */}
          {report.attachments && report.attachments.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#334155', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Paperclip size={20} color="#1e40af" />
                Attachments ({report.attachments.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                {report.attachments.map((url, index) => {
                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                  const fileName = url.split('/').pop();
                  return (
                    <div key={index} style={{
                      background: '#f8fafc',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid #e2e8f0'
                    }}>
                      {isImage ? (
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <img
                            src={url}
                            alt={`Attachment ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '120px',
                              objectFit: 'cover',
                              cursor: 'pointer'
                            }}
                          />
                        </a>
                      ) : (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '16px',
                            textDecoration: 'none',
                            color: '#1e40af',
                            height: '120px'
                          }}
                        >
                          <Paperclip size={32} />
                          <div style={{ fontSize: '12px', marginTop: '8px', textAlign: 'center', wordBreak: 'break-all' }}>
                            {fileName}
                          </div>
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submission Info */}
          <div style={{
            background: '#f8fafc',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#64748b',
            textAlign: 'center'
          }}>
            Submitted by {report.submittedBy} on {new Date(report.submittedAt).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportDetailModal;
