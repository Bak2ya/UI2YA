import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { mkdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.UI2YA_PLAYWRIGHT || 'playwright');
const root = fileURLToPath(new URL('../', import.meta.url));
const capture = process.env.UI2YA_SCREENSHOTS;
const types = {'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.jpg':'image/jpeg'};
const failures = [];
const server = createServer(async (request, response) => {
  const path = new URL(request.url, 'http://127.0.0.1').pathname;
  if (!/^\/(?:[a-z0-9-]+\.(?:html|js|css)|UI2YA\.html|assets\/[a-z0-9-]+\.jpg)$/.test(path)) {
    response.writeHead(404).end();
    return;
  }
  try {
    response.writeHead(200, {'Content-Type':types[extname(path)]}).end(await readFile(join(root,path)));
  } catch (error) {
    response.destroy(error);
  }
});
let browser;
try {
  await new Promise((resolve,reject) => {
    server.once('error',reject);
    server.listen(0,'127.0.0.1',resolve);
  });
  const url = 'http://127.0.0.1:'+server.address().port;
  if (capture) await mkdir(capture,{recursive:true});
  browser = await chromium.launch({executablePath:process.env.UI2YA_CHROMIUM || undefined});
  const context = await browser.newContext({
    viewport:{width:1440,height:1000},
    colorScheme:'light',
    permissions:['clipboard-read','clipboard-write'],
  });
  const page = await context.newPage();
  page.setDefaultTimeout(4500);
  page.on('pageerror',error=>failures.push(String(error)));
  page.on('console',message=>{
    if(message.type()==='error') failures.push(message.text());
  });
  const must = async (condition,message) => assert.ok(await condition,message);
  const screenshot = async name => {
    if(capture){
      await page.waitForFunction(()=>!document.querySelector('#app-status').classList.contains('visible'));
      await page.screenshot({path:join(capture,name+'.png'),animations:'disabled'});
    }
  };
  const open = async function(hash,selector){
    await page.goto(url+'/UI2YA.html'+hash);
    await page.locator(selector).first().waitFor();
  };
  await open('', '.layout-intro');
  const nav=page.locator('#primary-nav a');
  assert.deepEqual(await nav.allTextContents(),['레이아웃','컴포넌트','모션 실험실','UX 패턴','즐겨찾기','아이콘 라이브러리']);
  assert.equal(await nav.locator('svg').count(),6);
  assert.equal(await nav.first().getAttribute('title'),'layout-template · Lucide');
  const headerLesson=page.locator('[data-lesson=header]');
  const sidebarLesson=page.locator('[data-lesson=sidebar]');
  assert.equal(await headerLesson.locator('[name=bar-shape]').count(),4);
  await sidebarLesson.locator('[data-rail-toggle]').click();
  assert.equal(await page.locator('body').getAttribute('data-rail-compact'),'true');
  await sidebarLesson.locator('[data-rail-toggle]').click();
  await must(headerLesson.locator('h3').evaluate(el=>{
    const heading=el.getBoundingClientRect();
    const action=el.nextElementSibling.getBoundingClientRect();
    return Math.abs((heading.top+heading.bottom-action.top-action.bottom)/2)<2;
  }),'spotlight button is centered on the title row');
  await page.getByRole('link',{name:'미리보기 너비 조절해 보기'}).click();
  const responsive=page.locator('.layout-responsive');
  await responsive.waitFor();
  assert.equal(await responsive.evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),3);
  await page.getByRole('slider',{name:'미리보기 너비'}).fill('43');
  assert.equal(await responsive.evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),1);
  await open('#layout','.layout-intro');
  await screenshot('layout-desktop');

  async function coach(key,text){
    const source=page.locator(`[data-spotlight="${key}"]`).first();
    await source.click();
    const dialog=page.locator('#spotlight-dialog[open]');
    await dialog.waitFor();
    assert.equal(await page.locator('#coach-title').textContent(),text);
    await dialog.locator('.spotlight-ring').waitFor({state:'visible'});
    return source;
  }
  const opener=await coach('sidebar','사이드바');
  await page.waitForFunction(()=>{
    const ring=document.querySelector('.spotlight-ring').getBoundingClientRect();
    const target=document.querySelector('.rail').getBoundingClientRect();
    return Math.abs(ring.right-target.right)<9;
  });
  await page.keyboard.press('Escape');
  await must(opener.evaluate(element=>element===document.activeElement),'focus returns to the sidebar lesson');

  await coach('drawer','드로어·측면 시트');
  assert.equal(await page.locator('#motion-drawer').getAttribute('aria-hidden'),'false');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#motion-drawer').getAttribute('aria-hidden'),'true');
  await coach('fixed','고정 헤더');
  assert.equal(await page.locator('.topbar').evaluate(el=>getComputedStyle(el).position),'fixed');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.topbar').evaluate(el=>getComputedStyle(el).position),'sticky');
  await coach('modal','모달 대화상자');
  await must(page.locator('#tour-modal-example').evaluate(el=>el.matches(':modal')),'nested sample is a native modal');
  await page.keyboard.press('Escape');
  await must(page.locator('#tour-modal-example').evaluate(el=>!el.open),'nested sample closes');
  await coach('popover','팝오버');
  await must(page.locator('#design-popover').evaluate(el=>el.matches(':popover-open')),'spotlight opens actual popover');
  await page.keyboard.press('Escape');
  await must(page.locator('#design-popover').evaluate(el=>!el.matches(':popover-open')),'popover temporarily opened by tour closes');
  await coach('tour','사이드바');
  for(const title of ['헤더','본문 작업공간','드로어·측면 시트','하단 도크']){
    await page.locator('[data-coach-next]').click();
    assert.equal(await page.locator('#coach-title').textContent(),title);
  }
  await page.locator('[data-coach-next]').click();
  await must(page.locator('#spotlight-dialog').evaluate(el=>!el.open),'last tour step closes');
  console.log('PASS layout map, real target, native modal, drawer, popover, guided tour, focus return');

  await page.locator('[data-style-info=glass]').click();
  assert.equal(await page.locator('body').getAttribute('data-theme'),'flat2');
  await must(page.locator('.style-drawer').getByRole('link',{name:'Glass Panel 비교하기'}).isVisible(),'glass definition link');
  assert.equal(await page.locator('.style-drawer input').count(),0);
  await page.keyboard.press('Escape');
  await page.locator('#settings-toggle').click();
  await must(page.locator('#design-popover').evaluate(el=>el.matches(':popover-open')),'settings is a separate real popover');
  await page.locator('[data-editor-density]').selectOption('compact');
  assert.equal(await page.locator('body').getAttribute('data-density'),'compact');
  await page.locator('[data-editor-density]').selectOption('normal');
  await page.keyboard.press('Escape');
  await page.locator('[data-select-style=glass]').click();
  assert.equal(await page.locator('body').getAttribute('data-bar-shape'),'capsule');
  await page.locator('label').filter({has:page.locator('[name=bar-shape][value=floating]')}).click();
  assert.equal(await page.locator('body').getAttribute('data-bar-shape'),'floating');
  await page.locator('[data-select-style=flat2]').click();
  assert.equal(await page.locator('body').getAttribute('data-bar-shape'),'floating');
  await page.locator('label').filter({has:page.locator('[name=bar-shape][value=auto]')}).click();

  for(const width of [1440,900,390,320]){
    await page.setViewportSize({width,height:1000});
    for(const style of ['flat2','glass','material-you','neo-brutal']){
      await page.locator(`[data-select-style="${style}"]`).click();
      for(const mode of ['light','dark']){
        await page.locator(`.topbar [data-mode="${mode}"]`).click();
        const layout=await page.evaluate(()=>{
          const {width,height}=document.querySelector('#quick-accent').getBoundingClientRect();
          return {width,height,horizontal:document.documentElement.scrollWidth-innerWidth};
        });
        assert.equal(layout.width,layout.height,`${width} ${style} ${mode} circular swatch`);
        assert.ok(layout.horizontal<=1,`${width} ${style} ${mode} horizontal overflow ${layout.horizontal}`);
      }
    }
  }
  await page.locator('[data-select-style=glass]').click();
  await page.locator('.topbar [data-mode=light]').click();
  await screenshot('layout-mobile-320');
  await page.locator('[data-style-info=glass]').click();
  const styleDrawer=page.locator('.style-drawer');
  await page.waitForFunction(()=>document.querySelector('.style-drawer').getBoundingClientRect().right<=innerWidth+1);
  assert.equal(await styleDrawer.evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(244, 247, 255)');
  await screenshot('style-explainer-mobile');
  await page.keyboard.press('Escape');
  await page.setViewportSize({width:740,height:350});
  await page.locator('#settings-toggle').click();
  const settings=page.locator('#design-popover');
  const panelBounds=await settings.evaluate(el=>{
    const rect=el.getBoundingClientRect();
    return {left:rect.left,top:rect.top,right:rect.right,bottom:rect.bottom,width:innerWidth,height:innerHeight};
  });
  assert.ok(panelBounds.left>=0&&panelBounds.top>=0&&panelBounds.right<=panelBounds.width+1&&panelBounds.bottom<=panelBounds.height+1,
    `settings popover is bounded by a short viewport (${JSON.stringify(panelBounds)})`);
  assert.equal(await settings.locator('input[type=color]').count(),3);
  await settings.getByRole('slider',{name:'배경 흐림'}).fill('19');
  assert.equal(await settings.locator('[data-blur-output]').textContent(),'19px');
  await page.keyboard.press('Escape');
  await page.setViewportSize({width:390,height:840});
  await page.locator('#settings-toggle').click();
  await screenshot('settings-mobile');
  await page.keyboard.press('Escape');
  await coach('drawer','드로어·측면 시트');
  await must(page.locator('.coach-mark').evaluate(el=>{
    const rect=el.getBoundingClientRect();
    return rect.left>=0&&rect.top>=0&&rect.right<=innerWidth+1&&rect.bottom<=innerHeight+1;
  }),'mobile coach remains inside viewport');
  await page.keyboard.press('Escape');
  await page.locator('#search-expand').click();
  await page.locator('#find').fill('스르륵 움직이는 탭');
  await page.locator('#find').press('Enter');
  await page.locator('#entry-MOT-0015').waitFor();
  await page.locator('#entry-MOT-0015 a[href="#motion/MOT-0015"]').click();
  assert.equal(await page.locator('#lab-heading').textContent(),'슬라이딩 인디케이터');
  console.log('PASS 32 theme and width combinations, responsive demo, mobile drawers, short popover and search');

  await page.setViewportSize({width:1440,height:1000});
  await page.locator('[data-select-style=flat2]').click();
  await page.locator('.topbar [data-mode=light]').click();
  await open('#catalog/component','.component-tabs');
  await screenshot('components-desktop');
  await page.getByRole('tab',{name:'전체',exact:true}).press('ArrowRight');
  await page.locator('#component-tab-selection[aria-selected=true]').waitFor();
  await must(page.locator('#component-tab-selection').evaluate(el=>el===document.activeElement),'category arrow restores focus');
  const segment=page.locator('#entry-CMP-0006');
  await segment.scrollIntoViewIfNeeded();
  await segment.locator('label').filter({hasText:'격자'}).click();
  await segment.locator('[data-component-motion]').selectOption('MOT-0029');
  assert.equal(await segment.locator('[data-component-motion-link]').getAttribute('href'),'#motion/MOT-0029');
  await segment.locator('label').filter({hasText:'보드'}).click();
  await must(segment.locator('[data-segment-preview]').evaluate(el=>el.getAnimations().length>0),'alternate selection animates the live example');
  await segment.hover();
  assert.equal(await page.locator('[data-component-playback],.component-shadow').count(),0);
  await must(segment.locator('input[value="보드"]').isChecked(),'card hover leaves the selection alone');
  await page.emulateMedia({reducedMotion:'reduce'});
  await segment.locator('label').filter({hasText:'격자'}).click();
  await must(segment.locator('input[value="격자"]').isChecked(),'live control still works with reduced motion');
  await page.waitForFunction(()=>document.querySelector('#entry-CMP-0006 [data-segment-preview]').getAnimations().every(animation=>animation.effect.getTiming().duration<1));
  await page.emulateMedia({reducedMotion:'no-preference'});
  await open('#item/CMP-0001','#entry-CMP-0001');
  const checkbox=page.locator('#entry-CMP-0001 input[type=checkbox]').first();
  await checkbox.check();
  await must(checkbox.isChecked(),'checkbox checks a real input');
  await open('#item/CMP-0003','#entry-CMP-0003');
  await page.getByRole('switch').check();
  assert.equal(await page.locator('#entry-CMP-0003 [data-result]').textContent(),'켜짐');
  await open('#item/CMP-0004','#entry-CMP-0004');
  await page.locator('[data-action=toggle]').click();
  assert.equal(await page.locator('[data-action=toggle]').getAttribute('aria-pressed'),'true');
  await open('#item/CMP-0005','#entry-CMP-0005');
  await page.getByRole('radio',{name:'촘촘하게'}).check();
  assert.equal(await page.locator('#entry-CMP-0005 input:checked').count(),1);
  await open('#item/CMP-0008','#entry-CMP-0008');
  await page.locator('[data-bound=min]').fill('37');
  await page.locator('[data-bound=max]').fill('81');
  assert.equal(await page.locator('[data-range-output]').textContent(),'37–81');
  await open('#item/CMP-0013','#entry-CMP-0013');
  await page.locator('#entry-CMP-0013 label').last().click();
  assert.equal(await page.locator('#entry-CMP-0013 .is-filled').count(),5);
  await open('#item/CMP-0043','#entry-CMP-0043');
  const openModal=page.getByRole('button',{name:'대화상자 열기'});
  await openModal.click();
  await page.getByRole('dialog',{name:'보기를 바꿀까요?'}).waitFor();
  await page.keyboard.press('Escape');
  await must(openModal.evaluate(el=>el===document.activeElement),'component modal returns focus');
  await open('#item/CMP-0045','#entry-CMP-0045');
  await page.getByText('정렬 옵션',{exact:true}).click();
  await page.getByRole('button',{name:'최신순'}).click();
  assert.equal(await page.locator('#entry-CMP-0045 [data-result]').textContent(),'최신순 선택');
  await open('#catalog/component','.component-tabs');
  await page.getByRole('tab',{name:'입력',exact:true}).click();
  await page.locator('button[data-input-variant=color]').click();
  assert.equal(await page.locator('[data-color-tab]').count(),10);
  await page.locator('[data-color-panel=swatch] [data-color-swatch="#DE8351"]').click();
  assert.equal(await page.locator('[data-color-output]').textContent(),'#DE8351');
  await page.locator('[data-color-tab=code]').click();
  await page.locator('[data-color-format]').selectOption('RGB');
  await page.locator('[data-color-hex]').fill('hsl(120 100% 50% / .5)');
  assert.equal(await page.locator('[data-color-output]').textContent(),'#00FF0080');
  await page.locator('[data-color-hex]').press('Enter');
  assert.equal(await page.locator('[data-color-hex]').inputValue(),'rgb(0 255 0 / 0.5)');
  await page.locator('[data-color-tab=alpha]').click();
  await page.locator('[data-color-range=alpha]').fill('20');
  assert.equal(await page.locator('[data-color-output]').textContent(),'#00FF0033');
  await page.locator('[data-color-tab=native]').click();
  assert.equal(await page.locator('[data-native-color]').inputValue(),'#00ff00');
  await page.locator('[data-color-tab=wheel]').click();
  await page.locator('[data-color-wheel]').press('ArrowRight');
  assert.equal(await page.locator('[data-color-wheel]').getAttribute('aria-valuenow'),'125');
  await page.getByRole('link',{name:'색상 선택 방식 넓게 비교하기'}).click();
  await page.locator('#catalog-results .color-lab').waitFor();
  await page.locator('[data-color-tab=wheel]').click();
  await open('#item/VFX-1101','.material-comparison');
  assert.equal(await page.locator('.material-example').count(),3);
  console.log('PASS component tabs and preserved inputs, component motion, reduced motion, 10 color modes and shared color/alpha');

  await open('#motion/MOT-0001','#motion-detail');
  await page.locator('[data-workspace-preset=PST-014]').click();
  assert.equal(await page.locator('#opt-duration').inputValue(),'630');
  const stable=await page.locator('#lab-heading').textContent();
  await page.locator('[data-motion-id=MOT-0002]').hover();
  assert.equal(await page.locator('#lab-heading').textContent(),stable);
  const hoverStage=page.locator('.motion-row').filter({has:page.locator('[data-motion-id=MOT-0002]')}).locator('.motion-object');
  await must(hoverStage.evaluate(el=>el.style.transform.includes('translate')),'hover stage uses motion painter');
  await page.locator('[data-motion-id=MOT-0002]').click();
  assert.equal(await page.locator('#lab-heading').textContent(),'슬라이드');
  await page.locator('[data-workspace-preset=PST-002]').click();
  await page.locator('[data-motion-action=pause]').click();
  await page.locator('#motion-time').fill('100');
  assert.match(await page.locator('[data-motion-readout]').textContent(),/^100 \/ 230 ms$/);
  await page.locator('[data-copy-item=MOT-0002]').click();
  assert.match(await page.evaluate(()=>navigator.clipboard.readText()),/"duration":230/);
  await page.locator('[data-add=MOT-0002]').click();
  await page.locator('#dock-toggle').click();
  assert.match(await page.locator('#prompt-output').inputValue(),/motion=Slide/);
  await page.locator('#prompt-detailed').check();
  assert.match(await page.locator('#prompt-output').inputValue(),/Parameters/);
  await page.locator('#prompt-clear').click();
  await must(page.locator('#prompt-output').evaluate(el=>el.hidden),'empty prompt hides technical text');
  await page.locator('#dock-toggle').click();
  await page.locator('[data-favorite=MOT-0002]').click();
  await page.reload();
  assert.equal(await page.locator('[data-favorite=MOT-0002]').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('#opt-duration').inputValue(),'230');
  console.log('PASS motion hover does not select, preset changes values, timeline, copy, combine and persistence');

  await open('#icons','.icon-matrix');
  const matrix=page.locator('.icon-matrix');
  const icon=page.locator('.icon-sample');
  assert.equal(await matrix.locator('thead th[scope=col]').count(),16);
  assert.equal(await matrix.locator('tbody th[scope=row]').count(),6);
  assert.equal(await icon.count(),90);
  assert.equal(await page.locator('.library-index details').count(),6);
  await page.locator('.library-index summary').first().click();
  await must(page.locator('.library-index details[open] pre').isVisible(),'included license can be read in place');
  await page.locator('.library-index summary').first().click();
  await screenshot('icon-table-desktop');
  await page.locator('[data-icon-search]').fill('돋보기');
  assert.equal(await icon.count(),6);
  await page.locator('[data-icon-filter]').selectOption('hero');
  assert.equal(await icon.count(),1);
  await icon.click();
  await page.locator('#icon-details:popover-open').waitFor();
  assert.equal(await page.locator('#icon-detail-name').textContent(),'magnifying-glass');
  assert.match(await page.getByRole('link',{name:'공식 아이콘'}).getAttribute('href'),/^https:\/\/github\.com\/tailwindlabs\/heroicons\/.+\/magnifying-glass\.svg$/);
  await page.locator('[data-copy-icon]').click();
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'magnifying-glass');
  await page.keyboard.press('Escape');
  await must(icon.evaluate(el=>el===document.activeElement),'icon popover returns focus');
  await page.locator('[data-icon-search]').fill('');
  await page.locator('[data-icon-filter]').selectOption('');
  assert.equal(await icon.count(),90);
  await page.setViewportSize({width:320,height:820});
  const scroller=page.locator('.icon-table-scroll');
  const tableBounds=await scroller.evaluate(el=>({content:el.scrollWidth,wrapper:el.clientWidth,page:document.documentElement.scrollWidth,viewport:innerWidth}));
  assert.ok(tableBounds.content>tableBounds.wrapper&&tableBounds.page<=tableBounds.viewport,
    `only the table scrolls horizontally (${JSON.stringify(tableBounds)})`);
  await scroller.evaluate(el=>{el.scrollLeft=220;});
  await must(scroller.evaluate(el=>{
    const header=el.querySelector('tbody th').getBoundingClientRect();
    return el.scrollLeft>200&&Math.abs(header.left-el.getBoundingClientRect().left)<2;
  }),'library names stay visible as the table scrolls');
  await scroller.evaluate(el=>{el.scrollLeft=0;});
  await page.locator('#icon-compare-title').evaluate(el=>el.scrollIntoView({block:'start'}));
  await screenshot('icon-table-mobile');
  await page.locator('[data-select-style=glass]').click();
  await page.locator('.topbar [data-mode=dark]').click();
  assert.equal(await matrix.locator('tbody th').first().evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(24, 43, 71)');

  await page.goto(url+'/index.html#layout');
  await page.locator('.layout-intro').waitFor();
  await must(page.locator('#primary-nav svg').count(),'split sources load');

  const touchContext=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const phone=await touchContext.newPage();
  phone.on('pageerror',error=>failures.push(String(error)));
  await phone.goto(url+'/UI2YA.html#layout');
  await phone.locator('#settings-toggle').tap();
  await phone.locator('#design-popover:popover-open').waitFor();
  await phone.getByRole('button',{name:'디자인 설정 닫기'}).tap();
  await phone.locator('#primary-nav [data-section=icons]').tap();
  await phone.locator('.icon-sample').first().tap();
  await phone.locator('#icon-details:popover-open').waitFor();
  await phone.getByRole('button',{name:'아이콘 상세 닫기'}).tap();
  await phone.locator('#icon-details:popover-open').waitFor({state:'hidden'});
  await touchContext.close();
  assert.deepEqual(failures,[]);
  console.log('PASS icon matrix, licenses, search, copy, focus, 320px sticky column, touch, source and standalone, no console errors');
} finally {
  await browser?.close();
  server.close();
}
