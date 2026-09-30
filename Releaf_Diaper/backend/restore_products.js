const { Pool } = require('pg');

const pool = new Pool({ 
  connectionString: 'postgres://releaf_db_user:A5po9SYOqeMqDHUWHO3LkkvFZPWGwxDP@dpg-da5uv1ojo6nc73dq9j6g-a.oregon-postgres.render.com:5432/releaf_db', 
  ssl: { rejectUnauthorized: false } 
});

async function restoreProducts() {
  const client = await pool.connect();
  try {
    console.log("Restoring products...");
    await client.query(`
      INSERT INTO Product (id, name, packSize, mrp, sellingPrice, discount, description, imageFallback, stock, stockStatus, totalSold, active)
      VALUES 
      ('p1', 'Nappee Diapers - Sample Pack', '10 Diapers', 250.00, 200.00, 20.00, 'Sample pack of Nappee Diapers.', '#5D9CEC', 50, 'IN_STOCK', 0, true)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log("Products successfully restored!");
  } catch (err) {
    console.error("Error restoring products:", err);
  } finally {
    client.release();
    pool.end();
  }
}

restoreProducts();
