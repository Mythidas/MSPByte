import MicrosoftEmailBreachAction from '@/integrations/microsoft/components/actions/MicrosoftEmailBreachAction';
import { ActionProps } from '@/shared/types';

export const SOURCE_ACTIONS: Record<string, Record<string, ActionProps>> = {
  'sophos-partner': {},
  'microsoft-365': {
    'email-breach': {
      label: 'Email Breach',
      description: '',
      content: (source) => <MicrosoftEmailBreachAction sourceId={source} />,
    },
  },
};
