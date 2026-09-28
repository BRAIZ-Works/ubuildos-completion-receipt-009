import { ROUTING_RULES, routeAll, visibleState, exportRows, toCsv } from './router.mjs';

const data = await fetch('./data/requests.json').then(r => {
  if (!r.ok) throw new Error(`Request data failed to load: ${r.status}`);
  return r.json();
});
const routed = routeAll(data);
const $ = id => document.getElementById(id);
const state = { search: '', status: 'ALL', urgency: 'ALL' };

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
function currentVisible() { return visibleState(routed, state); }
function renderRules() {
  $('routingRules').innerHTML = Object.entries(ROUTING_RULES).map(([type, rule]) => `
    <article class="rule">
      <h3>${escapeHtml(type)}</h3>
      <p><strong>Owner:</strong> ${escapeHtml(rule.owner)}</p>
      <p><strong>Next:</strong> ${escapeHtml(rule.nextAction)}</p>
    </article>`).join('');
}
function render() {
  const items = currentVisible();
  $('visibleCount').textContent = items.length;
  $('routedCount').textContent = items.filter(i => i.status === 'ROUTED').length;
  $('reviewCount').textContent = items.filter(i => i.status === 'REVIEW').length;
  $('highCount').textContent = items.filter(i => i.normalizedUrgency === 'HIGH').length;
  $('requestList').innerHTML = items.map(item => `
    <article class="request-card ${item.status === 'REVIEW' ? 'review' : ''}">
      <div class="request-top">
        <div><div class="request-id">${escapeHtml(item.id)}</div><h3>${escapeHtml(item.subject)}</h3></div>
        <div class="badges">
          <span class="badge ${item.status === 'REVIEW' ? 'review' : 'status'}">${escapeHtml(item.status)}</span>
          <span class="badge">${escapeHtml(item.normalizedUrgency ?? item.urgency ?? 'NO URGENCY')}</span>
        </div>
      </div>
      <dl class="fields">
        <div><dt>Type</dt><dd>${escapeHtml(item.normalizedType ?? (item.requestType || 'Missing'))}</dd></div>
        <div><dt>Urgency</dt><dd>${escapeHtml(item.normalizedUrgency ?? (item.urgency || 'Missing'))}</dd></div>
        <div><dt>Owner</dt><dd>${escapeHtml(item.owner)}</dd></div>
        <div><dt>Next action</dt><dd>${escapeHtml(item.nextAction)}</dd></div>
      </dl>
      ${item.reviewReason ? `<p class="reason"><strong>Why REVIEW:</strong> ${escapeHtml(item.reviewReason)}</p>` : ''}
    </article>`).join('');
  $('emptyState').hidden = items.length !== 0;
}
function download(name, type, content) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
$('search').addEventListener('input', e => { state.search = e.target.value; render(); });
$('statusFilter').addEventListener('change', e => { state.status = e.target.value; render(); });
$('urgencyFilter').addEventListener('change', e => { state.urgency = e.target.value; render(); });
$('resetBtn').addEventListener('click', () => {
  Object.assign(state, { search: '', status: 'ALL', urgency: 'ALL' });
  $('search').value = ''; $('statusFilter').value = 'ALL'; $('urgencyFilter').value = 'ALL'; render();
});
$('exportJsonBtn').addEventListener('click', () => download('customer-request-router-visible.json', 'application/json', JSON.stringify(exportRows(currentVisible()), null, 2)));
$('exportCsvBtn').addEventListener('click', () => download('customer-request-router-visible.csv', 'text/csv', toCsv(exportRows(currentVisible()))));
renderRules();
render();
