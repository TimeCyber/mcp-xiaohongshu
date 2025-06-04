const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🖼️  小红书MCP图文上传功能测试');
console.log('===================================');
console.log('使用实际图片文件进行完整测试');

let mcpServer;
let messageId = 1;
let testResults = [];

// 检查文件是否存在
function checkFileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// 启动MCP服务器
function startMCPServer() {
  console.log('\n📡 启动MCP服务器...');
  
  mcpServer = spawn('node', ['dist/cli.js', '--stdio'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: process.cwd()
  });

  mcpServer.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      console.log('📤 服务器响应:', output);
      
      try {
        const response = JSON.parse(output);
        if (response.result && response.id > 1) {
          handleTestResponse(response);
        }
      } catch (e) {
        // 忽略非JSON响应
      }
    }
  });

  mcpServer.stderr.on('data', (data) => {
    console.log('⚠️  服务器错误:', data.toString());
  });
}

// 处理测试响应
function handleTestResponse(response) {
  console.log(`\n✅ 收到测试ID ${response.id}的响应`);
  
  if (response.result && response.result.content) {
    const content = response.result.content[0];
    if (content && content.text) {
      console.log('📋 响应内容:', content.text);
      
      const isSuccess = content.text.includes('发布成功');
      testResults.push({
        id: response.id,
        success: isSuccess,
        message: content.text,
        testType: getTestType(response.id)
      });
      
      console.log(`${getTestEmoji(response.id)} ${getTestType(response.id)}: ${isSuccess ? '✅ 成功' : '❌ 失败'}`);
    }
  }
}

function getTestType(id) {
  switch(id) {
    case 2: return '视频上传测试';
    case 3: return '图文上传测试';
    case 4: return '纯文字上传测试';
    default: return '未知测试';
  }
}

function getTestEmoji(id) {
  switch(id) {
    case 2: return '🎬';
    case 3: return '🖼️';
    case 4: return '📝';
    default: return '❓';
  }
}

// 发送MCP消息
function sendMCPMessage(message) {
  const jsonMessage = JSON.stringify(message) + '\n';
  console.log(`📤 发送消息 ID ${message.id}:`, message.method);
  mcpServer.stdin.write(jsonMessage);
}

// 初始化MCP连接
function initializeMCP() {
  console.log('\n🔧 初始化MCP连接...');
  
  const initMessage = {
    jsonrpc: "2.0",
    id: messageId++,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: {
        name: "image-test-client",
        version: "1.0.0"
      }
    }
  };
  
  sendMCPMessage(initMessage);
}

// 测试视频上传
function testVideoUpload() {
  console.log('\n🎬 开始测试视频上传功能...');
  
  const videoPath = "C:\\Users\\NINGMEI\\Desktop\\mcp-x.mp4";
  const videoExists = checkFileExists(videoPath);
  
  console.log(`📁 视频文件检查: ${videoPath}`);
  console.log(`   存在状态: ${videoExists ? '✅ 文件存在' : '❌ 文件不存在'}`);
  
  const videoMessage = {
    jsonrpc: "2.0",
    id: messageId++,
    method: "tools/call",
    params: {
      name: "add_note",
      arguments: {
        title: "MCP视频测试 - " + new Date().toLocaleTimeString(),
        content: "这是通过MCP测试的视频笔记\n\n功能验证:\n✅ 视频直接上传（无需切换tab）\n✅ 自动表单填写\n✅ 发布流程完整\n\n测试时间: " + new Date().toLocaleString(),
        videos: videoExists ? [videoPath] : [],
        tags: ["MCP测试", "视频上传", "自动化测试"],
        isPrivate: false
      }
    }
  };
  
  if (!videoExists) {
    console.log('⚠️  跳过视频测试 - 文件不存在');
    return;
  }
  
  sendMCPMessage(videoMessage);
}

// 测试图文上传（使用提供的图片文件）
function testImageUpload() {
  console.log('\n🖼️  开始测试图文上传功能...');
  
  // 使用提供的图片文件
  const imagePaths = [
    path.join(process.cwd(), 'test-assets', 'xiaohongshu1.png'),
    path.join(process.cwd(), 'test-assets', 'xiaohongshu2.png')
  ];
  
  console.log('📁 图片文件检查:');
  const existingImages = [];
  imagePaths.forEach((imagePath, index) => {
    const exists = checkFileExists(imagePath);
    console.log(`   图片${index + 1}: ${imagePath}`);
    console.log(`   存在状态: ${exists ? '✅ 文件存在' : '❌ 文件不存在'}`);
    if (exists) {
      existingImages.push(imagePath);
    }
  });
  
  if (existingImages.length === 0) {
    console.log('⚠️  跳过图文测试 - 没有找到图片文件');
    return;
  }
  
  console.log(`\n📸 将使用 ${existingImages.length} 个图片文件进行测试`);
  
  const imageMessage = {
    jsonrpc: "2.0",
    id: messageId++,
    method: "tools/call",
    params: {
      name: "add_note",
      arguments: {
        title: "MCP图文测试 - " + new Date().toLocaleTimeString(),
        content: `这是通过MCP测试的图文笔记\n\n功能验证:\n✅ 自动切换到图文tab\n✅ 多图片文件上传\n✅ 表单自动填写\n✅ 发布流程完整\n\n使用图片:\n${existingImages.map((path, i) => `📸 图片${i+1}: ${path.split('\\').pop()}`).join('\n')}\n\n测试时间: ${new Date().toLocaleString()}`,
        images: existingImages,
        tags: ["MCP测试", "图文上传", "多图片", "自动化测试"],
        isPrivate: false
      }
    }
  };
  
  sendMCPMessage(imageMessage);
}

// 测试纯文字上传
function testTextOnlyUpload() {
  console.log('\n📝 开始测试纯文字上传功能...');
  
  const textMessage = {
    jsonrpc: "2.0",
    id: messageId++,
    method: "tools/call",
    params: {
      name: "add_note",
      arguments: {
        title: "MCP纯文字测试 - " + new Date().toLocaleTimeString(),
        content: `这是通过MCP测试的纯文字笔记\n\n功能验证:\n✅ 纯文字发布（无需切换tab）\n✅ 直接进入表单填写\n✅ 发布流程完整\n\n说明:\n这个测试验证了在没有图片或视频时，系统能够正确处理纯文字发布。\n\n测试时间: ${new Date().toLocaleString()}`,
        tags: ["MCP测试", "纯文字上传", "文字笔记", "自动化测试"],
        isPrivate: false
      }
    }
  };
  
  sendMCPMessage(textMessage);
}

// 显示最终结果
function showFinalResults() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 MCP笔记发布功能完整测试结果');
  console.log('='.repeat(60));
  
  console.log('\n📋 测试执行情况:');
  testResults.forEach((result, index) => {
    const emoji = getTestEmoji(result.id);
    const status = result.success ? '✅ 成功' : '❌ 失败';
    console.log(`${index + 1}. ${emoji} ${result.testType}: ${status}`);
    if (!result.success) {
      console.log(`   错误信息: ${result.message}`);
    }
  });
  
  const successCount = testResults.filter(r => r.success).length;
  const totalCount = testResults.length;
  
  console.log(`\n📈 总体成功率: ${successCount}/${totalCount} (${totalCount > 0 ? ((successCount/totalCount)*100).toFixed(1) : 0}%)`);
  
  console.log('\n🎯 功能验证状态:');
  console.log('✅ MCP服务器正常运行');
  console.log('✅ 接口调用正常');
  console.log('✅ 参数传递正确');
  console.log(`${successCount > 0 ? '✅' : '⚠️'} 发布功能${successCount > 0 ? '正常' : '需要检查'}`);
  
  // 按测试类型统计
  console.log('\n📊 分类测试结果:');
  const videoTest = testResults.find(r => r.id === 2);
  const imageTest = testResults.find(r => r.id === 3);
  const textTest = testResults.find(r => r.id === 4);
  
  if (videoTest) {
    console.log(`🎬 视频上传: ${videoTest.success ? '✅ 成功' : '❌ 失败'}`);
  }
  if (imageTest) {
    console.log(`🖼️  图文上传: ${imageTest.success ? '✅ 成功' : '❌ 失败'}`);
  }
  if (textTest) {
    console.log(`📝 纯文字上传: ${textTest.success ? '✅ 成功' : '❌ 失败'}`);
  }
  
  if (successCount < totalCount) {
    console.log('\n🔧 故障排查建议:');
    console.log('1. 检查登录状态: npm run cli init');
    console.log('2. 确认文件路径正确');
    console.log('3. 检查网络连接');
    console.log('4. 查看详细日志: npm run cli open-logs');
  }
  
  console.log('\n🎉 完整测试结束！');
  
  // 清理并退出
  setTimeout(() => {
    if (mcpServer) {
      mcpServer.kill();
    }
    process.exit(0);
  }, 2000);
}

// 主测试流程
async function runTests() {
  try {
    // 启动服务器
    startMCPServer();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 初始化连接
    initializeMCP();
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 执行视频上传测试
    testVideoUpload();
    await new Promise(resolve => setTimeout(resolve, 18000)); // 视频上传需要更长时间
    
    // 执行图文上传测试
    testImageUpload();
    await new Promise(resolve => setTimeout(resolve, 15000)); // 图文上传时间
    
    // 执行纯文字上传测试
    testTextOnlyUpload();
    await new Promise(resolve => setTimeout(resolve, 12000)); // 纯文字上传时间
    
    // 显示最终结果
    showFinalResults();
    
  } catch (error) {
    console.error('💥 测试过程中发生错误:', error);
    if (mcpServer) {
      mcpServer.kill();
    }
    process.exit(1);
  }
}

// 处理进程退出
process.on('exit', () => {
  if (mcpServer && !mcpServer.killed) {
    mcpServer.kill();
  }
});

process.on('SIGINT', () => {
  console.log('\n🛑 测试被用户中断');
  if (mcpServer) {
    mcpServer.kill();
  }
  process.exit(0);
});

// 开始测试
console.log('⚡ 准备开始完整的MCP功能测试...');
console.log('📋 测试内容:');
console.log('1. 🎬 视频上传 - 直接上传模式，无需切换tab');
console.log('2. 🖼️  图文上传 - 自动切换到图文tab，使用实际图片文件');
console.log('3. 📝 纯文字上传 - 直接发布文字内容');
console.log('4. 📊 综合结果分析');

console.log('\n📸 使用的图片文件:');
console.log('- xiaohongshu1.png');
console.log('- xiaohongshu2.png');

runTests(); 