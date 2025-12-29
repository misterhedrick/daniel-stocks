import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface OrderTicket {
  class: string;
  symbol: string;
  option_symbol: string;
  side: string;
  quantity: number;
  type: string;
  price: number;
  duration: string;
}

export interface OptionResult {
  ticker: string;
  underlying_symbol: string;
  option_symbol: string;
  type: 'call' | 'put' | string;
  expiration: string;
  strike: number;
  bid: number;
  ask: number;
  mid: number;
  spread_pct: number;
  volume: number;
  open_interest: number;
  delta: number;
  iv: number | null;
  quality: number;
  min_quality_score: number;
  max_cost_per_contract: number;
  limit_price: number;
  estimated_total_cost: number;
  fees_per_contract: number;
  contract_multiplier: number;
  order_ticket: OrderTicket;
}

export interface OptionsResponse {
  scanned: number;
  qualified_tickers: number;
  failed_tickers: number;
  min_quality_score: number;
  max_cost_per_contract: number;
  results: OptionResult[];
  errors: unknown[];
}

@Injectable({ providedIn: 'root' })
export class OptionsService {
  private http = inject(HttpClient);
  private readonly url = 'https://horshwqp68.execute-api.us-east-1.amazonaws.com/options';

  getOptions(): Observable<OptionsResponse> {
    // API returns iv: NaN (invalid JSON). Fetch as text, sanitize, then parse.
    return this.http.get(this.url, { responseType: 'text' }).pipe(
      map((text) => this.parseLoosely(text))
    );
  }

  private parseLoosely(text: string): OptionsResponse {
    const sanitized = text
      .replace(/\bNaN\b/g, 'null')
      .replace(/\bInfinity\b/g, 'null')
      .replace(/\b-Infinity\b/g, 'null');

    return JSON.parse(sanitized) as OptionsResponse;
  }
}
