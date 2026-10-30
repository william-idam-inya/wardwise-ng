import { supabase } from '../../lib/supabase/client';

export type ClinicalAssistantInput = {
  stage: number;
  stageTitle: string;
  caseCategory: 'synthetic' | 'deidentified';
  specialty: string;
  setting: string;
  clinicalContext: Record<string, unknown>;
};

export type ClinicalAssistantResponse = {
  assistant_message: string;
  question_purpose: string;
  input_type: 'text' | 'number' | 'yes_no' | 'select';
  required: boolean;
  missing_information: string[];
  safety_flags: string[];
  model: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateAssistantResponse(value: unknown): ClinicalAssistantResponse {
  if (!isRecord(value)) throw new Error('The clinical assistant returned an unreadable response.');
  const inputType = value.input_type;
  if (
    typeof value.assistant_message !== 'string'
    || !value.assistant_message.trim()
    || typeof value.question_purpose !== 'string'
    || !value.question_purpose.trim()
    || typeof value.required !== 'boolean'
    || (inputType !== 'text' && inputType !== 'number' && inputType !== 'yes_no' && inputType !== 'select')
    || !Array.isArray(value.missing_information)
    || !value.missing_information.every((item) => typeof item === 'string')
    || !Array.isArray(value.safety_flags)
    || !value.safety_flags.every((item) => typeof item === 'string')
    || typeof value.model !== 'string'
  ) {
    throw new Error('The clinical assistant response failed validation.');
  }
  return value as ClinicalAssistantResponse;
}

export async function requestNextClerkingQuestion(
  input: ClinicalAssistantInput,
): Promise<ClinicalAssistantResponse> {
  if (!supabase) throw new Error('WardWise Supabase is not configured.');
  const { data, error } = await supabase.functions.invoke('clinical-assistant', {
    body: { operation: 'next_question', ...input },
  });

  if (error) {
    const context = error.context;
    if (context instanceof Response) {
      try {
        const details: unknown = await context.clone().json();
        if (isRecord(details) && typeof details.error === 'string') {
          throw new Error(details.error);
        }
      } catch (parseError) {
        if (parseError instanceof Error && parseError.message !== 'Unexpected end of JSON input') {
          throw parseError;
        }
      }
    }
    throw new Error(error.message || 'The clinical assistant could not complete the request.');
  }

  return validateAssistantResponse(data);
}
