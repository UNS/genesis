(function() {
	var canvas = document.getElementById('canvas');
	canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
	var ctx = canvas.getContext('2d');
	var draw = function(p1, p2, p3, p4) {
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.translate(10, 100);
		ctx.beginPath();
		ctx.moveTo(p1.x, p1.y);
		ctx.lineTo(p2.x, p2.y);
		ctx.lineTo(p3.x, p3.y);
		ctx.closePath();
		ctx.fillStyle = 'gray';
		ctx.fill();
		ctx.strokeStyle = 'white';
		ctx.stroke();
		ctx.restore();
		ctx.lineTo(p2.x, p2.y);
		ctx.lineTo(p4.x, p4.y);
		ctx.stroke();
		ctx.font = 'italic 20pt Calibri';
		ctx.fillStyle = 'white';
		ctx.fillText("A", p1.x, p1.y - 20);
		ctx.fillText("B", p2.x, p2.y + 40);
		ctx.fillText("C", p3.x, p3.y - 20);
		ctx.fillText("D", p4.x, p4.y - 20);

		var AD = new Vector(p1, p4);
		var DC = new Vector(p4, p3);
		var BD = new Vector(p2, p4);
		var AB = new Vector(p1, p2);
		var BC = new Vector(p2, p3);
		var AC = new Vector(p1, p3);
		var alpha = Math.atan2(BD.dis(), AD.dis());
		var gama = Math.atan2(BD.dis(), DC.dis());
		var beta = Math.PI - alpha - gama;

		var BC_1 = Math.sqrt(
			Math.pow(AB.dis(), 2) +
			Math.pow(AD.dis() + DC.dis(), 2)
			- 2 * AB.dis() * (AD.dis() +
			DC.dis()) * Math.cos(alpha)
			);

		var BC_2 = AC.dis() * Math.sin(alpha) / Math.sin(beta);

		ctx.fillText("AD = " + AD.dis(), 500, 0);
		ctx.fillText("DC = " + DC.dis(), 500, 30);
		ctx.fillText("DB = " + BD.dis(), 500, 60);
		ctx.fillText("AB = " + AB.dis(), 500, 90);
		ctx.fillText("BC = " + BC.dis(), 500, 120);
		ctx.fillText("alpha = " + 180 * alpha / Math.PI, 500, 150);
		ctx.fillText("beta = " + 180 * beta / Math.PI, 500, 180);
		ctx.fillText("gama = " + 180 * gama / Math.PI, 500, 210);
		ctx.fillText("BC 1 = " + BC_1, 200, 240);
		ctx.fillText("BC 2 = " + BC_2, 200, 270);
	};

	var ops = [
		{name: "asin", bind: Math.asin, ret: "rad", args: [{from: -1, to: 1}]},
		{name: "acos", bind: Math.acos, ret: "rad", args: [{from: -1, to: 1}]},
		{name: "atan", bind: Math.atan, ret: "rad", args: [{from: -1, to: 1}]},
		{name: "atan2", bind: Math.atan2, ret: "rad", args: [{from: -1, to: 1}, {from: -1, to: 1}]},
		{name: "sum", bind: function(a1, a2) {
				return a1 + a2;
			}, ordered: false, args: [{}, {}]},
		{name: "minus", bind: function(a1, a2) {
				return a1 - a2;
			}, ordered: true, args: [{}, {}]},
		{name: "divide", bind: function(a1, a2) {
				return a1 / a2;
			}, ordered: true, args: [{}, {}]},
		{name: "mult", bind: function(a1, a2) {
				return a1 * a2;
			}, ordered: false, args: [{}, {}]}
	];


	var Fun = function(op, values) {
		this.op = op;
		this.values = values;
	};

	Fun.prototype.inv = function() {
		var t = [];
		for (var i = 0; i < this.values.length; i++) {
			switch (this.values[i].type) {
				case "var":
					t[i] = arguments[this.values[i].argNum];
					break;
				case "const":
					t[i] = this.values[i].value;
					break;
				case "fun":
					t[i] = this.values[i].ref.inv(arguments);
			}
		}
		return this.op.bind.apply(this, t);
	};

	var i = 10;
	var fun = new Fun(ops[5], [{type: "fun", ref: new Fun(ops[4], [{type: "const", value: 3}, {type: "const", value: 2}])}, {type: "var", argNum: 0}]);
	console.log("--------| " + fun.inv(i));

//not pattern
	var FunFactory = function(op, value) {
		this.ops = op;
		this.value = value;
	};


	FunFactory.prototype.forEach = function(callback, thisArg) {
		for (var k = 0; k < this.ops.length; k++) {
			switch (this.ops[k].args.length) {
				case 0:
					callback.call(
						thisArg,
						new Fun(this.ops[k], [])
						);
				case 1:
					for (var i = 0; i < this.value.length; i++) {
						switch (this.value[i].type) {
							case "fun" :
								this.value[i].ref.forEach(function(result) {
									var fun = new Fun(this.ops[k], [{
											type: "fun",
											ref: result
										}]);
									callback.call(
										thisArg,
										fun
										);
								}, this
									);
								break;
							case "const" :
								var fun = new Fun(this.ops[k], [{
										type: "const",
										value: this.value[i].value
									}]);
								callback.call(
									thisArg,
									fun
									);
								break;
							case "var" :
								var fun = new Fun(this.ops[k], [{
										type: "var",
										argNum: 0
									}]);
								callback.call(
									thisArg,
									fun
									);
						}
					}
					break;
				case 2:
					if (this.ops[k].ordered) {
						for (var i = 0; i < this.value.length; i++) {
							for (var j = 0; j < this.value.length; j++) {
								if (i !== j) {
									var v1 = this.value[i];
									var v2 = this.value[j];
									if (v1.type === "fun" && v2.type === "fun") {
										v1.ref.forEach(function(result1) {
											v2.ref.forEach(function(result2) {
												var fun = new Fun(this.ops[k], [{
														type: "fun",
														ref: result1
													}, {
														type: "fun",
														ref: result2
													}]);
												callback.call(
													thisArg,
													fun
													);
											}, this);
										}, this);
									} else if (v1.type === "fun") {
										v1.ref.forEach(function(result) {
											var fun = new Fun(this.ops[k], [{
													type: "fun",
													ref: result
												}, v2]);
											callback.call(
												thisArg,
												fun
												);
										}, this);
									} else if (v2.type === "fun") {
										v2.ref.forEach(function(result) {
											var fun = new Fun(this.ops[k], [v1, {
													type: "fun",
													ref: result
												}]);
											callback.call(
												thisArg,
												fun
												);
										}, this);
									} else {
										var fun = new Fun(this.ops[k], [v1, v2]);
										callback.call(
											thisArg,
											fun
											);
									}
								}
							}
						}
					} else {
						for (var i = 0; i < this.value.length; i++) {
							for (var j = i + 1; j < this.value.length; j++) {
								var v1 = this.value[i];
								var v2 = this.value[j];
								if (v1.type === "fun" && v2.type === "fun") {
									v1.ref.forEach(function(result1) {
										v2.ref.forEach(function(result2) {
											var fun = new Fun(this.ops[k], [{
													type: "fun",
													ref: result1
												}, {
													type: "fun",
													ref: result2
												}]);
											callback.call(
												thisArg,
												fun
												);
										}, this);
									}, this);
								} else if (v1.type === "fun") {
									v1.ref.forEach(function(result) {
										var fun = new Fun(this.ops[k], [{
												type: "fun",
												ref: result
											}, v2]);
										callback.call(
											thisArg,
											fun
											);
									}, this);
								} else if (v2.type === "fun") {
									v2.ref.forEach(function(result) {
										var fun = new Fun(this.ops[k], [v1, {
												type: "fun",
												ref: result
											}]);
										callback.call(
											thisArg,
											fun
											);
									}, this);
								} else {
									var fun = new Fun(this.ops[k], [v1, v2]);
									callback.call(
										thisArg,
										fun
										);
								}
							}
						}
					}
			}
		}
	};

		this.i = 5;
		var r = new FunFactory([ops[0], ops[1], ops[2]], [{type: "const", value: 0.13}, {type: "const", value: 0.2}, {type: "var", argNum: 0}]);
		var p = new FunFactory([ops[4], ops[5]], [{type: "const", value: 3}, {type: "fun", ref: r}]);
		var f = new FunFactory([ops[0], ops[1], ops[2], ops[3]], [{type: "const", value: 0.3}, {type: "fun", ref: p}]);
		console.log(JSON.stringify(f));
		f.forEach(function(gf) {
			console.log(JSON.stringify(gf));
			console.log(gf.inv(0.3));
		}, this);
	//for (var i = 0; i < ops.length; i++)
	//	go(i, [1, 2, 3]);

	var Point = function(x, y) {
		this.x = x;
		this.y = y;
	};

	var Vector = function(p1, p2) {
		this.p1 = p1;
		this.p2 = p2;
	};

	Vector.prototype.dis = function() {
		return Math.sqrt(Math.pow(this.p1.x - this.p2.x, 2) + Math.pow(this.p1.y - this.p2.y, 2));
	};

	var p1 = new Point(0, 0);
	var p2 = new Point(100, 200);
	var p3 = new Point(450, 0);
	var p4 = new Point(100, 0);

	draw(p1, p2, p3, p4);

	var render = function() {
		if (t >= 90)
			dt = -0.1;
		if (t < 0)
			dt = 0.1;
		t += dt;

		petlya(1000, 200, 50, 20, 0 + t);
	};

	window.requestAnimFrame = (function() {
		return  window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			function(callback) {
				window.setTimeout(callback, 1000 / 60);
			};
	})();

//	(function animloop() {
//		requestAnimFrame(animloop);
//		render();
//	})();
}).call(this);

