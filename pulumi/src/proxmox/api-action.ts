import { dynamic, type Input, type ID, type Unwrap, type CustomResourceOptions, all, Config } from '@pulumi/pulumi';

export type UnwrapAll<T> = { [Property in keyof T]: Unwrap<T[Property]> };

export type ProxmoxApiActionResourceInputs = {
  timeout?: Input<number | undefined>,
  endpoint?: Input<string | undefined>,
  apiToken?: Input<string | undefined>,
  username?: Input<string | undefined>,
  password?: Input<string | undefined>,
};

export type ProxmoxApiActionInputs = UnwrapAll<ProxmoxApiActionResourceInputs>;

export abstract class ProxmoxVmActionProvider<I extends ProxmoxApiActionInputs, O> implements dynamic.ResourceProvider {

  abstract create(inputs: I): Promise<dynamic.CreateResult<O>>;

  update(_: ID, __: O, inputs: I): Promise<dynamic.UpdateResult<O>> {
    return this.create(inputs);
  }
}

export class ProxmoxApiAction<I extends ProxmoxApiActionResourceInputs, O> extends dynamic.Resource {
  protected constructor(
    provider: ProxmoxVmActionProvider<UnwrapAll<I>, O>,
    prefix: string,
    name: string,
    args: I,
    opts?: CustomResourceOptions,
  ) {
    function orDefault<T>(originalInput: Input<T> | undefined, defaultInput: Input<T> | undefined) {
      if (!originalInput) return defaultInput;
      return all([originalInput, defaultInput]).apply(([originalValue, defaultValue]) => {
        return originalValue ?? defaultValue
      });
    };

    const config = new Config('proxmoxve');
    const projectConfig = new Config();
    args.endpoint = orDefault(args.endpoint, config.require('endpoint'));
    args.apiToken = orDefault(args.apiToken, config.getSecret('apiToken'));
    args.username = orDefault(args.username, config.getSecret('username'));
    args.password = orDefault(args.password, config.getSecret('password'));
    args.timeout = orDefault(args.timeout, projectConfig.getNumber('rebootTimeout'));

    super(provider, `${prefix}-${name}`, args , opts);
  }
}
