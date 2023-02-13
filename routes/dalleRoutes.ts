import express from "express";
import * as dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();

const router = express.Router();

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

router.route("/").get((req, res) => {
  res.send("Hello from DALL-E");
});

router.route("/").post(async (req, res) => {
  try {
    const { prompt } = req.body;

    const aiImageResponse = await openai.createImage({
      prompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    });

    const aiStoryResponse = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Create a short story using this prompt: ${prompt}`,
      temperature: 0.7,
      max_tokens: 512,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
    });

    const image = aiImageResponse.data.data[0].b64_json;
    const text = aiStoryResponse.data.choices[0].text;

    res.status(200).json({ photo: image, story: text });
  } catch (error) {
    console.log(error);
    res.status(500).send(error?.response.data.error.message);
  }
});

export default router;
