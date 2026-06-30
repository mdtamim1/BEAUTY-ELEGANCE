import { Request, Response } from 'express';
import db from '../config/db';
import { cacheService } from '../services/cacheService';

export const getOrders = (req: Request, res: Response) => {
  db.all(`SELECT * FROM orders ORDER BY created_at DESC`, [], (err, orderRows: any[]) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    if (!orderRows || orderRows.length === 0) {
      return res.json({ status: 'success', data: [] });
    }

    // Fetch all order items and map them to their parent orders
    db.all(`SELECT * FROM order_items`, [], (err, itemRows: any[]) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: 'error', message: 'Database error' });
      }

      const ordersWithItems = orderRows.map(order => {
        const items = itemRows ? itemRows.filter(item => item.order_id === order.id) : [];
        return {
          ...order,
          productsList: items.map(item => ({
            name: item.product_name,
            color: item.color,
            size: item.size,
            code: item.code,
            quantity: item.quantity,
            price: item.price
          }))
        };
      });

      res.json({ status: 'success', data: ordersWithItems });
    });
  });
};

export const getOrderById = (req: Request, res: Response) => {
  const { id } = req.params;
  db.get(`SELECT * FROM orders WHERE id = ?`, [id], (err, order: any) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }
    // Fetch order items
    db.all(`SELECT * FROM order_items WHERE order_id = ?`, [id], (err, items) => {
      res.json({
        status: 'success',
        data: {
          ...order,
          productsList: items || []
        }
      });
    });
  });
};

export const createOrder = (req: Request, res: Response) => {
  const {
    customer,
    email,
    amount,
    items,
    paymentMethod,
    storeName,
    phone,
    address,
    courier,
    city,
    thana,
    area,
    customerNote,
    shopNote,
    paymentType,
    memoNumber,
    deliveryCharge,
    discount,
    paidAmount,
    subtotal,
    productsList,
  } = req.body;

  const id = 'ORD-' + Math.floor(10000 + Math.random() * 90000);

  db.run('BEGIN TRANSACTION', (txErr) => {
    if (txErr) {
      console.error('Failed to start transaction:', txErr);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }

    db.run(
      `INSERT INTO orders (
        id, customer, email, amount, items, payment_method, store_name, phone, address, 
        courier, city, thana, area, customer_note, shop_note, payment_type, memo_number, 
        delivery_charge, discount, paid_amount, subtotal, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'processing')`,
      [
        id, customer, email, amount, items, paymentMethod, storeName, phone, address,
        courier, city, thana, area, customerNote, shopNote, paymentType, memoNumber,
        deliveryCharge, discount, paidAmount, subtotal
      ],
      function (err) {
        if (err) {
          console.error('Error inserting order:', err);
          db.run('ROLLBACK', (rbErr) => {
            if (rbErr) console.error('Error rolling back transaction:', rbErr);
          });
          return res.status(500).json({ status: 'error', message: 'Failed to create order' });
        }

        // Insert order items
        if (productsList && Array.isArray(productsList) && productsList.length > 0) {
          const stmt = db.prepare(
            `INSERT INTO order_items (order_id, product_name, color, size, code, quantity, price) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          );
          
          let hasError = false;
          let pending = productsList.length;

          productsList.forEach((item: any) => {
            stmt.run(
              [id, item.name, item.color || 'Default', item.size || 'Free Size', item.code, item.quantity, item.price],
              (runErr: any) => {
                if (runErr) {
                  console.error('Error inserting order item:', runErr);
                  hasError = true;
                }
                pending--;
                if (pending === 0) {
                  stmt.finalize((finalizeErr: any) => {
                    if (hasError || finalizeErr) {
                      db.run('ROLLBACK', (rbErr) => {
                        if (rbErr) console.error('Error rolling back transaction:', rbErr);
                      });
                      return res.status(500).json({ status: 'error', message: 'Failed to insert order items' });
                    }
                    
                    db.run('COMMIT', (commitErr) => {
                      if (commitErr) {
                        console.error('Error committing transaction:', commitErr);
                        db.run('ROLLBACK', (rbErr) => {
                          if (rbErr) console.error('Error rolling back transaction:', rbErr);
                        });
                        return res.status(500).json({ status: 'error', message: 'Failed to commit transaction' });
                      }
                      cacheService.del('dashboard:stats').catch(console.error);
                      res.json({ status: 'success', message: 'Order created successfully', data: { id } });
                    });
                  });
                }
              }
            );
          });
        } else {
          db.run('COMMIT', (commitErr) => {
            if (commitErr) {
              console.error('Error committing transaction:', commitErr);
              db.run('ROLLBACK', (rbErr) => {
                if (rbErr) console.error('Error rolling back transaction:', rbErr);
              });
              return res.status(500).json({ status: 'error', message: 'Failed to commit transaction' });
            }
            cacheService.del('dashboard:stats').catch(console.error);
            res.json({ status: 'success', message: 'Order created successfully', data: { id } });
          });
        }
      }
    );
  });
};

export const updateOrderStatus = (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run(`UPDATE orders SET status = ? WHERE id = ?`, [status, id], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    // Invalidate dashboard stats cache
    cacheService.del('dashboard:stats').catch(console.error);
    res.json({ status: 'success', message: 'Order status updated' });
  });
};

export const updateOrder = (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    customer,
    email,
    amount,
    items,
    paymentMethod,
    storeName,
    phone,
    address,
    courier,
    city,
    thana,
    area,
    customerNote,
    shopNote,
    paymentType,
    memoNumber,
    deliveryCharge,
    discount,
    paidAmount,
    subtotal,
    status,
    productsList,
  } = req.body;

  db.run('BEGIN TRANSACTION', (txErr) => {
    if (txErr) {
      console.error('Failed to start transaction:', txErr);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }

    db.run(
      `UPDATE orders 
       SET customer = ?, email = ?, amount = ?, items = ?, payment_method = ?, store_name = ?, phone = ?, address = ?, 
           courier = ?, city = ?, thana = ?, area = ?, customer_note = ?, shop_note = ?, payment_type = ?, memo_number = ?, 
           delivery_charge = ?, discount = ?, paid_amount = ?, subtotal = ?, status = ?
       WHERE id = ?`,
      [
        customer, email, amount, items, paymentMethod, storeName, phone, address,
        courier, city, thana, area, customerNote, shopNote, paymentType, memoNumber,
        deliveryCharge, discount, paidAmount, subtotal, status, id
      ],
      function (err) {
        if (err) {
          console.error('Error updating order:', err);
          db.run('ROLLBACK', (rbErr) => {
            if (rbErr) console.error('Error rolling back transaction:', rbErr);
          });
          return res.status(500).json({ status: 'error', message: 'Failed to update order in database' });
        }

        // Delete existing items for the order
        db.run('DELETE FROM order_items WHERE order_id = ?', [id], (deleteErr) => {
          if (deleteErr) {
            console.error('Error deleting order items:', deleteErr);
            db.run('ROLLBACK', (rbErr) => {
              if (rbErr) console.error('Error rolling back transaction:', rbErr);
            });
            return res.status(500).json({ status: 'error', message: 'Failed to update order items' });
          }

          // Insert new order items
          if (productsList && Array.isArray(productsList) && productsList.length > 0) {
            const stmt = db.prepare(
              `INSERT INTO order_items (order_id, product_name, color, size, code, quantity, price) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`
            );
            
            let hasError = false;
            let pending = productsList.length;

            productsList.forEach((item: any) => {
              stmt.run(
                [id, item.name, item.color || 'Default', item.size || 'Free Size', item.code, item.quantity, item.price],
                (runErr: any) => {
                  if (runErr) {
                    console.error('Error updating order item:', runErr);
                    hasError = true;
                  }
                  pending--;
                  if (pending === 0) {
                    stmt.finalize((finalizeErr: any) => {
                      if (hasError || finalizeErr) {
                        db.run('ROLLBACK', (rbErr) => {
                          if (rbErr) console.error('Error rolling back transaction:', rbErr);
                        });
                        return res.status(500).json({ status: 'error', message: 'Failed to insert updated order items' });
                      }

                      db.run('COMMIT', (commitErr) => {
                        if (commitErr) {
                          console.error('Error committing transaction:', commitErr);
                          db.run('ROLLBACK', (rbErr) => {
                            if (rbErr) console.error('Error rolling back transaction:', rbErr);
                          });
                          return res.status(500).json({ status: 'error', message: 'Failed to commit transaction' });
                        }
                        cacheService.del('dashboard:stats').catch(console.error);
                        res.json({ status: 'success', message: 'Order updated successfully' });
                      });
                    });
                  }
                }
              );
            });
          } else {
            db.run('COMMIT', (commitErr) => {
              if (commitErr) {
                console.error('Error committing transaction:', commitErr);
                db.run('ROLLBACK', (rbErr) => {
                  if (rbErr) console.error('Error rolling back transaction:', rbErr);
                });
                return res.status(500).json({ status: 'error', message: 'Failed to commit transaction' });
              }
              cacheService.del('dashboard:stats').catch(console.error);
              res.json({ status: 'success', message: 'Order updated successfully' });
            });
          }
        });
      }
    );
  });
};
