-- Add year column to units table
ALTER TABLE public.units 
ADD COLUMN year integer NOT NULL DEFAULT 1;

-- Add resource_type column to resources table
ALTER TABLE public.resources 
ADD COLUMN resource_type text NOT NULL DEFAULT 'notes';

-- Add check constraint for resource_type
ALTER TABLE public.resources 
ADD CONSTRAINT valid_resource_type 
CHECK (resource_type IN ('notes', 'past_papers', 'presentation', 'other'));

-- Remove year column from courses table
ALTER TABLE public.courses 
DROP COLUMN year;