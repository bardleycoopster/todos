# Todos App

A todos app using Postgres, Express, Apollo, GraphQL, React, Tailwind CSS, and headlessui.

[![Test Client](https://github.com/aherriot/todos/actions/workflows/testClient.yml/badge.svg)](https://github.com/aherriot/todos/actions/workflows/testClient.yml)

This todo app has several interesting features.

1. It allows users to share their list of surveys with other users
2. It uses Apollo-Client cache to reconcile local and server side changes with **websockets** and **GraphQL Subscriptions**.
3. Advanced TypeScript generation from the Database schema and GraphQL schema for end-to-end type safety. Client and server share other TypeScript types too such as the JWT payload format.
4. Styling is done using **Tailwinds CSS** and **headlessui**.
5. Development setup is streamlined with **concurrently** so the many steps can be parallelized with a single command: `npm start`
