type Config = Record<string, object | unknown>;

export abstract class DI {
    constructor(protected config: Config) {}
    abstract init(): DI
}

export type DepI = Record<string, DI>;

export const dependencies: DepI = {};
type c = {
    name: string;
    class: any
}

export default async (start: c[]) => {
    for (const dep of start) {
        const inst = new dep.class(process.env);
        if (inst instanceof DI) {
            const instance = inst.init();
            dependencies[dep.name] = instance;
        }
    }
}