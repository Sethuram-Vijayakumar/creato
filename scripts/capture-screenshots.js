const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Install playwright locally if process fails to require it
try {
  require.resolve('playwright');
} catch (e) {
  console.log('Installing playwright for screenshot capture...');
  execSync('npm install playwright@1.49.0', { stdio: 'inherit' });
  console.log('Installing chromium browser dependency...');
  execSync('npx playwright install chromium', { stdio: 'inherit' });
}

const { chromium } = require('playwright');

(async () => {
  console.log('Starting automated screenshot capture process...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  global.page = page;

  const screenshotDir = path.join(__dirname, '../public/screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  // Helper function to capture the active page state and save it
  async function capture(filename, delay = 1000) {
    await page.waitForTimeout(delay);
    const filepath = path.join(screenshotDir, filename);
    await page.screenshot({ path: filepath, fullPage: false });
    console.log(`[SUCCESS] Captured and saved: ${filename}`);
  }

  // SCREEN 1: Creator Login page with prefilled credentials
  console.log('Navigating to Creator Login...');
  await page.goto('http://localhost:3000/creator/login');
  await page.waitForSelector('#email');
  await page.fill('#email', 'priya@creato.in');
  await page.fill('#password', 'password123');
  await capture('creator-login.png');

  // Perform login
  console.log('Logging in as Creator...');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/creator/dashboard');
  
  // SCREEN 2: Creato Score Radar (radial gauge, 4-pillar radar chart)
  console.log('Waiting for Creato Score elements to render...');
  await page.waitForSelector('canvas, .radar-chart-container');
  await page.evaluate(() => window.scrollTo(0, 0));
  await capture('creato-score-radar.png', 1500);

  // SCREEN 3: Fair Pricing Engine showing suggested range & Past Collab Valuation Audit
  console.log('Scrolling to Fair Pricing Index section...');
  await page.evaluate(() => {
    const heading = Array.from(document.querySelectorAll('h3')).find(el => el.textContent.includes('Past Collaborations Valuation Audit'));
    if (heading) {
      heading.scrollIntoView({ block: 'center' });
    } else {
      window.scrollTo(0, 450);
    }
  });
  await capture('fair-pricing-engine.png');

  // SCREEN 4: Opportunities Agent showing open campaign list + drawer with drafted pitch
  console.log('Navigating to Creator Opportunities page...');
  await page.goto('http://localhost:3000/creator/opportunities');
  await page.waitForSelector('button:has-text("Apply"), button.bg-luxury-blue-900');
  
  console.log('Opening AI Creator Agent drawer...');
  const applyButton = page.locator('button', { hasText: 'Apply' }).first();
  await applyButton.click();
  
  console.log('Waiting for AI draft response...');
  await page.waitForSelector('textarea, .draft-textarea');
  await page.waitForTimeout(4000); // Wait for the mock AI text generator response to print
  await capture('creator-ai-agent.png');

  // Log out to clear session cookies
  console.log('Clearing creator session...');
  await page.goto('http://localhost:3000/api/auth/logout');
  await page.waitForTimeout(1000);

  // SCREEN 5: Brand discover drawer showing AI Scout chat matched creator card
  console.log('Navigating to Brand Login...');
  await page.goto('http://localhost:3000/brand/login');
  await page.waitForSelector('#email');
  await page.fill('#email', 'contact@indid2c.in');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/brand/dashboard');

  console.log('Navigating to Brand Discover...');
  await page.goto('http://localhost:3000/brand/discover');
  await page.waitForSelector('button:has-text("AI Matchmaker")');
  
  console.log('Opening AI Matchmaker Chat...');
  await page.click('button:has-text("AI Matchmaker")');
  await page.waitForSelector('button:has-text("High trust food creators in Tamil Nadu")');
  
  console.log('Sending query chip: High trust food creators in Tamil Nadu...');
  await page.click('button:has-text("High trust food creators in Tamil Nadu")');
  
  console.log('Waiting for matched creator card to appear...');
  await page.waitForSelector('.flex-1 img[alt="Priya Sharma"]', { timeout: 15000 });
  await capture('ai-scout-match.png', 1500);

  // SCREEN 6: Discover page showing grid of creators matching filters
  console.log('Reloading Brand Discover page for clean state...');
  await page.goto('http://localhost:3000/brand/discover');
  await page.waitForSelector('button:has-text("Tamil Nadu")');
  
  console.log('Applying Tamil Nadu and Food filters...');
  await page.click('button:has-text("Tamil Nadu")');
  await page.click('button:has-text("Food")');
  
  console.log('Waiting for filtering loader to end and grid cards to display...');
  await page.waitForSelector('#creators-grid [data-testid="creator-card"]', { timeout: 10000 });
  await capture('discover-filters.png');

  // SCREEN 7: Counter-Offer proposal chat log between creator and brand
  console.log('Navigating to Countered Deal Detail page...');
  await page.goto('http://localhost:3000/brand/deals/deal_sample_1');
  await page.waitForSelector('.space-y-4, h2');
  await capture('negotiation-chat.png', 1000);

  // SCREEN 8: Brand Dashboard (Campaign Collaboration Tracking, Reach maps)
  console.log('Navigating to Brand Dashboard...');
  await page.goto('http://localhost:3000/brand/dashboard');
  await page.waitForSelector('h3, canvas, .geographic-reach');
  await capture('brand-dashboard.png', 1500);

  await browser.close();
  console.log('All 8 demo screenshots captured successfully!');
  process.exit(0);
})().catch(async (err) => {
  console.error('Fatal capture error occurred:', err);
  if (global.page) {
    try {
      console.error('Current Page URL:', global.page.url());
      const bodyText = await global.page.locator('body').innerText();
      console.error('Page Body Content Summary:', bodyText.substring(0, 1000));
    } catch (e) {
      console.error('Failed to dump page state:', e.message);
    }
  }
  process.exit(1);
});
