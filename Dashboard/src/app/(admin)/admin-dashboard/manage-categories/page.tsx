"use client";
import React, { useState, useEffect } from "react";
import { getEventCategories, createEventCategory, updateEventCategory, deleteEventCategory } from "@/lib/api/eventCategories";
import { EventCategoryDto } from "@/lib/api/types";
import Link from "next/link";

export default function ManageCategories() {
  const [categories, setCategories] = useState<EventCategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<EventCategoryDto | null>(null);
  const [editingCategory, setEditingCategory] = useState<EventCategoryDto | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [successMessage, setSuccessMessage] = useState<{message: string, type: 'create' | 'edit' | 'delete'} | null>(null);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const categoriesData = await getEventCategories();
      setCategories(categoriesData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError('Failed to load event categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category: EventCategoryDto | null = null) => {
    if (category) {
      setEditingCategory(category);
      setNewCategoryName(category.categoryName || "");
      setNewCategoryDescription(category.description || "");
    } else {
      setEditingCategory(null);
      setNewCategoryName("");
      setNewCategoryDescription("");
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setNewCategoryName("");
    setNewCategoryDescription("");
  };

  const handleOpenDeleteModal = (category: EventCategoryDto) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) {
      // Show validation error in the form instead of alert
      return;
    }

    try {
      if (editingCategory) {
        // Update existing category
        await updateEventCategory(editingCategory.categoryId, {
          categoryId: editingCategory.categoryId,
          categoryName: newCategoryName,
          description: newCategoryDescription
        });
        setSuccessMessage({
          message: `Category "${newCategoryName}" has been updated successfully!`,
          type: 'edit'
        });
      } else {
        // Create new category
        await createEventCategory({
          categoryName: newCategoryName,
          description: newCategoryDescription
        });
        setSuccessMessage({
          message: `Category "${newCategoryName}" has been created successfully!`,
          type: 'create'
        });
      }
      
      // Refresh the categories list
      fetchCategories();
      handleCloseModal();
    } catch (err: any) {
      console.error('Error saving category:', err);
      setError(`Failed to ${editingCategory ? 'update' : 'create'} category: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    try {
      await deleteEventCategory(categoryToDelete.categoryId);
      setSuccessMessage({
        message: `Category "${categoryToDelete.categoryName}" has been deleted successfully!`,
        type: 'delete'
      });
      fetchCategories();
      handleCloseDeleteModal();
    } catch (err: any) {
      console.error('Error deleting category:', err);
      setError(`Failed to delete category: ${err.message || 'Unknown error'}`);
      handleCloseDeleteModal();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Manage Event Categories</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Create, edit, and delete event categories for your system
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Category
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
        <Link href="/admin-dashboard" className="hover:text-brand-500">
          Admin Dashboard
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700 dark:text-gray-300">Manage Categories</span>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className={`rounded-md p-4 flex items-center justify-between ${
          successMessage.type === 'delete' 
            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
            : successMessage.type === 'create'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
        }`}>
          <div className="flex items-center">
            <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
              successMessage.type === 'delete'
                ? 'bg-red-100 dark:bg-red-800/40'
                : successMessage.type === 'create'
                  ? 'bg-green-100 dark:bg-green-800/40'
                  : 'bg-blue-100 dark:bg-blue-800/40'
            }`}>
              {successMessage.type === 'delete' && (
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
              {successMessage.type === 'create' && (
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
              {successMessage.type === 'edit' && (
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                successMessage.type === 'delete'
                  ? 'text-red-800 dark:text-red-300'
                  : successMessage.type === 'create'
                    ? 'text-green-800 dark:text-green-300'
                    : 'text-blue-800 dark:text-blue-300'
              }`}>
                {successMessage.type === 'delete' ? 'Category Deleted' : successMessage.type === 'create' ? 'Category Created' : 'Category Updated'}
              </h3>
              <div className={`mt-1 text-sm ${
                successMessage.type === 'delete'
                  ? 'text-red-700 dark:text-red-400'
                  : successMessage.type === 'create'
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-blue-700 dark:text-blue-400'
              }`}>
                {successMessage.message}
              </div>
            </div>
          </div>
          <button 
            type="button" 
            className={`ml-auto flex-shrink-0 ${
              successMessage.type === 'delete'
                ? 'text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
                : successMessage.type === 'create'
                  ? 'text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300'
                  : 'text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
            }`}
            onClick={() => setSuccessMessage(null)}
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          <span className="block sm:inline">{error}</span>
          <button 
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Categories list */}
      <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No categories found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Get started by creating your first event category.
            </p>
            <button 
              onClick={() => handleOpenModal()}
              className="mt-4 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
            >
              Add New Category
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900/30">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-gray-800">
                {categories.map((category) => (
                  <tr key={category.categoryId} className="hover:bg-gray-50 dark:hover:bg-gray-900/20">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-md bg-gradient-to-br from-brand-400 to-brand-600 dark:from-brand-600 dark:to-brand-900 flex items-center justify-center mr-3 shadow-sm">
                          <span className="text-sm font-bold text-white">
                            {(category.categoryName || 'C').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {category.categoryName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {category.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(category)}
                          className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(category)}
                          className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for adding/editing categories */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Category Name */}
                <div>
                  <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category Name*
                  </label>
                  <input
                    type="text"
                    id="categoryName"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                    placeholder="Enter category name"
                    required
                  />
                  {!newCategoryName.trim() && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">Category name is required</p>
                  )}
                </div>
                
                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                    placeholder="Enter category description (optional)"
                  ></textarea>
                </div>
                
                {/* Submit Button */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                  >
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {isDeleteModalOpen && categoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="mb-5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Delete Category</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Are you sure you want to delete the category "{categoryToDelete.categoryName}"? This will affect all events using this category and cannot be undone.
              </p>
            </div>
            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCategory}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}