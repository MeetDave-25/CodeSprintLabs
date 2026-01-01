<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AnnouncementController extends Controller
{
    /**
     * List all announcements
     */
    public function index(Request $request)
    {
        $query = Announcement::query();

        // Filter by status
        if ($request->has('status')) {
            $query->where('isActive', $request->status === 'published');
        }

        // Filter by target audience
        if ($request->has('audience')) {
            $query->where('targetAudience', $request->audience);
        }

        // Filter by priority
        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        $announcements = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $announcements
        ]);
    }

    /**
     * Get announcement details
     */
    public function show(string $id)
    {
        $announcement = Announcement::with('creator')->find($id);

        if (!$announcement) {
            return response()->json(['message' => 'Announcement not found'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $announcement
        ]);
    }

    /**
     * Create a new announcement
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'targetAudience' => 'required|in:all,students,admins',
            'priority' => 'required|in:low,medium,high',
            'isActive' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $announcement = Announcement::create([
            'title' => $request->title,
            'content' => $request->content,
            'targetAudience' => $request->targetAudience,
            'priority' => $request->priority,
            'isActive' => $request->isActive ?? false, // Draft by default
            'createdBy' => $request->user()->id,
        ]);

        // If published immediately, send notifications
        if ($announcement->isActive) {
            $this->sendAnnouncementNotifications($announcement);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Announcement created successfully',
            'data' => $announcement
        ], 201);
    }

    /**
     * Update an announcement
     */
    public function update(Request $request, string $id)
    {
        $announcement = Announcement::find($id);

        if (!$announcement) {
            return response()->json(['message' => 'Announcement not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'targetAudience' => 'sometimes|in:all,students,admins',
            'priority' => 'sometimes|in:low,medium,high',
            'isActive' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $wasInactive = !$announcement->isActive;
        $announcement->update($request->all());

        // If just published, send notifications
        if ($wasInactive && $announcement->isActive) {
            $this->sendAnnouncementNotifications($announcement);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Announcement updated successfully',
            'data' => $announcement
        ]);
    }

    /**
     * Publish an announcement
     */
    public function publish(string $id)
    {
        $announcement = Announcement::find($id);

        if (!$announcement) {
            return response()->json(['message' => 'Announcement not found'], 404);
        }

        if ($announcement->isActive) {
            return response()->json(['message' => 'Announcement is already published'], 400);
        }

        $announcement->update(['isActive' => true]);
        $this->sendAnnouncementNotifications($announcement);

        return response()->json([
            'status' => 'success',
            'message' => 'Announcement published successfully',
            'data' => $announcement
        ]);
    }

    /**
     * Unpublish an announcement
     */
    public function unpublish(string $id)
    {
        $announcement = Announcement::find($id);

        if (!$announcement) {
            return response()->json(['message' => 'Announcement not found'], 404);
        }

        $announcement->update(['isActive' => false]);

        return response()->json([
            'status' => 'success',
            'message' => 'Announcement unpublished successfully',
            'data' => $announcement
        ]);
    }

    /**
     * Delete an announcement
     */
    public function destroy(string $id)
    {
        $announcement = Announcement::find($id);

        if (!$announcement) {
            return response()->json(['message' => 'Announcement not found'], 404);
        }

        $announcement->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Announcement deleted successfully'
        ]);
    }

    /**
     * Get announcements for the current user (public/student endpoint)
     */
    public function forUser(Request $request)
    {
        $user = $request->user();
        $audience = $user->isAdmin() ? 'admins' : 'students';

        $announcements = Announcement::where('isActive', true)
            ->whereIn('targetAudience', [$audience, 'all'])
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $announcements
        ]);
    }

    /**
     * Get announcement statistics
     */
    public function stats()
    {
        $total = Announcement::count();
        $published = Announcement::where('isActive', true)->count();
        $drafts = Announcement::where('isActive', false)->count();
        $highPriority = Announcement::where('priority', 'high')->where('isActive', true)->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'total' => $total,
                'published' => $published,
                'drafts' => $drafts,
                'highPriority' => $highPriority,
            ]
        ]);
    }

    /**
     * Send notifications to relevant users
     */
    private function sendAnnouncementNotifications(Announcement $announcement)
    {
        $query = User::query();

        if ($announcement->targetAudience === 'students') {
            $query->where('role', 'student');
        } elseif ($announcement->targetAudience === 'admins') {
            $query->where('role', 'admin');
        }
        // 'all' includes everyone

        $users = $query->get();

        foreach ($users as $user) {
            Notification::create([
                'userId' => $user->id,
                'title' => $announcement->title,
                'message' => substr($announcement->content, 0, 100) . '...',
                'type' => 'announcement',
                'read' => false,
                'link' => '/announcements/' . $announcement->id,
            ]);
        }
    }
}
