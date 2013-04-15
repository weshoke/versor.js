versor.js
=========

A Javascript port of the Versor Geometric Algebra library


The E3 Module
---------

The E3 module implements the 3D Euclidean geometric algebra.  The primitives of this algebra are 

* scalars (Sca)
* vectors (Vec)
* bivectors (Biv)
* rotors (Rot)
* trivectors (Tri)

Of note is the Rot object, which is almost the same as the more common quaternion but is right-handed instead of left-handed.  Rotors can be used to rotate vectors and bivectors using the sandwich product method, .sp().


The E3 geometric algebra defines coordinates:

	scalars: s 
	vectors: e1 e2 e3 
	bivectors: e12 e13 e23 
	trivectors: e123

The various objects have coordinates:

	Sca: s
	Vec: e1 e2 e3
	Biv: e12 e13 e23
	Rot s e12 e13 e23
	Tri: e123


#### Constructors: ####

```
var vec = E3.Vec(1, 0, 0);	// a vector
var biv = E3.Biv(0, 1, 0); // a bivector
var tri = E3.Tri(1); // a trivector
```


#### Operators: ####

	Geometric Product: gp
	Outer Product: op
	Inner Product: ip
	Sandwich Product: sp
	Reverse: reverse
	Involute: involute
	Conjugate: conjugate


```
var e1 = E3.Vec(1, 0, 0); // unit vector
var e2 = E3.Vec(0, 1, 0); // unit vector
var e12 = e1.op(e2); // unit bivector
var rot = e1.gp(e2); // 180 degree rotator, similar to a quaternion

var vec = E3.Vec(1, 2, 3);
var vecRotated = vec.sp(rot); // apply the sandwich product of a rotor and a vector

var res = vec.ip(e1); // apply the inner product to find a common subspace (like the dot product)
```