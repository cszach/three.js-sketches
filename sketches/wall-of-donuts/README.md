# wall-of-donuts

![thumbnail](thumbnail.png)

A wall with donuts sticked on it, because why not?

Move your mouse around and you will also find out that you are actually placed
inside a room with some other interesting stuff. The room has 4 walls, a floor,
and a ceilling (a typical room). The wall on the left side has a big mirror on
it (`Reflector`). Right behind you, there are some meshes that are just there
for fun, and most importantly: a door to Reality.

## Interaction

- Move your mouse to look around (`FlyControls`)
- Click the light switch (next to the door) or click the light bulb to turn
  the light on and off
- Click on the door knob to open or close the door
- Press the D key on your keyboard to toggle debugging mode (by default,
  debugging mode is off)
- While debugging mode is on, press the C key on your keyboard to switch between
  first-person camera view (default) and third-person camera view (which is only
  available when debugging mode is on)

## To-do's

- [ ] Don't start the experiment until all the donuts are loaded into the scene
- [ ] Physically correct lights and shadows
  - [ ] Physically correct the point light on the ceilling and the external
        light that comes in when the door is opened
  - [ ] Correct shadows
- [ ] Correct dimension and measurements
- [ ] Find a better type of mouse control (what is looked for is something
      similar to `FlyControls`, but just no z-rotation on the camera)

> **Note**: `wall-of-donuts.draft.js` is an attempt to physically correct things
in this sketch, however it currently has several problems.

## Acknowledgements

[dawid]: https://unsplash.com/@davealmine
[dawid-photo]: https://unsplash.com/photos/xclq1CPq1M4
[doorview]: textures/doorview.png

The donuts were made by me using Microsoft's Paint 3D.

Thanks are due to...

- [Dawid Zawila][dawid], for the public-domain photograph from which the door
  view image was composed from (original photo [here][dawid-photo], cropped
  image used in the sketch [here][doorview])
- whoever (probably NASA) owns or produced the textures of parts of the Earth
  (I took them from the three.js repository)
