<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TeamMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class TeamController extends Controller
{
    /**
     * Get all team members (admin)
     */
    public function index(Request $request)
    {
        $query = TeamMember::query();

        // Search filter
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('role', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->has('status')) {
            $query->where('isActive', $request->status === 'active');
        }

        $members = $query->ordered()->get();

        return response()->json([
            'members' => $members,
            'total' => $members->count(),
        ]);
    }

    /**
     * Get team member statistics
     */
    public function stats()
    {
        return response()->json([
            'total' => TeamMember::count(),
            'active' => TeamMember::active()->count(),
            'inactive' => TeamMember::where('isActive', false)->count(),
        ]);
    }

    /**
     * Store a new team member
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'bio' => 'nullable|string|max:500',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'linkedin' => 'nullable|url|max:255',
            'github' => 'nullable|url|max:255',
            'twitter' => 'nullable|url|max:255',
            'gradient' => 'nullable|string|max:100',
            'order' => 'nullable|integer|min:0',
            'isActive' => 'nullable|boolean',
        ]);

        $data = $request->only([
            'name', 'role', 'bio', 'email', 'phone',
            'linkedin', 'github', 'twitter', 'gradient', 'order', 'isActive'
        ]);

        // Set defaults
        $data['isActive'] = $data['isActive'] ?? true;
        $data['order'] = $data['order'] ?? TeamMember::count();
        $data['gradient'] = $data['gradient'] ?? 'from-purple-600 to-pink-600';

        $member = TeamMember::create($data);

        Log::info("Team member created: {$member->name}");

        return response()->json([
            'message' => 'Team member created successfully',
            'member' => $member,
        ], 201);
    }

    /**
     * Get a single team member
     */
    public function show($id)
    {
        $member = TeamMember::findOrFail($id);

        return response()->json([
            'member' => $member,
        ]);
    }

    /**
     * Update a team member
     */
    public function update(Request $request, $id)
    {
        $member = TeamMember::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'role' => 'sometimes|required|string|max:255',
            'bio' => 'nullable|string|max:500',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'linkedin' => 'nullable|url|max:255',
            'github' => 'nullable|url|max:255',
            'twitter' => 'nullable|url|max:255',
            'gradient' => 'nullable|string|max:100',
            'order' => 'nullable|integer|min:0',
            'isActive' => 'nullable|boolean',
        ]);

        $data = $request->only([
            'name', 'role', 'bio', 'email', 'phone',
            'linkedin', 'github', 'twitter', 'gradient', 'order', 'isActive'
        ]);

        $member->update($data);

        Log::info("Team member updated: {$member->name}");

        return response()->json([
            'message' => 'Team member updated successfully',
            'member' => $member->fresh(),
        ]);
    }

    /**
     * Delete a team member
     */
    public function destroy($id)
    {
        $member = TeamMember::findOrFail($id);
        $name = $member->name;

        // Delete image if exists
        if ($member->image) {
            Storage::disk('public')->delete($member->image);
        }

        $member->delete();

        Log::info("Team member deleted: {$name}");

        return response()->json([
            'message' => 'Team member deleted successfully',
        ]);
    }

    /**
     * Upload team member image
     */
    public function uploadImage(Request $request, $id)
    {
        $member = TeamMember::findOrFail($id);

        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        // Delete old image if exists
        if ($member->image) {
            Storage::disk('public')->delete($member->image);
        }

        $path = $request->file('image')->store('team', 'public');
        $member->update(['image' => $path]);

        return response()->json([
            'message' => 'Image uploaded successfully',
            'image' => Storage::url($path),
            'member' => $member->fresh(),
        ]);
    }

    /**
     * Reorder team members
     */
    public function reorder(Request $request)
    {
        $request->validate([
            'members' => 'required|array',
            'members.*.id' => 'required|string',
            'members.*.order' => 'required|integer|min:0',
        ]);

        foreach ($request->members as $item) {
            TeamMember::where('_id', $item['id'])->update(['order' => $item['order']]);
        }

        return response()->json([
            'message' => 'Team members reordered successfully',
        ]);
    }

    /**
     * Toggle team member active status
     */
    public function toggleStatus($id)
    {
        $member = TeamMember::findOrFail($id);
        $member->update(['isActive' => !$member->isActive]);

        return response()->json([
            'message' => 'Status updated successfully',
            'member' => $member->fresh(),
        ]);
    }
}
