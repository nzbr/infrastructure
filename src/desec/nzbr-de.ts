import { Domain, RRSet } from '@pulumi/desec';
import { Component } from '../component';
import * as servers from './servers';

export class NzbrDeComponent extends Component {
    constructor(parent: Component) {
        const domain = 'nzbr.de';
        super(parent, domain);

        this.mk(domain, Domain, () => ({
            name: domain,
        }));

        this.mk('@4', RRSet, () => ({
            domain: (this.resources[domain]() as Domain).name,
            subname: '',
            type: 'A',
            records: servers.ip4,
            ttl: 3600,
        }));

        this.mk('@6', RRSet, () => ({
            domain: (this.resources[domain]() as Domain).name,
            subname: '',
            type: 'AAAA',
            records: servers.ip6,
            ttl: 3600,
        }));

        for (let srv in servers.all) {
            this.mk(`${srv}4`, RRSet, () => ({
                domain: (this.resources[domain]() as Domain).name,
                subname: srv,
                type: 'A',
                records: [servers.all[srv].ip4],
                ttl: 3600,
            }));

            this.mk(`${srv}6`, RRSet, () => ({
                domain: (this.resources[domain]() as Domain).name,
                subname: srv,
                type: 'AAAA',
                records: [servers.all[srv].ip6],
                ttl: 3600,
            }));
        }

        const cnames: { [key: string]: string } = {
            '*': domain,
            pages: domain,
            '*.pages': domain,
            autoconfig: 'mailbox.org',
        };
        for (let subdomain in cnames) {
            this.mk(subdomain, RRSet, () => ({
                domain: (this.resources[domain]() as Domain).name,
                subname: subdomain,
                type: 'CNAME',
                records: [`${cnames[subdomain]}.`],
                ttl: 3600,
            }));
        }

        this.mk('CAA', RRSet, () => ({
            domain: (this.resources[domain]() as Domain).name,
            subname: '',
            type: 'CAA',
            records: [
                '0 iodef "mailto:caa@nzbr.de"',
                '0 issue "letsencrypt.org"',
            ],
            ttl: 3600,
        }));

        this.mk('MX', RRSet, () => ({
            domain: (this.resources[domain]() as Domain).name,
            subname: '',
            type: 'MX',
            records: [
                '10 mxext1.mailbox.org.',
                '10 mxext2.mailbox.org.',
                '20 mxext3.mailbox.org.',
            ],
            ttl: 3600,
        }));

        this.mk('_autodiscover._tcp', RRSet, () => ({
            domain: (this.resources[domain]() as Domain).name,
            subname: '_autodiscover._tcp',
            type: 'SRV',
            records: ['0 0 443 mailbox.org.'],
            ttl: 3600,
        }));

        this.mk('_matrix._tcp', RRSet, () => ({
            domain: (this.resources[domain]() as Domain).name,
            subname: '_matrix._tcp',
            type: 'SRV',
            records: ['10 0 8448 nzbr.de.'],
            ttl: 3600,
        }));

        this.mk('mbo0001._domainkey', RRSet, () => ({
            domain: (this.resources[domain]() as Domain).name,
            subname: 'mbo0001._domainkey',
            type: 'TXT',
            records: [
                'v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2K4PavXoNY8eGK2u61LIQlOHS8f5sWsCK5b+HMOfo0M+aNHwfqlVdzi/IwmYnuDKuXYuCllrgnxZ4fG4yVaux58v9grVsFHdzdjPlAQfp5rkiETYpCMZwgsmdseJ4CoZaosPHLjPumFE/Ua2WAQQljnunsM9TONM9L6KxrO9t5IISD1XtJb0bq1lVI/e72k3mnPd/q77qzhTDmwN4TSNJZN8sxzUJx9HNSMRRoEIHSDLTIJUK+Up8IeCx0B7CiOzG5w/cHyZ3AM5V8lkqBaTDK46AwTkTVGJf59QxUZArG3FEH5vy9HzDmy0tGG+053/x4RqkhqMg5/ClDm+lpZqWwIDAQAB',
            ],
            ttl: 3600,
        }));

        this.mk('mbo0002._domainkey', RRSet, () => ({
            domain: (this.resources[domain]() as Domain).name,
            subname: 'mbo0002._domainkey',
            type: 'TXT',
            records: [
                'v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqxEKIg2c48ecfmy/+rj35sBOhdfIYGNDCMeHy0b36DX6MNtS7zA/VDR2q5ubtHzraL5uUGas8kb/33wtrWFYxierLRXy12qj8ItdYCRugu9tXTByEED05WdBtRzJmrb8YBMfeK0E0K3wwoWfhIk/wzKbjMkbqYBOTYLlIcVGQWzOfN7/n3n+VChfu6sGFK3k2qrJNnw22iFy4C8Ks7j77+tCpm0PoUwA2hOdLrRw3ldx2E9PH0GVwIMJRgekY6cS7DrbHrj/AeGlwfwwCSi9T23mYvc79nVrh2+82ZqmkpZSTD2qq+ukOkyjdRuUPck6e2b+x141Nzd81dIZVfOEiwIDAQAB',
            ],
            ttl: 3600,
        }));

        this.mk('TXT', RRSet, () => ({
            domain: (this.resources[domain]() as Domain).name,
            subname: '',
            type: 'TXT',
            records: [
                'v=spf1 include:mailbox.org',
                'keybase-site-verification=IHbqhzQ-aIeUKJe62gOi-TWUd03XI9gGbe5wDLSRYsQ',
                'google-site-verification=by8RxWHKo7pjLplm89eHT5u4QkVW23MibKc9wXpOODA',
            ],
            ttl: 3600,
        }));
    }
}
