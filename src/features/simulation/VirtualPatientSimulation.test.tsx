import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { VirtualPatientSimulation } from './VirtualPatientSimulation';

afterEach(() => cleanup());

describe('Virtual Patient Simulation', () => {
  it('labels the scenario as fictional and hides the teaching impression before completion', () => {
    render(<VirtualPatientSimulation onBack={() => undefined}/>);
    expect(screen.getByText(/SIMULATION — NOT A REAL PATIENT/i)).toBeInTheDocument();
    expect(screen.queryByText(/acute appendicitis is a leading consideration/i)).not.toBeInTheDocument();
  });
  it('reveals debrief and teaching impression only after finishing', () => {
    render(<VirtualPatientSimulation onBack={() => undefined}/>);
    fireEvent.change(screen.getByLabelText(/ask the patient a question/i), {target:{value:'When did the pain start?'}});
    fireEvent.click(within(screen.getByRole('form', { name: /ask the fictional patient a question/i })).getByRole('button', { name: /^Ask$/i}));
    expect(screen.getByText(/18 hours ago/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading',{name:/interview debrief/i})).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:/finish interview/i}));
    expect(screen.getByRole('heading',{name:/interview debrief/i})).toBeInTheDocument();
    expect(screen.getByText(/acute appendicitis is a leading consideration/i)).toBeInTheDocument();
  });
});
