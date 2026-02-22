import { createClient } from '@supabase/supabase-js/dist/umd/supabase.js';

// Screenshot (image_3ee080.png) se nikala gaya sahi API URL:
const supabaseUrl = 'https://zjqzeyxbcpezcdzaodim.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqcXpleXhiY3BlemNkemFvZGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODMwMTAsImV4cCI6MjA4NzM1OTAxMH0.KmnkBW3ISGKE5JDyOJZbVpXj49O9cGpMp_6TEayt5dc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);