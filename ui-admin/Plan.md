# Plan

1. Create new Supplier Delivery Note components mirroring Supplier Order structure:
   - AllSupplierDeliveryNotesComponent
   - AddSupplierDeliveryNoteComponent
   - ShowSupplierDeliveryNoteComponent
   - EditSupplierDeliveryNoteComponent

2. Place components under `src/app/frontend/pages/supply/supplierdeliverynote/` with separate folders for each component containing `.ts`, `.html`, `.scss`, and `.spec.ts` files.

3. Implement full listing, form, and detail logic for supplier delivery notes inspired by the existing Supplier Order feature:
   - `AllSupplierDeliveryNotesComponent` uses criteria-based search, sorting, pagination, and table actions.
   - `AddSupplierDeliveryNoteComponent` and `EditSupplierDeliveryNoteComponent` provide reactive forms with product/brand autocompletes, item table management (product, brand, quantity, price) and supplier order selection.
   - `ShowSupplierDeliveryNoteComponent` displays complete delivery note details and its items.

4. Register routes in `app.routes.ts` for listing, adding, showing, and editing supplier delivery notes using appropriate privileges.
5. Update `navigation-loader.service.ts` to add a "Bon de Livraison Fournisseur" link after "Bon de Commande Fournisseur".

6. Run `npm test` to ensure components compile and tests pass.
