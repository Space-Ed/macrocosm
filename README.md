# macrocosm

Template Javascript Objects in a way that allows incremental change between representational domains. 

## Example Usage: templating a planet

our target domain is that of cosmic objects rendered on the canvas of astronomical spacetime, we want to create a few planets using a format that is only concerned with properties relevant to planets, converting to the former. 

```js

import {macrocosm} from 'macrocosm'

let planetarium = macrocosm((macro, derive)=>({
    land: macro.land,
    size:'big',
    shape: "round",
    temperature: derive(
        (distance, atmosphere)=>{
            return atmosphere / distance // the thinner the atmosphere and further away the colder it gets
        }, 
        macro.distance, //depends on
        macro.atmosphere
    )
}))

let technoplanet = planetarium.convert({
    land:"silicon",  
    distance:10,
    atmosphere: 2
})

expect(technoplanet).toEqual({
    land:'silicon',
    size:'big',
    shape: 'round',
    temperature: 0.2
})


```

### Isn't that just executing the function?

That is what it looks like, but macrocosm abstracts some magic to enable some extra features. 'macro' here is not the object passed to convert.
## Updates:

 It is possible to create updates to existing templates, so that it is possible to only adjust the affected areas of a system when the description changes

```js
let up = planetarium.update({
    land:"Ice",
    atmosphere:5    
})

expect(up).toEqual({
    land:"Ice",
    temperature:0.5
})

```

see how the size and shape are unaffected. This makes this tool useful for driving updates to views, which derive from models in this way.


## The Magic

internally macrocosm creates a gambit, a proxied object where properties gotten are not values but blanks to fill in later. By trapping get we are able to detect exactly what has been referred to and everything else can be ignored.

## Testing

```
npm test
```

ES6 only
Apache-2.0 Lisence
Contributions Welcome
