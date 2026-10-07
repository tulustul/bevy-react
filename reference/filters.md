# Filters

The filters the library ships, generated from its filter registry. Every param
is optional (an omitted param takes the filter's default) and accepts an inline
`{ animated: sharedValue }` binding. Apps register their own filters on top
of these.

## Filters

Usable in `filter` and `backdropFilter` chains.

### `bloom`

Guide: [Filters](../styling/filters.md).

| Param | Type |
| --- | --- |
| `radius` | `number \| string` |
| `threshold` | `number` |
| `intensity` | `number` |

### `blur`

Guide: [Filters](../styling/filters.md).

| Param | Type |
| --- | --- |
| `radius` | `number \| string` |

### `brightness`

Guide: [Filters](../styling/filters.md).

| Param | Type |
| --- | --- |
| `amount` | `number` |

### <a id="chromaticAberration"></a>`chromaticAberration`

Guide: [Filters](../styling/filters.md).

| Param | Type | Description |
| --- | --- | --- |
| `offset` | `number \| string` |  |
| `angle` | `number \| string` |  |
| `rotation` | `number` | Tangential swirl: the R image rotates by `+rotation` degrees (clockwise, y-down) around the node's center, B by `-rotation`. Plain number in degrees — a scalar magnitude, so transitions unwind linearly through every turn. 0 = purely directional split. |

### `contrast`

Guide: [Filters](../styling/filters.md).

| Param | Type |
| --- | --- |
| `amount` | `number` |

### <a id="gradientMap"></a>`gradientMap`

Guide: [Filters](../styling/filters.md).

| Param | Type |
| --- | --- |
| `angle` | `number \| string` |
| `stops` | `Array<GradientMapStop>` |
| `amount` | `number` |

### `grayscale`

Guide: [Filters](../styling/filters.md).

| Param | Type |
| --- | --- |
| `amount` | `number` |

### <a id="hueRotate"></a>`hueRotate`

Guide: [Filters](../styling/filters.md).

| Param | Type |
| --- | --- |
| `angle` | `number \| string` |

### `invert`

Guide: [Filters](../styling/filters.md).

| Param | Type |
| --- | --- |
| `amount` | `number` |

### `outline`

Guide: [Filters](../styling/filters.md).

| Param | Type |
| --- | --- |
| `width` | `number \| string` |
| `color` | `string` |
| `softness` | `number \| string` |

### `pinch`

Guide: [Filters](../styling/filters.md).

| Param | Type | Description |
| --- | --- | --- |
| `x` | `number` | Pinch center, 0..1 across the node rect (0 = left edge). |
| `y` | `number` | Pinch center, 0..1 across the node rect (0 = top edge). |
| `strength` | `number` | -1 (full bulge) ..= 1 (full pinch); 0 is identity. |
| `radius` | `number` | Effect radius as a fraction of the node's larger dimension. |
| `light` | `number` | Diffuse shading intensity: 0 (unlit, the default), 1 nominal; larger values overdrive, like `brightness`. |
| `lightAngle` | `number \| string` | Direction the light comes FROM: degrees clockwise from +X in screen space (bare number = degrees, `"0.25turn"` etc. accepted). Default -135 = top-left. |
| `gloss` | `number` | Specular (white) highlight intensity: 0 (off, the default), 1 nominal; larger values overdrive. |
| `glossSize` | `number` | Size of the specular highlight, 0 (a pinpoint) ..= 1 (a broad sheen); default 0.3. Mapped log-wise onto a Blinn-Phong exponent in the shader (128 at 0, ~32 at 0.3, 1 at 1). |
| `outerSoftness` | `number` | How the effect meets its rim, 0..=1: 0 is a linear onset (a visible crease, like a pressed coin edge), 0.5 (the default) the classic `u^2` smoothstep-like fade, 1 an imperceptible `u^4` fade-in. |
| `innerSoftness` | `number` | How the effect peaks at its center, 0..=1: 0 is a cone tip (a pointed pit/peak the lighting shows as a point), 0.5 (the default) a rounded bowl, 1 a broad flat floor. Independent of `outerSoftness`: the profile is `1 - (1 - u^a)^b` with `a`/`b` from the two knobs. |

### `saturate`

Guide: [Filters](../styling/filters.md).

| Param | Type |
| --- | --- |
| `amount` | `number` |

### `sepia`

Guide: [Filters](../styling/filters.md).

| Param | Type |
| --- | --- |
| `amount` | `number` |

### `shadow`

Guide: [Filters](../styling/filters.md).

| Param | Type |
| --- | --- |
| `color` | `string` |
| `offsetX` | `number \| string` |
| `offsetY` | `number \| string` |
| `spread` | `number \| string` |

## Morph filters

Usable in `morphFilter`.

### `crossfade`

Guide: [Morph filters](../styling/morph-filters.md).

| Param | Type | Description |
| --- | --- | --- |
| `spread` | `number` | 0..1 stagger amount; 0 is the plain uniform crossfade. |
| `scale` | `number \| string` | Noise feature size in logical px. |
| `softness` | `number` | 0..1 local fade window (fraction of the progress range). |
| `seed` | `number` | Re-rolls the noise pattern (domain offset). |

### <a id="linearWipe"></a>`linearWipe`

Guide: [Morph filters](../styling/morph-filters.md).

| Param | Type |
| --- | --- |
| `angle` | `number \| string` |
| `softness` | `number \| string` |

### `pixelize`

Guide: [Morph filters](../styling/morph-filters.md).

| Param | Type | Description |
| --- | --- | --- |
| `squaresMin` | `[number, number]` | Cells across x/y at the mosaic's coarsest (upstream `squaresMin`). |
| `steps` | `number` | Discrete cell-size levels; `<= 0` for a continuous ramp. |
