# xoh-wetmax-rexorg

A weather application built with TypeScript that fetches data from [WeatherAPI.com](https://www.weatherapi.com/).

## Features

- Fetches current weather and forecasts from WeatherAPI
- Built with TypeScript
- Easy setup and configuration

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/ryuk-D-wild/xoh-wetmax-rexorg.git
cd xoh-wetmax-rexorg
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Get Your WeatherAPI Key

1. Go to [WeatherAPI.com](https://www.weatherapi.com/).
2. Create an account or log in.
3. Create a new API key for your app.

### 4. Add Your API Key

Open the file `src/utils/WeaterApi.ts`.  
Paste your API key at line 5 as shown below:

```typescript
// src/utils/WeaterApi.ts

const WEATHER_API_KEY = 'YOUR_API_KEY_HERE'; // <-- Replace with your actual API key
```

### 5. Run the App

```bash
npm start
```

## Project Structure

```
src/
  utils/
    WeaterApi.ts
  ...
```

## License

This project is licensed under the MIT License.

---

Let me know if you’d like to customize any sections or need help with the code in src/utils/WeaterApi.ts!
