# SessionScape

SessionScape is the intelligence and action layer for massage businesses. It connects to an existing booking platform, finds unused capacity and retention opportunities, helps an owner act on them, and measures booking outcomes.

The connected booking platform remains the system of record. SessionScape does not replace its calendar, booking checkout, or payments.

## Redefined MVP focus

- Connect one supported booking platform; Square is the leading candidate pending validation
- Show a trustworthy weekly view of appointments, capacity, rebooking, overdue clients, cancellations, and revenue opportunity
- Detect underbooked periods and overdue returning clients using explainable rules
- Let the owner review, refine, dismiss, or act on recommendations
- Send clients into the existing provider's booking flow
- Track later bookings and completed appointments without confusing estimates with realized revenue

## Technology

The existing Next.js, React, and TypeScript application is an earlier session-design prototype. It remains in the repository as research history while the redefined dashboard and integration workflow are validated. The architecture documentation describes the target connector, data, analytics, recommendation, and action boundaries.

## Start locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Documentation

- [Product requirements](docs/product-requirements.md)
- [Legacy session-design experience](docs/experience-design.md)
- [Technical architecture](docs/technical-architecture.md)
- [Privacy, safety, and boundaries](docs/privacy-safety.md)
- [Business requirements](docs/business/README.md)
- [Data persistence and security](docs/data-persistence-security.md)
- [Product backlog](BACKLOG.md)

## Current scope boundary

SessionScape is not a scheduler, booking marketplace, payment processor, clinical record, or source of massage-treatment guidance. The MVP imports only the minimum supported operational data, excludes health and clinical content, requires owner control over actions, and sends booking activity back to the connected provider.

See the [redefined business requirements](docs/business/business-requirements.md) and [product requirements](docs/product-requirements.md). The prior session-design requirements and backlog are retained as explicitly named legacy documents.
