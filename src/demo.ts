import { HttpReq, HttpClientType } from './HttpReq';

const main = async () => {
  console.log('=== HttpReq Demo ===\n');

  // // Example 1: Using defaults (axios with console.log)
  console.log('1. Using defaults (axios client, console logging):');
  const httpReq1 = new HttpReq();
  
  try {
    const response1 = await httpReq1.GET('https://postman-echo.com/get?demo=default');
    console.log(`   Status: ${response1.status}`);
    console.log(`   Client Type: ${httpReq1.getClientType()}`);
    console.log('   ✅ Success with defaults\n');
  } catch (error) {
    console.error('   ❌ Error:', error);
  }

  // Example 2: Explicitly using axios
  console.log('2. Explicitly using axios client:');
  const httpReq2 = new HttpReq({ 
    clientType: HttpClientType.AXIOS,
    logger: (msg) => console.log(`   [AXIOS LOG] ${msg.split('\n')[0]}`) // Just first line
  });
  
  try {
    const response2 = await httpReq2.GET('https://postman-echo.com/get?demo=axios');
    console.log(`   Status: ${response2.status}`);
    console.log(`   Client Type: ${httpReq2.getClientType()}`);
    console.log('   ✅ Success with axios\n');
  } catch (error) {
    console.error('   ❌ Error:', error);
  }

  // Example 3: Using superagent
  console.log('3. Using superagent client:');
  const httpReq3 = new HttpReq({ 
    clientType: HttpClientType.SUPERAGENT,
    logger: (msg) => console.log(`   [SUPERAGENT LOG] ${msg.split('\n')[0]}`) // Just first line
  });
  
  try {
    const response3 = await httpReq3.GET('https://postman-echo.com/get?demo=superagent');
    console.log(`   Status: ${response3.status}`);
    console.log(`   Client Type: ${httpReq3.getClientType()}`);
    console.log('   ✅ Success with superagent\n');
  } catch (error) {
    console.error('   ❌ Error:', error);
  }

  console.log('=== Demo Complete - Both implementations work identically! ===');
};

main().catch(console.error);



