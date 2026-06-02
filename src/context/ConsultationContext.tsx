'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface Specialist {
  name: string;
  percentage: number;
  reason: string;
}

interface ConsultationState {
  sessionId: string | null;
  symptoms: string;
  questions: Array<{ question: string; options: string[] }>;
  answers: string[];
  anamnesisQuestions: Array<{ question: string; options: string[] }>;
  anamnesisAnswers: string[];
  duration: string;
  result: {
    recommendation: string;
    specialists: Specialist[];
    urgency: string;
  } | null;
}

interface ConsultationContextType extends ConsultationState {
  setSessionId: (id: string) => void;
  setSymptoms: (s: string) => void;
  setQuestions: (q: Array<{ question: string; options: string[] }>) => void;
  addAnswer: (a: string) => void;
  setAnamnesisQuestions: (q: Array<{ question: string; options: string[] }>) => void;
  addAnamnesisAnswer: (a: string) => void;
  setDuration: (d: string) => void;
  setResult: (r: ConsultationState['result']) => void;
  reset: () => void;
}

const initial: ConsultationState = {
  sessionId: null, symptoms: '', questions: [], answers: [],
  anamnesisQuestions: [], anamnesisAnswers: [], duration: '',result: null,
};

const ConsultationContext = createContext<ConsultationContextType | null>(null);

export function ConsultationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConsultationState>(initial);

  const update = (patch: Partial<ConsultationState>) =>
    setState(s => ({ ...s, ...patch }));

  const reset = useCallback(() => setState(initial), []);

  return (
    <ConsultationContext.Provider value={{
      ...state,
      setSessionId: id => update({ sessionId: id }),
      setSymptoms: symptoms => update({ symptoms }),
      setQuestions: questions => update({ questions }),
      addAnswer: a => setState(s => ({ ...s, answers: [...s.answers, a] })),
      setAnamnesisQuestions: q => update({ anamnesisQuestions: q }),
      addAnamnesisAnswer: a => setState(s => ({ ...s, anamnesisAnswers: [...s.anamnesisAnswers, a] })),
      setDuration: duration => update({ duration }),
      setResult: result => update({ result }),
      reset,
    }}>
      {children}
    </ConsultationContext.Provider>
  );
}

export const useConsultation = () => {
  const ctx = useContext(ConsultationContext);
  if (!ctx) throw new Error('useConsultation must be inside ConsultationProvider');
  return ctx;
};
