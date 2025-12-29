import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OptionsResponse, OptionResult, OptionsService } from './options.service';

// Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';

type TypeFilter = 'all' | 'call' | 'put';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,

    // Material
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonToggleModule,
    MatProgressBarModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss', // create this file (below)
})
export class App {
  private svc = inject(OptionsService);

  loading = signal(false);
  error = signal<string>('');
  data = signal<OptionsResponse | null>(null);

  query = signal('');
  typeFilter = signal<TypeFilter>('all');

  displayedColumns = [
    'ticker',
    'type',
    'expiration',
    'strike',
    'bid',
    'ask',
    'mid',
    'spread',
    'volume',
    'openInterest',
    'delta',
    'iv',
    'quality',
    'limit',
    'estTotal',
  ] as const;

  results = computed<OptionResult[]>(() => this.data()?.results ?? []);

  filtered = computed<OptionResult[]>(() => {
    const q = this.query().trim().toLowerCase();
    const tf = this.typeFilter();

    return this.results()
      .filter((r) => (tf === 'all' ? true : r.type === tf))
      .filter((r) => {
        if (!q) return true;
        return (
          r.ticker.toLowerCase().includes(q) ||
          r.option_symbol.toLowerCase().includes(q) ||
          r.underlying_symbol.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (b.quality ?? 0) - (a.quality ?? 0));
  });

  load() {
    this.loading.set(true);
    this.error.set('');

    this.svc.getOptions().subscribe({
      next: (resp) => this.data.set(resp),
      error: (err) => this.error.set(err?.message ?? 'Request failed'),
      complete: () => this.loading.set(false),
    });
  }

  setQuery(value: string) {
    this.query.set(value);
  }

  setTypeFilter(value: TypeFilter) {
    this.typeFilter.set(value);
  }

  chipColor(type: string): 'primary' | 'accent' | 'warn' {
    if (type === 'call') return 'primary';
    if (type === 'put') return 'accent';
    return 'warn';
  }
}
