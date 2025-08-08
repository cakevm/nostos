#!/usr/bin/env node

/**
 * Script to register a test item on the Nostos contract
 * This will help test the Found Item flow
 */

const ITEM_ID = '0x33c44ec1ee0930f4372987fb580a7963cc29a415a165bb1df1c259cf2dceeafc';
const CONTRACT_ADDRESS = '0x59c836DF385deF565213fA55883289381373a268';

console.log('Test Item Registration Info:');
console.log('============================');
console.log('Contract Address:', CONTRACT_ADDRESS);
console.log('Item ID:', ITEM_ID);
console.log('');
console.log('To register this test item:');
console.log('1. Go to http://localhost:3000/register');
console.log('2. Connect your wallet');
console.log('3. Register any item (it will generate a new ID)');
console.log('4. Use the generated QR code or copy the item ID');
console.log('');
console.log('Or use this URL to test with the item ID above:');
console.log(`http://localhost:3000/found/${ITEM_ID.slice(2)}?key=test`);
console.log('');
console.log('Note: The item must be registered first before it can be claimed!');