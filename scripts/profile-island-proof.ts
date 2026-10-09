import { chromium } from '@playwright/test';
import { writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { sceneSprites, scenePoints } from '../src/application/island/scenePresentation';
const browser = await chromium.launch();
try {
  const page = await browser.newPage({viewport:{width:390,height:844}}), started = performance.now();
  const url = process.argv[2] ?? 'http://127.0.0.1:5190/island';
  await page.goto(url); await page.getByRole('button',{name:'Luoghi',exact:true}).waitFor();
  await page.locator('.proof-base').evaluate(async node => (node as HTMLImageElement).decode());
  const coldReadyMs = performance.now()-started;
  const frames = await page.evaluate(async () => {
    const gaps:number[]=[];let previous=performance.now();
    for(let i=0;i<180;i++)await new Promise<void>(resolve=>requestAnimationFrame(now=>{gaps.push(now-previous);previous=now;resolve();}));
    return {samples:gaps.length,p95FrameGapMs:[...gaps].sort((a,b)=>a-b)[Math.floor(gaps.length*.95)],maxFrameGapMs:Math.max(...gaps)};
  });
  const assets = await Promise.all(readdirSync('src/assets/island-proof').map(async file=>{
    const bytes=readFileSync(`src/assets/island-proof/${file}`);
    const info=await page.evaluate(async file=>{
      const image=new Image();image.src=`/src/assets/island-proof/${file}`;await image.decode();
      const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d')!;ctx.drawImage(image,0,0);
      const pixels=ctx.getImageData(0,0,image.width,image.height).data;let transparent=0,opaque=0;for(let i=3;i<pixels.length;i+=4){if(pixels[i]===0)transparent++;if(pixels[i]===255)opaque++;}
      return{width:image.width,height:image.height,transparentPixels:transparent,opaquePixels:opaque};
    },file);
    return{file,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),...info,finalArt:false};
  }));
  const total=assets.reduce((s,a)=>s+a.bytes,0);
  const report={url,environment:'Windows, headless Chromium on host; mobile viewport emulation, fresh initial scene',physicalPhone:false,production:false,viewport:[390,844],coldReadyMs,...frames,assets,rasterBytes:total,rasterMiB:total/1048576,budgetBytes:5*1048576,budgetPassed:total<=5*1048576,anchors:scenePoints,sprites:sceneSprites,decodedRgbaBytes:assets.reduce((s,a)=>s+a.width*a.height*4,0),scope:'structural measurement, not a human playtest or device GPU benchmark'};
  writeFileSync(process.argv[3] ?? 'docs/evidence/discovery-first/scene-profile.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify({coldReadyMs,...frames,rasterBytes:total,budgetPassed:report.budgetPassed},null,2));
} finally {await browser.close();}
