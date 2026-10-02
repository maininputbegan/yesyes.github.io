// loader.js — injects the full app into the SVG's foreignObject at runtime.
// v1.0
(function(){
  "use strict";

  // status animation
  var dotsEl = document.getElementById("dots");
  var dots = 0;
  if(dotsEl){ setInterval(function(){ dots = (dots + 1) % 4; dotsEl.textContent = new Array(dots + 1).join("."); }, 400); }

  // ---- THE APP (embedded as a template literal) ----
  var APP = `
<div id="wallLayer" class="wallLayer"><div class="wallImg" id="wallImg"></div><div class="wallBlur"></div></div>
<div class="fx snowFx" id="snowFx"></div>
<div class="fx glitchFx"></div>
<div class="fx starsFx" id="starsFx"></div>
<div class="wrap"><div class="shell glass">
  <div class="shellGlow"></div>
  <div class="top">
    <div><h1><span class="kao">(⌐■_■)</span><span class="hname">proxy_index</span><span class="cur"></span></h1><p class="sub"><span class="dot">●</span> grouped links · open or copy</p></div>
    <div class="tools"><label class="find"><b>$</b><input id="search" type="search" placeholder="grep groups or urls  ( / )"/></label><div id="count" class="count">25 groups, 196 links</div><button id="settingsOpen" class="iconbtn" type="button" title="Settings">⚙</button></div>
  </div>
  <div id="groups" class="groups"></div>
  <div id="empty" class="empty"><span class="face">(ToT)</span>no matches — try a different search</div>
</div></div>
<div id="toast" class="toast"></div>
<div id="sheet" class="sheet"><span>copy manually</span><input id="sheetUrl" readonly value=""/><button id="sheetX" type="button" class="btn">close</button></div>
<div id="settings" class="settings">
  <h2>⚙ settings</h2>
  <div class="setting-row"><label>theme <b id="themeLabel">purple</b></label><div class="swatches"><button class="sw" data-s="purple" aria-pressed="true" type="button"></button><button class="sw" data-s="blue" aria-pressed="false" type="button"></button><button class="sw" data-s="mono" aria-pressed="false" type="button"></button><button class="sw" data-s="red" aria-pressed="false" type="button"></button></div></div>
  <div class="setting-row"><label>wallpaper</label><div class="set-grid" id="wallGrid"></div></div>
  <div class="setting-row"><label>brightness <b id="dimVal">88%</b></label><input type="range" id="wallDim" min="20" max="100" value="88"/></div>
  <div class="setting-row"><label>frost blur <b id="blurVal">22px</b></label><input type="range" id="wallBlurRange" min="0" max="40" value="22"/></div>
  <div class="setting-row"><label>motion</label><button class="set-toggle" id="wallMove" role="switch" aria-checked="true" type="button"><div><div class="lbl">drift</div><div class="sub2">slow ambient motion</div></div><span class="switch"></span></button></div>
  <div class="setting-row"><label>effects</label>
    <button class="set-toggle" id="snowBtn" role="switch" aria-checked="false" type="button"><div><div class="lbl">snowfall</div><div class="sub2">snow particles</div></div><span class="switch"></span></button>
    <button class="set-toggle" id="glitchBtn" role="switch" aria-checked="false" type="button" style="margin-top:8px"><div><div class="lbl">glitch</div><div class="sub2">chromatic scanlines</div></div><span class="switch"></span></button>
    <button class="set-toggle" id="starsBtn" role="switch" aria-checked="false" type="button" style="margin-top:8px"><div><div class="lbl">shooting stars</div><div class="sub2">meteor streaks</div></div><span class="switch"></span></button>
  </div>
  <div class="setting-row"><label>data</label>
    <button class="set-toggle" id="resetBtn" role="switch" aria-checked="false" type="button"><div><div class="lbl">reset all</div><div class="sub2">clear saved settings</div></div><span class="switch"></span></button>
  </div>
  <button class="set-btn" id="settingsClose" type="button">close</button>
</div>
`;

  var CSS = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');
:root{--wall:none;--wall-dim:.88;--wall-blur:22px;--wall-scale:1.06;--mono:"JetBrains Mono",ui-monospace,Menlo,monospace}
*{box-sizing:border-box}
html,body{width:100%;margin:0;background:#04030a;color:#e8e6f2;font:13px/1.55 var(--mono);-webkit-font-smoothing:antialiased;min-height:100%}
body{padding:24px 16px 80px;position:relative;overflow-x:hidden;pointer-events:auto}
.hidden{display:none!important}
.wallLayer{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none}
.wallLayer .wallImg{position:absolute;inset:-40px;background-image:var(--wall);background-size:cover;background-position:center;filter:brightness(var(--wall-dim)) saturate(1.05);transform:scale(var(--wall-scale));transition:background-image .5s ease,filter .4s ease}
body[data-move="1"] .wallLayer .wallImg{animation:wallDrift 60s ease-in-out infinite alternate}
@keyframes wallDrift{0%{transform:scale(var(--wall-scale)) translate3d(-6px,-4px,0)}100%{transform:scale(calc(var(--wall-scale) + .04)) translate3d(8px,6px,0)}}
.wallLayer .wallBlur{position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 0%,transparent 30%,rgba(0,0,0,.55))}
.fx{position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden;opacity:0;transition:opacity .4s}
body[data-snow="1"] .snowFx{opacity:1}
body[data-glitch="1"] .glitchFx{opacity:1}
body[data-stars="1"] .starsFx{opacity:1}
.snowFx i{position:absolute;top:-10vh;border-radius:50%;background:radial-gradient(circle at 30% 30%,#fff,#c9c4ff 60%,transparent 70%);opacity:.7;filter:drop-shadow(0 0 4px rgba(255,255,255,.6));animation:fall linear infinite}
@keyframes fall{0%{transform:translate3d(0,-10vh,0)}100%{transform:translate3d(var(--dx,12px),110vh,0)}}
.glitchFx::before,.glitchFx::after{content:"";position:absolute;inset:0;mix-blend-mode:screen;pointer-events:none}
.glitchFx::before{background:linear-gradient(90deg,rgba(255,60,60,.06),transparent 20%,transparent 80%,rgba(60,255,255,.06));animation:glitchShift 2.4s steps(8) infinite}
.glitchFx::after{background:repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 1px,transparent 1px 3px);animation:scanShift 6s linear infinite;opacity:.35}
@keyframes glitchShift{0%,100%{transform:translate3d(0,0,0)}10%{transform:translate3d(-2px,1px,0)}20%{transform:translate3d(3px,-1px,0)}30%{transform:translate3d(-1px,2px,0)}40%{transform:translate3d(2px,0,0)}50%{transform:translate3d(0,0,0)}60%{transform:translate3d(-3px,1px,0)}70%{transform:translate3d(1px,-2px,0)}80%{transform:translate3d(0,1px,0)}90%{transform:translate3d(2px,0,0)}}
@keyframes scanShift{from{background-position:0 0}to{background-position:0 6px}}
.starsFx i{position:absolute;top:-10vh;width:2px;height:2px;border-radius:50%;background:#fff;box-shadow:0 0 6px #fff;opacity:0;animation:shoot 4s linear infinite;animation-delay:var(--d,0s)}
@keyframes shoot{0%{opacity:0;transform:translate3d(0,0,0)}5%{opacity:1}60%{opacity:1}100%{opacity:0;transform:translate3d(-30vw,60vh,0)}}
.glass{background:var(--glass-bg);-webkit-backdrop-filter:blur(var(--wall-blur)) saturate(180%);backdrop-filter:blur(var(--wall-blur)) saturate(180%);border:1px solid var(--glass-bd);box-shadow:0 30px 90px rgba(0,0,0,.55),0 0 60px var(--glow-a),inset 0 1px 0 rgba(255,255,255,.12);position:relative}
.glass::before{content:"";position:absolute;left:8%;right:8%;top:-1px;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent);opacity:.7;pointer-events:none}
.glass::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:radial-gradient(140% 60% at 50% -10%,rgba(255,255,255,.14),transparent 55%);mix-blend-mode:screen;opacity:.55}
body[data-t="purple"]{--glass-bg:linear-gradient(180deg,rgba(58,32,110,.32),rgba(20,10,42,.28));--glass-bd:rgba(196,161,255,.28);--glass-solid:rgba(20,10,42,.9);--glass-hi:linear-gradient(180deg,rgba(90,52,168,.34),rgba(24,12,48,.32));--text:#f4f0ff;--dim:#c3b8e0;--faint:#8a7fb0;--acc:#d0b8ff;--acc2:#f0e6ff;--line:rgba(196,161,255,.22);--line2:rgba(214,190,255,.65);--glow-a:rgba(139,92,246,.35);--glow-b:rgba(217,70,239,.22);--glow-c:rgba(34,211,238,.14);--grad-a:#d0b8ff;--grad-b:#f0e6ff;--grad-c:#67e8f9;--ok:#86efac}
body[data-t="blue"]{--glass-bg:linear-gradient(180deg,rgba(24,58,120,.34),rgba(8,18,40,.3));--glass-bd:rgba(147,197,253,.28);--glass-solid:rgba(8,18,40,.9);--glass-hi:linear-gradient(180deg,rgba(38,90,180,.34),rgba(10,24,52,.32));--text:#eef6ff;--dim:#b4ceea;--faint:#7291b8;--acc:#bfdcff;--acc2:#eaf4ff;--line:rgba(147,197,253,.22);--line2:rgba(180,220,255,.65);--glow-a:rgba(59,130,246,.38);--glow-b:rgba(99,102,241,.22);--glow-c:rgba(34,211,238,.18);--grad-a:#bfdcff;--grad-b:#eaf4ff;--grad-c:#22d3ee;--ok:#86efac}
body[data-t="mono"]{--glass-bg:linear-gradient(180deg,rgba(80,80,90,.28),rgba(20,20,24,.3));--glass-bd:rgba(230,230,240,.22);--glass-solid:rgba(20,20,24,.9);--glass-hi:linear-gradient(180deg,rgba(110,110,120,.3),rgba(24,24,28,.32));--text:#f5f5f5;--dim:#c0c0c6;--faint:#7a7a82;--acc:#e6e6ea;--acc2:#fff;--line:rgba(230,230,240,.18);--line2:rgba(245,245,250,.6);--glow-a:rgba(200,200,220,.28);--glow-b:rgba(140,140,160,.18);--glow-c:rgba(80,80,90,.14);--grad-a:#e6e6ea;--grad-b:#fff;--grad-c:#a3a3a3;--ok:#86efac}
body[data-t="red"]{--glass-bg:linear-gradient(180deg,rgba(130,26,32,.32),rgba(32,6,8,.32));--glass-bd:rgba(252,165,165,.28);--glass-solid:rgba(32,6,8,.9);--glass-hi:linear-gradient(180deg,rgba(200,40,50,.34),rgba(40,8,10,.34));--text:#fff1f1;--dim:#f0b8b8;--faint:#b87777;--acc:#fcc6c6;--acc2:#ffe4e4;--line:rgba(252,165,165,.22);--line2:rgba(255,200,200,.65);--glow-a:rgba(239,68,68,.4);--glow-b:rgba(244,63,94,.24);--glow-c:rgba(251,146,60,.2);--grad-a:#fcc6c6;--grad-b:#ffe4e4;--grad-c:#fb923c;--ok:#86efac}
.wrap{position:relative;z-index:2;max-width:1120px;margin:0 auto}
.shell{border-radius:22px;overflow:hidden}
.shellGlow{position:absolute;inset:-3px;border-radius:24px;z-index:-1;background:conic-gradient(from 0deg,transparent 0deg,var(--acc) 60deg,transparent 120deg,transparent 180deg,var(--acc2) 240deg,transparent 300deg,transparent 360deg);filter:blur(16px);opacity:.55;animation:spin 16s linear infinite;pointer-events:none}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
.top{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:22px 24px;border-bottom:1px solid var(--line);flex-wrap:wrap}
h1{margin:0;display:flex;align-items:center;gap:12px;font-size:18px;font-weight:700}
.kao{color:var(--acc);font-weight:600;text-shadow:0 0 14px var(--acc)}
.hname{background:linear-gradient(92deg,var(--grad-a),var(--grad-b) 45%,var(--grad-c));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;background-size:200% auto;animation:hueSlide 10s linear infinite}
@keyframes hueSlide{0%{background-position:0% 50%}100%{background-position:200% 50%}}
.cur{width:9px;height:1.05em;margin-left:-3px;background:var(--acc);animation:blink 1.1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.sub{margin:4px 0 0;color:var(--dim);font-size:11px}
.tools{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.find{display:flex;align-items:center;gap:8px;min-width:260px;padding:0 12px;border:1px solid var(--glass-bd);border-radius:12px;background:var(--glass-bg);transition:border-color .2s,box-shadow .2s}
.find:focus-within{border-color:var(--line2);box-shadow:0 0 0 3px var(--glow-c),0 0 24px var(--glow-a)}
.find b{color:var(--acc)}
.find input{flex:1;min-width:0;padding:11px 0;border:0;outline:0;background:none;color:var(--text);font:inherit}
.count{color:var(--dim);font-size:12px;white-space:nowrap}
.count b{color:var(--acc2);font-weight:600}
.iconbtn{width:38px;height:38px;padding:0;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--glass-bd);border-radius:11px;background:var(--glass-bg);color:var(--acc);cursor:pointer;font-size:15px;transition:all .2s}
.iconbtn:hover{border-color:var(--line2);color:var(--acc2);box-shadow:0 6px 18px var(--glow-a)}
.groups{display:flex;flex-direction:column;gap:12px;padding:16px}
.group{border:1px solid var(--glass-bd);border-radius:16px;background:var(--glass-bg);overflow:hidden;transition:border-color .25s,box-shadow .25s;animation:groupIn .5s ease-out both;animation-delay:calc(var(--g,0) * 22ms)}
@keyframes groupIn{from{opacity:0;transform:translate3d(0,8px,0)}to{opacity:1;transform:translate3d(0,0,0)}}
.group:hover{border-color:var(--line2);box-shadow:0 12px 40px var(--glow-a)}
.group[open]{border-color:var(--line2);background:var(--glass-hi)}
.gs{display:block;padding:14px 16px;cursor:pointer;list-style:none}
.gs::-webkit-details-marker{display:none}
.gh{display:flex;align-items:center;gap:12px}
.gn{flex:1;font-weight:700;text-transform:lowercase;letter-spacing:.04em}
.gn::after{content:"/";color:var(--faint);margin-left:4px}
.pill{padding:2px 9px;border:1px solid var(--glass-bd);border-radius:8px;color:var(--dim);font-size:11px;background:rgba(255,255,255,.06)}
.chev{color:var(--dim);transition:transform .25s}
details:not([open]) .chev{transform:rotate(-90deg)}
.gb{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,340px),1fr));gap:10px;padding:4px 14px 14px}
.li{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--glass-bd);border-radius:12px;background:var(--glass-bg);transition:all .25s}
.li:hover{border-color:var(--line2);background:var(--glass-hi);box-shadow:0 10px 30px var(--glow-a)}
.u{flex:1;min-width:0;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;overflow-wrap:anywhere;color:var(--dim);font-size:12px;line-height:1.45;-webkit-user-select:all;user-select:all}
.u b{color:var(--text);font-weight:600}
.acts{display:flex;gap:6px;flex-shrink:0}
.btn{padding:7px 12px;border:1px solid var(--glass-bd);border-radius:9px;background:var(--glass-bg);color:var(--acc);font:600 11px/1 var(--mono);text-decoration:none;cursor:pointer;transition:all .22s}
.btn:hover{border-color:var(--line2);background:var(--glass-hi);color:var(--acc2)}
.btn.ok{border-color:var(--ok);background:rgba(134,239,172,.85);color:#04140c}
.empty{display:none;padding:44px 20px;text-align:center;color:var(--dim)}
.empty.show{display:block}
.empty .face{display:block;font-size:32px;color:var(--acc);margin-bottom:10px}
.toast,.sheet{position:fixed;left:50%;bottom:24px;z-index:60;border:1px solid var(--line2);background:var(--glass-solid)}
.toast{transform:translate3d(-50%,14px,0) scale(.96);opacity:0;pointer-events:none;padding:11px 18px;border-radius:999px;font-size:12px;color:var(--acc2);transition:all .24s}
.toast.show{opacity:1;transform:translate3d(-50%,0,0) scale(1)}
.sheet{display:none;transform:translate3d(-50%,0,0);width:min(560px,calc(100% - 24px));align-items:center;gap:8px;padding:12px;border-radius:16px;z-index:61}
.sheet.show{display:flex}
.sheet input{flex:1;min-width:0;padding:10px 11px;border:1px solid var(--glass-bd);border-radius:10px;outline:0;background:rgba(0,0,0,.35);color:var(--text);font:12px var(--mono)}
.sheet span{color:var(--dim);font-size:11px}
.settings{position:fixed;top:20px;right:20px;z-index:70;width:380px;max-width:calc(100vw - 32px);max-height:calc(100vh - 40px);overflow-y:auto;border-radius:20px;padding:18px;background:var(--glass-solid);border:1px solid var(--line2);box-shadow:0 40px 90px rgba(0,0,0,.7);transform-origin:top right;transform:scale(.92) translate3d(12px,-8px,0);opacity:0;pointer-events:none;transition:transform .26s cubic-bezier(.34,1.56,.64,1),opacity .2s}
.settings.open{transform:scale(1) translate3d(0,0,0);opacity:1;pointer-events:auto}
.settings h2{margin:0 0 14px;font:700 12px/1 var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--acc);display:flex;align-items:center;gap:8px}
.settings h2::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,var(--line2),transparent)}
.setting-row{display:flex;flex-direction:column;gap:8px;margin-bottom:16px}
.setting-row>label{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--dim);display:flex;justify-content:space-between}
.setting-row>label b{color:var(--acc2);font-weight:600}
.setting-row input[type="range"]{-webkit-appearance:none;appearance:none;width:100%;height:4px;border-radius:2px;background:linear-gradient(90deg,var(--acc),var(--line2));outline:none}
.setting-row input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:16px;height:16px;border-radius:50%;background:var(--acc2);cursor:pointer}
.set-toggle{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid var(--glass-bd);border-radius:12px;background:var(--glass-bg);cursor:pointer;transition:all .2s;text-align:left;width:100%;color:inherit;font:inherit}
.set-toggle:hover{border-color:var(--line2)}
.set-toggle .lbl{font-size:12px;color:var(--text);font-weight:600}
.set-toggle .sub2{font-size:10.5px;color:var(--faint)}
.set-toggle .switch{width:38px;height:22px;border-radius:11px;position:relative;background:rgba(255,255,255,.1);border:1px solid var(--glass-bd);flex-shrink:0;transition:background .2s}
.set-toggle .switch::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--dim);transition:transform .22s cubic-bezier(.34,1.56,.64,1),background .2s}
.set-toggle[aria-checked="true"] .switch{background:var(--glow-a);border-color:var(--line2)}
.set-toggle[aria-checked="true"] .switch::after{transform:translate3d(16px,0,0);background:var(--acc2)}
.set-btn{width:100%;padding:11px 14px;border-radius:12px;cursor:pointer;font:600 12px/1 var(--mono);letter-spacing:.06em;text-transform:uppercase;border:1px solid var(--line2);background:linear-gradient(180deg,var(--glow-a),transparent);color:var(--acc2);transition:all .2s}
.set-btn:hover{background:linear-gradient(180deg,var(--glow-a),var(--glow-c))}
.swatches{display:flex;gap:8px;padding:6px 8px;border:1px solid var(--glass-bd);border-radius:12px;background:var(--glass-bg);align-self:flex-start}
.sw{width:26px;height:26px;border-radius:50%;border:2px solid rgba(255,255,255,.2);cursor:pointer;padding:0;transition:transform .2s}
.sw:hover{transform:scale(1.12)}
.sw[data-s="purple"]{background:radial-gradient(circle at 30% 30%,#d0b8ff,#7c3aed)}
.sw[data-s="blue"]{background:radial-gradient(circle at 30% 30%,#bfdcff,#2563eb)}
.sw[data-s="mono"]{background:radial-gradient(circle at 30% 30%,#f5f5f5,#3a3a3a)}
.sw[data-s="red"]{background:radial-gradient(circle at 30% 30%,#fcc6c6,#b91c1c)}
.sw[aria-pressed="true"]{border-color:#fff;box-shadow:0 0 16px var(--acc)}
.set-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.wallbtn{aspect-ratio:1/1;border-radius:12px;border:2px solid var(--glass-bd);background-size:cover;background-position:center;background-color:rgba(0,0,0,.4);cursor:pointer;position:relative;overflow:hidden;transition:all .22s;padding:0}
.wallbtn:hover{transform:scale(1.05)}
.wallbtn[aria-pressed="true"]{border-color:#fff;box-shadow:0 0 24px var(--glow-a)}
.wallbtn::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 50%,rgba(0,0,0,.7))}
.wallbtn span{position:absolute;left:0;right:0;bottom:4px;z-index:1;text-align:center;font:600 9px/1 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:#fff}
.wallbtn[data-w="0"]{background:repeating-linear-gradient(45deg,rgba(255,255,255,.04) 0 6px,rgba(255,255,255,.08) 6px 12px)}
@media (max-width:820px){body{padding:14px 10px 68px}.top{flex-direction:column;align-items:stretch}.tools{flex-wrap:wrap}.find{min-width:0;flex:1}.gb{grid-template-columns:1fr}.settings{left:16px;right:16px;width:auto;top:auto;bottom:16px;max-height:70vh}}
`;

  // ---- LINKS ----
  var DATA = [
    { e:"\u26a1", n:"KITE", l:["https://f5fy.z13.web.core.windows.net","https://ofiq.z19.web.core.windows.net","https://qb3p.z9.web.core.windows.net","https://tq7o.z4.web.core.windows.net"]},
    { e:"\u2600", n:"SOLARA", l:["https://solara.tokeslaszlo.ro","https://solara.survet.cl","https://solara.explosionlearning.org","https://solara.lasersoft.net.au","https://solara.actadigital.com.ar"]},
    { e:"\u263e", n:"LUNAR", l:["https://lunar.explosionlearning.org","https://lunar.actadigital.com.ar","https://saugatrlunar-uicvr.xcel.ch"]},
    { e:"\u2728", n:"AURORA", l:["https://aurora.tokeslaszlo.ro","https://aurora.explosionlearning.org","https://aurora.actadigital.com.ar"]},
    { e:"\u2727", n:"GLIM", l:["https://sgt7.s3.amazonaws.com/index.html","https://s3.us-east-1.amazonaws.com/axk4/index.html","https://s3.amazonaws.com/sz1n/index.html","https://axk4.s3.amazonaws.com/index.html"]},
    { e:"\u25cb", n:"DAYDREAMX", l:["https://h7ww.s3.amazonaws.com/index.html","https://h7ww.s3.us-east-1.amazonaws.com/index.html","https://s3.amazonaws.com/h7ww/index.html"]},
    { e:"\u25c9", n:"INTERSTELLAR", l:["https://gnd9.z13.web.core.windows.net","https://zzqf.z19.web.core.windows.net","https://agek.z5.web.core.windows.net","https://fyeq.z1.web.core.windows.net","https://kpkz.z21.web.core.windows.net"]},
    { e:"\u25a0", n:"CINERA", l:["https://cinera.explosionlearning.org","https://cinera.actadigital.com.ar"]},
    { e:"\u2739", n:"FLARE", l:["https://note.adis.web.id","https://max.brusin.net","https://lab.labgarreguevara.com.ar","https://study.innovacioneseducativas.com.mx","https://global.mrgshrimp.com","https://map.wayhomeapp.org"]},
    { e:"\u25d0", n:"UTOPIA", l:["https://utopia.tokeslaszlo.ro","https://utopia.explosionlearning.org","https://utopia.actadigital.com.ar"]},
    { e:"\u25b6", n:"TRIPLE T HD", l:["https://triplethd.explosionlearning.org","https://triplethd.lasersoft.net.au","https://triplethd.actadigital.com.ar"]},
    { e:"\u2609", n:"SPACE", l:["https://space.explosionlearning.org","https://space.actadigital.com.ar"]},
    { e:"\u2638", n:"VOYA", l:["https://voya.tokeslaszlo.ro","https://voya.explosionlearning.org","https://voya.actadigital.com.ar"]},
    { e:"\u2740", n:"STROBERRI", l:["https://stroberri.explosionlearning.org","https://stroberri.actadigital.com.ar"]},
    { e:"\u2611", n:"STUDY HUB", l:["https://studyhub.tokeslaszlo.ro","https://studyhub.explosionlearning.org"]},
    { e:"\u25ce", n:"TUNG TUNG", l:["https://tungtung.survet.cl","https://tungtung.nikeinvest.ro","https://tungtung.cpmecatronica.cl","https://tungtung.colegiosanmarcel.cl","https://jhkf.z21.web.core.windows.net","https://gy5k.z22.web.core.windows.net","https://saugatrbaseball.7geo7.ru","https://saugatrtungtung-agylt.bisovea.ru","https://math268863-saugatr.ololow.com","https://saugatrtungtung-iouku.soynutrimeraki.cl"]},
    { e:"\u2694", n:"ASTRA", l:["https://sixseven.chanka.com","https://astra-bull.noble-house.tk","https://astra-education.top","https://animals.solidaritysafaris.com","https://bull.solidaritysafaris.com","https://saugatrastra-cacw.creative-words.se","https://info.veranda.co.id","https://tra.ipdz.com","https://gilead.org.il"]},
    { e:"\u273f", n:"FERN", l:["https://family267740-saugatr.biec.com.np","https://saugatrfern-pzamu.biec.com.np","https://education265213-saugatr.codex-bot.com","https://saugatrgreat.hyperlum.nl","https://subsaugatr.pirazymatma.pl"]},
    { e:"\u25c8", n:"DUCK SET", l:["https://unpkg.com/classroomduck@1.0.0/index.html","https://unpkg.com/classroomduck@1.0.0/index.svg","https://esm.sh/classroomduck@1.0.0/index.html","https://esm.sh/classroomduck@1.0.0/index.svg","https://esm.sh/classroomduck/index.html","https://esm.sh/classroomduck/index.svg","https://esm.sh/jacorn-7fz3@1.0.0/index.html","https://unpkg.com/jacorn-7fz3@1.0.0/index.html","https://esm.sh/quietcorn@1.0.1/index.html","https://esm.sh/quietcorn@1.0.1/index.svg","https://unpkg.com/quietcorn@1.0.1/index.svg","https://unpkg.com/quietcorn@1.0.1/index.html","https://esm.sh/classroomduck@1.0.65/index.html","https://storage.googleapis.com/mathlessons/duckmath.svg","https://cdn.jsdelivr.net/gh/freezenovasrl/cdn/duckmath.svg"]},
    { e:"\u2b1c", n:"S3 / AMAZON", l:["https://leahh-5a8u.s3.amazonaws.com/index.html","https://lmeyo-cok1.s3.amazonaws.com/index.html","https://ralsei.s3.amazonaws.com/index.html","https://lmeyo.s3.amazonaws.com/index.html","https://id5y.s3.amazonaws.com/index.html","https://fyr3.s3.amazonaws.com/index.html","https://axk4.s3.amazonaws.com/index.html","https://h7ww.s3.amazonaws.com/index.html"]},
    { e:"\u2699", n:"EXTRAS", l:["https://gelaoshi.global.ssl.fastly.net","https://fstudentsareinventors.s3.amazonaws.com/index.html","https://glwithfinals.s3.amazonaws.com/index.html","https://celestialdevsalot.github.io/celestialisbest","https://mathhomeworkhelperthingy.free.nf/?i=2","https://schoolbook1.radioimpactfm.ro","https://cdn.jsdelivr.net/gh/reeyuki/YukiOsSingleHtml@main/yukios.svg","https://cdn.jsdelivr.net/gh/drewalow860-ctrl/PeteZahStaticDone@959d81f/new.svg","https://cdn.jsdelivr.net/gh/cherriunblocked/svg/index.svg","https://cdn.jsdelivr.net/gh/coinbaselarper/svg@latest/logo.svg","https://cdn.jsdelivr.net/gh/rykcbaoolNEW/dogeub/index.svg","https://raw.githack.com/un-pkg/npm/main/bundle-min.svg","https://aw3k.s3.us-east-2.amazonaws.com/index.html","https://mathvc.s3.amazonaws.com/index.html","https://lsrelay-a.s3.amazonaws.com/index.html","https://s3.amazonaws.com/elliotslinks-tnjavxyp/homework65988/index.html"]},
    { e:"\u25d1", n:"MISC HOSTS", l:["https://mathtechmrk61.parcomunica.com","https://edumathschooledu.parcomunica.com","https://rkmathtech3.parcomunica.com","https://itsforubaks.parcomunica.com","https://techmathsch20.art-motel.com","https://okokokitsok.art-motel.com","https://mathschool8tech.art-motel.com","https://vcsastudying.lervs.ro","https://studyhubv2.litescripts.com","https://vcsastudying.meridiano.com.br","https://cipher.radioimpactfm.ro","https://studyvcsa.savenewport.com","https://rammer.nana.euforiacs.com","https://rammer.nana.dataon.cl","https://atharvseduhub.networkguru.com","https://scienceforuuu.parcomunica.com","https://mkmkmath.parcomunica.com","https://englishmath33.parcomunica.com","https://mathmathsc.art-motel.com","https://mathhh.art-motel.com","https://triplet.expertdiagnoza.ro","https://xylora.expertdiagnoza.ro","https://ck.gen1.srivaishnavam.org.au","https://ck.contentkeeper1.ekocleaner.ro","https://ck.contentkeeper2.forever-20.com","https://content.keeper2.savenewport.com","https://vinemanmath.srivaishnavam.org.au","https://mathbabysitting.srivaishnavam.org.au","https://babysittingmath.srivaishnavam.org.au","https://keyboardmath27.forever-20.com","https://backtobank8.forever-20.com","https://vinemanmath28.srivaishnavam.org.au","https://likethisaubmemrk.srivaishnavam.org.au","https://primathsc27.radioimpactfm.ro","https://25plesmath8.forever-20.com","https://keyboardmath20.expertdiagnoza.ro"]},
    { e:"\u2637", n:"B-CDN TEST SET", l:["https://james-gonzalez-21.b-cdn.net","https://daniel-sanchez-82.b-cdn.net","https://jacob-thomas-19.b-cdn.net","https://lucas-jones-14.b-cdn.net","https://harper-hernandez-10.b-cdn.net","https://evelyn-davis-19.b-cdn.net","https://ethan-hernandez-14.b-cdn.net","https://sofia-gonzalez-92.b-cdn.net","https://james-brown-87.b-cdn.net","https://james-gonzalez-20.b-cdn.net","https://storage.googleapis.com/logan223/duckmath.html"]},
    { e:"\u2318", n:"P5JS + GSCRIPT", l:["https://script.google.com/macros/s/AKfycbxnbwF6Gs2_XnVzz_mBOInAp54aR2a7LLGyHn2AvEp-k765vSdQl5YnDfW6QT6zVU68/exec","https://script.google.com/macros/s/AKfycbxmo-l8H5tXzYfuh8wGzjiVkVOqQZoXDy-mbfMAlxyw-i2Wxh5VgjKGFh8YaEZW-CgCyg/exec","https://assets.editor.p5js.org/69f34707e1b7f4a3a3e5b6d1/6e528b37-2c24-457c-b1de-8b0964eacd2f.svg"]}
  ];

  // ---- WALLPAPERS ----
  var WALLS = [
    {label:"none", url:""},
    {label:"anime", url:"https://i.ibb.co/tTrhxzyS/uwp5095159.avif"},
    {label:"stadium", url:"https://i.ibb.co/NgzZm4FZ/uwp4376378.avif"},
    {label:"lambo", url:"https://i.ibb.co/0yVFsHPq/uwp5095504.avif"},
    {label:"night", url:"https://i.ibb.co/j11Q4rG/wp14253291.jpg"}
  ];

  // ---- SHIM + INJECT ----
  function inject(){
    var svg = document.querySelector("svg");
    var fo = svg && svg.querySelector("foreignObject");
    if(!fo){ return; }
    var root = fo.firstElementChild;
    if(!root){
      root = document.createElementNS("http://www.w3.org/1999/xhtml","html");
      fo.appendChild(root);
    }

    // build the app inside the html element
    var head = document.createElementNS("http://www.w3.org/1999/xhtml","head");
    var style = document.createElementNS("http://www.w3.org/1999/xhtml","style");
    style.textContent = CSS;
    head.appendChild(style);
    var body = document.createElementNS("http://www.w3.org/1999/xhtml","body");
    body.setAttribute("data-t","purple");
    body.setAttribute("data-move","1");
    body.innerHTML = APP;

    // clear existing root content and set new
    while(root.firstChild){ root.removeChild(root.firstChild); }
    root.appendChild(head);
    root.appendChild(body);

    // now wire up the app
    setTimeout(function(){ boot(body, root); }, 30);
  }

  function boot(body, root){
    var $ = function(id){ return root.querySelector("#" + id); };
    var qsa = function(sel){ return Array.prototype.slice.call(root.querySelectorAll(sel)); };

    var search = $("search"), count = $("count"), empty = $("empty");
    var toast = $("toast"), sheet = $("sheet"), sheetUrl = $("sheetUrl"), sheetX = $("sheetX");
    var settings = $("settings"), settingsOpen = $("settingsOpen"), settingsClose = $("settingsClose");
    var snowFx = $("snowFx"), starsFx = $("starsFx");
    var wallGrid = $("wallGrid");

    // theme
    function setTheme(t){
      body.setAttribute("data-t", t);
      qsa(".sw").forEach(function(s){ s.setAttribute("aria-pressed", s.getAttribute("data-s")===t ? "true":"false"); });
      var tl = $("themeLabel"); if(tl) tl.textContent = t;
      try { localStorage.setItem("pi-theme", t); } catch(e){}
    }
    qsa(".sw").forEach(function(s){
      s.addEventListener("click", function(ev){ ev.preventDefault(); setTheme(s.getAttribute("data-s")); });
    });
    var stored = "purple"; try { stored = localStorage.getItem("pi-theme") || "purple"; } catch(e){}
    setTheme(stored);

    // wallpaper buttons
    if(wallGrid){
      wallGrid.innerHTML = "";
      WALLS.forEach(function(w, i){
        var b = document.createElementNS("http://www.w3.org/1999/xhtml","button");
        b.setAttribute("type","button");
        b.setAttribute("class","wallbtn");
        b.setAttribute("data-w", i);
        b.setAttribute("aria-pressed", i===0 ? "true" : "false");
        if(w.url){ b.style.backgroundImage = "url('" + w.url + "')"; }
        var sp = document.createElementNS("http://www.w3.org/1999/xhtml","span");
        sp.textContent = w.label;
        b.appendChild(sp);
        b.addEventListener("click", function(ev){
          ev.preventDefault();
          applyWall(i);
        });
        wallGrid.appendChild(b);
      });
    }

    function applyWall(i){
      var w = WALLS[i] || WALLS[0];
      body.style.setProperty("--wall", w.url ? "url('" + w.url + "')" : "none");
      qsa(".wallbtn").forEach(function(b){ b.setAttribute("aria-pressed", parseInt(b.getAttribute("data-w"),10)===i ? "true":"false"); });
      try { localStorage.setItem("pi-wall", String(i)); } catch(e){}
    }
    var si = 0; try { var s = localStorage.getItem("pi-wall"); if(s!==null) si = parseInt(s,10)||0; } catch(e){}
    applyWall(si);

    // brightness / blur
    var wallDim = $("wallDim"), dimVal = $("dimVal");
    var wallBlurR = $("wallBlurRange"), blurVal = $("blurVal");
    function applyDim(v){ v = Math.max(20, Math.min(100, v|0)); body.style.setProperty("--wall-dim", String(v/100)); if(dimVal) dimVal.textContent = v + "%"; if(wallDim) wallDim.value = v; try{localStorage.setItem("pi-dim",String(v));}catch(e){} }
    function applyBlur(v){ v = Math.max(0, Math.min(40, v|0)); body.style.setProperty("--wall-blur", v + "px"); if(blurVal) blurVal.textContent = v + "px"; if(wallBlurR) wallBlurR.value = v; try{localStorage.setItem("pi-blur",String(v));}catch(e){} }
    var sd = 88, sb = 22;
    try { var v1 = parseInt(localStorage.getItem("pi-dim"),10); if(!isNaN(v1)) sd = v1; } catch(e){}
    try { var v2 = parseInt(localStorage.getItem("pi-blur"),10); if(!isNaN(v2)) sb = v2; } catch(e){}
    applyDim(sd); applyBlur(sb);
    if(wallDim) wallDim.addEventListener("input", function(){ applyDim(parseInt(wallDim.value,10)); });
    if(wallBlurR) wallBlurR.addEventListener("input", function(){ applyBlur(parseInt(wallBlurR.value,10)); });

    // motion toggle
    var moveOn = true; try { moveOn = (localStorage.getItem("pi-move")||"1")==="1"; } catch(e){}
    var wallMove = $("wallMove");
    function applyMove(){ body.setAttribute("data-move", moveOn ? "1" : "0"); if(wallMove) wallMove.setAttribute("aria-checked", moveOn ? "true" : "false"); try{localStorage.setItem("pi-move",moveOn?"1":"0");}catch(e){} }
    applyMove();
    if(wallMove) wallMove.addEventListener("click", function(ev){ ev.preventDefault(); moveOn = !moveOn; applyMove(); });

    // snow
    function buildSnow(){
      if(!snowFx) return;
      snowFx.innerHTML = "";
      for(var i=0;i<60;i++){
        var p = document.createElementNS("http://www.w3.org/1999/xhtml","i");
        var left = Math.random()*100, dur = 6 + Math.random()*10, delay = -Math.random()*dur;
        var dx = Math.round((Math.random()*40-20)*10)/10, size = (3+Math.random()*4).toFixed(1);
        p.setAttribute("style","left:"+left+"%;width:"+size+"px;height:"+size+"px;--dx:"+dx+"px;animation-duration:"+dur+"s;animation-delay:"+delay+"s;");
        snowFx.appendChild(p);
      }
    }
    var snowOn = false; try { snowOn = (localStorage.getItem("pi-snow")||"0")==="1"; } catch(e){}
    var snowBtn = $("snowBtn");
    function applySnow(){ body.setAttribute("data-snow", snowOn?"1":"0"); if(snowBtn) snowBtn.setAttribute("aria-checked", snowOn?"true":"false"); try{localStorage.setItem("pi-snow",snowOn?"1":"0");}catch(e){} if(snowOn && snowFx && snowFx.children.length===0) buildSnow(); }
    buildSnow(); applySnow();
    if(snowBtn) snowBtn.addEventListener("click", function(ev){ ev.preventDefault(); snowOn = !snowOn; applySnow(); });

    // glitch
    var glitchOn = false; try { glitchOn = (localStorage.getItem("pi-glitch")||"0")==="1"; } catch(e){}
    var glitchBtn = $("glitchBtn");
    function applyGlitch(){ body.setAttribute("data-glitch", glitchOn?"1":"0"); if(glitchBtn) glitchBtn.setAttribute("aria-checked", glitchOn?"true":"false"); try{localStorage.setItem("pi-glitch",glitchOn?"1":"0");}catch(e){} }
    applyGlitch();
    if(glitchBtn) glitchBtn.addEventListener("click", function(ev){ ev.preventDefault(); glitchOn = !glitchOn; applyGlitch(); });

    // stars
    function buildStars(){
      if(!starsFx) return;
      starsFx.innerHTML = "";
      for(var i=0;i<20;i++){
        var p = document.createElementNS("http://www.w3.org/1999/xhtml","i");
        var left = Math.random()*100, delay = Math.random()*6;
        p.setAttribute("style","left:"+left+"%;--d:"+delay+"s;");
        starsFx.appendChild(p);
      }
    }
    var starsOn = false; try { starsOn = (localStorage.getItem("pi-stars")||"0")==="1"; } catch(e){}
    var starsBtn = $("starsBtn");
    function applyStars(){ body.setAttribute("data-stars", starsOn?"1":"0"); if(starsBtn) starsBtn.setAttribute("aria-checked", starsOn?"true":"false"); try{localStorage.setItem("pi-stars",starsOn?"1":"0");}catch(e){} if(starsOn && starsFx && starsFx.children.length===0) buildStars(); }
    buildStars(); applyStars();
    if(starsBtn) starsBtn.addEventListener("click", function(ev){ ev.preventDefault(); starsOn = !starsOn; applyStars(); });

    // reset
    var resetBtn = $("resetBtn");
    if(resetBtn) resetBtn.addEventListener("click", function(ev){
      ev.preventDefault();
      try {
        ["pi-theme","pi-wall","pi-dim","pi-blur","pi-move","pi-snow","pi-glitch","pi-stars"].forEach(function(k){ localStorage.removeItem(k); });
      } catch(e){}
      say("settings reset");
      resetBtn.setAttribute("aria-checked","true");
      setTimeout(function(){ resetBtn.setAttribute("aria-checked","false"); location.reload(); }, 800);
    });

    // settings open/close
    if(settingsOpen) settingsOpen.addEventListener("click", function(ev){ ev.preventDefault(); settings.classList.toggle("open"); });
    if(settingsClose) settingsClose.addEventListener("click", function(ev){ ev.preventDefault(); settings.classList.remove("open"); });
    if(sheetX) sheetX.addEventListener("click", function(ev){ ev.preventDefault(); sheet.classList.remove("show"); });

    // toast
    function say(m){
      if(!toast) return;
      toast.textContent = m;
      toast.classList.add("show");
      clearTimeout(say.t);
      say.t = setTimeout(function(){ toast.classList.remove("show"); }, 1400);
    }
    function flash(b){ if(!b) return; b.textContent = "copied"; b.classList.add("ok"); clearTimeout(flash.t); flash.t = setTimeout(function(){ b.textContent = "copy"; b.classList.remove("ok"); }, 1100); }
    function manual(t){
      if(!sheet) return;
      sheetUrl.value = t; sheet.classList.add("show");
      try { sheetUrl.focus(); sheetUrl.select(); sheetUrl.setSelectionRange(0, t.length); } catch(e){}
    }
    function copy(t, b){
      var ok = function(){ flash(b); say("copied"); };
      try {
        if(navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(t).then(ok, function(){ manual(t); });
        } else { manual(t); }
      } catch(e){ manual(t); }
    }

    // RENDER GROUPS
    var groups = $("groups");
    if(groups){
      groups.innerHTML = "";
      DATA.forEach(function(g, i){
        var d = document.createElementNS("http://www.w3.org/1999/xhtml","details");
        d.setAttribute("class","group");
        d.style.setProperty("--g", i);
        d.open = true;
        var s = document.createElementNS("http://www.w3.org/1999/xhtml","summary");
        s.setAttribute("class","gs");
        s.innerHTML = "<div class='gh'><span class='kao'>"+g.e+"</span><span class='gn'>"+g.n+"</span><span class='pill'>"+g.l.length+"</span><span class='chev'>\u25be</span></div>";
        d.appendChild(s);
        var b = document.createElementNS("http://www.w3.org/1999/xhtml","div");
        b.setAttribute("class","gb");
        g.l.forEach(function(u){
          var li = document.createElementNS("http://www.w3.org/1999/xhtml","div");
          li.setAttribute("class","li");
          var span = document.createElementNS("http://www.w3.org/1999/xhtml","span");
          span.setAttribute("class","u");
          var stripped = u.replace(/^https?:\/\//, "");
          var host = stripped.split("/")[0];
          span.innerHTML = "https://<b>" + host + "</b>" + stripped.slice(host.length);
          li.appendChild(span);
          var acts = document.createElementNS("http://www.w3.org/1999/xhtml","div");
          acts.setAttribute("class","acts");
          var copyBtn = document.createElementNS("http://www.w3.org/1999/xhtml","button");
          copyBtn.setAttribute("type","button");
          copyBtn.setAttribute("class","btn");
          copyBtn.textContent = "copy";
          copyBtn.addEventListener("click", function(ev){ ev.preventDefault(); ev.stopPropagation(); copy(u, copyBtn); });
          acts.appendChild(copyBtn);
          var openA = document.createElementNS("http://www.w3.org/1999/xhtml","a");
          openA.setAttribute("class","btn");
          openA.setAttribute("href", u);
          openA.setAttribute("target","_blank");
          openA.setAttribute("rel","noopener noreferrer");
          openA.textContent = "open";
          acts.appendChild(openA);
          li.appendChild(acts);
          b.appendChild(li);
        });
        d.appendChild(b);
        groups.appendChild(d);
      });
    }

    // SEARCH
    function update(){
      if(!search) return;
      var q = (search.value || "").trim().toLowerCase(), gc = 0, lc = 0;
      qsa(".group").forEach(function(grp){
        var gn = grp.querySelector(".gn");
        var hitName = !q || (gn && gn.textContent.toLowerCase().indexOf(q) > -1);
        var n = 0;
        Array.prototype.slice.call(grp.querySelectorAll(".li")).forEach(function(it){
          var u = it.querySelector(".u");
          var hit = hitName || (u && u.textContent.toLowerCase().indexOf(q) > -1);
          it.classList.toggle("hidden", !hit);
          if(hit) n++;
        });
        var pill = grp.querySelector(".pill"); if(pill) pill.textContent = n;
        grp.classList.toggle("hidden", !n);
        if(q && n) grp.open = true;
        if(n){ gc++; lc += n; }
      });
      if(count) count.innerHTML = "<b>" + gc + "</b> groups, <b>" + lc + "</b> links";
      if(empty) empty.classList.toggle("show", !gc);
    }
    if(search) search.addEventListener("input", update);

    document.addEventListener("keydown", function(e){
      if(e.key === "/" && document.activeElement !== search && search){ e.preventDefault(); search.focus(); search.select(); }
      else if(e.key === "Escape"){
        if(settings) settings.classList.remove("open");
        if(sheet) sheet.classList.remove("show");
        if(search && search.value){ search.value = ""; update(); }
      }
    });

    // hide loading status
    var ls = document.getElementById("loader-status");
    if(ls) ls.style.display = "none";
  }

  // run when SVG is parsed
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
  // fallback — if the SVG is already in the DOM
  setTimeout(function(){
    if(!document.querySelector(".shell")) inject();
  }, 200);
})();
