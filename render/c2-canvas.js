var C2Canvas = function(canvas) {
  var ctx = canvas.getContext("2d");
  var bounds = {
    x: [-4, 4],
    y: [-4, 4]
  };

  function xscale(x) {
    return canvas.width*(x-bounds.x[0])/(bounds.x[1] - bounds.x[1]);
  };

  function yscale(y) {
    return canvas.height*(y-bounds.y[0])/(bounds.y[1] - bounds.y[1]);
  };

  var dispatch = {
    "point": function(el) {
      var rsquared = C2.Ro.size(el);
      if (rsquared < 0) {

      }
      var x = xscale(el[0])
      var y = yscale(el[1])
      var r = scale(Math.sqrt(rsquared));
      
      ctx.beginPath();
      circle(x,y,r);
      ctx.fill();
    }
  };

  var draw = function(els) {
    
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
