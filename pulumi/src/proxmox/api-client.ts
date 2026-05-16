import * as pulumiProxmox from '@muhlba91/pulumi-proxmoxve';
import * as proxmoxApi from '@openprox/proxmox-api';

export class ProxmoxHttpClient implements proxmoxApi.ApiRequestable {
  private apiBase: string;
  private getAuth: () => Promise<{
    headers: Record<string, string>;
    cookies: Record<string, string>;
  }>;
  private NODE_TLS_REJECT_UNAUTHORIZED: string | undefined;

  constructor(args: object & {endpoint?: string, apiToken?: string, username?: string, password?: string}) {
    const { endpoint, apiToken, username, password } = args;
    if (!endpoint) {
      throw new Error('Proxmox endpoint must be set');
    }
    this.apiBase = endpoint.replace(/\/$/, '');

    this.NODE_TLS_REJECT_UNAUTHORIZED =
      process.env.NODE_TLS_REJECT_UNAUTHORIZED;

    if (apiToken) {
      this.getAuth = async () => ({
        headers: {
          Authorization: `PVEAPIToken=${apiToken}`,
        },
        cookies: {},
      });
    } else {
      if (!username)
        throw new Error(
          'Proxmox username not set. Either a username and password or an API Token are required',
        );
      if (!password)
        throw new Error(
          'Proxmox password not set. Either a username and password or an API Token are required',
        );

      this.getAuth = async () => {
        const response = await this.withTlsConfigured(() =>
          fetch(`${this.apiBase}/api2/json/access/ticket`, {
            method: 'POST',
            body: new URLSearchParams({
              username: username!,
              password: password!,
            }),
          }),
        );

        if (!response.ok) {
          throw new Error(
            `Failed to login to Proxmox: ${response.status} ${response.statusText}`,
          );
        }

        const { data } = await response.json();

        return {
          headers: {
            CSRFPreventionToken: data.CSRFPreventionToken,
          },
          cookies: {
            PVEAuthCookie: data.ticket,
          },
        };
      };
    }
  }

  private async withTlsConfigured<T>(fn: () => Promise<T>): Promise<T> {
    const insecure = pulumiProxmox.config.insecure;
    try {
      if (insecure) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      }
      return await fn();
    } finally {
      if (insecure) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED =
          this.NODE_TLS_REJECT_UNAUTHORIZED;
      }
    }
  }

  async doRequest(
    httpMethod: string,
    path: string,
    pathTemplate: string,
    params?: { [key: string]: any },
  ): Promise<any> {
    const auth = await this.getAuth();

    let url = this.apiBase + path;
    const options: RequestInit = {
      method: httpMethod,
      headers: {
        ...auth.headers,
        Accept: 'application/json',
      },
    };

    if (Object.keys(auth.cookies).length > 0) {
      const cookieHeader = Object.entries(auth.cookies)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');
      (options.headers as any)['Cookie'] = cookieHeader;
    }

    if (params) {
      if (httpMethod === 'GET') {
        const searchParams = new URLSearchParams(params);
        url += `?${searchParams.toString()}`;
      } else {
        options.body = new URLSearchParams(params).toString();
        (options.headers as any)['Content-Type'] =
          'application/x-www-form-urlencoded';
      }
    }

    const response = await this.withTlsConfigured(() => fetch(url, options));

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Proxmox API request failed (${response.status} ${response.statusText}) at ${path}: ${text}`,
      );
    }

    const json = await response.json();
    return json.data;
  }
}
