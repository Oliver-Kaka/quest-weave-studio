-- Make the study-resources bucket public so approved resources can be downloaded
UPDATE storage.buckets 
SET public = true 
WHERE id = 'study-resources';