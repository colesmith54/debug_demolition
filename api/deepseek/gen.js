import OpenAI from 'openai';
import {parse} from 'csv-parse';
const fs = require('fs');
require('dotenv').config()

const problems_file = '../assets/problems.csv';
const prompts_file = '../assets/prompts.txt';

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API
});

async function gen_incorrect_code(problem_statement, starter_code) {
  const data = fs.readFileSync(prompts_file, 'utf8');
  const prompt = data.replace('#', problem_statement).replace('#', starter_code)

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: prompt}
    ],
    model: "deepseek-chat",
  });

  return completion.choices[0].message.content;
}


export default gen_incorrect_code;
