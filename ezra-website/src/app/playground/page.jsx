'use client';
import { useState, useRef, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════════
   Ezra Browser Playground Interpreter
   Handles the most common Ezra patterns reliably.
═══════════════════════════════════════════════════════════════ */

const EXAMPLES = {
  'Hello World': `say "Hello, World!"`,
  'Variables': `name is "Ankur"\nage is 25\nsay "Hello {name}, age {age}"\nsay "Next year: {age + 1}"`,
  'Conditions': `score is 85\ncheck if score >= 90\n  say "Grade A"\notherwise if score >= 75\n  say "Grade B"\notherwise if score >= 60\n  say "Grade C"\notherwise\n  say "Try again"`,
  'While Loop': `i is 1\nwhile i <= 5\n  say "Count: {i}"\n  i += 1`,
  'For Each': `fruits is ["apple", "banana", "mango"]\nfor each fruit in fruits\n  say "Fruit: {fruit}"`,
  'Functions': `give add(a, b)\n  -> a + b\n\ngive greet(name)\n  -> "Hello {name}!"\n\nsay add(10, 20)\nsay greet("Ezra")`,
  'Lists': `nums is [3, 1, 4, 1, 5, 9, 2]\nsay "Length: {len(nums)}"\nsay "Sum: {nums.sum()}"\nsay "Sorted: {nums.sort()}"\nevens is nums.filter(n -> n % 2 is 0)\nsay "Evens: {evens}"`,
  'FizzBuzz': `i is 1\nwhile i <= 20\n  check if i % 15 is 0\n    say "FizzBuzz"\n  otherwise if i % 3 is 0\n    say "Fizz"\n  otherwise if i % 5 is 0\n    say "Buzz"\n  otherwise\n    say i\n  i += 1`,
  'Error Handling': `try\n  x is 10 / 0\ncatch err\n  say "Caught: {err}"\nfinally\n  say "Done"`,
  'Fibonacci': `give fib(n)\n  check if n <= 1\n    -> n\n  -> fib(n - 1) + fib(n - 2)\n\ni is 0\nwhile i <= 10\n  say "fib({i}) = {fib(i)}"\n  i += 1`,
};

/* ── Value helpers ── */
const fmt = v => {
  if (v === null || v === undefined) return 'nothing';
  if (v === true) return 'yes';
  if (v === false) return 'no';
  if (Array.isArray(v)) return '[' + v.map(fmt).join(', ') + ']';
  if (typeof v === 'object') {
    return '{' + Object.entries(v).map(([k,val]) => k + ': ' + fmt(val)).join(', ') + '}';
  }
  if (typeof v === 'number') {
    return Number.isInteger(v) ? String(v) : String(Math.round(v * 1e10) / 1e10);
  }
  return String(v);
};

const isTruthy = v => {
  if (v === null || v === undefined || v === false) return false;
  if (v === 0 || v === '') return false;
  if (Array.isArray(v) && v.length === 0) return false;
  if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) return false;
  return true;
};

/* ── String interpolation ── */
const interpolate = (s, env) => s.replace(/\{([^}]+)\}/g, (_, expr) => {
  try { return fmt(evalExpr(expr.trim(), env)); } catch { return '{' + expr + '}'; }
});

/* ── Expression evaluator ── */
function evalExpr(expr, env) {
  expr = expr.trim();
  if (!expr) return undefined;

  // Arrow function: n -> expr
  const arrowM = expr.match(/^([a-zA-Z_]\w*)\s*->\s*(.+)$/);
  if (arrowM) {
    const param = arrowM[1], body = arrowM[2];
    return (x) => { const e = { ...env, [param]: x }; return evalExpr(body, e); };
  }
  // Multi-param arrow: (a, b) -> expr
  const arrowMP = expr.match(/^\(([^)]*)\)\s*->\s*(.+)$/);
  if (arrowMP) {
    const params = arrowMP[1].split(',').map(s => s.trim()).filter(Boolean), body = arrowMP[2];
    return (...xs) => { const e = { ...env }; params.forEach((p,i) => e[p] = xs[i]); return evalExpr(body, e); };
  }

  // Use Function constructor to safely evaluate — build a scope
  const keys = Object.keys(env).filter(k => /^[a-zA-Z_]\w*$/.test(k));
  const vals = keys.map(k => env[k]);

  // Translate Ezra operators to JS
  let js = expr
    .replace(/\*\*/g, '**')
    .replace(/\bis not\b/g, '!==')
    .replace(/\bis\b/g, '===')
    .replace(/\band\b/g, '&&')
    .replace(/\bor\b/g, '||')
    .replace(/\bnot\b/g, '!')
    .replace(/\byes\b/g, 'true')
    .replace(/\bno\b/g, 'false')
    .replace(/\bnothing\b/g, 'null');

  // String with interpolation
  if (/^".*"$/.test(expr)) {
    const raw = expr.slice(1, -1);
    return interpolate(raw, env);
  }

  // Replace method calls: .filter(n -> ...) etc
  js = js.replace(/\.filter\((\w+)\s*->\s*([^)]+)\)/g, (_, p, body) => {
    return `.filter(${p} => { try { return isTruthy(evalE("${body.replace(/"/g,"\\\"")}", {...env, ${p}: ${p}})); } catch{return false;} })`;
  });
  js = js.replace(/\.map\((\w+)\s*->\s*([^)]+)\)/g, (_, p, body) => {
    return `.map(${p} => evalE("${body.replace(/"/g,"\\\"")}", {...env, ${p}: ${p}}))`;
  });

  try {
    const fn = new Function('env', 'isTruthy', 'evalE', 'fmt', ...keys,
      `"use strict"; try { return (${js}); } catch(e) { throw e; }`
    );
    return fn(env, isTruthy, evalExpr, fmt, ...vals);
  } catch (e) {
    throw new Error(e.message.replace('is not defined', 'undefined variable'));
  }
}

/* ── Method calls on values ── */
function callMethod(obj, name, args) {
  if (Array.isArray(obj)) {
    switch(name) {
      case 'length': return obj.length;
      case 'push':   return [...obj, args[0]];
      case 'pop':    return obj.slice(0,-1);
      case 'sort':   { const r=[...obj]; r.sort((a,b)=>typeof a==='number'?a-b:String(a).localeCompare(String(b))); return r; }
      case 'reverse':return [...obj].reverse();
      case 'sum':    return obj.reduce((a,v)=>a+(typeof v==='number'?v:0),0);
      case 'avg': case 'mean': { const s=obj.reduce((a,v)=>a+(typeof v==='number'?v:0),0); return obj.length?s/obj.length:0; }
      case 'min':    return Math.min(...obj.filter(v=>typeof v==='number'));
      case 'max':    return Math.max(...obj.filter(v=>typeof v==='number'));
      case 'first':  return obj[0]??null;
      case 'last':   return obj[obj.length-1]??null;
      case 'contains': return obj.includes(args[0]);
      case 'join':   return obj.map(fmt).join(args[0]??',');
      case 'take':   return obj.slice(0, args[0]);
      case 'drop':   return obj.slice(args[0]);
      case 'filter': { const fn=args[0]; return typeof fn==='function'?obj.filter(fn):obj; }
      case 'map':    { const fn=args[0]; return typeof fn==='function'?obj.map(fn):obj; }
      case 'reduce': { const fn=args[0],init=args[1]; return typeof fn==='function'?obj.reduce(fn,init):obj; }
      case 'is_empty': return obj.length===0;
      default: throw new Error('unknown list method `'+name+'`');
    }
  }
  if (typeof obj === 'string') {
    switch(name) {
      case 'upper':  return obj.toUpperCase();
      case 'lower':  return obj.toLowerCase();
      case 'trim':   return obj.trim();
      case 'length': return obj.length;
      case 'split':  return obj.split(args[0]??'');
      case 'contains': return obj.includes(args[0]);
      case 'starts_with': return obj.startsWith(args[0]);
      case 'ends_with': return obj.endsWith(args[0]);
      case 'replace': return obj.replaceAll(args[0],args[1]??'');
      case 'find':   return obj.indexOf(args[0]);
      case 'chars':  return [...obj];
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
  throw new Error('cannot call method `'+name+'` on '+typeof obj);
}

/* ── Built-in functions ── */
function makeBuiltins(out) {
  return {
    say:    v => { out.push({t:'out',v:fmt(v??'')});  return null; },
    write:  v => { out.push({t:'out',v:fmt(v??'')}); return null; },
    warn:   v => { out.push({t:'warn',v:'warning: '+fmt(v)}); return null; },
    fail:   v => { out.push({t:'err',v:'error: '+fmt(v)}); return null; },
    len:    v => Array.isArray(v)?v.length:typeof v==='string'?v.length:typeof v==='object'&&v?Object.keys(v).length:0,
    range:  (a,b,step=1) => { const r=[]; if(b===undefined){b=a;a=0;} for(let i=a;step>0?i<b:i>b;i+=step)r.push(i); return r; },
    type_of: v => v===null?'nothing':Array.isArray(v)?'list':typeof v==='boolean'?'bool':typeof v,
    text:   v => fmt(v),
    number: v => { const n=Number(v); return isNaN(n)?null:n; },
    bool:   v => isTruthy(v),
    abs:    v => Math.abs(v),
    sqrt:   v => Math.sqrt(v),
    floor:  v => Math.floor(v),
    ceil:   v => Math.ceil(v),
    round:  v => Math.round(v),
    min:    (a,b) => Math.min(a,b),
    max:    (a,b) => Math.max(a,b),
    pow:    (a,b) => Math.pow(a,b),
    sin:    v => Math.sin(v),
    cos:    v => Math.cos(v),
    keys:   v => v&&typeof v==='object'&&!Array.isArray(v)?Object.keys(v):[],
    values: v => v&&typeof v==='object'&&!Array.isArray(v)?Object.values(v):[],
    is_number: v => typeof v==='number',
    is_text:   v => typeof v==='string',
    is_bool:   v => typeof v==='boolean',
    is_list:   v => Array.isArray(v),
    is_nothing: v => v===null||v===undefined,
    parse_json: s => { try{return JSON.parse(s);}catch(e){throw new Error('invalid JSON: '+e.message);} },
    stringify_json: v => JSON.stringify(v),
    input:  p => { return prompt(p??'') ?? ''; },
    input_number: p => { const s=prompt(p??'')??''; const n=parseFloat(s); if(isNaN(n))throw new Error('invalid number: `'+s+'`'); return n; },
  };
}

/* ── Statement executor ── */
class EzraRuntime {
  constructor() {
    this.output = [];
    this.builtins = makeBuiltins(this.output);
  }

  run(source) {
    this.output = [];
    this.builtins = makeBuiltins(this.output);
    const lines = source.split('\n');
    const env = { ...this.builtins };
    this._exec(lines, 0, 0, env);
    return this.output;
  }

  _getIndent(line) { return line.match(/^(\s*)/)[1].length; }
  _trim(line) { return line.trimStart(); }

  _collectBlock(lines, start, minIndent) {
    const block = [];
    let i = start;
    while (i < lines.length) {
      const line = lines[i];
      if (line.trim() === '' || line.trim().startsWith('#')) { i++; continue; }
      if (this._getIndent(line) < minIndent) break;
      block.push({ line, idx: i });
      i++;
    }
    return { block, end: i };
  }

  _execBlock(lines, start, minIndent, env) {
    return this._exec(lines, start, minIndent, env);
  }

  _exec(lines, start, minIndent, env) {
    let i = start;
    while (i < lines.length) {
      const raw = lines[i];
      if (raw.trim() === '' || raw.trim().startsWith('#') || raw.trim().startsWith('//')) { i++; continue; }
      const ind = this._getIndent(raw);
      if (ind < minIndent) break;
      const line = raw.trim();

      // ── say / write / warn / fail / debug
      if (/^(say|write|warn|fail|debug)\s+/.test(line)) {
        const [cmd, ...rest] = line.split(/\s+/);
        const argStr = line.slice(cmd.length).trim();
        const v = this._evalLine(argStr, env);
        if (cmd === 'say' || cmd === 'write') this.output.push({t:'out', v:fmt(v)});
        else if (cmd === 'warn') this.output.push({t:'warn', v:'warning: '+fmt(v)});
        else if (cmd === 'fail') this.output.push({t:'err', v:'error: '+fmt(v)});
        else if (cmd === 'debug') this.output.push({t:'info', v:'debug: '+fmt(v)});
        i++; continue;
      }

      // ── assert
      if (line.startsWith('assert ')) {
        const parts = line.slice(7).split(',');
        const cond = this._evalLine(parts[0].trim(), env);
        if (!isTruthy(cond)) {
          const msg = parts[1] ? fmt(this._evalLine(parts[1].trim(), env)) : 'assertion failed';
          throw new Error(msg);
        }
        i++; continue;
      }

      // ── throw
      if (line.startsWith('throw ')) {
        throw new Error(fmt(this._evalLine(line.slice(6).trim(), env)));
      }

      // ── return / ->
      if (line.startsWith('return ') || line.startsWith('-> ')) {
        const val = this._evalLine(line.replace(/^(return|->)\s+/, ''), env);
        throw { __return: true, value: val };
      }

      // ── break / next
      if (line === 'break') throw { __break: true };
      if (line === 'next')  throw { __next: true };

      // ── give (function definition)
      const fnM = line.match(/^give\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)$/);
      if (fnM) {
        const fnName = fnM[1];
        const params = fnM[2].split(',').map(s => s.trim()).filter(Boolean);
        i++;
        const bodyIndent = i < lines.length ? this._getIndent(lines[i]) : ind + 2;
        const bodyStart = i;
        while (i < lines.length && (lines[i].trim() === '' || this._getIndent(lines[i]) >= bodyIndent)) i++;
        const bodyLines = lines.slice(bodyStart, i);
        const self = this;
        env[fnName] = (...args) => {
          const fnEnv = { ...env };
          params.forEach((p, idx) => fnEnv[p] = args[idx]);
          try { self._exec(bodyLines, 0, 0, fnEnv); return null; }
          catch(e) { if (e?.__return) return e.value; throw e; }
        };
        continue;
      }

      // ── let / const declaration
      const declM = line.match(/^(?:let|const)\s+([a-zA-Z_]\w*)(?:\s*:\s*\w+)?\s+is\s+(.+)$/);
      if (declM) { env[declM[1]] = this._evalLine(declM[2], env); i++; continue; }

      // ── compound assignment
      const compM = line.match(/^([a-zA-Z_]\w*)\s*(\+=|-=|\*=|\/=|%=)\s*(.+)$/);
      if (compM) {
        const [, varN, op, rhs] = compM;
        const cur = env[varN] ?? 0, val = this._evalLine(rhs, env);
        env[varN] = op==='+='?cur+val:op==='-='?cur-val:op==='*='?cur*val:op==='/='?cur/val:cur%val;
        i++; continue;
      }

      // ── assignment: name is expr (but not check if / for each / while)
      const assignM = line.match(/^([a-zA-Z_]\w*)\s+is\s+(.+)$/);
      if (assignM && !line.startsWith('check') && !line.startsWith('for') && !line.startsWith('while')) {
        env[assignM[1]] = this._evalLine(assignM[2], env);
        i++; continue;
      }

      // ── check if
      if (line.startsWith('check if ')) {
        const cond = this._evalLine(line.slice(9), env);
        i++;
        const blockInd = i < lines.length ? Math.max(this._getIndent(lines[i]), ind+2) : ind+2;
        const thenStart = i;
        while (i < lines.length && lines[i].trim() !== '' && this._getIndent(lines[i]) >= blockInd) i++;
        const thenEnd = i;
        if (isTruthy(cond)) {
          this._exec(lines, thenStart, blockInd, { ...env });
          Object.assign(env, this._execGetEnv(lines, thenStart, blockInd, env));
        }
        // skip otherwise blocks if taken, or execute if not
        while (i < lines.length) {
          const nextLine = lines[i].trim();
          if (nextLine.startsWith('otherwise if ')) {
            const c2 = this._evalLine(nextLine.slice(13), env);
            i++;
            const bi2 = i < lines.length ? Math.max(this._getIndent(lines[i]), ind+2) : ind+2;
            const st2 = i;
            while (i < lines.length && lines[i].trim() !== '' && this._getIndent(lines[i]) >= bi2) i++;
            if (!isTruthy(cond)) {
              if (isTruthy(c2)) {
                Object.assign(env, this._execGetEnv(lines, st2, bi2, env));
                break;
              }
            }
          } else if (nextLine === 'otherwise') {
            i++;
            const bi3 = i < lines.length ? Math.max(this._getIndent(lines[i]), ind+2) : ind+2;
            const st3 = i;
            while (i < lines.length && lines[i].trim() !== '' && this._getIndent(lines[i]) >= bi3) i++;
            if (!isTruthy(cond)) Object.assign(env, this._execGetEnv(lines, st3, bi3, env));
            break;
          } else break;
        }
        continue;
      }

      // ── while
      if (line.startsWith('while ')) {
        const condStr = line.slice(6).trim();
        i++;
        const bi = i < lines.length ? Math.max(this._getIndent(lines[i]), ind+2) : ind+2;
        const loopStart = i;
        while (i < lines.length && (lines[i].trim() === '' || this._getIndent(lines[i]) >= bi)) i++;
        const loopLines = lines.slice(loopStart, i);
        let iters = 0;
        while (isTruthy(this._evalLine(condStr, env)) && iters++ < 1000) {
          try { Object.assign(env, this._execGetEnv(loopLines, 0, 0, env)); }
          catch(e) { if(e?.__break)break; if(e?.__next)continue; throw e; }
        }
        if (iters >= 1000) this.output.push({t:'warn', v:'warning: loop limit (1000) reached'});
        continue;
      }

      // ── for each
      const forM = line.match(/^for each\s+([a-zA-Z_]\w*)\s+in\s+(.+)$/);
      if (forM) {
        const [, varN, listExpr] = forM;
        const list = this._evalLine(listExpr, env);
        i++;
        const bi = i < lines.length ? Math.max(this._getIndent(lines[i]), ind+2) : ind+2;
        const loopStart = i;
        while (i < lines.length && (lines[i].trim() === '' || this._getIndent(lines[i]) >= bi)) i++;
        const loopLines = lines.slice(loopStart, i);
        if (Array.isArray(list)) {
          for (const item of list.slice(0,500)) {
            const loopEnv = { ...env, [varN]: item };
            try { Object.assign(env, this._execGetEnv(loopLines, 0, 0, loopEnv)); env[varN] = loopEnv[varN]; }
            catch(e) { if(e?.__break)break; if(e?.__next)continue; throw e; }
          }
        }
        continue;
      }

      // ── try / catch / finally
      if (line === 'try') {
        i++;
        const bi = i < lines.length ? Math.max(this._getIndent(lines[i]), ind+2) : ind+2;
        const tryStart = i;
        while (i < lines.length && (lines[i].trim() === '' || this._getIndent(lines[i]) >= bi)) i++;
        const tryLines = lines.slice(tryStart, i);
        let caught = false, errVal = null;
        try { Object.assign(env, this._execGetEnv(tryLines, 0, 0, env)); }
        catch(e) {
          if (e?.__return || e?.__break || e?.__next) throw e;
          caught = true; errVal = e.message || String(e);
          while (i < lines.length && (lines[i].trim() === '' || this._getIndent(lines[i]) >= bi)) i++;
        }
        if (lines[i]?.trim().startsWith('catch')) {
          const catchVar = lines[i].trim().match(/^catch\s+([a-zA-Z_]\w*)/)?.[1];
          i++;
          const cbi = i < lines.length ? Math.max(this._getIndent(lines[i]), ind+2) : ind+2;
          const catchStart = i;
          while (i < lines.length && (lines[i].trim() === '' || this._getIndent(lines[i]) >= cbi)) i++;
          if (caught) {
            const catchEnv = { ...env };
            if (catchVar) catchEnv[catchVar] = errVal;
            Object.assign(env, this._execGetEnv(lines.slice(catchStart, i), 0, 0, catchEnv));
          }
        }
        if (lines[i]?.trim() === 'finally') {
          i++;
          const fbi = i < lines.length ? Math.max(this._getIndent(lines[i]), ind+2) : ind+2;
          const finStart = i;
          while (i < lines.length && (lines[i].trim() === '' || this._getIndent(lines[i]) >= fbi)) i++;
          Object.assign(env, this._execGetEnv(lines.slice(finStart, i), 0, 0, env));
        }
        continue;
      }

      // ── bare expression (function call / say etc)
      try { this._evalLine(line, env); } catch(e) { if(e?.__return||e?.__break||e?.__next) throw e; }
      i++;
    }
    return i;
  }

  _execGetEnv(lines, start, minInd, env) {
    const e = { ...env };
    try { this._exec(lines, start, minInd, e); } catch(err) { if(err?.__return||err?.__break||err?.__next) throw err; throw err; }
    return e;
  }

  _evalLine(expr, env) {
    expr = expr.trim();
    if (!expr) return null;

    // property / method call chain: obj.method(args)
    // Handle "say expr" appearing as expression — shouldn't happen but safe
    if (expr.startsWith('"') || expr.startsWith("'")) {
      const s = expr.slice(1, -1);
      return interpolate(s, env);
    }

    // Build scope for eval
    const builtinNames = Object.keys(this.builtins);
    const envNames = Object.keys(env).filter(k => /^[a-zA-Z_]\w*$/.test(k));
    const allNames = [...new Set([...builtinNames, ...envNames])];
    const allVals = allNames.map(k => env[k] !== undefined ? env[k] : this.builtins[k]);

    // Translate Ezra → JS
    let js = this._translate(expr, env);

    try {
      const fn = new Function(
        'callMethod', 'isTruthy', 'fmt', 'interpolate', 'evalE',
        ...allNames,
        '"use strict"; return (' + js + ');'
      );
      return fn(callMethod, isTruthy, fmt, interpolate, (e, ev) => this._evalLine(e, ev), ...allVals);
    } catch(e) {
      throw new Error(e.message);
    }
  }

  _translate(expr, env) {
    let js = expr;

    // string literals with interpolation
    js = js.replace(/"((?:[^"\\]|\\.)*)"/g, (_, s) => {
      const interpolated = interpolate(s, env);
      return JSON.stringify(interpolated);
    });

    // Ezra keywords → JS
    js = js.replace(/\*\*/g, '**');
    js = js.replace(/\bis not\b/g, '!==');
    js = js.replace(/\bis\b(?!\s*\w+\s*\()/g, '===');
    js = js.replace(/\band\b/g, '&&');
    js = js.replace(/\bor\b/g, '||');
    js = js.replace(/\bnot\b/g, '!');
    js = js.replace(/\byes\b/g, 'true');
    js = js.replace(/\bno\b/g, 'false');
    js = js.replace(/\bnothing\b/g, 'null');

    // list methods with arrow functions: .filter(n -> expr)
    js = js.replace(/\.(filter|map|any|all)\((\w+)\s*->\s*([^)]+)\)/g, (_, method, p, body) => {
      const jsbody = this._translate(body, { ...env, [p]: null });
      return `.${method}(${p} => ${jsbody})`;
    });
    // .reduce((a,b) -> expr, init)
    js = js.replace(/\.reduce\(\((\w+),\s*(\w+)\)\s*->\s*([^,)]+),\s*([^)]+)\)/g, (_, a, b, body, init) => {
      const jsbody = this._translate(body, env);
      const jsinit = this._translate(init, env);
      return `.reduce((${a},${b}) => ${jsbody}, ${jsinit})`;
    });
    // method calls: .method() or .method(args)
    js = js.replace(/\.(\w+)\(([^)]*)\)/g, (_, method, args) => {
      if (['filter','map','reduce','any','all'].some(m => method === m)) return _.toString(); // already handled
      const argsJs = args ? this._translate(args, env) : '';
      return `.__m("${method}", [${argsJs}])`;
    });
    // .property access
    js = js.replace(/\.(\w+)(?!\s*\()/g, (_, prop) => `.__p("${prop}")`);

    // Wrap identifiers that are objects/arrays to have .__m and .__p
    // Actually, handle method dispatch differently — pass through callMethod
    // Replace .__m and .__p with callMethod calls
    js = js.replace(/(\w+)\.__m\("(\w+)",\s*\[(.*?)\]\)/g, (_, obj, method, args) => {
      return `callMethod(${obj}, "${method}", [${args}])`;
    });
    js = js.replace(/(\w+)\.__p\("(\w+)"\)/g, (_, obj, prop) => {
      return `(Array.isArray(${obj})&&"${prop}"==="length"?${obj}.length:typeof ${obj}==="string"&&"${prop}"==="length"?${obj}.length:typeof ${obj}==="object"&&${obj}?${obj}["${prop}"]:callMethod(${obj},"${prop}",[]))`;
    });

    return js;
  }
}

/* ═══════════════════════════════════════════════════════════════
   React UI
═══════════════════════════════════════════════════════════════ */
export default function PlaygroundPage() {
  const [code, setCode] = useState(EXAMPLES['Hello World']);
  const [output, setOutput] = useState([]);
  const [running, setRunning] = useState(false);
  const [example, setExample] = useState('Hello World');
  const textareaRef = useRef(null);
  const runtimeRef = useRef(null);

  const getRuntime = () => {
    if (!runtimeRef.current) runtimeRef.current = new EzraRuntime();
    return runtimeRef.current;
  };

  const run = useCallback(() => {
    setRunning(true);
    setOutput([]);
    setTimeout(() => {
      try {
        const rt = getRuntime();
        const result = rt.run(code);
        setOutput(result.length ? result : [{ t: 'info', v: '(no output)' }]);
      } catch (e) {
        setOutput([{ t: 'err', v: 'error: ' + (e.message || String(e)) }]);
      }
      setRunning(false);
    }, 10);
  }, [code]);

  const handleKey = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = textareaRef.current;
      const start = ta.selectionStart, end = ta.selectionEnd;
      const updated = code.slice(0, start) + '  ' + code.slice(end);
      setCode(updated);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 2; });
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); }
  };

  const lineNums = code.split('\n').map((_, i) => i + 1);

  return (
    <>
      {/* Page header */}
      <div style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)', padding: '3rem 1.5rem 2.5rem', marginTop: '64px' }}>
        <div className="container" style={{ maxWidth: 960 }}>
          <h1 style={{ marginBottom: '0.5rem' }}>Playground</h1>
          <p style={{ color: 'var(--text-3)', marginBottom: 0 }}>
            Write and run Ezra code directly in your browser.{' '}
            <a href="/download">Download Ezra</a> for the complete language experience.
          </p>
        </div>
      </div>

      <section style={{ padding: '2rem 1.5rem 4rem' }}>
        <div className="container" style={{ maxWidth: 1100 }}>

          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-3)', fontWeight: 600 }}>Examples:</span>
              <select
                value={example}
                onChange={e => { setExample(e.target.value); setCode(EXAMPLES[e.target.value]); setOutput([]); }}
                style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border-dark)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.65rem', fontSize: '0.85rem', fontFamily: 'var(--font)', cursor: 'pointer' }}
              >
                {Object.keys(EXAMPLES).map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                onClick={() => { setOutput([]); }}
                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.85rem', fontSize: '0.82rem', cursor: 'pointer', color: 'var(--text-3)', fontFamily: 'var(--font)' }}
              >
                Clear
              </button>
              <button
                onClick={run}
                disabled={running}
                style={{ background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '0.5rem 1.4rem', fontSize: '0.9rem', fontWeight: 700, cursor: running ? 'not-allowed' : 'pointer', opacity: running ? 0.7 : 1, fontFamily: 'var(--font)', transition: 'all 0.15s', boxShadow: '0 2px 8px rgba(232,96,10,0.25)' }}
              >
                {running ? '⏳ Running…' : '▶  Run'}
              </button>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Ctrl+Enter</span>
            </div>
          </div>

          {/* Editor + Output */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: '1px solid #30363d', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>

            {/* Editor panel */}
            <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid #30363d' }}>
              <div style={{ background: '#161b22', padding: '0.55rem 1rem', borderBottom: '1px solid #30363d', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e', display: 'inline-block' }} />
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
                <span style={{ marginLeft: '0.5rem', fontSize: '0.78rem', color: '#8b949e', fontFamily: 'var(--mono)' }}>main.ez</span>
              </div>
              <div style={{ display: 'flex', flex: 1, minHeight: 420 }}>
                {/* Line numbers */}
                <div style={{ background: '#0d1117', padding: '1.25rem 0.75rem 1.25rem 1rem', fontFamily: 'var(--mono)', fontSize: '0.875rem', lineHeight: 1.7, color: '#4a5568', textAlign: 'right', userSelect: 'none', minWidth: '2.5rem', borderRight: '1px solid #21262d', flexShrink: 0 }}>
                  {lineNums.map(n => <div key={n}>{n}</div>)}
                </div>
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  onKeyDown={handleKey}
                  spellCheck={false}
                  autoCapitalize="none"
                  autoCorrect="off"
                  style={{ flex: 1, background: '#0d1117', color: '#e6edf3', border: 'none', outline: 'none', resize: 'none', fontFamily: 'var(--mono)', fontSize: '0.875rem', lineHeight: 1.7, padding: '1.25rem 1.5rem', width: '100%', tabSize: 2 }}
                  placeholder="Write Ezra code here…"
                />
              </div>
            </div>

            {/* Output panel */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ background: '#161b22', padding: '0.55rem 1rem', borderBottom: '1px solid #30363d', fontSize: '0.78rem', color: '#8b949e', fontFamily: 'var(--mono)' }}>
                Output
              </div>
              <div style={{ flex: 1, background: '#0d1117', padding: '1.25rem 1.5rem', fontFamily: 'var(--mono)', fontSize: '0.875rem', lineHeight: 1.7, overflowY: 'auto', minHeight: 420, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {output.length === 0
                  ? <span style={{ color: '#4a5568' }}>Press ▶ Run to execute your code…</span>
                  : output.map((line, i) => (
                    <div key={i} style={{ color: line.t === 'err' ? '#f85149' : line.t === 'warn' ? '#ffa657' : line.t === 'info' ? '#8b949e' : '#e6edf3', marginBottom: '1px' }}>
                      {line.v}
                    </div>
                  ))
                }
              </div>
            </div>
          </div>

          {/* Note */}
          <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-3)', lineHeight: 1.6 }}>
            ⚠ The browser playground runs a JavaScript-based Ezra interpreter and supports most core features.
            Some advanced features (file I/O, modules, LSP) require the native binary.{' '}
            <a href="/download">Download Ezra</a> for the full language.
          </p>

          {/* Cheat sheet */}
          <details style={{ marginTop: '2rem' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: 'var(--brand)', userSelect: 'none', padding: '0.5rem 0' }}>
              Quick reference — supported features ▾
            </summary>
            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1rem' }}>
              {[
                ['Variables', 'name is "Ankur"\nconst PI is 3.14'],
                ['Arithmetic', '2 + 3 * 4\n2 ** 10 (power)\nx % 3 (modulo)'],
                ['Conditions', 'check if x > 0\n  say "pos"\notherwise\n  say "neg"'],
                ['Loops', 'while i < 10\n  i += 1\nfor each n in list\n  say n'],
                ['Functions', 'give add(a, b)\n  -> a + b\nsay add(3, 4)'],
                ['Lists', 'nums is [1,2,3]\nnums.sort()\nnums.filter(n -> n>1)'],
                ['Error handling', 'try\n  throw "err"\ncatch e\n  say e'],
                ['String methods', '"hello".upper()\n"hi".contains("h")\n"a,b".split(",")'],
                ['Builtins', 'len(list)\nrange(10)\ntype_of(x)\nparse_json(s)'],
              ].map(([title, code]) => (
                <div key={title} style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ padding: '0.5rem 0.75rem', background: 'var(--bg)', borderBottom: '1px solid var(--border)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--brand)' }}>{title}</div>
                  <pre style={{ margin: 0, padding: '0.75rem', fontSize: '0.78rem', background: 'transparent', border: 'none', borderRadius: 0, color: 'var(--text-2)', lineHeight: 1.65 }}>{code}</pre>
                </div>
              ))}
            </div>
          </details>
        </div>
      </section>

      <style jsx global>{`
        @media (max-width: 768px) {
          .playground-grid-inner {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
