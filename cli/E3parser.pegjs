{
  var blades = {};
}

op
  = assignment

assignment
  = left:blade "=" right:combination { blades[left] = right; }
  / combination

combination
  = left:geomprod "+" right:combination { return left + ".add(" + right + ")"; }
  / left:geomprod "-" right:combination { return left + ".sub(" + right + ")"; }
  / geomprod

geomprod
  = left:scalar "*" right:geomprod { return right + ".gp(" + left + ")"; }
  / left:innerprod "*" right:geomprod { return left + ".gp(" + right + ")"; }
  / innerprod

innerprod
  = left:outerprod "<<" right:innerprod { return left + ".ip(" + right + ")"; }
  / outerprod

outerprod
  = left:primary "^" right:outerprod { return left + ".op(" + right + ")"; }
  / unary

unary
  = "~" right:primary { return right + ".reverse()"; }
  / "!" right:primary { return right + ".inverse()"; }
  / "&" right:primary { return right + ".conjugate()"; }
  / primary

primary
  = basisblade
  / scalar
  / blade
  / "(" op:op ")" { return op; }

basisblade
  = chars:([e][1-5]+) { return "C2." + chars.join("") + "(1)"; }

scalar
  = number:(frac) { return parseFloat(number.join("")); }
  / number:(frac) { return parseFloat(number.join("")); }
  / number:(digits) { return parseFloat(number); }

frac
  = digits "." digits
  / "." digits

digits
  = number:digit+ { return number.join(""); }

digit
  = [0-9]

blade "blade"
  = chars:[a-zA-Z0-9]+ { return chars.join(""); }
