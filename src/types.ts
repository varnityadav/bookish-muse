/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Genre = 
  | 'Classic Literature' 
  | 'Sci-Fi & Fantasy' 
  | 'Self-Help & Philosophy' 
  | 'Manga & Manhwa' 
  | 'Shonen' 
  | 'Fiction' 
  | 'Non-Fiction'
  | 'Movie Scripts'
  | 'Poetry';

export type Mood = 
  | 'Melancholic' 
  | 'Inspired' 
  | 'Pensive' 
  | 'Determined' 
  | 'Calm' 
  | 'Energetic';

export interface UserPreferences {
  genres: Genre[];
  authors: string[];
  hasOnboarded: boolean;
}

export interface Quote {
  text: string;
  author: string;
  source: string;
  category: Genre;
  context?: string;
  backgroundPrompt: string; // Used to search for a visual
  musicMood: string;
}
