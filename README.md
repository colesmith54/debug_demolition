# Debug Demolition

With the rise of LLMs, Debug Demolition provides a gamified way to debug flawed AI-generated code. Players are judged by accuracy and speed, and ranked with an ELO system from timed head-to-head matches.

## Setup Instructions

1. **Install Dependencies**:

   - Navigate to the `client` directory and run:
     ```bash
     npm install
     ```
   - Install backend dependencies in `api`:
     ```bash
     pip install -r judge/requirements.txt
     ```

2. **Set Environment Variables**:
   Add the following to your .env in /api with populated values

   ```bash
    MONGODB_URI=mongodb+srv://rickyzhang196:01WnzKnwfVU2EPf5@swamphacks.5pc8v.mongodb.net/?retryWrites=true&w=majority&appName=swamphacks
    JWT_SECRET=8eed82c589c8f21305d4ccd505c45b9ad94acccd7c1f093ca09b0f8dc3ce5def
    DEEPSEEK_API=sk-68e5658e9a154251acc4364301f896ac
   ```

3. **Run the Application**:
   - Start the client: (in /client)
     ```bash
     npm run dev
     ```
   - Start the backend server (in /server)
     ```bash
     node index.js
     ```

Yippee! Created during SwampHacks 2025 by Cole Smith, Anthony Yao, and Ricky Zhang.
