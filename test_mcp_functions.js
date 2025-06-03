const { RedNoteTools } = require('./dist/tools/rednoteTools.js');
const path = require('path');

async function testMCPFunctions() {
    console.log('🚀 开始测试 RedNote MCP 功能...\n');
    
    const tools = new RedNoteTools();
    
    try {
        // 测试1: 搜索笔记功能
        console.log('📝 测试1: 搜索笔记功能');
        console.log('正在搜索关键词: "旅行"...');
        
        try {
            const searchResults = await tools.searchNotes('旅行', 3);
            console.log(`✅ 搜索成功! 找到 ${searchResults.length} 条笔记:`);
            searchResults.forEach((note, index) => {
                console.log(`  ${index + 1}. 标题: ${note.title}`);
                console.log(`     作者: ${note.author}`);
                console.log(`     点赞: ${note.likes || 0}, 收藏: ${note.collects || 0}`);
                console.log(`     链接: ${note.url}`);
                console.log('');
            });
        } catch (error) {
            console.log(`❌ 搜索失败: ${error.message}`);
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // 测试2: 发布笔记功能 (带图片)
        console.log('📤 测试2: 发布笔记功能 (带图片)');
        
        // 检查测试图片是否存在
        const testImagePath = path.resolve('./test-assets/test-image.png');
        console.log(`使用测试图片: ${testImagePath}`);
        
        const noteParams = {
            title: 'MCP测试笔记 - ' + new Date().toLocaleString(),
            content: '这是一条通过 RedNote MCP 发布的测试笔记！\n\n✨ 功能特点:\n- 自动化发布\n- 支持图片上传\n- 支持标签添加\n\n#MCP #测试 #自动化',
            tags: ['MCP', '测试', '自动化发布'],
            images: [testImagePath],
            isPrivate: false
        };
        
        try {
            const publishResult = await tools.addNote(noteParams);
            if (publishResult.success) {
                console.log('✅ 发布成功!');
                console.log(`   消息: ${publishResult.message}`);
                if (publishResult.url) {
                    console.log(`   链接: ${publishResult.url}`);
                }
            } else {
                console.log('❌ 发布失败:');
                console.log(`   错误: ${publishResult.message}`);
            }
        } catch (error) {
            console.log(`❌ 发布过程出错: ${error.message}`);
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // 测试3: 发布纯文本笔记 (无图片)
        console.log('📝 测试3: 发布纯文本笔记');
        
        const textNoteParams = {
            title: '纯文本测试笔记 - ' + new Date().toLocaleString(),
            content: '这是一条纯文本测试笔记，不包含图片。\n\n📱 通过 RedNote MCP 自动发布\n⚡ 快速、简单、高效\n\n#纯文本 #MCP #效率工具',
            tags: ['纯文本', 'MCP', '效率工具'],
            isPrivate: false
        };
        
        try {
            const textPublishResult = await tools.addNote(textNoteParams);
            if (textPublishResult.success) {
                console.log('✅ 纯文本笔记发布成功!');
                console.log(`   消息: ${textPublishResult.message}`);
            } else {
                console.log('❌ 纯文本笔记发布失败:');
                console.log(`   错误: ${textPublishResult.message}`);
            }
        } catch (error) {
            console.log(`❌ 纯文本笔记发布过程出错: ${error.message}`);
        }
        
    } catch (error) {
        console.log(`❌ 测试过程中发生错误: ${error.message}`);
    }
    
    console.log('\n🎉 测试完成!');
}

// 运行测试
testMCPFunctions().catch(console.error); 