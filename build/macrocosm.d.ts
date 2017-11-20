export interface GambitProxy {
    _derive: (func, ...args) => GambitProxy;
    _req_: GambitProxy;
    _sticky_: GambitProxy;
    [others: string]: any;
}
export declare function macrocosm(templater: (macro: GambitProxy) => any): {
    convert(whole: any): any;
    update(partial: any): any;
};
