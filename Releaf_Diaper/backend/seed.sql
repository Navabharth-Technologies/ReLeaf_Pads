-- Run this script in SQL Server Management Studio (SSMS) against the releaf_pads database

-- 1. Insert Products
INSERT INTO dbo.Product (id, name, packSize, mrp, sellingPrice, discount, description, imageFallback, stock, stockStatus, totalSold, active)
VALUES 
('p1', 'Nappee Diapers - Sample Pack', '10 Diapers', 250.00, 200.00, 20.00, 'Sample pack of Nappee Diapers.', '#5D9CEC', 50, 'IN_STOCK', 0, 1);
