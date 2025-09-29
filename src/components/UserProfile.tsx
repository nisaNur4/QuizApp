import React, { useState, useEffect } from 'react';
import apiService from '@/mock/apiClient';
import { useAuth, type User } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface PasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState<PasswordData>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const { user: authUser, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        if (authUser) {
          setUser(authUser);
          setFormData({
            name: authUser.name || '',
            email: authUser.email
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load user profile';
        setError(errorMessage);
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [authUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    try {
      const currentUser = await apiService.getCurrentUser();
      if (!currentUser.data) throw new Error('Failed to fetch current user');
      
      setUser({
        ...currentUser.data,
        name: formData.name,
        email: formData.email
      });
      setEditMode(false);
      setMessage({ type: 'success', text: 'Profile updated successfully! (Note: Changes are local only in this demo)' });
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update profile';
      setMessage({ type: 'error', text: errorMessage });
      console.error('Error updating profile:', err);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    try {
      const currentUser = await apiService.getCurrentUser();
      if (!currentUser.data) throw new Error('Not authenticated');
      console.log('Password change requested', {
        current_password: '***',
        new_password: '***'.repeat(passwordData.new_password.length)
      });
      
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      setMessage({ 
        type: 'success', 
        text: 'Password change functionality will be implemented soon!' 
      });
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to change password';
      setMessage({ type: 'error', text: errorMessage });
      console.error('Error changing password:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error logging out';
      console.error('Error logging out:', errorMessage);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  if (!user) {
    return <div className="text-center py-8">User not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {message && (
        <div 
          className={`mb-6 p-4 rounded ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Profile</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Profile Information</h2>
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="text-blue-500 hover:text-blue-700"
            >
              Edit
            </button>
          ) : (
            <div>
              <button
                onClick={() => setEditMode(false)}
                className="mr-2 text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleProfileUpdate}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          )}
        </div>

        {editMode ? (
          <form onSubmit={handleProfileUpdate}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="name">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </form>
        ) : (
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {user.name || 'Not set'}</p>
            <p><span className="font-medium">Email:</span> {user.email}</p>
            <p><span className="font-medium">Role:</span> {user.role}</p>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="current_password">
              Current Password
            </label>
            <input
              type="password"
              id="current_password"
              name="current_password"
              value={passwordData.current_password}
              onChange={handlePasswordChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="new_password">
              New Password
            </label>
            <input
              type="password"
              id="new_password"
              name="new_password"
              value={passwordData.new_password}
              onChange={handlePasswordChange}
              className="w-full p-2 border rounded"
              minLength={8}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="confirm_password">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={passwordData.confirm_password}
              onChange={handlePasswordChange}
              className="w-full p-2 border rounded"
              minLength={8}
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
