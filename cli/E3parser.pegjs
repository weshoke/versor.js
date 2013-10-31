op
  = geomprod

geomprod
  = left:innerprod "*" right:geomprod { return left + ".gp(" + right + ")"; }
  / innerprod

innerprod
  = left:outerprod "<<" right:innerprod { return left + ".ip(" + right + ")"; }
  / outerprod

outerprod
  = left:primary "^" right:outerprod { return left + ".op(" + right + ")"; }
  / primary

primary
  = blade
  / "(" op:op ")" { return op; }

blade "blade"
  = chars:[a-zA-Z0-9]+ { return chars.join(""); }
