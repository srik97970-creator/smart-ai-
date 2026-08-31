const db = require('./db');
const assert = require('assert');

console.log('--- STARTING DATABASE VALIDATION TESTS (ASYNC) ---');

(async () => {
  try {
    // 1. Get initial product state
    const testProduct = await db.findById('products', 'prod_rice_5k');
    assert(testProduct, 'Test product should exist in seeded database');
    const initialQty = testProduct.quantity;
    console.log(`Initial stock quantity for ${testProduct.name}: ${initialQty}`);

    // 2. Perform a simulated sale transaction
    const salesList = await db.find('sales');
    const initialSalesCount = salesList.length;
    const mockSaleData = {
      customer_id: 'cust_1',
      items: [
        { product_id: 'prod_rice_5k', quantity: 2 }
      ]
    };

    console.log('Recording mock sale transaction...');
    const saleResult = await db.createSale(mockSaleData);

    // 3. Verify sales records were saved
    assert(saleResult.sale, 'Sale record should be generated');
    assert.strictEqual(saleResult.items.length, 1, 'Sale item record should be generated');
    
    const postSalesList = await db.find('sales');
    const postSalesCount = postSalesList.length;
    assert.strictEqual(postSalesCount, initialSalesCount + 1, 'Sales ledger count should increment');

    // 4. Verify inventory reduction
    const updatedProduct = await db.findById('products', 'prod_rice_5k');
    assert.strictEqual(updatedProduct.quantity, initialQty - 2, 'Inventory stock should decrement correctly');
    console.log(`Updated stock quantity for ${testProduct.name}: ${updatedProduct.quantity}`);

    // 5. Verify profit computations
    const expectedProfit = (Number(updatedProduct.selling_price) - Number(updatedProduct.purchase_price)) * 2;
    assert.strictEqual(saleResult.sale.total_profit, expectedProfit, 'Sale total profit calculation should match formula');
    assert.strictEqual(saleResult.sale.total_amount, Number(updatedProduct.selling_price) * 2, 'Sale revenue should match quantity * price');
    console.log(`Verified Transaction: Revenue = ₹${saleResult.sale.total_amount}, Cost = ₹${saleResult.sale.total_cost}, Profit = ₹${saleResult.sale.total_profit}`);

    // 6. Verify Low-stock insight generation
    console.log('Verifying proactive AI alerts triggers...');
    const insights = await db.find('ai_insights');
    const lowStockInsight = insights.find(ins => ins.ref_id === 'prod_rice_5k' && ins.type === 'low_stock');
    assert(lowStockInsight, 'A low-stock AI insight alert should be generated when quantity <= minimum_stock');
    console.log(`Verified Insight Alert: ${lowStockInsight.message}`);

    console.log('✅ ALL DATABASE VALIDATION TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (error) {
    console.error('❌ DATABASE VALIDATION TEST FAILED:', error.message);
    process.exit(1);
  }
})();
