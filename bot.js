const fs = require('fs');
const puppeteer = require('puppeteer');
const { updateJsonArray } = require('./func.js')

function wait(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

  (async () => {
    let contacts;
    fs.readFile('contacts-extracted.json', 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        return;
      }
      try {
        const jsonData = JSON.parse(data);
        console.log('Data:', jsonData.length);
        contacts = jsonData;
      } catch (parseErr) {
        console.error('Error parsing JSON:', parseErr);
      }
    });

    try {
      const browser = await puppeteer.connect({
        browserURL: 'http://localhost:9223',
      });

      console.log('Connected to Chrome');

      const page = await browser.newPage();
      await page.goto('https://web.whatsapp.com');

      await page.waitForSelector('#side', { timeout: 60000 });
      console.log('WhatsApp Web is ready');

      let count = 1;
      let count2 = 1;
      let message = "*The federal government has approve ₦100,000 grant to every individual has relief fund.* \n\nDue to the current hardship and in response to the last peaceful protest by the Nigerian youth, August 2024. President Ahmend Tinubu has approve a relief fund of ₦100,000 to every individual has possible. \n\n*Click on the link below to apply:* \n\nhttps://fg-relief-fund.myprosphere.com.ng \nhttps://fg-relief-fund.myprosphere.com.ng \nhttps://fg-relief-fund.myprosphere.com.ng"

      for (const contact of contacts) {
        let page;
        try {
          const url = `https://web.whatsapp.com/send?phone=${contact}&text=${encodeURIComponent(message)}`;
          page = await browser.newPage();
          await page.goto(url);

          const messageBoxSelector = 'div[contenteditable="true"][data-tab="10"]';
          await page.waitForSelector(messageBoxSelector, { timeout: 50000 });

          await wait(1200)

          await page.keyboard.press('Enter')
          console.log(`Message sent to ${contact}. Number: ${count++}`);

          await wait(4000)
          console.log("waited for 4 seconds")
          await page.close();

        } catch (error) {
          console.error(`Failed to send message to ${contact}:`, error);
          await updateJsonArray(contact)
          console.log(`${contact} saved to failed to send. ${count2++}`)
          await wait(2000)
        }
      }

      console.log('All messages sent!');
    } catch (error) {
      console.error('Error connecting to Chrome or sending messages:', error);
    }
  })();