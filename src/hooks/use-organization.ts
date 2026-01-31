import { useOrganization as useOrgContext } from '@/components/providers/organization-provider';

export function useOrganization() {
    return useOrgContext();
}
