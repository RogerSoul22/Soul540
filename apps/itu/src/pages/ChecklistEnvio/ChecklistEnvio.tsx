import { ChecklistDeliveryScreen } from '../../../../../packages/screens/src/index';
import { franchiseTitle } from '../../franchise-pwa';
import { getFranchiseSlug } from '../../franchise-path';
import { apiFetch } from '../../lib/api';

export default function ChecklistEnvio() {
  const slug = getFranchiseSlug();
  return <ChecklistDeliveryScreen apiFetch={apiFetch} storageScope={slug} systemName={franchiseTitle(slug)} />;
}
