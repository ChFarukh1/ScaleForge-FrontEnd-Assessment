'use client';

import { useState, useCallback } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useDebounce } from '@/hooks/use-debounce';

interface EnhancedSearchProps {
  onSearch: (query: string, searchType: 'name' | 'email' | 'mobile') => void;
  onClear: () => void;
  onFiltersChange: (filters: any) => void;
  searchType: 'none' | 'name' | 'email' | 'mobile';
  searchTerm: string;
  loading?: boolean;
}

export function EnhancedSearch({
  onSearch,
  onClear,
  onFiltersChange,
  searchType,
  searchTerm,
  loading = false,
}: EnhancedSearchProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [searchTypeSelect, setSearchTypeSelect] = useState<'name' | 'email' | 'mobile'>('name');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    verificationStatus: 'all',
    domain: 'all',
  });

  // Debounce search input
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);

  // Handle search type change
  const handleSearchTypeChange = useCallback((type: 'name' | 'email' | 'mobile') => {
    setSearchTypeSelect(type);
    if (localSearchTerm.trim()) {
      onSearch(localSearchTerm, type);
    }
  }, [localSearchTerm, onSearch]);

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    setLocalSearchTerm(value);
    
    if (!value.trim()) {
      onClear();
      return;
    }
    
    // Trigger search after debounce
    if (debouncedSearchTerm !== value) {
      return;
    }
    
    onSearch(value, searchTypeSelect);
  }, [debouncedSearchTerm, searchTypeSelect, onSearch, onClear]);

  // Handle filter changes
  const handleFilterChange = useCallback((filterType: string, value: string) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setLocalSearchTerm('');
    onClear();
  }, [onClear]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Type Selector */}
        <div className="w-full sm:w-32">
          <select
            value={searchTypeSelect}
            onChange={(e) => handleSearchTypeChange(e.target.value as 'name' | 'email' | 'mobile')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="mobile">Mobile</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={`Search by ${searchTypeSelect}...`}
            value={localSearchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          {/* Clear Button */}
          {localSearchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filters Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <FunnelIcon className="w-5 h-5 mr-2" />
          Filters
        </button>
      </div>

      {/* Active Search Indicator */}
      {searchType !== 'none' && searchTerm && (
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Searching by {searchType}:</span>
          <span className="font-medium text-gray-900 dark:text-white">{searchTerm}</span>
          {loading && (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
      )}

      {/* Filter Dropdowns */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Verification
            </label>
            <select
              value={filters.verificationStatus}
              onChange={(e) => handleFilterChange('verificationStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Verifications</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
              <option value="UNVERIFIED">Unverified</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Domain
            </label>
            <select
              value={filters.domain}
              onChange={(e) => handleFilterChange('domain', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Domains</option>
              <option value="example.com">example.com</option>
              <option value="company.org">company.org</option>
              <option value="startup.io">startup.io</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
