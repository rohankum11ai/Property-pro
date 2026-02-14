# PropertyPro

A property management web app for Canadian landlords built with ASP.NET Core + React.

---

## Running the App

You need **two terminals open at the same time** — one for the backend, one for the frontend.

### Terminal 1 — Backend API

```
cd PropertyPro\backend\PropertyPro.API
dotnet run
```

API runs at: `http://localhost:5141`

### Terminal 2 — Frontend

```
cd PropertyPro\frontend\property-pro-client
npm run dev
```

UI runs at: `http://localhost:5173`

Open `http://localhost:5173` in your browser.

---

## Notes

- Start the **backend first** before using the UI. If the API isn't running, adding/editing data will show a 404 error.
- If you pull new backend changes, run `dotnet run` again (it recompiles automatically).
- If you pull new frontend changes, run `npm install` before `npm run dev`.
- After any database migration, restart the API so the new compiled code is picked up.
