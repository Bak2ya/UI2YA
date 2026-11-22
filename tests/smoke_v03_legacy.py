"""UI2YA v0.3.0 Chrome smoke test; run `node build.mjs UI2YA.html && python tests/smoke.py`."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'UI2YA.html').read_text(encoding='utf8')
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1440,'height':960},device_scale_factor=1)
    page.set_default_timeout(5000)
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(html,wait_until='load')
    assert page.title().startswith('UI2YA')
    assert page.locator('[data-section=home],[data-section=styles]').count()==0
    assert page.locator('.top-style-strip button').count()==4
    assert page.locator('.u-demo-card').count()==57
    assert page.locator('#entry-CMP-0001 [data-add]').count()==0
    assert 'CMP-0001' not in page.locator('#entry-CMP-0001').inner_text()
    assert page.locator('#entry-CMP-0001 .u-card-overview').is_visible()
    assert page.locator('#entry-CMP-0001 details').count()==0
    print('CATALOG: 57 inline cards; no ID or basic-component prompt buttons')

    # Distinct global styles without rebuilding active DOM.
    for key in ['flat2','glass','material-you','neo-brutal']:
        page.locator(f'[data-select-style="{key}"]').evaluate('(e)=>e.click()')
        assert page.locator('body').get_attribute('data-theme')==key
    page.locator('[data-mode=dark]').first.evaluate('(e)=>e.click()')
    assert page.locator('body').get_attribute('data-dark')=='true'
    print('STYLE: 4 global skins and dark mode')

    # Seamless icon-only search and keyboard.
    assert page.locator('#global-search').get_attribute('data-expanded')=='false'
    page.locator('#search-expand').click()
    assert page.locator('#global-search').get_attribute('data-expanded')=='true'
    assert page.locator('#find').evaluate('e=>document.activeElement===e')
    page.keyboard.press('Escape')
    assert page.locator('#global-search').get_attribute('data-expanded')=='false'
    page.keyboard.press('Control+f')
    assert page.locator('#global-search').get_attribute('data-expanded')=='true'
    page.locator('#search-collapse').click()
    print('SEARCH: icon expansion, Escape, Ctrl+F')

    # Correct semantic demos: mount when in viewport.
    for cid in ['CMP-0001','CMP-0006','CMP-0008','CMP-0013']:
        page.locator('#entry-'+cid).scroll_into_view_if_needed()
        page.wait_for_function('(id) => document.querySelector(`#entry-${id} [data-demo-id]`)?.dataset.mounted === "true"',arg=cid)
    page.locator('#entry-CMP-0006 [data-segment][value="격자"]').evaluate('e=>{e.checked=true;e.dispatchEvent(new Event("input",{bubbles:true}))}')
    assert page.locator('#entry-CMP-0006 [data-result]').inner_text()=='격자 보기'
    assert page.locator('#entry-CMP-0006 .s-segmented').count()==1
    page.locator('#entry-CMP-0008 [data-bound=min]').evaluate('e=>{e.value="32";e.dispatchEvent(new Event("input",{bubbles:true}))}')
    assert page.locator('#entry-CMP-0008 [data-range-output]').inner_text()=='32–70'
    assert page.locator('#entry-CMP-0008 .s-dual-range').count()==1
    page.locator('#entry-CMP-0013 [data-rating][value="5"]').evaluate('e=>{e.checked=true;e.dispatchEvent(new Event("input",{bubbles:true}))}')
    assert page.locator('#entry-CMP-0013 [data-stars]').inner_text()=='5 / 5'
    assert page.locator('#entry-CMP-0013 .is-filled').count()==5
    print('DEMOS: segment group, dual-thumb range, star rating')

    # Layer self-explains through ? and the actual handle operates the real drawer.
    page.locator('.top-brand [data-help=header]').click()
    assert page.locator('#ui-learn-popover').is_visible()
    assert 'Header' in page.locator('#ui-learn-popover').inner_text()
    page.locator('#drawer-handle').click()
    assert page.locator('#drawer-handle').get_attribute('aria-expanded')=='true'
    assert page.locator('#motion-drawer').get_attribute('aria-hidden')=='false'
    page.locator('#drawer-duration').evaluate('e=>{e.value="510";e.dispatchEvent(new Event("input",{bubbles:true}))}')
    assert page.locator('#drawer-duration-out').inner_text()=='510ms'
    page.locator('#drawer-style-settings [data-density=compact]').click()
    assert page.locator('body').get_attribute('data-density')=='compact'
    page.locator('#drawer-close').click()
    assert page.locator('#motion-drawer').get_attribute('aria-hidden')=='true'
    print('LEARNING: help tooltip, drawer controls, density toggle')

    # Retain motion lab and compact prompt from independent presets.
    page.evaluate('location.hash="#motion"')
    page.locator('.u-preset').first.wait_for()
    assert page.locator('.u-preset').count()==12
    page.locator('[data-add-preset=PST-003]').first.click()
    assert 'Soft Spring' in page.locator('#prompt-output').input_value()
    timeline=page.locator('#motion-time')
    timeline.evaluate('e=>{e.value="350";e.dispatchEvent(new Event("input",{bubbles:true}))}')
    assert page.locator('[data-motion-readout]').inner_text().strip()!='0 ms'
    print('MOTION: 12 presets, timeline, prompt composer')

    # Three viewport sizes with no substantial horizontal overflow.
    for width in [1440,900,390]:
        page.set_viewport_size({'width':width,'height':844})
        page.evaluate('location.hash="#catalog/component"')
        page.locator('#entry-CMP-0001').wait_for()
        page.wait_for_timeout(100)
        extra=page.evaluate('document.documentElement.scrollWidth-document.documentElement.clientWidth')
        assert extra <= 2,(width,extra)
    assert not errors,errors
    print('PASS: 1440 / 900 / 390px, uncaught page errors 0')
    browser.close()
