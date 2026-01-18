const form = document.getElementById('templateForm');
const statusText = document.getElementById('statusText');
const downloadBtn = document.getElementById('downloadBtn');

function setStatus(message, isError = false) {
  statusText.textContent = message;
  statusText.style.color = isError ? '#ff8f6a' : '';
}

async function downloadTemplate({ group, id, name, version }) {
  const params = new URLSearchParams({ group, id, name });
  if (version) params.set('version', version);
  const response = await fetch(`/zip?${params.toString()}`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to generate template.');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const filename = response.headers
    .get('Content-Disposition')
    ?.match(/filename="(.+)"/)?.[1] || 'template.zip';

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const group = formData.get('group').trim();
  const id = formData.get('id').trim();
  const name = formData.get('name').trim();
  const version = formData.get('version').trim();

  if (!group || !id || !name) {
    setStatus('Please fill out all fields before downloading.', true);
    return;
  }

  downloadBtn.disabled = true;
  setStatus('Generating zip, hang tight...');

  try {
    await downloadTemplate({ group, id, name, version });
    setStatus('Template downloaded. You are ready to build!');
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    downloadBtn.disabled = false;
  }
});

async function loadVersions() {
  const versionSelect = document.getElementById('version');
  try {
    const response = await fetch('/versions');
    if (!response.ok) {
      throw new Error('Could not load versions.');
    }
    const data = await response.json();
    const versions = Array.isArray(data.versions) ? data.versions : [];

    versionSelect.innerHTML = '';
    if (versions.length === 0) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'No versions found';
      versionSelect.appendChild(option);
      return;
    }

    versions.forEach((version) => {
      const option = document.createElement('option');
      option.value = version;
      option.textContent = version;
      versionSelect.appendChild(option);
    });
  } catch (error) {
    versionSelect.innerHTML = '';
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Failed to load versions';
    versionSelect.appendChild(option);
  }
}

loadVersions();
