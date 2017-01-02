var pratt = {};

(function(p){
 
 var binding_powers = {};
 var tokens = ['4','+','11','*','(','3','+','2',')'];
 var pointer = -1;
 var symbol_proto = {
 	nud:function(){

 	},
 	led:function(){

 	},
 	bp:0
 };

 var token = null;

 var symbols = {};

 
 p.symbol = function(cfg){

 	var id = cfg.id;

 	if (symbols[id]){
      symbols[id].bp = cfg.bp;
 	}else{

 	  symbols[id] = Object.create(symbol_proto);
 	  symbols[id].bp = cfg.bp;
 	  symbols[id].value = cfg.id;
 	  symbols[id].nud = cfg.nud || function(){
 	  	return id;
 	  };
 	  symbols[id].led = cfg.led || symbols[id].led;

 	}
   
 }; 

 p.next = function(){
   ++pointer;
   if (pointer >= tokens.length){
     return;
   }
   if (!symbols[tokens[pointer]]){
     this.symbol({
     	bp:0,
     	id:tokens[pointer]
     });
   }

   token = symbols[tokens[pointer]];
   //console.log(token);
 };

 p.expr = function(rbp){
  var t = token;
  this.next();
  var left = t.nud();
  while (rbp < token.bp){
     t = token;
     this.next();
     left = t.led(left);
  }

  return left;

 };

 p.symbol({
 	id:"+",
 	bp:10,
 	led:function(left){
      return +left + p.expr(10)*1;
 	}
 });


 p.symbol({
 	id:"*",
 	bp:20,
 	led:function(left){
      return left * p.expr(20);
 	}
 });


 p.symbol({
 	id:"-",
 	bp:10,
 	led:function(left){
      return +left - p.expr(10);
 	}
 });


 p.symbol({
 	id:"(",
 	bp:0,
 	nud:function(left){
      var r = 0;
      r = p.expr(0);
      console.log(token);
      //p.next();
      return r;
 	}
 });


 // p.symbol({
 // 	id:")",
 // 	bp:0,
 // 	nud:function(left){
 //      // var r = 0;
 //      // r = +left + p.expr(10);
 //      return 1;
 // 	}
 // });


 p.run = function(){
  this.next();
  return this.expr(0);
 };


 
 console.log(p);


})(pratt);
