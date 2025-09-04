import { useEffect, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { GET_MEMBERS } from '@/graphql/queries';
import { MembersInput, Member, MembersQueryResponse } from '@/graphql/types';
import { MOCK_MODE, mockMembers } from '@/graphql/apollo-client';

export interface MemberFilterOptions {
  names: string[];
  emails: string[];
  mobiles: string[];
  domains: string[];
  statuses: string[];
  verificationStatuses: string[];
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function useMemberFilterOptions(limit: number = 200) {
  const [options, setOptions] = useState<MemberFilterOptions>({
    names: [],
    emails: [],
    mobiles: [],
    domains: [],
    statuses: [],
    verificationStatuses: [],
  });

  const [loadMembers, { data, loading, error }] = useLazyQuery<MembersQueryResponse>(GET_MEMBERS, {
    fetchPolicy: 'cache-first',
  });

  useEffect(() => {
    if (MOCK_MODE) {
      processMembers(mockMembers);
      return;
    }
    const input: MembersInput = { first: limit };
    loadMembers({ variables: { input } });
  }, [limit, loadMembers]);

  useEffect(() => {
    if (!data || MOCK_MODE) return; // mock handled above
    const members = (data.members?.edges ?? []).map(e => e.node);
    processMembers(members);
  }, [data]);

  const processMembers = (members: Member[]) => {
    const names = unique(
      members.map(m => `${m.firstName}${m.lastName ? ' ' + m.lastName : ''}`.trim()).filter(Boolean)
    );
    const emails = unique(members.map(m => m.emailAddress).filter(Boolean));
    const mobiles = unique(members.map(m => m.mobileNumber).filter(Boolean));
    const domains = unique(members.map(m => m.domain).filter(Boolean));
    const statuses = unique(members.map(m => m.status));
    const verificationStatuses = unique(members.map(m => m.verificationStatus));

    setOptions({ names, emails, mobiles, domains, statuses, verificationStatuses });
  };

  return {
    options,
    loading,
    error,
  };
}
