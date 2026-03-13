## Setup & Running Locally

### Prerequisites

- [Node.js](https://nodejs.org/) 
- [MongoDB](https://www.mongodb.com/try/download/community) 

### Setup

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/jezmerrr/CCAPDEV.git
   cd CCAPDEV
   npm install
   ```

2. Seed the database with sample data:

   ```bash
   node seed.js
   ```

### Running the Application

Open two terminals:

**Terminal 1** — Start MongoDB:
```bash
mongod
```

**Terminal 2** — Start the server:
```bash
node app.js
```

Then open your browser and go to `http://localhost:3000`.

