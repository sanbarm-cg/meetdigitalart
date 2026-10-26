/* Local image sequence: scroll position selects frames in either direction. */
(() => {
 const cfg=window.HERO_SEQUENCE,root=document.querySelector('.sequence-scroll');
 if(!cfg?.count||!root)return;
 const art=root.querySelector('.sequence-art'),fallback=art.querySelector('img');
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');art.append(canvas);
 const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return;
 root.classList.add('sequence-enabled');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const replay=document.querySelector('#sequence-replay'),pause=document.querySelector('#sequence-pause'),status=document.querySelector('#sequence-status');
 const copy=root.querySelector('.sequence-copy'),bridge=root.querySelector('.sequence-bridge'),shade=root.querySelector('.sequence-shade'),header=root.querySelector('.sequence-header'),cue=root.querySelector('.sequence-scroll-cue'),controls=root.querySelector('.sequence-preview-controls');
 const cache=new Map(),pending=new Map(),bad=new Set();
 let target=0,displayed=-1,busy=0,queued=false,failed=false;
 const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
 function trim(){
  const keys=[...cache.keys()].sort((a,b)=>Math.abs(b-target)-Math.abs(a-target));
  for(const key of keys){if(cache.size<=28)break;if(key!==target&&key!==displayed)cache.delete(key);}
 }
 function draw(){
  const img=cache.get(target);if(!img||displayed===target||failed)return;
  const w=canvas.width,h=canvas.height,mobile=innerWidth<800;
  const s=cfg.containRobot?(mobile?Math.min(w/(img.naturalWidth*.55),h*.70/img.naturalHeight):Math.min(w/img.naturalWidth,h/img.naturalHeight)):Math.max(w/img.naturalWidth,h/img.naturalHeight);
  const dw=img.naturalWidth*s,dh=img.naturalHeight*s;
  ctx.fillStyle=cfg.containRobot?'#181818':'#0D0E12';ctx.fillRect(0,0,w,h);
  const x=cfg.containRobot&&mobile?w*.5-dw*.68:(w-dw)*(mobile?(cfg.focusMobile??.66):(cfg.focusDesktop??.5));
  const y=cfg.containRobot&&mobile?h*.12:(h-dh)*.5;
  ctx.drawImage(img,x,y,dw,dh);
  // Keep the glow attached to the source-frame fingertip as the canvas resizes.
  if(cfg.tipGlow&&target>=cfg.tipGlow.start){
   const tip=cfg.tipGlow,a=clamp((target-tip.start)/(tip.end-tip.start));
   const gx=x+dw*tip.x,gy=y+dh*tip.y,r=dw*(22/854);
   ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=a;
   const halo=ctx.createRadialGradient(gx,gy,0,gx,gy,r);
   halo.addColorStop(0,'rgba(255,250,210,1)');halo.addColorStop(.16,'rgba(255,226,105,.95)');
   halo.addColorStop(.4,'rgba(255,190,30,.4)');halo.addColorStop(1,'rgba(255,180,10,0)');
   ctx.fillStyle=halo;ctx.fillRect(gx-r,gy-r,r*2,r*2);
   ctx.fillStyle='#fff5c4';ctx.shadowColor='#ffce38';ctx.shadowBlur=r*.45;
   ctx.beginPath();ctx.arc(gx,gy,dw*(3.1/854),0,Math.PI*2);ctx.fill();ctx.restore();
  }
  displayed=target;canvas.dataset.frame=String(displayed);fallback.hidden=true;if(status)status.textContent='';
 }
 function fail(){failed=true;canvas.hidden=true;fallback.hidden=false;root.classList.add('sequence-copy-ready');copy.style.opacity=1;copy.style.visibility='visible';copy.inert=false;if(status)status.textContent='';}
 function load(n){
  if(cache.has(n)||pending.has(n)||bad.has(n))return;
  busy++;const img=new Image();img.decoding='async';pending.set(n,img);
  const done=()=>{pending.delete(n);busy--;cache.set(n,img);trim();draw();pump();};
  img.onload=()=>img.decode?img.decode().then(done).catch(done):done();
  img.onerror=()=>{pending.delete(n);busy--;bad.add(n);if(n===target)fail();else pump();};
  img.src=cfg.base+String(n+1).padStart(4,'0')+'.jpg';
 }
 function pump(){
  if(failed)return;
  const list=[target];
  if(!reduced.matches)for(let d=1;d<=12;d++)list.push(target+d,target-d);
  for(const n of list){if(busy>=4)break;if(n>=0&&n<cfg.count)load(n);}
 }
 function seek(n){target=n;canvas.dataset.target=String(target);draw();pump();}
 function paint(){
  queued=false;
  const travel=Math.max(1,root.offsetHeight-innerHeight);
  const p=reduced.matches?0:clamp(-root.getBoundingClientRect().top/travel);
  root.dataset.progress=p.toFixed(3);
  seek(reduced.matches?cfg.count-1:Math.round(clamp(p/.60)*(cfg.count-1)));
  const exit=clamp((p-.80)/.20);
  art.style.transform=`translateY(${-exit*85}px) scale(${1+exit*.10})`;
  art.style.opacity=1-exit;shade.style.opacity=exit;
  root.classList.toggle('sequence-copy-ready',reduced.matches||p>=.60||failed);
  copy.style.opacity=failed?1:1-clamp((p-.82)/.12);
  const hidden=!failed&&!reduced.matches&&(p<.60||p>.94);
  copy.style.visibility=hidden?'hidden':'visible';copy.inert=hidden;copy.setAttribute('aria-hidden',String(hidden));
  const amount=reduced.matches?0:clamp((p-.88)/.08);
  bridge.style.opacity=amount;bridge.style.transform=`translateY(${-40+(1-amount)*10}%)`;bridge.setAttribute('aria-hidden',String(amount<.5));
  header.style.visibility=p>.90?'hidden':'visible';controls.style.visibility=p>.90?'hidden':'visible';cue.style.visibility=p>.90?'hidden':'visible';
  cue.querySelector('span').textContent=p<.60?'SCROLL TO CREATE':'SCROLL TO EXPLORE';
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(paint);}}
 function size(){const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(art.clientWidth*dpr);canvas.height=Math.round(art.clientHeight*dpr);displayed=-1;paint();}
 if(pause)pause.hidden=true;
 replay.hidden=false;replay.textContent='Back to start / 처음으로 ↺';
 replay.addEventListener('click',()=>{scrollTo({top:root.offsetTop,behavior:reduced.matches?'instant':'smooth'});});
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',size);reduced.addEventListener('change',size);
 size();
})();
