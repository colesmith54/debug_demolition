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
    redacted
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
