"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const macrocosm_1 = require("./macrocosm");
describe('macrocosm', function () {
    it('should pass values through with identity function', function () {
        let m = macrocosm_1.macrocosm((macro) => (macro));
        expect(m.convert(1)).toBe(1, 'with primative');
        let primus = {
            x: 1, y: 2
        };
        let converted = m.convert(primus);
        expect(converted).toBe(primus);
    });
    it('can embed values deep inside a structure', function () {
        let m = macrocosm_1.macrocosm((_) => {
            return {
                type: 'boring',
                shallow: _.shallow,
                deepen: {
                    deep: _.deep
                }
            };
        });
        expect(m.convert({
            shallow: 'shallow',
            deep: 'deep',
        })).toEqual({
            type: 'boring',
            shallow: 'shallow',
            deepen: {
                deep: 'deep'
            }
        });
    });
    it('when a value is not given it does not appear', function () {
        let m = macrocosm_1.macrocosm((_ => ({
            root: _,
            unroot: _.unroot
        })));
        expect(m.convert("nonsense")).toEqual({ root: 'nonsense' });
    });
    it('can create computed values', function () {
        let m = macrocosm_1.macrocosm(_ => ({
            computed: _._derive((a, b) => { return a + b; }, _.a, _.b)
        }));
        expect(m.convert({
            a: 1, b: 1
        })).toEqual({
            computed: 2
        });
    });
    it('should perform partial update', function () {
        let m = macrocosm_1.macrocosm((_) => ({
            none: _.c,
            halfOne: _.a,
            halfTwo: _.b,
            letters: _._derive((a, b) => { return a + b; }, _.a, _.b)
        }));
        expect(m.update({
            a: "A"
        })).toEqual({
            halfOne: "A",
        });
        expect(m.update({
            a: "A", b: "B"
        })).toEqual({
            halfOne: "A",
            halfTwo: "B",
            letters: "AB"
        });
    });
    it('should operate the readme example', function () {
        let planetarium = macrocosm_1.macrocosm((macro) => {
            return {
                land: macro.land,
                size: 'big',
                shape: "round",
                temperature: macro._derive((distance, atmosphere) => {
                    return atmosphere / distance;
                }, macro.distance, macro.atmosphere)
            };
        });
        let technoplanet = planetarium.convert({
            land: "silicon",
            distance: 10,
            atmosphere: 2
        });
        expect(technoplanet).toEqual({
            land: 'silicon',
            size: 'big',
            shape: 'round',
            temperature: 0.2
        });
    });
});
