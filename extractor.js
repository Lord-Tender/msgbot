const puppeteer = require('puppeteer');
const puppeteerHar = require('puppeteer-har'); // Install with `npm install puppeteer-har`

function wait(time) {
    return new Promise((resolved)=>{
        setTimeout(()=>{
            resolved()
        }, time)
    })
}

async function extractContacts() {
    const browser = await puppeteer.launch({
        headless: false, // Launch in full mode so you can manually inspect the Network tab
        args: ['--start-maximized'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Start capturing the HAR (HTTP Archive) to analyze network requests
    const har = await puppeteerHar.start({ path: 'network-traffic.har' });

    // WebSocket Logging
    page.on('request', request => {
        if (request.resourceType() === 'websocket') {
            console.log(`WebSocket URL: ${request.url()}`);
        }
    });

    try {
        await page.goto('https://web.whatsapp.com');
        console.log('Navigated to WhatsApp Web. Waiting for login...');

        // Wait for WhatsApp Web to load by checking for a specific selector
        await page.waitForSelector('#side', { timeout: 0 });
        console.log('WhatsApp Web loaded. Please open a group chat manually.');

        // Open group chat and click the info button
        await page.waitForSelector('header span[title]', { timeout: 0 });
        console.log('Group chat detected');

        const groupInfoIconSelector = '._amid';
        const groupInfoIcon = await page.$(groupInfoIconSelector);
        if (groupInfoIcon) {
            await groupInfoIcon.click();
            console.log('Group info opened');
        } else {
            throw new Error('Failed to open group info');
        }

        // Click "View all" to open full contacts list
        const viewAllButtonSelector = 'div[aria-disabled="false"][role="button"] span > div.x1iyjqo2.x1yc453h.x1n68mz9';
        await page.waitForSelector(viewAllButtonSelector, { timeout: 30000 });
        await page.click(viewAllButtonSelector);
        console.log('Clicked on "View all" button. Please scroll manually.');

        // Wait for a while for manual scrolling
        await wait(30000); // Adjust time as needed

        console.log('Attempting to extract contacts...');

        // Extract contacts containing numbers
        const contacts = await page.evaluate(() => {
            const contactsList = [];
            const contactElements = document.querySelectorAll('div[aria-label="Group info"] div[role="button"] span[title]');
            
            contactElements.forEach((contact) => {
                const title = contact.getAttribute('title');
                console.log(`Contact found: ${title}`); // Debug log
                if (/^\+\d+$/.test(title)) { // Check if title is a phone number
                    contactsList.push(title);
                }
            });

            return contactsList;
        });

        console.log('Extracted Contacts:', contacts);

    } catch (error) {
        console.error('Error extracting contacts:', error);
    } finally {
        // Stop capturing HAR file
        await har.stop();

        await browser.close();
        console.log('Browser closed');
    }
}

extractContacts();
