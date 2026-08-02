/* Ezra Mobile Interpreter — complete subset for the playground */

const fmt = v => {
  if (v === null || v === undefined) return 'nothing';
  if (v === true) return 'yes';
  if (v === false) return 'no';
  if (Array.isArray(v)) return '[' + v.map(fmt).join(', ') + ']';
  if (typeof v === 'object') return '{' + Object.entries(v).map(([k,val]) => k+': '+fmt(val)).join(', ')+'}';
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : String(Math.round(v*1e10)/1e10);
  return String(v);
};

const isTruthy = v => {
  if (v === null || v === undefined || v === false) return false;
  if (v === 0 || v === '') return false;
  if (Array.isArray(v) && v.length === 0) return false;
  if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) return false;
  return true;
};

const interpolate = (s, env) => s.replace(/\{([^}]+)\}/g, (_, expr) => {
  try { return fmt(evalExpr(expr.trim(), env)); } catch { return '{'+expr+'}'; }
});

function callMethod(obj, name, args) {
  if (Array.isArray(obj)) {
    const arr = obj;
    switch(name) {
      case 'length': return arr.length;
      case 'push':   return [...arr, args[0]];
      case 'pop':    return arr.slice(0,-1);
      case 'sort': { const r=[...arr]; r.sort((a,b)=>typeof a==='number'?a-b:String(a).localeCompare(String(b))); return r; }
      case 'reverse': return [...arr].reverse();
      case 'sum':    return arr.reduce((a,v)=>a+(typeof v==='number'?v:0),0);
      case 'avg': case 'mean': { const s=arr.reduce((a,v)=>a+(typeof v==='number'?v:0),0); return arr.length?s/arr.length:0; }
      case 'min':    return Math.min(...arr.filter(v=>typeof v==='number'));
      case 'max':    return Math.max(...arr.filter(v=>typeof v==='number'));
      case 'first':  return arr[0]??null;
      case 'last':   return arr[arr.length-1]??null;
      case 'contains': return arr.includes(args[0]);
      case 'join':   return arr.map(fmt).join(args[0]??',');
      case 'take':   return arr.slice(0,args[0]);
      case 'drop':   return arr.slice(args[0]);
      case 'is_empty': return arr.length===0;
      case 'filter': { const fn=args[0]; return typeof fn==='function'?arr.filter(fn):arr; }
      case 'map':    { const fn=args[0]; return typeof fn==='function'?arr.map(fn):arr; }
      case 'reduce': { const fn=args[0],init=args[1]; return typeof fn==='function'?arr.reduce(fn,init):arr; }
      default: throw new Error('unknown list method `'+name+'`');
    }
  }
  if (typeof obj === 'string') {
    switch(name) {
      case 'upper':   return obj.toUpperCase();
      case 'lower':   return obj.toLowerCase();
      case 'trim':    return obj.trim();
      case 'length':  return obj.length;
      case 'split':   return obj.split(args[0]??'');
      case 'contains': return obj.includes(args[0]);
      case 'starts_with': return obj.startsWith(args[0]);
      case 'ends_with':   return obj.endsWith(args[0]);
      case 'replace': return obj.replaceAll(args[0],args[1]??'');
      case 'find':    return obj.indexOf(args[0]);
      case 'chars':   return [...obj];
      case 'is_empty': return obj.length===0;
      default: throw new Error('unknown string method `'+name+'`');
    }
  }
  if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
    switch(name) {
      case 'keys':   return Object.keys(obj);
      case 'values': return Object.values(obj);
      case 'has':    return args[0] in obj;
      default: throw new Error('unknown object method `'+name+'`');
    }
  }
  throw new Error('cannot call .'+name+'() on '+typeof obj);
}

function makeBuiltins(out) {
  return {
    say: v => { out.push({t:'out',v:fmt(v??'')}); return null; },
    write: v => { out.push({t:'out',v:fmt(v??'')}); return null; },
    warn: v => { out.push({t:'warn',v:'warning: '+fmt(v)}); return null; },
    fail: v => { out.push({t:'err',v:'error: '+fmt(v)}); return null; },
    len: v => Array.isArray(v)?v.length:typeof v==='string'?v.length:typeof v==='object'&&v?Object.keys(v).length:0,
    range: (a,b,step=1) => { const r=[]; if(b===undefined){b=a;a=0;} for(let i=a;step>0?i<b:i>b;i+=step)r.push(i); return r; },
    type_of: v => v===null?'nothing':Array.isArray(v)?'list':typeof v==='boolean'?'bool':typeof v,
    text: v => fmt(v),
    number: v => { const n=Number(v); return isNaN(n)?null:n; },
    bool: v => isTruthy(v),
    abs: v => Math.abs(v), sqrt: v => Math.sqrt(v),
    floor: v => Math.floor(v), ceil: v => Math.ceil(v), round: v => Math.round(v),
    min: (a,b) => Math.min(a,b), max: (a,b) => Math.max(a,b),
    pow: (a,b) => Math.pow(a,b), sin: v => Math.sin(v), cos: v => Math.cos(v),
    keys: v => v&&typeof v==='object'&&!Array.isArray(v)?Object.keys(v):[],
    values: v => v&&typeof v==='object'&&!Array.isArray(v)?Object.values(v):[],
    is_number: v => typeof v==='number', is_text: v => typeof v==='string',
    is_bool: v => typeof v==='boolean', is_list: v => Array.isArray(v),
    is_nothing: v => v===null||v===undefined,
    parse_json: s => { try{return JSON.parse(s);}catch(e){throw new Error('invalid JSON');} },
    stringify_json: v => JSON.stringify(v),
    random: () => Math.random(),
    random_int: (a,b) => Math.floor(Math.random()*(b-a+1))+a,
    time: () => Date.now()/1000,
  };
}

function evalExpr(expr, env) {
  expr = expr.trim();
  if (!expr) return null;
  if (expr.startsWith('"') && expr.endsWith('"')) return interpolate(expr.slice(1,-1), env);

  // Arrow functions
  const arrow1 = expr.match(/^([a-zA-Z_]\w*)\s*->\s*(.+)$/);
  if (arrow1) { const [,p,b]=arrow1; return x => { const e={...env,[p]:x}; return evalExpr(b,e); }; }
  const arrowN = expr.match(/^\(([^)]*)\)\s*->\s*(.+)$/);
  if (arrowN) { const params=arrowN[1].split(',').map(s=>s.trim()).filter(Boolean),b=arrowN[2]; return (...xs) => { const e={...env}; params.forEach((p,i)=>e[p]=xs[i]); return evalExpr(b,e); }; }

  const keys = Object.keys(env).filter(k=>/^[a-zA-Z_]\w*$/.test(k));
  const vals = keys.map(k=>env[k]);
  let js = expr
    .replace(/\*\*/g,'**').replace(/\bis not\b/g,'!==').replace(/\bis\b/g,'===')
    .replace(/\band\b/g,'&&').replace(/\bor\b/g,'||').replace(/\bnot\b/g,'!')
    .replace(/\byes\b/g,'true').replace(/\bno\b/g,'false').replace(/\bnothing\b/g,'null');

  js = js.replace(/\.filter\((\w+)\s*->\s*([^)]+)\)/g,(_,p,body)=>`.filter(${p}=>{try{return !!(${_translate(body,env)});}catch{return false;}})`);
  js = js.replace(/\.map\((\w+)\s*->\s*([^)]+)\)/g,(_,p,body)=>`.map(${p}=>${_translate(body,env)})`);
  js = js.replace(/\.reduce\(\((\w+),\s*(\w+)\)\s*->\s*([^,)]+),\s*([^)]+)\)/g,(_,a,b,body,init)=>`.reduce((${a},${b})=>${_translate(body,env)},${_translate(init,env)})`);
  js = js.replace(/\.(\w+)\(([^)]*)\)/g,(_,m,args)=>`.__m("${m}",[${args}])`);
  js = js.replace(/\.(\w+)(?!\s*\()/g,(_,p)=>`.__p("${p}")`);
  js = js.replace(/(\w+)\.__m\("(\w+)",\s*\[(.*?)\]\)/g,(_,o,m,a)=>`callMethod(${o},"${m}",[${a}])`);
  js = js.replace(/(\w+)\.__p\("(\w+)"\)/g,(_,o,p)=>`(Array.isArray(${o})&&"${p}"==="length"?${o}.length:typeof ${o}==="string"&&"${p}"==="length"?${o}.length:typeof ${o}==="object"&&${o}?${o}["${p}"]:callMethod(${o},"${p}",[]))`);

  try {
    const fn = new Function('callMethod','isTruthy','fmt','interpolate',...keys,'"use strict";return ('+js+')');
    return fn(callMethod,isTruthy,fmt,interpolate,...vals);
  } catch(e) { throw new Error(e.message.replace(' is not defined','`')); }
}

function _translate(expr, env) {
  return expr.replace(/\*\*/g,'**').replace(/\bis not\b/g,'!==').replace(/\bis\b/g,'===')
    .replace(/\band\b/g,'&&').replace(/\bor\b/g,'||').replace(/\byes\b/g,'true')
    .replace(/\bno\b/g,'false').replace(/\bnothing\b/g,'null');
}

class EzraRuntime {
  constructor() { this.output = []; this.builtins = makeBuiltins(this.output); }

  run(source) {
    this.output = [];
    this.builtins = makeBuiltins(this.output);
    const lines = source.split('\n');
    const env = {...this.builtins};
    try { this._exec(lines, 0, 0, env); } catch(e) {
      if (!e?.__return && !e?.__break && !e?.__next) this.output.push({t:'err',v:'error: '+(e.message||String(e))});
    }
    return this.output;
  }

  _indent(line) { return line.match(/^(\s*)/)[1].length; }

  _exec(lines, start, minInd, env) {
    let i = start;
    while (i < lines.length) {
      const raw = lines[i];
      if (!raw.trim() || raw.trim().startsWith('#') || raw.trim().startsWith('//')) { i++; continue; }
      const ind = this._indent(raw);
      if (ind < minInd) break;
      const line = raw.trim();

      if (/^(say|write|warn|fail)\s/.test(line)) {
        const cmd = line.split(/\s/)[0], arg = line.slice(cmd.length).trim();
        const v = this._eval(arg, env);
        if (cmd === 'say'||cmd==='write') this.output.push({t:'out',v:fmt(v)});
        else if (cmd==='warn') this.output.push({t:'warn',v:'warning: '+fmt(v)});
        else this.output.push({t:'err',v:'error: '+fmt(v)});
        i++; continue;
      }
      if (line.startsWith('assert ')) {
        const parts=line.slice(7).split(','), cond=this._eval(parts[0].trim(),env);
        if (!isTruthy(cond)) throw new Error(parts[1]?fmt(this._eval(parts[1].trim(),env)):'assertion failed');
        i++; continue;
      }
      if (line.startsWith('throw ')) throw new Error(fmt(this._eval(line.slice(6).trim(),env)));
      if (line.startsWith('return ')||line.startsWith('-> ')) throw {__return:true,value:this._eval(line.replace(/^(return|->)\s+/,''),env)};
      if (line==='break') throw {__break:true};
      if (line==='next')  throw {__next:true};

      const fnM = line.match(/^give\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)$/);
      if (fnM) {
        const [,nm,ps]=fnM, params=ps.split(',').map(s=>s.trim()).filter(Boolean);
        i++;
        const bi = i<lines.length?Math.max(this._indent(lines[i]),ind+2):ind+2;
        const bst=i;
        while(i<lines.length&&(lines[i].trim()===''||this._indent(lines[i])>=bi))i++;
        const bls=lines.slice(bst,i);
        const self=this;
        env[nm]=(...args)=>{ const fe={...env}; params.forEach((p,idx)=>fe[p]=args[idx]); try{self._exec(bls,0,0,fe);return null;}catch(e){if(e?.__return)return e.value;throw e;}};
        continue;
      }

      const decM=line.match(/^(?:let|const)\s+([a-zA-Z_]\w*)(?:\s*:\s*\w+)?\s+is\s+(.+)$/);
      if(decM){env[decM[1]]=this._eval(decM[2],env);i++;continue;}

      const cpM=line.match(/^([a-zA-Z_]\w*)\s*(\+=|-=|\*=|\/=|%=)\s*(.+)$/);
      if(cpM){const[,v,op,rhs]=cpM,cur=env[v]??0,val=this._eval(rhs,env);env[v]=op==='+='?cur+val:op==='-='?cur-val:op==='*='?cur*val:op==='/='?cur/val:cur%val;i++;continue;}

      const asM=line.match(/^([a-zA-Z_]\w*)\s+is\s+(.+)$/);
      if(asM&&!line.startsWith('check')&&!line.startsWith('for')&&!line.startsWith('while')){env[asM[1]]=this._eval(asM[2],env);i++;continue;}

      if(line.startsWith('check if ')){
        const cond=this._eval(line.slice(9),env);
        i++;
        const bi=i<lines.length?Math.max(this._indent(lines[i]),ind+2):ind+2;
        const ts=i;
        while(i<lines.length&&lines[i].trim()!==''&&this._indent(lines[i])>=bi)i++;
        const te=i;
        let taken=false;
        if(isTruthy(cond)){this._execGetEnv(lines.slice(ts,te),0,0,env);taken=true;}
        while(i<lines.length){
          const nx=lines[i].trim();
          if(nx.startsWith('otherwise if ')){
            const c2=this._eval(nx.slice(13),env); i++;
            const bi2=i<lines.length?Math.max(this._indent(lines[i]),ind+2):ind+2;
            const st2=i; while(i<lines.length&&lines[i].trim()!==''&&this._indent(lines[i])>=bi2)i++;
            if(!taken&&isTruthy(c2)){this._execGetEnv(lines.slice(st2,i),0,0,env);taken=true;}
          } else if(nx==='otherwise'){
            i++;
            const bi3=i<lines.length?Math.max(this._indent(lines[i]),ind+2):ind+2;
            const st3=i; while(i<lines.length&&lines[i].trim()!==''&&this._indent(lines[i])>=bi3)i++;
            if(!taken)this._execGetEnv(lines.slice(st3,i),0,0,env);
            break;
          } else break;
        }
        continue;
      }

      if(line.startsWith('while ')){
        const cs=line.slice(6).trim(); i++;
        const bi=i<lines.length?Math.max(this._indent(lines[i]),ind+2):ind+2;
        const ls=i; while(i<lines.length&&(lines[i].trim()===''||this._indent(lines[i])>=bi))i++;
        const ll=lines.slice(ls,i); let iters=0;
        while(isTruthy(this._eval(cs,env))&&iters++<1000){
          try{this._execGetEnv(ll,0,0,env);}catch(e){if(e?.__break)break;if(e?.__next)continue;throw e;}
        }
        continue;
      }

      const forM=line.match(/^for each\s+([a-zA-Z_]\w*)\s+in\s+(.+)$/);
      if(forM){
        const[,vn,le]=forM, list=this._eval(le,env); i++;
        const bi=i<lines.length?Math.max(this._indent(lines[i]),ind+2):ind+2;
        const ls=i; while(i<lines.length&&(lines[i].trim()===''||this._indent(lines[i])>=bi))i++;
        const ll=lines.slice(ls,i);
        if(Array.isArray(list)){for(const item of list.slice(0,500)){const le2={...env,[vn]:item};try{this._execGetEnv(ll,0,0,le2);Object.assign(env,le2);}catch(e){if(e?.__break)break;if(e?.__next)continue;throw e;}}}
        continue;
      }

      if(line==='try'){
        i++;
        const bi=i<lines.length?Math.max(this._indent(lines[i]),ind+2):ind+2;
        const ts=i; while(i<lines.length&&(lines[i].trim()===''||this._indent(lines[i])>=bi))i++;
        let caught=false,ev=null;
        try{this._execGetEnv(lines.slice(ts,i),0,0,env);}catch(e){if(e?.__return||e?.__break||e?.__next)throw e;caught=true;ev=e.message||String(e);}
        if(lines[i]?.trim().startsWith('catch')){
          const cv=lines[i].trim().match(/^catch\s+([a-zA-Z_]\w*)/)?.[1]; i++;
          const cbi=i<lines.length?Math.max(this._indent(lines[i]),ind+2):ind+2;
          const cs=i; while(i<lines.length&&(lines[i].trim()===''||this._indent(lines[i])>=cbi))i++;
          if(caught){const ce={...env};if(cv)ce[cv]=ev;this._execGetEnv(lines.slice(cs,i),0,0,ce);Object.assign(env,ce);}
        }
        if(lines[i]?.trim()==='finally'){
          i++;
          const fbi=i<lines.length?Math.max(this._indent(lines[i]),ind+2):ind+2;
          const fs=i; while(i<lines.length&&(lines[i].trim()===''||this._indent(lines[i])>=fbi))i++;
          this._execGetEnv(lines.slice(fs,i),0,0,env);
        }
        continue;
      }

      try{this._eval(line,env);}catch(e){if(e?.__return||e?.__break||e?.__next)throw e;}
      i++;
    }
    return i;
  }

  _execGetEnv(lines,start,mi,env){const e={...env};try{this._exec(lines,start,mi,e);}catch(err){if(err?.__return||err?.__break||err?.__next)throw err;throw err;}Object.assign(env,e);return e;}

  _eval(expr,env){
    expr=expr.trim();
    if(!expr)return null;
    if(expr.startsWith('"')&&expr.endsWith('"'))return interpolate(expr.slice(1,-1),env);
    return evalExpr(expr,env);
  }
}

export function runEzra(source) {
  const rt = new EzraRuntime();
  return rt.run(source);
}
