versor.js
=========

#### A Javascript port of the Versor geometric algebra library ####

Geometric algebra is a mathematical framework for describing spatial computations. The elements in geometric algebra represent objects such as points, lines, cicles, spheres, etc. as well as their transformations.  With a few simple operations, elements can be reflected, rotated, scaled, translated, and so on.  Compared to more widely used techniques in vector or matrix algebra, calculations performed in geometric algebra generalize to N-dimensions.  Operations behave identically in 2D, 3D, and even 4D or higher.

Versor is a generator for N-dimensional geometric algebras.  It implements both Euclidean and conformal algebras.  Euclidean algebras behave similarly to the familiar 2D and 3D vector spaces.  Conformal algebras add additional dimensions that make possible new geometric objects and transformations.  For an introduction, see Pablo Colapinto's [thesis about Versor](http://www.wolftype.com/versor/colapinto_masters_final_02.pdf).


---------

## The Space Object ##
The space object represents a geometric algebra with a specific metric.  The metric of an algebra determines its dimensionality and behavior.  For example:

```js
var E3 = versor.create({
	metric:[1, 1, 1]
};
```

creates an algebra representing a 3D Euclidean space.  Other models are possible such as

```js
var C3 = version.create{
	metric:[1, 1, 1, 1, -1],
	conformal:true
};
```

which creates a 5D algebra commonly referred to as the 3D conformal model.  While the algebra itself is 5-dimensional, its elements can be used to model objects and transformations in 3D with more generality than the simpler [1, 1, 1] metric.  For more details, see the section on conformal geometric algebra in Geometric Algebra for Computer Science.

From the metric, the Space object generates coordinates for spatial dimensions named __e1__, __e2__, __e3__, __e4__, etc. for the __x__, __y__, __z__, and __4th dimension__.  The pattern continues up to the Nth dimension.  Scalars (aka the 0th dimension) is given the name __s__.  In addition, the Space object will build aggregate types for each grade except grade 0.  In the __E3__ case above, the aggregates are:

```js
grade 1: Vec = ["e1", "e1", "e2"]
grade 2: Biv = ["e12", "e13", "e23"]
grade 3: Tri = ["e123"]
```

To build other useful aggregate objects such as versors, a list of types can be assigned to the __types__ field when creating a Space.  Each type must have a name and a list of basis coordinates along with an optional __dual__ flag.  The __dual__ flag defaults to false and is primarily useful for in conformal spaces when calculating properties of rounds or flats.  With types, E3 looks like:

```js
var E3 = versor.create({
	metric:[1, 1, 1],
	types: [
		{ name:"Rot", bases:["s", "e12", "e13", "e23"] },
		{ name:"Rot_Vec", bases:["e12", "e13", "e23", "e123"] },
	]
};
```

### Creating Objects ###
From the Space object, instances of elements within the algabra are created by referring to the name of the object.

```js
// Create an element with a single basis coordinate, e1, whose value is 0.5
var e1_half = E3.e1(0.5);

// Create a unit 3D vector along the e1 (aka x) axis
var v = E3.Vec(1, 0, 0);

// Create a rotor that rotates objects 
// 90 degrees (π/2 radians) in the e1^e2 (xy-) plane.
var rot = E3.Rot(Math.cos(Math.PI/4), 0, 0, Math.sin(Math.PI/4));
```

#### Casting ####
Elements can be cast from one type to another using the same syntax for creating elements.  When an element is cast, its basis coordinates are matched up with the result types basis coordinates.  If the result type has a basis coordinate not found in the source element, its value is set to 0.  If the source element has basis coordinates not found in the result type, they are discarded.

```js
var rot = E3.Rot(E3.Vec(1, 0, 0)) // -> Rot(0, 1, 0, 0)
var vec = E3.Vec(E3.Rot(0.5, 1, 0, 0)) // -> Vec(1, 0, 0)
```

### Operators ###
### Unary Operators ####
In geometric algebra, there are a handful of useful unary operators.  They are:

* reverse: reverse the order of basis blades
* involute: swap the parity of the grade
* conjugate: a kind of transpose/adjoint operation called the Clifford conjugate

```js
var v = E3.Vec(1, 0, 0);
var vi = v.involute();
var vr = v.reverse();
var vc = v.conjugate();
```

#### Products ####
Geometric algebra is built upon the geometric product, which can be thought of as a combination of outer and inner products.  Every type element created from a space can be combined with every other type of element through these products.   These operators' names are abbreviated as follows:

* __gp__: geometric product
* __ip__: inner product
* __op__: outer product

```js
// Create a rotor from 2 vectors with the geometric product
var rot = E3.Vec(1, 0, 0).gp(E3.Vec(0, 1, 0));

// Create a bivector from 2 vectors with the outer product
var biv = E3.Vec(1, 0, 0).op(E3.Vec(0, 1, 0));

// Create a vector from a vector and a bivector with the inner product
var v2 = E3.Vec(1, 0, 0).ip(E3.Biv(0, 1, 0));
```

One thing to note is that the inner product can be defined in a number of ways with differing results.  The most common inner products are the left constraction and the right contraction.  Here, the inner product is equivalent to the left contraction.  Essentially this means that the first operand must be the same or lower grade than the second operand.  Otherwise, the result is a scalar value of 0.

```
// the inner product (left contraction) is not commutative
var res1 = E3.Vec(1, 0, 0).ip(E3.Biv(0, 1, 0)); // -> Vec(0, 0, 1)
var res2 = E3.Biv(0, 1, 0).ip(E3.Vec(1, 0, 0)); // -> s(0)
```

Multiplying an element by a scalar is implemented by the geometric product.  To scale a vector for example, call its geometric product operator and pass in a number.

```
// Scale a vector by 2
var v = E3.Vec(1, 0, 0).gp(2);
```

For convenience, elements also have a 'sandwich operator', abbreviated as __sp__.  The sandwich operator is used to apply a versor to an element to transform it.  This is how elements are translated, rotated, scaled, etc. The argument to the sandwich operator is the versor that will transform the element the operator is called from.  For example:

```
// Create some vectors and rotors
var v1 = E3.Vec(1, 0, 0);
var v2 = E3.Vec(Math.cos(Math.PI/4), Math.sin(Math.PI/4), 0);
var rot = v1.gp(v2);

// Rotate a vector by 90 degrees using the rotor
var v = v1.sp(rot); // -> Vec(0, 1, 0)
```

#### Affine Operators ####
In addition to the products, the affine operators of addition and subtractions can be used to combine elements.  The type of the result is determined by the union of the basis coordinates of the input elements.

```js
// Vector addition
var v = E3.Vec(1, 0, 0).add(E3.Vec(0, 1, 0));

// Bivector subtraction
var b = E3.Biv(0, 1, 0).sub(E3.Biv(0, 0, 1));
```

#### Utility Functions #### 
Finally, there are two other useful functions.  One for converting an element to an array of numbers and another for pretty printing the element.

```js
var v = Vec(0, 1, 0);
console.log(v.toArray()); // [0, 1, 0]
console.log(v.toString()); // "Vec(0, 1, 0)"
```