import assert from 'node:assert/strict';
import fs from 'node:fs';
import { classifyType, classifyUrgency, routeRequest, routeAll, visibleState, exportRows, toCsv } from './router.mjs';

const data = JSON.parse(fs.readFileSync(new URL('./data/requests.json', import.meta.url), 'utf8'));
assert.equal(classifyType('billing').value, 'BILLING');
assert.equal(classifyType('').ok, false);
assert.match(classifyType('Billing / Technical').reason, /Ambiguous/);
assert.match(classifyType('Partnership').reason, /Unsupported/);
assert.equal(classifyUrgency('High').value, 'HIGH');
assert.equal(classifyUrgency('Immediate').ok, false);

const known = routeRequest({ id:'K', requestType:'Sales', urgency:'Normal', subject:'x' });
assert.equal(known.status, 'ROUTED');
assert.equal(known.owner, 'Sales Queue');
assert.equal(known.nextAction, 'Qualify the request and schedule discovery if appropriate.');

const deterministicRules = [
  ['Billing','Billing Queue','Verify billing context and prepare a response.'],
  ['Technical','Support Queue','Reproduce the reported issue and confirm scope.'],
  ['Sales','Sales Queue','Qualify the request and schedule discovery if appropriate.'],
  ['General','Customer Ops','Clarify the request and route the confirmed need.']
];
for (const [type, owner, nextAction] of deterministicRules) {
  const out = routeRequest({ id:`RULE-${type}`, requestType:type, urgency:'Normal', subject:'x' });
  assert.equal(out.status, 'ROUTED');
  assert.equal(out.owner, owner);
  assert.equal(out.nextAction, nextAction);
}

const missing = routeRequest({ id:'M', requestType:'', urgency:'Low', subject:'x' });
assert.equal(missing.status, 'REVIEW');
assert.match(missing.reviewReason, /Missing request type/);
const unsupported = routeRequest({ id:'U', requestType:'Partnership', urgency:'Normal', subject:'x' });
assert.equal(unsupported.status, 'REVIEW');
assert.match(unsupported.reviewReason, /Unsupported request type/);
const ambiguous = routeRequest({ id:'A', requestType:'Billing / Technical', urgency:'High', subject:'x' });
assert.equal(ambiguous.status, 'REVIEW');
assert.match(ambiguous.reviewReason, /Ambiguous request type/);
const badUrgency = routeRequest({ id:'Z', requestType:'Technical', urgency:'Immediate', subject:'x' });
assert.equal(badUrgency.status, 'REVIEW');
assert.match(badUrgency.reviewReason, /Unsupported urgency/);

const routed = routeAll(data);
assert.equal(routed.length, 8);
assert.equal(routed.filter(x=>x.status==='ROUTED').length, 4);
assert.equal(routed.filter(x=>x.status==='REVIEW').length, 4);
for (const item of routed) {
  assert.ok(item.owner);
  assert.ok(item.nextAction);
  assert.ok(item.status);
}
const reviews = visibleState(routed, { status:'REVIEW', urgency:'ALL', search:'' });
assert.equal(reviews.length, 4);
const high = visibleState(routed, { status:'ALL', urgency:'HIGH', search:'' });
assert.equal(high.length, 2);
const search = visibleState(routed, { status:'ALL', urgency:'ALL', search:'invoice' });
assert.deepEqual(search.map(x=>x.id), ['REQ-081']);

const rows = exportRows(reviews);
assert.equal(rows.length, 4);
assert.ok(rows.every(r => r.source_classification === 'SYNTHETIC'));
assert.ok(rows.every(r => Object.hasOwn(r, 'type') && Object.hasOwn(r, 'urgency') && Object.hasOwn(r, 'owner') && Object.hasOwn(r, 'next_action')));
const csv = toCsv(rows);
assert.match(csv, /review_reason/);
assert.match(csv, /SYNTHETIC/);
console.log(JSON.stringify({status:'PASS', tests:42, dataset:8, routed:4, review:4}));
