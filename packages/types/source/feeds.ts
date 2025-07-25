export type MicrosoftEmailBreachMetadata = {
  steps: {
    revoke_sessions: {
      status: string;
    };
    reset_mfa: {
      status: string;
    };
    reset_password: {
      status: string;
      password: string;
    };
    check_inbox_rules: {
      status: string;
      data: {
        userId: string;
        rules: {
          name: string;
          actions: string[];
          description: string;
        }[];
      }[];
    };
  };
};
