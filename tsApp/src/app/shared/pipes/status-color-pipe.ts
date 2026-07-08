import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusColor',
  standalone: false,
})
export class StatusColor implements PipeTransform {
  transform(status: string | null | undefined): string {
    if (!status) {
      return 'black';
    }

    switch (status.toLowerCase()) {
      case 'available':
        return '#16a34a';
      case 'borrowed':
        return '#ea580c';
      case 'requested':
        return '#2563eb';
      case 'returnrequested':
        return '#dc2626';
      case 'returnpending':
        return '#0d9488';
      case 'returned':
        return '#059669';
      case 'lost':
        return '#e11d48';
      case 'rejected':
        return '#4b5563';
      case 'disabled':
        return '#6b7280';
      default:
        return 'black';
    }
  }
}
