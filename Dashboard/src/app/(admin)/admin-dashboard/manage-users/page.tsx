"use client";
import React, { useState, useEffect } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { usersApi } from '@/lib/api';
import { UserResponse } from '@/lib/api/users';
import { CreateUserCommand, UpdateUserCommand } from '@/lib/api/types';
import { FiEdit, FiTrash, FiPlus, FiSearch } from 'react-icons/fi';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const ManageUsersPage = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await usersApi.getUsers();
      setUsers(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateUser = async (userData: CreateUserCommand) => {
    try {
      const formData = new FormData();
      formData.append('Email', userData.email || '');
      formData.append('Password', userData.password || '');
      formData.append('FullName', userData.fullName || '');
      formData.append('Role', userData.role || 'User');
      
      if (userData.profilePicture instanceof File) {
        formData.append('ProfilePicture', userData.profilePicture);
      }
      
      await usersApi.createUser(formData);
      setIsCreateModalOpen(false);
      fetchUsers(); // Refresh the users list
      showNotification('User created successfully', 'success');
    } catch (err: any) {
      console.error('Error creating user:', err);
      showNotification(err.message || 'Failed to create user', 'error');
    }
  };
  
const handleUpdateUser = async (userData: UpdateUserCommand) => {
  try {
    await usersApi.updateUser(userData);
    setIsEditModalOpen(false);
    fetchUsers(); // Refresh the users list
    showNotification('User updated successfully', 'success');
  } catch (err: any) {
    console.error('Error updating user:', err);
    showNotification(err.message || 'Failed to update user', 'error');
  }
};

  const handleDeleteUser = async (userId: string) => {
    try {
      await usersApi.deleteUser(userId);
      setIsDeleteModalOpen(false);
      fetchUsers(); // Refresh the users list
      showNotification('User deleted successfully', 'success');
    } catch (err: any) {
      console.error('Error deleting user:', err);
      showNotification(err.message || 'Failed to delete user', 'error');
    }
  };
  
  const openEditModal = (user: UserResponse) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };
  
  const openDeleteModal = (user: UserResponse) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };
  
  const getUserRoleDisplay = (user: UserResponse) => {
    if (!user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
      return 'User';
    }
    return user.roles.includes('Admin') ? 'Admin' : user.roles[0];
  };

  const isAdmin = (user: UserResponse) => {
    return user.roles && Array.isArray(user.roles) && user.roles.includes('Admin');
  };
  
  const filteredUsers = users.filter(user => 
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.roles && Array.isArray(user.roles) && 
      user.roles.some(role => role.toLowerCase().includes(searchTerm.toLowerCase())))
  );
  
  const [notification, setNotification] = useState<{ message: string; type: string } | null>(null);
  
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };
  
  return (
    <>
      <PageBreadcrumb pageTitle="Manage Users" />
      
      {/* Notification */}
      {notification && (
        <div className={`p-4 mb-4 rounded-lg ${
          notification.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
        }`}>
          {notification.message}
        </div>
      )}
      
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">User Management</h2>
          
          {/* Search and Add User */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              <FiPlus />
              Add User
            </button>
          </div>
        </div>
        
        {/* Error state */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
            {error}
          </div>
        )}
        
        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          </div>
        ) : (
          <>
            {/* Users table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Full Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Role
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        {searchTerm ? 'No users match your search.' : 'No users found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 mr-3">
                              <img 
                                className="h-8 w-8 rounded-full object-cover" 
                                src={user.profilePictureUrl || "/images/user/NoImage.jpeg"} 
                                alt={user.fullName}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/images/user/NoImage.jpeg";
                                }}
                              />
                            </div>
                            {user.fullName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isAdmin(user) 
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' 
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                          }`}>
                            {getUserRoleDisplay(user)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => openEditModal(user)}
                            className="text-brand-500 hover:text-brand-700 mr-4"
                          >
                            <FiEdit className="inline" /> Edit
                          </button>
                          <button
                            onClick={() => openDeleteModal(user)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FiTrash className="inline" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      
      {/* Create User Modal */}
      <CreateUserModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateUser}
      />
      
      {/* Edit User Modal */}
      {selectedUser && (
        <EditUserModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateUser}
          user={selectedUser}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {selectedUser && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={() => handleDeleteUser(selectedUser.id)}
          userName={selectedUser.fullName}
        />
      )}
    </>
  );
};

export default ManageUsersPage;