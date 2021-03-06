
import {macrocosm} from './macrocosm'


describe('macrocosm', function(){
    
    it('should pass values through with identity function', function(){
        let m = macrocosm((macro)=>(macro))

        expect(m.convert(1)).toBe(1, 'with primative')
        
        let primus = {
            x: 1, y: 2
        }
        let converted = m.convert(primus)
        expect(converted).toBe(primus)
        

    })

    it('can embed values deep inside a structure', function(){
        let m = macrocosm((_)=>{
            return {
                type:'boring',
                shallow:_.shallow,
                deepen:{
                    deep:_.deep
                }
            }
        })

        expect(m.convert({
            shallow:'shallow',
            deep:'deep',
        })) .toEqual({
            type:'boring',
            shallow:'shallow', 
            deepen:{
                deep:'deep'
            }
        })
    })

    it('when a value is not given it does not appear',function(){
        let m = macrocosm((_=>({
            root:_,
            unroot:_.unroot
        })))

        expect(m.convert("nonsense")).toEqual({root:'nonsense'})

    })

    it('can create computed values', function(){
        let m = macrocosm(_=>({
            computed:_._derive((o,a,b)=>{return a+b}, _.a, _.b)
        }))

        expect(m.convert({
            a:1, b:1
        })).toEqual({
            computed:2
        })
    })

    it('should perform partial update', function(){

        let m = macrocosm((_,d) => ({
            none:_.c,
            halfOne: _.a,
            halfTwo: _.b,
            letters: d((a, b)=>{return a+b},_.a, _.b)
        }))

        expect(m.convert({a:0})).toEqual({
            halfOne: 0,
        })

        m.convert({
            a:"0", b:"1"
        })

        expect(m.update({
            a: "A"
        })).toEqual({
            halfOne:"A",
            letters:"A1"
        })

        expect(m.update({
            a:"A", b:"B"
        })).toEqual({
            halfOne:"A",
            halfTwo:"B",
            letters:"AB"
        })

    })

    it('should operate the readme example', function(){
        let planetarium = macrocosm((macro, derive) => {
            return {
                land: macro.land,
                size: 'big',
                shape: "round",
                temperature: derive((distance, atmosphere) => {
                    return atmosphere / distance
                }, macro.distance, macro.atmosphere)
            }
        })

        let technoplanet = planetarium.convert({
            land: "silicon",
            distance: 10,
            atmosphere: 2
        })
        
        expect(technoplanet).toEqual({
            land: 'silicon',
            size: 'big',
            shape: 'round',
            temperature: 0.2
        })

        let up = planetarium.update({
            land: "Ice",
            atmosphere: 5
        })

        expect(up).toEqual({
            land: "Ice",
            temperature: 0.5
        })

    })

    it('works with es6 destructure', function(){
        let m = macrocosm(({a,b})=>({
            x:a, y:b
        }))

        expect(m.convert({a:0, b:1})).toEqual({x:0, y:1})
    })


})