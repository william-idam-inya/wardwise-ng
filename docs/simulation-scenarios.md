# Virtual Patient Simulation scenarios

The first simulation release uses scripted synthetic scenarios, not real patient records and not live generative patient responses.

## Available scenarios

1. Adult abdominal pain: a fictional 19-year-old man with defined pain onset and migration, associated symptoms, simulated examination and limited simulated investigation results. The scenario impression is withheld until the learner finishes.
2. Child with fever and urinary symptoms: a fictional 5-year-old girl with fever, dysuria, reduced intake, simulated examination and urine dipstick. The urine culture is explicitly pending; the case does not invent a culture result.

## Behaviour

- Each scenario's responses come from fixed facts. Unknown details receive an explicit "not in this scenario" response.
- Examination and investigation results are revealed only when the learner asks for them.
- The examiner checklist counts only domains the learner explicitly elicits. Unasked domains are not treated as negative.
- After the learner finishes, the debrief shows the missed history domains, examination points, differential diagnoses to consider and clinical-reasoning checkpoints.
- The scenario teaching impression and examiner rubric remain hidden until the interview is completed.
- Every screen states: "SIMULATION — NOT A REAL PATIENT".

The examiner rubric is a formative teaching aid, not a validated OSCE scoring instrument or a measure of clinical competence. Qualified clinicians must review the scenario facts, question mapping, red-flag handling and feedback before educational release.
