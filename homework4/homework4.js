// ─── Cookie Helpers ───────────────────────────────────────────────────────────
function setCookie(name, value, hours) {
    const expires = new Date(Date.now() + hours * 36e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

// ─── Local Storage Keys ───────────────────────────────────────────────────────
const LS_FIELDS = [
    'first_name', 'middle_initial', 'last_name', 'dob', 'ssn', 'phone',
    'email', 'address', 'address2', 'city', 'state', 'zip',
    'insurance', 'policy_number', 'description', 'user_id'
];
const LS_CHECKS = ['diabetes','hypertension','heart_disease','asthma','chicken_pox',
                   'mumps','small_pox','COVID-19','Tetanus','measles'];
const LS_RADIOS = { age_group: ['child','adult','senior'], vaccinated: ['vaccinated'] };

// Save a single field's value to localStorage immediately
function saveField(id) {
    const el = document.getElementById(id);
    if (el) {
        if (el.type === 'checkbox') {
            localStorage.setItem(id, el.checked);
        } else {
            localStorage.setItem(id, el.value);
        }
    }
}

function saveRadioGroup(name) {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    localStorage.setItem(name, checked ? checked.value : '');
}

function loadLocalData() {
    LS_FIELDS.forEach(id => {
        const el = document.getElementById(id);
        const val = localStorage.getItem(id);
        if (el && val !== null) el.value = val;
    });
    LS_CHECKS.forEach(id => {
        const el = document.getElementById(id);
        const val = localStorage.getItem(id);
        if (el && val !== null) el.checked = (val === 'true');
    });
    Object.keys(LS_RADIOS).forEach(name => {
        const val = localStorage.getItem(name);
        if (val) {
            const radio = document.querySelector(`input[name="${name}"][value="${val}"]`);
            if (radio) radio.checked = true;
        }
    });
}

function clearLocalData() {
    [...LS_FIELDS, ...LS_CHECKS, ...Object.keys(LS_RADIOS), 'remember_me']
        .forEach(k => localStorage.removeItem(k));
}

// ─── Welcome Message ──────────────────────────────────────────────────────────
const welcomeMsg = document.getElementById('welcome_msg');
const notYouBtn  = document.getElementById('not_you_btn');
const notYouName = document.getElementById('not_you_name');

function updateWelcome(firstName) {
    if (firstName) {
        welcomeMsg.textContent  = `Welcome back, ${firstName}!`;
        notYouName.textContent  = firstName;
        notYouBtn.style.display = 'inline-block';
    } else {
        welcomeMsg.textContent  = 'Welcome New User!';
        notYouBtn.style.display = 'none';
    }
}

// ─── Returning User Confirmation ──────────────────────────────────────────────
const rememberMe     = document.getElementById('remember_me');
const returningModal = document.getElementById('returning_modal');
const returningMsg   = document.getElementById('returning_modal_msg');
const returningYes   = document.getElementById('returning_yes');
const returningNo    = document.getElementById('returning_no');

const cookieName = getCookie('first_name');
const hasLocalData = localStorage.getItem('first_name') !== null;

if (cookieName && hasLocalData) {
    // Returning user — ask for confirmation before restoring
    returningMsg.textContent = `Welcome back, ${cookieName}! We found saved form data. Would you like to restore it?`;
    returningModal.style.display = 'flex';

    returningYes.addEventListener('click', function () {
        returningModal.style.display = 'none';
        loadLocalData();
        rememberMe.checked = localStorage.getItem('remember_me') === 'true';
        updateWelcome(cookieName);
    });

    returningNo.addEventListener('click', function () {
        returningModal.style.display = 'none';
        deleteCookie('first_name');
        clearLocalData();
        rememberMe.checked = false;
        updateWelcome(null);
    });
} else {
    updateWelcome(cookieName || null);
}

// ─── Remember Me checkbox ─────────────────────────────────────────────────────
rememberMe.addEventListener('change', function () {
    if (this.checked) {
        localStorage.setItem('remember_me', 'true');
        const firstName = document.getElementById('first_name').value.trim();
        if (firstName) setCookie('first_name', firstName, 36);
    } else {
        deleteCookie('first_name');
        clearLocalData();
        updateWelcome(null);
    }
});

// ─── Auto-save on blur for all fields ────────────────────────────────────────
LS_FIELDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('blur', () => saveField(id));
});
LS_CHECKS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => saveField(id));
});
Object.keys(LS_RADIOS).forEach(name => {
    document.querySelectorAll(`input[name="${name}"]`).forEach(r =>
        r.addEventListener('change', () => saveRadioGroup(name))
    );
});

// Update cookie + welcome when first name is committed (blur)
document.getElementById('first_name').addEventListener('blur', function () {
    const val = this.value.trim();
    saveField('first_name');
    if (rememberMe.checked && val) setCookie('first_name', val, 36);
    updateWelcome(val || null);
});

// "Not you?" button — wipe everything and reset
notYouBtn.addEventListener('click', function () {
    deleteCookie('first_name');
    clearLocalData();
    rememberMe.checked = false;
    document.getElementById('first_name').value = '';
    updateWelcome(null);
});

// ─── Populate State Dropdown from states.json (with inline fallback) ─────────
const STATES_FALLBACK = [
  {"value":"AL","label":"Alabama"},{"value":"AK","label":"Alaska"},
  {"value":"AZ","label":"Arizona"},{"value":"AR","label":"Arkansas"},
  {"value":"CA","label":"California"},{"value":"CO","label":"Colorado"},
  {"value":"CT","label":"Connecticut"},{"value":"DE","label":"Delaware"},
  {"value":"FL","label":"Florida"},{"value":"GA","label":"Georgia"},
  {"value":"HI","label":"Hawaii"},{"value":"ID","label":"Idaho"},
  {"value":"IL","label":"Illinois"},{"value":"IN","label":"Indiana"},
  {"value":"IA","label":"Iowa"},{"value":"KS","label":"Kansas"},
  {"value":"KY","label":"Kentucky"},{"value":"LA","label":"Louisiana"},
  {"value":"ME","label":"Maine"},{"value":"MD","label":"Maryland"},
  {"value":"MA","label":"Massachusetts"},{"value":"MI","label":"Michigan"},
  {"value":"MN","label":"Minnesota"},{"value":"MS","label":"Mississippi"},
  {"value":"MO","label":"Missouri"},{"value":"MT","label":"Montana"},
  {"value":"NE","label":"Nebraska"},{"value":"NV","label":"Nevada"},
  {"value":"NH","label":"New Hampshire"},{"value":"NJ","label":"New Jersey"},
  {"value":"NM","label":"New Mexico"},{"value":"NY","label":"New York"},
  {"value":"NC","label":"North Carolina"},{"value":"ND","label":"North Dakota"},
  {"value":"OH","label":"Ohio"},{"value":"OK","label":"Oklahoma"},
  {"value":"OR","label":"Oregon"},{"value":"PA","label":"Pennsylvania"},
  {"value":"RI","label":"Rhode Island"},{"value":"SC","label":"South Carolina"},
  {"value":"SD","label":"South Dakota"},{"value":"TN","label":"Tennessee"},
  {"value":"TX","label":"Texas"},{"value":"UT","label":"Utah"},
  {"value":"VT","label":"Vermont"},{"value":"VA","label":"Virginia"},
  {"value":"WA","label":"Washington"},{"value":"WV","label":"West Virginia"},
  {"value":"WI","label":"Wisconsin"},{"value":"WY","label":"Wyoming"},
  {"value":"DC","label":"District of Columbia"},{"value":"PR","label":"Puerto Rico"}
];

function populateStates(states) {
    const select = document.getElementById('state');
    states.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.value;
        opt.textContent = s.label;
        select.appendChild(opt);
    });
}

fetch('states.json')
    .then(response => {
        if (!response.ok) throw new Error('fetch failed');
        return response.json();
    })
    .then(states => populateStates(states))
    .catch(() => populateStates(STATES_FALLBACK));

// ─── Date Display ────────────────────────────────────────────────────────────
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
const date = new Date();
let formatted = date.toLocaleDateString('en-US', options).replace(/, (\d{1,2})/, ' $1');
document.getElementById('current_date').textContent = formatted;

// ─── Pain Slider ─────────────────────────────────────────────────────────────
const painSlider = document.getElementById('pain_level');
const painValue = document.getElementById('pain_level_value');
painSlider.value = 15;
painValue.textContent = painSlider.value;
painSlider.addEventListener('input', function () {
    painValue.textContent = this.value;
});

// ─── Validation Rules & Error Messages ───────────────────────────────────────
const errorMessages = {
    first_name:       "First Name cannot be empty.",
    middle_initial:   "M.I. must be at most 1 character.",
    last_name:        "Last Name cannot be empty.",
    dob:              "Date of Birth must be in MM/DD/YYYY format, not in the future, and not older than 120 years.",
    ssn:              "SSN must be in the format XXX-XX-XXXX.",
    phone:            "Phone number must be in the format XXX-XXX-XXXX.",
    email:            "Email must be a valid email address.",
    address:          "Address Line 1 cannot be empty.",
    city:             "City cannot be empty.",
    state:            "State must be selected.",
    zip:              "Zip Code must be a 5-digit number.",
    insurance:        "Insurance Provider cannot be empty.",
    policy_number:    "Policy Number cannot be empty.",
    description:      "Symptoms description cannot be empty.",
    age_group:        "Age Group must be selected.",
    user_id:          "User ID cannot be empty.",
    password:         "Password cannot be empty and must not contain your first or last name.",
    confirm_password: "Confirm Password must match the Password."
};

function getValidations() {
    const form = document.querySelector('form');
    return {
        first_name:       v => v.trim().length > 0,
        middle_initial:   v => v.length <= 1,        // optional — always passes
        last_name:        v => v.trim().length > 0,
        dob: v => {
            if (!/^\d{2}\/\d{2}\/\d{4}$/.test(v)) return false;
            const [mm, dd, yyyy] = v.split('/').map(Number);
            const dobDate = new Date(yyyy, mm - 1, dd);
            const now = new Date();
            const minDate = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate());
            return dobDate <= now && dobDate >= minDate
                && dobDate.getFullYear() === yyyy
                && dobDate.getMonth() === mm - 1
                && dobDate.getDate() === dd;
        },
        ssn:              v => /^\d{3}-\d{2}-\d{4}$/.test(v),
        phone:            v => /^\d{3}-\d{3}-\d{4}$/.test(v),
        email:            v => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v),
        address:          v => v.trim().length > 0,
        address2:         v => true,                  // optional
        city:             v => v.trim().length > 0,
        state:            v => v.trim().length > 0,
        zip:              v => /^\d{5}$/.test(v),
        insurance:        v => v.trim().length > 0,
        policy_number:    v => v.trim().length > 0,
        description:      v => v.trim().length > 0,
        pain_level:       v => true,                  // range always has a value
        age_group:        v => v !== '',
        vaccinated:       v => true,                  // optional
        user_id:          v => v.trim().length > 0,
        password: v => {
            const first = (form.elements['first_name'].value || '').toLowerCase();
            const last  = (form.elements['last_name'].value  || '').toLowerCase();
            const pass  = (v || '').toLowerCase();
            return pass.length > 0
                && (!first || !pass.includes(first))
                && (!last  || !pass.includes(last));
        },
        confirm_password: v => v.trim().length > 0 && v === form.elements['password'].value
    };
}

// ─── Inline Error Helpers ─────────────────────────────────────────────────────
function getErrorEl(fieldName) {
    return document.getElementById('error_' + fieldName);
}

function setFieldError(fieldName, isValid) {
    const el = document.querySelector(
        `[name="${fieldName}"]`
    );
    const errEl = getErrorEl(fieldName);
    if (!el || !errEl) return;

    if (isValid) {
        el.classList.remove('field-error');
        errEl.textContent = '';
        errEl.style.display = 'none';
    } else {
        el.classList.add('field-error');
        errEl.textContent = errorMessages[fieldName] || 'Invalid input.';
        errEl.style.display = 'inline-block';
    }
}

// Special case: radio group (age_group) — highlight all radios in the group
function setRadioGroupError(groupName, isValid) {
    const radios = document.querySelectorAll(`[name="${groupName}"]`);
    const errEl = getErrorEl(groupName);
    radios.forEach(r => {
        if (isValid) r.classList.remove('field-error');
        else r.classList.add('field-error');
    });
    if (errEl) {
        errEl.textContent = isValid ? '' : (errorMessages[groupName] || 'Invalid input.');
        errEl.style.display = isValid ? 'none' : 'inline-block';
    }
}

// ─── Real-time Validation Wiring ──────────────────────────────────────────────
function validateField(fieldName) {
    const validations = getValidations();
    const form = document.querySelector('form');
    const el = form.elements[fieldName];
    if (!el) return true;

    let value;
    if (el.type === 'radio') {
        // Get checked value from named group
        const checked = form.querySelector(`input[name="${fieldName}"]:checked`);
        value = checked ? checked.value : '';
        const valid = validations[fieldName] ? validations[fieldName](value) : true;
        setRadioGroupError(fieldName, valid);
        return valid;
    }
    value = el.value !== undefined ? el.value : '';
    const valid = validations[fieldName] ? validations[fieldName](value) : true;
    setFieldError(fieldName, valid);
    return valid;
}

function attachListeners() {
    const form = document.querySelector('form');

    // Text / password / select / textarea fields
    const textFields = [
        'first_name','middle_initial','last_name','dob','ssn','phone',
        'email','address','address2','city','state','zip',
        'insurance','policy_number','description','user_id','password','confirm_password'
    ];

    textFields.forEach(name => {
        const el = form.elements[name];
        if (!el) return;
        // validate on blur (when user leaves the field)
        el.addEventListener('blur', () => validateField(name));
        // re-validate in real-time once the field has been touched
        el.addEventListener('input', () => {
            if (el.classList.contains('field-error') || el.dataset.touched === 'true') {
                validateField(name);
            }
        });
        el.addEventListener('blur', () => { el.dataset.touched = 'true'; });
        // confirm_password should also re-validate when password changes
        if (name === 'password') {
            el.addEventListener('input', () => {
                const cpEl = form.elements['confirm_password'];
                if (cpEl && (cpEl.classList.contains('field-error') || cpEl.dataset.touched === 'true')) {
                    validateField('confirm_password');
                }
            });
        }
    });

    // Radio groups
    ['age_group'].forEach(groupName => {
        const radios = form.querySelectorAll(`input[name="${groupName}"]`);
        radios.forEach(r => r.addEventListener('change', () => validateField(groupName)));
    });
}

// ─── Full-form Validation (used by Submit) ────────────────────────────────────
function validateAll() {
    const validations = getValidations();
    const form = document.querySelector('form');
    let allValid = true;

    const allFields = [
        'first_name','middle_initial','last_name','dob','ssn','phone',
        'email','address','address2','city','state','zip',
        'insurance','policy_number','description',
        'age_group',
        'user_id','password','confirm_password'
    ];

    allFields.forEach(name => {
        const el = form.elements[name];
        if (!el) return;

        let value, valid;
        if (el.type === 'radio') {
            const checked = form.querySelector(`input[name="${name}"]:checked`);
            value = checked ? checked.value : '';
            valid = validations[name] ? validations[name](value) : true;
            setRadioGroupError(name, valid);
        } else {
            value = el.value !== undefined ? el.value : '';
            valid = validations[name] ? validations[name](value) : true;
            setFieldError(name, valid);
        }
        if (!valid) allValid = false;
    });

    return allValid;
}

// ─── Review Modal ─────────────────────────────────────────────────────────────
document.getElementById('review_button').addEventListener('click', function () {
    const form = document.querySelector('form');
    const formData = new FormData(form);
    const validations = getValidations();

    let reviewContent = "<h3>Review Your Information</h3><ul style='list-style:none;padding:0;'>";

    const check = '<span style="color:green;font-weight:bold;">&#10003;</span>';
    const cross  = '<span style="color:red;font-weight:bold;">&#10007;</span>';

    const fields = [
        { name: 'first_name',       label: 'First Name' },
        { name: 'middle_initial',   label: 'M.I.' },
        { name: 'last_name',        label: 'Last Name' },
        { name: 'dob',              label: 'Date of Birth' },
        { name: 'ssn',              label: 'SSN' },
        { name: 'phone',            label: 'Phone' },
        { name: 'email',            label: 'Email' },
        { name: 'address',          label: 'Address Line 1' },
        { name: 'address2',         label: 'Address Line 2' },
        { name: 'city',             label: 'City' },
        { name: 'state',            label: 'State' },
        { name: 'zip',              label: 'Zip Code' },
        { name: 'insurance',        label: 'Insurance Provider' },
        { name: 'policy_number',    label: 'Policy Number' },
        { name: 'description',      label: 'Symptoms' },
        { name: 'pain_level',       label: 'Pain Level' },
        { name: 'age_group',        label: 'Age Group' },
        { name: 'vaccinated',       label: 'Vaccinated' },
        { name: 'user_id',          label: 'User ID' },
        { name: 'password',         label: 'Password' },
        { name: 'confirm_password', label: 'Confirm Password' }
    ];

    for (const field of fields) {
        let value = formData.get(field.name) || '';
        let valid = validations[field.name] ? validations[field.name](value) : true;
        if (valid) {
            reviewContent += `<li>${field.label}: ${check}</li>`;
        } else {
            const msg = errorMessages[field.name] || 'Invalid input.';
            reviewContent += `<li>${field.label}: ${cross} <span style='color:red;'>${msg}</span></li>`;
        }
    }
    reviewContent += '</ul>';

    // Modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';

    const modalBox = document.createElement('div');
    modalBox.style.cssText = 'background:#fff;color:#000;padding:24px;border-radius:8px;max-width:90vw;max-height:80vh;overflow-y:auto;';
    modalBox.innerHTML = reviewContent;

    const dismissButton = document.createElement('button');
    dismissButton.textContent = 'Close';
    dismissButton.style.marginTop = '16px';
    dismissButton.addEventListener('click', () => document.body.removeChild(modalOverlay));

    modalBox.appendChild(dismissButton);
    modalOverlay.appendChild(modalBox);
    document.body.appendChild(modalOverlay);
});

// ─── Validate Button ─────────────────────────────────────────────────────────
document.getElementById('validate_button').addEventListener('click', function () {
    const form = document.querySelector('form');
    const validations = getValidations();

    // Run full validation and collect failing fields with their messages
    const allFields = [
        { name: 'first_name',       label: 'First Name' },
        { name: 'middle_initial',   label: 'M.I.' },
        { name: 'last_name',        label: 'Last Name' },
        { name: 'dob',              label: 'Date of Birth' },
        { name: 'ssn',              label: 'SSN' },
        { name: 'phone',            label: 'Phone' },
        { name: 'email',            label: 'Email' },
        { name: 'address',          label: 'Address Line 1' },
        { name: 'address2',         label: 'Address Line 2' },
        { name: 'city',             label: 'City' },
        { name: 'state',            label: 'State' },
        { name: 'zip',              label: 'Zip Code' },
        { name: 'insurance',        label: 'Insurance Provider' },
        { name: 'policy_number',    label: 'Policy Number' },
        { name: 'description',      label: 'Symptoms' },
        { name: 'age_group',        label: 'Age Group' },
        { name: 'user_id',          label: 'User ID' },
        { name: 'password',         label: 'Password' },
        { name: 'confirm_password', label: 'Confirm Password' }
    ];

    const errors = [];
    allFields.forEach(({ name, label }) => {
        const el = form.elements[name];
        if (!el) return;
        let value;
        if (el.type === 'radio') {
            const checked = form.querySelector(`input[name="${name}"]:checked`);
            value = checked ? checked.value : '';
            const valid = validations[name] ? validations[name](value) : true;
            setRadioGroupError(name, valid);
            if (!valid) errors.push({ label, msg: errorMessages[name] || 'Invalid input.' });
        } else {
            value = el.value !== undefined ? el.value : '';
            const valid = validations[name] ? validations[name](value) : true;
            setFieldError(name, valid);
            if (!valid) errors.push({ label, msg: errorMessages[name] || 'Invalid input.' });
        }
    });

    // Scroll to first error on the page so the user can see highlights
    if (errors.length > 0) {
        const firstErrorEl = document.querySelector('.field-error');
        if (firstErrorEl) firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Build modal content
    let modalContent;
    if (errors.length > 0) {
        // ── Error modal ──
        modalContent = `
            <h3 style="color:#b30000;margin-top:0;">&#9888; Validation Failed</h3>
            <p style="margin:0 0 12px 0;">
                <strong>${errors.length} error${errors.length > 1 ? 's' : ''}</strong> found. Please fix the following fields:
            </p>
            <ul style="list-style:none;padding:0;margin:0;">
                ${errors.map(e => `
                    <li style="padding:6px 0;border-bottom:1px solid #eee;">
                        <span style="color:#b30000;font-weight:bold;">&#10007;</span>
                        <strong>${e.label}:</strong>
                        <span style="color:#c00;"> ${e.msg}</span>
                    </li>`).join('')}
            </ul>`;
    } else {
        // ── Success modal ──
        modalContent = `
            <h3 style="color:#1a7a1a;margin-top:0;">&#10003; All Fields Valid!</h3>
            <p style="margin:0 0 16px 0;">
                Your information looks good. Click <strong>Submit</strong> to complete your registration.
            </p>`;
    }

    // Build overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;z-index:9999;';

    const modalBox = document.createElement('div');
    modalBox.style.cssText = 'background:#fff;color:#000;padding:28px 32px;border-radius:10px;max-width:480px;width:90vw;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.4);';
    modalBox.innerHTML = modalContent;

    // Close button (always present)
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.cssText = 'margin-top:18px;margin-right:10px;background:#555;color:#fff;border:none;border-radius:6px;padding:8px 22px;font-size:1rem;cursor:pointer;';
    closeBtn.addEventListener('click', () => document.body.removeChild(modalOverlay));

    // Submit button (only shown when valid)
    if (errors.length === 0) {
        const submitBtn = document.createElement('button');
        submitBtn.textContent = 'Submit';
        submitBtn.style.cssText = 'margin-top:18px;background:#1a7a1a;color:#fff;border:none;border-radius:6px;padding:8px 22px;font-size:1rem;font-weight:600;cursor:pointer;';
        submitBtn.addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
            form.submit();
        });
        modalBox.appendChild(closeBtn);
        modalBox.appendChild(submitBtn);
    } else {
        modalBox.appendChild(closeBtn);
    }

    modalOverlay.appendChild(modalBox);
    document.body.appendChild(modalOverlay);
});

// ─── Reset: clear all error states ───────────────────────────────────────────
document.querySelector('form').addEventListener('reset', function () {
    setTimeout(() => {
        document.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));
        document.querySelectorAll('.error-msg').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
        // Reset touched flags
        document.querySelectorAll('[data-touched]').forEach(el => el.removeAttribute('data-touched'));
        // Reset slider display
        painSlider.value = 15;
        painValue.textContent = 15;
    }, 0);
});

// ─── Init ─────────────────────────────────────────────────────────────────────
attachListeners();
