import { Component, OnInit, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CurrencyPipe } from '@angular/common';
import { finalize } from 'rxjs';
import { DashboardService } from '../services/dashboard.service';
import { DashboardStats } from '../../../shared/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  imports: [MatCardModule, MatIconModule, MatProgressBarModule, CurrencyPipe],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  readonly stats = signal<DashboardStats | null>(null);
  readonly loading = signal(false);

  ngOnInit(): void {
    this.loading.set(true);
    this.dashboardService
      .getStats()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((stats) => this.stats.set(stats));
  }

  occupancyRate(): number {
    const current = this.stats();
    if (!current || current.totalRooms === 0) {
      return 0;
    }
    return Math.round((current.occupiedRooms / current.totalRooms) * 100);
  }
}
