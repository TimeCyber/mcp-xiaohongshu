const { RedNoteTools } = require('./dist/tools/rednoteTools.js');
const { AuthManager } = require('./dist/auth/authManager.js');

async function debugPageStructure() {
    console.log('🔍 调试页面结构...\n');

    const authManager = new AuthManager();
    let browser, page;

    try {
        // 启动浏览器
        browser = await authManager.getBrowser();
        page = await browser.newPage();

        // 加载cookies
        const cookies = await authManager.getCookies();
        if (cookies.length > 0) {
            await page.context().addCookies(cookies);
            console.log('✅ Cookies已加载');
        }

        // 导航到发布页面
        console.log('🌐 导航到发布页面...');
        await page.goto('https://creator.xiaohongshu.com/publish/publish', {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        await page.waitForTimeout(3000);

        // 尝试点击上传图文tab
        console.log('🖱️ 尝试点击"上传图文"tab...');
        try {
            // 使用JavaScript强制点击
            const tabClicked = await page.evaluate(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                for (const el of elements) {
                    if (el.textContent?.includes('上传图文') && el.textContent.trim() === '上传图文') {
                        console.log('Found tab element:', el);
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.click();
                        return true;
                    }
                }
                return false;
            });

            if (tabClicked) {
                console.log('✅ 成功点击"上传图文"tab (JavaScript)');
                await page.waitForTimeout(3000);
            } else {
                console.log('❌ JavaScript点击失败，尝试备用方案...');
                
                // 备用方案
                const tabElement = await page.locator('text=上传图文').first();
                await tabElement.scrollIntoViewIfNeeded();
                await tabElement.click({ force: true });
                console.log('✅ 成功点击"上传图文"tab (Playwright force)');
                await page.waitForTimeout(3000);
            }
        } catch (error) {
            console.log('❌ 点击tab失败:', error.message);
        }

        // 获取页面HTML结构
        console.log('📋 分析页面结构...');
        
        // 查找所有输入框
        const inputs = await page.$$eval('input, textarea, div[contenteditable="true"]', elements => {
            return elements.map((el, index) => ({
                index,
                tagName: el.tagName,
                type: el.type || '',
                placeholder: el.placeholder || '',
                name: el.name || '',
                id: el.id || '',
                className: el.className || '',
                contentEditable: el.contentEditable || 'false'
            }));
        });

        console.log('🔍 找到的输入元素:');
        inputs.forEach(input => {
            console.log(`  ${input.index}: ${input.tagName} | type:${input.type} | placeholder:"${input.placeholder}" | name:"${input.name}" | id:"${input.id}" | class:"${input.className}" | contentEditable:${input.contentEditable}`);
        });

        // 查找包含特定文本的元素
        console.log('\n📝 查找可能的标题和内容区域...');
        const textElements = await page.$$eval('*', elements => {
            return Array.from(elements)
                .filter(el => {
                    const text = el.textContent || '';
                    return text.includes('标题') || text.includes('描述') || text.includes('内容') || text.includes('添加');
                })
                .slice(0, 10) // 只取前10个
                .map((el, index) => ({
                    index,
                    tagName: el.tagName,
                    textContent: (el.textContent || '').substring(0, 50),
                    className: el.className || '',
                    id: el.id || ''
                }));
        });

        textElements.forEach(el => {
            console.log(`  相关元素: ${el.tagName} | text:"${el.textContent}" | class:"${el.className}" | id:"${el.id}"`);
        });

        // 截图保存当前状态
        await page.screenshot({ path: 'debug-current-page.png', fullPage: true });
        console.log('\n📸 页面截图已保存: debug-current-page.png');

    } catch (error) {
        console.error('❌ 调试过程出错:', error);
    } finally {
        if (page) await page.close();
        if (browser) await browser.close();
    }

    console.log('\n✅ 调试完成！');
}

// 运行调试
debugPageStructure().catch(console.error); 