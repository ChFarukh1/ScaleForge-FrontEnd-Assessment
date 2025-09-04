'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { Member, MemberStatus, VerificationStatus } from '@/graphql/types';

interface MemberProfileModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MemberProfileModal({ member, isOpen, onClose }: MemberProfileModalProps) {
  if (!isOpen || !member) return null;

  const getStatusBadge = (status: MemberStatus) => {
    const statusConfig = {
      ACTIVE: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', text: 'Active' },
      INACTIVE: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', text: 'Inactive' },
      SUSPENDED: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', text: 'Suspended' }
    };
    
    const config = statusConfig[status] || statusConfig.INACTIVE;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getVerificationBadge = (status: VerificationStatus) => {
    const verificationConfig = {
      VERIFIED: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', text: 'Verified' },
      PENDING: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', text: 'Pending' },
      UNVERIFIED: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', text: 'Unverified' }
    };
    
    const config = verificationConfig[status] || verificationConfig.UNVERIFIED;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Member Profile
              </h3>
              <button
                onClick={onClose}
                className="rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {member.firstName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {member.firstName} {member.lastName}
                </h2>
                <div className="flex justify-center space-x-2">
                  {getVerificationBadge(member.verificationStatus)}
                  {getStatusBadge(member.status)}
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                  Contact Information
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Email:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{member.emailAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Mobile:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{member.mobileNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Domain:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{member.domain}</span>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                  Account Information
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Date Created:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(member.dateCreated).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Last Active:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(member.lastActive).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Member ID:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                      {member.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Details */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                  Status Details
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Verification Status:</span>
                    {getVerificationBadge(member.verificationStatus)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Account Status:</span>
                    {getStatusBadge(member.status)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                Edit Member
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
