'use client';

import { UsersIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { MembersFilterInput } from '@/graphql/types';

interface EmptyStateProps {
  type: 'no-members' | 'no-search-results' | 'no-filter-results';
  searchTerm?: string;
  filters?: MembersFilterInput;
  onClearSearch?: () => void;
  onClearFilters?: () => void;
}

export function EmptyState({
  type,
  searchTerm,
  filters,
  onClearSearch,
  onClearFilters,
}: EmptyStateProps) {
  const getContent = () => {
    switch (type) {
      case 'no-members':
        return {
          icon: UsersIcon,
          title: 'No members found',
          description: 'There are currently no members in the system. Get started by adding your first member.',
          action: null,
        };
      
      case 'no-search-results':
        return {
          icon: MagnifyingGlassIcon,
          title: 'No search results',
          description: `No members found matching "${searchTerm}". Try adjusting your search terms or check the spelling.`,
          action: onClearSearch ? {
            label: 'Clear search',
            onClick: onClearSearch,
          } : null,
        };
      
      case 'no-filter-results':
        return {
          icon: FunnelIcon,
          title: 'No results with current filters',
          description: 'No members match the current filter criteria. Try adjusting your filters or clear them to see all members.',
          action: onClearFilters ? {
            label: 'Clear filters',
            onClick: onClearFilters,
          } : null,
        };
      
      default:
        return {
          icon: UsersIcon,
          title: 'No data available',
          description: 'There is no data to display at the moment.',
          action: null,
        };
    }
  };

  const content = getContent();
  const Icon = content.icon;

  // Convert filters to displayable format
  const getFilterDisplay = (filters: MembersFilterInput) => {
    const displayFilters: Record<string, string> = {};
    
    if (filters.status) displayFilters['Status'] = filters.status;
    if (filters.verificationStatus) displayFilters['Verification'] = filters.verificationStatus;
    if (filters.domain) displayFilters['Domain'] = filters.domain;
    if (filters.searchTerm) displayFilters['Search'] = filters.searchTerm;
    
    return displayFilters;
  };

  const displayFilters = filters ? getFilterDisplay(filters) : {};

  return (
    <div className="text-center py-12">
      <Icon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {content.title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {content.description}
      </p>
      
      {content.action && (
        <button
          onClick={content.action.onClick}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {content.action.label}
        </button>
      )}
      
      {/* Show active filters if any */}
      {displayFilters && Object.keys(displayFilters).length > 0 && (
        <div className="mt-6">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Active filters:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {Object.entries(displayFilters).map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                {key}: {value}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
