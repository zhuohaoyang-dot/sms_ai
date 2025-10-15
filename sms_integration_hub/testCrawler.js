// testCrawler.js - Test MySQL connection and data retrieval
const { testConnection, query } = require('./src/config/database');
require('dotenv').config();

async function runTests() {
  console.log('🚀 Starting Database Connection Tests...\n');

  // Test 1: Connection
  console.log('Test 1: Testing MySQL Connection...');
  const isConnected = await testConnection();
  if (!isConnected) {
    console.log('❌ Cannot proceed without database connection');
    process.exit(1);
  }
  console.log('');

  // Test 2: Query bl_venture_ai - AI Generate Results
  console.log('Test 2: Querying bl_venture_ai.bl_ai_generate_result...');
  try {
    const aiResults = await query(
      process.env.DB_NAME_AI,
      `SELECT 
        id,
        matter_id,
        result_data,
        evaluate_result,
        send_status,
        created_time
      FROM bl_venture_ai.bl_ai_generate_result
      WHERE evaluate_result IS NOT NULL
      LIMIT 5`
    );
    console.log(`✅ Retrieved ${aiResults.length} records from bl_ai_generate_result`);
    console.log('Sample record:');
    console.log(JSON.stringify(aiResults[0], null, 2));
  } catch (error) {
    console.error('❌ Error querying bl_ai_generate_result:', error.message);
  }
  console.log('');

  // Test 3: Query bl_venture_matter - Matter table
  console.log('Test 3: Querying bl_venture_matter.bl_matter...');
  try {
    const matters = await query(
      process.env.DB_NAME_MATTER,
      `SELECT 
        id AS matter_digital_id,
        matter_name
      FROM bl_venture_matter.bl_matter
      LIMIT 5`
    );
    console.log(`✅ Retrieved ${matters.length} records from bl_matter`);
    console.log('Sample record:');
    console.log(JSON.stringify(matters[0], null, 2));
  } catch (error) {
    console.error('❌ Error querying bl_matter:', error.message);
  }
  console.log('');

  // Test 4: Join query - linking AI results with matter data
  console.log('Test 4: Testing JOIN between databases...');
  try {
    const joinedData = await query(
      process.env.DB_NAME_AI,
      `SELECT 
        ai.id,
        ai.matter_id,
        ai.result_data,
        ai.evaluate_result,
        ai.send_status,
        ai.created_time,
        m.matter_name
      FROM bl_venture_ai.bl_ai_generate_result ai
      LEFT JOIN ${process.env.DB_NAME_MATTER}.bl_matter m ON ai.matter_id = m.id
      WHERE ai.evaluate_result IS NOT NULL
      LIMIT 3`
    );
    console.log(`✅ Successfully joined data: ${joinedData.length} records`);
    console.log('Sample joined record:');
    console.log(JSON.stringify(joinedData[0], null, 2));
  } catch (error) {
    console.error('❌ Error with JOIN query:', error.message);
  }
  console.log('');

  // Test 5: Aggregate queries for metrics
  console.log('Test 5: Testing aggregate queries for dashboard metrics...');
  try {
    const metrics = await query(
      process.env.DB_NAME_AI,
      `SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN send_status IN (1, 2) THEN 1 ELSE 0 END) as total_sendable,
        SUM(CASE WHEN JSON_EXTRACT(evaluate_result, '$.approved') = true AND send_status IN (1, 2) THEN 1 ELSE 0 END) as approved_sent,
        SUM(CASE WHEN JSON_EXTRACT(evaluate_result, '$.flag') IS NOT NULL AND JSON_EXTRACT(evaluate_result, '$.flag') != 'null' THEN 1 ELSE 0 END) as flagged_count,
        SUM(CASE WHEN send_status = 1 THEN 1 ELSE 0 END) as sent_without_modification,
        SUM(CASE WHEN send_status = 2 THEN 1 ELSE 0 END) as sent_with_modification
      FROM bl_venture_ai.bl_ai_generate_result
      WHERE created_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    );
    console.log('✅ Metrics calculated successfully:');
    console.log(JSON.stringify(metrics[0], null, 2));
    
    const { total_sendable, approved_sent, flagged_count, total_records } = metrics[0];
    const accuracyRate = total_sendable > 0 ? (approved_sent / total_sendable * 100).toFixed(2) : 0;
    const flagRate = total_records > 0 ? (flagged_count / total_records * 100).toFixed(2) : 0;
    
    console.log(`\n📊 Dashboard Preview:`);
    console.log(`   Accuracy Rate: ${accuracyRate}% (${approved_sent}/${total_sendable})`);
    console.log(`   Flag Rate: ${flagRate}% (${flagged_count}/${total_records})`);
  } catch (error) {
    console.error('❌ Error calculating metrics:', error.message);
  }
  console.log('');

  console.log('✅ All tests completed!');
  process.exit(0);
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});