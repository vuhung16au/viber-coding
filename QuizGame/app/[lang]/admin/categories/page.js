'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/firebase/auth';
import { db } from '@/app/firebase/config';
import { ref, get } from 'firebase/database';
import { useLanguage } from '@/app/context/LanguageContext';
import { 
  getAllCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  toggleCategoryStatus
} from '@/app/firebase/database';
import { setupCategoriesSystem } from '@/app/firebase/category-init';

export default function CategoryManagementPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  
  // New category form state
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true,
    displayOrder: 0
  });
  
  // Edit category state
  const [editCategory, setEditCategory] = useState(null);
  
  // Check if user is admin and fetch categories
  useEffect(() => {
    const checkAdminAndFetchCategories = async () => {
      if (!currentUser) {
        router.push(`/${locale}/login`);
        return;
      }
      
      try {
        setLoading(true);
        
        // Check if user is admin by comparing email with environment variable
        const isUserAdmin = currentUser.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        setIsAdmin(isUserAdmin);
        
        if (!isUserAdmin) {
          setError('You do not have permission to access this page');
          setLoading(false);
          return;
        }
        
        // Fetch all categories including inactive ones
        const categoriesData = await getAllCategories(true);
        // Sort by display order
        const sortedCategories = categoriesData.sort((a, b) => a.displayOrder - b.displayOrder);
        setCategories(sortedCategories);
      } catch (err) {
        console.error('Error checking admin status or fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminAndFetchCategories();
  }, [currentUser, router, locale]);
  
  // Function to generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
  };
  
  // Handle input change for new category form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setNewCategory(prev => {
      const updated = { ...prev, [name]: newValue };
      
      // Auto-generate slug when name changes
      if (name === 'name') {
        updated.slug = generateSlug(value);
      }
      
      return updated;
    });
  };
  
  // Handle input change for edit category form
  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setEditCategory(prev => {
      const updated = { ...prev, [name]: newValue };
      
      // Auto-generate slug when name changes
      if (name === 'name') {
        updated.slug = generateSlug(value);
      }
      
      return updated;
    });
  };
  
  // Handle adding a new category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategory.name || !newCategory.slug) {
      setError('Category name and slug are required');
      return;
    }
    
    try {
      setLoading(true);
      
      // Check if a category with this slug already exists
      const existingCategory = categories.find(cat => cat.slug === newCategory.slug);
      if (existingCategory) {
        setError('A category with this slug already exists');
        setLoading(false);
        return;
      }
      
      // Set display order to be after the last category if not specified
      if (!newCategory.displayOrder) {
        newCategory.displayOrder = categories.length + 1;
      }
      
      // Create the category in Firebase
      const categoryId = await createCategory(newCategory);
      
      // Add the new category to the state
      setCategories(prev => [...prev, { id: categoryId, ...newCategory }].sort((a, b) => a.displayOrder - b.displayOrder));
      
      // Reset form
      setNewCategory({
        name: '',
        slug: '',
        description: '',
        isActive: true,
        displayOrder: categories.length + 2 // Set next display order
      });
      
      setSuccess('Category added successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error adding category:', err);
      setError(`Failed to add category: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle editing a category
  const handleEditCategory = (category) => {
    setEditCategory({ ...category });
  };
  
  // Handle saving edited category
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    
    if (!editCategory.name || !editCategory.slug) {
      setError('Category name and slug are required');
      return;
    }
    
    try {
      setLoading(true);
      
      // Check if another category with this slug already exists (excluding the current one)
      const existingCategory = categories.find(cat => cat.slug === editCategory.slug && cat.id !== editCategory.id);
      if (existingCategory) {
        setError('Another category with this slug already exists');
        setLoading(false);
        return;
      }
      
      // Update the category in Firebase
      await updateCategory(editCategory.id, editCategory);
      
      // Update the category in the state
      setCategories(prev => 
        prev.map(cat => cat.id === editCategory.id ? editCategory : cat)
          .sort((a, b) => a.displayOrder - b.displayOrder)
      );
      
      // Reset edit state
      setEditCategory(null);
      
      setSuccess('Category updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating category:', err);
      setError(`Failed to update category: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle deleting a category
  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Delete the category from Firebase
      await deleteCategory(categoryId);
      
      // Remove the category from the state
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      
      setSuccess('Category deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(`Failed to delete category: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle toggling category active status
  const handleToggleStatus = async (categoryId, currentStatus) => {
    try {
      setLoading(true);
      
      // Toggle the status in Firebase
      await toggleCategoryStatus(categoryId, !currentStatus);
      
      // Update the status in the state
      setCategories(prev => 
        prev.map(cat => cat.id === categoryId ? { ...cat, isActive: !currentStatus } : cat)
      );
      
      setSuccess(`Category ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error toggling category status:', err);
      setError(`Failed to update category status: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Initialize categories system
  const handleInitializeCategories = async () => {
    try {
      setIsInitializing(true);
      const result = await setupCategoriesSystem();
      
      if (result.categoriesInitialized || result.quizzesMigrated) {
        setSuccess('Categories system initialized successfully!');
        
        // Refresh the categories list
        const categoriesData = await getAllCategories(true);
        const sortedCategories = categoriesData.sort((a, b) => a.displayOrder - b.displayOrder);
        setCategories(sortedCategories);
      } else {
        setSuccess('No changes needed. Categories system is already initialized.');
      }
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error initializing categories system:', err);
      setError(`Failed to initialize categories system: ${err.message}`);
    } finally {
      setIsInitializing(false);
    }
  };
  
  // Cancel category edit
  const handleCancelEdit = () => {
    setEditCategory(null);
  };
  
  if (!currentUser || (!isAdmin && !loading)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-800 p-4 rounded-md">
          You do not have permission to access this page.
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 md:px-8 py-6 md:py-10">
      <main className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Category Management
            </h1>
            
            <button
              onClick={handleInitializeCategories}
              disabled={isInitializing}
              className={`px-4 py-2 ${
                isInitializing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700'
              } text-white rounded-lg transition-colors mt-2 sm:mt-0`}
            >
              {isInitializing ? 'Initializing...' : 'Initialize/Migrate Categories'}
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
              {success}
            </div>
          )}
          
          {/* Add New Category Form */}
          <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Add New Category
            </h2>
            
            <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={newCategory.name}
                  onChange={handleInputChange}
                  placeholder="Category name"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={newCategory.slug}
                  onChange={handleInputChange}
                  placeholder="category-slug"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL-friendly version of the name. Auto-generated but can be edited.
                </p>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  name="description"
                  value={newCategory.description}
                  onChange={handleInputChange}
                  placeholder="Category description"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows="2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Display Order
                </label>
                <input
                  type="number"
                  name="displayOrder"
                  value={newCategory.displayOrder}
                  onChange={handleInputChange}
                  placeholder="Display order"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={newCategory.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 mr-2 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active
                </label>
              </div>
              
              <div className="md:col-span-2 mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 ${
                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  } text-white rounded-md transition-colors`}
                >
                  {loading ? 'Adding...' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
          
          {/* Category List */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Manage Categories
            </h2>
            
            {loading && !categories.length ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Slug
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {categories.map(category => (
                      <tr key={category.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {category.name}
                          </div>
                          {category.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {category.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {category.slug}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {category.displayOrder}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            category.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleStatus(category.id, category.isActive)}
                            className={`${
                              category.isActive
                                ? 'text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300'
                                : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                            } mr-3`}
                          >
                            {category.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {categories.length === 0 && (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No categories found. Add some categories to get started.
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Edit Category Modal */}
          {editCategory && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  Edit Category
                </h3>
                
                <form onSubmit={handleSaveCategory}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editCategory.name}
                      onChange={handleEditInputChange}
                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Slug
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={editCategory.slug}
                      onChange={handleEditInputChange}
                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={editCategory.description}
                      onChange={handleEditInputChange}
                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows="2"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Display Order
                    </label>
                    <input
                      type="number"
                      name="displayOrder"
                      value={editCategory.displayOrder}
                      onChange={handleEditInputChange}
                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div className="mb-4 flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={editCategory.isActive}
                      onChange={handleEditInputChange}
                      className="w-4 h-4 mr-2 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Active
                    </label>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-4 py-2 ${
                        loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                      } text-white rounded-md transition-colors`}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}