/* Copyright (C) 2026 LIghtJUNction; SPDX-License-Identifier: AGPL-3.0-or-later */
import { Shape, TAU, rotate } from '../runtime/geometry.js';
import { STYLES } from '../runtime/designs.js';

const white = [255,255,255];
function add(shape, role, build) {
  const start = shape.points.length;
  build();
  for (let i = start; i < shape.points.length; i++) {
    const point = shape.points[i];
    point.material = role;
    point.shade = Math.max(...point.color) / 255;
  }
}

function sculpture(style, variant) {
  const s = new Shape(), partCenters = {};
  const primary = build => add(s, 'primary', build);
  const secondary = build => add(s, 'secondary', build);
  const accent = build => add(s, 'accent', build);
  if (style === 'editorial') {
    if (!variant) {
      primary(() => s.surface(65,100,(u,v) => {
        const x = (u-.5)*2, angle = v*TAU, taper = Math.sqrt(Math.max(.02,1-x*x));
        return [x, -.23 + Math.sin(angle)*.18*taper, Math.cos(angle)*.32*taper];
      }, white));
      secondary(() => s.box([-.12,.05,0],[1.18,.33,.48],white));
      accent(() => {
        for (let i=0;i<5;i++) s.box([-.58+i*.23,.09,.247],[.11,.12,.015],white);
        s.line([.32,.22,0],[.32,.7,0],.018,white);
        s.box([.5,.61,0],[.35,.17,.02],white,1);
      });
      partCenters[1] = [.32,.61,0];
    } else {
      primary(() => s.tube(t => { const a = Math.PI*t; return [Math.cos(a),-.18+Math.sin(a)*.7,0]; }, .1, white,0,160,18));
      secondary(() => {
        s.box([0,-.22,0],[2.15,.1,.5],white);
        for (let i=0;i<7;i++) { const x=-.8+i*.267; s.line([x,-.18,0],[x,-.18+Math.sqrt(1-x*x)*.7,0],.018,white); }
      });
      accent(() => {
        s.box([-.92,-.15,0],[.45,.04,.55],white,1);
        s.box([.92,-.15,0],[.45,.04,.55],white,2);
      });
      partCenters[1] = [-.7,-.15,0]; partCenters[2] = [.7,-.15,0];
    }
  } else if (style === 'blueprint') {
    if (!variant) {
      primary(() => s.ring([0,0,0],.98,.035,white,1,0));
      secondary(() => s.ring([0,0,0],.73,.04,white,2,1));
      accent(() => { s.ring([0,0,0],.48,.03,white,3,2); s.ellipsoid([0,0,0],[.18,.18,.18],white,0,2200); });
    } else {
      primary(() => s.tube(t => [Math.cos(t*TAU*3)*.5,(t-.5)*1.9,Math.sin(t*TAU*3)*.5],.065,white,1,320,22));
      secondary(() => s.tube(t => [Math.cos(t*TAU*3+Math.PI)*.5,(t-.5)*1.9,Math.sin(t*TAU*3+Math.PI)*.5],.04,white,2,320,14));
      accent(() => { for(let i=0;i<14;i++){const t=i/13,a=t*TAU*3; s.line([Math.cos(a)*.5,(t-.5)*1.9,Math.sin(a)*.5],[-Math.cos(a)*.5,(t-.5)*1.9,-Math.sin(a)*.5],.014,white,0,20);} });
    }
  } else if (style === 'gallery') {
    primary(() => s.surface(105,120,(u,v) => {
      const a=v*TAU, y=variant ? -.45+u*.72 : -.85+u*1.55;
      const r=variant ? .23+.77*Math.sin(u*Math.PI/2) : .28+.4*Math.sin(u*Math.PI)*Math.sin(u*Math.PI)+.06*Math.cos(u*Math.PI*3);
      return [Math.cos(a)*r,y,Math.sin(a)*r];
    }, (u,v) => white.map(c => c*(.65+.35*Math.max(0,Math.cos(v*TAU-.6))))));
    secondary(() => s.ring([0,variant?.27:.7,0],variant?1:.22,.035,white,1,1));
    if (!variant) accent(() => s.ellipsoid([0,.76,0],[.25,.06,.25],white,1,1500));
    else accent(() => s.ring([0,-.45,0],.23,.035,white,0,1));
    partCenters[1]=[0,variant?.27:.7,0];
  } else if (style === 'botanical') {
    secondary(() => s.tube(t => [.09*Math.sin(t*Math.PI),-.95+t*.95,0],.035,white,0,90,12));
    if (!variant) {
      for(let petal=0;petal<6;petal++) {
        const a=petal*TAU/6;
        primary(() => s.surface(40,42,(u,v) => {
          const length=.13+.88*u, across=(v-.5)*.5*Math.sin(Math.PI*u), lift=.12+.25*Math.sin(u*Math.PI);
          return [Math.cos(a)*length-Math.sin(a)*across,lift+.035*Math.cos(v*TAU),Math.sin(a)*length+Math.cos(a)*across];
        },(u,v) => white.map(c=>c*(.65+.35*Math.sin(Math.PI*u))),petal+1));
      }
      accent(() => s.ellipsoid([0,.2,0],[.2,.15,.2],white,0,1800));
    } else {
      primary(() => s.ellipsoid([0,.25,0],[.43,.62,.43],white,1,9000));
      accent(() => { for(let i=0;i<7;i++) s.ring([0,-.21+i*.15,0],.44*Math.sqrt(Math.max(.02,1-((-.21+i*.15-.25)/.65)**2)),.014,white,1,1); });
      partCenters[1]=[0,-.2,0];
    }
  } else if (style === 'playful') {
    if (!variant) {
      primary(() => s.box([-.12,-.6,0],[.9,.45,.65],white,1));
      secondary(() => s.ellipsoid([.18,-.02,0],[.45,.4,.45],white,2,5000));
      accent(() => s.box([-.1,.63,0],[.65,.55,.55],white,3));
      partCenters[1]=[-.12,-.6,0]; partCenters[2]=[.18,-.02,0]; partCenters[3]=[-.1,.63,0];
    } else {
      primary(() => s.ellipsoid([0,-.55,0],[.45,.43,.45],white,1,4500));
      secondary(() => s.box([0,-.05,0],[1.65,.12,.55],white,2));
      accent(() => { s.ellipsoid([-.5,.3,0],[.27,.3,.27],white,2,3500); s.box([.55,.25,0],[.4,.45,.4],white,2); });
      partCenters[1]=[0,-.55,0]; partCenters[2]=[0,-.05,0];
    }
  } else {
    if (!variant) {
      primary(() => s.tube(t => {const a=t*TAU,r=.65+.25*Math.cos(3*a);return [r*Math.cos(2*a),r*Math.sin(2*a),.3*Math.sin(3*a)];},.065,white,0,650,22));
      accent(() => s.ellipsoid([0,0,0],[.13,.13,.13],white,1,1600));
    } else {
      primary(() => s.ring([0,0,0],.98,.025,white,1,1));
      secondary(() => s.ring([0,0,0],.78,.025,white,2,0));
      accent(() => { s.ring([0,0,0],.58,.025,white,3,2); s.ellipsoid([.98,0,0],[.14,.14,.14],white,1,2600); });
    }
  }
  return { shape:s, partCenters };
}

function hinge(axis, angle, center=[0,0,0]) {
  const [x,y,z]=axis,c=Math.cos(angle),s=Math.sin(angle),d=1-c;
  return (_point,v) => {
    const a=v[0]-center[0],b=v[1]-center[1],e=v[2]-center[2];
    v[0]=center[0]+(c+x*x*d)*a+(x*y*d-z*s)*b+(x*z*d+y*s)*e;
    v[1]=center[1]+(y*x*d+z*s)*a+(c+y*y*d)*b+(y*z*d-x*s)*e;
    v[2]=center[2]+(z*x*d-y*s)*a+(z*y*d+x*s)*b+(c+z*z*d)*e;
  };
}

/** Mutable settings select movement; rest geometry is sampled only once per scene. */
export function makeScene(style='editorial', settings={}, variant=0) {
  if (!Object.hasOwn(STYLES,style)) throw new Error(`Unknown style: ${style}`);
  const {shape,partCenters}=sculpture(style,variant);
  return { id:`${style}-${variant}`, ...shape.model(t => {
    const motion=settings.motion ?? STYLES[style].motion;
    const spin=rotate(1,motion==='turntable'?t*TAU/18:motion==='float'?Math.sin(t*.45)*.1:0);
    const bank=rotate(2,motion==='float'?Math.sin(t*.7)*.045:0);
    const pulse=motion==='breathe'?1+.035*Math.sin(t*TAU/4):1;
    const bob=motion==='float'?Math.sin(t*TAU/6)*.045:0;
    const joints={};
    if(motion==='articulate') {
      if(style==='botanical'&&!variant) {
        for(let i=0;i<6;i++){const a=i*TAU/6;joints[i+1]=hinge([-Math.sin(a),0,Math.cos(a)],.15*Math.sin(t*1.1+i*.15),[0,.12,0]);}
      } else if(style==='blueprint'&&variant) {
        // Coupled rungs and strands rotate together; never pull their joins apart.
        joints[0]=joints[1]=joints[2]=rotate(1,t*.3);
      } else if(style==='blueprint'||style==='nocturne') {
        for(let i=1;i<=3;i++)joints[i]=rotate((i-1)%3,t*(i%2?.3:-.22));
      } else if(style==='gallery'&&!variant) {
        const lift=.09*(1+Math.sin(t*1.1)); joints[1]=(_p,v)=>{v[1]+=lift;};
      } else {
        for(const [part,center] of Object.entries(partCenters))joints[part]=rotate(2,Math.sin(t*1.25+Number(part)*.4)*.11,center);
      }
    }
    return (point,v) => {
      joints[point.part]?.(point,v); spin(point,v); bank(point,v);
      v[0]*=pulse; v[1]=v[1]*pulse+bob; v[2]*=pulse;
    };
  },style==='blueprint'?[.55,-.3]:style==='botanical'?[.25,-.38]:[.45,-.16]) };
}
