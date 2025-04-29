const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');

const app = express();

// Allow requests from Angular (http://localhost:4200)
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

const upload = multer({ dest: 'uploads/' });

// Serve static files (if needed)
app.use(express.static('public'));

app.post('/analyze-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No image uploaded');
    }

    const imagePath = req.file.path;
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = req.file.mimetype;
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",  // Replace with your actual API key
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Food Image Analyzer",
      },
      body: JSON.stringify({
        model: "qwen/qwen2.5-vl-72b-instruct:free",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Please identify the food ingredients in this image and estimate their nutritional values (calories, protein, fat, carbohydrates, fiber) per 100 grams and the category for each ingredient(eg:fruit..)" },
              { type: "image_url", image_url: { url: dataUrl } }
            ]
          }
        ]
      }),
    });

    const result = await response.json();
    console.log('AI API Response:', result); // Log the full AI response
    if (!result?.choices || !result.choices[0]?.message?.content) {
      return res.status(500).send('Invalid response from AI API');
    }
    
    
    const simpleResult = result.choices[0].message.content; // Use the AI's response directly as text

    res.send(simpleResult); // Send the result as simple text

    fs.unlinkSync(imagePath); // Delete temp image
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).send(`Failed to analyze image. Error: ${error.message}`);
  }
});


console.log("Server is starting...");
app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});
