import { Domain, RRSet } from '@pulumi/desec';
import { Component, resources } from '../component';

export class NzbrLinkComponent extends Component {
    constructor(parent: Component) {
        const domain = 'nzbr.link';
        super(parent, domain);

        this.mk(domain, Domain, () => ({
            name: domain,
        }));

        this.mk('@4', RRSet, () => ({
            domain: (this.resources[domain]() as Domain).name,
            subname: '',
            type: 'A',
            records: (resources['desec/nzbr.de/@4']() as RRSet).records,
            ttl: 3600,
        }));

        this.mk('@6', RRSet, () => ({
            domain: (this.resources[domain]() as Domain).name,
            subname: '',
            type: 'AAAA',
            records: (resources['desec/nzbr.de/@6']() as RRSet).records,
            ttl: 3600,
        }));

        this.mk('www', RRSet, () => ({
            domain: (this.resources[domain]() as Domain).name,
            subname: 'www',
            type: 'CNAME',
            records: [`${domain}.`],
            ttl: 3600,
        }));

        this.mk("wildcard", RRSet, () => ({
            domain: (this.resources[domain]() as Domain).name,
            subname: "*",
            type: 'CNAME',
            records: [`nzbr.link.`],
            ttl: 3600,
        }));

        this.mk('dmarc', RRSet, () => ({
            domain: (this.resources[domain]() as Domain).name,
            subname: '_dmarc',
            type: 'TXT',
            records: ['v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s;'],
            ttl: 3600,
        }));

        this.mk('DKIM', RRSet, () => ({
            domain: (this.resources[domain]() as Domain).name,
            subname: '*._domainkey',
            type: 'TXT',
            records: ['v=DKIM1; p='],
            ttl: 3600,
        }));

        this.mk('bing', RRSet, () => ({
            domain: (this.resources[domain]() as Domain).name,
            subname: 'fc547b5ef15e141a7f33d57414e5be2c',
            type: 'CNAME',
            records: ['verify.bing.com.'],
            ttl: 3600,
        }));

        this.mk('TXT', RRSet, () => ({
            domain: (this.resources[domain]() as Domain).name,
            subname: '',
            type: 'TXT',
            records: [
                'v=spf1 -all',
                'keybase-site-verification=ThfcyQqLyD-Ov0VC9x7ISvtCBVDPnc_AY0SNO5Z4oK4',
                'google-site-verification=2aAinANYefhTzhJ_DaiKSvKaz3zw7F8_ezGLrl-dmRM',
            ],
            ttl: 3600,
        }));
    }
}
