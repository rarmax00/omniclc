# OmniCalc

OmniCalc is a web application that combines a calculator, unit converter, currency converter, number systems converter, history, favorites, and bilingual interface support.

## Features

- Calculator with expression parsing
- Unit converter
- Currency converter with external providers
- Number systems converter (BIN / OCT / DEC / HEX)
- History of operations
- Favorites
- Ukrainian / English localization
- Backend-centered architecture using Express

## Project structure

- `public/` — frontend files
- `server/` — backend API and business logic
- `server/src/routes` — API routes
- `server/src/controllers` — request handlers
- `server/src/services` — business logic
- `server/src/middleware` — middleware
- `server/src/utils` — shared helpers
- `server/src/validators` — request validation
- `server/data` — storage files

## Run project

### Install backend dependencies

```bash
cd server
npm install