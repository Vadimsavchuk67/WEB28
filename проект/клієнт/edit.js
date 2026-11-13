const form = document.getElementById('posting-form');
const fields = [...form.querySelectorAll('input, select')];
const saveButton = document.getElementById('save');
const status = document.getElementById('status');
const idText = new URLSearchParams(location.search).get('id');
const id = idText === null ? null : Number(idText);

function clearError(field) {
    field.classList.remove('invalid');
    field.removeAttribute('aria-invalid');
    document.getElementById(field.id + '-error').textContent = '';
}

function validate(field) {
    clearError(field);
    let message = '';
    const value = field.value.trim();
    if (value === '') {
        message = 'Заповніть поле.';
    } else if (field.type === 'number') {
        const number = Number(value);
        if (!Number.isFinite(number) || number < Number(field.min)) {
            message = 'Мінімальне значення: ' + field.min + '.';
        } else if (field.step === '1' && !Number.isInteger(number)) {
            message = 'Введіть ціле число.';
        }
    } else if (field.tagName === 'SELECT' && !['Department', 'Courier', 'ExpressCourier'].includes(value)) {
        message = 'Виберіть тип доставки.';
    }
    if (message) {
        field.classList.add('invalid');
        field.setAttribute('aria-invalid', 'true');
        document.getElementById(field.id + '-error').textContent = message;
    }
    return message === '';
}

for (const field of fields) {
    field.addEventListener('change', () => validate(field));
    field.addEventListener('input', () => clearError(field));
}

document.getElementById('cancel').addEventListener('click', () => {
    location.href = 'index.html';
});

saveButton.addEventListener('click', async () => {
    status.textContent = '';
    const valid = fields.map(validate).every(Boolean);
    if (!valid) {
        status.textContent = 'Виправте помилки у формі.';
        fields.find(field => field.classList.contains('invalid')).focus();
        return;
    }
    const posting = {};
    for (const field of fields) {
        posting[field.id] = field.type === 'number' ? Number(field.value) : field.value.trim();
    }
    saveButton.disabled = true;
    try {
        if (id === null) {
            await createPosting(posting);
        } else {
            await updatePosting(id, { ...posting, id });
        }
        location.href = 'index.html';
    } catch (error) {
        status.textContent = 'Не вдалося зберегти. ' + error.message;
    } finally {
        saveButton.disabled = false;
    }
});

async function loadPosting() {
    if (id === null) return;
    if (!Number.isSafeInteger(id) || id <= 0) {
        status.textContent = 'Некоректний номер відправлення.';
        saveButton.disabled = true;
        return;
    }
    saveButton.disabled = true;
    status.textContent = 'Завантаження відправлення…';
    try {
        const posting = await getPosting(id);
        for (const field of fields) {
            field.value = posting[field.id];
        }
        status.textContent = '';
        saveButton.disabled = false;
    } catch (error) {
        status.textContent = 'Не вдалося завантажити. ' + error.message;
    }
}

loadPosting();
