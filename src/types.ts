export type AppMode = 'home' | 'see' | 'hear' | 'speak';
export type Language = 'en' | 'rw';

export interface Phrase {
  id: string;
  label: string;
  labelRw: string;
  icon: string;
  category: string;
  usageCount: number;
}

export interface EmergencyContact {
  name: string;
  phone: string;
}
