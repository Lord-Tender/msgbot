const fs = require('fs');
const path = require('path');

// Path to the JSON file
const filePath = path.join(__dirname, 'failed numbers.json');

// Function to read or initialize the JSON array
async function readOrInitializeFile() {
    try {
        if (!fs.existsSync(filePath)) {
            // If file doesn't exist, create it with an empty array
            await fs.promises.writeFile(filePath, JSON.stringify([]), 'utf-8');
            console.log('File created successfully.');
        }
        // Read the file
        const data = await fs.promises.readFile(filePath, 'utf-8');
        return JSON.parse(data); // Parse JSON content
    } catch (error) {
        console.error('Error reading or initializing file:', error);
        throw error;
    }
}

// Function to update the JSON array
async function updateJsonArray(newItem) {
    try {
        // Read existing data or initialize it
        const jsonArray = await readOrInitializeFile();

        // Add the new item to the array
        jsonArray.push(newItem);

        // Write updated array back to the file
        await fs.promises.writeFile(filePath, JSON.stringify(jsonArray, null, 2), 'utf-8');
        console.log('File updated successfully with new item:', newItem);
    } catch (error) {
        console.error('Error updating file:', error);
    }
}

module.exports =  { updateJsonArray }