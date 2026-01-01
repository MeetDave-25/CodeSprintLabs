<?php

namespace App\Http\Controllers;

use App\Models\TeamMember;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    /**
     * Get all active team members (public)
     */
    public function index()
    {
        $members = TeamMember::active()->ordered()->get();

        return response()->json([
            'members' => $members,
        ]);
    }
}
