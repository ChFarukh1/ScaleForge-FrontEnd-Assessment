import { useState, useCallback, useMemo, useEffect } from 'react';
import { useLazyQuery, ApolloError } from '@apollo/client';
import {
  GET_MEMBERS,
  GET_MEMBERS_BY_NAME,
  GET_MEMBERS_BY_EMAIL,
  GET_MEMBERS_BY_MOBILE,
} from '@/graphql/queries';
import {
  MembersQueryResponse,
  MembersByNameQueryResponse,
  MembersByEmailAddressQueryResponse,
  MembersByMobileNumberQueryResponse,
  MembersInput,
  MembersFilterInput,
  Member,
  PageInfo,
} from '@/graphql/types';
import { MOCK_MODE, mockMembers } from '@/graphql/apollo-client';

export interface UseMembersOptions {
  pageSize?: number;
  initialFilters?: MembersFilterInput;
}

export interface UseMembersReturn {
  // Data
  members: Member[];
  pageInfo: PageInfo | null;
  totalCount: number;
  
  // Loading states
  loading: boolean;
  loadingMore: boolean;
  
  // Error handling
  error: ApolloError | null;
  
  // Pagination
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
  pageSize: number;
  
  // Actions
  fetchMembers: (filters?: MembersFilterInput, resetPagination?: boolean) => void;
  fetchMore: () => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
  searchByName: (searchTerm: string) => void;
  searchByEmail: (searchTerm: string) => void;
  searchByMobile: (searchTerm: string) => void;
  clearSearch: () => void;
  clearAllFilters: () => void;
  updateFilters: (filters: Partial<MembersFilterInput>, replace?: boolean) => void;
  
  // State
  filters: MembersFilterInput;
  searchType: 'none' | 'name' | 'email' | 'mobile';
  searchTerm: string;
}

export function useMembers(options: UseMembersOptions = {}): UseMembersReturn {
  const { pageSize: initialPageSize = 20, initialFilters = {} } = options;
  
  // State
  const [filters, setFilters] = useState<MembersFilterInput>(initialFilters);
  const [searchType, setSearchType] = useState<'none' | 'name' | 'email' | 'mobile'>('none');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [cursorStack, setCursorStack] = useState<Array<string | null>>([null]); // index = page-1
  
  // GraphQL queries
  const [getMembers, { loading, error, data }] = useLazyQuery<MembersQueryResponse>(
    GET_MEMBERS,
    { notifyOnNetworkStatusChange: true }
  );
  
  const [getMembersByName, { loading: loadingByName, error: errorByName, data: dataByName }] = 
    useLazyQuery<MembersByNameQueryResponse>(GET_MEMBERS_BY_NAME, { notifyOnNetworkStatusChange: true });
  
  const [getMembersByEmail, { loading: loadingEmail, error: errorEmail, data: dataEmail }] = 
    useLazyQuery<MembersByEmailAddressQueryResponse>(GET_MEMBERS_BY_EMAIL, { notifyOnNetworkStatusChange: true });
  
  const [getMembersByMobile, { loading: loadingMobile, error: errorMobile, data: dataMobile }] = 
    useLazyQuery<MembersByMobileNumberQueryResponse>(GET_MEMBERS_BY_MOBILE, { notifyOnNetworkStatusChange: true });
  
  // Mock data handling that respects active search type
  const getMockMembers = useCallback((searchTerm?: string, filters?: MembersFilterInput, type: 'none' | 'name' | 'email' | 'mobile' = 'none') => {
    let filteredMembers = [...mockMembers];
    
    // Apply search filter respecting the target field
    if (searchTerm && type !== 'none') {
      const term = searchTerm.toLowerCase();
      if (type === 'name') {
        filteredMembers = filteredMembers.filter(member => 
          member.firstName.toLowerCase().includes(term) || member.lastName.toLowerCase().includes(term)
        );
      } else if (type === 'email') {
        filteredMembers = filteredMembers.filter(member => member.emailAddress.toLowerCase().includes(term));
      } else if (type === 'mobile') {
        filteredMembers = filteredMembers.filter(member => member.mobileNumber.includes(searchTerm));
      }
    }
    
    // Apply status filter
    if (filters?.status) {
      filteredMembers = filteredMembers.filter(member => member.status === filters.status);
    }
    
    // Apply verification status filter
    if (filters?.verificationStatus) {
      filteredMembers = filteredMembers.filter(member => member.verificationStatus === filters.verificationStatus);
    }
    
    // Apply domain filter
    if (filters?.domain) {
      filteredMembers = filteredMembers.filter(member => member.domain === filters.domain);
    }
    
    return filteredMembers;
  }, []);
  
  // Helper function to extract data from different response types
  const extractDataFromResponse = useCallback((response: any, searchType: string) => {
    if (!response) return null;
    
    switch (searchType) {
      case 'name':
        return response.membersByName;
      case 'email':
        return response.membersByEmailAddress;
      case 'mobile':
        return response.membersByMobileNumber;
      default:
        return response.members;
    }
  }, []);
  
  // Determine which data source to use based on search type
  const activeData = useMemo(() => {
    if (MOCK_MODE) {
      const mockData = getMockMembers(searchTerm, filters, searchType);
      const mockConnection = {
        edges: mockData.map(member => ({ node: member, cursor: member.id })),
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: mockData.length,
      };
      
      // Return in the same format as the real API responses
      switch (searchType) {
        case 'name':
          return { membersByName: mockConnection };
        case 'email':
          return { membersByEmailAddress: mockConnection };
        case 'mobile':
          return { membersByMobileNumber: mockConnection };
        default:
          return { members: mockConnection };
      }
    }
    
    switch (searchType) {
      case 'name':
        return dataByName;
      case 'email':
        return dataEmail;
      case 'mobile':
        return dataMobile;
      default:
        return data;
    }
  }, [searchType, data, dataByName, dataEmail, dataMobile, MOCK_MODE, searchTerm, filters, getMockMembers]);
  
  const activeLoading = useMemo(() => {
    if (MOCK_MODE) return false;
    
    switch (searchType) {
      case 'name':
        return loadingByName;
      case 'email':
        return loadingEmail;
      case 'mobile':
        return loadingMobile;
      default:
        return loading;
    }
  }, [searchType, loading, loadingByName, loadingEmail, loadingMobile, MOCK_MODE]);
  
  const activeError = useMemo(() => {
    if (MOCK_MODE) return null;
    
    switch (searchType) {
      case 'name':
        return errorByName;
      case 'email':
        return errorEmail;
      case 'mobile':
        return errorMobile;
      default:
        return error;
    }
  }, [searchType, error, errorByName, errorEmail, errorMobile, MOCK_MODE]);
  
  // Extract data from response
  const members = useMemo(() => {
    if (!activeData) return [];
    
    const connection = extractDataFromResponse(activeData, searchType);
    if (!connection?.edges) return [];
    
    return connection.edges.map((edge: { node: Member; cursor: string }) => edge.node);
  }, [activeData, searchType, extractDataFromResponse]);
  
  const pageInfo = useMemo(() => {
    if (!activeData) return null;
    
    const connection = extractDataFromResponse(activeData, searchType);
    return connection?.pageInfo || null;
  }, [activeData, searchType, extractDataFromResponse]);
  
  const totalCount = useMemo(() => {
    if (!activeData) return 0;
    
    const connection = extractDataFromResponse(activeData, searchType);
    return connection?.totalCount || 0;
  }, [activeData, searchType, extractDataFromResponse]);
  
  // Computed values
  const hasNextPage = pageInfo?.hasNextPage || false;
  const hasPreviousPage = currentPage > 1;
  const loadingMore = activeLoading && currentPage > 1;
  
  // Actions
  const fetchMembers = useCallback((
    newFilters?: MembersFilterInput,
    resetPagination = false
  ) => {
    const combinedFilters = { ...filters, ...newFilters } as MembersFilterInput;

    if (MOCK_MODE) {
      // Mock mode - just update filters and let memoized data handle it
      if (resetPagination) {
        setCurrentPage(1);
        setEndCursor(null);
      }
      setFilters(combinedFilters);
      return;
    }
    
    const afterCursor = resetPagination ? undefined : (endCursor || undefined);

    if (resetPagination) {
      setCurrentPage(1);
      setEndCursor(null);
    }

    // Keep current search type active; call the appropriate operation
    if (searchType === 'name' && searchTerm) {
      getMembersByName({ variables: { search: searchTerm, first: pageSize, after: afterCursor, filter: combinedFilters } });
    } else if (searchType === 'email' && searchTerm) {
      getMembersByEmail({ variables: { search: searchTerm, first: pageSize, after: afterCursor, filter: combinedFilters } });
    } else if (searchType === 'mobile' && searchTerm) {
      getMembersByMobile({ variables: { search: searchTerm, first: pageSize, after: afterCursor, filter: combinedFilters } });
    } else {
      const input: MembersInput = { first: pageSize, after: afterCursor, filter: combinedFilters };
      getMembers({ variables: { input } });
    }

    setFilters(combinedFilters);
  }, [filters, endCursor, pageSize, getMembers, getMembersByName, getMembersByEmail, getMembersByMobile, searchType, searchTerm, MOCK_MODE]);
  
  const fetchMore = useCallback(() => {
    if (MOCK_MODE) return; // No pagination in mock mode
    if (!hasNextPage || !pageInfo?.endCursor) return;

    const after = pageInfo.endCursor;

    if (searchType === 'name' && searchTerm) {
      getMembersByName({ variables: { search: searchTerm, first: pageSize, after, filter: filters } });
    } else if (searchType === 'email' && searchTerm) {
      getMembersByEmail({ variables: { search: searchTerm, first: pageSize, after, filter: filters } });
    } else if (searchType === 'mobile' && searchTerm) {
      getMembersByMobile({ variables: { search: searchTerm, first: pageSize, after, filter: filters } });
    } else {
      const input: MembersInput = { first: pageSize, after, filter: filters };
      getMembers({ variables: { input } });
    }
    setCurrentPage(prev => prev + 1);
    setEndCursor(after);
    setCursorStack(prev => {
      const next = [...prev];
      next[prev.length] = after as string; // store cursor for new page
      return next;
    });
  }, [hasNextPage, pageInfo?.endCursor, pageSize, filters, getMembers, getMembersByName, getMembersByEmail, getMembersByMobile, searchType, searchTerm, MOCK_MODE]);
  
  const searchByName = useCallback((term: string) => {
    if (!term.trim()) {
      clearSearch();
      return;
    }
    
    setSearchTerm(term);
    setSearchType('name');
    setCurrentPage(1);
    setEndCursor(null);
    
    if (MOCK_MODE) return; // Mock mode handles search in memoized data
    
    getMembersByName({ variables: { search: term, first: pageSize, filter: { ...filters } } });
  }, [filters, pageSize, getMembersByName, MOCK_MODE]);
  
  const searchByEmail = useCallback((term: string) => {
    if (!term.trim()) {
      clearSearch();
      return;
    }
    
    setSearchTerm(term);
    setSearchType('email');
    setCurrentPage(1);
    setEndCursor(null);
    
    if (MOCK_MODE) return; // Mock mode handles search in memoized data
    
    getMembersByEmail({ variables: { search: term, first: pageSize, filter: { ...filters } } });
  }, [filters, pageSize, getMembersByEmail, MOCK_MODE]);
  
  const searchByMobile = useCallback((term: string) => {
    if (!term.trim()) {
      clearSearch();
      return;
    }
    
    setSearchTerm(term);
    setSearchType('mobile');
    setCurrentPage(1);
    setEndCursor(null);
    
    if (MOCK_MODE) return; // Mock mode handles search in memoized data
    
    getMembersByMobile({ variables: { search: term, first: pageSize, filter: { ...filters } } });
  }, [filters, pageSize, getMembersByMobile, MOCK_MODE]);
  
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchType('none');
    setCurrentPage(1);
    setEndCursor(null);
    setCursorStack([null]);
    if (MOCK_MODE) {
      // just trigger re-compute by updating filters
      setFilters(prev => ({ ...prev }));
      return;
    }
    const input: MembersInput = { first: pageSize, filter: { ...filters } };
    getMembers({ variables: { input } });
  }, [filters, getMembers, pageSize, MOCK_MODE]);

  const clearAllFilters = useCallback(() => {
    // Reset all filters and search, refetch first page
    setFilters({});
    setSearchTerm('');
    setSearchType('none');
    setCurrentPage(1);
    setEndCursor(null);
    setCursorStack([null]);

    if (MOCK_MODE) {
      // Nothing to fetch; memoized selectors will recompute
      return;
    }
    const input: MembersInput = { first: pageSize, filter: {} };
    getMembers({ variables: { input } });
  }, [getMembers, pageSize, MOCK_MODE]);
  
  const updateFilters = useCallback((newFilters: Partial<MembersFilterInput>, replace: boolean = false) => {
    const updatedFilters = replace ? { ...(newFilters as MembersFilterInput) } : { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setCurrentPage(1);
    setEndCursor(null);
    setCursorStack([null]);
    fetchMembers(updatedFilters, true);
  }, [filters, fetchMembers]);
  
  const nextPage = useCallback(() => {
    fetchMore();
  }, [fetchMore]);

  const prevPage = useCallback(() => {
    if (MOCK_MODE) return; // Not supported in mock mode
    if (currentPage <= 1) return;
    const prevCursor = cursorStack[currentPage - 2] || null;

    if (searchType === 'name' && searchTerm) {
      getMembersByName({ variables: { search: searchTerm, first: pageSize, after: prevCursor || undefined, filter: filters } });
    } else if (searchType === 'email' && searchTerm) {
      getMembersByEmail({ variables: { search: searchTerm, first: pageSize, after: prevCursor || undefined, filter: filters } });
    } else if (searchType === 'mobile' && searchTerm) {
      getMembersByMobile({ variables: { search: searchTerm, first: pageSize, after: prevCursor || undefined, filter: filters } });
    } else {
      const input: MembersInput = { first: pageSize, after: prevCursor || undefined, filter: filters };
      getMembers({ variables: { input } });
    }

    setCurrentPage(prev => Math.max(1, prev - 1));
    setEndCursor(prevCursor);
  }, [MOCK_MODE, currentPage, cursorStack, pageSize, filters, getMembers, getMembersByName, getMembersByEmail, getMembersByMobile, searchType, searchTerm]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1);
    setEndCursor(null);
    setCursorStack([null]);
    fetchMembers(filters, true);
  }, [filters, fetchMembers]);
  
  // Initial fetch
  const initialFetch = useCallback(() => {
    if (MOCK_MODE) {
      // Mock mode - no need to fetch
      return;
    }
    
    if (!activeData && !activeLoading) {
      fetchMembers();
    }
  }, [activeData, activeLoading, fetchMembers, MOCK_MODE]);
  
  // Auto-fetch on mount
  useEffect(() => {
    initialFetch();
  }, [initialFetch]);
  
  return {
    // Data
    members,
    pageInfo,
    totalCount,
    
    // Loading states
    loading: activeLoading,
    loadingMore,
    
    // Error handling
    error: activeError || null,
    
    // Pagination
    hasNextPage,
    hasPreviousPage,
    currentPage,
    pageSize,
    
    // Actions
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
    
    // State
    filters,
    searchType,
    searchTerm,
  };
}
