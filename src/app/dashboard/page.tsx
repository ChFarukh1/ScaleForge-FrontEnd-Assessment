'use client';

import { useState } from 'react';
import { MembersTable } from '@/components/members-table';
import { MemberProfileModal } from '@/components/member-profile-modal';
import { FilterBar } from '@/components/filter-bar';
import { EmptyState } from '@/components/empty-state';
import { PaginationFooter } from '@/components/pagination-footer';
import { ErrorBoundary } from '@/components/error-boundary';
import { useMembers } from '@/hooks/use-members';
import { Member, MembersFilterInput } from '@/graphql/types';
import { MOCK_MODE } from '@/graphql/apollo-client';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateRegisteredFilter, setDateRegisteredFilter] = useState<{ startDate: Date | null; endDate: Date | null }>({
    startDate: null,
    endDate: null
  });
  const [lastActiveFilter, setLastActiveFilter] = useState<{ startDate: Date | null; endDate: Date | null }>({
    startDate: null,
    endDate: null
  });

  // Use the GraphQL hook
  const {
    members,
    loading,
    loadingMore,
    error,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    currentPage,
    pageSize,
    searchType,
    searchTerm,
    filters,
    fetchMembers,
    fetchMore,
    nextPage,
    prevPage,
    setPageSize,
    searchByName,
    searchByEmail,
    searchByMobile,
    clearSearch,
    clearAllFilters,
    updateFilters,
  } = useMembers({ pageSize: 20 });

  const handleMemberClick = (member: Member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
  };

  const handleSearch = (query: string, searchType: 'name' | 'email' | 'mobile') => {
    switch (searchType) {
      case 'name':
        searchByName(query);
        break;
      case 'email':
        searchByEmail(query);
        break;
      case 'mobile':
        searchByMobile(query);
        break;
    }
  };

  const handleFiltersChange = (newFilters: any) => {
    const graphqlFilters: MembersFilterInput = {};

    if (newFilters.status && newFilters.status !== 'all') {
      graphqlFilters.status = newFilters.status as any;
    }
    if (newFilters.verificationStatus && newFilters.verificationStatus !== 'all') {
      graphqlFilters.verificationStatus = newFilters.verificationStatus as any;
    }
    if (newFilters.domain && newFilters.domain !== 'all') {
      graphqlFilters.domain = newFilters.domain;
    }

    // Dates → GraphQL filter payload (ISO)
    const toISO = (d?: Date | null) => (d ? new Date(d).toISOString() : undefined);
    const utcStartOfDayISO = (d?: Date | null) => {
      if (!d) return undefined;
      return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)).toISOString();
    };
    const utcEndOfDayISO = (d?: Date | null) => {
      if (!d) return undefined;
      return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)).toISOString();
    };

    if (newFilters.dateRegistered) {
      const { startDate, endDate } = newFilters.dateRegistered;
      const gte = utcStartOfDayISO(startDate ?? null);
      const lte = utcEndOfDayISO(endDate ?? null);
      if (gte || lte) {
        graphqlFilters.dateTimeCreated = { gte, lte };
      }
      setDateRegisteredFilter({ startDate: startDate ?? null, endDate: endDate ?? null });
    }
    if (newFilters.lastActive) {
      const { startDate, endDate } = newFilters.lastActive;
      const gte = toISO(startDate ?? null);
      const lte = toISO(endDate ?? null);
      if (gte || lte) {
        graphqlFilters.dateTimeLastActive = { gte, lte };
      }
      setLastActiveFilter({ startDate: startDate ?? null, endDate: endDate ?? null });
    }

    // Replace server filters with the new set (so 'All' truly clears)
    updateFilters(graphqlFilters, true);

    // Trigger targeted search based on which textual filter changed
    if (typeof newFilters.name === 'string' && newFilters.name.trim() !== '') {
      searchByName(newFilters.name.trim());
    } else if (typeof newFilters.email === 'string' && newFilters.email.trim() !== '') {
      searchByEmail(newFilters.email.trim());
    } else if (typeof newFilters.mobile === 'string' && newFilters.mobile.trim() !== '') {
      searchByMobile(newFilters.mobile.trim());
    } else {
      // If no textual filters are active, clear search
      clearSearch();
    }
  };

  const handleClearFilters = () => {
    // Clear both server filters and any active search
    clearAllFilters();
    setDateRegisteredFilter({ startDate: null, endDate: null });
    setLastActiveFilter({ startDate: null, endDate: null });
  };

  // Handle date range changes (kept for potential direct use)
  const handleDateRangeChange = (startDate: Date | null, endDate: Date | null) => {
    setDateRegisteredFilter({ startDate, endDate });
  };

  // Determine empty state type
  const getEmptyStateType = () => {
    if (searchType !== 'none' && searchTerm && members.length === 0) {
      return 'no-search-results' as const;
    }
    if (Object.keys(filters).length > 0 && members.length === 0) {
      return 'no-filter-results' as const;
    }
    return 'no-members' as const;
  };

  // Apply local date filters to members for display
  // Normalize ranges to be inclusive of the end date's entire day when time is not relevant
  const toInclusiveEnd = (d: Date | null) => {
    if (!d) return null;
    const end = new Date(d);
    // If time is midnight, bump to end-of-day to be inclusive
    if (end.getHours() === 0 && end.getMinutes() === 0 && end.getSeconds() === 0 && end.getMilliseconds() === 0) {
      end.setHours(23, 59, 59, 999);
    }
    return end;
  };

  const drStart = dateRegisteredFilter.startDate || null;
  const drEnd = toInclusiveEnd(dateRegisteredFilter.endDate || null);
  const laStart = lastActiveFilter.startDate || null;
  const laEnd = toInclusiveEnd(lastActiveFilter.endDate || null);

  const membersForDisplay = members.filter((m) => {
    const created = new Date(m.dateCreated);
    const last = new Date(m.lastActive);

    const inCreatedRange = !drStart && !drEnd
      ? true
      : ((!
          drStart || created >= drStart) && (!drEnd || created <= drEnd));

    const inLastRange = !laStart && !laEnd
      ? true
      : ((!
          laStart || last >= laStart) && (!laEnd || last <= laEnd));

    return inCreatedRange && inLastRange;
  });

  // Calculate stats based on displayed members
  const activeMembers = membersForDisplay.filter(m => m.status === 'ACTIVE').length;
  const pendingVerification = membersForDisplay.filter(m => m.verificationStatus === 'PENDING').length;
  const inactiveMembers = membersForDisplay.filter(m => m.status === 'INACTIVE').length;

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Page Header with gradient background */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5"></div>
          <div className="relative p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Members Dashboard
            </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
              Manage and monitor your team members
            </p>
                {MOCK_MODE && (
                  <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700">
                    🧪 Mock Mode - Using sample data
                  </div>
                )}
          </div>
              
              {/* Enhanced Add Member Button - Desktop */}
              <div className="mt-6 sm:mt-0 sm:ml-6">
                <button className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:scale-105 hover:shadow-xl transform">
                  <PlusIcon className="w-5 h-5 mr-2" />
              Add Member
            </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="group bg-white dark:bg-gray-800 overflow-hidden rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-blue-600 dark:text-blue-400 text-xl font-bold">T</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Members</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {totalCount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="group bg-white dark:bg-gray-800 overflow-hidden rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-green-600 dark:text-green-400 text-xl font-bold">A</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                    {activeMembers.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="group bg-white dark:bg-gray-800 overflow-hidden rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-yellow-600 dark:text-yellow-400 text-xl font-bold">P</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors duration-300">
                    {pendingVerification.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="group bg-white dark:bg-gray-800 overflow-hidden rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-red-600 dark:text-red-400 text-xl font-bold">I</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Inactive</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                    {inactiveMembers.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shared horizontal scroll for filter bar + table */}
        <div className="overflow-x-auto">
          <div className="min-w-[1400px] space-y-4">
            {/* Filters Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Filters</div>
              </div>
              <FilterBar onChange={handleFiltersChange} onClear={handleClearFilters} />
            </div>

            {/* Members Table or Empty State */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              {error && !MOCK_MODE ? (
                <div className="text-center py-8">
                  <div className="text-red-600 dark:text-red-400 mb-2">
                    Error loading members: {error.message}
                  </div>
                  <button
                    onClick={() => fetchMembers()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : members.length === 0 && !loading ? (
                <EmptyState
                  type={getEmptyStateType()}
                  searchTerm={searchTerm}
                  filters={filters}
                  onClearSearch={clearSearch}
                  onClearFilters={handleClearFilters}
                />
              ) : (
                <MembersTable
                  members={membersForDisplay}
                  loading={loading}
                  loadingMore={loadingMore}
                  error={error}
                  hasNextPage={hasNextPage}
                  onMemberClick={handleMemberClick}
                  onLoadMore={fetchMore}
                />
              )}
              <PaginationFooter
                pageSize={pageSize}
                onPageSizeChange={(size) => setPageSize(size)}
                currentPage={currentPage}
                onPrev={prevPage}
                onNext={nextPage}
                hasPrev={hasPreviousPage}
                hasNext={!!hasNextPage}
              />
            </div>
          </div>
        </div>

        {/* Floating Action Button for Mobile */}
        <div className="md:hidden fixed bottom-6 right-6 z-50">
          <button className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center">
            <PlusIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Member Profile Modal */}
        <MemberProfileModal
          member={selectedMember}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </ErrorBoundary>
  );
}
