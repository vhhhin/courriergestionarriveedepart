<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CourierController;
use App\Http\Controllers\Api\DecisionController;
use App\Http\Controllers\Api\HealthController;

// Route de santé
Route::get('/health', [HealthController::class, 'check']);

// Routes pour les courriers
Route::post('/couriers/arrivee/search', [CourierController::class, 'searchIncoming']);
Route::post('/couriers/depart/search', [CourierController::class, 'searchOutgoing']);
Route::post('/couriers', [CourierController::class, 'store']);
Route::get('/couriers', [CourierController::class, 'index']);
Route::get('/couriers/type/{type}', [CourierController::class, 'getByType']);

// Routes pour les décisions
Route::post('/decisions/search', [DecisionController::class, 'search']);
Route::post('/decisions', [DecisionController::class, 'store']);
Route::get('/decisions', [DecisionController::class, 'index']);
Route::put('/decisions/{id}', [DecisionController::class, 'update']);
