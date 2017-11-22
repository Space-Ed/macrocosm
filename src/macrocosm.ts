

export interface GambitProxy {
    _derive:(func, ...args)=>GambitProxy,
    [others:string]:any
}

const gambitAXE = Symbol()

export class Gambit {
    proxy:any;
    subgambits:{[key:string]:Gambit}

    frozen:boolean;
    hot:boolean;

    value:any;

    constructor(){
        this.subgambits = {}
        
        this.hot = false;
        this.frozen = true;

        this[gambitAXE] = this;

        this.proxy = new Proxy<Gambit>(this, {
            get(target, prop){
                if(prop === gambitAXE){
                    return target
                }else if(typeof prop === 'string' && prop[0] == '_'){
                    //call target special method
                    return target[prop]()
                }else if (prop in target.subgambits) {
                    //return existing subgambit
                    return target.subgambits[prop].proxy
                } else {
                    // create a new gambit 
                    let n = target.subgambits[prop] = new Gambit()
                    return n.proxy
                }
            },

            getPrototypeOf(target) {
                return Gambit
            }
        })
    }

    _derive(){
        //provide the function that is called to produce the gambit that will depend on those arguments
        return (func: (...args) => any, ...args)=>{
            let gambit = new DeriveGambit(func, [this, ...args])
            return gambit
        }
    }

    plug(value){
        this.value = value;
        this.hot = true;
        this.frozen = false;
    }

    /**
     * pull the values that have been dropped,
     */
    dump(){
        return this.value
    }

    /**
     * push the new values through the structure
     * @param primus the structure to convert
     */
    charge(primus){
        //put the value down here to be picked up later
        this.plug(primus)

        //recusively push out the value
        if(primus instanceof Object){
            for(let k in primus){
                if(k in this.subgambits){
                    this.subgambits[k].charge(primus[k])
                }
            }
        }
    }

    /**
     * clear unsticky values, and turn everything cold
     */
    discharge(){
        this.hot = false;

        for (let k in this.subgambits){
            this.subgambits[k].discharge()
        }
    }

}

export class DeriveGambit extends Gambit {

    constructor(private func:(...args)=>any, private args:any[]){ 
        super()

        Object.defineProperty(this,'hot', {
            get:()=>{
                return true
            },
            set:(val)=>{
                return false
            }
        })
    }

    dump(){
        //collect arguments and apply function to produce value if a required value is missing
        let produced:any[] = []

        let hot = false;
    
        for (let value of this.args){
            if (value instanceof Object && value[gambitAXE]){
                let gambit = value[gambitAXE]
                hot = gambit.hot || hot

                if(gambit.frozen){
                    return
                }

                produced.push(gambit.dump())
            }else {
                produced.push(value)
            }
        }

        if(hot){
            let derived = this.func(...produced)
            this.plug(derived)
            return derived
        }

    }

}

function extract(delta, takecold):{value:any, hot:boolean, frozen:boolean}{

    if (delta instanceof Object && delta[gambitAXE]) {
        let gambit: Gambit = delta[gambitAXE]
        let val = gambit.dump();
        return {
            value: val,
            hot:gambit.hot,
            frozen:gambit.frozen
        }
            
    }else if (delta instanceof Object) {
        return _mint(delta, takecold)
    } else { 
        
        return {
            value:delta,
            hot:false,
            frozen:false
        }
            
    }
}

function _mint(delta, takecold): { value: any, hot: boolean , frozen:boolean}{
    let product = {}; 
    Object.setPrototypeOf(product, Object.getPrototypeOf(delta))
    let hot = false;
    let frozen = true;

    for (let k in delta) {

        let val = extract(delta[k], takecold)

        hot = val.hot||hot
        frozen = val.frozen && frozen
        if (!val.frozen && (val.hot || takecold)) {
            product[k] = val.value
        }
    }

    return {
        value: product,
        hot: hot,
        frozen:frozen
    }
}

function mint(delta, takecold=false) {
    return extract(delta, takecold).value
}

export function derive(func: (...args) => any, ...args):DeriveGambit{
    //provide the function that is called to produce the gambit that will depend on those arguments
    let gambit = new DeriveGambit(func, [...args])
    return gambit
}

export function macrocosm(templater: (macro: GambitProxy, derive: (func: (...args) => any, ...args) => DeriveGambit )=>any) {

    let gambit = new Gambit()
    let template = templater(gambit.proxy, derive)

    return {
        convert(whole){
            gambit.charge(whole)
            let minted = mint(template, true)
            gambit.discharge()
            return minted
        },

        update(partial){
            gambit.charge(partial)
            let minted = mint(template, false)
            gambit.discharge()
            return minted

        },

        // revert(){

        // },

        // catchup(){

        // }
    }
}
