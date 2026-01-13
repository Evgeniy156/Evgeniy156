export enum Sender {
  User = 'user',
  Bot = 'bot'
}

export enum MessageType {
  Text = 'text',
  Debate = 'debate'
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  type?: MessageType;
}

export interface Exercise {
  id: string;
  stageId: string;
  title: string;
  step: string;
  description: string;
  instruction: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  icon: string;
}

export interface Stage {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  locked: boolean;
  level: string;
  completed?: boolean;
  category: 'Main' | 'Seminar'; // Added category
}

export interface HistoryItem {
  id: string;
  question: string;
  answer: string;
  stageId: string;
  stageTitle: string; // e.g. "I Ступень"
  exerciseTitle?: string; // Optional, if linked to specific exercise
  mode: 'General' | 'Exercise'; // Track if it was general chat or specific practice
  timestamp: string; // ISO string
}

export enum AppView {
  Chat = 'CHAT',
  Exercises = 'EXERCISES',
  EnergyStudio = 'ENERGY_STUDIO',
  VideoGenerator = 'VIDEO_GENERATOR',
  LiveSession = 'LIVE_SESSION',
  History = 'HISTORY'
}