#!/usr/bin/env node
// Capture and validate the rendered preview without depending on hover/animation
// actionability checks for the Start button.

import { createRequire } from 'node:module'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { performance } from 'node:perf_hooks'

const runtime = join(process.env.HOME, '.local/share/omgithub-playwright')
const require = createRequire(join(runtime, 'package.json'))
const { chromium } = require('playwright')

const url = process.env.CAPTURE_URL
const outputDir = process.env.CAPTURE_DIR
if (!url || !outputDir) {
  console.error('CAPTURE_URL and CAPTURE_DIR are required.')
  process.exit(1)
}
try {
  const parsed = new URL(url)
  if (!/^https?:$/.test(parsed.protocol)) throw new Error('Unsupported protocol')
} catch {
  console.error(`CAPTURE_URL is not a valid HTTP(S) URL: ${url}`)
  process.exit(1)
}
mkdirSync(outputDir, { recursive: true })

const startedAt = performance.now()
const timings = []
function timing(label, since) {
  const ms = performance.now() - since
  timings.push({ label, ms })
  console.log(`[timing] ${label}: ${ms.toFixed(0)}ms`)
}

class TemporaryError extends Error {}
class DefectError extends Error {}

if (process.platform === 'linux' && !process.env.DISPLAY) {
  try {
    process.env.DISPLAY = ':' + readFileSync(join(runtime, 'display'), 'utf8').trim()
  } catch {}
}

let launchOptions = {}
try {
  const configPath = join(runtime, process.platform === 'darwin' ? 'metal.json' : 'linux.json')
  launchOptions = JSON.parse(readFileSync(configPath, 'utf8')).browser?.launchOptions || {}
} catch {}

let browser
try {
  let t = performance.now()
  try {
    browser = await chromium.launch({ ...launchOptions, timeout: 30000 })
  } catch (error) {
    throw new TemporaryError(`Browser launch failed: ${error.message}`)
  }
  timing('launch browser', t)

  for (const [name, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
    t = performance.now()
    const page = await browser.newPage({ viewport: { width, height } })
    page.setDefaultTimeout(30000)

    const pageErrors = []
    page.on('pageerror', error => pageErrors.push(error.message))
    page.on('response', response => {
      if (response.status() >= 400 && new URL(response.url()).origin === new URL(url).origin) {
        pageErrors.push(`HTTP ${response.status()}: ${response.url()}`)
      }
    })

    let response
    try {
      response = await page.goto(url, { waitUntil: 'load', timeout: 45000 })
    } catch (error) {
      if (error.name === 'TimeoutError' || /net::|ERR_|Target closed|Browser closed|crash/i.test(error.message)) {
        throw new TemporaryError(`Temporary navigation failure for ${name}: ${error.message}`)
      }
      throw new DefectError(`Navigation failed for ${name}: ${error.message}`)
    }
    if (!response) throw new TemporaryError(`No HTTP response for ${name}`)
    const status = response.status()
    if (status >= 500 || status === 408 || status === 429) {
      throw new TemporaryError(`Temporary HTTP ${status} for ${name}`)
    }
    if (!response.ok()) throw new DefectError(`HTTP ${status} for ${name}: ${url}`)

    await page.locator('#board').waitFor({ state: 'visible', timeout: 15000 })
    await page.waitForFunction(() => document.fonts.status === 'loaded')

    // Click through the DOM instead of Playwright's actionability path. The
    // intro card animates, so a synthetic click is both faster and more stable.
    const start = page.locator('#startBtn')
    if (await start.count()) {
      if (await start.isVisible()) {
        await start.evaluate(element => element.click())
      }
    }
    await page.waitForFunction(() => {
      const intro = document.querySelector('#intro')
      return (!intro || intro.hidden) && document.querySelectorAll('.tile').length > 0
    }, null, { timeout: 10000 })
    await page.mouse.move(1, 1)
    await page.evaluate(() => document.activeElement?.blur())
    await page.waitForTimeout(500)

    const buffer = await page.screenshot({ fullPage: false, animations: 'disabled', timeout: 30000 })
      .catch(error => {
        if (error.name === 'TimeoutError' || !browser.isConnected()) {
          throw new TemporaryError(`Temporary screenshot failure for ${name}: ${error.message}`)
        }
        throw new DefectError(`Screenshot failed for ${name}: ${error.message}`)
      })
    if (!buffer || buffer.length < 1024) throw new DefectError(`Screenshot for ${name} is empty`)
    writeFileSync(join(outputDir, `final-${name}.png`), buffer)
    timing(`capture ${name}`, t)

    if (pageErrors.length) {
      throw new DefectError(`Rendering errors for ${name}: ${pageErrors.join('; ')}`)
    }
    await page.close()
  }

  if (!existsSync(join(outputDir, 'final-desktop.png')) || !existsSync(join(outputDir, 'final-mobile.png'))) {
    throw new DefectError('Expected screenshots were not written')
  }
  timing('total capture', startedAt)
} catch (error) {
  console.error(error.message)
  process.exitCode = error instanceof TemporaryError ? 75 : 1
} finally {
  await browser?.close().catch(error => {
    console.error(`Browser close failed: ${error.message}`)
    process.exitCode ||= 75
  })
}
