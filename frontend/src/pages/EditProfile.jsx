import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Lock, Save, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { editProfile, changePassword } from '../services/api';
import toast from 'react-hot-toast';
import './EditProfile.css';

const EditProfile = () => {
  const { user } = useAuth();
  const [personalData, setPersonalData] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await editProfile(personalData);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await changePassword({
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      });
      toast.success('Password changed successfully');
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container edit-profile-container">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="edit-grid"
      >
        {/* Personal Info */}
        <div className="glass-card edit-card">
          <div className="card-top">
            <User size={24} color="var(--accent-purple)" />
            <h2>Personal Information</h2>
          </div>
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input 
                  type="text" 
                  className="input-field" 
                  value={personalData.name}
                  onChange={(e) => setPersonalData({...personalData, name: e.target.value})}
                  placeholder="Your Name"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-with-icon">
                <Phone size={18} className="input-icon" />
                <input 
                  type="text" 
                  className="input-field" 
                  value={personalData.phone}
                  onChange={(e) => setPersonalData({...personalData, phone: e.target.value})}
                  placeholder="+1 234 567 890"
                />
              </div>
            </div>
            <button className="btn-primary" type="submit" disabled={loading}>
              <Save size={18} /> Save Changes
            </button>
          </form>
        </div>

        {/* Security / Password */}
        <div className="glass-card edit-card">
          <div className="card-top">
            <ShieldCheck size={24} color="#f87171" />
            <h2>Security</h2>
          </div>
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input 
                  type="password" 
                  className="input-field" 
                  value={passwords.oldPassword}
                  onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input 
                    type="password" 
                    className="input-field" 
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    placeholder="Min 6 characters"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input 
                    type="password" 
                    className="input-field" 
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    placeholder="Confirm"
                  />
                </div>
              </div>
            </div>
            <button className="btn-secondary" type="submit" style={{ width: '100%', border: '1px solid #f87171', color: '#f87171' }} disabled={loading}>
              Update Password
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default EditProfile;
