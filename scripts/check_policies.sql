-- DIAGNOSTICO: Listar todas as políticas ativas
SELECT schemaname, tablename, policyname, cmd, permissive, roles 
FROM pg_policies 
WHERE tablename IN ('vehicles', 'leads', 'sales', 'organization_members', 'organizations')
ORDER BY tablename, cmd;
