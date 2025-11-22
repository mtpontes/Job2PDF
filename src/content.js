import { generatePdf } from './generatePdf';



// Selectors for LinkedIn (approximate, based on common layouts)
const SELECTORS = {
    companyName: '.job-details-jobs-unified-top-card__company-name, .jobs-unified-top-card__company-name',
    position: '.job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title',
    location: '.job-details-jobs-unified-top-card__primary-description, .jobs-unified-top-card__primary-description',
    description: '#job-details, .jobs-description__content',
    // Broad selector for the apply button container/button
    applyButton: '.jobs-apply-button--top-card button, .jobs-apply-button, button[aria-label*="Apply"], button[aria-label*="Candidatar-se"]',
    presenceMode_and_job_type: '.artdeco-button.artdeco-button--secondary.artdeco-button--muted'
};

function getText(selector) {
    const el = document.querySelector(selector);
    return el ? el.innerText.trim() : '';
}

function getPresenceMode() {
    for (const descobrirOriginal of [...document.querySelectorAll(SELECTORS.presenceMode_and_job_type)]) {
        const div = document.createElement('div');
        div.appendChild(descobrirOriginal.cloneNode(true));

        descobrir = div.outerHTML.toLowerCase()

        const possiveisValores = {
            PRESENCIAL: ['in-person', 'in_person', 'office', 'presencial'],
            HIBRIDO: ['hybrid', 'semi_presencial', 'semi-presencial', 'semipresencial', 'híbrido', 'hibrido'],
            REMOTO: ['remote', 'remoto', 'home_office', 'home-office']
        }

        for (let key in possiveisValores) {
            const isIncludes = possiveisValores[key].some(value => descobrir.includes(value))

            if (isIncludes) return key
        }
    }
}

function getJobType() {
    for (const descobrirOriginal of [...document.querySelectorAll(SELECTORS.presenceMode_and_job_type)]) {
        const div = document.createElement('div');
        div.appendChild(descobrirOriginal.cloneNode(true));

        const descobrir = div.outerHTML.toLowerCase()

        const possiveisValores = {
            INTEGRAL: ['integral'],
            ESTAGIO: ['estagio']
        }

        for (let key in possiveisValores) {
            const isIncludes = possiveisValores[key].some(value => descobrir.includes(value))

            if (isIncludes) return key
        }
    }
}


function getJobDetails() {
    const companyName = getText(SELECTORS.companyName);
    const position = getText(SELECTORS.position);
    const description = getText(SELECTORS.description);
    const sourceUrl = window.location.href;

    // Heuristics for other fields if specific selectors aren't available
    const jobType = getJobType() || 'Not specified'; // Placeholder
    const presenceMode = getPresenceMode() || 'Not specified'; // Placeholder

    return {
        companyName,
        position,
        description,
        jobType,
        presenceMode,
        sourceUrl
    };
}

async function handleGeneratePdf() {
    console.log("Track-In: Generating PDF...");
    const data = getJobDetails();
    const pdfBytes = await generatePdf(data);

    // Trigger download
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Job - ${data.companyName} - ${data.position}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Message listener for manual trigger via extension icon
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrapeAndDownload") {
        handleGeneratePdf();
    }
});

// Logic to attach listener to the "Apply" button
let applyButtonFound = false;

function attachApplyListener() {
    const applyBtns = document.querySelectorAll(SELECTORS.applyButton);

    applyBtns.forEach(btn => {
        // Avoid attaching multiple times
        if (btn.dataset.trackInAttached) return;

        // Check if it's likely the correct button (e.g., contains text)
        const text = btn.innerText.toLowerCase();
        if (text.includes('apply') || text.includes('candidatar') || text.includes('inscri')) {
            console.log("Track-In: Apply button found and listener attached.");
            btn.addEventListener('click', () => {
                // Small delay to let any native click handlers fire first if needed
                setTimeout(handleGeneratePdf, 500);
            });
            btn.dataset.trackInAttached = 'true';
            applyButtonFound = true;
        }
    });
}

// Observer to handle dynamic content changes (SPA navigation, modal opening)
const observer = new MutationObserver((mutations) => {
    // Debounce or just run? Running every time might be expensive but robust.
    // Let's check if relevant nodes were added.
    let shouldCheck = false;
    for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
            shouldCheck = true;
            break;
        }
    }

    if (shouldCheck) {
        attachApplyListener();
    }
});

// Start observing
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Initial check
attachApplyListener();
