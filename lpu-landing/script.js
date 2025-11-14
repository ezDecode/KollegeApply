const INDIAN_STATES = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Andaman and Nicobar Islands", "Lakshadweep"];
const DEFAULT_COURSES = ["B.Tech", "MBA", "BBA", "BCA", "MCA"];
const UNIVERSITY_KEY = "lpu";
const UNIVERSITY_NAME = "LPU";
const switchConfigKey = window.APP_SWITCH_CONFIG_KEY || "amityLanding";
const defaultSwitchUrl = (window.APP_SWITCH_URL || "https://amity-landing.netlify.app").replace(/\/$/, "");
const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const API_BASE_URL = (window.APP_BACKEND_URL || (isLocalhost ? "http://localhost:3000" : "https://kollegeapply.onrender.com")).replace(/\/$/, "");
function byId(id) {
	return document.getElementById(id);
}

function formatCurrency(amount) {
	return Number(amount).toLocaleString('en-IN');
}

function setSwitchLink(url) {
	const link = byId("switch-university");
	if (link && url) {
		link.href = url;
	}
}

function populateSelect(select, items) {
	if (!select) return;
	let html = '<option value="">Select</option>';
	for (let i = 0; i < items.length; i++) {
		html += '<option value="' + items[i] + '">' + items[i] + '</option>';
	}
	select.innerHTML = html;
}

function openModal() {
	const dropdown = byId("fee-dropdown");
	if (dropdown) {
		dropdown.classList.remove("hidden");
		dropdown.setAttribute("aria-hidden", "false");
		
		// Trigger animation
		setTimeout(() => {
			const content = byId("fee-content");
			const backdrop = byId("fee-backdrop");
			if (content) {
				content.style.animation = "slideDown 0.3s ease-out";
			}
			if (backdrop) {
				backdrop.style.animation = "fadeIn 0.2s ease-out";
			}
		}, 10);
	}
}

function closeModal() {
	const dropdown = byId("fee-dropdown");
	if (dropdown) {
		dropdown.classList.add("hidden");
		dropdown.setAttribute("aria-hidden", "true");
		const table = byId("fee-table");
		if (table) {
			table.innerHTML = "";
		}
	}
}

async function fetchFees() {
	const table = byId("fee-table");
	const title = byId("fee-dropdown-title");
	
	if (title) {
		title.textContent = "Lovely Professional University · Fee Structure";
	}
	
	if (table) {
		table.innerHTML = '<div class="rounded-xl border border-white/10 bg-slate-900/70 p-6 text-base text-slate-300">Loading fee structure...</div>';
	}
	
	try {
		const response = await fetch(API_BASE_URL + "/api/fees/" + UNIVERSITY_KEY);
		
		if (!response.ok) {
			throw new Error("Failed to fetch fees");
		}
		
		const data = await response.json();
		
		if (table) {
			let feeHTML = "";
			const entries = Object.entries(data);
			
			if (entries.length === 0) {
				feeHTML = '<div class="rounded-xl border border-white/10 bg-slate-900/70 p-6 text-base text-slate-300">Fee information will be shared shortly.</div>';
			} else {
				for (let i = 0; i < entries.length; i++) {
					const course = entries[i][0];
					const fee = entries[i][1];
					feeHTML += '<div class="card-ai rounded-xl border border-white/5 bg-slate-900/60 p-5 transition-all duration-300 hover:bg-slate-900/80">';
					feeHTML += '<div class="flex items-center justify-between gap-4">';
					feeHTML += '<strong class="text-base text-white font-medium">' + course + '</strong>';
					feeHTML += '<span class="inline-flex items-center gap-1.5 rounded-full bg-brand-500/20 px-4 py-1.5 text-sm font-semibold text-brand-300">';
					feeHTML += '<span class="material-symbols-rounded text-base">currency_rupee</span>₹ ' + formatCurrency(fee);
					feeHTML += '</span></div>';
					feeHTML += '<p class="mt-2 text-xs uppercase tracking-wider text-slate-500">Annual tuition</p>';
					feeHTML += '</div>';
				}
			}
			
			table.innerHTML = feeHTML;
		}
	} catch (error) {
		console.error("Fee fetch failed:", error);
		if (table) {
			table.innerHTML = '<div class="rounded-xl border border-white/10 bg-slate-900/70 p-6 text-base text-slate-300">Unable to load fee details right now. Please try again later.</div>';
		}
	}
	
	openModal();
}

async function loadConfig() {
	try {
		const response = await fetch(API_BASE_URL + "/api/config");
		
		if (response.ok) {
			const config = await response.json();
			window.PIPEDREAM_ENDPOINT = config.pipedreamEndpoint;
			
			if (config[switchConfigKey]) {
				setSwitchLink(config[switchConfigKey]);
			} else {
				setSwitchLink(defaultSwitchUrl);
			}
		} else {
			window.PIPEDREAM_ENDPOINT = null;
			setSwitchLink(defaultSwitchUrl);
		}
	} catch (error) {
		console.warn("Config load failed:", error.message);
		window.PIPEDREAM_ENDPOINT = null;
		setSwitchLink(defaultSwitchUrl);
	}
}

function getUserFriendlyError(error) {
	const message = error.message || "";
	
	if (message.includes("Invalid endpoint")) {
		return "Form endpoint not configured. Please contact support.";
	}
	
	if (message.includes("timeout") || message.includes("aborted")) {
		return "Request timed out. Please check your connection and try again.";
	}
	
	if (error.name === "TypeError" || message.includes("Failed to fetch") || message.includes("NetworkError")) {
		return "Network error. Please check your connection and try again.";
	}
	
	if (message.includes("status:")) {
		return "Server error. Please try again later.";
	}
	
	return "An error occurred. Please try again later.";
}

async function submitLead(event) {
	event.preventDefault();
	
	const form = event.currentTarget;
	const status = byId("form-status");
	
	if (status) {
		status.textContent = "";
	}
	
	if (!form.reportValidity()) {
		return;
	}
	
	const formData = new FormData(form);
	const payload = {};
	
	for (const pair of formData.entries()) {
		payload[pair[0]] = pair[1];
	}
	
	payload.university = UNIVERSITY_NAME;
	payload.timestamp = new Date().toISOString();
	
	if (status) {
		status.textContent = "Submitting...";
	}
	
	try {
		const endpoint = window.PIPEDREAM_ENDPOINT;
		
		if (!endpoint || !endpoint.startsWith("https://")) {
			throw new Error("Invalid endpoint configuration");
		}
		
		const response = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(payload)
		});
		
		if (!response.ok) {
			throw new Error("Server responded with status: " + response.status);
		}
		
		if (status) {
			status.textContent = "Thank you! We'll contact you shortly.";
		}
		
		form.reset();
	} catch (error) {
		console.error("Form submission error:", error);
		if (status) {
			status.textContent = getUserFriendlyError(error);
		}
	}
}
function downloadBrochure() {
	const a = document.createElement("a");
	a.href = "./assets/brochure.pdf";
	a.download = "LPU-Brochure.pdf";
	a.click();
}

function init() {
	setSwitchLink(defaultSwitchUrl);
	loadConfig();
	
	const year = byId("year");
	if (year) {
		year.textContent = new Date().getFullYear();
	}
	
	const stateSelect = document.querySelector('select[name="state"]');
	populateSelect(stateSelect, INDIAN_STATES);
	
	const courseSelect = document.querySelector('select[name="course"]');
	populateSelect(courseSelect, DEFAULT_COURSES);
	
	const openFeeButton = byId("open-fee-modal");
	if (openFeeButton) {
		openFeeButton.addEventListener("click", fetchFees);
	}
	
	const closeFeeButton = byId("close-fee-dropdown");
	if (closeFeeButton) {
		closeFeeButton.addEventListener("click", closeModal);
	}
	
	const downloadButton = byId("download-brochure");
	if (downloadButton) {
		downloadButton.addEventListener("click", downloadBrochure);
	}
	
	const leadForm = byId("lead-form");
	if (leadForm) {
		leadForm.addEventListener("submit", submitLead);
	}
	
	const feeDropdown = byId("fee-dropdown");
	const feeBackdrop = byId("fee-backdrop");
	if (feeBackdrop) {
		feeBackdrop.addEventListener("click", closeModal);
	}
	
	document.addEventListener("keydown", function(event) {
		if (event.key === "Escape") {
			closeModal();
		}
	});
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", init);
} else {
	init();
}