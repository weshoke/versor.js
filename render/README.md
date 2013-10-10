Here will be APIs for taking Versor elements and drawing them onto `<canvas>`, `<svg>`, etc.

We're starting with drawing C2 onto Canvas (2D).

API will look something like:

    var draw = CanvasRenderer(canvas)
      .bounds({
        x: [-4, 4]
        y: [-4, 4]
      })
    draw(element)
    draw([elements])