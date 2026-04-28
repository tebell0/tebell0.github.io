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
