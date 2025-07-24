import MicrosoftEmailBreachAction from '@/components/source/integrations/microsoft/actions/MicrosoftEmailBreachAction';
import { ActionProps } from '@/types';

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
