'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Organization, OrganizationMember } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface OrganizationContextType {
    organizations: Organization[];
    currentOrganization: Organization | null;
    currentMember: OrganizationMember | null;
    isLoading: boolean;
    setCurrentOrganization: (org: Organization) => void;
}

const OrganizationContext = createContext<OrganizationContextType>({
    organizations: [],
    currentOrganization: null,
    currentMember: null,
    isLoading: true,
    setCurrentOrganization: () => { },
});

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
    const [currentMember, setCurrentMember] = useState<OrganizationMember | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchOrganizations = async () => {
            if (!supabase) {
                console.error('Supabase client not initialized');
                setIsLoading(false);
                return;
            }

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setIsLoading(false);
                    return;
                }

                // 1. Get members info for current user
                const { data: members, error: membersError } = await supabase
                    .from('organization_members')
                    .select('*, organization:organizations(*)')
                    .eq('user_id', user.id);

                if (membersError) throw membersError;

                if (members && members.length > 0) {
                    // Extract organizations from the relation
                    const orgs = members.map(m => m.organization as unknown as Organization);
                    setOrganizations(orgs);

                    // 2. Set default organization (load from storage or pick first)
                    const savedOrgId = localStorage.getItem('vendorcarro_org_id');
                    let selectedOrg = orgs.find(o => o.id === savedOrgId) || orgs[0];

                    setCurrentOrganization(selectedOrg);

                    // Set current member role for the selected org
                    const selectedMember = members.find(m => m.organization_id === selectedOrg.id);
                    setCurrentMember(selectedMember as OrganizationMember);

                    // Persist selection
                    localStorage.setItem('vendorcarro_org_id', selectedOrg.id);
                }
            } catch (error) {
                console.error('Error loading organizations:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrganizations();
    }, []);

    // Update current member when organization changes
    const handleSetOrganization = (org: Organization) => {
        setCurrentOrganization(org);
        localStorage.setItem('vendorcarro_org_id', org.id);

        // We need to re-fetch or find the member record for this new org
        // For simplicity, we can fetch all members heavily cached or just store them in state
        // Since we fetched all users memberships above, we can just find it in the list if we stored it
        // But for now, let's keep it simple. If we need role switching, we might need to refactor to keep `members` in state.

        // Reload page to ensure all components refresh with new org context if needed, 
        // or just let the state update propagate.
        window.location.reload();
    };

    return (
        <OrganizationContext.Provider
            value={{
                organizations,
                currentOrganization,
                currentMember,
                isLoading,
                setCurrentOrganization: handleSetOrganization
            }}
        >
            {children}
        </OrganizationContext.Provider>
    );
}

export function useOrganization() {
    return useContext(OrganizationContext);
}
