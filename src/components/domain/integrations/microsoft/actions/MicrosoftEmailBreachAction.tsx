import { useRef, useState } from 'react';
import {
  Check,
  User,
  Mail,
  Shield,
  Settings,
  Eye,
  EyeOff,
  AlertCircleIcon,
  CheckCheckIcon,
  User2,
  RotateCcw,
  X,
} from 'lucide-react';
import { Tables } from '@/db/schema';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Display from '@/components/shared/Display';
import Loader from '@/components/shared/Loader';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';
import DataTable from '@/components/shared/table/DataTable';
import { DataTableColumnDef } from '@/types/data-table';
import { textColumn } from '@/components/shared/table/DataTableColumn';
import { getSourceIdentities } from '@/services/identities';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn, generatePassword, generateUUID, prettyText } from '@/lib/utils';
import SearchBar from '@/components/shared/SearchBar';
import { resolveSearch } from '@/lib/helpers/search';
import { Input } from '@/components/ui/input';
import { getSourceTenantsView } from '@/services/source/tenants';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import microsoft365EmailBreachResponse from '@/integrations/microsoft/services/actions/email';
import { getRow, insertRows } from '@/db/orm';
import { useUser } from '@/lib/providers/UserContext';
import { useAsync } from '@/hooks/common/useAsync';
import { MicrosoftEmailBreachMetadata } from '@/types/source/feeds';

type Props = {
  sourceId: string;
  site?: Tables<'sites'>;
  parent?: Tables<'sites'>;
};

type Step = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

export default function MicrosoftEmailBreachAction({}: Props) {
  const [currentPhase, setCurrentPhase] = useState('sites');
  const [selectedSite, setSelectedSite] = useState<Tables<'source_tenants_view'>>();
  const [selectedIdentities, setSelectedIdentities] = useState<Tables<'source_identities'>[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [feedId, setFeedId] = useState('');
  const newPassword = useRef(generatePassword());

  const { data: feed, isLoading } = useAsync({
    initial: undefined,
    fetcher: async () => {
      if (currentPhase === 'results' && feedId) {
        const feed = await getRow('activity_feeds', { filters: [['id', 'eq', feedId]] });
        if (feed.ok) {
          return feed.data;
        }
      }
    },
    deps: [currentPhase, feedId],
  });

  const phases: Record<string, string> = {
    sites: 'Select a site',
    users: 'Select users',
    processing: 'Processing response',
    results: 'Results',
  };

  const handleSiteSelect = (site: Tables<'source_tenants_view'>) => {
    setSelectedSite(site);
    setCurrentPhase('users');
  };
  const handelIdentitySubmit = (identities: Tables<'source_identities'>[]) => {
    setSelectedIdentities(identities);

    if (identities.length > 0) {
      setCurrentPhase('processing');
    }
  };

  const resetProcess = () => {
    setCurrentPhase('sites');
    setSelectedIdentities([]);
  };

  return (
    <div className="max-w-4xl mx-auto grid gap-4">
      {currentPhase !== 'results' && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Email Breach Response</AlertTitle>
          <AlertDescription>
            This action will immediately secure compromised accounts by signing out sessions,
            resetting passwords, removing MFA methods, and checking for malicious inbox rules.
          </AlertDescription>
        </Alert>
      )}
      {currentPhase === 'results' && (
        <Alert>
          <CheckCheckIcon />
          <AlertTitle>Breach Response Completed</AlertTitle>
          <AlertDescription>
            Successfully secured {selectedIdentities.length} identit
            {selectedIdentities.length === 1 ? 'y' : 'ies'}. Review the generated password and inbox
            rules below.
          </AlertDescription>
        </Alert>
      )}

      <Display>
        <div className="flex w-full justify-between items-center gap-2">
          <div className="flex gap-2 items-center">
            {Object.entries(phases).map(([key, value], index) => {
              const currentIndex = Object.keys(phases).indexOf(currentPhase);
              const disabled = index > currentIndex || currentIndex >= 2;

              return (
                <div key={index} className="flex gap-2 items-center">
                  <Button
                    className={cn(
                      disabled && 'text-muted-foreground bg-accent/50 hover:cursor-none',
                      key === currentPhase && 'text-primary'
                    )}
                    onClick={() => setCurrentPhase(key)}
                    disabled={disabled}
                    variant="secondary"
                  >
                    {index + 1}
                  </Button>
                  {key === currentPhase && <span className="text-primary">{value}</span>}
                </div>
              );
            })}
          </div>
          <Button variant="ghost" onClick={resetProcess} disabled={currentPhase === 'processing'}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </Display>

      {currentPhase === 'sites' && <SitesStep onSelect={handleSiteSelect} />}
      {currentPhase === 'users' && selectedSite && (
        <UsersStep siteId={selectedSite.site_id!} onSubmit={handelIdentitySubmit} />
      )}
      {currentPhase === 'processing' && (
        <ProcessingStep
          identities={selectedIdentities}
          password={newPassword.current}
          onComplete={(id) => {
            setCurrentPhase('results');
            setFeedId(id);
          }}
        />
      )}
      {currentPhase === 'results' &&
        (isLoading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User2 className="w-5 h-5 text-primary" />
                  Identities ({selectedIdentities.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[30vh] overflow-auto">
                  <div className="grid gap-2">
                    {selectedIdentities.map((id) => {
                      const inboxRules = feed
                        ? (
                            feed.metadata as MicrosoftEmailBreachMetadata
                          ).steps.check_inbox_rules.data.find(
                            (inbox) => inbox.userId === id.external_id
                          )?.rules
                        : [];
                      const inboxError = feed
                        ? (
                            feed.metadata as MicrosoftEmailBreachMetadata
                          ).steps.check_inbox_rules.errors?.find((err) => err.includes(id.email))
                        : undefined;

                      return (
                        <Display key={id.id}>
                          <div className="flex w-full justify-between">
                            <div>
                              <p className="font-medium">{id.name}</p>
                              <p className="text-sm text-muted-foreground">{id.email}</p>
                            </div>
                            <div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost">
                                    {inboxRules ? (
                                      <>
                                        <Mail
                                          className={cn(inboxRules.length > 0 && 'text-red-500')}
                                        />
                                        {inboxRules && inboxRules.length}
                                      </>
                                    ) : (
                                      <X className="text-red-500" />
                                    )}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="!max-w-[50vw] !w-[50vw]">
                                  <DialogHeader>
                                    <DialogTitle>{id.name}</DialogTitle>
                                    <DialogDescription>
                                      Possibly malicious or intrusive mailbox rules
                                    </DialogDescription>
                                  </DialogHeader>

                                  <ScrollArea className="max-h-[40vh]">
                                    <div className="grid gap-2">
                                      {inboxRules ? (
                                        inboxRules.map((rule) => {
                                          return (
                                            <Display key={rule.name}>
                                              <div className="grid">
                                                {rule.name}
                                                <span className="text-sm text-muted-foreground">
                                                  {prettyText(rule.description)}
                                                </span>
                                              </div>
                                            </Display>
                                          );
                                        })
                                      ) : (
                                        <span>{inboxError}</span>
                                      )}
                                    </div>
                                  </ScrollArea>

                                  <DialogFooter>
                                    <DialogClose asChild>
                                      <Button variant="secondary">Close</Button>
                                    </DialogClose>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </Display>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span>New Password</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword.current}
                    readOnly
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                This password has been set for all selected identities. Users will need to change it
                on first login.
              </CardFooter>
            </Card>
          </div>
        ))}
    </div>
  );
}

const SitesStep = ({ onSelect }: { onSelect: (site: Tables<'source_tenants_view'>) => void }) => {
  const { content } = useLazyLoad({
    fetcher: async () => {
      const sites = await getSourceTenantsView('microsoft-365');
      if (sites.ok) return sites.data.rows.sort((a, b) => a.site_name!.localeCompare(b.site_name!));
    },
    render: (sites) => {
      if (!sites) return <strong>Failed to fetch sites. Please refresh.</strong>;

      const handleClick = (site: Tables<'source_tenants_view'>) => {
        onSelect(site);
      };

      return (
        <DataTable
          data={sites}
          height="h-[50vh]"
          columns={
            [
              textColumn({
                key: 'site_name',
                label: 'Name',
                simpleSearch: true,
                cell: ({ row }) => (
                  <button
                    className="hover:cursor-pointer"
                    onClick={() => handleClick(row.original)}
                  >
                    {row.original.site_name}
                  </button>
                ),
              }),
            ] as DataTableColumnDef<Tables<'source_tenants_view'>>[]
          }
        />
      );
    },
    skeleton: () => <Loader />,
  });

  return content;
};

const UsersStep = ({
  siteId,
  onSubmit,
}: {
  siteId: string;
  onSubmit: (identities: Tables<'source_identities'>[]) => void;
}) => {
  const [selectedIdentities, setSelectedIdentities] = useState<Tables<'source_identities'>[]>([]);
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState(false);

  const { content } = useLazyLoad({
    fetcher: async () => {
      const identities = await getSourceIdentities('microsoft-365', [siteId]);
      if (identities.ok) return identities.data.rows;
    },
    render: (identities) => {
      if (!identities) return <strong>Failed to fetch users. Please refresh.</strong>;

      const handleIdentityToggle = (identity: Tables<'source_identities'>) => {
        setSelectedIdentities((prev) =>
          prev.includes(identity) ? prev.filter((id) => id.id !== identity.id) : [...prev, identity]
        );
      };

      const handleSubmit = () => {
        onSubmit(selectedIdentities);
      };

      return (
        <div className="flex flex-col gap-4">
          <div className="flex size-full flex-col gap-2">
            <h1>Select Identities to Secure</h1>
            <SearchBar placeholder="Search users" delay={0} onSearch={setSearch} />
            <ScrollArea className="max-h-[50vh]">
              <div className="grid gap-2">
                {identities
                  .filter((id) => {
                    return resolveSearch(search, [id.name, id.email]);
                  })
                  .map((identity) => (
                    <Display
                      key={identity.id}
                      lead={
                        <input
                          type="checkbox"
                          id={identity.id}
                          checked={selectedIdentities.includes(identity)}
                          onChange={() => handleIdentityToggle(identity)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      }
                    >
                      <div>
                        <p className="font-medium">{identity.name}</p>
                        <p className="text-sm text-muted-foreground">{identity.email}</p>
                      </div>
                    </Display>
                  ))}
              </div>
            </ScrollArea>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {selectedIdentities.length} identit{selectedIdentities.length === 1 ? 'y' : 'ies'}{' '}
              selected
            </p>
            <Dialog open={dialog} onOpenChange={setDialog}>
              <DialogTrigger asChild>
                <Button disabled={selectedIdentities.length === 0}>Start Breach Response</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Users</DialogTitle>
                  <DialogDescription>
                    Confirm the users that will be reset. This action is not reversable.
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[40vh]">
                  <div className="grid gap-2">
                    {selectedIdentities.map((id) => {
                      return (
                        <Display key={id.id}>
                          <div className="flex flex-col">
                            <span>{id.name}</span>
                            <span className="text-muted-foreground">{id.email}</span>
                          </div>
                        </Display>
                      );
                    })}
                  </div>
                </ScrollArea>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleSubmit}>Accept</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      );
    },
    skeleton: () => <Loader />,
    deps: [],
  });

  return content;
};

const ProcessingStep = ({
  identities,
  password,
  onComplete,
}: {
  identities: Tables<'source_identities'>[];
  password: string;
  onComplete: (feedId: string) => void;
}) => {
  const steps: Step[] = [
    {
      id: 'revoke_sessions',
      title: 'Sign out of sessions',
      description: 'Terminating all active sessions across devices',
      icon: <User className="w-4 h-4" />,
    },
    {
      id: 'reset_password',
      title: 'Reset Password',
      description: 'Generating new secure password',
      icon: <Shield className="w-4 h-4" />,
    },
    {
      id: 'reset_mfa',
      title: 'Remove MFA methods',
      description: 'Clearing all multi-factor authentication methods',
      icon: <Settings className="w-4 h-4" />,
    },
    {
      id: 'check_inbox_rules',
      title: 'Check inbox rules',
      description: 'Scanning for suspicious email forwarding rules',
      icon: <Mail className="w-4 h-4" />,
    },
  ];

  const [stepStatuses, setStepStatuses] = useState(steps);
  const feedId = useRef(generateUUID());
  const postedRef = useRef(false);
  const { user } = useUser();

  const { content } = useLazyLoad({
    fetcher: async () => {
      if (!postedRef.current) {
        postedRef.current = true;
        const feed = await insertRows('activity_feeds', {
          rows: [
            {
              id: feedId.current,
              tenant_id: identities[0].tenant_id,
              user_id: user?.id || null,
              site_id: identities[0].site_id,
              source_id: identities[0].source_id,
              type: 'security',
              action: 'email_breach_response',
              status: 'in_progress',
              summary: `Started breach response for ${identities.length} users`,
              metadata: {
                identities: identities.map((id) => id.email),
                steps: {
                  revoke_sessions: {
                    status: 'in_progress',
                  },
                  reset_password: {
                    status: 'pending',
                  },
                  reset_mfa: {
                    status: 'pending',
                  },
                  check_inbox_rules: {
                    status: 'pending',
                  },
                },
              },
              trigger_source: 'user',
            },
          ],
        });

        if (feed.ok) {
          microsoft365EmailBreachResponse(feed.data[0], identities, password);
          setStepStatuses((prev) =>
            prev.map((step, i) => (i === 0 ? { ...step, status: 'running' } : step))
          );
          return feed.data[0];
        }
      }

      const feed = await getRow('activity_feeds', { filters: [['id', 'eq', feedId.current]] });
      if (feed.ok) {
        if (
          Object.entries(
            (feed.data.metadata as { steps: Record<string, { status: string }> }).steps
          ).every(([_key, value]) => value.status !== 'pending' && value.status !== 'in_progress')
        ) {
          onComplete(feedId.current);
        }
        return feed.data;
      }
    },
    render: (data) => {
      if (!data) return null;
      type StepsData = { status: string; data?: unknown };
      type Metadata = {
        revoke_sessions: StepsData;
        reset_password: StepsData;
        reset_mfa: StepsData;
        check_inbox_rules: StepsData;
      };
      const metadata = data.metadata as { steps: Metadata };

      return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Processing Response</h2>
            <p className="text-muted-foreground">
              Securing {identities.length} identit
              {identities.length === 1 ? 'y' : 'ies'}...
            </p>
          </div>

          <div className="space-y-4">
            {stepStatuses.map((step) => (
              <div key={step.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    metadata.steps[step.id as keyof Metadata].status === 'completed'
                      ? 'bg-green-100 text-green-600'
                      : metadata.steps[step.id as keyof Metadata].status === 'in_progress'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {metadata.steps[step.id as keyof Metadata].status === 'completed' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                {metadata.steps[step.id as keyof Metadata].status === 'in_progress' && (
                  <div className="flex-shrink-0">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    },
    skeleton: () => <Loader />,
    deps: [identities],
    refetchInterval: 2000,
  });

  return content;
};
