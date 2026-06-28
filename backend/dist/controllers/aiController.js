import db from '../config/db';
// Build a rich system prompt from live product database
function buildSystemPrompt(products, storeName) {
    const productList = products.map((p, i) => {
        const features = p.features ? (typeof p.features === 'string' ? JSON.parse(p.features) : p.features) : [];
        const specs = p.specs ? (typeof p.specs === 'string' ? JSON.parse(p.specs) : p.specs) : [];
        const inStock = p.in_stock === 1 || p.in_stock === true || p.stock > 0;
        const published = p.published === 1 || p.published === true;
        if (!published)
            return null;
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
        if (p.description)
            info += `\n   - Description: ${p.description}`;
        if (features.length > 0)
            info += `\n   - Features: ${features.join(', ')}`;
        if (specs.length > 0) {
            const specStr = specs.map((s) => `${s.name}: ${s.value}`).join(', ');
            info += `\n   - Specs: ${specStr}`;
        }
        if (p.rating)
            info += `\n   - Rating: ${p.rating}/5 (${p.reviews || 0} reviews)`;
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
export const chatWithAI = async (req, res) => {
    try {
        const { message, history } = req.body;
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({ status: 'error', message: 'Message is required' });
        }
        if (message.trim().length > 2000) {
            return res.status(400).json({ status: 'error', message: 'Message too long (max 2000 characters)' });
        }
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('GEMINI_API_KEY is not set in environment variables');
            return res.status(500).json({ status: 'error', message: 'AI service is not configured' });
        }
        // Fetch all published products from database (live data - auto-updates when new products added)
        const products = await new Promise((resolve, reject) => {
            db.all(`SELECT * FROM products WHERE published = 1`, [], (err, rows) => {
                if (err) {
                    console.error('Failed to fetch products for AI:', err);
                    resolve([]);
                }
                else {
                    resolve((rows || []).map((row) => ({
                        ...row,
                        features: row.features ? JSON.parse(row.features) : [],
                        specs: row.specs ? JSON.parse(row.specs) : [],
                    })));
                }
            });
        });
        const storeName = 'AURA Sports';
        const systemPrompt = buildSystemPrompt(products, storeName);
        // Build conversation history for multi-turn chat
        const contents = [];
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
                return res.json({
                    status: 'success',
                    data: {
                        reply: aiText,
                        role: 'model'
                    }
                });
            }
            catch (fetchError) {
                console.error(`Fetch error for model ${model}:`, fetchError.message);
                lastError = fetchError.message;
                continue; // Try next model
            }
        }
        // All models failed
        console.error('All Gemini models failed. Last error:', lastError);
        return res.status(502).json({ status: 'error', message: 'AI service temporarily unavailable. Please try again later.' });
    }
    catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
