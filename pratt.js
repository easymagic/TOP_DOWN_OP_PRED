var pratt = {};

(function(p){
 
 var binding_powers = {};
 var tokens = ['4','+','11','/','(','13','-','2',')'];
 var pointer = -1;
 var splitters = ['-','+','/','*','(',')','[',']','if','then','else','pow','ceil','floor','sqr','sqrt','function','{','}',';','=','.eq.'];
 var symbol_proto = {
 	nud:function(){

 	},
 	led:function(){

 	},
 	bp:0
 };

 var token = null;

 var symbols = {};

 p.tokenize = function(input){
   var r = input;
   var glue = '__glue__';
   for (var i in splitters){
      r = r.split(splitters[i]).join(glue + splitters[i] + glue);
   }
   r = r.split(glue);
   
   tokens = [];
   for (var i in r){
      if (r[i].trim() != ''){
         tokens.push(r[i]);
      }
   }

   //console.log(tokens);

 };

 
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

 p.next = function(a,b){
   //console.log(a);
   ++pointer;
   if (pointer >= tokens.length){
     //pointer = tokens.length - 1;
     return;
   }
   
   if (!symbols[tokens[pointer]]){
     this.symbol({
     	bp:0,
     	id:tokens[pointer]
     });
   }

   token = symbols[tokens[pointer]];

   // console.log(pointer,tokens[pointer]);

   //console.log(a);
   if (a == 1){
     //console.log(pointer,tokens[pointer],token,b);
   }
   //console.log(token.value);
 };

 p.prev = function(){
  --pointer;
  if (pointer < 0){
   pointer = 0;
  }
  token = symbols[tokens[pointer]];
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
      return {
        left:left,
        right:p.expr(10),
        node:'+'
      };
 	}
 });


 p.symbol({
 	id:"*",
 	bp:20,
 	led:function(left){
     return {
       left:left,
       right:p.expr(20),
       node:'*'
     };
      //return left * p.expr(20);
 	}
 });


 p.symbol({
 	id:"-",
 	bp:10,
 	led:function(left){
    return {
      left:left,
      right:p.expr(10),
      node:'-'
    };
      //return +left - p.expr(10);
 	}
 });


 p.symbol({
  id:"/",
  bp:20,
  led:function(left){
    return {
      left:left,
      right:p.expr(20),
      node:'/'
    }
  }
 });


 p.symbol({
 	id:"(",
 	bp:0,
 	nud:function(left){
      var r = {};
      r = {
        left:p.expr(0),
        node:'('
      };
      p.next();
      return r;
 	}
 });


 // p.symbol({
 //  id:"{",
 //  bp:0,
 //  nud:function(left){
 //      var r = {};
 //      r = {
 //        left:p.expr(0),
 //        node:'}'
 //      };
 //      p.next();
 //      return r;
 //  }
 // });



 p.symbol({
  id:"{",
  bp:0,
  nud:function(){
      var r = 0;
      var id = ';';
      this.node = '{';
      var body = [];
      
      do {

         var rr = p.expr(0);
         body.push(rr);
         //var id = token.value;
         p.next();
   
      }while(token.value != '}');

        p.next();

      return {
         right:body,
         node:'{'
      };

   }   
 });


 p.symbol({
  id:'=',
  bp:5,
  led:function(left){
    var r = {};
    r.left = left;
    r.right = p.expr(0);
    r.node = '=';
    //console.log(r);
    return r;
  }
 });


 p.symbol({
  id:'.eq.',
  bp:5,
  led:function(left){
    var r = {};
    r.left = left;
    r.right = p.expr(0);
    r.node = '.eq.';
    return r;
  }
 });


 p.symbol({
  id:'if',
  bp:0,
  nud:function(){
    p.next();
    var r = {};
    r.cond = p.expr(0);
    p.next();
    r.action = p.expr(0);
    r.node = 'if';
    //p.next();
    //console.log(token.value);
    if (token.value == 'else'){
      p.next();
      r.else_part = p.expr(0);
      //console.log('Seen');
    }else{
      //p.prev();
    }
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

 p.reset = function(){
   pointer = -1;
 };

 
 p.run = function(cmd){
  this.tokenize(cmd);
  this.reset();
  this.next();
  return this.expr(0);
 };


 
// console.log(p);


})(pratt);
