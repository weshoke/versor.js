/*
	CAST (use basis)
	.sp product
*/
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

var type = function(key, bases, name) {
	return { key:key, bases:bases, name:name, generated:false, dual:false };
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

var compress = function(x) {
	var tally = {};
	
	// collect like terms
	for(var i=0; i < x.length; ++i) {
		var iv = x[i];
		if(tally[iv.id]) {
			tally[iv.id].w += iv.w;
		}
		else {
			tally[iv.id] = blade(iv.id, iv.w);
		}
	}
	
	var res = [];
	for(var id in tally) {
		var iv = tally[id];
		if(iv.w != 0) {
			res.push(iv);
		}
	}
	return res;
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
	if(props.conformal) {
		this.values = this.buildConformalValues();
		this.products = this.buildConformal();
	}
	else {
		this.products = this.buildEuclidean();
	}
	this.subspaces = this.buildSubspaces();
	this.registerSubspaces();
	this.createTypes(props.types);	
	
	this.api = this.generate(props);
	for(var name in this.api.constructors) {
		this[name] = this.api.constructors[name];
	}
	this.initialized = true;
}

Space.prototype.generate = function(props) {
	var binopCode = this.generateBinops(props.binops);
	var typeCode = this.generateRegisteredTypes();
	var typeCodeAliases = {};
	for(var name in typeCode) {
		var ty = this.types[name];
		if(ty.alias && name == ty.alias) {
			typeCodeAliases[name] = typeCode[name];
		}
	}
	var functionBody = ["var api = { classes:{}, constructors:{} };"];
	for(var name in typeCode) {
		if(!typeCodeAliases[name]) {
			var code = typeCode[name];
			functionBody.push([
					code,
					"api.constructors."+name+" = "+name+";",
					"api.classes."+name+" = "+classname(name)+";"
				].join("\n")
			);
			if(this.types[name].alias) {
				var aliasName = this.types[name].alias;
				var aliasCode = typeCodeAliases[aliasName];
				functionBody.push([
						aliasCode,
						"api.constructors."+aliasName+" = "+aliasName+";",
						"api.classes."+aliasName+" = "+classname(aliasName)+";"
					].join("\n")
				);
			}
		}
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
		types[name] = type(key, [b], name);
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

// Check For presence of Minkowskian Basis
Space.prototype.checkMink = function(x) {
	var v = x & this.values.eplane;
	if((v == 0) || (v == this.values.eplane)) {
		return false;
	}
	else {
		return true
	}
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

// Push into e+.e- Minkowskian diagonal metric from a null basis (for calculating metric products)
Space.prototype.pushMink = function(x) {
	if((x&this.values.no)==this.values.no) {
		var t = x^this.values.no;
		return [
			blade(t^this.values.ep, 0.5),
			blade(t^this.values.em, 0.5)
		];
	}
	else if((x&this.values.ni)==this.values.ni) {
		var t = x^this.values.ni;
		return [
			blade(t^this.values.ep, -1),
			blade(t^this.values.em, 1)
		];
	}
}

// Pop back into degenerate null basis from nondegenerate Minkowskian (after xor-ing)
Space.prototype.popMink = function(x) {
	if((x&this.values.ep)==this.values.ep) {
		var t = x^this.values.ep;
		return [
			blade(t^this.values.no, 1),
			blade(t^this.values.ni, -0.5)
		];
	}
	else if((x&this.values.em)==this.values.em) {
		var t = x^this.values.em;
		return [
			blade(t^this.values.no, 1),
			blade(t^this.values.ni, 0.5)
		];
	}
}

Space.prototype.accumMink = function(blades) {
	var res = [];
	for(var i=0; i < blades.length; ++i) {
		var iv = blades[i];
		if(this.checkMink(iv.id)) {
			var minkBlades = this.popMink(iv.id);
			for(var j=0; j < minkBlades.length; ++j) {
				var jv = minkBlades[j];
				jv.w *= iv.w;
			}
			res = res.concat(minkBlades);
		}
		else {
			res.push(iv);
		}
	}
	return res;
}

Space.prototype.buildConformalBinop = function(S, iv, jv) {
	// get list of blades in minkowskian (diagonal) metric
	var tmpA = this.checkMink(iv) ? this.pushMink(iv) : [blade(iv, 1)];
	var tmpB = this.checkMink(jv) ? this.pushMink(jv) : [blade(jv, 1)];
	
	var gpTally = [];
	var opTally = [];
	var ipTally = [];
	for(var a=0; a < tmpA.length; ++a) {
		var av = tmpA[a];
		for(var b=0; b < tmpB.length; ++b) {
			var bv = tmpB[b];
			// calculate products in mink metric
			var gp = this.metricProduct(av.id, bv.id);
			var op = outer(av.id, bv.id);
			var ip = this.metricInner(av.id, bv.id);
			
			// push onto tally stack
			gpTally.push(blade(gp.id, gp.w*av.w*bv.w));
			opTally.push(blade(op.id, op.w*av.w*bv.w));
			ipTally.push(blade(ip.id, ip.w*av.w*bv.w));
		}
	}
		
	var gpPop = this.accumMink(compress(gpTally));
	var opPop = this.accumMink(compress(opTally));
	var ipPop = this.accumMink(compress(ipTally));
	
	S[iv].gp[jv] = compress(gpPop);
	S[iv].op[jv] = compress(opPop);
	S[iv].ip[jv] = compress(ipPop);
}

Space.prototype.buildConformalValues = function() {
	var no = 1<<(this.metric.length-2);
	var ni = 1<<(this.metric.length-1);
	return {
		no: no,
		ni: ni,
		ep: no,
		em: ni,
		eplane: no|ni
	}
}

Space.prototype.buildConformal = function() {
	var S = this.bladeTable();
	for(var i=0; i < this.basis.length; ++i) {
		var ib = this.basis[i];
		S[ib].involute = involute(ib)
		S[ib].reverse = reverse(ib)
		S[ib].conjugate = conjugate(ib)
		
		for(var j=0; j < this.basis.length; ++j) {
			var jb = this.basis[j];
			this.buildConformalBinop(S, ib, jb)
		}
	}
	return S
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
		this.types[iv.name] = type(this.basesKey(iv.bases), iv.bases, iv.name);
	}
}

Space.prototype.aliasType = function(oty, nty) {
	this.types[nty] = this.types[oty];
	this.types[oty].alias = nty;
	//this.types[oty].alias = nty
	/*delete this.types[oty];
	
	// rename subspace if necessary
	for(var i=0; i < this.subspaces.length; ++i) {
		var subs = this.subspaces[i];
		if(subs.name == oty) {
			subs.name = nty
			break;
		}
	}
	*/
}

Space.prototype.createType = function(bases, name, aliasExisting) {
	var key = this.basesKey(bases);
	for(var tyname in this.types) {
		var ty = this.types[tyname];
		if(keyCheck(key, ty.key)) { 
			if(aliasExisting) {
				this.aliasType(tyname, name)
				return name;
			}
			else {
				return tyname;
			}
		}
	}

	this.types[name] = type(key, bases, name);
	return name;
}

Space.prototype.productList = function(bases1, bases2, opname) {
	var tally = [];
	
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

	var combined = {};
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
		"\tif(typeof "+coords[0]+" == \"object\") {",
		"\t\tthis.cast("+coords[0]+");",
		"\t}",
		"\telse {",
		model.setfields.join("\n"),
		"\t}",
		"};",
		"",
		model.classname+".prototype._cast = {};",
		model.classname+".prototype._ip = {};",
		model.classname+".prototype._op = {};",
		model.classname+".prototype._gp = {};",
		"",
		model.classname+".prototype.inverse = function() {",
		"\tvar rev = this.reverse();",
		"\tvar sca = this.gp(rev)[0];",
		"\treturn rev.gp(1/sca);",
		"}",
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
		"\tif(typeof b == \"number\") {",
		"\t\tb = space.s(b);",
		"\t}",
		"\tif(!this._gp[b.type]) {",
		"\t\tspace.createBinop('gp', this.type, b.type);",
		"\t}",
		"\treturn this._gp[b.type].call(this, b);",
		"}",
		"",
		model.classname+".prototype.sp = function(b) {",
		"\tvar v = this.inverse().gp(b).gp(this);",
		"\treturn "+"new b.__proto__.constructor(v);",
		"}",
		"",
		model.classname+".prototype.div = function(b) {",
		"\treturn this.gp(b.inverse());",
		"}",
		"",
		model.classname+".prototype.toArray = function() {",
		"\treturn ["+model.getfields+"];",
		"}",
		"",
		model.classname+".prototype.toString = function() {",
		"\treturn \""+model.name+"(\" + this.toArray().join(\", \") + \")\";",
		"}",
		model.classname+".prototype.cast = function(b) {",
		"\tif(!this._cast[b.type]) {",
		"\t\tspace.createCast(this.type, b.type);",
		"\t}",
		"\treturn this._cast[b.type].call(this, b);",
		"}",
		"",
		].join("\n");
	
	var code = [def];
	
	code.push(this.generateUnop("reverse", name));
	code.push(this.generateUnop("involute", name));
	code.push(this.generateUnop("conjugate", name));
	code.push(create);
	
	ty.generated = true;

	return code.join("\n\n");
}

Space.prototype.createCast = function(toName, fromName) {
	var toTy = this.types[toName]	
	var fromTy = this.types[fromName]	

	var fromCoordMap = {}
	foreach(fromTy.bases, function(v, i) {
		fromCoordMap[v] = i;
	});

	var ops = [];
	foreach(toTy.bases, function(v, i) {
		var src;
		if(typeof fromCoordMap[v] == "number") src = "b["+fromCoordMap[v]+"]";
		else src = "0"
		ops[i] = "this["+i+"] = "+src+";"
	});
	
	var model = {
		classname: classname(toName),
		fromTy:fromName,
		ops: ops.join("\n")
	};
	
	
	var code = [
		model.classname+".prototype._cast."+model.fromTy+" = function(b) {",
		model.ops,
		"};"
	].join("\n");
	
	var f = new Function(classname(toName), code);
	f(this.api.classes[toName]);
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

Space.prototype.sandwichOp = function(tyname1, tyname2) {
	var ty1 = this.types[tyname1];	
	var ty2 = this.types[tyname2];
}

Space.prototype.binopResultType = function(opname, tyname1, tyname2) {
	var ty1 = this.types[tyname1]	
	var ty2 = this.types[tyname2]	
	
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
	var ty2 = this.types[tyname2]	
	
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
	else if(this.initialized && !tyRes.generated) {
		// TODO: consolidate this with the generate() function
		var code = this.generateType(tynameRes);
		var functionBody = ["var api = { classes:{}, constructors:{} };"];
		functionBody.push([
				code,
				"api.constructors."+tynameRes+" = "+tynameRes+";",
				"api.classes."+tynameRes+" = "+classname(tynameRes)+";"
			].join("\n")
		);
		
		functionBody.push("return api;");
		var f = new Function("space", functionBody.join("\n\n"));
		var api = f(this);
		for(var name in api.classes) {
			this.api.classes[name] = api.classes[name];
		}
		for(var name in api.constructors) {
			this.api.constructors[name] = api.constructors[name];
		}
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
		else {
			code[name] = [
				"var "+classname(name)+" = "+classname(ty.name)+";",
				"var "+name+" = "+ty.name+";"
			].join("\n");
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
		var name = this.createType(basisBits(ty.bases), ty.name, true);
		if(ty.dual != undefined) {
			this.types[name].dual = ty.dual;
		}
	}
}

Space.prototype.ip = function(a, b) {
	return a.ip(b);
}

Space.prototype.op = function(a, b) {
	return a.op(b);
}

Space.prototype.gp = function(a, b) {
	if(typeof a == "number") {
		a = this.s(a);
	}
	return a.gp(b);
}

Space.prototype.sp = function(a, b) {
	return a.sp(b);
}


/*
var C3 = new Space({
	metric:[1, 1, 1, 1, -1],
	types: [
		{ name:"Vec3", bases:["e1", "e2", "e3"] },
		{ name:"Biv3", bases:["e12", "e13", "e23"] },
		{ name:"Rot", bases:["s", "e12", "e13", "e23"] },
		{ name:"Pnt", bases:["e1", "e2", "e3", "e4", "e5"] },
		{ name:"Dlp", bases:["e1", "e2", "e3", "e5"] },
		{ name:"Pln", bases:["e1235", "e1245", "e1345", "e2345"] },
		{ name:"Sph", bases:["e1235", "e1234", "e1245", "e1345", "e2345"] },
		{ name:"Dln", bases:["e12", "e13", "e23", "e15", "e25", "e35"] },
		{ name:"Lin", bases:["e145", "e245", "e345", "e125", "e135", "e235"] },
		{ name:"Flp", bases:["e15", "e25", "e35", "e45"] },
		{ name:"Par", bases:["e12", "e13", "e23", "e14", "e24", "e34", "e15", "e25", "e35", "e45"] },
		{ name:"Cir", bases:["e123", "e145", "e245", "e345", "e124", "e134", "e234", "e125", "e135", "e235"] },
		{ name:"Bst", bases:["s", "e12", "e13", "e23", "e14", "e24", "e34", "e15", "e25", "e35", "e45"] },
		{ name:"Dil", bases:["s", "e45"] },
		{ name:"Mot", bases:["s", "e12", "e13", "e23", "e15", "e25", "e35", "e1235"] },
		{ name:"Trs", bases:["s", "e14", "e24", "e34"] },
		{ name:"Drv", bases:["e15", "e25", "e35"] },
		{ name:"Drb", bases:["e125", "e135", "e235"] },
		{ name:"Tri3", bases:["e123"] },
	],
	conformal:true
});

function nullPnt(a, b, c) {
	return C3.Pnt(a, b, c, 1, (a*a+b*b+c*c)*0.5);
}
var p1 = nullPnt(1, 0, 0);
console.log(p1.toString());
console.log(C3.Vec3(p1).toString());
*/
return {
	create: function(props) {
		return new Space(props);
	}
};	
}();

