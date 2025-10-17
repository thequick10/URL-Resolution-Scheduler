const express = require('express');
const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');


const app = express();

require('dotenv').config();
app.use(express.json());
app.use(express.static('.'));

const PORT = process.env.PORT || 8000;

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Root route (optional, in case index.html doesn't automatically load)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function getRegionZoneMap() {
  return {
    US: process.env.BRIGHTDATA_US_PROXY,
    CA: process.env.BRIGHTDATA_CA_PROXY,
    GB: process.env.BRIGHTDATA_GB_PROXY,
    IN: process.env.BRIGHTDATA_IN_PROXY,
    AU: process.env.BRIGHTDATA_AU_PROXY,
    DE: process.env.BRIGHTDATA_DE_PROXY,
    FR: process.env.BRIGHTDATA_FR_PROXY,
    JP: process.env.BRIGHTDATA_JP_PROXY,
    SG: process.env.BRIGHTDATA_SG_PROXY,
    BR: process.env.BRIGHTDATA_BR_PROXY,
    TW: process.env.BRIGHTDATA_TW_PROXY,
    CZ: process.env.BRIGHTDATA_CZ_PROXY,
    UA: process.env.BRIGHTDATA_UA_PROXY,
    AE: process.env.BRIGHTDATA_AE_PROXY,
    PL: process.env.BRIGHTDATA_PL_PROXY,
    ES: process.env.BRIGHTDATA_ES_PROXY,
    ID: process.env.BRIGHTDATA_ID_PROXY,
    ZA: process.env.BRIGHTDATA_ZA_PROXY,
    MX: process.env.BRIGHTDATA_MX_PROXY,
    MY: process.env.BRIGHTDATA_MY_PROXY,
    IT: process.env.BRIGHTDATA_IT_PROXY,
    TH: process.env.BRIGHTDATA_TH_PROXY,
    NL: process.env.BRIGHTDATA_NL_PROXY,
    AR: process.env.BRIGHTDATA_AR_PROXY,
    BY: process.env.BRIGHTDATA_BY_PROXY,
    RU: process.env.BRIGHTDATA_RU_PROXY,
    IE: process.env.BRIGHTDATA_IE_PROXY,
    HK: process.env.BRIGHTDATA_HK_PROXY,
    KZ: process.env.BRIGHTDATA_KZ_PROXY,
    NZ: process.env.BRIGHTDATA_NZ_PROXY,
    TR: process.env.BRIGHTDATA_TR_PROXY,
    DK: process.env.BRIGHTDATA_DK_PROXY,
    GR: process.env.BRIGHTDATA_GR_PROXY,
    NO: process.env.BRIGHTDATA_NO_PROXY,
    AT: process.env.BRIGHTDATA_AT_PROXY,
    IS: process.env.BRIGHTDATA_IS_PROXY,
    SE: process.env.BRIGHTDATA_SE_PROXY,
    PT: process.env.BRIGHTDATA_PT_PROXY,
    CH: process.env.BRIGHTDATA_CH_PROXY,
    BE: process.env.BRIGHTDATA_BE_PROXY,
    PH: process.env.BRIGHTDATA_PH_PROXY,
    IL: process.env.BRIGHTDATA_IL_PROXY,
    MD: process.env.BRIGHTDATA_MD_PROXY,
    RO: process.env.BRIGHTDATA_RO_PROXY,
    CL: process.env.BRIGHTDATA_CL_PROXY,
    SA: process.env.BRIGHTDATA_SA_PROXY,
    FI: process.env.BRIGHTDATA_FI_PROXY,
    LI: process.env.BRIGHTDATA_LI_PROXY
  };
}

const userAgents = {
  desktop: [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:139.0) Gecko/20100101 Firefox/139.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.2592.61",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
  ],
  mobile: [
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 14; SM-S926B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/123.0 Mobile/15E148 Safari/605.1.15",
    "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 14; moto g power (2023)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 15; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/24.0 Chrome/124.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/126.0 Mobile/15E148 Safari/605.1.15",
    "Mozilla/5.0 (Linux; Android 14; OnePlus 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36"
  ]
};

function getBrowserAPIServer(regionCode) {
  const regionZoneMap = getRegionZoneMap();
  const zone = regionZoneMap[regionCode?.toUpperCase()];
  const password = process.env.BRIGHTDATA_PASSWORD;

  if (!zone || !password) {
    throw new Error(`Missing proxy configuration for region: ${regionCode}`);
  }

  return `https://${zone}:${password}@${process.env.BRIGHTDATA_HOST}:${process.env.BRIGHTDATA_PORT}`;
}

function getRandomUserAgent(type) {
  let uaType = type;
  if (!uaType || uaType === 'random' || (uaType !== 'desktop' && uaType !== 'mobile')) {
    uaType = Math.random() < 0.5 ? 'desktop' : 'mobile';
  }
  const uaList = userAgents[uaType];
  const userAgent = uaList[Math.floor(Math.random() * uaList.length)];
  return { userAgent, isMobile: uaType === 'mobile', uaType };
}

// ENHANCED CHROME OPTIONS WITH STRONGER BLOCKING
function getOptimizedChromeOptions(isMobile, uaType) {
  const options = new chrome.Options();
  
  // EXTREMELY AGGRESSIVE BLOCKING VIA PREFERENCES
  options.setUserPreferences({
    // Block all images
    'profile.default_content_setting_values.images': 2,
    // Block CSS
    'profile.default_content_setting_values.stylesheets': 2,
    // Block JavaScript (be careful with this)
    // 'profile.default_content_setting_values.javascript': 2,
    // Block plugins
    'profile.default_content_setting_values.plugins': 2,
    // Block popups
    'profile.default_content_setting_values.popups': 2,
    // Block notifications
    'profile.default_content_setting_values.notifications': 2,
    // Block media
    'profile.default_content_setting_values.media_stream': 2,
    // Block location
    'profile.default_content_setting_values.geolocation': 2,
    // Block MIDI
    'profile.default_content_setting_values.midi_sysex': 2,
    // Block camera
    'profile.default_content_setting_values.media_stream_camera': 2,
    // Block microphone
    'profile.default_content_setting_values.media_stream_mic': 2,
    // Block autoplay
    'profile.default_content_setting_values.autoplay': 2,
    // Block ads
    'profile.default_content_setting_values.ads': 2,
    // Block font loading
    'profile.default_content_setting_values.fonts': 2,
  });

  // ADD THESE CRITICAL ARGUMENTS FOR BANDWIDTH REDUCTION
  options.addArguments([
    '--disable-gpu',
    '--headless',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    
    // BANDWIDTH OPTIMIZATION ARGUMENTS
    '--disable-images',
    '--disable-javascript',  // UNCOMMENT THIS FOR MAXIMUM BANDWIDTH SAVINGS
    '--disable-plugins',
    '--disable-extensions',
    '--disable-background-networking',
    '--disable-sync',
    '--disable-translate',
    '--disable-default-apps',
    '--disable-component-extensions-with-background-pages',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-features=TranslateUI',
    '--disable-ipc-flooding-protection',
    '--disable-back-forward-cache',
    '--aggressive-cache-discard',
    '--memory-pressure-off',
    '--max_old_space_size=256',
    
    // Media blocking
    '--mute-audio',
    '--autoplay-policy=user-gesture-required',
    
    // Network quality of service
    '--force-effective-connection-type=2g',  // Simulate slow connection
  ]);

  // Minimal viewport
  if (isMobile) {
    options.addArguments('--window-size=320,480');
  } else {
    options.addArguments('--window-size=1024,768');
  }

  return options;
}

//JAVASCRIPT-BASED RESOURCE BLOCKER
async function setupJavaScriptBlocking(driver) {
  try {
    console.log(`[BACKEND LOG] Setting up JavaScript resource blocking...`);
    
    await driver.executeScript(`
      // Block images from loading
      const originalImage = Image;
      window.Image = function() {
        const img = new originalImage();
        Object.defineProperty(img, 'src', {
          set: function(value) {
            console.log('[BLOCKED] Image:', value);
            // Don't actually set the src
          }
        });
        return img;
      };

      // Block CSS stylesheets
      const originalCreateElement = document.createElement;
      document.createElement = function(tagName) {
        const element = originalCreateElement.call(this, tagName);
        if (tagName.toLowerCase() === 'link') {
          const originalSetAttribute = element.setAttribute;
          element.setAttribute = function(name, value) {
            if (name === 'rel' && value === 'stylesheet') {
              console.log('[BLOCKED] CSS:', element.href);
              return; // Don't set the attribute
            }
            return originalSetAttribute.call(this, name, value);
          };
        }
        return element;
      };

      // Block font loading
      const originalFontFace = window.FontFace;
      window.FontFace = function(family, source) {
        console.log('[BLOCKED] Font:', family, source);
        // Return a dummy font face that won't load anything
        return new originalFontFace(family, '');
      };

      // Block iframe loading
      const originalIframe = HTMLIFrameElement.prototype;
      const originalSrcDescriptor = Object.getOwnPropertyDescriptor(originalIframe, 'src');
      Object.defineProperty(HTMLIFrameElement.prototype, 'src', {
        get: function() {
          return originalSrcDescriptor.get.call(this);
        },
        set: function(value) {
          console.log('[BLOCKED] Iframe:', value);
          // Don't set the src for iframes
        }
      });

      // Block video/audio elements
      ['video', 'audio'].forEach(mediaType => {
        const mediaProto = window.HTMLMediaElement.prototype;
        const originalMediaSrc = Object.getOwnPropertyDescriptor(mediaProto, 'src');
        Object.defineProperty(mediaProto, 'src', {
          get: function() {
            return originalMediaSrc.get.call(this);
          },
          set: function(value) {
            console.log('[BLOCKED] Media:', value);
            // Don't set the src for media elements
          }
        });
      });

      console.log('✅ JavaScript resource blocking enabled');
    `);

    console.log(`[BACKEND LOG] JavaScript resource blocking setup successfully`);
    return true;
  } catch (error) {
    console.log(`[BACKEND LOG] JavaScript blocking failed: ${error.message}`);
    return false;
  }
}

// REQUEST INTERCEPTION VIA JAVASCRIPT
async function setupRequestInterception(driver) {
  try {
    console.log(`[BACKEND LOG] Setting up request interception...`);
    
    await driver.executeScript(`
      // Block specific URL patterns
      const blockedPatterns = [
        /google-analytics/,
        /googlesyndication/,
        /doubleclick/,
        /facebook/,
        /twitter/,
        /gstatic/,
        /youtube/,
        /vimeo/,
        /\.mp4/,
        /\.webm/,
        /\.avi/,
        /\.mov/,
        /\.woff/,
        /\.woff2/,
        /\.ttf/,
        /\.eot/,
        /\.otf/,
        /\.png/,
        /\.jpg/,
        /\.jpeg/,
        /\.gif/,
        /\.svg/,
        /\.webp/,
        /\.ico/,
        /\.css/,
        /\.less/,
        /\.scss/
      ];

      // Intercept fetch requests
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const url = args[0];
        if (blockedPatterns.some(pattern => pattern.test(url))) {
          console.log('[BLOCKED] Fetch:', url);
          return Promise.reject(new Error('Blocked by resource blocker'));
        }
        return originalFetch.apply(this, args);
      };

      // Intercept XMLHttpRequest
      const originalXHR = window.XMLHttpRequest;
      window.XMLHttpRequest = function() {
        const xhr = new originalXHR();
        const originalOpen = xhr.open;
        xhr.open = function(method, url) {
          if (blockedPatterns.some(pattern => pattern.test(url))) {
            console.log('[BLOCKED] XHR:', url);
            throw new Error('Blocked by resource blocker');
          }
          return originalOpen.apply(this, arguments);
        };
        return xhr;
      };

      console.log('✅ Request interception enabled');
    `);

    console.log(`[BACKEND LOG] Request interception setup successfully`);
    return true;
  } catch (error) {
    console.log(`[BACKEND LOG] Request interception failed: ${error.message}`);
    return false;
  }
}

// main url resolution function
async function resolveWithBrowserAPI(inputUrl, region = "US", uaType) {
  let driver;
  
  try {
    console.log(`[BACKEND LOG] Setting up Selenium WebDriver for region ${region}`);
    
    const server = getBrowserAPIServer(region);
    const { userAgent, isMobile } = getRandomUserAgent(uaType);
    
    console.log(`[BACKEND LOG] Using User-Agent:\n${userAgent}`);
    console.log(`[BACKEND LOG] Connecting to Bright Data Selenium API: ${server.replace(/:[^:]*@/, ':****@')}`);
    
    // Configure Chrome options to block unwanted resources
    // const options = new chrome.Options();
    const options = getOptimizedChromeOptions(isMobile, uaType);

    // Connect to Bright Data Browser API with optimized options
    driver = await new Builder()
      .forBrowser('chrome')
      .usingServer(server)
      .setChromeOptions(options)
      .build();

    console.log(`[BACKEND LOG] WebDriver connected successfully to Bright Data Browser API`);
    
    const jsBlockingEnabled = await setupJavaScriptBlocking(driver);
    const requestInterceptionEnabled = await setupRequestInterception(driver);
    
    console.log(`[BACKEND LOG] JavaScript blocking: ${jsBlockingEnabled}`);
    console.log(`[BACKEND LOG] Request interception: ${requestInterceptionEnabled}`)

    // Set user agent through executeScript
    await driver.executeScript(`Object.defineProperty(navigator, 'userAgent', {
      value: '${userAgent}',
      writable: false
    });`);

    // Set aggressive timeouts to minimize usage
    await driver.manage().setTimeouts({
      implicit: 5000,  // Reduced from 10000
      pageLoad: 30000, // Reduced from 45000
      script: 10000    // Reduced from 30000
    });

    if (!inputUrl || typeof inputUrl !== 'string' || !inputUrl.startsWith('http')) {
      console.error('[BACKEND LOG] Invalid or missing input URL:', inputUrl);
      throw new Error('Invalid or missing input URL');
    }

    console.log(`[BACKEND LOG] Navigating to ${inputUrl}`);
    
    // Navigate to the input URL with domcontentloaded to avoid waiting for full resources
    await driver.get(inputUrl);

    // Wait for potential redirects - OPTIMIZED VERSION
    let previousUrl = inputUrl;
    let currentUrl = await driver.getCurrentUrl();
    let redirectCount = 0;
    const maxRedirects = 2; // Reduced from 10

    console.log(`[BACKEND LOG] Initial URL: ${currentUrl}`);

    while (currentUrl !== previousUrl && redirectCount < maxRedirects) {
      console.log(`[BACKEND LOG] Redirect ${redirectCount + 1}: ${previousUrl} -> ${currentUrl}`);
      previousUrl = currentUrl;
      
      // Reduced wait time for redirects
      await new Promise(resolve => setTimeout(resolve, 2000)); // Reduced from 3000
      
      // Get updated URL
      currentUrl = await driver.getCurrentUrl();
      redirectCount++;
    }

    // Final URL after all redirects
    const finalUrl = currentUrl;
    console.log(`[BACKEND LOG] Final URL after ${redirectCount} redirects: [${finalUrl}]`);

    if (finalUrl === inputUrl) {
      console.log(`[BACKEND LOG] ⚠️  WARNING: Final URL is same as input URL - no redirects occurred`);
    } else {
      console.log(`[BACKEND LOG] ✅ SUCCESS: URL changed from [${inputUrl}] to [${finalUrl}]`);
    }

    // Fetch IP data
    console.log(`[BACKEND LOG] Skiping Fetching IP data...`);
    
    // const ipData = await driver.executeScript(async () => {
    //   try {
    //     const res = await fetch("https://get.geojs.io/v1/ip/geo.json");
    //     return await res.json();
    //   } catch (e) {
    //     return { error: "IP lookup failed" };
    //   }
    // });
    // console.log(`[BACKEND LOG] IP data fetched.`);

    // console.log(`[BACKEND LOG] URLs Resolved with [${region}] Check IP Data ⤵`);
    // if (ipData?.ip) {
    //   console.log(`[BACKEND LOG] 🌍 IP Info : ${ipData.ip} (${ipData.country || "Unknown Country"} - ${ipData.region || "Unknown Region"} - ${ipData.country_code || "Unknown country_code"})`);
    //   console.log(`[BACKEND LOG] 🔍 Region Match: ${ipData.country_code?.toUpperCase() === region.toUpperCase() ? '✅ REGION MATCHED' : '❌ REGION MISMATCH'}`);
    // } else {
    //   console.log(`[BACKEND LOG] IP data not available or failed.`);
    // }
    const ipData = { 
      note: 'IP data fetching disabled to save bandwidth',
      bandwidthSaved: true 
    };

    return { finalUrl, ipData, bandwidthSaved: true, resourceBlocking: jsBlockingEnabled || requestInterceptionEnabled, redirects: redirectCount, };
    
  } catch(err) {
    console.error(`[BACKEND LOG] Error during URL resolution: ${err.message}`);
    let finalUrl = inputUrl;
    try {
      if (driver) {
        finalUrl = await driver.getCurrentUrl();
      }
    } catch (e) {
      console.error(`[BACKEND LOG] Could not get final URL after error:`, e.message);
    }
    return { finalUrl, error: err.message };
  } finally {
    if (driver) {
      console.log(`[BACKEND LOG] Quitting WebDriver.`);
      await driver.quit();
      console.log(`[BACKEND LOG] WebDriver quit successfully.`);
    }
  }
}

app.post('/resolve', async (req, res) => {
  const { url, region, uaType } = req.body;
  console.log(`[BACKEND LOG] Received /resolve request: URL=${url}, Region=${region}, UaType=${uaType}`);
  try {
    const result = await resolveWithBrowserAPI(url, region, uaType);
    console.log(`[BACKEND LOG] /resolve request completed for URL=${url}`);
    res.json(result);
  } catch (error) {
    console.error(`[BACKEND LOG] /resolve request failed for URL=${url}: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = {
  getRegionZoneMap,
  getBrowserAPIServer,
  resolveWithBrowserAPI
};