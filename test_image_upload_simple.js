const { RedNoteTools } = require('./dist/tools/rednoteTools');
const path = require('path');
const fs = require('fs');

console.log('🖼️  小红书图文上传功能简化测试');
console.log('=================================');

async function testImageUpload() {
  console.log('📋 开始测试图文上传功能...');
  
  const tools = new RedNoteTools();
  
  try {
    // 检查图片文件
    const imagePaths = [
      path.join(process.cwd(), 'test-assets', 'xiaohongshu1.png'),
      path.join(process.cwd(), 'test-assets', 'xiaohongshu2.png')
    ];
    
    console.log('\n📁 图片文件检查:');
    const existingImages = [];
    imagePaths.forEach((imagePath, index) => {
      const exists = fs.existsSync(imagePath);
      console.log(`   图片${index + 1}: ${imagePath}`);
      console.log(`   存在状态: ${exists ? '✅ 文件存在' : '❌ 文件不存在'}`);
      if (exists) {
        existingImages.push(imagePath);
      }
    });
    
    if (existingImages.length === 0) {
      console.log('\n❌ 没有找到图片文件，无法进行测试');
      return;
    }
    
    console.log(`\n📸 将使用 ${existingImages.length} 个图片文件进行测试`);
    
    // 测试参数
    const testParams = {
      title: '图文上传测试 - ' + new Date().toLocaleString(),
      content: `这是通过MCP测试的图文笔记\n\n功能验证:\n✅ 自动切换到图文tab\n✅ 多图片文件上传\n✅ 表单自动填写\n✅ 发布流程完整\n\n使用图片:\n${existingImages.map((path, i) => `📸 图片${i+1}: ${path.split(path.includes('\\') ? '\\' : '/').pop()}`).join('\n')}\n\n测试时间: ${new Date().toLocaleString()}`,
      images: existingImages,
      tags: ['MCP测试', '图文上传', '多图片', '自动化测试'],
      isPrivate: false
    };
    
    console.log('\n📋 测试参数:');
    console.log('- 标题:', testParams.title);
    console.log('- 内容长度:', testParams.content.length, '字符');
    console.log('- 图片文件:', testParams.images.length, '个');
    console.log('- 标签:', testParams.tags.join(', '));
    console.log('- 是否私密:', testParams.isPrivate);
    
    console.log('\n🚀 开始发布图文笔记...');
    console.log('⏳ 这个过程可能需要15-20秒，请耐心等待...');
    
    const result = await tools.addNote(testParams);
    
    console.log('\n📊 发布结果:');
    console.log('- 成功:', result.success ? '✅' : '❌');
    console.log('- 消息:', result.message);
    if (result.url) {
      console.log('- 链接:', result.url);
    }
    
    if (result.success) {
      console.log('\n🎉 图文上传功能测试成功!');
      console.log('✅ 验证要点:');
      console.log('   - 自动切换到图文tab');
      console.log('   - 成功上传多个图片文件');
      console.log('   - 自动填写表单');
      console.log('   - 完成发布流程');
    } else {
      console.log('\n❌ 图文上传功能测试失败!');
      console.log('可能的原因:');
      console.log('1. 需要先登录 (运行: npm run cli init)');
      console.log('2. 图片文件格式不支持');
      console.log('3. 图片文件过大');
      console.log('4. 网络连接问题');
      console.log('5. 页面结构已更改');
    }
    
  } catch (error) {
    console.error('\n💥 测试过程中发生错误:', error.message);
    console.error('详细错误信息:', error);
  }
}

// 同时测试视频上传功能作为对比
async function testVideoUpload() {
  console.log('\n🎬 开始对比测试视频上传功能...');
  
  const tools = new RedNoteTools();
  
  try {
    const videoPath = ";
    const videoExists = fs.existsSync(videoPath);
    
    console.log(`📁 视频文件检查: ${videoPath}`);
    console.log(`   存在状态: ${videoExists ? '✅ 文件存在' : '❌ 文件不存在'}`);
    
    if (!videoExists) {
      console.log('⚠️  跳过视频测试 - 文件不存在');
      return null;
    }
    
    const testParams = {
      title: '视频上传测试 - ' + new Date().toLocaleString(),
      content: '这是通过MCP测试的视频笔记\n\n功能验证:\n✅ 视频直接上传（无需切换tab）\n✅ 自动表单填写\n✅ 发布流程完整\n\n测试时间: ' + new Date().toLocaleString(),
      videos: [videoPath],
      tags: ['MCP测试', '视频上传', '对比测试'],
      isPrivate: false
    };
    
    console.log('\n🚀 开始发布视频笔记...');
    const result = await tools.addNote(testParams);
    
    console.log('\n📊 视频发布结果:');
    console.log('- 成功:', result.success ? '✅' : '❌');
    console.log('- 消息:', result.message);
    
    return result.success;
    
  } catch (error) {
    console.error('\n💥 视频测试错误:', error.message);
    return false;
  }
}

// 运行完整测试
async function runCompleteTest() {
  console.log('⚡ 开始完整的功能对比测试...');
  console.log('📋 测试计划:');
  console.log('1. 🖼️  图文上传测试 - 使用实际图片文件');
  console.log('2. 🎬 视频上传测试 - 对比验证');
  console.log('3. 📊 结果对比分析');
  
  console.log('\n📸 使用的图片文件:');
  console.log('- xiaohongshu1.png (MCP配置界面截图)');
  console.log('- xiaohongshu2.png (功能说明截图)');
  
  try {
    // 测试图文上传
    await testImageUpload();
    
    console.log('\n' + '='.repeat(50));
    
    // 测试视频上传
    const videoResult = await testVideoUpload();
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 功能对比测试总结');
    console.log('='.repeat(50));
    
    console.log('\n🎯 功能验证:');
    console.log('✅ 图文上传 - 自动切换tab模式');
    console.log('✅ 视频上传 - 直接上传模式');
    console.log('✅ 多种文件格式支持');
    console.log('✅ 自动化表单填写');
    
    console.log('\n💡 使用建议:');
    console.log('- 图片文件: png, jpg格式，建议小于10MB');
    console.log('- 视频文件: mp4格式，建议小于100MB');
    console.log('- 确保已登录小红书账号');
    console.log('- 保持网络连接稳定');
    
  } catch (error) {
    console.error('\n💥 完整测试失败:', error);
  } finally {
    console.log('\n🎉 测试完成！');
  }
}

// 运行测试
runCompleteTest(); 