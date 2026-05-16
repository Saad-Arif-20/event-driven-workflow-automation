# Event-Driven Workflow Automation

This is a modern, full-stack workflow automation platform inspired by tools like Zapier. It enables users to create dynamic workflows, connect to third-party integrations, and execute event-driven automated tasks.

## Architecture

This project uses a monorepo structure containing both the frontend and backend applications:

- **[`/frontend`](./frontend/)**: A modern web interface built with **Next.js 16**, **React**, **Tailwind CSS**, and **shadcn/ui**. It provides a sleek, Crextio-inspired UI to manage workflows and visualize execution data.
- **[`/backend`](./backend/)**: A robust, event-driven Node.js backend built with **Express**, **Prisma**, **PostgreSQL**, **Redis**, and **BullMQ**. It handles high-throughput asynchronous job processing and webhook ingestion.

## Getting Started

Please see the respective README files in the `/frontend` and `/backend` directories for specific setup instructions, environment variables, and run commands.
