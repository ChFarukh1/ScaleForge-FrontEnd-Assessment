import { gql } from '@apollo/client';

// Example query for fetching projects
export const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      name
      description
      status
      createdAt
      updatedAt
    }
  }
`;

// Example query for fetching a single project
export const GET_PROJECT = gql`
  query GetProject($id: ID!) {
    project(id: $id) {
      id
      name
      description
      status
      createdAt
      updatedAt
      tasks {
        id
        title
        description
        status
      }
    }
  }
`;

// Example mutation for creating a project
export const CREATE_PROJECT = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
      description
      status
      createdAt
    }
  }
`;

// Query for paginated members list
export const GET_MEMBERS = gql`
  query GetMembers($input: MembersInput!) {
    members(input: $input) {
      edges {
        node {
          id
          firstName
          lastName
          emailAddress
          mobileNumber
          dateCreated
          lastActive
          status
          verificationStatus
          domain
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

// Query for searching members by name (search param) + optional pagination/filter for combination
export const GET_MEMBERS_BY_NAME = gql`
  query GetMembersByName($search: String!, $first: Int, $after: String, $filter: MembersFilterInput) {
    membersByName(search: $search, first: $first, after: $after, filter: $filter) {
      edges {
        node {
          id
          firstName
          lastName
          emailAddress
          mobileNumber
          dateCreated
          lastActive
          status
          verificationStatus
          domain
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

// Query for searching members by email (search param)
export const GET_MEMBERS_BY_EMAIL = gql`
  query GetMembersByEmail($search: String!, $first: Int, $after: String, $filter: MembersFilterInput) {
    membersByEmailAddress(search: $search, first: $first, after: $after, filter: $filter) {
      edges {
        node {
          id
          firstName
          lastName
          emailAddress
          mobileNumber
          dateCreated
          lastActive
          status
          verificationStatus
          domain
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

// Query for searching members by mobile number (search param)
export const GET_MEMBERS_BY_MOBILE = gql`
  query GetMembersByMobile($search: String!, $first: Int, $after: String, $filter: MembersFilterInput) {
    membersByMobileNumber(search: $search, first: $first, after: $after, filter: $filter) {
      edges {
        node {
          id
          firstName
          lastName
          emailAddress
          mobileNumber
          dateCreated
          lastActive
          status
          verificationStatus
          domain
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

// Fragment for member data to avoid duplication
export const MEMBER_FRAGMENT = gql`
  fragment MemberFragment on Member {
    id
    firstName
    lastName
    emailAddress
    mobileNumber
    dateCreated
    lastActive
    status
    verificationStatus
    domain
  }
`;
