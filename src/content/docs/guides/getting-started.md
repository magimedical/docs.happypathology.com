---
title: Getting Started
description: Learn how to start using the HappyPathology API.
---

Welcome to the HappyPathology API! This guide will help you get up and running quickly.

## Prerequisites

Before you begin, ensure you have:

- An API Key (contact support if you don't have one)
- A basic understanding of REST APIs

## Authentication

All API requests require an API key to be included in the header.

```bash
Authorization: Bearer YOUR_API_KEY
```

## Making your first request

Here is a simple example to verify your connectivity:

```bash
curl https://api.happypathology.com/v1/health \
  -H "Authorization: Bearer YOUR_API_KEY"
```
