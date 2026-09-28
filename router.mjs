export const ROUTING_RULES = Object.freeze({
  BILLING: Object.freeze({ owner: 'Billing Queue', nextAction: 'Verify billing context and prepare a response.' }),
  TECHNICAL: Object.freeze({ owner: 'Support Queue', nextAction: 'Reproduce the reported issue and confirm scope.' }),
  SALES: Object.freeze({ owner: 'Sales Queue', nextAction: 'Qualify the request and schedule discovery if appropriate.' }),
  GENERAL: Object.freeze({ owner: 'Customer Ops', nextAction: 'Clarify the request and route the confirmed need.' })
});

export const URGENCY_VALUES = Object.freeze(['HIGH', 'NORMAL', 'LOW']);

function normalizeScalar(value) {
  return String(value ?? '').trim().toUpperCase();
}

export function classifyType(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return { ok: false, reason: 'Missing request type.' };
  const parts = raw.split(/[\/,+|]/).map(v => normalizeScalar(v)).filter(Boolean);
  const known = [...new Set(parts.filter(v => Object.hasOwn(ROUTING_RULES, v)))];
  if (known.length > 1) return { ok: false, reason: `Ambiguous request type: ${known.join(' + ')}.` };
  if (parts.length > 1 && known.length === 1) return { ok: false, reason: `Ambiguous request type input: ${raw}.` };
  const normalized = normalizeScalar(raw);
  if (!Object.hasOwn(ROUTING_RULES, normalized)) return { ok: false, reason: `Unsupported request type: ${raw}.` };
  return { ok: true, value: normalized };
}

export function classifyUrgency(value) {
  const normalized = normalizeScalar(value);
  if (!normalized) return { ok: false, reason: 'Missing urgency.' };
  if (!URGENCY_VALUES.includes(normalized)) return { ok: false, reason: `Unsupported urgency: ${String(value).trim()}.` };
  return { ok: true, value: normalized };
}

export function routeRequest(request) {
  const typeResult = classifyType(request.requestType);
  const urgencyResult = classifyUrgency(request.urgency);
  const reasons = [];
  if (!typeResult.ok) reasons.push(typeResult.reason);
  if (!urgencyResult.ok) reasons.push(urgencyResult.reason);
  if (reasons.length) {
    return Object.freeze({
      ...request,
      normalizedType: typeResult.ok ? typeResult.value : null,
      normalizedUrgency: urgencyResult.ok ? urgencyResult.value : null,
      status: 'REVIEW',
      owner: 'Unassigned',
      nextAction: 'Review the input before routing.',
      reviewReason: reasons.join(' ')
    });
  }
  const rule = ROUTING_RULES[typeResult.value];
  return Object.freeze({
    ...request,
    normalizedType: typeResult.value,
    normalizedUrgency: urgencyResult.value,
    status: 'ROUTED',
    owner: rule.owner,
    nextAction: rule.nextAction,
    reviewReason: null
  });
}

export function routeAll(requests) {
  return requests.map(routeRequest);
}

export function visibleState(routed, filters = {}) {
  const search = String(filters.search ?? '').trim().toLowerCase();
  return routed.filter(item => {
    if (filters.status && filters.status !== 'ALL' && item.status !== filters.status) return false;
    if (filters.urgency && filters.urgency !== 'ALL' && item.normalizedUrgency !== filters.urgency) return false;
    if (!search) return true;
    const haystack = [item.id, item.subject, item.requestType, item.urgency, item.owner, item.nextAction, item.reviewReason].join(' ').toLowerCase();
    return haystack.includes(search);
  });
}

export function exportRows(items) {
  return items.map(item => ({
    id: item.id,
    received_at: item.receivedAt,
    subject: item.subject,
    type_input: item.requestType,
    type: item.normalizedType,
    urgency_input: item.urgency,
    urgency: item.normalizedUrgency,
    status: item.status,
    owner: item.owner,
    next_action: item.nextAction,
    review_reason: item.reviewReason,
    source_classification: 'SYNTHETIC'
  }));
}

export function toCsv(rows) {
  const headers = Object.keys(rows[0] ?? { id: '' });
  const esc = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
  return [headers.join(','), ...rows.map(row => headers.map(h => esc(row[h])).join(','))].join('\n');
}
