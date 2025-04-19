<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Decision;
use Illuminate\Http\Request;

class DecisionController extends Controller
{
    public function search(Request $request)
    {
        $query = Decision::query();

        if ($request->has('numéro')) {
            $query->where('numero', 'like', '%' . $request->numéro . '%');
        }
        if ($request->has('date')) {
            $query->whereDate('date', $request->date);
        }
        if ($request->has('objet')) {
            $query->where('objet', 'like', '%' . $request->objet . '%');
        }

        $results = $query->get([
            'id',
            'numero',
            'date',
            'objet',
            'observation'
        ]);

        return response()->json($results);
    }

    public function store(Request $request)
    {
        try {
            $decision = Decision::create($request->all());
            return response()->json($decision, 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function index()
    {
        $decisions = Decision::all();
        return response()->json($decisions);
    }

    public function update(Request $request, $id)
    {
        try {
            $decision = Decision::findOrFail($id);
            $decision->update($request->all());
            return response()->json($decision);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }
}