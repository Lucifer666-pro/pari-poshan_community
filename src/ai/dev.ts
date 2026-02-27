
import { config } from 'dotenv';
config();

// Registering active production flows
import '@/ai/flows/fetch-food-safety-news.ts';
import '@/ai/flows/fetch-food-blogs.ts';
