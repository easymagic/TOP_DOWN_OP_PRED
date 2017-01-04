var pratt = {};
var function_scope = {}; //global function scope declaration made here ...
var symbols = {};

(function(p){
 
 var binding_powers = {};
 var tokens = ['4','+','11','/','(','13','-','2',')'];
 var pointer = -1;
 var splitters = ['print','>=','<=','==','++','--','!=','+=','-=','*=','/=','<>','>','"','<','-','+','/','*','(',')','[',']',',','if','then','else','for','pow','ceil','floor','sqr','sqrt','function','{','}',';','=','return'];
 var symbol_proto = {
 	nud:function(){

 	},
 	led:function(){

 	},
 	bp:0
 };

 var token = null;

 // var symbols = {};
 var symbols_obj = [];

 p.tokenize = function(input){
   var r = input;
    r = r.trim();
    r = r.split("\n").join("").split("\r").join("");
   var glue = '__glue__';
   for (var i in splitters){
      r = r.split(splitters[i]).join(glue + splitters[i] + glue);
   }
   r = r.split(glue);
   
   tokens = [];
   for (var i in r){
      if (r[i].trim() != ''){
         tokens.push(r[i].trim());
      }
   }

   //console.log(tokens);

 };



 p.tokenize_adv = function(input){
   var r = input;
    r = r.trim();
    r = r.split("\n").join("").split("\r").join("");
   var glue = '__glue__';
   for (var i in splitters){
      r = r.split(splitters[i]).join(glue + i + 'trk' + glue);
   }

   for (var i in splitters){
      r = r.split(glue + i + 'trk' + glue).join(glue + splitters[i] + glue);
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
  //console.log(id);

 	if (symbols[id]){
      symbols[id].bp = cfg.bp;
      if (cfg.nud){
        symbols[id].nud = cfg.nud;
      }
 	}else{

 	  symbols[id] = Object.create(symbol_proto);
 	  symbols[id].bp = cfg.bp;
 	  symbols[id].value = cfg.id;
 	  symbols[id].nud = cfg.nud || function(){
 	  	return id.trim();
 	  };
 	  symbols[id].led = cfg.led || symbols[id].led;

 	}

  symbols_obj[pointer+1] = symbols[id];
   
 }; 

 p.next = function(a,b){
   ++pointer;
   if (pointer >= tokens.length){
     return;
   }
   
   if (!symbols[tokens[pointer].trimLeft()]){
     //console.log(tokens[pointer]);
     this.symbol({
     	bp:0,
     	id:tokens[pointer].trimLeft()
     });
   }

   token = symbols[tokens[pointer].trimLeft()];
   
 };


 p.prev = function(){
  --pointer;
  if (pointer < 0){
   pointer = 0;
  }
  token = symbols[tokens[pointer]];
 };
 
 p.prev_token = {};

 p.expr = function(rbp){
  var t = token;
  this.next();
  var left = t.nud();
  while (rbp < token.bp){
     t = token;
     this.next();
     left = t.led(left);
  }

  p.prev_token = left;

  return left;

 };


 //init predefined functions here...
 p.init_user_defined_functions = function(id){
  var fs = function_scope;
  var id = id.trim();
  //for (var i in fs){
   
   p.symbol({
    id:id,
    bp:0,
    nud:function(){
      //return 'nud';
      var rr = {};
      rr.node = '_function_call_';
      rr.args = fs[id].args;
      rr.body = fs[id].body;
      p.next();
      var args_ = [];
      do{ 
         var tt = p.expr(0);
         if (tt != ','){
           args_.push(tt);
         }
      }while(token.value != ')');
      p.next();
      if (token.value == ';'){
        p.next();
      }
      rr.args_activation = args_;

      //console.log(rr);

      return rr; 

    }

   });

   //console.log(id);


  //}

  //console.log(symbols);

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
 	id:'return',
 	bp:0,
 	nud:function(){
 		var rr = {};
        rr.node = 'return';
        rr.right = p.expr(0);
        if (token.value == ';'){
          p.next();
        }
 		return rr;
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
  id:'++',
  bp:0,
  nud:function(){
    //p.next();
    var rr = {};

    var rr = {};
    if (token.value == ';'){
       rr.dir = 'post';
       //console.log(symbols_obj);
       console.log(p.prev_token);
       rr.left = p.prev_token;

    }else{
       rr.dir = 'pre';
       rr.right = p.expr(0);
    }




    rr.node = '++_vl_';
    //rr.right = p.expr(0);
    if (token.value == ';'){
     p.next();
    }
    return rr;
  }
 });


 p.symbol({
  id:'--',
  bp:0,
  nud:function(){
    //p.next();
    var rr = {};
    if (token.value == ';'){
       rr.dir = 'post';
       //console.log(symbols_obj);
       rr.left = p.prev_token.left.trim();
    }else{
       rr.dir = 'pre';
       rr.right = p.expr(0);
    }

    //console.log(rr);

    rr.node = '--_vl_';
    //rr.right = p.expr(0);
    if (token.value == ';'){
     p.next();
    }
    return rr;
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
  id:'print',
  bp:0,
  nud:function(){
    var rr = {};
    p.next();
    var v = [];
    do{
      
      var r_ = p.expr(0);

      if (r_ != ','){
       v.push(r_);
      }
      
      var tk = token.value;

    }while(tk != ')');
    p.next();
    if (token.value == ';'){
     p.next();
    }
    rr.right = v;  
    rr.node = 'print';
    return rr;
  }
 });



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

         
   
      }while(token.value != '}');

      //console.log(token.value);

        p.next();

    while (token.value == ';'){
     p.next();
    }


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
    //console.log(symbols);
    r.right = p.expr(0);
    r.node = '=';
    //console.log(token.value);
    //console.log(r);
    if (token.value == ';'){
       p.next();
    }
    return r;
  }
 });


 p.symbol({
  id:'+=',
  bp:5,
  led:function(left){
    var r = {};
    r.left = left;
    r.node = '+=';
    r.right = p.expr(0);
    if (token.value == ';'){
       p.next();
    }
    return r;
  }
 });

 p.symbol({
  id:'-=',
  bp:5,
  led:function(left){
    var r = {};
    r.left = left;
    r.node = '-=';
    r.right = p.expr(0);
    if (token.value == ';'){
       p.next();
    }
    return r;
  }
 });


 p.symbol({
  id:'*=',
  bp:5,
  led:function(left){
    var r = {};
    r.left = left;
    r.node = '*=';
    r.right = p.expr(0);
    if (token.value == ';'){
       p.next();
    }
    return r;
  }
 });


 p.symbol({
  id:'/=',
  bp:5,
  led:function(left){
    var r = {};
    r.left = left;
    r.node = '/=';
    r.right = p.expr(0);
    if (token.value == ';'){
       p.next();
    }
    return r;
  }
 });



 p.symbol({
  id:'==',
  bp:5,
  led:function(left){
    var r = {};
    r.left = left;
    r.right = p.expr(0);
    r.node = '==';
    return r;
  }
 });


 p.symbol({
  id:'<=',
  bp:5,
  led:function(left){
    var r = {};
    r.left = left;
    r.right = p.expr(0);
    r.node = '<=';
    return r;
  }
 });

 p.symbol({
  id:'>=',
  bp:5,
  led:function(left){
    var r = {};
    r.left = left;
    r.right = p.expr(0);
    r.node = '>=';
    return r;
  }
 });


 p.symbol({
  id:'>',
  bp:5,
  led:function(left){
    var r = {};
    r.left = left;
    r.right = p.expr(0);
    r.node = '>';
    return r;
  }
 });


  p.symbol({
  id:'<',
  bp:5,
  led:function(left){
    var r = {};
    r.left = left;
    r.right = p.expr(0);
    r.node = '<';
    return r;
  }
 });



 p.symbol({
  id:'!=',
  bp:5,
  led:function(left){
    var r = {};
    r.left = left;
    r.right = p.expr(0);
    r.node = '!=';
    return r;
  }
 });



 p.symbol({
  id:'<>',
  bp:5,
  led:function(left){
    var r = {};
    r.left = left;
    r.right = p.expr(0);
    r.node = '<>';
    return r;
  }
 });




 p.symbol({
  id:'"',
  bp:0,
  nud:function(){
    var r = {};
    var b = [];

    r.node = '(string)';
    //return r;


    do{

      b.push(token.value);

      p.next();

    }while(token.value != '"');

    p.next();

    r.buff = b;
    //p.next();

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
   // console.log(token.value);
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


 p.symbol({
  id:'for',
  bp:0,
  nud:function(){
    p.next();
    var rr = {};
    rr.start = p.expr(0);
    rr.stop = p.expr(0); 
    p.next();
    rr.inc = p.expr(0);
    p.next();
    rr.node = 'for';
    rr.body = p.expr(0); 
    return rr;
  }
 });


 p.symbol({
  id:'function',
  bp:0,
  nud:function(){
    var rr = {};
    rr.node = 'function';
    rr.function_name = token.value.trim();

    var args = [];

    
    p.next();
    p.next();

    do{
      
      var arg_ = p.expr(0);
      if (arg_ != ','){
        args.push(arg_);
      }

      //p.next();
      

    }while(token.value != ')');

    p.next();

    rr.args = args;

    rr.body = p.expr(0);

    function_scope[rr.function_name] = {
      args:args,
      body:rr.body
    };


    p.init_user_defined_functions(rr.function_name);

    //console.log(rr.function_name);

    return rr;
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
  this.tokenize_adv(cmd);
  this.reset();
  this.next();
  var r = this.expr(0);
  //this.init_user_defined_functions(); //load user defined functions. 
  return r; 
 };


 
// console.log(p);


})(pratt);






var interpreter = {};
(function(itr){
 
  var scope = {};
  


  itr.eval_ = function(ast){
    //console.log(ast);
     if (typeof(ast) == 'object'){
       if (typeof(itr[ast.node]) != 'undefined'){
         return itr[ast.node].apply(itr,[ast]);
       }else{
         return 'Lib not defined!';
       }
     }else{
       if (typeof(scope[ast]) != 'undefined'){
          return scope[ast];
       }else{
          return ast;    
       }
     }
  };

  itr['='] = function(ast){
    scope[ast.left] = this.eval_.apply(this,[ast.right]);
    return scope[ast.left];
  };

  itr['print'] = function(ast){

     var list = ast.right;
     var rr = [];
     
     for (var i in list){
        rr.push(itr.eval_.apply(this,[list[i]]));
     }

     //var r = itr.eval_.apply(this,[ast.right]);
     //console.log(rr);
     return rr.join(' , ');

  };


  itr['*'] = function(ast){
    return itr.eval_(ast.left) * itr.eval_(ast.right);
  };

  itr['+'] = function(ast){
    return (+itr.eval_(ast.left)) + (+itr.eval_(ast.right));
  };

  itr['/'] = function(ast){
    return (+itr.eval_(ast.left)) / (+itr.eval_(ast.right));
  };

  itr['-'] = function(ast){
    return (+itr.eval_(ast.left)) - (+itr.eval_(ast.right));
  };


  itr['('] = function(ast){
    return (+itr.eval_(ast.left));
  };

  itr['{'] = function(ast){
    var arr = ast.right;
    var r = '';
    for (var i in arr){
      r = itr.eval_(arr[i]);
    }
    return r;
  };

  itr['<='] = function(ast){
     return (itr.eval_(ast.left)*1 <= itr.eval_(ast.right)*1);
  };

  itr['>='] = function(ast){
     return (itr.eval_(ast.left) >= itr.eval_(ast.right));
  };


  itr['<'] = function(ast){
     return (itr.eval_(ast.left) < itr.eval_(ast.right));
  };

  itr['>'] = function(ast){
     return (itr.eval_(ast.left) > itr.eval_(ast.right));
  };


  itr['<>'] = function(ast){
     return (itr.eval_(ast.left) != itr.eval_(ast.right));
  };


  itr['!='] = function(ast){
     return (itr.eval_(ast.left) != itr.eval_(ast.right));
  };

  itr['=='] = function(ast){
     return (itr.eval_(ast.left)*1 == itr.eval_(ast.right)*1);
  };


  itr['if'] = function(ast){
    
    //cond , action , else_part
    var cond = itr.eval_(ast.cond);

    if (cond){
      return itr.eval_(ast.action);
    }else{
      if (ast.else_part){
        return itr.eval_(ast.else_part);
      }
    }

  };


  itr['for'] = function(ast){
     var start = ast.start;
     var stop = ast.stop;
     var inc = ast.inc;
     var body = ast.body;
     var r = '';

      for (itr.eval_(start);itr.eval_(stop);itr.eval_(inc)){
        r =itr.eval_(body);
      }

      return r;
  };

  itr['_vl_++'] = function(ast){
    scope[ast.left]++;
    return scope[ast.left];
  };

  itr['++_vl_'] = function(ast){
    //console.log(ast);

    if (ast.dir == 'post'){
      
      var v = scope[ast.left]++; 
      return v;
      //console.log(scope[ast.left]);
      ///return scope[ast.left];

    }else{
      
      return ++scope[ast.right];
      //scope[ast.right];
      //return scope[ast.right];

    }


  };


  itr['--_vl_'] = function(ast){

    //console.log(ast);
    
    if (ast.dir == 'post'){
      
      var v = scope[ast.left]--; 
      return v;
      //console.log(scope[ast.left]);
      //return scope[ast.left];

    }else{
      
      return --scope[ast.right];
      //scope[ast.right];
      

    }
    
    
  };

  itr['_vl_--'] = function(ast){
    scope[ast.left]--;
    return scope[ast.left];
  };



  itr['+='] = function(ast){
     var left = ast.left;
     var right = ast.right;
     scope[left] = +scope[left]*1 + itr.eval_(right)*1;
     return scope[left];
  };


  itr['*='] = function(ast){
     var left = ast.left;
     var right = ast.right;
     scope[left] = +scope[left] * itr.eval_(right);
     return scope[left];
  };


  itr['-='] = function(ast){
     var left = ast.left;
     var right = ast.right;
     scope[left] = +scope[left]*1 - (+itr.eval_(right))*1;
     return scope[left];
  };


  itr['/='] = function(ast){
     var left = ast.left;
     var right = ast.right;
     scope[left] = +scope[left] / itr.eval_(right) * 1;
     return scope[left];
  };


  itr['_function_call_'] = function(ast){
     
     var args = ast.args;
     var args_activation = ast.args_activation;
     var body = ast.body;

     for (var i in args){
           scope[args[i]] = itr.eval_(args_activation[i]);
     }

     return itr.eval_(body);

  };

  itr['return'] = function(ast){
    return itr.eval_(ast.right);
  };

  itr['(string)'] = function(ast){
  	var r = [];
  	for (var i in ast.buff){
      r.push(ast.buff[i]);
  	}
    return r.join('');
  };


  // itr['function'] = function(ast){
  //   function_scope[ast.function_name] = {
  //     args:ast.args,
  //     body:ast.body
  //   };  
  //   console.log(function_scope);
  // };




})(interpreter);
