<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class CloudinaryService
{
    protected $cloudinary;
    protected $isConfigured = false;

    public function __construct()
    {
        // Check if CLOUDINARY_URL is set (used by the cloudinary-laravel package)
        $cloudinaryUrl = config('cloudinary.cloud_url') ?: env('CLOUDINARY_URL');
        
        if ($cloudinaryUrl) {
            $this->isConfigured = true;
        }
    }

    /**
     * Check if Cloudinary is configured
     */
    public function isConfigured(): bool
    {
        return $this->isConfigured;
    }

    /**
     * Upload a file to Cloudinary
     * 
     * @param UploadedFile $file The uploaded file
     * @param string $folder The folder path in Cloudinary
     * @param string|null $publicId Custom public ID (filename)
     * @return array|null Returns array with 'url', 'public_id', 'secure_url' or null on failure
     */
    public function upload(UploadedFile $file, string $folder = 'resumes', ?string $publicId = null): ?array
    {
        if (!$this->isConfigured) {
            Log::warning('Cloudinary is not configured. File will be stored locally.');
            return null;
        }

        try {
            $options = [
                'folder' => $folder,
                'resource_type' => 'auto', // auto-detect file type
                'access_mode' => 'public', // or 'authenticated' for private files
            ];

            if ($publicId) {
                $options['public_id'] = $publicId;
            }

            // Use the cloudinary() helper from the Laravel package
            $result = cloudinary()->upload($file->getRealPath(), $options);

            return [
                'url' => $result->getSecurePath(),
                'public_id' => $result->getPublicId(),
                'secure_url' => $result->getSecurePath(),
                'original_name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
            ];
        } catch (\Exception $e) {
            Log::error('Cloudinary upload failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Upload a file from a path (for copying existing files)
     */
    public function uploadFromPath(string $filePath, string $folder = 'resumes', ?string $publicId = null): ?array
    {
        if (!$this->isConfigured) {
            return null;
        }

        try {
            $options = [
                'folder' => $folder,
                'resource_type' => 'auto',
            ];

            if ($publicId) {
                $options['public_id'] = $publicId;
            }

            $result = cloudinary()->upload($filePath, $options);

            return [
                'url' => $result->getSecurePath(),
                'public_id' => $result->getPublicId(),
                'secure_url' => $result->getSecurePath(),
            ];
        } catch (\Exception $e) {
            Log::error('Cloudinary upload from path failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Delete a file from Cloudinary
     */
    public function delete(string $publicId): bool
    {
        if (!$this->isConfigured) {
            return false;
        }

        try {
            cloudinary()->destroy($publicId);
            return true;
        } catch (\Exception $e) {
            Log::error('Cloudinary delete failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get a signed URL for a private file (for authenticated access)
     */
    public function getSignedUrl(string $publicId, int $expiresInSeconds = 3600): ?string
    {
        if (!$this->isConfigured) {
            return null;
        }

        try {
            return cloudinary()->getUrl($publicId, [
                'sign_url' => true,
                'type' => 'authenticated',
                'expires_at' => time() + $expiresInSeconds,
            ]);
        } catch (\Exception $e) {
            Log::error('Cloudinary signed URL failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get the public URL of a file
     */
    public function getUrl(string $publicId): ?string
    {
        if (!$this->isConfigured) {
            return null;
        }

        try {
            return cloudinary()->getUrl($publicId);
        } catch (\Exception $e) {
            Log::error('Cloudinary get URL failed: ' . $e->getMessage());
            return null;
        }
    }
}
