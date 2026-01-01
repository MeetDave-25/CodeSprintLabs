<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;

class NotificationController extends Controller
{
    /**
     * Get paginated notifications for the current user
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $notifications = Notification::where('userId', $user->id)
            ->orderBy('createdAt', 'desc')
            ->paginate(10);
            
        return response()->json([
            'status' => 'success',
            'data' => $notifications
        ]);
    }

    /**
     * Get count of unread notifications
     */
    public function unreadCount(Request $request)
    {
        $user = $request->user();
        
        $count = Notification::where('userId', $user->id)
            ->where('read', false)
            ->count();
            
        return response()->json([
            'status' => 'success',
            'count' => $count
        ]);
    }

    /**
     * Mark a notification as read
     */
    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();
        
        $notification = Notification::where('userId', $user->id) // Ensure ownership
            ->where('_id', $id)
            ->first();

        if (!$notification) {
            return response()->json(['message' => 'Notification not found'], 404);
        }

        $notification->update(['read' => true]);

        return response()->json([
            'status' => 'success',
            'message' => 'Marked as read'
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllRead(Request $request)
    {
        $user = $request->user();
        
        Notification::where('userId', $user->id)
            ->where('read', false)
            ->update(['read' => true]);
            
        return response()->json([
            'status' => 'success',
            'message' => 'All marked as read'
        ]);
    }
}
