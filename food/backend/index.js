const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY.trim()
});

const systemPrompt = `You are a food waste reduction assistant specializing in helping restaurants minimize pizza waste. Analyze the difference between pizzas purchased and consumed, then provide a brief, practical suggestion to reduce waste. Keep responses under 2 sentences.`;

app.post('/api/waste-calculation', async (req, res) => {
    try {
        const { pizzasPurchased, pizzasConsumed } = req.body;
        const wasteAmount = pizzasPurchased - pizzasConsumed;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Pizzas purchased: ${pizzasPurchased}, Pizzas consumed: ${pizzasConsumed}. The waste is ${wasteAmount} pizzas. Suggest how to reduce this waste.` }
            ],
            max_tokens: 100,
            temperature: 0.7
        });

        res.json({
            wasteAmount,
            suggestion: response.choices[0].message.content,
            minimizedWaste: wasteAmount + 1
        });

    } catch (error) {
        res.status(500).json({ error: 'Error processing request' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));