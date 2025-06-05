// noinspection JSUnusedGlobalSymbols

import {RrsetArgs} from "@pulumi/desec";
import {ComponentResource, Input, log} from "@pulumi/pulumi";
import {Optional} from "../util";

export const NewRegistrar = (name: string) => undefined as unknown;
export const NewDnsProvider = (name: string) => name;

export type RecordType = 'A' | 'AAAA' | 'ALIAS' | 'CAA' | 'CNAME' | 'HTTPS' | 'MX' | 'NS' | 'SRV' | 'SSHFP' | 'SVCB' | 'TLSA' | 'TXT';
export type DomainModifier = (domain: DomainComponent) => void;
export type RecordModifier = (domain: DomainComponent, type: RecordType, name: string) => void;
export type DNSProviderImpl = (domain: DomainComponent) => void;

export class DomainComponent extends ComponentResource {

  name: string;
  defaultTTL = 300;
  noPurge = false;

  dnsProvider: DNSProviderImpl | null = null;

  records: {
    [key in RecordType]?: {
      [name in string]?: Optional<{ [k in keyof RrsetArgs]: RrsetArgs[k] extends Input<infer U> ? (U extends Input<infer V>[] ? V[] : U) : never }, 'ttl'>
    }
  } = {};

  constructor(name: string, registrar: unknown, ...modifiers: DomainModifier[]) {
    super('dnscontrol:domain', name);

    this.name = name;

    // Run all domain modifiers
    modifiers.forEach(modifier => modifier(this));

    if (!this.dnsProvider) {
      log.warn(`No DNS provider set for domain ${name}, not creating any records`);
      return;
    }

    // Run registered DNS Provider Implementation
    this.dnsProvider(this);
  }
}

// Domain

export const D = (name: string, registrar: unknown, ...modifiers: DomainModifier[]) => new DomainComponent(name, registrar, ...modifiers);

// Domain modifiers

const genericRecord = (type: RecordType) => (name: string, record: string, ...modifiers: RecordModifier[]) => (domain: DomainComponent) => {
  domain.records[type] = domain.records[type] || {};
  const existingRecords = (domain.records[type]!)[name]?.records || [];
  (domain.records[type]!)[name] = {
    domain: domain.name,
    subname: name,
    type: type,
    records: [...existingRecords, record],
  };

  modifiers.forEach(modifier => modifier(domain, type, name));
}

const uniqueRecord = (type: RecordType) => (name: string, record: string, ...modifiers: RecordModifier[]) => (domain: DomainComponent) => {
  if ((domain.records[type] || {})[name]) {
    throw new Error(`Record ${type} ${name}.${domain.name} may only be defined once`);
  }
  genericRecord(type)(name, record, ...modifiers)(domain);
}

// noinspection JSUnusedLocalSymbols
const notImplementedModifier = (type: string) => (name: string, record: string, ...modifiers: RecordModifier[]) => (domain: DomainComponent) => {
  throw new Error(`Domain Modifier ${type} is not implemented`);
}

export const NOOP_DOMAIN_MODIFIER = (domain: DomainComponent) => {};
export const A = genericRecord('A');
export const AAAA = genericRecord('AAAA');
export const ALIAS = uniqueRecord('ALIAS');
export const CAA = (name: string, tag: "issue" | "issuewild" | "iodef", value: string, ...modifiers: RecordModifier[]) => (domain: DomainComponent) => {
  genericRecord('CAA')(name, `0 ${tag} "${value}"`, ...modifiers)(domain);
}
export const CAA_BUILDER = (args: {
  label?: string,
  iodef: string,
  iodef_critical?: boolean,
  issue: string[],
  issue_critical?: boolean,
  issuewild: string[],
  issuewild_critical?: boolean,
  ttl?: number
}) => (domain: DomainComponent) => {
  let {iodef, iodef_critical, issue, issue_critical, issuewild, issuewild_critical, ttl} = args;
  let label = args.label || '@';
  issue = (issue.length === 1 && issue[1] === 'none') ? [';'] : issue;
  issuewild = (issuewild.length === 1 && issuewild[1] === 'none') ? [';'] : issuewild;

  const ttlModifier = (ttl) ? TTL(ttl) : NOOP_RECORD_MODIFIER;

  issue.forEach((value) =>
    CAA(label, 'issue', value, ...(issue_critical ? [CAA_CRITICAL, ttlModifier] : [ttlModifier]))(domain)
  );
  CAA(label, 'iodef', iodef, ...(iodef_critical ? [CAA_CRITICAL, ttlModifier] : [ttlModifier]))(domain);
  issuewild.forEach((value) =>
    CAA(label, 'issuewild', value, ...(issuewild_critical ? [CAA_CRITICAL, ttlModifier] : [ttlModifier]))(domain)
  );
}
export const CNAME = uniqueRecord('CNAME');
export const DHCID = notImplementedModifier('DHCID');
export const DNAME = notImplementedModifier('DNAME');
export const DISABLE_IGNORE_SAFETY_CHECK = notImplementedModifier('DISABLE_IGNORE_SAFETY_CHECK');
export const DMARC_BUILDER = notImplementedModifier('DMARC_BUILDER');
export const DS = notImplementedModifier('DS');
export const DefaultTTL = (ttl: number) => (domain: DomainComponent) => {
  domain.defaultTTL = ttl;
}
export const DnsProvider = (provider: DNSProviderImpl) => (domain: DomainComponent) => {
  domain.dnsProvider = provider;
}
export const FRAME = notImplementedModifier('FRAME');
export const HTTPS = (name: string, priority: number, target: string, params: string, ...modifiers: RecordModifier[]) => genericRecord('HTTPS')(name, `${priority} ${target} ${params}`, ...modifiers);
export const IGNORE = notImplementedModifier('IGNORE'); // TODO: This should be possible to implement
export const IGNORE_NAME = notImplementedModifier('IGNORE_NAME');
export const IGNORE_TARGET = notImplementedModifier('IGNORE_TARGET');
export const IMPORT_TRANSFORM = notImplementedModifier('IMPORT_TRANSFORM');
export const INCLUDE = notImplementedModifier('INCLUDE');
export const LOC = notImplementedModifier('LOC');
export const LOC_BUILDER_DD = notImplementedModifier('LOC_BUILDER_DD');
export const LOC_BUILDER_DMM_STR = notImplementedModifier('LOC_BUILDER_DMM_STR');
export const LOC_BUILDER_DMS_STR = notImplementedModifier('LOC_BUILDER_DMS_STR');
export const LOC_BUILDER_STR = notImplementedModifier('LOC_BUILDER_STR');
export const M365_BUILDER = notImplementedModifier('M365_BUILDER');
export const MX = (name: string, priority: number, target: string, ...modifiers: RecordModifier[]) => genericRecord('MX')(name, `${priority} ${target}`, ...modifiers);
export const NAMESERVER = notImplementedModifier('NAMESERVER');
export const NAMESERVER_TTL = notImplementedModifier('NAMESERVER_TTL');
export const NAPTR = notImplementedModifier('NAPTR');
export const NO_PURGE = (domain: DomainComponent) => {
  domain.noPurge = true;
}
export const NS = genericRecord('NS');
export const PRT = notImplementedModifier('PRT');
export const PURGE = (domain: DomainComponent) => {
  domain.noPurge = false;
}
export const SOA = notImplementedModifier('SOA');
export const SPF_BUILDER = notImplementedModifier('SPF_BUILDER');
export const SRV = (name: string, priority: number, weight: number, port: number, target: string, ...modifiers: RecordModifier[]) => genericRecord('SRV')(name, `${priority} ${weight} ${port} ${target}`, ...modifiers);
export const SSHFP = (name: string, algorithm: 0 | 1 | 2 | 3 | 4, type: 0 | 1 | 2, fingerprint: string, ...modifiers: RecordModifier[]) => genericRecord('SSHFP')(name, `${algorithm} ${type} ${fingerprint}`, ...modifiers);
export const SVCB = (name: string, priority: number, target: string, params: string, ...modifiers: RecordModifier[]) => genericRecord('SVCB')(name, `${priority} ${target} ${params}`, ...modifiers);
export const TLSA = (name: string, usage: number, selector: number, type: number, certificate: string, ...modifiers: RecordModifier[]) => genericRecord('TLSA')(name, `${usage} ${selector} ${type} ${certificate}`, ...modifiers);
export const TXT = genericRecord('TXT'); // TODO: DNSControl now also supports arrays as a value
export const URL = notImplementedModifier('URL');
export const URL301 = notImplementedModifier('URL301');

// Record modifiers

export const NOOP_RECORD_MODIFIER = (domain: DomainComponent, type: RecordType, name: string) => {};
export const TTL = (ttl: number) => (domain: DomainComponent, type: RecordType, name: string) => {
  (domain.records[type]!)[name]!.ttl = ttl
};

export const CAA_CRITICAL = (domain: DomainComponent, type: RecordType, name: string) => {
  if (type !== 'CAA') {
    throw new Error('CAA_CRITICAL can only be used with CAA records');
  }
  // record to be modified was appended last
  const records = (domain.records['CAA']!)[name]!.records
  records[records.length - 1] = records[records.length - 1].replace(/^0 /, '128 ');
}
