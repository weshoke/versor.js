var C3 = versor.create({
	metric:[1, 1, 1, 1, -1],
	types: [
		{ name:"Vec3", bases:["e1", "e2", "e3"] },
		{ name:"Biv3", bases:["e12", "e13", "e23"] },
		{ name:"Tri3", bases:["e123"] },
		{ name:"Pss", bases:["e12345"] },
		{ name:"Rot", bases:["s", "e12", "e13", "e23"] },
		{ name:"Pnt", bases:["e1", "e2", "e3", "e4", "e5"], dual:true },
		{ name:"Dlp", bases:["e1", "e2", "e3", "e5"], dual:true },
		{ name:"Pln", bases:["e1235", "e1245", "e1345", "e2345"] },
		{ name:"Sph", bases:["e1235", "e1234", "e1245", "e1345", "e2345"] },
		{ name:"Dll", bases:["e12", "e13", "e23", "e15", "e25", "e35"], dual:true },
		{ name:"Lin", bases:["e145", "e245", "e345", "e125", "e135", "e235"] },
		{ name:"Flp", bases:["e15", "e25", "e35", "e45"] },
		{ name:"Par", bases:["e12", "e13", "e23", "e14", "e24", "e34", "e15", "e25", "e35", "e45"], dual:true },
		{ name:"Cir", bases:["e123", "e145", "e245", "e345", "e124", "e134", "e234", "e125", "e135", "e235"] },
		{ name:"Bst", bases:["s", "e12", "e13", "e23", "e14", "e24", "e34", "e15", "e25", "e35", "e45"] },
		{ name:"Dil", bases:["s", "e45"] },
		{ name:"Mot", bases:["s", "e12", "e13", "e23", "e15", "e25", "e35", "e1235"] },
		{ name:"Trs", bases:["s", "e15", "e25", "e35"] },
		{ name:"Drv", bases:["e15", "e25", "e35"] },
		{ name:"Drb", bases:["e125", "e135", "e235"] },
		{ name:"Drt", bases:["e1235"] },
		{ name:"Tnv", bases:["e14", "e24", "e34"] },
	],
	conformal:true
});


var cosh = function(v) {
	return (Math.exp(v) + Math.exp(-v))*0.5;
}
	
var sinh = function(v) {
	return (Math.exp(v) - Math.exp(-v))*0.5;
}



C3.Ori = C3.e4(1);
C3.Inf = C3.e5(1);

C3.Ro = {
	point: function(x, y, z) {
		return C3.Pnt(x, y, z, 1, (x*x+y*y+z*z)*0.5);
	},
	ipoint: function(x, y, z) {
		return C3.Pnt(x, y, z, -1, (x*x+y*y+z*z)*0.5);
	},
	dls: function(x, y, z, r) {
		var s = C3.Ro.point(x, y, z);
		if(r > 0) s[4] -= .5 * (r * r);
		else s[4] += .5 * (r * r);
        return s;
	},
	circle: function(cen, dir, r) {
		var plane = cen.op(C3.dual(dir))
		var sphere = C3.Ro.dls(cen[0], cen[1], cen[2], r);
		return sphere.ip(plane);
	},
	size: function(a) {
		var v1 = C3.Inf.ip(a);
		var v2 = a.gp(a.involute()).gp(v1.gp(v1).inverse());
		return a.isdual() ? -v2[0] : v2[0];
	},
	radius: function(a) {
		var size = C3.Ro.size(a);
		if(size < 0) return -Math.sqrt(-size);
		else return Math.sqrt(size);
	},
	cen: function(a) {
		var v = C3.Inf.ip(a);
		return C3.Pnt(a.gp(C3.Inf).gp(a).div(v.gp(v).gp(-2)));
	},
	// squared distance
	sqd: function(a, b) {
		return -a.ip(b)[0];
	},
	// distance
	dst: function(a, b) {
		return Math.sqrt(Math.abs(C3.Ro.sqd(a, b)));
	},
	car: function(a) {
		return a.op(C3.Inf);
	},
	// split a point pair into its 2 points, returns an array
	split: function(pp) {
		var r = Math.sqrt( Math.abs( pp.ip(pp)[0]  )) 
		var dlp = C3.e5(-1).ip(pp);
		var bstA = C3.Bst(pp);
		var bstB = C3.Bst(pp);
		bstA[0] -= r;
		bstB[0] += r;
		var pA = C3.Pnt(bstA.div(dlp));
		var pB = C3.Pnt(bstB.div(dlp));
		return [pA, pB];
	},
};

// normalize a point to have weight 1
C3.Ro.point.normalize = function(p) {
	return p.gp(1/p[3]);
}

C3.api.classes.Pnt.prototype.normalize = function() {
	return C3.Ro.point.normalize(this);
}

	
C3.Fl = {
	line: function(p1, p2) {
		return p1.op(p2).op(C3.Inf);
	},
	dir: function(a) {
		return a.isdual() ?
			C3.e5(1).op(a) :
			C3.e5(-1).ip(a);
	},
	loc: function(a, p) {
		if(a.isdual()) return C3.Pnt(p.op(a).div(a));
		else return C3.Pnt(p.ip(a).div(a));
	}
};

C3.Op = {
	trs: function(x, y, z) {
		return C3.Trs(1, 0.5*x, 0.5*y, 0.5*z);
	},
	bst: function(pp) {
		var sz = C3.wt(pp);
		
		// Boost is hyperbolic, so use sinh and cosh instead of sin and cos 
		// to determine the component magnitudes
		var cn, sn;
		if(sz < 0) {
			var norm = Math.sqrt(-sz);
			cn = cosh(norm);
			sn = -sinh(norm);
		}
		else if(sz > 0) {
			var norm = Math.sqrt(sz);
			cn = cosh(norm);
			sn = -sinh(norm);
		}
		else {
			cn = 1;
			sn = -1;
		}
		var res = C3.Bst(pp.gp(sn));
		res[0] = cn;
		return res;
	},
	rj: function(a, b) {
		return a.op(b).div(b);
	},
	pj: function(a, b) {
		return C3[a.type](a.ip(b).div(b));
	}
};

C3.Ta = {
	dir: function(el) {
		return C3.Inf.ip(el).op(C3.Inf);
	},
	loc: function(el) {
		return C3.Vec(el.div(C3.e5(-1).ip(el)));
	}
}

C3.Dr = {
	elem: function(d) {
		return C3.Ori.ip(d.involute());
	}
}

var sinc = function(x) {
	if(x === 0) return 1;
	else return Math.sin(x)/x;
}

var feq = function(v1, v2, eps) {
	return Math.abs(v1-v2) <= eps;
}

C3.Gen = {
	dil: function(amt) {
        return C3.Dil(cosh(amt*0.5), sinh(amt*0.5));
	},
	mot: function(dll) {
		var B = C3.Biv3(dll);
		var wt = C3.wt(B);
		
		if(feq(wt, 0, 1e-8)) {
			return C3.Mot(1, 0, 0, 0, dll[3], dll[4], dll[5], 0); 
		}
		
		var c = Math.sqrt(Math.abs(wt))
		var cc = Math.cos(c);
		var sc = Math.sin(c);
		
		var B = C3.unit(B);
		var t = C3.Vec3(dll[3], dll[4], dll[5]);
		
		var tv = C3.Op.pj(t, B);
		var tw = C3.Op.rj(t, B);
		
		tv = tv.gp(sinc(c));

		var tt = tw.gp(cc).add(tv);
		var ts = B.gp(tw);

		return C3.Mot(cc, B[0]*sc, B[1]*sc, B[2]*sc, tt[0], tt[1], tt[2], ts[3]*sc);
	},
	log: function(m) {
		var ac = Math.acos(m[0]);
		var den = sinc(ac);
		var den2 = ac*ac*den;

		if(feq(den2, 0, 1e-8)) {
			var cpara = C3.Drv(m);
			return C3.Dll(cpara);
		}
		else {
			var b = C3.Biv3(C3.Ori.ip(m.gp(C3.Inf)).gp(-1/den));
			var tq = C3.Dll(b.gp(m));
		
			// perpendicular (along line of axis)
			var cperp = C3.Drv(b.gp(C3.Drt(m[7])).gp(-1/den2));
			// parallel (in plane of rotation)
			var cpara = C3.Drv(b.gp(tq).gp(-1/den2));
			
			var c = cperp.add(cpara);
			return C3.Dll(b.add(c)); 
		}
    },
    ratio: function(a, b, t) {
		if(feq(C3.norm(a), 0, 1e-8)) {
			var dll = b.gp(t);
			return C3.Gen.mot(dll);
		}
		
    	var m = b.div(a);
    	var n = C3.rnorm(m);
    	if(n !== 0) {
    		m = m.gp(1/n);
		}
		var dll = C3.Gen.log(m).gp(t*0.5);
		if(feq(C3.norm(dll), 0, 1e-8)) {
			var ac = Math.acos(m[0]);
			var PAO = C3.Ro.point(0, 0, 0)
			var p1 = C3.Fl.loc(a, PAO);
			var p2 = C3.Fl.loc(b, PAO);
			var trans = p2.sub(p1);
			
			if(feq(ac, Math.PI, 1e-8)) {
				var biv = C3.Biv3(a);
				var within = C3.Op.pj(C3.Vec3(1, 0, 0), biv);
				if(feq(C3.norm(within), 0, 1e-8)) {
					within = C3.Op.pj(C3.Vec3(0, 1, 0), biv);
					if(feq(C3.norm(within), 0, 1e-8)) {
						within = C3.Op.pj(C3.Vec3(0, 0, 1), biv);
					}
				}
				within = C3.unit(within);
				
				var rotBiv = C3.duale(within).gp(t);
				trans = trans.gp(t);
				
				var rot = C3.Rot(rotBiv);
				rot[0] = 1-t;
				return C3.Op.trs(trans[0], trans[1], trans[2]).gp(rot);
			}
			else {
				var dll2 = C3.Dll(t);
				return C3.Mot(dll2);
			}
		}
		else {
	    	return C3.Gen.mot(dll);
	    }
    }
}

C3.dot = function(el) {
	return el.ip(el);
}

C3.rdot = function(el) {
	return el.ip(el.reverse());
}

C3.wt = function(el) {
	return C3.dot(el, el)[0];
}

C3.rwt = function(el) {
	return C3.rdot(el, el)[0];
}

C3.norm = function(el) {
	var a = C3.rwt(el);
	if(a < 0) return 0;
	return Math.sqrt(a);
}

C3.rnorm = function(el) {
	var a = C3.rwt(el);
	if(a < 0) return -Math.sqrt(-a);
	return Math.sqrt(a);
}

C3.mag = function(el) {
	return Math.sqrt(Math.abs(C3.wt(el)));
}

C3.unit = function(el) {
	var mag = C3.mag(el);
	return C3.gp(el, 1/mag);
}

C3.runit = function(el) {
	var mag = C3.rnorm(el);
	return el.gp(1/mag);
}

C3.dual = function (el) {
	return el.gp(C3.Pss(-1));
}
C3.undual = function (el) {
	return el.gp(C3.Pss(1));
}

// Euclidean duals
C3.duale = function(el) {
	return el.gp(C3.Tri3(-1));
}
C3.uduale = function(el) {
	return el.gp(C3.Tri3(1));
}
