const { RedNoteTools } = require('./dist/tools/rednoteTools.js');
const path = require('path');
const fs = require('fs');

async function manualTest() {
    console.log('🔧 手动测试 RedNote MCP 发布功能');
    console.log('这个测试会打开浏览器，请手动确保登录状态正确\n');

    try {
        const tools = new RedNoteTools();
        
        // 检查测试图片
        const testImagePath = path.resolve('./test-assets/test-image.png');
        if (!fs.existsSync(testImagePath)) {
            console.log('❌ 测试图片不存在，将创建一个简单的纯文本测试');
        } else {
            console.log('✅ 找到测试图片:', testImagePath);
        }

        console.log('\n🚀 开始测试发布功能...');
        console.log('⏰ 请确保您已经在浏览器中登录了小红书账号');
        console.log('📱 特别是要登录创作者平台 (creator.xiaohongshu.com)\n');

        // 准备测试参数
        const testParams = {
            title: '🔥 MCP自动化测试笔记',
            content: `这是一条通过 RedNote MCP 自动发布的测试笔记！

🚀 测试时间: ${new Date().toLocaleString()}

✨ 功能特点:
• 自动化内容发布
• 智能图片上传  
• 标签自动添加
• 隐私设置控制

🔧 技术栈:
• Model Context Protocol (MCP)
• Playwright 自动化
• TypeScript 开发

感谢您测试这个工具！

#MCP #自动化 #小红书 #测试`,
            tags: ['MCP', '自动化', '小红书测试'],
            isPrivate: false
        };

        // 如果有图片就加上
        if (fs.existsSync(testImagePath)) {
            testParams.images = [testImagePath];
            console.log('📸 将上传测试图片');
        }

        console.log('📝 测试参数:');
        console.log(`   标题: ${testParams.title}`);
        console.log(`   标签: ${testParams.tags.join(', ')}`);
        console.log(`   图片: ${testParams.images ? '是' : '否'}`);
        console.log(`   隐私: ${testParams.isPrivate ? '私密' : '公开'}`);

        console.log('\n⚡ 开始发布...');
        
        // 执行发布
        const result = await tools.addNote(testParams);
        
        console.log('\n📊 发布结果:');
        console.log('====================================');
        if (result.success) {
            console.log('🎉 发布成功！');
            console.log(`✅ 状态: ${result.message}`);
            if (result.url) {
                console.log(`🔗 链接: ${result.url}`);
            }
        } else {
            console.log('❌ 发布失败');
            console.log(`💥 错误: ${result.message}`);
            
            // 提供故障排除建议
            console.log('\n🔧 故障排除建议:');
            console.log('1. 确保您已登录小红书主站 (www.xiaohongshu.com)');
            console.log('2. 确保您已登录创作者平台 (creator.xiaohongshu.com)');
            console.log('3. 尝试重新运行: node dist/cli.js init 30');
            console.log('4. 检查网络连接和防火墙设置');
        }

    } catch (error) {
        console.log('\n💥 测试过程中发生异常:');
        console.log(`🐛 错误类型: ${error.name}`);
        console.log(`📝 错误消息: ${error.message}`);
        console.log(`📍 错误堆栈: ${error.stack}`);
    }

    console.log('\n🎯 测试完成！');
}

// 运行测试
console.log('启动手动测试...\n');
manualTest().catch(error => {
    console.error('🚨 顶级错误:', error);
}); 