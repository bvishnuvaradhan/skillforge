const { prisma } = require('d:/projects/skillforge/packages/db/dist/index.js');
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const baseUrl = 'http://localhost:3001/v1';
const email = `walkthrough-${Date.now()}@example.com`;
const password = 'Password123!';
const artifactsDir = 'C:\\Users\\Boga Vishnuvaradhan\\.gemini\\antigravity\\brain\\2dc3e896-f9c8-46b9-be63-becb46a390a3';

async function run() {
  console.log('=== Starting Browser Walkthrough Script ===');
  console.log(`Email: ${email}`);

  // Helpers
  let cookieHeader = '';
  async function api(pathUrl, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (cookieHeader) headers['Cookie'] = cookieHeader;
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`${baseUrl}${pathUrl}`, options);
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) cookieHeader = setCookie;
    return { status: res.status, data: await res.json().catch(() => null) };
  }

  // 1. Register
  console.log('Registering student...');
  const reg = await api('/auth/register', 'POST', {
    name: 'Browser Walkthrough Student',
    email,
    password,
    role: 'student',
  });
  if (reg.status !== 201) {
    throw new Error(`Failed to register: ${JSON.stringify(reg.data)}`);
  }

  // 2. Login via API to complete onboarding
  console.log('Logging in via API...');
  const login = await api('/auth/login', 'POST', { email, password });
  if (login.status !== 200) {
    throw new Error(`Failed to log in: ${JSON.stringify(login.data)}`);
  }
  const userId = login.data.data.user.id;
  console.log(`User ID: ${userId}`);

  // 3. Complete onboarding via API
  console.log('Completing onboarding...');
  await api('/onboarding/goal', 'POST', { goal: 'dsa', language_track: 'JAVASCRIPT' });
  await api('/onboarding/assessment', 'POST', { answers: [] });
  await api('/onboarding/complete', 'POST');

  // 4. Set up database records & API progress
  console.log('Fetching variables-operators world details...');
  const worldRes = await api('/worlds/variables-operators');
  const worldData = worldRes.data.data;
  const gameId = worldData.games[0].id;
  
  // Complete lessons 1, 2, 3, 4 of Module 1 (leaving lesson 5)
  console.log('Completing lessons 1-4 via API...');
  const sortedLessons = [...worldData.lessons].sort((a, b) => a.order_index - b.order_index);
  const lessonsToComplete = sortedLessons.slice(0, 4);
  for (const l of lessonsToComplete) {
    const res = await api(`/worlds/variables-operators/lessons/${l.id}/complete`, 'POST');
    console.log(`- Lesson "${l.title}" completed. Status: ${res.status}`);
  }

  // Complete game of Module 1 via API
  console.log('Completing Module 1 game via API...');
  const gameSubmit = await api(`/games/${gameId}/submit`, 'POST', {
    blocks: ['declare_variable', 'assign_value', 'print_output'],
    connections: [],
    output_node: '42',
    time_seconds: 30,
    hints_used: 0,
  });
  console.log(`Game complete status: ${gameSubmit.status}`);

  // Now, unlock Module 5 (functions-modular) and complete its lesson
  console.log('Unlocking and preparing Module 5...');
  const functionsWorld = await prisma.world.findUnique({ where: { slug: 'functions-modular' } });
  if (!functionsWorld) {
    throw new Error('Functions world not found!');
  }
  
  // Insert world progress for Module 5
  await prisma.userWorldProgress.upsert({
    where: { userId_worldId: { userId, worldId: functionsWorld.id } },
    update: { status: 'unlocked' },
    create: {
      userId,
      worldId: functionsWorld.id,
      status: 'unlocked',
    }
  });

  // Create a game for Module 5
  console.log('Upserting Module 5 game placeholder...');
  const m5GameId = 'fc7b728a-d878-482a-8d82-07c25857d110';
  await prisma.game.upsert({
    where: { id: m5GameId },
    update: { gameType: 'function_workshop' },
    create: {
      id: m5GameId,
      worldId: functionsWorld.id,
      name: 'Function Workshop',
      gameType: 'function_workshop',
      orderIndex: 1,
      masteryContribution: 0.3,
      xpReward: 80,
      tier: 'free',
      topicTags: ['functions'],
      config: {}
    }
  });

  const m5Lessons = await prisma.lesson.findMany({
    where: { worldId: functionsWorld.id },
    orderBy: { orderIndex: 'asc' }
  });
  console.log(`Module 5 has ${m5Lessons.length} lessons. Completing via API...`);
  for (const l of m5Lessons) {
    const res = await api(`/worlds/functions-modular/lessons/${l.id}/complete`, 'POST');
    console.log(`- M5 Lesson "${l.title}" completed. Status: ${res.status}`);
  }

  console.log('All API/Prisma setups completed. Launching Puppeteer...');

  // 5. Launch Puppeteer using Google Chrome
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    defaultViewport: { width: 1280, height: 800 },
  });

  const page = await browser.newPage();

  // Log in via UI
  console.log('Navigating to login page...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  
  console.log('Entering credentials...');
  await page.type('input[type="email"]', email);
  await page.type('input[type="password"]', password);
  
  console.log('Submitting login...');
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => window.location.href.includes('/dashboard'));

  console.log('Successfully logged in. Checking dashboard...');
  
  // Wait for dashboard widgets
  await page.waitForFunction(() => document.body.innerText.includes('XP & Level'));
  
  // Take screenshot 1: Dashboard with initial XP
  const screenshot1Path = path.join(artifactsDir, 'walkthrough_1_dashboard.png');
  await page.screenshot({ path: screenshot1Path });
  console.log(`Screenshot 1 saved: ${screenshot1Path}`);

  // Retrieve initial XP
  const initialXpText = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('*'));
    const xpEl = elements.find(el => el.textContent.includes('XP') && el.children.length === 0);
    return xpEl ? xpEl.textContent : 'Not found';
  });
  console.log(`Initial UI XP Displayed: ${initialXpText}`);

  // 6. Navigate to Module 5 (functions-modular) and check Game Coming Soon card
  console.log('Navigating to Module 5 page...');
  await page.goto('http://localhost:3000/roadmaps/functions-modular', { waitUntil: 'networkidle2' });
  
  console.log('Clicking on Play Game button...');
  const playGameSelector = 'a[href*="/game/"]';
  await page.waitForSelector(playGameSelector);
  
  await page.click(playGameSelector);
  await page.waitForFunction(() => window.location.href.includes('/game/'));

  console.log('Confirming "Game Coming Soon" screen...');
  await page.waitForFunction(() => document.body.innerText.includes('Game Coming Soon'));
  
  // Take screenshot 2: Game Coming Soon
  const screenshot2Path = path.join(artifactsDir, 'walkthrough_2_game_coming_soon.png');
  await page.screenshot({ path: screenshot2Path });
  console.log(`Screenshot 2 saved: ${screenshot2Path}`);

  // 7. Open 2-3 Lessons from different modules (let's verify rich content)
  // Let's open Module 1 Lesson 5 (which is uncompleted)
  console.log('Navigating to Module 1 page...');
  await page.goto('http://localhost:3000/roadmaps/variables-operators', { waitUntil: 'networkidle2' });
  
  // Find Lesson 5 link (the last lesson)
  const lessonLinksSelector = 'a[href*="/lesson/"]';
  await page.waitForSelector(lessonLinksSelector);
  
  const lessonLinks = await page.$$eval(lessonLinksSelector, links => links.map(l => l.getAttribute('href')));
  console.log(`Found lesson links: ${lessonLinks}`);
  
  // Go to the last lesson (Lesson 5)
  const lesson5Url = `http://localhost:3000${lessonLinks[lessonLinks.length - 1]}`;
  console.log(`Navigating to Lesson 5 reader: ${lesson5Url}`);
  await page.goto(lesson5Url, { waitUntil: 'networkidle2' });

  // Take screenshot 3: Lesson content
  const screenshot3Path = path.join(artifactsDir, 'walkthrough_3_lesson_reader.png');
  await page.screenshot({ path: screenshot3Path });
  console.log(`Screenshot 3 saved: ${screenshot3Path}`);

  // Read content length
  const lessonLength = await page.evaluate(() => {
    const contentBox = document.querySelector('div.bg-bg-secondary');
    return contentBox ? contentBox.textContent.split(/\s+/).length : 0;
  });
  console.log(`Lesson 5 word count: ${lessonLength} words`);

  // Wait 11 seconds for the read timer to finish
  console.log('Waiting for the 10-second read timer...');
  await new Promise(resolve => setTimeout(resolve, 11000));
  
  // Mark complete
  console.log('Marking lesson complete...');
  const completeBtnSelector = 'button';
  await page.click(completeBtnSelector);
  
  // Wait for the success toast
  console.log('Waiting for completion toast...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Navigate back to Dashboard to see XP update
  console.log('Navigating back to Dashboard...');
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => document.body.innerText.includes('XP & Level'));
  
  // Take screenshot 4: Updated XP
  const screenshot4Path = path.join(artifactsDir, 'walkthrough_4_dashboard_updated_xp.png');
  await page.screenshot({ path: screenshot4Path });
  console.log(`Screenshot 4 saved: ${screenshot4Path}`);
  
  const updatedXpText = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('*'));
    const xpEl = elements.find(el => el.textContent.includes('XP') && el.children.length === 0);
    return xpEl ? xpEl.textContent : 'Not found';
  });
  console.log(`Updated UI XP Displayed: ${updatedXpText}`);

  // 8. Go to original problem, submit empty code, check toast
  console.log('Navigating back to Module 1 to test Practice Problems...');
  await page.goto('http://localhost:3000/roadmaps/variables-operators', { waitUntil: 'networkidle2' });

  // Find practice problem accordion/button
  console.log('Locating original practice challenge...');
  const problemBtnSelector = 'button';
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const target = btns.find(b => b.textContent.includes('Celsius to Fahrenheit'));
    if (target) target.click();
  });
  
  // Wait for expansion animation and editor to load
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Click Run & Submit button
  console.log('Submitting empty code...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const target = btns.find(b => b.textContent.includes('Run & Submit'));
    if (target) target.click();
  });

  // Wait for the empty submission toast
  console.log('Waiting for EMPTY_SUBMISSION toast...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Take screenshot 5: Empty submission toast
  const screenshot5Path = path.join(artifactsDir, 'walkthrough_5_empty_submission.png');
  await page.screenshot({ path: screenshot5Path });
  console.log(`Screenshot 5 saved: ${screenshot5Path}`);

  // 9. Start Boss Battle and check that it loads cleanly
  console.log('Starting Boss Battle...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const target = btns.find(b => b.textContent.includes('Enter Boss Portal'));
    if (target) target.click();
  });

  // Wait for navigation
  console.log('Waiting for Boss Battle page to load...');
  await page.waitForFunction(() => window.location.href.includes('/boss/'));
  
  // Wait for Monaco editor on boss page
  await page.waitForFunction(() => document.body.innerText.includes('Lives Remaining'));
  
  // Take screenshot 6: Boss Battle loaded cleanly
  const screenshot6Path = path.join(artifactsDir, 'walkthrough_6_boss_battle_page.png');
  await page.screenshot({ path: screenshot6Path });
  console.log(`Screenshot 6 saved: ${screenshot6Path}`);

  await browser.close();
  await prisma.$disconnect();
  console.log('=== Browser Walkthrough Completed Successfully! ===');
}

run().catch(async (err) => {
  console.error('Walkthrough error:', err);
  await prisma.$disconnect();
});
