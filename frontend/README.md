# Frontend: Distributed Conflict Resolution Demo

This is a small React frontend that sends baseline and patch data to the gateway service, which forwards the request to the aggregator. The UI allows you to edit JSON representing a record and a list of patches, then visualize the merged result and any detected conflicts.

The frontend never communicates with the aggregator directly. All requests go through:

POST http://localhost:3000/merge

## 1. Requirements

- Node.js and npm installed
- Backend services running:
  - Gateway on port 3000
  - Aggregator on port 4000

## 2. Install

From the project root:

```
cd services/frontend
npm install
```

## 3. Run the Frontend

```
npm start
```

Open the printed Vite URL in your browser, typically:

http://localhost:5173/

## 4. How to Use

### Baseline
Enter a JSON object representing the starting state.

### Patches
Enter an array of patch objects such as:

```
[
  { "timestamp": 600, "deviceId": "alice", "patch": { "mood": "Happy" } },
  { "timestamp": 605, "deviceId": "bob",   "patch": { "mood": "Sad" } }
]
```

### Conflict Window
Choose the duration during which two writes to the same field count as a conflict.

### Execute
Click "Send to /merge" to submit the request to the gateway.  
The result panel will show the merged `finalState` and any conflict metadata.

## 5. Folder Structure

```
services/frontend/
  src/
    App.jsx
    components/
      editor/
        index.jsx
        main.css
      result/
        index.jsx
        main.css
    styles/
      global.css
      layout.css
```

## 6. Error Handling

The frontend validates JSON before sending. Backend errors from the gateway or aggregator are displayed in the UI.

## 7. Summary

This frontend provides a minimal and clear way to interact with your distributed merge engine by demonstrating:

- Last Write Wins behavior
- Deep merge logic for nested JSON
- Array append semantics
- Conflict detection
