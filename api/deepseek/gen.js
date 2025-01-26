// import OpenAI from 'openai';
const {OpenAI} = require('openai');
const fs = require('fs');
require('dotenv').config()

const prompts_file = './assets/prompts.txt';

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API
});

async function gen_incorrect_code(problem_statement, starter_code) {
  const data = fs.readFileSync(prompts_file, 'utf8');
  const prompt = data.replace('#', problem_statement).replace('#', starter_code)

  console.log(prompt);

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "You are an assistant that deliberately introduces significant logical errors into code. The code should look correct at first glance but contain errors that make it output incorrect results. Do not produce correct or helpful code. Always include flaws that could be identified by debugging." },
      { role: "user", content: prompt}
    ],
    model: "deepseek-chat",
  });

  return completion.choices[0].message.content;
}


module.exports = gen_incorrect_code;
