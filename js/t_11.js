var root = this;
(function() {
	var canvas = document.getElementById('canvas');
	canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
	var ctx = canvas.getContext('2d');
	var p = 0;

	function inverse(rad, from, to) {
		var newval = from * Math.PI / 2 - rad;
		var offset = (to - 1) * Math.PI / 2;
		return offset + newval;
	}
	;

	var Body = function(m) {
		this.m = m;
		this.x = 300;
		this.y = 300;
		this.direction = 10 * Math.PI / 180;
		this.dx = 0;
		this.dy = 0;
		this.en = 20;
		this.maxX = 1300 - this.m;
		this.minX = this.m;
		this.maxY = 600 - this.m;
		this.minY = this.m;
		this.s = false;
	};

	var Ph = function() {
		this.a = [];
	};

	Body.prototype.clone = function() {
		var n = new Body(this.m);
		n.x = this.x + 40;
		n.y = this.y;
		var key = Math.floor(2 * this.direction / Math.PI);
		n.direction = this.direction + Math.PI;
		n.dx = -1 * this.dx;
		n.dy = -1 * this.dy;
		n.en = this.en;
		n.name = this.name + "_clone";
		n.comp = this.comp;
		return n;
	};

	Body.prototype.comp = function(body, dt) {
		var xdis = body.x - this.x;
		var ydis = body.y - this.y;
		var distance = Math.sqrt(Math.pow(xdis, 2) + Math.pow(ydis, 2));
		var bx = this.en * Math.cos(this.direction);
		var by = this.en * Math.sin(this.direction);
		var rx = bx - dt * xdis * body.m / (Math.pow(distance, 2.5));
		var ry = by - dt * ydis * body.m / (Math.pow(distance, 2.5));
		this.en = Math.sqrt(Math.pow(rx, 2) + Math.pow(ry, 2));
		this.direction = Math.atan2(ry, rx);
	};

	Ph.prototype.add = function(b) {
		this.a.push(b);
	};

	Ph.prototype.create = function(m, comp) {
		var n = new Body(m);
		n.x = Math.random() * canvas.width;
		n.y = Math.random() * canvas.height;
		n.direction = Math.random() * Math.PI;
		n.comp = comp;
		this.a.push(n);
		return n;
	};

	Ph.prototype.sex = function(i) {
		var n = this.a[i].clone();
		this.a.push(n);
		console.log("sex " + JSON.stringify(n));
		console.log(this.a.length);
		return n;
	};

	Ph.prototype.step = root.step = function(t) {
		for (var i = 0; i < this.a.length; i++) {
			if (this.a[i].s) {
				var rrr = Math.atan2(this.a[i].dy, this.a[i].dx);
				this.a[i].direction = rrr;
				var h = (Math.pow(this.a[i].dy, 2) + Math.pow(this.a[i].dx, 2)) / (this.a[i].en * t);
				this.a[i].en += h + ((this.a[i].en > 0.5) ? -0.2 : Math.abs(this.a[i].en));
			} else if (t > 0) {
				for (var j = i + 1; j < this.a.length; j++) {
					if (this.a[j].s === false)
						this.a[j].comp(this.a[i], t);
				}
				if (this.a[i].en > 1) {
					this.a[i].en -= t * this.a[i].en / Math.pow(this.a[i].m, 2);
					this.a[i].dx += t * this.a[i].en * Math.cos(this.a[i].direction) / this.a[i].m;
					this.a[i].dy += t * this.a[i].en * Math.sin(this.a[i].direction) / this.a[i].m;
				}
			}
			this.a[i].x += this.a[i].dx;
			this.a[i].y += this.a[i].dy;
			this.a[i].dx = 0;
			this.a[i].dy = 0;

			if (this.a[i].x > this.a[i].maxX) {
				this.a[i].x = this.a[i].maxX;
				this.a[i].en += 10;
				switch (Math.floor(Math.sin(this.a[i].direction))) {
					case -1:
						this.a[i].direction = inverse(this.a[i].direction, 1, 2);
						break;
					case 0:
						this.a[i].direction = inverse(this.a[i].direction, 4, 3);
						break
				}
			}
			if (this.a[i].x < this.a[i].minX) {
				this.a[i].x = this.a[i].minX;
				this.a[i].en += 10;
				switch (Math.floor(Math.sin(this.a[i].direction))) {
					case -1:
						this.a[i].direction = inverse(this.a[i].direction, 2, 1);
						break;
					case 0:
						this.a[i].direction = inverse(this.a[i].direction, 3, 4);
						break
				}
			}

			if (this.a[i].y > this.a[i].maxY) {
				this.a[i].y = this.a[i].maxY;
				this.a[i].en += 10;
				switch (Math.floor(Math.cos(this.a[i].direction))) {
					case -1:
						this.a[i].direction = inverse(this.a[i].direction, 1, 4);
						break;
					case 0:
						this.a[i].direction = inverse(this.a[i].direction, 2, 3);
						break;
				}
			}
			if (this.a[i].y < this.a[i].minY) {
				this.a[i].y = this.a[i].minY;
				this.a[i].en += 10;
				switch (Math.floor(Math.cos(this.a[i].direction))) {
					case -1:
						this.a[i].direction = inverse(this.a[i].direction, 3, 2);
						break
					case 0:
						this.a[i].direction = inverse(this.a[i].direction, 4, 1);
						break
				}
			}
		}
	};

	var b = root.b = new Body(35);
	var p = root.p = new Ph();
	b.x = 1050;
	b.y = 100;
	b.direction = 1;
	b.en = 90;
	b.name = "b";
	p.add(b);
	var tah = 0;
	var c = root.c = p.create(35, function(body, dt) {
		this.tah = tah++;
		var xdis = body.x - this.x;
		var ydis = body.y - this.y;
		var distance = Math.sqrt(Math.pow(xdis, 2) + Math.pow(ydis, 2));
		var bx = this.en * Math.cos(this.direction);
		var by = this.en * Math.sin(this.direction);
		var rx = bx - dt * xdis * body.m / (Math.pow(distance, 2.5));
		var ry = by - dt * ydis * body.m / (Math.pow(distance, 2.5));
		this.en = Math.sqrt(Math.pow(rx, 2) + Math.pow(ry, 2));
		this.direction = Math.atan2(ry, rx);
	});
	c.x = 100;
	c.y = 300;
	c.en = 10;
	c.name = "c";
	var o = root.o = p.create(35, function(body, dt) {
		var xdis = this.x - body.x;
		var ydis = this.y - body.y;
		var distance = Math.sqrt(Math.pow(xdis, 2) + Math.pow(ydis, 2));
		var bx = this.en * Math.cos(this.direction);
		var by = this.en * Math.sin(this.direction);
		var rx = bx - dt * xdis * body.m / (Math.pow(distance, 3));
		var ry = by - dt * ydis * body.m / (Math.pow(distance, 3));
		this.en = Math.sqrt(Math.pow(rx, 2) + Math.pow(ry, 2));
		this.direction = Math.atan2(ry, rx);
	});
	o.name = "o";
	o.en = 10;

	var s = root.s = p.create(35, function(body, dt) {
		var xdis = this.x - body.x;
		var ydis = this.y - body.y;
		var distance = Math.sqrt(Math.pow(xdis, 2) + Math.pow(ydis, 2));
		var alpha = Math.atan2(ydis, xdis);
		var new_en = Math.sin(this.direction) * this.en/Math.sin(alpha);
		var bx = this.en * Math.cos(this.direction);
		var by = this.en * Math.sin(this.direction);
		var rx = bx - dt * xdis * body.m / (Math.pow(distance, 3));
		var ry = by - dt * ydis * body.m / (Math.pow(distance, 3));
		this.en = Math.sqrt(Math.pow(rx, 2) + Math.pow(ry, 2));
		this.direction = Math.atan2(ry, rx);
	});
	s.name = "s";
	s.en = 10;
//	for (var i = 0; i < 50; i++) {
//		var ttt = new Body(35);
//		ttt.name = "i " + i;
//		ttt.x = i + 30;
//		p.a.push(ttt);
//	}
	console.log(JSON.stringify(p.a));

	var petlya = function(x, y, r, dir, u, color, name) {
		var x1 = r * Math.cos(u * Math.PI / 180);
		var y1 = r * Math.sin((360 - u) * Math.PI / 180);
		var x2 = x1;
		var y2 = r * Math.sin(u * Math.PI / 180);
		var r2 = r * Math.sqrt(1 + Math.pow(1 / Math.tan((90 - u) * Math.PI / 180), 2));
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(1, 1);
		ctx.rotate(dir + Math.PI);
		ctx.beginPath();
		ctx.fillStyle = "white";
		ctx.arc(0, 0, r,
			(u - 1) * Math.PI / 180,
			(361 - u) * Math.PI / 180,
			false);
		ctx.lineTo(x1, y1);
		ctx.lineTo(r2, 0);
		ctx.lineTo(x2, y2);
		ctx.strokeStyle = color;
		ctx.lineWidth = 5;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.stroke();
		ctx.restore();
		ctx.font = 'italic 20pt Calibri';
		ctx.fillStyle = 'green';
		ctx.fillText(name, x, y);
	};
	var st = 0;
	var render = root.render = function() {
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		for (var i = 0; i < p.a.length; i++) {
			petlya(p.a[i].x, p.a[i].y, p.a[i].m, p.a[i].direction, p.a[i].en, (p.a[i].s) ? "red" : "blue", p.a[i].name);
		}
		ctx.font = 'italic 20pt Calibri';
		ctx.fillStyle = 'white';
		ctx.fillText(' x = ' + c.x, 150, 130);
		ctx.fillText(' y = ' + c.y, 150, 110);
		ctx.fillText(' e = ' + c.en, 150, 150);
		ctx.fillText(' d = ' + c.direction, 150, 170);
		ctx.fillText(' c = ' + p.a.length, 150, 190)
	};

	var selected = root.selected = [];
	canvas.addEventListener("touchstart", function(e) {
		var ts = e.changedTouches;
		for (var i = 0; i < ts.length; i++) {
			var min = 50;
			var jmin = 0;
			for (var j = 0; j < p.a.length; j++) {
				var d = Math.sqrt(Math.pow(ts[i].pageX - p.a[j].x, 2) + Math.pow(ts[i].pageY - p.a[j].y, 2));
				if (d < min) {
					min = d;
					jmin = j;
				}
			}
			if (min > 0) {
				p.a[jmin].s = true;
				p.a[jmin].dx = 0;
				p.a[jmin].dy = 0;
				p.a[jmin].x = ts[i].pageX;
				p.a[jmin].y = ts[i].pageY;
				selected.push({tsID: ts[i].identifier, bodyID: jmin});
			}
		}
	});

	canvas.addEventListener("touchmove", function(e) {
		var ts = e.changedTouches;
		for (var i = 0; i < ts.length; i++) {
			for (var j = 0; j < selected.length; j++) {
				if (selected[j].tsID === ts[i].identifier) {
					var obj = p.a[selected[j].bodyID];
					obj.dx = ts[i].pageX - obj.x;
					obj.dy = ts[i].pageY - obj.y;
				}
			}
		}
	});

	canvas.addEventListener("touchend", function(e) {
		var ts = e.changedTouches;
		for (var i = 0; i < ts.length; i++) {
			for (var j = 0; j < selected.length; j++) {
				if (selected[j].tsID === ts[i].identifier) {
					p.a[selected[j].bodyID].s = false;
					p.a[selected[j].bodyID].dx = 0;
					p.a[selected[j].bodyID].dy = 0;
					selected.splice(j, 1);
				}
			}
		}
	});

	window.requestAnimFrame = (function() {
		return  window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			function(callback) {
				window.setTimeout(callback, 1000 / 60);
			};
	})();

	var lt = +new Date;
	(function animloop() {
		requestAnimFrame(animloop);
		var now = +new Date,
			dt = now - lt;
		p.step(dt);
		st += dt / 1000;
		//if (Math.floor(st) > p.a.length)
		//	p.create();
		lt = now;
		render();
	})();
}).call(this);