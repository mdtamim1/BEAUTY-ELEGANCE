import db from '../config/db';
export const getProducts = (req, res) => {
    db.all(`SELECT * FROM products`, [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ status: 'error', message: 'Database error' });
        }
        const parsedRows = (rows || []).map((row) => ({
            ...row,
            features: row.features ? JSON.parse(row.features) : [],
            specs: row.specs ? JSON.parse(row.specs) : [],
            published: row.published === 1,
            in_stock: row.in_stock === 1
        }));
        res.json({ status: 'success', data: parsedRows });
    });
};
export const getProductById = (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM products WHERE id = ?`, [id], (err, product) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ status: 'error', message: 'Database error' });
        }
        if (!product) {
            return res.status(404).json({ status: 'error', message: 'Product not found' });
        }
        // Fetch product gallery
        db.all(`SELECT image_url FROM product_gallery WHERE product_id = ?`, [id], (err, galleryRows) => {
            const gallery = galleryRows ? galleryRows.map(r => r.image_url) : [];
            res.json({
                status: 'success',
                data: {
                    ...product,
                    features: product.features ? JSON.parse(product.features) : [],
                    specs: product.specs ? JSON.parse(product.specs) : [],
                    published: product.published === 1,
                    in_stock: product.in_stock === 1,
                    gallery: gallery.length > 0 ? gallery : [product.image]
                }
            });
        });
    });
};
export const createProduct = (req, res) => {
    const { name, slug, sku, brand, category, price, original_price, image, description, stock, published, features, specs, gallery } = req.body;
    const id = 'PRD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        db.run(`INSERT INTO products (id, name, slug, sku, brand, category, price, original_price, image, description, stock, published, features, specs)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            id, name, slug, sku, brand, category, price, original_price, image, description, stock || 0,
            published ? 1 : 0, JSON.stringify(features || []), JSON.stringify(specs || [])
        ], function (err) {
            if (err) {
                db.run('ROLLBACK');
                console.error(err);
                return res.status(500).json({ status: 'error', message: err.message });
            }
            // Insert gallery
            if (gallery && Array.isArray(gallery)) {
                const stmt = db.prepare(`INSERT INTO product_gallery (product_id, image_url) VALUES (?, ?)`);
                gallery.forEach((img) => {
                    if (img.trim()) {
                        stmt.run([id, img.trim()]);
                    }
                });
                stmt.finalize();
            }
            db.run('COMMIT', (err) => {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ status: 'error', message: 'Failed to commit transaction' });
                }
                res.json({ status: 'success', message: 'Product created', data: { id } });
            });
        });
    });
};
export const updateProduct = (req, res) => {
    const { id } = req.params;
    const { name, price, original_price, stock, description, image, brand, category, published, features, specs, gallery } = req.body;
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        db.run(`UPDATE products 
       SET name = COALESCE(?, name), 
           price = COALESCE(?, price), 
           original_price = COALESCE(?, original_price), 
           stock = COALESCE(?, stock), 
           description = COALESCE(?, description), 
           image = COALESCE(?, image),
           brand = COALESCE(?, brand),
           category = COALESCE(?, category),
           published = COALESCE(?, published),
           features = COALESCE(?, features),
           specs = COALESCE(?, specs)
       WHERE id = ?`, [
            name, price, original_price, stock, description, image, brand, category,
            published === undefined ? null : (published ? 1 : 0),
            features ? JSON.stringify(features) : null,
            specs ? JSON.stringify(specs) : null,
            id
        ], function (err) {
            if (err) {
                db.run('ROLLBACK');
                console.error(err);
                return res.status(500).json({ status: 'error', message: 'Database error' });
            }
            if (gallery && Array.isArray(gallery)) {
                db.run(`DELETE FROM product_gallery WHERE product_id = ?`, [id], (err) => {
                    if (err) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ status: 'error', message: 'Failed to clear old gallery' });
                    }
                    const stmt = db.prepare(`INSERT INTO product_gallery (product_id, image_url) VALUES (?, ?)`);
                    gallery.forEach((img) => {
                        if (img.trim()) {
                            stmt.run([id, img.trim()]);
                        }
                    });
                    stmt.finalize();
                    db.run('COMMIT', (err) => {
                        if (err) {
                            db.run('ROLLBACK');
                            return res.status(500).json({ status: 'error', message: 'Failed to commit transaction' });
                        }
                        res.json({ status: 'success', message: 'Product updated' });
                    });
                });
            }
            else {
                db.run('COMMIT', (err) => {
                    if (err) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ status: 'error', message: 'Failed to commit transaction' });
                    }
                    res.json({ status: 'success', message: 'Product updated' });
                });
            }
        });
    });
};
export const deleteProduct = (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM products WHERE id = ?`, [id], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ status: 'error', message: 'Database error' });
        }
        res.json({ status: 'success', message: 'Product deleted' });
    });
};
