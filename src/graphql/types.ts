// GraphQL Types for ScaleForge API

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
  endCursor: string;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  mobileNumber: string;
  dateCreated: string;
  lastActive: string;
  status: MemberStatus;
  verificationStatus: VerificationStatus;
  domain: string;
}

export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type VerificationStatus = 'VERIFIED' | 'PENDING' | 'UNVERIFIED';

export interface MembersConnection {
  edges: MemberEdge[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface MemberEdge {
  node: Member;
  cursor: string;
}

export interface DateRangeInput {
  gte?: string; // ISO-8601
  lte?: string; // ISO-8601
}

export interface MembersFilterInput {
  status?: MemberStatus;
  verificationStatus?: VerificationStatus;
  domain?: string;
  searchTerm?: string;
  // Optional server-side date filtering if supported by API
  dateTimeCreated?: DateRangeInput;
  dateTimeLastActive?: DateRangeInput;
}

export interface MembersInput {
  first: number;
  after?: string;
  filter?: MembersFilterInput;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface MembersQueryResponse {
  members: MembersConnection;
}

export interface MembersByNameQueryResponse {
  membersByName: MembersConnection;
}

export interface MembersByEmailAddressQueryResponse {
  membersByEmailAddress: MembersConnection;
}

export interface MembersByMobileNumberQueryResponse {
  membersByMobileNumber: MembersConnection;
}

// Error types
export interface GraphQLError {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: string[];
  extensions?: Record<string, any>;
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}
