import { Request, Response } from 'express';
import db from '../config/db';

// ============================================
// AI CHATBOT CONTROLLER — Gemini Integration
// Securely proxies AI requests through backend
// API key NEVER exposed to frontend
// ============================================

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

// Build a rich system prompt from live product database
function buildSystemPrompt(products: any[], storeName: string): string {
  const productList = products.map((p: any, i: number) => {
    let features = [];
    let specs = [];
    try {
      if (p.features) {
        features = typeof p.features === 'string' ? JSON.parse(p.features) : p.features;
      }
    } catch (e) {
      console.error(`Error parsing features for product prompt ${p.id}:`, e);
    }
    try {
      if (p.specs) {
        specs = typeof p.specs === 'string' ? JSON.parse(p.specs) : p.specs;
      }
    } catch (e) {
      console.error(`Error parsing specs for product prompt ${p.id}:`, e);
    }
    const inStock = p.in_stock === 1 || p.in_stock === true || p.stock > 0;
    const published = p.published === 1 || p.published === true;

    if (!published) return null;

    let info = `${i + 1}. **${p.name}**`;
    info += `\n   - ID: ${p.id}`;
    info += `\n   - Category: ${p.category || 'N/A'}`;
    info += `\n   - Brand: ${p.brand || 'N/A'}`;
    info += `\n   - Price: ৳${p.price}`;
    if (p.original_price && p.original_price > p.price) {
      const discount = Math.round((1 - p.price / p.original_price) * 100);
      info += ` (was ৳${p.original_price}, ${discount}% off!)`;
    }
    info += `\n   - Stock: ${inStock ? `In Stock (${p.stock || 'Available'})` : 'Out of Stock'}`;
    if (p.description) info += `\n   - Description: ${p.description}`;
    if (features.length > 0) info += `\n   - Features: ${features.join(', ')}`;
    if (specs.length > 0) {
      const specStr = specs.map((s: any) => `${s.name}: ${s.value}`).join(', ');
      info += `\n   - Specs: ${specStr}`;
    }
    if (p.rating) info += `\n   - Rating: ${p.rating}/5 (${p.reviews || 0} reviews)`;
    return info;
  }).filter(Boolean).join('\n\n');

  return `You are a friendly, helpful, and knowledgeable AI shopping assistant for "${storeName}".

YOUR ROLE:
- Help customers find the right products
- Answer questions about products (price, features, specs, stock availability)
- Provide product recommendations based on customer needs
- Be warm, conversational, and helpful
- If a customer asks about something you don't know, politely say you don't have that information

LANGUAGE:
- Respond in the same language the customer uses
- If they write in Bangla/Bengali, respond in Bangla
- If they write in English, respond in English
- Keep responses concise but informative

IMPORTANT RULES:
- NEVER make up product information — only use the data provided below
- NEVER share internal IDs like "PRD-xxx" — just use product names
- If a product is out of stock, let the customer know
- If asked about pricing, always mention the currency as ৳ (Taka)
- Be enthusiastic about deals and discounts!
- DO NOT discuss topics unrelated to the store and its products

CURRENT PRODUCT CATALOG:
${productList || 'No products currently available.'}

Remember: You represent ${storeName}. Be professional, friendly, and always prioritize the customer experience! 🛍️`;
}

export const chatWithAI = async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ status: 'error', message: 'Message is required' });
    }

    if (message.trim().length > 2000) {
      return res.status(400).json({ status: 'error', message: 'Message too long (max 2000 characters)' });
    }

    // Fetch all published products from database (live data - auto-updates when new products added)
    const products: any[] = await new Promise((resolve, reject) => {
      db.all(`SELECT * FROM products WHERE published = 1`, [], (err, rows) => {
        if (err) {
          console.error('Failed to fetch products for AI:', err);
          resolve([]);
        } else {
          resolve((rows || []).map((row: any) => {
            let features = [];
            let specs = [];
            try {
              if (row.features) features = JSON.parse(row.features);
            } catch (e) {
              console.error(`Error parsing features for AI product ${row.id}:`, e);
            }
            try {
              if (row.specs) specs = JSON.parse(row.specs);
            } catch (e) {
              console.error(`Error parsing specs for AI product ${row.id}:`, e);
            }
            return {
              ...row,
              features,
              specs,
            };
          }));
        }
      });
    });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set in environment variables. Operating in Local AI mode.');
      const localReply = generateLocalAIResponse(message.trim(), products);
      db.run(
        `INSERT INTO ai_queries (query_text, reply_text, model_used) VALUES (?, ?, ?)`,
        [message.trim(), localReply, 'Local-Heuristic-Mode']
      );
      return res.json({
        status: 'success',
        data: {
          reply: localReply,
          role: 'model'
        }
      });
    }

    const storeName = 'AURA Sports';
    const systemPrompt = buildSystemPrompt(products, storeName);

    // Build conversation history for multi-turn chat
    const contents: ChatMessage[] = [];

    // Add previous conversation history if provided
    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-10)) { // Keep last 10 messages for context
        if (msg.role === 'user' || msg.role === 'model') {
          contents.push({
            role: msg.role,
            parts: [{ text: msg.text || '' }]
          });
        }
      }
    }

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message.trim() }]
    });

    // Call Gemini API — try multiple models as fallback if quota is exceeded
    const models = [
      'gemini-2.0-flash',
      'gemini-1.5-flash'
    ];

    let lastError = '';

    for (const model of models) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      try {
        const geminiResponse = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemPrompt }]
            },
            contents,
            generationConfig: {
              temperature: 0.7,
              topP: 0.9,
              topK: 40,
              maxOutputTokens: 1024,
            },
            safetySettings: [
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            ]
          })
        });

        if (geminiResponse.status === 429) {
          console.warn(`Model ${model} quota exceeded, trying next model...`);
          lastError = `Quota exceeded for ${model}`;
          continue; // Try next model
        }

        if (!geminiResponse.ok) {
          const errorData = await geminiResponse.text();
          console.error(`Gemini API error (${model}):`, geminiResponse.status, errorData);
          lastError = `API error ${geminiResponse.status} for ${model}`;
          continue; // Try next model
        }

        const data = await geminiResponse.json();
        const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiText) {
          console.error(`No AI response text from ${model}:`, JSON.stringify(data));
          lastError = `Empty response from ${model}`;
          continue; // Try next model
        }

        // Success! Return the response
        console.log(`AI response generated successfully using model: ${model}`);
        db.run(
          `INSERT INTO ai_queries (query_text, reply_text, model_used) VALUES (?, ?, ?)`,
          [message.trim(), aiText, model]
        );
        return res.json({
          status: 'success',
          data: {
            reply: aiText,
            role: 'model'
          }
        });

      } catch (fetchError: any) {
        console.error(`Fetch error for model ${model}:`, fetchError.message);
        lastError = fetchError.message;
        continue; // Try next model
      }
    }

    // All models failed — fallback to local AI response
    console.warn('All Gemini models failed. Falling back to Local AI mode. Error:', lastError);
    const localReply = generateLocalAIResponse(message.trim(), products);
    db.run(
      `INSERT INTO ai_queries (query_text, reply_text, model_used) VALUES (?, ?, ?)`,
      [message.trim(), localReply, 'Local-Fallback-Mode']
    );
    return res.json({
      status: 'success',
      data: {
        reply: localReply,
        role: 'model'
      }
    });

  } catch (error: any) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getAIAnalytics = async (req: Request, res: Response) => {
  try {
    db.all(`SELECT DATE(created_at) as date, COUNT(*) as count FROM ai_queries GROUP BY DATE(created_at) ORDER BY date ASC LIMIT 30`, [], (err, dailyRows) => {
      if (err) return res.status(500).json({ status: 'error', message: err.message });
      
      db.all(`SELECT query_text as query, COUNT(*) as count FROM ai_queries GROUP BY query_text ORDER BY count DESC LIMIT 8`, [], (err, popularRows) => {
        if (err) return res.status(500).json({ status: 'error', message: err.message });
        
        db.get(`SELECT COUNT(*) as total FROM ai_queries`, [], (err, totalRow: any) => {
          if (err) return res.status(500).json({ status: 'error', message: err.message });
          
          db.all(`SELECT model_used as model, COUNT(*) as count FROM ai_queries GROUP BY model_used`, [], (err, modelRows) => {
            if (err) return res.status(500).json({ status: 'error', message: err.message });
            
            res.json({
              status: 'success',
              data: {
                dailyVolume: dailyRows || [],
                popularQuestions: popularRows || [],
                totalQueries: totalRow ? totalRow.total : 0,
                modelDistribution: modelRows || []
              }
            });
          });
        });
      });
    });
  } catch (error: any) {
    console.error('Failed to get AI analytics:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

function generateLocalAIResponse(message: string, products: any[]): string {
  const query = message.toLowerCase().trim();

  const isAskingForUse = query.includes('use') || query.includes('kivabe') || query.includes('কিভাবে') || query.includes('নিয়ম') || query.includes('rules') || query.includes('kaj') || query.includes('কাজ') || query.includes('ব্যবহার') || query.includes('work') || query.includes('hobe');
  const isAskingForBenefits = query.includes('upokarita') || query.includes('উপকার') || query.includes('সুবিধা') || query.includes('benefit') || query.includes('feature') || query.includes('ফিচার');
  const isAskingForSpecs = query.includes('spec') || query.includes('মাপ') || query.includes('size') || query.includes('সাইজ') || query.includes('material') || query.includes('উপাদান') || query.includes('বিবরণ') || query.includes('details') || query.includes('বিস্তারিত');
  const isAskingForPrice = query.includes('price') || query.includes('দাম') || query.includes('কত') || query.includes('টাকা') || query.includes('cost');
  const isAskingForStock = query.includes('stock') || query.includes('আছে') || query.includes('পাব') || query.includes('পাওয়া');

  const buildTailoredResponse = (product: any): string => {
    const inStock = product.in_stock === 1 || product.in_stock === true || product.stock > 0;
    
    if (isAskingForUse) {
      let reply = `**${product.name}** এর ব্যবহারের নিয়ম ও কাজের বিবরণ:\n\n`;
      if (product.description) {
        reply += `**ব্যবহারের নিয়ম ও পরামর্শ:** ${product.description}\n\n`;
      } else {
        reply += `পণ্যটি নিরাপদে এবং দক্ষতার সাথে ব্যবহারের জন্য প্যাকেজের গায়ে থাকা নির্দেশনাবলী অনুসরণ করুন। ব্যবহারের সময় কোনো সমস্যায় পড়লে আমাদের হেল্পলাইনে যোগাযোগ করতে পারেন।\n\n`;
      }
      if (product.features && product.features.length > 0) {
        reply += `**ব্যবহারের সুবিধা ও বৈশিষ্ট্যসমূহ:**\n`;
        product.features.forEach((f: string) => {
          reply += `- ${f}\n`;
        });
      }
      return reply;
    }

    if (isAskingForBenefits) {
      let reply = `**${product.name}** এর উপকারিতা ও বিশেষ ফিচারসমূহ:\n\n`;
      if (product.features && product.features.length > 0) {
        product.features.forEach((f: string) => {
          reply += `- ${f}\n`;
        });
      } else if (product.description) {
        reply += `${product.description}\n`;
      } else {
        reply += `এটি একটি অত্যন্ত মানসম্পন্ন ও কার্যকরী পণ্য।\n`;
      }
      return reply;
    }

    if (isAskingForSpecs) {
      let reply = `**${product.name}** এর স্পেসিফিকেশন ও বিস্তারিত তথ্য:\n\n`;
      if (product.specs && product.specs.length > 0) {
        product.specs.forEach((s: any) => {
          reply += `- **${s.name}**: ${s.value}\n`;
        });
      } else if (product.description) {
        reply += `**বিবরণ:** ${product.description}\n`;
      }
      return reply;
    }

    if (isAskingForPrice) {
      let reply = `**${product.name}** এর বর্তমান মূল্য ৳${product.price}।`;
      if (product.original_price && product.original_price > product.price) {
        reply += ` (পূর্বে এর মূল্য ছিল ৳${product.original_price}, যা এখন ${Math.round((1 - product.price / product.original_price) * 100)}% ছাড়ে পাওয়া যাচ্ছে!)`;
      }
      return reply;
    }

    if (isAskingForStock) {
      return `**${product.name}** পণ্যটি ${inStock ? `বর্তমানে স্টকে আছে (বাকি আছে ${product.stock || 1} টি)` : 'বর্তমানে স্টক আউট'}`;
    }

    // Default detailed product info card
    let reply = `**${product.name}** সম্পর্কে বিস্তারিত তথ্য ও পরামর্শ:\n\n`;
    reply += `- **মূল্য**: ৳${product.price}\n`;
    if (product.original_price && product.original_price > product.price) {
      reply += `- **মূল্যছাড়**: ৳${product.original_price} (${Math.round((1 - product.price / product.original_price) * 100)}% ছাড়!)\n`;
    }
    reply += `- **স্টক**: ${inStock ? `স্টকে আছে (বাকি আছে ${product.stock || 1} টি)` : 'স্টক আউট'}\n`;
    if (product.description) reply += `- **বিবরণ ও ব্যবহারের নিয়ম**: ${product.description}\n`;
    
    if (product.features && product.features.length > 0) {
      reply += `\n**ফিচারসমূহ:**\n`;
      product.features.forEach((f: string) => {
        reply += `- ${f}\n`;
      });
    }

    if (product.specs && product.specs.length > 0) {
      reply += `\n**স্পেসিফিকেশন:**\n`;
      product.specs.forEach((s: any) => {
        reply += `- **${s.name}**: ${s.value}\n`;
      });
    }

    // Find related products in the same category
    if (product.category) {
      const related = products.filter(p => p.id !== product.id && p.category === product.category).slice(0, 3);
      if (related.length > 0) {
        reply += `\n🔗 **সম্পর্কিত অন্যান্য পণ্য (Related Products):**\n`;
        related.forEach(p => {
          reply += `- **${p.name}** (৳${p.price})\n`;
        });
      }
    }
    return reply;
  };

  // Direct product name matches & keyword aliases
  let matched = products.find(p => query.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(query));
  
  if (!matched) {
    const aliases = [
      { keywords: ['dumbbell', 'ডাম্বেল', 'ডামবেল'], productId: 'PRD-001' },
      { keywords: ['roller', 'রোলার', 'ab roller', 'এবি রোলার'], productId: 'PRD-002' },
      { keywords: ['football', 'ফুটবল', 'বল'], productId: 'PRD-003' },
      { keywords: ['badminton', 'র‍্যাকেট', 'র্যাকেট', 'রকেট', 'ব্যাডমিন্টন'], productId: 'PRD-004' },
      { keywords: ['shoes', 'জুতো', 'জুতা', 'রানিং', 'running'], productId: 'PRD-005' },
      { keywords: ['jersey', 'জার্সি', 'ড্রাই-ফিট', 'dri-fit'], productId: 'PRD-006' },
      { keywords: ['yoga', 'ম্যাট', 'ইয়োগা', 'ইয়োগা'], productId: 'PRD-007' },
      { keywords: ['basketball', 'বাস্কেটবল', 'হুপ', 'hoop'], productId: 'PRD-008' }
    ];
    
    for (const alias of aliases) {
      if (alias.keywords.some(kw => query.includes(kw))) {
        matched = products.find(p => p.id === alias.productId);
        if (matched) break;
      }
    }
  }

  if (matched) {
    return buildTailoredResponse(matched);
  }

  // Greetings
  if (query.includes('হ্যালো') || query.includes('hi') || query.includes('hello') || query.includes('কেমন আছ') || query.includes('আছেন')) {
    return 'হ্যালো! আমি আপনার AI শপিং অ্যাসিস্ট্যান্ট। আমি আপনাকে পণ্য খুঁজে পেতে, দাম জানতে, অথবা ব্যবহারের নিয়ম ও পরামর্শ জানতে সাহায্য করতে পারি। আপনি কি খুঁজছেন বলুন?';
  }

  // Catalog Queries
  if (query.includes('পণ্য') || query.includes('প্রোডাক্ট') || query.includes('product') || query.includes('list') || query.includes('কি কি আছে')) {
    if (products.length === 0) return 'দুঃখিত, এই মুহূর্তে কোনো পণ্য পাওয়া যাচ্ছে না।';
    const listStr = products.slice(0, 10).map(p => `- **${p.name}** (৳${p.price})`).join('\n');
    return `আমাদের স্টোরের পণ্যসমূহের তালিকা নিচে দেওয়া হলো:\n\n${listStr}\n\nযেকোনো পণ্যের বিস্তারিত বা ব্যবহারের নিয়ম জানতে তার নাম লিখে প্রশ্ন করুন!`;
  }

  // Low Price Queries
  if (query.includes('কম দাম') || query.includes('সস্তা') || query.includes('cheap') || query.includes('low price') || query.includes('কমদামি')) {
    if (products.length === 0) return 'দুঃখিত, এই মুহূর্তে কোনো পণ্য পাওয়া যাচ্ছে না।';
    const sorted = [...products].sort((a, b) => a.price - b.price);
    const listStr = sorted.slice(0, 5).map(p => `- **${p.name}** (৳${p.price})`).join('\n');
    return `আমাদের স্টোরের সবচেয়ে কম দামের পণ্যসমূহ:\n\n${listStr}`;
  }

  // Discount Queries
  if (query.includes('ছাড়') || query.includes('অফার') || query.includes('discount') || query.includes('sale') || query.includes('ক্যাম্পেইন')) {
    const discounted = products.filter(p => p.original_price && p.original_price > p.price);
    if (discounted.length === 0) return 'এই মুহূর্তে কোনো পণ্যে সরাসরি মূল্যছাড় নেই, তবে আমাদের সব পণ্যের দামই অত্যন্ত সাশ্রয়ী!';
    const listStr = discounted.slice(0, 5).map(p => {
      const pct = Math.round((1 - p.price / p.original_price) * 100);
      return `- **${p.name}**: ৳${p.price} (মূল্য: ৳${p.original_price}, **${pct}% ছাড়!**)`;
    }).join('\n');
    return `আমাদের আকর্ষণীয় অফার ও ডিসকাউন্টযুক্ত পণ্যসমূহ:\n\n${listStr}`;
  }

  // Smart Synonyms & Category queries
  let targetCategoryName: string | null = null;
  
  if (query.includes('fitness') || query.includes('ফিটনেস') || query.includes('gym') || query.includes('gym') || query.includes('জিম') || query.includes('ব্যায়াম') || query.includes('ব্যায়াম') || query.includes('workout') || query.includes('exercise') || query.includes('dumbbell') || query.includes('ডাম্বেল') || query.includes('রোলার') || query.includes('roller')) {
    targetCategoryName = 'Fitness Item';
  } else if (query.includes('game') || query.includes('sports') || query.includes('খেলা') || query.includes('খেলার') || query.includes('ফুটবল') || query.includes('football') || query.includes('ক্রিকেট') || query.includes('ball') || query.includes('বল') || query.includes('বাস্কেটবল') || query.includes('basketball') || query.includes('badminton') || query.includes('ব্যাটমিন্টন')) {
    targetCategoryName = 'Sports Game';
  } else if (query.includes('shoes') || query.includes('জুতা') || query.includes('জুতো') || query.includes('স্নিকার') || query.includes('sneakers') || query.includes('shoe')) {
    targetCategoryName = 'Sports Shoes';
  } else if (query.includes('wear') || query.includes('jersey') || query.includes('জার্সি') || query.includes('tshirt') || query.includes('t-shirt') || query.includes('টি-শার্ট') || query.includes('পোশাক') || query.includes('cloth') || query.includes('কাপড়') || query.includes('polo') || query.includes('পোলো')) {
    targetCategoryName = 'Sports wear';
  }
  
  let categoryMatched = products;
  if (targetCategoryName) {
    categoryMatched = products.filter(p => p.category && p.category.toLowerCase().includes(targetCategoryName!.toLowerCase()));
  } else {
    categoryMatched = products.filter(p => p.category && query.includes(p.category.toLowerCase()));
  }

  if (categoryMatched.length > 0) {
    const listStr = categoryMatched.slice(0, 5).map(p => `- **${p.name}** (৳${p.price})`).join('\n');
    return `আমাদের কাছে **${categoryMatched[0].category || targetCategoryName}** সংক্রান্ত নিচের পণ্যগুলো রয়েছে:\n\n${listStr}\n\nপণ্যের বিবরণ, দাম বা ব্যবহারের নিয়ম জানতে পণ্যটির নাম লিখে প্রশ্ন করতে পারেন!`;
  }

  // Default fallback with categories and products listing
  const categoryNames = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  const categoryListStr = categoryNames.length > 0 
    ? `\n\nআমাদের স্টোরের প্রধান ক্যাটাগরিগুলো হলো:\n` + categoryNames.map(c => `- **${c}**`).join('\n')
    : '';
    
  const popularListStr = products.length > 0
    ? `\n\nজনপ্রিয় কিছু পণ্য:\n` + products.slice(0, 3).map(p => `- **${p.name}** (৳${p.price})`).join('\n')
    : '';

  return `আমি আপনার প্রশ্নটি সরাসরি বুঝতে পারিনি। আমি আপনাকে পণ্য খুঁজে পেতে, দাম জানতে অথবা পরামর্শ দিতে সাহায্য করতে পারি।${categoryListStr}${popularListStr}\n\nঅনুগ্রহ করে কোনো পণ্যের নাম বা আপনার পছন্দের ক্যাটাগরি লিখে প্রশ্ন করুন!`;
}
