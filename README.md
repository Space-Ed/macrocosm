# macrocosm

Template Javascript Objects in a way that allows incremental change between representational domains

### Example, templating a planet

#### Aim: Abstract the similarities between kinds of planet when converting from the planetary description to the cosmic object description

our target domain could contain any number of a variety of cosmic objects, we want to create a few planets using a format using properties relevant to planets only but emit to a format of general 

furthermore we would like to be able to see how a difference in the original domain will cause change in the converted domain.

```js

import {macrocosm} from 'macrocosm'

let planetarium = macrocosm((macro)=>{
    return {
        land: macro.land,
        size:'big',
        shape: "round",
        temperature: macro._derive( (distance, atmosphere)=>{
            return atmosphere / distance
        }, macro.distance, macro.atmosphere)
    }
})

let technoplanet = planetarium.convert({
    land:"silicon",  
    distance:10,
    atmosphere: 2
})

// same as
let technoplanet = {
    land:'silicon',
    size:'big',
    shape: 'round',
    temperature: 0.2
} 
```

### What is it doing?

macrocosm works by creating a proxy object with a wack interpretation of get. when you get you are not getting the value but actually informing the system that the value will derive from that 

in the macrocosm properties gotten are not values but blanks to fill in later. 

### why not just use functions? destructure and reassemble

That is a reasonable question, and that's ok for most cases, macrocosm has some added benefits such as 

### Granular updates

It is possible to create not just templates but updates to the templates, so that it is possible to only adjust the affected areas of a system when the description changes

```js



````

____