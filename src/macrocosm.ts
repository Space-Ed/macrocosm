

interface SpecialGambit {
    _derive:(func, ...args)=>SpecialGambit,
    _req_:SpecialGambit,
    _sticky_:SpecialGambit,
    [others:string]:any
}

const gambitAXE = Symbol()

class Gambit {
    proxy:any;
    subgambits:{[key:string]:Gambit}

    sticky:boolean;
    hot:boolean;
    required:boolean;

    value:any;

    constructor(){
        this.subgambits = {}
        
        this.sticky = true;
        this.required = false;
        this.hot = false;
    
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
            let gambit = new DeriveGambit(func, args)
            return gambit
        }
    }

    _req_(){
        this.required = true;
        return this
    }

    _sticky_(){
        this.sticky = true;
        return this
    }

    plug(value){
        this.value = value;
        this.hot = true;
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
        if(!this.sticky) this.value = undefined

        for (let k in this.subgambits){
            this.subgambits[k].discharge()
        }
    }

}

class DeriveGambit extends Gambit {

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
    
        for (let value of this.args){
            if (value instanceof Object && value[gambitAXE]){
                let gambit = value[gambitAXE]
                let d = gambit.dump();

                if (d === undefined && gambit.required || !gambit.hot) {
                     return undefined
                }else {
                    produced.push(d)
                }
            }else {
                produced.push(value)
            }
        }


        let derived = this.func(...produced)
        this.plug(derived)
        return derived

    }

}


function mint(delta, takecold=false, nullable=false) {

    if (delta instanceof Object && delta[gambitAXE]) {
        let gambit:Gambit = delta[gambitAXE]
        
        if(takecold || gambit.hot){
            return gambit.dump()
        } else if (gambit.required){
            throw new Error("Gambit was required but was never populated")
        }
    } else if (delta instanceof Object) {
        let product = {}; Object.setPrototypeOf(product, Object.getPrototypeOf(delta))

        for (let k in delta) {
            let val = mint(delta[k], takecold, nullable)

            if(val !== undefined || nullable){
                product[k] = val
            }
        }

        return product
    } else { 

        //other values are stale
        if(takecold){
            return delta
        }
            
    }

}

export function macrocosm(templater:(macro:SpecialGambit)=>any) {

    let gambit = new Gambit()
    let template = templater(gambit.proxy)

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
