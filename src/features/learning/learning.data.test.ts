import { describe, expect, it } from 'vitest';
import { findOfflineGuide, offlineGuides } from './learning.data';

describe('offline clinical learning content', () => {
  it('finds the jaundice, paediatric UTI and acute abdominal pain guides', () => {
    expect(findOfflineGuide('jaundice evaluation')?.id).toBe('jaundice-assessment');
    expect(findOfflineGuide('Suspected UTI in a child')?.id).toBe('uti-child-assessment');
    expect(findOfflineGuide('acute abdominal pain')?.id).toBe('acute-abdominal-pain');
    expect(findOfflineGuide('appendicitis')?.id).toBe('appendicitis-assessment');
    expect(findOfflineGuide('PUV')?.id).toBe('posterior-urethral-valves');
    expect(findOfflineGuide('hypospadias')?.id).toBe('hypospadias-assessment');
  });

  it('includes secure references and valid answer indices in all guides', () => {
    for (const guide of offlineGuides) {
      expect(guide.sources.length).toBeGreaterThan(0);
      expect(guide.sources.every((source) => source.url.startsWith('https://'))).toBe(true);
      expect(guide.questions.length).toBeGreaterThan(0);
      expect(guide.differentialFrameworks.length).toBeGreaterThan(0);
      expect(guide.managementPrinciples.length).toBeGreaterThan(0);
      for (const question of guide.questions) {
        expect(question.answerIndex).toBeGreaterThanOrEqual(0);
        expect(question.answerIndex).toBeLessThan(question.options.length);
      }
    }
  });

  it('preserves the key PUV neonatal assessment and lifelong follow-up principles', () => {
    const guide = findOfflineGuide('posterior urethral valves')!;
    expect(guide.investigationsToConsider.join(' ')).toMatch(/VCUG|voiding cystourethrography/i);
    expect(guide.escalationFeatures.join(' ')).toMatch(/oliguria|anuria/i);
    expect(guide.keyPoints.join(' ')).toMatch(/lifelong monitoring/i);
  });

  it('preserves the hypospadias bilateral cryptorchidism and anatomy cautions', () => {
    const guide = findOfflineGuide('hypospadias')!;
    expect(guide.escalationFeatures.join(' ')).toMatch(/bilateral undescended testes/i);
    expect(guide.keyPoints.join(' ')).toMatch(/urethral plate quality/i);
    expect(guide.managementPrinciples.join(' ')).toMatch(/Preserve the prepuce/i);
  });

  it('preserves the NICE referral warning for suspected UTI in babies under 3 months', () => {
    const guide = findOfflineGuide('uti')!;
    expect(guide.escalationFeatures.join(' ')).toMatch(/younger than 3 months/i);
    expect(guide.keyPoints.join(' ')).toMatch(/single symptom or sign in isolation/i);
  });
});
