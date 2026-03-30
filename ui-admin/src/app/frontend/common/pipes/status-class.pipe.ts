import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusClass',
  standalone: true
})
export class StatusClassPipe implements PipeTransform {
  transform(status?: string): string {
    if (!status) {
      return '';
    }

    const normalized = status.toLowerCase();
    if (['payée', 'payé', 'livré', 'livrée', 'clôturé', 'clôturée', 'facturé', 'facturée'].includes(normalized)) {
      return 'text-green-600 bg-green-600/10';
    }

    if (['en cours', 'en cours de livraison', 'partiellement livré', 'partiellement livrée', 'partiellement payée', 'partiellement payé'].includes(normalized)) {
      return 'text-orange-600 bg-orange-600/10';
    }

    if (['brouillon', 'nouveau', 'new', 'confirmé', 'confirmée', 'émis', 'émise', 'lead'].includes(normalized)) {
      return 'text-cyan-600 bg-cyan-600/10';
    }

    if (['annulé', 'annulée', 'retourné', 'retournée', 'cancelled'].includes(normalized)) {
      return 'text-red-600 bg-red-600/10';
    }

    if (['terminé', 'terminée', 'completed', 'complete'].includes(normalized)) {
      return 'text-purple-600 bg-purple-600/10';
    }

    return 'text-teal-600 bg-teal-600/10';
  }
}

