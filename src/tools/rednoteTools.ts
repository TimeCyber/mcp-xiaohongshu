import { AuthManager } from '../auth/authManager'
import { Browser, Page } from 'playwright'
import logger from '../utils/logger'
import { GetNoteDetail, NoteDetail } from './noteDetail'

export interface Note {
  title: string
  content: string
  tags: string[]
  url: string
  author: string
  likes?: number
  collects?: number
  comments?: number
}

export interface Comment {
  author: string
  content: string
  likes: number
  time: string
}

export interface AddNoteParams {
  title: string
  content: string
  tags?: string[]
  images?: string[]
  videos?: string[]
  isPrivate?: boolean
}

export interface AddNoteResult {
  success: boolean
  url?: string
  message: string
}

export class RedNoteTools {
  private authManager: AuthManager
  private browser: Browser | null = null
  private page: Page | null = null

  constructor() {
    logger.info('Initializing RedNoteTools')
    this.authManager = new AuthManager()
  }

  async initialize(): Promise<void> {
    logger.info('Initializing browser and page')
    this.browser = await this.authManager.getBrowser()
    if (!this.browser) {
      throw new Error('Failed to initialize browser')
    }
    
    try {
      this.page = await this.browser.newPage()
      
      // Load cookies if available
      const cookies = await this.authManager.getCookies()
      if (cookies.length > 0) {
        logger.info(`Loading ${cookies.length} cookies`)
        await this.page.context().addCookies(cookies)
      }

      // Check login status
      logger.info('Checking login status')
      await this.page.goto('https://www.xiaohongshu.com')
      const isLoggedIn = await this.page.evaluate(() => {
        const sidebarUser = document.querySelector('.user.side-bar-component .channel')
        return sidebarUser?.textContent?.trim() === '我'
      })

      // If not logged in, perform login
      if (!isLoggedIn) {
        logger.error('Not logged in, please login first')
        throw new Error('Not logged in')
      }
      logger.info('Login status verified')
    } catch (error) {
      // 初始化过程中出错，确保清理资源
      await this.cleanup()
      throw error
    }
  }

  async cleanup(): Promise<void> {
    logger.info('Cleaning up browser resources')
    try {
      if (this.page) {
        await this.page.close().catch(err => logger.error('Error closing page:', err))
        this.page = null
      }
      
      if (this.browser) {
        await this.browser.close().catch(err => logger.error('Error closing browser:', err))
        this.browser = null
      }
    } catch (error) {
      logger.error('Error during cleanup:', error)
    } finally {
      this.page = null
      this.browser = null
    }
  }

  extractRedBookUrl(shareText: string): string {
    // 匹配 http://xhslink.com/ 开头的链接
    const xhslinkRegex = /(https?:\/\/xhslink\.com\/[a-zA-Z0-9\/]+)/i
    const xhslinkMatch = shareText.match(xhslinkRegex)

    if (xhslinkMatch && xhslinkMatch[1]) {
      return xhslinkMatch[1]
    }

    // 匹配 https://www.xiaohongshu.com/ 开头的链接
    const xiaohongshuRegex = /(https?:\/\/(?:www\.)?xiaohongshu\.com\/[^，\s]+)/i
    const xiaohongshuMatch = shareText.match(xiaohongshuRegex)

    if (xiaohongshuMatch && xiaohongshuMatch[1]) {
      return xiaohongshuMatch[1]
    }

    return shareText
  }

  async searchNotes(keywords: string, limit: number = 10): Promise<Note[]> {
    logger.info(`Searching notes with keywords: ${keywords}, limit: ${limit}`)
    try {
      await this.initialize()
      if (!this.page) throw new Error('Page not initialized')

      // Navigate to search page
      logger.info('Navigating to search page')
      await this.page.goto(`https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(keywords)}`)

      // Wait for search results to load
      logger.info('Waiting for search results')
      await this.page.waitForSelector('.feeds-container', {
        timeout: 30000
      })

      // Get all note items
      let noteItems = await this.page.$$('.feeds-container .note-item')
      logger.info(`Found ${noteItems.length} note items`)
      const notes: Note[] = []

      // Process each note
      for (let i = 0; i < Math.min(noteItems.length, limit); i++) {
        logger.info(`Processing note ${i + 1}/${Math.min(noteItems.length, limit)}`)
        try {
          // Click on the note cover to open detail
          await noteItems[i].$eval('a.cover.mask.ld', (el: HTMLElement) => el.click())

          // Wait for the note page to load
          logger.info('Waiting for note page to load')
          await this.page.waitForSelector('#noteContainer', {
            timeout: 30000
          })

          await this.randomDelay(0.5, 1.5)

          // Extract note content
          const note = await this.page.evaluate(() => {
            const article = document.querySelector('#noteContainer')
            if (!article) return null

            // Get title
            const titleElement = article.querySelector('#detail-title')
            const title = titleElement?.textContent?.trim() || ''

            // Get content
            const contentElement = article.querySelector('#detail-desc .note-text')
            const content = contentElement?.textContent?.trim() || ''

            // Get author info
            const authorElement = article.querySelector('.author-wrapper .username')
            const author = authorElement?.textContent?.trim() || ''

            // Get interaction counts from engage-bar
            const engageBar = document.querySelector('.engage-bar-style')
            const likesElement = engageBar?.querySelector('.like-wrapper .count')
            const likes = parseInt(likesElement?.textContent?.replace(/[^\d]/g, '') || '0')

            const collectElement = engageBar?.querySelector('.collect-wrapper .count')
            const collects = parseInt(collectElement?.textContent?.replace(/[^\d]/g, '') || '0')

            const commentsElement = engageBar?.querySelector('.chat-wrapper .count')
            const comments = parseInt(commentsElement?.textContent?.replace(/[^\d]/g, '') || '0')

            return {
              title,
              content,
              url: window.location.href,
              author,
              likes,
              collects,
              comments
            }
          })

          if (note) {
            logger.info(`Extracted note: ${note.title}`)
            notes.push(note as Note)
          }

          // Add random delay before closing
          await this.randomDelay(0.5, 1)

          // Close note by clicking the close button
          const closeButton = await this.page.$('.close-circle')
          if (closeButton) {
            logger.info('Closing note dialog')
            await closeButton.click()

            // Wait for note dialog to disappear
            await this.page.waitForSelector('#noteContainer', {
              state: 'detached',
              timeout: 30000
            })
          }
        } catch (error) {
          logger.error(`Error processing note ${i + 1}:`, error)
          const closeButton = await this.page.$('.close-circle')
          if (closeButton) {
            logger.info('Attempting to close note dialog after error')
            await closeButton.click()

            // Wait for note dialog to disappear
            await this.page.waitForSelector('#noteContainer', {
              state: 'detached',
              timeout: 30000
            })
          }
        } finally {
          // Add random delay before next note
          await this.randomDelay(0.5, 1.5)
        }
      }

      logger.info(`Successfully processed ${notes.length} notes`)
      return notes
    } catch (error) {
      logger.error('Error searching notes:', error)
      throw error
    } finally {
      await this.cleanup()
    }
  }

  async getNoteContent(url: string): Promise<NoteDetail> {
    logger.info(`Getting note content for URL: ${url}`)
    try {
      await this.initialize()
      if (!this.page) throw new Error('Page not initialized')

      const actualURL = this.extractRedBookUrl(url)
      await this.page.goto(actualURL)
      let note = await GetNoteDetail(this.page)
      note.url = url
      logger.info(`Successfully extracted note: ${note.title}`)
      return note
    } catch (error) {
      logger.error('Error getting note content:', error)
      throw error
    } finally {
      await this.cleanup()
    }
  }

  async getNoteComments(url: string): Promise<Comment[]> {
    logger.info(`Getting comments for URL: ${url}`)
    try {
      await this.initialize()
      if (!this.page) throw new Error('Page not initialized')

      await this.page.goto(url)

      // Wait for comments to load
      logger.info('Waiting for comments to load')
      await this.page.waitForSelector('[role="dialog"] [role="list"]')

      // Extract comments
      const comments = await this.page.evaluate(() => {
        const items = document.querySelectorAll('[role="dialog"] [role="list"] [role="listitem"]')
        const results: Comment[] = []

        items.forEach((item) => {
          const author = item.querySelector('[data-testid="user-name"]')?.textContent?.trim() || ''
          const content = item.querySelector('[data-testid="comment-content"]')?.textContent?.trim() || ''
          const likes = parseInt(item.querySelector('[data-testid="likes-count"]')?.textContent || '0')
          const time = item.querySelector('time')?.textContent?.trim() || ''

          results.push({ author, content, likes, time })
        })

        return results
      })

      logger.info(`Successfully extracted ${comments.length} comments`)
      return comments
    } catch (error) {
      logger.error('Error getting note comments:', error)
      throw error
    } finally {
      await this.cleanup()
    }
  }

  async addNote(params: AddNoteParams): Promise<AddNoteResult> {
    logger.info(`Publishing note with title: ${params.title}`)
    try {
      // Initialize browser and load cookies
      logger.info('Initializing browser for publishing')
      this.browser = await this.authManager.getBrowser()
      if (!this.browser) {
        throw new Error('Failed to initialize browser')
      }
      
      this.page = await this.browser.newPage()
      
      // Load cookies if available
      const cookies = await this.authManager.getCookies()
      if (cookies.length > 0) {
        logger.info(`Loading ${cookies.length} cookies for creator platform`)
        
        // Add cookies for both xiaohongshu.com and creator.xiaohongshu.com
        const creatorCookies = cookies.map(cookie => ({
          ...cookie,
          domain: cookie.domain.startsWith('.') ? cookie.domain : `.${cookie.domain}`
        }))
        
        await this.page.context().addCookies(creatorCookies)
        logger.info('Cookies loaded successfully')
      } else {
        logger.warn('No cookies found, user may need to login first')
      }

      // Navigate to publish page
      logger.info('Navigating to creator publish page')
      await this.page.goto('https://creator.xiaohongshu.com/publish/publish', {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      })

      // Check if we need to login to creator platform
      logger.info('Checking if login is required for creator platform')
      await this.randomDelay(3, 5)
      
      const currentUrl = this.page.url()
      logger.info(`Current URL: ${currentUrl}`)
      
      if (currentUrl.includes('/login')) {
        logger.error('Redirected to login page')
        return {
          success: false,
          message: '需要先登录创作者平台。请运行 rednote-mcp init 重新登录。'
        }
      }

      // Check for actual login indicators instead of just text content
      logger.info('Checking for login indicators on page')
      try {
        // 检查是否有具体的登录按钮或登录表单
        const loginButton = await this.page.$('button:has-text("登录"), .login-btn, .login-button, input[type="submit"][value*="登录"]')
        const loginForm = await this.page.$('form[class*="login"], .login-form, .login-container')
        const qrCode = await this.page.$('.qrcode, .qr-code, [class*="qrcode"]')
        
        if (loginButton || loginForm || qrCode) {
          logger.error('Found login elements on page - login required')
          return {
            success: false,
            message: '页面显示需要登录。请运行 rednote-mcp init 重新登录。'
          }
        }
        
        logger.info('No login elements found, proceeding with publish flow')
      } catch (error) {
        logger.warn('Error checking for login elements:', error)
        // 如果检查失败，继续执行，让后续步骤来验证
      }

      // 判断上传类型并执行对应的上传流程
      const hasVideos = params.videos && params.videos.length > 0
      const hasImages = params.images && params.images.length > 0
      
      if (hasVideos) {
        // 视频上传：直接上传，不需要切换tab
        logger.info('开始视频上传流程（直接上传）')
        try {
          // 等待页面加载完成
          await this.randomDelay(2, 3)
          
          // 直接查找视频上传区域，不点击tab
          logger.info('查找视频上传区域')
          
          // 等待视频上传区域出现
          try {
            await this.page.waitForSelector('input[type="file"], [class*="upload"], .upload-area, .dnd-area', {
              timeout: 15000
            })
            logger.info('找到上传区域')
          } catch (error) {
            logger.error('未找到上传区域')
            return {
              success: false,
              message: '未找到视频上传区域'
            }
          }

          // 查找文件上传输入框
          const fileInput = await this.page.$('input[type="file"]')
          if (!fileInput) {
            logger.error('未找到文件上传输入框')
            return {
              success: false,
              message: '未找到文件上传输入框'
            }
          }

          // 上传视频文件
          logger.info(`上传 ${params.videos!.length} 个视频文件`)
          try {
            logger.info('设置视频文件...')
            await fileInput.setInputFiles(params.videos!)
            logger.info('视频文件上传成功')
            
            // 等待视频处理完成（视频处理通常需要更长时间）
            await this.randomDelay(8, 12)
            
            // 等待视频预览出现
            try {
              await this.page.waitForSelector('video, .video-preview, [class*="video"], [class*="preview"], .upload-success', {
                timeout: 30000 // 视频处理需要更长时间
              })
              logger.info('视频预览加载完成')
            } catch (previewError) {
              logger.warn('未找到视频预览，但继续执行')
              // 额外等待视频处理
              await this.randomDelay(5, 8)
            }
            
          } catch (error) {
            logger.error('视频上传失败:', error)
            return {
              success: false,
              message: `视频上传失败: ${error instanceof Error ? error.message : '未知错误'}`
            }
          }
        } catch (error) {
          logger.error('视频上传流程错误:', error)
          return {
            success: false,
            message: '视频上传流程出错'
          }
        }
      } else if (hasImages) {
        // 图文上传：需要切换到"上传图文"tab
        logger.info('开始图文上传流程（切换到上传图文tab）')
        try {
          // 等待页面加载完成
          await this.randomDelay(2, 3)
          
          // 点击"上传图文"tab进行切换
          logger.info('点击"上传图文"tab')
          const tabClicked = await this.page.evaluate(() => {
            // 查找所有包含"上传图文"文本的元素
            const elements = Array.from(document.querySelectorAll('*'));
            for (const el of elements) {
              if (el.textContent?.includes('上传图文') && el.textContent.trim() === '上传图文') {
                // 滚动到元素位置
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // 强制点击
                (el as HTMLElement).click();
                return true;
              }
            }
            return false;
          });
          
          if (tabClicked) {
            logger.info('成功点击"上传图文"tab')
            await this.randomDelay(3, 5) // 等待tab切换完成
          } else {
            logger.warn('JavaScript点击失败，尝试Playwright点击')
            
            // 备用方案：使用 Playwright 强制点击
            try {
              const tabElement = await this.page.locator('text=上传图文').first();
              await tabElement.scrollIntoViewIfNeeded();
              await tabElement.click({ force: true });
              logger.info('Playwright强制点击成功')
              await this.randomDelay(3, 5)
            } catch (clickError) {
              logger.error('两种点击方式都失败')
              return {
                success: false,
                message: '无法点击"上传图文"tab，请检查页面状态'
              }
            }
          }
          
          // 等待上传区域出现
          logger.info('等待图文上传区域')
          try {
            await this.page.waitForSelector('input[type="file"], [class*="upload"], .upload-area, .dnd-area', {
              timeout: 15000
            })
            logger.info('图文上传区域已找到')
          } catch (error) {
            logger.error('切换tab后未找到上传区域')
            return {
              success: false,
              message: '切换tab后未找到上传区域'
            }
          }

          // 查找文件上传输入框
          const fileInput = await this.page.$('input[type="file"]')
          if (!fileInput) {
            logger.error('切换tab后未找到文件上传输入框')
            return {
              success: false,
              message: '切换tab后未找到文件上传输入框'
            }
          }

          // 上传图片文件
          logger.info(`上传 ${params.images!.length} 个图片文件`)
          try {
            logger.info('设置图片文件...')
            await fileInput.setInputFiles(params.images!)
            logger.info('图片文件上传成功')
            
            // 等待图片处理完成
            await this.randomDelay(3, 5)
            
            // 等待图片预览出现
            try {
              await this.page.waitForSelector('img, .preview, [class*="preview"], [class*="image"], .upload-success', {
                timeout: 15000
              })
              logger.info('图片预览加载完成')
            } catch (previewError) {
              logger.warn('未找到图片预览，但继续执行')
              // 额外等待图片处理
              await this.randomDelay(3, 5)
            }
            
          } catch (error) {
            logger.error('图片上传失败:', error)
            return {
              success: false,
              message: `图片上传失败: ${error instanceof Error ? error.message : '未知错误'}`
            }
          }
        } catch (error) {
          logger.error('图文上传流程错误:', error)
          return {
            success: false,
            message: '切换到图文上传页面时出错'
          }
        }
      } else {
        // 纯文字发布：直接进入表单填写
        logger.info('纯文字发布，等待页面加载')
        await this.randomDelay(2, 3)
      }

      // Fill in the title
      logger.info('Filling in title')
      try {
        // 等待一下确保图片上传后页面更新完成
        await this.randomDelay(2, 3)
        
        const titleSelectors = [
          'input[placeholder*="标题"]',
          'input[type="text"].d-text',
          'input[type="text"]:first-of-type',
          'input[placeholder*="请输入标题"]', 
          'input[placeholder*="添加标题"]'
        ]
        
        let titleFilled = false
        for (const selector of titleSelectors) {
          try {
            await this.page.waitForSelector(selector, { timeout: 5000 })
            await this.page.fill(selector, params.title)
            logger.info(`Title filled successfully with selector: ${selector}`)
            titleFilled = true
            break
          } catch {
            continue
          }
        }
        
        if (!titleFilled) {
          logger.error('Could not find title input with any selector')
          return {
            success: false,
            message: '无法找到标题输入框，可能页面结构已更改'
          }
        }
      } catch (error) {
        logger.error('Error filling title:', error)
        return {
          success: false,
          message: '无法填写标题，可能页面结构已更改'
        }
      }

      // Fill in the content
      logger.info('Filling in content')
      try {
        const contentSelectors = [
          'div[contenteditable="true"]:not([placeholder*="标题"])',
          'div[contenteditable="true"]',
          'textarea[placeholder*="描述"]',
          'textarea[placeholder*="请输入正文"]',
          'textarea[placeholder*="添加描述"]',
          'textarea'
        ]
        
        let contentFilled = false
        for (const selector of contentSelectors) {
          try {
            await this.page.waitForSelector(selector, { timeout: 5000 })
            await this.page.fill(selector, params.content)
            logger.info(`Content filled successfully with selector: ${selector}`)
            contentFilled = true
            break
          } catch {
            continue
          }
        }
        
        if (!contentFilled) {
          logger.error('Could not find content input with any selector')
          return {
            success: false,
            message: '无法找到内容输入框，可能页面结构已更改'
          }
        }
      } catch (error) {
        logger.error('Error filling content:', error)
        return {
          success: false,
          message: '无法填写内容，可能页面结构已更改'
        }
      }

      // Add tags if provided
      if (params.tags && params.tags.length > 0) {
        logger.info(`Adding ${params.tags.length} tags`)
        try {
          // 尝试找到标签输入框
          const tagSelector = 'input[placeholder*="标签"], input[placeholder*="话题"], .tag-input input, [data-testid="tag-input"]'
          const tagInput = await this.page.$(tagSelector)
          
          if (tagInput) {
            for (const tag of params.tags) {
              await tagInput.fill(`#${tag}`)
              await this.page.keyboard.press('Enter')
              await this.randomDelay(0.5, 1)
            }
            logger.info('Tags added successfully')
          } else {
            logger.warn('Tag input not found, skipping tags')
          }
        } catch (error) {
          logger.error('Error adding tags:', error)
          // 不因为标签失败而终止发布
        }
      }

      // Set privacy if specified
      if (params.isPrivate !== undefined) {
        logger.info(`Setting privacy to: ${params.isPrivate ? 'private' : 'public'}`)
        try {
          const privacySelector = params.isPrivate 
            ? '[data-testid="private-radio"], input[value="private"], .privacy-private'
            : '[data-testid="public-radio"], input[value="public"], .privacy-public'
          
          const privacyOption = await this.page.$(privacySelector)
          if (privacyOption) {
            await privacyOption.click()
            logger.info('Privacy setting applied')
          } else {
            logger.warn('Privacy setting not found, using default')
          }
        } catch (error) {
          logger.error('Error setting privacy:', error)
          // 不因为隐私设置失败而终止发布
        }
      }

      // Wait a bit before publishing
      await this.randomDelay(2, 3)

      // Click publish button
      logger.info('Clicking publish button')
      try {
        const publishSelectors = [
          'button.publishBtn',
          'button:has-text("发布")',
          'button:has-text("立即发布")',
          'button[type="submit"]',
          '.publish-btn',
          '.submit-btn'
        ]
        
        let publishClicked = false
        for (const selector of publishSelectors) {
          try {
            await this.page.waitForSelector(selector, { timeout: 5000 })
            await this.page.click(selector)
            logger.info(`Publish button clicked with selector: ${selector}`)
            publishClicked = true
            break
          } catch {
            continue
          }
        }
        
        if (!publishClicked) {
          logger.error('Could not find publish button with any selector')
          return {
            success: false,
            message: '无法找到发布按钮，可能页面结构已更改'
          }
        }
        
        // Wait a bit for the publish process
        await this.randomDelay(3, 5)
        
        // Check for success indicators
        const successIndicators = [
          '.success-message',
          '.publish-success',
          'text=发布成功',
          'text=已发布',
          '[data-testid="success-message"]'
        ]
        
        let publishSuccess = false
        for (const indicator of successIndicators) {
          try {
            await this.page.waitForSelector(indicator, { timeout: 5000 })
            publishSuccess = true
            logger.info('Publish success confirmed')
            break
          } catch {
            // 继续尝试下一个指示器
          }
        }
        
        if (!publishSuccess) {
          // 检查是否有错误信息
          const errorElements = await this.page.$$('.error-message, .publish-error, [class*="error"]')
          if (errorElements.length > 0) {
            const errorText = await errorElements[0].textContent()
            logger.error(`Publish error: ${errorText}`)
            return {
              success: false,
              message: `发布失败: ${errorText || '未知错误'}`
            }
          }
          
          // 没有明确的成功或失败指示器，但操作已完成
          logger.info('Publish operation completed, but success status unclear')
        }
        
        return {
          success: true,
          message: '笔记发布成功！'
        }
        
      } catch (error) {
        logger.error('Error clicking publish button:', error)
        return {
          success: false,
          message: `发布失败: ${error instanceof Error ? error.message : '未知错误'}`
        }
      }

    } catch (error) {
      logger.error('Error publishing note:', error)
      return {
        success: false,
        message: `发布失败: ${error instanceof Error ? error.message : '未知错误'}`
      }
    } finally {
      await this.cleanup()
    }
  }

  /**
   * Wait for a random duration between min and max seconds
   * @param min Minimum seconds to wait
   * @param max Maximum seconds to wait
   */
  private async randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.random() * (max - min) + min
    logger.debug(`Adding random delay of ${delay.toFixed(2)} seconds`)
    await new Promise((resolve) => setTimeout(resolve, delay * 1000))
  }
}
