import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import EthiopianDatePicker from './EthiopianDatePicker';
import { API_URL } from '../config/api';

function ReportForm({ user, token, onSubmit, onCancel }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    woredaName: user.woredaName,
    subCity: user.subCity || '',
    discussionDate: '',
    location: '',
    facilitatorName: '',
    totalParticipants: '',
    maleParticipants: '',
    femaleParticipants: '',
    mainTopic: '',
    description: '',
    positiveIdeas: '',
    negativeIssues: '',
    recommendations: ''
  });
  const [files, setFiles] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    files.forEach(file => data.append('attachments', file));

    try {
      const response = await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });

      if (response.ok) {
        onSubmit();
      }
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: '#334155' }}>{t('new_discussion_report')}</h2>
        <button onClick={onCancel} className="btn btn-secondary">
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <h3 style={{ color: '#1e40af', marginBottom: '16px' }}>{t('basic_information')}</h3>
        <div className="grid grid-2">
          <div className="form-group">
            <label>{t('woreda_name')}</label>
            <input type="text" name="woredaName" value={formData.woredaName} readOnly />
          </div>
          <div className="form-group">
            <label>{t('sub_city')}</label>
            <input type="text" name="subCity" value={formData.subCity} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>{t('date_of_discussion')}</label>
            <EthiopianDatePicker
              name="discussionDate"
              value={formData.discussionDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>{t('location_venue')}</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>{t('facilitator_name')}</label>
            <input type="text" name="facilitatorName" value={formData.facilitatorName} onChange={handleChange} required />
          </div>
        </div>

        <h3 style={{ color: '#1e40af', marginTop: '24px', marginBottom: '16px' }}>{t('participants_information')}</h3>
        <div className="grid grid-2">
          <div className="form-group">
            <label>{t('total_participants_field')}</label>
            <input type="number" name="totalParticipants" value={formData.totalParticipants} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>{t('male_participants_field')}</label>
            <input type="number" name="maleParticipants" value={formData.maleParticipants} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>{t('female_participants_field')}</label>
            <input type="number" name="femaleParticipants" value={formData.femaleParticipants} onChange={handleChange} required />
          </div>
        </div>

        <h3 style={{ color: '#1e40af', marginTop: '24px', marginBottom: '16px' }}>{t('discussion_details')}</h3>
        <div className="form-group">
          <label>{t('main_topic')}</label>
          <input type="text" name="mainTopic" value={formData.mainTopic} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>{t('description_background')}</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>{t('positive_ideas')}</label>
          <textarea name="positiveIdeas" value={formData.positiveIdeas} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>{t('negative_issues')}</label>
          <textarea name="negativeIssues" value={formData.negativeIssues} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>{t('recommendations')}</label>
          <textarea name="recommendations" value={formData.recommendations} onChange={handleChange} />
        </div>

        <h3 style={{ color: '#1e40af', marginTop: '24px', marginBottom: '16px' }}>{t('attachments')}</h3>
        <div className="form-group">
          <label>{t('upload_files')}</label>
          <input type="file" multiple onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx" />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button type="submit" className="btn btn-primary">
            <Save size={16} style={{ marginRight: '8px', display: 'inline' }} />
            {t('submit_report')}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReportForm;
