const { RedNoteTools } = require('./dist/tools/rednoteTools.js');
const path = require('path');
const fs = require('fs');

async function testPublishOnly() {
    console.log('🚀 专门测试 RedNote 发布功能...\n');
    
    try {
        const tools = new RedNoteTools();
        
        // 检查测试图片是否存在
        const testImagePath = path.resolve('./test-assets/test-image.png');
        console.log(`测试图片路径: ${testImagePath}`);
        
        if (!fs.existsSync(testImagePath)) {
            console.log('❌ 测试图片不存在！');
            return;
        }
        
        console.log('✅ 测试图片存在');
        
        // 测试发布功能 (带图片)
        console.log('📤 开始测试发布笔记功能 (带图片)');
        
        const noteParams = {
            title: 'MCP图片测试 - ' + new Date().toLocaleString(),
            content: '这是通过 RedNote MCP 发布的带图片的测试笔记！\n\n🖼️ 测试图片上传功能\n⚡ 自动化发布\n\n感谢使用！',
            tags: ['MCP', '图片测试'],
            images: [testImagePath],
            isPrivate: false
        };
        
        console.log('正在发布笔记，请等待...');
        const publishResult = await tools.addNote(noteParams);
        
        console.log('\n📊 发布结果:');
        if (publishResult.success) {
            console.log('✅ 发布成功!');
            console.log(`📝 消息: ${publishResult.message}`);
            if (publishResult.url) {
                console.log(`🔗 链接: ${publishResult.url}`);
            }
        } else {
            console.log('❌ 发布失败:');
            console.log(`💬 错误信息: ${publishResult.message}`);
        }
        
    } catch (error) {
        console.log(`❌ 测试过程中出错:`);
        console.log(`🐛 错误消息: ${error.message}`);
        console.log(`📝 错误堆栈: ${error.stack}`);
    }
    
    console.log('\n🎉 测试完成!');
}

console.log('开始执行测试...');
testPublishOnly().catch(error => {
    console.error('顶级错误:', error);
}); 