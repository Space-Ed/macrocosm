export interface GambitProxy {
    _derive: (func, ...args) => GambitProxy;
    [others: string]: any;
}
export declare class Gambit {
    proxy: any;
    subgambits: {
        [key: string]: Gambit;
    };
    frozen: boolean;
    hot: boolean;
    value: any;
    constructor();
    _derive(): (func: (...args: any[]) => any, ...args: any[]) => DeriveGambit;
    plug(value: any): void;
    /**
     * pull the values that have been dropped,
     */
    dump(): any;
    /**
     * push the new values through the structure
     * @param primus the structure to convert
     */
    charge(primus: any): void;
    /**
     * clear unsticky values, and turn everything cold
     */
    discharge(): void;
}
export declare class DeriveGambit extends Gambit {
    private func;
    private args;
    constructor(func: (...args) => any, args: any[]);
    dump(): any;
}
export declare function derive(func: (...args) => any, ...args: any[]): DeriveGambit;
export declare function macrocosm(templater: (macro: GambitProxy, derive: (func: (...args) => any, ...args) => DeriveGambit) => any): {
    convert(whole: any): any;
    update(partial: any): any;
};
