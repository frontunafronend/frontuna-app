/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:32:02.236Z
 * Issues detected: 1
 * 
 * This file is protected against common bugs:
 * - GENERIC_ERROR_MESSAGE: MEDIUM
 */


// 🛡️ API GUARD: This code defines API endpoints
// CRITICAL RULES:
// 1. ALWAYS return consistent response format: { success, data, message }
// 2. ALWAYS handle both database and demo modes
// 3. ALWAYS provide meaningful error messages
// 4. NEVER expose internal server errors to client
/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:30:48.042Z
 * Issues detected: 1
 * 
 * This file is protected against common bugs:
 * - GENERIC_ERROR_MESSAGE: MEDIUM
 */


// 🛡️ API GUARD: This code defines API endpoints
// CRITICAL RULES:
// 1. ALWAYS return consistent response format: { success, data, message }
// 2. ALWAYS handle both database and demo modes
// 3. ALWAYS provide meaningful error messages
// 4. NEVER expose internal server errors to client
/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:22:46.040Z
 * Issues detected: 1
 * 
 * This file is protected against common bugs:
 * - GENERIC_ERROR_MESSAGE: MEDIUM
 */


// 🛡️ API GUARD: This code defines API endpoints
// CRITICAL RULES:
// 1. ALWAYS return consistent response format: { success, data, message }
// 2. ALWAYS handle both database and demo modes
// 3. ALWAYS provide meaningful error messages
// 4. NEVER expose internal server errors to client
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';

import { EnvironmentService } from '../core/environment.service';

export interface RequestOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | string[] };
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

@Injectable({
  providedIn: 'root'
})
export class BaseApiService {
  protected readonly http = inject(HttpClient);
  private readonly environmentService = inject(EnvironmentService);
  protected readonly baseUrl = this.environmentService.apiUrl;

  /**
   * GET request
   */
  protected get<T>(endpoint: string, params?: any, options?: RequestOptions): Observable<T> {
    let httpParams: HttpParams | undefined;
    if (params) {
      httpParams = this.buildParams(params);
    }
    
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, {
      headers: options?.headers,
      params: httpParams
    }).pipe(
      retry(options?.retryAttempts || 1),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * POST request
   */
  protected post<T>(endpoint: string, body: any, options?: RequestOptions): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, {
      headers: options?.headers,
      params: options?.params
    }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /**
   * PUT request
   */
  protected put<T>(endpoint: string, body: any, options?: RequestOptions): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body, {
      headers: options?.headers,
      params: options?.params
    }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /**
   * DELETE request
   */
  protected delete<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, {
      headers: options?.headers,
      params: options?.params
    }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /**
   * PATCH request
   */
  protected patch<T>(endpoint: string, body: any, options?: RequestOptions): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, body, {
      headers: options?.headers,
      params: options?.params
    }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.status) {
        switch (error.status) {
          case 400:
            errorMessage = 'Bad request - please check your input';
            break;
          case 401:
            errorMessage = 'Unauthorized - please log in again';
            break;
          case 403:
            errorMessage = 'Forbidden - you do not have permission';
            break;
          case 404:
            errorMessage = 'Not found - the requested resource does not exist';
            break;
          case 429:
            errorMessage = 'Too many requests - please try again later';
            break;
          case 500:
            errorMessage = 'Internal server error - please try again later';
            break;
          case 503:
            errorMessage = 'Service unavailable - please try again later';
            break;
          default:
            errorMessage = `Server error (${error.status}) - please try again later`;
        }
      }
    }
    
    return throwError(() => ({
      message: errorMessage,
      status: error.status,
      error: error.error
    }));
  }

  /**
   * Build query parameters from object
   */
  protected buildParams(params: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => {
            httpParams = httpParams.append(key, item.toString());
          });
        } else {
          httpParams = httpParams.set(key, value.toString());
        }
      }
    });
    
    return httpParams;
  }
}