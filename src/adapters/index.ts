import { GenericGovernmentFormAdapter } from '@/adapters/GenericGovernmentFormAdapter';
import { GovernmentPortalAdapter } from '@/adapters/GovernmentPortalAdapter';
import type { GovernmentFormAdapter } from '@/adapters/GovernmentFormAdapter';
import { TeletalkAdapter } from '@/adapters/TeletalkAdapter';

const adapters: GovernmentFormAdapter[] = [new TeletalkAdapter(), new GovernmentPortalAdapter(), new GenericGovernmentFormAdapter()];

export function resolveAdapter(): GovernmentFormAdapter | undefined {
  return adapters.find((adapter) => adapter.detect());
}
