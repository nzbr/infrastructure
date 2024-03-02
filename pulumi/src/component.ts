import {
    Resource,
    ComponentResource,
    ComponentResourceOptions,
    ResourceOptions,
} from '@pulumi/pulumi';

type Resources = { [key: string]: () => Resource };
export const resources: Resources = {};

type Components = { [key: string]: Component };
export const components: Components = {};

export type ResourceClass<
    T extends Resource,
    A extends object,
    O extends ResourceOptions,
> = new (name: string, args: A, opts?: O | ResourceOptions) => T;

export class Component extends ComponentResource {
    public type: string;
    public name: string;
    public parent: Component | null;

    protected resources: Resources = {};

    constructor(
        parent: Component | null,
        name: string,
        opts?: ComponentResourceOptions,
    ) {
        const _type = parent ? `${parent.type}:${name}` : `nzbr:${name}`;
        const _name = parent ? `${parent.name}/${name}` : name;
        super(
            _type,
            _name,
            {},
            {
                ...opts,
                parent: parent ? parent : undefined,
            },
        );

        this.type = _type;
        this.name = _name;
        this.parent = parent;

        if (this.name in (parent ? parent.resources : resources)) {
            throw new Error(`Component ${this.name} already exists`);
        }

        components[this.name] = this;
    }

    protected mk<
        T extends Resource,
        A extends object,
        O extends ResourceOptions,
    >(name: string, Type: ResourceClass<T, A, O>, args: () => A, opts?: O) {
        if (name in this.resources) {
            throw new Error(`Resource ${this.name}:${name} already exists`);
        }

        const fullName = `${this.name}/${name}`;

        const resource = mkSingleton(
            () =>
                new Type(fullName, args(), {
                    ...opts,
                    parent: this,
                }),
        );

        this.resources[name] = resource;
        resources[fullName] = resource;
    }
}

export function evaluateResources(): void {
    for (let name in resources) {
        resources[name]();
    }
}

function mkSingleton<T>(fn: () => T): () => T {
    let value: T;
    return () => {
        if (!value) {
            value = fn();
        }
        return value;
    };
}
