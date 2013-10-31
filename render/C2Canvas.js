var C2Canvas = function(canvas) {
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.strokeStyle = "black";
  var bounds = {
    x: [-4, 4],
    y: [-4, 4]
  };

  function mapx(x) {
    return canvas.width*(x-bounds.x[0])/(bounds.x[1] - bounds.x[0]);
  };

  function mapy(y) {
    return canvas.height*(y-bounds.y[0])/(bounds.y[1] - bounds.y[0]);
  };

  function scale(r) {
    return canvas.width/(bounds.x[1] - bounds.x[0])*r;
  }
  
  function triangle(x1, y1, x2, y2, x3, y3) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.fill();
  }

  var pointRadius = 2;
  var lineCapSize = 10;

  var dispatch = {
    Vec2: function(el) {
      var x1 = mapx(el[0]);
      var y1 = mapy(el[1]);
      var normalizedEl = C2.unit(el);
      var normal = C2.duale(el);
      var pointOffset = normalizedEl.gp(lineCapSize);
      var offset = normal.gp(lineCapSize);
  	
  	  ctx.beginPath();
      ctx.moveTo(mapx(0), mapy(0));
      ctx.lineTo(x1, y1);
      ctx.stroke();
      
      triangle(
      	x1+offset[0], y1+offset[1],
      	x1+pointOffset[0], y1+pointOffset[1],
      	x1-offset[0], y1-offset[1]
      );
    },
    Vec: function(el) {
      var rsquared = C2.Ro.size(el);

      var x = mapx(el[0])
      var y = mapy(el[1])
      var r = scale(Math.sqrt(Math.abs(rsquared)));
      if (r === 0) r = pointRadius;

      ctx.beginPath();
      if (rsquared > 0) {
        ctx.strokeStyle = "blue";
      } else if (rsquared < 0) {
        ctx.strokeStyle = "red";
      }
      circle(x,y,r);
      ctx.stroke();
    },
    Biv: function (el) {
      var size = C2.Ro.size(el);

      var points = C2.Ro.split(el);

      var x1 = mapx(points[0][0]);
      var y1 = mapy(points[0][1]);
      var x2 = mapx(points[1][0]);
      var y2 = mapy(points[1][1]);

      ctx.beginPath();
      if (size > 0) {
        ctx.strokeStyle = "blue";
      } else if (size < 0) {
        ctx.strokeStyle = "red";
      }
      //TODO If the size is 0, this is a tangent. How do we want to represent that?
      circle(x1, y1, pointRadius);
      ctx.moveTo(x2, y2 + pointRadius);
      circle(x2, y2, pointRadius);
      ctx.stroke();

      ctx.beginPath();
      // Want to draw this dashed, but dashed lines aren't widely supported yet.
      ctx.strokeStyle = "#888";
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    },
    Tri: function (el) {
      return dispatch['Vec'](C2.dual(el));
    },
    Lin: function (el) {
      // Points traverse bounds clockwise from top left
      var p1 = C2.Ro.point(bounds.x[0], bounds.y[0]);
      var p2 = C2.Ro.point(bounds.x[1], bounds.y[0]);
      var p3 = C2.Ro.point(bounds.x[1], bounds.y[1]);
      var p4 = C2.Ro.point(bounds.x[0], bounds.y[1]);

      var dualEl = C2.dual(el);

      var topIntersection = C2.Ro.point.normalize(dualEl.ip(p1.op(p2).op(C2.Inf)));
      var rightIntersection = C2.Ro.point.normalize(dualEl.ip(p2.op(p3).op(C2.Inf)));
      var bottomIntersection = C2.Ro.point.normalize(dualEl.ip(p3.op(p4).op(C2.Inf)));
      var leftIntersection = C2.Ro.point.normalize(dualEl.ip(p4.op(p1).op(C2.Inf)));

      var displayIntersections = [];
      if (bounds.x[0] <= topIntersection[0] && topIntersection[0] < bounds.x[1]) {
        displayIntersections.push(topIntersection);
      }
      if (bounds.y[0] <= rightIntersection[1] && rightIntersection[1] < bounds.y[1]) {
        displayIntersections.push(rightIntersection);
      }
      if (bounds.x[0] <= bottomIntersection[0] && bottomIntersection[0] < bounds.x[1]) {
        displayIntersections.push(bottomIntersection);
      }
      if (bounds.y[0] <= leftIntersection[1] && leftIntersection[1] < bounds.y[1]) {
        displayIntersections.push(leftIntersection);
      }

      if (displayIntersections.length < 2) return;

      ctx.beginPath();
      ctx.moveTo(mapx(displayIntersections[0][0]), mapy(displayIntersections[0][1]));
      ctx.lineTo(mapx(displayIntersections[1][0]), mapy(displayIntersections[1][1]));
      ctx.stroke();
    },
    Dll: function (el) {
      // could render as a different style
      var del = C2.dual(el);
      dispatch[del.type](del);
    },
    Drv: function(el) {
      var del = C2.Dr.elem(el);
      dispatch[del.type](del);
    }
  };

  var dispatchPriority = [
    'Vec2',
    'Dll',
    'Vec',
    'Biv',
    'Lin',
    'Drv',
    'Tri'
  ];

  var draw = function(els) {
    if (els.length) {
      for (var i = 0; i < els.length; i++) draw(els[i]);
      return;
    }
    ctx.save();

    if (dispatch.hasOwnProperty(els.type)) {
      dispatch[els.type](els);
    } else {
      for (var j = 0; j < dispatchPriority.length; j++) {
        var type = dispatchPriority[j];
        if (C2.isSubType(type, els.type)) {
          dispatch[type](C2[type](els));
          break;
        }
      }
    }
    
    ctx.restore();
  };

  draw.bounds = function(value) {
    if (!arguments.length) return bounds;
    bounds = value;

    // Adjust y bounds so that the bounds have the same aspect ratio as the canvas.
    // Otherwise our map functions don't work correctly.
    var xc = 0.5*(bounds.x[0] + bounds.x[1]);
    var yc = 0.5*(bounds.y[0] + bounds.y[1]);
    var xrange = bounds.x[1] - bounds.x[0];
    bounds.y[0] = yc - 0.5*canvas.height/canvas.width*xrange;
    bounds.y[1] = yc + 0.5*canvas.height/canvas.width*xrange;

    return draw;
  };

  function circle(x,y,r) {
    ctx.arc(x,y,r,0,2*Math.PI);
  };

  return draw;
};
