versor.js
=========

A Javascript port of the Versor Geometric Algebra library


Basic constructs:

```
var vec = E3.Vec(1, 0, 0);	// a vector
var biv = E3.Biv(0, 1, 0); // a bivector
var tri = E3.Tri(1); // a trivector
```


Operators:

```
var e1 = E3.Vec(1, 0, 0); // unit vector
var e2 = E3.Vec(0, 1, 0); // unit vector
var e12 = e1.op(e2); // unit bivector
var rot = e1.gp(e2); // 180 degree rotator, similar to a quaternion

var vec = E3.Vec(1, 2, 3);
var vecRotated = vec.sp(rot); // apply the sandwich product of a rotor and a vector

var res = vec.ip(e1); // apply the inner product to find a common subspace (like the dot product)
```