-- ==============================================================================
-- MIGRATION 004: Storage Configuration for Study Materials
-- Bucket: study-materials (Private)
-- Path Structure: <user_id>/<document_id>/<filename>
-- ==============================================================================

-- 1. Create the storage bucket if it does not already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'study-materials',
    'study-materials',
    FALSE,
    52428800, -- 50 MB limit
    ARRAY[
        'application/pdf', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        'text/plain', 
        'image/png', 
        'image/jpeg'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = FALSE,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY[
        'application/pdf', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        'text/plain', 
        'image/png', 
        'image/jpeg'
    ];

-- ------------------------------------------------------------------------------
-- 2. Storage RLS Policies
-- Enforce that a user can only access files located inside their own user_id directory:
-- path: user_id/document_id/filename.pdf
-- ------------------------------------------------------------------------------

-- Allow users to upload files to their own directory
DROP POLICY IF EXISTS "Allow authenticated uploads to user folder" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to user folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'study-materials' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view/download their own files
DROP POLICY IF EXISTS "Allow authenticated downloads from user folder" ON storage.objects;
CREATE POLICY "Allow authenticated downloads from user folder"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'study-materials' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own files
DROP POLICY IF EXISTS "Allow authenticated updates to user folder" ON storage.objects;
CREATE POLICY "Allow authenticated updates to user folder"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'study-materials' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
DROP POLICY IF EXISTS "Allow authenticated deletes in user folder" ON storage.objects;
CREATE POLICY "Allow authenticated deletes in user folder"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'study-materials' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);
