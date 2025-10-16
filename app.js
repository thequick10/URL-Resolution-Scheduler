// // Utility functions
// function toIST(date) {
//     const istOffset = 0 * 60 * 60 * 1000; // IST is UTC+5:30
//     const istDate = new Date(date.getTime() + istOffset);
//     return istDate.toLocaleString('en-IN', {
//         timeZone: 'Asia/Kolkata',
//         year: 'numeric',
//         month: '2-digit',
//         day: '2-digit',
//         hour: '2-digit',
//         minute: '2-digit',
//         second: '2-digit',
//         hour12: true
//     });
// }

// function logMessage(message) {
//     const logsDiv = document.getElementById('logs');
//     if (logsDiv) {
//         const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
//         logsDiv.innerHTML += `[${timestamp}] ${message}<br>`;
//         logsDiv.scrollTop = logsDiv.scrollHeight;
//     }
//     console.log(`[CLIENT LOG] ${message}`);
// }

// function getJobs() {
//     return JSON.parse(localStorage.getItem('jobs') || '[]');
// }

// function saveJobs(jobs) {
//     localStorage.setItem('jobs', JSON.stringify(jobs));
// }

// function getResults() {
//     return JSON.parse(localStorage.getItem('results') || '[]');
// }

// function saveResults(results) {
//     localStorage.setItem('results', JSON.stringify(results));
// }

// // Handle file upload and parsing
// function parseFile(file) {
//     return new Promise((resolve, reject) => {
//         const reader = new FileReader();
//         reader.onload = (e) => {
//             const data = e.target.result;
//             let jsonData;
//             if (file.name.endsWith('.csv')) {
//                 const workbook = XLSX.read(data, { type: 'binary' });
//                 const sheetName = workbook.SheetNames[0];
//                 const worksheet = workbook.Sheets[sheetName];
//                 jsonData = XLSX.utils.sheet_to_json(worksheet);
//             } else if (file.name.endsWith('.xlsx')) {
//                 const workbook = XLSX.read(data, { type: 'binary' });
//                 const sheetName = workbook.SheetNames[0];
//                 const worksheet = workbook.Sheets[sheetName];
//                 jsonData = XLSX.utils.sheet_to_json(worksheet);
//             } else {
//                 reject(new Error('Unsupported file type. Please upload CSV or XLSX.'));
//                 return;
//             }
//             // Validate columns: expected 'campaign url', 'country', 'notes', 'uatype' (case-insensitive)
//             if (jsonData.length > 0) {
//                 const firstRow = jsonData[0];
//                 const requiredCols = ['campaign url', 'country', 'notes', 'uatype'];
//                 const missingCols = requiredCols.filter(col => !Object.keys(firstRow).some(key => key.toLowerCase() === col));
//                 if (missingCols.length > 0) {
//                     reject(new Error(`Missing required columns: ${missingCols.join(', ')}. Expected: campaign url, country, notes, uatype.`));
//                     return;
//                 }
//                 // Normalize column names to lowercase for consistency
//                 jsonData = jsonData.map(row => {
//                     const normalized = {};
//                     Object.keys(row).forEach(key => {
//                         normalized[key.toLowerCase()] = row[key];
//                     });
//                     return normalized;
//                 });
//             }
//             resolve(jsonData);
//         };
//         reader.onerror = () => reject(new Error('File reading error.'));
//         reader.readAsBinaryString(file);
//     });
// }

// // Schedule job
// document.getElementById('scheduleForm')?.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     const fileInput = document.getElementById('fileInput');
//     const scheduleDate = document.getElementById('scheduleDate').value;
//     if (!fileInput.files[0] || !scheduleDate) {
//         logMessage('Error: Please select a file and schedule date/time.');
//         return;
//     }

//     const file = fileInput.files[0];
//     try {
//         logMessage(`Parsing file: ${file.name}`);
//         const data = await parseFile(file);
//         logMessage(`File parsed successfully. Rows: ${data.length}`);
//         const jobId = Date.now();
//         const job = {
//             id: jobId,
//             fileName: file.name,
//             status: 'Scheduled',
//             scheduledAt: new Date(scheduleDate).toISOString(),
//             createdAt: new Date().toISOString(),
//             data: data
//         };
//         const jobs = getJobs();
//         jobs.push(job);
//         saveJobs(jobs);
//         renderJobsTable();
//         logMessage(`Job ${jobId} scheduled for ${toIST(new Date(scheduleDate))}`);

//         const delay = new Date(scheduleDate) - new Date();
//         if (delay > 0) {
//             logMessage(`Timer set for ${Math.round(delay / 1000)} seconds from now.`);
//             setTimeout(() => processJob(jobId), delay);
//         } else {
//             logMessage('Error: Scheduled time is in the past!');
//             alert('Scheduled time is in the past!');
//         }
//     } catch (error) {
//         logMessage('Error parsing file: ' + error.message);
//         alert('Error parsing file: ' + error.message);
//     }
// });

// // Process job
// async function processJob(jobId) {
//     logMessage(`Starting processing for job ID: ${jobId}`);
//     const jobs = getJobs();
//     const job = jobs.find(j => j.id === jobId);
//     if (!job) {
//         logMessage(`Error: Job ${jobId} not found.`);
//         return;
//     }
//     job.status = 'Processing';
//     saveJobs(jobs);
//     renderJobsTable();
//     logMessage(`Job ${jobId} status set to Processing. Processing ${job.data.length} rows.`);

//     const results = getResults();
//     for (let i = 0; i < job.data.length; i++) {
//         const row = job.data[i];
//         logMessage(`Processing row ${i + 1}/${job.data.length}: URL=${row['campaign url']}, Country=${row.country}, UaType=${row.uatype}`);
//         try {
//             const response = await fetch('/resolve', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ url: row['campaign url'], region: row.country, uaType: row.uatype })
//             });
//             if (!response.ok) {
//                 throw new Error(`API Error: ${response.status} ${response.statusText}`);
//             }
//             const result = await response.json();
//             if (result.error) {
//                 throw new Error(result.error);
//             }
//             results.push({
//                 resolvedAt: new Date().toISOString(),
//                 campaignUrl: row['campaign url'],
//                 finalUrl: result.finalUrl || 'No final URL',
//                 country: result.ipData?.country || row.country,
//                 notes: row.notes,
//                 uaType: row.uatype,
//                 originalIndex: i
//             });
//             logMessage(`Row ${i + 1} resolved: FinalURL=${result.finalUrl}`);
//         } catch (error) {
//             logMessage(`Error processing row ${i + 1}: ${error.message}`);
//             results.push({
//                 resolvedAt: new Date().toISOString(),
//                 campaignUrl: row['campaign url'],
//                 finalUrl: 'Error: ' + error.message,
//                 country: row.country,
//                 notes: row.notes,
//                 uaType: row.uatype,
//                 originalIndex: i
//             });
//         }
//     }
//     saveResults(results);
//     job.status = 'Completed';
//     saveJobs(jobs);
//     renderJobsTable();
//     logMessage(`Job ${jobId} completed. Total results: ${results.length}`);
//     alert(`Job ${jobId} processing completed. Check results page.`);
// }

// // Render jobs table
// function renderJobsTable() {
//     const jobs = getJobs();
//     const tbody = document.querySelector('#jobsTable tbody');
//     if (!tbody) return;
//     tbody.innerHTML = '';
//     jobs.forEach(job => {
//         const row = document.createElement('tr');
//         row.innerHTML = `
//             <td>${job.id}</td>
//             <td>${job.fileName}</td>
//             <td>${job.status}</td>
//             <td>${toIST(new Date(job.scheduledAt))}</td>
//             <td>${toIST(new Date(job.createdAt))}</td>
//             <td><button onclick="deleteJob(${job.id})">Delete</button></td>
//         `;
//         tbody.appendChild(row);
//     });
// }

// // Delete job
// function deleteJob(id) {
//     const jobs = getJobs().filter(j => j.id !== id);
//     saveJobs(jobs);
//     renderJobsTable();
// }

// // Search jobs
// document.getElementById('searchInput')?.addEventListener('input', (e) => {
//     const query = e.target.value.toLowerCase();
//     const rows = document.querySelectorAll('#jobsTable tbody tr');
//     rows.forEach(row => {
//         const fileName = row.cells[1].textContent.toLowerCase();
//         row.style.display = fileName.includes(query) ? '' : 'none';
//     });
// });

// // Render results table
// function renderResultsTable(results = getResults()) {
//     const tbody = document.querySelector('#resultsTable tbody');
//     if (!tbody) return;
//     tbody.innerHTML = '';
//     results.forEach((result, index) => {
//         const row = document.createElement('tr');
//         row.innerHTML = `
//             <td>${toIST(new Date(result.resolvedAt))}</td>
//             <td>${result.campaignUrl}</td>
//             <td>${result.finalUrl}</td>
//             <td>${result.country}</td>
//             <td>${result.notes}</td>
//             <td>${result.uaType}</td>
//             <td>
//                 <button onclick="copyUrl('${result.finalUrl}')">Copy</button>
//                 <button onclick="deleteResult(${index})">Delete</button>
//             </td>
//         `;
//         tbody.appendChild(row);
//     });
// }

// // Copy URL
// function copyUrl(url) {
//     navigator.clipboard.writeText(url);
//     alert('URL copied!');
// }

// // Delete result
// function deleteResult(index) {
//     const results = getResults();
//     results.splice(index, 1);
//     saveResults(results);
//     renderResultsTable();
// }

// // Sort and filter
// document.getElementById('sortSelect')?.addEventListener('change', applyFilters);
// document.getElementById('startDate')?.addEventListener('change', applyFilters);
// document.getElementById('endDate')?.addEventListener('change', applyFilters);

// function applyFilters() {
//     let results = getResults();
//     const sort = document.getElementById('sortSelect')?.value;
//     const startDate = document.getElementById('startDate')?.value;
//     const endDate = document.getElementById('endDate')?.value;

//     if (sort === 'oldest') {
//         results.sort((a, b) => a.originalIndex - b.originalIndex);
//     } else {
//         results.sort((a, b) => new Date(b.resolvedAt) - new Date(a.resolvedAt));
//     }

//     if (startDate) {
//         results = results.filter(r => new Date(r.resolvedAt) >= new Date(startDate));
//     }
//     if (endDate) {
//         results = results.filter(r => new Date(r.resolvedAt) <= new Date(endDate + 'T23:59:59'));
//     }

//     renderResultsTable(results);
// }

// // Clear filters
// document.getElementById('clearFilters')?.addEventListener('click', () => {
//     document.getElementById('sortSelect').value = 'newest';
//     document.getElementById('startDate').value = '';
//     document.getElementById('endDate').value = '';
//     renderResultsTable();
// });

// // Export
// document.getElementById('exportCSV')?.addEventListener('click', () => {
//     const results = getResults();
//     const csv = XLSX.utils.json_to_sheet(results);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, csv, 'Results');
//     XLSX.writeFile(workbook, 'results.csv');
// });

// document.getElementById('exportXLSX')?.addEventListener('click', () => {
//     const results = getResults();
//     const worksheet = XLSX.utils.json_to_sheet(results);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
//     XLSX.writeFile(workbook, 'results.xlsx');
// });

// // Delete all results
// document.getElementById('deleteAll')?.addEventListener('click', () => {
//     saveResults([]);
//     renderResultsTable();
// });

// // Initialize
// document.addEventListener('DOMContentLoaded', () => {
//     renderJobsTable();
//     renderResultsTable();
// });

// // Add this to your app.js file
// document.addEventListener('DOMContentLoaded', function() {
    
//     // Set placeholders for date inputs on results page
//     const startDateInput = document.getElementById('startDate');
//     const endDateInput = document.getElementById('endDate');
    
//     if (startDateInput) {
//         // Add placeholder text styling
//         startDateInput.setAttribute('data-placeholder', 'Select start date');
        
//         // Show placeholder when empty
//         if (!startDateInput.value) {
//             startDateInput.style.color = '#64748b';
//             startDateInput.setAttribute('type', 'text');
//             startDateInput.value = 'YYYY-MM-DD';
            
//             startDateInput.addEventListener('focus', function() {
//                 if (this.value === 'YYYY-MM-DD') {
//                     this.value = '';
//                     this.setAttribute('type', 'date');
//                     this.style.color = '#1e293b';
//                 }
//             });
            
//             startDateInput.addEventListener('blur', function() {
//                 if (!this.value) {
//                     this.setAttribute('type', 'text');
//                     this.value = 'YYYY-MM-DD';
//                     this.style.color = '#64748b';
//                 }
//             });
//         }
//     }
    
//     if (endDateInput) {
//         endDateInput.setAttribute('data-placeholder', 'Select end date');
        
//         if (!endDateInput.value) {
//             endDateInput.style.color = '#64748b';
//             endDateInput.setAttribute('type', 'text');
//             endDateInput.value = 'YYYY-MM-DD';
            
//             endDateInput.addEventListener('focus', function() {
//                 if (this.value === 'YYYY-MM-DD') {
//                     this.value = '';
//                     this.setAttribute('type', 'date');
//                     this.style.color = '#1e293b';
//                 }
//             });
            
//             endDateInput.addEventListener('blur', function() {
//                 if (!this.value) {
//                     this.setAttribute('type', 'text');
//                     this.value = 'YYYY-MM-DD';
//                     this.style.color = '#64748b';
//                 }
//             });
//         }
//     }
    
//     // If using Flatpickr (recommended approach)
//     if (typeof flatpickr !== 'undefined') {
//         if (startDateInput) {
//             flatpickr("#startDate", {
//                 dateFormat: "Y-m-d",
//                 maxDate: new Date(),
//                 placeholder: "Select start date (YYYY-MM-DD)"
//             });
//         }
        
//         if (endDateInput) {
//             flatpickr("#endDate", {
//                 dateFormat: "Y-m-d",
//                 maxDate: new Date(),
//                 placeholder: "Select end date (YYYY-MM-DD)"
//             });
//         }
//     }
    
//     // Your existing Flatpickr initialization for scheduleDate
//     const scheduleDateInput = document.getElementById('scheduleDate');
//     if (scheduleDateInput && typeof flatpickr !== 'undefined') {
//         flatpickr("#scheduleDate", {
//             enableTime: true,
//             dateFormat: "Y-m-d H:i",
//             time_24hr: true,
//             minDate: "today",
//             minuteIncrement: 1,
//             defaultDate: new Date(),
//             altInput: true,
//             altFormat: "F j, Y at h:i K"
//         });
//     }
// });

// Utility functions
function toIST(date) {
    const istOffset = 0 * 60 * 60 * 1000; // IST is UTC+5:30
    const istDate = new Date(date.getTime() + istOffset);
    return istDate.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
}

function logMessage(message) {
    const logsDiv = document.getElementById('logs');
    if (logsDiv) {
        const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        logsDiv.innerHTML += `[${timestamp}] ${message}<br>`;
        logsDiv.scrollTop = logsDiv.scrollHeight;
    }
    console.log(`[CLIENT LOG] ${message}`);
}

function getJobs() {
    return JSON.parse(localStorage.getItem('jobs') || '[]');
}

function saveJobs(jobs) {
    localStorage.setItem('jobs', JSON.stringify(jobs));
}

function getResults() {
    return JSON.parse(localStorage.getItem('results') || '[]');
}

function saveResults(results) {
    localStorage.setItem('results', JSON.stringify(results));
}

// Handle file upload and parsing
function parseFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target.result;
            let jsonData;
            if (file.name.endsWith('.csv')) {
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                jsonData = XLSX.utils.sheet_to_json(worksheet);
            } else if (file.name.endsWith('.xlsx')) {
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                jsonData = XLSX.utils.sheet_to_json(worksheet);
            } else {
                reject(new Error('Unsupported file type. Please upload CSV or XLSX.'));
                return;
            }
            // Validate columns: expected 'campaign url', 'country', 'notes', 'uatype' (case-insensitive)
            if (jsonData.length > 0) {
                const firstRow = jsonData[0];
                const requiredCols = ['campaign url', 'country', 'notes', 'uatype'];
                const missingCols = requiredCols.filter(col => !Object.keys(firstRow).some(key => key.toLowerCase() === col));
                if (missingCols.length > 0) {
                    reject(new Error(`Missing required columns: ${missingCols.join(', ')}. Expected: campaign url, country, notes, uatype.`));
                    return;
                }
                // Normalize column names to lowercase for consistency
                jsonData = jsonData.map(row => {
                    const normalized = {};
                    Object.keys(row).forEach(key => {
                        normalized[key.toLowerCase()] = row[key];
                    });
                    return normalized;
                });
            }
            resolve(jsonData);
        };
        reader.onerror = () => reject(new Error('File reading error.'));
        reader.readAsBinaryString(file);
    });
}

// Schedule job
document.getElementById('scheduleForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('fileInput');
    const scheduleDate = document.getElementById('scheduleDate').value;
    if (!fileInput.files[0] || !scheduleDate) {
        logMessage('Error: Please select a file and schedule date/time.');
        return;
    }
    
    const file = fileInput.files[0];
    try {
        logMessage(`Parsing file: ${file.name}`);
        const data = await parseFile(file);
        logMessage(`File parsed successfully. Rows: ${data.length}`);
        const jobId = Date.now();
        const job = {
            id: jobId,
            fileName: file.name,
            status: 'Scheduled',
            scheduledAt: new Date(scheduleDate).toISOString(),
            createdAt: new Date().toISOString(),
            data: data
        };
        const jobs = getJobs();
        jobs.push(job);
        saveJobs(jobs);
        renderJobsTable();
        logMessage(`Job ${jobId} scheduled for ${toIST(new Date(scheduleDate))}`);

        const delay = new Date(scheduleDate) - new Date();
        if (delay > 0) {
            logMessage(`Timer set for ${Math.round(delay / 1000)} seconds from now.`);
            setTimeout(() => processJob(jobId), delay);
        } else {
            logMessage('Error: Scheduled time is in the past!');
            alert('Scheduled time is in the past!');
        }
    } catch (error) {
        logMessage('Error parsing file: ' + error.message);
        alert('Error parsing file: ' + error.message);
    }
});

// Process job
async function processJob(jobId) {
    logMessage(`Starting processing for job ID: ${jobId}`);
    const jobs = getJobs();
    const job = jobs.find(j => j.id === jobId);
    if (!job) {
        logMessage(`Error: Job ${jobId} not found.`);
        return;
    }
    job.status = 'Processing';
    saveJobs(jobs);
    renderJobsTable();
    logMessage(`Job ${jobId} status set to Processing. Processing ${job.data.length} rows.`);

    const results = getResults();
    for (let i = 0; i < job.data.length; i++) {
        const row = job.data[i];
        logMessage(`Processing row ${i + 1}/${job.data.length}: URL=${row['campaign url']}, Country=${row.country}, UaType=${row.uatype}`);
        try {
            const response = await fetch('/resolve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: row['campaign url'], region: row.country, uaType: row.uatype })
            });
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            const result = await response.json();
            if (result.error) {
                throw new Error(result.error);
            }
            results.push({
                resolvedAt: new Date().toISOString(),
                campaignUrl: row['campaign url'],
                finalUrl: result.finalUrl || 'No final URL',
                country: result.ipData?.country_code || row.country,
                notes: row.notes,
                uaType: row.uatype,
                originalIndex: i
            });
            logMessage(`Row ${i + 1} resolved: FinalURL=${result.finalUrl}`);
        } catch (error) {
            logMessage(`Error processing row ${i + 1}: ${error.message}`);
            results.push({
                resolvedAt: new Date().toISOString(),
                campaignUrl: row['campaign url'],
                finalUrl: 'Error: ' + error.message,
                country: row.country,
                notes: row.notes,
                uaType: row.uatype,
                originalIndex: i
            });
        }
    }
    saveResults(results);
    job.status = 'Completed';
    saveJobs(jobs);
    renderJobsTable();
    logMessage(`Job ${jobId} completed. Total results: ${results.length}`);
    alert(`Job ${jobId} processing completed. Check results page.`);
}

// Render jobs table
function renderJobsTable() {
    const jobs = getJobs();
    const tbody = document.querySelector('#jobsTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (jobs.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" style="text-align: center; font-style: italic;">No data available</td>
        `;
        tbody.appendChild(row);
        return;
    }
    jobs.forEach(job => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${job.id}</td>
            <td>${job.fileName}</td>
            <td>${job.status}</td>
            <td>${toIST(new Date(job.scheduledAt))}</td>
            <td>${toIST(new Date(job.createdAt))}</td>
            <td><button onclick="deleteJob(${job.id})">Delete</button></td>
        `;
        tbody.appendChild(row);
    });
}

// Delete job
function deleteJob(id) {
    const jobs = getJobs().filter(j => j.id !== id);
    saveJobs(jobs);
    renderJobsTable();
}

// Search jobs
document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#jobsTable tbody tr');
    rows.forEach(row => {
        const fileName = row.cells[1].textContent.toLowerCase();
        row.style.display = fileName.includes(query) ? '' : 'none';
    });
});

// Render results table
function renderResultsTable(results = getResults()) {
    const tbody = document.querySelector('#resultsTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    results.forEach((result, index) => {
        const row = document.createElement('tr');
        const finalUrlDisplay = result.isRefreshing ? 'Loading...' : result.finalUrl;
        row.innerHTML = `
            <td>${toIST(new Date(result.resolvedAt))}</td>
            <td>${result.campaignUrl}</td>
            <td>${finalUrlDisplay}</td>
            <td>${result.country}</td>
            <td>${result.notes}</td>
            <td>${result.uaType}</td>
            <td>
                <button onclick="copyUrl('${result.finalUrl}')">Copy</button>
                <button onclick="refreshResult(${index})" ${result.isRefreshing ? 'disabled' : ''}>Refresh</button>
                <button onclick="deleteResult(${index})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Copy URL
function copyUrl(url) {
    navigator.clipboard.writeText(url);
    alert('URL copied!');
}

// Delete result
function deleteResult(index) {
    const results = getResults();
    results.splice(index, 1);
    saveResults(results);
    renderResultsTable();
}

// Add new function after deleteResult:
async function refreshResult(index) {
    const results = getResults();
    const result = results[index];
    if (!result) return;
    
    // Set loading state
    result.isRefreshing = true;
    saveResults(results);
    renderResultsTable();
    
    try {
        logMessage(`Refreshing result for URL: ${result.campaignUrl}`);
        const response = await fetch('/resolve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: result.campaignUrl, region: result.country, uaType: result.uaType })
        });
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        const newData = await response.json();
        if (newData.error) {
            throw new Error(newData.error);
        }
        // Update the result
        result.resolvedAt = new Date().toISOString();
        result.finalUrl = newData.finalUrl || 'No final URL';
        result.country = newData.ipData?.country || result.country;
        result.isRefreshing = false; // Clear loading
        saveResults(results);
        renderResultsTable();
        logMessage(`Result refreshed for URL: ${result.campaignUrl}`);
    } catch (error) {
        logMessage(`Error refreshing result: ${error.message}`);
        alert(`Error refreshing result: ${error.message}`);
        result.isRefreshing = false; // Clear loading on error
        saveResults(results);
        renderResultsTable();
    }
}

// Sort and filter
document.getElementById('sortSelect')?.addEventListener('change', applyFilters);
document.getElementById('startDate')?.addEventListener('change', applyFilters);
document.getElementById('endDate')?.addEventListener('change', applyFilters);

function applyFilters() {
    let results = getResults();
    const sort = document.getElementById('sortSelect')?.value;
    const startDate = document.getElementById('startDate')?.value;
    const endDate = document.getElementById('endDate')?.value;

    if (sort === 'oldest') {
        results.sort((a, b) => a.originalIndex - b.originalIndex);
    } else {
        results.sort((a, b) => new Date(b.resolvedAt) - new Date(a.resolvedAt));
    }

    if (startDate) {
        results = results.filter(r => new Date(r.resolvedAt) >= new Date(startDate));
    }
    if (endDate) {
        results = results.filter(r => new Date(r.resolvedAt) <= new Date(endDate + 'T23:59:59'));
    }

    renderResultsTable(results);
}

// Clear filters
document.getElementById('clearFilters')?.addEventListener('click', () => {
    document.getElementById('sortSelect').value = 'newest';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    renderResultsTable();
});

// Export
document.getElementById('exportCSV')?.addEventListener('click', () => {
    const results = getResults();
    const csv = XLSX.utils.json_to_sheet(results);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, csv, 'Results');
    XLSX.writeFile(workbook, 'results.csv');
});

document.getElementById('exportXLSX')?.addEventListener('click', () => {
    const results = getResults();
    const worksheet = XLSX.utils.json_to_sheet(results);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
    XLSX.writeFile(workbook, 'results.xlsx');
});

// Delete all results
document.getElementById('deleteAll')?.addEventListener('click', () => {
    saveResults([]);
    renderResultsTable();
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderJobsTable();
    renderResultsTable();
});

// Add this to your app.js file
document.addEventListener('DOMContentLoaded', function() {
    
    // Set placeholders for date inputs on results page
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (startDateInput) {
        // Add placeholder text styling
        startDateInput.setAttribute('data-placeholder', 'Select start date');
        
        // Show placeholder when empty
        if (!startDateInput.value) {
            startDateInput.style.color = '#64748b';
            startDateInput.setAttribute('type', 'text');
            startDateInput.value = 'YYYY-MM-DD';
            
            startDateInput.addEventListener('focus', function() {
                if (this.value === 'YYYY-MM-DD') {
                    this.value = '';
                    this.setAttribute('type', 'date');
                    this.style.color = '#1e293b';
                }
            });
            
            startDateInput.addEventListener('blur', function() {
                if (!this.value) {
                    this.setAttribute('type', 'text');
                    this.value = 'YYYY-MM-DD';
                    this.style.color = '#64748b';
                }
            });
        }
    }
    
    if (endDateInput) {
        endDateInput.setAttribute('data-placeholder', 'Select end date');
        
        if (!endDateInput.value) {
            endDateInput.style.color = '#64748b';
            endDateInput.setAttribute('type', 'text');
            endDateInput.value = 'YYYY-MM-DD';
            
            endDateInput.addEventListener('focus', function() {
                if (this.value === 'YYYY-MM-DD') {
                    this.value = '';
                    this.setAttribute('type', 'date');
                    this.style.color = '#1e293b';
                }
            });
            
            endDateInput.addEventListener('blur', function() {
                if (!this.value) {
                    this.setAttribute('type', 'text');
                    this.value = 'YYYY-MM-DD';
                    this.style.color = '#64748b';
                }
            });
        }
    }
    
    // If using Flatpickr (recommended approach)
    if (typeof flatpickr !== 'undefined') {
        if (startDateInput) {
            flatpickr("#startDate", {
                dateFormat: "Y-m-d",
                maxDate: new Date(),
                placeholder: "Select start date (YYYY-MM-DD)"
            });
        }
        
        if (endDateInput) {
            flatpickr("#endDate", {
                dateFormat: "Y-m-d",
                maxDate: new Date(),
                placeholder: "Select end date (YYYY-MM-DD)"
            });
        }
    }
    
    // Your existing Flatpickr initialization for scheduleDate
    const scheduleDateInput = document.getElementById('scheduleDate');
    if (scheduleDateInput && typeof flatpickr !== 'undefined') {
        flatpickr("#scheduleDate", {
            enableTime: true,
            dateFormat: "Y-m-d H:i",
            time_24hr: true,
            minDate: "today",
            minuteIncrement: 1,
            defaultDate: new Date(),
            altInput: true,
            altFormat: "F j, Y at h:i K"
        });
    }
});