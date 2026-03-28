# LabMate
A computer lab reservation system built for De La Salle University - Manila. 
Students can view available slots and reserve seats across DLSU's labs, 
while lab technicians can manage bookings and handle no-shows.

🔗 Live App: <TBA>

## Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- Handlebars
- express-session + bcrypt

## Setup & Running Locally

### Prerequisites
- Node.js
- MongoDB

### Setup
1. Clone the repository and install dependencies:
```
git clone https://github.com/jezmerrr/CCAPDEV.git
cd CCAPDEV
npm install
```

2. Seed the database with sample data:
```
node seed.js
```

### Running the Application
Open two terminals:

Terminal 1 — Start MongoDB:
```
mongod
```

Terminal 2 — Start the server:
```
node app.js
```

Then open your browser and go to `http://localhost:3000`.
