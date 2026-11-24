"use strict";(()=>{var tT=Object.create;var an=Object.defineProperty;var rT=Object.getOwnPropertyDescriptor;var oT=Object.getOwnPropertyNames;var nT=Object.getPrototypeOf,iT=Object.prototype.hasOwnProperty;var sT=(t,e,r)=>e in t?an(t,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[e]=r;var ae=(t,e)=>()=>(t&&(e=t(t=0)),e);var y=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports),as=(t,e)=>{for(var r in e)an(t,r,{get:e[r],enumerable:!0})},df=(t,e,r,o)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of oT(e))!iT.call(t,n)&&n!==r&&an(t,n,{get:()=>e[n],enumerable:!(o=rT(e,n))||o.enumerable});return t};var ct=(t,e,r)=>(r=t!=null?tT(nT(t)):{},df(e||!t||!t.__esModule?an(r,"default",{value:t,enumerable:!0}):r,t)),er=t=>df(an({},"__esModule",{value:!0}),t);var S=(t,e,r)=>sT(t,typeof e!="symbol"?e+"":e,r);function Fl(){}var tr,ln,cn,cs=ae(()=>{tr=class{constructor(){this._next=null,this._prev=null,this._next=this,this._prev=this}isDisposed(){return!this._next}_insertBefore(e,r){let o=e._prev;o._next=r,e._prev=r,r._prev=o,r._next=e}_removeNode(e){e._prev&&(e._prev._next=e._next,e._next._prev=e._prev),e._prev=e._next=null}_disposeList(){let e=this,r=e._next;for(;r!==null;)e._next=e._prev=null,e=r,r=e._next}},ln=class extends tr{constructor(){super(...arguments),this._changeCB=Fl,this._changeCBContext=void 0}addListener(e,r){return new cn(this,e,r)}emit(...e){cn.callAll(this._next,this,e)}setChangeCB(e,r){this._changeCB=e||Fl,this._changeCBContext=r}_triggerChangeCB(){this._changeCB.call(this._changeCBContext,this.hasListeners())}hasListeners(){return this._next!==this}dispose(){this._disposeList(),this._changeCB=Fl,this._changeCBContext=void 0}},cn=class extends tr{static callAll(e,r,o){for(;e!==r;){let n=e;n.callback.call(n.context,...o),e=n._next}}constructor(e,r,o){super(),this.emitter=e,this.callback=r,this.context=o,this._insertBefore(e,this),e._triggerChangeCB()}dispose(){this.isDisposed()||(this._removeNode(this),this.emitter._triggerChangeCB())}}});function Mt(t,e){return t&&t.autoDispose(e),e}function Il(t){return t&&t.constructor&&t.constructor.name?t.constructor.name:""+t}var mf,un,Me,_t,qe,Cl,us,io=ae(()=>{cs();mf={autoDispose(t){}},un=mf,Me=class{static create(e,...r){let o=un,n=new _t;try{return un=n,Mt(e,new this(...r))}catch(i){try{n.clear()}catch(s){console.error("Error disposing partially constructed %s:",this.name,s)}throw i}finally{n.release(),un=o}}constructor(){this._disposalList=new Cl,un.autoDispose(this),un=mf}autoDispose(e){return this.onDispose(e.dispose,e),e}onDispose(e,r){return this._disposalList.addListener(e,r)}wipeOnDispose(){this.onDispose(this._wipeOutObject,this)}isDisposed(){return this._disposalList===null}dispose(){let e=this._disposalList;e?(this._disposalList=null,e.callAndDispose(this)):console.error("Error disposing %s which is already disposed",Il(this))}_wipeOutObject(){for(let e of Object.keys(this))this[e]=null}},_t=class t{constructor(){this._owned=null,this._disposalListener=void 0}static create(e){return Mt(e,new t)}autoDispose(e){return this.clear(),this._owned=e,e instanceof Me&&(this._disposalListener=e.onDispose(this._onOutsideDispose,this)),e}release(){this._unlisten();let e=this._owned;return this._owned=null,e}clear(){this._unlisten();let e=this._owned;e&&(this._owned=null,e.dispose())}get(){return this._owned}isEmpty(){return!this._owned}dispose(){this.clear()}_unlisten(){let e=this._disposalListener;e&&(this._disposalListener=void 0,e.dispose())}_onOutsideDispose(){this._disposalListener=void 0,this._owned=null}},qe=class extends Me{};Cl=class extends tr{constructor(){super()}addListener(e,r){let o=new us(e,r);return this._insertBefore(this._next,o),o}callAndDispose(e){try{us.callAll(this._next,this,e)}finally{this._disposeList()}}},us=class extends tr{static callAll(e,r,o){for(;e!==r;){let n=e;try{n.callback.call(n.context)}catch(i){console.error("While disposing %s, error disposing %s: %s",Il(o),Il(this),i)}e=n._next}}constructor(e,r){super(),this.callback=e,this.context=r}dispose(){this.isDisposed()||this._removeNode(this)}}});var ps,gf=ae(()=>{ps=class{constructor(e){this._isPrior=e,this._items=[]}get size(){return this._items.length}push(e){let r=this._items,o=this._isPrior,n=this._items.length;for(;n>0;){let i=n-1>>1,s=r[i];if(o(s,e))break;r[n]=s,n=i}r[n]=e}peek(){return this._items[0]}pop(){if(this._items.length<=1)return this._items.pop();let e=this._items,r=this._isPrior,o=e[0],n=e.pop(),i=this._items.length,s=0,l=1;for(;l<i;){let c=l+1,p=c<i&&r(e[c],e[l])?c:l;if(r(n,e[p]))break;e[s]=e[p],s=p,l=s+s+1}return e[s]=n,o}}});function fs(){if(pn===0&&ds.size>0){pn++;try{do{let t=ds.pop();Al.push(t),t.recompute()}while(ds.size>0)}finally{for(let t of Al)t._enqueued=!1;Al.length=0,pn--}}}function St(t){try{return pn++,t()}finally{pn--,fs()}}var dn,ds,uT,Al,pn,ms=ae(()=>{gf();dn=class{static isPrioritySmaller(e,r){return e._priority<r._priority||e._priority===r._priority&&e._creation<r._creation}constructor(e,r){this._priority=0,this._enqueued=!1,this._creation=++uT,this._callback=e,this._context=r}useDep(e){let r=e?e._priority:0;r>=this._priority&&(this._priority=r+1)}recompute(){this._priority=0,this._callback.call(this._context)}enqueue(){this._enqueued||(this._enqueued=!0,ds.push(this))}},ds=new ps(dn.isPrioritySmaller),uT=0,Al=[],pn=0});function hf(t){return new I(t)}function pT(t){return I.holder(t)}var rr,I,kr=ae(()=>{ms();io();cs();ms();rr=class{constructor(e){this._onChange=new ln,this._value=e}get(){return this._value}set(e){e!==this._value&&this.setAndTrigger(e)}setAndTrigger(e){let r=this._value;this._value=e,this._onChange.emit(e,r),this._disposeOwned(),fs()}addListener(e,r){return this._onChange.addListener(e,r)}hasListeners(){return this._onChange.hasListeners()}setListenerChangeCB(e,r){this._onChange.setChangeCB(e,r)}_getDepItem(){return null}dispose(){this._disposeOwned(),this._onChange.dispose(),this._value=void 0}isDisposed(){return this._onChange.isDisposed()}_disposeOwned(e){}_setWithArg(e,r){let o=this._value;this._value=e,this._onChange.emit(e,o,r),this._disposeOwned(r),fs()}},I=class t extends rr{constructor(){super(...arguments),this._owned=void 0}static holder(e){let r=new t(e);return r._owned=e,r}static create(e,r){return Mt(e,new t(r))}autoDispose(e){return this.setAndTrigger(e),this._owned=e,e}_disposeOwned(){this._owned&&(this._owned.dispose(),this._owned=void 0)}}});function bf(t,e){let r=t.firstChild;for(;r;)bf(r,e),r=r.nextSibling;e(t)}function xf(t){let e=so.get(t);if(e){let r=t;do so.delete(r),e(t),r=e,e=so.get(r);while(e)}}function dT(t){bf(t,Br.disposeNode)}function Nt(t){Br.disposeRecursive(t)}function _r(t,e){let r=so.get(t);so.set(t,e),r&&so.set(e,r)}function Ol(t){return e=>_r(e,t)}function Et(t,e){e&&_r(t,()=>e.dispose())}function Dl(t){if(t)return e=>Et(e,t)}var so,Br,Rt=ae(()=>{so=new WeakMap;Br={disposeNode:xf,disposeRecursive:dT}});function hs(t){return yf.get(t)||yf.set(t,new gs(t)).get(t)}function mT(t,e){let r=vf.get(e);if(r)return r;let o=t.observable(e.get());return vf.set(e,o),e.addListener(n=>o(n)),o}function gT(t){if(wf)return;wf=!0;let e=t.utils.domNodeDisposal,r=e.cleanExternalData,o=Br.disposeRecursive;function n(s){r(s),Br.disposeNode(s)}function i(s){o(s),e.cleanExternalData=r;try{t.cleanNode(s)}finally{e.cleanExternalData=n}}e.cleanExternalData=n,Br.disposeRecursive=i}var yf,vf,gs,wf,Pl=ae(()=>{Rt();kr();yf=new WeakMap,vf=new WeakMap;gs=class extends I{constructor(e){super(e.peek()),this._koObs=e,this._koSub=null,this.setListenerChangeCB(r=>{r?this._koSub||(this._value=this._koObs.peek(),this._koSub=this._koObs.subscribe(o=>this.setAndTrigger(o))):(this._koSub.dispose(),this._koSub=null)})}get(){return this._koObs.peek()}set(e){St(()=>this._koObs(e))}dispose(){throw new Error("KoWrapObs should not be disposed")}};wf=!1});function et(...t){let e=t.pop();return new or(e,t)}var Tf,or,ao=ae(()=>{ms();Pl();Tf=[],or=class{constructor(e,r,o){this._depItem=new dn(this._evaluate,this),this._dependencies=r.length>0?r:Tf,this._depListeners=r.length>0?r.map(n=>this._subscribeTo(n)):Tf,this._dynDeps=new Map,this._callback=e,this._useFunc=this._useDependency.bind(this),o&&(this._useFunc.owner=o),this._evaluate()}dispose(){this._callback=null;for(let e of this._depListeners)e.dispose();for(let e of this._dynDeps.values())e.dispose()}_getDepItem(){return this._depItem}_useDependency(e){let r="_getDepItem"in e?e:hs(e),o=this._dynDeps.get(r);return o||(o=this._subscribeTo(r),this._dynDeps.set(r,o)),o._inUse=!0,this._depItem.useDep(r._getDepItem()),r.get()}_evaluate(){if(this._callback!==null)try{let e=[this._useFunc];for(let r=0,o=this._dependencies.length;r<o;r++)e[r+1]=this._dependencies[r].get(),this._depItem.useDep(this._dependencies[r]._getDepItem());return this._callback.apply(void 0,e)}finally{this._dynDeps.forEach((e,r)=>{e._inUse?e._inUse=!1:(this._dynDeps.delete(r),e.dispose())})}}_subscribeTo(e){return("_getDepItem"in e?e:hs(e)).addListener(this._enqueue,this)}_enqueue(){this._depItem.enqueue()}}});function hT(){throw new Error("Can't write to non-writable computed")}function Ll(...t){let e=t.pop();return new ue(e,t)}var ue,Ml=ae(()=>{io();kr();ao();ue=class t extends I{static create(e,...r){let o=r.pop();return Mt(e,new t(o,r))}constructor(e,r){super(void 0),this._callback=e,this._write=hT,this._sub=new or(this._read.bind(this),r,this)}_getDepItem(){return this._sub._getDepItem()}set(e){this._write(e)}onWrite(e){return this._write=e,this}dispose(){this._sub.dispose(),super.dispose()}_read(e,...r){super.set(this._callback(e,...r))}}});function kf(t,e){if(typeof t=="function"){let r=t;if(typeof r.peek=="function"){let n=r.subscribe(i=>e(i));return e(r.peek()),n}let o=Ll(t);return o.addListener(n=>e(n)),e(o.get()),o}return t instanceof rr?et(t,(r,o)=>e(o)):(e(t),null)}function _e(t,e,r){Et(t,kf(e,r))}var bs=ae(()=>{Ml();Rt();kr();ao()});function bT(t,e){t.DocumentFragment=e.DocumentFragment,t.Element=e.Element,t.Node=e.Node,t.document=e.document,t.window=e.window}var Bf,ye,lo=ae(()=>{Bf={};bT(Bf,typeof window<"u"?window:{});ye=Object.assign({},Bf)});function co(t,e){for(let r of Object.keys(e)){let o=e[r];o!=null&&o!==!1&&t.setAttribute(r,o===!0?"":o)}}function Nl(t){return e=>co(e,t)}function gn(t,e,r){r==null?t.removeAttribute(e):t.setAttribute(e,r)}function Rl(t,e){return r=>_e(r,e,o=>gn(r,t,o))}function ys(t,e,r){gn(t,e,r?"":null)}function $l(t,e){return r=>_e(r,e,o=>ys(r,t,o))}function Hl(t,e){t.appendChild(ye.document.createTextNode(e))}function zl(t){return e=>{let r=ye.document.createTextNode("");_e(e,t,o=>{r.nodeValue=o}),e.appendChild(r)}}function vs(t,e,r){t.style[e]=r}function ql(t,e){return r=>_e(r,e,o=>vs(r,t,o))}function ws(t,e,r){t[e]=r}function Vl(t,e){return r=>_e(r,e,o=>ws(r,t,o))}function Ts(t,e){t.style.display=e?"":"none"}function Gl(t){return e=>_e(e,t,r=>Ts(e,r))}function ks(t,e){t.style.display=e?"none":""}function Ul(t){return e=>_e(e,t,r=>ks(e,r))}function mn(t,e,r=!0){t.classList.toggle(e,!!r)}function Bs(t,e){return typeof t!="string"?_f("",t):!e||typeof e=="boolean"?r=>mn(r,t,e):r=>_e(r,e,o=>mn(r,t,o))}function uo(t,e,r){return typeof e!="string"?_f(t,e):Bs(t+e,r)}function _f(t,e){return r=>{let o=null;_e(r,e,n=>{o&&r.classList.remove(o),o=n?t+n:null,o&&r.classList.add(o)})}}function _s(t,e,r){let o=xs.get(t);o?o[e]=r:(_r(t,()=>xs.delete(t)),xs.set(t,{[e]:r}))}function Wl(t,e){return r=>_e(r,e,o=>_s(r,t,o))}function jl(t,e){let r=xs.get(t);return r&&r[e]}function Sr(t){return uo.bind(null,t)}var xs,xT,hn=ae(()=>{bs();Rt();lo();xs=new WeakMap;xT=t=>null});function bn(t,...e){return Xl(Sf(vT,t),e)}function Kl(t,...e){return Xl(Sf(wT,t),e)}function vT(t){return ye.document.createElement(t)}function wT(t){return ye.document.createElementNS("http://www.w3.org/2000/svg",t)}function Sf(t,e){let r,o,n,i=e.indexOf("."),s=e.indexOf("#");if(i===-1?i=e.length:n=e.substring(i+1).replace(/\./g," "),s===-1)r=e.substring(0,i);else{if(s>i)throw new Error(`ID must come before classes in dom("${e}")`);r=e.substring(0,s),o=e.substring(s+1,i)}let l=t(r);return o&&l.setAttribute("id",o),n&&l.setAttribute("class",n),l}function Yl(t,...e){return Zl(t,e)}function Zl(t,e){for(let r of e)Ef(t,r);return t}function Xl(t,e){try{return Zl(t,e)}catch(r){throw Nt(t),r}}function Ef(t,e){if(typeof e=="function"){let r=e(t);r!=null&&Ef(t,r)}else Array.isArray(e)?Zl(t,e):e==null||(e instanceof ye.Node?t.appendChild(e):typeof e=="object"?co(t,e):t.appendChild(ye.document.createTextNode(e)))}function Er(...t){let e=ye.document.createDocumentFragment();return Xl(e,t)}function Jl(t){return ye.document.querySelector(t)}function Ql(t){return ye.document.querySelectorAll(t)}var Fr=ae(()=>{Rt();hn();lo()});function nr(t,e,r){let o=t.parentNode;if(o){let n;for(let i=t.nextSibling;i&&i!==e;i=n)n=i.nextSibling,Nt(i),o.removeChild(i);r&&o.insertBefore(r instanceof ye.Node?r:Er(r),e)}}function xn(t,e=kT){let r=ye.document.createComment("a"),o=ye.document.createComment("b");return[r,o,n=>{_e(o,t,i=>nr(r,o,e(i)))}]}function po(t,e){let r=_t.create(null),[o,n,i]=xn(t,s=>e(qe.create(r),s));return Et(n,r),[o,n,i]}function kT(t){return t}function ec(t,e){return xn(t,r=>r?e(r):null)}function tc(t,e){return po(t,(r,o)=>o?e(r,o):null)}var yn=ae(()=>{bs();io();Rt();Fr();lo()});function rc(t,...e){return po(null,r=>{let o="create"in t?t.create(r,...e):t(r,...e);return o&&typeof o=="object"&&"buildDom"in o?o.buildDom():o})}var oc=ae(()=>{yn()});function ir(t=[]){return new Ss(t)}function ST(t){return Array.isArray(t.get())}function nc(t,e){return new Es(t,e)}function ET(t,e,r=0){return Mt(t,new Fs(e,r))}var vn,Ss,Es,Fs,ic=ae(()=>{io();kr();ao();vn=class extends rr{constructor(){super(...arguments),this._ownedItems=void 0}addListener(e,r){return super.addListener(e,r)}autoDispose(e){return this._ownedItems||(this._ownedItems=new Set),this._ownedItems.add(e),e}dispose(){if(this._ownedItems){for(let e of this.get())this._ownedItems.delete(e)&&e.dispose();this._ownedItems=void 0}super.dispose()}_setWithSplice(e,r){return this._setWithArg(e,r)}_disposeOwned(e){if(this._ownedItems)if(e)for(let r of e.deleted)this._ownedItems.delete(r)&&r.dispose();else{let r=this._ownedItems;this._ownedItems=new Set;for(let o of this.get())r.delete(o)&&this._ownedItems.add(o);for(let o of r)o.dispose()}}},Ss=class extends vn{push(...e){let r=this.get(),o=r.length,n=r.push(...e);return this._setWithSplice(r,{start:o,numAdded:e.length,deleted:[]}),n}pop(){let e=this.get();if(e.length===0)return;let r=e.pop();return this._setWithSplice(e,{start:e.length,numAdded:0,deleted:[r]}),r}unshift(...e){let r=this.get(),o=r.unshift(...e);return this._setWithSplice(r,{start:0,numAdded:e.length,deleted:[]}),o}shift(){let e=this.get();if(e.length===0)return;let r=e.shift();return this._setWithSplice(e,{start:0,numAdded:0,deleted:[r]}),r}splice(e,r=1/0,...o){let n=this.get(),i=n.length;e=Math.min(i,Math.max(0,e<0?i+e:e));let s=n.splice(e,r,...o);return this._setWithSplice(n,{start:e,numAdded:o.length,deleted:s}),s}};Es=class extends vn{constructor(e,r){super([]),this._mapper=r,this._sub=ST(e)?et(e,o=>this._syncMap(e)):et(e,(o,n)=>(o(n),this._syncMap(n)))}dispose(){this._unsync(),this._sub.dispose(),super.dispose()}_syncMap(e){this._source!==e?(this._unsync(),this._listener=e.addListener(this._recordChange,this),this._source=e,this._rebuild(e)):this._lastSplice?this._applySplice(e,this._lastSplice):this._rebuild(e),this._lastSplice=void 0}_unsync(){this._listener&&(this._listener.dispose(),this._listener=void 0,this._source=void 0)}_rebuild(e){this.set(e.get().map((r,o)=>this._mapper.call(void 0,r,o,this)))}_applySplice(e,r){let o=e.get(),n=[];for(let l=r.start,c=0;c<r.numAdded;l++,c++)n.push(this._mapper.call(void 0,o[l],l,this));let i=this.get(),s=i.splice(r.start,r.deleted.length,...n);this._setWithSplice(i,{start:r.start,numAdded:n.length,deleted:s})}_recordChange(e,r,o){o&&this._lastSplice===void 0?this._lastSplice=o:this._lastSplice=!1}};Fs=class extends I{constructor(e,r=0){super(null),this._obsArray=e,this._isLive=!0,this.set(r),this._listener=e.addListener(this._onArrayChange,this)}set(e){let r=this._obsArray.get().length;super.set(r===0?null:Math.max(0,Math.min(r-1,e||0)))}setLive(e){this._isLive=e}dispose(){this._listener.dispose(),super.dispose()}_onArrayChange(e,r,o){let n=this.get();this.set(n===null||!o?0:this._isLive&&n>=o.start+o.deleted.length?n+o.numAdded-o.deleted.length:this._isLive&&n>=o.start+o.numAdded?o.start+o.numAdded:n)}}});function sc(t,e){let r=ye.document.createComment("a"),o=ye.document.createComment("b");return[r,o,n=>{if(Array.isArray(t)){nr(r,o,t.map(e));return}let i=nc(t,e);Et(o,i),i.addListener((s,l,c)=>{if(c){for(let p of c.deleted)p&&p.parentNode===n&&(Nt(p),n.removeChild(p));if(c.numAdded>0){let p=c.start+c.numAdded,d=o;for(let x=p;x<s.length;x++){let B=s[x];if(B&&B.parentNode===n){d=B;break}}let h=Er(s.slice(c.start,p));n.insertBefore(h,d)}}else nr(r,o,s)}),nr(r,o,i.get())}]}var ac=ae(()=>{yn();Rt();Fr();ic();lo()});function IT(t,e,r){for(let o=t;o&&o!==e;o=o.parentElement)if(o.matches(r))return o;return null}function Cs(t,e,r,{useCapture:o=!1}={}){return new wn(t,e,r,o)}function lc(t,e,{useCapture:r=!1}={}){return o=>{new wn(o,t,e,r)}}function cc(t,e,r,o,{useCapture:n=!1}={}){return new Is(t,r,o,n,e)}function uc(t,e,r,{useCapture:o=!1}={}){return n=>{new Is(n,e,r,o,t)}}function Tn(t,e,r){return t.tabIndex>=0||t.setAttribute("tabindex","-1"),Cs(t,e,(o,n)=>{let i=r[o.key],s=i||r[o.key+"$"];s&&(i&&(o.stopPropagation(),o.preventDefault()),s(o,n))})}function pc(t){return e=>{Tn(e,"keypress",t)}}function dc(t){return e=>{Tn(e,"keydown",t)}}var wn,Is,fc=ae(()=>{wn=class{constructor(e,r,o,n,i){this.elem=e,this.eventType=r,this.callback=o,this.useCapture=n,this.selector=i,this.elem.addEventListener(this.eventType,this,this.useCapture)}handleEvent(e){let r=this.callback;r(e,this.elem)}dispose(){this.elem.removeEventListener(this.eventType,this,this.useCapture)}},Is=class extends wn{handleEvent(e){let r=IT(e.target,this.elem,this.selector);if(r){let o=this.callback;o(e,r)}}}});function f(t,...e){return bn(t,...e)}var Ff=ae(()=>{Fr();oc();yn();Rt();ac();hn();fc();oc();yn();Rt();ac();Fr();hn();fc();Fr();(function(t){t.svg=Kl,t.frag=Er,t.update=Yl,t.find=Jl,t.findAll=Ql,t.domDispose=Nt,t.onDisposeElem=_r,t.onDispose=Ol,t.autoDisposeElem=Et,t.autoDispose=Dl,t.attrsElem=co,t.attrs=Nl,t.attrElem=gn,t.attr=Rl,t.boolAttrElem=ys,t.boolAttr=$l,t.textElem=Hl,t.text=zl,t.styleElem=vs,t.style=ql,t.propElem=ws,t.prop=Vl,t.showElem=Ts,t.show=Gl,t.hideElem=ks,t.hide=Ul,t.clsElem=mn,t.cls=Bs,t.clsPrefix=uo,t.dataElem=_s,t.data=Wl,t.getData=jl,t.replaceContent=nr,t.domComputed=xn,t.domComputedOwned=po,t.maybe=ec,t.maybeOwned=tc,t.forEach=sc,t.create=rc,t.onElem=Cs,t.on=lc,t.onMatchElem=cc,t.onMatch=uc,t.onKeyElem=Tn,t.onKeyPress=pc,t.onKeyDown=dc})(f||(f={}))});function AT(){throw new Error("Can't write to non-writable pureComputed")}function OT(t){return"get"in t?t.get():t.peek()}function PT(...t){let e=t.pop();return new As(e,t)}var DT,As,If=ae(()=>{kr();ao();DT=[],As=class extends I{constructor(e,r){super(void 0),this._callback=e,this._write=AT,this._dependencies=r.length>0?r:DT,this._sub=null,this._inCall=!1,this.setListenerChangeCB(this._onListenerChange,this)}_getDepItem(){return this._activate(),this._sub._getDepItem()}get(){if(!this._sub&&!this._inCall){this._inCall=!0;try{let e=[OT];for(let r=0,o=this._dependencies.length;r<o;r++)e[r+1]=this._dependencies[r].get();super.set(this._callback.apply(void 0,e))}finally{this._inCall=!1}}return super.get()}set(e){this._write(e)}onWrite(e){return this._write=e,this}dispose(){this._sub&&this._sub.dispose(),this._sub=!0,super.dispose()}_activate(){this._sub||(this._sub=new or(this._read.bind(this),this._dependencies))}_onListenerChange(e){e?this._activate():this._sub&&(this._sub.dispose(),this._sub=null)}_read(e,...r){super.set(this._callback(e,...r))}}});function m(t,e){let r=new kn(e);return Object.assign(typeof t=="string"?(...n)=>r.addToElem(bn(t,...n)):(...n)=>r.addToElem(t(...n)),{className:r.className,cls:uo.bind(null,r.className)})}function Os(t){return new mc(t).className}function LT(t,e){let r=e.search(/[^;]*\{/),o=r<0?e:e.slice(0,r),n=r<0?"":e.slice(r);return`& {${o}
}
${n}`.replace(/&/g,t)}function NT(){let t=ye.window||MT;return t._grainNextStyleNum=(t._grainNextStyleNum||0)+1}var MT,kn,mc,Cf=ae(()=>{lo();Fr();hn();MT={};kn=class t{static _nextClassName(){return`_grain${NT()}_`}static _mountAll(){let e=Array.from(this._unmounted,r=>r._createRules()).join(`

`);ye.document.head.appendChild(bn("style",e));for(let r of this._unmounted)r._mounted=!0;this._unmounted.clear()}constructor(e){this._styles=e,this._mounted=!1,this.className=t._nextClassName(),t._unmounted.add(this)}addToElem(e){return this._mounted||t._mountAll(),e.classList.add(this.className),e}_createRules(){return LT("."+this.className,this._styles)}};kn._unmounted=new Set;mc=class extends kn{_createRules(){return`@keyframes ${this.className} {${this._styles}}`}}});function RT(t,e){switch(e.length){case 0:return()=>t();case 1:return()=>t(e[0]);case 2:return()=>t(e[0],e[1]);case 3:return()=>t(e[0],e[1],e[2]);case 4:return()=>t(e[0],e[1],e[2],e[3]);case 5:return()=>t(e[0],e[1],e[2],e[3],e[4]);case 6:return()=>t(e[0],e[1],e[2],e[3],e[4],e[5]);case 7:return()=>t(e[0],e[1],e[2],e[3],e[4],e[5],e[6]);case 8:return()=>t(e[0],e[1],e[2],e[3],e[4],e[5],e[6],e[7]);default:return()=>t.apply(void 0,e)}}function $T(t,e){switch(e.length){case 0:return r=>t(r);case 1:return r=>t(r,e[0]);case 2:return r=>t(r,e[0],e[1]);case 3:return r=>t(r,e[0],e[1],e[2]);case 4:return r=>t(r,e[0],e[1],e[2],e[3]);case 5:return r=>t(r,e[0],e[1],e[2],e[3],e[4]);case 6:return r=>t(r,e[0],e[1],e[2],e[3],e[4],e[5]);case 7:return r=>t(r,e[0],e[1],e[2],e[3],e[4],e[5],e[6]);case 8:return r=>t(r,e[0],e[1],e[2],e[3],e[4],e[5],e[6],e[7]);default:return r=>t(r,...e)}}function HT(t,e){switch(e.length){case 0:return r=>t(r);case 1:return r=>t(e[0],r);case 2:return r=>t(e[0],e[1],r);case 3:return r=>t(e[0],e[1],e[2],r);case 4:return r=>t(e[0],e[1],e[2],e[3],r);case 5:return r=>t(e[0],e[1],e[2],e[3],e[4],r);case 6:return r=>t(e[0],e[1],e[2],e[3],e[4],e[5],r);case 7:return r=>t(e[0],e[1],e[2],e[3],e[4],e[5],e[6],r);case 8:return r=>t(e[0],e[1],e[2],e[3],e[4],e[5],e[6],e[7],r);default:return r=>t(...e,r)}}var Af=ae(()=>{});function zT(t,e,...r){let o=e.isValid;function n(i){St(()=>{t.set(i.value),o&&o.set(i.validity.valid)})}return f("input",...r,f.prop("value",t),o?i=>f.autoDisposeElem(i,et(t,s=>o.set(i.checkValidity()))):null,e.onInput?f.on("input",(i,s)=>n(s)):null,f.on("change",(i,s)=>n(s)),f.onKeyPress({Enter:(i,s)=>n(s)}))}var Of=ae(()=>{z()});function Df(t){return Array.isArray(t)?t:t.get()}function Pf(t){return typeof t=="string"?t:t.value}function qT(t,e,r={}){let{defLabel:o=""}=r;return f("select",f("option",f.hide(!0),o),f.forEach(e,n=>{let i=typeof n=="string"?{value:n,label:n}:n;return f("option",{disabled:i.disabled,selected:i.value===t.get()},i.label)}),n=>f.autoDisposeElem(n,et(t,(i,s)=>{let c=Df(e).findIndex(p=>Pf(p)===s);n.selectedIndex=c+1})),f.on("change",(n,i)=>{let s=i.selectedIndex,l=Df(e)[s-1];l!==void 0&&t.set(Pf(l))}))}var Lf=ae(()=>{z()});var sr={};as(sr,{BaseObservable:()=>rr,Computed:()=>ue,ComputedArray:()=>Es,Disposable:()=>Me,Emitter:()=>ln,Holder:()=>_t,KoWrapObs:()=>gs,LLink:()=>tr,Listener:()=>cn,LiveIndex:()=>Fs,MultiHolder:()=>qe,MutableObsArray:()=>Ss,ObsArray:()=>vn,Observable:()=>I,PureComputed:()=>As,Subscription:()=>or,_disposeNode:()=>xf,attr:()=>Rl,attrElem:()=>gn,attrs:()=>Nl,attrsElem:()=>co,autoDispose:()=>Dl,autoDisposeElem:()=>Et,bindB:()=>RT,bindBU:()=>HT,bindUB:()=>$T,boolAttr:()=>$l,boolAttrElem:()=>ys,bundleChanges:()=>St,cls:()=>Bs,clsElem:()=>mn,clsPrefix:()=>uo,computed:()=>Ll,computedArray:()=>nc,create:()=>rc,data:()=>Wl,dataElem:()=>_s,dom:()=>f,domComputed:()=>xn,domComputedOwned:()=>po,domDispose:()=>Nt,domDisposeHooks:()=>Br,find:()=>Jl,findAll:()=>Ql,forEach:()=>sc,frag:()=>Er,fromKo:()=>hs,getData:()=>jl,hide:()=>Ul,hideElem:()=>ks,input:()=>zT,keyframes:()=>Os,makeLiveIndex:()=>ET,makeTestId:()=>Sr,maybe:()=>ec,maybeOwned:()=>tc,noTestId:()=>xT,obsArray:()=>ir,obsHolder:()=>pT,observable:()=>hf,on:()=>lc,onDispose:()=>Ol,onDisposeElem:()=>_r,onElem:()=>Cs,onKeyDown:()=>dc,onKeyElem:()=>Tn,onKeyPress:()=>pc,onMatch:()=>uc,onMatchElem:()=>cc,prop:()=>Vl,propElem:()=>ws,pureComputed:()=>PT,replaceContent:()=>nr,select:()=>qT,setDisposeOwner:()=>Mt,setupKoDisposal:()=>gT,show:()=>Gl,showElem:()=>Ts,style:()=>ql,styleElem:()=>vs,styled:()=>m,subscribe:()=>et,subscribeBindable:()=>kf,subscribeElem:()=>_e,svg:()=>Kl,text:()=>zl,textElem:()=>Hl,toKo:()=>mT,update:()=>Yl});var z=ae(()=>{bs();Ml();io();Ff();cs();Pl();ic();kr();If();Cf();ao();Af();Of();Lf()});var ut=y((CP,qf)=>{function VT(t){var e=typeof t;return t!=null&&(e=="object"||e=="function")}qf.exports=VT});var hc=y((AP,Vf)=>{var GT=typeof global=="object"&&global&&global.Object===Object&&global;Vf.exports=GT});var ar=y((OP,Gf)=>{var UT=hc(),WT=typeof self=="object"&&self&&self.Object===Object&&self,jT=UT||WT||Function("return this")();Gf.exports=jT});var Wf=y((DP,Uf)=>{var KT=ar(),YT=function(){return KT.Date.now()};Uf.exports=YT});var Kf=y((PP,jf)=>{var ZT=/\s/;function XT(t){for(var e=t.length;e--&&ZT.test(t.charAt(e)););return e}jf.exports=XT});var Zf=y((LP,Yf)=>{var JT=Kf(),QT=/^\s+/;function ek(t){return t&&t.slice(0,JT(t)+1).replace(QT,"")}Yf.exports=ek});var Ms=y((MP,Xf)=>{var tk=ar(),rk=tk.Symbol;Xf.exports=rk});var tm=y((NP,em)=>{var Jf=Ms(),Qf=Object.prototype,ok=Qf.hasOwnProperty,nk=Qf.toString,_n=Jf?Jf.toStringTag:void 0;function ik(t){var e=ok.call(t,_n),r=t[_n];try{t[_n]=void 0;var o=!0}catch{}var n=nk.call(t);return o&&(e?t[_n]=r:delete t[_n]),n}em.exports=ik});var om=y((RP,rm)=>{var sk=Object.prototype,ak=sk.toString;function lk(t){return ak.call(t)}rm.exports=lk});var fo=y(($P,sm)=>{var nm=Ms(),ck=tm(),uk=om(),pk="[object Null]",dk="[object Undefined]",im=nm?nm.toStringTag:void 0;function fk(t){return t==null?t===void 0?dk:pk:im&&im in Object(t)?ck(t):uk(t)}sm.exports=fk});var Ir=y((HP,am)=>{function mk(t){return t!=null&&typeof t=="object"}am.exports=mk});var bc=y((zP,lm)=>{var gk=fo(),hk=Ir(),bk="[object Symbol]";function xk(t){return typeof t=="symbol"||hk(t)&&gk(t)==bk}lm.exports=xk});var xc=y((qP,pm)=>{var yk=Zf(),cm=ut(),vk=bc(),um=NaN,wk=/^[-+]0x[0-9a-f]+$/i,Tk=/^0b[01]+$/i,kk=/^0o[0-7]+$/i,Bk=parseInt;function _k(t){if(typeof t=="number")return t;if(vk(t))return um;if(cm(t)){var e=typeof t.valueOf=="function"?t.valueOf():t;t=cm(e)?e+"":e}if(typeof t!="string")return t===0?t:+t;t=yk(t);var r=Tk.test(t);return r||kk.test(t)?Bk(t.slice(2),r?2:8):wk.test(t)?um:+t}pm.exports=_k});var vc=y((VP,fm)=>{var Sk=ut(),yc=Wf(),dm=xc(),Ek="Expected a function",Fk=Math.max,Ik=Math.min;function Ck(t,e,r){var o,n,i,s,l,c,p=0,d=!1,h=!1,x=!0;if(typeof t!="function")throw new TypeError(Ek);e=dm(e)||0,Sk(r)&&(d=!!r.leading,h="maxWait"in r,i=h?Fk(dm(r.maxWait)||0,e):i,x="trailing"in r?!!r.trailing:x);function B(w){var E=o,R=n;return o=n=void 0,p=w,s=t.apply(R,E),s}function v(w){return p=w,l=setTimeout(Q,e),d?B(w):s}function A(w){var E=w-c,R=w-p,de=e-E;return h?Ik(de,i-R):de}function q(w){var E=w-c,R=w-p;return c===void 0||E>=e||E<0||h&&R>=i}function Q(){var w=yc();if(q(w))return H(w);l=setTimeout(Q,A(w))}function H(w){return l=void 0,x&&o?B(w):(o=n=void 0,s)}function j(){l!==void 0&&clearTimeout(l),p=0,o=c=n=l=void 0}function we(){return l===void 0?s:H(yc())}function U(){var w=yc(),E=q(w);if(o=arguments,n=this,c=w,E){if(l===void 0)return v(c);if(h)return clearTimeout(l),l=setTimeout(Q,e),B(c)}return l===void 0&&(l=setTimeout(Q,e)),s}return U.cancel=j,U.flush=we,U}fm.exports=Ck});var wc=y((GP,mm)=>{function Ak(t,e){for(var r=-1,o=t==null?0:t.length,n=Array(o);++r<o;)n[r]=e(t[r],r,t);return n}mm.exports=Ak});var hm=y((UP,gm)=>{var Ok=wc();function Dk(t,e){return Ok(e,function(r){return t[r]})}gm.exports=Dk});var Tc=y((WP,bm)=>{function Pk(t,e){for(var r=-1,o=Array(t);++r<t;)o[r]=e(r);return o}bm.exports=Pk});var ym=y((jP,xm)=>{var Lk=fo(),Mk=Ir(),Nk="[object Arguments]";function Rk(t){return Mk(t)&&Lk(t)==Nk}xm.exports=Rk});var kc=y((KP,Tm)=>{var vm=ym(),$k=Ir(),wm=Object.prototype,Hk=wm.hasOwnProperty,zk=wm.propertyIsEnumerable,qk=vm((function(){return arguments})())?vm:function(t){return $k(t)&&Hk.call(t,"callee")&&!zk.call(t,"callee")};Tm.exports=qk});var Ns=y((YP,km)=>{var Vk=Array.isArray;km.exports=Vk});var _m=y((ZP,Bm)=>{function Gk(){return!1}Bm.exports=Gk});var Bc=y((Sn,mo)=>{var Uk=ar(),Wk=_m(),Fm=typeof Sn=="object"&&Sn&&!Sn.nodeType&&Sn,Sm=Fm&&typeof mo=="object"&&mo&&!mo.nodeType&&mo,jk=Sm&&Sm.exports===Fm,Em=jk?Uk.Buffer:void 0,Kk=Em?Em.isBuffer:void 0,Yk=Kk||Wk;mo.exports=Yk});var _c=y((XP,Im)=>{var Zk=9007199254740991,Xk=/^(?:0|[1-9]\d*)$/;function Jk(t,e){var r=typeof t;return e=e??Zk,!!e&&(r=="number"||r!="symbol"&&Xk.test(t))&&t>-1&&t%1==0&&t<e}Im.exports=Jk});var Sc=y((JP,Cm)=>{var Qk=9007199254740991;function eB(t){return typeof t=="number"&&t>-1&&t%1==0&&t<=Qk}Cm.exports=eB});var Om=y((QP,Am)=>{var tB=fo(),rB=Sc(),oB=Ir(),nB="[object Arguments]",iB="[object Array]",sB="[object Boolean]",aB="[object Date]",lB="[object Error]",cB="[object Function]",uB="[object Map]",pB="[object Number]",dB="[object Object]",fB="[object RegExp]",mB="[object Set]",gB="[object String]",hB="[object WeakMap]",bB="[object ArrayBuffer]",xB="[object DataView]",yB="[object Float32Array]",vB="[object Float64Array]",wB="[object Int8Array]",TB="[object Int16Array]",kB="[object Int32Array]",BB="[object Uint8Array]",_B="[object Uint8ClampedArray]",SB="[object Uint16Array]",EB="[object Uint32Array]",pe={};pe[yB]=pe[vB]=pe[wB]=pe[TB]=pe[kB]=pe[BB]=pe[_B]=pe[SB]=pe[EB]=!0;pe[nB]=pe[iB]=pe[bB]=pe[sB]=pe[xB]=pe[aB]=pe[lB]=pe[cB]=pe[uB]=pe[pB]=pe[dB]=pe[fB]=pe[mB]=pe[gB]=pe[hB]=!1;function FB(t){return oB(t)&&rB(t.length)&&!!pe[tB(t)]}Am.exports=FB});var Pm=y((eL,Dm)=>{function IB(t){return function(e){return t(e)}}Dm.exports=IB});var Mm=y((En,go)=>{var CB=hc(),Lm=typeof En=="object"&&En&&!En.nodeType&&En,Fn=Lm&&typeof go=="object"&&go&&!go.nodeType&&go,AB=Fn&&Fn.exports===Lm,Ec=AB&&CB.process,OB=(function(){try{var t=Fn&&Fn.require&&Fn.require("util").types;return t||Ec&&Ec.binding&&Ec.binding("util")}catch{}})();go.exports=OB});var Fc=y((tL,$m)=>{var DB=Om(),PB=Pm(),Nm=Mm(),Rm=Nm&&Nm.isTypedArray,LB=Rm?PB(Rm):DB;$m.exports=LB});var Ic=y((rL,Hm)=>{var MB=Tc(),NB=kc(),RB=Ns(),$B=Bc(),HB=_c(),zB=Fc(),qB=Object.prototype,VB=qB.hasOwnProperty;function GB(t,e){var r=RB(t),o=!r&&NB(t),n=!r&&!o&&$B(t),i=!r&&!o&&!n&&zB(t),s=r||o||n||i,l=s?MB(t.length,String):[],c=l.length;for(var p in t)(e||VB.call(t,p))&&!(s&&(p=="length"||n&&(p=="offset"||p=="parent")||i&&(p=="buffer"||p=="byteLength"||p=="byteOffset")||HB(p,c)))&&l.push(p);return l}Hm.exports=GB});var Rs=y((oL,zm)=>{var UB=Object.prototype;function WB(t){var e=t&&t.constructor,r=typeof e=="function"&&e.prototype||UB;return t===r}zm.exports=WB});var Cc=y((nL,qm)=>{function jB(t,e){return function(r){return t(e(r))}}qm.exports=jB});var Gm=y((iL,Vm)=>{var KB=Cc(),YB=KB(Object.keys,Object);Vm.exports=YB});var Wm=y((sL,Um)=>{var ZB=Rs(),XB=Gm(),JB=Object.prototype,QB=JB.hasOwnProperty;function e_(t){if(!ZB(t))return XB(t);var e=[];for(var r in Object(t))QB.call(t,r)&&r!="constructor"&&e.push(r);return e}Um.exports=e_});var $s=y((aL,jm)=>{var t_=fo(),r_=ut(),o_="[object AsyncFunction]",n_="[object Function]",i_="[object GeneratorFunction]",s_="[object Proxy]";function a_(t){if(!r_(t))return!1;var e=t_(t);return e==n_||e==i_||e==o_||e==s_}jm.exports=a_});var In=y((lL,Km)=>{var l_=$s(),c_=Sc();function u_(t){return t!=null&&c_(t.length)&&!l_(t)}Km.exports=u_});var Zm=y((cL,Ym)=>{var p_=Ic(),d_=Wm(),f_=In();function m_(t){return f_(t)?p_(t):d_(t)}Ym.exports=m_});var Jm=y((uL,Xm)=>{var g_=hm(),h_=Zm();function b_(t){return t==null?[]:g_(t,h_(t))}Xm.exports=b_});var Pc=y((SL,og)=>{function D_(t,e,r){switch(r.length){case 0:return t.call(e);case 1:return t.call(e,r[0]);case 2:return t.call(e,r[0],r[1]);case 3:return t.call(e,r[0],r[1],r[2])}return t.apply(e,r)}og.exports=D_});var An=y((EL,ng)=>{function P_(t){return t}ng.exports=P_});var ag=y((FL,sg)=>{var L_=Pc(),ig=Math.max;function M_(t,e,r){return e=ig(e===void 0?t.length-1:e,0),function(){for(var o=arguments,n=-1,i=ig(o.length-e,0),s=Array(i);++n<i;)s[n]=o[e+n];n=-1;for(var l=Array(e+1);++n<e;)l[n]=o[n];return l[e]=r(s),L_(t,this,l)}}sg.exports=M_});var Lc=y((IL,lg)=>{function N_(t){return function(){return t}}lg.exports=N_});var ug=y((CL,cg)=>{var R_=ar(),$_=R_["__core-js_shared__"];cg.exports=$_});var fg=y((AL,dg)=>{var Mc=ug(),pg=(function(){var t=/[^.]+$/.exec(Mc&&Mc.keys&&Mc.keys.IE_PROTO||"");return t?"Symbol(src)_1."+t:""})();function H_(t){return!!pg&&pg in t}dg.exports=H_});var gg=y((OL,mg)=>{var z_=Function.prototype,q_=z_.toString;function V_(t){if(t!=null){try{return q_.call(t)}catch{}try{return t+""}catch{}}return""}mg.exports=V_});var bg=y((DL,hg)=>{var G_=$s(),U_=fg(),W_=ut(),j_=gg(),K_=/[\\^$.*+?()[\]{}|]/g,Y_=/^\[object .+?Constructor\]$/,Z_=Function.prototype,X_=Object.prototype,J_=Z_.toString,Q_=X_.hasOwnProperty,eS=RegExp("^"+J_.call(Q_).replace(K_,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");function tS(t){if(!W_(t)||U_(t))return!1;var e=G_(t)?eS:Y_;return e.test(j_(t))}hg.exports=tS});var yg=y((PL,xg)=>{function rS(t,e){return t?.[e]}xg.exports=rS});var Hs=y((LL,vg)=>{var oS=bg(),nS=yg();function iS(t,e){var r=nS(t,e);return oS(r)?r:void 0}vg.exports=iS});var Nc=y((ML,wg)=>{var sS=Hs(),aS=(function(){try{var t=sS(Object,"defineProperty");return t({},"",{}),t}catch{}})();wg.exports=aS});var Bg=y((NL,kg)=>{var lS=Lc(),Tg=Nc(),cS=An(),uS=Tg?function(t,e){return Tg(t,"toString",{configurable:!0,enumerable:!1,value:lS(e),writable:!0})}:cS;kg.exports=uS});var Sg=y((RL,_g)=>{var pS=800,dS=16,fS=Date.now;function mS(t){var e=0,r=0;return function(){var o=fS(),n=dS-(o-r);if(r=o,n>0){if(++e>=pS)return arguments[0]}else e=0;return t.apply(void 0,arguments)}}_g.exports=mS});var Fg=y(($L,Eg)=>{var gS=Bg(),hS=Sg(),bS=hS(gS);Eg.exports=bS});var zs=y((HL,Ig)=>{var xS=An(),yS=ag(),vS=Fg();function wS(t,e){return vS(yS(t,e,xS),t+"")}Ig.exports=wS});var Ag=y((zL,Cg)=>{function TS(){this.__data__=[],this.size=0}Cg.exports=TS});var ho=y((qL,Og)=>{function kS(t,e){return t===e||t!==t&&e!==e}Og.exports=kS});var On=y((VL,Dg)=>{var BS=ho();function _S(t,e){for(var r=t.length;r--;)if(BS(t[r][0],e))return r;return-1}Dg.exports=_S});var Lg=y((GL,Pg)=>{var SS=On(),ES=Array.prototype,FS=ES.splice;function IS(t){var e=this.__data__,r=SS(e,t);if(r<0)return!1;var o=e.length-1;return r==o?e.pop():FS.call(e,r,1),--this.size,!0}Pg.exports=IS});var Ng=y((UL,Mg)=>{var CS=On();function AS(t){var e=this.__data__,r=CS(e,t);return r<0?void 0:e[r][1]}Mg.exports=AS});var $g=y((WL,Rg)=>{var OS=On();function DS(t){return OS(this.__data__,t)>-1}Rg.exports=DS});var zg=y((jL,Hg)=>{var PS=On();function LS(t,e){var r=this.__data__,o=PS(r,t);return o<0?(++this.size,r.push([t,e])):r[o][1]=e,this}Hg.exports=LS});var Dn=y((KL,qg)=>{var MS=Ag(),NS=Lg(),RS=Ng(),$S=$g(),HS=zg();function bo(t){var e=-1,r=t==null?0:t.length;for(this.clear();++e<r;){var o=t[e];this.set(o[0],o[1])}}bo.prototype.clear=MS;bo.prototype.delete=NS;bo.prototype.get=RS;bo.prototype.has=$S;bo.prototype.set=HS;qg.exports=bo});var Gg=y((YL,Vg)=>{var zS=Dn();function qS(){this.__data__=new zS,this.size=0}Vg.exports=qS});var Wg=y((ZL,Ug)=>{function VS(t){var e=this.__data__,r=e.delete(t);return this.size=e.size,r}Ug.exports=VS});var Kg=y((XL,jg)=>{function GS(t){return this.__data__.get(t)}jg.exports=GS});var Zg=y((JL,Yg)=>{function US(t){return this.__data__.has(t)}Yg.exports=US});var Rc=y((QL,Xg)=>{var WS=Hs(),jS=ar(),KS=WS(jS,"Map");Xg.exports=KS});var Pn=y((eM,Jg)=>{var YS=Hs(),ZS=YS(Object,"create");Jg.exports=ZS});var th=y((tM,eh)=>{var Qg=Pn();function XS(){this.__data__=Qg?Qg(null):{},this.size=0}eh.exports=XS});var oh=y((rM,rh)=>{function JS(t){var e=this.has(t)&&delete this.__data__[t];return this.size-=e?1:0,e}rh.exports=JS});var ih=y((oM,nh)=>{var QS=Pn(),e0="__lodash_hash_undefined__",t0=Object.prototype,r0=t0.hasOwnProperty;function o0(t){var e=this.__data__;if(QS){var r=e[t];return r===e0?void 0:r}return r0.call(e,t)?e[t]:void 0}nh.exports=o0});var ah=y((nM,sh)=>{var n0=Pn(),i0=Object.prototype,s0=i0.hasOwnProperty;function a0(t){var e=this.__data__;return n0?e[t]!==void 0:s0.call(e,t)}sh.exports=a0});var ch=y((iM,lh)=>{var l0=Pn(),c0="__lodash_hash_undefined__";function u0(t,e){var r=this.__data__;return this.size+=this.has(t)?0:1,r[t]=l0&&e===void 0?c0:e,this}lh.exports=u0});var ph=y((sM,uh)=>{var p0=th(),d0=oh(),f0=ih(),m0=ah(),g0=ch();function xo(t){var e=-1,r=t==null?0:t.length;for(this.clear();++e<r;){var o=t[e];this.set(o[0],o[1])}}xo.prototype.clear=p0;xo.prototype.delete=d0;xo.prototype.get=f0;xo.prototype.has=m0;xo.prototype.set=g0;uh.exports=xo});var mh=y((aM,fh)=>{var dh=ph(),h0=Dn(),b0=Rc();function x0(){this.size=0,this.__data__={hash:new dh,map:new(b0||h0),string:new dh}}fh.exports=x0});var hh=y((lM,gh)=>{function y0(t){var e=typeof t;return e=="string"||e=="number"||e=="symbol"||e=="boolean"?t!=="__proto__":t===null}gh.exports=y0});var Ln=y((cM,bh)=>{var v0=hh();function w0(t,e){var r=t.__data__;return v0(e)?r[typeof e=="string"?"string":"hash"]:r.map}bh.exports=w0});var yh=y((uM,xh)=>{var T0=Ln();function k0(t){var e=T0(this,t).delete(t);return this.size-=e?1:0,e}xh.exports=k0});var wh=y((pM,vh)=>{var B0=Ln();function _0(t){return B0(this,t).get(t)}vh.exports=_0});var kh=y((dM,Th)=>{var S0=Ln();function E0(t){return S0(this,t).has(t)}Th.exports=E0});var _h=y((fM,Bh)=>{var F0=Ln();function I0(t,e){var r=F0(this,t),o=r.size;return r.set(t,e),this.size+=r.size==o?0:1,this}Bh.exports=I0});var Eh=y((mM,Sh)=>{var C0=mh(),A0=yh(),O0=wh(),D0=kh(),P0=_h();function yo(t){var e=-1,r=t==null?0:t.length;for(this.clear();++e<r;){var o=t[e];this.set(o[0],o[1])}}yo.prototype.clear=C0;yo.prototype.delete=A0;yo.prototype.get=O0;yo.prototype.has=D0;yo.prototype.set=P0;Sh.exports=yo});var Ih=y((gM,Fh)=>{var L0=Dn(),M0=Rc(),N0=Eh(),R0=200;function $0(t,e){var r=this.__data__;if(r instanceof L0){var o=r.__data__;if(!M0||o.length<R0-1)return o.push([t,e]),this.size=++r.size,this;r=this.__data__=new N0(o)}return r.set(t,e),this.size=r.size,this}Fh.exports=$0});var Ah=y((hM,Ch)=>{var H0=Dn(),z0=Gg(),q0=Wg(),V0=Kg(),G0=Zg(),U0=Ih();function vo(t){var e=this.__data__=new H0(t);this.size=e.size}vo.prototype.clear=z0;vo.prototype.delete=q0;vo.prototype.get=V0;vo.prototype.has=G0;vo.prototype.set=U0;Ch.exports=vo});var qs=y((bM,Dh)=>{var Oh=Nc();function W0(t,e,r){e=="__proto__"&&Oh?Oh(t,e,{configurable:!0,enumerable:!0,value:r,writable:!0}):t[e]=r}Dh.exports=W0});var $c=y((xM,Ph)=>{var j0=qs(),K0=ho();function Y0(t,e,r){(r!==void 0&&!K0(t[e],r)||r===void 0&&!(e in t))&&j0(t,e,r)}Ph.exports=Y0});var Mh=y((yM,Lh)=>{function Z0(t){return function(e,r,o){for(var n=-1,i=Object(e),s=o(e),l=s.length;l--;){var c=s[t?l:++n];if(r(i[c],c,i)===!1)break}return e}}Lh.exports=Z0});var Rh=y((vM,Nh)=>{var X0=Mh(),J0=X0();Nh.exports=J0});var Vh=y((Mn,wo)=>{var Q0=ar(),qh=typeof Mn=="object"&&Mn&&!Mn.nodeType&&Mn,$h=qh&&typeof wo=="object"&&wo&&!wo.nodeType&&wo,eE=$h&&$h.exports===qh,Hh=eE?Q0.Buffer:void 0,zh=Hh?Hh.allocUnsafe:void 0;function tE(t,e){if(e)return t.slice();var r=t.length,o=zh?zh(r):new t.constructor(r);return t.copy(o),o}wo.exports=tE});var Uh=y((wM,Gh)=>{var rE=ar(),oE=rE.Uint8Array;Gh.exports=oE});var Kh=y((TM,jh)=>{var Wh=Uh();function nE(t){var e=new t.constructor(t.byteLength);return new Wh(e).set(new Wh(t)),e}jh.exports=nE});var Zh=y((kM,Yh)=>{var iE=Kh();function sE(t,e){var r=e?iE(t.buffer):t.buffer;return new t.constructor(r,t.byteOffset,t.length)}Yh.exports=sE});var Jh=y((BM,Xh)=>{function aE(t,e){var r=-1,o=t.length;for(e||(e=Array(o));++r<o;)e[r]=t[r];return e}Xh.exports=aE});var tb=y((_M,eb)=>{var lE=ut(),Qh=Object.create,cE=(function(){function t(){}return function(e){if(!lE(e))return{};if(Qh)return Qh(e);t.prototype=e;var r=new t;return t.prototype=void 0,r}})();eb.exports=cE});var Hc=y((SM,rb)=>{var uE=Cc(),pE=uE(Object.getPrototypeOf,Object);rb.exports=pE});var nb=y((EM,ob)=>{var dE=tb(),fE=Hc(),mE=Rs();function gE(t){return typeof t.constructor=="function"&&!mE(t)?dE(fE(t)):{}}ob.exports=gE});var sb=y((FM,ib)=>{var hE=In(),bE=Ir();function xE(t){return bE(t)&&hE(t)}ib.exports=xE});var cb=y((IM,lb)=>{var yE=fo(),vE=Hc(),wE=Ir(),TE="[object Object]",kE=Function.prototype,BE=Object.prototype,ab=kE.toString,_E=BE.hasOwnProperty,SE=ab.call(Object);function EE(t){if(!wE(t)||yE(t)!=TE)return!1;var e=vE(t);if(e===null)return!0;var r=_E.call(e,"constructor")&&e.constructor;return typeof r=="function"&&r instanceof r&&ab.call(r)==SE}lb.exports=EE});var zc=y((CM,ub)=>{function FE(t,e){if(!(e==="constructor"&&typeof t[e]=="function")&&e!="__proto__")return t[e]}ub.exports=FE});var db=y((AM,pb)=>{var IE=qs(),CE=ho(),AE=Object.prototype,OE=AE.hasOwnProperty;function DE(t,e,r){var o=t[e];(!(OE.call(t,e)&&CE(o,r))||r===void 0&&!(e in t))&&IE(t,e,r)}pb.exports=DE});var mb=y((OM,fb)=>{var PE=db(),LE=qs();function ME(t,e,r,o){var n=!r;r||(r={});for(var i=-1,s=e.length;++i<s;){var l=e[i],c=o?o(r[l],t[l],l,r,t):void 0;c===void 0&&(c=t[l]),n?LE(r,l,c):PE(r,l,c)}return r}fb.exports=ME});var hb=y((DM,gb)=>{function NE(t){var e=[];if(t!=null)for(var r in Object(t))e.push(r);return e}gb.exports=NE});var xb=y((PM,bb)=>{var RE=ut(),$E=Rs(),HE=hb(),zE=Object.prototype,qE=zE.hasOwnProperty;function VE(t){if(!RE(t))return HE(t);var e=$E(t),r=[];for(var o in t)o=="constructor"&&(e||!qE.call(t,o))||r.push(o);return r}bb.exports=VE});var Vs=y((LM,yb)=>{var GE=Ic(),UE=xb(),WE=In();function jE(t){return WE(t)?GE(t,!0):UE(t)}yb.exports=jE});var wb=y((MM,vb)=>{var KE=mb(),YE=Vs();function ZE(t){return KE(t,YE(t))}vb.exports=ZE});var Eb=y((NM,Sb)=>{var Tb=$c(),XE=Vh(),JE=Zh(),QE=Jh(),eF=nb(),kb=kc(),Bb=Ns(),tF=sb(),rF=Bc(),oF=$s(),nF=ut(),iF=cb(),sF=Fc(),_b=zc(),aF=wb();function lF(t,e,r,o,n,i,s){var l=_b(t,r),c=_b(e,r),p=s.get(c);if(p){Tb(t,r,p);return}var d=i?i(l,c,r+"",t,e,s):void 0,h=d===void 0;if(h){var x=Bb(c),B=!x&&rF(c),v=!x&&!B&&sF(c);d=c,x||B||v?Bb(l)?d=l:tF(l)?d=QE(l):B?(h=!1,d=XE(c,!0)):v?(h=!1,d=JE(c,!0)):d=[]:iF(c)||kb(c)?(d=l,kb(l)?d=aF(l):(!nF(l)||oF(l))&&(d=eF(c))):h=!1}h&&(s.set(c,d),n(d,c,o,i,s),s.delete(c)),Tb(t,r,d)}Sb.exports=lF});var qc=y((RM,Ib)=>{var cF=Ah(),uF=$c(),pF=Rh(),dF=Eb(),fF=ut(),mF=Vs(),gF=zc();function Fb(t,e,r,o,n){t!==e&&pF(e,function(i,s){if(n||(n=new cF),fF(i))dF(t,e,s,r,Fb,o,n);else{var l=o?o(gF(t,s),i,s+"",t,e,n):void 0;l===void 0&&(l=i),uF(t,s,l)}},mF)}Ib.exports=Fb});var Db=y(($M,Ob)=>{var hF=qc(),Cb=ut();function Ab(t,e,r,o,n,i){return Cb(t)&&Cb(e)&&(i.set(e,t),hF(t,e,void 0,Ab,i),i.delete(e)),t}Ob.exports=Ab});var Vc=y((HM,Pb)=>{var bF=ho(),xF=In(),yF=_c(),vF=ut();function wF(t,e,r){if(!vF(r))return!1;var o=typeof e;return(o=="number"?xF(r)&&yF(e,r.length):o=="string"&&e in r)?bF(r[e],t):!1}Pb.exports=wF});var Mb=y((zM,Lb)=>{var TF=zs(),kF=Vc();function BF(t){return TF(function(e,r){var o=-1,n=r.length,i=n>1?r[n-1]:void 0,s=n>2?r[2]:void 0;for(i=t.length>3&&typeof i=="function"?(n--,i):void 0,s&&kF(r[0],r[1],s)&&(i=n<3?void 0:i,n=1),e=Object(e);++o<n;){var l=r[o];l&&t(e,l,o,i)}return e})}Lb.exports=BF});var Gc=y((qM,Nb)=>{var _F=qc(),SF=Mb(),EF=SF(function(t,e,r,o){_F(t,e,r,o)});Nb.exports=EF});var Uc=y((VM,Rb)=>{var FF=Pc(),IF=zs(),CF=Db(),AF=Gc(),OF=IF(function(t){return t.push(void 0,CF),FF(AF,void 0,t)});Rb.exports=OF});var Gb=y((GM,Vb)=>{var $b=Ms(),DF=wc(),PF=Ns(),LF=bc(),MF=1/0,Hb=$b?$b.prototype:void 0,zb=Hb?Hb.toString:void 0;function qb(t){if(typeof t=="string")return t;if(PF(t))return DF(t,qb)+"";if(LF(t))return zb?zb.call(t):"";var e=t+"";return e=="0"&&1/t==-MF?"-0":e}Vb.exports=qb});var Wc=y((UM,Ub)=>{var NF=Gb();function RF(t){return t==null?"":NF(t)}Ub.exports=RF});var jb=y((WM,Wb)=>{var $F=Wc(),HF=0;function zF(t){var e=++HF;return $F(t)+e}Wb.exports=zF});var Yb=y((jM,Kb)=>{function qF(){}Kb.exports=qF});var hx={};as(hx,{default:()=>SI});function GF(t){var e=!1;return function(){e||(e=!0,window.Promise.resolve().then(function(){e=!1,t()}))}}function UF(t){var e=!1;return function(){e||(e=!0,setTimeout(function(){e=!1,t()},VF))}}function tx(t){var e={};return t&&e.toString.call(t)==="[object Function]"}function Ar(t,e){if(t.nodeType!==1)return[];var r=t.ownerDocument.defaultView,o=r.getComputedStyle(t,null);return e?o[e]:o}function Jc(t){return t.nodeName==="HTML"?t:t.parentNode||t.host}function Rn(t){if(!t)return document.body;switch(t.nodeName){case"HTML":case"BODY":return t.ownerDocument.body;case"#document":return t.body}var e=Ar(t),r=e.overflow,o=e.overflowX,n=e.overflowY;return/(auto|scroll|overlay)/.test(r+n+o)?t:Rn(Jc(t))}function rx(t){return t&&t.referenceNode?t.referenceNode:t}function _o(t){return t===11?Zb:t===10?Xb:Zb||Xb}function To(t){if(!t)return document.documentElement;for(var e=_o(10)?document.body:null,r=t.offsetParent||null;r===e&&t.nextElementSibling;)r=(t=t.nextElementSibling).offsetParent;var o=r&&r.nodeName;return!o||o==="BODY"||o==="HTML"?t?t.ownerDocument.documentElement:document.documentElement:["TH","TD","TABLE"].indexOf(r.nodeName)!==-1&&Ar(r,"position")==="static"?To(r):r}function KF(t){var e=t.nodeName;return e==="BODY"?!1:e==="HTML"||To(t.firstElementChild)===t}function Yc(t){return t.parentNode!==null?Yc(t.parentNode):t}function Gs(t,e){if(!t||!t.nodeType||!e||!e.nodeType)return document.documentElement;var r=t.compareDocumentPosition(e)&Node.DOCUMENT_POSITION_FOLLOWING,o=r?t:e,n=r?e:t,i=document.createRange();i.setStart(o,0),i.setEnd(n,0);var s=i.commonAncestorContainer;if(t!==s&&e!==s||o.contains(n))return KF(s)?s:To(s);var l=Yc(t);return l.host?Gs(l.host,e):Gs(t,Yc(e).host)}function ko(t){var e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:"top",r=e==="top"?"scrollTop":"scrollLeft",o=t.nodeName;if(o==="BODY"||o==="HTML"){var n=t.ownerDocument.documentElement,i=t.ownerDocument.scrollingElement||n;return i[r]}return t[r]}function YF(t,e){var r=arguments.length>2&&arguments[2]!==void 0?arguments[2]:!1,o=ko(e,"top"),n=ko(e,"left"),i=r?-1:1;return t.top+=o*i,t.bottom+=o*i,t.left+=n*i,t.right+=n*i,t}function Jb(t,e){var r=e==="x"?"Left":"Top",o=r==="Left"?"Right":"Bottom";return parseFloat(t["border"+r+"Width"])+parseFloat(t["border"+o+"Width"])}function Qb(t,e,r,o){return Math.max(e["offset"+t],e["scroll"+t],r["client"+t],r["offset"+t],r["scroll"+t],_o(10)?parseInt(r["offset"+t])+parseInt(o["margin"+(t==="Height"?"Top":"Left")])+parseInt(o["margin"+(t==="Height"?"Bottom":"Right")]):0)}function ox(t){var e=t.body,r=t.documentElement,o=_o(10)&&getComputedStyle(r);return{height:Qb("Height",e,r,o),width:Qb("Width",e,r,o)}}function lr(t){return rt({},t,{right:t.left+t.width,bottom:t.top+t.height})}function Zc(t){var e={};try{if(_o(10)){e=t.getBoundingClientRect();var r=ko(t,"top"),o=ko(t,"left");e.top+=r,e.left+=o,e.bottom+=r,e.right+=o}else e=t.getBoundingClientRect()}catch{}var n={left:e.left,top:e.top,width:e.right-e.left,height:e.bottom-e.top},i=t.nodeName==="HTML"?ox(t.ownerDocument):{},s=i.width||t.clientWidth||n.width,l=i.height||t.clientHeight||n.height,c=t.offsetWidth-s,p=t.offsetHeight-l;if(c||p){var d=Ar(t);c-=Jb(d,"x"),p-=Jb(d,"y"),n.width-=c,n.height-=p}return lr(n)}function Qc(t,e){var r=arguments.length>2&&arguments[2]!==void 0?arguments[2]:!1,o=_o(10),n=e.nodeName==="HTML",i=Zc(t),s=Zc(e),l=Rn(t),c=Ar(e),p=parseFloat(c.borderTopWidth),d=parseFloat(c.borderLeftWidth);r&&n&&(s.top=Math.max(s.top,0),s.left=Math.max(s.left,0));var h=lr({top:i.top-s.top-p,left:i.left-s.left-d,width:i.width,height:i.height});if(h.marginTop=0,h.marginLeft=0,!o&&n){var x=parseFloat(c.marginTop),B=parseFloat(c.marginLeft);h.top-=p-x,h.bottom-=p-x,h.left-=d-B,h.right-=d-B,h.marginTop=x,h.marginLeft=B}return(o&&!r?e.contains(l):e===l&&l.nodeName!=="BODY")&&(h=YF(h,e)),h}function JF(t){var e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!1,r=t.ownerDocument.documentElement,o=Qc(t,r),n=Math.max(r.clientWidth,window.innerWidth||0),i=Math.max(r.clientHeight,window.innerHeight||0),s=e?0:ko(r),l=e?0:ko(r,"left"),c={top:s-o.top+o.marginTop,left:l-o.left+o.marginLeft,width:n,height:i};return lr(c)}function nx(t){var e=t.nodeName;if(e==="BODY"||e==="HTML")return!1;if(Ar(t,"position")==="fixed")return!0;var r=Jc(t);return r?nx(r):!1}function ix(t){if(!t||!t.parentElement||_o())return document.documentElement;for(var e=t.parentElement;e&&Ar(e,"transform")==="none";)e=e.parentElement;return e||document.documentElement}function eu(t,e,r,o){var n=arguments.length>4&&arguments[4]!==void 0?arguments[4]:!1,i={top:0,left:0},s=n?ix(t):Gs(t,rx(e));if(o==="viewport")i=JF(s,n);else{var l=void 0;o==="scrollParent"?(l=Rn(Jc(e)),l.nodeName==="BODY"&&(l=t.ownerDocument.documentElement)):o==="window"?l=t.ownerDocument.documentElement:l=o;var c=Qc(l,s,n);if(l.nodeName==="HTML"&&!nx(s)){var p=ox(t.ownerDocument),d=p.height,h=p.width;i.top+=c.top-c.marginTop,i.bottom=d+c.top,i.left+=c.left-c.marginLeft,i.right=h+c.left}else i=c}r=r||0;var x=typeof r=="number";return i.left+=x?r:r.left||0,i.top+=x?r:r.top||0,i.right-=x?r:r.right||0,i.bottom-=x?r:r.bottom||0,i}function QF(t){var e=t.width,r=t.height;return e*r}function sx(t,e,r,o,n){var i=arguments.length>5&&arguments[5]!==void 0?arguments[5]:0;if(t.indexOf("auto")===-1)return t;var s=eu(r,o,i,n),l={top:{width:s.width,height:e.top-s.top},right:{width:s.right-e.right,height:s.height},bottom:{width:s.width,height:s.bottom-e.bottom},left:{width:e.left-s.left,height:s.height}},c=Object.keys(l).map(function(x){return rt({key:x},l[x],{area:QF(l[x])})}).sort(function(x,B){return B.area-x.area}),p=c.filter(function(x){var B=x.width,v=x.height;return B>=r.clientWidth&&v>=r.clientHeight}),d=p.length>0?p[0].key:c[0].key,h=t.split("-")[1];return d+(h?"-"+h:"")}function ax(t,e,r){var o=arguments.length>3&&arguments[3]!==void 0?arguments[3]:null,n=o?ix(e):Gs(e,rx(r));return Qc(r,n,o)}function lx(t){var e=t.ownerDocument.defaultView,r=e.getComputedStyle(t),o=parseFloat(r.marginTop||0)+parseFloat(r.marginBottom||0),n=parseFloat(r.marginLeft||0)+parseFloat(r.marginRight||0),i={width:t.offsetWidth+n,height:t.offsetHeight+o};return i}function Us(t){var e={left:"right",right:"left",bottom:"top",top:"bottom"};return t.replace(/left|right|bottom|top/g,function(r){return e[r]})}function cx(t,e,r){r=r.split("-")[0];var o=lx(t),n={width:o.width,height:o.height},i=["right","left"].indexOf(r)!==-1,s=i?"top":"left",l=i?"left":"top",c=i?"height":"width",p=i?"width":"height";return n[s]=e[s]+e[c]/2-o[c]/2,r===l?n[l]=e[l]-o[p]:n[l]=e[Us(l)],n}function $n(t,e){return Array.prototype.find?t.find(e):t.filter(e)[0]}function eI(t,e,r){if(Array.prototype.findIndex)return t.findIndex(function(n){return n[e]===r});var o=$n(t,function(n){return n[e]===r});return t.indexOf(o)}function ux(t,e,r){var o=r===void 0?t:t.slice(0,eI(t,"name",r));return o.forEach(function(n){n.function&&console.warn("`modifier.function` is deprecated, use `modifier.fn`!");var i=n.function||n.fn;n.enabled&&tx(i)&&(e.offsets.popper=lr(e.offsets.popper),e.offsets.reference=lr(e.offsets.reference),e=i(e,n))}),e}function tI(){if(!this.state.isDestroyed){var t={instance:this,styles:{},arrowStyles:{},attributes:{},flipped:!1,offsets:{}};t.offsets.reference=ax(this.state,this.popper,this.reference,this.options.positionFixed),t.placement=sx(this.options.placement,t.offsets.reference,this.popper,this.reference,this.options.modifiers.flip.boundariesElement,this.options.modifiers.flip.padding),t.originalPlacement=t.placement,t.positionFixed=this.options.positionFixed,t.offsets.popper=cx(this.popper,t.offsets.reference,t.placement),t.offsets.popper.position=this.options.positionFixed?"fixed":"absolute",t=ux(this.modifiers,t),this.state.isCreated?this.options.onUpdate(t):(this.state.isCreated=!0,this.options.onCreate(t))}}function px(t,e){return t.some(function(r){var o=r.name,n=r.enabled;return n&&o===e})}function tu(t){for(var e=[!1,"ms","Webkit","Moz","O"],r=t.charAt(0).toUpperCase()+t.slice(1),o=0;o<e.length;o++){var n=e[o],i=n?""+n+r:t;if(typeof document.body.style[i]<"u")return i}return null}function rI(){return this.state.isDestroyed=!0,px(this.modifiers,"applyStyle")&&(this.popper.removeAttribute("x-placement"),this.popper.style.position="",this.popper.style.top="",this.popper.style.left="",this.popper.style.right="",this.popper.style.bottom="",this.popper.style.willChange="",this.popper.style[tu("transform")]=""),this.disableEventListeners(),this.options.removeOnDestroy&&this.popper.parentNode.removeChild(this.popper),this}function dx(t){var e=t.ownerDocument;return e?e.defaultView:window}function fx(t,e,r,o){var n=t.nodeName==="BODY",i=n?t.ownerDocument.defaultView:t;i.addEventListener(e,r,{passive:!0}),n||fx(Rn(i.parentNode),e,r,o),o.push(i)}function oI(t,e,r,o){r.updateBound=o,dx(t).addEventListener("resize",r.updateBound,{passive:!0});var n=Rn(t);return fx(n,"scroll",r.updateBound,r.scrollParents),r.scrollElement=n,r.eventsEnabled=!0,r}function nI(){this.state.eventsEnabled||(this.state=oI(this.reference,this.options,this.state,this.scheduleUpdate))}function iI(t,e){return dx(t).removeEventListener("resize",e.updateBound),e.scrollParents.forEach(function(r){r.removeEventListener("scroll",e.updateBound)}),e.updateBound=null,e.scrollParents=[],e.scrollElement=null,e.eventsEnabled=!1,e}function sI(){this.state.eventsEnabled&&(cancelAnimationFrame(this.scheduleUpdate),this.state=iI(this.reference,this.state))}function ru(t){return t!==""&&!isNaN(parseFloat(t))&&isFinite(t)}function Xc(t,e){Object.keys(e).forEach(function(r){var o="";["width","height","top","right","bottom","left"].indexOf(r)!==-1&&ru(e[r])&&(o="px"),t.style[r]=e[r]+o})}function aI(t,e){Object.keys(e).forEach(function(r){var o=e[r];o!==!1?t.setAttribute(r,e[r]):t.removeAttribute(r)})}function lI(t){return Xc(t.instance.popper,t.styles),aI(t.instance.popper,t.attributes),t.arrowElement&&Object.keys(t.arrowStyles).length&&Xc(t.arrowElement,t.arrowStyles),t}function cI(t,e,r,o,n){var i=ax(n,e,t,r.positionFixed),s=sx(r.placement,i,e,t,r.modifiers.flip.boundariesElement,r.modifiers.flip.padding);return e.setAttribute("x-placement",s),Xc(e,{position:r.positionFixed?"fixed":"absolute"}),r}function uI(t,e){var r=t.offsets,o=r.popper,n=r.reference,i=Math.round,s=Math.floor,l=function(Q){return Q},c=i(n.width),p=i(o.width),d=["left","right"].indexOf(t.placement)!==-1,h=t.placement.indexOf("-")!==-1,x=c%2===p%2,B=c%2===1&&p%2===1,v=e?d||h||x?i:s:l,A=e?i:l;return{left:v(B&&!h&&e?o.left-1:o.left),top:A(o.top),bottom:A(o.bottom),right:v(o.right)}}function dI(t,e){var r=e.x,o=e.y,n=t.offsets.popper,i=$n(t.instance.modifiers,function(j){return j.name==="applyStyle"}).gpuAcceleration;i!==void 0&&console.warn("WARNING: `gpuAcceleration` option moved to `computeStyle` modifier and will not be supported in future versions of Popper.js!");var s=i!==void 0?i:e.gpuAcceleration,l=To(t.instance.popper),c=Zc(l),p={position:n.position},d=uI(t,window.devicePixelRatio<2||!pI),h=r==="bottom"?"top":"bottom",x=o==="right"?"left":"right",B=tu("transform"),v=void 0,A=void 0;if(h==="bottom"?l.nodeName==="HTML"?A=-l.clientHeight+d.bottom:A=-c.height+d.bottom:A=d.top,x==="right"?l.nodeName==="HTML"?v=-l.clientWidth+d.right:v=-c.width+d.right:v=d.left,s&&B)p[B]="translate3d("+v+"px, "+A+"px, 0)",p[h]=0,p[x]=0,p.willChange="transform";else{var q=h==="bottom"?-1:1,Q=x==="right"?-1:1;p[h]=A*q,p[x]=v*Q,p.willChange=h+", "+x}var H={"x-placement":t.placement};return t.attributes=rt({},H,t.attributes),t.styles=rt({},p,t.styles),t.arrowStyles=rt({},t.offsets.arrow,t.arrowStyles),t}function mx(t,e,r){var o=$n(t,function(l){var c=l.name;return c===e}),n=!!o&&t.some(function(l){return l.name===r&&l.enabled&&l.order<o.order});if(!n){var i="`"+e+"`",s="`"+r+"`";console.warn(s+" modifier is required by "+i+" modifier in order to work, be sure to include it before "+i+"!")}return n}function fI(t,e){var r;if(!mx(t.instance.modifiers,"arrow","keepTogether"))return t;var o=e.element;if(typeof o=="string"){if(o=t.instance.popper.querySelector(o),!o)return t}else if(!t.instance.popper.contains(o))return console.warn("WARNING: `arrow.element` must be child of its popper element!"),t;var n=t.placement.split("-")[0],i=t.offsets,s=i.popper,l=i.reference,c=["left","right"].indexOf(n)!==-1,p=c?"height":"width",d=c?"Top":"Left",h=d.toLowerCase(),x=c?"left":"top",B=c?"bottom":"right",v=lx(o)[p];l[B]-v<s[h]&&(t.offsets.popper[h]-=s[h]-(l[B]-v)),l[h]+v>s[B]&&(t.offsets.popper[h]+=l[h]+v-s[B]),t.offsets.popper=lr(t.offsets.popper);var A=l[h]+l[p]/2-v/2,q=Ar(t.instance.popper),Q=parseFloat(q["margin"+d]),H=parseFloat(q["border"+d+"Width"]),j=A-t.offsets.popper[h]-Q-H;return j=Math.max(Math.min(s[p]-v,j),0),t.arrowElement=o,t.offsets.arrow=(r={},Bo(r,h,Math.round(j)),Bo(r,x,""),r),t}function mI(t){return t==="end"?"start":t==="start"?"end":t}function ex(t){var e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!1,r=jc.indexOf(t),o=jc.slice(r+1).concat(jc.slice(0,r));return e?o.reverse():o}function gI(t,e){if(px(t.instance.modifiers,"inner")||t.flipped&&t.placement===t.originalPlacement)return t;var r=eu(t.instance.popper,t.instance.reference,e.padding,e.boundariesElement,t.positionFixed),o=t.placement.split("-")[0],n=Us(o),i=t.placement.split("-")[1]||"",s=[];switch(e.behavior){case Kc.FLIP:s=[o,n];break;case Kc.CLOCKWISE:s=ex(o);break;case Kc.COUNTERCLOCKWISE:s=ex(o,!0);break;default:s=e.behavior}return s.forEach(function(l,c){if(o!==l||s.length===c+1)return t;o=t.placement.split("-")[0],n=Us(o);var p=t.offsets.popper,d=t.offsets.reference,h=Math.floor,x=o==="left"&&h(p.right)>h(d.left)||o==="right"&&h(p.left)<h(d.right)||o==="top"&&h(p.bottom)>h(d.top)||o==="bottom"&&h(p.top)<h(d.bottom),B=h(p.left)<h(r.left),v=h(p.right)>h(r.right),A=h(p.top)<h(r.top),q=h(p.bottom)>h(r.bottom),Q=o==="left"&&B||o==="right"&&v||o==="top"&&A||o==="bottom"&&q,H=["top","bottom"].indexOf(o)!==-1,j=!!e.flipVariations&&(H&&i==="start"&&B||H&&i==="end"&&v||!H&&i==="start"&&A||!H&&i==="end"&&q),we=!!e.flipVariationsByContent&&(H&&i==="start"&&v||H&&i==="end"&&B||!H&&i==="start"&&q||!H&&i==="end"&&A),U=j||we;(x||Q||U)&&(t.flipped=!0,(x||Q)&&(o=s[c+1]),U&&(i=mI(i)),t.placement=o+(i?"-"+i:""),t.offsets.popper=rt({},t.offsets.popper,cx(t.instance.popper,t.offsets.reference,t.placement)),t=ux(t.instance.modifiers,t,"flip"))}),t}function hI(t){var e=t.offsets,r=e.popper,o=e.reference,n=t.placement.split("-")[0],i=Math.floor,s=["top","bottom"].indexOf(n)!==-1,l=s?"right":"bottom",c=s?"left":"top",p=s?"width":"height";return r[l]<i(o[c])&&(t.offsets.popper[c]=i(o[c])-r[p]),r[c]>i(o[l])&&(t.offsets.popper[c]=i(o[l])),t}function bI(t,e,r,o){var n=t.match(/((?:\-|\+)?\d*\.?\d*)(.*)/),i=+n[1],s=n[2];if(!i)return t;if(s.indexOf("%")===0){var l=void 0;switch(s){case"%p":l=r;break;case"%":case"%r":default:l=o}var c=lr(l);return c[e]/100*i}else if(s==="vh"||s==="vw"){var p=void 0;return s==="vh"?p=Math.max(document.documentElement.clientHeight,window.innerHeight||0):p=Math.max(document.documentElement.clientWidth,window.innerWidth||0),p/100*i}else return i}function xI(t,e,r,o){var n=[0,0],i=["right","left"].indexOf(o)!==-1,s=t.split(/(\+|\-)/).map(function(d){return d.trim()}),l=s.indexOf($n(s,function(d){return d.search(/,|\s/)!==-1}));s[l]&&s[l].indexOf(",")===-1&&console.warn("Offsets separated by white space(s) are deprecated, use a comma (,) instead.");var c=/\s*,\s*|\s+/,p=l!==-1?[s.slice(0,l).concat([s[l].split(c)[0]]),[s[l].split(c)[1]].concat(s.slice(l+1))]:[s];return p=p.map(function(d,h){var x=(h===1?!i:i)?"height":"width",B=!1;return d.reduce(function(v,A){return v[v.length-1]===""&&["+","-"].indexOf(A)!==-1?(v[v.length-1]=A,B=!0,v):B?(v[v.length-1]+=A,B=!1,v):v.concat(A)},[]).map(function(v){return bI(v,x,e,r)})}),p.forEach(function(d,h){d.forEach(function(x,B){ru(x)&&(n[h]+=x*(d[B-1]==="-"?-1:1))})}),n}function yI(t,e){var r=e.offset,o=t.placement,n=t.offsets,i=n.popper,s=n.reference,l=o.split("-")[0],c=void 0;return ru(+r)?c=[+r,0]:c=xI(r,i,s,l),l==="left"?(i.top+=c[0],i.left-=c[1]):l==="right"?(i.top+=c[0],i.left+=c[1]):l==="top"?(i.left+=c[0],i.top-=c[1]):l==="bottom"&&(i.left+=c[0],i.top+=c[1]),t.popper=i,t}function vI(t,e){var r=e.boundariesElement||To(t.instance.popper);t.instance.reference===r&&(r=To(r));var o=tu("transform"),n=t.instance.popper.style,i=n.top,s=n.left,l=n[o];n.top="",n.left="",n[o]="";var c=eu(t.instance.popper,t.instance.reference,e.padding,r,t.positionFixed);n.top=i,n.left=s,n[o]=l,e.boundaries=c;var p=e.priority,d=t.offsets.popper,h={primary:function(B){var v=d[B];return d[B]<c[B]&&!e.escapeWithReference&&(v=Math.max(d[B],c[B])),Bo({},B,v)},secondary:function(B){var v=B==="right"?"left":"top",A=d[v];return d[B]>c[B]&&!e.escapeWithReference&&(A=Math.min(d[v],c[B]-(B==="right"?d.width:d.height))),Bo({},v,A)}};return p.forEach(function(x){var B=["left","top"].indexOf(x)!==-1?"primary":"secondary";d=rt({},d,h[B](x))}),t.offsets.popper=d,t}function wI(t){var e=t.placement,r=e.split("-")[0],o=e.split("-")[1];if(o){var n=t.offsets,i=n.reference,s=n.popper,l=["bottom","top"].indexOf(r)!==-1,c=l?"left":"top",p=l?"width":"height",d={start:Bo({},c,i[c]),end:Bo({},c,i[c]+i[p]-s[p])};t.offsets.popper=rt({},s,d[o])}return t}function TI(t){if(!mx(t.instance.modifiers,"hide","preventOverflow"))return t;var e=t.offsets.reference,r=$n(t.instance.modifiers,function(o){return o.name==="preventOverflow"}).boundaries;if(e.bottom<r.top||e.left>r.right||e.top>r.bottom||e.right<r.left){if(t.hide===!0)return t;t.hide=!0,t.attributes["x-out-of-boundaries"]=""}else{if(t.hide===!1)return t;t.hide=!1,t.attributes["x-out-of-boundaries"]=!1}return t}function kI(t){var e=t.placement,r=e.split("-")[0],o=t.offsets,n=o.popper,i=o.reference,s=["left","right"].indexOf(r)!==-1,l=["top","left"].indexOf(r)===-1;return n[s?"left":"top"]=i[r]-(l?n[s?"width":"height"]:0),t.placement=Us(e),t.offsets.popper=lr(n),t}var Nn,VF,WF,jF,Zb,Xb,ZF,XF,Bo,rt,pI,gx,jc,Kc,BI,_I,Ws,SI,bx=ae(()=>{Nn=typeof window<"u"&&typeof document<"u"&&typeof navigator<"u",VF=(function(){for(var t=["Edge","Trident","Firefox"],e=0;e<t.length;e+=1)if(Nn&&navigator.userAgent.indexOf(t[e])>=0)return 1;return 0})();WF=Nn&&window.Promise,jF=WF?GF:UF;Zb=Nn&&!!(window.MSInputMethodContext&&document.documentMode),Xb=Nn&&/MSIE 10/.test(navigator.userAgent);ZF=function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")},XF=(function(){function t(e,r){for(var o=0;o<r.length;o++){var n=r[o];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(e,r,o){return r&&t(e.prototype,r),o&&t(e,o),e}})(),Bo=function(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t},rt=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var r=arguments[e];for(var o in r)Object.prototype.hasOwnProperty.call(r,o)&&(t[o]=r[o])}return t};pI=Nn&&/Firefox/i.test(navigator.userAgent);gx=["auto-start","auto","auto-end","top-start","top","top-end","right-start","right","right-end","bottom-end","bottom","bottom-start","left-end","left","left-start"],jc=gx.slice(3);Kc={FLIP:"flip",CLOCKWISE:"clockwise",COUNTERCLOCKWISE:"counterclockwise"};BI={shift:{order:100,enabled:!0,fn:wI},offset:{order:200,enabled:!0,fn:yI,offset:0},preventOverflow:{order:300,enabled:!0,fn:vI,priority:["left","right","top","bottom"],padding:5,boundariesElement:"scrollParent"},keepTogether:{order:400,enabled:!0,fn:hI},arrow:{order:500,enabled:!0,fn:fI,element:"[x-arrow]"},flip:{order:600,enabled:!0,fn:gI,behavior:"flip",padding:5,boundariesElement:"viewport",flipVariations:!1,flipVariationsByContent:!1},inner:{order:700,enabled:!1,fn:kI},hide:{order:800,enabled:!0,fn:TI},computeStyle:{order:850,enabled:!0,fn:dI,gpuAcceleration:!0,x:"bottom",y:"right"},applyStyle:{order:900,enabled:!0,fn:lI,onLoad:cI,gpuAcceleration:void 0}},_I={placement:"bottom",positionFixed:!1,eventsEnabled:!0,removeOnDestroy:!1,onCreate:function(){},onUpdate:function(){},modifiers:BI},Ws=(function(){function t(e,r){var o=this,n=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{};ZF(this,t),this.scheduleUpdate=function(){return requestAnimationFrame(o.update)},this.update=jF(this.update.bind(this)),this.options=rt({},t.Defaults,n),this.state={isDestroyed:!1,isCreated:!1,scrollParents:[]},this.reference=e&&e.jquery?e[0]:e,this.popper=r&&r.jquery?r[0]:r,this.options.modifiers={},Object.keys(rt({},t.Defaults.modifiers,n.modifiers)).forEach(function(s){o.options.modifiers[s]=rt({},t.Defaults.modifiers[s]||{},n.modifiers?n.modifiers[s]:{})}),this.modifiers=Object.keys(this.options.modifiers).map(function(s){return rt({name:s},o.options.modifiers[s])}).sort(function(s,l){return s.order-l.order}),this.modifiers.forEach(function(s){s.enabled&&tx(s.onLoad)&&s.onLoad(o.reference,o.popper,o.options,s,o.state)}),this.update();var i=this.options.eventsEnabled;i&&this.enableEventListeners(),this.state.eventsEnabled=i}return XF(t,[{key:"update",value:function(){return tI.call(this)}},{key:"destroy",value:function(){return rI.call(this)}},{key:"enableEventListeners",value:function(){return nI.call(this)}},{key:"disableEventListeners",value:function(){return sI.call(this)}}]),t})();Ws.Utils=(typeof window<"u"?window:global).PopperUtils;Ws.placements=gx;Ws.Defaults=_I;SI=Ws});var So=y(cr=>{"use strict";Object.defineProperty(cr,"__esModule",{value:!0});cr.PopupControl=void 0;cr.setPopupToFunc=nu;cr.setPopupToAttach=FI;cr.setPopupToCreateDom=II;cr.popupOpen=CI;var Oe=(z(),er(sr)),xx=Uc(),js=Yb(),EI=(bx(),er(hx));function nu(t,e,r){let o=r.controller;return o||(o=Hn.create(null),Oe.dom.autoDisposeElem(t,o)),o.attachElem(t,e,r),o}function FI(t,e,r){let o={content:e,dispose:js};return nu(t,()=>o,r)}function II(t,e,r){function o(n){let i=e(n);function s(){(0,Oe.domDispose)(i)}return{content:i,dispose:s}}return nu(t,o,r)}function CI(t,e,r){function o(i){let s=e(i);function l(){(0,Oe.domDispose)(s),n.dispose()}return{content:s,dispose:l}}let n=Hn.create(null);return n.attachElem(t,o,Object.assign(Object.assign({attach:"body",boundaries:"viewport"},r),{trigger:void 0})),n.open(),n}var Hn=class extends Oe.Disposable{constructor(){super(),this._holder=Oe.Holder.create(this),this._open=js,this._close=js,this._showDelay=0,this._hideDelay=0,this.onDispose(()=>{this._openTimer&&clearTimeout(this._openTimer),this._closeTimer&&clearTimeout(this._closeTimer)})}attachElem(e,r,o){if(this._showDelay=o.showDelay||0,this._hideDelay=o.hideDelay||0,this._open=n=>{this._openTimer=void 0,xx(n,o),ou.create(this._holder,e,r,n,this)},this._close=()=>{this._closeTimer=void 0,this._holder.clear()},o.trigger)for(let n of o.trigger)if(typeof n=="function")n(e,this);else if(typeof n=="object"&&"keys"in n)Oe.dom.onElem(e,"keydown",i=>{n.keys.includes(i.key)&&(i.preventDefault(),this.toggle())});else switch(n){case"click":Oe.dom.onElem(e,"click",()=>this.toggle());break;case"contextmenu":Oe.dom.onElem(e,"contextmenu",i=>{i.preventDefault(),this.open()}),Oe.dom.onElem(e,"click",()=>this.close());break;case"focus":Oe.dom.onElem(e,"focus",()=>this.open()),Oe.dom.onElem(e,"blur",()=>this.close());break;case"hover":Oe.dom.onElem(e,"mouseenter",()=>this.open()),Oe.dom.onElem(e,"mouseleave",()=>this.close());break}}open(e={},r=!1){var o;let n=(o=e.showDelay)!==null&&o!==void 0?o:this._showDelay;this._closeTimer&&(clearTimeout(this._closeTimer),this._closeTimer=void 0),(r||this._holder.isEmpty()&&!this._openTimer)&&(this._openTimer=setTimeout(()=>this._open(e),n))}close(e=this._hideDelay){this._openTimer&&(clearTimeout(this._openTimer),this._openTimer=void 0),this._closeTimer=setTimeout(this._close,e)}toggle(){this._holder.isEmpty()?this.open({},!0):this.close()}isOpen(){return!this._holder.isEmpty()}update(){let e=this._holder.get();e&&e.update()}};cr.PopupControl=Hn;var ou=class extends Oe.Disposable{constructor(e,r,o,n){super(),this._triggerElem=e,this._ctl=n,this.wipeOnDispose();let i=this.autoDispose(r(this,o)),{content:s,onRemove:l=js}=i,c=AI(e,o.attach||null);c&&(c.appendChild(s),this.onDispose(()=>{l.call(i),s.remove()}));let p={placement:o.placement||"bottom",modifiers:o.boundaries?xx(o.modifiers,{flip:{boundariesElement:o.boundaries},preventOverflow:{boundariesElement:o.boundaries}}):o.modifiers};this._popper=new EI.default(e,s,p),this.onDispose(()=>this._popper.destroy()),this.setOpenClass(e);let d=h=>{let x=h.target;x&&!s.contains(x)&&!e.contains(x)&&this.dispose()};this.autoDispose(Oe.dom.onElem(document,"click",d,{useCapture:!0})),this.autoDispose(Oe.dom.onElem(document,"contextmenu",d,{useCapture:!0}))}close(e){this.isDisposed()||this._ctl.close(e)}setOpenClass(e,r="weasel-popup-open"){e.classList.add(r),this.onDispose(()=>e.classList.remove(r))}getTriggerElem(){return this._triggerElem}update(){this._popper.scheduleUpdate()}};function AI(t,e){return typeof e=="string"?t.closest(e):e||t.parentNode}});var Zs=y(P=>{"use strict";Object.defineProperty(P,"__esModule",{value:!0});P.cssExpandIcon=P.cssMenuDivider=P.cssMenuItemLink=P.cssMenuGroup=P.cssMenuItem=P.cssMenu=P.cssMenuWrap=P.InputMenu=P.Menu=P.BaseMenu=P.defaultMenuOptions=P.menuItemCheckbox=void 0;P.menu=wx;P.menuElem=Tx;P.inputMenu=PI;P.inputMenuElem=kx;P.menuItem=LI;P.menuItemLink=NI;P.menuGroup=RI;P.updateListAria=_x;P.isSelectable=zn;P.menuItemSubmenu=qI;var ge=(z(),er(sr)),ur=(z(),er(sr)),OI=Uc(),DI=Gc(),iu=jb(),vx=So(),su="weasel-element-";function wx(t,e){return r=>Tx(r,t,e)}function Tx(t,e,r={}){return Bx((...o)=>Ks.create(...o),t,e,r)}function PI(t,e){return r=>kx(r,t,e)}function kx(t,e,r={}){return Bx((...o)=>Ys.create(...o),t,e,r)}function Bx(t,e,r,o={}){var n;o=DI({},P.defaultMenuOptions,o,(s,l)=>Array.isArray(l)?l:void 0),e.tagName.toLowerCase()==="input"||(e.id||(e.id=iu(su)),!((n=o.trigger)===null||n===void 0)&&n.some(l=>{var c;return l==="click"||typeof l=="object"&&((c=l.keys)===null||c===void 0?void 0:c.includes("Enter"))})&&e.setAttribute("aria-expanded","false")),(0,vx.setPopupToFunc)(e,(s,l)=>t(null,s,r(s),OI(l,o)),o)}function LI(t,...e){let r=(o,n)=>{Vn(n)?o.preventDefault():t(n,o)};return(0,P.cssMenuItem)({role:"menuitem"},...e,ge.dom.on("click",r),(0,ur.onKeyDown)({Enter$:r}))}var MI=(t,...e)=>{let r=(o,n)=>{if(Vn(n)){o.preventDefault();return}o.target instanceof Element&&o.target.closest("label")!==null&&o.target.tagName!=="INPUT"&&o.preventDefault(),t.set(!t.get())};return(0,P.cssMenuItem)({role:"menuitemcheckbox"},ge.dom.attr("aria-checked",o=>o(t)?"true":"false"),...e,ge.dom.on("click",r),(0,ur.onKeyDown)({Enter$:r," $":(o,n)=>{o.preventDefault(),r(o,n)}}))};P.menuItemCheckbox=MI;function NI(...t){let e=(r,o)=>{if(Vn(o)){r.preventDefault();return}};return(0,P.cssMenuItemLink)({tabindex:"-1",role:"menuitem"},P.cssMenuItem.cls(""),...t,ge.dom.on("click",e),(0,ur.onKeyDown)({Enter$:(r,o)=>(r.stopPropagation(),e(r,o))}))}function RI(t,...e){let r=iu(su);return(0,P.cssMenuGroup)({role:"group","aria-labelledby":r},(0,ge.dom)("div",{id:r,role:"presentation"},t),...e)}P.defaultMenuOptions={attach:"body",boundaries:"viewport",placement:"bottom-start",showDelay:0,trigger:["click",{keys:["Enter"]}],modifiers:{computeStyle:{gpuAcceleration:!1}}};function _x(t,e,r,o){r.id||(r.id=iu(su)),r.setAttribute("role",o.role),o.role==="listbox"&&r.setAttribute("aria-orientation","vertical"),e.hasAttribute("aria-expanded")&&e.setAttribute("aria-expanded","true"),e.setAttribute("aria-controls",r.id),e.setAttribute("aria-owns",r.id),o.role==="menu"&&e.id&&!r.getAttribute("aria-labelledby")&&r.setAttribute("aria-labelledby",e.id),t.onDispose(()=>{e.hasAttribute("aria-expanded")&&e.setAttribute("aria-expanded","false"),e.removeAttribute("aria-controls"),e.removeAttribute("aria-owns")})}var qn=class extends ur.Disposable{constructor(e,r,o={}){super(),this.ctl=e,this._selected=null,this._focusOnSelected=!0;let n=o.stretchToSelector?e.getTriggerElem().closest(o.stretchToSelector):null;if(o&&o.parentSelectorToMark){let i=e.getTriggerElem().closest(o.parentSelectorToMark);i&&e.setOpenClass(i)}this._allowNothingSelected=!!o.allowNothingSelected,this.content=(0,P.cssMenuWrap)({class:o.menuWrapCssClass||""},this._menuContent=(0,P.cssMenu)({class:o.menuCssClass||""},r,n?i=>HI(i,n):null,zI(i=>this._onMouseOver(i)),ge.dom.on("mouseleave",i=>this._onMouseLeave(i)),(0,ur.onKeyDown)({ArrowDown:()=>this.nextIndex(),ArrowUp:()=>this.prevIndex(),ArrowLeft:o.isSubMenu?()=>e.close(0):()=>{},ArrowRight:()=>{}}),i=>{var s;return(s=o.modifyContent)===null||s===void 0?void 0:s.call(o,i,e)}),ge.dom.on("click",i=>{let s=yx(i.target);s&&zn(s)?s.getAttribute("role")!=="menuitemcheckbox"&&e.close(0):i.stopPropagation()}),(0,ur.onKeyDown)(Object.assign({Escape:()=>e.close(0)},o.isSubMenu?{}:{Enter:()=>e.close(0),Tab:i=>{i.preventDefault(),i.stopPropagation()}}))),this.onDispose(()=>(0,ge.domDispose)(this.content))}onRemove(){this.content.contains(document.activeElement)&&this.ctl.getTriggerElem().focus()}nextIndex(){let e=this._getSelectables();if(!e.length)return;let r=this._getNextSelectable(this._selected,o=>this._findSibling(o,this._getMenuItems(),"next"),e[0]);this.setSelected(r)}prevIndex(){let e=this._getSelectables();if(!e.length)return;let r=this._getNextSelectable(this._selected,o=>this._findSibling(o,this._getMenuItems(),"prev"),e[e.length-1]);this.setSelected(r)}_findSibling(e,r,o){if(!e)return null;let n=r.indexOf(e);return r[n+(o==="next"?1:-1)]}setSelected(e){let r=this._selected;if(e!==r){if(r){let o=ge.dom.getData(r,"menuItemSelected");o&&o(!1,r),r.classList.remove(P.cssMenuItem.className+"-sel")}if(e){let o=ge.dom.getData(e,"menuItemSelected");o&&o(!0,e),e.classList.add(P.cssMenuItem.className+"-sel")}this._selected=e,this._focusOnSelected&&(e||this._menuContent).focus()}}set focusOnSelected(e){this._focusOnSelected=e}_onMouseOver(e){if(!$I(e.target)){let r=yx(e.target);this.setSelected(r&&zn(r)?r:null)}}_onMouseLeave(e){let r=this._selected;r&&!r.classList.contains("weasel-popup-open")&&this.setSelected(null)}_getMenuItems(){return Array.from(this._menuContent.querySelectorAll("[tabindex]")).filter(Sx)}_getSelectables(){return this._getMenuItems().filter(zn)}_getNextSelectable(e,r,o){let n=this._getNext(e,r,o);for(;n&&n!==e&&!zn(n);)n=this._getNext(n,r,o);return n}_getNext(e,r,o){return e?r(e)||(this._allowNothingSelected?null:o):o}};P.BaseMenu=qn;var Ks=class extends qn{constructor(e,r,o={}){super(e,r,o),_x(this,e.getTriggerElem(),this._menuContent,{role:"menu"}),setTimeout(()=>o.selectOnOpen?this.nextIndex():this._menuContent.focus(),0)}};P.Menu=Ks;var Ys=class extends qn{constructor(e,r,o={}){super(e,r,o),this.autoDispose((0,ur.onKeyElem)(e.getTriggerElem(),"keydown",{ArrowDown:()=>this.nextIndex(),ArrowUp:()=>this.prevIndex(),Escape:()=>e.close(0)}))}};P.InputMenu=Ys;function $I(t){return t&&t.classList.contains(P.cssMenu.className)}function Sx(t){return t.hasAttribute("tabIndex")&&["menuitem","menuitemcheckbox","option"].includes(t.getAttribute("role")||"")&&t.offsetHeight>0}function zn(t){return Sx(t)&&!Vn(t)}function Vn(t){return t?.classList.contains("disabled")||t?.getAttribute("aria-disabled")==="true"}function yx(t){return t.closest(`.${P.cssMenu.className} :is([role="menuitem"], [role="menuitemcheckbox"], [role="option"])`)}function HI(t,e){let r=t.style;r.minWidth=e.getBoundingClientRect().width+"px",r.marginLeft=r.marginRight="0"}function zI(t){return e=>{let r=ge.dom.onElem(e,"mousemove",(...o)=>{r.dispose(),ge.dom.onElem(e,"mouseover",t),t(...o)})}}function qI(t,e,...r){let o=vx.PopupControl.create(null),n=Object.assign({placement:"right-start",trigger:[],modifiers:{preventOverflow:{padding:10}},boundaries:"viewport",controller:o,attach:"."+P.cssMenuWrap.className,isSubMenu:!0},e);return(0,P.cssMenuItem)(...r,e.expandIcon?e.expandIcon():(0,P.cssExpandIcon)(),ge.dom.autoDispose(o),{role:"menuitem","aria-expanded":"false"},wx(t,n),ge.dom.on("mouseenter",()=>o.open({showDelay:200})),(0,ur.onKeyDown)({ArrowRight:()=>o.open({selectOnOpen:!0}),Enter:()=>o.open({selectOnOpen:!0})}),i=>ge.dom.dataElem(i,"menuItemSelected",s=>s||o.close()),ge.dom.on("click",(i,s)=>{e.action&&!Vn(s)?e.action(s,i):i.stopPropagation()}))}P.cssMenuWrap=(0,ge.styled)("div",`
  position: absolute;
  display: flex;
  flex-direction: column;
  outline: none;
`);P.cssMenu=(0,ge.styled)("ul",`
  max-height: calc(95vh - 10px);
  box-sizing: border-box;
  overflow: auto;
  outline: none;
  list-style: none;
  margin: 2px;
  text-align: left;
  font-size: 13px;
  font-family: sans-serif;
  background-color: white;
  color: #1D1729;
  min-width: 160px;
  border: none;
  border-radius: 2px;
  box-shadow: 0 0 2px rgba(0,0,0,0.5);
  padding: 6px 0;
`);P.cssMenuItem=(0,ge.styled)("li",`
  display: flex;
  justify-content: space-between;
  outline: none;
  padding: var(--weaseljs-menu-item-padding, 8px 24px);

  &-sel {
    cursor: pointer;
    background-color: var(--weaseljs-selected-background-color, #5AC09C);
    color:            var(--weaseljs-selected-color, white);
  }
  &.disabled, &[aria-disabled="true"],
  &.disabled:hover, &[aria-disabled="true"]:hover,
  &.disabled:focus, &[aria-disabled="true"]:focus {
    color: grey;
  }
`);P.cssMenuGroup=(0,ge.styled)("div",`
  & [role="presentation"] {
    text-transform: var(--weaseljs-menu-group-text-transform, uppercase);
    padding: var(--weaseljs-menu-item-padding, 8px 24px);
  }
`);P.cssMenuItemLink=(0,ge.styled)("a",`
  display: flex;
  justify-content: space-between;
  outline: none;
  padding: var(--weaseljs-menu-item-padding, 8px 24px);
  user-select: none;
  -moz-user-select: none;

  &, &:hover, &:focus {
    color: inherit;
    text-decoration: none;
    outline: none;
  }
  &.${P.cssMenuItem.className}-sel {
    color: var(--weaseljs-selected-color, white);
  }
  &.disabled, &[aria-disabled="true"] {
    cursor: default;
  }
`);P.cssMenuDivider=(0,ge.styled)((...t)=>(0,ge.dom)("div",{"aria-hidden":"true"},...t),`
  height: 1px;
  width: 100%;
  margin: 4px 0;
  background-color: #D9D9D9;
`);P.cssExpandIcon=(0,ge.styled)("div.weasel-popup-expand-icon",`
  flex: none;
  margin-right: -20px;
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-top: -2px;
  &:after {
    content: '\u25B6\uFE0E';
    display: inline-block;
    text-align: center;
    width: 16px;
    height: 16px;
    font-size: 8px;
  }
`)});var Ex=y(cu=>{"use strict";Object.defineProperty(cu,"__esModule",{value:!0});cu.autocomplete=UI;var Or=(z(),er(sr)),au=Zs(),VI=So(),GI=(t,e)=>e?(e=e.toLowerCase(),t.find(r=>r.textContent.toLowerCase().startsWith(e))||null):null;function UI(t,e,r={}){let o=Object.assign(Object.assign(Object.assign({},au.defaultMenuOptions),{trigger:[(i,s)=>{Or.dom.onElem(i,"focus",()=>s.open()),Or.dom.onKeyElem(i,"keydown",{ArrowDown:()=>s.open(),ArrowUp:()=>s.open()})}],stretchToSelector:"input, textarea"}),r),n=()=>[Or.dom.forEach(e,i=>(0,au.menuItem)(()=>{t.value=i,r.onClick&&r.onClick(i)},i))];return(0,VI.setPopupToFunc)(t,i=>lu.create(null,i,n(),o),o),t}var lu=class extends au.BaseMenu{constructor(e,r,o){super(e,r,o),this._rows=Array.from(this._menuContent.children),this.focusOnSelected=!1,this._findMatch=o.findMatch||GI;let n=e.getTriggerElem();this._lastAsTyped=n.value,this.autoDispose(Or.dom.onElem(n,"input",()=>{this._lastAsTyped=n.value})),this.autoDispose((0,Or.onKeyElem)(n,"keydown",{ArrowDown:()=>{this.nextIndex(),this._updateValue(n)},ArrowUp:()=>{this.prevIndex(),this._updateValue(n)},Enter$:i=>{this._updateValue(n),e.close()},Tab$:i=>{this._updateValue(n),e.close()},Escape$:()=>e.close()})),this.autoDispose((0,Or.onElem)(n,"input",()=>{this._selectRow(n.value)})),n.value&&this._selectRow(n.value),Or.dom.onElem(this._menuContent,"mousedown",i=>i.preventDefault())}_selectRow(e){let r=this._findMatch(this._rows,e);this.setSelected(r)}_updateValue(e){e.value=this._selected?this._selected.textContent:this._lastAsTyped}}});var Ix=y(Js=>{"use strict";Object.defineProperty(Js,"__esModule",{value:!0});Js.select=KI;Js.getOptionFull=Eo;var pt=(z(),er(sr)),WI=(z(),er(sr)),Gn=Zs(),jI=So();function KI(t,e,r={},o=(n=>n.label)){let n=new Xs(e),i=WI.Computed.create(null,t,(d,h)=>{let B=(Array.isArray(e)?e:d(e)).find(v=>h===Eo(v).value);return B?Eo(B):{value:null,label:r.defaultLabel||""}}),s=Fx({tabIndex:"0",type:"button",class:r.buttonCssClass||"","aria-haspopup":"listbox","aria-expanded":"false"},pt.dom.autoDispose(i),r.disabled?pt.dom.cls("disabled",r.disabled):null,YI(pt.dom.domComputed(i,d=>o(d))),(0,pt.dom)("div",{"aria-hidden":"true",style:"flex: none;"},r.buttonArrow),pt.dom.on("keydown",d=>{if(l()||d.getModifierState("Control")||d.getModifierState("Alt")||d.getModifierState("Meta"))return;let h=n.add(d.key);h&&t.set(h.value)})),l=()=>s.classList.contains("disabled"),c=Object.assign(Object.assign({},Gn.defaultMenuOptions),{menuCssClass:r.menuCssClass,modifyContent:r.modifyContent,menuWrapCssClass:r.menuWrapCssClass,attach:r.attach===void 0?Gn.defaultMenuOptions.attach:r.attach,trigger:[(d,h)=>{pt.dom.onElem(d,"click",()=>l()||h.toggle()),pt.dom.onKeyElem(d,"keydown",{ArrowDown:()=>l()||h.open(),ArrowUp:()=>l()||h.open(),Enter:()=>l()||h.open()})}],selectLabelOnOpen:()=>i.get().label,stretchToSelector:`.${Fx.className}`}),p=()=>[pt.dom.forEach(e,d=>{let h=Eo(d),x=h.value===t.get();return(0,Gn.menuItem)(()=>{t.set(h.value)},Object.assign(Object.assign({disabled:h.disabled},h.disabled?{class:"disabled"}:{}),{selected:x,"aria-disabled":h.disabled?"true":void 0,"aria-selected":x?"true":"false",role:"option"}),o(h))})];return(0,jI.setPopupToFunc)(s,d=>uu.create(null,d,p(),c),c),s}var uu=class extends Gn.BaseMenu{constructor(e,r,o={}){super(e,r,o),this._selectRows=Array.from(this._menuContent.children),this._selectOptions=this._selectRows.map(i=>({label:i.textContent||"",value:i.textContent||"",disabled:i.classList.contains("disabled")})),this._keyState=new Xs(this._selectOptions),(0,Gn.updateListAria)(this,e.getTriggerElem(),this._menuContent,{role:"listbox"}),(0,pt.onElem)(this._menuContent,"keydown",i=>{if(i.getModifierState("Control")||i.getModifierState("Alt")||i.getModifierState("Meta"))return;let s=this._keyState.add(i.key);s&&this._selectRow(s.label)});let n=o.selectLabelOnOpen?o.selectLabelOnOpen():"";setTimeout(()=>this._selectRow(n,!0),0)}_selectRow(e,r=!1){let o=this._selectRows.find(n=>n.textContent===e);return o||!r?this.setSelected(o||null):this.nextIndex()}},Xs=class{constructor(e){this._itemArray=e,this._term="",this._cycleIndex=0,this._timeoutId=null}add(e){if(e.length>1)return null;e=e.toLowerCase(),this._timeoutId&&clearTimeout(this._timeoutId),this._timeoutId=setTimeout(()=>{this._term=""},1e3),this._term.length===1&&e===this._term[0]?this._cycleIndex+=1:(this._term+=e,this._cycleIndex=0);let o=(Array.isArray(this._itemArray)?this._itemArray:this._itemArray.get()).filter(n=>(n=Eo(n),!n.disabled&&n.label.toLowerCase().startsWith(this._term)));return o.length>0?(this._cycleIndex%=o.length,Eo(o[this._cycleIndex])):null}};function Eo(t){return typeof t=="string"?{value:t,label:t}:t}var YI=(0,pt.styled)("div",`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`),Fx=(0,pt.styled)("button",`
  margin: 0;
  font: inherit;
  letter-spacing: inherit;
  opacity: 1;
  position: relative;
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 30px;
  line-height: 30px;
  background-color: white;
  color: black;
  padding: 6px;
  border: 1px solid grey;
  border-radius: 3px;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  -webkit-appearance: none;
  -moz-appearance: none;
  user-select: none;
  -moz-user-select: none;

  &:focus {
    outline: none;
    box-shadow: 0px 0px 2px 2px #5E9ED6;
  }

  &.disabled {
    color: grey;
    cursor: pointer;
  }
`)});var Ox=y((JM,Ax)=>{var ZI=zs(),XI=ho(),JI=Vc(),QI=Vs(),Cx=Object.prototype,eC=Cx.hasOwnProperty,tC=ZI(function(t,e){t=Object(t);var r=-1,o=e.length,n=o>2?e[2]:void 0;for(n&&JI(e[0],e[1],n)&&(o=1);++r<o;)for(var i=e[r],s=QI(i),l=-1,c=s.length;++l<c;){var p=s[l],d=t[p];(d===void 0||XI(d,Cx[p])&&!eC.call(t,p))&&(t[p]=i[p])}return t});Ax.exports=tC});var Px=y(je=>{"use strict";Object.defineProperty(je,"__esModule",{value:!0});je.darkTooltipTheme=je.cssDarkTooltip=je.defaultTooltipTheme=void 0;je.tooltip=iC;je.tooltipElem=Dx;var Wn=(z(),er(sr)),rC=Ox(),oC=So(),nC={attach:"body",boundaries:"viewport",placement:"top",showDelay:0,trigger:["hover","focus"]};function iC(t){return e=>Dx(e,t)}function Dx(t,e={}){e=rC({},e,nC),(0,oC.setPopupToCreateDom)(t,()=>sC(t,e),e)}function sC(t,e){let r=t.getAttribute("title")||e.title||"";return(e.theme||je.defaultTooltipTheme).tooltip({role:"tooltip"},aC({"x-arrow":!0}),(0,Wn.dom)("div",e.content||Wn.dom.text(r)))}var Un=(0,Wn.styled)("div",`
  --tooltip-bg-color: #FFC107;
  --tooltip-arrow-size: 5px;
  position: absolute;
  background: var(--tooltip-bg-color);
  color: black;
  width: 100px;
  border-radius: 3px;
  box-shadow: 0 0 2px rgba(0,0,0,0.5);
  padding: 10px;
  text-align: center;

  &[x-placement^="bottom"] { margin-top: var(--tooltip-arrow-size); }
  &[x-placement^="top"] { margin-bottom: var(--tooltip-arrow-size); }
  &[x-placement^="left"] { margin-right: var(--tooltip-arrow-size); }
  &[x-placement^="right"] { margin-left: var(--tooltip-arrow-size); }
`),aC=(0,Wn.styled)("div",`
  position: absolute;
  width: 0;
  height: 0;
  border: solid transparent var(--tooltip-arrow-size);

  .${Un.className}[x-placement^="bottom"] & {
    border-top-width: 0;
    border-bottom-color: var(--tooltip-bg-color);
    top: calc(var(--tooltip-arrow-size) * -1);
    left: calc(50% - var(--tooltip-arrow-size));
    margin: 0 var(--tooltip-arrow-size);
  }
  .${Un.className}[x-placement^="top"] & {
    border-bottom-width: 0;
    border-top-color: var(--tooltip-bg-color);
    bottom: calc(var(--tooltip-arrow-size) * -1);
    left: calc(50% - var(--tooltip-arrow-size));
    margin: 0 var(--tooltip-arrow-size);
  }
  .${Un.className}[x-placement^="left"] & {
    border-right-width: 0;
    border-left-color: var(--tooltip-bg-color);
    right: calc(var(--tooltip-arrow-size) * -1);
    top: calc(50% - var(--tooltip-arrow-size));
    margin: var(--tooltip-arrow-size) 0;
  }
  .${Un.className}[x-placement^="right"] & {
    border-left-width: 0;
    border-right-color: var(--tooltip-bg-color);
    left: calc(var(--tooltip-arrow-size) * -1);
    top: calc(50% - var(--tooltip-arrow-size));
    margin: var(--tooltip-arrow-size) 0;
  }
`);je.defaultTooltipTheme={tooltip:Un};je.cssDarkTooltip=(0,Wn.styled)(je.defaultTooltipTheme.tooltip,`
  --tooltip-arrow-size: 6px;
  --tooltip-bg-color: black;
  color: white;
  width: auto;
  font-family: sans-serif;
  font-size: 10pt;
`);je.darkTooltipTheme={tooltip:je.cssDarkTooltip}});var Qs=y(dt=>{"use strict";var lC=dt&&dt.__createBinding||(Object.create?(function(t,e,r,o){o===void 0&&(o=r);var n=Object.getOwnPropertyDescriptor(e,r);(!n||("get"in n?!e.__esModule:n.writable||n.configurable))&&(n={enumerable:!0,get:function(){return e[r]}}),Object.defineProperty(t,o,n)}):(function(t,e,r,o){o===void 0&&(o=r),t[o]=e[r]})),jn=dt&&dt.__exportStar||function(t,e){for(var r in t)r!=="default"&&!Object.prototype.hasOwnProperty.call(e,r)&&lC(e,t,r)};Object.defineProperty(dt,"__esModule",{value:!0});jn(Ex(),dt);jn(Zs(),dt);jn(So(),dt);jn(Ix(),dt);jn(Px(),dt)});var dy=y((cR,py)=>{var YC=Wc(),uy=/[\\^$.*+?()[\]{}|]/g,ZC=RegExp(uy.source);function XC(t){return t=YC(t),t&&ZC.test(t)?t.replace(uy,"\\$&"):t}py.exports=XC});var my=y((uR,fy)=>{var JC=An();function QC(t){return typeof t=="function"?t:JC}fy.exports=QC});var by=y((pR,hy)=>{var eA=xc(),gy=1/0,tA=17976931348623157e292;function rA(t){if(!t)return t===0?t:0;if(t=eA(t),t===gy||t===-gy){var e=t<0?-1:1;return e*tA}return t===t?t:0}hy.exports=rA});var yy=y((dR,xy)=>{var oA=by();function nA(t){var e=oA(t),r=e%1;return e===e?r?e-r:e:0}xy.exports=nA});var wy=y((fR,vy)=>{var iA=Tc(),sA=my(),aA=yy(),lA=9007199254740991,_u=4294967295,cA=Math.min;function uA(t,e){if(t=aA(t),t<1||t>lA)return[];var r=_u,o=cA(t,_u);e=sA(e),t-=_u;for(var n=iA(o,e);++r<t;)e(r);return n}vy.exports=uA});var iv=y((Az,xa)=>{(function(t,e,r){if(!t)return;for(var o={8:"backspace",9:"tab",13:"enter",16:"shift",17:"ctrl",18:"alt",20:"capslock",27:"esc",32:"space",33:"pageup",34:"pagedown",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down",45:"ins",46:"del",91:"meta",93:"meta",224:"meta"},n={106:"*",107:"+",109:"-",110:".",111:"/",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"},i={"~":"`","!":"1","@":"2","#":"3",$:"4","%":"5","^":"6","&":"7","*":"8","(":"9",")":"0",_:"-","+":"=",":":";",'"':"'","<":",",">":".","?":"/","|":"\\"},s={option:"alt",command:"meta",return:"enter",escape:"esc",plus:"+",mod:/Mac|iPod|iPhone|iPad/.test(navigator.platform)?"meta":"ctrl"},l,c=1;c<20;++c)o[111+c]="f"+c;for(c=0;c<=9;++c)o[c+96]=c.toString();function p(w,E,R){if(w.addEventListener){w.addEventListener(E,R,!1);return}w.attachEvent("on"+E,R)}function d(w){if(w.type=="keypress"){var E=String.fromCharCode(w.which);return w.shiftKey||(E=E.toLowerCase()),E}return o[w.which]?o[w.which]:n[w.which]?n[w.which]:String.fromCharCode(w.which).toLowerCase()}function h(w,E){return w.sort().join(",")===E.sort().join(",")}function x(w){var E=[];return w.shiftKey&&E.push("shift"),w.altKey&&E.push("alt"),w.ctrlKey&&E.push("ctrl"),w.metaKey&&E.push("meta"),E}function B(w){if(w.preventDefault){w.preventDefault();return}w.returnValue=!1}function v(w){if(w.stopPropagation){w.stopPropagation();return}w.cancelBubble=!0}function A(w){return w=="shift"||w=="ctrl"||w=="alt"||w=="meta"}function q(){if(!l){l={};for(var w in o)w>95&&w<112||o.hasOwnProperty(w)&&(l[o[w]]=w)}return l}function Q(w,E,R){return R||(R=q()[w]?"keydown":"keypress"),R=="keypress"&&E.length&&(R="keydown"),R}function H(w){return w==="+"?["+"]:(w=w.replace(/\+{2}/g,"+plus"),w.split("+"))}function j(w,E){var R,de,Qe,be=[];for(R=H(w),Qe=0;Qe<R.length;++Qe)de=R[Qe],s[de]&&(de=s[de]),E&&E!="keypress"&&i[de]&&(de=i[de],be.push("shift")),A(de)&&be.push(de);return E=Q(de,be,E),{key:de,modifiers:be,action:E}}function we(w,E){return w===null||w===e?!1:w===E?!0:we(w.parentNode,E)}function U(w){var E=this;if(w=w||e,!(E instanceof U))return new U(w);E.target=w,E._callbacks={},E._directMap={};var R={},de,Qe=!1,be=!1,st=!1;function xr(M){M=M||{};var K=!1,te;for(te in R){if(M[te]){K=!0;continue}R[te]=0}K||(st=!1)}function tn(M,K,te,Y,ce,at){var D,ke,Zt=[],wt=te.type;if(!E._callbacks[M])return[];for(wt=="keyup"&&A(M)&&(K=[M]),D=0;D<E._callbacks[M].length;++D)if(ke=E._callbacks[M][D],!(!Y&&ke.seq&&R[ke.seq]!=ke.level)&&wt==ke.action&&(wt=="keypress"&&!te.metaKey&&!te.ctrlKey||h(K,ke.modifiers))){var ol=!Y&&ke.combo==ce,nl=Y&&ke.seq==Y&&ke.level==at;(ol||nl)&&E._callbacks[M].splice(D,1),Zt.push(ke)}return Zt}function Pt(M,K,te,Y){E.stopCallback(K,K.target||K.srcElement,te,Y)||M(K,te)===!1&&(B(K),v(K))}E._handleKey=function(M,K,te){var Y=tn(M,K,te),ce,at={},D=0,ke=!1;for(ce=0;ce<Y.length;++ce)Y[ce].seq&&(D=Math.max(D,Y[ce].level));for(ce=0;ce<Y.length;++ce){if(Y[ce].seq){if(Y[ce].level!=D)continue;ke=!0,at[Y[ce].seq]=1,Pt(Y[ce].callback,te,Y[ce].combo,Y[ce].seq);continue}ke||Pt(Y[ce].callback,te,Y[ce].combo)}var Zt=te.type=="keypress"&&be;te.type==st&&!A(M)&&!Zt&&xr(at),be=ke&&te.type=="keydown"};function Xr(M){typeof M.which!="number"&&(M.which=M.keyCode);var K=d(M);if(K){if(M.type=="keyup"&&Qe===K){Qe=!1;return}E.handleKey(K,x(M),M)}}function Yt(){clearTimeout(de),de=setTimeout(xr,1e3)}function rl(M,K,te,Y){R[M]=0;function ce(wt){return function(){st=wt,++R[M],Yt()}}function at(wt){Pt(te,wt,M),Y!=="keyup"&&(Qe=d(wt)),setTimeout(xr,10)}for(var D=0;D<K.length;++D){var ke=D+1===K.length,Zt=ke?at:ce(Y||j(K[D+1]).action);Xi(K[D],Zt,Y,M,D)}}function Xi(M,K,te,Y,ce){E._directMap[M+":"+te]=K,M=M.replace(/\s+/g," ");var at=M.split(" "),D;if(at.length>1){rl(M,at,K,te);return}D=j(M,te),E._callbacks[D.key]=E._callbacks[D.key]||[],tn(D.key,D.modifiers,{type:D.action},Y,M,ce),E._callbacks[D.key][Y?"unshift":"push"]({callback:K,modifiers:D.modifiers,action:D.action,seq:Y,level:ce,combo:M})}E._bindMultiple=function(M,K,te){for(var Y=0;Y<M.length;++Y)Xi(M[Y],K,te)},p(w,"keypress",Xr),p(w,"keydown",Xr),p(w,"keyup",Xr)}U.prototype.bind=function(w,E,R){var de=this;return w=w instanceof Array?w:[w],de._bindMultiple.call(de,w,E,R),de},U.prototype.unbind=function(w,E){var R=this;return R.bind.call(R,w,function(){},E)},U.prototype.trigger=function(w,E){var R=this;return R._directMap[w+":"+E]&&R._directMap[w+":"+E]({},w),R},U.prototype.reset=function(){var w=this;return w._callbacks={},w._directMap={},w},U.prototype.stopCallback=function(w,E){var R=this;return(" "+E.className+" ").indexOf(" mousetrap ")>-1||we(E,R.target)?!1:E.tagName=="INPUT"||E.tagName=="SELECT"||E.tagName=="TEXTAREA"||E.isContentEditable},U.prototype.handleKey=function(){var w=this;return w._handleKey.apply(w,arguments)},U.addKeycodes=function(w){for(var E in w)w.hasOwnProperty(E)&&(o[E]=w[E]);l=null},U.init=function(){var w=U(e);for(var E in w)E.charAt(0)!=="_"&&(U[E]=(function(R){return function(){return w[R].apply(w,arguments)}})(E))},U.init(),t.Mousetrap=U,typeof xa<"u"&&xa.exports&&(xa.exports=U),typeof define=="function"&&define.amd&&define(function(){return U})})(typeof window<"u"?window:null,typeof window<"u"?document:null)});var av=y((Oz,Uu)=>{typeof window>"u"?Uu.exports={bind:function(){},unbind:function(){}}:(Rr=iv(),Rr.addKeycodes({173:"-",93:"menu"}),qu=new WeakMap,Vu=Rr.prototype,sv=Vu.stopCallback,ya={},Vu.stopCallback=function(t,e,r,o){if(Gu)return!0;if(ya[r]||ya[o])return!1;let n=qu.get(e);if(n)return n(r);try{return sv.call(this,t,e,r,o)}catch(i){if(!document.body.contains(e))return;throw i}},Gu=!1,ui=0,Rr.setPaused=function(t){t?ui++:ui>0&&ui--,Gu=ui>0},Rr.setCustomStopCallback=function(t,e){qu.set(t,e)},Rr.markAlwaysOnShortcut=function(t){ya[t]=!0},Uu.exports=Rr);var Rr,qu,Vu,sv,ya,Gu,ui});var ls=[],aT={contextMenuCopy:["Ctrl+C"],contextMenuCut:["Ctrl+X"],contextMenuPaste:["Ctrl+V"],deleteFields:["Suppr"]},El=class{constructor(e,r=[]){this.name=e;this.humanKeys=r}run(...e){for(let r of[...ls].reverse())if((typeof r.activate=="object"?r.activate.get():r.activate??!0)&&r.handlers[this.name])return r.handlers[this.name](...e)}},lT={},Le=new Proxy(lT,{get:(t,e)=>t[e]??(t[e]=new El(e,aT[e]))});function ff(t,e,r){let o={handlers:t,activate:r};ls.push(o);let n={dispose:()=>{let i=ls.indexOf(o);i>=0&&ls.splice(i,1)}};return e?.autoDispose?.(n),n}var Bn={};as(Bn,{BUTTON_KEYS:()=>aw,Button:()=>Gi,ButtonModel:()=>Vi,Columns:()=>Wi,ColumnsModel:()=>ed,Paragraph:()=>It,ParagraphModel:()=>zu,Placeholder:()=>yt,PlaceholderModel:()=>td,Section:()=>Qp,SectionModel:()=>Jp,defaultElement:()=>Ui});z();var Ve=class t extends Me{constructor(r,o,n){super();this.parent=o;this.view=n;S(this,"id");S(this,"type");S(this,"children");S(this,"cut",I.create(this,!1));S(this,"selected");S(this,"_props",{});this.selected=ue.create(this,i=>i(n.selectedBox)===this&&i(n.viewSection.hasFocus)),this.children=this.autoDispose(ir([])),o&&o.children.autoDispose(this),this.id=r.id,this.type=r.type,St(()=>{this.update(r)}),this.onCreate()}static new(r,o,n=null){let i=`${r.type.split(":")[0]}Model`,l=Bn[i];if(!o&&!n)throw new Error("Cannot create detached box");return l?new l(r,o,n||o.view):new gc(r,o,n||o.view)}removeChild(r){let o=this.children.get().indexOf(r);if(o<0)throw new Error("Cannot remove box that is not in parent");this.children.splice(o,1)}removeSelf(){this.parent?.removeChild(this)}async deleteSelf(){let r=this.parent;this.removeSelf(),await r.save()}async copySelf(){[...this.root().traverse()].forEach(r=>r?.cut.set(!1)),await navigator.clipboard.writeText(JSON.stringify(this.toJSON()))}async cutSelf(){await this.copySelf(),this.cut.set(!0)}willAccept(r){return this.parent&&r instanceof t&&this.parent===r?.parent&&r.parent?.type==="Columns"?"swap":this.parent?.type==="Columns"?null:"sibling"}accept(r,o="above"){if(!r||r.id===this.id)return null;let n=r.id,i=n?this.root().find(n):null;return i&&i.removeSelf(),o==="above"?this.placeBeforeMe()(r):this.placeAfterMe()(r)}prop(r,o){return this._props[r]||(this._props[r]=I.create(this,o??null)),this._props[r]}hasProp(r){return this._props.hasOwnProperty(r)}async save(r){if(!this.parent)throw new Error("Cannot save detached box");return this.parent.save(r)}replaceAtIndex(r,o){let n=t.new(r,this);return this.children.splice(o,1,n),n}swap(r,o){let n=this.children.get().indexOf(r),i=this.children.get().indexOf(o);if(n<0||i<0)throw new Error("Cannot swap boxes that are not in parent");let s=r.toJSON(),l=o.toJSON();this.replace(r,l),this.replace(o,s)}append(r){let o=t.new(r,this);return this.children.push(o),o}insert(r,o){let n=t.new(r,this);return this.children.splice(o,0,n),n}replace(r,o){let n=this.children.get().indexOf(r);if(n<0)throw new Error("Cannot replace box that is not in parent");let i=o instanceof t?o:t.new(o,this);return i.parent=this,i.view=this.view,this.children.splice(n,1,i),i}placeBeforeFirstChild(){return r=>this.insert(r,0)}placeAfterListChild(){return r=>this.insert(r,this.children.get().length)}placeAt(r){return o=>this.insert(o,r)}placeAfterChild(r){return o=>this.insert(o,this.children.get().indexOf(r)+1)}placeAfterMe(){return this.parent.placeAfterChild(this)}placeBeforeMe(){return this.parent.placeAt(this.parent.children.get().indexOf(this))}insertAfter(r){return this.parent.insert(r,this.parent.children.get().indexOf(this)+1)}insertBefore(r){return this.parent.insert(r,this.parent.children.get().indexOf(this))}root(){let r=this;for(;r.parent;)r=r.parent;return r}find(r){if(!r)return null;for(let o of this.kids()){if(o.id===r)return o;let n=o.find(r);if(n)return n}return null}*filter(r){for(let o of this.kids())r(o)&&(yield o),yield*o.filter(r)}includes(r){for(let o of this.kids())if(o===r||o.includes(r))return!0}kids(){return this.children.get().filter(Boolean)}update(r){if(this.type&&r.type!==this.type){if(!this.parent)throw new Error("Cannot replace detached box");this.parent.replace(this,t.new(r,this.parent));return}for(let l in r){let c=l;c==="id"||c==="type"||c==="children"||r.hasOwnProperty(c)&&this.prop(c).get()!==r[c]&&this.prop(c).set(r[c])}let o=r.children??[],n=new Set(o.map(l=>l.id));for(let l of this.children.get())n.has(l.id)||l.removeSelf();let i=[],s=new Map(this.children.get().map(l=>[l.id,l]));for(let l of o)if(!l.id||!s.has(l.id))i.push(t.new(l,this));else{let c=s.get(l.id);c.update(l),i.push(c)}this.children.set(i)}toJSON(){return{id:this.id,type:this.type,children:this.children.get().map(r=>r?.toJSON()||null),...Object.fromEntries(Object.entries(this._props).map(([r,o])=>[r,o.get()]))}}*traverse(){for(let r of this.kids())yield r,yield*r.traverse()}canRemove(){return!0}onCreate(){}},Ds=class extends Ve{constructor(r,o,n,i){super(r,o,i);this.parent=o;this._save=n;this.view=i;S(this,"disableDeleteSection");this.disableDeleteSection=ue.create(this,s=>s(this.children).filter(l=>l.type==="Section").length===1)}async save(r){return await this._save(r)}render(){throw new Error("Method not implemented.")}},gc=class extends Ve{render(){return f("div",`Unknown box type ${this.type}`)}},yP=f.on("click",t=>{t.stopPropagation(),t.preventDefault()});function Ps(t){try{let e=JSON.parse(t);return e&&typeof e=="object"&&e.type?e:null}catch{return null}}function Ls(t,e={position:"beforeend",element:null}){let r=document.getElementById(t);return r||(r=document.createElement("style"),r.setAttribute("id",t),(e.element||document.head).insertAdjacentElement(e.element?e.position:"beforeend",r),r)}function Mf(){return{state:{get:()=>({params:{}})}}}function Nf(t){return{}}var Rf="grist",F=class{constructor(e,r,o,n){this.name=e;this.value=r;this.fallback=o;this.type=n;S(this,"_prefix",Rf);this.type==="theme"&&(this._prefix=`${Rf}-theme`)}decl(){if(this.value!==void 0)return`${this.var()}: ${this.value};`}toString(){let e=this.var();return this.fallback&&(e+=`, ${this.fallback}`),`var(${e})`}var(){return`--${this._prefix}-${this.name}`}getRawValue(){return typeof this.value!="string"&&this.value?.value?this._getRawValue(this.value):this.value}_getRawValue(e){return typeof e=="string"?e:e?.value?this._getRawValue(e.value):""}};var $f={body:"body",emphasis:"emphasis",veryLight:"very-light",bg:"bg-default",bgSecondary:"bg-secondary",bgTertiary:"bg-tertiary",bgEmphasis:"bg-emphasis",bgWarningSubtle:"bg-warning-subtle",borderWarningSubtle:"border-warning-subtle",decoration:"decoration",decorationSecondary:"decoration-secondary",decorationTertiary:"decoration-tertiary",primary:"primary",primaryMuted:"primary-muted",primaryDim:"primary-dim",primaryEmphasis:"primary-emphasis",primaryTranslucent:"primary-translucent",secondary:"secondary",secondaryMuted:"secondary-muted",white:"white",black:"black",error:"error",errorLight:"error-light",warning:"warning",warningLight:"warning-light",info:"info",infoLight:"info-light",fontFamily:"font-family",fontFamilyData:"font-family-data",fontFamilyMono:"font-family-mono",xxsmallFontSize:"xx-small-font-size",xsmallFontSize:"x-small-font-size",smallFontSize:"small-font-size",mediumFontSize:"medium-font-size",introFontSize:"intro-font-size",largeFontSize:"large-font-size",xlargeFontSize:"x-large-font-size",xxlargeFontSize:"xx-large-font-size",xxxlargeFontSize:"xxx-large-font-size",bigControlFontSize:"big-control-font-size",headerControlFontSize:"header-control-font-size",bigControlTextWeight:"big-control-text-weight",headerControlTextWeight:"header-control-text-weight",controlBorderRadius:"control-border-radius",cursor:"token-cursor",cursorInactive:"token-cursor-inactive",selection:"token-selection",selectionOpaque:"token-selection-opaque",selectionDarkerOpaque:"token-selection-darker-opaque",selectionDarker:"token-selection-darker",selectionDarkest:"token-selection-darkest",hover:"token-hover",backdrop:"backdrop",logoBg:"logo-bg",logoSize:"logo-size"},Hf={text:"text",lightText:"text-light",mediumText:"text-medium",darkText:"text-dark",errorText:"text-error",errorTextHover:"text-error-hover",dangerText:"text-danger",disabledText:"text-disabled",pageBg:"page-bg",pageBackdrop:"page-backdrop",mainPanelBg:"page-panels-main-panel-bg",leftPanelBg:"page-panels-left-panel-bg",rightPanelBg:"page-panels-right-panel-bg",topHeaderBg:"page-panels-top-header-bg",bottomFooterBg:"page-panels-bottom-footer-bg",pagePanelsBorder:"page-panels-border",pagePanelsBorderResizing:"page-panels-border-resizing",sidePanelOpenerFg:"page-panels-side-panel-opener-fg",sidePanelOpenerActiveFg:"page-panels-side-panel-opener-active-fg",sidePanelOpenerActiveBg:"page-panels-side-panel-opener-active-bg",addNewCircleFg:"add-new-circle-fg",addNewCircleBg:"add-new-circle-bg",addNewCircleHoverBg:"add-new-circle-hover-bg",addNewCircleSmallFg:"add-new-circle-small-fg",addNewCircleSmallBg:"add-new-circle-small-bg",addNewCircleSmallHoverBg:"add-new-circle-small-hover-bg",topBarButtonPrimaryFg:"top-bar-button-primary-fg",topBarButtonSecondaryFg:"top-bar-button-secondary-fg",topBarButtonDisabledFg:"top-bar-button-disabled-fg",topBarButtonErrorFg:"top-bar-button-error-fg",notificationsPanelHeaderBg:"notifications-panel-header-bg",notificationsPanelBodyBg:"notifications-panel-body-bg",notificationsPanelBorder:"notifications-panel-border",toastText:"toast-text",toastLightText:"toast-text-light",toastBg:"toast-bg",toastMemoText:"toast-memo-text",toastMemoBg:"toast-memo-bg",toastErrorIcon:"toast-error-icon",toastErrorBg:"toast-error-bg",toastSuccessIcon:"toast-success-icon",toastSuccessBg:"toast-success-bg",toastWarningIcon:"toast-warning-icon",toastWarningBg:"toast-warning-bg",toastInfoIcon:"toast-info-icon",toastInfoBg:"toast-info-bg",toastControlFg:"toast-control-fg",toastInfoControlFg:"toast-control-info-fg",tooltipFg:"tooltip-fg",tooltipBg:"tooltip-bg",tooltipIcon:"tooltip-icon",tooltipCloseButtonFg:"tooltip-close-button-fg",tooltipCloseButtonHoverFg:"tooltip-close-button-hover-fg",tooltipCloseButtonHoverBg:"tooltip-close-button-hover-bg",modalBg:"modal-bg",modalBackdrop:"modal-backdrop",modalBorder:"modal-border",modalBorderDark:"modal-border-dark",modalBorderHover:"modal-border-hover",modalInnerShadow:"modal-shadow-inner",modalOuterShadow:"modal-shadow-outer",modalCloseButtonFg:"modal-close-button-fg",modalBackdropCloseButtonFg:"modal-backdrop-close-button-fg",modalBackdropCloseButtonHoverFg:"modal-backdrop-close-button-hover-fg",popupBg:"popup-bg",popupSecondaryBg:"popup-secondary-bg",popupInnerShadow:"popup-shadow-inner",popupOuterShadow:"popup-shadow-outer",popupCloseButtonFg:"popup-close-button-fg",promptFg:"prompt-fg",progressBarFg:"progress-bar-fg",progressBarErrorFg:"progress-bar-error-fg",progressBarBg:"progress-bar-bg",link:"link",linkHover:"link-hover",hover:"hover",lightHover:"hover-light",cellEditorFg:"cell-editor-fg",cellEditorPlaceholderFg:"cell-editor-placeholder-fg",cellEditorBg:"cell-editor-bg",cursor:"cursor",cursorInactive:"cursor-inactive",cursorReadonly:"cursor-readonly",tableHeaderFg:"table-header-fg",tableHeaderSelectedFg:"table-header-selected-fg",tableHeaderBg:"table-header-bg",tableHeaderSelectedBg:"table-header-selected-bg",tableHeaderBorder:"table-header-border",tableBodyBg:"table-body-bg",tableBodyBorder:"table-body-border",tableAddNewBg:"table-add-new-bg",tableScrollShadow:"table-scroll-shadow",tableFrozenColumnsBorder:"table-frozen-columns-border",tableDragDropIndicator:"table-drag-drop-indicator",tableDragDropShadow:"table-drag-drop-shadow",tableCellSummaryBg:"table-cell-summary-bg",cardCompactWidgetBg:"card-compact-widget-bg",cardCompactRecordBg:"card-compact-record-bg",cardBlocksBg:"card-blocks-bg",cardFormLabel:"card-form-label",cardCompactLabel:"card-compact-label",cardBlocksLabel:"card-blocks-label",cardFormBorder:"card-form-border",cardCompactBorder:"card-compact-border",cardEditingLayoutBg:"card-editing-layout-bg",cardEditingLayoutBorder:"card-editing-layout-border",cardListFormBorder:"card-list-form-border",cardListBlocksBorder:"card-list-blocks-border",selection:"selection",selectionDarker:"selection-darker",selectionDarkest:"selection-darkest",selectionOpaqueFg:"selection-opaque-fg",selectionOpaqueBg:"selection-opaque-bg",selectionOpaqueDarkBg:"selection-opaque-dark-bg",selectionHeader:"selection-header",widgetBg:"widget-bg",widgetBorder:"widget-border",widgetActiveBorder:"widget-active-border",widgetActiveNonFocusedBorder:"widget-active-non-focused-border",widgetInactiveStripesLight:"widget-inactive-stripes-light",widgetInactiveStripesDark:"widget-inactive-stripes-dark",pinnedDocFooterBg:"pinned-doc-footer-bg",pinnedDocBorder:"pinned-doc-border",pinnedDocBorderHover:"pinned-doc-border-hover",pinnedDocEditorBg:"pinned-doc-editor-bg",rawDataTableBorder:"raw-data-table-border",rawDataTableBorderHover:"raw-data-table-border-hover",controlFg:"control-fg",controlPrimaryFg:"control-primary-fg",controlPrimaryBg:"control-primary-bg",controlSecondaryFg:"control-secondary-fg",controlSecondaryDisabledFg:"control-secondary-disabled-fg",controlHoverFg:"control-hover-fg",controlPrimaryHoverBg:"control-primary-hover-bg",controlSecondaryHoverFg:"control-secondary-hover-fg",controlSecondaryHoverBg:"control-secondary-hover-bg",controlDisabledFg:"control-disabled-fg",controlDisabledBg:"control-disabled-bg",controlBorder:"control-border",controlDangerFg:"control-danger-fg",checkboxBg:"checkbox-bg",checkboxSelectedFg:"checkbox-selected-bg",checkboxDisabledBg:"checkbox-disabled-bg",checkboxBorder:"checkbox-border",checkboxBorderHover:"checkbox-border-hover",moveDocsSelectedFg:"move-docs-selected-fg",moveDocsSelectedBg:"move-docs-selected-bg",moveDocsDisabledFg:"move-docs-disabled-bg",filterBarButtonSavedFg:"filter-bar-button-saved-fg",filterBarButtonSavedBg:"filter-bar-button-saved-bg",filterBarButtonSavedHoverBg:"filter-bar-button-saved-hover-bg",iconDisabled:"icon-disabled",iconError:"icon-error",iconButtonFg:"icon-button-fg",iconButtonPrimaryBg:"icon-button-primary-bg",iconButtonPrimaryHoverBg:"icon-button-primary-hover-bg",iconButtonSecondaryBg:"icon-button-secondary-bg",iconButtonSecondaryHoverBg:"icon-button-secondary-hover-bg",pageHoverBg:"left-panel-page-hover-bg",activePageFg:"left-panel-active-page-fg",activePageBg:"left-panel-active-page-bg",disabledPageFg:"left-panel-disabled-page-fg",pageOptionsFg:"left-panel-page-options-bg",pageOptionsHoverFg:"left-panel-page-options-hover-fg",pageOptionsHoverBg:"left-panel-page-options-hover-bg",pageOptionsSelectedHoverBg:"left-panel-page-options-selected-hover-bg",pageInitialsFg:"left-panel-page-initials-fg",pageInitialsBg:"left-panel-page-initials-bg",pageInitialsEmojiBg:"left-panel-page-emoji-fg",pageInitialsEmojiOutline:"left-panel-page-emoji-outline",rightPanelTabFg:"right-panel-tab-fg",rightPanelTabBg:"right-panel-tab-bg",rightPanelTabIcon:"right-panel-tab-icon",rightPanelTabIconHover:"right-panel-tab-icon-hover",rightPanelTabBorder:"right-panel-tab-border",rightPanelTabHoverBg:"right-panel-tab-hover-bg",rightPanelTabHoverFg:"right-panel-tab-hover-fg",rightPanelTabSelectedFg:"right-panel-tab-selected-fg",rightPanelTabSelectedBg:"right-panel-tab-selected-bg",rightPanelTabSelectedIcon:"right-panel-tab-selected-icon",rightPanelTabButtonHoverBg:"right-panel-tab-button-hover-bg",rightPanelSubtabFg:"right-panel-subtab-fg",rightPanelSubtabSelectedFg:"right-panel-subtab-selected-fg",rightPanelSubtabSelectedUnderline:"right-panel-subtab-selected-underline",rightPanelSubtabHoverFg:"right-panel-subtab-hover-fg",rightPanelDisabledOverlay:"right-panel-disabled-overlay",rightPanelFieldSettingsBg:"right-panel-field-settings-bg",rightPanelFieldSettingsButtonBg:"right-panel-field-settings-button-bg",rightPanelCustomWidgetButtonFg:"right-panel-custom-widget-button-fg",rightPanelCustomWidgetButtonBg:"right-panel-custom-widget-button-bg",documentHistorySnapshotFg:"document-history-snapshot-fg",documentHistorySnapshotSelectedFg:"document-history-snapshot-selected-fg",documentHistorySnapshotBg:"document-history-snapshot-bg",documentHistorySnapshotSelectedBg:"document-history-snapshot-selected-bg",documentHistorySnapshotBorder:"document-history-snapshot-border",documentHistoryActivityText:"document-history-activity-text",documentHistoryActivityLightText:"document-history-activity-text-light",documentHistoryTableHeaderFg:"document-history-table-header-fg",documentHistoryTableBorder:"document-history-table-border",documentHistoryTableBorderLight:"document-history-table-border-light",accentIcon:"accent-icon",accentBorder:"accent-border",accentText:"accent-text",inputFg:"input-fg",inputBg:"input-bg",inputDisabledFg:"input-disabled-fg",inputDisabledBg:"input-disabled-bg",inputPlaceholderFg:"input-placeholder-fg",inputBorder:"input-border",inputValid:"input-valid",inputInvalid:"input-invalid",inputFocus:"input-focus",inputReadonlyBg:"input-readonly-bg",inputReadonlyBorder:"input-readonly-border",choiceTokenFg:"choice-token-fg",choiceTokenBlankFg:"choice-token-blank-fg",choiceTokenBg:"choice-token-bg",choiceTokenSelectedBg:"choice-token-selected-bg",choiceTokenSelectedBorder:"choice-token-selected-border",choiceTokenInvalidFg:"choice-token-invalid-fg",choiceTokenInvalidBg:"choice-token-invalid-bg",choiceTokenInvalidBorder:"choice-token-invalid-border",choiceEntryBg:"choice-entry-bg",choiceEntryBorder:"choice-entry-border",choiceEntryBorderHover:"choice-entry-border-hover",selectButtonFg:"select-button-fg",selectButtonPlaceholderFg:"select-button-placeholder-fg",selectButtonBg:"select-button-bg",selectButtonBorder:"select-button-border",selectButtonBorderInvalid:"select-button-border-invalid",menuText:"menu-text",menuLightText:"menu-light-text",menuBg:"menu-bg",menuSubheaderFg:"menu-subheader-fg",menuBorder:"menu-border",menuShadow:"menu-shadow",menuItemFg:"menu-item-fg",menuItemSelectedFg:"menu-item-selected-fg",menuItemSelectedBg:"menu-item-selected-bg",menuItemDisabledFg:"menu-item-disabled-fg",menuItemIconFg:"menu-item-icon-fg",menuItemIconSelectedFg:"menu-item-icon-selected-fg",autocompleteMatchText:"autocomplete-match-text",autocompleteSelectedMatchText:"autocomplete-selected-match-text",autocompleteItemSelectedBg:"autocomplete-item-selected-bg",autocompleteAddNewCircleFg:"autocomplete-add-new-circle-fg",autocompleteAddNewCircleBg:"autocomplete-add-new-circle-bg",autocompleteAddNewCircleSelectedBg:"autocomplete-add-new-circle-selected-bg",searchBorder:"search-border",searchPrevNextButtonFg:"search-prev-next-button-fg",searchPrevNextButtonBg:"search-prev-next-button-bg",loaderFg:"loader-fg",loaderBg:"loader-bg",siteSwitcherActiveFg:"site-switcher-active-fg",siteSwitcherActiveBg:"site-switcher-active-bg",docMenuDocOptionsFg:"doc-menu-doc-options-fg",docMenuDocOptionsHoverFg:"doc-menu-doc-options-hover-fg",docMenuDocOptionsHoverBg:"doc-menu-doc-options-hover-bg",shortcutKeyFg:"shortcut-key-fg",shortcutKeyPrimaryFg:"shortcut-key-primary-fg",shortcutKeySecondaryFg:"shortcut-key-secondary-fg",shortcutKeyBg:"shortcut-key-bg",shortcutKeyBorder:"shortcut-key-border",breadcrumbsTagFg:"breadcrumbs-tag-fg",breadcrumbsTagBg:"breadcrumbs-tag-bg",breadcrumbsTagAlertBg:"breadcrumbs-tag-alert-fg",widgetPickerPrimaryBg:"widget-picker-primary-bg",widgetPickerSecondaryBg:"widget-picker-secondary-bg",widgetPickerItemFg:"widget-picker-item-fg",widgetPickerItemSelectedBg:"widget-picker-item-selected-bg",widgetPickerItemDisabledBg:"widget-picker-item-disabled-bg",widgetPickerIcon:"widget-picker-icon",widgetPickerPrimaryIcon:"widget-picker-primary-icon",widgetPickerSummaryIcon:"widget-picker-summary-icon",widgetPickerBorder:"widget-picker-border",widgetPickerShadow:"widget-picker-shadow",codeViewText:"code-view-text",codeViewKeyword:"code-view-keyword",codeViewComment:"code-view-comment",codeViewMeta:"code-view-meta",codeViewTitle:"code-view-title",codeViewParams:"code-view-params",codeViewString:"code-view-string",codeViewNumber:"code-view-number",codeViewBuiltin:"code-view-builtin",codeViewLiteral:"code-view-literal",importerTableInfoBorder:"importer-table-info-border",importerPreviewBorder:"importer-preview-border",importerSkippedTableOverlay:"importer-skipped-table-overlay",importerMatchIcon:"importer-match-icon",importerOutsideBg:"importer-outside-bg",importerMainContentBg:"importer-main-content-bg",importerActiveFileBg:"importer-active-file-bg",importerActiveFileFg:"importer-active-file-fg",importerInactiveFileBg:"importer-inactive-file-bg",importerInactiveFileFg:"importer-inactive-file-fg",menuToggleFg:"menu-toggle-fg",menuToggleHoverFg:"menu-toggle-hover-fg",menuToggleActiveFg:"menu-toggle-active-fg",menuToggleBg:"menu-toggle-bg",menuToggleBorder:"menu-toggle-border",infoButtonFg:"info-button-fg",infoButtonHoverFg:"info-button-hover-fg",infoButtonActiveFg:"info-button-active-fg",buttonGroupFg:"button-group-fg",buttonGroupLightFg:"button-group-light-fg",buttonGroupLightBg:"button-group-light-bg",buttonGroupBg:"button-group-bg",buttonGroupBgHover:"button-group-bg-hover",buttonGroupIcon:"button-group-icon",buttonGroupBorder:"button-group-border",buttonGroupBorderHover:"button-group-border-hover",buttonGroupSelectedFg:"button-group-selected-fg",buttonGroupLightSelectedFg:"button-group-light-selected-fg",buttonGroupLightSelectedBg:"button-group-light-selected-bg",buttonGroupSelectedBg:"button-group-selected-bg",buttonGroupSelectedBorder:"button-group-selected-border",accessRulesTableHeaderFg:"access-rules-table-header-fg",accessRulesTableHeaderBg:"access-rules-table-header-bg",accessRulesTableBodyFg:"access-rules-table-body-fg",accessRulesTableBodyLightFg:"access-rules-table-body-light-fg",accessRulesTableBorder:"access-rules-table-border",accessRulesColumnListBorder:"access-rules-column-list-border",accessRulesColumnItemFg:"access-rules-column-item-fg",accessRulesColumnItemBg:"access-rules-column-item-bg",accessRulesColumnItemIconFg:"access-rules-column-item-icon-fg",accessRulesColumnItemIconHoverFg:"access-rules-column-item-icon-hover-fg",accessRulesColumnItemIconHoverBg:"access-rules-column-item-icon-hover-bg",accessRulesFormulaEditorBg:"access-rules-formula-editor-bg",accessRulesFormulaEditorBorderHover:"access-rules-formula-editor-border-hover",accessRulesFormulaEditorBgDisabled:"access-rules-formula-editor-bg-disabled",accessRulesFormulaEditorFocus:"access-rules-formula-editor-focus",cellFg:"cell-fg",cellBg:"cell-bg",cellZebraBg:"cell-zebra-bg",chartFg:"chart-fg",chartBg:"chart-bg",chartLegendBg:"chart-legend-bg",chartXAxis:"chart-x-axis",chartYAxis:"chart-y-axis",commentsPopupHeaderBg:"comments-popup-header-bg",commentsPopupBodyBg:"comments-popup-body-bg",commentsPopupBorder:"comments-popup-border",commentsUserNameFg:"comments-user-name-fg",commentsPanelTopicBg:"comments-panel-topic-bg",commentsPanelTopicBorder:"comments-panel-topic-border",commentsPanelResolvedTopicBg:"comments-panel-resolved-topic-bg",datePickerSelectedFg:"date-picker-selected-fg",datePickerSelectedBg:"date-picker-selected-bg",datePickerSelectedBgHover:"date-picker-selected-bg-hover",datePickerTodayFg:"date-picker-today-fg",datePickerTodayBg:"date-picker-today-bg",datePickerTodayBgHover:"date-picker-today-bg-hover",datePickerRangeStartEndBg:"date-picker-range-start-end-bg",datePickerRangeStartEndBgHover:"date-picker-range-start-end-bg-hover",datePickerRangeBg:"date-picker-range-bg",datePickerRangeBgHover:"date-picker-range-bg-hover",tutorialsPopupBorder:"tutorials-popup-border",tutorialsPopupHeaderFg:"tutorials-popup-header-fg",tutorialsPopupBoxBg:"tutorials-popup-box-bg",tutorialsPopupCodeFg:"tutorials-popup-code-fg",tutorialsPopupCodeBg:"tutorials-popup-code-bg",tutorialsPopupCodeBorder:"tutorials-popup-code-border",aceEditorBg:"ace-editor-bg",aceAutocompletePrimaryFg:"ace-autocomplete-primary-fg",aceAutocompleteSecondaryFg:"ace-autocomplete-secondary-fg",aceAutocompleteHighlightedFg:"ace-autocomplete-highlighted-fg",aceAutocompleteBg:"ace-autocomplete-bg",aceAutocompleteBorder:"ace-autocomplete-border",aceAutocompleteLink:"ace-autocomplete-link",aceAutocompleteLinkHighlighted:"ace-autocomplete-link-highlighted",aceAutocompleteActiveLineBg:"ace-autocomplete-active-line-bg",aceAutocompleteLineBorderHover:"ace-autocomplete-line-border-hover",aceAutocompleteLineBgHover:"ace-autocomplete-line-bg-hover",colorSelectFg:"color-select-fg",colorSelectBg:"color-select-bg",colorSelectShadow:"color-select-shadow",colorSelectFontOptionsBorder:"color-select-font-options-border",colorSelectFontOptionFg:"color-select-font-option-fg",colorSelectFontOptionBgHover:"color-select-font-option-bg-hover",colorSelectFontOptionFgSelected:"color-select-font-option-fg-selected",colorSelectFontOptionBgSelected:"color-select-font-option-bg-selected",colorSelectColorSquareBorder:"color-select-color-square-border",colorSelectColorSquareBorderEmpty:"color-select-color-square-border-empty",colorSelectInputFg:"color-select-input-fg",colorSelectInputBg:"color-select-input-bg",colorSelectInputBorder:"color-select-input-border",highlightedCodeBlockBg:"highlighted-code-block-bg",highlightedCodeBlockBgDisabled:"highlighted-code-block-bg-disabled",highlightedCodeFg:"highlighted-code-fg",highlightedCodeBorder:"highlighted-code-border",highlightedCodeBgDisabled:"highlighted-code-bg-disabled",loginPageBg:"login-page-bg",loginPageBackdrop:"login-page-backdrop",loginPageLine:"login-page-line",loginPageGoogleButtonFg:"login-page-google-button-fg",loginPageGoogleButtonBg:"login-page-google-button-bg",loginPageGoogleButtonBgHover:"login-page-google-button-bg-hover",loginPageGoogleButtonBorder:"login-page-google-button-border",formulaAssistantHeaderBg:"formula-assistant-header-bg",formulaAssistantBorder:"formula-assistant-border",formulaAssistantPreformattedTextBg:"formula-assistant-preformatted-text-bg",attachmentsEditorButtonFg:"attachments-editor-button-fg",attachmentsEditorButtonHoverFg:"attachments-editor-button-hover-fg",attachmentsEditorButtonBg:"attachments-editor-button-bg",attachmentsEditorButtonHoverBg:"attachments-editor-button-hover-bg",attachmentsEditorButtonBorder:"attachments-editor-button-border",attachmentsEditorButtonIcon:"attachments-editor-button-icon",attachmentsEditorBorder:"attachments-editor-border",attachmentsCellIconFg:"attachments-cell-icon-fg",attachmentsCellIconBg:"attachments-cell-icon-bg",attachmentsCellIconHoverBg:"attachments-cell-icon-hover-bg",announcementPopupFg:"announcement-popup-fg",announcementPopupBg:"announcement-popup-bg",switchInactiveSlider:"switch-inactive-slider",switchInactivePill:"switch-inactive-pill",switchActiveSlider:"switch-active-slider",switchActivePill:"switch-active-pill",switchHoverShadow:"switch-hover-shadow",scrollShadow:"scroll-shadow",toggleCheckboxFg:"toggle-checkbox-fg",numericSpinnerFg:"numeric-spinner-fg",widgetGalleryBorder:"widget-gallery-border",widgetGalleryBorderSelected:"widget-gallery-border-selected",widgetGalleryShadow:"widget-gallery-shadow",widgetGalleryBgHover:"widget-gallery-bg-hover",widgetGallerySecondaryHeaderFg:"widget-gallery-secondary-header-fg",widgetGallerySecondaryHeaderBg:"widget-gallery-secondary-header-bg",widgetGallerySecondaryHeaderBgHover:"widget-gallery-secondary-header-bg-hover",markdownCellLightBg:"markdown-cell-light-bg",markdownCellLightBorder:"markdown-cell-light-border",markdownCellMediumBorder:"markdown-cell-medium-border",appHeaderBg:"app-header-bg",appHeaderBorder:"app-header-border",appHeaderBorderHover:"app-header-border-hover",cardButtonBorder:"card-button-border",cardButtonBorderSelected:"card-button-border-selected",cardButtonShadow:"card-button-shadow",formulaIcon:"formula-icon",textButtonHoverBg:"text-button-hover-bg",textButtonHoverBorder:"text-button-hover-border",kbFocusHighlight:"kb-focus-highlight"},a=Object.fromEntries(Object.entries($f).map(([t,e])=>[t,new F(e,void 0,void 0,"theme")])),tt=Object.fromEntries(Object.entries(Hf).map(([t,e])=>[t,new F(e,void 0,void 0,"theme")])),FP=[{old:"--grist-color-light-grey",new:a.bgSecondary.var()},{old:"--grist-color-medium-grey",new:a.bgTertiary.var()},{old:"--grist-color-medium-grey-opaque",new:a.decorationSecondary.var()},{old:"--grist-color-dark-grey",new:a.decoration.var()},{old:"--grist-color-light",new:a.white.var()},{old:"--grist-color-dark",new:a.body.var()},{old:"--grist-color-dark-bg",new:a.bgEmphasis.var()},{old:"--grist-color-slate",new:a.secondary.var()},{old:"--grist-color-lighter-green",new:a.primaryEmphasis.var()},{old:"--grist-color-light-green",new:a.primary.var()},{old:"--grist-color-dark-green",new:a.primaryMuted.var()},{old:"--grist-color-darker-green",new:a.primaryDim.var()},{old:"--grist-color-lighter-blue",new:a.infoLight.var()},{old:"--grist-color-light-blue",new:a.info.var()},{old:"--grist-color-orange",new:a.warningLight.var()},{old:"--grist-color-cursor",new:a.cursor.var()},{old:"--grist-color-selection",new:a.selection.var()},{old:"--grist-color-selection-opaque",new:a.selectionOpaque.var()},{old:"--grist-color-selection-darker-opaque",new:a.selectionDarkerOpaque.var()},{old:"--grist-color-inactive-cursor",new:a.cursorInactive.var()},{old:"--grist-color-hover",new:a.hover.var()},{old:"--grist-color-error",new:a.error.var()},{old:"--grist-color-warning",new:a.warningLight.var()},{old:"--grist-color-warning-bg",new:a.warning.var()},{old:"--grist-color-backdrop",new:a.backdrop.var()},{old:"--grist-font-family",new:a.fontFamily.var()},{old:"--grist-font-family-data",new:a.fontFamilyData.var()},{old:"--grist-xx-font-size",new:a.xxsmallFontSize.var()},{old:"--grist-x-small-font-size",new:a.xsmallFontSize.var()},{old:"--grist-small-font-size",new:a.smallFontSize.var()},{old:"--grist-medium-font-size",new:a.mediumFontSize.var()},{old:"--grist-intro-font-size",new:a.introFontSize.var()},{old:"--grist-large-font-size",new:a.largeFontSize.var()},{old:"--grist-x-large-font-size",new:a.xlargeFontSize.var()},{old:"--grist-xx-large-font-size",new:a.xxlargeFontSize.var()},{old:"--grist-xxx-large-font-size",new:a.xxxlargeFontSize.var()},{old:"--grist-big-control-font-size",new:a.bigControlFontSize.var()},{old:"--grist-header-control-font-size",new:a.headerControlFontSize.var()},{old:"--grist-big-text-weight",new:a.bigControlTextWeight.var()},{old:"--grist-header-text-weight",new:a.headerControlTextWeight.var()},{old:"--grist-primary-bg",new:a.white.var()},{old:"--grist-primary-fg-hover",new:a.primaryMuted.var()},{old:"--grist-primary-fg",new:a.primary.var()},{old:"--grist-control-border",new:tt.controlBorder.var()},{old:"--grist-border-radius",new:a.controlBorderRadius.var()},{old:"--grist-logo-bg",new:a.logoBg.var()},{old:"--grist-logo-size",new:a.logoSize.var()}],zf=t=>{let{components:e,...r}=t.colors,o=Object.fromEntries(Object.entries(r).map(([i,s])=>[$f[i],s.toString()])),n=Object.fromEntries(Object.entries(e).map(([i,s])=>[Hf[i],s.toString()]));return{...t,colors:{...o,...n}}};z();var x_=ct(vc()),Oc=ct(Jm()),V={lightGrey:new F("color-light-grey",a.bgSecondary),mediumGrey:new F("color-medium-grey",a.bgTertiary),mediumGreyOpaque:new F("color-medium-grey-opaque",a.decorationSecondary),darkGrey:new F("color-dark-grey",a.decoration),light:new F("color-light",a.white),dark:new F("color-dark",a.body),darkText:new F("color-dark-text","#494949"),darkBg:new F("color-dark-bg",a.bgEmphasis),slate:new F("color-slate",a.secondary),lighterGreen:new F("color-lighter-green",a.primaryEmphasis),lightGreen:new F("color-light-green",a.primary),darkGreen:new F("color-dark-green",a.primaryMuted),darkerGreen:new F("color-darker-green",a.primaryDim),lighterBlue:new F("color-lighter-blue",a.infoLight),lightBlue:new F("color-light-blue",a.info),orange:new F("color-orange",a.warningLight),cursor:new F("color-cursor",a.cursor),selection:new F("color-selection",a.selection),selectionOpaque:new F("color-selection-opaque",a.selectionOpaque),selectionDarkerOpaque:new F("color-selection-darker-opaque",a.selectionDarkerOpaque),inactiveCursor:new F("color-inactive-cursor",a.cursorInactive),hover:new F("color-hover",a.hover),error:new F("color-error",a.error),warning:new F("color-warning",a.warningLight),warningBg:new F("color-warning-bg",a.warning),backdrop:new F("color-backdrop",a.backdrop)},y_={stickyHeaderZIndex:new F("sticky-header-z-index","20"),insertColumnLineZIndex:new F("insert-column-line-z-index","20"),emojiPickerZIndex:new F("modal-z-index","20"),gridFreeSpaceZIndex:new F("grid-free-space-z-index","25"),newRecordButtonZIndex:new F("new-record-button-z-index","30"),popupSectionBackdropZIndex:new F("popup-section-backdrop-z-index","100"),menuZIndex:new F("menu-z-index","999"),modalZIndex:new F("modal-z-index","999"),onboardingBackdropZIndex:new F("onboarding-backdrop-z-index","999"),onboardingPopupZIndex:new F("onboarding-popup-z-index","1000"),floatingPopupZIndex:new F("floating-popup-z-index","1002"),tutorialModalZIndex:new F("tutorial-modal-z-index","1003"),pricingModalZIndex:new F("pricing-modal-z-index","1004"),floatingPopupMenuZIndex:new F("floating-popup-menu-z-index","1004"),notificationZIndex:new F("notification-z-index","1100"),browserCheckZIndex:new F("browser-check-z-index","5000"),tooltipZIndex:new F("tooltip-z-index","5000")},C={fontFamily:new F("font-family",a.fontFamily),fontFamilyData:new F("font-family-data",a.fontFamilyData),fontFamilyMono:new F("font-family-mono",a.fontFamilyMono),xxsmallFontSize:new F("xx-font-size",a.xxsmallFontSize),xsmallFontSize:new F("x-small-font-size",a.xsmallFontSize),smallFontSize:new F("small-font-size",a.smallFontSize),mediumFontSize:new F("medium-font-size",a.mediumFontSize),introFontSize:new F("intro-font-size",a.introFontSize),largeFontSize:new F("large-font-size",a.largeFontSize),xlargeFontSize:new F("x-large-font-size",a.xlargeFontSize),xxlargeFontSize:new F("xx-large-font-size",a.xxlargeFontSize),xxxlargeFontSize:new F("xxx-large-font-size",a.xxxlargeFontSize),controlFontSize:new F("control-font-size","12px"),smallControlFontSize:new F("small-control-font-size","10px"),bigControlFontSize:new F("big-control-font-size",a.bigControlFontSize),headerControlFontSize:new F("header-control-font-size",a.headerControlFontSize),bigControlTextWeight:new F("big-text-weight",a.bigControlTextWeight),headerControlTextWeight:new F("header-text-weight",a.headerControlTextWeight),labelTextSize:new F("label-text-size","medium"),labelTextBg:new F("label-text-bg","#ffffff"),labelActiveBg:new F("label-active-bg","#f0f0f0"),controlMargin:new F("normal-margin","2px"),controlPadding:new F("normal-padding","3px 5px"),tightPadding:new F("tight-padding","1px 2px"),loosePadding:new F("loose-padding","5px 15px"),primaryBg:new F("primary-fg",a.primary),primaryBgHover:new F("primary-fg-hover",a.primaryMuted),primaryFg:new F("primary-bg",a.white),controlBg:new F("control-bg",a.white),controlFg:new F("control-fg",a.primary),controlFgHover:new F("primary-fg-hover",a.primaryMuted),controlBorder:new F("control-border",tt.controlBorder),controlBorderRadius:new F("border-radius",a.controlBorderRadius),logoBg:new F("logo-bg",a.logoBg),logoSize:new F("logo-size",a.logoSize),toastBg:new F("toast-bg","#040404"),...y_},g={...tt},v_=(0,Oc.default)(V).map(t=>t.decl()).join(`
`),w_=(0,Oc.default)(C).map(t=>t.decl()).join(`
`),T_=`
  *, *:before, *:after {
  -webkit-box-sizing: border-box;
     -moz-box-sizing: border-box;
          box-sizing: border-box;
  }
`,k_=`
  button, input, select, textarea {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
  }
`,B_=`
  .font-italic {
    font-style: italic;
  }
  .font-bold {
    font-weight: 800;
  }
  .font-underline {
    text-decoration: underline;
  }
  .font-strikethrough {
    text-decoration: line-through;
  }
  .font-strikethrough.font-underline {
    text-decoration: line-through underline;
  }
`,__=v_+w_,S_=T_+k_+B_,E_=m("body",`
  margin: 0;
  height: 100%;
`),F_=m("html",`
  font-family: ${C.fontFamily};
  font-size: ${C.mediumFontSize};
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
`),I_=m("html",`
  height: 100%;
  overflow: hidden;
`),Cr=Sr("test-"),C_=992,Dc=768,eg=576,vL=`(max-width: ${C_-.02}px)`,A_=`(max-width: ${Dc-.02}px)`,wL=`(min-width: ${Dc}px)`,tg=`(max-width: ${eg-.02}px)`,TL=`(min-device-width: ${Dc}px)`;function Qm(){return window.innerWidth<eg}var Ac;function Cn(){if(!Ac){let t=I.create(null,Qm());window.addEventListener("resize",()=>t.set(Qm())),Ac=t}return Ac}var kL=m("div",`
  @media ${A_} {
    & {
      display: none !important;
    }
  }
`);function O_(t=!1){Ls("grist-root-css",{position:"beforebegin",element:document.head.querySelector('style, link[rel="stylesheet"]')}).textContent=`
@layer grist-base, grist-theme, grist-custom;
@layer grist-base {
  :root {
    ${__}
  }
  ${!t&&S_}
}`,document.documentElement.classList.add(F_.className)}function rg(t,e=!1){O_(e),document.documentElement.classList.add(I_.className),document.body.classList.add(E_.className);let r=Nf(t);r.bodyClassName&&document.body.classList.add(r.bodyClassName);let o=Mf().state.get().params?.style||"full";document.body.classList.add(`interface-${o}`)}var BL=m("div",`
  @media print {
    & {
      display: none !important;
    }
  }
`);z();var $t=ct(Qs()),Dr=m("label",`
  position: relative;
  display: inline-flex;
  min-width: 0px;
  margin-bottom: 0px;
  flex-shrink: 0;

  outline: none;
  user-select: none;

  --color: ${g.checkboxBorder};
  &:hover {
    --color: ${g.checkboxBorderHover};
  }

  .${$t.cssMenuItem.className} & {
    flex: 1;
  }

  .${$t.cssMenuItem.className}.disabled &,
  .${$t.cssMenuItem.className}[aria-disabled="true"] & {
    cursor: not-allowed;
  }
`),ea=m("input",`
  -webkit-appearance: none;
  -moz-appearance: none;
  margin: 0 !important;
  padding: 0;

  /* Positioning context for the ::before/::after pseudos (border + tick) painted below. */
  position: relative;
  flex-shrink: 0;

  display: inline-block;
  width: 16px;
  height: 16px;
  outline: none !important;
  outline-offset: 2px;

  --radius: 3px;

  &:checked:enabled, &:indeterminate:enabled {
    --color: ${g.controlPrimaryBg};
  }

  &:disabled {
    --color: ${g.checkboxDisabledBg};
    cursor: not-allowed;
  }

  &::before, &::after {
    content: '';

    position: absolute;
    top: 0;
    left: 0;

    height: 16px;
    width: 16px;

    box-sizing: border-box;
    border: 1px solid var(--color);
    border-radius: var(--radius);
  }

  &:checked::before, &:disabled::before, &:indeterminate::before {
    background-color: var(--color);
  }

  &:not(:checked):indeterminate::after {
    -webkit-mask-image: var(--icon-Minus);
  }

  &:not(:disabled)::after {
    background-color: ${g.checkboxBg};
  }

  &:checked::after, &:indeterminate::after {
    content: '';
    position: absolute;
    height: 16px;
    width: 16px;
    -webkit-mask-image: var(--icon-Tick);
    -webkit-mask-size: contain;
    -webkit-mask-position: center;
    -webkit-mask-repeat: no-repeat;
    background-color: ${g.controlPrimaryFg};
  }

  .${$t.cssMenuItem.className}-sel &::before,
  .${$t.cssMenuItem.className}-sel &::after {
    border-color: ${g.menuItemSelectedFg};
  }
`),sN=m(ea,`
  --radius: 100%;
`),pu=m("span",`
  margin-left: 8px;
  color: ${g.text};
  font-weight: initial;   /* negate bootstrap */
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 16px;

  .${$t.cssMenuItem.className}-sel & {
    color: ${g.menuItemSelectedFg};
  }

  .${$t.cssMenuItem.className}.disabled &,
  .${$t.cssMenuItem.className}[aria-disabled="true"] & {
    color: ${g.menuItemDisabledFg};
  }
`);var aN=m("div",`
  display: flex;
  flex-direction: column;
  gap: 10px;
`),lN=m("div",`
  display: flex;
  padding: 10px 8px;
  border: 1px solid ${g.controlSecondaryDisabledFg};
  border-radius: 3px;
  cursor: pointer;
  &:hover {
    border-color: ${g.controlFg};
  }
  &-block {
    pointer-events: none;
  }
  &-block a {
    pointer-events: all;
  }
`),cN=m("div",`
  display: inline-block;
  position: relative;
  height: 16px;
`),uN=m(Dr,`
  justify-content: space-between;
  gap: 8px;
  & .${pu.className} {
    margin: 0px;
  }
`);z();function ta(t){t.style.height="5px";let e=getComputedStyle(t,null).borderTopWidth||"0";t.style.height=`calc(${t.scrollHeight}px + 2 * ${e})`}function Lx(t){return e=>{let r=0,o=new ResizeObserver(n=>{let i=n[0].target;i.offsetWidth!==r&&r&&ta(i),r=i.offsetWidth});o.observe(e),f.onDisposeElem(e,()=>o.disconnect()),e.addEventListener("input",()=>ta(e)),f.autoDisposeElem(e,t.addListener(()=>setTimeout(()=>ta(e),0))),setTimeout(()=>ta(e),10),f.autoDisposeElem(e,t.addListener(n=>{n||(e.style.height="5px")}))}}var cC=m("form",`
  margin-bottom: 32px;
  font-size: 14px;
  &:focus {
    outline: none;
  }
  & input:focus, & button:focus {
    outline: none;
    box-shadow: 0 0 1px 2px lightblue;
  }
`),bN=m("div",`
  margin: 32px 0;
  padding-left: 24px;
  & > :first-child {
    margin-left: -24px;
  }
`),xN=m("div",`
  margin: 16px 0;
  font-size: 15px;
`),yN=m(Dr,`
  font-size: 14px;
  font-weight: normal;
  display: flex;
  align-items: center;
  margin: 12px 0;
  user-select: unset;
`),vN=m(ea,`
  position: relative;
  margin-right: 12px !important;
  border-radius: var(--radius);
`),uC=m("input",`
  flex: auto;
  width: 100%;
  font-size: inherit;
  padding: 4px 8px;
  border: 1px solid #D9D9D9;
  border-radius: 3px;

  &-invalid {
    color: red;
  }
`),wN=cC.bind(null,{tabIndex:"-1"}),TN=uC.bind(null,{type:"text"});z();var pC=m("input",`
  font-size: ${C.mediumFontSize};
  height: 48px;
  line-height: 20px;
  width: 100%;
  padding: 14px;
  border: 1px solid ${g.inputBorder};
  border-radius: 4px;
  outline: none;
  display: block;
  color: ${g.inputFg};
  background-color: ${g.inputBg};

  &::placeholder {
    color: ${g.inputPlaceholderFg};
  }

  &[type=number] {
    -moz-appearance: textfield;
  }
  &[type=number]::-webkit-inner-spin-button,
  &[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &-invalid {
    border: 1px solid ${g.inputInvalid};
  }

  &-valid {
    border: 1px solid ${g.inputValid};
  }
`);function ra(t,...e){return pC(f.prop("value",r=>r(t)||""),f.on("input",(r,o)=>t.set(o.value)),...e)}function oa(t,e,...r){let o=e?.isValid;function n(c){e?.save?e.save(c.value):t.set(c.value),o&&o.set(c.validity.valid)}let i=e?.autoGrow?I.create(null,t.get()):null,l=!!(e?.onInput||e?.autoGrow)?f.on("input",(c,p)=>{e?.onInput&&n(p),e?.autoGrow&&i?.set(p.value)}):null;return f("textarea",...r,i?[f.autoDispose(i),f.autoDispose(t.addListener(c=>i.set(c)))]:null,f.prop("value",c=>c(t)??""),o?c=>f.autoDisposeElem(c,et(t,p=>o.set(c.checkValidity()))):null,l,e?.autoGrow?[Lx(i),f.style("resize","none")]:null,f.on("change",(c,p)=>n(p)))}function dC(t,e){this.v=t,this.k=e}function Mx(t,e){(e==null||e>t.length)&&(e=t.length);for(var r=0,o=Array(e);r<e;r++)o[r]=t[r];return o}function fC(t){if(Array.isArray(t))return t}function mC(t,e){var r=t==null?null:typeof Symbol<"u"&&t[Symbol.iterator]||t["@@iterator"];if(r!=null){var o,n,i,s,l=[],c=!0,p=!1;try{if(i=(r=r.call(t)).next,e===0){if(Object(r)!==r)return;c=!1}else for(;!(c=(o=i.call(r)).done)&&(l.push(o.value),l.length!==e);c=!0);}catch(d){p=!0,n=d}finally{try{if(!c&&r.return!=null&&(s=r.return(),Object(s)!==s))return}finally{if(p)throw n}}return l}}function gC(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function hC(t,e){return fC(t)||mC(t,e)||bC(t,e)||gC()}function bC(t,e){if(t){if(typeof t=="string")return Mx(t,e);var r={}.toString.call(t).slice(8,-1);return r==="Object"&&t.constructor&&(r=t.constructor.name),r==="Map"||r==="Set"?Array.from(t):r==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?Mx(t,e):void 0}}function na(t){var e,r;function o(i,s){try{var l=t[i](s),c=l.value,p=c instanceof dC;Promise.resolve(p?c.v:c).then(function(d){if(p){var h=i==="return"&&c.k?i:"next";if(!c.k||d.done)return o(h,d);d=t[h](d).value}n(!!l.done,d)},function(d){o("throw",d)})}catch(d){n(2,d)}}function n(i,s){i===2?e.reject(s):e.resolve({value:s,done:i}),(e=e.next)?o(e.key,e.arg):r=null}this._invoke=function(i,s){return new Promise(function(l,c){var p={key:i,arg:s,resolve:l,reject:c,next:null};r?r=r.next=p:(e=r=p,o(i,s))})},typeof t.return!="function"&&(this.return=void 0)}na.prototype[typeof Symbol=="function"&&Symbol.asyncIterator||"@@asyncIterator"]=function(){return this},na.prototype.next=function(t){return this._invoke("next",t)},na.prototype.throw=function(t){return this._invoke("throw",t)},na.prototype.return=function(t){return this._invoke("return",t)};var Xx=Object.entries,Nx=Object.setPrototypeOf,xC=Object.isFrozen,Jx=Object.getPrototypeOf,Qx=Object.getOwnPropertyDescriptor,Be=Object.freeze,Ee=Object.seal,Fo=Object.create,ey=typeof Reflect<"u"&&Reflect,wu=ey.apply,Tu=ey.construct;Be||(Be=function(e){return e});Ee||(Ee=function(e){return e});wu||(wu=function(e,r){for(var o=arguments.length,n=new Array(o>2?o-2:0),i=2;i<o;i++)n[i-2]=arguments[i];return e.apply(r,n)});Tu||(Tu=function(e){for(var r=arguments.length,o=new Array(r>1?r-1:0),n=1;n<r;n++)o[n-1]=arguments[n];return new e(...o)});var Ht=he(Array.prototype.forEach);Array.prototype.indexOf;var yC=he(Array.prototype.lastIndexOf),Rx=he(Array.prototype.pop),Kn=he(Array.prototype.push),vC=he(Array.prototype.slice),wC=he(Array.prototype.splice),Io=Array.isArray,du=ty(Set),fu=he(Set.prototype.add),Yn=he(Set.prototype.has),Pr=he(String.prototype.toLowerCase),mu=he(String.prototype.toString),$x=he(String.prototype.match),Zn=he(String.prototype.replace),Hx=he(String.prototype.indexOf),TC=he(String.prototype.trim),kC=he(Number.prototype.toString),BC=he(Boolean.prototype.toString),zx=typeof BigInt>"u"?null:he(BigInt.prototype.toString),qx=typeof Symbol>"u"?null:he(Symbol.prototype.toString),Ge=he(Object.prototype.hasOwnProperty),Xn=he(Object.prototype.toString),Se=he(RegExp.prototype.test),zt=ty(TypeError);function he(t){return function(e){e instanceof RegExp&&(e.lastIndex=0);for(var r=arguments.length,o=new Array(r>1?r-1:0),n=1;n<r;n++)o[n-1]=arguments[n];return wu(t,e,o)}}function ty(t){return function(){for(var e=arguments.length,r=new Array(e),o=0;o<e;o++)r[o]=arguments[o];return Tu(t,r)}}function Z(t,e){let r=arguments.length>2&&arguments[2]!==void 0?arguments[2]:Pr;if(Nx&&Nx(t,null),!Io(e))return t;let o=e.length;for(;o--;){let n=e[o];if(typeof n=="string"){let i=r(n);i!==n&&(xC(e)||(e[o]=i),n=i)}t[n]=!0}return t}function _C(t){for(let e=0;e<t.length;e++)Ge(t,e)||(t[e]=null);return t}function Ke(t){let e=Fo(null);for(let o of Xx(t)){var r=hC(o,2);let n=r[0],i=r[1];Ge(t,n)&&(Io(i)?e[n]=_C(i):i&&typeof i=="object"&&i.constructor===Object?e[n]=Ke(i):e[n]=i)}return e}function SC(t){switch(typeof t){case"string":return t;case"number":return kC(t);case"boolean":return BC(t);case"bigint":return zx?zx(t):"0";case"symbol":return qx?qx(t):"Symbol()";case"undefined":return Xn(t);case"function":case"object":{if(t===null)return Xn(t);let e=t,r=ot(e,"toString");if(typeof r=="function"){let o=r(e);return typeof o=="string"?o:Xn(o)}return Xn(t)}default:return Xn(t)}}function ot(t,e){for(;t!==null;){let o=Qx(t,e);if(o){if(o.get)return he(o.get);if(typeof o.value=="function")return he(o.value)}t=Jx(t)}function r(){return null}return r}function EC(t,e){for(;t!==null;){let r=Qx(t,e);if(r)return r.get?he(r.get):null;t=Jx(t)}return null}function FC(t){try{return Se(t,""),!0}catch{return!1}}var Vx=Be(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","search","section","select","shadow","slot","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),gu=Be(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","enterkeyhint","exportparts","filter","font","g","glyph","glyphref","hkern","image","inputmode","line","lineargradient","marker","mask","metadata","mpath","part","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),hu=Be(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),IC=Be(["animate","color-profile","cursor","discard","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),bu=Be(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover","mprescripts"]),CC=Be(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),Gx=Be(["#text"]),Ux=Be(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","command","commandfor","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","exportparts","face","for","headers","height","hidden","high","href","hreflang","id","inert","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","part","pattern","placeholder","playsinline","popover","popovertarget","popovertargetaction","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","slot","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","wrap","xmlns"]),xu=Be(["accent-height","accumulate","additive","alignment-baseline","amplitude","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dominant-baseline","dur","edgemode","elevation","end","exponent","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","intercept","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","mask-type","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","pointer-events","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","slope","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","tablevalues","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-orientation","text-rendering","textlength","type","u1","u2","unicode","values","vector-effect","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),Wx=Be(["accent","accentunder","align","bevelled","close","columnalign","columnlines","columnspacing","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lquote","lspace","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),ia=Be(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),AC=Ee(/{{[\w\W]*|^[\w\W]*}}/g),OC=Ee(/<%[\w\W]*|^[\w\W]*%>/g),DC=Ee(/\${[\w\W]*/g),PC=Ee(/^data-[\-\w.\u00B7-\uFFFF]+$/),LC=Ee(/^aria-[\-\w]+$/),jx=Ee(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),MC=Ee(/^(?:\w+script|data):/i),NC=Ee(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),RC=Ee(/^html$/i),$C=Ee(/^[a-z][.\w]*(-[.\w]+)+$/i),yu=Ee(/<[/\w!]/g),Kx=Ee(/<[/\w]/g),HC=Ee(/<\/no(script|embed|frames)/i),Yx=Ee(/\/>/i),ve={element:1,attribute:2,text:3,cdataSection:4,entityReference:5,entityNode:6,processingInstruction:7,comment:8,document:9,documentType:10,documentFragment:11,notation:12},zC=Be(Z({},["style","script","xmp","iframe","noembed","noframes","plaintext","noscript"])),qC=function(){return typeof window>"u"?null:window},VC=function(e,r){if(typeof e!="object"||typeof e.createPolicy!="function")return null;let o=null,n="data-tt-policy-suffix";r&&r.hasAttribute(n)&&(o=r.getAttribute(n));let i="dompurify"+(o?"#"+o:"");try{return e.createPolicy(i,{createHTML(s){return s},createScriptURL(s){return s}})}catch{return console.warn("TrustedTypes policy "+i+" could not be created."),null}},Zx=function(){return{afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]}},pr=function(e,r,o,n){return Ge(e,r)&&Io(e[r])?Z(n.base?Ke(n.base):{},e[r],n.transform):o},vu=function(e,r,o){let n=Ge(e,r)?e[r]:void 0;return n&&typeof n=="object"?Ke(n):o()};function ry(){let t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:qC(),e=_=>ry(_);if(e.version="3.4.17",e.removed=[],!t||!t.document||t.document.nodeType!==ve.document||!t.Element)return e.isSupported=!1,e;let r=t.document,o=r,n=o.currentScript;t.DocumentFragment;let i=t.HTMLTemplateElement,s=t.Node,l=t.Element,c=t.NodeFilter;t.NamedNodeMap===void 0&&(t.NamedNodeMap||t.MozNamedAttrMap),t.HTMLFormElement;let p=t.DOMParser,d=t.trustedTypes,h=l.prototype,x=ot(h,"cloneNode"),B=ot(h,"remove"),v=ot(h,"removeAttributeNode"),A=ot(h,"nextSibling"),q=ot(h,"childNodes"),Q=ot(h,"parentNode"),H=ot(h,"shadowRoot"),j=ot(h,"attributes"),we=s&&s.prototype?ot(s.prototype,"nodeType"):null,U=s&&s.prototype?ot(s.prototype,"nodeName"):null,w=s&&s.prototype?ot(s.prototype,"ownerDocument"):null,E=function(u){return we?we(u):u.nodeType},R=function(u){return U?U(u):u.nodeName},de=EC(h,"namespaceURI"),Qe=function(u){return de?de(u):u.namespaceURI};if(typeof i=="function"){let _=r.createElement("template");_.content&&_.content.ownerDocument&&(r=_.content.ownerDocument)}let be,st="",xr,tn=!1,Pt=0,Xr=function(){if(Pt>0)throw zt('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.')},Yt=function(u){Xr(),Pt++;try{return be.createHTML(u)}finally{Pt--}},rl=function(u){Xr(),Pt++;try{return be.createScriptURL(u)}finally{Pt--}},Xi=function(){return tn||(xr=VC(d,n),tn=!0),xr},M=r,K=M.implementation,te=M.createNodeIterator,Y=M.createDocumentFragment,ce=M.getElementsByTagName,at=o.importNode,D=Zx();e.isSupported=typeof Xx=="function"&&typeof Q=="function"&&K&&K.createHTMLDocument!==void 0;let ke=AC,Zt=OC,wt=DC,ol=PC,nl=LC,Dw=MC,Md=NC,Pw=$C,Nd=jx,fe=null,il=Z({},[...Vx,...gu,...hu,...bu,...Gx]),me=null,sl=Z({},[...Ux,...xu,...Wx,...ia]),Tt=Object.seal(Fo(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),rn=null,Rd=null,Xt=Object.seal(Fo(null,{tagCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeCheck:{writable:!0,configurable:!1,enumerable:!0,value:null}})),$d=!0,al=!0,Hd=!1,ll=!0,Lt=!1,yr=!0,vr=!1,cl=!1,Ji=null,Qi=null,ul=!1,Jr=!1,es=!1,ts=!1,zd=!0,qd=!1,Vd="user-content-",pl=!0,dl=!1,wr=null,Qr={},Tr=null,Gd=Z({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","selectedcontent","style","svg","template","thead","title","video","xmp"]),Ud=null,Wd=Z({},["audio","video","img","source","image","track"]),jd=null,Kd=Z({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),rs="http://www.w3.org/1998/Math/MathML",os="http://www.w3.org/2000/svg",kt="http://www.w3.org/1999/xhtml",eo=kt,fl=!1,ml=null,Lw=Z({},[rs,os,kt],mu),Yd=Be(["mi","mo","mn","ms","mtext"]),gl=Z({},Yd),Zd=Be(["annotation-xml"]),hl=Z({},Zd),Mw=Z({},["title","style","font","a","script"]),on=null,Nw=["application/xhtml+xml","text/html"],Rw="text/html",xe=null,to=null,$w=r.createElement("form"),Xd=function(u){return u instanceof RegExp||u instanceof Function},bl=function(){let u=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};if(to&&to===u)return;(!u||typeof u!="object")&&(u={}),u=Ke(u),on=Nw.indexOf(u.PARSER_MEDIA_TYPE)===-1?Rw:u.PARSER_MEDIA_TYPE,xe=on==="application/xhtml+xml"?mu:Pr,fe=pr(u,"ALLOWED_TAGS",il,{transform:xe}),me=pr(u,"ALLOWED_ATTR",sl,{transform:xe}),ml=pr(u,"ALLOWED_NAMESPACES",Lw,{transform:mu}),jd=pr(u,"ADD_URI_SAFE_ATTR",Kd,{transform:xe,base:Kd}),Ud=pr(u,"ADD_DATA_URI_TAGS",Wd,{transform:xe,base:Wd}),Tr=pr(u,"FORBID_CONTENTS",Gd,{transform:xe}),rn=pr(u,"FORBID_TAGS",Ke({}),{transform:xe}),Rd=pr(u,"FORBID_ATTR",Ke({}),{transform:xe}),Qr=Ge(u,"USE_PROFILES")?u.USE_PROFILES&&typeof u.USE_PROFILES=="object"?Ke(u.USE_PROFILES):u.USE_PROFILES:!1,$d=u.ALLOW_ARIA_ATTR!==!1,al=u.ALLOW_DATA_ATTR!==!1,Hd=u.ALLOW_UNKNOWN_PROTOCOLS||!1,ll=u.ALLOW_SELF_CLOSE_IN_ATTR!==!1,Lt=u.SAFE_FOR_TEMPLATES||!1,yr=u.SAFE_FOR_XML!==!1,vr=u.WHOLE_DOCUMENT||!1,Jr=u.RETURN_DOM||!1,es=u.RETURN_DOM_FRAGMENT||!1,ts=u.RETURN_TRUSTED_TYPE||!1,ul=u.FORCE_BODY||!1,zd=u.SANITIZE_DOM!==!1,qd=u.SANITIZE_NAMED_PROPS||!1,pl=u.KEEP_CONTENT!==!1,dl=u.IN_PLACE||!1,Nd=FC(u.ALLOWED_URI_REGEXP)?u.ALLOWED_URI_REGEXP:jx,eo=typeof u.NAMESPACE=="string"?u.NAMESPACE:kt,gl=vu(u,"MATHML_TEXT_INTEGRATION_POINTS",()=>Z({},Yd)),hl=vu(u,"HTML_INTEGRATION_POINTS",()=>Z({},Zd));let b=vu(u,"CUSTOM_ELEMENT_HANDLING",()=>Fo(null));if(Tt=Fo(null),Ge(b,"tagNameCheck")&&Xd(b.tagNameCheck)&&(Tt.tagNameCheck=b.tagNameCheck),Ge(b,"attributeNameCheck")&&Xd(b.attributeNameCheck)&&(Tt.attributeNameCheck=b.attributeNameCheck),Ge(b,"allowCustomizedBuiltInElements")&&typeof b.allowCustomizedBuiltInElements=="boolean"&&(Tt.allowCustomizedBuiltInElements=b.allowCustomizedBuiltInElements),Ee(Tt),Lt&&(al=!1),es&&(Jr=!0),Qr&&(fe=Z({},Gx),me=Fo(null),Qr.html===!0&&(Z(fe,Vx),Z(me,Ux)),Qr.svg===!0&&(Z(fe,gu),Z(me,xu),Z(me,ia)),Qr.svgFilters===!0&&(Z(fe,hu),Z(me,xu),Z(me,ia)),Qr.mathMl===!0&&(Z(fe,bu),Z(me,Wx),Z(me,ia))),Xt.tagCheck=null,Xt.attributeCheck=null,Ge(u,"ADD_TAGS")&&(typeof u.ADD_TAGS=="function"?Xt.tagCheck=u.ADD_TAGS:Io(u.ADD_TAGS)&&(fe===il&&(fe=Ke(fe)),Z(fe,u.ADD_TAGS,xe))),Ge(u,"ADD_ATTR")&&(typeof u.ADD_ATTR=="function"?Xt.attributeCheck=u.ADD_ATTR:Io(u.ADD_ATTR)&&(me===sl&&(me=Ke(me)),Z(me,u.ADD_ATTR,xe))),Ge(u,"ADD_FORBID_CONTENTS")&&Io(u.ADD_FORBID_CONTENTS)&&(Tr===Gd&&(Tr=Ke(Tr)),Z(Tr,u.ADD_FORBID_CONTENTS,xe)),pl&&(fe["#text"]=!0),vr&&Z(fe,["html","head","body"]),fe.table&&(Z(fe,["tbody"]),delete rn.tbody),u.TRUSTED_TYPES_POLICY){if(typeof u.TRUSTED_TYPES_POLICY.createHTML!="function")throw zt('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');if(typeof u.TRUSTED_TYPES_POLICY.createScriptURL!="function")throw zt('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');let T=be;be=u.TRUSTED_TYPES_POLICY;try{st=Yt("")}catch(k){throw be=T,k}}else u.TRUSTED_TYPES_POLICY===null?(be=void 0,st=""):(be===void 0&&(be=Xi()),be&&typeof st=="string"&&(st=Yt("")));Be&&Be(u),to=u},Jd=Z({},[...gu,...hu,...IC]),Qd=Z({},[...bu,...CC]),Hw=function(u,b,T){return b.namespaceURI===kt?u==="svg":b.namespaceURI===rs?u==="svg"&&(T==="annotation-xml"||gl[T]):!!Jd[u]},zw=function(u,b,T){return b.namespaceURI===kt?u==="math":b.namespaceURI===os?u==="math"&&hl[T]:!!Qd[u]},qw=function(u,b,T){return b.namespaceURI===os&&!hl[T]||b.namespaceURI===rs&&!gl[T]?!1:!Qd[u]&&(Mw[u]||!Jd[u])},Vw=function(u){let b=Qe(u),T=Pr(R(u)),k=Q(u),O,L;return k&&E(k)===ve.element?(O={namespaceURI:Qe(k)},L=Pr(R(k))):(O={namespaceURI:eo},L="template"),ml[b]?b===os?Hw(T,O,L):b===rs?zw(T,O,L):b===kt?qw(T,O,L):!!(on==="application/xhtml+xml"&&ml[b]):!1},Jt=function(u){Kn(e.removed,{element:u});try{Q(u).removeChild(u)}catch{if(B(u),!Q(u))throw zt("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place")}},ef=function(u,b,T){try{v(u,b)}catch{try{u.removeAttribute(T)}catch{}}},xl=function(u){vl(u);let b=q(u);b&&Ht(vC(b),k=>{try{B(k)}catch{}});let T=E(u)===ve.element?j(u):null;if(T)for(let k=T.length-1;k>=0;--k){let O=T[k],L=O&&O.name;typeof L=="string"&&ef(u,O,L)}},ro=function(u,b,T){if(!T)try{T=b.getAttributeNode(u)}catch{T=null}Kn(e.removed,{attribute:T||null,from:b});try{T?v(b,T):b.removeAttribute(u)}catch{try{b.removeAttribute(u)}catch{}}if(u==="is")if(Jr||es)try{Jt(b)}catch{}else try{b.setAttribute(u,"")}catch{}},tf=function(u){let b=j(u);if(b)for(let T=b.length-1;T>=0;--T){let k=b[T],O=k&&k.name;typeof O!="string"||me[xe(O)]||ef(u,k,O)}},yl=function(u,b){let T=arguments.length>2&&arguments[2]!==void 0?arguments[2]:!1,k=[u];for(;k.length>0;){let O=k.pop();if(b(O)===!1)continue;if(T&&E(O)===ve.element){let G=H(O);Qt(G)&&k.push(G)}let L=q(O);if(L)for(let G=L.length-1;G>=0;--G)k.push(L[G])}},vl=function(u){yl(u,b=>{E(b)===ve.element&&tf(b)})},wl=function(u){let b=[];return yl(u,T=>{b.push(T)},!0),b},Gw=function(u,b){let T=du();Ht(wl(u),k=>{E(k)===ve.element&&fu(T,k)}),Ht(b,k=>{E(k)===ve.element&&!Yn(T,k)&&tf(k)})},rf=function(u,b){let T=!1;return Ht(e.removed,k=>{k.element&&(T=T||k.element===u,vl(k.element))}),Gw(u,b),T},Uw=8,Ww=function(u,b){let T=wr,k=null,O=()=>(k||(k=du(),Ht(b,L=>{fu(k,L)})),k);for(let L=0;;L++){let G=wl(u),Te=[u],Bt=!1;if(Ht(G,Pe=>{E(Pe)===ve.documentFragment?Kn(Te,Pe):!Bt&&!Yn(T,Pe)&&(Bt=Yn(O(),Pe))}),!Bt)return;if(L>=Uw)throw zt("the tree kept changing during in-place sanitization; refusing to return it");Ht(Te,(Pe,He)=>{jw(Pe,He>0,u,O())})}},jw=function(u,b,T,k){let O=Tl(u),L;for(;L=O.nextNode();)!Yn(k,L)||Yn(wr,L)||(b&&lt(D.uponSanitizeShadowNode,L,null),Bl(L,T),_l(L,T),Qt(L.content)&&sn(L.content))},Kw=function(u){wr&&fu(wr,u)},of=function(u,b){return yr?u==="patchsrc"?!0:u==="for"&&b!=="label"&&b!=="output":!1},Yw=function(u){yr&&yl(u,b=>{let T=E(b);if(T===ve.processingInstruction||T===ve.comment&&Se(Kx,b.data)){try{B(b)}catch{}return!1}if(T===ve.element){let k=b,O=xe(R(b));try{k.hasAttribute&&k.hasAttribute("patchsrc")&&k.removeAttribute("patchsrc"),k.hasAttribute&&k.hasAttribute("for")&&of("for",O)&&k.removeAttribute("for")}catch{}}return!0})},nf=function(u){let b=null,T=null;if(ul)u="<remove></remove>"+u;else{let L=$x(u,/^[\r\n\t ]+/);T=L&&L[0]}on==="application/xhtml+xml"&&eo===kt&&(u='<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+u+"</body></html>");let k=be?Yt(u):u;if(eo===kt)try{b=new p().parseFromString(k,on)}catch{}if(!b||!b.documentElement){b=K.createDocument(eo,"template",null);try{b.documentElement.innerHTML=fl?st:k}catch{}}let O=b.body||b.documentElement;return u&&T&&O.insertBefore(r.createTextNode(T),O.childNodes[0]||null),eo===kt?ce.call(b,vr?"html":"body")[0]:vr?b.documentElement:O},Tl=function(u){let b=w?w(u):u.ownerDocument;return te.call(b||u,u,c.SHOW_ELEMENT|c.SHOW_COMMENT|c.SHOW_TEXT|c.SHOW_PROCESSING_INSTRUCTION|c.SHOW_CDATA_SECTION,null)},ns=function(u){return u=Zn(u,ke," "),u=Zn(u,Zt," "),u=Zn(u,wt," "),u},kl=function(u){var b;sf(u);let T=(b=u.querySelectorAll)===null||b===void 0?void 0:b.call(u,"template");T&&Ht(T,k=>{Qt(k.content)&&kl(k.content)})},sf=function(u){u.normalize();let b=w?w(u):u.ownerDocument,T=te.call(b||u,u,c.SHOW_TEXT|c.SHOW_COMMENT|c.SHOW_CDATA_SECTION|c.SHOW_PROCESSING_INSTRUCTION,null),k=T.nextNode();for(;k;)k.data=ns(k.data),k=T.nextNode()},is=function(u){let b=U?U(u):null;return typeof b!="string"||xe(b)!=="form"?!1:typeof u.nodeName!="string"||typeof u.textContent!="string"||typeof u.removeChild!="function"||u.attributes!==j(u)||typeof u.removeAttribute!="function"||typeof u.removeAttributeNode!="function"||typeof u.getAttributeNode!="function"||typeof u.setAttribute!="function"||typeof u.namespaceURI!="string"||typeof u.insertBefore!="function"||typeof u.hasChildNodes!="function"||u.nodeType!==we(u)||u.childNodes!==q(u)},Qt=function(u){if(!we||typeof u!="object"||u===null)return!1;try{return we(u)===ve.documentFragment}catch{return!1}},nn=function(u){if(!we||typeof u!="object"||u===null)return!1;try{return typeof we(u)=="number"}catch{return!1}};function lt(_,u,b){_.length!==0&&Ht(_,T=>{T.call(e,u,b,to)})}let Zw=function(u,b){return!!(yr&&u.hasChildNodes()&&!nn(u.firstElementChild)&&Se(yu,u.textContent)&&Se(yu,u.innerHTML)||yr&&zC[b]&&E(u)===ve.element&&Qe(u)===kt&&(nn(u.firstElementChild)||typeof u.textContent=="string"&&Se(yu,u.textContent))||u.nodeType===ve.processingInstruction||yr&&u.nodeType===ve.comment&&Se(Kx,u.data))},ss=function(u,b){if(u instanceof RegExp)return Se(u,b);if(u instanceof Function){for(var T=arguments.length,k=new Array(T>2?T-2:0),O=2;O<T;O++)k[O-2]=arguments[O];return!!u(b,...k)}return!1},Xw=function(u,b,T){if(!rn[b]&&cf(b)&&ss(Tt.tagNameCheck,b))return!1;if(pl&&!Tr[b]&&!Tr[Pr(b)]){let k=Q(u),O=q(u);if(O&&k){let L=O.length;for(let G=L-1;G>=0;--G){let Te=u===T?x(O[G],!0):O[G];k.insertBefore(Te,A(u))}}}return Jt(u),!0},af=function(u,b,T,k){return u.length===0?b:b===T||b===k?Ke(b):b},oo=function(u,b){return u===b||Q(u)!==null?!1:(dl&&vl(u),!0)},Bl=function(u,b){if(Kw(u),lt(D.beforeSanitizeElements,u,null),oo(u,b))return!0;if(is(u))return Jt(u),!0;let T=xe(R(u));if(fe=af(D.uponSanitizeElement,fe,il,Ji),lt(D.uponSanitizeElement,u,{tagName:T,allowedTags:fe}),oo(u,b))return!0;if(Zw(u,T))return Jt(u),!0;if(rn[T]||!(Xt.tagCheck instanceof Function&&Xt.tagCheck(T))&&!fe[T]){let k=Xw(u,T,b);return k===!1&&(lt(D.afterSanitizeElements,u,null),oo(u,b))?!0:k}if(E(u)===ve.element&&!Vw(u)||(T==="noscript"||T==="noembed"||T==="noframes")&&Se(HC,u.innerHTML))return Jt(u),!0;if(Lt&&u.nodeType===ve.text){let k=ns(u.textContent);u.textContent!==k&&(Kn(e.removed,{element:u.cloneNode()}),u.textContent=k)}return lt(D.afterSanitizeElements,u,null),oo(u,b)},lf=function(u,b,T){if(Rd[b]||of(b,u)||zd&&(b==="id"||b==="name")&&(T in r||T in $w))return!1;let k=me[b]||Xt.attributeCheck instanceof Function&&Xt.attributeCheck(b,u);return al&&Se(ol,b)||$d&&Se(nl,b)?!0:k?jd[b]||Se(Nd,Zn(T,Md,""))||(b==="src"||b==="xlink:href"||b==="href")&&u!=="script"&&Hx(T,"data:")===0&&Ud[u]||Hd&&!Se(Dw,Zn(T,Md,""))?!0:!T:cf(u)&&ss(Tt.tagNameCheck,u)&&ss(Tt.attributeNameCheck,b,u)||b==="is"&&Tt.allowCustomizedBuiltInElements&&ss(Tt.tagNameCheck,T)},Jw=Z({},["annotation-xml","color-profile","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","missing-glyph"]),cf=function(u){return!Jw[Pr(u)]&&Se(Pw,u)},Qw=function(u,b,T,k){if(be&&typeof d=="object"&&typeof d.getAttributeType=="function"&&!T)switch(d.getAttributeType(u,b)){case"TrustedHTML":return Yt(k);case"TrustedScriptURL":return rl(k)}return k},eT=function(u,b,T,k){try{return T?u.setAttributeNS(T,b,k):u.setAttribute(b,k),is(u)?(Jt(u),!1):!0}catch{return ro(b,u),!1}},uf=function(u,b){return yr&&Se(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i,b)?!0:Pr(u)==="attributename"&&$x(b,"href")!==null},_l=function(u,b){if(lt(D.beforeSanitizeAttributes,u,null),oo(u,b))return;let T=u.attributes;if(!T||is(u))return;me=af(D.uponSanitizeAttribute,me,sl,Qi);let k={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:me,forceKeepAttr:void 0},O=T.length,L=xe(u.nodeName);for(;O--;){let G=T[O],Te=G.name,Bt=G.namespaceURI,Pe=G.value,He=xe(Te),no=Pe,ze=Te==="value"?no:TC(no),pf=!1;if(k.attrName=He,k.attrValue=ze,k.keepAttr=!0,k.forceKeepAttr=void 0,lt(D.uponSanitizeAttribute,u,k),ze=k.attrValue,qd&&(He==="id"||He==="name")&&Hx(ze,Vd)!==0&&(ro(Te,u,G),ze=Vd+ze,pf=!0),uf(Te,ze)){ro(Te,u,G);continue}if(!k.forceKeepAttr){if(!k.keepAttr){ro(Te,u,G);continue}if(!ll&&Se(Yx,ze)){ro(Te,u,G);continue}if(Lt&&(ze=ns(ze)),!lf(L,He,ze)){ro(Te,u,G);continue}ze=Qw(L,He,Bt,ze),ze!==no&&eT(u,Te,Bt,ze)&&pf&&Rx(e.removed)}}lt(D.afterSanitizeAttributes,u,null),oo(u,b)},sn=function(u){let b=null,T=Tl(u);for(lt(D.beforeSanitizeShadowDOM,u,null);b=T.nextNode();)if(lt(D.uponSanitizeShadowNode,b,null),Bl(b,u),_l(b,u),Qt(b.content)&&sn(b.content),E(b)===ve.element){let k=H(b);Qt(k)&&(Sl(k),sn(k))}Lt&&sf(u),lt(D.afterSanitizeShadowDOM,u,null)},Sl=function(u){let b=[{node:u,shadow:null}];for(;b.length>0;){let T=b.pop();if(T.shadow){sn(T.shadow);continue}let k=T.node,O=E(k)===ve.element,L=q(k);if(L)for(let G=L.length-1;G>=0;--G)b.push({node:L[G],shadow:null});if(O){let G=U?U(k):null;if(typeof G=="string"&&xe(G)==="template"){let Te=k.content;Qt(Te)&&b.push({node:Te,shadow:null})}}if(O){let G=H(k);Qt(G)&&b.push({node:null,shadow:G},{node:G,shadow:null})}}};return e.sanitize=function(_){let u=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},b=null,T=null,k=null,O=null;if(fl=!_,fl&&(_="<!-->"),typeof _!="string"&&!nn(_)&&(_=SC(_),typeof _!="string"))throw zt("dirty is not a string, aborting");if(!e.isSupported)return _;cl?(fe=Ji,me=Qi):bl(u),(D.uponSanitizeElement.length>0||D.uponSanitizeAttribute.length>0)&&(fe=Ke(fe)),D.uponSanitizeAttribute.length>0&&(me=Ke(me)),e.removed=[];let L=dl&&typeof _!="string"&&nn(_),G=[],Te=wr;if(L){Yw(_);let He=R(_);if(typeof He=="string"){let no=xe(He);if(!fe[no]||rn[no])throw xl(_),zt("root node is forbidden and cannot be sanitized in-place")}if(is(_))throw xl(_),zt("root node is clobbered and cannot be sanitized in-place");G=wl(_),wr=du()}else if(nn(_))b=nf("<!---->"),T=b.ownerDocument.importNode(_,!0),T.nodeType===ve.element&&T.nodeName==="BODY"||T.nodeName==="HTML"?b=T:b.appendChild(T),Sl(b);else{if(!Jr&&!Lt&&!vr&&_.indexOf("<")===-1)return be&&ts?Yt(_):_;if(b=nf(_),!b)return Jr?null:ts?st:""}b&&ul&&Jt(b.firstChild);let Bt=L?_:b;try{L&&Sl(_);let He=Tl(Bt);for(;k=He.nextNode();)Bl(k,Bt),_l(k,Bt),Qt(k.content)&&sn(k.content);L&&Ww(_,G)}catch(He){throw L&&(xl(_),rf(_,G)),He}finally{wr=Te}if(L){if(rf(_,G))throw zt("a node selected for removal could not be safely returned; refusing to sanitize in place");return Lt&&kl(_),_}if(Jr){if(Lt&&kl(b),es)for(O=Y.call(b.ownerDocument);b.firstChild;)O.appendChild(b.firstChild);else O=b;return(me.shadowroot||me.shadowrootmode)&&(O=at.call(o,O,!0)),O}let Pe=vr?b.outerHTML:b.innerHTML;return vr&&fe["!doctype"]&&b.ownerDocument&&b.ownerDocument.doctype&&b.ownerDocument.doctype.name&&Se(RC,b.ownerDocument.doctype.name)&&(Pe="<!DOCTYPE "+b.ownerDocument.doctype.name+`>
`+Pe),Lt&&(Pe=ns(Pe)),be&&ts?Yt(Pe):Pe},e.setConfig=function(){let _=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};bl(_),cl=!0,Ji=fe,Qi=me},e.clearConfig=function(){to=null,cl=!1,Ji=null,Qi=null,be=xr,st=""},e.isValidAttribute=function(_,u,b){to||bl({});let T=xe(_),k=xe(u);return typeof b=="string"&&(uf(u,b)||!ll&&Se(Yx,b))?!1:lf(T,k,b)},e.addHook=function(_,u){typeof u=="function"&&Ge(D,_)&&Kn(D[_],u)},e.removeHook=function(_,u){if(Ge(D,_)){if(u!==void 0){let b=yC(D[_],u);return b===-1?void 0:wC(D[_],b,1)[0]}return Rx(D[_])}},e.removeHooks=function(_){Ge(D,_)&&(D[_]=[])},e.removeAllHooks=function(){D=Zx()},e}var ku=ry();function iy(t,e={}){try{return Bu.sanitize(t,{...e,RETURN_DOM_FRAGMENT:!0})}catch(r){if(window.isCurrentlyPrinting)return console.warn("Working around error from dompurify during printing",r),Bu.sanitize(t,{...e,RETURN_DOM_FRAGMENT:!0,TRUSTED_TYPES_POLICY:{createHTML:o=>o,createScriptURL:o=>o}});throw r}}var Bu=ku(),oy=ku();typeof window<"u"&&(Bu.addHook("afterSanitizeAttributes",ny),oy.addHook("afterSanitizeAttributes",ny),oy.addHook("uponSanitizeElement",GC));function ny(t){"target"in t&&(t.setAttribute("target","_blank"),t.setAttribute("rel","noopener noreferrer"))}function GC(t,e){e.tagName!=="iframe"||t.getAttribute("src")?.startsWith("https://www.youtube.com/embed/")||t.parentNode?.removeChild(t)}function ft(t,e,...r){return t.bind(e,...r)}z();var qt=m("button",`
  /* Resets */
  position: relative;
  outline: none;
  border-style: none;
  line-height: normal;
  user-select: none;

  /* Vars */
  font-size:     ${C.mediumFontSize};
  letter-spacing: -0.08px;
  padding: 4px 8px;

  background-color: transparent;
  color:            ${g.controlFg};
  --icon-color:     ${g.controlFg};

  border:        ${g.controlBorder};
  border-radius: ${C.controlBorderRadius};

  cursor: pointer;

  outline-offset: 2px;

  &-large {
    font-weight: 500;
    padding: 10px 24px;
    min-height: 40px;
  }

  &-primary {
    background-color: ${g.controlPrimaryBg};
    color:            ${g.controlPrimaryFg};
    --icon-color:     ${g.controlPrimaryFg};
    border-color:     ${g.controlPrimaryBg};
  }

  &:hover {
    color:        ${g.controlHoverFg};
    --icon-color: ${g.controlHoverFg};
    border-color: ${g.controlHoverFg};
  }
  &-primary:hover {
    color:            ${g.controlPrimaryFg};
    --icon-color:     ${g.controlPrimaryFg};
    background-color: ${g.controlPrimaryHoverBg};
    border-color: ${g.controlPrimaryHoverBg};
  }
  &-danger, &-danger:hover {
    color:        ${tt.controlDangerFg};
    --icon-color: ${tt.controlDangerFg};
    border-color: ${tt.controlDangerFg};
  }
  &-danger:hover {
    filter: brightness(0.8);
  }
  &:disabled {
    cursor: not-allowed;
    color:        ${g.controlDisabledFg};
    --icon-color: ${g.controlDisabledFg};
    background-color: ${g.controlDisabledBg};
    border-color: ${g.controlDisabledBg};
  }
`);function Ft(t,...e){let r=t.link?UC(f.cls(qt.className)):qt();return f.update(r,qt.cls("-large",t.large??!1),qt.cls("-primary",t.primary??!1),qt.cls("-danger",t.danger??!1),...e)}var sa=ft(Ft,null,{}),qN=ft(Ft,null,{large:!0}),aa=ft(Ft,null,{primary:!0}),VN=ft(Ft,null,{large:!0,primary:!0}),GN=ft(Ft,null,{danger:!0}),UN=ft(Ft,null,{large:!0,danger:!0}),sy=ft(Ft,null,{link:!0}),WN=ft(Ft,null,{link:!0,large:!0}),ay=ft(Ft,null,{link:!0,primary:!0}),jN=ft(Ft,null,{link:!0,large:!0,primary:!0}),Jn=m(qt,`
  position: relative;
  z-index: 1;
  border: none;
  padding: 0px;
  text-align: left;
  background-color: inherit !important;
  &:disabled, &[aria-disabled="true"] {
    color: ${g.controlPrimaryBg};
    opacity: 0.4;
  }
  &:hover::after {
    z-index: -1;
    content: '';
    position: absolute;
    inset: -3px;
    left: -6px;
    right: -6px;
    border-radius: ${a.controlBorderRadius};
    background-color: ${tt.textButtonHoverBg};
    border: 1px solid ${tt.textButtonHoverBorder};
  }
  &-hover-bg-padding-none:hover::after {
    top: 0px;
    bottom: 0px;
  }
  &-hover-bg-padding-sm:hover::after {
    inset: -1px;
    left: -3px;
    right: -3px;
  }
  &:active::after {
    border-color: transparent;
    background-color: transparent;
  }
  &:focus-visible {
    outline: 3px solid ${a.primary};
    outline-offset: 2px;
  }
`),UC=m("a",`
  display: inline-block;
  &, &:hover, &:focus {
    text-decoration: none;
  }
`),KN=m("div",`
  display: flex;
  flex-direction: row;

  & > .${qt.className} {
    border-radius: 0;
  }

  & > .${qt.className}:first-child {
    border-top-left-radius: ${C.controlBorderRadius};
    border-bottom-left-radius: ${C.controlBorderRadius};
  }

  & > .${qt.className}:last-child {
    border-top-right-radius: ${C.controlBorderRadius};
    border-bottom-right-radius: ${C.controlBorderRadius};
  }
`);z();var la=`
  margin: 0;
  padding: 0;
  border: 0 solid;
`,Co=m("button",`
  ${la}
  font: inherit;
  letter-spacing: inherit;
  color: inherit;
  border-radius: 0;
  background-color: transparent;
  opacity: 1;
  appearance: button;
`),XN=m("a",`
  ${la}
  color: inherit;
  -webkit-text-decoration: inherit;
  text-decoration: inherit;

  &:hover, &:focus {
    color: inherit;
    -webkit-text-decoration: inherit;
    text-decoration: inherit;
  }
`),JN=m("ul",`
  ${la}
  list-style: none;
`),WC=`
  ${la}
  font-size: inherit;
  font-weight: inherit;
`,QN=m("h2",WC);z();var cy=`
  position: relative;
  display: inline-block;
  vertical-align: middle;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: contain;
  width: 16px;
  height: 16px;
  background-color: var(--icon-color, var(--grist-theme-text, black));
`,jC=`
  position: relative;
  display: inline-block;
  vertical-align: middle;
  width: 16px;
  height: 16px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
`,KC=m("div",cy),ly=m("span",cy),iR=m("div",jC);function re(t,...e){return KC(f.style("-webkit-mask-image",`var(--icon-${t})`),...e)}var sR=m(ly,`
  background-color: var(--icon-background, inherit);
  -webkit-mask: none;
  & .${ly.className} {
    transition: inherit;
    display: block;
  }
`),aR=m(Co,`
  flex: none;
  height: 24px;
  width: 24px;
  padding: 4px;
  border-radius: 3px;
  line-height: 0px;
  cursor: default;
  outline-offset: -2px;
  --icon-color: ${g.controlSecondaryFg};
  &:hover, &.weasel-popup-open {
    background-color: ${g.controlSecondaryHoverBg};
    --icon-color: ${g.controlSecondaryFg};
  }
`);z();var _y=ct(dy()),Su=ct(An());var pA=ct(Lc()),dA=ct(wy());var _R="\u25B2",SR="\u25BC",fA=new RegExp("^\\w[\\w%+/='-]*(\\.[\\w%+/='-]+)*@([A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?\\.)+[A-Za-z]{2,24}$","u");function mA(t,e){return t.lastIndexOf(e,0)===0}function gA(t,e){return t.includes(e,t.length-e.length)}function ER(t,e){return mA(t,e)?t.slice(e.length):null}function hA(t,e){return gA(t,e)?t.slice(0,t.length-e.length):null}function FR(t){let e=hA(t,"/");return e===null?t:e}function IR(t){return t.replace(/\b[a-z]/gi,e=>e.toUpperCase())}function CR(t){return t.replace(/\b[a-z]/i,e=>e.toUpperCase())}function AR(t,e,r){return t.replace(e,()=>r)}function OR(t,e){let r=Object.keys(e);if(!r.length)return t;let o=new RegExp(r.map(_y.default).join("|"),"g");return t.replace(o,n=>e[n])}function Sy(t){return!isNaN(parseFloat(t))&&isFinite(t)}function Eu(t,e,r){return Math.max(e,Math.min(r,t))}function DR(t,e,r){let o=Math.min(e,r),n=Math.max(e,r);return o<=t&&t<=n}function PR(t,e){return(t%e+e)%e}function LR(t,e){return Math.floor(t/e)*e}function MR(t,e){return t!==void 0?t:e}function NR(...t){for(let e of t)if(e!==void 0)return e}function Fu(t,e){if(typeof t=="number")return Number.isNaN(t)?e:t;if(typeof t=="string"){let r=Number.parseFloat(t);return Number.isNaN(r)?e:r}else return e}function RR(t,e){try{return t!==""&&t!==void 0?JSON.parse(t):e}catch{return e}}function Ty(t){return encodeURIComponent(String(t===void 0?null:t)).replace(/%2F/g,"/")}function $R(t){return Object.keys(t).map(e=>Ty(e)+"="+Ty(t[e])).join("&")}function HR(t,e,r){let o=[],n=0,i;for(let s=0;s<r&&(i=t.indexOf(e,n),i!==-1);s++)o.push(t.slice(n,i)),n=i+e.length;return o.push(t.slice(n)),o}function zR(t,e){if(t===e)return!0;if(!t||!e||t.length!==e.length)return!1;for(let r=0;r<t.length;r++)if(t[r]!==e[r])return!1;return!0}function qR(t,e){let r=new Set;for(let o of t)e.has(o)||r.add(o);return r}function VR(t,e){return Array.prototype.indexOf.call(t,e)}function Ey(t,e){let r=t.indexOf(e);return r===-1?!1:(t.splice(r,1),!0)}function GR(t,e,r){let o=t.indexOf(r);o===-1?t.push(e):t.splice(o,0,e)}function UR(t,e){for(let r=0,o=e.length;r<o;r++)t.push(e[r])}function Ao(t,e,r,o,n){let i=e+n;for(let s=i-7;e<s;o+=8,e+=8)t[e]=r[o],t[e+1]=r[o+1],t[e+2]=r[o+2],t[e+3]=r[o+3],t[e+4]=r[o+4],t[e+5]=r[o+5],t[e+6]=r[o+6],t[e+7]=r[o+7];for(;e<i;++o,++e)t[e]=r[o]}function bA(t,e,r,o,n){let i=e+n-1,s=o+n-1;for(let l=e+7;i>=l;i-=8,s-=8)t[i]=r[s],t[i-1]=r[s-1],t[i-2]=r[s-2],t[i-3]=r[s-3],t[i-4]=r[s-4],t[i-5]=r[s-5],t[i-6]=r[s-6],t[i-7]=r[s-7];for(;i>=e;--i,--s)t[i]=r[s]}function WR(t,e,r,o){if(o===1)t.push(e[r]);else{let n=t.length;t.length=n+o,Ao(t,n,e,r,o)}}function jR(t,e,r){let o=t.length,n=o-e,i=r.length;return t.length=o+i,i>n?(Ao(t,o,r,n,i-n),Ao(t,e+i,t,e,n),Ao(t,e,r,0,n)):(Ao(t,o,t,o-i,i),bA(t,e+i,t,e,n-i),Ao(t,e,r,0,i)),t}function KR(t,e,r){let o=0,n,i=t.length;if(t.length===0)return 0;for(;o<i;)n=Math.floor((o+i)/2),r(t[n],e)<0?o=n+1:i=n;return o}function YR(t){let e=Object.create(null);for(let r of t){if(r in e)return!0;e[r]=!0}return!1}function ZR(t,e){let r=0;return t.forEach(o=>{e(o)&&r++}),r}function XR(t,e,r){let o=t.length,n=new Array(o);for(let i=0;i<o;i++)n[i]=r(t[i],e[i]);return n}function JR(t,e,r){let o=t.map(n=>Array.from({length:r},(i,s)=>n[s%n.length]));return Array.from({length:e},(n,i)=>o[i%o.length])}function QR(t,e,r){if(t.length!==e.length)throw new Error("Number of sort key funcs must be the same as the number of compare funcs");let o=r||t.map(()=>1);return function(n,i){let s,l,c;for(let p=0;p<e.length;p++)if(l=t[p](n),c=t[p](i),s=e[p](l,c),s!==0)return o[p]*s;return 0}}function xA(t,e){return t<e?-1:t>e?1:0}function e$(t){return function(e,r){return xA(e[t],r[t])}}var yA="en-US",vA=new Intl.Collator(yA),t$=vA.compare;function r$(t,e,r){return t.has(e)||t.set(e,r),t.get(e)}function o$(t,e,r){return t.has(e)||t.set(e,r()),t.get(e)}function n$(t,e){let r=t.get(e);return t.delete(e),r}function i$(t,e,r=Su.default){for(let o of e){let n=r(o);t.set(n,(t.get(n)||0)+1)}}function s$(t,e){let r=e instanceof Set?e:new Set(e);for(let o of t)if(!r.has(o))return!1;return!0}function a$(t,e){let r=t instanceof Set?t:new Set([...t]),o=e instanceof Set?e:new Set(e);if(r.size!==o.size)return!1;for(let n of r)if(!o.has(n))return!1;return!0}function ky(t,e){for(let r=1;r<arguments.length;r++){let o=arguments[r];for(let n in o){if(!o.hasOwnProperty(n))continue;let i=o[n];if(!(i===t||i===void 0)){if(i){let s=t[n];Array.isArray(i)?i=ky(s&&Array.isArray(s)?s:[],i):typeof i=="object"&&(i=ky(s&&typeof s=="object"?s:{},i))}t[n]=i}}}return t}function l$(t){return t<1024?t+"B":t<1024*1024?(t/1024).toFixed(1)+"KB":(t/1024/1024).toFixed(1)+"MB"}function c$(t,e,r){let o=t.map(e,r),n={};for(let i=0;i<t.length;i++)n[t[i]]=o[i];return n}function u$(t,e){if(e.length===0)return;if(e.length===1){t.splice(e[0],1);return}let r=t.length,o=0,n=0;for(let i=0;i<r;i++){if(i===e[n]){n++;continue}i!==o&&(t[o]=t[i]),o++}t.length=o}var wA=["False","None","True","and","as","assert","async","await","break","class","continue","def","del","elif","else","except","finally","for","from","global","if","import","in","is","lambda","nonlocal","not","or","pass","raise","return","try","while","with","yield"];function p$(t,e){for(e=e||"c",t=t.replace(/[^a-zA-Z0-9_]+/g,"_"),t=t.replace(/^_+|_+$/g,""),t=t.replace(/^(?=[0-9])/g,e);wA.includes(t);)t=e+t;return t}function d$(fn){return eval("("+fn.toString()+")")}function f$(t,e){let r="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",o=e||"";for(let n=0;n<t;n++)o+=r[Math.floor(Math.random()*r.length)];return o}function m$(t,e,r,o){let n=o||Su.default,i=0,s=0;for(;i<t.length||s<e.length;){let l=t[i],c=e[s],p=i<t.length?n(l):null,d=s<e.length?n(c):null;p!==null&&(d===null||p<d)?(r(l,null),i++):p===null||p>d?(r(null,c),s++):(r(l,c),i++,s++)}}function g$(t,e){if(t>=e.length){let r=e[e.length-1];return r+Math.random()*r}else return e[t]}function h$(t){return fA.test(t.toLowerCase())}function b$(t,e=Boolean){return new Promise((r,o)=>{let n=t.peek();if(e(n))return r(n);let i=t.subscribe(s=>{e(s)&&(i.dispose(),r(s))})})}async function x$(t,e=Boolean){let r,o=await new Promise((n,i)=>{let s=t.get();if(e(s))return n(s);r=t.addListener(l=>{e(l)&&n(l)})});return r&&r.dispose(),o}function y$(t,e,r){let o=I.create(t,void 0);return e.then(n=>{o.isDisposed()||o.set(n)},n=>{o.isDisposed()||(n instanceof Error||(n=new Error(String(n))),o.set(n),r?.(n))}),o}function Qn(t,e){return r=>_e(r,e,o=>{r.style.setProperty(t,String(o??""))})}var By=class{constructor(){S(this,"_last",Promise.resolve())}add(e){let r=this._last.catch(()=>{throw new Error("Skipped due to an earlier error")}).then(e);return r.catch(()=>{this._last=Promise.resolve()}),this._last=r,r}};function v$(t,e=220){let r=t.substring(1),o=parseInt(r,16),n=o>>16&255,i=o>>8&255,s=o>>0&255;return .2126*n+.7152*i+.0722*s<e}function w$(t){return typeof t!="string"?!1:/^#([0-9A-F]{6})$/i.test(t)}async function TA(t,e,r={rethrow:!1}){if(t<0)return!0;let o={},n,i=new Promise(s=>{n=setTimeout(()=>s(o),t)});try{return await Promise.race([e,i])==o}catch(s){if(r.rethrow)throw s;return!1}finally{clearTimeout(n)}}async function T$(t,e){return TA(e,t)}function Iu(t){return["1","on","true","yes"].includes(String(t).toLowerCase())}function kA(t){return t!=null}function k$(t,e){return kA(t[e])}function B$(t){return!!t}var _$=t=>"_getDepItem"in t?t.get():t.peek();function ca(t,e){if(e==null)return e;let r=e;return typeof r=="function"&&"peek"in r||typeof r=="object"&&"_getDepItem"in r?t(r):typeof r=="function"?r(t):e}var dr=t=>e=>typeof t=="boolean"?!t:t==null?!0:!e(t);function S$(t,e=1/0){let r=new Set;for(let o=0;o<t.length&&r.size<e;o++)r.add(t[o]);return r}function E$(t,e){if(e==null)throw new Error(`Expected '${t}' to be defined, but received ${e}`)}function F$(t,e){return t[e]!==void 0}async function I$(t,e){try{return await t()}catch(r){return await e(r),await t()}}function BA(t){return t==null||t===""||Array.isArray(t)&&!t.length||typeof t=="object"&&!Object.keys(t).length||["[object Map]","[object Set"].includes(t.toString())&&!t.size}function C$(t,e=null){return BA(t)?e:t}function A$(t,e){let r=_t.create(t);return ue.create(t,o=>{let n=qe.create(r);return e(n,o)})}function O$(t){let e=new Map;return(...o)=>{let n=JSON.stringify(o);return e.has(n)||e.set(n,t(...o)),e.get(n)}}function D$(t){let e=t.match(/^(\d+)([smhd])$/);if(!e)throw new Error(`Invalid duration: ${t}`);let[,r,o]=e,n=parseInt(r,10);switch(o){case"s":return n;case"m":return n*60;case"h":return n*60*60;case"d":return n*60*60*24;default:throw new Error(`Invalid duration unit: ${o}`)}}function P$(t){try{return new URL(t??"")}catch{return}}z();var Fy=Sr("test-numeric-spinner-");function ua(t,e={},...r){let{setValueOnInput:o=!1,label:n,defaultValue:i,minValue:s=Number.NEGATIVE_INFINITY,maxValue:l=Number.POSITIVE_INFINITY,disabled:c,inputArgs:p=[],save:d}=e,h=()=>i===void 0?0:typeof i=="number"?i:i.get(),x,B=!1,v=t.get(),A=async(H,j={})=>{let{saveValue:we}=j,U=Fu(x.value,h()),w=Eu(Math.floor(U+H),s,l);return o&&t.set(w),we&&await d?.(w),w},q=(H={})=>A(1,H),Q=(H={})=>A(-1,H);return Iy(c?Iy.cls("-disabled",c):null,n?_A(n):null,x=SA({type:"number"},f.prop("value",t),i!==void 0?f.prop("placeholder",i):null,f.onKeyDown({ArrowUp:async(H,j)=>{j.value=String(await q())},ArrowDown:async(H,j)=>{j.value=String(await Q())},Enter$:async(H,j)=>d&&j.blur(),Escape$:(H,j)=>{o&&t.set(v),j.value=String(v),B=!0,j.blur()}}),o?f.on("input",(H,j)=>{t.set(Number.parseFloat(j.value))}):null,d?f.on("blur",async()=>{if(B){B=!1;return}let H=Fu(x.value,void 0);H!==void 0&&(H=Eu(H,s,l)),await d(H)}):null,f.on("focus",(H,j)=>{v=t.get(),j.select()}),...p),EA(Cy(FA("DropdownUp"),f.on("click",async()=>q({saveValue:!0})),Fy("increment")),Cy(IA("Dropdown"),f.on("click",async()=>Q({saveValue:!0})),Fy("decrement"))),...r)}var Iy=m("div",`
  position: relative;
  flex: auto;
  font-weight: normal;
  display: flex;
  align-items: center;
  outline: 1px solid ${g.inputBorder};
  background-color: ${g.inputBg};
  border-radius: 3px;
  &-disabled {
    opacity: 0.4;
    pointer-events: none;
  }
`),_A=m("div",`
  color: ${g.lightText};
  flex-shrink: 0;
  padding-left: 8px;
  pointer-events: none;
`),SA=m("input",`
  flex-grow: 1;
  padding: 4px 32px 4px 8px;
  width: 100%;
  text-align: right;
  appearance: none;
  color: ${g.inputFg};
  background-color: transparent;
  border: none;
  outline: none;
  -moz-appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`),EA=m("div",`
  position: absolute;
  right: 8px;
  width: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
`),Cy=m("div",`
  --icon-color: ${g.controlSecondaryFg};
  flex: 1 1 0px;
  min-height: 0px;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  &:hover {
    --icon-color: ${g.controlSecondaryHoverFg};
  }
`),FA=m(re,`
  position: absolute;
  top: 0px;
`),IA=m(re,`
  position: absolute;
  bottom: 0px;
`);z();function Ou(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var Nr=Ou();function My(t){Nr=t}var Ny=/[&<>"']/,CA=new RegExp(Ny.source,"g"),Ry=/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,AA=new RegExp(Ry.source,"g"),OA={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},Ay=t=>OA[t];function Ye(t,e){if(e){if(Ny.test(t))return t.replace(CA,Ay)}else if(Ry.test(t))return t.replace(AA,Ay);return t}var DA=/(^|[^\[])\^/g;function oe(t,e){let r=typeof t=="string"?t:t.source;e=e||"";let o={replace:(n,i)=>{let s=typeof i=="string"?i:i.source;return s=s.replace(DA,"$1"),r=r.replace(n,s),o},getRegex:()=>new RegExp(r,e)};return o}function Oy(t){try{t=encodeURI(t).replace(/%25/g,"%")}catch{return null}return t}var ri={exec:()=>null};function Dy(t,e){let r=t.replace(/\|/g,(i,s,l)=>{let c=!1,p=s;for(;--p>=0&&l[p]==="\\";)c=!c;return c?"|":" |"}),o=r.split(/ \|/),n=0;if(o[0].trim()||o.shift(),o.length>0&&!o[o.length-1].trim()&&o.pop(),e)if(o.length>e)o.splice(e);else for(;o.length<e;)o.push("");for(;n<o.length;n++)o[n]=o[n].trim().replace(/\\\|/g,"|");return o}function ei(t,e,r){let o=t.length;if(o===0)return"";let n=0;for(;n<o;){let i=t.charAt(o-n-1);if(i===e&&!r)n++;else if(i!==e&&r)n++;else break}return t.slice(0,o-n)}function PA(t,e){if(t.indexOf(e[1])===-1)return-1;let r=0;for(let o=0;o<t.length;o++)if(t[o]==="\\")o++;else if(t[o]===e[0])r++;else if(t[o]===e[1]&&(r--,r<0))return o;return-1}function Py(t,e,r,o){let n=e.href,i=e.title?Ye(e.title):null,s=t[1].replace(/\\([\[\]])/g,"$1");if(t[0].charAt(0)!=="!"){o.state.inLink=!0;let l={type:"link",raw:r,href:n,title:i,text:s,tokens:o.inlineTokens(s)};return o.state.inLink=!1,l}return{type:"image",raw:r,href:n,title:i,text:Ye(s)}}function LA(t,e){let r=t.match(/^(\s+)(?:```)/);if(r===null)return e;let o=r[1];return e.split(`
`).map(n=>{let i=n.match(/^\s+/);if(i===null)return n;let[s]=i;return s.length>=o.length?n.slice(o.length):n}).join(`
`)}var Oo=class{constructor(e){S(this,"options");S(this,"rules");S(this,"lexer");this.options=e||Nr}space(e){let r=this.rules.block.newline.exec(e);if(r&&r[0].length>0)return{type:"space",raw:r[0]}}code(e){let r=this.rules.block.code.exec(e);if(r){let o=r[0].replace(/^ {1,4}/gm,"");return{type:"code",raw:r[0],codeBlockStyle:"indented",text:this.options.pedantic?o:ei(o,`
`)}}}fences(e){let r=this.rules.block.fences.exec(e);if(r){let o=r[0],n=LA(o,r[3]||"");return{type:"code",raw:o,lang:r[2]?r[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):r[2],text:n}}}heading(e){let r=this.rules.block.heading.exec(e);if(r){let o=r[2].trim();if(/#$/.test(o)){let n=ei(o,"#");(this.options.pedantic||!n||/ $/.test(n))&&(o=n.trim())}return{type:"heading",raw:r[0],depth:r[1].length,text:o,tokens:this.lexer.inline(o)}}}hr(e){let r=this.rules.block.hr.exec(e);if(r)return{type:"hr",raw:ei(r[0],`
`)}}blockquote(e){let r=this.rules.block.blockquote.exec(e);if(r){let o=ei(r[0],`
`).split(`
`),n="",i="",s=[];for(;o.length>0;){let l=!1,c=[],p;for(p=0;p<o.length;p++)if(/^ {0,3}>/.test(o[p]))c.push(o[p]),l=!0;else if(!l)c.push(o[p]);else break;o=o.slice(p);let d=c.join(`
`),h=d.replace(/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,`
    $1`).replace(/^ {0,3}>[ \t]?/gm,"");n=n?`${n}
${d}`:d,i=i?`${i}
${h}`:h;let x=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(h,s,!0),this.lexer.state.top=x,o.length===0)break;let B=s[s.length-1];if(B?.type==="code")break;if(B?.type==="blockquote"){let v=B,A=v.raw+`
`+o.join(`
`),q=this.blockquote(A);s[s.length-1]=q,n=n.substring(0,n.length-v.raw.length)+q.raw,i=i.substring(0,i.length-v.text.length)+q.text;break}else if(B?.type==="list"){let v=B,A=v.raw+`
`+o.join(`
`),q=this.list(A);s[s.length-1]=q,n=n.substring(0,n.length-B.raw.length)+q.raw,i=i.substring(0,i.length-v.raw.length)+q.raw,o=A.substring(s[s.length-1].raw.length).split(`
`);continue}}return{type:"blockquote",raw:n,tokens:s,text:i}}}list(e){let r=this.rules.block.list.exec(e);if(r){let o=r[1].trim(),n=o.length>1,i={type:"list",raw:"",ordered:n,start:n?+o.slice(0,-1):"",loose:!1,items:[]};o=n?`\\d{1,9}\\${o.slice(-1)}`:`\\${o}`,this.options.pedantic&&(o=n?o:"[*+-]");let s=new RegExp(`^( {0,3}${o})((?:[	 ][^\\n]*)?(?:\\n|$))`),l=!1;for(;e;){let c=!1,p="",d="";if(!(r=s.exec(e))||this.rules.block.hr.test(e))break;p=r[0],e=e.substring(p.length);let h=r[2].split(`
`,1)[0].replace(/^\t+/,Q=>" ".repeat(3*Q.length)),x=e.split(`
`,1)[0],B=!h.trim(),v=0;if(this.options.pedantic?(v=2,d=h.trimStart()):B?v=r[1].length+1:(v=r[2].search(/[^ ]/),v=v>4?1:v,d=h.slice(v),v+=r[1].length),B&&/^ *$/.test(x)&&(p+=x+`
`,e=e.substring(x.length+1),c=!0),!c){let Q=new RegExp(`^ {0,${Math.min(3,v-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),H=new RegExp(`^ {0,${Math.min(3,v-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),j=new RegExp(`^ {0,${Math.min(3,v-1)}}(?:\`\`\`|~~~)`),we=new RegExp(`^ {0,${Math.min(3,v-1)}}#`);for(;e;){let U=e.split(`
`,1)[0];if(x=U,this.options.pedantic&&(x=x.replace(/^ {1,4}(?=( {4})*[^ ])/g,"  ")),j.test(x)||we.test(x)||Q.test(x)||H.test(e))break;if(x.search(/[^ ]/)>=v||!x.trim())d+=`
`+x.slice(v);else{if(B||h.search(/[^ ]/)>=4||j.test(h)||we.test(h)||H.test(h))break;d+=`
`+x}!B&&!x.trim()&&(B=!0),p+=U+`
`,e=e.substring(U.length+1),h=x.slice(v)}}i.loose||(l?i.loose=!0:/\n *\n *$/.test(p)&&(l=!0));let A=null,q;this.options.gfm&&(A=/^\[[ xX]\] /.exec(d),A&&(q=A[0]!=="[ ] ",d=d.replace(/^\[[ xX]\] +/,""))),i.items.push({type:"list_item",raw:p,task:!!A,checked:q,loose:!1,text:d,tokens:[]}),i.raw+=p}i.items[i.items.length-1].raw=i.items[i.items.length-1].raw.trimEnd(),i.items[i.items.length-1].text=i.items[i.items.length-1].text.trimEnd(),i.raw=i.raw.trimEnd();for(let c=0;c<i.items.length;c++)if(this.lexer.state.top=!1,i.items[c].tokens=this.lexer.blockTokens(i.items[c].text,[]),!i.loose){let p=i.items[c].tokens.filter(h=>h.type==="space"),d=p.length>0&&p.some(h=>/\n.*\n/.test(h.raw));i.loose=d}if(i.loose)for(let c=0;c<i.items.length;c++)i.items[c].loose=!0;return i}}html(e){let r=this.rules.block.html.exec(e);if(r)return{type:"html",block:!0,raw:r[0],pre:r[1]==="pre"||r[1]==="script"||r[1]==="style",text:r[0]}}def(e){let r=this.rules.block.def.exec(e);if(r){let o=r[1].toLowerCase().replace(/\s+/g," "),n=r[2]?r[2].replace(/^<(.*)>$/,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",i=r[3]?r[3].substring(1,r[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):r[3];return{type:"def",tag:o,raw:r[0],href:n,title:i}}}table(e){let r=this.rules.block.table.exec(e);if(!r||!/[:|]/.test(r[2]))return;let o=Dy(r[1]),n=r[2].replace(/^\||\| *$/g,"").split("|"),i=r[3]&&r[3].trim()?r[3].replace(/\n[ \t]*$/,"").split(`
`):[],s={type:"table",raw:r[0],header:[],align:[],rows:[]};if(o.length===n.length){for(let l of n)/^ *-+: *$/.test(l)?s.align.push("right"):/^ *:-+: *$/.test(l)?s.align.push("center"):/^ *:-+ *$/.test(l)?s.align.push("left"):s.align.push(null);for(let l=0;l<o.length;l++)s.header.push({text:o[l],tokens:this.lexer.inline(o[l]),header:!0,align:s.align[l]});for(let l of i)s.rows.push(Dy(l,s.header.length).map((c,p)=>({text:c,tokens:this.lexer.inline(c),header:!1,align:s.align[p]})));return s}}lheading(e){let r=this.rules.block.lheading.exec(e);if(r)return{type:"heading",raw:r[0],depth:r[2].charAt(0)==="="?1:2,text:r[1],tokens:this.lexer.inline(r[1])}}paragraph(e){let r=this.rules.block.paragraph.exec(e);if(r){let o=r[1].charAt(r[1].length-1)===`
`?r[1].slice(0,-1):r[1];return{type:"paragraph",raw:r[0],text:o,tokens:this.lexer.inline(o)}}}text(e){let r=this.rules.block.text.exec(e);if(r)return{type:"text",raw:r[0],text:r[0],tokens:this.lexer.inline(r[0])}}escape(e){let r=this.rules.inline.escape.exec(e);if(r)return{type:"escape",raw:r[0],text:Ye(r[1])}}tag(e){let r=this.rules.inline.tag.exec(e);if(r)return!this.lexer.state.inLink&&/^<a /i.test(r[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&/^<\/a>/i.test(r[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&/^<(pre|code|kbd|script)(\s|>)/i.test(r[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&/^<\/(pre|code|kbd|script)(\s|>)/i.test(r[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:r[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:r[0]}}link(e){let r=this.rules.inline.link.exec(e);if(r){let o=r[2].trim();if(!this.options.pedantic&&/^</.test(o)){if(!/>$/.test(o))return;let s=ei(o.slice(0,-1),"\\");if((o.length-s.length)%2===0)return}else{let s=PA(r[2],"()");if(s>-1){let c=(r[0].indexOf("!")===0?5:4)+r[1].length+s;r[2]=r[2].substring(0,s),r[0]=r[0].substring(0,c).trim(),r[3]=""}}let n=r[2],i="";if(this.options.pedantic){let s=/^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(n);s&&(n=s[1],i=s[3])}else i=r[3]?r[3].slice(1,-1):"";return n=n.trim(),/^</.test(n)&&(this.options.pedantic&&!/>$/.test(o)?n=n.slice(1):n=n.slice(1,-1)),Py(r,{href:n&&n.replace(this.rules.inline.anyPunctuation,"$1"),title:i&&i.replace(this.rules.inline.anyPunctuation,"$1")},r[0],this.lexer)}}reflink(e,r){let o;if((o=this.rules.inline.reflink.exec(e))||(o=this.rules.inline.nolink.exec(e))){let n=(o[2]||o[1]).replace(/\s+/g," "),i=r[n.toLowerCase()];if(!i){let s=o[0].charAt(0);return{type:"text",raw:s,text:s}}return Py(o,i,o[0],this.lexer)}}emStrong(e,r,o=""){let n=this.rules.inline.emStrongLDelim.exec(e);if(!n||n[3]&&o.match(/[\p{L}\p{N}]/u))return;if(!(n[1]||n[2]||"")||!o||this.rules.inline.punctuation.exec(o)){let s=[...n[0]].length-1,l,c,p=s,d=0,h=n[0][0]==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(h.lastIndex=0,r=r.slice(-1*e.length+s);(n=h.exec(r))!=null;){if(l=n[1]||n[2]||n[3]||n[4]||n[5]||n[6],!l)continue;if(c=[...l].length,n[3]||n[4]){p+=c;continue}else if((n[5]||n[6])&&s%3&&!((s+c)%3)){d+=c;continue}if(p-=c,p>0)continue;c=Math.min(c,c+p+d);let x=[...n[0]][0].length,B=e.slice(0,s+n.index+x+c);if(Math.min(s,c)%2){let A=B.slice(1,-1);return{type:"em",raw:B,text:A,tokens:this.lexer.inlineTokens(A)}}let v=B.slice(2,-2);return{type:"strong",raw:B,text:v,tokens:this.lexer.inlineTokens(v)}}}}codespan(e){let r=this.rules.inline.code.exec(e);if(r){let o=r[2].replace(/\n/g," "),n=/[^ ]/.test(o),i=/^ /.test(o)&&/ $/.test(o);return n&&i&&(o=o.substring(1,o.length-1)),o=Ye(o,!0),{type:"codespan",raw:r[0],text:o}}}br(e){let r=this.rules.inline.br.exec(e);if(r)return{type:"br",raw:r[0]}}del(e){let r=this.rules.inline.del.exec(e);if(r)return{type:"del",raw:r[0],text:r[2],tokens:this.lexer.inlineTokens(r[2])}}autolink(e){let r=this.rules.inline.autolink.exec(e);if(r){let o,n;return r[2]==="@"?(o=Ye(r[1]),n="mailto:"+o):(o=Ye(r[1]),n=o),{type:"link",raw:r[0],text:o,href:n,tokens:[{type:"text",raw:o,text:o}]}}}url(e){let r;if(r=this.rules.inline.url.exec(e)){let o,n;if(r[2]==="@")o=Ye(r[0]),n="mailto:"+o;else{let i;do i=r[0],r[0]=this.rules.inline._backpedal.exec(r[0])?.[0]??"";while(i!==r[0]);o=Ye(r[0]),r[1]==="www."?n="http://"+r[0]:n=r[0]}return{type:"link",raw:r[0],text:o,href:n,tokens:[{type:"text",raw:o,text:o}]}}}inlineText(e){let r=this.rules.inline.text.exec(e);if(r){let o;return this.lexer.state.inRawBlock?o=r[0]:o=Ye(r[0]),{type:"text",raw:r[0],text:o}}}},MA=/^(?: *(?:\n|$))+/,NA=/^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,RA=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,ni=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,$A=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,$y=/(?:[*+-]|\d{1,9}[.)])/,Hy=oe(/^(?!bull |blockCode|fences|blockquote|heading|html)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html))+?)\n {0,3}(=+|-+) *(?:\n+|$)/).replace(/bull/g,$y).replace(/blockCode/g,/ {4}/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).getRegex(),Du=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,HA=/^[^\n]+/,Pu=/(?!\s*\])(?:\\.|[^\[\]\\])+/,zA=oe(/^ {0,3}\[(label)\]: *(?:\n *)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n *)?| *\n *)(title))? *(?:\n+|$)/).replace("label",Pu).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),qA=oe(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,$y).getRegex(),fa="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",Lu=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,VA=oe("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$))","i").replace("comment",Lu).replace("tag",fa).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),zy=oe(Du).replace("hr",ni).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",fa).getRegex(),GA=oe(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",zy).getRegex(),Mu={blockquote:GA,code:NA,def:zA,fences:RA,heading:$A,hr:ni,html:VA,lheading:Hy,list:qA,newline:MA,paragraph:zy,table:ri,text:HA},Ly=oe("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",ni).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code"," {4}[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",fa).getRegex(),UA={...Mu,table:Ly,paragraph:oe(Du).replace("hr",ni).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",Ly).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",fa).getRegex()},WA={...Mu,html:oe(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",Lu).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:ri,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:oe(Du).replace("hr",ni).replace("heading",` *#{1,6} *[^
]`).replace("lheading",Hy).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},qy=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,jA=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,Vy=/^( {2,}|\\)\n(?!\s*$)/,KA=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,ii="\\p{P}\\p{S}",YA=oe(/^((?![*_])[\spunctuation])/,"u").replace(/punctuation/g,ii).getRegex(),ZA=/\[[^[\]]*?\]\([^\(\)]*?\)|`[^`]*?`|<[^<>]*?>/g,XA=oe(/^(?:\*+(?:((?!\*)[punct])|[^\s*]))|^_+(?:((?!_)[punct])|([^\s_]))/,"u").replace(/punct/g,ii).getRegex(),JA=oe("^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)[punct](\\*+)(?=[\\s]|$)|[^punct\\s](\\*+)(?!\\*)(?=[punct\\s]|$)|(?!\\*)[punct\\s](\\*+)(?=[^punct\\s])|[\\s](\\*+)(?!\\*)(?=[punct])|(?!\\*)[punct](\\*+)(?!\\*)(?=[punct])|[^punct\\s](\\*+)(?=[^punct\\s])","gu").replace(/punct/g,ii).getRegex(),QA=oe("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)[punct](_+)(?=[\\s]|$)|[^punct\\s](_+)(?!_)(?=[punct\\s]|$)|(?!_)[punct\\s](_+)(?=[^punct\\s])|[\\s](_+)(?!_)(?=[punct])|(?!_)[punct](_+)(?!_)(?=[punct])","gu").replace(/punct/g,ii).getRegex(),eO=oe(/\\([punct])/,"gu").replace(/punct/g,ii).getRegex(),tO=oe(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),rO=oe(Lu).replace("(?:-->|$)","-->").getRegex(),oO=oe("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",rO).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),da=/(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/,nO=oe(/^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/).replace("label",da).replace("href",/<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),Gy=oe(/^!?\[(label)\]\[(ref)\]/).replace("label",da).replace("ref",Pu).getRegex(),Uy=oe(/^!?\[(ref)\](?:\[\])?/).replace("ref",Pu).getRegex(),iO=oe("reflink|nolink(?!\\()","g").replace("reflink",Gy).replace("nolink",Uy).getRegex(),Nu={_backpedal:ri,anyPunctuation:eO,autolink:tO,blockSkip:ZA,br:Vy,code:jA,del:ri,emStrongLDelim:XA,emStrongRDelimAst:JA,emStrongRDelimUnd:QA,escape:qy,link:nO,nolink:Uy,punctuation:YA,reflink:Gy,reflinkSearch:iO,tag:oO,text:KA,url:ri},sO={...Nu,link:oe(/^!?\[(label)\]\((.*?)\)/).replace("label",da).getRegex(),reflink:oe(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",da).getRegex()},Cu={...Nu,escape:oe(qy).replace("])","~|])").getRegex(),url:oe(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,"i").replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,text:/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/},aO={...Cu,br:oe(Vy).replace("{2,}","*").getRegex(),text:oe(Cu.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},pa={normal:Mu,gfm:UA,pedantic:WA},ti={normal:Nu,gfm:Cu,breaks:aO,pedantic:sO},Vt=class t{constructor(e){S(this,"tokens");S(this,"options");S(this,"state");S(this,"tokenizer");S(this,"inlineQueue");this.tokens=[],this.tokens.links=Object.create(null),this.options=e||Nr,this.options.tokenizer=this.options.tokenizer||new Oo,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};let r={block:pa.normal,inline:ti.normal};this.options.pedantic?(r.block=pa.pedantic,r.inline=ti.pedantic):this.options.gfm&&(r.block=pa.gfm,this.options.breaks?r.inline=ti.breaks:r.inline=ti.gfm),this.tokenizer.rules=r}static get rules(){return{block:pa,inline:ti}}static lex(e,r){return new t(r).lex(e)}static lexInline(e,r){return new t(r).inlineTokens(e)}lex(e){e=e.replace(/\r\n|\r/g,`
`),this.blockTokens(e,this.tokens);for(let r=0;r<this.inlineQueue.length;r++){let o=this.inlineQueue[r];this.inlineTokens(o.src,o.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,r=[],o=!1){this.options.pedantic?e=e.replace(/\t/g,"    ").replace(/^ +$/gm,""):e=e.replace(/^( *)(\t+)/gm,(l,c,p)=>c+"    ".repeat(p.length));let n,i,s;for(;e;)if(!(this.options.extensions&&this.options.extensions.block&&this.options.extensions.block.some(l=>(n=l.call({lexer:this},e,r))?(e=e.substring(n.raw.length),r.push(n),!0):!1))){if(n=this.tokenizer.space(e)){e=e.substring(n.raw.length),n.raw.length===1&&r.length>0?r[r.length-1].raw+=`
`:r.push(n);continue}if(n=this.tokenizer.code(e)){e=e.substring(n.raw.length),i=r[r.length-1],i&&(i.type==="paragraph"||i.type==="text")?(i.raw+=`
`+n.raw,i.text+=`
`+n.text,this.inlineQueue[this.inlineQueue.length-1].src=i.text):r.push(n);continue}if(n=this.tokenizer.fences(e)){e=e.substring(n.raw.length),r.push(n);continue}if(n=this.tokenizer.heading(e)){e=e.substring(n.raw.length),r.push(n);continue}if(n=this.tokenizer.hr(e)){e=e.substring(n.raw.length),r.push(n);continue}if(n=this.tokenizer.blockquote(e)){e=e.substring(n.raw.length),r.push(n);continue}if(n=this.tokenizer.list(e)){e=e.substring(n.raw.length),r.push(n);continue}if(n=this.tokenizer.html(e)){e=e.substring(n.raw.length),r.push(n);continue}if(n=this.tokenizer.def(e)){e=e.substring(n.raw.length),i=r[r.length-1],i&&(i.type==="paragraph"||i.type==="text")?(i.raw+=`
`+n.raw,i.text+=`
`+n.raw,this.inlineQueue[this.inlineQueue.length-1].src=i.text):this.tokens.links[n.tag]||(this.tokens.links[n.tag]={href:n.href,title:n.title});continue}if(n=this.tokenizer.table(e)){e=e.substring(n.raw.length),r.push(n);continue}if(n=this.tokenizer.lheading(e)){e=e.substring(n.raw.length),r.push(n);continue}if(s=e,this.options.extensions&&this.options.extensions.startBlock){let l=1/0,c=e.slice(1),p;this.options.extensions.startBlock.forEach(d=>{p=d.call({lexer:this},c),typeof p=="number"&&p>=0&&(l=Math.min(l,p))}),l<1/0&&l>=0&&(s=e.substring(0,l+1))}if(this.state.top&&(n=this.tokenizer.paragraph(s))){i=r[r.length-1],o&&i?.type==="paragraph"?(i.raw+=`
`+n.raw,i.text+=`
`+n.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=i.text):r.push(n),o=s.length!==e.length,e=e.substring(n.raw.length);continue}if(n=this.tokenizer.text(e)){e=e.substring(n.raw.length),i=r[r.length-1],i&&i.type==="text"?(i.raw+=`
`+n.raw,i.text+=`
`+n.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=i.text):r.push(n);continue}if(e){let l="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(l);break}else throw new Error(l)}}return this.state.top=!0,r}inline(e,r=[]){return this.inlineQueue.push({src:e,tokens:r}),r}inlineTokens(e,r=[]){let o,n,i,s=e,l,c,p;if(this.tokens.links){let d=Object.keys(this.tokens.links);if(d.length>0)for(;(l=this.tokenizer.rules.inline.reflinkSearch.exec(s))!=null;)d.includes(l[0].slice(l[0].lastIndexOf("[")+1,-1))&&(s=s.slice(0,l.index)+"["+"a".repeat(l[0].length-2)+"]"+s.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(l=this.tokenizer.rules.inline.blockSkip.exec(s))!=null;)s=s.slice(0,l.index)+"["+"a".repeat(l[0].length-2)+"]"+s.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);for(;(l=this.tokenizer.rules.inline.anyPunctuation.exec(s))!=null;)s=s.slice(0,l.index)+"++"+s.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);for(;e;)if(c||(p=""),c=!1,!(this.options.extensions&&this.options.extensions.inline&&this.options.extensions.inline.some(d=>(o=d.call({lexer:this},e,r))?(e=e.substring(o.raw.length),r.push(o),!0):!1))){if(o=this.tokenizer.escape(e)){e=e.substring(o.raw.length),r.push(o);continue}if(o=this.tokenizer.tag(e)){e=e.substring(o.raw.length),n=r[r.length-1],n&&o.type==="text"&&n.type==="text"?(n.raw+=o.raw,n.text+=o.text):r.push(o);continue}if(o=this.tokenizer.link(e)){e=e.substring(o.raw.length),r.push(o);continue}if(o=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(o.raw.length),n=r[r.length-1],n&&o.type==="text"&&n.type==="text"?(n.raw+=o.raw,n.text+=o.text):r.push(o);continue}if(o=this.tokenizer.emStrong(e,s,p)){e=e.substring(o.raw.length),r.push(o);continue}if(o=this.tokenizer.codespan(e)){e=e.substring(o.raw.length),r.push(o);continue}if(o=this.tokenizer.br(e)){e=e.substring(o.raw.length),r.push(o);continue}if(o=this.tokenizer.del(e)){e=e.substring(o.raw.length),r.push(o);continue}if(o=this.tokenizer.autolink(e)){e=e.substring(o.raw.length),r.push(o);continue}if(!this.state.inLink&&(o=this.tokenizer.url(e))){e=e.substring(o.raw.length),r.push(o);continue}if(i=e,this.options.extensions&&this.options.extensions.startInline){let d=1/0,h=e.slice(1),x;this.options.extensions.startInline.forEach(B=>{x=B.call({lexer:this},h),typeof x=="number"&&x>=0&&(d=Math.min(d,x))}),d<1/0&&d>=0&&(i=e.substring(0,d+1))}if(o=this.tokenizer.inlineText(i)){e=e.substring(o.raw.length),o.raw.slice(-1)!=="_"&&(p=o.raw.slice(-1)),c=!0,n=r[r.length-1],n&&n.type==="text"?(n.raw+=o.raw,n.text+=o.text):r.push(o);continue}if(e){let d="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(d);break}else throw new Error(d)}}return r}},Do=class{constructor(e){S(this,"options");S(this,"parser");this.options=e||Nr}space(e){return""}code({text:e,lang:r,escaped:o}){let n=(r||"").match(/^\S*/)?.[0],i=e.replace(/\n$/,"")+`
`;return n?'<pre><code class="language-'+Ye(n)+'">'+(o?i:Ye(i,!0))+`</code></pre>
`:"<pre><code>"+(o?i:Ye(i,!0))+`</code></pre>
`}blockquote({tokens:e}){return`<blockquote>
${this.parser.parse(e)}</blockquote>
`}html({text:e}){return e}heading({tokens:e,depth:r}){return`<h${r}>${this.parser.parseInline(e)}</h${r}>
`}hr(e){return`<hr>
`}list(e){let r=e.ordered,o=e.start,n="";for(let l=0;l<e.items.length;l++){let c=e.items[l];n+=this.listitem(c)}let i=r?"ol":"ul",s=r&&o!==1?' start="'+o+'"':"";return"<"+i+s+`>
`+n+"</"+i+`>
`}listitem(e){let r="";if(e.task){let o=this.checkbox({checked:!!e.checked});e.loose?e.tokens.length>0&&e.tokens[0].type==="paragraph"?(e.tokens[0].text=o+" "+e.tokens[0].text,e.tokens[0].tokens&&e.tokens[0].tokens.length>0&&e.tokens[0].tokens[0].type==="text"&&(e.tokens[0].tokens[0].text=o+" "+e.tokens[0].tokens[0].text)):e.tokens.unshift({type:"text",raw:o+" ",text:o+" "}):r+=o+" "}return r+=this.parser.parse(e.tokens,!!e.loose),`<li>${r}</li>
`}checkbox({checked:e}){return"<input "+(e?'checked="" ':"")+'disabled="" type="checkbox">'}paragraph({tokens:e}){return`<p>${this.parser.parseInline(e)}</p>
`}table(e){let r="",o="";for(let i=0;i<e.header.length;i++)o+=this.tablecell(e.header[i]);r+=this.tablerow({text:o});let n="";for(let i=0;i<e.rows.length;i++){let s=e.rows[i];o="";for(let l=0;l<s.length;l++)o+=this.tablecell(s[l]);n+=this.tablerow({text:o})}return n&&(n=`<tbody>${n}</tbody>`),`<table>
<thead>
`+r+`</thead>
`+n+`</table>
`}tablerow({text:e}){return`<tr>
${e}</tr>
`}tablecell(e){let r=this.parser.parseInline(e.tokens),o=e.header?"th":"td";return(e.align?`<${o} align="${e.align}">`:`<${o}>`)+r+`</${o}>
`}strong({tokens:e}){return`<strong>${this.parser.parseInline(e)}</strong>`}em({tokens:e}){return`<em>${this.parser.parseInline(e)}</em>`}codespan({text:e}){return`<code>${e}</code>`}br(e){return"<br>"}del({tokens:e}){return`<del>${this.parser.parseInline(e)}</del>`}link({href:e,title:r,tokens:o}){let n=this.parser.parseInline(o),i=Oy(e);if(i===null)return n;e=i;let s='<a href="'+e+'"';return r&&(s+=' title="'+r+'"'),s+=">"+n+"</a>",s}image({href:e,title:r,text:o}){let n=Oy(e);if(n===null)return o;e=n;let i=`<img src="${e}" alt="${o}"`;return r&&(i+=` title="${r}"`),i+=">",i}text(e){return"tokens"in e&&e.tokens?this.parser.parseInline(e.tokens):e.text}},oi=class{strong({text:e}){return e}em({text:e}){return e}codespan({text:e}){return e}del({text:e}){return e}html({text:e}){return e}text({text:e}){return e}link({text:e}){return""+e}image({text:e}){return""+e}br(){return""}},Gt=class t{constructor(e){S(this,"options");S(this,"renderer");S(this,"textRenderer");this.options=e||Nr,this.options.renderer=this.options.renderer||new Do,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new oi}static parse(e,r){return new t(r).parse(e)}static parseInline(e,r){return new t(r).parseInline(e)}parse(e,r=!0){let o="";for(let n=0;n<e.length;n++){let i=e[n];if(this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[i.type]){let l=i,c=this.options.extensions.renderers[l.type].call({parser:this},l);if(c!==!1||!["space","hr","heading","code","table","blockquote","list","html","paragraph","text"].includes(l.type)){o+=c||"";continue}}let s=i;switch(s.type){case"space":{o+=this.renderer.space(s);continue}case"hr":{o+=this.renderer.hr(s);continue}case"heading":{o+=this.renderer.heading(s);continue}case"code":{o+=this.renderer.code(s);continue}case"table":{o+=this.renderer.table(s);continue}case"blockquote":{o+=this.renderer.blockquote(s);continue}case"list":{o+=this.renderer.list(s);continue}case"html":{o+=this.renderer.html(s);continue}case"paragraph":{o+=this.renderer.paragraph(s);continue}case"text":{let l=s,c=this.renderer.text(l);for(;n+1<e.length&&e[n+1].type==="text";)l=e[++n],c+=`
`+this.renderer.text(l);r?o+=this.renderer.paragraph({type:"paragraph",raw:c,text:c,tokens:[{type:"text",raw:c,text:c}]}):o+=c;continue}default:{let l='Token with "'+s.type+'" type was not found.';if(this.options.silent)return console.error(l),"";throw new Error(l)}}}return o}parseInline(e,r){r=r||this.renderer;let o="";for(let n=0;n<e.length;n++){let i=e[n];if(this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[i.type]){let l=this.options.extensions.renderers[i.type].call({parser:this},i);if(l!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(i.type)){o+=l||"";continue}}let s=i;switch(s.type){case"escape":{o+=r.text(s);break}case"html":{o+=r.html(s);break}case"link":{o+=r.link(s);break}case"image":{o+=r.image(s);break}case"strong":{o+=r.strong(s);break}case"em":{o+=r.em(s);break}case"codespan":{o+=r.codespan(s);break}case"br":{o+=r.br(s);break}case"del":{o+=r.del(s);break}case"text":{o+=r.text(s);break}default:{let l='Token with "'+s.type+'" type was not found.';if(this.options.silent)return console.error(l),"";throw new Error(l)}}}return o}},Lr=class{constructor(e){S(this,"options");this.options=e||Nr}preprocess(e){return e}postprocess(e){return e}processAllTokens(e){return e}};S(Lr,"passThroughHooks",new Set(["preprocess","postprocess","processAllTokens"]));var Au=class{constructor(...e){S(this,"defaults",Ou());S(this,"options",this.setOptions);S(this,"parse",this.parseMarkdown(Vt.lex,Gt.parse));S(this,"parseInline",this.parseMarkdown(Vt.lexInline,Gt.parseInline));S(this,"Parser",Gt);S(this,"Renderer",Do);S(this,"TextRenderer",oi);S(this,"Lexer",Vt);S(this,"Tokenizer",Oo);S(this,"Hooks",Lr);this.use(...e)}walkTokens(e,r){let o=[];for(let n of e)switch(o=o.concat(r.call(this,n)),n.type){case"table":{let i=n;for(let s of i.header)o=o.concat(this.walkTokens(s.tokens,r));for(let s of i.rows)for(let l of s)o=o.concat(this.walkTokens(l.tokens,r));break}case"list":{let i=n;o=o.concat(this.walkTokens(i.items,r));break}default:{let i=n;this.defaults.extensions?.childTokens?.[i.type]?this.defaults.extensions.childTokens[i.type].forEach(s=>{let l=i[s].flat(1/0);o=o.concat(this.walkTokens(l,r))}):i.tokens&&(o=o.concat(this.walkTokens(i.tokens,r)))}}return o}use(...e){let r=this.defaults.extensions||{renderers:{},childTokens:{}};return e.forEach(o=>{let n={...o};if(n.async=this.defaults.async||n.async||!1,o.extensions&&(o.extensions.forEach(i=>{if(!i.name)throw new Error("extension name required");if("renderer"in i){let s=r.renderers[i.name];s?r.renderers[i.name]=function(...l){let c=i.renderer.apply(this,l);return c===!1&&(c=s.apply(this,l)),c}:r.renderers[i.name]=i.renderer}if("tokenizer"in i){if(!i.level||i.level!=="block"&&i.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");let s=r[i.level];s?s.unshift(i.tokenizer):r[i.level]=[i.tokenizer],i.start&&(i.level==="block"?r.startBlock?r.startBlock.push(i.start):r.startBlock=[i.start]:i.level==="inline"&&(r.startInline?r.startInline.push(i.start):r.startInline=[i.start]))}"childTokens"in i&&i.childTokens&&(r.childTokens[i.name]=i.childTokens)}),n.extensions=r),o.renderer){let i=this.defaults.renderer||new Do(this.defaults);for(let s in o.renderer){if(!(s in i))throw new Error(`renderer '${s}' does not exist`);if(["options","parser"].includes(s))continue;let l=s,c=o.renderer[l],p=i[l];i[l]=(...d)=>{let h=c.apply(i,d);return h===!1&&(h=p.apply(i,d)),h||""}}n.renderer=i}if(o.tokenizer){let i=this.defaults.tokenizer||new Oo(this.defaults);for(let s in o.tokenizer){if(!(s in i))throw new Error(`tokenizer '${s}' does not exist`);if(["options","rules","lexer"].includes(s))continue;let l=s,c=o.tokenizer[l],p=i[l];i[l]=(...d)=>{let h=c.apply(i,d);return h===!1&&(h=p.apply(i,d)),h}}n.tokenizer=i}if(o.hooks){let i=this.defaults.hooks||new Lr;for(let s in o.hooks){if(!(s in i))throw new Error(`hook '${s}' does not exist`);if(s==="options")continue;let l=s,c=o.hooks[l],p=i[l];Lr.passThroughHooks.has(s)?i[l]=d=>{if(this.defaults.async)return Promise.resolve(c.call(i,d)).then(x=>p.call(i,x));let h=c.call(i,d);return p.call(i,h)}:i[l]=(...d)=>{let h=c.apply(i,d);return h===!1&&(h=p.apply(i,d)),h}}n.hooks=i}if(o.walkTokens){let i=this.defaults.walkTokens,s=o.walkTokens;n.walkTokens=function(l){let c=[];return c.push(s.call(this,l)),i&&(c=c.concat(i.call(this,l))),c}}this.defaults={...this.defaults,...n}}),this}setOptions(e){return this.defaults={...this.defaults,...e},this}lexer(e,r){return Vt.lex(e,r??this.defaults)}parser(e,r){return Gt.parse(e,r??this.defaults)}parseMarkdown(e,r){return(n,i)=>{let s={...i},l={...this.defaults,...s},c=this.onError(!!l.silent,!!l.async);if(this.defaults.async===!0&&s.async===!1)return c(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));if(typeof n>"u"||n===null)return c(new Error("marked(): input parameter is undefined or null"));if(typeof n!="string")return c(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(n)+", string expected"));if(l.hooks&&(l.hooks.options=l),l.async)return Promise.resolve(l.hooks?l.hooks.preprocess(n):n).then(p=>e(p,l)).then(p=>l.hooks?l.hooks.processAllTokens(p):p).then(p=>l.walkTokens?Promise.all(this.walkTokens(p,l.walkTokens)).then(()=>p):p).then(p=>r(p,l)).then(p=>l.hooks?l.hooks.postprocess(p):p).catch(c);try{l.hooks&&(n=l.hooks.preprocess(n));let p=e(n,l);l.hooks&&(p=l.hooks.processAllTokens(p)),l.walkTokens&&this.walkTokens(p,l.walkTokens);let d=r(p,l);return l.hooks&&(d=l.hooks.postprocess(d)),d}catch(p){return c(p)}}}onError(e,r){return o=>{if(o.message+=`
Please report this to https://github.com/markedjs/marked.`,e){let n="<p>An error occurred:</p><pre>"+Ye(o.message+"",!0)+"</pre>";return r?Promise.resolve(n):n}if(r)return Promise.reject(o);throw o}}},Mr=new Au;function J(t,e){return Mr.parse(t,e)}J.options=J.setOptions=function(t){return Mr.setOptions(t),J.defaults=Mr.defaults,My(J.defaults),J};J.getDefaults=Ou;J.defaults=Nr;J.use=function(...t){return Mr.use(...t),J.defaults=Mr.defaults,My(J.defaults),J};J.walkTokens=function(t,e){return Mr.walkTokens(t,e)};J.parseInline=Mr.parseInline;J.Parser=Gt;J.parser=Gt.parse;J.Renderer=Do;J.TextRenderer=oi;J.Lexer=Vt;J.lexer=Vt.lex;J.Tokenizer=Oo;J.Hooks=Lr;J.parse=J;var j$=J.options,K$=J.setOptions,Y$=J.use,Z$=J.walkTokens,X$=J.parseInline;var J$=Gt.parse,Q$=Vt.lex;var Wy=m("div.flexauto.flexvbox",`
  color: ${g.text};
  display: flex;
  flex-direction: column;
  flex-basis: 0px;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: auto;
  min-height: 100%;
  width: 100%;
`),jy=m("div",`
  background-color: ${g.mainPanelBg};
  color: ${g.text};
  width: 600px;
  align-self: center;
  margin: 0px auto;
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  max-width: calc(100% - 32px);
  gap: 8px;
  line-height: 1.42857143;
  &-border {
    border: 2px solid ${V.lightGreen};
    border-radius: 12px;
    padding: 18px;
    width: calc(600px + 32px);
  }
`),mt=m("div.hover_border.field_editor",`
  position: relative;
  cursor: pointer;
  user-select: none;
  outline: none;
  padding: 8px;
  border-radius: 3px;
  margin-bottom: 4px;
  --hover-visible: hidden;
  transition: transform 0.2s ease-in-out;
  &-Section {
    outline: 1px solid ${g.modalBorderDark};
    margin-bottom: 24px;
    padding: 16px;
  }
  &:hover:not(:has(.hover_border:hover),&-cut) {
    --hover-visible: visible;
    outline: 1px solid ${g.controlPrimaryBg};
  }
  &-selected:not(&-cut) {
    background: ${g.lightHover};
    outline: 1px solid ${g.controlPrimaryBg};
    --selected-block: block;
  }
  &:active:not(:has(&:active)) {
    outline: 1px solid ${g.controlPrimaryHoverBg};
  }
  &-drag-hover {
    outline: 2px dashed ${g.controlPrimaryBg};
    outline-offset: 2px;
  }
  &-cut {
    outline: 2px dashed ${V.orange};
    outline-offset: 2px;
  }
  &-FormDescription {
    margin-bottom: 10px;
  }
  &-drag-above {
    transform: translateY(2px);
  }
  &-drag-below {
    transform: translateY(-2px);
  }
`),Ky=m("div",`
  position: relative;
  color: ${g.text};
  margin: 0px auto;
  min-height: 50px;
`),gH=m("div",`
  display: flex;
  flex-direction: column;
  gap: 8px;

  &-horizontal {
    flex-direction: row;
    flex-wrap: wrap;
    column-gap: 16px;
  }
`),hH=m(Dr,`
  font-size: 13px;
  line-height: 16px;
  font-weight: normal;
  user-select: none;
  display: flex;
  gap: 8px;
  margin: 0px;
  overflow-wrap: anywhere;
`);var bH=m("div",`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`),xH=m("div",`
  margin: 8px 0px;
  min-height: 16px;
  overflow-wrap: break-word;

  &-required {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 4px;
  }
  &-required:after {
    content: "*";
    color: ${V.lightGreen};
    font-size: 11px;
    font-weight: 700;
  }
`),yH=m("div",`
  font-weight: normal;
  padding: 0px;
  border: 0px;
  width: 100%;
  margin: 0px;
  background: transparent;
  cursor: pointer;
  min-height: 16px;

  color: ${g.mediumText};
  font-size: 13px;
  line-height: 16px;
  font-weight: 700;
  white-space: pre-wrap;
  &-placeholder {
    font-style: italic
  }
`),vH=m(oa,`
  font-weight: normal;
  outline: none;
  display: block;
  padding: 0px;
  border: 0px;
  width: 100%;
  margin: 0px;
  background: transparent;
  cursor: pointer;
  min-height: 1.5rem;

  color: ${g.mediumText};
  font-size: 12px;
  font-weight: 700;

  &::placeholder {
    font-style: italic
  }
  &-edit {
    cursor: auto;
    background: ${g.inputBg};
    outline: 2px solid ${g.accessRulesFormulaEditorFocus};
    outline-offset: 1px;
    border-radius: 2px;
  }
`),wH=m("div",`
  line-height: 16px;
  margin: 0px;
  overflow-wrap: anywhere;
`),TH=m("div",`
  font-size: 12px;
  font-weight: 400;
  margin-top: 4px;
  color: ${g.darkText};
  white-space: pre-wrap;
  font-style: italic;
  font-weight: 400;
  line-height: 1.6;
`),kH=m("input",`
  background-color: ${g.inputBg};
  font-size: inherit;
  height: 29px;
  padding: 4px 8px;
  border: 1px solid ${g.inputBorder};
  border-radius: 3px;
  outline: none;
  pointer-events: none;

  &:disabled {
    color: ${g.inputDisabledFg};
    background-color: ${g.inputDisabledBg};
  }
  &-invalid {
    color: ${g.inputInvalid};
  }
  &[type="number"], &[type="date"], &[type="datetime-local"], &[type="text"] {
    width: 100%;
  }
`),BH=m("textarea",`
  background-color: ${g.inputBg};
  font-size: inherit;
  min-height: 29px;
  padding: 4px 8px;
  border: 1px solid ${g.inputBorder};
  border-radius: 3px;
  outline: none;
  pointer-events: none;
  resize: none;
  width: 100%;

  &:disabled {
    color: ${g.inputDisabledFg};
    background-color: ${g.inputDisabledBg};
  }
`),_H=m(ua,`
  height: 29px;
`),SH=m("select",`
  flex: auto;
  width: 100%;
  background-color: ${g.inputBg};
  font-size: inherit;
  height: 27px;
  padding: 4px 8px;
  border: 1px solid ${g.inputBorder};
  border-radius: 3px;
  outline: none;
  pointer-events: none;
`),EH=m("div",`
  display: grid;
  grid-template-columns: auto 1fr;
  margin-top: 12px;
  gap: 8px;
  --grist-actual-cell-color: ${V.lightGreen};
`),FH=m("div",`
  margin-top: 8px;
  display: flex;
  align-items: center;
  column-gap: 8px;
`),IH=m(re,`
  --icon-color: ${V.warning};
  flex-shrink: 0;
`),Yy=m("div",`
  height: 100%;
`),Zy=m("div._cssSelectedOverlay",`
  inset: 0;
  position: absolute;
  opacity: 0;
  outline: none;
  .${mt.className}-selected > & {
    opacity: 1;
  }
`),si=m("div",`
  position: relative;
  min-height: 32px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
`),ga=m("div",`
  border-radius: 50%;
  width: 24px;
  height: 24px;
  background-color: ${g.addNewCircleSmallBg};
  color: ${g.addNewCircleSmallFg};
  display: flex;
  justify-content: center;
  align-items: center;
  .${si.className}:hover & {
    background: ${g.addNewCircleSmallHoverBg};
  }
`),ha=m(re,`
 --icon-color: ${g.controlPrimaryFg};
`),Xy=m("div",`
  display: grid;
  grid-template-columns: repeat(var(--css-columns-count), 1fr) 32px;
  gap: 8px;
  padding: 8px 4px;
`),Po=m("div",`
  position: relative;
  &-empty, &-add-button {
    position: relative;
    min-height: 32px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-right: 8px;
    --icon-color: ${g.lightText};
    align-self: stretch;
    transition: height 0.2s ease-in-out;
    border: 2px dashed ${g.inputBorder};
    background: ${g.lightHover};
    color: ${g.lightText};
    border-radius: 4px;
    padding: 2px 4px;
    font-size: 12px;
  }

  &-selected {
    border: 2px dashed ${g.lightText};
  }

  &-empty:hover, &-add-button:hover {
    border: 2px dashed ${g.lightText};
  }

  &-drag-over {
    outline: 2px dashed ${g.controlPrimaryBg};
  }
`),CH=m("div",`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 0px 24px 0px 24px;
  gap: 8px;
  /* So that the height is 40px in normal state */
  padding-top: calc((40px - 24px) / 2);
  padding-bottom: calc((40px - 24px) / 2);
`),AH=m(sy,`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 26px;
`),Jy=`
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 26px;

  &-frameless {
    background-color: transparent;
    border: none;
  }
  &-warning {
    color: ${g.controlPrimaryFg};
    background-color: ${g.toastWarningBg};
    border: none;
  }
  &-warning:hover {
    color: ${g.controlPrimaryFg};
    background-color: #B8791B;
    border: none;
  }
`,OH=m(sa,Jy),DH=m(ay,Jy),ai=m("div",`
  min-height: 1.5rem;
  font-size: 15px;
  overflow-wrap: break-word;

  & textarea {
    font-size: 15px;
  }
  &-edit textarea {
    outline: 2px solid ${g.accessRulesFormulaEditorFocus};
  }
  & strong {
    font-weight: 600;
  }
  &-alignment-left {
    text-align: left;
  }
  &-alignment-center {
    text-align: center;
  }
  &-alignment-right {
    text-align: right;
  }
  & hr {
    border-color: ${g.inputBorder};
    margin: 8px 0px;
  }
  &-separator {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  &-separator hr {
    margin: 0px;
  }
`),lO=m("div",`
  clip-path: inset(0px);
`),cO=`
  :host > p:last-child {
    margin-bottom: 0px;
  }
  strong {
    font-weight: 600;
  }
  h1 {
    font-size: 24px;
    margin: 4px 0px;
    font-weight: normal;
  }
  h2 {
    font-size: 22px;
    margin: 4px 0px;
    font-weight: normal;
  }
  h3 {
    font-size: 16px;
    margin: 4px 0px;
    font-weight: normal;
  }
  h4 {
    font-size: 13px;
    margin: 4px 0px;
    font-weight: normal;
  }
  h5 {
    font-size: 11px;
    margin: 4px 0px;
    font-weight: normal;
  }
  h6 {
    font-size: 10px;
    margin: 4px 0px;
    font-weight: normal;
  }
`,ma=null;function Ru(t){return ma||(ma=new CSSStyleSheet,ma.replaceSync(cO)),function(e){let r=e.attachShadow({mode:"open"});r.adoptedStyleSheets=[ma],f.update(r,f.domComputed(t,o=>iy(J(o||"",{async:!1}))))}}function Qy(t,...e){return lO(Ru(t),...e)}var Lo=m("div.test-forms-drag",`
  position: absolute;
  pointer-events: none;
  top: 2px;
  left: 2px;
  width: 1px;
  height: 1px;
`),ba=m("div",`
  position: absolute;
  inset: 0px;
  left: -16px;
  top: 0px;
  height: 100%;
  width: 16px;
`),li=m(re,`
  position: absolute;
  visibility: var(--hover-visible, hidden);
  top: calc(50% - 16px / 2);
  width: 16px;
  height: 16px;
  --icon-color: ${g.controlPrimaryBg};
  &-top {
    top: 16px;
  }
`),PH=m("iframe",`
  height: 100%;
  width: 100%;
  border: 0px;
`),LH=m("div",`
  border-top: 1px solid ${g.menuBorder};
  width: 100%;
`),MH=m("div",`
  display: flex;
  padding: 8px 16px;
`),NH=m("div",`
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 16px;
`),RH=m("div",`
  align-self: flex-start;
  flex-shrink: 0;
  padding: 0px;
  border-radius: 4px;
  cursor: pointer;
  --icon-color: ${g.controlSecondaryFg};

  &:hover {
    background-color: ${g.hover};
  }
`),$H=m("div",`
  margin-bottom: 16px;
`),ev=m("div",`
  width: 100%;
  overflow: auto;
  padding: 20px;
`),tv=m("div",`
  position: relative;
  width: 100%;
`),$u=m("div",`
  position: absolute;
  right: 11px;
  top: 11px;
  border-radius: 3px;
  background: ${g.attachmentsEditorButtonHoverBg};
  display: none;
  height: 16px;
  width: 16px;
  align-items: center;
  justify-content: center;
  line-height: 0px;
  z-index: 3;
  & > div {
    height: 13px;
    width: 13px;
  }
  &:hover {
    background: ${g.controlSecondaryHoverBg};
    cursor: pointer;
  }
  .${mt.className}-selected > &,
  .${mt.className}:hover:not(:has(.hover_border:hover)) > & {
    display: flex;
  }
  &-right {
    right: -20px;
  }
`),HH=m("div",`
  color: ${g.text};
  background-color: ${g.popupBg};
  width: min(calc(100% - 16px), 400px);
  border-radius: 3px;
  padding: 8px;
`),zH=m("div",`
  display: flex;
  justify-content: flex-end;
`),qH=m("div",`
  box-sizing: content-box;
  display: flex;
  flex-direction: column;
  row-gap: 32px;
  padding: 0px 16px 24px 16px;
  min-height: 160px;
`),VH=m("div",`
  flex-shrink: 0;
  border-radius: 4px;
  cursor: pointer;
  padding: 4px;
  --icon-color: ${g.popupCloseButtonFg};

  &:hover {
    background-color: ${g.hover};
  }
`),GH=m("div",`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  margin-bottom: 16px;
`),UH=m("div",`
  color: ${g.lightText};
`),WH=m("div",`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: inherit;
`),jH=m("div",`
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
`),KH=m("div",`
  display: flex;
  background-color: ${g.inputReadonlyBg};
  padding: 8px;
  border-radius: 3px;
  width: 100%;
  margin-top: 16px;
`),YH=m("input",`
  background: transparent;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  border: none;
  outline: none;
`),ZH=m(Jn,`
  margin-left: 4px;
  font-weight: 500;
`),XH=m(Jn,`
  font-weight: 500;
`),JH=m("div",`
  border-radius: 3px;
  background-color: ${g.inputReadonlyBg};
  padding: 8px;
`),QH=m("div",`
  display: flex;
  justify-content: flex-end;
`),ez=m("textarea",`
  background-color: transparent;
  border: none;
  border-radius: 3px;
  word-break: break-all;
  width: 100%;
  outline: none;
  resize: none;
`),tz=m("div",`
  background-color: ${g.widgetBg};
  opacity: 0.8;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
`),rz=m("input",`
  display: flex;
  flex-wrap: wrap;
  white-space: pre-wrap;
  position: relative;
  width: 100%;

  &::file-selector-button, &::-webkit-file-upload-button {
    background-color: ${g.controlPrimaryBg};
    border: 1px solid ${g.controlPrimaryBg};
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
    line-height: inherit;
    outline-color: ${g.controlPrimaryBg};
  }

  &::file-selector-button:hover, &::-webkit-file-upload-button:hover {
    border-color: ${g.controlPrimaryBg};
    background-color: ${g.controlPrimaryBg};
  }

  &::file-selector-button:disabled, &::-webkit-file-upload-button:disabled {
    cursor: not-allowed;
    color: ${V.light};
    background-color: ${V.slate};
    border-color: ${V.slate};
  }
`);function rv(t,e){return[f.onKeyDown({Enter$:r=>{r.shiftKey||(r.stopPropagation(),r.preventDefault(),e(!0),t.set(!1),r.target&&"blur"in r.target&&r.target.blur())},Escape:r=>{e(!1),t.set(!1),r.target&&"blur"in r.target&&r.target.blur()}}),f.create(r=>{function o(){!t.isDisposed()&&t.get()&&(e(!0),t.set(!1))}let n=window.gristApp;n.on("clipboard_focus",o),r.onDispose(()=>n.off("clipboard_focus",o))})]}z();var Fe=[];for(let t=0;t<256;++t)Fe.push((t+256).toString(16).slice(1));function ov(t,e=0){return(Fe[t[e+0]]+Fe[t[e+1]]+Fe[t[e+2]]+Fe[t[e+3]]+"-"+Fe[t[e+4]]+Fe[t[e+5]]+"-"+Fe[t[e+6]]+Fe[t[e+7]]+"-"+Fe[t[e+8]]+Fe[t[e+9]]+"-"+Fe[t[e+10]]+Fe[t[e+11]]+Fe[t[e+12]]+Fe[t[e+13]]+Fe[t[e+14]]+Fe[t[e+15]]).toLowerCase()}var uO=new Uint8Array(16);function Hu(){return crypto.getRandomValues(uO)}function pO(t,e,r){return!e&&!t&&crypto.randomUUID?crypto.randomUUID():dO(t,e,r)}function dO(t,e,r){t=t||{};let o=t.random??t.rng?.()??Hu();if(o.length<16)throw new Error("Random bytes length must be >= 16");if(o[6]=o[6]&15|64,o[8]=o[8]&63|128,e){if(r=r||0,r<0||r+16>e.length)throw new RangeError(`UUID byte range ${r}:${r+15} is out of buffer bounds`);for(let n=0;n<16;++n)e[r+n]=o[n];return e}return ov(o)}var Ne=pO;var zu=class extends Ve{constructor(){super(...arguments);S(this,"edit",I.create(this,!1));S(this,"defaultValue","**Lorem** _ipsum_ dolor");S(this,"cssClass","");S(this,"_overlay",ue.create(this,dr(this.selected)))}render(){let r=this,o=r.edit,n=this.prop("text",this.defaultValue),i=ue.create(this,s=>s(n)==="---");return fr({box:this,overlay:this._overlay,editMode:o,content:ai(Qy(s=>s(n)||"",f.hide(o)),f.maybe(s=>!s(n)&&!s(o),()=>fO("(empty)")),ai.cls("-separator",i),f.on("click",()=>{!o.get()&&this.selected.get()&&o.set(!0)}),ai.cls("-edit",o),ai.cls(s=>`-alignment-${s(r.prop("alignment","left"))}`),this.cssClass?f.cls(this.cssClass,dr(o)):null,f.maybe(o,()=>{let s=I.create(null,n.get()||"");return nv(s,{autoGrow:!0,onInput:!0},nv.cls("-edit",o),l=>{setTimeout(()=>{l.focus(),l.setSelectionRange(l.value.length,l.value.length)},10)},rv(o,l=>{l&&o.get()&&(n.set(s.get()),this.save().catch(reportError))}))}))})}};function It(t,e){return{id:Ne(),type:"Paragraph",text:t,alignment:e}}var nv=m(oa,`
  color: ${g.inputFg};
  background-color: ${g.mainPanelBg};
  border: 0px;
  width: 100%;
  padding: 3px 6px;
  outline: none;
  max-height: 300px;
  min-height: calc(3em * 1.5);
  resize: none;
  border-radius: 3px;
  &-edit {
    cursor: auto;
    background: ${g.inputBg};
    outline: 2px solid black;
    outline-offset: 1px;
    border-radius: 2px;
  }
  &::placeholder {
    color: ${g.inputPlaceholderFg};
  }
  &[readonly] {
    background-color: ${g.inputDisabledBg};
    color: ${g.inputDisabledFg};
  }
`),fO=m("div",`
  color: ${g.inputPlaceholderFg};
  font-style: italic;
`);var Mo=class{constructor(){S(this,"leaf")}};z();function mr(t){return(e,r)=>f.cls(o=>r!==void 0&&!ca(o,r)?"":`${ca(o,t)}${ca(o,e)}`)}function No(t){t.stopPropagation(),t.preventDefault(),t.stopImmediatePropagation()}var mO={Delete:"Supprimer","Insert section above":"Ins\xE9rer une rubrique au-dessus","Insert section below":"Ins\xE9rer une rubrique en dessous","## **Header**":"## **Rubrique**",Description:"Description","Remove Column":"Retirer la colonne","Loading...":"Chargement\u2026","Select fields":"Choisir",Reset:"R\xE9initialiser",Submit:"Envoyer"};function Ct(t){return(e,r)=>{let o=mO[e]??e;for(let[n,i]of Object.entries(r??{}))o=o.split(`{{${n}}}`).join(String(i));return o}}var ju=ct(av());var va=class{constructor(e){S(this,"_map",new Map);S(this,"_createKey");S(this,"_disposeKey");S(this,"_gracePeriodMs");this._createKey=e.create,this._disposeKey=e.dispose,this._gracePeriodMs=e.gracePeriodMs}use(e){let r=this._useKey(e);return{get:()=>r.value,dispose:()=>this._releaseKey(r,e)}}get(e){return this._map.get(e)?.value}purgeKey(e){this._doDisposeKey(e)}dispose(){for(let[e,r]of this._map)r.count=0,r.unsetTimeout(),this._disposeKey.call(null,e,r.value);this._map.clear()}testSetGracePeriodMs(e){let r=this._gracePeriodMs;return this._gracePeriodMs=e,r}_useKey(e){let r=this._map.get(e);if(r)return r.count+=1,r.unsetTimeout(),r;let o=this._createKey.call(null,e),n=new Wu(o);return this._map.set(e,n),n}_releaseKey(e,r){e.count>0&&(e.count-=1,e.count===0&&(this._gracePeriodMs>0?e.disposeTimeout||(e.disposeTimeout=setTimeout(()=>this._doDisposeKey(r),this._gracePeriodMs)):this._doDisposeKey(r)))}_doDisposeKey(e){let r=this._map.get(e);r&&(this._map.delete(e),r.count=0,r.unsetTimeout(),this._disposeKey.call(null,e,r.value))}},Wu=class{constructor(e){this.value=e;S(this,"count",1);S(this,"disposeTimeout")}unsetTimeout(){this.disposeTimeout&&(clearTimeout(this.disposeTimeout),this.disposeTimeout=void 0)}};z();var lv=new va({create:t=>Ku.create(null),dispose:(t,e)=>e.dispose(),gracePeriodMs:10}),Ku=class extends Me{constructor(){super();S(this,"_timeoutId",null);S(this,"_focusLayers",[]);let r=this.grabFocus.bind(this),o=()=>r();this.autoDispose(f.onElem(window,"focus",o)),this.grabFocus();function n(i){let s=i?window.addEventListener:window.removeEventListener;s.call(window,"click",o,!0),s.call(window,"mousedown",o,!0),s.call(window,"keydown",o,!0)}this.autoDispose(f.onElem(window,"blur",n.bind(null,!0))),this.autoDispose(f.onElem(window,"focus",n.bind(null,!1))),n(!document.hasFocus())}addLayer(r){this.getCurrentLayer()?.onDefaultBlur(),this._focusLayers.push(r),setTimeout(()=>{r.defaultFocusElem.contains(document.activeElement)?this.grabFocus():r.focusDefaultElem()},0)}removeLayer(r){Ey(this._focusLayers,r);let o=document.activeElement===document.body;this.grabFocus(o?r.defaultFocusElem:void 0)}getCurrentLayer(){return this._focusLayers[this._focusLayers.length-1]}grabFocus(r){if(r&&!r.isConnected){this._timeoutId&&(clearTimeout(this._timeoutId),this._timeoutId=null),this._doGrabFocus();return}this._timeoutId||(this._timeoutId=setTimeout(()=>this._doGrabFocus(),0))}_doGrabFocus(){if(this.isDisposed())return;this._timeoutId=null;let r=this.getCurrentLayer();if(!r||document.activeElement===r.defaultFocusElem){r?.onDefaultFocus();return}document.hasFocus()&&(document.activeElement&&r.allowFocus(document.activeElement)?(gO(document.activeElement,o=>this.grabFocus(o)),r.onDefaultBlur()):(r.defaultFocusElem.focus({preventScroll:!0}),r.onDefaultFocus()))}},pi=class t extends Me{constructor(r){super();S(this,"defaultFocusElem");S(this,"allowFocus");S(this,"_onDefaultFocus");S(this,"_onDefaultBlur");S(this,"_isDefaultFocused",null);this.defaultFocusElem=r.defaultFocusElem,this.allowFocus=r.allowFocus||(i=>i!==document.body),this._onDefaultFocus=r.onDefaultFocus,this._onDefaultBlur=r.onDefaultBlur,this.defaultFocusElem.hasAttribute("tabindex")||this.defaultFocusElem.setAttribute("tabindex","-1"),r.pauseMousetrap&&(ju.setPaused(!0),this.onDispose(()=>ju.setPaused(!1)));let n=this.autoDispose(lv.use(null)).get();n.addLayer(this),this.onDispose(()=>n.removeLayer(this)),this.autoDispose(f.onElem(this.defaultFocusElem,"blur",(i,s)=>n.grabFocus(s)))}static grabFocus(r){lv.get(null)?.grabFocus(r)}static attach(r){return o=>{let n=t.create(null,{defaultFocusElem:o,...r});f.autoDisposeElem(o,n)}}focusDefaultElem(){this.defaultFocusElem.focus({preventScroll:!0})}onDefaultFocus(){this._isDefaultFocused||(this._isDefaultFocused=!0,this._onDefaultFocus?.())}onDefaultBlur(){this._isDefaultFocused!==!1&&(this._isDefaultFocused=!1,this._onDefaultBlur?.())}};function gO(t,e){let r=()=>{document.activeElement!==t&&(o.dispose(),n.disconnect(),e(t))},o=f.onElem(t,"blur",r),n=new MutationObserver(r),i=t.parentNode;for(;i;)n.observe(i,{childList:!0}),i=i.parentNode}function Ut(t){console.error(t)}z();var hO=Os(`
  from { transform: rotate(45deg); }
  75% { transform: rotate(405deg); }
  to { transform: rotate(405deg); }
`),bO=Os(`
  0% {
    background-color: ${g.loaderFg};
  }
  50%, 100% {
    background-color: ${g.loaderBg};
  }
`),Yu=m("div",`
  --loader-fg: ${g.loaderFg};
  --loader-bg: ${g.loaderBg};
  display: inline-block;
  box-sizing: border-box;
  width: 32px;
  height: 32px;
  border-radius: 32px;
  border: 4px solid var(--loader-bg);
  border-top-color: var(--loader-fg);
  animation: ${hO} 1s ease-out infinite;
  &-inline {
    width: 1em;
    height: 1em;
    line-height: inherit;
    border-radius: 50%;
    border-width: 1px;
  }
`);var jz=m("div",`
  --dot-size: 10px;
  display: inline-flex;
  column-gap: calc(var(--dot-size) / 2);
`),Kz=m("div",`
  border-radius: 50%;
  width: var(--dot-size);
  height: var(--dot-size);
  background-color: ${g.loaderFg};
  color: ${g.loaderFg};
  animation: ${bO} 1s alternate infinite;

  &-left {
    animation-delay: 0s;
  }
  &-middle {
    animation-delay: 0.25s;
  }
  &-right {
    animation-delay: 0.5s;
  }
`);z();var Qz=ct(Qs()),cv=m(Co,`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 30px;
  line-height: 16px;
  background-color: ${g.selectButtonBg};
  color: ${g.selectButtonFg};
  --icon-color: ${g.selectButtonFg};
  font-size: ${C.mediumFontSize};
  padding: 5px;
  border: 1px solid ${g.selectButtonBorder};
  border-radius: 3px;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  -webkit-appearance: none;
  -moz-appearance: none;
  user-select: none;
  -moz-user-select: none;
  outline: none;

  &:focus {
    outline: none;
    box-shadow: 0px 0px 2px 2px #5E9ED6;
  }

  &.disabled, &-disabled {
    opacity: 0.4;
    pointer-events: none;
    cursor: default;
  }
`);z();var AO=ct(vc()),$=ct(Qs());var Kp={};as(Kp,{VERSION:()=>wa,after:()=>Ap,all:()=>$a,allKeys:()=>gt,any:()=>Ha,assign:()=>qr,before:()=>Ii,bind:()=>Pa,bindAll:()=>Lv,chain:()=>Bp,chunk:()=>jp,clone:()=>gp,collect:()=>We,compact:()=>qp,compose:()=>Cp,constant:()=>hi,contains:()=>$e,countBy:()=>qv,create:()=>mp,debounce:()=>Fp,default:()=>Kv,defaults:()=>Aa,defer:()=>Mv,delay:()=>La,detect:()=>Wo,difference:()=>qa,drop:()=>Kr,each:()=>Ce,escape:()=>Av,every:()=>$a,extend:()=>Ca,extendOwn:()=>qr,filter:()=>nt,find:()=>Wo,findIndex:()=>Uo,findKey:()=>Ci,findLastIndex:()=>Ma,findWhere:()=>Op,first:()=>$i,flatten:()=>Vp,foldl:()=>Ra,foldr:()=>Dp,forEach:()=>Ce,functions:()=>qo,get:()=>ki,groupBy:()=>Hv,has:()=>bp,head:()=>$i,identity:()=>Gr,include:()=>$e,includes:()=>$e,indexBy:()=>zv,indexOf:()=>Na,initial:()=>Ri,inject:()=>Ra,intersection:()=>Gp,invert:()=>wi,invoke:()=>$v,isArguments:()=>Ho,isArray:()=>Ue,isArrayBuffer:()=>Sa,isBoolean:()=>mi,isDataView:()=>$r,isDate:()=>bv,isElement:()=>np,isEmpty:()=>lp,isEqual:()=>cp,isError:()=>yv,isFinite:()=>ap,isFunction:()=>se,isMap:()=>Ev,isMatch:()=>vi,isNaN:()=>gi,isNull:()=>op,isNumber:()=>Ba,isObject:()=>Re,isRegExp:()=>xv,isSet:()=>Iv,isString:()=>Ro,isSymbol:()=>_a,isTypedArray:()=>Fa,isUndefined:()=>fi,isWeakMap:()=>Fv,isWeakSet:()=>Cv,iteratee:()=>Vo,keys:()=>W,last:()=>zp,lastIndexOf:()=>Rv,map:()=>We,mapObject:()=>xp,matcher:()=>Ot,matches:()=>Ot,max:()=>Li,memoize:()=>Sp,methods:()=>qo,min:()=>Mp,mixin:()=>Hi,negate:()=>Wr,noop:()=>_i,now:()=>gr,object:()=>Up,omit:()=>Gv,once:()=>Nv,pairs:()=>fp,partial:()=>hr,partition:()=>Vv,pick:()=>za,pluck:()=>jr,property:()=>Ur,propertyOf:()=>yp,random:()=>Go,range:()=>Wp,reduce:()=>Ra,reduceRight:()=>Dp,reject:()=>Pp,rest:()=>Kr,restArguments:()=>ne,result:()=>kp,sample:()=>Ni,select:()=>nt,shuffle:()=>Np,size:()=>$p,some:()=>Ha,sortBy:()=>Rp,sortedIndex:()=>Oi,tail:()=>Kr,take:()=>$i,tap:()=>hp,template:()=>Tp,templateSettings:()=>Pv,throttle:()=>Ep,times:()=>vp,toArray:()=>Mi,toPath:()=>Oa,transpose:()=>Ko,unescape:()=>Dv,union:()=>Wv,uniq:()=>jo,unique:()=>jo,uniqueId:()=>Ei,unzip:()=>Ko,values:()=>Ze,where:()=>Lp,without:()=>Uv,wrap:()=>Ip,zip:()=>jv});var wa="1.13.8",Zu=typeof self=="object"&&self.self===self&&self||typeof global=="object"&&global.global===global&&global||Function("return this")()||{},di=Array.prototype,Ta=Object.prototype,Xu=typeof Symbol<"u"?Symbol.prototype:null,uv=di.push,At=di.slice,Wt=Ta.toString,pv=Ta.hasOwnProperty,Ju=typeof ArrayBuffer<"u",dv=typeof DataView<"u",fv=Array.isArray,Qu=Object.keys,ep=Object.create,tp=Ju&&ArrayBuffer.isView,mv=isNaN,gv=isFinite,ka=!{toString:null}.propertyIsEnumerable("toString"),rp=["valueOf","isPrototypeOf","toString","propertyIsEnumerable","hasOwnProperty","toLocaleString"],hv=Math.pow(2,53)-1;function ne(t,e){return e=e==null?t.length-1:+e,function(){for(var r=Math.max(arguments.length-e,0),o=Array(r),n=0;n<r;n++)o[n]=arguments[n+e];switch(e){case 0:return t.call(this,o);case 1:return t.call(this,arguments[0],o);case 2:return t.call(this,arguments[0],arguments[1],o)}var i=Array(e+1);for(n=0;n<e;n++)i[n]=arguments[n];return i[e]=o,t.apply(this,i)}}function Re(t){var e=typeof t;return e==="function"||e==="object"&&!!t}function op(t){return t===null}function fi(t){return t===void 0}function mi(t){return t===!0||t===!1||Wt.call(t)==="[object Boolean]"}function np(t){return!!(t&&t.nodeType===1)}function X(t){var e="[object "+t+"]";return function(r){return Wt.call(r)===e}}var Ro=X("String");var Ba=X("Number");var bv=X("Date");var xv=X("RegExp");var yv=X("Error");var _a=X("Symbol");var Sa=X("ArrayBuffer");var vv=X("Function"),xO=Zu.document&&Zu.document.childNodes;typeof/./!="function"&&typeof Int8Array!="object"&&typeof xO!="function"&&(vv=function(t){return typeof t=="function"||!1});var se=vv;var ip=X("Object");var Ea=dv&&(!/\[native code\]/.test(String(DataView))||ip(new DataView(new ArrayBuffer(8)))),$o=typeof Map<"u"&&ip(new Map);var yO=X("DataView");function vO(t){return t!=null&&se(t.getInt8)&&Sa(t.buffer)}var $r=Ea?vO:yO;var Ue=fv||X("Array");function Ie(t,e){return t!=null&&pv.call(t,e)}var sp=X("Arguments");(function(){sp(arguments)||(sp=function(t){return Ie(t,"callee")})})();var Ho=sp;function ap(t){return!_a(t)&&gv(t)&&!isNaN(parseFloat(t))}function gi(t){return Ba(t)&&mv(t)}function hi(t){return function(){return t}}function bi(t){return function(e){var r=t(e);return typeof r=="number"&&r>=0&&r<=hv}}function xi(t){return function(e){return e?.[t]}}var Hr=xi("byteLength");var wv=bi(Hr);var wO=/\[object ((I|Ui)nt(8|16|32)|Float(32|64)|Uint8Clamped|Big(I|Ui)nt64)Array\]/;function TO(t){return tp?tp(t)&&!$r(t):wv(t)&&wO.test(Wt.call(t))}var Fa=Ju?TO:hi(!1);var ie=xi("length");function kO(t){for(var e={},r=t.length,o=0;o<r;++o)e[t[o]]=!0;return{contains:function(n){return e[n]===!0},push:function(n){return e[n]=!0,t.push(n)}}}function yi(t,e){e=kO(e);var r=rp.length,o=t.constructor,n=se(o)&&o.prototype||Ta,i="constructor";for(Ie(t,i)&&!e.contains(i)&&e.push(i);r--;)i=rp[r],i in t&&t[i]!==n[i]&&!e.contains(i)&&e.push(i)}function W(t){if(!Re(t))return[];if(Qu)return Qu(t);var e=[];for(var r in t)Ie(t,r)&&e.push(r);return ka&&yi(t,e),e}function lp(t){if(t==null)return!0;var e=ie(t);return typeof e=="number"&&(Ue(t)||Ro(t)||Ho(t))?e===0:ie(W(t))===0}function vi(t,e){var r=W(e),o=r.length;if(t==null)return!o;for(var n=Object(t),i=0;i<o;i++){var s=r[i];if(e[s]!==n[s]||!(s in n))return!1}return!0}function N(t){if(t instanceof N)return t;if(!(this instanceof N))return new N(t);this._wrapped=t}N.VERSION=wa;N.prototype.value=function(){return this._wrapped};N.prototype.valueOf=N.prototype.toJSON=N.prototype.value;N.prototype.toString=function(){return String(this._wrapped)};function Ia(t){return new Uint8Array(t.buffer||t,t.byteOffset||0,Hr(t))}var Tv="[object DataView]";function cp(t,e){for(var r=[{a:t,b:e}],o=[],n=[];r.length;){var i=r.pop();if(i===!0){o.pop(),n.pop();continue}if(t=i.a,e=i.b,t===e){if(t!==0||1/t===1/e)continue;return!1}if(t==null||e==null)return!1;if(t!==t){if(e!==e)continue;return!1}var s=typeof t;if(s!=="function"&&s!=="object"&&typeof e!="object")return!1;t instanceof N&&(t=t._wrapped),e instanceof N&&(e=e._wrapped);var l=Wt.call(t);if(l!==Wt.call(e))return!1;if(Ea&&l=="[object Object]"&&$r(t)){if(!$r(e))return!1;l=Tv}switch(l){case"[object RegExp]":case"[object String]":if(""+t==""+e)continue;return!1;case"[object Number]":r.push({a:+t,b:+e});continue;case"[object Date]":case"[object Boolean]":if(+t==+e)continue;return!1;case"[object Symbol]":if(Xu.valueOf.call(t)===Xu.valueOf.call(e))continue;return!1;case"[object ArrayBuffer]":case Tv:r.push({a:Ia(t),b:Ia(e)});continue}var c=l==="[object Array]";if(!c&&Fa(t)){var p=Hr(t);if(p!==Hr(e))return!1;if(t.buffer===e.buffer&&t.byteOffset===e.byteOffset)continue;c=!0}if(!c){if(typeof t!="object"||typeof e!="object")return!1;var d=t.constructor,h=e.constructor;if(d!==h&&!(se(d)&&d instanceof d&&se(h)&&h instanceof h)&&"constructor"in t&&"constructor"in e)return!1}for(var x=o.length;x--;)if(o[x]===t){if(n[x]===e)break;return!1}if(!(x>=0))if(o.push(t),n.push(e),r.push(!0),c){if(x=t.length,x!==e.length)return!1;for(;x--;)r.push({a:t[x],b:e[x]})}else{var B=W(t),v;if(x=B.length,W(e).length!==x)return!1;for(;x--;){if(v=B[x],!Ie(e,v))return!1;r.push({a:t[v],b:e[v]})}}}return!0}function gt(t){if(!Re(t))return[];var e=[];for(var r in t)e.push(r);return ka&&yi(t,e),e}function zo(t){var e=ie(t);return function(r){if(r==null)return!1;var o=gt(r);if(ie(o))return!1;for(var n=0;n<e;n++)if(!se(r[t[n]]))return!1;return t!==dp||!se(r[up])}}var up="forEach",kv="has",pp=["clear","delete"],Bv=["get",kv,"set"],_v=pp.concat(up,Bv),dp=pp.concat(Bv),Sv=["add"].concat(pp,up,kv);var Ev=$o?zo(_v):X("Map");var Fv=$o?zo(dp):X("WeakMap");var Iv=$o?zo(Sv):X("Set");var Cv=X("WeakSet");function Ze(t){for(var e=W(t),r=e.length,o=Array(r),n=0;n<r;n++)o[n]=t[e[n]];return o}function fp(t){for(var e=W(t),r=e.length,o=Array(r),n=0;n<r;n++)o[n]=[e[n],t[e[n]]];return o}function wi(t){for(var e={},r=W(t),o=0,n=r.length;o<n;o++)e[t[r[o]]]=r[o];return e}function qo(t){var e=[];for(var r in t)se(t[r])&&e.push(r);return e.sort()}function zr(t,e){return function(r){var o=arguments.length;if(e&&(r=Object(r)),o<2||r==null)return r;for(var n=1;n<o;n++)for(var i=arguments[n],s=t(i),l=s.length,c=0;c<l;c++){var p=s[c];(!e||r[p]===void 0)&&(r[p]=i[p])}return r}}var Ca=zr(gt);var qr=zr(W);var Aa=zr(gt,!0);function BO(){return function(){}}function Ti(t){if(!Re(t))return{};if(ep)return ep(t);var e=BO();e.prototype=t;var r=new e;return e.prototype=null,r}function mp(t,e){var r=Ti(t);return e&&qr(r,e),r}function gp(t){return Re(t)?Ue(t)?t.slice():Ca({},t):t}function hp(t,e){return e(t),t}function Oa(t){return Ue(t)?t:[t]}N.toPath=Oa;function ht(t){return N.toPath(t)}function Vr(t,e){for(var r=e.length,o=0;o<r;o++){if(t==null)return;t=t[e[o]]}return r?t:void 0}function ki(t,e,r){var o=Vr(t,ht(e));return fi(o)?r:o}function bp(t,e){e=ht(e);for(var r=e.length,o=0;o<r;o++){var n=e[o];if(!Ie(t,n))return!1;t=t[n]}return!!r}function Gr(t){return t}function Ot(t){return t=qr({},t),function(e){return vi(e,t)}}function Ur(t){return t=ht(t),function(e){return Vr(e,t)}}function bt(t,e,r){if(e===void 0)return t;switch(r??3){case 1:return function(o){return t.call(e,o)};case 3:return function(o,n,i){return t.call(e,o,n,i)};case 4:return function(o,n,i,s){return t.call(e,o,n,i,s)}}return function(){return t.apply(e,arguments)}}function Bi(t,e,r){return t==null?Gr:se(t)?bt(t,e,r):Re(t)&&!Ue(t)?Ot(t):Ur(t)}function Vo(t,e){return Bi(t,e,1/0)}N.iteratee=Vo;function ee(t,e,r){return N.iteratee!==Vo?N.iteratee(t,e):Bi(t,e,r)}function xp(t,e,r){e=ee(e,r);for(var o=W(t),n=o.length,i={},s=0;s<n;s++){var l=o[s];i[l]=e(t[l],l,t)}return i}function _i(){}function yp(t){return t==null?_i:function(e){return ki(t,e)}}function vp(t,e,r){var o=Array(Math.max(0,t));e=bt(e,r,1);for(var n=0;n<t;n++)o[n]=e(n);return o}function Go(t,e){return e==null&&(e=t,t=0),t+Math.floor(Math.random()*(e-t+1))}var gr=Date.now||function(){return new Date().getTime()};function Si(t){var e=function(i){return t[i]},r="(?:"+W(t).join("|")+")",o=RegExp(r),n=RegExp(r,"g");return function(i){return i=i==null?"":""+i,o.test(i)?i.replace(n,e):i}}var Da={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"};var Av=Si(Da);var Ov=wi(Da);var Dv=Si(Ov);var Pv=N.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var wp=/(.)^/,_O={"'":"'","\\":"\\","\r":"r","\n":"n","\u2028":"u2028","\u2029":"u2029"},SO=/\\|'|\r|\n|\u2028|\u2029/g;function EO(t){return"\\"+_O[t]}var FO=/^\s*(\w|\$)+\s*$/;function Tp(t,e,r){!e&&r&&(e=r),e=Aa({},e,N.templateSettings);var o=RegExp([(e.escape||wp).source,(e.interpolate||wp).source,(e.evaluate||wp).source].join("|")+"|$","g"),n=0,i="__p+='";t.replace(o,function(p,d,h,x,B){return i+=t.slice(n,B).replace(SO,EO),n=B+p.length,d?i+=`'+
((__t=(`+d+`))==null?'':_.escape(__t))+
'`:h?i+=`'+
((__t=(`+h+`))==null?'':__t)+
'`:x&&(i+=`';
`+x+`
__p+='`),p}),i+=`';
`;var s=e.variable;if(s){if(!FO.test(s))throw new Error("variable is not a bare identifier: "+s)}else i=`with(obj||{}){
`+i+`}
`,s="obj";i=`var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
`+i+`return __p;
`;var l;try{l=new Function(s,"_",i)}catch(p){throw p.source=i,p}var c=function(p){return l.call(this,p,N)};return c.source="function("+s+`){
`+i+"}",c}function kp(t,e,r){e=ht(e);var o=e.length;if(!o)return se(r)?r.call(t):r;for(var n=0;n<o;n++){var i=t?.[e[n]];i===void 0&&(i=r,n=o),t=se(i)?i.call(t):i}return t}var IO=0;function Ei(t){var e=++IO+"";return t?t+e:e}function Bp(t){var e=N(t);return e._chain=!0,e}function Fi(t,e,r,o,n){if(!(o instanceof e))return t.apply(r,n);var i=Ti(t.prototype),s=t.apply(i,n);return Re(s)?s:i}var _p=ne(function(t,e){var r=_p.placeholder,o=function(){for(var n=0,i=e.length,s=Array(i),l=0;l<i;l++)s[l]=e[l]===r?arguments[n++]:e[l];for(;n<arguments.length;)s.push(arguments[n++]);return Fi(t,o,this,this,s)};return o});_p.placeholder=N;var hr=_p;var Pa=ne(function(t,e,r){if(!se(t))throw new TypeError("Bind must be called on a function");var o=ne(function(n){return Fi(t,o,e,this,r.concat(n))});return o});var le=bi(ie);function Xe(t,e,r){!e&&e!==0&&(e=1/0);for(var o=[],n=0,i=0,s=ie(t)||0,l=[];;){if(i>=s){if(!l.length)break;var c=l.pop();i=c.i,t=c.v,s=ie(t);continue}var p=t[i++];l.length>=e?o[n++]=p:le(p)&&(Ue(p)||Ho(p))?(l.push({i,v:t}),i=0,t=p,s=ie(t)):r||(o[n++]=p)}return o}var Lv=ne(function(t,e){e=Xe(e,!1,!1);var r=e.length;if(r<1)throw new Error("bindAll must be passed function names");for(;r--;){var o=e[r];t[o]=Pa(t[o],t)}return t});function Sp(t,e){var r=function(o){var n=r.cache,i=""+(e?e.apply(this,arguments):o);return Ie(n,i)||(n[i]=t.apply(this,arguments)),n[i]};return r.cache={},r}var La=ne(function(t,e,r){return setTimeout(function(){return t.apply(null,r)},e)});var Mv=hr(La,N,1);function Ep(t,e,r){var o,n,i,s,l=0;r||(r={});var c=function(){l=r.leading===!1?0:gr(),o=null,s=t.apply(n,i),o||(n=i=null)},p=function(){var d=gr();!l&&r.leading===!1&&(l=d);var h=e-(d-l);return n=this,i=arguments,h<=0||h>e?(o&&(clearTimeout(o),o=null),l=d,s=t.apply(n,i),o||(n=i=null)):!o&&r.trailing!==!1&&(o=setTimeout(c,h)),s};return p.cancel=function(){clearTimeout(o),l=0,o=n=i=null},p}function Fp(t,e,r){var o,n,i,s,l,c=function(){var d=gr()-n;e>d?o=setTimeout(c,e-d):(o=null,r||(s=t.apply(l,i)),o||(i=l=null))},p=ne(function(d){return l=this,i=d,n=gr(),o||(o=setTimeout(c,e),r&&(s=t.apply(l,i))),s});return p.cancel=function(){clearTimeout(o),o=i=l=null},p}function Ip(t,e){return hr(e,t)}function Wr(t){return function(){return!t.apply(this,arguments)}}function Cp(){var t=arguments,e=t.length-1;return function(){for(var r=e,o=t[e].apply(this,arguments);r--;)o=t[r].call(this,o);return o}}function Ap(t,e){return function(){if(--t<1)return e.apply(this,arguments)}}function Ii(t,e){var r;return function(){return--t>0&&(r=e.apply(this,arguments)),t<=1&&(e=null),r}}var Nv=hr(Ii,2);function Ci(t,e,r){e=ee(e,r);for(var o=W(t),n,i=0,s=o.length;i<s;i++)if(n=o[i],e(t[n],n,t))return n}function Ai(t){return function(e,r,o){r=ee(r,o);for(var n=ie(e),i=t>0?0:n-1;i>=0&&i<n;i+=t)if(r(e[i],i,e))return i;return-1}}var Uo=Ai(1);var Ma=Ai(-1);function Oi(t,e,r,o){r=ee(r,o,1);for(var n=r(e),i=0,s=ie(t);i<s;){var l=Math.floor((i+s)/2);r(t[l])<n?i=l+1:s=l}return i}function Di(t,e,r){return function(o,n,i){var s=0,l=ie(o);if(typeof i=="number")t>0?s=i>=0?i:Math.max(i+l,s):l=i>=0?Math.min(i+1,l):i+l+1;else if(r&&i&&l)return i=r(o,n),o[i]===n?i:-1;if(n!==n)return i=e(At.call(o,s,l),gi),i>=0?i+s:-1;for(i=t>0?s:l-1;i>=0&&i<l;i+=t)if(o[i]===n)return i;return-1}}var Na=Di(1,Uo,Oi);var Rv=Di(-1,Ma);function Wo(t,e,r){var o=le(t)?Uo:Ci,n=o(t,e,r);if(n!==void 0&&n!==-1)return t[n]}function Op(t,e){return Wo(t,Ot(e))}function Ce(t,e,r){e=bt(e,r);var o,n;if(le(t))for(o=0,n=t.length;o<n;o++)e(t[o],o,t);else{var i=W(t);for(o=0,n=i.length;o<n;o++)e(t[i[o]],i[o],t)}return t}function We(t,e,r){e=ee(e,r);for(var o=!le(t)&&W(t),n=(o||t).length,i=Array(n),s=0;s<n;s++){var l=o?o[s]:s;i[s]=e(t[l],l,t)}return i}function Pi(t){var e=function(r,o,n,i){var s=!le(r)&&W(r),l=(s||r).length,c=t>0?0:l-1;for(i||(n=r[s?s[c]:c],c+=t);c>=0&&c<l;c+=t){var p=s?s[c]:c;n=o(n,r[p],p,r)}return n};return function(r,o,n,i){var s=arguments.length>=3;return e(r,bt(o,i,4),n,s)}}var Ra=Pi(1);var Dp=Pi(-1);function nt(t,e,r){var o=[];return e=ee(e,r),Ce(t,function(n,i,s){e(n,i,s)&&o.push(n)}),o}function Pp(t,e,r){return nt(t,Wr(ee(e)),r)}function $a(t,e,r){e=ee(e,r);for(var o=!le(t)&&W(t),n=(o||t).length,i=0;i<n;i++){var s=o?o[i]:i;if(!e(t[s],s,t))return!1}return!0}function Ha(t,e,r){e=ee(e,r);for(var o=!le(t)&&W(t),n=(o||t).length,i=0;i<n;i++){var s=o?o[i]:i;if(e(t[s],s,t))return!0}return!1}function $e(t,e,r,o){return le(t)||(t=Ze(t)),(typeof r!="number"||o)&&(r=0),Na(t,e,r)>=0}var $v=ne(function(t,e,r){var o,n;return se(e)?n=e:(e=ht(e),o=e.slice(0,-1),e=e[e.length-1]),We(t,function(i){var s=n;if(!s){if(o&&o.length&&(i=Vr(i,o)),i==null)return;s=i[e]}return s==null?s:s.apply(i,r)})});function jr(t,e){return We(t,Ur(e))}function Lp(t,e){return nt(t,Ot(e))}function Li(t,e,r){var o=-1/0,n=-1/0,i,s;if(e==null||typeof e=="number"&&typeof t[0]!="object"&&t!=null){t=le(t)?t:Ze(t);for(var l=0,c=t.length;l<c;l++)i=t[l],i!=null&&i>o&&(o=i)}else e=ee(e,r),Ce(t,function(p,d,h){s=e(p,d,h),(s>n||s===-1/0&&o===-1/0)&&(o=p,n=s)});return o}function Mp(t,e,r){var o=1/0,n=1/0,i,s;if(e==null||typeof e=="number"&&typeof t[0]!="object"&&t!=null){t=le(t)?t:Ze(t);for(var l=0,c=t.length;l<c;l++)i=t[l],i!=null&&i<o&&(o=i)}else e=ee(e,r),Ce(t,function(p,d,h){s=e(p,d,h),(s<n||s===1/0&&o===1/0)&&(o=p,n=s)});return o}var CO=/[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;function Mi(t){return t?Ue(t)?At.call(t):Ro(t)?t.match(CO):le(t)?We(t,Gr):Ze(t):[]}function Ni(t,e,r){if(e==null||r)return le(t)||(t=Ze(t)),t[Go(t.length-1)];var o=Mi(t),n=ie(o);e=Math.max(Math.min(e,n),0);for(var i=n-1,s=0;s<e;s++){var l=Go(s,i),c=o[s];o[s]=o[l],o[l]=c}return o.slice(0,e)}function Np(t){return Ni(t,1/0)}function Rp(t,e,r){var o=0;return e=ee(e,r),jr(We(t,function(n,i,s){return{value:n,index:o++,criteria:e(n,i,s)}}).sort(function(n,i){var s=n.criteria,l=i.criteria;if(s!==l){if(s>l||s===void 0)return 1;if(s<l||l===void 0)return-1}return n.index-i.index}),"value")}function jt(t,e){return function(r,o,n){var i=e?[[],[]]:{};return o=ee(o,n),Ce(r,function(s,l){var c=o(s,l,r);t(i,s,c)}),i}}var Hv=jt(function(t,e,r){Ie(t,r)?t[r].push(e):t[r]=[e]});var zv=jt(function(t,e,r){t[r]=e});var qv=jt(function(t,e,r){Ie(t,r)?t[r]++:t[r]=1});var Vv=jt(function(t,e,r){t[r?0:1].push(e)},!0);function $p(t){return t==null?0:le(t)?t.length:W(t).length}function Hp(t,e,r){return e in r}var za=ne(function(t,e){var r={},o=e[0];if(t==null)return r;se(o)?(e.length>1&&(o=bt(o,e[1])),e=gt(t)):(o=Hp,e=Xe(e,!1,!1),t=Object(t));for(var n=0,i=e.length;n<i;n++){var s=e[n],l=t[s];o(l,s,t)&&(r[s]=l)}return r});var Gv=ne(function(t,e){var r=e[0],o;return se(r)?(r=Wr(r),e.length>1&&(o=e[1])):(e=We(Xe(e,!1,!1),String),r=function(n,i){return!$e(e,i)}),za(t,r,o)});function Ri(t,e,r){return At.call(t,0,Math.max(0,t.length-(e==null||r?1:e)))}function $i(t,e,r){return t==null||t.length<1?e==null||r?void 0:[]:e==null||r?t[0]:Ri(t,t.length-e)}function Kr(t,e,r){return At.call(t,e==null||r?1:e)}function zp(t,e,r){return t==null||t.length<1?e==null||r?void 0:[]:e==null||r?t[t.length-1]:Kr(t,Math.max(0,t.length-e))}function qp(t){return nt(t,Boolean)}function Vp(t,e){return Xe(t,e,!1)}var qa=ne(function(t,e){return e=Xe(e,!0,!0),nt(t,function(r){return!$e(e,r)})});var Uv=ne(function(t,e){return qa(t,e)});function jo(t,e,r,o){mi(e)||(o=r,r=e,e=!1),r!=null&&(r=ee(r,o));for(var n=[],i=[],s=0,l=ie(t);s<l;s++){var c=t[s],p=r?r(c,s,t):c;e&&!r?((!s||i!==p)&&n.push(c),i=p):r?$e(i,p)||(i.push(p),n.push(c)):$e(n,c)||n.push(c)}return n}var Wv=ne(function(t){return jo(Xe(t,!0,!0))});function Gp(t){for(var e=[],r=arguments.length,o=0,n=ie(t);o<n;o++){var i=t[o];if(!$e(e,i)){var s;for(s=1;s<r&&$e(arguments[s],i);s++);s===r&&e.push(i)}}return e}function Ko(t){for(var e=t&&Li(t,ie).length||0,r=Array(e),o=0;o<e;o++)r[o]=jr(t,o);return r}var jv=ne(Ko);function Up(t,e){for(var r={},o=0,n=ie(t);o<n;o++)e?r[t[o]]=e[o]:r[t[o][0]]=t[o][1];return r}function Wp(t,e,r){e==null&&(e=t||0,t=0),r||(r=e<t?-1:1);for(var o=Math.max(Math.ceil((e-t)/r),0),n=Array(o),i=0;i<o;i++,t+=r)n[i]=t;return n}function jp(t,e){if(e==null||e<1)return[];for(var r=[],o=0,n=t.length;o<n;)r.push(At.call(t,o,o+=e));return r}function Yo(t,e){return t._chain?N(e).chain():e}function Hi(t){return Ce(qo(t),function(e){var r=N[e]=t[e];N.prototype[e]=function(){var o=[this._wrapped];return uv.apply(o,arguments),Yo(this,r.apply(N,o))}}),N}Ce(["pop","push","reverse","shift","sort","splice","unshift"],function(t){var e=di[t];N.prototype[t]=function(){var r=this._wrapped;return r!=null&&(e.apply(r,arguments),(t==="shift"||t==="splice")&&r.length===0&&delete r[0]),Yo(this,r)}});Ce(["concat","join","slice"],function(t){var e=di[t];N.prototype[t]=function(){var r=this._wrapped;return r!=null&&(r=e.apply(r,arguments)),Yo(this,r)}});var Kv=N;var Yv=Hi(Kp);Yv._=Yv;var B9=Ct("menus"),Zv=null;function OO(t){Zv=t,t.onDispose(()=>Zv=null)}function Xv(t,e){return $.menu(o=>(OO(o),t(o)),{...Yp,...e})}function Zp(t,e,...r){return $.menuItemSubmenu(t,{...Yp,expandIcon:()=>DO("Expand"),menuCssClass:`${PO.className} ${Yp.menuCssClass}`,...e},f.cls(jO.className),...r)}var _9=m("div",`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`),DO=m(re,`
  position: absolute;
  right: 4px;
`),PO=m("div",`
  white-space: nowrap;
  min-width: 200px;
`),Va=m("div",`
  font-family: ${C.fontFamily};
  font-size: ${C.mediumFontSize};
  line-height: initial;
  max-width: 400px;
  padding: 8px 0px 16px 0px;
  box-shadow: 0 2px 20px 0 ${g.menuShadow};
  min-width: 160px;
  z-index: ${C.menuZIndex};
  --weaseljs-selected-background-color: ${g.menuItemSelectedBg};
  --weaseljs-menu-item-padding: 8px 24px;
  background-color: ${g.menuBg};

  @media print {
    & {
      display: none;
    }
  }
`),Jv=m("div",`
  z-index: ${C.menuZIndex};
  & > .${Va.className} {
    z-index: auto;
  }
`),Ga=`
  justify-content: flex-start;
  align-items: center;
  color: ${g.menuItemFg};
  --icon-color: ${g.accentIcon};
  .${$.cssMenuItem.className}-sel {
    color: ${g.menuItemSelectedFg};
    --icon-color: ${g.menuItemSelectedFg};
  }
  &.disabled, &.disabled:hover, &[aria-disabled="true"], &[aria-disabled="true"]:hover {
    cursor: default;
    color: ${g.menuItemDisabledFg};
    --icon-color: ${g.menuItemDisabledFg};
  }
`,LO=`
  .${$.cssMenuGroup.className} [role="presentation"] {
    padding: 0;
  }
`,S9=m("div",Ga),MO=Va.className,Qv="grist-floating-menu",Yp={menuCssClass:MO+" "+Qv,menuWrapCssClass:Jv.className};function Ua(t,e,r={}){let{renderOptionArgs:o,...n}=r,i=HO(Cr("select-menu")),s=cv(Cr("select-open")),{menuCssClass:l,...c}=n,p={buttonArrow:GO("Collapse"),menuCssClass:[i.className,l||"",Qv].join(" "),menuWrapCssClass:Jv.className,buttonCssClass:s.className,...c};return $.select(t,e,p,d=>zO(d.icon?qO(d.icon):null,VO(d.label),o?o(d):null,Cr("select-row")))}var NO=m("div",`
  color: ${g.menuSubheaderFg};
  font-size: ${C.xsmallFontSize};
  text-transform: uppercase;
  font-weight: ${C.headerControlTextWeight};
  padding: 8px 24px 8px 24px;
  cursor: default;
`),E9=m("div",`
  cursor: pointer;
`),RO=(...t)=>f("div",{id:Ei("menu-text-"),role:"presentation"},e=>{setTimeout(()=>{let r=e.closest('[role="menu"], [role="listbox"]'),o=r?.getAttribute("aria-describedby")||"";r?.setAttribute("aria-describedby",o?`${o} ${e.id}`:e.id)},0)},...t),ew=`
  display: flex;
  align-items: center;
  font-size: ${C.smallFontSize};
  color: ${g.menuText};
  padding: 8px 24px 4px 24px;
  max-width: 250px;
  cursor: default;
`,F9=m(RO,ew),I9=m("div",ew),it=m($.menuItem,Ga),C9=m($.menuItemCheckbox,Ga),$O=m($.menuGroup,LO),Xp=(t,...e)=>$O(NO(t),...e),A9=m($.menuItemLink,Ga);function zi(t,e,...r){return it(()=>t.run(),typeof e=="string"?f("span",e,Cr("cmd-name")):f("div",e(),Cr("cmd-name")),t.humanKeys?.length?WO(t.humanKeys[0]):null,UO.cls(""),...r)}var O9=m("div",`
  display: flex;
  align-items: center;
`);var Zo=m($.cssMenuDivider,`
  background-color: ${g.menuBorder};
  margin: 8px 0;
`),xt=m(re,`
  flex: none;
  margin-right: 8px;
`),HO=m(Va,`
  max-height: 400px;
  overflow-y: auto;

  --weaseljs-menu-item-padding: 8px 16px;
`),D9=m("div",`
  position: relative;
  width: 100%;
`),P9=m("div",`
  display: flex;
  align-items: center;
  font-size: ${C.mediumFontSize};
  color: ${g.controlFg};
  --icon-color: ${g.controlFg};
  width: initial;
  height: initial;
  line-height: inherit;
  background-color: initial;
  padding: initial;
  border: initial;
  border-radius: initial;
  box-shadow: initial;
  cursor: pointer;
  outline: none;
  -webkit-appearance: none;
  -moz-appearance: none;

  &:hover, &:focus, &:active {
    color: ${g.controlHoverFg};
    --icon-color: ${g.controlHoverFg};
    box-shadow: initial;
  }
`),zO=m("span",`
  display: flex;
  align-items: center;
  width: 100%;
`),L9=m("div",`
  display: flex;
  align-items: center;
  margin-left: 8px;
`),qO=m(re,`
  height: 16px;
  width: 16px;
  background-color: var(--icon-color, ${g.menuItemIconFg});
  margin: -3px 8px 0 2px;
  margin: 0 8px 0 0;
  flex: none;

  .${$.cssMenuItem.className}-sel & {
    background-color: ${g.menuItemSelectedFg};
  }

  .${$.cssMenuItem.className}[aria-disabled="true"] &,
  .${$.cssMenuItem.className}.disabled & {
    background-color: ${g.menuItemDisabledFg};
  }
`),VO=m("div",`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  --grist-option-label-color: ${g.menuItemFg};
  --grist-option-label-color-sel: ${g.menuItemSelectedFg};
  --grist-option-label-color-disabled: ${g.menuItemDisabledFg};

  .${$.cssMenuItem.className} & {
    color: var(--grist-option-label-color);
  }

  .${$.cssMenuItem.className}-sel & {
    color: var(--grist-option-label-color-sel);
    background-color: ${g.menuItemSelectedBg};
  }

  .${$.cssMenuItem.className}[aria-disabled="true"] &,
  .${$.cssMenuItem.className}.disabled & {
    color: var(--grist-option-label-color-disabled);
  }
`),GO=m(re,`
  margin: 0 2px;
  pointer-events: none;
`),M9=m(re,`
  position: absolute;
  right: 12px;
  top: calc(50% - 8px);
  pointer-events: none;
  background-color: ${g.selectButtonFg};
`),N9=m(Va,`
  padding: 4px 0px;
`),UO=m("div",`
  justify-content: space-between;
  --icon-color: ${g.menuItemFg};

  .${$.cssMenuItem.className}-sel & {
    --icon-color: ${g.menuItemSelectedFg};
  }

  .${$.cssMenuItem.className}[aria-disabled="true"] &,
  .${$.cssMenuItem.className}.disabled & {
    --icon-color: ${g.menuItemDisabledFg};
  }
`),WO=m("span",`
  margin-left: 16px;
  color: ${g.menuItemIconFg};
  margin-right: -12px;

  .${$.cssMenuItem.className}-sel > & {
    color: ${g.menuItemIconSelectedFg};
  }

  .${$.cssMenuItem.className}[aria-disabled="true"] &,
  .${$.cssMenuItem.className}.disabled & {
    color: ${g.menuItemDisabledFg};
  }
`),R9=m("span",`
  color: ${g.accentText};
  text-transform: uppercase;
  font-size: 8px;
  vertical-align: super;
  margin-top: -4px;
  margin-left: 4px;
  font-weight: bold;

  .${$.cssMenuItem.className}-sel > & {
    color: ${g.menuItemIconSelectedFg};
  }
`),$9=m("div",`
  flex: 1 1 0px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${g.selectButtonFg};

  &-placeholder {
    color: ${g.selectButtonPlaceholderFg};
  }
`),H9=m($.cssMenu,`
  display: flex;
  flex-direction: column;
  max-height: calc(max(300px, 95vh - 300px));
  max-width: 400px;
  padding-bottom: 0px;
  background-color: ${g.menuBg};
  z-index: ${C.menuZIndex};
`),z9=m(Dr,`
  padding: 8px 16px;
`),q9=m(pu,`
  margin-right: 12px;
  color: ${g.text};
  white-space: pre;
`),V9=m(Jn,`
  font-size: ${C.smallFontSize};
`),jO=m("div",`
  position: relative;
  justify-content: flex-start;
  color: ${g.menuItemFg};
  --icon-color: ${g.accentIcon};
  .${$.cssMenuItem.className}-sel {
    color: ${g.menuItemSelectedFg};
    --icon-color: ${g.menuItemSelectedFg};
  }
  &.disabled, &.disabled:hover, &[aria-disabled="true"], &[aria-disabled="true"]:hover {
    cursor: default;
    color: ${g.menuItemDisabledFg};
    --icon-color: ${g.menuItemDisabledFg};
  }
`),G9=m("div",`
  display: flex;
  column-gap: 8px;
  align-items: center;
  padding: 8px 16px;
`),U9=m(re,`
  flex-shrink: 0;
  --icon-color: ${g.menuItemIconFg};
`),W9=m("input",`
  color: ${g.inputFg};
  background-color: ${g.inputBg};
  flex-grow: 1;
  font-size: ${C.mediumFontSize};
  padding: 0px;
  border: none;
  outline: none;

  &::placeholder {
    color: ${g.inputPlaceholderFg};
  }
`);z();var ja=Ct("Section"),tw=mr("test-forms-"),Jp=class extends Ve{constructor(e,r,o){super(e,r,o)}render(){let e=this.children;return fr({box:this,drag:ba(li("DragDrop",li.cls("-top"))),showRemoveButton:r=>!r(this.root().disableDeleteSection),content:Ky(KO(tw("content"),f.forEach(e,r=>r.render())),si(tw("plus"),Lo(),ga(ha("Plus"),br({box:this,customItems:[it(()=>Le.insertFieldBefore.run({structure:"Section"}),xt("Section"),ja("Insert section above")),it(()=>Le.insertFieldAfter.run({structure:"Section"}),xt("Section"),ja("Insert section below"))]}))))})}willAccept(){return"child"}accept(e){if(!e||e.id===this.id)return null;let r=e.id?this.root().find(e.id):null;r&&r.removeSelf();let o=this.placeBeforeMe();return e.type==="Field"&&(o=this.placeAfterListChild()),o(e)}async deleteSelf(){let r=Array.from(this.filter(o=>o instanceof Mo)).map(o=>o.leaf.get());await this.parent?.save(async()=>{r.length>0&&await this.view.viewSection.removeField(r),this.children.get().forEach(o=>{o.removeSelf()}),this.removeSelf()})}canRemove(){return!this.parent.disableDeleteSection.get()}};function Qp(...t){return{id:Ne(),type:"Section",children:[It(ja("## **Header**")),It(ja("Description")),...t]}}var KO=m("div.hover_border",`
`);z();z();var Ae={pages:I.create(null,[]),forms:I.create(null,[]),docBase:I.create(null,null)},Ka=[{id:"rouge",label:"Rouge M\xE9tropole",bg:"#FF0000"},{id:"rouge-fonce",label:"Rouge fonc\xE9",bg:"#C00000"},{id:"marine",label:"Bleu marine",bg:"#2A3158"},{id:"bleu",label:"Bleu",bg:"#509EE3"},{id:"vert",label:"Vert",bg:"#88BF4D"},{id:"violet",label:"Violet",bg:"#A989C5"},{id:"corail",label:"Corail",bg:"#EF8C8C"},{id:"jaune",label:"Jaune",bg:"#F9D45C"},{id:"orange",label:"Orange",bg:"#F2A86F"},{id:"cyan",label:"Cyan",bg:"#98D9D9"},{id:"indigo",label:"Indigo",bg:"#7172AD"}];function Ya(t){let e=/^#[0-9a-f]{6}$/i.test(t||"")?t:(Ka.find(n=>n.id===t)??Ka[0]).bg,r=parseInt(e.slice(1),16),o=.299*(r>>16&255)+.587*(r>>8&255)+.114*(r&255)<150;return{bg:e,fg:o?"#FFFFFF":"#1E2340"}}var rw=["Home","Page","TypeTable","TypeCard","TypeCardList","ChartBar","ChartPie","ChartLine","TypeCalendar","Database","Folder","Board","Pivot","Layers","FormConfig","Memo","Pencil","Mail","Chat","Notification","Public","World","FieldLink","Bookmark","Star","Heart","Flag","Idea","Info","Help","Search","Settings","Lock","Clock","Desktop","Mobile","Video","UseFinance","UseHr","UseSales","UseScience","UseEducate"],Za={page:"Page",form:"Pencil",url:"World"};function YO(t){try{return new URL(ow(t)||"").hostname.replace(/^www\./,"")}catch{return""}}function ow(t){let e=String(t||"").trim();return e?(/^[a-z][a-z0-9+.-]*:/i.test(e)||(e="https://"+e),/^(https?|mailto|tel):/i.test(e)?e:""):""}function nw(t){return t.label?.trim()?t.label.trim():t.kind==="page"?Ae.pages.get().find(e=>e.id===t.page)?.name||"Page \xE0 choisir":t.kind==="form"?Ae.forms.get().find(e=>e.id===t.form)?.name||"Formulaire \xE0 choisir":YO(t.url)||"Site web \xE0 choisir"}function iw(t){let e=Ae.docBase.get();if(t.kind==="url"){let r=ow(t.url);return r?{href:r,target:"_blank"}:null}return e?t.kind==="form"?t.form?{href:`${e}/f/${t.form}`,target:"_blank"}:null:t.page?{href:`${e}/p/${t.page}`,target:"_top"}:null:null}z();function qi(t,e,...r){let{bg:o,fg:n}=Ya(t.color);return(e==="a"?XO:ZO)(Qn("--tile-bg",o),Qn("--tile-fg",n),JO(re(t.icon||Za[t.kind||"page"])),QO(eD(nw(t)),t.description?tD(t.description):null),rD(re("ArrowRight")),...r)}var sw=`
  display: flex;
  align-items: stretch;
  min-height: 72px;
  overflow: hidden;
  border: 1px solid ${g.menuBorder};
  border-radius: 8px;
  background: ${g.mainPanelBg};
  color: ${g.text};
  text-decoration: none;
  transition: box-shadow 0.15s, border-color 0.15s, transform 0.15s;
  a&:hover {
    border-color: var(--tile-bg);
    box-shadow: 0 6px 16px rgba(38, 38, 51, 0.12);
    transform: translateY(-2px);
    text-decoration: none;
    color: ${g.text};
  }
  a&:focus-visible { outline: 2px solid var(--tile-bg); outline-offset: 2px; }
`,ZO=m("div",sw),XO=m("a",sw),JO=m("div",`
  flex: none;
  display: grid;
  place-items: center;
  width: 64px;
  background: var(--tile-bg);
  --icon-color: var(--tile-fg);
  & > .flexauto, & > div { width: 24px; height: 24px; }
`),QO=m("div",`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  padding: 10px 12px;
`),eD=m("div",`
  font-weight: 600;
  font-size: 14px;
  overflow-wrap: anywhere;
`),tD=m("div",`
  font-size: 12px;
  color: ${g.lightText};
  overflow-wrap: anywhere;
`),rD=m("div",`
  flex: none;
  display: grid;
  place-items: center;
  padding-right: 12px;
  --icon-color: ${g.lightText};
`);var aw=["label","description","kind","page","form","url","icon","color"],Vi=class extends Ve{constructor(){super(...arguments);this._overlay=ue.create(this,dr(this.selected))}data(r=o=>o.get()){return Object.fromEntries(aw.map(o=>[o,r(this.prop(o))]))}render(...r){return fr({box:this,overlay:this._overlay,content:f.domComputed(o=>(o(Ae.pages),o(Ae.forms),qi(this.data(o),"div")))},...r)}};function Gi(t="page"){return{id:Ne(),type:"Button",label:"",description:"",kind:t,page:null,form:null,url:"",icon:Za[t],color:"rouge"}}function Ui(t){switch(t){case"Columns":return Wi();case"Placeholder":return yt();case"Separator":return It("---");case"Header":return It("# **En-t\xEAte**","center");case"Section":return Qp();default:return{id:Ne(),type:t}}}z();var oD=mr("test-forms-menu-"),nD=[{kind:"page",label:"Vers une page",icon:"Page"},{kind:"form",label:"Vers un formulaire",icon:"Pencil"},{kind:"url",label:"Vers un site web",icon:"World"}];function br(t,...e){let{box:r,context:o,customItems:n}=t,i=r?.view??t.view;if(!i)throw new Error("No view provided");let s=r?.parent?.type==="Columns"&&r.type!=="Placeholder";return[Xv(l=>{r?.view.selectedBox.set(r);let c=v=>({structure:v}),p=v=>()=>{Le.insertFieldBefore.run(v)},d=v=>()=>{Le.insertFieldAfter.run(v)},h=v=>()=>{Le.insertField.run(v)},x=t.insertBox?v=>()=>{let A=t.insertBox("structure"in v?Ui(v.structure):i.newElement(v));return i.selectedBox.set(A),i.save()}:null,B=v=>()=>[Xp("Nouveau bouton",...nD.map(A=>it(v({button:A.kind}),xt(A.icon),A.label,oD("button-"+A.kind)))),Zo(),Xp("Blocs",it(v(c("Header")),xt("Headband"),"En-t\xEAte"),it(v(c("Paragraph")),xt("Paragraph"),"Paragraphe"),it(v(c("Columns")),xt("Columns"),"Colonnes"),it(v(c("Separator")),xt("Separator"),"S\xE9parateur")),t.customItems?Zo():null,...t.customItems??[]];return!t.context&&!s?B(x??h)():[s?null:[Zp(B(p),{},"Ins\xE9rer au-dessus"),Zp(B(d),{},"Ins\xE9rer en dessous"),Zo()],zi(Le.contextMenuCopy,"Copier"),zi(Le.contextMenuCut,"Couper"),zi(Le.contextMenuPaste,"Coller"),Zo(),zi(Le.deleteFields,"Supprimer"),v=>void pi.create(l,{defaultFocusElem:v,pauseMousetrap:!0}),n?.length?Zo(f.style("min-width","200px")):null,...n??[],...e]},{trigger:[o?"contextmenu":"click"]}),o?f.on("contextmenu",No):null]}z();function lw(t,e){return typeof t=="string"?f.attr("title",t):null}z();var ji=mr("test-forms-"),iD=Ct("Editor");function fr(t,...e){let r=new qe,{box:o,overlay:n}=t,i=o.view,s=I.create(r,!1),l;r.autoDispose(i.selectedBox.addListener(x=>{x===o&&l?.scrollIntoView({behavior:"smooth",block:"nearest",inline:"nearest"})}));let c=()=>$u(re(t.removeIcon??"RemoveBig"),f.on("click",x=>{No(x),o.view.selectedBox.set(o),Le.deleteFields.run()}),t.removeButton===null?null:lw(t.removeTooltip??iD("Delete")),$u.cls("-right",t.removePosition==="right"),ji("remove")),p=I.create(r,!1),d=I.create(r,!1),h=I.create(r,!1);return l=mt(ji("editor"),mt.cls("-drag-above",x=>x(p)&&x(s)),mt.cls("-drag-below",x=>x(d)&&x(s)),t.drag??ba(li("DragDrop")),mt.cls(`-${t.box.type}`),mt.cls("-selected",o.selected),mt.cls("-cut",o.cut),ji("field-editor-selected",o.selected),f.on("click",x=>{No(x),o.view.selectedBox.set(o)}),br({box:o,context:!0}),{draggable:"true"},f.on("mousedown",(x,B)=>{let v=["INPUT","TEXTAREA"].includes(x.target?.tagName);B.draggable=!v}),f.on("mouseup",(x,B)=>{B.draggable=!0}),f.on("dragstart",x=>{if(x.stopPropagation(),t.editMode?.get()){x.preventDefault();return}x.dataTransfer?.setData("text/plain",JSON.stringify(o.toJSON())),x.dataTransfer.dropEffect="move",h.set(!0)}),f.on("dragover",x=>{if(x.stopPropagation(),x.preventDefault(),x.stopImmediatePropagation(),x.dataTransfer.dropEffect="move",s.set(!0),h.get()||o.willAccept()!=="sibling")return;let B=l.offsetHeight,v=Math.round(x.offsetY/B*100);v<40?(p.set(!0),d.set(!1)):v>60?(p.set(!1),d.set(!0)):(p.set(!1),d.set(!1))}),f.on("dragleave",x=>{x.stopPropagation(),x.preventDefault(),s.set(!1),p.set(!1),d.set(!1)}),f.on("dragend",()=>{s.set(!1),p.set(!1),d.set(!1),h.set(!1)}),f.on("drop",async x=>{No(x),s.set(!1),h.set(!1),p.set(!1);let B=d.get();d.set(!1);let v=Ps(x.dataTransfer.getData("text/plain"));if(!v)return;let A=v.id;if(A===o.id)return;let q=o.root().find(A);if(!q?.find(o.id)&&o.willAccept(q)){if(o.willAccept(q)==="swap"){await o.save(async()=>{o.parent.swap(o,q)});return}await o.save(async()=>{v.type==="Field"&&typeof v.leaf=="string"&&(v.leaf=await i.showColumn(v.leaf)),o.accept(v,B?"below":"above")})}}),mt.cls("-drag-hover",s),Yy(t.content,Lo()),ji(o.type),ji("element"),f.attr("data-box-model",String(o.type)),f.maybe(n,()=>Zy()),f.maybe(t.showRemoveButton??!0,()=>[t.removeButton??f.maybe(x=>!t.editMode||!x(t.editMode),c)]),...e)}z();var Ki=mr("test-forms-"),sD=Ct("Columns"),ed=class extends Ve{constructor(){super(...arguments);S(this,"_columnCount",ue.create(this,r=>r(this.children).length))}removeChild(r){if(r.type==="Placeholder")return this.children.get().length<=1?void 0:super.removeChild(r);this.replace(r,yt())}accept(r){if(!this.parent)throw new Error("No parent");let o=r.id?this.root().find(r.id):null;return o?.parent===this?o:(o?.removeSelf(),this.append(r))}render(...r){let o=I.create(null,!1),n=Xy(f.autoDispose(o),Ki("content"),Qn("--css-columns-count",this._columnCount),f.forEach(this.children,i=>(i??Ve.new(yt(),this)).render(Ki("column"))),cw(Ki("add"),re("Plus"),f.on("click",async()=>{await this.save(()=>{this.placeAfterListChild()(yt())})}),Po.cls("-add-button"),Po.cls("-drag-over",o),f.on("dragleave",i=>{i.stopPropagation(),i.preventDefault(),o.set(!1)}),f.on("dragover",i=>{i.stopPropagation(),i.preventDefault(),i.dataTransfer.dropEffect="move",o.set(!0)})),...r);return fr({box:this,content:n})}async deleteSelf(){let o=Array.from(this.filter(n=>n instanceof Mo)).map(n=>n.leaf.get());await this.parent?.save(async()=>{o.length>0&&await this.view.viewSection.removeField(o),this.children.get().forEach(n=>{n.removeSelf()}),this.removeSelf()})}},td=class extends Ve{render(...e){let[r,o]=[this,this.view],n=new qe,i=ue.create(n,d=>r.parent?d(r.parent.children).indexOf(r):-1),s=ue.create(n,d=>{let h=d(i);if(h===null)return null;let x=d(r.children)[h];return x||null}),l=I.create(n,!1);return cw(Lo(),Ki("Placeholder"),Ki("element"),f.attr("data-box-model",String(r.type)),f.autoDispose(n),Po.cls("-drag-over",l),Po.cls("-empty",dr(s)),Po.cls("-selected",d=>d(o.selectedBox)===r),br({box:this,insertBox:c,customItems:[it(p,xt("Remove"),sD("Remove Column"))]}),f.on("contextmenu",d=>{d.stopPropagation()}),f.on("dragleave",d=>{d.stopPropagation(),d.preventDefault(),l.set(!1)}),f.on("dragover",d=>{d.stopPropagation(),d.preventDefault(),d.dataTransfer.dropEffect="move",l.set(!0)}),f.on("drop",d=>{d.stopPropagation(),d.preventDefault(),l.set(!1);let h=JSON.parse(d.dataTransfer.getData("text/plain")),x=h.id,B=r.root().find(x);if(B){for(let v of B.traverse())if(this===v)return}St(()=>{B?.removeSelf();let v=r.parent;v.replace(r,h),v.save().catch(reportError)})}),f.maybe(s,d=>d.render()),f.maybe(dr(s),()=>f("span","Colonne ",f.text(d=>String(d(i)+1)))),...e);function c(d){if(!r.parent)throw new Error("No parent");return r.parent.replace(r,d)}async function p(){await r.deleteSelf()}}};function yt(){return{id:Ne(),type:"Placeholder"}}function Wi(){return{id:Ne(),type:"Columns",children:[yt(),yt()]}}var cw=m("div",`
  position: relative;
  & * {
    /* Otherwise it will emit drag events that we want to ignore to avoid flickering */
    pointer-events: none;
  }
`);var rd={white:"#ffffff",black:"#000000",error:"#d0021b",errorLight:"#ff6666",warning:"#dd962c",warningLight:"#f9ae41",info:"#3b82f6",infoLight:"#87b2f9",logoBg:"#040404",logoSize:"22px 22px",fontFamily:`-apple-system,BlinkMacSystemFont,Segoe UI,Liberation Sans,
    Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol`,fontFamilyData:"Liberation Sans,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol",fontFamilyMono:"'Monaco','Menlo','Ubuntu Mono','Consolas','source-code-pro',monospace",xxsmallFontSize:"8px",xsmallFontSize:"10px",smallFontSize:"11px",mediumFontSize:"13px",introFontSize:"14px",largeFontSize:"16px",xlargeFontSize:"18px",xxlargeFontSize:"20px",xxxlargeFontSize:"22px",bigControlFontSize:"13px",headerControlFontSize:"22px",bigControlTextWeight:"500",headerControlTextWeight:"600",components:{text:a.body,lightText:a.secondary,darkText:a.emphasis,disabledText:a.secondary,dangerText:"#ffa500",pageBg:a.bgSecondary,mainPanelBg:a.bg,leftPanelBg:a.bgSecondary,rightPanelBg:a.bgSecondary,topHeaderBg:a.bg,bottomFooterBg:a.bg,pagePanelsBorder:a.bgTertiary,pagePanelsBorderResizing:a.primary,sidePanelOpenerFg:a.secondary,sidePanelOpenerActiveFg:a.white,sidePanelOpenerActiveBg:a.primary,addNewCircleFg:a.white,addNewCircleBg:a.primaryMuted,addNewCircleHoverBg:a.primaryDim,addNewCircleSmallFg:a.white,addNewCircleSmallBg:a.primary,addNewCircleSmallHoverBg:a.primaryMuted,topBarButtonPrimaryFg:a.primary,topBarButtonSecondaryFg:a.secondary,topBarButtonDisabledFg:a.decoration,notificationsPanelHeaderBg:a.bgSecondary,notificationsPanelBodyBg:a.bg,notificationsPanelBorder:a.decoration,toastBg:"#040404",toastLightText:a.secondary,toastText:a.white,toastMemoText:a.veryLight,toastErrorIcon:a.error,toastErrorBg:a.error,toastSuccessIcon:a.primaryMuted,toastSuccessBg:a.primaryMuted,toastWarningIcon:a.warningLight,toastWarningBg:a.warning,toastInfoIcon:a.info,toastInfoBg:a.info,toastInfoControlFg:a.infoLight,toastControlFg:a.primary,tooltipBg:"rgba(0, 0, 0, 0.75)",tooltipCloseButtonHoverFg:a.black,tooltipFg:a.white,tooltipIcon:a.secondary,tooltipCloseButtonFg:a.white,tooltipCloseButtonHoverBg:a.white,modalBackdrop:a.backdrop,modalBg:a.bg,modalBorder:a.decorationSecondary,modalBorderDark:a.decoration,modalBorderHover:a.secondary,modalCloseButtonFg:a.secondary,modalBackdropCloseButtonFg:a.primary,modalBackdropCloseButtonHoverFg:a.primaryEmphasis,popupBg:a.bg,popupSecondaryBg:a.bgSecondary,popupCloseButtonFg:a.secondary,progressBarFg:a.primary,progressBarBg:a.decoration,hover:a.bgTertiary,link:a.primary,linkHover:a.primary,cellEditorPlaceholderFg:a.secondary,cellEditorBg:a.bg,cursor:a.cursor,cursorInactive:a.cursorInactive,cursorReadonly:a.secondary,tableHeaderFg:a.emphasis,tableHeaderSelectedFg:a.emphasis,tableHeaderBg:a.bgSecondary,tableBodyBg:a.bg,tableBodyBorder:a.decoration,tableCellSummaryBg:a.bgTertiary,cardCompactRecordBg:a.bg,cardFormLabel:a.secondary,cardCompactLabel:a.secondary,cardBlocksLabel:a.secondary,cardCompactBorder:a.decoration,cardEditingLayoutBorder:a.decoration,cardListFormBorder:a.decoration,cardListBlocksBorder:a.decoration,selectionOpaqueFg:a.emphasis,widgetBg:a.bg,widgetBorder:a.decoration,widgetActiveBorder:a.primary,widgetActiveNonFocusedBorder:a.primaryTranslucent,widgetInactiveStripesLight:a.bgSecondary,pinnedDocFooterBg:a.bg,pinnedDocBorder:a.bgTertiary,pinnedDocBorderHover:a.secondary,pinnedDocEditorBg:a.bgTertiary,rawDataTableBorder:a.bgTertiary,rawDataTableBorderHover:a.secondary,controlFg:a.primary,controlPrimaryFg:a.white,controlPrimaryBg:a.primary,controlPrimaryHoverBg:a.primaryMuted,controlSecondaryFg:a.secondary,controlSecondaryDisabledFg:a.decoration,controlSecondaryHoverFg:a.body,controlSecondaryHoverBg:a.decorationSecondary,controlDangerFg:a.error,checkboxBg:a.bg,checkboxSelectedFg:a.primary,checkboxDisabledBg:a.decoration,checkboxBorder:a.decoration,moveDocsSelectedFg:a.white,moveDocsSelectedBg:a.primary,moveDocsDisabledFg:a.decoration,filterBarButtonSavedFg:a.white,filterBarButtonSavedHoverBg:a.decoration,iconDisabled:a.secondary,iconButtonFg:a.white,iconButtonPrimaryBg:a.primary,iconButtonSecondaryBg:a.decoration,iconButtonSecondaryHoverBg:a.secondary,activePageFg:a.veryLight,activePageBg:a.bgEmphasis,pageOptionsFg:a.secondary,pageOptionsHoverFg:a.white,pageOptionsHoverBg:a.decoration,pageOptionsSelectedHoverBg:a.secondary,pageInitialsFg:a.white,rightPanelTabFg:a.secondary,rightPanelTabBg:a.bg,rightPanelTabIcon:a.secondary,rightPanelTabIconHover:a.body,rightPanelTabBorder:a.bgTertiary,rightPanelTabHoverBg:a.bg,rightPanelTabHoverFg:a.body,rightPanelTabSelectedFg:a.body,rightPanelTabSelectedBg:a.bgSecondary,rightPanelTabSelectedIcon:a.primary,rightPanelSubtabFg:a.secondary,rightPanelSubtabHoverFg:a.body,rightPanelSubtabSelectedFg:a.body,rightPanelSubtabSelectedUnderline:a.primary,rightPanelDisabledOverlay:a.bgSecondary,rightPanelCustomWidgetButtonFg:a.body,rightPanelCustomWidgetButtonBg:a.decoration,documentHistorySnapshotFg:a.body,documentHistorySnapshotSelectedFg:a.veryLight,documentHistorySnapshotBg:a.bg,documentHistorySnapshotSelectedBg:a.bgEmphasis,documentHistoryActivityText:a.body,documentHistoryActivityLightText:a.secondary,documentHistoryTableHeaderFg:a.emphasis,documentHistoryTableBorderLight:a.decoration,accentIcon:a.primary,accentBorder:a.primary,accentText:a.primary,inputFg:a.emphasis,inputBg:a.bg,inputDisabledFg:a.secondary,inputDisabledBg:a.bgSecondary,inputPlaceholderFg:a.secondary,inputBorder:a.decoration,inputValid:a.primary,inputFocus:"#5e9ed6",inputReadonlyBg:a.bgSecondary,choiceTokenFg:a.emphasis,choiceTokenBlankFg:a.secondary,choiceTokenSelectedBorder:a.primary,choiceTokenInvalidFg:a.emphasis,choiceTokenInvalidBorder:a.error,choiceEntryBg:a.bg,choiceEntryBorder:a.decoration,selectButtonFg:a.body,selectButtonPlaceholderFg:a.secondary,selectButtonBg:a.bg,selectButtonBorder:a.decoration,menuText:a.secondary,menuLightText:a.secondary,menuBg:a.bg,menuSubheaderFg:a.body,menuItemFg:a.emphasis,menuItemSelectedFg:a.white,menuItemSelectedBg:a.primary,menuItemDisabledFg:a.decoration,menuItemIconFg:a.secondary,menuItemIconSelectedFg:a.white,autocompleteMatchText:a.primary,autocompleteAddNewCircleFg:a.white,autocompleteAddNewCircleBg:a.primary,autocompleteAddNewCircleSelectedBg:a.primaryMuted,autocompleteSelectedMatchText:a.primaryEmphasis,searchPrevNextButtonFg:a.secondary,loaderFg:a.primary,loaderBg:a.decoration,siteSwitcherActiveFg:a.white,docMenuDocOptionsFg:a.decoration,docMenuDocOptionsHoverFg:a.secondary,docMenuDocOptionsHoverBg:a.decoration,shortcutKeyFg:a.emphasis,shortcutKeySecondaryFg:a.secondary,shortcutKeyBg:a.bg,shortcutKeyBorder:a.secondary,breadcrumbsTagFg:a.white,breadcrumbsTagAlertBg:a.error,widgetPickerItemSelectedBg:a.bgTertiary,widgetPickerItemDisabledBg:a.bgTertiary,widgetPickerPrimaryBg:a.bg,widgetPickerSecondaryBg:a.bgSecondary,widgetPickerIcon:a.secondary,widgetPickerPrimaryIcon:a.primary,widgetPickerBorder:a.bgTertiary,importerActiveFileBg:a.primary,importerTableInfoBorder:a.decoration,importerPreviewBorder:a.decoration,importerMatchIcon:a.decoration,importerSkippedTableOverlay:a.bgTertiary,importerActiveFileFg:a.white,importerInactiveFileFg:a.white,menuToggleFg:a.secondary,menuToggleBg:a.bg,menuToggleBorder:a.secondary,infoButtonFg:"#8f8f8f",infoButtonHoverFg:"#707070",infoButtonActiveFg:"#5c5c5c",buttonGroupBg:a.bg,buttonGroupFg:a.body,buttonGroupLightBg:a.bgSecondary,buttonGroupLightFg:a.secondary,buttonGroupIcon:a.secondary,buttonGroupBorder:a.decoration,buttonGroupSelectedFg:a.body,buttonGroupLightSelectedFg:a.primary,buttonGroupLightSelectedBg:a.selectionOpaque,buttonGroupSelectedBg:a.selectionOpaque,buttonGroupSelectedBorder:a.primary,accessRulesTableHeaderFg:a.body,accessRulesTableHeaderBg:a.bgTertiary,accessRulesTableBodyFg:a.secondary,accessRulesTableBodyLightFg:a.decoration,accessRulesTableBorder:a.secondary,accessRulesColumnListBorder:a.decoration,accessRulesColumnItemFg:a.body,accessRulesColumnItemIconFg:a.secondary,accessRulesColumnItemIconHoverFg:a.veryLight,accessRulesColumnItemIconHoverBg:a.secondary,accessRulesColumnItemBg:a.decorationSecondary,accessRulesFormulaEditorBg:a.bg,accessRulesFormulaEditorBgDisabled:a.decorationSecondary,accessRulesFormulaEditorBorderHover:a.decoration,accessRulesFormulaEditorFocus:a.primary,cellFg:a.emphasis,cellBg:a.bg,chartBg:a.bg,commentsPopupHeaderBg:a.bgSecondary,commentsPopupBodyBg:a.bg,commentsPopupBorder:a.decoration,commentsPanelTopicBg:a.bg,datePickerTodayFg:a.white,datePickerTodayBg:a.primary,datePickerTodayBgHover:a.primaryMuted,tutorialsPopupBorder:a.decoration,tutorialsPopupHeaderFg:a.white,aceAutocompleteLink:a.primary,aceEditorBg:a.bg,aceAutocompleteHighlightedFg:a.emphasis,colorSelectBg:a.bg,colorSelectFontOptionFg:a.body,colorSelectFontOptionFgSelected:a.veryLight,colorSelectFontOptionBgSelected:a.bgEmphasis,colorSelectColorSquareBorderEmpty:a.body,colorSelectInputFg:a.secondary,colorSelectInputBg:a.bg,colorSelectInputBorder:a.decoration,highlightedCodeFg:a.secondary,highlightedCodeBorder:a.decoration,loginPageBg:a.bg,loginPageGoogleButtonBorder:a.decoration,formulaAssistantHeaderBg:a.bgSecondary,formulaAssistantBorder:a.decoration,formulaAssistantPreformattedTextBg:a.bgSecondary,attachmentsEditorButtonHoverFg:a.primary,attachmentsEditorButtonBorder:a.decoration,attachmentsEditorButtonIcon:a.secondary,announcementPopupFg:a.emphasis,switchInactiveSlider:a.bgSecondary,switchInactivePill:a.secondary,switchActiveSlider:a.primaryMuted,switchActivePill:a.bg,switchHoverShadow:tt.switchActiveSlider,widgetGalleryBorderSelected:a.primary,widgetGalleryBgHover:a.bgSecondary,widgetGallerySecondaryHeaderFg:a.white,appHeaderBg:a.bg,cardButtonBorderSelected:a.primary,cardButtonShadow:"rgba(0,0,0,0.1)",formulaIcon:"#D0D0D0",textButtonHoverBg:"transparent",textButtonHoverBorder:"transparent",kbFocusHighlight:a.primary}};var uw={...rd,body:"#262633",emphasis:a.black,veryLight:a.white,bg:a.white,bgSecondary:"#f7f7f7",bgTertiary:"rgba(217,217,217,0.6)",bgEmphasis:"#262633",bgWarningSubtle:"#fff6e6",borderWarningSubtle:"#e9e2a8",decoration:"#d9d9d9",decorationSecondary:"#e8e8e8",decorationTertiary:"#d9d9d9",primary:"#16b378",primaryMuted:"#009058",primaryDim:"#007548",primaryEmphasis:"#b1ffe2",primaryTranslucent:"rgba(22, 179, 120, 0.5)",secondary:"#929299",secondaryMuted:"#777777",controlBorderRadius:"4px",cursor:a.primary,cursorInactive:"#a2e1c9",selection:"rgba(22,179,120,0.15)",selectionOpaque:"#dcf4eb",selectionDarkerOpaque:"#d6eee5",selectionDarker:"rgba(22,179,120,0.25)",selectionDarkest:"rgba(22,179,120,0.35)",hover:"#bfbfbf",backdrop:"rgba(38,38,51,0.9)",components:{...rd.components,mediumText:"#494949",errorText:a.error,errorTextHover:"#a10000",pageBackdrop:"#808080",topBarButtonErrorFg:a.error,toastMemoBg:a.bgEmphasis,modalInnerShadow:"rgba(31,37,50,0.31)",modalOuterShadow:"rgba(76,86,103,0.24)",popupInnerShadow:"rgba(31,37,50,0.31)",popupOuterShadow:"rgba(76,86,103,0.24)",promptFg:"#606060",progressBarErrorFg:a.error,lightHover:a.bgSecondary,cellEditorFg:a.body,tableHeaderSelectedBg:a.decorationSecondary,tableHeaderBorder:"lightgrey",tableAddNewBg:"inherit",tableScrollShadow:"#444444",tableFrozenColumnsBorder:"#999999",tableDragDropIndicator:"#808080",tableDragDropShadow:"#f0f0f0",cardCompactWidgetBg:a.bgTertiary,cardBlocksBg:a.bgTertiary,cardFormBorder:"lightgrey",cardEditingLayoutBg:"rgba(192,192,192,0.2)",selection:a.selection,selectionDarker:a.selectionDarker,selectionDarkest:a.selectionDarkest,selectionOpaqueBg:a.selectionOpaque,selectionOpaqueDarkBg:a.selectionDarkerOpaque,selectionHeader:a.bgTertiary,widgetInactiveStripesDark:a.decorationSecondary,controlHoverFg:a.primaryMuted,controlDisabledFg:a.white,controlDisabledBg:a.secondary,controlBorder:"1px solid #11B683",checkboxBorderHover:a.hover,filterBarButtonSavedBg:a.secondary,iconError:a.error,iconButtonPrimaryHoverBg:a.primaryMuted,pageHoverBg:a.bgTertiary,disabledPageFg:"#bdbdbd",pageInitialsBg:a.secondary,pageInitialsEmojiOutline:"#bdbdbd",pageInitialsEmojiBg:a.white,rightPanelTabButtonHoverBg:a.primaryMuted,rightPanelSubtabFg:"#707070",rightPanelFieldSettingsBg:a.decorationSecondary,rightPanelFieldSettingsButtonBg:"lightgrey",documentHistorySnapshotBorder:a.bgTertiary,documentHistoryTableBorder:"lightgrey",inputInvalid:a.error,inputReadonlyBorder:a.decorationSecondary,choiceTokenBg:a.decorationSecondary,choiceTokenSelectedBg:a.decoration,choiceTokenInvalidBg:a.white,choiceEntryBorderHover:a.hover,selectButtonBorderInvalid:a.error,menuBorder:a.decorationSecondary,menuShadow:"rgba(38,38,51,0.6)",autocompleteItemSelectedBg:a.decorationSecondary,searchBorder:"#808080",searchPrevNextButtonBg:a.bgTertiary,siteSwitcherActiveBg:a.bgEmphasis,shortcutKeyPrimaryFg:a.primaryMuted,breadcrumbsTagBg:a.secondary,widgetPickerItemFg:a.body,widgetPickerSummaryIcon:a.primaryMuted,widgetPickerShadow:"rgba(38,38,51,0.20)",codeViewText:"#444444",codeViewKeyword:"#444444",codeViewComment:"#888888",codeViewMeta:"#1f7199",codeViewTitle:"#880000",codeViewParams:"#444444",codeViewString:"#880000",codeViewNumber:"#880000",codeViewBuiltin:"#397300",codeViewLiteral:"#78a960",importerOutsideBg:a.bgSecondary,importerMainContentBg:a.bg,importerInactiveFileBg:a.bgTertiary,menuToggleHoverFg:a.primaryMuted,menuToggleActiveFg:a.primaryDim,buttonGroupBgHover:a.bgSecondary,buttonGroupBorderHover:a.hover,cellZebraBg:"#f8f8f8",chartFg:"#444444",chartLegendBg:"#ffffff80",chartXAxis:"#444444",chartYAxis:"#444444",commentsUserNameFg:"#494949",commentsPanelTopicBorder:"#cccccc",commentsPanelResolvedTopicBg:"#f0f0f0",datePickerSelectedFg:a.body,datePickerSelectedBg:a.decoration,datePickerSelectedBgHover:"#cfcfcf",datePickerRangeStartEndBg:a.decoration,datePickerRangeStartEndBgHover:"#cfcfcf",datePickerRangeBg:"#eeeeee",datePickerRangeBgHover:a.decoration,tutorialsPopupBoxBg:"#f5f5f5",tutorialsPopupCodeFg:"#333333",tutorialsPopupCodeBg:a.bg,tutorialsPopupCodeBorder:"#e1e4e5",aceAutocompletePrimaryFg:"#444444",aceAutocompleteSecondaryFg:"#8f8f8f",aceAutocompleteBg:"#fbfbfb",aceAutocompleteBorder:"lightgrey",aceAutocompleteLinkHighlighted:"#009058",aceAutocompleteActiveLineBg:"#cad6fa",aceAutocompleteLineBorderHover:"#abbffe",aceAutocompleteLineBgHover:"rgba(233,233,253,0.4)",colorSelectFg:a.body,colorSelectShadow:"rgba(38,38,51,0.6)",colorSelectFontOptionsBorder:a.decoration,colorSelectFontOptionBgHover:a.decoration,colorSelectColorSquareBorder:a.decoration,highlightedCodeBlockBg:a.bg,highlightedCodeBlockBgDisabled:a.decorationSecondary,highlightedCodeBgDisabled:a.decorationSecondary,loginPageBackdrop:"#f5f8fa",loginPageLine:a.bgSecondary,loginPageGoogleButtonFg:a.body,loginPageGoogleButtonBg:a.bgSecondary,loginPageGoogleButtonBgHover:a.decorationSecondary,attachmentsEditorButtonFg:a.primaryMuted,attachmentsEditorButtonBg:a.white,attachmentsEditorButtonHoverBg:a.decorationSecondary,attachmentsEditorBorder:a.decorationSecondary,attachmentsCellIconFg:a.white,attachmentsCellIconBg:a.decoration,attachmentsCellIconHoverBg:a.secondary,announcementPopupBg:a.selectionOpaque,scrollShadow:a.bgTertiary,toggleCheckboxFg:"#606060",numericSpinnerFg:"#606060",widgetGalleryBorder:a.decoration,widgetGalleryShadow:"rgba(0,0,0,0.1)",widgetGallerySecondaryHeaderBg:a.secondary,widgetGallerySecondaryHeaderBgHover:"#7e7e85",markdownCellLightBg:a.bgSecondary,markdownCellLightBorder:a.decorationSecondary,markdownCellMediumBorder:a.decoration,appHeaderBorder:a.decorationSecondary,appHeaderBorderHover:"#b0b0b0",cardButtonBorder:a.decoration}};z();z();var Xa=class extends Me{constructor(r,o,n){super();this._onSave=o;this._onDone=n;this.viewSection={hasFocus:I.create(this,!0),hasRegionFocus:I.create(this,!0)};this.gristDoc=null;let i=I.create(this,null);this.selectedBox=ue.create(this,p=>p(i));let s=_t.create(this);this.selectedBox.onWrite(p=>{let d=qe.create(s);if(!p){i.set(null);return}if(p.isDisposed())throw new Error("Box is disposed");i.set(p),d.autoDispose(p.onDispose(()=>{i.get()===p&&i.set(null)}))}),this._root=this.autoDispose(new Ds(r,null,async p=>{p&&await p(),await this.save()},this));let l={copy:()=>{this.selectedBox.get()?.copySelf().catch(Ut)},cut:()=>{this.selectedBox.get()?.cutSelf().catch(Ut)},paste:()=>{(async()=>{let d=Ps(await navigator.clipboard.readText());if(!d)return;this.selectedBox.get()?this.selectedBox.set(this.selectedBox.get().insertBefore(d)):this.selectedBox.set(this._root.insert(d,0));let h=this._root.find(d.id);h?.cut.get()&&h.removeSelf(),await this._root.save(),await navigator.clipboard.writeText("")})().catch(Ut)},nextField:()=>this._step(1),prevField:()=>this._step(-1),edit:()=>{this.selectedBox.get()?.edit?.set(!0)},clearValues:()=>{let p=this.selectedBox.get();!p||p.canRemove?.()===!1||(l.nextField(),p.deleteSelf().catch(Ut))},insertFieldBefore:p=>this._insert(p,d=>d.placeBeforeMe()),insertField:p=>this._insert(p,d=>d.placeAfterListChild()),insertFieldAfter:p=>this._insert(p,d=>d.placeAfterMe())};ff({...l,contextMenuCopy:l.copy,contextMenuCut:l.cut,contextMenuPaste:l.paste,cursorDown:l.nextField,cursorUp:l.prevField,editField:l.edit,deleteFields:l.clearValues},this,this.viewSection.hasRegionFocus);let c=p=>{if(p.target.closest("input, textarea, select, [contenteditable]"))return;let h=p.ctrlKey||p.metaKey,x=B=>{p.preventDefault(),Le[B].run()};h&&p.key==="c"?x("copy"):h&&p.key==="x"?x("cut"):h&&p.key==="v"?x("paste"):p.key==="ArrowDown"?x("cursorDown"):p.key==="ArrowUp"?x("cursorUp"):p.key==="Delete"||p.key==="Backspace"?x("deleteFields"):p.key==="Enter"&&this.selectedBox.get()?x("editField"):p.key==="Escape"&&this.selectedBox.set(null)};document.addEventListener("keydown",c),this.onDispose(()=>document.removeEventListener("keydown",c))}newElement(r){return"button"in r?Gi(r.button):Ui(r.structure)}async save(){this._onSave(this._root.toJSON())}buildDom(){return aD(lD(cD("Modification du hub"),uD("Cliquez sur un bloc pour le s\xE9lectionner, glissez-le pour le d\xE9placer, clic droit pour plus d'actions."),aa("Termin\xE9",f.on("click",()=>this._onDone()),f.cls("test-hub-done"))),pD(Wy(tv(ev(dD(jy(f("div",f.forEach(this._root.children,r=>r?r.render():f("div","?"))),fD(si(ga(ha("Plus"),br({view:this,insertBox:r=>this._root.append(r)})))))))),f.on("click",()=>this.selectedBox.set(null))),f.domComputed(this.selectedBox,r=>r instanceof Vi?this._buildButtonPanel(r):null)))}_step(r){let o=[...this._root.traverse()];if(!o.length)return;let n=this.selectedBox.get(),i=n?o.indexOf(n)+r:r>0?0:o.length-1;this.selectedBox.set(o[(i+o.length)%o.length])}_insert(r,o){let n=this.selectedBox.get();n&&(this.selectedBox.set(o(n)(this.newElement(r))),this.save().catch(Ut))}_buildButtonPanel(r){let o=d=>r.prop(d),n=()=>r.save().catch(Ut),i=qe.create(null),s=o("kind"),l=ue.create(i,d=>d(Ae.pages).map(h=>({value:h.id,label:h.name}))),c=ue.create(i,d=>d(Ae.forms).map(h=>({value:h.id,label:h.name}))),p=d=>d.addListener(n);return["kind","page","form","icon","color"].forEach(d=>i.autoDispose(p(o(d)))),mD(f.autoDispose(i),f.on("click",d=>d.stopPropagation()),gD("Bouton"),Yi("Destination"),Ua(s,[{value:"page",label:"Une page du document",icon:"Page"},{value:"form",label:"Un formulaire",icon:"Pencil"},{value:"url",label:"Un site web",icon:"World"}]),f.domComputed(s,d=>d==="url"?ra(o("url"),{placeholder:"www.exemple.fr"},f.on("change",n),f.cls("test-hub-url")):d==="form"?Ua(o("form"),c,{defaultLabel:"Choisir un formulaire"}):Ua(o("page"),l,{defaultLabel:"Choisir une page"})),Yi("Texte du bouton"),ra(o("label"),{placeholder:"Nom de la destination"},f.on("change",n),f.cls("test-hub-label")),Yi("Description"),ra(o("description"),{placeholder:"Facultatif"},f.on("change",n)),Yi("Ic\xF4ne"),hD(rw.map(d=>pw(re(d),pw.cls("-selected",h=>h(o("icon"))===d),f.attr("title",d),f.on("click",()=>o("icon").set(d))))),Yi("Couleur"),bD(Ka.map(d=>dw(f.style("background",d.bg),f.attr("title",d.label),dw.cls("-selected",h=>h(o("color"))===d.id),f.on("click",()=>o("color").set(d.id)))),xD(f.style("background",d=>/^#/.test(d(o("color"))||"")?d(o("color")):""),f("input",{type:"color",title:"Couleur personnalis\xE9e"},f.prop("value",d=>Ya(d(o("color"))).bg),f.on("input",(d,h)=>o("color").set(h.value))))),yD(sa("Supprimer le bouton",f.on("click",()=>r.deleteSelf().catch(Ut)))))}},aD=m("div",`
  display: flex;
  flex-direction: column;
  height: 100%;
  color: ${g.text};
`),lD=m("div",`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-bottom: 1px solid ${g.menuBorder};
  background: ${g.mainPanelBg};
`),cD=m("div","font-weight: 600;"),uD=m("div",`flex: 1; color: ${g.lightText}; font-size: 12px;`),pD=m("div",`
  flex: 1;
  min-height: 0;
  display: flex;
  & > :first-child { flex: 1; min-width: 0; overflow: auto; }
`),dD=m("div",`
  & > div { width: 100%; max-width: 960px; }
`),fD=m("div",`
  position: relative;
  height: 48px;
  & > div { opacity: 1; }
`),mD=m("div",`
  flex: none;
  width: 300px;
  overflow: auto;
  padding: 16px;
  border-left: 1px solid ${g.menuBorder};
  background: ${g.mainPanelBg};
  display: flex;
  flex-direction: column;
  gap: 8px;
`),gD=m("div",`
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${g.lightText};
`),Yi=m("div",`
  margin-top: 8px;
  font-size: 12px;
  font-weight: 600;
`),hD=m("div",`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
`),pw=m("div",`
  display: grid;
  place-items: center;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid transparent;
  &:hover { background: ${g.hover}; }
  &-selected { border-color: ${g.controlFg}; background: ${g.hover}; }
`),bD=m("div",`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`),dw=m("div",`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 0 1px ${g.menuBorder};
  &-selected { box-shadow: 0 0 0 2px ${g.mainPanelBg}, 0 0 0 4px ${g.controlFg}; }
`),xD=m("label",`
  position: relative;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  background: conic-gradient(#EF8C8C, #F9D45C, #88BF4D, #98D9D9, #509EE3, #A989C5, #EF8C8C);
  box-shadow: 0 0 0 1px ${g.menuBorder};
  & input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
`),yD=m("div","margin-top: 16px;");z();var Yr=m("div",`
  &-required::after {
    content: "*";
    color: ${C.primaryBg};
    margin-left: 4px;
  }
`),od=m("div",`
  overflow-wrap: break-word;
  position: relative;
  clip-path: inset(0px);

  &-alignment-left {
    text-align: left;
  }
  &-alignment-center {
    text-align: center;
  }
  &-alignment-right {
    text-align: right;
  }
`),fw=m("div",`
  border-radius: 3px;
  border: 1px solid ${V.darkGrey};
  padding: 24px;
  margin-top: 12px;
  margin-bottom: 24px;

  & > div + div {
    margin-top: 8px;
    margin-bottom: 12px;
  }
`),mw=m("div",`
  display: grid;
  grid-template-columns: repeat(var(--grist-columns-count), 1fr);
  gap: 16px;
`),gw=m("div",`
  margin-top: 16px;
  display: flex;
  justify-content: center;
  column-gap: 8px;
`),hw=m("button",`
  line-height: inherit;
  font-size: ${C.mediumFontSize};
  padding: 10px 24px;
  cursor: pointer;
  background-color: transparent;
  color: ${C.primaryBg};
  border: 1px solid ${C.primaryBg};
  border-radius: 4px;
  outline-color: ${C.primaryBgHover};

  &:hover {
    color: ${C.primaryBgHover};
    border-color: ${C.primaryBgHover};
  }
  &[data-disabled="true"] {
    cursor: not-allowed;
    color: ${V.light};
    background-color: ${V.slate};
    border-color: ${V.slate};
  }
`),bw=m("div",`
  display: flex;
  justify-content: center;
  align-items: center;

  & button[type="submit"] {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    background-color: ${C.primaryBg};
    border: 1px solid ${C.primaryBg};
    color: white;
    padding: 10px 24px;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
    line-height: inherit;
    outline-color: ${C.primaryBgHover};
  }
  & button[type="submit"]:hover {
    border-color: ${C.primaryBgHover};
    background-color: ${C.primaryBgHover};
  }
  & button[type="submit"][data-disabled="true"] {
    cursor: not-allowed;
    color: ${V.light};
    background-color: ${V.slate};
    border-color: ${V.slate};
  }
`),nd=m("div",`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;

  & > .${Yr.className} {
    color: ${V.dark};
    font-size: 13px;
    font-style: normal;
    font-weight: 700;
    line-height: 16px; /* 145.455% */
    margin-top: 8px;
    margin-bottom: 8px;
    display: block;
    overflow-wrap: break-word;
  }
`),xw=m("div",`
  margin-top: 16px;
  text-align: center;
  color: ${V.error};
  min-height: 22px;
`),id=m("input",`
  color: ${V.dark};
  background-color: ${V.light};
  height: 29px;
  width: 100%;
  font-size: 13px;
  line-height: inherit;
  padding: 4px 8px;
  border: 1px solid ${V.darkGrey};
  border-radius: 3px;
  outline-color: ${C.primaryBgHover};
`),yw=m("textarea",`
  display: block;
  color: ${V.dark};
  background-color: ${V.light};
  min-height: 29px;
  width: 100%;
  font-size: 13px;
  line-height: inherit;
  padding: 4px 8px;
  border: 1px solid ${V.darkGrey};
  border-radius: 3px;
  outline-color: ${C.primaryBgHover};
  resize: none;
`),Ja=m("input",`
  -webkit-appearance: none;
  -moz-appearance: none;
  margin: 0;
  padding: 0;
  flex-shrink: 0;
  display: inline-block;
  width: 16px;
  height: 16px;
  --radius: 3px;
  position: relative;
  margin-right: 8px;
  vertical-align: baseline;

  &:focus {
    outline-color: ${C.primaryBgHover};
  }
  &:checked:enabled, &:indeterminate:enabled {
    --color: ${C.primaryBg};
  }
  &:disabled {
    --color: ${V.darkGrey};
    cursor: not-allowed;
  }
  &::before, &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 16px;
    width: 16px;
    box-sizing: border-box;
    border: 1px solid var(--color, ${V.darkGrey});
    border-radius: var(--radius);
  }
  &:checked::before, &:disabled::before, &:indeterminate::before {
    background-color: var(--color);
  }
  &:not(:checked):indeterminate::after {
    -webkit-mask-image: var(--icon-Minus);
  }
  &:not(:disabled)::after {
    background-color: ${V.light};
  }
  &:checked::after, &:indeterminate::after {
    content: '';
    position: absolute;
    height: 16px;
    width: 16px;
    -webkit-mask-image: var(--icon-Tick);
    -webkit-mask-size: contain;
    -webkit-mask-position: center;
    -webkit-mask-repeat: no-repeat;
    background-color: ${V.light};
  }
`),vw=m(ua,`
  & input {
    height: 29px;
    border: none;
    font-size: 13px;
    line-height: inherit;
  }

  &:focus-within {
    outline: 2px solid ${C.primaryBgHover};
  }
`),ww=m("label",`
  position: relative;
  display: inline-flex;
  margin-top: 8px;

  &:hover {
    --color: ${V.hover};
  }
`),Tw=m("span",`
  font-size: 13px;
  font-weight: 700;
  line-height: 16px;
  overflow-wrap: anywhere;
`),Xo=m("div",`
  display: inline-flex;
  flex-direction: column;
  gap: 8px;

  &-horizontal {
    flex-direction: row;
    flex-wrap: wrap;
    column-gap: 16px;
  }
`),sd=m("label",`
  display: flex;
  font-size: 13px;
  line-height: 16px;
  gap: 8px;
  overflow-wrap: anywhere;

  & input {
    margin: 0px !important;
  }
  &:hover {
    --color: ${V.hover};
  }
`),Zi=Xo,ad=m("label",`
  position: relative;
  display: inline-flex;
  gap: 8px;
  font-size: 13px;
  line-height: 16px;
  font-weight: normal;
  min-width: 0px;
  outline-color: ${C.primaryBgHover};
  overflow-wrap: anywhere;

  & input {
    flex-shrink: 0;
    appearance: none;
    width: 16px;
    height: 16px;
    margin: 0px;
    border-radius: 50%;
    background-clip: content-box;
    border: 1px solid ${V.darkGrey};
    background-color: transparent;
    outline-color: ${C.primaryBgHover};
  }
  & input:hover {
    border: 1px solid ${V.hover};
  }
  & input:checked {
    padding: 2px;
    background-color: ${C.primaryBg};
    border: 1px solid ${C.primaryBg};
  }
`),ld=m("div",`
  position: relative;
`),cd=m("select",`
  position: absolute;
  padding: 4px 8px;
  border-radius: 3px;
  border: 1px solid ${V.darkGrey};
  font-size: 13px;
  outline: none;
  background: white;
  line-height: inherit;
  height: 29px;
  flex: auto;
  width: 100%;

  @media ${tg} {
    & {
      outline: revert;
      outline-color: ${C.primaryBgHover};
      position: relative;
    }
  }
`),ud=m("div",`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  padding: 4px 8px;
  border-radius: 3px;
  outline: 1px solid ${V.darkGrey};
  font-size: 13px;
  background: white;
  line-height: inherit;
  height: 29px;
  flex: auto;
  width: 100%;

  select:focus + & {
    outline: 2px solid ${C.primaryBgHover};
  }
`),pd=m("div","flex: 1"),dd=m(re,`
  flex-shrink: 0;
`),fd=m(Co,`
  flex-shrink: 0;
  cursor: pointer;
`),kw=m("input",`
  display: flex;
  flex-wrap: wrap;
  white-space: pre-wrap;
  position: relative;
  width: 100%;

  &:focus {
    outline-color: ${C.primaryBgHover};
  }

  &::file-selector-button, &::-webkit-file-upload-button {
    background-color: ${C.primaryBg};
    border: 1px solid ${C.primaryBg};
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
    line-height: inherit;
    outline-color: ${C.primaryBgHover};
  }

  &::file-selector-button:hover, &::-webkit-file-upload-button:hover {
    border-color: ${C.primaryBgHover};
    background-color: ${C.primaryBgHover};
  }

  &::file-selector-button:disabled, &::-webkit-file-upload-button:disabled {
    cursor: not-allowed;
    color: ${V.light};
    background-color: ${V.slate};
    border-color: ${V.slate};
  }
`),Bw=m(Yu,`
  width: 1em;
  height: 1em;
  line-height: inherit;
  border-radius: 50%;
  border-width: 1px;
  margin-bottom: 1px;
  --loader-fg: currentColor;
`);var wD=[],TD=typeof window<"u"?window:{};function kD(...t){let e={neededNames:t,globals:{}};return BD(e),wD.push(e),e.globals}var _w=kD;function BD(t){for(let e of t.neededNames)t.globals[e]=TD[e]}function md(t){return 30}function gd(...t){return null}function Sw(t,e,r){window.confirm(t)&&r()}z();function Ew(...t){return f("input",{type:"checkbox"})}z();var Kt=Sr("test-form-"),Je=Ct("FormRenderer"),Fw=_w("window");var De=class t extends Me{constructor(r,o,n){super();this.layoutNode=r;this.context=o;this.parent=n;S(this,"children");this.children=(this.layoutNode.children??[]).map(i=>this.autoDispose(t.new(i,this.context,this)))}static new(r,o,n){let i=SD[r.type]??Jo;return new i(r,o,n)}reset(){this.children.forEach(r=>r.reset())}},hd=class extends De{render(){return Yr(this.layoutNode.text??"")}},Jo=class extends De{render(){return od(od.cls(`-alignment-${this.layoutNode.alignment||"left"}`),Ru(this.layoutNode.text||""))}},bd=class extends De{render(){return fw(this.children.map(e=>e.render()))}},xd=class extends De{render(){return mw({style:`--grist-columns-count: ${this._getColumnsCount()}`},this.children.map(e=>e.render()))}_getColumnsCount(){return this.children.length||1}},yd=class extends De{render(){return[xw(f.text(e=>e(this.context.error)??"")),gw(hw(Je("Reset"),f.attr("data-disabled",e=>e(this.context.disabled)?"true":"false"),{type:"button"},f.on("click",e=>this.context.disabled.get()?e.preventDefault():Sw(Je("Are you sure you want to reset your form?"),Je("Reset"),()=>this.parent?.reset())),Kt("reset")),bw(f("button",f.attr("data-disabled",e=>e(this.context.disabled)?"true":"false"),{type:"submit"},f.domComputed(e=>e(this.context.disabled)?[Bw(),Je("Submitting\u2026")]:this.context.rootLayoutNode.submitText||Je("Submit")),f.on("click",e=>this.context.disabled.get()?e.preventDefault():ED()))))]}},vd=class extends De{render(){return f("div")}},wd=class extends De{render(){return this.children.map(e=>e.render())}},Td=class extends De{constructor(r,o){super(r,o);S(this,"renderer");let n=this.layoutNode.leaf?this.context.fields[this.layoutNode.leaf]:null;if(!n)throw new Error;let i=_D[n.type]??Qo;this.renderer=this.autoDispose(new i(n,o))}render(){return this.renderer.render()}reset(){this.renderer.resetInput()}},Dt=class extends Me{constructor(r,o){super();this.field=r;this.context=o}render(){return nd(f.hide(this.field.options.formIsHidden||!1),this.label(),f("div",this.input()),this.fieldDomAttributes(),Kt("field"))}name(){return this.field.colId}id(){return this.name().replace(/\s+/g,"-")}label(){return f("label",Yr.cls(""),Yr.cls("-required",!!this.field.options.formRequired),{for:this.name(),id:`${this.id()}-label`},this.field.question)}fieldDomAttributes(){return{}}getInitialValue(){return this.field.options.formAcceptFromUrl&&Fw.window.location.search?new URLSearchParams(window.location.search).get(this.field.colId):null}getInitialValueList(){return this.field.options.formAcceptFromUrl&&Fw.window.location.search?new URLSearchParams(window.location.search).getAll(this.field.colId):[]}},Qo=class extends Dt{constructor(){super(...arguments);S(this,"inputType","text");S(this,"_format",this.field.options.formTextFormat??"singleline");S(this,"_lineCount",String(this.field.options.formTextLineCount||3));S(this,"_value",I.create(this,this.getInitialValue()??""))}input(){let r;return this._format==="singleline"?r=this._renderSingleLineInput():r=this._renderMultiLineInput(),r}resetInput(){this._value.setAndTrigger(this.getInitialValue()??"")}_renderSingleLineInput(){return id({type:this.inputType,name:this.name(),id:this.id(),required:this.field.options.formRequired},f.prop("value",this._value),vt())}_renderMultiLineInput(){return yw({name:this.name(),id:this.id(),required:this.field.options.formRequired,rows:this._lineCount},f.prop("value",this._value))}},kd=class extends Qo{constructor(){super(...arguments);S(this,"_counter",I.create(this,this.getInitialValue()?.length??0))}label(){let r=this.field.options.formTextMaximumLength;return r?ID(super.label(),FD(f.text(o=>`(${o(this._counter)} / ${r})`),Kt("text-constraint"))):super.label()}input(){let r=super.input(),o=this.field.options.formTextMaximumLength;return o&&(r.maxLength=o,f.update(r,f.on("input",(n,i)=>this._counter.set(i.value.length)))),r}},Qa=class extends Dt{constructor(){super(...arguments);S(this,"inputType","text");S(this,"_format",this.field.options.formNumberFormat??"text");S(this,"_value",I.create(this,this.getInitialValue()??""));S(this,"_spinnerValue",I.create(this,this.getInitialNumericValue()))}input(){return this._format==="text"?this._renderTextInput():this._renderSpinnerInput()}resetInput(){this._value.setAndTrigger(this.getInitialValue()??""),this._spinnerValue.setAndTrigger(this.getInitialNumericValue())}getInitialNumericValue(){let r=this.getInitialValue();return r&&Sy(r)?parseFloat(r):""}_renderTextInput(){return id({type:this.inputType,name:this.name(),id:this.id(),required:this.field.options.formRequired},f.prop("value",this._value),vt())}_renderSpinnerInput(){return vw(this._spinnerValue,{setValueOnInput:!0,inputArgs:[{name:this.name(),id:this.id(),required:this.field.options.formRequired},vt()]})}},Bd=class extends Qo{constructor(){super(...arguments);S(this,"inputType","date")}},_d=class extends Qo{constructor(){super(...arguments);S(this,"inputType","datetime-local")}},el=()=>Je("Select..."),Sd=class extends Dt{constructor(r,o){super(r,o);S(this,"value");S(this,"_choices");S(this,"_selectElement");S(this,"_ctl");S(this,"_format",this.field.options.formSelectFormat??"select");S(this,"_alignment",this.field.options.formOptionsAlignment??"vertical");S(this,"_radioButtons",this.autoDispose(ir()));let n=this.field.options.choices;!Array.isArray(n)||n.some(s=>typeof s!="string")?this._choices=[]:(tl(n,s=>String(s),this.field.options.formOptionsSortOrder),this._choices=n);let i=this.getInitialValue();this.value=I.create(this,i??""),this._radioButtons.set(this._choices.map(s=>({label:String(s),checked:I.create(this,String(s)===i)})))}fieldDomAttributes(){return this._format==="radio"?{role:"group","aria-labelledby":`${this.id()}-label`}:{}}input(){return this._format==="select"?this._renderSelectInput():this._renderRadioInput()}resetInput(){let r=this.getInitialValue();this.value.set(r??""),this._radioButtons.get().forEach(o=>{o.checked.set(o.label===r)})}getInitialValue(){let r=super.getInitialValue();return r&&this._choices.includes(r)?r:null}_renderSelectInput(){return ld(this._selectElement=cd({name:this.name(),id:this.id(),required:this.field.options.formRequired},f.on("input",(r,o)=>this.value.set(o.value)),f("option",{value:""},el()),this._choices.map(r=>f("option",{value:r},f.prop("selected",o=>o(this.value)===r),r)),f.onKeyDown({Enter$:r=>this._maybeOpenSearchSelect(r)," $":r=>this._maybeOpenSearchSelect(r),ArrowUp$:r=>this._maybeOpenSearchSelect(r),ArrowDown$:r=>this._maybeOpenSearchSelect(r),Backspace$:()=>this.value.set("")}),vt()),f.maybe(r=>!r(Cn()),()=>ud(pd(f.text(r=>r(this.value)||el())),gd({action:r=>this.value.set(r),options:()=>this._choices.map(r=>({label:r,value:r})),onClose:()=>{setTimeout(()=>this._selectElement.focus())},placeholder:Je("Search"),ariaLabelInput:Je("Search options for {{-inputLabel}}",{inputLabel:this.field.question}),ariaLabelList:Je("Options for {{-inputLabel}}",{inputLabel:this.field.question}),acOptions:{maxResults:100,keepOrder:!1,showEmptyItems:!0},popupOptions:{trigger:["click",(r,o)=>{this._ctl=o}]},matchTriggerElemWidth:!0}),fd(re("CrossSmall"),f.attr("aria-label",Je("Clear selection for: {{-inputLabel}}",{inputLabel:this.field.question})),f.hide(r=>!r(this.value)),f.on("click",r=>{this.value.set(""),this._selectElement.focus(),r.stopPropagation(),r.preventDefault()}),Kt("search-select-clear-btn")),dd("Collapse"),Kt("search-select"))))}_renderRadioInput(){let r=this.field.options.formRequired;return Zi(Zi.cls("-horizontal",this._alignment==="horizontal"),f.cls("grist-radio-list"),f.cls("required",!!r),{name:this.name(),required:r},f.forEach(this._radioButtons,o=>ad(f("input",f.prop("checked",o.checked),f.on("change",(n,i)=>o.checked.set(i.checked)),{type:"radio",name:`${this.name()}`,value:o.label},vt()),f("span",o.label))))}_maybeOpenSearchSelect(r){Cn().get()||(r.preventDefault(),r.stopPropagation(),this._ctl?.open())}},Ed=class extends Dt{constructor(){super(...arguments);S(this,"inputType","checkbox");S(this,"checked",I.create(this,Iu(this.getInitialValue())));S(this,"_format",this.field.options.formToggleFormat??"switch")}render(){return nd(f("div",this.input()),Kt("field"))}input(){return this._format==="switch"?this._renderSwitchInput():this._renderCheckboxInput()}resetInput(){this.checked.set(Iu(this.getInitialValue()))}_renderSwitchInput(){return Ew(this.checked,{label:this.field.question,inputArgs:[{name:this.name(),required:this.field.options.formRequired},vt()],labelArgs:[Yr.cls("-required",!!this.field.options.formRequired)]})}_renderCheckboxInput(){return ww(Ja(f.prop("checked",this.checked),f.prop("value",r=>r(this.checked)?"1":"0"),f.on("change",(r,o)=>this.checked.set(o.checked)),{type:this.inputType,name:this.name(),required:this.field.options.formRequired},vt()),Tw(Yr.cls("-required",!!this.field.options.formRequired),this.field.question))}},Fd=class extends Dt{constructor(r,o){super(r,o);S(this,"checkboxes",this.autoDispose(ir()));S(this,"_alignment",this.field.options.formOptionsAlignment??"vertical");let n=this.field.options.choices;!Array.isArray(n)||n.some(s=>typeof s!="string")?n=[]:(tl(n,s=>String(s),this.field.options.formOptionsSortOrder),n=n.slice(0,md(this.field.options)));let i=new Set(this.getInitialValueList());this.checkboxes.set(n.map(s=>({label:s,checked:I.create(this,i.has(s))})))}fieldDomAttributes(){return{role:"group","aria-labelledby":`${this.id()}-label`}}input(){let r=this.field.options.formRequired;return Xo(Xo.cls("-horizontal",this._alignment==="horizontal"),f.cls("grist-checkbox-list"),f.cls("required",!!r),{name:this.name(),required:r},f.forEach(this.checkboxes,o=>sd(Ja(f.prop("checked",o.checked),f.on("change",(n,i)=>o.checked.set(i.checked)),{type:"checkbox",name:`${this.name()}[]`,value:o.label},vt()),f("span",o.label))))}resetInput(){let r=new Set(this.getInitialValueList());this.checkboxes.get().forEach(o=>{o.checked.set(r.has(o.label))})}},Id=class extends Dt{constructor(r,o){super(r,o);S(this,"checkboxes",this.autoDispose(ir()));S(this,"_alignment",this.field.options.formOptionsAlignment??"vertical");let n=this.field.refValues??[];tl(n,s=>String(s[1]),this.field.options.formOptionsSortOrder),n.splice(md(this.field.options));let i=new Set(this.getInitialValueList());this.checkboxes.set(n.map(s=>({label:String(s[1]),value:String(s[0]),checked:I.create(this,i.has(String(s[1])))})))}fieldDomAttributes(){return{role:"group","aria-labelledby":`${this.id()}-label`}}input(){let r=this.field.options.formRequired;return Xo(Xo.cls("-horizontal",this._alignment==="horizontal"),f.cls("grist-checkbox-list"),f.cls("required",!!r),{name:this.name(),required:r},f.forEach(this.checkboxes,o=>sd(Ja(f.prop("checked",o.checked),f.on("change",(n,i)=>o.checked.set(i.checked)),{type:"checkbox","data-grist-type":this.field.type,name:`${this.name()}[]`,value:o.value},vt()),f("span",o.label))))}resetInput(){let r=new Set(this.getInitialValueList());this.checkboxes.get().forEach(o=>{o.checked.set(r.has(o.label))})}},Cd=class extends Dt{constructor(r,o){super(r,o);S(this,"value");S(this,"_format",this.field.options.formSelectFormat??"select");S(this,"_alignment",this.field.options.formOptionsAlignment??"vertical");S(this,"_choices");S(this,"_selectElement");S(this,"_ctl");S(this,"_radioButtons",this.autoDispose(ir()));let n=this.field.refValues??[];tl(n,s=>String(s[1]),this.field.options.formOptionsSortOrder),this._choices=n;let i=this.getInitialValue();this.value=I.create(this,i??""),this._radioButtons.set(this._choices.map(s=>({label:String(s[1]),value:String(s[0]),checked:I.create(this,String(s[0])===i)})))}fieldDomAttributes(){return this._format==="radio"?{role:"group","aria-labelledby":`${this.id()}-label`}:{}}input(){return this._format==="select"?this._renderSelectInput():this._renderRadioInput()}resetInput(){let r=this.getInitialValue();this.value.set(r??""),this._radioButtons.get().forEach(o=>{o.checked.set(o.value===r)})}getInitialValue(){let r=super.getInitialValue(),o=r&&this._choices.find(([n,i])=>String(i)===r);return o?String(o[0]):null}_renderSelectInput(){return ld(this._selectElement=cd({name:this.name(),id:this.id(),"data-grist-type":this.field.type,required:this.field.options.formRequired},f.on("input",(r,o)=>this.value.set(o.value)),f("option",{value:""},el(),f.prop("selected",r=>r(this.value)==="")),this._choices.map(r=>f("option",{value:String(r[0])},String(r[1]),f.prop("selected",o=>o(this.value)===String(r[0])))),f.onKeyDown({Enter$:r=>this._maybeOpenSearchSelect(r)," $":r=>this._maybeOpenSearchSelect(r),ArrowUp$:r=>this._maybeOpenSearchSelect(r),ArrowDown$:r=>this._maybeOpenSearchSelect(r),Backspace$:()=>this.value.set("")}),vt()),f.maybe(r=>!r(Cn()),()=>ud(pd(f.text(r=>{let o=this._choices.find(n=>String(n[0])===r(this.value));return String(o?.[1]||el())})),gd({action:r=>this.value.set(r),options:()=>this._choices.map(r=>({label:String(r[1]),value:String(r[0])})),onClose:()=>{setTimeout(()=>this._selectElement.focus())},acOptions:{maxResults:100,keepOrder:!1,showEmptyItems:!0},placeholder:"Search",ariaLabelInput:Je("Search options for {{-inputLabel}}",{inputLabel:this.field.question}),ariaLabelList:Je("Options for {{-inputLabel}}",{inputLabel:this.field.question}),popupOptions:{trigger:["click",(r,o)=>{this._ctl=o}]},matchTriggerElemWidth:!0}),fd(re("CrossSmall"),f.attr("aria-label",Je("Clear selection for: {{-inputLabel}}",{inputLabel:this.field.question})),f.hide(r=>!r(this.value)),f.on("click",r=>{this.value.set(""),this._selectElement.focus(),r.stopPropagation(),r.preventDefault()}),Kt("search-select-clear-btn")),dd("Collapse"),Kt("search-select"))))}_renderRadioInput(){let r=this.field.options.formRequired;return Zi(Zi.cls("-horizontal",this._alignment==="horizontal"),f.cls("grist-radio-list"),f.cls("required",!!r),{name:this.name(),required:r,"data-grist-type":this.field.type},f.forEach(this._radioButtons,o=>ad(f("input",f.prop("checked",o.checked),f.on("change",(n,i)=>o.checked.set(i.checked)),{type:"radio",name:`${this.name()}`,value:o.value},vt()),f("span",o.label))))}_maybeOpenSearchSelect(r){Cn().get()||(r.preventDefault(),r.stopPropagation(),this._ctl?.open())}},Ad=class extends Dt{constructor(){super(...arguments);S(this,"inputType","file");S(this,"_value",I.create(this,[]))}input(){return kw(f.cls("field_clip"),{type:this.inputType,name:this.name(),id:this.id(),required:this.field.options.formRequired},f.prop("value",this._value),f.prop("multiple",!0),Kt("attachment-input"))}resetInput(){this._value.set([])}},_D={Text:kd,Numeric:Qa,Int:Qa,Choice:Sd,Bool:Ed,ChoiceList:Fd,Date:Bd,DateTime:_d,Ref:Cd,RefList:Id,Attachments:Ad},SD={Paragraph:Jo,Section:bd,Columns:xd,Submit:yd,Placeholder:vd,Layout:wd,Field:Td,Label:hd,Separator:Jo,Header:Jo};function vt(){return f.onKeyDown({Enter$:t=>t.preventDefault()})}function ED(){for(let t of["checkbox","radio"]){let e=document.querySelectorAll(`.grist-${t}-list.required:not(:has(input:checked))`);Array.from(e).forEach(function(o){o.querySelector(`input[type="${t}"]`)?.setAttribute("required","required")});let r=document.querySelectorAll(`.grist-${t}-list.required:has(input:checked`);Array.from(r).forEach(function(o){o.querySelector(`input[type="${t}"]`)?.removeAttribute("required")})}}function tl(t,e,r){let o=r??"default";if(o!=="default"){let n=new Intl.Collator(void 0,{numeric:!0});t.sort((i,s)=>n.compare(e(i),e(s))),o==="descending"&&t.reverse()}}var FD=m("span",`
  color: ${g.text};
  font-size: ${C.xsmallFontSize};
  margin-left: 8px;
`),ID=m("div",`
  display: flex;
  align-items: center;
`);z();var Od=class extends De{render(){let e=this.layoutNode,r=iw(e);return r?qi(e,"a",{href:r.href,target:r.target},r.target==="_blank"?{rel:"noopener"}:null):qi(e,"div",f.style("opacity","0.55"),f.attr("title","Destination \xE0 choisir"))}},CD=De.new;De.new=(t,e,r)=>t.type==="Button"?new Od(t,e,r):CD.call(De,t,e,r);function Iw(t){let e=De.new(t,{fields:{},rootLayoutNode:t,disabled:I.create(null,!1),error:I.create(null,null)});return AD(f.autoDispose(e),OD(e.render()))}var AD=m("div",`
  min-height: 100%;
  background: ${g.mainPanelBg};
  color: ${g.text};
`),OD=m("div",`
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`);var DD="0.1.0";console.info(`Hub (\xE9diteur de formulaires Grist) ${DD}`);rg("grist");var PD=zf({appearance:"light",colors:uw});Ls("hub-default-theme",{element:document.getElementById("grist-root-css"),position:"afterend"}).textContent=`@layer grist-base { :root { ${Object.entries(PD.colors).map(([t,e])=>`--grist-theme-${t}: ${e};`).join(" ")} } }`;var LD=m("div",`
  max-width: 420px;
  margin: 15vh auto 0;
  padding: 24px;
  text-align: center;
  color: ${g.text};
  & p { color: ${g.lightText}; }
`),Aw=typeof grist<"u"&&window.parent!==window,Pd=new URLSearchParams(location.search).get("readonly")==="true",Ow="layout";function MD(){return{id:Ne(),type:"Layout",children:[It("# **Accueil**"),{id:Ne(),type:"Section",children:[It("## **Rubrique**"),{...Wi(),children:[Gi("page"),yt(),yt()]}]}]}}var Zr=I.create(null,null),en=I.create(null,!1),Cw=0;function ND(t){Zr.setAndTrigger(t),window.clearTimeout(Cw),Cw=window.setTimeout(()=>{Aw&&grist.setOption(Ow,t).catch(console.error)},300)}function Ld(){Pd||(Zr.get()||Zr.set(MD()),en.set(!0))}window.__hub={layout:Zr,editing:en,edit:Ld,hubContext:Ae};var RD=f("div",{style:"height: 100%"},f.domComputed(t=>[t(en),t(en)?null:t(Zr)],([t,e])=>{if(t){let r=Xa.create(null,Zr.get(),ND,()=>en.set(!1));return f("div",{style:"height: 100%"},f.autoDispose(r),r.buildDom())}return!e||!e.children?.length?LD(f("h2","Hub vide"),f("p",Pd?"Ce hub n'a pas encore \xE9t\xE9 configur\xE9.":"Ouvrez la configuration du widget (menu \u22EE du widget) ou cliquez ci-dessous pour construire le hub."),Pd?null:aa("Construire le hub",f.on("click",Ld),f.cls("test-hub-start"))):Iw(e)}));document.body.appendChild(RD);function Dd(t){return t.id.map((e,r)=>Object.fromEntries(Object.keys(t).map(o=>[o,t[o][r]])))}async function $D(){let[t,e,r]=await Promise.all(["_grist_Pages","_grist_Views","_grist_Views_section"].map(s=>grist.docApi.fetchTable(s))),o=new Map(Dd(e).map(s=>[s.id,s.name]));Ae.pages.set(Dd(t).sort((s,l)=>s.pagePos-l.pagePos).map(s=>({id:s.viewRef,name:o.get(s.viewRef)||""})).filter(s=>s.name)),Ae.forms.set(Dd(r).filter(s=>s.parentKey==="form"&&o.has(s.parentId)).map(s=>({id:s.id,name:(s.title||"").trim()||o.get(s.parentId),page:o.get(s.parentId)})));let n=await grist.docApi.getAccessToken({readOnly:!0}),i=/^(.*?)\/api\/docs\/([^/?#]+)/.exec(n.baseUrl||"");Ae.docBase.set(i?`${i[1]}/doc/${i[2]}`:null)}Aw?(grist.ready({requiredAccess:"full",onEditOptions:Ld}),grist.onOptions(t=>{if(en.get())return;let e=t?.[Ow];Zr.set(e&&e.type==="Layout"?e:null)}),$D().catch(t=>console.warn("Pages et formulaires indisponibles (acc\xE8s complet requis) :",t))):(Ae.pages.set([{id:1,name:"Tableau de bord"},{id:2,name:"Projets"},{id:3,name:"Budget 2026"}]),Ae.forms.set([{id:7,name:"Signaler un incident",page:"Signalements"}]),Ae.docBase.set("https://docs.getgrist.com/doc/demo"));})();
/*! Bundled license information:

popper.js/dist/esm/popper.js:
  (**!
   * @fileOverview Kickass library to create and place poppers near their reference elements.
   * @version 1.16.1
   * @license
   * Copyright (c) 2016 Federico Zivolo and contributors
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   *)

dompurify/dist/purify.es.mjs:
  (*! @license DOMPurify 3.4.17 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.17/LICENSE *)
  (*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE *)
*/
