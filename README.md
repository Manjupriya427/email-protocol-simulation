# Email Protocol Simulation and Validation System

A simple college project demonstrating SMTP-style email transmission, finite-state-machine validation, regular expressions, and basic IMAP/POP3 retrieval simulations.

## Requirements
- Node.js 18+
- MongoDB Community Server or MongoDB Atlas
- npm

## Run the project

### 1. Backend
```bash
cd server
npm install
```
Copy `.env.example` to `.env` and set your MongoDB connection string.
```bash
npm run dev
```
Backend: http://localhost:5000

### 2. Frontend
Open another terminal:
```bash
cd client
npm install
npm run dev
```
Open the Vite URL shown in the terminal (usually http://localhost:5173).

## Features
- SMTP simulation with command sequence and server responses
- Email address and command validation
- FSM states and transition table
- Simple IMAP and POP3 demonstrations using sample messages
- Simulation history stored in MongoDB when connected

## Important
This is an educational **simulation**. It does not send real email or connect to actual SMTP, IMAP, or POP3 servers. SMTP commands are modeled for learning purposes.

## MongoDB
The backend uses the `email_protocol_simulation` database and creates a `simulations` collection automatically when a simulation is saved.
