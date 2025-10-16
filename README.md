# URL Resolution Scheduler

## Description
This is a web-based URL resolution scheduler application that allows users to upload CSV or XLSX files containing campaign URLs, countries, notes, and user agent types. The application schedules jobs to resolve these URLs using BrightData proxies, fetching the final redirected URL and IP geolocation data. It provides a frontend interface for job management and result viewing, with a backend server handling the URL resolution via Selenium and BrightData connections.

## Features
- Upload CSV/XLSX files with columns: campaign url, country, notes, uatype
- Schedule jobs for URL resolution at specific times
- Resolve URLs using BrightData scraping browser proxies for different regions
- Fetch IP geolocation data from resolved URLs
- Random user agent selection (desktop/mobile)
- View scheduled jobs and results in tables
- Export results to CSV or XLSX
- Real-time logging in the frontend
- Backend API endpoint for URL resolution

## Project Structure
- `index.html`: Main page for scheduling jobs
- `results.html`: Page to view and manage results
- `app.js`: Frontend JavaScript for job scheduling, processing, and UI interactions
- `server.js`: Backend Express server with Puppeteer integration for URL resolution
- `style.css`: CSS styling for the application
- `package.json`: Node.js dependencies and scripts
- `selenium-code`: Alternative implementation using Selenium WebDriver (not used in main code)

## Installation
1. Clone or download the project files.
2. Install dependencies: `npm install`
3. Set up BrightData credentials:
   - Set environment variable `BRIGHTDATA_PASSWORD` to your BrightData password (default: 'qhs7fl3vik0u')
   - Optionally set region-specific proxy zones via environment variables like `BRIGHTDATA_US_PROXY`
4. Run the server: `npm start` or `npm run dev` for development with nodemon

## Usage
1. Open `index.html` in a browser (server must be running on port 3000 by default).
2. Upload a CSV/XLSX file with the required columns.
3. Select a schedule date/time.
4. Click "Schedule Job" to queue the job.
5. View scheduled jobs in the table.
6. At the scheduled time, the job will process each URL, resolving it via BrightData and storing results.
7. View results on `results.html`, filter/sort/export as needed.

## API Endpoints
- `POST /resolve`: Accepts JSON {url, region, uaType}, returns {finalUrl, ipData} or {error}

## Dependencies
- express: Web server
- puppeteer-core: Browser automation for URL resolution
- xlsx: Excel file parsing
- nodemon: Development server auto-restart

## Configuration
- Port: Set via `PORT` environment variable (default: 3000)
- Navigation timeout: Set via `NAVIGATION_TIMEOUT` environment variable (default: 60000ms)
- BrightData zones: Configured in `getRegionZoneMap()` function, supports US, CA, GB, IN, AU, DE, FR, JP, SG, BR, TW

## Notes
- Requires BrightData account with scraping browser zones configured.
- User agents are randomly selected from predefined lists.
- Request interception blocks images, stylesheets, fonts, media, and other resources for faster loading.
- IP data is fetched from https://get.geojs.io/v1/ip/geo.json
- Results are stored in localStorage (frontend) and processed in memory (backend).

## Troubleshooting
- Ensure BrightData credentials are correct and zones are active.
- Check console logs for connection/navigation errors.
- For large files, increase timeouts if needed.
- If Selenium version is preferred, see `selenium-code` file for alternative implementation.
