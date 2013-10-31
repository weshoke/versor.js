(function(global){

'use strict';

// E3 Geometric Algebra Module
var E3 = typeof exports !== 'undefined' ? exports : (global.E3 = {});

var Sca = function(v0) {
	this.key = 1;
	this[0] = v0;
}
E3.Sca = Sca

Sca.prototype.toString = function() {
	return "Sca: " + this[0]; 
}

Sca.prototype.ip = function(b) {
	return Sca.prototype._ip[b.key].call(this, b);
}
Sca.prototype.op = function(b) {
	return Sca.prototype._op[b.key].call(this, b);
}
Sca.prototype.gp = function(b) {
	return Sca.prototype._gp[b.key].call(this, b);
}
Sca.prototype.sp = function(b) {
	return Sca.prototype._sp[b.key].call(this, b);
}

Sca.prototype._ip = {};
Sca.prototype._op = {};
Sca.prototype._gp = {};
Sca.prototype._sp = {};


// reverse(Sca) -> Sca
Sca.prototype.reverse = function() {
	return new Sca(
		this[0]
	);
}

// involute(Sca) -> Sca
Sca.prototype.involute = function() {
	return new Sca(
		this[0]
	);
}

// conjugate(Sca) -> Sca
Sca.prototype.conjugate = function() {
	return new Sca(
		this[0]
	);
}

// magsq(Sca) -> number
Sca.prototype.magsq = function() {
	return this.gp(
		this.reverse()
	)[0];
}

var Vec = function(v0, v1, v2) {
	this.key = 22;
	this[0] = v0;
	this[1] = v1;
	this[2] = v2;
}
E3.Vec = Vec

Vec.prototype.toString = function() {
	return "Vec: " + this[0] + " " + this[1] + " " + this[2]; 
}

Vec.prototype.ip = function(b) {
	return Vec.prototype._ip[b.key].call(this, b);
}
Vec.prototype.op = function(b) {
	return Vec.prototype._op[b.key].call(this, b);
}
Vec.prototype.gp = function(b) {
	return Vec.prototype._gp[b.key].call(this, b);
}
Vec.prototype.sp = function(b) {
	return Vec.prototype._sp[b.key].call(this, b);
}

Vec.prototype._ip = {};
Vec.prototype._op = {};
Vec.prototype._gp = {};
Vec.prototype._sp = {};


// reverse(Vec) -> Vec
Vec.prototype.reverse = function() {
	return new Vec(
		this[0],
		this[1],
		this[2]
	);
}

// involute(Vec) -> Vec
Vec.prototype.involute = function() {
	return new Vec(
		-this[0],
		-this[1],
		-this[2]
	);
}

// conjugate(Vec) -> Vec
Vec.prototype.conjugate = function() {
	return new Vec(
		-this[0],
		-this[1],
		-this[2]
	);
}

// magsq(Vec) -> number
Vec.prototype.magsq = function() {
	return this.gp(
		this.reverse()
	)[0];
}

var Biv = function(v0, v1, v2) {
	this.key = 104;
	this[0] = v0;
	this[1] = v1;
	this[2] = v2;
}
E3.Biv = Biv

Biv.prototype.toString = function() {
	return "Biv: " + this[0] + " " + this[1] + " " + this[2]; 
}

Biv.prototype.ip = function(b) {
	return Biv.prototype._ip[b.key].call(this, b);
}
Biv.prototype.op = function(b) {
	return Biv.prototype._op[b.key].call(this, b);
}
Biv.prototype.gp = function(b) {
	return Biv.prototype._gp[b.key].call(this, b);
}
Biv.prototype.sp = function(b) {
	return Biv.prototype._sp[b.key].call(this, b);
}

Biv.prototype._ip = {};
Biv.prototype._op = {};
Biv.prototype._gp = {};
Biv.prototype._sp = {};


// reverse(Biv) -> Biv
Biv.prototype.reverse = function() {
	return new Biv(
		-this[0],
		-this[1],
		-this[2]
	);
}

// involute(Biv) -> Biv
Biv.prototype.involute = function() {
	return new Biv(
		this[0],
		this[1],
		this[2]
	);
}

// conjugate(Biv) -> Biv
Biv.prototype.conjugate = function() {
	return new Biv(
		-this[0],
		-this[1],
		-this[2]
	);
}

// magsq(Biv) -> number
Biv.prototype.magsq = function() {
	return this.gp(
		this.reverse()
	)[0];
}

var Rot = function(v0, v1, v2, v3) {
	this.key = 105;
	this[0] = v0;
	this[1] = v1;
	this[2] = v2;
	this[3] = v3;
}
E3.Rot = Rot

Rot.prototype.toString = function() {
	return "Rot: " + this[0] + " " + this[1] + " " + this[2] + " " + this[3]; 
}

Rot.prototype.ip = function(b) {
	return Rot.prototype._ip[b.key].call(this, b);
}
Rot.prototype.op = function(b) {
	return Rot.prototype._op[b.key].call(this, b);
}
Rot.prototype.gp = function(b) {
	return Rot.prototype._gp[b.key].call(this, b);
}
Rot.prototype.sp = function(b) {
	return Rot.prototype._sp[b.key].call(this, b);
}

Rot.prototype._ip = {};
Rot.prototype._op = {};
Rot.prototype._gp = {};
Rot.prototype._sp = {};


// reverse(Rot) -> Rot
Rot.prototype.reverse = function() {
	return new Rot(
		this[0],
		-this[1],
		-this[2],
		-this[3]
	);
}

// involute(Rot) -> Rot
Rot.prototype.involute = function() {
	return new Rot(
		this[0],
		this[1],
		this[2],
		this[3]
	);
}

// conjugate(Rot) -> Rot
Rot.prototype.conjugate = function() {
	return new Rot(
		this[0],
		-this[1],
		-this[2],
		-this[3]
	);
}

// magsq(Rot) -> number
Rot.prototype.magsq = function() {
	return this.gp(
		this.reverse()
	)[0];
}

var Rot_Vec = function(v0, v1, v2, v3) {
	this.key = 150;
	this[0] = v0;
	this[1] = v1;
	this[2] = v2;
	this[3] = v3;
}
E3.Rot_Vec = Rot_Vec

Rot_Vec.prototype.toString = function() {
	return "Rot_Vec: " + this[0] + " " + this[1] + " " + this[2] + " " + this[3]; 
}

Rot_Vec.prototype.ip = function(b) {
	return Rot_Vec.prototype._ip[b.key].call(this, b);
}
Rot_Vec.prototype.op = function(b) {
	return Rot_Vec.prototype._op[b.key].call(this, b);
}
Rot_Vec.prototype.gp = function(b) {
	return Rot_Vec.prototype._gp[b.key].call(this, b);
}
Rot_Vec.prototype.sp = function(b) {
	return Rot_Vec.prototype._sp[b.key].call(this, b);
}

Rot_Vec.prototype._ip = {};
Rot_Vec.prototype._op = {};
Rot_Vec.prototype._gp = {};
Rot_Vec.prototype._sp = {};


// reverse(Rot_Vec) -> Rot_Vec
Rot_Vec.prototype.reverse = function() {
	return new Rot_Vec(
		this[0],
		this[1],
		this[2],
		-this[3]
	);
}

// involute(Rot_Vec) -> Rot_Vec
Rot_Vec.prototype.involute = function() {
	return new Rot_Vec(
		-this[0],
		-this[1],
		-this[2],
		-this[3]
	);
}

// conjugate(Rot_Vec) -> Rot_Vec
Rot_Vec.prototype.conjugate = function() {
	return new Rot_Vec(
		-this[0],
		-this[1],
		-this[2],
		this[3]
	);
}

// magsq(Rot_Vec) -> number
Rot_Vec.prototype.magsq = function() {
	return this.gp(
		this.reverse()
	)[0];
}

var Tri = function(v0) {
	this.key = 128;
	this[0] = v0;
}
E3.Tri = Tri

Tri.prototype.toString = function() {
	return "Tri: " + this[0]; 
}

Tri.prototype.ip = function(b) {
	return Tri.prototype._ip[b.key].call(this, b);
}
Tri.prototype.op = function(b) {
	return Tri.prototype._op[b.key].call(this, b);
}
Tri.prototype.gp = function(b) {
	return Tri.prototype._gp[b.key].call(this, b);
}
Tri.prototype.sp = function(b) {
	return Tri.prototype._sp[b.key].call(this, b);
}

Tri.prototype._ip = {};
Tri.prototype._op = {};
Tri.prototype._gp = {};
Tri.prototype._sp = {};


// reverse(Tri) -> Tri
Tri.prototype.reverse = function() {
	return new Tri(
		-this[0]
	);
}

// involute(Tri) -> Tri
Tri.prototype.involute = function() {
	return new Tri(
		-this[0]
	);
}

// conjugate(Tri) -> Tri
Tri.prototype.conjugate = function() {
	return new Tri(
		this[0]
	);
}

// magsq(Tri) -> number
Tri.prototype.magsq = function() {
	return this.gp(
		this.reverse()
	)[0];
}

// ip(Vec, Vec) -> Sca
Vec.prototype._ip[22] = function(b) {
	return new Sca(
		this[0]*b[0]+this[1]*b[1]+this[2]*b[2]
	);
}

// op(Vec, Vec) -> Biv
Vec.prototype._op[22] = function(b) {
	return new Biv(
		this[0]*b[1]-this[1]*b[0],
		this[0]*b[2]-this[2]*b[0],
		this[1]*b[2]-this[2]*b[1]
	);
}

// gp(Vec, Vec) -> Rot
Vec.prototype._gp[22] = function(b) {
	return new Rot(
		this[0]*b[0]+this[1]*b[1]+this[2]*b[2],
		this[0]*b[1]-this[1]*b[0],
		this[0]*b[2]-this[2]*b[0],
		this[1]*b[2]-this[2]*b[1]
	);
}

// ip(Biv, Biv) -> Sca
Biv.prototype._ip[104] = function(b) {
	return new Sca(
		-this[0]*b[0]-this[1]*b[1]-this[2]*b[2]
	);
}

// gp(Biv, Biv) -> Rot
Biv.prototype._gp[104] = function(b) {
	return new Rot(
		-this[0]*b[0]-this[1]*b[1]-this[2]*b[2],
		-this[1]*b[2]+this[2]*b[1],
		this[0]*b[2]-this[2]*b[0],
		-this[0]*b[1]+this[1]*b[0]
	);
}

// ip(Tri, Tri) -> Sca
Tri.prototype._ip[128] = function(b) {
	return new Sca(
		-this[0]*b[0]
	);
}

// gp(Tri, Tri) -> Sca
Tri.prototype._gp[128] = function(b) {
	return new Sca(
		-this[0]*b[0]
	);
}

// op(Vec, Biv) -> Tri
Vec.prototype._op[104] = function(b) {
	return new Tri(
		this[0]*b[2]-this[1]*b[1]+this[2]*b[0]
	);
}

// op(Biv, Vec) -> Tri
Biv.prototype._op[22] = function(b) {
	return new Tri(
		this[0]*b[2]-this[1]*b[1]+this[2]*b[0]
	);
}

// gp(Vec, Biv) -> Rot_Vec
Vec.prototype._gp[104] = function(b) {
	return new Rot_Vec(
		-this[1]*b[0]-this[2]*b[1],
		this[0]*b[0]-this[2]*b[2],
		this[0]*b[1]+this[1]*b[2],
		this[0]*b[2]-this[1]*b[1]+this[2]*b[0]
	);
}

// gp(Biv, Vec) -> Rot_Vec
Biv.prototype._gp[22] = function(b) {
	return new Rot_Vec(
		this[0]*b[1]+this[1]*b[2],
		-this[0]*b[0]+this[2]*b[2],
		-this[1]*b[0]-this[2]*b[1],
		this[0]*b[2]-this[1]*b[1]+this[2]*b[0]
	);
}

// ip(Vec, Biv) -> Vec
Vec.prototype._ip[104] = function(b) {
	return new Vec(
		-this[1]*b[0]-this[2]*b[1],
		this[0]*b[0]-this[2]*b[2],
		this[0]*b[1]+this[1]*b[2]
	);
}

// ip(Vec, Rot) -> Vec
Vec.prototype._ip[105] = function(b) {
	return new Vec(
		-this[1]*b[1]-this[2]*b[2],
		this[0]*b[1]-this[2]*b[3],
		this[0]*b[2]+this[1]*b[3]
	);
}

// ip(Vec, Tri) -> Biv
Vec.prototype._ip[128] = function(b) {
	return new Biv(
		this[2]*b[0],
		-this[1]*b[0],
		this[0]*b[0]
	);
}

// ip(Biv, Rot) -> Sca
Biv.prototype._ip[105] = function(b) {
	return new Sca(
		-this[0]*b[1]-this[1]*b[2]-this[2]*b[3]
	);
}

// ip(Biv, Tri) -> Vec
Biv.prototype._ip[128] = function(b) {
	return new Vec(
		-this[2]*b[0],
		this[1]*b[0],
		-this[0]*b[0]
	);
}

// gp(Tri, Vec) -> Biv
Tri.prototype._gp[22] = function(b) {
	return new Biv(
		this[0]*b[2],
		-this[0]*b[1],
		this[0]*b[0]
	);
}

// gp(Vec, Tri) -> Biv
Vec.prototype._gp[128] = function(b) {
	return new Biv(
		this[2]*b[0],
		-this[1]*b[0],
		this[0]*b[0]
	);
}

// gp(Tri, Biv) -> Vec
Tri.prototype._gp[104] = function(b) {
	return new Vec(
		-this[0]*b[2],
		this[0]*b[1],
		-this[0]*b[0]
	);
}

// gp(Biv, Tri) -> Vec
Biv.prototype._gp[128] = function(b) {
	return new Vec(
		-this[2]*b[0],
		this[1]*b[0],
		-this[0]*b[0]
	);
}

// sp(Sca, Rot) -> Sca
Sca.prototype._sp[105] = function(b) {
	var c = new Rot(
		b[0]*this[0],
		b[1]*this[0],
		b[2]*this[0],
		b[3]*this[0]
	);
	var d = b.reverse();
	return new Sca(
		c[0]*d[0]-c[1]*d[1]-c[2]*d[2]-c[3]*d[3]
	);
}

// sp(Vec, Rot) -> Vec
Vec.prototype._sp[105] = function(b) {
	var c = new Rot_Vec(
		b[0]*this[0]+b[1]*this[1]+b[2]*this[2],
		b[0]*this[1]-b[1]*this[0]+b[3]*this[2],
		b[0]*this[2]-b[2]*this[0]-b[3]*this[1],
		b[1]*this[2]-b[2]*this[1]+b[3]*this[0]
	);
	var d = b.reverse();
	return new Vec(
		c[0]*d[0]-c[1]*d[1]-c[2]*d[2]-c[3]*d[3],
		c[0]*d[1]+c[1]*d[0]-c[2]*d[3]+c[3]*d[2],
		c[0]*d[2]+c[1]*d[3]+c[2]*d[0]-c[3]*d[1]
	);
}

// sp(Biv, Rot) -> Biv
Biv.prototype._sp[105] = function(b) {
	var c = new Rot(
		-b[1]*this[0]-b[2]*this[1]-b[3]*this[2],
		b[0]*this[0]-b[2]*this[2]+b[3]*this[1],
		b[0]*this[1]+b[1]*this[2]-b[3]*this[0],
		b[0]*this[2]-b[1]*this[1]+b[2]*this[0]
	);
	var d = b.reverse();
	return new Biv(
		c[0]*d[1]+c[1]*d[0]-c[2]*d[3]+c[3]*d[2],
		c[0]*d[2]+c[1]*d[3]+c[2]*d[0]-c[3]*d[1],
		c[0]*d[3]-c[1]*d[2]+c[2]*d[1]+c[3]*d[0]
	);
}

// sp(Tri, Rot) -> Tri
Tri.prototype._sp[105] = function(b) {
	var c = new Rot_Vec(
		-b[3]*this[0],
		b[2]*this[0],
		-b[1]*this[0],
		b[0]*this[0]
	);
	var d = b.reverse();
	return new Tri(
		c[0]*d[3]-c[1]*d[2]+c[2]*d[1]+c[3]*d[0]
	);
}


}(this));