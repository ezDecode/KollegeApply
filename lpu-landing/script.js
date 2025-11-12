const indianStates = [
	"Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh","Puducherry","Chandigarh","Dadra and Nagar Haveli and Daman and Diu","Andaman and Nicobar Islands","Lakshadweep"
];

const defaultCourses = ["B.Tech","MBA","BBA","BCA","MCA","B.Sc","M.Tech"];

function byId(id) { return document.getElementById(id); }

function populateSelect(select, items) {
	if (!select) return;
	select.innerHTML = '<option value="">Select</option>' + items.map(v => `<option value="${v}">${v}</option>`).join("");
}

function openModal() {
	const modal = byId("fee-modal");
	if (!modal) return;
	modal.classList.remove("hidden");
	modal.setAttribute("aria-hidden","false");
}

function closeModal() {
	const modal = byId("fee-modal");
	if (!modal) return;
	modal.classList.add("hidden");
	modal.setAttribute("aria-hidden","true");
	const table = byId("fee-table");
	if (table) table.innerHTML = "";
}

async function fetchFees() {
	const table = byId("fee-table");
	const title = byId("fee-modal-title");
	if (title) title.textContent = "Lovely Professional University · Fee Structure";
	if (table) {
		table.innerHTML = `
			<div class="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-slate-200">
				Loading fee structure...
			</div>`;
	}
	try {
		const res = await fetch("../api-backend/fees.lpu.json", { cache: "no-store" });
		if (!res.ok) throw new Error("Failed to load fees");
		const data = await res.json();
		const html = Object.entries(data).map(([course, fee]) => `
			<div class="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-200 shadow-lg">
				<div class="flex items-center justify-between gap-4">
					<strong class="text-white">${course}</strong>
					<span class="inline-flex items-center gap-2 rounded-full bg-brand-500/15 px-3 py-1 text-[0.75rem] font-semibold text-brand-200">
						<span class="material-symbols-rounded text-sm">currency_rupee</span>
						₹ ${Number(fee).toLocaleString("en-IN")}
					</span>
				</div>
				<p class="mt-2 text-xs uppercase tracking-[0.3em] text-slate-500">Annual tuition</p>
			</div>
		`).join("");
		if (table) table.innerHTML = html || `
			<div class="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-slate-200">
				Fee information will be shared shortly.
			</div>`;
		openModal();
	} catch {
		if (table) table.innerHTML = `
			<div class="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-slate-200">
				Unable to load fee details right now. Please try again later.
			</div>`;
		openModal();
	}
}

window.PIPEDREAM_ENDPOINT = window.PIPEDREAM_ENDPOINT || null;

async function loadConfig() {
	try {
		const res = await fetch("http://localhost:3000/api/config");
		if (res.ok) {
			const config = await res.json();
			window.PIPEDREAM_ENDPOINT = config.pipedreamEndpoint || "https://eoum6dsngvfgh19.m.pipedream.net";
		}
	} catch (err) {
		console.warn("Failed to load config, using fallback endpoint", err);
		window.PIPEDREAM_ENDPOINT = "https://eoum6dsngvfgh19.m.pipedream.net";
	}
}

function toggleAccessibility() {
	const accessibilityInfo = byId("accessibility-info");
	const statusText = byId("accessibility-status");
	if (!accessibilityInfo) return;
	
	const isHidden = accessibilityInfo.classList.contains("hidden");
	if (isHidden) {
		accessibilityInfo.classList.remove("hidden");
		if (statusText) statusText.textContent = "Hide";
	} else {
		accessibilityInfo.classList.add("hidden");
		if (statusText) statusText.textContent = "Show";
	}
}

async function submitLead(e) {
	e.preventDefault();
	const form = e.currentTarget;
	const status = byId("form-status");
	if (status) status.textContent = "";
	if (!form.reportValidity()) return;

	const formData = new FormData(form);
	const payload = Object.fromEntries(formData.entries());
	payload.university = "LPU";
	payload.timestamp = new Date().toISOString();

	if (status) status.textContent = "Submitting...";
	try {
		const endpoint = window.PIPEDREAM_ENDPOINT;
		if (!endpoint || !endpoint.startsWith("https://")) {
			throw new Error("Invalid endpoint configuration");
		}
		const resp = await fetch(endpoint, { 
			method: "POST", 
			headers: { "Content-Type": "application/json" }, 
			body: JSON.stringify(payload) 
		});
		if (!resp.ok) {
			throw new Error(`Server responded with status: ${resp.status}`);
		}
		if (status) status.textContent = "Thank you! We'll contact you shortly.";
		form.reset();
	} catch (err) {
		if (status) {
			if (err.message.includes("Invalid endpoint")) {
				status.textContent = "Form endpoint not configured. Please contact support.";
			} else if (err.name === "TypeError" || err.message.includes("Failed to fetch") || err.message.includes("NetworkError") || err.message.includes("Network request failed")) {
				status.textContent = "Network error. Please check your connection and try again.";
			} else {
				status.textContent = "Error submitting form. Please try again later.";
			}
		}
		console.error("Form submission error:", err);
	}
}

function downloadBrochure() {
	const brochureUrl = "./assets/brochure.pdf";
	const link = document.createElement("a");
	link.href = brochureUrl;
	link.download = "LPU-Brochure.pdf";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

function init() {
	loadConfig();
	const year = byId("year");
	if (year) year.textContent = new Date().getFullYear();
	populateSelect(document.querySelector('select[name="state"]'), indianStates);
	populateSelect(document.querySelector('select[name="course"]'), defaultCourses);

	const openBtn = byId("open-fee-modal");
	const closeBtn = byId("close-fee-modal");
	const downloadBtn = byId("download-brochure");
	const toggleAccessBtn = byId("toggle-accessibility");
	openBtn && openBtn.addEventListener("click", fetchFees);
	closeBtn && closeBtn.addEventListener("click", closeModal);
	downloadBtn && downloadBtn.addEventListener("click", downloadBrochure);
	toggleAccessBtn && toggleAccessBtn.addEventListener("click", toggleAccessibility);

	const modal = byId("fee-modal");
	modal && modal.addEventListener("click", (ev) => { if (ev.target === modal) closeModal(); });
	document.addEventListener("keydown", (ev) => { if (ev.key === "Escape") closeModal(); });

	const form = byId("lead-form");
	form && form.addEventListener("submit", submitLead);
}

window.addEventListener("DOMContentLoaded", init);
