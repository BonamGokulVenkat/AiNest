import { clerkClient } from '@clerk/express';
import OpenAI from "openai";
import sql from '../configs/db.js';
import axios from 'axios';
import FormData from 'form-data';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import pdfjs from 'pdfjs-dist/legacy/build/pdf.js'; // ✅ fixed import
const { getDocument } = pdfjs;



const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

export const generateArticle = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== 'pro' && free_usage >= 10) {
      return res.json({ success: false, message: "Limit reached. Upgrade to continue." });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: length,
    });
    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'article')`;

    if (plan !== 'pro') {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { free_usage: free_usage + 1 }
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== 'pro' && free_usage >= 10) {
      return res.json({ success: false, message: "Limit reached. Upgrade to continue." });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 100,
    });
    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`;

    if (plan !== 'pro') {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { free_usage: free_usage + 1 }
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const generateImage = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;

    if (plan !== 'pro') {
      return res.json({ success: false, message: "Upgrade to pro to continue." });
    }

    const formData = new FormData();
    formData.append('prompt', prompt);

    const { data } = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
      headers: {
        ...formData.getHeaders(),
        'x-api-key': process.env.CLIPDROP_API_KEY,
      },
      responseType: "arraybuffer",
    });

    const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;

    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    await sql`INSERT INTO creations (user_id, prompt, content, type, publish)
               VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})`;

    res.json({ success: true, secure_url });
  } catch (error) {
    if (error.response && error.response.data instanceof Buffer) {
    const readableError = JSON.parse(error.response.data.toString('utf8'));
    console.error("ClipDrop Error:", readableError);
    return res.json({ success: false, message: readableError.error || "ClipDrop API error" });
  }

  console.error("Error generating image:", error.message);
  res.json({ success: false, message: error.message });
  }
};

export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const plan = req.plan;

    if (plan !== 'pro') {
      return res.json({ success: false, message: "Upgrade to pro to continue." });
    }

    const file = req.file;
    if (!file) return res.json({ success: false, message: 'No image uploaded' });

    // Upload with background removal
    const result = await cloudinary.uploader.upload(file.path, {
      transformation: [
        {
          effect: 'background_removal',
          background_removal: 'cloudinary_ai', // Use 'cloudinary_ai' or 'remove_the_background' depending on your Cloudinary account
        }
      ]
    });

    // Cleanup local file
    fs.unlinkSync(file.path);

    // Log in DB
    await sql`INSERT INTO creations (user_id, prompt, content, type)
               VALUES (${userId}, 'remove background from image', ${result.secure_url}, 'image')`;

    res.json({ success: true, content: result.secure_url });
  } catch (error) {
    console.error('Cloudinary error:', error.message);
    res.json({ success: false, message: 'Background removal failed via Cloudinary' });
  }
};

export const removeImageObject = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const {object}= req.body;
    const image = req.file;
    const plan = req.plan;

    if (plan !== 'pro') {
      return res.json({ success: false, message: "Upgrade to pro to continue." });
    }

    const { public_id } = await cloudinary.uploader.upload(image.path);

    const imageUrl = cloudinary.url(public_id,{transformation:[{effect:`gen_remove:${object}`}],resource_type:'image'})

    await sql`INSERT INTO creations (user_id, prompt, content, type)
               VALUES (${userId}, ${`remove ${object} from image`}, ${imageUrl}, 'image')`;

    res.json({ success: true, content: imageUrl });
  } catch (error) {
    if (error.response && error.response.data instanceof Buffer) {
    const readableError = JSON.parse(error.response.data.toString('utf8'));
    console.error("ClipDrop Error:", readableError);
    return res.json({ success: false, message: readableError.error || "ClipDrop API error" });
  }

  console.error("Error generating image:", error.message);
  res.json({ success: false, message: error.message });
  }
};


export const resumeReview = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const resume = req.file;
    const plan = req.plan;

    if (plan !== 'pro') {
      return res.json({ success: false, message: "Upgrade to pro to continue." });
    }

    if (!resume || resume.size > 5 * 1024 * 1024) {
      return res.json({ success: false, message: "Resume file size exceeds 5MB or no file uploaded." });
    }

    // Read and parse PDF with pdfjs-dist
    const data = new Uint8Array(fs.readFileSync(resume.path));
    const pdf = await getDocument({ data }).promise;

    let text = '';
    const maxPages = pdf.numPages;

    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      text += pageText + '\n\n';
    }

    // 🧼 Clean extracted text to prevent invalid UTF-8 errors
    const cleanText = text
      .replace(/\x00/g, '') // remove null bytes
      .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\uFFFF]/g, ''); // remove non-printable characters

    const prompt = `Review the following resume and provide constructive feedback:\n\n${cleanText}`;

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;

    // ✅ Added likes: []
    await sql`
  INSERT INTO creations (user_id, prompt, content, type, likes)
  VALUES (${userId}, ${prompt}, ${content}, 'resume-review', ${'{}'}::text[])
`;

    res.json({ success: true, content });

  } catch (error) {
    console.error("Resume review error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
