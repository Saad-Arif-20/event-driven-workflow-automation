# FlowForge — Frontend Application

This is the Next.js frontend for the Event-Driven Workflow Automation platform. It provides a sleek, modern dashboard for users to create, manage, and monitor automated workflows.

## Features

- **Interactive Dashboard**: View real-time execution metrics and workflow statuses.
- **Workflow Builder**: An intuitive interface to define triggers and sequence action steps (e.g., Webhooks, Emails, Delays).
- **Execution Monitoring**: Detailed logs of every workflow execution, showing exactly which steps succeeded or failed.
- **Responsive Design**: Built with Tailwind CSS and Shadcn UI for a polished, accessible experience across devices.
- **Seamless API Integration**: Communicates directly with the Node.js backend using React Query for efficient data fetching and caching.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui & Base UI
- **State/Data**: React Query & Axios
- **Form Handling**: React Hook Form & Zod

## Getting Started

### Prerequisites

Ensure the [Backend service](../backend/README.md) is running locally on port 3000.

### Installation

```bash
# Install dependencies
npm install
```

### Running the Development Server

```bash
# Start the frontend on port 3001
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to view the application.
