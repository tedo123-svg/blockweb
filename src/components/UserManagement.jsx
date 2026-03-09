import React, { useState, useEffect } from 'react';
import { UserPlus, Edit2, Trash2, X, Save, Users, CheckCircle, XCircle } from 'lucide-react';

function UserManagement({ token }) {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    woredaName: '',
    subCity: '',
    status: 'active'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingUser 
        ? `http://localhost:5000/api/users/${editingUser.id}`
        : 'http://localhost:5000/api/users';
      
      const method = editingUser ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchUsers();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      woredaName: user.woredaName,
      subCity: user.subCity,
      status: user.status
    });
    setShowForm(true);
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      woredaName: '',
      subCity: '',
      status: 'active'
    });
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Users size={24} color="#1e40af" />
          <h2 style={{ color: '#334155', margin: 0 }}>Woreda User Management</h2>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <UserPlus size={16} style={{ marginRight: '8px', display: 'inline' }} />
            Add User
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
          <h3 style={{ color: '#334155', marginBottom: '16px' }}>
            {editingUser ? 'Edit User' : 'Create New User'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={!!editingUser}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password {editingUser && '(leave blank to keep current)'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                />
              </div>
              <div className="form-group">
                <label>Woreda Name</label>
                <input
                  type="text"
                  value={formData.woredaName}
                  onChange={(e) => setFormData({ ...formData, woredaName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Sub-City</label>
                <input
                  type="text"
                  value={formData.subCity}
                  onChange={(e) => setFormData({ ...formData, subCity: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button type="submit" className="btn btn-primary">
                <Save size={16} style={{ marginRight: '8px', display: 'inline' }} />
                {editingUser ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                <X size={16} style={{ marginRight: '8px', display: 'inline' }} />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Woreda Name</th>
              <th>Sub-City</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.woredaName}</td>
                <td>{user.subCity}</td>
                <td>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    background: user.status === 'active' ? '#dcfce7' : '#fee2e2',
                    color: user.status === 'active' ? '#166534' : '#991b1b'
                  }}>
                    {user.status === 'active' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {user.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEdit(user)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px' }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', background: '#fee2e2', color: '#991b1b' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;
