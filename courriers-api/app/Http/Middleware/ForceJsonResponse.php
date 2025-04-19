<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ForceJsonResponse
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);
        
        // S'assurer que la réponse est en JSON avec l'encodage UTF-8
        if ($response instanceof \Illuminate\Http\JsonResponse) {
            $response->header('Content-Type', 'application/json; charset=utf-8');
        }
        
        return $response;
    }
} 