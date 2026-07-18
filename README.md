# SessionScape

SessionScape helps licensed massage therapists design consistent, personalized massage experiences. It brings together atmosphere, session pacing, client preferences, room preparation, and professional consent reminders without becoming a booking system or clinical record.

## MVP focus

- Browse and adapt professionally defined session themes
- Build private, client-tailored session blueprints
- Prepare the room with a clear checklist
- Capture preference feedback without storing detailed health records
- Keep sensitive-area and aroma decisions behind explicit prompts

## Technology

The initial web application uses Next.js, React, TypeScript, and plain CSS. It is deliberately front-end-first: sample data lives locally while the core domain model is proven. The architecture documentation describes the database and API boundary for the next phase.

## Start locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Documentation

- [Product requirements](docs/product-requirements.md)
- [Experience design](docs/experience-design.md)
- [Technical architecture](docs/technical-architecture.md)
- [Privacy, safety, and boundaries](docs/privacy-safety.md)
- [Business requirements](docs/business/README.md)
- [Data persistence and security](docs/data-persistence-security.md)
- [Product backlog](BACKLOG.md)

## Current scope boundary

SessionScape is not a medical device, therapy record system, booking product, or payment processor. It provides experience-design guidance; therapists remain responsible for working within their training, local rules, professional standards, and client-specific needs.
