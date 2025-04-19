<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Courier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourierController extends Controller
{
    public function store(Request $request)
    {
        try {
            Log::info('Requête reçue:', $request->all());

            // Supprimer la validation temporairement pour tester
            $courier = Courier::create($request->all());
            
            Log::info('Courrier créé:', $courier->toArray());
            
            return response()->json($courier, 201);
        } catch (\Exception $e) {
            Log::error('Erreur:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTrace()
            ]);
            
            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function searchIncoming(Request $request)
    {
        $query = Courier::where('type', 'incoming');

        if ($request->has('numéro')) {
            $query->where('numero_bo', 'like', '%' . $request->numéro . '%');
        }
        if ($request->has('date')) {
            $query->whereDate('date_arrivee_bo', $request->date);
        }
        if ($request->has('expéditeur')) {
            $query->where('expediteur', 'like', '%' . $request->expéditeur . '%');
        }
        if ($request->has('destinataire')) {
            $query->where('destinataire', 'like', '%' . $request->destinataire . '%');
        }
        if ($request->has('objet')) {
            $query->where('objet', 'like', '%' . $request->objet . '%');
        }

        $results = $query->get([
            'id',
            'numero_bo',
            'date_arrivee_bo',
            'expediteur',
            'objet',
            'destinataire',
            'nature_courrier',
            'orientation',
            'reference',
            'numero_reference',
            'date_reference'
        ]);

        return response()->json($results);
    }

    public function searchOutgoing(Request $request)
    {
        $query = Courier::where('type', 'outgoing');

        if ($request->has('numéro')) {
            $query->where('numero', 'like', '%' . $request->numéro . '%');
        }
        if ($request->has('date')) {
            $query->whereDate('date', $request->date);
        }
        if ($request->has('expéditeur')) {
            $query->where('expediteur', 'like', '%' . $request->expéditeur . '%');
        }
        if ($request->has('destinataire')) {
            $query->where('destinataire', 'like', '%' . $request->destinataire . '%');
        }
        if ($request->has('objet')) {
            $query->where('objet', 'like', '%' . $request->objet . '%');
        }
        if ($request->has('référence')) {
            $query->where('reference', 'like', '%' . $request->référence . '%');
        }

        $results = $query->get([
            'id',
            'numero',
            'date',
            'expediteur',
            'destinataire',
            'objet'
        ]);

        return response()->json($results);
    }
}
