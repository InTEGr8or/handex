---
title: "Key Mapping for Vim"
date: 2023-09-25T19:04:33-07:00
draft: false
# description
description: ""
---

Key characters should be stable across systems.

Certain popular ASCII input processes depend on certain physically organized key arrangements.

Vim is one such system that's very popular among coders, but there are many others.

Some effort should be made, then, to align Handex key arrangements to align with this popular systems, at least for the default Handex key arrangement.

We've already aligned the `asdf` and `jkl;` keys along the main single-click keystrokes of the Handex.

## The Indexable Finger-Action Ordinate System

The primary coordinates of the Handex have started with fingertip pinches, starting with the thumb and moving across to the pinky.

These are the hexidecimal _hardware_ ordinates for each finger action. These are prior to and _independant_ of any character mapping.

Action/Finger | Thumb | Index | Middel | Ring | Pinky
---|---|---|---|---|---
pinch | `0x0` | `0x1` | `0x2` | `0x3` | `0x4`
grasp | `0x5` | `0x6` | `0x7` | `0x8` | `0x9`
pull-back | `0xA` | `0xB` | `0xC` | `0xD` | `0xE`

From that table, you can see that the thumb occupies the `0x0`, `0x5`, and `0xA` ordinals.

The Thumb occupies the modulus 5 = 0 ordinals. The Index occupies the modulus 5 = 1 ordinals. The Middle occupies the modulus 5 = 2 ordinals, etc.

That helps us name all the SVGs glyphs, so the Thumb keystroke glyph is located at [https://handex.io/images/svgs/0.svg](https://handex.io/images/svgs/0.svg)

Notice that the _hardware_ fingar action ordinals are _not based on keyboards_. Your finger actions are _prior to_ keyboards, and so their ordinates should not be based on how your fingers are mapped onto keyboard coordinates.

## Key to Action Mapping

Having established the _hardware_ finger actions, they can now be mapped to the keys of the standard keyboard. 

That means that the asdf keys would be in reverse numeric order, starting with (in hexidecimal) `0x1`.

`0x1`=<kbd>a</kbd>={{< img path="https://handex.io/images/svgs/1.svg" class="char-glyph">}}
`0x2`=<kbd>s</kbd>={{< img path="https://handex.io/images/svgs/2.svg" class="char-glyph">}}
`0x3`=<kbd>d</kbd>={{< img path="https://handex.io/images/svgs/3.svg" class="char-glyph">}}
`0x4`=<kbd>f</kbd>={{< img path="https://handex.io/images/svgs/4.svg" class="char-glyph">}}

Those are single-click characters, coresponding to the home-row keys, but additional characters can be composed from key sequences, which are any set of keys pressed before all keys are released.

So we can compose new characters not on the home-row by combining home-row characters:

`0x21`=<kbd>g</kbd>={{< img path="https://handex.io/images/svgs/21.svg" class="char-glyph">}}

 <kbd>d</kbd> + <kbd>f</kbd> --> <kbd>g</kbd>

Or:

```mermaid
stateDiagram-v2
    state g {
        direction LR
        d --> f
    }
```

This gives us a way of using the home-row keys to _point_ to non-home-row keys.

The <kbd>d</kbd> + <kbd>f</kbd> _points to_ the <kbd>g</kbd>.

{{< img path="/images/blogs/d_of_f_is_g.png" width="300" >}}

The `jkl;` characters are sent by a single-click of the grasp knuckles closer to the palm. 

`0x6`=<kbd>j</kbd>={{< img path="https://handex.io/images/svgs/6.svg" width="100" class="char-glyph">}}
`0x7`=<kbd>k</kbd>={{< img path="https://handex.io/images/svgs/7.svg" width="100" class="char-glyph">}}
`0x8`=<kbd>l</kbd>={{< img path="https://handex.io/images/svgs/8.svg" width="100" class="char-glyph">}}
`0x9`=<kbd>;</kbd>={{< img path="https://handex.io/images/svgs/9.svg" width="100" class="char-glyph">}}

So <kbd>h</kbd> can be composed from <kbd>k</kbd> + <kbd>j</kbd>

{{< img path="/images/blogs/k_to_jis_h.png" width="300" >}}

~~There is an apparent mirroring between these two pointers, but observe that both pointers point to the key next to the index finger. The mirroring hapens because most keyboards are made for two hands, and your two hands are mirror images of each other. Because the Handex is made for a single hand, we use the Thumb as the origin and the Index finger as the first ordinate. So the Thumb pinch is `0x0` and the Index pinch is `0x1`.~~



{{< img path="/images/blogs/surface-keyboard.png" width="300" class="">}}
![](2023-09-25-19-17-32.png)