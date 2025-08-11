import { AutoTaskCompany } from '@/integrations/autotask/types/company';
import { Tables, TablesInsert } from '@/types/db';

export default function transformCompanies(
  companies: AutoTaskCompany[],
  job: Tables<'public', 'source_sync_jobs'>
): TablesInsert<'source', 'sites'>[] {
  return companies.map((company) => ({
    tenant_id: job.tenant_id,
    source_id: job.source_id,

    external_id: company.id.toString(),
    name: company.companyName,
    enabled: company.isActive,
    external_created_at: company.createDate,

    metadata: company,
  }));
}
