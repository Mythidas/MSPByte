export type MSGraphAuthenticationMethod = {
  id: string;
  displayName?: string;
  type: AuthenticationMethodType;
};

export type AuthenticationMethodType =
  | "sms"
  | "mobileApp"
  | "windowsHelloForBusiness"
  | "fido2"
  | "temporaryAccessPass"
  | "email"
  | "voice"
  | "password"
  | "unknown";
