import type { LucideIcon } from 'lucide-react';
import { Activity, BookOpen, BriefcaseMedical, ClipboardList, FileHeart, GraduationCap, LayoutDashboard, Settings2, ShieldCheck, Stethoscope, UserRound, UsersRound } from 'lucide-react';

export type SectionId = 'workspace' | 'clerking' | 'clinical-tutor' | 'simulation' | 'case-library' | 'learning-catalogue' | 'profile-settings';
export type NavigationItem = { id: SectionId; label: string; icon: LucideIcon; group: 'main' | 'clinical' | 'study' | 'account' };

export const navigationItems: NavigationItem[] = [
  { id: 'workspace', label: 'Workspace', icon: LayoutDashboard, group: 'main' },
  { id: 'clerking', label: 'AI Guided Clinical Clerking', icon: ClipboardList, group: 'clinical' },
  { id: 'clinical-tutor', label: 'Clinical Tutor', icon: Stethoscope, group: 'clinical' },
  { id: 'simulation', label: 'Virtual Patient Simulation', icon: UsersRound, group: 'clinical' },
  { id: 'case-library', label: 'Case Library', icon: FileHeart, group: 'study' },
  { id: 'learning-catalogue', label: 'Learning Catalogue', icon: BookOpen, group: 'study' },
  { id: 'profile-settings', label: 'Profile & settings', icon: Settings2, group: 'account' },
];

export const specialtyHighlights = [
  { title: 'Medicine', detail: 'Core medical presentations', icon: Activity },
  { title: 'Surgery', detail: 'General and specialty surgery', icon: BriefcaseMedical },
  { title: 'Paediatrics', detail: 'Child health and development', icon: GraduationCap },
  { title: 'Emergency', detail: 'Initial assessment and priorities', icon: ShieldCheck },
  { title: 'Obstetrics & Gynaecology', detail: 'Women’s health', icon: UserRound },
  { title: 'Family & Community Medicine', detail: 'Primary care and prevention', icon: Stethoscope },
];

export function sectionById(id: SectionId): NavigationItem {
  const item = navigationItems.find((entry) => entry.id === id);
  if (!item) throw new Error('Unknown WardWise section: ' + id);
  return item;
}
