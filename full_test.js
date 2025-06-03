const { AuthManager } = require('./dist/auth/authManager.js');
const path = require('path');

async function fullPublishTest() {
    console.log('🚀 完整发布流程测试...\n');

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

        // 1. 导航到发布页面
        console.log('🌐 导航到发布页面...');
        await page.goto('https://creator.xiaohongshu.com/publish/publish', {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });
        await page.waitForTimeout(3000);

        // 2. 切换到"上传图文"tab
        console.log('🖱️ 切换到"上传图文"tab...');
        const tabClicked = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('*'));
            for (const el of elements) {
                if (el.textContent?.includes('上传图文') && el.textContent.trim() === '上传图文') {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.click();
                    return true;
                }
            }
            return false;
        });

        if (tabClicked) {
            console.log('✅ 成功切换到"上传图文"tab');
            await page.waitForTimeout(3000);
        } else {
            throw new Error('无法切换到上传图文tab');
        }

        // 3. 上传图片
        console.log('📸 上传测试图片...');
        const testImagePath = path.resolve('./test-assets/test-image.png');
        const fileInput = await page.$('input[type="file"]');
        
        if (!fileInput) {
            throw new Error('未找到文件上传输入框');
        }

        await fileInput.setInputFiles([testImagePath]);
        console.log('✅ 图片已选择');
        
        // 等待图片上传处理
        await page.waitForTimeout(5000);

        // 4. 再次检查页面结构
        console.log('🔍 检查上传后的页面结构...');
        const inputsAfterUpload = await page.$$eval('input, textarea, div[contenteditable="true"]', elements => {
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

        console.log('📝 上传后找到的输入元素:');
        inputsAfterUpload.forEach(input => {
            console.log(`  ${input.index}: ${input.tagName} | type:${input.type} | placeholder:"${input.placeholder}" | name:"${input.name}" | id:"${input.id}" | class:"${input.className}"`);
        });

        // 5. 查找并填写标题
        console.log('✍️ 尝试填写标题...');
        const titleSelectors = [
            'input[placeholder*="标题"]',
            'input[placeholder*="请输入标题"]', 
            'input[placeholder*="添加标题"]',
            'input[type="text"]',
            'div[contenteditable="true"]',
            'textarea[placeholder*="标题"]'
        ];

        let titleFilled = false;
        for (const selector of titleSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 3000 });
                await page.fill(selector, '🔥 MCP测试标题');
                console.log(`✅ 标题填写成功 (${selector})`);
                titleFilled = true;
                break;
            } catch {
                continue;
            }
        }

        if (!titleFilled) {
            console.log('❌ 未能找到标题输入框');
        }

        // 6. 查找并填写内容
        console.log('✍️ 尝试填写内容...');
        const contentSelectors = [
            'textarea[placeholder*="描述"]',
            'textarea[placeholder*="请输入正文"]',
            'textarea[placeholder*="添加描述"]',
            'textarea',
            'div[contenteditable="true"]:not([placeholder*="标题"])'
        ];

        let contentFilled = false;
        for (const selector of contentSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 3000 });
                await page.fill(selector, '这是通过MCP自动发布的测试内容！\n\n🚀 自动化测试\n⚡ 效率工具');
                console.log(`✅ 内容填写成功 (${selector})`);
                contentFilled = true;
                break;
            } catch {
                continue;
            }
        }

        if (!contentFilled) {
            console.log('❌ 未能找到内容输入框');
        }

        // 7. 截图保存当前状态
        await page.screenshot({ path: 'full-test-result.png', fullPage: true });
        console.log('📸 完整测试截图已保存: full-test-result.png');

        // 8. 查找发布按钮
        console.log('🔍 查找发布按钮...');
        const publishButtons = await page.$$eval('button, input[type="submit"]', elements => {
            return elements.map((el, index) => ({
                index,
                tagName: el.tagName,
                type: el.type || '',
                textContent: (el.textContent || '').trim(),
                className: el.className || '',
                id: el.id || ''
            })).filter(btn => 
                btn.textContent.includes('发布') || 
                btn.textContent.includes('立即发布') ||
                btn.textContent.includes('提交')
            );
        });

        console.log('🎯 找到的发布按钮:');
        publishButtons.forEach(btn => {
            console.log(`  发布按钮: ${btn.tagName} | text:"${btn.textContent}" | class:"${btn.className}"`);
        });

    } catch (error) {
        console.error('❌ 测试过程出错:', error);
    } finally {
        if (page) await page.close();
        if (browser) await browser.close();
    }

    console.log('\n✅ 完整测试完成！');
}

// 运行测试
fullPublishTest().catch(console.error); 