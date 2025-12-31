import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';

import { OptionResult, OptionsResponse, OptionsService } from './options.service';

// Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';

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
    MatProgressBarModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private svc = inject(OptionsService);

  loading = signal(false);
  error = signal<string>('');
  data = signal<OptionsResponse | null>(null);

  results = computed<OptionResult[]>(() => this.data()?.results ?? []);

  // No search/filter: just sort by quality desc
  sortedResults = computed<OptionResult[]>(() => {
    return [...this.results()].sort((a, b) => (b.quality ?? 0) - (a.quality ?? 0));
  });

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set('');

    this.svc
      .getOptions()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (resp) => this.data.set(resp),
        error: (err) => this.error.set(err?.message ?? 'Request failed'),
      });
  }

  chipColor(type: string): 'primary' | 'accent' {
    return type === 'put' ? 'accent' : 'primary';
  }
}
