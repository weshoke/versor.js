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

  var pointRadius = 2;

  var dispatch = {
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
    }
  };

  var draw = function(els) {
    if (els.length) {
      for (var i = 0; i < els.length; i++) draw(els[i]);
      return;
    }
    ctx.save();
    dispatch[els.type](els);
    ctx.restore();
  };

  draw.bounds = function(value) {
    if (!arguments.length) return bounds;
    bounds = value;
    return draw;
  };

  function circle(x,y,r) {
    ctx.arc(x,y,r,0,2*Math.PI);
  };

  return draw;
};
