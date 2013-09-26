var versor = function() {

var foreach = function(t, f) {
	for(var i=0; i < t.length; ++i) f(t[i], i);
}

/*	Data structure representing a blade (coordinate + scale factor)
	b - bitwise representation of coordinate
	wt - scale factor
*/
var blade = function(b, wt) {
	return { id:b, w:wt };
}

var type = function(key, bases) {
	return { key:key, bases:bases, generated:false };
}

var classname = function(name) {
	return "_"+name;
}

/*	Calculate the grade of a coordinate
	b - bitwise representation of coordinate
*/
var grade = function(b) {
	var n = 0;
	while(b != 0) {
		if( (b&1)==1 ) n += 1;
		b >>= 1;
	}
	return n;
}

/*	Calculate the sign of the product of two coordinates
	a - bitwise representation of coordinate
	b - bitwise representation of coordinate
*/
var sign = function(a, b) {
	var n = a>>1;
	var sum = 0;
	while(n != 0) {
		sum += grade(n&b)
		n >>= 1;
	}
	if((sum&1)==0) return 1;
	else return -1;
}

/*	Calculate the product between two coordinates
	a - bitwise representation of coordinate
	b - bitwise representation of coordinate
	returns a blade
*/
var product = function(a, b) {
	var res = a^b;
	var s = sign(a, b);
	return blade(res, s);
}

/*	Calculate the outer product between two coordinates
	a - bitwise representation of coordinate
	b - bitwise representation of coordinate
	returns a blade
*/
var outer = function(a, b) {
	if((a&b)!=0) return blade(0, 0);
	else return product(a, b);
}

var involute = function(x) {
	var g = grade(x);
	var n = Math.pow(-1, g);
	return blade(x, n);
}

var reverse = function(x) {
	var g = grade(x);
	var n = Math.pow(-1, (g*(g-1)/2.0));
	return blade(x, n);
}

var conjugate = function(x) {
	var g = grade(x);
	var n = Math.pow(-1, (g*(g+1)/2.0));
	return blade(x, n);
}


/*	Calculate the name of a coordinate
	b - bitwise representation of coordinate
*/
var basisString = function(b) {
	var n=0;
	var res = "";
	while(b != 0) {
		n += 1;
		if((b&1) == 1) res += n;
		b >>= 1;
	}
	if(n > 0) return "e"+res;
	else return "s";
}

var basisBit = function(name) {
	if(name == "s") return 0;

	var x = 0;
	var lastn = parseInt(name.substr(name.length-1));
	for(var i=lastn; i > 0; --i) {
		x <<= 1;
		if(name.search(i) >= 0) x += 1;
	}
	return x;
}

var basisBits = function(bases) {
	var ids = [];
	for(var i=0; i < bases.length; ++i) {
		ids[i] = basisBit(bases[i]);
	}
	return ids;
}

var basisNames = function(ty) {
	ty.sort(function(a, b) {
		return (a<b) ? -1 : 1;
	});
	
	var coords = [];
	for(var i=0; i < ty.length; ++i) {
		coords[i] = basisString(ty[i])
	}
	return coords;
}


var keyCheck = function(k1, k2) {
	if(k1.length != k2.length) return false;
	for(var i=0; i < k1.length; ++i) {
		if(k1[i] != k2[i]) return false;
	}
	return true;
}

var order = function(c) {
	var tblades = [];
	for(var i in c) {
		tblades[tblades.length] = parseInt(i);
	}
	tblades.sort(function(a, b) {
		return (a<b) ? -1 : 1;
	});
	return {
		blades: tblades,
		inst: c
	};
}

var printLines = function(text, from, to) {
	var lines = text.match(/^.*((\r\n|\n|\r)|$)/gm);
	from = from || 0;
	to = to || lines.length;
	
	for(var i=from; i < to; ++i) {
		console.log((i+1)+"\t"+lines[i].substr(0, lines[i].length-1));
	}
}


/*	Representation of a GA space
*/
var Space = function(props) {
	props = props || {};
	props.metric = props.metric || [1, 1, 1];
	props.types = props.types || [];
	props.binops = props.binops || [];

	this.metric = props.metric;
	this.basis = this.buildBasis();
	this.types = this.buildTypes();
	this.products = this.buildEuclidean();
	this.subspaces = this.buildSubspaces();
	this.registerSubspaces();
	this.createTypes(props.types);	
	
	this.api = this.generate(props);
	for(var name in this.api.constructors) {
		this[name] = this.api.constructors[name];
	}
}

Space.prototype.generate = function(props) {
	var binopCode = this.generateBinops(props.binops);
	var typeCode = this.generateRegisteredTypes();

	var functionBody = ["var api = { classes:{}, constructors:{} };"];
	for(var name in typeCode) {
		var code = typeCode[name];
		functionBody.push([
				code,
				"api.constructors."+name+" = "+name+";",
				"api.classes."+name+" = "+classname(name)+";"
			].join("\n")
		);
	}
	functionBody = functionBody.concat(binopCode);
	functionBody.push("return api;");
	var f = new Function("space", functionBody.join("\n\n"));
	return f(this);
}

Space.prototype.metricProduct = function(a, b) {
	var tmp = product(a, b);
	var bs = a&b;
	var i = 1;
	while(bs != 0) {
		if((bs&1) == 1) tmp.w *= this.metric[i-1];
		bs >>= 1;
		++i;
	}
	return tmp;
}

Space.prototype.metricInner = function(a, b) {
	var tmp = this.metricProduct(a, b);
	var g = grade(b) - grade(a);
	if(grade(a) > grade(b) || grade(tmp.id) != g) {
		return blade(0, 0);
	}
	else {
		return tmp;
	}
}

/*	Create a key capable of representing all coordinates in a metric
	b - (optional) bitwise representation of coordinate
*/
Space.prototype.key = function(b) {
	var nkeys = Math.ceil(this.basis.length/32)
	var key = [];
	for(var i=0; i < nkeys; ++i) key[i] = 0;
	
	if(b != undefined) {
		var k = Math.ceil((b+1)/32);
		var shft = (b+1) - 32*(k-1);
		key[k-1] = 1<<shft-1;
	}
	
	return key;
}

Space.prototype.basesKey = function(bases) {
	var key = this.key();
	for(var i=0; i < bases.length; ++i) {
		var b = bases[i];
		var ty = this.types[basisString(b)];
		for(var k=0; k < ty.key.length; ++k) {
			key[k] = key[k] | ty.key[k];
		}
	}
	return key;
}

/*	Construct the bitwise representation for the coordinate basis
*/
Space.prototype.buildBasis = function() {
	// initialize with the scalar
	var basis = [0];
	var basisMap = {0:true};
	
	// build the coordinate blades (e1, e2, e3, ...)
	var nb = 1;
	for(var i=0; i < this.metric.length; ++i) {
		basis[basis.length] = nb;
		basisMap[nb] = true;
		nb <<= 1;
	}
	
	// build the bivectors (e12, e23, ...)
	for(var i=0; i < basis.length; ++i) {
		for(var j=0; j < basis.length; ++j) {
			if(i!=j) {
				var r = outer(basis[i], basis[j]);
				if((r.id!=0) && !basisMap[r.id]) {
					basis[basis.length] = r.id;
					basisMap[r.id] = true;
				}
			}
		}
	}
	
	// sort the basis by grade
	basis.sort(function(a, b) {
		var l = grade(a)-1/a;
		var r = grade(b)-1/b;
		return (l<r) ? -1 : 1;
	});
	
	return basis;
}

Space.prototype.buildTypes = function() {
	var types = {};
	for(var i=0; i < this.basis.length; ++i) {
		var b = this.basis[i];
		var key = this.key(b);
		var name = basisString(b);
		types[name] = type(key, [b]);
	}
	return types;
}

Space.prototype.bladeTable = function() {
	var S = {};
	for(var i=0; i < this.basis.length; ++i) {
		var b = this.basis[i];
		var name = basisString(b);
		S[b] = {
			id: name,
			basis: b,
			gp: {}, op: {}, ip: {}
		};
	}
	return S
}

Space.prototype.buildEuclidean = function() {
	var S = this.bladeTable();
	for(var i=0; i < this.basis.length; ++i) {
		var iv = this.basis[i];
		for(var j=0; j < this.basis.length; ++j) {
			var jv = this.basis[j];
			var gp = this.metricProduct(iv, jv);
			var op = outer(iv, jv);
			var ip = this.metricInner(iv, jv);
			
			S[iv].gp[jv] = [gp];
			S[iv].op[jv] = [op];
			S[iv].ip[jv] = [ip];
			S[iv].involute = involute(iv);
			S[iv].reverse = reverse(iv);
			S[iv].conjugate = conjugate(iv);
		}
	}
	return S;
}

var _subspaceNames = ["Vec", "Biv", "Tri", "Quad", "Penta", "Hexa", "Hepta", "Octo"];
Space.prototype.buildSubspaces = function() {
	var subspaces = [];
	for(var i=0; i < this.metric.length; ++i) {
		subspaces[i] = {
			name: _subspaceNames[i],
			bases: []
		};
	}

	for(var i=0; i < this.basis.length; ++i) {
		var b = this.basis[i];
		var g = grade(b);
		if(g > 0) {
			var bases = subspaces[g-1].bases;
			bases[bases.length] = b;
		}
	}
	return subspaces;
}

Space.prototype.registerSubspaces = function() {
	for(var i=0; i < this.subspaces.length; ++i) {
		var iv = this.subspaces[i];
		this.types[iv.name] = type(this.basesKey(iv.bases), iv.bases);
	}
}

Space.prototype.replaceType = function(oty, nty) {
	types[nty] = types[oty];
	types[oty] = undefined;
	
	// rename subspace if necessary
	for(var i=0; i < this.subspaces.length; ++i) {
		var subs = this.subspaces[i];
		if(subs.name == oty) {
			subs.name = nty
			break;
		}
	}
}

Space.prototype.createType = function(bases, name, overwrite) {
	var key = this.basesKey(bases);
	for(var tyname in this.types) {
		var ty = this.types[tyname];
		if(keyCheck(key, ty.key)) { 
			if(overwrite) {
				this.replaceType(i, name)
				return name;
			}
			else {
				return tyname;
			}
		}
	}
	
	this.types[name] = type(key, bases);
	return name;
}

Space.prototype.productList = function(bases1, bases2, opname) {
	var tally = [];
	var combined = {};
	
	// fetch table pairs of values in types
	var idx = 0
	for(var i=0; i < bases1.length; ++i) {
		var iv = bases1[i];
		for(var j=0; j < bases2.length; ++j) {
			var jv = bases2[j];
		
			var prod = this.products[iv][opname][jv]
			for(var k=0; k < prod.length; ++k) {
				var instruction = {
					a: i, b: j, 
					ida: basisString(iv),
					idb: basisString(jv),
					r: prod[k]
				};
				tally[idx] = instruction;
				idx++;
			}
		}
	}

	// check for similar ids in the tally, or if weight is 0	
	for(var i=0; i < tally.length; ++i) {
		var instruction = tally[i];
		if(instruction.r.w == 0) continue;
		
		var b = instruction.r.id;
		if(combined[b]) {
			var instructions = combined[b];
			instructions[instructions.length] = instruction;
		}
		else {
			combined[b] = [instruction];
		}
	}
	//console.log(combined);
	return order(combined);
}

Space.prototype.generateType = function(name) {
	var ty = this.types[name];
	var coords = basisNames(ty.bases);
	
	var getfields = [];
	var setfields = [];
	foreach(coords, function(v, i) {
		getfields[i] = "this["+i+"]";
		setfields[i] = getfields[i]+" = "+v;
	});
	
	var model = {
		name: name,
		classname: classname(name),
		parameters: coords.join(", "),
		coords: coords,
		getfields: getfields.join(", "),
		setfields: setfields
	};
	var create = [
		"var "+model.name+" = function("+model.parameters+") {",
		"\treturn new "+model.classname+"("+model.parameters+");",
		"}"
	].join("\n");

	var def = [
		"var "+model.classname+" = function("+model.parameters+") {",
		"\tthis.type = \""+model.name+"\";",
		model.setfields.join("\n"),
		"};",
		"",
		model.classname+".prototype._ip = {};",
		model.classname+".prototype._op = {};",
		model.classname+".prototype._gp = {};",
		model.classname+".prototype._sp = {};",
		"",
		model.classname+".prototype.ip = function(b) {",
		"\tif(!this._ip[b.type]) {",
		"\t\tspace.createBinop('ip', this.type, b.type);",
		"\t}",
		"\treturn this._ip[b.type].call(this, b);",
		"}",
		"",
		model.classname+".prototype.op = function(b) {",
		"\tif(!this._op[b.type]) {",
		"\t\tspace.createBinop('op', this.type, b.type);",
		"\t}",
		"\treturn this._op[b.type].call(this, b);",
		"}",
		"",
		model.classname+".prototype.gp = function(b) {",
		"\tif(!this._gp[b.type]) {",
		"\t\tspace.createBinop('gp', this.type, b.type);",
		"\t}",
		"\treturn this._gp[b.type].call(this, b);",
		"}",
		"",
		model.classname+".prototype.sp = function(b) {",
		"\treturn this._sp[b.type].call(this, b);",
		"}",
		"",
		model.classname+".prototype.toArray = function() {",
		"\treturn ["+model.getfields+"];",
		"}",
		"",
		model.classname+".prototype.toString = function() {",
		"\treturn \""+model.name+"(\" + this.toArray().join(\", \") + \")\";",
		"}"
		].join("\n");
	
	var code = [def];
	
	code.push(this.generateUnop("reverse", name));
	code.push(this.generateUnop("involute", name));
	code.push(this.generateUnop("conjugate", name));
	code.push(create);
	
	ty.generated = true;

	return code.join("\n\n");
}

Space.prototype.generateUnop = function(opname, tyname) {
	var ty = this.types[tyname]	
	var coords = basisNames(ty.bases);
	
	var _this = this;
	var ops = [];
	foreach(ty.bases, function(v, i) {
		var blade = _this.products[v][opname];
		ops[i] = ((blade.w>0) ? "" : "-") + "this["+i+"]";
	});
	
	var model = {
		classname: classname(tyname),
		opname: opname,
		ops: ops.join(", ")
	};
	return [
		model.classname+".prototype."+model.opname+" = function() {",
		"\treturn new "+model.classname+"("+model.ops+");",
		"};"
	].join("\n");
}

Space.prototype.binopResultType = function(opname, tyname1, tyname2) {
	var ty1 = this.types[tyname1]	
	var coords1 = basisNames(ty1.bases);
	var ty2 = this.types[tyname2]	
	var coords2 = basisNames(ty2.bases);
	
	var op = this.productList(ty1.bases, ty2.bases, opname);
	var tynameRes
	if(op.blades.length == 0) {
		tynameRes = "s";
	}
	else {
	 	tynameRes = this.createType(op.blades, tyname1+tyname2+"_"+opname, false);
	}
	return tynameRes;
}

Space.prototype.generateBinop = function(opname, tyname1, tyname2) {
	var ty1 = this.types[tyname1]	
	var coords1 = basisNames(ty1.bases);
	var ty2 = this.types[tyname2]	
	var coords2 = basisNames(ty2.bases);
	
	var op = this.productList(ty1.bases, ty2.bases, opname);
	var tynameRes
	if(op.blades.length == 0) {
		tynameRes = "s";
	}
	else {
	 	tynameRes = this.createType(op.blades, tyname1+tyname2+"_"+opname, false);
	}
	
	var tyRes = this.types[tynameRes];
	if(!tyRes) {
		console.log("ERROR: gentype " + tyname1+tyname2+"_"+opname, op.blades);
	}
	
	var ops = [];
	if(op.blades.length == 0) {
		ops[0] = "0";
	}
	else {
		for(var i=0; i < op.blades.length; ++i) {
			var blade = op.blades[i];
			var inst = op.inst[blade];
			var instbops = [];
			for(var j=0; j < inst.length; ++j) {
				var instop = inst[j];
				var bop = "this["+instop.a+"]*b["+instop.b+"]";
				if(instop.r.w < 0) bop = "-"+bop;
				instbops.push(bop);
			}
			ops.push(instbops.join(" + "));
		}
	}

	var model = {
		classname1: classname(tyname1),
		tyname2: tyname2,
		opname: opname,
		tynameRes: tynameRes,
		ops: ops.join(",\n")
	};
	return [
		model.classname1+".prototype._"+model.opname+"."+model.tyname2+" = function(b) {",
		"\treturn "+model.tynameRes+"("+model.ops+");",
		"};"
	].join("\n");
}

Space.prototype.createBinop = function(opname, tyname1, tyname2) {
	var resultType = this.binopResultType(opname, tyname1, tyname2);
	var code = this.generateBinop(opname, tyname1, tyname2);
	var f = new Function(classname(tyname1), resultType, code);
	f(this.api.classes[tyname1], this.api.constructors[resultType]);
}

Space.prototype.generateRegisteredTypes = function() {
	var code = {};
	for(var name in this.types) {
		var ty = this.types[name];
		if(!ty.generated) {
			code[name] = this.generateType(name);
		}
	}
	return code;
}

Space.prototype.generateBinops = function(binops) {
	var _this = this;
	var code = [];
	foreach(binops, function(v, i) {
		code[i] = _this.generateBinop(v.op, v.types[0], v.types[1]);
	});
	return code;
}

Space.prototype.createTypes = function(types) {
	for(var i=0; i < types.length; ++i) {
		var ty = types[i];
		this.createType(basisBits(ty.bases), ty.name, true);
	}
}


return {
	create: function(props) {
		return new Space(props);
	}
};	
}();
