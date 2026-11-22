import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_INCIDENT_DRAFT,
  MAX_INCIDENT_PHOTOS,
  MAX_PHOTO_SIZE_BYTES,
  createIncidentReference,
  validateIncidentPhotoReport,
  validateIncomingPhotoFiles,
} from './incidentPhotos';

test('accepts valid image files and rejects unsupported MIME types or oversized files', () => {
  const res = validateIncomingPhotoFiles(
    [
      { name: 'porte.jpg', type: 'image/jpeg', size: 120_000 },
      { name: 'document.pdf', type: 'application/pdf', size: 50_000 },
      { name: 'gros.png', type: 'image/png', size: MAX_PHOTO_SIZE_BYTES + 1 },
      { name: 'serrure.webp', type: 'image/webp', size: 80_000 },
    ],
    0
  );

  assert.deepEqual(res.acceptedIndices, [0, 3]);
  assert.ok(res.errorMessage?.includes('Format non pris en charge'));
});

test('enforces maximum photo count per dossier', () => {
  const res = validateIncomingPhotoFiles(
    [
      { name: 'a.jpg', type: 'image/jpeg', size: 1000 },
      { name: 'b.jpg', type: 'image/jpeg', size: 1000 },
    ],
    MAX_INCIDENT_PHOTOS - 1
  );

  assert.deepEqual(res.acceptedIndices, [0]);
  assert.ok(res.errorMessage?.includes(`Maximum ${MAX_INCIDENT_PHOTOS}`));
});

test('validates required contact fields and at least one photo', () => {
  const emptyErrors = validateIncidentPhotoReport(INITIAL_INCIDENT_DRAFT, 0);
  assert.ok(emptyErrors.fullName);
  assert.ok(emptyErrors.phone);
  assert.ok(emptyErrors.photos);

  const validErrors = validateIncidentPhotoReport(
    {
      incidentType: 'Effraction',
      fullName: 'Marc Laurent',
      phone: '06 51 23 44 89',
      insurer: 'Allianz',
      note: 'Montant fracturé côté paumelles.',
    },
    2
  );
  assert.deepEqual(validErrors, {});
});

test('formats deterministic post-incident reference', () => {
  const ref = createIncidentReference(new Date(2026, 10, 21), 88);
  assert.equal(ref, 'SIN-20261121-1088');
});
