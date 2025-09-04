import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

// Check if we should use mock mode
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true' || 
                  !process.env.NEXT_PUBLIC_GRAPHQL_URL || 
                  !process.env.NEXT_PUBLIC_ACCESS_TOKEN;

// Mock data for offline testing
const mockMembers = [
  {
    id: '1', firstName: 'Browni', lastName: 'ex23',
    emailAddress: 'browni23@example.com', mobileNumber: '+44 7300 000001',
    dateCreated: '2024-01-12T10:00:00Z', lastActive: '2024-01-19T08:35:00Z',
    status: 'ACTIVE' as const, verificationStatus: 'VERIFIED' as const, domain: 'tastingnotes.app'
  },
  {
    id: '2', firstName: 'Uvie', lastName: '',
    emailAddress: 'uvie@example.com', mobileNumber: '+44 7300 000002',
    dateCreated: '2024-01-04T09:00:00Z', lastActive: '2024-01-18T12:15:00Z',
    status: 'ACTIVE' as const, verificationStatus: 'PENDING' as const, domain: 'tastingnotes.app'
  },
  {
    id: '3', firstName: 'Derek', lastName: '',
    emailAddress: 'derek@example.com', mobileNumber: '+44 7300 000003',
    dateCreated: '2024-01-22T14:00:00Z', lastActive: '2024-01-25T10:44:00Z',
    status: 'INACTIVE' as const, verificationStatus: 'UNVERIFIED' as const, domain: 'moonlodge.app'
  },
  {
    id: '4', firstName: 'Aden', lastName: '',
    emailAddress: 'aden@example.com', mobileNumber: '+44 7300 000004',
    dateCreated: '2024-01-08T11:20:00Z', lastActive: '2024-01-17T16:17:00Z',
    status: 'ACTIVE' as const, verificationStatus: 'VERIFIED' as const, domain: 'kayakshop.net'
  },
  {
    id: '5', firstName: 'Ailson', lastName: '',
    emailAddress: 'ailson@example.com', mobileNumber: '+44 7300 000005',
    dateCreated: '2024-01-02T08:10:00Z', lastActive: '2024-01-13T07:22:00Z',
    status: 'ACTIVE' as const, verificationStatus: 'PENDING' as const, domain: 'kayakshop.net'
  },
  {
    id: '6', firstName: 'Ruben', lastName: '',
    emailAddress: 'ruben@example.com', mobileNumber: '+44 7300 000006',
    dateCreated: '2024-01-14T10:40:00Z', lastActive: '2024-01-21T09:41:00Z',
    status: 'SUSPENDED' as const, verificationStatus: 'UNVERIFIED' as const, domain: 'moonlodge.app'
  },
  {
    id: '7', firstName: 'Owen', lastName: '',
    emailAddress: 'owen@example.com', mobileNumber: '+44 7300 000007',
    dateCreated: '2024-01-06T12:00:00Z', lastActive: '2024-01-19T13:11:00Z',
    status: 'INACTIVE' as const, verificationStatus: 'UNVERIFIED' as const, domain: 'alphacorp.io'
  },
  {
    id: '8', firstName: 'Dustin', lastName: '',
    emailAddress: 'dustin@example.com', mobileNumber: '+44 7300 000008',
    dateCreated: '2024-01-09T10:10:00Z', lastActive: '2024-01-20T10:10:00Z',
    status: 'INACTIVE' as const, verificationStatus: 'UNVERIFIED' as const, domain: 'alphacorp.io'
  },
  {
    id: '9', firstName: 'browni', lastName: 'ex23',
    emailAddress: 'browni23b@example.com', mobileNumber: '+44 7300 000009',
    dateCreated: '2024-01-18T09:00:00Z', lastActive: '2024-01-24T18:00:00Z',
    status: 'INACTIVE' as const, verificationStatus: 'UNVERIFIED' as const, domain: 'tastingnotes.app'
  },
  {
    id: '10', firstName: 'Philip', lastName: '',
    emailAddress: 'philip@example.com', mobileNumber: '+44 7300 000010',
    dateCreated: '2024-01-20T09:33:00Z', lastActive: '2024-01-23T12:45:00Z',
    status: 'ACTIVE' as const, verificationStatus: 'VERIFIED' as const, domain: 'kayakshop.net'
  },
  {
    id: '11', firstName: 'Jane', lastName: 'Smith',
    emailAddress: 'jane.smith@example.com', mobileNumber: '+44 7300 000011',
    dateCreated: '2024-01-10T00:00:00Z', lastActive: '2024-01-19T00:00:00Z',
    status: 'ACTIVE' as const, verificationStatus: 'PENDING' as const, domain: 'example.com'
  },
  {
    id: '12', firstName: 'John', lastName: 'Doe',
    emailAddress: 'john.doe@example.com', mobileNumber: '+44 7300 000012',
    dateCreated: '2024-01-15T00:00:00Z', lastActive: '2024-01-20T00:00:00Z',
    status: 'ACTIVE' as const, verificationStatus: 'VERIFIED' as const, domain: 'example.com'
  }
];

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'https://report.development.opexa.io/graphql',
});

const authLink = setContext((_, { headers }) => {
  // Remove 'Bearer ' prefix if it exists in the token
  const token = process.env.NEXT_PUBLIC_ACCESS_TOKEN?.replace('Bearer ', '') || '';
  
  return {
    headers: {
      ...headers,
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    
    // If we're in mock mode or have network errors, we could implement retry logic here
    if (MOCK_MODE) {
      console.log('Running in mock mode - using fallback data');
    }
  }
});

export const client = new ApolloClient({
  link: MOCK_MODE ? httpLink : from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          members: {
            keyArgs: false,
            merge(existing = [], incoming, { args }) {
              // Handle pagination merging
              if (args?.input?.first && !args?.input?.after) {
                // First page, replace existing data
                return incoming;
              }
              // Subsequent pages, append to existing data
              return [...existing, ...incoming];
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    },
  },
});

// Export mock mode flag for use in hooks
export { MOCK_MODE, mockMembers };
