/**
 * SYNAPSE — Microsoft Graph API Service
 * Phase 4: Calendar sync scaffold
 *
 * ─── SETUP CHECKLIST (complete before Phase 6 OAuth activation) ───────────
 *
 *  1. Register an Azure app:
 *     https://portal.azure.com → Azure Active Directory → App Registrations → New registration
 *     - Name: Synapse
 *     - Supported account types: "Accounts in any organizational directory (Any Azure AD directory - Multitenant)"
 *     - Redirect URI: leave blank for now (add in step 4)
 *
 *  2. Note your Application (client) ID → paste into MS_GRAPH_CONFIG.clientId below
 *
 *  3. API Permissions → Add a permission → Microsoft Graph → Delegated:
 *     - Calendars.Read
 *     - offline_access
 *     - User.Read
 *     → Grant admin consent if your test account requires it
 *
 *  4. Install packages:
 *     npx expo install expo-auth-session expo-web-browser
 *
 *  5. Add to app.json under expo.scheme:
 *     "scheme": "synapse"
 *
 *  6. Add redirect URI in Azure portal:
 *     Authentication → Add a platform → Mobile and desktop applications
 *     Custom URI: https://auth.expo.io/@YOUR_EXPO_USERNAME/synapse
 *
 *  7. Replace the TODO values in MS_GRAPH_CONFIG below
 *
 *  Status: Scaffold ready — OAuth pending Azure app registration (Phase 6)
 * ─────────────────────────────────────────────────────────────────────────
 */

// ── Azure Config ──────────────────────────────────────────────────────────
export const MS_GRAPH_CONFIG = {
  clientId:    '3bac7f55-6061-4086-a0ec-f11419061420',   // TODO: replace after Azure app registration
  tenantId:    'common',                 // 'common' = any Microsoft/school account
  scopes:      ['Calendars.Read', 'offline_access', 'User.Read'],
  redirectUri: 'https://auth.expo.io/@YOUR_EXPO_USERNAME/synapse', // TODO: replace
};

// ── Types ─────────────────────────────────────────────────────────────────

export interface MsGraphEvent {
  id: string;
  subject: string;
  start: { dateTime: string; timeZone: string };
  end:   { dateTime: string; timeZone: string };
  location?: { displayName: string };
  isAllDay: boolean;
  categories?: string[];
  webLink?: string;
}

export interface MsGraphUser {
  displayName: string;
  mail: string;
  userPrincipalName: string;
}

interface MsCalendarResponse {
  value: MsGraphEvent[];
  '@odata.nextLink'?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────

/** Zero-pad a number to 2 digits */
const pad = (n: number) => String(n).padStart(2, '0');

/** Days-from-today offset for a given Date */
function dateOffset(d: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = new Date(d);
  day.setHours(0, 0, 0, 0);
  return Math.round((day.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Convert a raw MsGraphEvent into a shape compatible with CalendarEvent
 * (the fields used by useCalendar and CalendarScreen).
 */
export function parseMsGraphEvent(ev: MsGraphEvent) {
  const start = new Date(ev.start.dateTime);
  const end   = new Date(ev.end.dateTime);

  return {
    id:         `ms_${ev.id}`,
    title:      ev.subject,
    type:       'class' as const,       // MS Teams events are treated as classes
    startTime:  `${pad(start.getHours())}:${pad(start.getMinutes())}`,
    endTime:    ev.isAllDay ? undefined : `${pad(end.getHours())}:${pad(end.getMinutes())}`,
    venue:      ev.location?.displayName,
    color:      '#3D5AFE',              // primary blue for Teams-sourced classes
    source:     'teams' as const,
    dateOffset: dateOffset(start),
  };
}

// ── API Calls ─────────────────────────────────────────────────────────────

/**
 * Fetch calendar events for a date range from MS Graph.
 * `accessToken` comes from the expo-auth-session OAuth flow (see OAuth block below).
 */
export async function fetchMsCalendarEvents(
  accessToken: string,
  startDate: Date,
  endDate: Date,
): Promise<MsGraphEvent[]> {
  const url =
    `https://graph.microsoft.com/v1.0/me/calendarView` +
    `?startDateTime=${startDate.toISOString()}` +
    `&endDateTime=${endDate.toISOString()}` +
    `&$select=id,subject,start,end,location,isAllDay,categories,webLink` +
    `&$orderby=start/dateTime` +
    `&$top=50`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `MS Graph error ${res.status}: ${(err as any)?.error?.message ?? 'Unknown error'}`
    );
  }

  const data: MsCalendarResponse = await res.json();
  return data.value;
}

/**
 * Fetch basic profile info for the signed-in Microsoft account.
 * Used to verify the user is signing in with their university email.
 */
export async function fetchMsUserProfile(accessToken: string): Promise<MsGraphUser> {
  const res = await fetch(
    'https://graph.microsoft.com/v1.0/me?$select=displayName,mail,userPrincipalName',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error(`MS Graph profile error ${res.status}`);
  return res.json();
}

/*
 * ── OAuth Integration (activate in Phase 6) ────────────────────────────
 *
 * Add this to CalendarScreen.tsx (or a dedicated MsTeamsConnectButton component):
 *
 *   import * as AuthSession from 'expo-auth-session';
 *   import * as WebBrowser from 'expo-web-browser';
 *   WebBrowser.maybeCompleteAuthSession();
 *
 *   const discovery = {
 *     authorizationEndpoint:
 *       `https://login.microsoftonline.com/${MS_GRAPH_CONFIG.tenantId}/oauth2/v2.0/authorize`,
 *     tokenEndpoint:
 *       `https://login.microsoftonline.com/${MS_GRAPH_CONFIG.tenantId}/oauth2/v2.0/token`,
 *   };
 *
 *   const [request, response, promptAsync] = AuthSession.useAuthRequest(
 *     {
 *       clientId:    MS_GRAPH_CONFIG.clientId,
 *       scopes:      MS_GRAPH_CONFIG.scopes,
 *       redirectUri: AuthSession.makeRedirectUri({ scheme: 'synapse' }),
 *       responseType: AuthSession.ResponseType.Code,
 *       usePKCE: true,
 *     },
 *     discovery,
 *   );
 *
 *   useEffect(() => {
 *     if (response?.type === 'success') {
 *       // Exchange auth code for access token
 *       const { code } = response.params;
 *       AuthSession.exchangeCodeAsync(
 *         {
 *           clientId:     MS_GRAPH_CONFIG.clientId,
 *           code,
 *           redirectUri:  AuthSession.makeRedirectUri({ scheme: 'synapse' }),
 *           extraParams:  { code_verifier: request?.codeVerifier ?? '' },
 *         },
 *         discovery,
 *       ).then(tokenResponse => {
 *         // Store access token (e.g. in Supabase user metadata or AsyncStorage)
 *         const token = tokenResponse.accessToken;
 *         // Then fetch and merge calendar events:
 *         const weekStart = ...; // Monday of current week
 *         const weekEnd   = ...; // Sunday + 1 day
 *         fetchMsCalendarEvents(token, weekStart, weekEnd)
 *           .then(evs => evs.map(parseMsGraphEvent))
 *           .then(merged => setMsTeamsEvents(merged));
 *       });
 *     }
 *   }, [response]);
 *
 *   // Trigger login:
 *   <Button onPress={() => promptAsync()} title="Connect MS Teams" />
 * ─────────────────────────────────────────────────────────────────────────
 */
