"""UI2YA v0.4 static standalone inlined source browser smoke tests.
The runner uses set_content because the execution environment blocks browser URL navigation.
"""
from playwright.sync_api import sync_playwright
from pathlib import Path

HTML=Path(__file__).resolve().parent.parent/'UI2YA.html'

def check(page,errors):
    assert not errors, errors
    assert page.locator('main h1').count()==1
    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'), 'horizontal overflow'

with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
    page=browser.new_page(viewport={'width':1440,'height':900})
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(HTML.read_text(encoding='utf-8'),wait_until='load')
    page.wait_for_timeout(350)
    assert page.locator('.u-demo-card').count()>=35
    assert page.locator('.u-input-studio').count()==3
    assert not page.locator('#primary-nav a[data-section=references]').count()
    check(page,errors)
    # Accurate meaning / interactive selection controls
    page.locator('#primary-nav [data-group=selection]').click()
    page.wait_for_timeout(150)
    assert page.locator('.u-demo-card').count()==13
    segment=page.locator('#entry-CMP-0006 .s-segmented')
    assert segment.count()==1
    segment.locator('input[data-segment][value="격자"]').check(force=True)
    assert segment.locator('input[value="격자"]').is_checked()
    assert segment.get_attribute('style').find('100%')>=0
    rating=page.locator('#entry-CMP-0013')
    rating.scroll_into_view_if_needed()
    page.wait_for_timeout(120)
    rating.locator('input[data-rating][value="5"]').check(force=True)
    assert rating.locator('.is-filled').count()==5
    range_=page.locator('#entry-CMP-0008')
    range_.scroll_into_view_if_needed()
    page.wait_for_timeout(120)
    assert range_.locator('input[data-bound]').count()==2
    range_.locator('input[data-bound="min"]').fill('37')
    range_.locator('input[data-bound="max"]').fill('81')
    assert '37–81' in range_.locator('[data-range-output]').inner_text()
    # Inputs are 3 family studios, 17 independent variants; Color Picker variants
    page.locator('#primary-nav [data-group=input]').click()
    page.wait_for_timeout(150)
    assert page.locator('.u-input-tabs [data-input-variant]').count()==17
    page.locator('button[data-input-variant=color]').click()
    assert page.locator('.u-color-tabs button').count()==4
    page.locator('button[data-color-swatch="#DE8351"]').click()
    assert page.locator('[data-color-output]').inner_text()=='#DE8351'
    page.locator('button[data-color-tab=wheel]').click()
    assert page.locator('[data-color-wheel]').is_visible()
    page.locator('[data-color-wheel]').focus()
    page.keyboard.press('ArrowRight')
    page.locator('button[data-color-tab=code]').click()
    page.locator('[data-color-hex]').fill('#00BEEF')
    page.locator('[data-color-hex]').dispatch_event('change')
    assert page.locator('[data-color-output]').inner_text()=='#00BEEF'
    check(page,errors)
    # Global plain-language discovery
    page.locator('#search-expand').click()
    page.locator('#find').fill('스르륵 움직이는 탭')
    page.locator('#global-search').evaluate('(form)=>form.requestSubmit()')
    page.wait_for_timeout(220)
    assert page.locator('main h1').inner_text()=='검색 결과'
    assert page.locator('#entry-MOT-0015').count()==1
    # Motion separate copy and composer
    page.locator('a[data-section=motion]').click()
    page.wait_for_timeout(150)
    assert page.locator('.u-preset').count()==12
    page.locator('.u-preset button[data-copy-item]').first.click()
    page.locator('.u-preset button[data-add-preset]').first.click()
    assert page.locator('#dock-count').inner_text()!='비어 있음'
    page.locator('#dock-toggle').click()
    assert page.locator('#prompt-output').is_visible()
    assert 'UI2YA' in page.locator('#prompt-output').input_value()
    page.locator('#prompt-clear').click()
    assert page.locator('#dock-count').inner_text()=='비어 있음'
    assert not page.locator('#prompt-output').is_visible()
    # Theme change and Drawer motion settings persist
    page.locator('button[data-select-style=glass]').first.click()
    assert page.locator('body').get_attribute('data-theme')=='glass'
    page.locator('.topbar button[data-mode=dark]').click()
    assert page.locator('body').get_attribute('data-dark')=='true'
    page.locator('#drawer-handle').click()
    assert page.locator('#motion-drawer').get_attribute('aria-hidden')=='false'
    page.locator('#drawer-duration').fill('420')
    assert page.locator('#drawer-duration-out').inner_text()=='420ms'
    page.locator('#drawer-close').click()
    check(page,errors)
    # All viewport widths, across 4 skins
    for width in [390,900,1440]:
        page.set_viewport_size({'width':width,'height':850})
        for style in ['flat2','glass','material-you','neo-brutal']:
            page.locator(f'button[data-select-style="{style}"]').first.click()
            page.wait_for_timeout(75)
            assert page.locator('body').get_attribute('data-theme')==style
            check(page,errors)
    print('PASS: selection/rating/range/color/terms/search/prompt/drawer/themes 390/900/1440')
    browser.close()
