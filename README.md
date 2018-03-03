# 163
## Homework 1
* [Part A](hw1/README_A.md)

Three lights rotate independently, one around the y axis, one z, one -x = y plane. The objects each rotate. The rightmost is texture and lit by one light. The middle lit by a different light, using Gourad lighting. The left lit by two lights using Phong.

* [Part B](hw1/README_B.md)

I used the third edge detection kernel listed on the wikipedia page. Leftmost mouse is only the texture, rightmost is only the edges.

* [Part C](hw1/README_C.md)

I used the "Diamond Cycles" cyclic cellular automata with 14 colors.

* [Part D](hw1/Homework1D.md)

## Homework 2
* [Part A](hw2/a/README_A.md)
I used an image to heightmap a terrain. Brought in the skybox, and a plane for the water with reflection of the skybox. I used the snoise function from the repo linked in part b to add a fun effect to the water. I have dat.gui controlling water alpha and displacement amount. Used OrbitControls for controlling the camera.

* [Part B](hw2/b/README_B.md)
I used a fire sprite with GPUParticleSystem for fire. I used snoise from the linked repo for something like water. I have the default particle generator controls as well as changing how much the UV coords are multiplied by and the mixvalue for the water color vs the noise. 

## Homework 3
* [Part B](hw3/b/README_B.md)
I used functions from the [Jamie Wong article](http://jamie-wong.com/2016/07/15/ray-marching-signed-distance-functions/) and SDFs and mixing functions from [here](http://iquilezles.org/www/articles/distfunctions/distfunctions.htm). I have a cube and a torus being rotated and smoothly mixed together and gradually goes to a cube rotating, with a simple red color. I have the cylinder textured using trigonometric equations and the point in object coordinates that the ray hits the cylinder. I did limit the size of the canvas to 640x640. 
* [Part c](hw3/c/README_C.md)