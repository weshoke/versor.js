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

  var dispatch = {
    Vec: function(el) {
      var rsquared = C2.Ro.size(el);

      var x = mapx(el[0])
      var y = mapy(el[1])
      var r = scale(Math.sqrt(Math.abs(rsquared)));
      if (r === 0) r = 2;

      ctx.beginPath();
      if (rsquared > 0) {
        ctx.strokeStyle = "blue";
      } else if (rsquared < 0) {
        ctx.strokeStyle = "red";
      }
      circle(x,y,r);
      ctx.closePath();
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
