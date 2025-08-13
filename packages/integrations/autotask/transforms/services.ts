import { AutoTaskService } from '@/integrations/autotask/types/service';
import { generateUUID } from '@/lib/utils';
import { Tables, TablesInsert } from '@/types/db';

export default function transformServices(
  services: AutoTaskService[],
  job: Tables<'source', 'sync_jobs'>
): TablesInsert<'source', 'services'>[] {
  return services.map((service) => ({
    id: generateUUID(),
    tenant_id: job.tenant_id,
    source_id: job.source_id,

    external_id: service.id.toString(),
    name: service.name,
    description: service.description,
    status: service.isActive ? 'active' : 'inactive',
    sku: service.sku,

    metadata: service,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}
