'use client';

import { useState, useMemo } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Member, MemberStatus, VerificationStatus } from '@/graphql/types';
import { format } from 'date-fns';

// Helper mapping for display values as requested
const mapStatus: Record<string, string> = {
  Active: 'Active',
  Inactive: 'Disabled',
  Suspended: 'Blacklisted',
};

interface MembersTableProps {
  members: Member[];
  loading?: boolean;
  loadingMore?: boolean;
  error?: any;
  hasNextPage?: boolean;
  onMemberClick?: (member: Member) => void;
  onLoadMore?: () => void;
}

type SortField = 'firstName' | 'lastName' | 'dateCreated' | 'lastActive';
type SortDirection = 'asc' | 'desc';

export function MembersTable({ 
  members, 
  loading = false, 
  loadingMore = false,
  error,
  hasNextPage = false,
  onMemberClick, 
  onLoadMore 
}: MembersTableProps) {
  const [sortField, setSortField] = useState<SortField>('firstName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Sort members
  const sortedMembers = useMemo(() => {
    const sorted = [...members].sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;

      switch (sortField) {
        case 'firstName':
        case 'lastName':
          aValue = a[sortField].toLowerCase();
          bValue = b[sortField].toLowerCase();
          break;
        case 'dateCreated':
        case 'lastActive':
          aValue = new Date(a[sortField]);
          bValue = new Date(b[sortField]);
          break;
        default:
          aValue = a.firstName.toLowerCase();
          bValue = b.firstName.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [members, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusBadge = (status: MemberStatus) => {
    const statusConfig = {
      ACTIVE: { 
        color: 'bg-green-100/80 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200/70 dark:border-green-700/60',
        text: mapStatus['Active']
      },
      INACTIVE: { 
        color: 'bg-red-100/80 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200/70 dark:border-red-700/60',
        text: mapStatus['Inactive']
      },
      SUSPENDED: { 
        color: 'bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200/70 dark:border-yellow-700/60',
        text: mapStatus['Suspended']
      }
    } as const;
    const config = (statusConfig as any)[status] || statusConfig.INACTIVE;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getVerificationBadge = (status: VerificationStatus) => {
    const verificationConfig = {
      VERIFIED: { 
        color: 'bg-green-100/80 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200/70 dark:border-green-700/60',
        text: 'Verified' 
      },
      PENDING: { 
        color: 'bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200/70 dark:border-yellow-700/60',
        text: 'Pending' 
      },
      UNVERIFIED: { 
        color: 'bg-red-100/80 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200/70 dark:border-red-700/60',
        text: 'Unverified' 
      }
    };
    const config = (verificationConfig as any)[status] || verificationConfig.UNVERIFIED;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-left font-medium text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
    >
      <span>{children}</span>
      {sortField === field && (
        sortDirection === 'asc' ? (
          <ChevronUpIcon className="w-4 h-4" />
        ) : (
          <ChevronDownIcon className="w-4 h-4" />
        )
      )}
    </button>
  );

  if (loading && members.length === 0) {
    return <MembersTableSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 dark:text-red-400 mb-2">
          Error loading members: {error.message}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 dark:text-gray-400">
          No results found
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Desktop Table */}
      <div className="hidden lg:block bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
              <tr>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <SortableHeader field="firstName">Name</SortableHeader>
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Verification Status
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email Address
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Mobile Number
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Domain
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <SortableHeader field="dateCreated">Date Registered</SortableHeader>
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <SortableHeader field="lastActive">Date and Time Last Active</SortableHeader>
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedMembers.map((member, index) => (
                <tr
                  key={member.id}
                  onClick={() => onMemberClick?.(member)}
                  className={`transition-colors duration-150 cursor-pointer ${
                    index % 2 === 0 
                      ? 'bg-white dark:bg-gray-900' 
                      : 'bg-gray-50 dark:bg-gray-800'
                  } hover:bg-gray-100 dark:hover:bg-gray-800/70`}
                >
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {member.firstName} {member.lastName}
                    </div>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    {getVerificationBadge(member.verificationStatus)}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="text-gray-900 dark:text-white">{member.emailAddress}</div>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="text-gray-900 dark:text-white">{member.mobileNumber}</div>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="text-gray-900 dark:text-white">{member.domain}</div>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="text-gray-900 dark:text-white">
                      {new Date(member.dateCreated).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="text-gray-900 dark:text-white">
                      {member.lastActive ? format(new Date(member.lastActive), 'MMM dd, yyyy hh:mm a') : '—'}
                    </div>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    {getStatusBadge(member.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {sortedMembers.map((member, index) => (
          <div
            key={member.id}
            onClick={() => onMemberClick?.(member)}
            className={`rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-[1.02] ${
              index % 2 === 0 
                ? 'bg-white dark:bg-gray-800' 
                : 'bg-gray-50 dark:bg-gray-750'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {member.firstName} {member.lastName}
              </h3>
              <div className="flex space-x-2">
                {getVerificationBadge(member.verificationStatus)}
                {getStatusBadge(member.status)}
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Email:</span>
                <span className="text-gray-900 dark:text-white">{member.emailAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Mobile:</span>
                <span className="text-gray-900 dark:text-white">{member.mobileNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Domain:</span>
                <span className="text-gray-900 dark:text-white">{member.domain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Created:</span>
                <span className="text-gray-900 dark:text-white">
                  {new Date(member.dateCreated).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Last Active:</span>
                <span className="text-gray-900 dark:text-white">
                  {member.lastActive ? format(new Date(member.lastActive), 'MMM dd, yyyy hh:mm a') : '—'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasNextPage && (
        <div className="text-center">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 hover:shadow-lg transform"
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}

function MembersTableSkeleton() {
  return (
    <div className="space-y-6">
      {/* Table Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex space-x-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-1" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-1" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
